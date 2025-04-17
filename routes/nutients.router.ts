import { Router } from 'express';
import { authMiddle } from '../middlewares/auth.middle';
import { nutrientsController } from '../controllers/nutrients.controller';
export const router = Router();
router.get("/" , authMiddle.verifyAccessToken , nutrientsController.getNutrients)