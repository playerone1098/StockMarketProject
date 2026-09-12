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
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-white dark:bg-navy-950">
      <div className="max-w-md w-full space-y-6 bg-white dark:bg-navy-900 p-8 rounded-3xl border border-gray-200 dark:border-navy-800 shadow-2xl relative overflow-hidden">
        
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 mb-4 border border-brand-500/20 shadow-inner font-black text-xl">
            JT
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-navy-950 dark:text-white tracking-tight">
            Welcome to JodhpurTraders
          </h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Sign in with your Google Account
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-600 dark:text-brand-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse"></span>
            Real Google Identity Verification
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-600 dark:text-rose-400 text-sm p-3.5 rounded-xl flex items-start gap-3">
            <span className="font-bold">!</span>
            <span className="leading-snug">{error}</span>
          </div>
        )}

        {/* Main Google Sign-In Area */}
        <div className="space-y-4 text-center py-2">
          <div className="bg-white dark:bg-navy-950 p-6 rounded-2xl border border-gray-200 dark:border-navy-800 flex flex-col items-center justify-center gap-4 shadow-inner">
            
            {/* Loading Overlay */}
            {loading && (
              <div className="flex items-center justify-center gap-3 text-brand-600 dark:text-brand-400 py-2">
                <div className="w-5 h-5 border-2 border-brand-600 dark:border-brand-400 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm font-semibold">Verifying Google Account...</span>
              </div>
            )}

            {/* Official Google Identity Button container */}
            <div 
              id="googleSignInBtn" 
              className={`flex justify-center min-h-[44px] w-full ${loading ? 'opacity-50 pointer-events-none' : ''}`}
            ></div>

            {!gsiLoaded && !loading && (
              <p className="text-xs text-gray-500 dark:text-gray-400 animate-pulse">Loading Google Identity Services...</p>
            )}

            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed max-w-xs pt-2">
              Fast & secure single sign-in with your Google Account.
            </p>
          </div>
        </div>

        {/* Footer Security Badge */}
        <div className="text-center pt-4 border-t border-gray-200 dark:border-navy-800/60">
          <p className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1.5">
            256-Bit Encrypted Google OAuth 2.0
          </p>
        </div>
      </div>
    </div>
  );
};
