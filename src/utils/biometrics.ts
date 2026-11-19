// APEX OS / WEB AUTHENTICATION & BIOMETRIC SECURITY
// Supports Fingerprint, Face ID, Touch ID, and Windows Hello via W3C WebAuthn

export interface BiometricAvailability {
  isSupported: boolean;
  hasPlatformAuthenticator: boolean;
}

export const checkBiometricSupport = async (): Promise<BiometricAvailability> => {
  if (typeof window === 'undefined') {
    return { isSupported: false, hasPlatformAuthenticator: false };
  }

  const isSupported = !!(window.PublicKeyCredential && navigator.credentials);
  let hasPlatformAuthenticator = false;

  if (isSupported && window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable) {
    try {
      hasPlatformAuthenticator = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    } catch {
      hasPlatformAuthenticator = false;
    }
  }

  return { isSupported, hasPlatformAuthenticator };
};

export const registerBiometrics = async (userName: string = 'Abdulaziz'): Promise<{ success: boolean; error?: string }> => {
  if (typeof window === 'undefined' || !navigator.credentials) {
    return { success: false, error: 'WebAuthn is not supported in this browser environment.' };
  }

  try {
    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);

    const userId = new Uint8Array(16);
    window.crypto.getRandomValues(userId);

    const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
      challenge,
      rp: {
        name: 'Project 90 / Apex OS',
        id: window.location.hostname
      },
      user: {
        id: userId,
        name: userName,
        displayName: `${userName} (Owner)`
      },
      pubKeyCredParams: [
        { alg: -7, type: 'public-key' }, // ES256
        { alg: -257, type: 'public-key' } // RS256
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform', // Built-in Fingerprint / Face ID
        userVerification: 'required',
        residentKey: 'preferred'
      },
      timeout: 60000,
      attestation: 'none'
    };

    const credential: any = await navigator.credentials.create({
      publicKey: publicKeyCredentialCreationOptions
    });

    if (credential && credential.id) {
      localStorage.setItem('apex_biometric_credential_id', credential.id);
      localStorage.setItem('apex_biometric_enabled', 'true');
      return { success: true };
    }

    return { success: false, error: 'Failed to generate biometric credential.' };
  } catch (err: any) {
    // If user cancelled prompt or platform authenticator missing
    if (err.name === 'NotAllowedError') {
      return { success: false, error: 'Biometric registration was cancelled or timed out.' };
    }
    return { success: false, error: err.message || 'Biometric hardware unavailable.' };
  }
};

export const verifyBiometrics = async (): Promise<{ success: boolean; error?: string }> => {
  if (typeof window === 'undefined' || !navigator.credentials) {
    return { success: false, error: 'Biometrics unavailable in this browser.' };
  }

  try {
    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);

    const savedCredId = localStorage.getItem('apex_biometric_credential_id');
    let allowCredentials: PublicKeyCredentialDescriptor[] = [];
    if (savedCredId) {
      try {
        const padded = savedCredId.padEnd(savedCredId.length + (4 - (savedCredId.length % 4)) % 4, '=');
        const binary = atob(padded.replace(/-/g, '+').replace(/_/g, '/'));
        const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
        allowCredentials = [{ id: bytes, type: 'public-key' }];
      } catch {
        // Fall back to resident key prompt if base64 decoding fails
        allowCredentials = [];
      }
    }

    const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
      challenge,
      timeout: 60000,
      userVerification: 'required',
      ...(allowCredentials.length > 0 ? { allowCredentials } : {})
    };

    const assertion = await navigator.credentials.get({
      publicKey: publicKeyCredentialRequestOptions
    });

    if (assertion) {
      return { success: true };
    }

    return { success: false, error: 'Fingerprint / Biometric verification failed.' };
  } catch (err: any) {
    if (err.name === 'NotAllowedError') {
      return { success: false, error: 'Verification cancelled.' };
    }
    return { success: false, error: err.message || 'Biometric verification failed.' };
  }
};

export const isBiometricsRegistered = (): boolean => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('apex_biometric_enabled') === 'true';
};

