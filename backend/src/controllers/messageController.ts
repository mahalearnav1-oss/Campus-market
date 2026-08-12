import { Request, Response, NextFunction } from 'express';
import { messageService } from '../services/messageService';
import { createConversationSchema, sendMessageSchema, reportMessageSchema } from '../validators/messageValidators';

export async function createConversation(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const validatedInput = createConversationSchema.parse(req.body);

    const conversation = await messageService.createConversation(userId, validatedInput, req.ip);
    res.status(201).json({
      success: true,
      data: { conversation },
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    next(error);
  }
}

export async function sendMessage(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const conversationId = req.params.id;
    const validatedInput = sendMessageSchema.parse(req.body);

    const message = await messageService.sendMessage(userId, conversationId, validatedInput, req.ip);
    res.status(201).json({
      success: true,
      data: { message },
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    next(error);
  }
}

export async function getConversationDetails(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const conversationId = req.params.id;

    const conversation = await messageService.getConversationDetails(userId, conversationId);
    res.status(200).json({
      success: true,
      data: { conversation },
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    next(error);
  }
}

export async function getUserConversations(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const page = parseInt(req.query.page as string || '1', 10);
    const limit = parseInt(req.query.limit as string || '20', 10);

    const result = await messageService.getUserConversations(userId, page, limit);
    res.status(200).json({
      success: true,
      data: result,
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    next(error);
  }
}

export async function markAsRead(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const conversationId = req.params.id;

    const result = await messageService.markAsRead(userId, conversationId);
    res.status(200).json({
      success: true,
      data: result,
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    next(error);
  }
}

export async function reportMessage(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const messageId = req.params.id;
    const validatedInput = reportMessageSchema.parse(req.body);

    const result = await messageService.reportMessage(userId, messageId, validatedInput, req.ip);
    res.status(200).json({
      success: true,
      data: result,
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    next(error);
  }
}
