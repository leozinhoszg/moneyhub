"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  Save,
  Shield,
  Trash2,
  Upload,
  User,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import {
  changePassword,
  getUserProfile,
  removeProfileImage,
  updateUserProfile,
  uploadProfileImage,
} from "@/app/api/users";
import { GlassCard, Pill, SectionHeader } from "@/components/finance/glass";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuth } from "@/contexts/AuthContext";
import { fontBody, fontHeading } from "@/lib/motion";
import { cn } from "@/lib/utils";

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

const fieldClass =
  "h-11 rounded-xl border-gray-200/80 bg-white/75 px-3.5 text-[14px] text-gray-900 shadow-none transition-colors placeholder:text-gray-400 hover:border-gray-300 focus-visible:border-[color:var(--color-secondary-dark)] focus-visible:ring-[color:var(--color-secondary)]/20 focus-visible:ring-offset-0 dark:border-slate-700 dark:bg-slate-900/65 dark:text-slate-100 dark:hover:border-slate-600";

const primaryButtonClass =
  "h-11 rounded-full bg-[color:var(--color-secondary)] px-5 text-white shadow-[0_10px_24px_-12px_rgba(0,204,102,0.9)] transition-all hover:bg-[color:var(--color-secondary-dark)] hover:shadow-[0_14px_28px_-14px_rgba(0,153,77,0.9)] focus-visible:ring-[color:var(--color-secondary)]/40 active:scale-[0.98]";

function formatDate(dateString?: string) {
  if (!dateString) return "—";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

function PasswordField({
  id,
  label,
  value,
  visible,
  autoComplete,
  onChange,
  onToggle,
}: {
  id: string;
  label: string;
  value: string;
  visible: boolean;
  autoComplete: string;
  onChange: (value: string) => void;
  onToggle: () => void;
}) {
  return (
    <div className="space-y-2">
      <Label
        htmlFor={id}
        className="text-[13px] font-medium text-gray-700 dark:text-slate-300"
      >
        {label}
      </Label>
      <div className="relative">
        <Input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          autoComplete={autoComplete}
          onChange={(event) => onChange(event.target.value)}
          className={cn(fieldClass, "pr-12")}
          required
        />
        <button
          type="button"
          onClick={onToggle}
          aria-label={
            visible
              ? `Ocultar ${label.toLowerCase()}`
              : `Mostrar ${label.toLowerCase()}`
          }
          className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-secondary)]/40 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
        >
          {visible ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
    </div>
  );
}

function SecurityStatus({
  icon,
  title,
  description,
  tone,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  tone: "success" | "warning" | "neutral";
}) {
  const toneClass = {
    success:
      "bg-[color:var(--color-secondary)]/12 text-[color:var(--color-secondary-dark)] dark:bg-[color:var(--color-secondary)]/15 dark:text-[color:var(--color-secondary-light)]",
    warning:
      "bg-amber-100 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300",
    neutral:
      "bg-gray-100 text-gray-500 dark:bg-slate-800 dark:text-slate-400",
  }[tone];

  return (
    <div className="flex items-start gap-3 border-b border-gray-200/70 py-4 last:border-b-0 dark:border-slate-800">
      <span
        className={cn(
          "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
          toneClass
        )}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[14px] font-semibold text-gray-800 dark:text-slate-100">
          {title}
        </p>
        <p className="mt-0.5 text-[12.5px] leading-relaxed text-gray-500 dark:text-slate-400">
          {description}
        </p>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { t } = useTranslation();
  const { refreshUser } = useAuth();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [removingImage, setRemovingImage] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profileForm, setProfileForm] = useState<UpdateProfileData>({
    nome: "",
    sobrenome: "",
    email: "",
  });
  const [passwordForm, setPasswordForm] = useState<ChangePasswordData>({
    senha_atual: "",
    nova_senha: "",
    confirmar_nova_senha: "",
  });

  const loadProfile = useCallback(async () => {
    try {
      const data = await getUserProfile();
      setProfile(data);
      setProfileForm({
        nome: data.nome,
        sobrenome: data.sobrenome,
        email: data.email,
      });
    } catch (error: unknown) {
      toast.error(
        getErrorMessage(error, "Não foi possível carregar o perfil.")
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    setAvatarFailed(false);
  }, [profile?.avatar_url, profile?.foto_perfil]);

  const handleUpdateProfile = async (event: FormEvent) => {
    event.preventDefault();
    setUpdating(true);

    try {
      await updateUserProfile(profileForm);
      toast.success(t("settings.settingsSaved"));
      await Promise.all([loadProfile(), refreshUser()]);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, t("errors.general")));
    } finally {
      setUpdating(false);
    }
  };

  const handleChangePassword = async (event: FormEvent) => {
    event.preventDefault();

    if (passwordForm.nova_senha !== passwordForm.confirmar_nova_senha) {
      toast.error(t("auth.passwordsDoNotMatch"));
      return;
    }

    setChangingPassword(true);
    try {
      await changePassword(passwordForm);
      toast.success(t("auth.passwordResetSuccess"));
      setPasswordForm({
        senha_atual: "",
        nova_senha: "",
        confirmar_nova_senha: "",
      });
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, t("errors.general")));
    } finally {
      setChangingPassword(false);
    }
  };

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const acceptedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!acceptedTypes.includes(file.type)) {
      toast.error("Formato inválido. Use uma imagem JPG, PNG, GIF ou WebP.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("A imagem excede o limite de 5 MB.");
      event.target.value = "";
      return;
    }

    setUploadingImage(true);
    try {
      await uploadProfileImage(file);
      toast.success("Foto de perfil atualizada.");
      await Promise.all([loadProfile(), refreshUser()]);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, t("errors.general")));
    } finally {
      setUploadingImage(false);
      event.target.value = "";
    }
  };

  const handleRemoveImage = async () => {
    setRemovingImage(true);
    try {
      await removeProfileImage();
      toast.success("Foto de perfil removida.");
      await Promise.all([loadProfile(), refreshUser()]);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, t("errors.general")));
    } finally {
      setRemovingImage(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div
          className="animate-pulse space-y-6"
          aria-label={t("common.loading")}
        >
          <div className="h-9 w-44 rounded-xl bg-gray-200/80 dark:bg-slate-800" />
          <div className="h-12 w-full max-w-sm rounded-2xl bg-gray-200/70 dark:bg-slate-800" />
          <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
            <div className="h-[430px] rounded-3xl bg-gray-200/70 dark:bg-slate-800" />
            <div className="h-[430px] rounded-3xl bg-gray-200/70 dark:bg-slate-800" />
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mx-auto flex min-h-[55vh] w-full max-w-2xl items-center px-4 py-10">
        <GlassCard reveal={false} className="w-full">
          <Alert className="border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Não foi possível carregar o perfil. Atualize a página para tentar
              novamente.
            </AlertDescription>
          </Alert>
        </GlassCard>
      </div>
    );
  }

  const initials = `${profile.nome?.charAt(0) ?? ""}${
    profile.sobrenome?.charAt(0) ?? ""
  }`.toUpperCase();
  const avatarSource = profile.avatar_url || profile.foto_perfil;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-7 sm:px-6 sm:pt-10 lg:px-8">
      <header className="mb-7 max-w-2xl sm:mb-8">
        <h1
          className="text-[clamp(1.9rem,4vw,2.75rem)] font-bold leading-tight tracking-[-0.03em] text-[color:var(--color-primary)] dark:text-slate-100"
          style={{ fontFamily: fontHeading }}
        >
          Seu perfil
        </h1>
        <p
          className="mt-2 max-w-xl text-[14px] leading-relaxed text-gray-600 dark:text-slate-400 sm:text-[15px]"
          style={{ fontFamily: fontBody }}
        >
          Mantenha seus dados pessoais, sua foto e as formas de acesso à conta
          em dia.
        </p>
      </header>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid h-auto w-full grid-cols-2 rounded-2xl border border-gray-200/80 bg-white/60 p-1.5 text-gray-600 shadow-[0_12px_30px_-24px_rgba(0,51,102,0.45)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/55 dark:text-slate-400 sm:w-[390px]">
          <TabsTrigger
            value="profile"
            className="min-h-10 gap-2 rounded-xl px-4 text-[13px] shadow-none hover:bg-white/75 hover:text-[color:var(--color-primary)] data-[state=active]:bg-[color:var(--color-primary)] data-[state=active]:text-white data-[state=active]:shadow-[0_8px_20px_-12px_rgba(0,51,102,0.8)] dark:hover:bg-slate-800 dark:hover:text-slate-100 dark:data-[state=active]:bg-slate-100 dark:data-[state=active]:text-slate-950"
          >
            <User size={16} />
            Dados pessoais
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="min-h-10 gap-2 rounded-xl px-4 text-[13px] shadow-none hover:bg-white/75 hover:text-[color:var(--color-primary)] data-[state=active]:bg-[color:var(--color-primary)] data-[state=active]:text-white data-[state=active]:shadow-[0_8px_20px_-12px_rgba(0,51,102,0.8)] dark:hover:bg-slate-800 dark:hover:text-slate-100 dark:data-[state=active]:bg-slate-100 dark:data-[state=active]:text-slate-950"
          >
            <Shield size={16} />
            Segurança
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-0">
          <div className="grid items-start gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
            <GlassCard reveal={false} className="lg:sticky lg:top-24">
              <div className="flex flex-col items-center text-center">
                <div className="relative">
                  <Avatar className="h-28 w-28 border-4 border-white shadow-[0_16px_34px_-18px_rgba(0,51,102,0.55)] ring-1 ring-gray-200 dark:border-slate-900 dark:ring-slate-700">
                    {avatarSource && !avatarFailed ? (
                      <AvatarImage
                        src={avatarSource}
                        alt={`Foto de ${profile.nome} ${profile.sobrenome}`}
                        className="object-cover"
                        referrerPolicy="no-referrer"
                        onError={() => setAvatarFailed(true)}
                      />
                    ) : (
                      <AvatarFallback
                        className="bg-[color:var(--color-primary)] text-xl font-bold text-white"
                        aria-label={`Foto não adicionada. Iniciais de ${profile.nome} ${profile.sobrenome}`}
                      >
                        {initials || "MH"}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <span
                    className="absolute bottom-1 right-1 h-5 w-5 rounded-full border-[3px] border-white bg-[color:var(--color-secondary)] dark:border-slate-900"
                    aria-label="Conta ativa"
                  />
                </div>

                <h2
                  className="mt-4 text-xl font-bold tracking-tight text-[color:var(--color-primary)] dark:text-slate-100"
                  style={{ fontFamily: fontHeading }}
                >
                  {profile.nome} {profile.sobrenome}
                </h2>
                <p className="mt-1 break-all text-[13px] text-gray-500 dark:text-slate-400">
                  {profile.email}
                </p>

                <div className="mt-3 flex flex-wrap justify-center gap-2">
                  <Pill tone="info">
                    <Mail size={12} />
                    {profile.has_google ? "Google" : "Email"}
                  </Pill>
                  {profile.email_verificado ? (
                    <Pill tone="secondary">
                      <CheckCircle2 size={12} />
                      Verificado
                    </Pill>
                  ) : (
                    <Pill tone="warning">
                      <AlertCircle size={12} />
                      Pendente
                    </Pill>
                  )}
                </div>
              </div>

              <div className="my-6 h-px bg-gray-200/80 dark:bg-slate-800" />

              <input
                ref={imageInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                className="sr-only"
                onChange={handleImageUpload}
                disabled={uploadingImage}
              />
              <div className="space-y-2.5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="h-10 w-full rounded-xl border-gray-200 bg-white/70 text-gray-700 hover:border-[color:var(--color-secondary)]/40 hover:bg-[color:var(--color-secondary)]/[0.07] hover:text-[color:var(--color-secondary-dark)] focus-visible:ring-[color:var(--color-secondary)]/30 dark:border-slate-700 dark:bg-slate-900/55 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  {uploadingImage ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="mr-2 h-4 w-4" />
                  )}
                  {avatarSource ? "Trocar foto" : "Adicionar foto"}
                </Button>
                {profile.foto_perfil && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleRemoveImage}
                    disabled={removingImage}
                    className="h-10 w-full rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700 focus-visible:ring-red-300 dark:text-red-400 dark:hover:bg-red-950/30 dark:hover:text-red-300"
                  >
                    {removingImage ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="mr-2 h-4 w-4" />
                    )}
                    Remover foto
                  </Button>
                )}
              </div>
              <p className="mt-3 text-center text-[11.5px] leading-relaxed text-gray-500 dark:text-slate-500">
                JPG, PNG, GIF ou WebP · máximo de 5 MB
              </p>

              <dl className="mt-6 space-y-3 border-t border-gray-200/80 pt-5 text-[12.5px] dark:border-slate-800">
                <div className="flex items-center justify-between gap-3">
                  <dt className="flex items-center gap-2 text-gray-500 dark:text-slate-400">
                    <CalendarDays size={14} /> Membro desde
                  </dt>
                  <dd className="font-medium text-gray-700 dark:text-slate-200">
                    {formatDate(profile.data_cadastro)}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="flex items-center gap-2 text-gray-500 dark:text-slate-400">
                    <KeyRound size={14} /> Último acesso
                  </dt>
                  <dd className="font-medium text-gray-700 dark:text-slate-200">
                    {formatDate(profile.ultimo_login)}
                  </dd>
                </div>
              </dl>
            </GlassCard>

            <GlassCard reveal={false}>
              <SectionHeader
                icon={User}
                title="Informações pessoais"
                tone="primary"
              />
              <p className="-mt-2 mb-6 max-w-xl text-[13px] leading-relaxed text-gray-500 dark:text-slate-400">
                Estes dados identificam sua conta e aparecem nas áreas
                compartilhadas do MoneyHub.
              </p>

              <form onSubmit={handleUpdateProfile} className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label
                      htmlFor="nome"
                      className="text-[13px] font-medium text-gray-700 dark:text-slate-300"
                    >
                      Nome
                    </Label>
                    <Input
                      id="nome"
                      value={profileForm.nome}
                      autoComplete="given-name"
                      onChange={(event) =>
                        setProfileForm((current) => ({
                          ...current,
                          nome: event.target.value,
                        }))
                      }
                      className={fieldClass}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="sobrenome"
                      className="text-[13px] font-medium text-gray-700 dark:text-slate-300"
                    >
                      Sobrenome
                    </Label>
                    <Input
                      id="sobrenome"
                      value={profileForm.sobrenome}
                      autoComplete="family-name"
                      onChange={(event) =>
                        setProfileForm((current) => ({
                          ...current,
                          sobrenome: event.target.value,
                        }))
                      }
                      className={fieldClass}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-[13px] font-medium text-gray-700 dark:text-slate-300"
                  >
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
                    <Input
                      id="email"
                      type="email"
                      value={profileForm.email}
                      autoComplete="email"
                      onChange={(event) =>
                        setProfileForm((current) => ({
                          ...current,
                          email: event.target.value,
                        }))
                      }
                      className={cn(fieldClass, "pl-10")}
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-3 border-t border-gray-200/80 pt-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-[12px] leading-relaxed text-gray-500 dark:text-slate-400">
                    Revise os dados antes de salvar as alterações.
                  </p>
                  <Button
                    type="submit"
                    disabled={updating}
                    className={primaryButtonClass}
                  >
                    {updating ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    Salvar alterações
                  </Button>
                </div>
              </form>
            </GlassCard>
          </div>
        </TabsContent>

        <TabsContent value="security" className="mt-0">
          <div
            className={cn(
              "grid items-start gap-6",
              profile.has_password &&
                "lg:grid-cols-[minmax(0,1fr)_360px]"
            )}
          >
            {profile.has_password && (
              <GlassCard reveal={false}>
                <SectionHeader
                  icon={Lock}
                  title="Alterar senha"
                  tone="secondary"
                />
                <p className="-mt-2 mb-6 max-w-xl text-[13px] leading-relaxed text-gray-500 dark:text-slate-400">
                  Use uma senha exclusiva e evite informações fáceis de
                  adivinhar.
                </p>

                <form onSubmit={handleChangePassword} className="space-y-5">
                  <PasswordField
                    id="senha_atual"
                    label="Senha atual"
                    value={passwordForm.senha_atual}
                    visible={showCurrentPassword}
                    autoComplete="current-password"
                    onChange={(value) =>
                      setPasswordForm((current) => ({
                        ...current,
                        senha_atual: value,
                      }))
                    }
                    onToggle={() =>
                      setShowCurrentPassword((current) => !current)
                    }
                  />
                  <div className="grid gap-5 sm:grid-cols-2">
                    <PasswordField
                      id="nova_senha"
                      label="Nova senha"
                      value={passwordForm.nova_senha}
                      visible={showNewPassword}
                      autoComplete="new-password"
                      onChange={(value) =>
                        setPasswordForm((current) => ({
                          ...current,
                          nova_senha: value,
                        }))
                      }
                      onToggle={() =>
                        setShowNewPassword((current) => !current)
                      }
                    />
                    <PasswordField
                      id="confirmar_nova_senha"
                      label="Confirmar nova senha"
                      value={passwordForm.confirmar_nova_senha}
                      visible={showConfirmPassword}
                      autoComplete="new-password"
                      onChange={(value) =>
                        setPasswordForm((current) => ({
                          ...current,
                          confirmar_nova_senha: value,
                        }))
                      }
                      onToggle={() =>
                        setShowConfirmPassword((current) => !current)
                      }
                    />
                  </div>
                  <div className="flex justify-end border-t border-gray-200/80 pt-5 dark:border-slate-800">
                    <Button
                      type="submit"
                      disabled={changingPassword}
                      className={primaryButtonClass}
                    >
                      {changingPassword ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Lock className="mr-2 h-4 w-4" />
                      )}
                      Atualizar senha
                    </Button>
                  </div>
                </form>
              </GlassCard>
            )}

            <GlassCard reveal={false}>
              <SectionHeader
                icon={Shield}
                title="Proteção da conta"
                tone="primary"
              />
              <div className="-mb-1">
                <SecurityStatus
                  icon={
                    profile.has_password ? (
                      <CheckCircle2 size={18} />
                    ) : (
                      <XCircle size={18} />
                    )
                  }
                  title="Senha de acesso"
                  description={
                    profile.has_password
                      ? "Uma senha está definida para esta conta."
                      : "Esta conta não possui senha definida."
                  }
                  tone={profile.has_password ? "success" : "neutral"}
                />
                <SecurityStatus
                  icon={
                    profile.has_google ? (
                      <CheckCircle2 size={18} />
                    ) : (
                      <XCircle size={18} />
                    )
                  }
                  title="Conta Google"
                  description={
                    profile.has_google
                      ? "Login com Google está vinculado e disponível."
                      : "Nenhuma conta Google está vinculada."
                  }
                  tone={profile.has_google ? "success" : "neutral"}
                />
                <SecurityStatus
                  icon={
                    profile.email_verificado ? (
                      <CheckCircle2 size={18} />
                    ) : (
                      <AlertCircle size={18} />
                    )
                  }
                  title="Email verificado"
                  description={
                    profile.email_verificado
                      ? "Seu endereço de email foi confirmado."
                      : "Confirme seu email para reforçar a recuperação da conta."
                  }
                  tone={profile.email_verificado ? "success" : "warning"}
                />
              </div>
            </GlassCard>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
