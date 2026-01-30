import BookingModal from '@/components/booking/BookingModal';
import { Footer } from '@/components/Footer';
import NavBar from '@/components/NavBar';

export default function WebsiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BookingModal />
      <NavBar />
        <main>{children}</main>
      <Footer />
    </>
  );
}