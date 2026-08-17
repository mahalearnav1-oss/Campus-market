import { messageRepository } from '../repositories/messageRepository';
import { prisma } from '../config/prisma';
import { CreateConversationInput, SendMessageInput, ReportMessageInput } from '../validators/messageValidators';
import { logAuditEvent } from '../utils/auditLogger';
import { notificationService } from './notificationService';
import { NotificationType } from '@prisma/client';
import { emitToUser } from '../realtime/socketServer';

export class MessageService {
  async createConversation(userId: string, input: CreateConversationInput, ipAddress?: string) {
    const seller = await prisma.seller.findUnique({
      where: { id: input.sellerId },
    });

    if (!seller) {
      const error: any = new Error('Seller not found.');
      error.statusCode = 404;
      error.code = 'SELLER_NOT_FOUND';
      throw error;
    }

    if (seller.userId === userId) {
      const error: any = new Error('You cannot start a conversation with yourself.');
      error.statusCode = 400;
      error.code = 'SELF_MESSAGING_NOT_ALLOWED';
      throw error;
    }

    const conversation = await messageRepository.findOrCreateConversation({
      buyerId: userId,
      sellerId: input.sellerId,
      productId: input.productId,
    });

    if (input.initialMessage) {
      await messageRepository.sendMessage({
        conversationId: conversation.id,
        senderUserId: userId,
        messageText: input.initialMessage,
      });
    }

    await logAuditEvent('CONVERSATION_CREATED', 'Conversation', userId, conversation.id, { sellerId: input.sellerId }, ipAddress);
    return this.getConversationDetails(userId, conversation.id);
  }

  async sendMessage(userId: string, conversationId: string, input: SendMessageInput, ipAddress?: string) {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      const error: any = new Error('Conversation not found.');
      error.statusCode = 404;
      error.code = 'CONVERSATION_NOT_FOUND';
      throw error;
    }

    // Participant Authorization Check: User must be buyer OR seller owner
    const userSeller = await prisma.seller.findUnique({ where: { userId } });
    const isBuyer = conversation.buyerId === userId;
    const isSeller = userSeller ? conversation.sellerId === userSeller.id : false;

    if (!isBuyer && !isSeller) {
      const error: any = new Error('You are not authorized to participate in this conversation.');
      error.statusCode = 403;
      error.code = 'FORBIDDEN';
      throw error;
    }

    const message = await messageRepository.sendMessage({
      conversationId,
      senderUserId: userId,
      messageText: input.messageText,
    });

    // Determine recipient user ID
    const seller = await prisma.seller.findUnique({ where: { id: conversation.sellerId } });
    const recipientUserId = isBuyer ? seller?.userId : conversation.buyerId;

    if (recipientUserId) {
      // Emit real-time message event via Socket.IO
      emitToUser(recipientUserId, 'message:new', { conversationId, message });

      // Trigger Notification
      await notificationService.notifyUser({
        userId: recipientUserId,
        type: NotificationType.MESSAGE_RECEIVED,
        title: `💬 New message from ${message.sender.firstName}`,
        body: input.messageText.length > 80 ? `${input.messageText.substring(0, 80)}...` : input.messageText,
        data: { conversationId, productId: conversation.productId },
        actionUrl: `/messages/${conversationId}`,
      });
    }

    await logAuditEvent('MESSAGE_SENT', 'Message', userId, message.id, { conversationId }, ipAddress);
    return message;
  }

  async getConversationDetails(userId: string, conversationId: string) {
    const conversation = await messageRepository.findConversationById(conversationId);

    if (!conversation) {
      const error: any = new Error('Conversation not found.');
      error.statusCode = 404;
      error.code = 'CONVERSATION_NOT_FOUND';
      throw error;
    }

    const userSeller = await prisma.seller.findUnique({ where: { userId } });
    const isBuyer = conversation.buyerId === userId;
    const isSeller = userSeller ? conversation.sellerId === userSeller.id : false;

    if (!isBuyer && !isSeller) {
      const error: any = new Error('You are not authorized to view this conversation.');
      error.statusCode = 403;
      error.code = 'FORBIDDEN';
      throw error;
    }

    // Mark unread messages as read automatically
    await messageRepository.markMessagesAsRead(conversationId, userId);

    const [buyer, seller, product] = await Promise.all([
      prisma.user.findUnique({
        where: { id: conversation.buyerId },
        select: { id: true, firstName: true, lastName: true, avatarUrl: true },
      }),
      prisma.seller.findUnique({
        where: { id: conversation.sellerId },
        select: { id: true, storeName: true, sellerType: true, rating: true, userId: true },
      }),
      conversation.productId
        ? prisma.product.findUnique({
            where: { id: conversation.productId },
            select: { id: true, title: true, price: true, images: { take: 1 } },
          })
        : null,
    ]);

    return {
      id: conversation.id,
      buyer,
      seller,
      product,
      messages: conversation.messages,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
    };
  }

  async getUserConversations(userId: string, page: number = 1, limit: number = 20) {
    return messageRepository.getUserConversations(userId, { page, limit });
  }

  async markAsRead(userId: string, conversationId: string) {
    await messageRepository.markMessagesAsRead(conversationId, userId);
    return { success: true };
  }

  async reportMessage(userId: string, messageId: string, input: ReportMessageInput, ipAddress?: string) {
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: { conversation: true },
    });

    if (!message) {
      const error: any = new Error('Message not found.');
      error.statusCode = 404;
      error.code = 'MESSAGE_NOT_FOUND';
      throw error;
    }

    const userSeller = await prisma.seller.findUnique({ where: { userId } });
    const isBuyer = message.conversation.buyerId === userId;
    const isSeller = userSeller ? message.conversation.sellerId === userSeller.id : false;

    if (!isBuyer && !isSeller) {
      const error: any = new Error('You are not authorized to report messages in this conversation.');
      error.statusCode = 403;
      error.code = 'FORBIDDEN';
      throw error;
    }

    const report = await messageRepository.createMessageReport({
      messageId,
      reporterUserId: userId,
      reason: input.reason,
    });

    await logAuditEvent('MESSAGE_REPORTED', 'MessageReport', userId, report.id, { messageId }, ipAddress);
    return { success: true, message: 'Message report submitted successfully.' };
  }
}

export const messageService = new MessageService();
