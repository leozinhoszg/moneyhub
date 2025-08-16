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

  // Verificar se é um objeto de erro com message
  if (error?.message) return error.message;

  // Verificar se é uma resposta de erro da API
  if (error?.detail) {
    if (typeof error.detail === "string") return error.detail;
    if (error.detail.message) return error.detail.message;
    if (Array.isArray(error.detail)) {
      return error.detail.join(", ");
    }
  }

  // Verificar se é um erro de rede
  if (error?.name === "TypeError" && error?.message?.includes("fetch")) {
    return "Erro de conexão. Verifique sua internet e tente novamente.";
  }

  // Verificar se é um erro de timeout
  if (error?.name === "AbortError") {
    return "Tempo limite excedido. Verifique sua conexão e tente novamente.";
  }

  // Verificar se é um erro de status HTTP
  if (error?.status) {
    switch (error.status) {
      case 400:
        return "Dados inválidos. Verifique as informações fornecidas.";
      case 401:
        return "Não autorizado. Verifique suas credenciais.";
      case 403:
        return "Acesso negado.";
      case 404:
        return "Recurso não encontrado.";
      case 500:
        return "Erro interno do servidor. Tente novamente em alguns instantes.";
      case 502:
      case 503:
      case 504:
        return "Servidor indisponível. Tente novamente em alguns instantes.";
      default:
        return `Erro ${error.status}: ${
          error.statusText || "Erro desconhecido"
        }`;
    }
  }

  return "Erro desconhecido. Tente novamente.";
}

// Função auxiliar para fazer requisições com tratamento de erro
async function apiRequest(url: string, options: RequestInit): Promise<any> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos timeout

    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      let errorData: ErrorResponse;
      try {
        errorData = await res.json();
      } catch {
        // Se não conseguir fazer parse do JSON, criar um erro genérico
        errorData = {
          detail:
            res.status === 404
              ? "Recurso não encontrado"
              : res.status >= 500
              ? "Erro interno do servidor"
              : "Erro de conexão",
        };
      }

      const errorMessage = extractErrorMessage(errorData);
      const error = new Error(errorMessage);
      (error as any).status = res.status;
      (error as any).statusText = res.statusText;
      throw error;
    }

    // Para logout, não precisamos fazer parse de JSON
    if (res.headers.get("content-type")?.includes("application/json")) {
      return res.json();
    }
    return { message: "Logout realizado com sucesso" };
  } catch (error: any) {
    // Se for um erro de abort (timeout)
    if (error.name === "AbortError") {
      throw new Error(
        "Tempo limite excedido. Verifique sua conexão e tente novamente."
      );
    }

    // Se já é um erro tratado, apenas relançar
    if (error.message && error.message !== "Erro desconhecido") {
      throw error;
    }

    // Se for um erro de rede
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      throw new Error(
        "Erro de conexão. Verifique sua internet e tente novamente."
      );
    }

    // Erro genérico
    throw new Error("Erro de conexão. Tente novamente.");
  }
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
  return new Promise((resolve, reject) => {
    const apiBaseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
    const googleAuthUrl = `${apiBaseUrl}/api/auth/google`;

    // Configurações da janela popup
    const popupWidth = 500;
    const popupHeight = 600;
    const left = window.screenX + (window.outerWidth - popupWidth) / 2;
    const top = window.screenY + (window.outerHeight - popupHeight) / 2;

    // Abrir popup
    const popup = window.open(
      googleAuthUrl,
      "googleAuth",
      `width=${popupWidth},height=${popupHeight},left=${left},top=${top},scrollbars=yes,resizable=yes`
    );

    if (!popup) {
      reject(new Error("Popup bloqueado. Permita popups para este site."));
      return;
    }

    // Função para limpar listeners e timeouts
    const cleanup = () => {
      clearInterval(checkClosed);
      clearTimeout(timeout);
      window.removeEventListener("message", messageHandler);
    };

    // Handler para mensagens do popup
    const messageHandler = (event: MessageEvent) => {
      // Validar origem e fonte da mensagem para evitar spoofing
      try {
        const allowedOrigin = window.location.origin;
        // Verifica se a mensagem veio do mesmo origin da aplicação (callback roda no frontend)
        if (event.origin !== allowedOrigin) {
          return; // ignorar mensagens de outras origens
        }
        // Verifica se a mensagem veio da janela/popup que abrimos
        if (event.source !== popup) {
          return; // ignorar mensagens de outras fontes
        }
      } catch {
        // Em caso de qualquer erro de validação, ignorar a mensagem
        return;
      }

      // Verificar estrutura da mensagem
      if (event.data && typeof event.data === "object") {
        if ((event.data as any).type === "AUTH_SUCCESS") {
          cleanup();
          resolve();
        } else if ((event.data as any).type === "AUTH_ERROR") {
          cleanup();
          reject(
            new Error((event.data as any).error || "Erro na autenticação")
          );
        }
      }
    };

    // Adicionar listener para mensagens
    window.addEventListener("message", messageHandler);

    // Verificar se a janela foi fechada
    const checkClosed = setInterval(() => {
      if (popup.closed) {
        cleanup();

        // Se a janela foi fechada sem mensagem de sucesso, verificar status
        checkAuthStatus()
          .then((status) => {
            if (status.authenticated) {
              resolve();
            } else {
              reject(new Error("Autenticação cancelada ou falhou."));
            }
          })
          .catch(() => {
            reject(new Error("Erro ao verificar status da autenticação."));
          });
      }
    }, 1000);

    // Timeout para evitar que a janela fique aberta indefinidamente
    const timeout = setTimeout(() => {
      cleanup();
      if (!popup.closed) {
        popup.close();
      }
      reject(new Error("Tempo limite excedido para autenticação."));
    }, 300000); // 5 minutos

    // Focar na janela popup
    popup.focus();
  });
}

export async function registerWithGoogle(): Promise<void> {
  // Para registro com Google, usamos a mesma rota de login
  // O backend irá criar a conta se não existir
  await loginWithGoogle();
}

export async function logout(): Promise<void> {
  try {
    console.log("Iniciando logout na API...");
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    console.log("API URL:", apiUrl);

    const csrf = getCookie("XSRF-TOKEN");
    console.log("CSRF Token:", csrf ? "Presente" : "Ausente");

    const logoutUrl = `${apiUrl}/api/auth/logout`;
    console.log("Logout URL:", logoutUrl);

    const response = await apiRequest(logoutUrl, {
      method: "POST",
      headers: {
        "x-csrf-token": csrf ?? "",
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    console.log("Logout API response:", response);
    return response;
  } catch (error) {
    console.error("Erro na função logout:", error);
    throw error;
  }
}

export async function logoutWithGoogleRevoke(): Promise<void> {
  const csrf = getCookie("XSRF-TOKEN");

  try {
    // Primeiro fazer logout normal
    await logout();

    // Depois redirecionar para revogar sessão do Google
    window.location.href = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/logout/google`;
  } catch (error) {
    console.error("Erro no logout com revogação Google:", error);
    throw error;
  }
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
): Promise<{ message: string; success: boolean }> {
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
  new_password: string;
  confirm_password: string;
}): Promise<{ message: string; success: boolean }> {
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

// ============================================================================
// EMAIL VERIFICATION FUNCTIONS
// ============================================================================

export async function sendVerificationCode(data: {
  email: string;
  nome: string;
  sobrenome: string;
}): Promise<{
  message: string;
  email: string;
}> {
  return apiRequest(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/send-verification-code`,
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

export async function verifyCodeAndCreateAccount(data: {
  email: string;
  code: string;
  senha: string;
}): Promise<{
  message: string;
  user: any;
}> {
  return apiRequest(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/verify-code`,
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

function getCookie(name: string): string | null {
  try {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      const cookieValue = parts.pop()!.split(";").shift() ?? null;
      console.log(`Cookie ${name}:`, cookieValue ? "Presente" : "Ausente");
      return cookieValue;
    }
    console.log(`Cookie ${name}: Ausente`);
    return null;
  } catch (error) {
    console.error(`Erro ao obter cookie ${name}:`, error);
    return null;
  }
}
