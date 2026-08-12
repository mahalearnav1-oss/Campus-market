# CampusMarket — Disaster Recovery & Backup Strategy Guide

This guide details procedures for backing up, restoring, and verifying the **MySQL 8.0+** database and application storage assets for CampusMarket.

---

## 🗄️ 1. Automated MySQL Database Backups

### Daily Logical Dump Script (`mysqldump`)
Run daily cron job creating gzipped SQL dumps with timestamp rotation:

```bash
#!/bin/bash
# CampusMarket MySQL Automated Backup Script
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/var/backups/campusmarket"
MYSQL_USER="root"
MYSQL_PASS="arnav"
MYSQL_DB="campusmarket"

mkdir -p $BACKUP_DIR

# Execute Dump
mysqldump -u $MYSQL_USER -p$MYSQL_PASS --single-transaction --quick --routines --triggers $MYSQL_DB | gzip > $BACKUP_DIR/db_backup_$TIMESTAMP.sql.gz

# Delete backups older than 30 days
find $BACKUP_DIR -type f -name "*.sql.gz" -mtime +30 -delete

echo "✅ Backup completed: db_backup_$TIMESTAMP.sql.gz"
```

---

## 🔄 2. Restoration Procedure

To restore the database from a gzipped SQL dump:

```bash
# 1. Decompress SQL file
gunzip -k /var/backups/campusmarket/db_backup_20260810_120000.sql.gz

# 2. Restore into MySQL Database
mysql -u root -parnav campusmarket < /var/backups/campusmarket/db_backup_20260810_120000.sql

# 3. Apply any unapplied Prisma migrations
npx prisma db push --schema=backend/prisma/schema.prisma
```

---

## 🛡️ 3. Verification & Backup Health Checks

Execute monthly restore drills into a staging database environment:
```bash
# Verify integrity of backup archive
gzip -t /var/backups/campusmarket/db_backup_20260810_120000.sql.gz
```
