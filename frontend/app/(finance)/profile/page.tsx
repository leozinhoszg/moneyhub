'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { 
  getUserProfile,
  updateUserProfile,
  changePassword,
  uploadProfileImage,
  removeProfileImage
} from '@/app/api/users';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Mail, 
  Lock, 
  Camera, 
  Shield, 
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Settings,
  Eye,
  EyeOff,
  Edit3,
  Save,
  X
} from 'lucide-react';
import { toast } from 'sonner';

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

export default function ProfilePage() {
  const { t } = useTranslation();
  const { user: authUser } = useAuth();
  const { isDark, mounted } = useTheme();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Estados dos formulários
  const [profileForm, setProfileForm] = useState<UpdateProfileData>({
    nome: '',
    sobrenome: '',
    email: ''
  });
  
  const [passwordForm, setPasswordForm] = useState<ChangePasswordData>({
    senha_atual: '',
    nova_senha: '',
    confirmar_nova_senha: ''
  });

  // Carregar perfil do usuário
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await getUserProfile();
      setProfile(data);
      setProfileForm({
        nome: data.nome,
        sobrenome: data.sobrenome,
        email: data.email
      });
    } catch (error: any) {
      toast.error(error.message || t('errors.general'));
    } finally {
      setLoading(false);
    }
  };

  // Atualizar perfil
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);

    try {
      await updateUserProfile(profileForm);
      toast.success(t('settings.settingsSaved'));
      loadProfile();
    } catch (error: any) {
      toast.error(error.message || t('errors.general'));
    } finally {
      setUpdating(false);
    }
  };

  // Alterar senha
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.nova_senha !== passwordForm.confirmar_nova_senha) {
      toast.error(t('auth.passwordsDoNotMatch'));
      return;
    }

    setChangingPassword(true);

    try {
      await changePassword(passwordForm);
      toast.success(t('auth.passwordResetSuccess'));
      setPasswordForm({
        senha_atual: '',
        nova_senha: '',
        confirmar_nova_senha: ''
      });
    } catch (error: any) {
      toast.error(error.message || t('errors.general'));
    } finally {
      setChangingPassword(false);
    }
  };

  // Upload de foto
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast.error('Tipo de arquivo inválido. Selecione uma imagem.');
      return;
    }

    // Validar tamanho (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Máximo 5MB.');
      return;
    }

    setUploadingImage(true);

    try {
      await uploadProfileImage(file);
      toast.success(t('common.success'));
      loadProfile();
    } catch (error: any) {
      toast.error(error.message || t('errors.general'));
    } finally {
      setUploadingImage(false);
    }
  };

  // Remover foto
  const handleRemoveImage = async () => {
    try {
      await removeProfileImage();
      toast.success(t('common.success'));
      loadProfile();
    } catch (error: any) {
      toast.error(error.message || t('errors.general'));
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-500 ${
        isDark
          ? "bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800"
          : "bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100"
      }`}>
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
          <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'} animate-pulse`}>{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-500 ${
        isDark
          ? "bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800"
          : "bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100"
      }`}>
        <Alert className="max-w-md backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-red-200 dark:border-red-800">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-600 dark:text-red-300">
            Perfil não encontrado
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const getInitials = (nome: string, sobrenome: string) => {
    return `${nome.charAt(0)}${sobrenome.charAt(0)}`.toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${
      isDark
        ? "bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800"
        : "bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100"
    }`}>
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
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 relative z-10">
        <div
          className={`transition-all duration-1000 w-full ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Avatar className="h-16 w-16 border-4 border-white/20 shadow-xl">
                <AvatarImage src={profile.avatar_url} alt={`${profile.nome} ${profile.sobrenome}`} />
                <AvatarFallback className={`text-lg font-bold ${
                  isDark ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-800'
                }`}>
                  {getInitials(profile.nome, profile.sobrenome)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1
                  className={`text-2xl sm:text-3xl font-bold mb-2 transition-colors duration-300 ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}
                  style={{
                    fontFamily: "var(--font-primary, Montserrat, sans-serif)",
                  }}
                >
                  {profile.nome} {profile.sobrenome}
                </h1>
                <p className={`text-sm sm:text-base ${
                  isDark ? 'text-slate-400' : 'text-slate-600'
                }`}
                   style={{
                     fontFamily: "var(--font-secondary, Open Sans, sans-serif)",
                   }}>
                  {profile.email}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge 
                    variant={profile.provider === 'google' ? 'default' : 'secondary'}
                    className={`${
                      profile.provider === 'google' 
                        ? isDark ? 'bg-blue-500/20 text-blue-400 border-blue-400/30' : 'bg-blue-100 text-blue-700 border-blue-200'
                        : isDark ? 'bg-slate-600/20 text-slate-400 border-slate-500/30' : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {profile.provider === 'google' ? (
                      <><svg className="w-3 h-3 mr-1" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg> Google</>
                    ) : (
                      <><Mail className="w-3 h-3 mr-1" /> Email</>
                    )}
                  </Badge>
                  {profile.email_verificado && (
                    <Badge className={`${
                      isDark ? 'bg-green-500/20 text-green-400 border-green-400/30' : 'bg-green-100 text-green-700 border-green-200'
                    }`}>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {t('profile.verified')}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className={`grid w-full grid-cols-2 ${
              isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white/50 border-slate-200/50'
            } backdrop-blur-sm border rounded-xl p-1 shadow-lg`}>
              <TabsTrigger 
                value="profile" 
                className={`${
                  isDark 
                    ? 'data-[state=active]:bg-slate-700 data-[state=active]:text-blue-400' 
                    : 'data-[state=active]:bg-white data-[state=active]:text-blue-600'
                } data-[state=active]:shadow-md rounded-lg transition-all duration-200 font-medium`}
              >
                <User className="h-4 w-4 mr-2" />
                {t('profile.personalInfo')}
              </TabsTrigger>
              <TabsTrigger 
                value="security" 
                className={`${
                  isDark 
                    ? 'data-[state=active]:bg-slate-700 data-[state=active]:text-blue-400' 
                    : 'data-[state=active]:bg-white data-[state=active]:text-blue-600'
                } data-[state=active]:shadow-md rounded-lg transition-all duration-200 font-medium`}
              >
                <Shield className="h-4 w-4 mr-2" />
                {t('profile.security')}
              </TabsTrigger>
            </TabsList>

            {/* Informações Pessoais */}
            <TabsContent value="profile" className="space-y-6">
              {/* Informações Básicas */}
              <div className={`rounded-xl shadow-lg border transition-all duration-300 ${
                isDark
                  ? "bg-slate-800/90 border-slate-700/30"
                  : "bg-white border-slate-200/50"
              } p-6`}>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      isDark ? "bg-blue-500/20" : "bg-blue-50"
                    }`}>
                      <User className="h-5 w-5 text-blue-500" />
                    </div>
                    <h3
                      className={`text-lg font-semibold ${
                        isDark ? "text-white" : "text-slate-900"
                      }`}
                      style={{
                        fontFamily: "var(--font-primary, Montserrat, sans-serif)",
                      }}
                    >
                      Informações Pessoais
                    </h3>
                  </div>
                </div>
                
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nome" className={`text-sm font-medium ${
                        isDark ? 'text-slate-300' : 'text-slate-700'
                      }`}>
                        Nome
                      </Label>
                      <Input
                        id="nome"
                        value={profileForm.nome}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, nome: e.target.value }))}
                        className={`${
                          isDark 
                            ? 'bg-slate-700/50 border-slate-600/50 text-white focus:border-blue-500' 
                            : 'bg-white/50 border-slate-300/50 focus:border-blue-500'
                        } focus:ring-blue-500/20`}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sobrenome" className={`text-sm font-medium ${
                        isDark ? 'text-slate-300' : 'text-slate-700'
                      }`}>
                        Sobrenome
                      </Label>
                      <Input
                        id="sobrenome"
                        value={profileForm.sobrenome}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, sobrenome: e.target.value }))}
                        className={`${
                          isDark 
                            ? 'bg-slate-700/50 border-slate-600/50 text-white focus:border-blue-500' 
                            : 'bg-white/50 border-slate-300/50 focus:border-blue-500'
                        } focus:ring-blue-500/20`}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className={`text-sm font-medium ${
                      isDark ? 'text-slate-300' : 'text-slate-700'
                    }`}>
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                      className={`${
                        isDark 
                          ? 'bg-slate-700/50 border-slate-600/50 text-white focus:border-blue-500' 
                          : 'bg-white/50 border-slate-300/50 focus:border-blue-500'
                      } focus:ring-blue-500/20`}
                      required
                    />
                  </div>
                  <div className="flex justify-between items-center pt-4">
                    <div className="space-y-1">
                      <p className={`text-sm ${
                        isDark ? 'text-slate-400' : 'text-slate-600'
                      }`}>
                        <Calendar className="h-4 w-4 inline mr-1" />
                        Membro desde: {formatDate(profile.data_cadastro)}
                      </p>
                      {profile.ultimo_login && (
                        <p className={`text-sm ${
                          isDark ? 'text-slate-400' : 'text-slate-600'
                        }`}>
                          Último login: {formatDate(profile.ultimo_login)}
                        </p>
                      )}
                    </div>
                    <Button 
                      type="submit" 
                      disabled={updating}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      {updating ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Atualizar Perfil
                    </Button>
                  </div>
                </form>
              </div>

              {/* Foto de Perfil */}
              <div className={`rounded-xl shadow-lg border transition-all duration-300 ${
                isDark
                  ? "bg-slate-800/90 border-slate-700/30"
                  : "bg-white border-slate-200/50"
              } p-6`}>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      isDark ? "bg-emerald-500/20" : "bg-emerald-50"
                    }`}>
                      <Camera className="h-5 w-5 text-emerald-500" />
                    </div>
                    <h3
                      className={`text-lg font-semibold ${
                        isDark ? "text-white" : "text-slate-900"
                      }`}
                      style={{
                        fontFamily: "var(--font-primary, Montserrat, sans-serif)",
                      }}
                    >
                      Foto de Perfil
                    </h3>
                  </div>
                </div>
                
                <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
                  <div className="relative group">
                    <Avatar className={`h-24 w-24 border-4 shadow-lg group-hover:shadow-xl transition-shadow duration-200 ${
                      isDark ? 'border-slate-600' : 'border-slate-200'
                    }`}>
                      <AvatarImage src={profile.avatar_url} alt={`${profile.nome} ${profile.sobrenome}`} />
                      <AvatarFallback className={`text-xl font-bold ${
                        isDark ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-800'
                      }`}>
                        {getInitials(profile.nome, profile.sobrenome)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                      <Camera className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="flex flex-wrap gap-3">
                      <label htmlFor="profile-image-card" className="cursor-pointer">
                        <Button 
                          type="button"
                          variant="outline" 
                          disabled={uploadingImage}
                          className={`${
                            isDark 
                              ? 'bg-slate-700/50 border-slate-600/50 hover:bg-blue-900/20 hover:border-blue-600 text-slate-300' 
                              : 'bg-white/50 border-slate-300/50 hover:bg-blue-50 hover:border-blue-300'
                          }`}
                        >
                          {uploadingImage ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <Camera className="h-4 w-4 mr-2" />
                          )}
                          Enviar Foto
                        </Button>
                      </label>
                      <input
                        id="profile-image-card"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                      />
                      {profile.foto_perfil && (
                        <Button 
                          type="button"
                          variant="outline" 
                          onClick={handleRemoveImage}
                          className={`${
                            isDark 
                              ? 'bg-slate-700/50 border-slate-600/50 hover:bg-red-900/20 hover:border-red-600 text-red-400' 
                              : 'bg-white/50 border-slate-300/50 hover:bg-red-50 hover:border-red-300 text-red-600'
                          }`}
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Remover
                        </Button>
                      )}
                    </div>
                    <div className={`rounded-lg p-3 border ${
                      isDark ? 'bg-blue-900/20 border-blue-800 text-blue-300' : 'bg-blue-50 border-blue-200 text-blue-700'
                    }`}>
                      <p className="text-sm flex items-start space-x-2">
                        <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>Formatos aceitos: JPG, PNG, GIF. Tamanho máximo: 5MB</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Segurança */}
            <TabsContent value="security" className="space-y-6">
              {/* Alterar Senha */}
              {profile.has_password && (
                <div className={`rounded-xl shadow-lg border transition-all duration-300 ${
                  isDark
                    ? "bg-slate-800/90 border-slate-700/30"
                    : "bg-white border-slate-200/50"
                } p-6`}>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        isDark ? "bg-green-500/20" : "bg-green-50"
                      }`}>
                        <Lock className="h-5 w-5 text-green-500" />
                      </div>
                      <h3
                        className={`text-lg font-semibold ${
                          isDark ? "text-white" : "text-slate-900"
                        }`}
                        style={{
                          fontFamily: "var(--font-primary, Montserrat, sans-serif)",
                        }}
                      >
                        Alterar Senha
                      </h3>
                    </div>
                  </div>
                  
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="senha_atual" className={`text-sm font-medium ${
                        isDark ? 'text-slate-300' : 'text-slate-700'
                      }`}>
                        Senha Atual
                      </Label>
                      <div className="relative">
                        <Input
                          id="senha_atual"
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={passwordForm.senha_atual}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, senha_atual: e.target.value }))}
                          className={`pr-10 ${
                            isDark 
                              ? 'bg-slate-700/50 border-slate-600/50 text-white focus:border-blue-500' 
                              : 'bg-white/50 border-slate-300/50 focus:border-blue-500'
                          } focus:ring-blue-500/20`}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className={`absolute right-3 top-1/2 -translate-y-1/2 ${
                            isDark ? 'text-slate-400 hover:text-slate-300' : 'text-slate-500 hover:text-slate-700'
                          }`}
                        >
                          {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nova_senha" className={`text-sm font-medium ${
                        isDark ? 'text-slate-300' : 'text-slate-700'
                      }`}>
                        Nova Senha
                      </Label>
                      <div className="relative">
                        <Input
                          id="nova_senha"
                          type={showNewPassword ? 'text' : 'password'}
                          value={passwordForm.nova_senha}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, nova_senha: e.target.value }))}
                          className={`pr-10 ${
                            isDark 
                              ? 'bg-slate-700/50 border-slate-600/50 text-white focus:border-blue-500' 
                              : 'bg-white/50 border-slate-300/50 focus:border-blue-500'
                          } focus:ring-blue-500/20`}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className={`absolute right-3 top-1/2 -translate-y-1/2 ${
                            isDark ? 'text-slate-400 hover:text-slate-300' : 'text-slate-500 hover:text-slate-700'
                          }`}
                        >
                          {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmar_nova_senha" className={`text-sm font-medium ${
                        isDark ? 'text-slate-300' : 'text-slate-700'
                      }`}>
                        Confirmar Nova Senha
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirmar_nova_senha"
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={passwordForm.confirmar_nova_senha}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmar_nova_senha: e.target.value }))}
                          className={`pr-10 ${
                            isDark 
                              ? 'bg-slate-700/50 border-slate-600/50 text-white focus:border-blue-500' 
                              : 'bg-white/50 border-slate-300/50 focus:border-blue-500'
                          } focus:ring-blue-500/20`}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className={`absolute right-3 top-1/2 -translate-y-1/2 ${
                            isDark ? 'text-slate-400 hover:text-slate-300' : 'text-slate-500 hover:text-slate-700'
                          }`}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-end pt-4">
                      <Button 
                        type="submit" 
                        disabled={changingPassword}
                        className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        {changingPassword ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Lock className="h-4 w-4 mr-2" />
                        )}
                        Alterar Senha
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {/* Informações de Segurança */}
              <div className={`rounded-xl shadow-lg border transition-all duration-300 ${
                isDark
                  ? "bg-slate-800/90 border-slate-700/30"
                  : "bg-white border-slate-200/50"
              } p-6`}>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      isDark ? "bg-orange-500/20" : "bg-orange-50"
                    }`}>
                      <Shield className="h-5 w-5 text-orange-500" />
                    </div>
                    <h3
                      className={`text-lg font-semibold ${
                        isDark ? "text-white" : "text-slate-900"
                      }`}
                      style={{
                        fontFamily: "var(--font-primary, Montserrat, sans-serif)",
                      }}
                    >
                      Informações de Segurança
                    </h3>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-700/30">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        profile.has_password 
                          ? isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600'
                          : isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-600'
                      }`}>
                        {profile.has_password ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className={`font-medium ${
                          isDark ? 'text-slate-200' : 'text-slate-800'
                        }`}>Senha definida</p>
                        <p className={`text-sm ${
                          isDark ? 'text-slate-400' : 'text-slate-600'
                        }`}>
                          {profile.has_password ? 'Sua conta possui uma senha' : 'Sua conta não possui senha'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-700/30">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        profile.has_google 
                          ? isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'
                          : isDark ? 'bg-slate-500/20 text-slate-400' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {profile.has_google ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className={`font-medium ${
                          isDark ? 'text-slate-200' : 'text-slate-800'
                        }`}>Conta Google vinculada</p>
                        <p className={`text-sm ${
                          isDark ? 'text-slate-400' : 'text-slate-600'
                        }`}>
                          {profile.has_google ? 'Sua conta está vinculada ao Google' : 'Sua conta não está vinculada ao Google'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-700/30">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        profile.email_verificado 
                          ? isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600'
                          : isDark ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-100 text-yellow-600'
                      }`}>
                        {profile.email_verificado ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className={`font-medium ${
                          isDark ? 'text-slate-200' : 'text-slate-800'
                        }`}>Email verificado</p>
                        <p className={`text-sm ${
                          isDark ? 'text-slate-400' : 'text-slate-600'
                        }`}>
                          {profile.email_verificado ? 'Seu email foi verificado' : 'Seu email ainda não foi verificado'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
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
      `}</style>
    </div>
  );
}