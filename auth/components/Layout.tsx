import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

export function Layout({ children }) {
  return (
    <div className="bg-white">
      <Header />
      <div className="relative overflow-hidden">
        <main>{children}</main>
        <Footer />
      </div>
    </div>
  );
}
