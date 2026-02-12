import { Header, Hero, Features, Footer } from '../components';

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
