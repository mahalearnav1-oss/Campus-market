import { createBrowserRouter } from 'react-router-dom';
import { PublicLayout } from '../layouts/PublicLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { AccountLayout } from '../pages/account/AccountLayout';
import { AccountPage } from '../pages/AccountPage';
import { ProfileTab } from '../pages/account/ProfileTab';
import { PreferencesTab } from '../pages/account/PreferencesTab';
import { AddressesTab } from '../pages/account/AddressesTab';
import { BecomeSellerPage } from '../pages/BecomeSellerPage';
import { SellerDashboardPage } from '../pages/SellerDashboardPage';
import { PublicSellerPage } from '../pages/PublicSellerPage';
import { MarketplacePage } from '../pages/MarketplacePage';
import { ProductDetailPage } from '../pages/ProductDetailPage';
import { SellerProductsPage } from '../pages/seller/SellerProductsPage';
import { CreateProductPage } from '../pages/seller/CreateProductPage';
import { EditProductPage } from '../pages/seller/EditProductPage';
import { CartPage } from '../pages/CartPage';
import { WishlistPage } from '../pages/WishlistPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { BuyerOrdersPage } from '../pages/BuyerOrdersPage';
import { OrderDetailPage } from '../pages/OrderDetailPage';
import { SellerOrdersPage } from '../pages/seller/SellerOrdersPage';
import { PaymentSuccessPage } from '../pages/PaymentSuccessPage';
import { PaymentFailedPage } from '../pages/PaymentFailedPage';
import { OrderTrackingPage } from '../pages/OrderTrackingPage';
import { PublicTrackingPage } from '../pages/PublicTrackingPage';
import { ConversationsPage } from '../pages/ConversationsPage';
import { ChatThreadPage } from '../pages/ChatThreadPage';
import { NotificationsPage } from '../pages/NotificationsPage';
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { AdminUsersPage } from '../pages/admin/AdminUsersPage';
import { AdminSellersPage } from '../pages/admin/AdminSellersPage';
import { AdminProductsPage } from '../pages/admin/AdminProductsPage';
import { AdminCategoriesPage } from '../pages/admin/AdminCategoriesPage';
import { AdminCampusesPage } from '../pages/admin/AdminCampusesPage';
import { AdminOrdersPage } from '../pages/admin/AdminOrdersPage';
import { AdminReportsPage } from '../pages/admin/AdminReportsPage';
import { AdminDisputesPage } from '../pages/admin/AdminDisputesPage';
import { AdminAuditLogsPage } from '../pages/admin/AdminAuditLogsPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { RequireAuth, UnauthOnly } from './guards';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout />,
    errorElement: <NotFoundPage />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'products',
        element: <MarketplacePage />,
      },
      {
        path: 'products/:id',
        element: <ProductDetailPage />,
      },
      {
        path: 'track/:shipmentNumber',
        element: <PublicTrackingPage />,
      },
      {
        path: 'messages',
        element: (
          <RequireAuth>
            <ConversationsPage />
          </RequireAuth>
        ),
      },
      {
        path: 'messages/:conversationId',
        element: (
          <RequireAuth>
            <ChatThreadPage />
          </RequireAuth>
        ),
      },
      {
        path: 'notifications',
        element: (
          <RequireAuth>
            <NotificationsPage />
          </RequireAuth>
        ),
      },
      {
        path: 'cart',
        element: (
          <RequireAuth>
            <CartPage />
          </RequireAuth>
        ),
      },
      {
        path: 'wishlist',
        element: (
          <RequireAuth>
            <WishlistPage />
          </RequireAuth>
        ),
      },
      {
        path: 'checkout',
        element: (
          <RequireAuth>
            <CheckoutPage />
          </RequireAuth>
        ),
      },
      {
        path: 'orders',
        element: (
          <RequireAuth>
            <BuyerOrdersPage />
          </RequireAuth>
        ),
      },
      {
        path: 'orders/:orderNumber',
        element: (
          <RequireAuth>
            <OrderDetailPage />
          </RequireAuth>
        ),
      },
      {
        path: 'orders/:orderNumber/tracking',
        element: (
          <RequireAuth>
            <OrderTrackingPage />
          </RequireAuth>
        ),
      },
      {
        path: 'payment/success',
        element: (
          <RequireAuth>
            <PaymentSuccessPage />
          </RequireAuth>
        ),
      },
      {
        path: 'payment/failed',
        element: (
          <RequireAuth>
            <PaymentFailedPage />
          </RequireAuth>
        ),
      },
      {
        path: 'login',
        element: (
          <UnauthOnly>
            <LoginPage />
          </UnauthOnly>
        ),
      },
      {
        path: 'register',
        element: (
          <UnauthOnly>
            <RegisterPage />
          </UnauthOnly>
        ),
      },
      {
        path: 'account',
        element: (
          <RequireAuth>
            <AccountLayout />
          </RequireAuth>
        ),
        children: [
          {
            index: true,
            element: <AccountPage />,
          },
          {
            path: 'profile',
            element: <ProfileTab />,
          },
          {
            path: 'preferences',
            element: <PreferencesTab />,
          },
          {
            path: 'addresses',
            element: <AddressesTab />,
          },
        ],
      },
      {
        path: 'become-seller',
        element: (
          <RequireAuth>
            <BecomeSellerPage />
          </RequireAuth>
        ),
      },
      {
        path: 'seller',
        element: (
          <RequireAuth>
            <SellerDashboardPage />
          </RequireAuth>
        ),
      },
      {
        path: 'seller/products',
        element: (
          <RequireAuth>
            <SellerProductsPage />
          </RequireAuth>
        ),
      },
      {
        path: 'seller/products/new',
        element: (
          <RequireAuth>
            <CreateProductPage />
          </RequireAuth>
        ),
      },
      {
        path: 'seller/products/:id/edit',
        element: (
          <RequireAuth>
            <EditProductPage />
          </RequireAuth>
        ),
      },
      {
        path: 'seller/orders',
        element: (
          <RequireAuth>
            <SellerOrdersPage />
          </RequireAuth>
        ),
      },
      {
        path: 'sellers/:id',
        element: <PublicSellerPage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
  {
    path: '/admin',
    element: (
      <RequireAuth>
        <AdminLayout />
      </RequireAuth>
    ),
    children: [
      {
        index: true,
        element: <AdminDashboardPage />,
      },
      {
        path: 'users',
        element: <AdminUsersPage />,
      },
      {
        path: 'sellers',
        element: <AdminSellersPage />,
      },
      {
        path: 'products',
        element: <AdminProductsPage />,
      },
      {
        path: 'categories',
        element: <AdminCategoriesPage />,
      },
      {
        path: 'campuses',
        element: <AdminCampusesPage />,
      },
      {
        path: 'orders',
        element: <AdminOrdersPage />,
      },
      {
        path: 'reports',
        element: <AdminReportsPage />,
      },
      {
        path: 'disputes',
        element: <AdminDisputesPage />,
      },
      {
        path: 'audit-logs',
        element: <AdminAuditLogsPage />,
      },
    ],
  },
]);
