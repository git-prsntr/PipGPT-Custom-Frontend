import { Link, Outlet } from 'react-router-dom';
import './rootLayout.css';
import { ClerkProvider, SignedIn, UserButton } from '@clerk/clerk-react';
import { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
if (!PUBLISHABLE_KEY) throw new Error("Missing Publishable Key");

const queryClient = new QueryClient();

const RootLayout = () => {
  const [logo, setLogo] = useState(localStorage.getItem("companyLogo") || "/amplogo.png");

  // Listen for localStorage changes and update logo
  useEffect(() => {
    const handleStorageChange = () => {
      const updatedLogo = localStorage.getItem("companyLogo") || "/poweredbyPipGPT.png";
      setLogo(updatedLogo);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
      <QueryClientProvider client={queryClient}>
        <div className='rootLayout'>
          <header>
            <div className='left'>
              <Link to="/" className="logo">
                <img src={logo} alt="Logo" />
              </Link>
            </div>

            <div className='right'>
              <div className="user">
                <SignedIn>
                  <UserButton />
                </SignedIn>
              </div>
              <Link to="/" className="logo">
                <img src="/poweredbyPipGPT.png" alt="" />
              </Link>
            </div>
          </header>
          <main>
            <Outlet />
          </main>
        </div>
      </QueryClientProvider>
    </ClerkProvider>
  );
};

export default RootLayout;
