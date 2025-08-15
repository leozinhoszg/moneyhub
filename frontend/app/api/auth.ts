// Tipos para as respostas da API
interface AuthResponse {
  user: {
    id: number;
    nome: string;
    email: string;
    provider: string;
    is_verified: boolean;
    email_verificado: boolean;
    data_cadastro: string;
    ultimo_login?: string;
    is_active: boolean;
    has_password?: boolean;
    has_google?: boolean;
  };
}

interface ErrorResponse {
  detail: string | { message: string; issues?: string[] };
}

// Função auxiliar para extrair mensagens de erro
function extractErrorMessage(error: any): string {
  if (typeof error === "string") return error;
  if (error?.message) return error.message;
  if (error?.detail) {
    if (typeof error.detail === "string") return error.detail;
    if (error.detail.message) return error.detail.message;
  }
  return "Erro desconhecido";
}

// Função auxiliar para fazer requisições com tratamento de erro
async function apiRequest(url: string, options: RequestInit): Promise<any> {
  const res = await fetch(url, options);

  if (!res.ok) {
    let errorData: ErrorResponse;
    try {
      errorData = await res.json();
    } catch {
      errorData = { detail: "Erro de conexão" };
    }

    const errorMessage = extractErrorMessage(errorData);
    throw new Error(errorMessage);
  }

  return res.json();
}

export async function register(data: {
  nome: string;
  email: string;
  senha: string;
  confirmar_senha: string;
}): Promise<AuthResponse> {
  return apiRequest(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/register`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      credentials: "include",
    }
  );
}

export async function login(data: {
  email: string;
  senha: string;
}): Promise<AuthResponse> {
  return apiRequest(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    credentials: "include",
  });
}

export async function loginWithGoogle(): Promise<void> {
  // Redireciona diretamente para a rota de autenticação Google
  const googleAuthUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/google`;
  window.location.href = googleAuthUrl;
}

export async function registerWithGoogle(): Promise<void> {
  // Para registro com Google, usamos a mesma rota de login
  // O backend irá criar a conta se não existir
  await loginWithGoogle();
}

export async function logout(): Promise<void> {
  const csrf = getCookie("XSRF-TOKEN");
  await apiRequest(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/logout`, {
    method: "POST",
    headers: {
      "x-csrf-token": csrf ?? "",
    },
    credentials: "include",
  });
}

export async function checkAuthStatus(): Promise<{
  authenticated: boolean;
  user?: any;
}> {
  try {
    const response = await apiRequest(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/status`,
      {
        method: "GET",
        credentials: "include",
      }
    );
    return response;
  } catch (error) {
    return { authenticated: false };
  }
}

export async function getCurrentUser(): Promise<any> {
  return apiRequest(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/me`, {
    method: "GET",
    credentials: "include",
  });
}

export async function refreshToken(): Promise<AuthResponse> {
  return apiRequest(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/refresh`,
    {
      method: "POST",
      credentials: "include",
    }
  );
}

export async function forgotPassword(
  email: string
): Promise<{ message: string }> {
  return apiRequest(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/forgot-password`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
      credentials: "include",
    }
  );
}

export async function resetPassword(data: {
  token: string;
  nova_senha: string;
  confirmar_senha: string;
}): Promise<{ message: string }> {
  return apiRequest(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/reset-password`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      credentials: "include",
    }
  );
}

export async function checkEmailAvailability(email: string): Promise<{
  email: string;
  available: boolean;
  message: string;
}> {
  return apiRequest(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/check-email`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
      credentials: "include",
    }
  );
}

export async function validatePassword(password: string): Promise<{
  password_strength: string;
  score: number;
  is_valid: boolean;
  issues: string[];
}> {
  return apiRequest(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/validate-password`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password }),
      credentials: "include",
    }
  );
}

function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()!.split(";").shift() ?? null;
  return null;
}
