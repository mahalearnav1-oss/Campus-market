import { Router } from 'express';
import { getColleges, getCollegeById } from '../controllers/collegeController';

const router = Router();

// Public College / Campus APIs
router.get('/', getColleges);
router.get('/:id', getCollegeById);

export default router;
