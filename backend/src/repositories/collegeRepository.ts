import { prisma } from '../config/prisma';

export class CollegeRepository {
  async findAll() {
    return prisma.college.findMany({
      select: {
        id: true,
        name: true,
        code: true,
        city: true,
        state: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string) {
    return prisma.college.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        code: true,
        city: true,
        state: true,
      },
    });
  }

  async findByCode(code: string) {
    return prisma.college.findUnique({
      where: { code },
      select: {
        id: true,
        name: true,
        code: true,
        city: true,
        state: true,
      },
    });
  }
}

export const collegeRepository = new CollegeRepository();
