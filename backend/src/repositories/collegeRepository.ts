import { prisma } from '../config/prisma';

export class CollegeRepository {
  async findAll() {
    return prisma.college.findMany({
      select: {
        id: true,
        name: true,
        code: true,
        domain: true,
        city: true,
        state: true,
        latitude: true,
        longitude: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async findAllWithStats() {
    return prisma.college.findMany({
      select: {
        id: true,
        name: true,
        code: true,
        domain: true,
        city: true,
        state: true,
        latitude: true,
        longitude: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            users: true,
            products: true,
            safeZones: true,
          },
        },
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
        domain: true,
        city: true,
        state: true,
        latitude: true,
        longitude: true,
        createdAt: true,
        updatedAt: true,
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
        domain: true,
        city: true,
        state: true,
        latitude: true,
        longitude: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findByDomain(domain: string) {
    return prisma.college.findUnique({
      where: { domain },
      select: {
        id: true,
        name: true,
        code: true,
        domain: true,
      },
    });
  }

  async create(data: {
    name: string;
    code: string;
    domain: string;
    city: string;
    state: string;
    latitude?: number | null;
    longitude?: number | null;
  }) {
    return prisma.college.create({
      data: {
        name: data.name,
        code: data.code,
        domain: data.domain,
        city: data.city,
        state: data.state,
        latitude: data.latitude,
        longitude: data.longitude,
      },
    });
  }

  async update(
    id: string,
    data: Partial<{
      name: string;
      code: string;
      domain: string;
      city: string;
      state: string;
      latitude?: number | null;
      longitude?: number | null;
    }>
  ) {
    return prisma.college.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return prisma.college.delete({
      where: { id },
    });
  }

  async countUsage(id: string) {
    const [userCount, productCount, safeZoneCount] = await Promise.all([
      prisma.user.count({ where: { collegeId: id } }),
      prisma.product.count({ where: { collegeId: id } }),
      prisma.safeZone.count({ where: { collegeId: id } }),
    ]);

    return {
      userCount,
      productCount,
      safeZoneCount,
      totalUsage: userCount + productCount,
    };
  }
}

export const collegeRepository = new CollegeRepository();
