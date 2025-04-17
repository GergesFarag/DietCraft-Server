import express from 'express';
export const router = express.Router();
import { authMiddle } from '../middlewares/auth.middle';
import { chatbotController } from '../controllers/chatbot.controller';
router.post('/chat', authMiddle.verifyAccessToken , chatbotController.sendMessage);