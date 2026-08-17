import { Router } from 'express';
import healthRoutes from './healthRoutes';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import addressRoutes from './addressRoutes';
import preferencesRoutes from './preferencesRoutes';
import sellerRoutes from './sellerRoutes';
import categoryRoutes from './categoryRoutes';
import productRoutes from './productRoutes';
import cartRoutes from './cartRoutes';
import wishlistRoutes from './wishlistRoutes';
import orderRoutes from './orderRoutes';
import paymentRoutes from './paymentRoutes';
import shipmentRoutes from './shipmentRoutes';
import reviewRoutes from './reviewRoutes';
import messageRoutes from './messageRoutes';
import notificationRoutes from './notificationRoutes';
import adminRoutes from './adminRoutes';
import collegeRoutes from './collegeRoutes';
import uploadRoutes from './uploadRoutes';

const router = Router();

// API Version 1 Namespace
router.use('/', healthRoutes);
router.use('/auth', authRoutes);
router.use('/upload', uploadRoutes);
router.use('/users', userRoutes);
router.use('/users/me/addresses', addressRoutes);
router.use('/users/me/preferences', preferencesRoutes);
router.use('/sellers', sellerRoutes);
router.use('/categories', categoryRoutes);
router.use('/colleges', collegeRoutes);
router.use('/campuses', collegeRoutes);
router.use('/products', productRoutes);
router.use('/cart', cartRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/payments', paymentRoutes);
router.use('/', reviewRoutes);
router.use('/', messageRoutes);
router.use('/', notificationRoutes);
router.use('/', adminRoutes); // Mounts /admin/*, /reports, /disputes
router.use('/', shipmentRoutes);
router.use('/', orderRoutes);

export default router;
