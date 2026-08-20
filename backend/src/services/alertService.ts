import { priceAlertRepository } from '../repositories/priceAlertRepository';
import { availabilityAlertRepository } from '../repositories/availabilityAlertRepository';
import { productRepository } from '../repositories/productRepository';
import { notificationService } from './notificationService';
import { NotificationType } from '@prisma/client';

export class AlertService {
  async setPriceAlert(userId: string, productId: string, targetPrice: number) {
    const product = await productRepository.findById(productId);
    if (!product || product.deletedAt) {
      const error: any = new Error('We couldn\'t find this product listing.');
      error.statusCode = 404;
      error.code = 'PRODUCT_NOT_FOUND';
      throw error;
    }

    const currentPrice = Number(product.price);
    if (targetPrice >= currentPrice) {
      const error: any = new Error(`Your target price must be lower than the current price (₹${currentPrice}).`);
      error.statusCode = 400;
      error.code = 'INVALID_TARGET_PRICE';
      throw error;
    }

    const alert = await priceAlertRepository.createOrUpdateAlert(userId, productId, targetPrice);
    return {
      active: true,
      alertId: alert.id,
      productId: alert.productId,
      targetPrice: Number(alert.targetPrice),
      currentPrice,
      createdAt: alert.createdAt,
    };
  }

  async getPriceAlert(userId: string, productId: string) {
    const alert = await priceAlertRepository.findAlert(userId, productId);
    return {
      active: Boolean(alert?.isActive),
      alertId: alert?.id || null,
      productId,
      targetPrice: alert?.isActive ? Number(alert.targetPrice) : null,
      triggeredAt: alert?.triggeredAt || null,
      createdAt: alert?.createdAt || null,
    };
  }

  async deactivatePriceAlert(userId: string, productId: string) {
    await priceAlertRepository.deactivateAlert(userId, productId);
    return {
      active: false,
      productId,
      message: 'Price alert removed successfully.',
    };
  }

  async getUserPriceAlerts(userId: string, page: number = 1, limit: number = 20) {
    const result = await priceAlertRepository.getUserAlerts(userId, { page, limit });

    const formattedAlerts = result.alerts.map((alert) => {
      const currentPrice = Number(alert.product.price);
      const targetPrice = Number(alert.targetPrice);
      const savings = Math.max(0, currentPrice - targetPrice);
      const savingsPercentage = currentPrice > 0 ? Math.round((savings / currentPrice) * 100) : 0;

      return {
        id: alert.id,
        productId: alert.productId,
        targetPrice,
        currentPrice,
        savings,
        savingsPercentage,
        isActive: alert.isActive,
        createdAt: alert.createdAt,
        triggeredAt: alert.triggeredAt,
        product: {
          id: alert.product.id,
          title: alert.product.title,
          price: alert.product.price.toString(),
          status: alert.product.status,
          quantity: alert.product.quantity,
          images: alert.product.images,
          category: alert.product.category,
          college: alert.product.college,
          seller: alert.product.seller,
        },
      };
    });

    return {
      alerts: formattedAlerts,
      pagination: result.pagination,
    };
  }

  async setAvailabilityAlert(userId: string, productId: string) {
    const product = await productRepository.findById(productId);
    if (!product || product.deletedAt) {
      const error: any = new Error('We couldn\'t find this product listing.');
      error.statusCode = 404;
      error.code = 'PRODUCT_NOT_FOUND';
      throw error;
    }

    const alert = await availabilityAlertRepository.createOrUpdateAlert(userId, productId);
    return {
      active: true,
      alertId: alert.id,
      productId: alert.productId,
      createdAt: alert.createdAt,
    };
  }

  async getAvailabilityAlert(userId: string, productId: string) {
    const alert = await availabilityAlertRepository.findAlert(userId, productId);
    return {
      active: Boolean(alert?.isActive),
      alertId: alert?.id || null,
      productId,
      triggeredAt: alert?.triggeredAt || null,
      createdAt: alert?.createdAt || null,
    };
  }

  async deactivateAvailabilityAlert(userId: string, productId: string) {
    await availabilityAlertRepository.deactivateAlert(userId, productId);
    return {
      active: false,
      productId,
      message: 'Availability alert removed successfully.',
    };
  }

  async onProductPriceChanged(productId: string, oldPrice: number, newPrice: number, productTitle: string) {
    if (newPrice >= oldPrice) return;

    const matchingAlerts = await priceAlertRepository.findTriggerableAlerts(productId, newPrice);
    if (matchingAlerts.length === 0) return;

    const alertIdsToDeactivate: string[] = [];

    for (const alert of matchingAlerts) {
      alertIdsToDeactivate.push(alert.id);
      try {
        await notificationService.notifyUser({
          userId: alert.userId,
          type: NotificationType.PRICE_DROP,
          title: '🔔 Price Drop Alert',
          body: `"${productTitle}" is now available for ₹${newPrice}. (Your target price was ₹${Number(alert.targetPrice)})`,
          actionUrl: `/products/${productId}`,
          data: {
            productId,
            oldPrice,
            newPrice,
            targetPrice: Number(alert.targetPrice),
          },
        });
      } catch (err) {
        console.error(`Failed to notify user ${alert.userId} of price drop:`, err);
      }
    }

    await priceAlertRepository.markAlertsTriggered(alertIdsToDeactivate);
  }

  async onProductBecameAvailable(productId: string, productTitle: string) {
    const matchingAlerts = await availabilityAlertRepository.findTriggerableAlerts(productId);
    if (matchingAlerts.length === 0) return;

    const alertIdsToDeactivate: string[] = [];

    for (const alert of matchingAlerts) {
      alertIdsToDeactivate.push(alert.id);
      try {
        await notificationService.notifyUser({
          userId: alert.userId,
          type: NotificationType.BACK_IN_STOCK,
          title: '📦 Back in Stock',
          body: `"${productTitle}" is back in stock and available on campus!`,
          actionUrl: `/products/${productId}`,
          data: {
            productId,
          },
        });
      } catch (err) {
        console.error(`Failed to notify user ${alert.userId} of restock:`, err);
      }
    }

    await availabilityAlertRepository.markAlertsTriggered(alertIdsToDeactivate);
  }
}

export const alertService = new AlertService();
