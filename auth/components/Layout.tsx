import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

export function Layout({ children, bgColor = 'bg-white' }) {
  return (
    <div className={bgColor}>
      <Header />
      <div className="relative overflow-hidden">
        <main>{children}</main>
        <Footer />
      </div>
    </div>
  );
}
