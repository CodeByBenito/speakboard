import { useState, useRef, useEffect } from "react";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Camera, 
  User, 
  Users,
  Building, 
  Loader2, 
  Sparkles, 
  Briefcase, 
  Calendar, 
  Shield, 
  Database,
  CheckCircle
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useStudents } from "@/hooks/useStudents";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const UserProfile = () => {
  const { profile, loading, updateProfile, uploadAvatar } = useProfile();
  const { user } = useAuth();
  const { students } = useStudents();
  
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states matching database fields
  const [formData, setFormData] = useState({
    displayName: profile?.displayName || '',
    organization: profile?.organization || '',
    isAutonomous: profile?.isAutonomous || false
  });

  // Local storage based state for extra SaaS fields (headline, bio)
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");

  // WhatsApp Gateway states
  const [waUrl, setWaUrl] = useState("");
  const [waToken, setWaToken] = useState("");
  const [waReminderEnabled, setWaReminderEnabled] = useState(false);
  const [waReminderTemplate, setWaReminderTemplate] = useState("");
  const [waConfirmEnabled, setWaConfirmEnabled] = useState(false);
  const [waConfirmTemplate, setWaConfirmTemplate] = useState("");
  const [waReschedEnabled, setWaReschedEnabled] = useState(false);
  const [waReschedTemplate, setWaReschedTemplate] = useState("");

  // Sync extra fields and WhatsApp settings from localStorage
  useEffect(() => {
    if (user?.id) {
      const storedHeadline = localStorage.getItem(`speakboard_profile_headline_${user.id}`);
      const storedBio = localStorage.getItem(`speakboard_profile_bio_${user.id}`);
      if (storedHeadline) setHeadline(storedHeadline);
      if (storedBio) setBio(storedBio);

      setWaUrl(localStorage.getItem(`speakboard_wa_url_${user.id}`) || "https://api.whatsapp-gateway.com/send");
      setWaToken(localStorage.getItem(`speakboard_wa_token_${user.id}`) || "");
      setWaReminderEnabled(localStorage.getItem(`speakboard_wa_rem_enabled_${user.id}`) === "true");
      setWaReminderTemplate(localStorage.getItem(`speakboard_wa_rem_template_${user.id}`) || "Olá {student_name}, lembrete de que teremos aula hoje às {class_time}. Até já!");
      setWaConfirmEnabled(localStorage.getItem(`speakboard_wa_conf_enabled_${user.id}`) === "true");
      setWaConfirmTemplate(localStorage.getItem(`speakboard_wa_conf_template_${user.id}`) || "Olá {student_name}, confirme sua presença na aula do dia {class_date} às {class_time} respondendo a esta mensagem.");
      setWaReschedEnabled(localStorage.getItem(`speakboard_wa_resch_enabled_${user.id}`) === "true");
      setWaReschedTemplate(localStorage.getItem(`speakboard_wa_resch_template_${user.id}`) || "Olá {student_name}, sua aula foi reagendada para {class_date} às {class_time}.");
    }
  }, [user]);

  // Sync database profile fields
  useEffect(() => {
    if (profile) {
      setFormData({
        displayName: profile.displayName || '',
        organization: profile.organization || '',
        isAutonomous: profile.isAutonomous || false
      });
    }
  }, [profile]);

  const handleSave = async () => {
    await updateProfile(formData);
    if (user?.id) {
      localStorage.setItem(`speakboard_profile_headline_${user.id}`, headline);
      localStorage.setItem(`speakboard_profile_bio_${user.id}`, bio);
    }
    setIsEditing(false);
  };

  const handleSaveWhatsApp = () => {
    if (user?.id) {
      localStorage.setItem(`speakboard_wa_url_${user.id}`, waUrl);
      localStorage.setItem(`speakboard_wa_token_${user.id}`, waToken);
      localStorage.setItem(`speakboard_wa_rem_enabled_${user.id}`, String(waReminderEnabled));
      localStorage.setItem(`speakboard_wa_rem_template_${user.id}`, waReminderTemplate);
      localStorage.setItem(`speakboard_wa_conf_enabled_${user.id}`, String(waConfirmEnabled));
      localStorage.setItem(`speakboard_wa_conf_template_${user.id}`, waConfirmTemplate);
      localStorage.setItem(`speakboard_wa_resch_enabled_${user.id}`, String(waReschedEnabled));
      localStorage.setItem(`speakboard_wa_resch_template_${user.id}`, waReschedTemplate);
      toast.success("Integrações do WhatsApp salvas com sucesso!");
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const avatarUrl = await uploadAvatar(file);
    if (avatarUrl) {
      await updateProfile({ avatarUrl });
    }
    setUploading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Account creation date
  const memberSince = profile?.createdAt 
    ? format(new Date(profile.createdAt), "MMMM 'de' yyyy", { locale: ptBR })
    : "Junho de 2026";

  return (
    <div className="p-4 md:p-8 w-full max-w-none px-4 md:px-10 space-y-8 animate-fade-in">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold bg-gradient-primary bg-clip-text text-transparent">
            Configurações do Perfil
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie seu cadastro profissional, preferências e dados da conta.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Avatar Card & SaaS details */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main Info Card */}
          <Card className="border-border/40 bg-card/50 backdrop-blur-sm shadow-elegant rounded-2xl">
            <CardHeader className="flex flex-row items-center gap-4 pb-4">
              {/* Avatar Uploader */}
              <div className="relative w-20 h-20 flex-shrink-0">
                <Avatar className="w-20 h-20 border-2 border-primary/20 shadow-medium">
                  <AvatarImage src={profile?.avatarUrl} />
                  <AvatarFallback className="bg-gradient-interactive text-white text-xl font-bold">
                    {profile?.displayName?.charAt(0).toUpperCase() || <User className="w-6 h-6" />}
                  </AvatarFallback>
                </Avatar>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-card border-2 border-background shadow-soft hover:bg-muted"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Camera className="w-3.5 h-3.5" />
                  )}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </div>

              <div>
                <CardTitle className="text-xl font-bold text-foreground">
                  {profile?.displayName || 'Professor'}
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                  <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20 rounded-full font-semibold">
                    {profile?.isAutonomous ? "Autônomo" : (profile?.organization || "Educador")}
                  </Badge>
                  <span>&bull;</span>
                  <span>Membro desde {memberSince}</span>
                </CardDescription>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-5">
              <div className="space-y-4">
                
                {/* Email (Readonly) */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    E-mail da Conta
                  </Label>
                  <Input
                    id="email"
                    value={user?.email || ''}
                    disabled
                    className="bg-muted/30 border-border/40 text-muted-foreground"
                  />
                </div>

                {/* Display Name */}
                <div className="space-y-2">
                  <Label htmlFor="displayName" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Nome Completo
                  </Label>
                  <Input
                    id="displayName"
                    value={isEditing ? formData.displayName : (profile?.displayName || '')}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    disabled={!isEditing}
                    placeholder="Como você gostaria de ser chamado?"
                    className="border-border/40 bg-card focus-visible:ring-primary/50"
                  />
                </div>

                {/* Specialty Headline (SaaS addition) */}
                <div className="space-y-2">
                  <Label htmlFor="headline" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Especialidade / Cargo
                  </Label>
                  <Input
                    id="headline"
                    value={isEditing ? headline : (headline || '')}
                    onChange={(e) => setHeadline(e.target.value)}
                    disabled={!isEditing}
                    placeholder="Ex: Professor de Inglês Particular / Linguista"
                    className="border-border/40 bg-card focus-visible:ring-primary/50"
                  />
                </div>

                {/* Bio / Methodology (SaaS addition) */}
                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Metodologia & Bio
                  </Label>
                  <Textarea
                    id="bio"
                    value={isEditing ? bio : (bio || '')}
                    onChange={(e) => setBio(e.target.value)}
                    disabled={!isEditing}
                    placeholder="Descreva brevemente sua metodologia de ensino ou história profissional..."
                    rows={4}
                    className="border-border/40 bg-card focus-visible:ring-primary/50 resize-none text-sm leading-relaxed"
                  />
                </div>

                <Separator className="bg-border/30" />

                {/* Autonomous Switch */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3.5 rounded-xl border border-border/40 bg-muted/20">
                    <div className="flex items-center space-x-3">
                      <Briefcase className="w-5 h-5 text-primary" />
                      <div>
                        <Label htmlFor="autonomous" className="font-bold text-sm text-foreground">
                          Trabalho de forma autônoma
                        </Label>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Ative se você não faz parte de uma franquia ou escola.
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="autonomous"
                      checked={isEditing ? formData.isAutonomous : (formData.isAutonomous || false)}
                      onCheckedChange={(checked) => setFormData({ ...formData, isAutonomous: checked })}
                      disabled={!isEditing}
                    />
                  </div>

                  {/* Organization (conditionally rendered) */}
                  {!(isEditing ? formData.isAutonomous : formData.isAutonomous) && (
                    <div className="space-y-2 animate-fade-in">
                      <Label htmlFor="organization" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-primary" />
                        Organização / Empresa
                      </Label>
                      <Input
                        id="organization"
                        value={isEditing ? formData.organization : (formData.organization || '')}
                        onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                        disabled={!isEditing}
                        placeholder="Nome da sua escola ou instituto de idiomas"
                        className="border-border/40 bg-card focus-visible:ring-primary/50"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-3">
                {isEditing ? (
                  <>
                    <Button onClick={handleSave} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold rounded-xl text-xs py-4 shadow-soft">
                      Salvar Alterações
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        // Reset forms
                        setFormData({
                          displayName: profile?.displayName || '',
                          organization: profile?.organization || '',
                          isAutonomous: profile?.isAutonomous || false
                        });
                        if (user?.id) {
                          setHeadline(localStorage.getItem(`speakboard_profile_headline_${user.id}`) || "");
                          setBio(localStorage.getItem(`speakboard_profile_bio_${user.id}`) || "");
                        }
                      }}
                      className="flex-1 rounded-xl text-xs py-4"
                    >
                      Cancelar
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="gradient"
                    className="flex-1 rounded-xl text-xs py-4 shadow-soft"
                  >
                    Editar Perfil
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Account Stats and Integration Cards */}
        <div className="space-y-6">
          
          {/* SaaS Statistics Card */}
          <Card className="border-border/40 bg-card/50 backdrop-blur-sm shadow-elegant rounded-2xl">
            <CardHeader className="pb-3 border-b border-border/30">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                Métricas de Conta
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {/* Stat 1 */}
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary/60" /> Alunos Gerenciados
                </span>
                <span className="font-bold text-foreground">{students.length}</span>
              </div>
              
              {/* Stat 2 */}
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500/80" /> Plano / Nível
                </span>
                <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20 font-bold text-[10px] uppercase rounded-full">
                  Premium Core
                </Badge>
              </div>

              {/* Stat 3 */}
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500/80" /> Status da Conta
                </span>
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-bold text-[10px] uppercase rounded-full">
                  Ativa
                </Badge>
              </div>

              {/* Stat 4 */}
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Database className="w-4 h-4 text-blue-500/80" /> Sincronização
                </span>
                <span className="text-xs font-semibold text-emerald-500 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Nuvem Supabase
                </span>
              </div>

              {/* Stat 5 */}
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-purple-500/80" /> Criado em
                </span>
                <span className="font-medium text-xs text-muted-foreground">
                  {profile?.createdAt ? format(new Date(profile.createdAt), "dd/MM/yyyy") : "03/06/2026"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* WhatsApp Notification Gateway Configuration */}
          <Card className="border-border/40 bg-card/50 backdrop-blur-sm shadow-elegant rounded-2xl">
            <CardHeader className="pb-3 border-b border-border/30">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Integração WhatsApp Gateway
              </CardTitle>
              <CardDescription className="text-xs">
                Configure as credenciais e modelos de notificações automáticas para alunos.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="waUrl" className="text-xs font-bold text-foreground">API Endpoint URL</Label>
                  <Input
                    id="waUrl"
                    type="url"
                    value={waUrl}
                    onChange={(e) => setWaUrl(e.target.value)}
                    placeholder="https://api.whatsapp-gateway.com/send"
                    className="h-9 text-xs border-border/40 bg-card/40 focus-visible:ring-primary/50 rounded-lg"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="waToken" className="text-xs font-bold text-foreground">Token de Autenticação</Label>
                  <Input
                    id="waToken"
                    type="password"
                    value={waToken}
                    onChange={(e) => setWaToken(e.target.value)}
                    placeholder="Seu token de API secreto"
                    className="h-9 text-xs border-border/40 bg-card/40 focus-visible:ring-primary/50 rounded-lg"
                  />
                </div>
              </div>

              <Separator className="bg-border/20 my-4" />

              <div className="space-y-5">
                {/* 1. Lembrete de Aula */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-foreground">Lembrete de Aula Automático</h4>
                      <p className="text-[10px] text-muted-foreground">Envia lembretes antes do início das aulas.</p>
                    </div>
                    <Switch
                      checked={waReminderEnabled}
                      onCheckedChange={setWaReminderEnabled}
                    />
                  </div>
                  {waReminderEnabled && (
                    <div className="space-y-1 animate-slide-down">
                      <Label className="text-[10px] font-bold text-muted-foreground">Template de Mensagem</Label>
                      <Textarea
                        value={waReminderTemplate}
                        onChange={(e) => setWaReminderTemplate(e.target.value)}
                        placeholder="Template de lembrete..."
                        className="text-xs min-h-[60px] border-border/40 bg-card/40 focus-visible:ring-primary/50 rounded-lg"
                      />
                      <p className="text-[9px] text-muted-foreground">Variáveis disponíveis: <code className="font-semibold text-primary">{`{student_name}`}</code>, <code className="font-semibold text-primary">{`{class_time}`}</code></p>
                    </div>
                  )}
                </div>

                {/* 2. Confirmação de Aula */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-foreground">Confirmação de Presença</h4>
                      <p className="text-[10px] text-muted-foreground">Envia solicitações de confirmação antecipada.</p>
                    </div>
                    <Switch
                      checked={waConfirmEnabled}
                      onCheckedChange={setWaConfirmEnabled}
                    />
                  </div>
                  {waConfirmEnabled && (
                    <div className="space-y-1 animate-slide-down">
                      <Label className="text-[10px] font-bold text-muted-foreground">Template de Mensagem</Label>
                      <Textarea
                        value={waConfirmTemplate}
                        onChange={(e) => setWaConfirmTemplate(e.target.value)}
                        placeholder="Template de confirmação..."
                        className="text-xs min-h-[60px] border-border/40 bg-card/40 focus-visible:ring-primary/50 rounded-lg"
                      />
                      <p className="text-[9px] text-muted-foreground">Variáveis disponíveis: <code className="font-semibold text-primary">{`{student_name}`}</code>, <code className="font-semibold text-primary">{`{class_date}`}</code>, <code className="font-semibold text-primary">{`{class_time}`}</code></p>
                    </div>
                  )}
                </div>

                {/* 3. Reagendamento de Aula */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-foreground">Notificação de Reagendamento</h4>
                      <p className="text-[10px] text-muted-foreground">Envia alerta quando uma aula for alterada.</p>
                    </div>
                    <Switch
                      checked={waReschedEnabled}
                      onCheckedChange={setWaReschedEnabled}
                    />
                  </div>
                  {waReschedEnabled && (
                    <div className="space-y-1 animate-slide-down">
                      <Label className="text-[10px] font-bold text-muted-foreground">Template de Mensagem</Label>
                      <Textarea
                        value={waReschedTemplate}
                        onChange={(e) => setWaReschedTemplate(e.target.value)}
                        placeholder="Template de reagendamento..."
                        className="text-xs min-h-[60px] border-border/40 bg-card/40 focus-visible:ring-primary/50 rounded-lg"
                      />
                      <p className="text-[9px] text-muted-foreground">Variáveis disponíveis: <code className="font-semibold text-primary">{`{student_name}`}</code>, <code className="font-semibold text-primary">{`{class_date}`}</code>, <code className="font-semibold text-primary">{`{class_time}`}</code></p>
                    </div>
                  )}
                </div>
              </div>

              <Button
                onClick={handleSaveWhatsApp}
                className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-semibold rounded-xl text-xs py-3 mt-2 shadow-soft transition-transform duration-300 hover:scale-[1.02]"
              >
                Salvar Integrações
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};