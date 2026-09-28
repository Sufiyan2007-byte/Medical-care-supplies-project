import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { QuoteCartProvider } from './context/QuoteCartContext';
import { WishlistProvider } from './context/WishlistContext';
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import Home from './pages/Home';
import About from './pages/About';
import Products from './pages/Products';
import ProductListing from './pages/ProductListing';
import ProductDetail from './pages/ProductDetail';
import XelpovSpecialties from './pages/XelpovSpecialties';
import XelpovCatalog from './pages/XelpovCatalog';
import XelpovProductDetail from './pages/XelpovProductDetail';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import NotFound from './pages/NotFound';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Contact from './pages/Contact';
import CheckInbox from './pages/CheckInbox';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ResendVerification from './pages/ResendVerification';
import VerifyEmail from './pages/VerifyEmail';
import Account from './pages/Account';
import MyOrders from './pages/MyOrders';
import ProtectedRoute from './components/ProtectedRoute';
import StaffRoute from './staff/StaffRoute';
import StaffLogin from './staff/StaffLogin';
import StaffLayout from './staff/StaffLayout';
import Overview from './staff/pages/Overview';
import StaffOrders from './staff/pages/Orders';
import StaffProducts from './staff/pages/Products';
import StaffXelpovProducts from './staff/pages/XelpovProducts';
import StaffMessages from './staff/pages/Messages';
import StaffUsers from './staff/pages/Users';
import StaffSystem from './staff/pages/System';
import { ToastProvider } from './context/ToastContext';

function App() {
  const { i18n } = useTranslation();

  // Update text direction based on the current language
  useEffect(() => {
    document.documentElement.dir = i18n.language.startsWith('ar') ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return (
    <AuthProvider>
      <CartProvider>
      <QuoteCartProvider>
      <WishlistProvider>
        <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* ── Public site routes ──────────────────────────── */}
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Home />} />
              <Route path="about" element={<About />} />
              <Route path="contact" element={<Contact />} />
              <Route path="checkout" element={<Checkout />} />
              <Route path="checkout/success" element={<OrderSuccess />} />
              <Route path="products" element={<ProductListing />} />
              <Route path="products/ent-rhinology" element={<Navigate to="/catalogue/ent" replace />} />
              <Route path="products/general-surgery" element={<Navigate to="/catalogue/general-surgery" replace />} />
              <Route path="products/:category" element={<ProductListing />} />
              <Route path="products/:category/:id" element={<ProductDetail />} />

              {/* ── Xelpov unified catalogue ────────────────────── */}
              <Route path="catalogue" element={<XelpovSpecialties />} />
              <Route path="catalogue/:specialty" element={<XelpovCatalog />} />
              <Route path="catalogue/:specialty/:slug" element={<XelpovProductDetail />} />
              
              {/* ── Customer account (signed-in customers) ─────────────── */}
              <Route path="account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
              <Route path="account/orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />

              {/* Old admin link → new staff panel */}
              <Route path="admin" element={<Navigate to="/staff/products" replace />} />

              <Route path="*" element={<NotFound />} />
            </Route>

            {/* ── Staff panel: admin + developer only ─────────── */}
            <Route path="/staff/login" element={<StaffLogin />} />
            <Route path="/staff" element={<StaffRoute><StaffLayout /></StaffRoute>}>
              <Route index element={<Overview />} />
              <Route path="orders" element={<StaffOrders />} />
              <Route path="products" element={<StaffProducts />} />
              <Route path="catalogue" element={<StaffXelpovProducts />} />
              <Route path="messages" element={<StaffMessages />} />
              <Route path="users" element={<StaffRoute roles={['developer']}><StaffUsers /></StaffRoute>} />
              <Route path="system" element={<StaffRoute roles={['developer']}><StaffSystem /></StaffRoute>} />
            </Route>

            {/* ── Auth routes (split-screen layout) ───────────── */}
            <Route path="/auth" element={<AuthLayout />}>
              <Route path="login" element={<Login />} />
              <Route path="signup" element={<Signup />} />
              <Route path="check-inbox" element={<CheckInbox />} />
              <Route path="forgot-password" element={<ForgotPassword />} />
              <Route path="reset-password" element={<ResetPassword />} />
              <Route path="resend-verification" element={<ResendVerification />} />
              <Route path="verify-email" element={<VerifyEmail />} />
            </Route>

            {/* ── Direct Auth Route Redirects ─────────────────── */}
            <Route path="/login" element={<Navigate to="/auth/login" replace />} />
            <Route path="/signup" element={<Navigate to="/auth/signup" replace />} />
            <Route path="/forgot-password" element={<Navigate to="/auth/forgot-password" replace />} />
            <Route path="/reset-password" element={<Navigate to="/auth/reset-password" replace />} />
            <Route path="/verify-email" element={<Navigate to="/auth/verify-email" replace />} />
            <Route path="/resend-verification" element={<Navigate to="/auth/resend-verification" replace />} />
            <Route path="/check-inbox" element={<Navigate to="/auth/check-inbox" replace />} />
          </Routes>
        </BrowserRouter>
        </ToastProvider>
      </WishlistProvider>
      </QuoteCartProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;

