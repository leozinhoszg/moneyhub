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
  LockKeyhole,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

const EASE = [0.32, 0.72, 0, 1] as const;

const fontSans = "var(--font-sans), ui-sans-serif, system-ui";
const fontMono = "var(--font-mono), ui-monospace, monospace";

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
      className="mb-1.5 block text-[11px] uppercase tracking-[0.18em] text-[#8B95A1]"
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
      className={`group relative flex items-center rounded-2xl border border-black/[0.08] bg-white transition-all duration-300 focus-within:border-[#013a56] focus-within:shadow-[0_0_0_4px_rgba(1,58,86,0.08)] ${
        readOnly ? "bg-[#F5F7F8]" : ""
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
        className={`w-full bg-transparent px-4 py-3.5 text-[15px] text-[#013a56] placeholder:text-[#A0AAB6] focus:outline-none disabled:cursor-not-allowed ${
          centered ? "text-center tracking-[0.4em]" : ""
        }`}
        style={{ fontFamily: centered ? fontMono : fontSans }}
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
      className="group flex w-full items-center justify-between gap-3 rounded-full bg-[#013a56] py-3 pl-6 pr-2 text-[14px] font-medium text-white transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#012438] disabled:opacity-60 active:scale-[0.99]"
      style={{ fontFamily: fontSans }}
    >
      <span>{children}</span>
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/12 transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:scale-105">
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
      className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#013a56] transition-colors hover:text-[#012438] disabled:opacity-50"
      style={{ fontFamily: fontSans }}
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
        className="text-[11px] uppercase tracking-[0.22em] text-[#8B95A1]"
        style={{ fontFamily: fontMono }}
      >
        Passo {current.toString().padStart(2, "0")} / {total.toString().padStart(2, "0")}
      </span>
      <div className="flex gap-1">
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            className={`h-[2px] w-7 rounded-full transition-colors ${
              i < current ? "bg-[#013a56]" : "bg-black/[0.08]"
            }`}
          />
        ))}
      </div>
      <span className="hidden text-[11px] uppercase tracking-[0.22em] text-[#013a56] sm:inline" style={{ fontFamily: fontMono }}>
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
      ? "border-[#F0B5AC] bg-[#FCEFEC] text-[#9B2E1F]"
      : "border-[#A8D9BD] bg-[#E8F8F0] text-[#0A5A33]";
  const Icon = tone === "error" ? AlertCircle : CheckCircle2;
  return (
    <motion.div
      initial={{ y: -6, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: EASE }}
      className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-[13.5px] leading-relaxed ${styles}`}
      style={{ fontFamily: fontSans }}
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
  // Reference handlePasswordReset to satisfy TS unused warning while preserving
  // the function for future URL-token reset flow.
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

  // Unused but referenced: confirm password handler kept for password reset flow
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
      className="relative grid min-h-[100dvh] w-full max-w-full grid-cols-1 overflow-x-hidden bg-[#F7F8FA] text-[#013a56] selection:bg-[#013a56] selection:text-white lg:grid-cols-[6fr_4fr]"
      style={{ fontFamily: fontSans }}
    >
      <a
        href="#form"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-[#013a56] focus:px-4 focus:py-2 focus:text-white"
      >
        Ir para o formulário
      </a>

      {/* Mobile compact header */}
      <header className="flex items-center justify-between border-b border-black/[0.06] bg-white/80 px-5 py-4 backdrop-blur-md lg:hidden">
        <Logo size="sm" href="/" />
        <a
          href="/"
          className="inline-flex items-center gap-1.5 text-[12px] text-[#4A5868] hover:text-[#013a56]"
        >
          <ArrowLeft size={13} strokeWidth={2} />
          Voltar
        </a>
      </header>

      {/* === Brand panel (desktop only) === */}
      <aside className="relative hidden overflow-hidden bg-[#013a56] text-white lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
        {/* Background banner — light opacity wash */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <Image
            src="/BANNER_02.png"
            alt=""
            fill
            priority
            sizes="(min-width: 1024px) 60vw, 0px"
            className="object-cover opacity-90"
          />
        </div>

        {/* Subtle navy wash — keeps brand cohesion */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[#013a56]/15"
        />

        {/* Ambient mesh */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 -right-20 h-[480px] w-[480px] rounded-full bg-[radial-gradient(circle_at_center,rgba(57,204,96,0.30),transparent_62%)] blur-3xl" />
          {/* Grain texture for depth */}
          <div
            className="absolute inset-0 opacity-[0.05] mix-blend-overlay"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' /%3E%3C/svg%3E\")",
            }}
          />
        </div>

        {/* Bottom dark gradient — depth + legibility for trust readout */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#012438] via-[#012438]/70 via-25% to-transparent"
        />

        {/* Top: logo + back link */}
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: mounted ? 1 : 0 }}
          transition={{ duration: 0.7, ease: EASE }}
          className="relative z-10 flex items-center justify-between"
        >
          <Logo size="md" href="/" inverted />

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
            className="mt-6 text-[clamp(2.2rem,4.2vw,3.4rem)] font-medium leading-[1.02] tracking-[-0.025em]"
            style={{ fontFamily: fontSans, textWrap: "balance" }}
          >
            Suas finanças,{" "}
            <span
              className="accent text-[#39cc60]">
              finalmente
            </span>{" "}
            no lugar certo.
          </h2>
          <p
            className="mt-6 max-w-[40ch] text-[15px] leading-relaxed text-white/70"
            style={{ fontFamily: fontSans }}
          >
            Extração por IA, categorização contextual e segurança de nível
            bancário — em uma única plataforma.
          </p>
        </motion.div>

        {/* Spacer — preserves pull-quote position with lg:justify-between */}
        <div aria-hidden className="h-[88px]" />
      </aside>

      {/* === Form panel === */}
      <main
        id="form"
        className="relative flex items-center justify-center px-5 py-10 sm:px-8 sm:py-14 lg:px-6 lg:py-16 xl:px-8"
      >
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
          {/* Step badge — hidden for recovery/success states */}
          {(isRegister || loginStep === 1 || loginStep === 2) && (
            <StepBadge
              current={Math.min(currentStep, isRegister ? 3 : 2)}
              total={isRegister ? 3 : 2}
              label={stepLabel}
            />
          )}

          {/* Mode switch crossfade title */}
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
                className="text-[clamp(1.9rem,3.5vw,2.6rem)] font-medium leading-[1.05] tracking-[-0.025em] text-[#013a56]"
                style={{ fontFamily: fontSans, textWrap: "balance" }}
              >
                {formTitle.includes("Verifique") ? (
                  <>
                    Verifique seu{" "}
                    <span
                      className="accent text-[#39cc60]">
                      e-mail
                    </span>
                    .
                  </>
                ) : formTitle.includes("Bem-vindo") ? (
                  <>
                    Bem-vindo{" "}
                    <span
                      className="accent text-[#39cc60]">
                      de volta
                    </span>
                    .
                  </>
                ) : formTitle.includes("Crie") ? (
                  <>
                    Crie sua{" "}
                    <span
                      className="accent text-[#39cc60]">
                      conta
                    </span>
                    .
                  </>
                ) : formTitle.includes("Recuperar") ? (
                  <>
                    Recuperar{" "}
                    <span
                      className="accent text-[#39cc60]">
                      acesso
                    </span>
                    .
                  </>
                ) : (
                  formTitle
                )}
              </h1>
              <p
                className="mt-3 text-[14.5px] leading-relaxed text-[#4A5868]"
                style={{ fontFamily: fontSans, textWrap: "pretty" }}
              >
                {formSubtitle}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Double-Bezel form card */}
          <div className="mt-8 rounded-[2.25rem] border border-black/[0.05] bg-gradient-to-b from-white to-[#F5F7F8] p-1.5 shadow-[0_24px_60px_-28px_rgba(1,58,86,0.20)]">
            <div className="rounded-[calc(2.25rem-0.375rem)] bg-white p-6 sm:p-8">
              <form onSubmit={onSubmit} className="space-y-4" noValidate>
                <AnimatePresence mode="wait">
                  {/* ============ LOGIN MODE ============ */}
                  {!isRegister && (
                    <StepFrame k={`login-${loginStep}`}>
                      {/* Email field — visible in steps 1, 2, 3 */}
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
                                  className="flex h-8 w-8 items-center justify-center rounded-full text-[#013a56] transition-colors hover:bg-black/[0.04]"
                                  aria-label="Alterar e-mail"
                                >
                                  <ArrowLeft size={14} strokeWidth={2.2} />
                                </button>
                              ) : null
                            }
                          />
                        </div>
                      )}

                      {/* Password field — only step 2 */}
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
                                className="flex h-8 w-8 items-center justify-center rounded-full text-[#8B95A1] transition-colors hover:bg-black/[0.04] hover:text-[#013a56]"
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

                      {/* Reset success — step 4 */}
                      {loginStep === 4 && successMessage && (
                        <div className="flex flex-col items-center text-center">
                          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E8F8F0]">
                            <Mail
                              size={22}
                              strokeWidth={1.8}
                              className="text-[#0A7A47]"
                            />
                          </div>
                          <p
                            className="mt-5 text-[15px] leading-relaxed text-[#4A5868]"
                            style={{ fontFamily: fontSans }}
                          >
                            {successMessage}
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setLoginStep(1);
                              setSuccessMessage("");
                            }}
                            className="mt-6 inline-flex items-center gap-1.5 text-[13px] font-medium text-[#013a56] hover:text-[#012438]"
                            style={{ fontFamily: fontSans }}
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
                      {/* Step 1: Basic info */}
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

                      {/* Step 2: Password */}
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
                                  className="flex h-8 w-8 items-center justify-center rounded-full text-[#013a56] transition-colors hover:bg-black/[0.04]"
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
                                  className="flex h-8 w-8 items-center justify-center rounded-full text-[#8B95A1] transition-colors hover:bg-black/[0.04] hover:text-[#013a56]"
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
                              className="mt-2 text-[12px] text-[#8B95A1]"
                              style={{ fontFamily: fontSans }}
                            >
                              Pelo menos 6 caracteres, uma maiúscula, uma
                              minúscula e um número.
                            </p>
                          </div>
                        </>
                      )}

                      {/* Step 3: Verification */}
                      {registrationStep === 3 && (
                        <>
                          <div className="flex items-start gap-3 rounded-2xl border border-black/[0.05] bg-[#FAFBFC] p-4">
                            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#013a56] text-white">
                              <Mail size={16} strokeWidth={1.8} />
                            </span>
                            <div className="flex-1">
                              <p
                                className="text-[10px] uppercase tracking-[0.18em] text-[#8B95A1]"
                                style={{ fontFamily: fontMono }}
                              >
                                Código enviado para
                              </p>
                              <p
                                className="mt-0.5 text-[14px] font-medium text-[#013a56]"
                                style={{ fontFamily: fontSans }}
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
                              className="mt-2 text-center text-[12px] text-[#8B95A1]"
                              style={{ fontFamily: fontSans }}
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

                    {/* Back button — show when step > 1 in either mode */}
                    {((isRegister && registrationStep > 1) ||
                      (!isRegister && loginStep === 3)) && (
                      <button
                        type="button"
                        onClick={goBackStep}
                        disabled={loading || googleLoading}
                        className="inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-black/[0.08] bg-white py-3 text-[13.5px] font-medium text-[#013a56] transition-colors hover:bg-[#F5F7F8] disabled:opacity-50"
                        style={{ fontFamily: fontSans }}
                      >
                        <ArrowLeft size={13} strokeWidth={2.2} />
                        Voltar
                      </button>
                    )}
                  </div>
                )}
              </form>

              {/* Divider + Google — only on entry steps */}
              {!isRegister && (loginStep === 1 || loginStep === 2) && (
                <>
                  <div className="my-6 flex items-center gap-3">
                    <span className="h-px flex-1 bg-black/[0.06]" />
                    <span
                      className="text-[10px] uppercase tracking-[0.22em] text-[#8B95A1]"
                      style={{ fontFamily: fontMono }}
                    >
                      ou
                    </span>
                    <span className="h-px flex-1 bg-black/[0.06]" />
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={googleLoading || loading}
                    className="group flex w-full items-center justify-center gap-3 rounded-full border border-black/[0.08] bg-white py-3 text-[14px] font-medium text-[#013a56] transition-all duration-300 hover:bg-[#FAFBFC] hover:shadow-[0_8px_30px_-15px_rgba(1,58,86,0.20)] disabled:opacity-50"
                    style={{ fontFamily: fontSans }}
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
            <span className="text-[#4A5868]" style={{ fontFamily: fontSans }}>
              {isRegister ? "Já tem uma conta?" : "Ainda não tem conta?"}
            </span>
            <button
              type="button"
              onClick={toggleCard}
              className="group inline-flex items-center gap-1 font-medium text-[#013a56] underline decoration-[#00cc66] decoration-2 underline-offset-4 transition-colors hover:text-[#012438]"
              style={{ fontFamily: fontSans }}
            >
              {isRegister ? "Fazer login" : "Criar conta"}
              <ArrowRight
                size={13}
                strokeWidth={2.2}
                className="transition-transform duration-500 group-hover:translate-x-0.5"
              />
            </button>
          </div>

          {/* Trust line */}
          <div className="mt-10 flex items-center justify-center gap-4 border-t border-black/[0.06] pt-6 text-[11px] text-[#8B95A1]">
            <span
              className="inline-flex items-center gap-1.5 uppercase tracking-[0.18em]"
              style={{ fontFamily: fontMono }}
            >
              <LockKeyhole size={11} strokeWidth={2.2} />
              Criptografia bcrypt
            </span>
            <span className="h-3 w-px bg-black/[0.08]" />
            <span
              className="inline-flex items-center gap-1.5 uppercase tracking-[0.18em]"
              style={{ fontFamily: fontMono }}
            >
              <ShieldCheck size={11} strokeWidth={2.2} />
              JWT HTTPOnly
            </span>
          </div>

          <p
            className="mt-6 text-center text-[11px] text-[#A0AAB6]"
            style={{ fontFamily: fontSans }}
          >
            © 2026 MoneyHub · ao continuar, você concorda com nossos{" "}
            <a href="/terms" className="text-[#4A5868] hover:text-[#013a56]">
              Termos
            </a>{" "}
            e{" "}
            <a href="/privacy" className="text-[#4A5868] hover:text-[#013a56]">
              Privacidade
            </a>
            .
          </p>
        </motion.div>
      </main>
    </div>
  );
}
