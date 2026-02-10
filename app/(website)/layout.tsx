import { Footer } from '@/components/Footer';
import NavBar from '@/components/NavBar';
import { getBusiness, getServices } from '@/lib/data';

export default async function WebsiteLayout({ children }: { children: React.ReactNode }) {

  const [ services, business ] = await Promise.all([
    getServices(),
    getBusiness()
  ])

  if (!services) return null

  if (!business) return null

  return (
    <>
      <NavBar services={services} business={business} />
        <main>{children}</main>
      <Footer services={services} />
    </>
  );
}