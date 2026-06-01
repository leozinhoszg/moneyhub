"use client";

import React, { FormEvent, useState, useEffect } from "react";
import {
  login,
  loginWithGoogle,
  checkAuthStatus,
  sendVerificationCode,
  verifyCodeAndCreateAccount,
  forgotPassword,
  resetPassword,
} from "@/app/api/auth";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import Logo from "@/components/Logo";
import {
  Eye,
  EyeOff,
  ArrowLeft,
  ArrowUpRight,
  ArrowRight,
  Mail,
  AlertCircle,
  CheckCircle2,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";

const EASE = [0.32, 0.72, 0, 1] as const;

const fontHeading = "var(--font-heading), ui-sans-serif, system-ui";
const fontBody = "var(--font-body), ui-sans-serif, system-ui";
const fontMono = "var(--font-mono), ui-monospace, monospace";

// --- Theme toggle -----------------------------------------------------------

function ThemeToggle({ inverted = false }: { inverted?: boolean }) {
  const { isDark, toggleTheme, mounted } = useTheme();
  if (!mounted) return <span className="h-8 w-8" aria-hidden />;
  const base = inverted
    ? "border-white/15 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white"
    : "border-gray-200/70 bg-white/80 text-[color:var(--color-primary)] hover:bg-white dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:bg-slate-800";
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Ativar tema claro" : "Ativar tema escuro"}
      className={`flex h-8 w-8 items-center justify-center rounded-full border transition-colors ${base}`}
    >
      {isDark ? <Sun size={14} strokeWidth={2.2} /> : <Moon size={14} strokeWidth={2.2} />}
    </button>
  );
}

// --- Field primitives ---------------------------------------------------------

function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 block text-[11px] uppercase tracking-[0.18em] text-gray-500 dark:text-slate-400"
      style={{ fontFamily: fontMono }}
    >
      {children}
    </label>
  );
}

function TextInput({
  id,
  type = "text",
  value,
  onChange,
  placeholder,
  disabled,
  readOnly,
  required,
  maxLength,
  inputMode,
  autoComplete,
  rightSlot,
  centered = false,
}: {
  id: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  maxLength?: number;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  autoComplete?: string;
  rightSlot?: React.ReactNode;
  centered?: boolean;
}) {
  return (
    <div
      className={`group relative flex items-center rounded-2xl border border-gray-200/70 bg-white transition-all duration-300 focus-within:border-[color:var(--color-primary)] focus-within:shadow-[0_0_0_4px_rgba(0,51,102,0.10)] dark:border-slate-700 dark:bg-slate-800/60 dark:focus-within:border-[color:var(--color-secondary)] dark:focus-within:shadow-[0_0_0_4px_rgba(0,204,102,0.18)] ${
        readOnly ? "bg-gray-50 dark:bg-slate-800/40" : ""
      }`}
    >
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        required={required}
        maxLength={maxLength}
        inputMode={inputMode}
        autoComplete={autoComplete}
        className={`w-full bg-transparent px-4 py-3.5 text-[15px] text-[color:var(--color-primary)] placeholder:text-gray-400 focus:outline-none disabled:cursor-not-allowed dark:text-slate-100 dark:placeholder:text-slate-500 ${
          centered ? "text-center tracking-[0.4em]" : ""
        }`}
        style={{ fontFamily: centered ? fontMono : fontBody }}
      />
      {rightSlot && <div className="pr-2">{rightSlot}</div>}
    </div>
  );
}

function PrimaryButton({
  children,
  loading,
  onClick,
  type = "button",
  disabled,
}: {
  children: React.ReactNode;
  loading?: boolean;
  onClick?: () => void;
  type?: "submit" | "button";
  disabled?: boolean;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className="group flex w-full items-center justify-between gap-3 rounded-full bg-[color:var(--color-secondary)] py-3 pl-6 pr-2 text-[14px] font-semibold text-white transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[color:var(--color-secondary-dark)] disabled:opacity-60 active:scale-[0.99]"
      style={{ fontFamily: fontBody }}
    >
      <span>{children}</span>
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:scale-105">
        {loading ? (
          <span className="block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
        ) : (
          <ArrowUpRight size={15} strokeWidth={2.2} />
        )}
      </span>
    </button>
  );
}

function GhostButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[color:var(--color-primary)] transition-colors hover:text-[color:var(--color-primary-dark)] disabled:opacity-50 dark:text-slate-200 dark:hover:text-white"
      style={{ fontFamily: fontBody }}
    >
      {children}
    </button>
  );
}

// --- Step badge --------------------------------------------------------------

function StepBadge({
  current,
  total,
  label,
}: {
  current: number;
  total: number;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span
        className="text-[11px] uppercase tracking-[0.22em] text-gray-500 dark:text-slate-400"
        style={{ fontFamily: fontMono }}
      >
        Passo {current.toString().padStart(2, "0")} / {total.toString().padStart(2, "0")}
      </span>
      <div className="flex gap-1">
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            className={`h-[2px] w-7 rounded-full transition-colors ${
              i < current
                ? "bg-[color:var(--color-primary)] dark:bg-[color:var(--color-secondary)]"
                : "bg-gray-200 dark:bg-slate-700"
            }`}
          />
        ))}
      </div>
      <span
        className="hidden text-[11px] uppercase tracking-[0.22em] text-[color:var(--color-primary)] dark:text-slate-200 sm:inline"
        style={{ fontFamily: fontMono }}
      >
        · {label}
      </span>
    </div>
  );
}

// --- Step wrapper with slide+fade -------------------------------------------

const stepVariants: Variants = {
  enter: { x: 24, opacity: 0, filter: "blur(6px)" },
  center: {
    x: 0,
    opacity: 1,
    filter: "blur(0px)",
    transition: { duration: 0.5, ease: EASE },
  },
  exit: {
    x: -24,
    opacity: 0,
    filter: "blur(6px)",
    transition: { duration: 0.35, ease: EASE },
  },
};

function StepFrame({
  k,
  children,
}: {
  k: string | number;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      key={k}
      variants={stepVariants}
      initial="enter"
      animate="center"
      exit="exit"
      className="space-y-4"
    >
      {children}
    </motion.div>
  );
}

// --- Inline alert -----------------------------------------------------------

function InlineAlert({
  tone = "error",
  children,
}: {
  tone?: "error" | "success";
  children: React.ReactNode;
}) {
  const styles =
    tone === "error"
      ? "border-red-200 bg-red-50 text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200"
      : "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200";
  const Icon = tone === "error" ? AlertCircle : CheckCircle2;
  return (
    <motion.div
      initial={{ y: -6, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: EASE }}
      className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-[13.5px] leading-relaxed ${styles}`}
      style={{ fontFamily: fontBody }}
      role={tone === "error" ? "alert" : "status"}
    >
      <Icon size={16} strokeWidth={2} className="mt-0.5 shrink-0" />
      <div className="flex-1">{children}</div>
    </motion.div>
  );
}

// --- Main page --------------------------------------------------------------

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Login flow states: 1: email-only, 2: password + forgot, 3: password-reset, 4: reset-success
  const [loginStep, setLoginStep] = useState(1);
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");

  // Multi-step registration states
  const [registrationStep, setRegistrationStep] = useState(1);
  const [verificationCode, setVerificationCode] = useState("");

  // Password reset states
  const [resetToken, setResetToken] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const router = useRouter();
  // Mesmo AuthContext consumido pelo layout (finance): após autenticar
  // precisamos atualizar o estado do context ANTES de navegar, senão o guard
  // do dashboard vê isAuthenticated=false e redireciona de volta (loop/piscar).
  const { refreshUser } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Verificar se já está logado
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const status = await checkAuthStatus();
        if (status.authenticated) {
          router.push("/dashboard");
        }
      } catch {
        // Usuário não está logado, continuar na página
      }
    };
    checkAuth();
  }, [router]);

  // Verificar erros da URL (Google OAuth)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const errorParam = urlParams.get("error");

      if (errorParam) {
        let errorMessage = "Erro desconhecido";

        switch (errorParam) {
          case "oauth_error":
            errorMessage = "Erro na autenticação com Google. Tente novamente.";
            break;
          case "missing_params":
            errorMessage =
              "Parâmetros de autenticação ausentes. Tente novamente.";
            break;
          case "user_creation_error":
            errorMessage = "Erro ao criar conta. Tente novamente.";
            break;
          case "inactive_user":
            errorMessage = "Conta desativada. Entre em contato com o suporte.";
            break;
          case "server_error":
            errorMessage =
              "Erro interno do servidor. Tente novamente em alguns instantes.";
            break;
          default:
            errorMessage = "Erro durante a autenticação. Tente novamente.";
        }

        setError(errorMessage);

        const newUrl = window.location.pathname;
        window.history.replaceState({}, "", newUrl);
      }
    }
  }, []);

  // --- Handlers (preserved verbatim) ---------------------------------------

  const handleEmailSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!email.trim()) {
      setError("E-mail é obrigatório");
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Formato de e-mail inválido");
      setLoading(false);
      return;
    }

    try {
      setLoginStep(2);
    } catch {
      setError("Erro ao validar email");
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!senha.trim()) {
      setError("Senha é obrigatória");
      setLoading(false);
      return;
    }

    try {
      const response = await login({
        email: email.trim().toLowerCase(),
        senha,
      });
      console.log("Login realizado com sucesso:", response.user);
      await refreshUser();
      router.push("/dashboard");
    } catch (e: any) {
      let errorMessage = "Falha no login. Verifique suas credenciais.";

      if (e?.message) {
        const message = e.message.toLowerCase();
        if (message.includes("email ou senha incorretos")) {
          errorMessage =
            "E-mail ou senha incorretos. Verifique suas credenciais.";
        } else if (message.includes("email já está cadastrado")) {
          errorMessage = "Este e-mail já está cadastrado. Tente fazer login.";
        } else if (message.includes("conta desativada")) {
          errorMessage = "Conta desativada. Entre em contato com o suporte.";
        } else if (message.includes("não autenticado")) {
          errorMessage = "Sessão expirada. Faça login novamente.";
        } else if (message.includes("erro de conexão")) {
          errorMessage =
            "Erro de conexão. Verifique sua internet e tente novamente.";
        } else if (message.includes("erro interno")) {
          errorMessage =
            "Erro interno do servidor. Tente novamente em alguns instantes.";
        } else if (
          message.includes("timeout") ||
          message.includes("time out")
        ) {
          errorMessage =
            "Tempo limite excedido. Verifique sua conexão e tente novamente.";
        } else if (message.includes("network") || message.includes("fetch")) {
          errorMessage = "Erro de rede. Verifique sua conexão com a internet.";
        } else {
          errorMessage = e.message;
        }
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordClick = () => {
    setError(null);
    setSuccessMessage("");
    setLoginStep(3);
  };

  const handlePasswordResetSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!email.trim()) {
      setError("E-mail é obrigatório");
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Formato de e-mail inválido");
      setLoading(false);
      return;
    }

    try {
      const response = await forgotPassword(email.trim().toLowerCase());
      setSuccessMessage(response.message);
      setLoginStep(4);
    } catch (e: any) {
      setError(e.message || "Erro ao enviar email de recuperação");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!senha.trim() || !confirmPassword.trim()) {
      setError("Todos os campos são obrigatórios");
      setLoading(false);
      return;
    }

    if (senha !== confirmPassword) {
      setError("As senhas não coincidem");
      setLoading(false);
      return;
    }

    if (senha.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      setLoading(false);
      return;
    }

    try {
      const response = await resetPassword({
        token: resetToken,
        new_password: senha,
        confirm_password: confirmPassword,
      });

      setSuccessMessage(response.message);
      setLoginStep(1);
      setSenha("");
      setConfirmPassword("");
      setResetToken("");
    } catch (e: any) {
      setError(e.message || "Erro ao redefinir senha");
    } finally {
      setLoading(false);
    }
  };
  void handlePasswordReset;

  const handleBasicInfo = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!name.trim()) {
      setError("Nome é obrigatório");
      setLoading(false);
      return;
    }

    if (!surname.trim()) {
      setError("Sobrenome é obrigatório");
      setLoading(false);
      return;
    }

    if (!email.trim()) {
      setError("E-mail é obrigatório");
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Formato de e-mail inválido");
      setLoading(false);
      return;
    }

    try {
      const response = await sendVerificationCode({
        email: email.trim().toLowerCase(),
        nome: name.trim(),
        sobrenome: surname.trim(),
      });
      console.log("Código de verificação enviado:", response.message);
      setRegistrationStep(2);
    } catch (e: any) {
      let errorMessage =
        "Erro ao enviar código de verificação. Tente novamente.";

      if (e?.message) {
        const message = e.message.toLowerCase();
        if (message.includes("email já está cadastrado")) {
          errorMessage = "Este e-mail já está cadastrado. Tente fazer login.";
        } else if (message.includes("erro ao enviar email")) {
          errorMessage =
            "Erro ao enviar email de verificação. Verifique seu email e tente novamente.";
        } else if (message.includes("erro interno")) {
          errorMessage =
            "Erro interno do servidor. Tente novamente em alguns instantes.";
        }
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordStep = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!senha.trim()) {
      setError("Senha é obrigatória");
      setLoading(false);
      return;
    }

    if (senha.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      setLoading(false);
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (!passwordRegex.test(senha)) {
      setError(
        "A senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número"
      );
      setLoading(false);
      return;
    }

    try {
      setRegistrationStep(3);
    } catch {
      setError("Erro ao validar senha. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!verificationCode.trim()) {
      setError("Código de verificação é obrigatório");
      setLoading(false);
      return;
    }

    if (verificationCode.length !== 6) {
      setError("Código deve ter 6 dígitos");
      setLoading(false);
      return;
    }

    try {
      const response = await verifyCodeAndCreateAccount({
        email: email.trim().toLowerCase(),
        code: verificationCode.trim(),
        senha: senha,
      });
      console.log("Registro realizado com sucesso:", response.message);
      console.log("Usuário:", response.user);
      await refreshUser();
      router.push("/dashboard");
    } catch (e: any) {
      let errorMessage = "Código de verificação inválido. Tente novamente.";

      if (e?.message) {
        const message = e.message.toLowerCase();
        if (message.includes("código de verificação inválido")) {
          errorMessage = "Código de verificação inválido.";
        } else if (message.includes("código de verificação expirado")) {
          errorMessage =
            "Código de verificação expirado. Solicite um novo código.";
        } else if (message.includes("email já está cadastrado")) {
          errorMessage = "Este e-mail já está cadastrado. Tente fazer login.";
        } else if (message.includes("senha não atende aos critérios")) {
          errorMessage = "A senha não atende aos critérios de segurança.";
        } else if (message.includes("erro de conexão")) {
          errorMessage =
            "Erro de conexão. Verifique sua internet e tente novamente.";
        } else if (message.includes("erro interno")) {
          errorMessage =
            "Erro interno do servidor. Tente novamente em alguns instantes.";
        } else {
          errorMessage = e.message;
        }
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError(null);
    try {
      await loginWithGoogle();
      await refreshUser();
      router.push("/dashboard");
    } catch (e: any) {
      let errorMessage = "Falha no login com Google. Tente novamente.";

      if (e?.message) {
        const message = e.message.toLowerCase();
        if (message.includes("popup bloqueado")) {
          errorMessage =
            "Popup bloqueado. Permita popups para este site e tente novamente.";
        } else if (message.includes("autenticação cancelada")) {
          errorMessage = "Autenticação cancelada. Tente novamente.";
        } else if (message.includes("tempo limite")) {
          errorMessage = "Tempo limite excedido. Tente novamente.";
        } else if (message.includes("oauth_error")) {
          errorMessage = "Erro na autenticação com Google. Tente novamente.";
        } else if (message.includes("missing_params")) {
          errorMessage =
            "Parâmetros de autenticação ausentes. Tente novamente.";
        } else if (message.includes("user_creation_error")) {
          errorMessage = "Erro ao criar conta. Tente novamente.";
        } else if (message.includes("inactive_user")) {
          errorMessage = "Conta desativada. Entre em contato com o suporte.";
        } else if (message.includes("server_error")) {
          errorMessage =
            "Erro interno do servidor. Tente novamente em alguns instantes.";
        } else if (message.includes("erro de conexão")) {
          errorMessage =
            "Erro de conexão. Verifique sua internet e tente novamente.";
        } else if (
          message.includes("timeout") ||
          message.includes("time out")
        ) {
          errorMessage =
            "Tempo limite excedido. Verifique sua conexão e tente novamente.";
        } else if (message.includes("network") || message.includes("fetch")) {
          errorMessage = "Erro de rede. Verifique sua conexão com a internet.";
        } else {
          errorMessage = e.message;
        }
      }

      setError(errorMessage);
    } finally {
      setGoogleLoading(false);
    }
  };

  const goBackStep = () => {
    setError(null);
    setSuccessMessage("");
    if (isRegister) {
      if (registrationStep > 1) setRegistrationStep(registrationStep - 1);
    } else {
      if (loginStep > 1) setLoginStep(loginStep - 1);
    }
  };

  const toggleCard = () => {
    setIsRegister(!isRegister);
    setError(null);
    setRegistrationStep(1);
    setLoginStep(1);
    setSuccessMessage("");
    if (!isRegister) {
      setEmail("");
      setSenha("");
      setConfirmPassword("");
      setName("");
      setSurname("");
      setVerificationCode("");
    }
  };

  const clearErrorOnInput = () => {
    if (error) setError(null);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    clearErrorOnInput();
  };
  const handleSenhaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSenha(e.target.value);
    clearErrorOnInput();
  };
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    clearErrorOnInput();
  };
  const handleSurnameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSurname(e.target.value);
    clearErrorOnInput();
  };
  const handleVerificationCodeChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setVerificationCode(e.target.value.replace(/\D/g, ""));
    clearErrorOnInput();
  };

  void confirmPassword;
  void setConfirmPassword;
  void setResetToken;

  // --- UI helpers ----------------------------------------------------------

  const currentStep = isRegister ? registrationStep : loginStep;

  const stepLabel = isRegister
    ? registrationStep === 1
      ? "Sobre você"
      : registrationStep === 2
      ? "Senha"
      : "Verificação"
    : loginStep === 1
    ? "E-mail"
    : loginStep === 2
    ? "Senha"
    : loginStep === 3
    ? "Recuperação"
    : "Concluído";

  const onSubmit = (e: FormEvent) => {
    if (isRegister) {
      if (registrationStep === 1) return handleBasicInfo(e);
      if (registrationStep === 2) return handlePasswordStep(e);
      return handleVerification(e);
    }
    if (loginStep === 1) return handleEmailSubmit(e);
    if (loginStep === 2) return handleLoginSubmit(e);
    if (loginStep === 3) return handlePasswordResetSubmit(e);
    e.preventDefault();
  };

  const formTitle = isRegister
    ? registrationStep === 3
      ? "Verifique seu e-mail."
      : "Crie sua conta."
    : loginStep === 3
    ? "Recuperar acesso."
    : loginStep === 4
    ? "Quase lá."
    : "Bem-vindo de volta.";

  const formSubtitle = isRegister
    ? registrationStep === 1
      ? "Vamos começar com o básico."
      : registrationStep === 2
      ? "Escolha uma senha que só você sabe."
      : `Enviamos um código para ${email}.`
    : loginStep === 3
    ? "Informe o e-mail cadastrado para receber as instruções."
    : loginStep === 4
    ? "Confira sua caixa de entrada."
    : "Entre para continuar de onde parou.";

  // --- Render --------------------------------------------------------------

  return (
    <div
      className="relative grid min-h-[100dvh] w-full max-w-full grid-cols-1 overflow-x-hidden bg-gray-50 text-[color:var(--color-primary)] selection:bg-[color:var(--color-primary)] selection:text-white dark:bg-slate-950 dark:text-slate-100 lg:grid-cols-2"
      style={{ fontFamily: fontBody }}
    >
      <a
        href="#form"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-[color:var(--color-primary)] focus:px-4 focus:py-2 focus:text-white"
      >
        Ir para o formulário
      </a>

      {/* Mobile compact header */}
      <header className="flex items-center justify-between border-b border-gray-200/70 bg-white/80 px-5 py-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80 lg:hidden">
        <Logo size="md" href="/" />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <a
            href="/"
            className="inline-flex items-center gap-1.5 text-[12px] text-gray-600 hover:text-[color:var(--color-primary)] dark:text-slate-300 dark:hover:text-slate-100"
          >
            <ArrowLeft size={13} strokeWidth={2} />
            Voltar
          </a>
        </div>
      </header>

      {/* === Brand panel (desktop only) === */}
      <aside className="relative hidden overflow-hidden bg-[color:var(--color-primary)] text-white dark:bg-[color:var(--color-primary-dark)] lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
        {/* Background banner */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <Image
            src="/BANNER_02.png"
            alt=""
            fill
            priority
            quality={95}
            sizes="(min-width: 1536px) 1100px, (min-width: 1024px) 60vw, 0px"
            className="object-cover opacity-90 dark:hidden"
          />
          <Image
            src="/banner_01.png"
            alt=""
            fill
            priority
            quality={95}
            sizes="(min-width: 1536px) 1100px, (min-width: 1024px) 60vw, 0px"
            className="hidden object-cover opacity-60 dark:block"
          />
        </div>

        {/* Ambient mesh */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 -right-20 h-[480px] w-[480px] rounded-full bg-[radial-gradient(circle_at_center,rgba(0,204,102,0.30),transparent_62%)] blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.05] mix-blend-overlay"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' /%3E%3C/svg%3E\")",
            }}
          />
        </div>

        {/* Bottom dark gradient */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[color:var(--color-primary-dark)] via-[color:var(--color-primary-dark)]/70 via-25% to-transparent"
        />

        {/* Top: logo + back link + theme */}
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: mounted ? 1 : 0 }}
          transition={{ duration: 0.7, ease: EASE }}
          className="relative z-10 flex items-center justify-between"
        >
          <Logo size="md" href="/" inverted />

          <div className="flex items-center gap-2">
            <ThemeToggle inverted />
            <a
              href="/"
              className="group inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-[12px] text-white/80 backdrop-blur-md transition-colors hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft
                size={12}
                strokeWidth={2.2}
                className="transition-transform duration-500 group-hover:-translate-x-0.5"
              />
              Voltar ao site
            </a>
          </div>
        </motion.div>

        {/* Middle: editorial pull quote */}
        <motion.div
          initial={{ y: 20, opacity: 0, filter: "blur(10px)" }}
          animate={{
            y: mounted ? 0 : 20,
            opacity: mounted ? 1 : 0,
            filter: mounted ? "blur(0px)" : "blur(10px)",
          }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.2 }}
          className="relative z-10 max-w-md"
        >
          <p
            className="text-[11px] uppercase tracking-[0.22em] text-white/50"
            style={{ fontFamily: fontMono }}
          >
            — Plataforma · MoneyHub v2
          </p>
          <h2
            className="mt-6 text-[clamp(2.2rem,4.2vw,3.4rem)] font-bold leading-[1.02] tracking-[-0.025em]"
            style={{ fontFamily: fontHeading, textWrap: "balance" }}
          >
            Suas finanças,{" "}
            <span className="text-[color:var(--color-secondary-light)]">
              finalmente
            </span>{" "}
            no lugar certo.
          </h2>
          <p
            className="mt-6 max-w-[40ch] text-[15px] leading-relaxed text-white/70"
            style={{ fontFamily: fontBody }}
          >
            Extração por IA, categorização contextual e segurança de nível
            bancário — em uma única plataforma.
          </p>
        </motion.div>

        <div aria-hidden className="h-[88px]" />
      </aside>

      {/* === Form panel === */}
      <main
        id="form"
        className="relative flex items-center justify-center px-5 py-10 sm:px-8 sm:py-14 lg:px-6 lg:py-16 xl:px-8"
      >
        {/* Desktop theme toggle (top-right) */}
        <div className="absolute right-4 top-4 z-20 hidden lg:block">
          <ThemeToggle />
        </div>

        {/* Subtle ambient */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-0 overflow-hidden"
        >
          <div className="absolute -top-32 right-[-10%] h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle_at_center,rgba(0,204,102,0.10),transparent_62%)] blur-3xl" />
        </div>

        <motion.div
          initial={{ y: 24, opacity: 0, filter: "blur(10px)" }}
          animate={{
            y: mounted ? 0 : 24,
            opacity: mounted ? 1 : 0,
            filter: mounted ? "blur(0px)" : "blur(10px)",
          }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.1 }}
          className="relative z-10 w-full max-w-md"
        >
          {/* Step badge */}
          {(isRegister || loginStep === 1 || loginStep === 2) && (
            <StepBadge
              current={Math.min(currentStep, isRegister ? 3 : 2)}
              total={isRegister ? 3 : 2}
              label={stepLabel}
            />
          )}

          {/* Title crossfade */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`${isRegister ? "register" : "login"}-${currentStep}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.45, ease: EASE }}
              className="mt-6"
            >
              <h1
                className="text-[clamp(1.9rem,3.5vw,2.6rem)] font-bold leading-[1.05] tracking-[-0.025em] text-[color:var(--color-primary)] dark:text-slate-100"
                style={{ fontFamily: fontHeading, textWrap: "balance" }}
              >
                {formTitle.includes("Verifique") ? (
                  <>
                    Verifique seu{" "}
                    <span className="text-[color:var(--color-secondary)]">
                      e-mail
                    </span>
                    .
                  </>
                ) : formTitle.includes("Bem-vindo") ? (
                  <>
                    Bem-vindo{" "}
                    <span className="text-[color:var(--color-secondary)]">
                      de volta
                    </span>
                    .
                  </>
                ) : formTitle.includes("Crie") ? (
                  <>
                    Crie sua{" "}
                    <span className="text-[color:var(--color-secondary)]">
                      conta
                    </span>
                    .
                  </>
                ) : formTitle.includes("Recuperar") ? (
                  <>
                    Recuperar{" "}
                    <span className="text-[color:var(--color-secondary)]">
                      acesso
                    </span>
                    .
                  </>
                ) : (
                  formTitle
                )}
              </h1>
              <p
                className="mt-3 text-[14.5px] leading-relaxed text-gray-600 dark:text-slate-400"
                style={{ fontFamily: fontBody, textWrap: "pretty" }}
              >
                {formSubtitle}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Double-Bezel form card */}
          <div className="mt-8 rounded-[2.25rem] border border-white/40 bg-gradient-to-b from-white/70 to-white/40 p-1.5 shadow-[0_24px_60px_-28px_rgba(0,51,102,0.20)] ring-1 ring-inset ring-white/40 backdrop-blur-2xl backdrop-saturate-150 dark:border-white/[0.08] dark:from-slate-900/60 dark:to-slate-950/40 dark:ring-white/[0.06] dark:shadow-[0_24px_60px_-28px_rgba(0,0,0,0.6)]">
            <div className="rounded-[calc(2.25rem-0.375rem)] bg-white/55 p-6 backdrop-blur-xl dark:bg-slate-900/45 sm:p-8">
              <form onSubmit={onSubmit} className="space-y-4" noValidate>
                <AnimatePresence mode="wait">
                  {/* ============ LOGIN MODE ============ */}
                  {!isRegister && (
                    <StepFrame k={`login-${loginStep}`}>
                      {loginStep !== 4 && (
                        <div>
                          <FieldLabel htmlFor="email">E-mail</FieldLabel>
                          <TextInput
                            id="email"
                            type="email"
                            value={email}
                            onChange={handleEmailChange}
                            placeholder="voce@email.com"
                            required
                            readOnly={loginStep === 2}
                            disabled={loading || googleLoading}
                            autoComplete="email"
                            rightSlot={
                              loginStep === 2 ? (
                                <button
                                  type="button"
                                  onClick={goBackStep}
                                  className="flex h-8 w-8 items-center justify-center rounded-full text-[color:var(--color-primary)] transition-colors hover:bg-gray-100 dark:text-slate-200 dark:hover:bg-slate-800"
                                  aria-label="Alterar e-mail"
                                >
                                  <ArrowLeft size={14} strokeWidth={2.2} />
                                </button>
                              ) : null
                            }
                          />
                        </div>
                      )}

                      {loginStep === 2 && (
                        <div>
                          <FieldLabel htmlFor="senha">Senha</FieldLabel>
                          <TextInput
                            id="senha"
                            type={showPassword ? "text" : "password"}
                            value={senha}
                            onChange={handleSenhaChange}
                            placeholder="••••••••"
                            required
                            disabled={loading || googleLoading}
                            autoComplete="current-password"
                            rightSlot={
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-[color:var(--color-primary)] dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                                aria-label={
                                  showPassword ? "Ocultar senha" : "Mostrar senha"
                                }
                              >
                                {showPassword ? (
                                  <EyeOff size={15} strokeWidth={2} />
                                ) : (
                                  <Eye size={15} strokeWidth={2} />
                                )}
                              </button>
                            }
                          />
                          <div className="mt-2 flex justify-end">
                            <GhostButton
                              onClick={handleForgotPasswordClick}
                              disabled={loading}
                            >
                              Esqueceu sua senha?
                            </GhostButton>
                          </div>
                        </div>
                      )}

                      {loginStep === 4 && successMessage && (
                        <div className="flex flex-col items-center text-center">
                          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/40">
                            <Mail
                              size={22}
                              strokeWidth={1.8}
                              className="text-emerald-700 dark:text-emerald-300"
                            />
                          </div>
                          <p
                            className="mt-5 text-[15px] leading-relaxed text-gray-600 dark:text-slate-300"
                            style={{ fontFamily: fontBody }}
                          >
                            {successMessage}
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setLoginStep(1);
                              setSuccessMessage("");
                            }}
                            className="mt-6 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[color:var(--color-primary)] hover:text-[color:var(--color-primary-dark)] dark:text-slate-200 dark:hover:text-white"
                            style={{ fontFamily: fontBody }}
                          >
                            <ArrowLeft size={13} strokeWidth={2.2} />
                            Voltar ao login
                          </button>
                        </div>
                      )}
                    </StepFrame>
                  )}

                  {/* ============ REGISTER MODE ============ */}
                  {isRegister && (
                    <StepFrame k={`register-${registrationStep}`}>
                      {registrationStep === 1 && (
                        <>
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                              <FieldLabel htmlFor="name">Nome</FieldLabel>
                              <TextInput
                                id="name"
                                value={name}
                                onChange={handleNameChange}
                                placeholder="Mariana"
                                required
                                disabled={loading || googleLoading}
                                autoComplete="given-name"
                              />
                            </div>
                            <div>
                              <FieldLabel htmlFor="surname">
                                Sobrenome
                              </FieldLabel>
                              <TextInput
                                id="surname"
                                value={surname}
                                onChange={handleSurnameChange}
                                placeholder="Castro"
                                required
                                disabled={loading || googleLoading}
                                autoComplete="family-name"
                              />
                            </div>
                          </div>
                          <div>
                            <FieldLabel htmlFor="email-register">
                              E-mail
                            </FieldLabel>
                            <TextInput
                              id="email-register"
                              type="email"
                              value={email}
                              onChange={handleEmailChange}
                              placeholder="voce@email.com"
                              required
                              disabled={loading || googleLoading}
                              autoComplete="email"
                            />
                          </div>
                        </>
                      )}

                      {registrationStep === 2 && (
                        <>
                          <div>
                            <FieldLabel htmlFor="email-register-readonly">
                              E-mail
                            </FieldLabel>
                            <TextInput
                              id="email-register-readonly"
                              type="email"
                              value={email}
                              onChange={() => {}}
                              readOnly
                              rightSlot={
                                <button
                                  type="button"
                                  onClick={goBackStep}
                                  className="flex h-8 w-8 items-center justify-center rounded-full text-[color:var(--color-primary)] transition-colors hover:bg-gray-100 dark:text-slate-200 dark:hover:bg-slate-800"
                                  aria-label="Alterar e-mail"
                                >
                                  <ArrowLeft size={14} strokeWidth={2.2} />
                                </button>
                              }
                            />
                          </div>
                          <div>
                            <FieldLabel htmlFor="senha-register">
                              Senha
                            </FieldLabel>
                            <TextInput
                              id="senha-register"
                              type={showPassword ? "text" : "password"}
                              value={senha}
                              onChange={handleSenhaChange}
                              placeholder="Mínimo 6 caracteres"
                              required
                              disabled={loading || googleLoading}
                              autoComplete="new-password"
                              rightSlot={
                                <button
                                  type="button"
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-[color:var(--color-primary)] dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                                  aria-label={
                                    showPassword
                                      ? "Ocultar senha"
                                      : "Mostrar senha"
                                  }
                                >
                                  {showPassword ? (
                                    <EyeOff size={15} strokeWidth={2} />
                                  ) : (
                                    <Eye size={15} strokeWidth={2} />
                                  )}
                                </button>
                              }
                            />
                            <p
                              className="mt-2 text-[12px] text-gray-500 dark:text-slate-400"
                              style={{ fontFamily: fontBody }}
                            >
                              Pelo menos 6 caracteres, uma maiúscula, uma
                              minúscula e um número.
                            </p>
                          </div>
                        </>
                      )}

                      {registrationStep === 3 && (
                        <>
                          <div className="flex items-start gap-3 rounded-2xl border border-gray-200/70 bg-gray-50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[color:var(--color-primary)] text-white">
                              <Mail size={16} strokeWidth={1.8} />
                            </span>
                            <div className="flex-1">
                              <p
                                className="text-[10px] uppercase tracking-[0.18em] text-gray-500 dark:text-slate-400"
                                style={{ fontFamily: fontMono }}
                              >
                                Código enviado para
                              </p>
                              <p
                                className="mt-0.5 text-[14px] font-semibold text-[color:var(--color-primary)] dark:text-slate-100"
                                style={{ fontFamily: fontBody }}
                              >
                                {email}
                              </p>
                            </div>
                          </div>

                          <div>
                            <FieldLabel htmlFor="verification-code">
                              Código de verificação
                            </FieldLabel>
                            <TextInput
                              id="verification-code"
                              value={verificationCode}
                              onChange={handleVerificationCodeChange}
                              placeholder="000000"
                              required
                              maxLength={6}
                              inputMode="numeric"
                              disabled={loading || googleLoading}
                              autoComplete="one-time-code"
                              centered
                            />
                            <p
                              className="mt-2 text-center text-[12px] text-gray-500 dark:text-slate-400"
                              style={{ fontFamily: fontBody }}
                            >
                              Digite os 6 dígitos enviados para o seu e-mail.
                            </p>
                          </div>
                        </>
                      )}
                    </StepFrame>
                  )}
                </AnimatePresence>

                {/* Alerts */}
                <AnimatePresence mode="wait">
                  {error && (
                    <InlineAlert key="err" tone="error">
                      {error}
                    </InlineAlert>
                  )}
                </AnimatePresence>

                {/* Action row */}
                {loginStep !== 4 && (
                  <div className="space-y-3 pt-2">
                    <PrimaryButton
                      type="submit"
                      loading={loading}
                      disabled={googleLoading}
                    >
                      {loading
                        ? isRegister
                          ? registrationStep === 1
                            ? "Enviando código"
                            : registrationStep === 2
                            ? "Validando"
                            : "Criando conta"
                          : loginStep === 1
                          ? "Validando"
                          : loginStep === 2
                          ? "Entrando"
                          : "Enviando"
                        : isRegister
                        ? registrationStep === 3
                          ? "Criar conta"
                          : "Continuar"
                        : loginStep === 3
                        ? "Iniciar recuperação"
                        : loginStep === 2
                        ? "Entrar"
                        : "Continuar"}
                    </PrimaryButton>

                    {((isRegister && registrationStep > 1) ||
                      (!isRegister && loginStep === 3)) && (
                      <button
                        type="button"
                        onClick={goBackStep}
                        disabled={loading || googleLoading}
                        className="inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-gray-200/70 bg-white py-3 text-[13.5px] font-semibold text-[color:var(--color-primary)] transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100 dark:hover:bg-slate-800"
                        style={{ fontFamily: fontBody }}
                      >
                        <ArrowLeft size={13} strokeWidth={2.2} />
                        Voltar
                      </button>
                    )}
                  </div>
                )}
              </form>

              {/* Divider + Google */}
              {!isRegister && (loginStep === 1 || loginStep === 2) && (
                <>
                  <div className="my-6 flex items-center gap-3">
                    <span className="h-px flex-1 bg-gray-200 dark:bg-slate-700" />
                    <span
                      className="text-[10px] uppercase tracking-[0.22em] text-gray-500 dark:text-slate-400"
                      style={{ fontFamily: fontMono }}
                    >
                      ou
                    </span>
                    <span className="h-px flex-1 bg-gray-200 dark:bg-slate-700" />
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={googleLoading || loading}
                    className="group flex w-full items-center justify-center gap-3 rounded-full border border-gray-200/70 bg-white py-3 text-[14px] font-semibold text-[color:var(--color-primary)] transition-all duration-300 hover:bg-gray-50 hover:shadow-[0_8px_30px_-15px_rgba(0,51,102,0.20)] disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100 dark:hover:bg-slate-800"
                    style={{ fontFamily: fontBody }}
                  >
                    <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" aria-hidden>
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    {googleLoading ? "Conectando" : "Continuar com Google"}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Mode toggle */}
          <div className="mt-7 flex items-center justify-center gap-1.5 text-[13.5px]">
            <span className="text-gray-600 dark:text-slate-400" style={{ fontFamily: fontBody }}>
              {isRegister ? "Já tem uma conta?" : "Ainda não tem conta?"}
            </span>
            <button
              type="button"
              onClick={toggleCard}
              className="group inline-flex items-center gap-1 font-semibold text-[color:var(--color-primary)] underline decoration-[color:var(--color-secondary)] decoration-2 underline-offset-4 transition-colors hover:text-[color:var(--color-primary-dark)] dark:text-slate-100 dark:hover:text-white"
              style={{ fontFamily: fontBody }}
            >
              {isRegister ? "Fazer login" : "Criar conta"}
              <ArrowRight
                size={13}
                strokeWidth={2.2}
                className="transition-transform duration-500 group-hover:translate-x-0.5"
              />
            </button>
          </div>

          {/* Trust line — sem ícones, só texto editorial */}
          <div className="mt-10 flex items-center justify-center gap-4 border-t border-gray-200/70 pt-6 text-[11px] text-gray-500 dark:border-slate-800 dark:text-slate-400">
            <span
              className="uppercase tracking-[0.18em]"
              style={{ fontFamily: fontMono }}
            >
              Criptografia bcrypt
            </span>
            <span className="h-3 w-px bg-gray-300 dark:bg-slate-700" />
            <span
              className="uppercase tracking-[0.18em]"
              style={{ fontFamily: fontMono }}
            >
              JWT HTTPOnly
            </span>
          </div>

          <p
            className="mt-6 text-center text-[11px] text-gray-400 dark:text-slate-500"
            style={{ fontFamily: fontBody }}
          >
            © 2026 MoneyHub · ao continuar, você concorda com nossos{" "}
            <a href="/terms" className="text-gray-600 hover:text-[color:var(--color-primary)] dark:text-slate-400 dark:hover:text-slate-200">
              Termos
            </a>{" "}
            e{" "}
            <a href="/privacy" className="text-gray-600 hover:text-[color:var(--color-primary)] dark:text-slate-400 dark:hover:text-slate-200">
              Privacidade
            </a>
            .
          </p>
        </motion.div>
      </main>
    </div>
  );
}
