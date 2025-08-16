"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { 
  Sun, 
  Moon, 
  TrendingUp, 
  PieChart, 
  CreditCard, 
  DollarSign, 
  FileText, 
  Users, 
  Shield, 
  Smartphone,
  Brain,
  Download,
  ArrowRight,
  CheckCircle
} from "lucide-react";

export default function MoneyHubHomePage() {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const handleLoginRedirect = () => {
    setIsTransitioning(true);
    
    // Animação de saída
    setTimeout(() => {
      // Redirecionamento para a página de login
      window.location.href = '/auth/login';
    }, 800);
  };

  const features = [
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Controle Completo",
      description: "Gerencie todas suas receitas e despesas em um só lugar"
    },
    {
      icon: <PieChart className="w-8 h-8" />,
      title: "Categorização Inteligente",
      description: "Organize seus gastos por categorias personalizáveis"
    },
    {
      icon: <CreditCard className="w-8 h-8" />,
      title: "Contas e Cartões",
      description: "Monitore saldos e limites de forma automática"
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: "Relatórios Detalhados",
      description: "Exporte relatórios em PDF e CSV para análise"
    },
    {
      icon: <Brain className="w-8 h-8" />,
      title: "IA Integrada",
      description: "Extração automática de dados de contracheques e extratos"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Compartilhamento",
      description: "Gerencie finanças em casal ou família"
    }
  ];

  const benefits = [
    "Controle total de suas finanças pessoais",
    "Interface moderna e intuitiva",
    "Segurança máxima com criptografia avançada",
    "Relatórios personalizáveis e exportáveis",
    "Lembretes automáticos de vencimentos",
    "Acesso multiplataforma (web e mobile)"
  ];

  return (
    <div
      className={`min-h-screen transition-all duration-800 ${
        isTransitioning 
          ? "opacity-0 scale-95 blur-sm" 
          : "opacity-100 scale-100 blur-0"
      } ${
        isDark
          ? "bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800"
          : "bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100"
      }`}
    >
      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className={`fixed top-6 right-6 z-50 p-3 rounded-full shadow-lg backdrop-blur-xl transition-all duration-300 ${
          isDark
            ? "bg-slate-800/80 border border-slate-700/50 text-yellow-400 hover:bg-slate-700/80"
            : "bg-white/90 border border-slate-200/50 text-slate-600 hover:bg-white"
        }`}
      >
        {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div
          className={`absolute -top-20 -right-20 w-96 h-96 bg-gradient-to-br from-emerald-500/20 to-green-400/10 rounded-full blur-xl transition-all duration-[4000ms] ${
            mounted ? "opacity-100 scale-100" : "opacity-0 scale-50"
          }`}
          style={{
            animation: mounted ? "float 6s ease-in-out infinite" : "none",
          }}
        />
        <div
          className={`absolute -bottom-20 -left-20 w-80 h-80 bg-gradient-to-tr from-blue-500/20 to-cyan-400/10 rounded-full blur-xl transition-all duration-[5000ms] delay-1000 ${
            mounted ? "opacity-100 scale-100" : "opacity-0 scale-50"
          }`}
          style={{
            animation: mounted ? "float 8s ease-in-out infinite reverse" : "none",
          }}
        />
        <div
          className={`absolute top-1/2 left-1/4 w-64 h-64 bg-gradient-to-r from-purple-500/15 to-pink-400/10 rounded-full blur-xl transition-all duration-[6000ms] delay-2000 ${
            mounted ? "opacity-100 scale-100" : "opacity-0 scale-50"
          }`}
          style={{
            animation: mounted ? "float 10s ease-in-out infinite" : "none",
          }}
        />
      </div>

      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="max-w-6xl mx-auto text-center">
          {/* Logo and Main Title */}
          <div
            className={`transition-all duration-1000 delay-300 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <div className="inline-flex items-center justify-center w-32 h-32 mb-8 relative">
              <Image
                src="/logo_money_hub.png"
                alt="MoneyHub Logo"
                width={120}
                height={120}
                className="object-contain relative z-10 drop-shadow-xl transition-transform duration-500 hover:scale-110"
                priority
              />
            </div>
            
            <h1
              className="text-6xl md:text-7xl font-bold mb-6"
              style={{
                fontFamily: "var(--font-heading, Montserrat, sans-serif)",
              }}
            >
              <span style={{ color: "#013a56" }}>Money</span>
              <span style={{ color: "#00cc66" }}>Hub</span>
            </h1>
            
            <p
              className={`text-2xl md:text-3xl font-medium mb-8 transition-colors duration-300 ${
                isDark ? "text-slate-300" : "text-slate-600"
              }`}
              style={{
                fontFamily: "var(--font-body, Open Sans, sans-serif)",
              }}
            >
              Sua plataforma completa de controle financeiro
            </p>
            
            <p
              className={`text-lg md:text-xl mb-12 max-w-3xl mx-auto transition-colors duration-300 ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}
              style={{
                fontFamily: "var(--font-body, Open Sans, sans-serif)",
              }}
            >
              Gerencie suas receitas, despesas, investimentos e muito mais com tecnologia de inteligência artificial e segurança máxima.
            </p>
          </div>

          {/* CTA Button */}
          <div
            className={`flex justify-center mb-16 transition-all duration-1000 delay-500 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <button 
              onClick={handleLoginRedirect}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold py-4 px-12 rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
            >
              Entrar no MoneyHub
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Feature Cards Grid */}
          <div
            className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16 transition-all duration-1000 delay-700 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            {features.map((feature, index) => (
              <div
                key={index}
                className={`p-6 rounded-2xl backdrop-blur-xl border shadow-lg transition-all duration-300 hover:scale-105 ${
                  isDark
                    ? "bg-slate-800/80 border-slate-700/50 text-white"
                    : "bg-white/90 border-slate-200/50 text-slate-800"
                }`}
              >
                <div className="text-emerald-500 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p
                  className={`transition-colors duration-300 ${
                    isDark ? "text-slate-300" : "text-slate-600"
                  }`}
                >
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section
        className={`py-20 px-4 ${
          isDark ? "bg-slate-800/50" : "bg-white/50"
        } backdrop-blur-xl`}
      >
        <div className="max-w-4xl mx-auto">
          <h2
            className={`text-4xl font-bold text-center mb-12 ${
              isDark ? "text-white" : "text-slate-800"
            }`}
            style={{
              fontFamily: "var(--font-heading, Montserrat, sans-serif)",
            }}
          >
            Por que escolher o MoneyHub?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-300 ${
                  isDark
                    ? "hover:bg-slate-700/50"
                    : "hover:bg-slate-100/50"
                }`}
              >
                <CheckCircle className="w-6 h-6 text-emerald-500 flex-shrink-0" />
                <span
                  className={`text-lg ${
                    isDark ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  {benefit}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl mb-8">
            <Shield className="w-10 h-10 text-white" />
          </div>
          
          <h2
            className={`text-4xl font-bold mb-6 ${
              isDark ? "text-white" : "text-slate-800"
            }`}
            style={{
              fontFamily: "var(--font-heading, Montserrat, sans-serif)",
            }}
          >
            Segurança em Primeiro Lugar
          </h2>
          
          <p
            className={`text-xl mb-8 max-w-3xl mx-auto ${
              isDark ? "text-slate-300" : "text-slate-600"
            }`}
          >
            Seus dados financeiros são protegidos com criptografia de nível bancário, 
            autenticação JWT e cookies HTTPOnly para máxima segurança.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: <Shield className="w-8 h-8" />, title: "Criptografia", desc: "Dados protegidos com bcrypt" },
              { icon: <DollarSign className="w-8 h-8" />, title: "JWT Tokens", desc: "Autenticação segura" },
              { icon: <Smartphone className="w-8 h-8" />, title: "CORS/XSS", desc: "Proteção contra ataques" }
            ].map((item, index) => (
              <div
                key={index}
                className={`p-6 rounded-xl border ${
                  isDark
                    ? "bg-slate-800/50 border-slate-700/50"
                    : "bg-white/50 border-slate-200/50"
                }`}
              >
                <div className="text-emerald-500 mb-4">{item.icon}</div>
                <h3 className={`font-semibold mb-2 ${isDark ? "text-white" : "text-slate-800"}`}>
                  {item.title}
                </h3>
                <p className={isDark ? "text-slate-400" : "text-slate-600"}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2
            className={`text-4xl font-bold mb-6 ${
              isDark ? "text-white" : "text-slate-800"
            }`}
            style={{
              fontFamily: "var(--font-heading, Montserrat, sans-serif)",
            }}
          >
            Pronto para transformar suas finanças?
          </h2>
          
          <p
            className={`text-xl mb-8 ${
              isDark ? "text-slate-300" : "text-slate-600"
            }`}
          >
            Junte-se a milhares de usuários que já organizaram sua vida financeira com o MoneyHub.
          </p>
          
          <div className="flex justify-center">
            <button 
              onClick={handleLoginRedirect}
              disabled={isTransitioning}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold py-4 px-12 rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isTransitioning ? 'Carregando...' : 'Fazer Login'}
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className={`py-8 px-4 border-t ${
          isDark
            ? "bg-slate-900/50 border-slate-700/50 text-slate-400"
            : "bg-white/50 border-slate-200/50 text-slate-500"
        }`}
      >
        <div className="max-w-6xl mx-auto text-center">
          <p>&copy; 2025 MoneyHub. Controle financeiro inteligente e seguro.</p>
        </div>
      </footer>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(30px, -30px) rotate(120deg); }
          66% { transform: translate(-20px, 20px) rotate(240deg); }
        }
      `}</style>
    </div>
  );
}