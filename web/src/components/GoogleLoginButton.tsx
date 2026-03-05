import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

type GoogleCredentialResponse = {
  credential: string;
};

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: GoogleCredentialResponse) => void;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              theme?: 'outline' | 'filled_blue' | 'filled_black';
              size?: 'small' | 'medium' | 'large';
              shape?: 'rectangular' | 'pill' | 'circle' | 'square';
              text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
              logo_alignment?: 'left' | 'center';
              width?: string;
            },
          ) => void;
        };
      };
    };
  }
}

export default function GoogleLoginButton() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const buttonRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const { loginWithGoogleCredential } = useAuth();

  useEffect(() => {
    if (!clientId) {
      setError('Missing VITE_GOOGLE_CLIENT_ID');
      return;
    }

    let cancelled = false;
    const maxRetries = 20;

    const initialize = (attempt: number) => {
      if (cancelled) return;
      if (!window.google?.accounts?.id || !buttonRef.current) {
        if (attempt >= maxRetries) {
          setError('Google script failed to load');
          return;
        }
        window.setTimeout(() => initialize(attempt + 1), 150);
        return;
      }

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
          try {
            setLoading(true);
            setError(null);
            await loginWithGoogleCredential(response.credential);
            navigate('/group');
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Google login failed');
          } finally {
            setLoading(false);
          }
        },
      });

      buttonRef.current.innerHTML = '';
      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
        shape: 'pill',
        logo_alignment: 'left',
        width: '260',
      });
    };

    initialize(0);
    return () => {
      cancelled = true;
    };
  }, [clientId, loginWithGoogleCredential, navigate]);

  if (!clientId) {
    return <p className="text-sm text-red-500">Google Login not configured.</p>;
  }

  return (
    <div>
      <div ref={buttonRef} aria-busy={loading} />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

