import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const UnifiedAuth = () => {
  const { googleAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [gsiLoaded, setGsiLoaded] = useState(false);

  const from = location.state?.from?.pathname || '/portfolio';

  const handleGoogleCredentialResponse = useCallback(async (response) => {
    if (!response || !response.credential) {
      setError('Google Sign-In did not return a valid credential. Please try again.');
      return;
    }
    try {
      setLoading(true);
      setError('');
      await googleAuth(response.credential);
      navigate(from, { replace: true });
    } catch (err) {
      console.error('Google Auth submission error:', err);
      setError(err.response?.data?.message || 'Google Sign-In verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [googleAuth, navigate, from]);

  // Load Google Identity Services SDK script dynamically
  useEffect(() => {
    const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || '817253510812-74npu66qfekfggmbeui8tn8aco9b3fi6.apps.googleusercontent.com';
    if (!googleClientId) {
      setError('Google Client ID is missing. Please configure REACT_APP_GOOGLE_CLIENT_ID in your frontend .env file.');
      return;
    }

    const initGoogleGSI = () => {
      if (window.google?.accounts?.id) {
        setGsiLoaded(true);
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleCredentialResponse,
          auto_select: false
        });

        const buttonDiv = document.getElementById('googleSignInBtn');
        if (buttonDiv) {
          buttonDiv.innerHTML = '';
          window.google.accounts.id.renderButton(buttonDiv, {
            theme: 'filled_blue',
            size: 'large',
            width: 320,
            text: 'continue_with',
            shape: 'rectangular',
            logo_alignment: 'left'
          });
        }
      }
    };

    if (window.google?.accounts?.id) {
      initGoogleGSI();
    } else {
      const existingScript = document.getElementById('google-gsi-script');
      if (!existingScript) {
        const script = document.createElement('script');
        script.id = 'google-gsi-script';
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = initGoogleGSI;
        script.onerror = () => {
          setError('Failed to load Google Sign-In SDK. Please check your internet connection or ad blocker.');
        };
        document.body.appendChild(script);
      } else {
        existingScript.addEventListener('load', initGoogleGSI);
      }
    }
  }, [handleGoogleCredentialResponse]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-navy-950">
      <div className="max-w-md w-full space-y-6 bg-navy-900 p-8 rounded-3xl border border-navy-800 shadow-2xl relative overflow-hidden">
        
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-500/10 text-brand-400 mb-4 border border-brand-500/20 shadow-inner">
            <svg className="w-8 h-8 text-white" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Welcome to JodhpurTraders
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Sign in with your Google Account
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse"></span>
            Real Google Identity Verification
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm p-3.5 rounded-xl flex items-start gap-3">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="leading-snug">{error}</span>
          </div>
        )}

        {/* Main Google Sign-In Area */}
        <div className="space-y-4 text-center py-2">
          <div className="bg-navy-950 p-6 rounded-2xl border border-navy-800 flex flex-col items-center justify-center gap-4 shadow-inner">
            
            {/* Loading Overlay */}
            {loading && (
              <div className="flex items-center justify-center gap-3 text-brand-400 py-2">
                <div className="w-5 h-5 border-2 border-brand-400 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm font-semibold">Verifying Google Account...</span>
              </div>
            )}

            {/* Official Google Identity Button container */}
            <div 
              id="googleSignInBtn" 
              className={`flex justify-center min-h-[44px] w-full ${loading ? 'opacity-50 pointer-events-none' : ''}`}
            ></div>

            {!gsiLoaded && !loading && (
              <p className="text-xs text-gray-400 animate-pulse">Loading Google Identity Services...</p>
            )}

            <p className="text-xs text-gray-500 leading-relaxed max-w-xs pt-2">
              Fast & secure single sign-in with your Google Account.
            </p>
          </div>
        </div>

        {/* Footer Security Badge */}
        <div className="text-center pt-4 border-t border-navy-800/60">
          <p className="text-[11px] text-gray-500 flex items-center justify-center gap-1.5">
            <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            256-Bit Encrypted Google OAuth 2.0
          </p>
        </div>
      </div>
    </div>
  );
};
