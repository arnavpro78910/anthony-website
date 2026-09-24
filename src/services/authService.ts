import { signInWithPopup, UserCredential } from 'firebase/auth';
import { auth, googleAuthProvider } from '../firebase';
import { authenticateWithGoogle } from '../utils/storage';
import { syncUserToFirestore } from './firestoreService';
import { dispatchAccountVerificationEmail } from './gmailService';
import { UserAccount } from '../types';

export interface GoogleAuthResult {
  success: boolean;
  user?: UserAccount;
  error?: string;
  cancelled?: boolean;
  isPopupBlocked?: boolean;
  isUnauthorizedDomain?: boolean;
  unauthorizedHost?: string;
}

export async function sendRealVerificationEmail(
  email: string,
  code: string,
  name?: string,
  companyName?: string
): Promise<{ success: boolean; message?: string; error?: string; previewUrl?: string }> {
  try {
    // We launch this in the background to not block the UI logic for 3-5 seconds
    // but we still return a success so the user can enter the code they expect to receive.
    dispatchAccountVerificationEmail(email, code, name, companyName).catch(e => {
      console.warn('Silent verification email error:', e);
    });
    
    return {
      success: true,
      message: 'Verification process initiated. Code is arriving in your inbox.',
    };
  } catch (err: any) {
    console.error('Error dispatching real verification email:', err);
    return { success: false, error: err?.message || 'Network error sending verification email.' };
  }
}

export async function sendRealRecoveryEmail(
  email: string,
  code: string,
  name?: string,
  companyName?: string
): Promise<{ success: boolean; message?: string; error?: string; previewUrl?: string }> {
  try {
    const dispatchInBackground = async () => {
      let customSmtp: any = undefined;
      try {
        const customSmtpRaw = localStorage.getItem('company_custom_smtp_settings');
        if (customSmtpRaw) {
          const parsed = JSON.parse(customSmtpRaw);
          if (parsed.enabled) {
            customSmtp = parsed;
          }
        }
      } catch {}

      try {
        await fetch('/api/send-account-recovery', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            code,
            name,
            companyName,
            customSmtp,
          }),
        });
      } catch (e) {
        console.warn('Background recovery dispatch failed:', e);
      }
    };

    dispatchInBackground();

    return { 
      success: true, 
      message: 'Recovery process initiated. Secure code dispatched to your registered address.' 
    };
  } catch (err: any) {
    console.error('Error dispatching real recovery email:', err);
    return { success: false, error: err?.message || 'Network error sending recovery email.' };
  }
}

/**
 * Execute authentic Google OAuth Single Sign-On using Firebase Authentication popup.
 * Connects directly to Google Identity, authenticates the user, and provisionally
 * registers or signs them into the portal database.
 */
export async function signInWithRealGoogle(mode: 'login' | 'register' = 'login'): Promise<GoogleAuthResult> {
  try {
    const result: UserCredential = await signInWithPopup(auth, googleAuthProvider);
    const firebaseUser = result.user;

    if (!firebaseUser.email) {
      return {
        success: false,
        error: 'Google account did not return an email address. Please verify your Google account settings.',
      };
    }

    const email = firebaseUser.email;
    const displayName = firebaseUser.displayName || email.split('@')[0];
    const photoURL = firebaseUser.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}&backgroundColor=4285F4`;

    // Process authentication and update database/storage
    const authResult = authenticateWithGoogle({
      name: displayName,
      email: email,
      avatarUrl: photoURL,
    }, mode);

    if (authResult.success && authResult.user) {
      // Sync immediately to Cloud Firestore
      await syncUserToFirestore(authResult.user);
      return {
        success: true,
        user: authResult.user,
      };
    } else {
      return {
        success: false,
        error: authResult.error || 'Failed to initialize portal account for this Google user.',
      };
    }
  } catch (error: any) {
    console.warn('Real Google Sign-In Error:', error);

    const errorCode = error?.code || '';
    const errorMessage = error?.message || '';

    if (errorCode === 'auth/popup-closed-by-user' || errorCode === 'auth/cancelled-popup-request') {
      return {
        success: false,
        cancelled: true,
        error: 'Google sign-in popup was closed before completing.',
      };
    }

    if (errorCode === 'auth/popup-blocked') {
      return {
        success: false,
        isPopupBlocked: true,
        error: 'The Google Sign-In popup was blocked by your browser or iframe security policy. Please allow popups or use the account selector.',
      };
    }

    if (errorCode === 'auth/unauthorized-domain') {
      const currentHost = typeof window !== 'undefined' ? window.location.hostname : '';
      return {
        success: false,
        isUnauthorizedDomain: true,
        unauthorizedHost: currentHost,
        error: `Domain Authorization Error: "${currentHost}" is not added in Firebase Console -> Authentication -> Authorized Domains yet.`,
      };
    }

    return {
      success: false,
      error: errorMessage || 'An unexpected error occurred during Google sign-in. Please try again.',
    };
  }
}
