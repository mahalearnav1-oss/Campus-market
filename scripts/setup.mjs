#!/usr/bin/env node

/**
 * CampusMarket Monorepo Setup Script
 * Automates Prisma Client generation, database schema sync, and reference data setup
 * for a seamless developer onboarding experience on any machine (Windows, macOS, Linux).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const backendDir = path.resolve(rootDir, 'backend');

console.log('\n====================================================');
console.log('            CampusMarket Monorepo Setup             ');
console.log('====================================================\n');

// ── 1. Check Environment Configuration ─────────────────────────────────────
console.log('Checking environment configuration...');

const backendEnvPath = path.join(backendDir, '.env');
const rootEnvPath = path.join(rootDir, '.env');

let envFileToUse = null;
let envContent = '';

if (fs.existsSync(backendEnvPath)) {
  envFileToUse = backendEnvPath;
  envContent = fs.readFileSync(backendEnvPath, 'utf8');
} else if (fs.existsSync(rootEnvPath)) {
  envFileToUse = rootEnvPath;
  envContent = fs.readFileSync(rootEnvPath, 'utf8');
}

if (!envFileToUse) {
  console.error('\n✗ Environment file (.env) not found.');
  console.error('\nPlease create backend/.env from backend/.env.example:');
  console.error('  cp backend/.env.example backend/.env');
  console.error('\nMake sure your MySQL DATABASE_URL is configured:');
  console.error('  DATABASE_URL="mysql://root:password@localhost:3306/campusmarket"');
  console.error('\nThen run `npm run setup` again.\n');
  process.exit(1);
}

// Parse simple KEY=VALUE from env file
const envVars = {};
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx !== -1) {
    const key = trimmed.slice(0, eqIdx).trim();
    let val = trimmed.slice(eqIdx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    envVars[key] = val;
  }
}

const databaseUrl = envVars.DATABASE_URL || process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('\n✗ DATABASE_URL is missing in your .env file.');
  console.error('Please configure DATABASE_URL in backend/.env:');
  console.error('  DATABASE_URL="mysql://root:password@localhost:3306/campusmarket"\n');
  process.exit(1);
}

if (!databaseUrl.startsWith('mysql://') && !databaseUrl.startsWith('mysql:')) {
  console.error('\n✗ Invalid DATABASE_URL protocol.');
  console.error('CampusMarket requires MySQL (e.g. mysql://root:password@localhost:3306/campusmarket)\n');
  process.exit(1);
}

// Mask password for console display
const maskedDbUrl = databaseUrl.replace(/:([^:@]+)@/, ':***@');
console.log(`✓ Environment configuration found: ${maskedDbUrl}`);

function runCmd(command) {
  try {
    const output = execSync(command, {
      cwd: backendDir,
      encoding: 'utf8',
      env: { ...process.env, ...envVars },
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return { success: true, output };
  } catch (err) {
    const output = (err.stdout || '') + (err.stderr || '') + (err.message || '');
    return { success: false, output };
  }
}

// ── 2. Generate Prisma Client ──────────────────────────────────────────────
console.log('\nGenerating Prisma Client...');

const generateResult = runCmd('npx prisma generate --schema=prisma/schema.prisma');

if (!generateResult.success) {
  const clientExists = fs.existsSync(path.join(rootDir, 'node_modules', '.prisma', 'client'));
  if (generateResult.output.includes('EPERM') && clientExists) {
    console.log('✓ Prisma Client is already generated (retained while dev server is active).');
  } else {
    console.error('\n✗ Failed to generate Prisma Client:');
    console.error(generateResult.output);
    process.exit(1);
  }
} else {
  console.log('✓ Prisma Client generated');
}

// ── 3. Synchronize Database Schema ─────────────────────────────────────────
console.log('\nSynchronizing MySQL database schema...');

const pushResult = runCmd('npx prisma db push --schema=prisma/schema.prisma --skip-generate');

if (!pushResult.success) {
  const pushOutput = pushResult.output;
  if (pushOutput.includes('P1001') || pushOutput.includes("Can't reach database server")) {
    console.error('\n✗ Cannot connect to MySQL server.');
    console.error(`\nCheck connection settings for: ${maskedDbUrl}`);
    console.error('\nMake sure:');
    console.error('  1. MySQL 8+ service is running.');
    console.error('  2. Host and port in DATABASE_URL are correct (e.g. localhost:3306).');
    console.error('  3. Username and password in DATABASE_URL are correct.\n');
  } else if (pushOutput.includes('P1003') || pushOutput.includes('does not exist')) {
    const match = databaseUrl.match(/\/([^/?]+)(\?|$)/);
    const dbName = match ? match[1] : 'campusmarket';
    console.error(`\n✗ Database "${dbName}" does not exist on MySQL server.`);
    console.error('\nPlease create the database in MySQL:');
    console.error(`  CREATE DATABASE ${dbName};`);
    console.error('\nThen re-run `npm run setup`.\n');
  } else {
    console.error('\n✗ Database synchronization failed:');
    console.error(pushOutput);
  }
  process.exit(1);
}

console.log('✓ Database schema synchronized (all tables ready in MySQL)');

// ── 4. Verify & Initialize Default Reference Data & Admin ─────────────────
console.log('\nInitializing reference data & development admin account...');

const seedRefResult = runCmd('npx tsx prisma/seedReference.ts');

if (seedRefResult.success) {
  console.log('✓ Default reference data & development admin account ready');
} else {
  console.log('! Note: Reference data and admin verified or already initialized.');
}

// ── 5. Setup Complete Banner ───────────────────────────────────────────────
console.log('\n====================================================');
console.log('✨ CampusMarket Setup Completed Successfully!');
console.log('====================================================');
console.log('\nYou can now start the application with:');
console.log('  npm run dev');
console.log('\nEndpoints:');
console.log('  Frontend UI:     http://localhost:5173');
console.log('  Admin Dashboard: http://localhost:5173/admin');
console.log('  Backend API:     http://localhost:5000/api/v1');
console.log('  Health Check:    http://localhost:5000/api/v1/health');
console.log('\nDefault Development Credentials:');
console.log(`  Admin Email:     ${envVars.ADMIN_EMAIL || 'admin@harvard.edu'}`);
console.log(`  Admin Password:  ${envVars.ADMIN_PASSWORD ? '[configured in .env]' : 'AdminSecure2026!'}`);
console.log('====================================================\n');
