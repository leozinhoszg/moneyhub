// Tipos para as respostas da API de usuários
interface UserProfile {
  id: number;
  nome: string;
  sobrenome: string;
  email: string;
  provider: string;
  foto_perfil?: string;
  avatar_url?: string;
  has_password: boolean;
  has_google: boolean;
  can_remove_google: boolean;
  email_verificado: boolean;
  is_verified: boolean;
  data_cadastro: string;
  ultimo_login?: string;
}

interface UpdateProfileData {
  nome?: string;
  sobrenome?: string;
  email?: string;
}

interface ChangePasswordData {
  senha_atual: string;
  nova_senha: string;
  confirmar_nova_senha: string;
}

interface ProfileImageResponse {
  foto_perfil: string;
  avatar_url: string;
  message: string;
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
    if (Array.isArray(error.detail)) {
      return error.detail.join(", ");
    }
  }

  if (error?.name === "TypeError" && error?.message?.includes("fetch")) {
    return "Erro de conexão. Verifique sua internet e tente novamente.";
  }

  if (error?.name === "AbortError") {
    return "Tempo limite excedido. Verifique sua conexão e tente novamente.";
  }

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
        return `Erro ${error.status}: ${error.statusText || "Erro desconhecido"}`;
    }
  }

  return "Erro desconhecido. Tente novamente.";
}

// Função auxiliar para fazer requisições autenticadas
async function authenticatedRequest(url: string, options: RequestInit = {}): Promise<any> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(`${baseUrl}${url}`, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      let errorData: ErrorResponse;
      try {
        errorData = await res.json();
      } catch {
        errorData = {
          detail: res.status === 404
            ? "Recurso não encontrado"
            : res.status >= 500
            ? "Erro interno do servidor"
            : "Erro de conexão",
        };
      }
      
      const error = new Error(extractErrorMessage(errorData.detail));
      (error as any).status = res.status;
      throw error;
    }

    // Se a resposta for 204 (No Content), retornar objeto vazio
    if (res.status === 204) {
      return {};
    }

    return await res.json();
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error('Tempo limite excedido. Verifique sua conexão e tente novamente.');
    }
    throw error;
  }
}

// Função para obter o perfil completo do usuário
export async function getUserProfile(): Promise<UserProfile> {
  try {
    const data = await authenticatedRequest('/api/users/profile-complete');
    return data;
  } catch (error: any) {
    throw new Error(extractErrorMessage(error));
  }
}

// Função para atualizar dados básicos do perfil
export async function updateUserProfile(profileData: UpdateProfileData): Promise<any> {
  try {
    const data = await authenticatedRequest('/api/users/me', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
    return data;
  } catch (error: any) {
    throw new Error(extractErrorMessage(error));
  }
}

// Função para alterar senha
export async function changePassword(passwordData: ChangePasswordData): Promise<any> {
  try {
    const data = await authenticatedRequest('/api/users/change-password', {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    });
    return data;
  } catch (error: any) {
    throw new Error(extractErrorMessage(error));
  }
}

// Função para fazer upload de foto de perfil
export async function uploadProfileImage(file: File): Promise<ProfileImageResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos para upload

    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${baseUrl}/api/users/upload-profile-image`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      let errorData: ErrorResponse;
      try {
        errorData = await res.json();
      } catch {
        errorData = {
          detail: res.status === 404
            ? "Recurso não encontrado"
            : res.status >= 500
            ? "Erro interno do servidor"
            : "Erro de conexão",
        };
      }
      
      const error = new Error(extractErrorMessage(errorData.detail));
      (error as any).status = res.status;
      throw error;
    }

    return await res.json();
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error('Tempo limite excedido para upload. Tente novamente.');
    }
    throw new Error(extractErrorMessage(error));
  }
}

// Função para remover foto de perfil
export async function removeProfileImage(): Promise<any> {
  try {
    const data = await authenticatedRequest('/api/users/profile-image', {
      method: 'DELETE',
    });
    return data;
  } catch (error: any) {
    throw new Error(extractErrorMessage(error));
  }
}

// Função para obter informações básicas do usuário (compatibilidade)
export async function getCurrentUser(): Promise<any> {
  try {
    const data = await authenticatedRequest('/api/users/me');
    return data;
  } catch (error: any) {
    throw new Error(extractErrorMessage(error));
  }
}

// Função para obter informações de segurança da conta
export async function getUserSecurity(): Promise<any> {
  try {
    const data = await authenticatedRequest('/api/users/security');
    return data;
  } catch (error: any) {
    throw new Error(extractErrorMessage(error));
  }
}