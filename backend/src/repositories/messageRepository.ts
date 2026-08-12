import { prisma } from '../config/prisma';
import { Prisma } from '@prisma/client';

export class MessageRepository {
  async findOrCreateConversation(data: { buyerId: string; sellerId: string; productId?: string }) {
    const { buyerId, sellerId, productId } = data;

    const existing = await prisma.conversation.findFirst({
      where: {
        buyerId,
        sellerId,
        productId: productId || null,
      },
      include: {
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });

    if (existing) return existing;

    return prisma.conversation.create({
      data: {
        buyerId,
        sellerId,
        productId: productId || null,
      },
      include: {
        messages: true,
      },
    });
  }

  async findConversationById(id: string) {
    return prisma.conversation.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            sender: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
          },
        },
      },
    });
  }

  async getUserConversations(userId: string, options: { page: number; limit: number }) {
    const { page, limit } = options;
    const skip = (page - 1) * limit;

    // Retrieve seller profile if user is a seller
    const userSeller = await prisma.seller.findUnique({ where: { userId } });
    const sellerId = userSeller?.id;

    const where: Prisma.ConversationWhereInput = {
      OR: [
        { buyerId: userId },
        ...(sellerId ? [{ sellerId }] : []),
      ],
    };

    const [total, conversations] = await Promise.all([
      prisma.conversation.count({ where }),
      prisma.conversation.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            include: {
              sender: { select: { id: true, firstName: true, lastName: true } },
            },
          },
        },
      }),
    ]);

    // Enhance with seller and product info
    const enhancedConversations = await Promise.all(
      conversations.map(async (conv) => {
        const [buyer, seller, product, unreadCount] = await Promise.all([
          prisma.user.findUnique({
            where: { id: conv.buyerId },
            select: { id: true, firstName: true, lastName: true, avatarUrl: true },
          }),
          prisma.seller.findUnique({
            where: { id: conv.sellerId },
            select: { id: true, storeName: true, sellerType: true, rating: true, userId: true },
          }),
          conv.productId
            ? prisma.product.findUnique({
                where: { id: conv.productId },
                select: { id: true, title: true, price: true, images: { take: 1 } },
              })
            : null,
          prisma.message.count({
            where: {
              conversationId: conv.id,
              readAt: null,
              senderUserId: { not: userId },
            },
          }),
        ]);

        return {
          id: conv.id,
          productId: conv.productId,
          buyer,
          seller,
          product,
          lastMessage: conv.messages[0] || null,
          unreadCount,
          createdAt: conv.createdAt,
          updatedAt: conv.updatedAt,
        };
      })
    );

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      conversations: enhancedConversations,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async sendMessage(data: { conversationId: string; senderUserId: string; messageText: string }) {
    const { conversationId, senderUserId, messageText } = data;

    const [message] = await prisma.$transaction([
      prisma.message.create({
        data: {
          conversationId,
          senderUserId,
          messageText,
        },
        include: {
          sender: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        },
      }),
      prisma.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      }),
    ]);

    return message;
  }

  async markMessagesAsRead(conversationId: string, userId: string) {
    return prisma.message.updateMany({
      where: {
        conversationId,
        readAt: null,
        senderUserId: { not: userId },
      },
      data: {
        readAt: new Date(),
      },
    });
  }

  async createMessageReport(data: { messageId: string; reporterUserId: string; reason: string }) {
    return prisma.messageReport.create({
      data: {
        messageId: data.messageId,
        reporterUserId: data.reporterUserId,
        reason: data.reason,
      },
    });
  }
}

export const messageRepository = new MessageRepository();
