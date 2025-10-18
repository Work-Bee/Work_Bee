import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import ProfileCompletionBanner from './ProfileCompletionBanner';
import { useAuth } from '../context/AuthContext';
import Footer from './Footer';

const Layout = () => {
  const { user } = useAuth();
  return (
    <div className="min-h-screen flex flex-col relative">
      {/* subtle grid overlay */}
      <div className="pointer-events-none absolute inset-0 grid-overlay"></div>
      <Header />
      {user ? <ProfileCompletionBanner user={user} /> : null}
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;