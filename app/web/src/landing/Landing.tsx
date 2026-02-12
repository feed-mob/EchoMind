import React from 'react';
import { Header, Hero, Features, Footer } from './components';
import './landing.css';

export default function Landing() {
  return (
    <div className="bg-white text-slate-800 font-display antialiased">
      <Header />
      <main>
        <Hero />
        <Features />
      </main>
      <Footer />
    </div>
  );
}
