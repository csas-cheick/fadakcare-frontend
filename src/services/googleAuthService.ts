interface GoogleAuthResponse {
  credential: string;
  select_by: string;
}

interface GoogleUserInfo {
  sub: string;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  email: string;
  email_verified: boolean;
}

interface GoogleNotification {
  isNotDisplayed: () => boolean;
  isSkippedMoment: () => boolean;
}

interface GoogleConfig {
  client_id: string;
  callback: (response: GoogleAuthResponse) => void;
}

interface GoogleButtonConfig {
  theme: 'outline' | 'filled_blue' | 'filled_black';
  size: 'large' | 'medium' | 'small';
  width?: number;
  text: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
}

interface BackendAuthResponse {
  role: string;
  id: number;
  nom?: string;
  email: string;
  accessToken: string;
  refreshToken: string;
  message: string;
}

class GoogleAuthService {
  private static clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "1084682420885-caiu7s2hi7p34cjbi15a0gq3u08e2ho0.apps.googleusercontent.com";
  private static isGoogleSDKLoaded = false;

  static async loadGoogleSDK(): Promise<void> {
    if (this.isGoogleSDKLoaded) return;

    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        this.isGoogleSDKLoaded = true;
        resolve();
      };
      document.head.appendChild(script);
    });
  }

  static async initializeGoogleAuth(): Promise<void> {
    await this.loadGoogleSDK();
    
    // Attendre que google soit disponible
    return new Promise((resolve) => {
      const checkGoogle = () => {
        if (window.google) {
          resolve();
        } else {
          setTimeout(checkGoogle, 100);
        }
      };
      checkGoogle();
    });
  }

  static async signInWithGoogle(): Promise<GoogleUserInfo> {
    await this.initializeGoogleAuth();

    return new Promise((resolve, reject) => {
      window.google.accounts.id.initialize({
        client_id: this.clientId,
        callback: async (response: GoogleAuthResponse) => {
          try {
            const userInfo = await this.parseJWTToken(response.credential);
            resolve(userInfo);
          } catch (error) {
            reject(error);
          }
        },
      });

      // Déclencher la popup de connexion Google
      window.google.accounts.id.prompt((notification: GoogleNotification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // Si la popup automatique ne fonctionne pas, rejeter avec un message informatif
          reject(new Error('Google Sign-In non disponible. Veuillez vérifier la configuration du client ID.'));
        }
      });
    });
  }

  private static async parseJWTToken(token: string): Promise<GoogleUserInfo> {
    // Décoder le JWT token de Google pour extraire les informations utilisateur
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Token JWT invalide');
    }

    const payload = parts[1];
    const decodedPayload = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    const userInfo: GoogleUserInfo = JSON.parse(decodedPayload);

    return userInfo;
  }

  static async authenticateWithBackend(googleUserInfo: GoogleUserInfo): Promise<BackendAuthResponse> {
    const response = await fetch('https://fadakcare-backend-1.onrender.com/api/auth/google-login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        googleId: googleUserInfo.sub,
        email: googleUserInfo.email,
        nom: googleUserInfo.name,
        prenom: googleUserInfo.given_name,
        nomFamille: googleUserInfo.family_name,
        profilePicture: googleUserInfo.picture,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      if (errorData.isBlocked) {
        throw new Error(errorData.message || 'Votre compte a été bloqué. Veuillez contacter l\'administrateur à l\'adresse : fadakcare@gmail.com');
      }
      throw new Error(errorData.message || 'Erreur lors de l\'authentification avec le backend');
    }

    return await response.json();
  }
}

// Déclaration des types globaux pour Google Sign-In
declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: GoogleConfig) => void;
          prompt: (callback?: (notification: GoogleNotification) => void) => void;
          renderButton: (element: HTMLElement | null, config: GoogleButtonConfig) => void;
        };
      };
    };
  }
}

export default GoogleAuthService;
export type { GoogleUserInfo, BackendAuthResponse };
