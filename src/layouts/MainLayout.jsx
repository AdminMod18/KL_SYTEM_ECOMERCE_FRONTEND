import { Navbar } from '../components/Navbar.jsx';
import { Footer } from '../components/Footer.jsx';

/**
 * Layout único alineado al storefront (login/registro incluidos).
 */
export function MainLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col bg-[radial-gradient(ellipse_100%_75%_at_50%_-10%,#FFFFFF_0%,#F9FAFB_42%,#F3F4F6_100%)]">
      <Navbar variant="storefront" />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-wide px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          {children}
        </div>
      </main>
      <Footer variant="storefront" />
    </div>
  );
}
