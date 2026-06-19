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

  // Sync extra fields from localStorage
  useEffect(() => {
    if (user?.id) {
      const storedHeadline = localStorage.getItem(`speakboard_profile_headline_${user.id}`);
      const storedBio = localStorage.getItem(`speakboard_profile_bio_${user.id}`);
      if (storedHeadline) setHeadline(storedHeadline);
      if (storedBio) setBio(storedBio);
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
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
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

          {/* Educational Integrations Preview */}
          <Card className="border-border/40 bg-card/50 backdrop-blur-sm shadow-elegant rounded-2xl">
            <CardHeader className="pb-3 border-b border-border/30">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                SaaS Integrações
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <p className="text-xs text-muted-foreground leading-relaxed mb-1">
                Conecte suas ferramentas educacionais para sincronizar notas e agendas automaticamente.
              </p>
              
              {/* Google Classroom */}
              <div className="flex justify-between items-center p-2.5 border border-border/30 bg-muted/20 rounded-xl hover:bg-muted/40 transition-colors">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-emerald-600/10 text-emerald-600 flex items-center justify-center rounded-lg text-xs font-bold">G</div>
                  <span className="text-xs font-semibold">Google Classroom</span>
                </div>
                <Badge variant="secondary" className="text-[9px] bg-muted/60 text-muted-foreground rounded-full border border-border/50">Disponível</Badge>
              </div>

              {/* Microsoft Teams */}
              <div className="flex justify-between items-center p-2.5 border border-border/30 bg-muted/20 rounded-xl hover:bg-muted/40 transition-colors">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-blue-600/10 text-blue-600 flex items-center justify-center rounded-lg text-xs font-bold">M</div>
                  <span className="text-xs font-semibold">Microsoft Teams</span>
                </div>
                <Badge variant="secondary" className="text-[9px] bg-muted/60 text-muted-foreground rounded-full border border-border/50">Disponível</Badge>
              </div>

              {/* WhatsApp Business */}
              <div className="flex justify-between items-center p-2.5 border border-border/30 bg-muted/20 rounded-xl hover:bg-muted/40 transition-colors">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-emerald-500/10 text-emerald-500 flex items-center justify-center rounded-lg text-xs font-bold">W</div>
                  <span className="text-xs font-semibold">WhatsApp Gateway</span>
                </div>
                <Badge className="text-[9px] bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 rounded-full font-bold">Ativo</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};