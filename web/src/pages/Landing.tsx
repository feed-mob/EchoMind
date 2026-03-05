import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Header, Hero, Features, Footer } from '../components';

export default function Landing() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/group', { replace: true });
    }
  }, [isAuthenticated, navigate]);

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
