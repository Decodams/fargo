import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PublicLayout from '@/components/layout/PublicLayout';
import Home from '@/pages/Home';
import Services from '@/pages/Services';
import ServiceDetail from '@/pages/ServiceDetail';
import HomeServices from '@/pages/HomeServices';
import Gallery from '@/pages/Gallery';
import Products from '@/pages/Products';
import About from '@/pages/About';
import Contact from '@/pages/Contact';
import FAQ from '@/pages/FAQ';
import Booking from '@/pages/Booking';
import BookingConfirmation from '@/pages/BookingConfirmation';
import NotFound from '@/pages/NotFound';
import AdminLayout from '@/pages/admin/AdminLayout';
import AdminLogin from '@/pages/admin/AdminLogin';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminBookings from '@/pages/admin/AdminBookings';
import AdminInquiries from '@/pages/admin/AdminInquiries';
import AdminServices from '@/pages/admin/AdminServices';
import AdminProducts from '@/pages/admin/AdminProducts';
import AdminCustomers from '@/pages/admin/AdminCustomers';
import AdminSettings from '@/pages/admin/AdminSettings';
import AdminContent from '@/pages/admin/AdminContent';
import AdminSEO from '@/pages/admin/AdminSEO';
import AdminCategories from '@/pages/admin/AdminCategories';
import AdminFAQ from '@/pages/admin/AdminFAQ';
import AdminStaff from '@/pages/admin/AdminStaff';
import ProtectedRoute from '@/components/admin/ProtectedRoute';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public site */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/services/:slug" element={<ServiceDetail />} />
          <Route path="/home-services" element={<HomeServices />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/products" element={<Products />} />
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
          <Route path="inquiries" element={<AdminInquiries />} />
          <Route path="services" element={<AdminServices />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="content" element={<AdminContent />} />
          <Route path="seo" element={<AdminSEO />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="faq" element={<AdminFAQ />} />
          <Route path="staff" element={<AdminStaff />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
