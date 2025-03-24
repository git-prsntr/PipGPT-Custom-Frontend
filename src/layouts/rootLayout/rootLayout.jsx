/**
 * @file RootLayout Component
 * @description This component serves as the root layout for the application, integrating authentication and query management.
 */

import { Link, Outlet } from 'react-router-dom';
import './rootLayout.css';
import { ClerkProvider } from '@clerk/clerk-react';
import { SignedIn, UserButton } from "@clerk/clerk-react";
import { useUser } from '@clerk/clerk-react';

import {
    QueryClient,
    QueryClientProvider,
} from '@tanstack/react-query'


// @constant {string} PUBLISHABLE_KEY - The Clerk publishable key for authentication
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
    throw new Error("Missing Publishable Key")
}

// @constant {QueryClient} queryClient - React Query client instance
const queryClient = new QueryClient()

/**
 * @component RootLayout
 * @description Wraps the application with Clerk authentication and React Query provider.
 * @returns {JSX.Element} The root layout component
 */


const RootLayout = () => {


    return (
        <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
            <QueryClientProvider client={queryClient}>
                <div className='rootLayout'>
                    <header>
                        <div className='left'>
                            <Link to="/" className="logo">
                                <img src="/sportsnetlogo.png" alt="" />
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