import { collegeRepository } from '../repositories/collegeRepository';
import { cacheService } from './cacheService';

export class CollegeService {
  async getAllColleges() {
    const cacheKey = 'colleges:all';
    const cached = cacheService.get(cacheKey);
    if (cached) return cached;

    const colleges = await collegeRepository.findAll();
    cacheService.set(cacheKey, colleges, 600); // 10 minutes TTL
    return colleges;
  }

  async getCollegeById(id: string) {
    const cacheKey = `college:id:${id}`;
    const cached = cacheService.get(cacheKey);
    if (cached) return cached;

    const college = await collegeRepository.findById(id);
    if (!college) {
      const error: any = new Error('College not found.');
      error.statusCode = 404;
      error.code = 'COLLEGE_NOT_FOUND';
      throw error;
    }

    cacheService.set(cacheKey, college, 600);
    return college;
  }
}

export const collegeService = new CollegeService();
