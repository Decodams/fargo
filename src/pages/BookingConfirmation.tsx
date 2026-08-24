import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

export default function BookingConfirmation() {
  return (
    <div className="min-h-screen bg-cream-50 flex items-center justify-center">
      <div className="text-center">
        <CheckCircle size={48} className="text-olive-500 mb-4" />
        <h1 className="text-2xl font-display text-ink-900">Booking Confirmed</h1>
        <p className="text-ink-600">Your booking is confirmed. A confirmation email has been sent.</p>
        <Link to="/booking" className="mt-4 text-rose-500 hover:underline">Start another booking</Link>
      </div>
    </div>
  );
}