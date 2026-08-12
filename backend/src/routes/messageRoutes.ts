import { Router } from 'express';
import {
  createConversation,
  sendMessage,
  getConversationDetails,
  getUserConversations,
  markAsRead,
  reportMessage,
} from '../controllers/messageController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.get('/conversations', requireAuth, getUserConversations);
router.post('/conversations', requireAuth, createConversation);
router.get('/conversations/:id', requireAuth, getConversationDetails);
router.post('/conversations/:id/messages', requireAuth, sendMessage);
router.post('/conversations/:id/read', requireAuth, markAsRead);
router.post('/messages/:id/report', requireAuth, reportMessage);

export default router;
