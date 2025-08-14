export async function register(data: {
  nome: string;
  email: string;
  senha: string;
}) {
  const res = await fetch(
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
  if (!res.ok) throw new Error("Registro falhou");
  return res.json();
}

export async function login(data: { email: string; senha: string }) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      credentials: "include",
    }
  );
  if (!res.ok) throw new Error("Login falhou");
  return res.json();
}

export async function logout() {
  const csrf = getCookie("XSRF-TOKEN");
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/logout`,
    {
      method: "POST",
      headers: {
        "x-csrf-token": csrf ?? "",
      },
      credentials: "include",
    }
  );
  if (!res.ok) throw new Error("Logout falhou");
  return res.json();
}

function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()!.split(";").shift() ?? null;
  return null;
}
