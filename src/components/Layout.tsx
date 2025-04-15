
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import LanguageSwitcher from './LanguageSwitcher';

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="flex justify-end p-2 bg-white border-b">
        <LanguageSwitcher />
      </div>
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
