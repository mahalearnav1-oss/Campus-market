export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface EmailProvider {
  sendEmail(payload: EmailPayload): Promise<{ success: boolean; messageId?: string }>;
}

export class ConsoleLogEmailProvider implements EmailProvider {
  async sendEmail(payload: EmailPayload): Promise<{ success: boolean; messageId: string }> {
    const messageId = `msg_dev_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    console.log('\n📧 [EMAIL SERVICE - DEV PROVIDER]');
    console.log(`  To:      ${payload.to}`);
    console.log(`  Subject: ${payload.subject}`);
    console.log(`  Body:\n${payload.html.replace(/<[^>]*>/g, ' ').substring(0, 150)}...\n`);
    return { success: true, messageId };
  }
}

export class EmailService {
  private provider: EmailProvider;

  constructor(provider?: EmailProvider) {
    this.provider = provider || new ConsoleLogEmailProvider();
  }

  async sendEmail(payload: EmailPayload) {
    try {
      return await this.provider.sendEmail(payload);
    } catch (err) {
      console.error('❌ Failed to dispatch email:', err);
      return { success: false };
    }
  }

  // Template Generators
  generateWelcomeEmail(recipientName: string) {
    return {
      subject: '🎓 Welcome to CampusMarket!',
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>Welcome to CampusMarket, ${recipientName}!</h2>
          <p>Your verified campus account has been created. Start browsing second-hand textbooks, instruments, and course gear today.</p>
        </div>
      `,
    };
  }

  generateOrderConfirmationEmail(recipientName: string, orderNumber: string, totalAmount: string) {
    return {
      subject: `📦 Order Confirmed: #${orderNumber}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>Order Confirmed!</h2>
          <p>Hi ${recipientName}, your order <strong>#${orderNumber}</strong> for <strong>$${totalAmount}</strong> has been created and notified to the seller.</p>
        </div>
      `,
    };
  }

  generatePaymentSuccessEmail(recipientName: string, orderNumber: string, paymentId: string, amount: string) {
    return {
      subject: `💳 Payment Receipt for Order #${orderNumber}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>Payment Successful</h2>
          <p>Hi ${recipientName}, your payment of <strong>$${amount}</strong> (Ref: ${paymentId}) for order #${orderNumber} was processed successfully.</p>
        </div>
      `,
    };
  }

  generateShipmentUpdateEmail(recipientName: string, orderNumber: string, trackingNumber: string, status: string) {
    return {
      subject: `🚚 Shipment Update for Order #${orderNumber} (${status})`,
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>Shipment Status Update</h2>
          <p>Hi ${recipientName}, your package for order #${orderNumber} is now: <strong>${status}</strong>.</p>
          <p>Tracking Number: <code>${trackingNumber}</code></p>
        </div>
      `,
    };
  }

  generateNewMessageEmail(recipientName: string, senderName: string, messageSnippet: string) {
    return {
      subject: `💬 New Message from ${senderName}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>New Message Received</h2>
          <p>Hi ${recipientName}, ${senderName} sent you a message:</p>
          <blockquote style="background: #f1f5f9; padding: 10px; border-left: 4px solid #2563eb;">"${messageSnippet}"</blockquote>
        </div>
      `,
    };
  }

  generateSellerVerifiedEmail(sellerStoreName: string) {
    return {
      subject: '✅ Your Seller Application Has Been Verified!',
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>Congratulations, ${sellerStoreName}!</h2>
          <p>Your campus seller profile is now verified. You can list products and start selling immediately.</p>
        </div>
      `,
    };
  }
}

export const emailService = new EmailService();
