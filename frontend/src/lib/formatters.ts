// Human-Readable Label Formatters for Frontend UI Presentation

/**
 * Standardized Indian Rupee (INR) Currency Formatter
 * Formats numbers into Indian numbering system (e.g. ₹500, ₹1,500, ₹1,50,000, ₹500.50)
 */
export function formatINR(amount?: number | string | null): string {
  if (amount === undefined || amount === null || amount === '') return '₹0';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '₹0';

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
    minimumFractionDigits: num % 1 !== 0 ? 2 : 0,
  }).format(num);
}

export const formatCurrency = formatINR;
export const formatPrice = formatINR;

export function formatUserRole(role?: string | null): string {
  switch (role) {
    case 'STUDENT_BUYER':
      return 'Student Buyer';
    case 'STUDENT_SELLER':
      return 'Student Seller';
    case 'COMMERCIAL_BOOKSTORE':
      return 'Commercial Seller';
    case 'ADMIN':
      return 'Administrator';
    case 'SUPER_ADMIN':
      return 'Super Admin';
    case 'MODERATOR':
      return 'Campus Moderator';
    default:
      return role || 'Student Member';
  }
}

export function formatUserStatus(status?: string | null): string {
  switch (status) {
    case 'ACTIVE':
      return 'Active';
    case 'PENDING_VERIFICATION':
      return 'Pending Verification';
    case 'SUSPENDED':
      return 'Suspended';
    case 'BANNED':
      return 'Banned';
    case 'DELETED':
      return 'Archived';
    default:
      return status || 'Active';
  }
}

export function formatConditionGrade(grade?: string | null): string {
  switch (grade) {
    case 'BRAND_NEW':
      return 'Brand New';
    case 'LIKE_NEW':
      return 'Like New';
    case 'GOOD':
      return 'Good';
    case 'FAIR':
      return 'Fair';
    case 'ACCEPTABLE':
      return 'Acceptable';
    default:
      return grade || 'Used';
  }
}

export function formatOrderStatus(status?: string | null): string {
  switch (status) {
    case 'PAYMENT_PENDING':
      return 'Payment Pending';
    case 'PAID_ESCROW':
      return 'Escrow Secured';
    case 'SELLER_ACCEPTED':
      return 'Meetup Scheduled';
    case 'DELIVERED_PENDING_INSPECTION':
      return 'Delivered / Pending Inspection';
    case 'COMPLETED':
      return 'Completed';
    case 'CANCELLED':
      return 'Cancelled';
    case 'REFUNDED':
      return 'Refunded';
    case 'DISPUTED':
      return 'In Dispute';
    default:
      return status || 'Pending';
  }
}
