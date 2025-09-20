export interface LoginResponse {
  role: string;
  id: number;
  email?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: string;
  message?: string;
  isBlocked?: boolean;
}

export interface RegisterRequest {
  nom: string;
  dateNaissance: string;
  email: string;
  motDePasse: string;
  telephone: string;
  adresse: string;
  role: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface VerifyCodeResponse {
  message: string;
  valid?: boolean;
}

interface ResetPasswordRequest {
  email: string;
  code: string;
  newPassword: string;
}

interface ResetPasswordResponse {
  message: string;
  success: boolean;
}

const login = async (
  email: string,
  password: string
): Promise<{ ok: boolean; data: LoginResponse }> => {
  const response = await fetch("https://fadakcare-backend-1.onrender.com/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, motDePasse: password }),
  });
  const data: LoginResponse = await response.json();
  if (response.ok && data.accessToken) {
    localStorage.setItem('authToken', data.accessToken);
    if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('userId', String(data.id));
    localStorage.setItem('userRole', data.role);
  }
  return { ok: response.ok, data };
};

type RegisterResponse = LoginResponse;

const register = async (
  userData: RegisterRequest
): Promise<{ ok: boolean; data: RegisterResponse }> => {
  const response = await fetch("https://fadakcare-backend-1.onrender.com/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  const data: RegisterResponse = await response.json();
  if (response.ok && data.accessToken) {
    localStorage.setItem('authToken', data.accessToken);
    if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
    if (data.id) localStorage.setItem('userId', String(data.id));
    if (data.role) localStorage.setItem('userRole', data.role);
  }
  return { ok: response.ok, data };
};

const refreshToken = async (): Promise<boolean> => {
  const refreshTokenValue = localStorage.getItem('refreshToken');
  const userId = localStorage.getItem('userId');
  if (!refreshTokenValue || !userId) return false;
  try {
    const response = await fetch('https://fadakcare-backend-1.onrender.com/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: Number(userId), refreshToken: refreshTokenValue })
    });
    const data = await response.json();
    if (response.ok && data.accessToken) {
      localStorage.setItem('authToken', data.accessToken);
      return true;
    }
  } catch { /* ignore */ }
  return false;
};

const logout = async () => {
  const refreshTokenValue = localStorage.getItem('refreshToken');
  const userId = localStorage.getItem('userId');
  if (refreshTokenValue && userId) {
    try {
      await fetch('https://fadakcare-backend-1.onrender.com/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: Number(userId), refreshToken: refreshTokenValue })
      });
    } catch { /* ignore */ }
  }
  localStorage.removeItem('authToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('userId');
  localStorage.removeItem('userRole');
};

const forgotPassword = async (
  email: string
): Promise<{ ok: boolean; data: ForgotPasswordResponse }> => {
  const response = await fetch("https://fadakcare-backend-1.onrender.com/api/auth/forgotPassword", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const data: ForgotPasswordResponse = await response.json();
  return { ok: response.ok, data };
};

const verifyCode = async (
  email: string,
  code: string
): Promise<{ ok: boolean; data: VerifyCodeResponse }> => {
  const response = await fetch("https://fadakcare-backend-1.onrender.com/api/auth/verifyCode", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, code }),
  });
  const data: VerifyCodeResponse = await response.json();
  return { ok: response.ok, data };
};

const resetPassword = async (data: ResetPasswordRequest): Promise<ResetPasswordResponse> => {
  try {
    const response = await fetch("https://fadakcare-backend-1.onrender.com/api/auth/resetPassword", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    return {
      success: response.ok,
      message: result.message || (response.ok ? "Mot de passe réinitialisé avec succès" : "Échec de la réinitialisation"),
    };
  } catch {
    return {
      success: false,
      message: "Erreur réseau lors de la réinitialisation",
    };
  }
};

export const authService = { login, register, forgotPassword, verifyCode, resetPassword, refreshToken, logout };
