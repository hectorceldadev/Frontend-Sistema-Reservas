import { Footer } from '@/components/Footer';
import NavBar from '@/components/NavBar';

export default function WebsiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NavBar />
        <main>{children}</main>
      <Footer />
    </>
  );
}