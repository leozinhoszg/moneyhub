"use client";

import React, { FormEvent, useState, useEffect } from "react";
import {
  login,
  loginWithGoogle,
  checkAuthStatus,
  register,
  sendVerificationCode,
  verifyCodeAndCreateAccount,
  forgotPassword,
  resetPassword,
} from "@/app/api/auth";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Eye, EyeOff, Sun, Moon, ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);

  // Login flow states: 1: email-only, 2: password + forgot, 3: password-reset, 4: reset-success, 5: register
  const [loginStep, setLoginStep] = useState(1);
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [cardHeight, setCardHeight] = useState("820px");

  // Multi-step registration states
  const [registrationStep, setRegistrationStep] = useState(1); // 1: basic info, 2: password, 3: verification
  const [verificationCode, setVerificationCode] = useState("");

  // Password reset states
  const [resetToken, setResetToken] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const router = useRouter();

  // Animation state
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
      } catch (error) {
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

        // Limpar parâmetros da URL
        const newUrl = window.location.pathname;
        window.history.replaceState({}, "", newUrl);
      }
    }
  }, []);

  // Ajustar altura do card baseado no erro
  useEffect(() => {
    setCardHeight(error ? "860px" : "820px");
  }, [error]);

  // Step 1: Handle email submission (continue button)
  const handleEmailSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validações básicas
    if (!email.trim()) {
      setError("E-mail é obrigatório");
      setLoading(false);
      return;
    }

    // Validação de formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Formato de e-mail inválido");
      setLoading(false);
      return;
    }

    try {
      // Proceed to password step
      setLoginStep(2);
    } catch (e: any) {
      setError("Erro ao validar email");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Handle login with password
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

      // Login bem-sucedido
      console.log("Login realizado com sucesso:", response.user);
      router.push("/dashboard");
    } catch (e: any) {
      // Tratamento específico de erros
      let errorMessage = "Falha no login. Verifique suas credenciais.";

      if (e?.message) {
        const message = e.message.toLowerCase();

        // Mapear mensagens específicas do backend
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
          // Se a mensagem não for reconhecida, usar a mensagem original
          errorMessage = e.message;
        }
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle forgot password button click
  const handleForgotPasswordClick = () => {
    setError(null);
    setSuccessMessage("");
    setLoginStep(3); // Go to password reset state
  };

  // Handle password reset form submission
  const handlePasswordResetSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validações básicas
    if (!email.trim()) {
      setError("E-mail é obrigatório");
      setLoading(false);
      return;
    }

    // Validação de formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Formato de e-mail inválido");
      setLoading(false);
      return;
    }

    try {
      const response = await forgotPassword(email.trim().toLowerCase());
      setSuccessMessage(response.message);
      setLoginStep(4); // Show success message
    } catch (e: any) {
      setError(e.message || "Erro ao enviar email de recuperação");
    } finally {
      setLoading(false);
    }
  };

  // Handle password reset form submission
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
      setLoginStep(1); // Return to login
      setSenha("");
      setConfirmPassword("");
      setResetToken("");
    } catch (e: any) {
      setError(e.message || "Erro ao redefinir senha");
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Handle basic info (name, surname, email)
  const handleBasicInfo = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validações básicas
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

    // Validação de formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Formato de e-mail inválido");
      setLoading(false);
      return;
    }

    try {
      // Enviar código de verificação por email
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

  // Step 2: Handle password entry
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

    // Validação adicional de força da senha
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (!passwordRegex.test(senha)) {
      setError(
        "A senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número"
      );
      setLoading(false);
      return;
    }

    try {
      // Password validated, proceed to verification step
      setRegistrationStep(3);
    } catch (e: any) {
      let errorMessage = "Erro ao validar senha. Tente novamente.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Handle verification code
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
      // Verificar código e criar conta
      const response = await verifyCodeAndCreateAccount({
        email: email.trim().toLowerCase(),
        code: verificationCode.trim(),
        senha: senha,
      });

      // Registro bem-sucedido
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
      // Se chegou aqui, a autenticação foi bem-sucedida
      router.push("/dashboard");
    } catch (e: any) {
      // Tratamento específico de erros para Google OAuth
      let errorMessage = "Falha no login com Google. Tente novamente.";

      if (e?.message) {
        const message = e.message.toLowerCase();

        // Mapear mensagens específicas do Google OAuth
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
          // Se a mensagem não for reconhecida, usar a mensagem original
          errorMessage = e.message;
        }
      }

      setError(errorMessage);
    } finally {
      setGoogleLoading(false);
    }
  };

  // Go back to previous step
  const goBackStep = () => {
    if (loginStep > 1) {
      setLoginStep(loginStep - 1);
      setError(null);
      setSuccessMessage("");
    }
  };

  const toggleCard = () => {
    setIsRegister(!isRegister);
    setError(null);
    setRegistrationStep(1);
    // Limpar campos ao alternar
    if (!isRegister) {
      setEmail("");
      setSenha("");
      setConfirmPassword("");
      setName("");
      setSurname("");
      setVerificationCode("");
    }
  };

  // Funções para limpar erros quando o usuário começa a digitar
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

  const handleConfirmPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setConfirmPassword(e.target.value);
    clearErrorOnInput();
  };

  const handleSurnameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSurname(e.target.value);
    clearErrorOnInput();
  };

  const handleVerificationCodeChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setVerificationCode(e.target.value);
    clearErrorOnInput();
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-500 ${
        isDark
          ? "bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800"
          : "bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100"
      }`}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {/* Large gradient orbs */}
        <div
          className={`absolute -top-20 -right-20 w-96 h-96 bg-gradient-to-br from-emerald-500/20 to-green-400/10 rounded-full blur-xl transition-all duration-[4000ms] ${
            mounted ? "opacity-100 scale-100" : "opacity-0 scale-50"
          }`}
          style={{
            animation: mounted ? "float 12s ease-in-out infinite" : "none",
          }}
        />
        <div
          className={`absolute -bottom-32 -left-32 w-80 h-80 bg-gradient-to-tr from-blue-600/20 to-indigo-500/10 rounded-full blur-xl transition-all duration-[4000ms] delay-1000 ${
            mounted ? "opacity-100 scale-100" : "opacity-0 scale-50"
          }`}
          style={{
            animation: mounted
              ? "float 10s ease-in-out infinite reverse"
              : "none",
          }}
        />
        <div
          className={`absolute top-1/2 left-1/4 w-64 h-64 bg-gradient-to-bl from-emerald-400/15 to-teal-500/5 rounded-full blur-2xl transition-all duration-[4000ms] delay-2000 ${
            mounted ? "opacity-100 scale-100" : "opacity-0 scale-50"
          }`}
          style={{
            animation: mounted ? "float 8s ease-in-out infinite" : "none",
          }}
        />

        {/* Grid pattern overlay */}
        <div
          className={`absolute inset-0 transition-all duration-500 ${
            isDark
              ? "bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:40px_40px]"
              : "bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:40px_40px]"
          }`}
        />
      </div>

      {/* Main Container */}
      <div
        className={`w-full max-w-lg relative z-10 transition-all duration-1000 mt-[-38px] ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        {/* Theme Toggle Button */}
        <button
          onClick={() => setIsDark(!isDark)}
          className={`absolute top-4 right-4 p-3 rounded-full transition-all duration-300 z-20 ${
            isDark
              ? "bg-gray-900 text-yellow-400 hover:bg-gray-800"
              : "bg-white text-gray-600 hover:bg-gray-50"
          } shadow-lg hover:shadow-xl`}
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* 3D Card Container */}
        <div
          className={`relative w-full transition-all duration-700 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
          style={{
            transformStyle: "preserve-3d",
            perspective: "1200px",
            minHeight: cardHeight,
          }}
        >
          {/* Login Side (Front) */}
          <div
            className={`absolute inset-0 rounded-3xl shadow-2xl border backdrop-blur-xl transition-all duration-700 ${
              isDark
                ? "bg-slate-800/80 border-slate-700/50"
                : "bg-white/90 border-slate-200/50"
            } ${
              isRegister ? "rotate-y-180 opacity-0" : "rotate-y-0 opacity-100"
            }`}
            style={{
              backfaceVisibility: "hidden",
              transform: isRegister ? "rotateY(180deg)" : "rotateY(0deg)",
            }}
          >
            <div className="p-8 pb-6 h-full flex flex-col justify-between">
              <div className="flex-1">
                {/* Logo Section */}
                <div
                  className={`text-center mb-8 transition-all duration-1000 delay-300 ${
                    mounted
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-4"
                  }`}
                >
                  <div className="inline-flex items-center justify-center w-40 h-40 mb-4 relative">
                    <Image
                      src="/logo_money_hub.png"
                      alt="MoneyHub Logo"
                      width={150}
                      height={150}
                      className="object-contain relative z-10 drop-shadow-xl transition-transform duration-500 hover:scale-110"
                      priority
                    />
                  </div>
                  <h1
                    className="text-3xl font-bold mb-3"
                    style={{
                      fontFamily: "var(--font-primary, Montserrat, sans-serif)",
                    }}
                  >
                    <span style={{ color: "#013a56" }}>Money</span>
                    <span style={{ color: "#00cc66" }}>Hub</span>
                  </h1>
                  <p
                    className={`text-lg font-medium transition-colors duration-300 ${
                      isDark ? "text-slate-300" : "text-slate-600"
                    }`}
                    style={{
                      fontFamily:
                        "var(--font-secondary, Open Sans, sans-serif)",
                    }}
                  >
                    Bem-vindo de volta!
                  </p>
                  <p
                    className={`text-sm mt-1 transition-colors duration-300 ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                    style={{
                      fontFamily:
                        "var(--font-secondary, Open Sans, sans-serif)",
                    }}
                  >
                    Entre na sua conta para continuar
                  </p>
                </div>

                {/* Email/Password Form */}
                <form
                  onSubmit={
                    loginStep === 1
                      ? handleEmailSubmit
                      : loginStep === 2
                      ? handleLoginSubmit
                      : loginStep === 3
                      ? handlePasswordResetSubmit
                      : (e) => e.preventDefault()
                  }
                  className="space-y-5"
                >
                  {/* Email Field - Always visible */}
                  <div className="space-y-2">
                    <label
                      htmlFor="email"
                      className={`block text-sm font-semibold transition-colors duration-300 ${
                        isDark ? "text-slate-200" : "text-slate-700"
                      }`}
                      style={{
                        fontFamily:
                          "var(--font-secondary, Open Sans, sans-serif)",
                      }}
                    >
                      E-mail
                    </label>
                    <div className="relative">
                      <input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={handleEmailChange}
                        required
                        readOnly={loginStep > 1}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all duration-200 font-medium backdrop-blur-sm ${
                          loginStep > 1 ? "bg-gray-100 cursor-not-allowed" : ""
                        } ${
                          isDark
                            ? "border-slate-600/50 bg-slate-700/50 text-white placeholder-slate-400"
                            : "border-slate-200/50 bg-white/80 text-slate-700 placeholder-slate-400"
                        }`}
                        style={{
                          fontFamily:
                            "var(--font-secondary, Open Sans, sans-serif)",
                        }}
                        disabled={loading || googleLoading}
                      />
                      {loginStep > 1 && (
                        <button
                          type="button"
                          onClick={goBackStep}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-emerald-500 hover:text-emerald-400"
                        >
                          <ArrowLeft className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Password Field - Only visible in step 2 (not in password reset) */}
                  {loginStep === 2 && (
                    <div className="space-y-2">
                      <label
                        htmlFor="senha"
                        className={`block text-sm font-semibold transition-colors duration-300 ${
                          isDark ? "text-slate-200" : "text-slate-700"
                        }`}
                        style={{
                          fontFamily:
                            "var(--font-secondary, Open Sans, sans-serif)",
                        }}
                      >
                        Senha
                      </label>
                      <div className="relative">
                        <input
                          id="senha"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={senha}
                          onChange={handleSenhaChange}
                          required
                          className={`w-full px-4 py-3 pr-12 border-2 rounded-xl focus:ring-4 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all duration-200 font-medium backdrop-blur-sm ${
                            isDark
                              ? "border-slate-600/50 bg-slate-700/50 text-white placeholder-slate-400"
                              : "border-slate-200/50 bg-white/80 text-slate-700 placeholder-slate-400"
                          }`}
                          style={{
                            fontFamily:
                              "var(--font-secondary, Open Sans, sans-serif)",
                          }}
                          disabled={loading || googleLoading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className={`absolute right-4 top-1/2 transform -translate-y-1/2 transition-colors duration-200 ${
                            isDark
                              ? "text-gray-400 hover:text-gray-200"
                              : "text-gray-400 hover:text-gray-600"
                          }`}
                          disabled={loading || googleLoading}
                        >
                          {showPassword ? (
                            <EyeOff className="w-6 h-6" />
                          ) : (
                            <Eye className="w-6 h-6" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Password Reset State - Step 3 */}
                  {loginStep === 3 && (
                    <div className="text-center space-y-4">
                      <div className="mb-6">
                        <h2
                          className={`text-xl font-bold mb-2 transition-colors duration-300 ${
                            isDark ? "text-slate-200" : "text-slate-700"
                          }`}
                          style={{
                            fontFamily:
                              "var(--font-primary, Montserrat, sans-serif)",
                          }}
                        >
                          Recuperar senha
                        </h2>
                        <p
                          className={`text-sm transition-colors duration-300 ${
                            isDark ? "text-slate-400" : "text-slate-600"
                          }`}
                          style={{
                            fontFamily:
                              "var(--font-secondary, Open Sans, sans-serif)",
                          }}
                        >
                          Digite seu e-mail para receber as instruções de
                          recuperação
                        </p>
                      </div>
                    </div>
                  )}

                  {error && (
                    <div
                      className={`border-2 rounded-xl p-4 text-sm font-medium backdrop-blur-sm ${
                        isDark
                          ? "bg-red-900/50 border-red-500/50 text-red-300"
                          : "bg-red-50 border-red-200 text-red-700"
                      }`}
                      style={{
                        animation: "shake 0.5s ease-in-out",
                        fontFamily:
                          "var(--font-secondary, Open Sans, sans-serif)",
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <svg
                          className={`w-5 h-5 flex-shrink-0 ${
                            isDark ? "text-red-400" : "text-red-500"
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {error}
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || googleLoading}
                    className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 group relative overflow-hidden text-lg"
                    style={{
                      fontFamily: "var(--font-primary, Montserrat, sans-serif)",
                    }}
                  >
                    {/* Button glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-emerald-600/20 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300" />

                    <span className="flex items-center justify-center gap-3 relative z-10">
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          {loginStep === 1 && "Validando..."}
                          {loginStep === 2 && "Entrando..."}
                          {loginStep === 3 && "Enviando..."}
                        </>
                      ) : (
                        <>
                          {loginStep === 1 && "Continuar"}
                          {loginStep === 2 && "Entrar"}
                          {loginStep === 3 && "Iniciar recuperação"}
                          <svg
                            className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 7l5 5m0 0l-5 5m5-5H6"
                            />
                          </svg>
                        </>
                      )}
                    </span>
                  </button>

                  {/* Forgot Password Link - Only visible in step 2 */}
                  {loginStep === 2 && (
                    <div className="text-center">
                      <button
                        type="button"
                        onClick={handleForgotPasswordClick}
                        className="text-sm text-emerald-500 hover:text-emerald-400 hover:underline font-semibold transition-colors duration-200"
                        style={{
                          fontFamily:
                            "var(--font-secondary, Open Sans, sans-serif)",
                        }}
                        disabled={loading}
                      >
                        Esqueceu sua senha?
                      </button>
                    </div>
                  )}

                  {/* Success Message - Step 4 */}
                  {loginStep === 4 && successMessage && (
                    <div
                      className={`border-2 rounded-xl p-4 text-sm font-medium backdrop-blur-sm ${
                        isDark
                          ? "bg-emerald-900/50 border-emerald-500/50 text-emerald-300"
                          : "bg-emerald-50 border-emerald-200 text-emerald-700"
                      }`}
                      style={{
                        fontFamily:
                          "var(--font-secondary, Open Sans, sans-serif)",
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <svg
                          className={`w-5 h-5 flex-shrink-0 ${
                            isDark ? "text-emerald-400" : "text-emerald-500"
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {successMessage}
                      </div>
                      <button
                        onClick={() => {
                          setLoginStep(1);
                          setSuccessMessage("");
                        }}
                        className="mt-3 text-emerald-600 hover:text-emerald-500 underline text-sm"
                      >
                        Voltar ao login
                      </button>
                    </div>
                  )}
                </form>

                {/* Divider - Hide in password reset state */}
                {loginStep !== 3 && (
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div
                        className={`w-full border-t transition-colors duration-300 ${
                          isDark ? "border-slate-600/50" : "border-slate-200/50"
                        }`}
                      ></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span
                        className={`px-4 font-medium transition-colors duration-300 ${
                          isDark
                            ? "bg-slate-800 text-slate-400"
                            : "bg-white text-slate-500"
                        }`}
                        style={{
                          fontFamily:
                            "var(--font-secondary, Open Sans, sans-serif)",
                        }}
                      >
                        ou
                      </span>
                    </div>
                  </div>
                )}

                {/* Google Login Button - Hide in password reset state */}
                {loginStep !== 3 && (
                  <button
                    onClick={handleGoogleLogin}
                    disabled={googleLoading || loading}
                    className={`w-full flex items-center justify-center gap-3 border-2 rounded-xl py-3 px-5 font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group transform hover:scale-[1.01] text-base backdrop-blur-sm ${
                      isDark
                        ? "bg-slate-700/50 border-slate-600/50 text-slate-200 hover:bg-slate-600/50 hover:border-slate-500/50 hover:shadow-xl"
                        : "bg-white/80 border-slate-200/50 text-slate-700 hover:bg-white hover:border-slate-300/50 hover:shadow-xl"
                    }`}
                    style={{
                      fontFamily:
                        "var(--font-secondary, Open Sans, sans-serif)",
                    }}
                  >
                    <svg
                      className="w-7 h-7 transition-transform duration-300 group-hover:scale-110"
                      viewBox="0 0 24 24"
                    >
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
                    {googleLoading ? (
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                        Entrando...
                      </div>
                    ) : (
                      "Continuar com Google"
                    )}
                  </button>
                )}
              </div>

              {/* Links */}
              <div className="mt-4 text-center">
                {/* Show different links based on login step */}
                {loginStep === 1 && (
                  <p
                    className={`text-sm transition-colors duration-300 ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                    style={{
                      fontFamily:
                        "var(--font-secondary, Open Sans, sans-serif)",
                    }}
                  >
                    Não tem uma conta?{" "}
                    <button
                      onClick={toggleCard}
                      className="text-emerald-500 hover:text-emerald-400 font-bold hover:underline transition-colors duration-200"
                    >
                      Criar conta
                    </button>
                  </p>
                )}

                {loginStep === 2 && (
                  <p
                    className={`text-sm transition-colors duration-300 ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                    style={{
                      fontFamily:
                        "var(--font-secondary, Open Sans, sans-serif)",
                    }}
                  >
                    Não tem uma conta?{" "}
                    <button
                      onClick={toggleCard}
                      className="text-emerald-500 hover:text-emerald-400 font-bold hover:underline transition-colors duration-200"
                    >
                      Criar conta
                    </button>
                  </p>
                )}

                {loginStep === 3 && (
                  <p
                    className={`text-sm transition-colors duration-300 ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                    style={{
                      fontFamily:
                        "var(--font-secondary, Open Sans, sans-serif)",
                    }}
                  >
                    Lembrou da senha?{" "}
                    <button
                      onClick={() => setLoginStep(2)}
                      className="text-emerald-500 hover:text-emerald-400 font-bold hover:underline transition-colors duration-200"
                    >
                      Voltar ao login
                    </button>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Register Side (Back) */}
          <div
            className={`absolute inset-0 rounded-3xl shadow-2xl border backdrop-blur-xl transition-all duration-700 ${
              isDark
                ? "bg-slate-800/80 border-slate-700/50"
                : "bg-white/90 border-slate-200/50"
            } ${
              isRegister ? "rotate-y-0 opacity-100" : "rotate-y-180 opacity-0"
            }`}
            style={{
              backfaceVisibility: "hidden",
              transform: isRegister ? "rotateY(0deg)" : "rotateY(-180deg)",
            }}
          >
            <div className="p-8 pb-6 h-full flex flex-col justify-between">
              <div className="flex-1">
                {/* Logo Section */}
                <div
                  className={`text-center mb-8 transition-all duration-1000 delay-300 ${
                    mounted
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-4"
                  }`}
                >
                  <div className="inline-flex items-center justify-center w-40 h-40 mb-4 relative">
                    <Image
                      src="/logo_money_hub.png"
                      alt="MoneyHub Logo"
                      width={150}
                      height={150}
                      className="object-contain relative z-10 drop-shadow-xl transition-transform duration-500 hover:scale-110"
                      priority
                    />
                  </div>
                  <h1
                    className="text-3xl font-bold mb-3"
                    style={{
                      fontFamily: "var(--font-primary, Montserrat, sans-serif)",
                    }}
                  >
                    <span style={{ color: "#013a56" }}>Money</span>
                    <span style={{ color: "#00cc66" }}>Hub</span>
                  </h1>
                  <p
                    className={`text-lg font-medium transition-colors duration-300 ${
                      isDark ? "text-slate-300" : "text-slate-600"
                    }`}
                    style={{
                      fontFamily:
                        "var(--font-secondary, Open Sans, sans-serif)",
                    }}
                  >
                    Crie sua conta!
                  </p>
                  <p
                    className={`text-sm mt-1 transition-colors duration-300 ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                    style={{
                      fontFamily:
                        "var(--font-secondary, Open Sans, sans-serif)",
                    }}
                  >
                    Preencha os dados para começar
                  </p>
                </div>

                {/* Multi-step Register Form */}
                <form
                  onSubmit={
                    registrationStep === 1
                      ? handleBasicInfo
                      : registrationStep === 2
                      ? handlePasswordStep
                      : handleVerification
                  }
                  className="space-y-5"
                >
                  {/* Step 1: Basic Information */}
                  {registrationStep === 1 && (
                    <>
                      <div className="space-y-2">
                        <label
                          htmlFor="name"
                          className={`block text-sm font-semibold transition-colors duration-300 ${
                            isDark ? "text-slate-200" : "text-slate-700"
                          }`}
                          style={{
                            fontFamily:
                              "var(--font-secondary, Open Sans, sans-serif)",
                          }}
                        >
                          Nome
                        </label>
                        <input
                          id="name"
                          type="text"
                          placeholder="Seu nome"
                          value={name}
                          onChange={handleNameChange}
                          required
                          className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all duration-200 font-medium backdrop-blur-sm ${
                            isDark
                              ? "border-slate-600/50 bg-slate-700/50 text-white placeholder-slate-400"
                              : "border-slate-200/50 bg-white/80 text-slate-700 placeholder-slate-400"
                          }`}
                          style={{
                            fontFamily:
                              "var(--font-secondary, Open Sans, sans-serif)",
                          }}
                          disabled={loading || googleLoading}
                        />
                      </div>

                      <div className="space-y-2">
                        <label
                          htmlFor="surname"
                          className={`block text-sm font-semibold transition-colors duration-300 ${
                            isDark ? "text-slate-200" : "text-slate-700"
                          }`}
                          style={{
                            fontFamily:
                              "var(--font-secondary, Open Sans, sans-serif)",
                          }}
                        >
                          Sobrenome
                        </label>
                        <input
                          id="surname"
                          type="text"
                          placeholder="Seu sobrenome"
                          value={surname}
                          onChange={handleSurnameChange}
                          required
                          className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all duration-200 font-medium backdrop-blur-sm ${
                            isDark
                              ? "border-slate-600/50 bg-slate-700/50 text-white placeholder-slate-400"
                              : "border-slate-200/50 bg-white/80 text-slate-700 placeholder-slate-400"
                          }`}
                          style={{
                            fontFamily:
                              "var(--font-secondary, Open Sans, sans-serif)",
                          }}
                          disabled={loading || googleLoading}
                        />
                      </div>
                    </>
                  )}

                  {/* Email field - shown in step 1 and 2 */}
                  {(registrationStep === 1 || registrationStep === 2) && (
                    <div className="space-y-2">
                      <label
                        htmlFor="email-register"
                        className={`block text-sm font-semibold transition-colors duration-300 ${
                          isDark ? "text-slate-200" : "text-slate-700"
                        }`}
                        style={{
                          fontFamily:
                            "var(--font-secondary, Open Sans, sans-serif)",
                        }}
                      >
                        E-mail
                      </label>
                      <input
                        id="email-register"
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={handleEmailChange}
                        required
                        disabled={
                          registrationStep === 2 || loading || googleLoading
                        }
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all duration-200 font-medium backdrop-blur-sm ${
                          registrationStep === 2
                            ? isDark
                              ? "border-slate-600/30 bg-slate-700/30 text-slate-400 placeholder-slate-500"
                              : "border-slate-200/30 bg-gray-100/50 text-slate-500 placeholder-slate-400"
                            : isDark
                            ? "border-slate-600/50 bg-slate-700/50 text-white placeholder-slate-400"
                            : "border-slate-200/50 bg-white/80 text-slate-700 placeholder-slate-400"
                        }`}
                        style={{
                          fontFamily:
                            "var(--font-secondary, Open Sans, sans-serif)",
                        }}
                      />
                    </div>
                  )}

                  {/* Step 2: Password */}
                  {registrationStep === 2 && (
                    <div className="space-y-2">
                      <label
                        htmlFor="senha-register"
                        className={`block text-sm font-semibold transition-colors duration-300 ${
                          isDark ? "text-slate-200" : "text-slate-700"
                        }`}
                        style={{
                          fontFamily:
                            "var(--font-secondary, Open Sans, sans-serif)",
                        }}
                      >
                        Senha
                      </label>
                      <div className="relative">
                        <input
                          id="senha-register"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={senha}
                          onChange={handleSenhaChange}
                          required
                          className={`w-full px-4 py-3 pr-12 border-2 rounded-xl focus:ring-4 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all duration-200 font-medium backdrop-blur-sm ${
                            isDark
                              ? "border-slate-600/50 bg-slate-700/50 text-white placeholder-slate-400"
                              : "border-slate-200/50 bg-white/80 text-slate-700 placeholder-slate-400"
                          }`}
                          style={{
                            fontFamily:
                              "var(--font-secondary, Open Sans, sans-serif)",
                          }}
                          disabled={loading || googleLoading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className={`absolute right-4 top-1/2 transform -translate-y-1/2 transition-colors duration-200 ${
                            isDark
                              ? "text-slate-400 hover:text-slate-200"
                              : "text-slate-400 hover:text-slate-600"
                          }`}
                          disabled={loading || googleLoading}
                        >
                          {showPassword ? (
                            <EyeOff className="w-6 h-6" />
                          ) : (
                            <Eye className="w-6 h-6" />
                          )}
                        </button>
                      </div>
                      <p
                        className={`text-xs mt-1 transition-colors duration-300 ${
                          isDark ? "text-slate-400" : "text-slate-500"
                        }`}
                      >
                        A senha deve conter pelo menos 6 caracteres com letras
                        maiúsculas, minúsculas e números
                      </p>
                    </div>
                  )}

                  {/* Step 3: Verification Code */}
                  {registrationStep === 3 && (
                    <>
                      <div
                        className={`text-center p-6 rounded-xl ${
                          isDark ? "bg-slate-700/30" : "bg-blue-50/50"
                        }`}
                      >
                        <div className={`text-4xl mb-3`}>📧</div>
                        <h3
                          className={`text-lg font-semibold mb-2 ${
                            isDark ? "text-slate-200" : "text-slate-700"
                          }`}
                        >
                          Verifique seu e-mail
                        </h3>
                        <p
                          className={`text-sm ${
                            isDark ? "text-slate-400" : "text-slate-600"
                          }`}
                        >
                          Enviamos um código de verificação para
                        </p>
                        <p
                          className={`text-sm font-medium ${
                            isDark ? "text-emerald-400" : "text-emerald-600"
                          }`}
                        >
                          {email}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <label
                          htmlFor="verification-code"
                          className={`block text-sm font-semibold transition-colors duration-300 ${
                            isDark ? "text-slate-200" : "text-slate-700"
                          }`}
                          style={{
                            fontFamily:
                              "var(--font-secondary, Open Sans, sans-serif)",
                          }}
                        >
                          Código de Verificação
                        </label>
                        <input
                          id="verification-code"
                          type="text"
                          placeholder="000000"
                          value={verificationCode}
                          onChange={handleVerificationCodeChange}
                          maxLength={6}
                          required
                          className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all duration-200 font-medium backdrop-blur-sm text-center text-2xl tracking-widest ${
                            isDark
                              ? "border-slate-600/50 bg-slate-700/50 text-white placeholder-slate-400"
                              : "border-slate-200/50 bg-white/80 text-slate-700 placeholder-slate-400"
                          }`}
                          style={{
                            fontFamily:
                              "var(--font-secondary, Open Sans, sans-serif)",
                          }}
                          disabled={loading || googleLoading}
                        />
                        <p
                          className={`text-xs text-center ${
                            isDark ? "text-slate-400" : "text-slate-500"
                          }`}
                        >
                          Digite o código de 6 dígitos enviado para seu e-mail
                        </p>
                      </div>
                    </>
                  )}

                  {error && (
                    <div
                      className={`border-2 rounded-xl p-4 text-sm font-medium backdrop-blur-sm ${
                        isDark
                          ? "bg-red-900/50 border-red-500/50 text-red-300"
                          : "bg-red-50 border-red-200 text-red-700"
                      }`}
                      style={{
                        animation: "shake 0.5s ease-in-out",
                        fontFamily:
                          "var(--font-secondary, Open Sans, sans-serif)",
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <svg
                          className={`w-5 h-5 flex-shrink-0 ${
                            isDark ? "text-red-400" : "text-red-500"
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {error}
                      </div>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="space-y-3">
                    {/* Back Button - only show in step 2 and 3 */}
                    {registrationStep > 1 && (
                      <button
                        type="button"
                        onClick={goBackStep}
                        disabled={loading || googleLoading}
                        className={`w-full py-3 px-6 rounded-xl transition-all duration-300 font-medium text-sm ${
                          isDark
                            ? "bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 border border-slate-600/50"
                            : "bg-slate-100/50 hover:bg-slate-200/50 text-slate-600 border border-slate-200/50"
                        }`}
                        style={{
                          fontFamily:
                            "var(--font-secondary, Open Sans, sans-serif)",
                        }}
                      >
                        ← Voltar
                      </button>
                    )}

                    {/* Main Action Button */}
                    <button
                      type="submit"
                      disabled={loading || googleLoading}
                      className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 group relative overflow-hidden text-lg"
                      style={{
                        fontFamily:
                          "var(--font-primary, Montserrat, sans-serif)",
                      }}
                    >
                      {/* Button glow effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-emerald-600/20 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300" />

                      <span className="flex items-center justify-center gap-3 relative z-10">
                        {loading ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            {registrationStep === 1 && "Verificando..."}
                            {registrationStep === 2 && "Enviando código..."}
                            {registrationStep === 3 && "Criando conta..."}
                          </>
                        ) : (
                          <>
                            {registrationStep === 1 && (
                              <>
                                Continuar
                                <svg
                                  className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                                  />
                                </svg>
                              </>
                            )}
                            {registrationStep === 2 && (
                              <>
                                Sign In
                                <svg
                                  className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                                  />
                                </svg>
                              </>
                            )}
                            {registrationStep === 3 && (
                              <>
                                Criar Conta
                                <svg
                                  className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                                  />
                                </svg>
                              </>
                            )}
                          </>
                        )}
                      </span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Links */}
              <div className="mt-8 text-center space-y-4">
                <p
                  className={`text-sm transition-colors duration-300 ${
                    isDark ? "text-slate-300" : "text-slate-600"
                  }`}
                  style={{
                    fontFamily: "var(--font-secondary, Open Sans, sans-serif)",
                  }}
                >
                  Já tem uma conta?{" "}
                  <button
                    onClick={toggleCard}
                    className="text-emerald-500 hover:text-emerald-400 font-bold hover:underline transition-colors duration-200"
                  >
                    Fazer login
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer - fixed near bottom, centered */}
      <div
        className={`absolute bottom-4 left-1/2 -translate-x-1/2 w-full px-4 text-center transition-all duration-700 ${
          mounted ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden="true"
      >
        <p
          className={`${isDark ? "text-gray-400" : "text-gray-500"} text-sm`}
          style={{ fontFamily: "var(--font-secondary, Open Sans, sans-serif)" }}
        >
          © 2025 MoneyHub. Centro de Controle de Gastos Pessoais.
        </p>
      </div>

      <style jsx>{`
        @import url("https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Open+Sans:wght@400;500;600&display=swap");

        :root {
          --font-primary: "Montserrat", sans-serif;
          --font-secondary: "Open Sans", sans-serif;
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg) scale(1);
          }
          33% {
            transform: translateY(-10px) rotate(1deg) scale(1.05);
          }
          66% {
            transform: translateY(5px) rotate(-1deg) scale(0.95);
          }
        }

        @keyframes patternFloat {
          0%,
          100% {
            transform: translate(0px, 0px) rotate(0deg);
          }
          25% {
            transform: translate(-5px, -5px) rotate(0.5deg);
          }
          50% {
            transform: translate(5px, -10px) rotate(1deg);
          }
          75% {
            transform: translate(-3px, 5px) rotate(-0.5deg);
          }
        }

        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-4px);
          }
          75% {
            transform: translateX(4px);
          }
        }

        /* Custom scrollbar for dark theme */
        ::-webkit-scrollbar {
          width: 8px;
        }

        ::-webkit-scrollbar-track {
          background: #1e293b;
        }

        ::-webkit-scrollbar-thumb {
          background: #64748b;
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #10b981;
        }
      `}</style>
    </div>
  );
}
