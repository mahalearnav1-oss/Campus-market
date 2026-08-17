import { Request, Response, NextFunction } from 'express';
import { collegeService } from '../services/collegeService';

export async function getColleges(req: Request, res: Response, next: NextFunction) {
  try {
    const colleges = await collegeService.getAllColleges();
    res.status(200).json({
      success: true,
      data: { colleges },
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    next(error);
  }
}

export async function getCollegeById(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id;
    const college = await collegeService.getCollegeById(id);
    res.status(200).json({
      success: true,
      data: { college },
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    next(error);
  }
}
