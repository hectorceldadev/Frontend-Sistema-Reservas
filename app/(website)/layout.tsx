import { Footer } from '@/components/Footer';
import NavBar from '@/components/NavBar';
import { getServices } from '@/lib/data';

export default async function WebsiteLayout({ children }: { children: React.ReactNode }) {

  const services = await getServices() || []

  return (
    <>
      <NavBar services={services} />
        <main>{children}</main>
      <Footer services={services} />
    </>
  );
}