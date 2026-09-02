import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PublicLayout from '@/components/layout/PublicLayout';
import AdminLayout from '@/pages/admin/AdminLayout';
import AdminLogin from '@/pages/admin/AdminLogin';
import ProtectedRoute from '@/components/admin/ProtectedRoute';

const Home = lazy(() => import('@/pages/Home'));
const Services = lazy(() => import('@/pages/Services'));
const ServiceDetail = lazy(() => import('@/pages/ServiceDetail'));
const HomeServices = lazy(() => import('@/pages/HomeServices'));
const Gallery = lazy(() => import('@/pages/Gallery'));
const Products = lazy(() => import('@/pages/Products'));
const ProductDetail = lazy(() => import('@/pages/ProductDetail'));
const ProductCheckout = lazy(() => import('@/pages/ProductCheckout'));
const About = lazy(() => import('@/pages/About'));
const Contact = lazy(() => import('@/pages/Contact'));
const FAQ = lazy(() => import('@/pages/FAQ'));
const Booking = lazy(() => import('@/pages/Booking'));
const BookingConfirmation = lazy(() => import('@/pages/BookingConfirmation'));
const NotFound = lazy(() => import('@/pages/NotFound'));
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'));
const AdminBookings = lazy(() => import('@/pages/admin/AdminBookings'));
const AdminOrders = lazy(() => import('@/pages/admin/AdminOrders'));
const AdminInquiries = lazy(() => import('@/pages/admin/AdminInquiries'));
const AdminServices = lazy(() => import('@/pages/admin/AdminServices'));
const AdminProducts = lazy(() => import('@/pages/admin/AdminProducts'));
const AdminCustomers = lazy(() => import('@/pages/admin/AdminCustomers'));
const AdminSettings = lazy(() => import('@/pages/admin/AdminSettings'));
const AdminContent = lazy(() => import('@/pages/admin/AdminContent'));
const AdminSEO = lazy(() => import('@/pages/admin/AdminSEO'));
const AdminCategories = lazy(() => import('@/pages/admin/AdminCategories'));
const AdminFAQ = lazy(() => import('@/pages/admin/AdminFAQ'));
const AdminGallery = lazy(() => import('@/pages/admin/AdminGallery'));
const AdminStaff = lazy(() => import('@/pages/admin/AdminStaff'));
const AdminPricing = lazy(() => import('@/pages/admin/AdminPricing'));

function PageLoader() {
  return (
    <div className="min-h-screen bg-cream-50 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-ink-300 border-t-ink-900 animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public site */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/services/:slug" element={<ServiceDetail />} />
            <Route path="/home-services" element={<HomeServices />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:slug" element={<ProductDetail />} />
            <Route path="/products/checkout" element={<ProductCheckout />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/booking/confirmation" element={<BookingConfirmation />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* Admin */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="inquiries" element={<AdminInquiries />} />
            <Route path="services" element={<AdminServices />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="pricing" element={<AdminPricing />} />
            <Route path="content" element={<AdminContent />} />
            <Route path="seo" element={<AdminSEO />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="faq" element={<AdminFAQ />} />
            <Route path="gallery" element={<AdminGallery />} />
            <Route path="staff" element={<AdminStaff />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
