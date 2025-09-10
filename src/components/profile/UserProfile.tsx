import { useState, useRef } from "react";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Camera, User, Building, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export const UserProfile = () => {
  const { profile, loading, updateProfile, uploadAvatar } = useProfile();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    displayName: profile?.displayName || '',
    organization: profile?.organization || '',
    isAutonomous: profile?.isAutonomous || false
  });

  const handleSave = async () => {
    await updateProfile(formData);
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
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card className="border-soft shadow-elegant">
        <CardHeader className="text-center">
          <div className="relative mx-auto w-24 h-24 mb-4">
            <Avatar className="w-24 h-24 border-2 border-primary/20">
              <AvatarImage src={profile?.avatarUrl} />
              <AvatarFallback className="bg-gradient-interactive text-white text-lg">
                <User className="w-8 h-8" />
              </AvatarFallback>
            </Avatar>
            <Button
              variant="outline"
              size="icon"
              className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-card border-2 border-background shadow-soft"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Camera className="w-4 h-4" />
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
          <CardTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Meu Perfil
          </CardTitle>
          <CardDescription>
            Personalize suas informações profissionais
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                value={user?.email || ''}
                disabled
                className="bg-muted/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName" className="text-sm font-medium">
                Nome de Exibição
              </Label>
              <Input
                id="displayName"
                value={isEditing ? formData.displayName : (profile?.displayName || '')}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                disabled={!isEditing}
                placeholder="Como você gostaria de ser chamado?"
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="autonomous"
                  checked={isEditing ? formData.isAutonomous : (profile?.isAutonomous || false)}
                  onCheckedChange={(checked) => setFormData({ ...formData, isAutonomous: checked })}
                  disabled={!isEditing}
                />
                <Label htmlFor="autonomous" className="text-sm font-medium flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Trabalho de forma autônoma
                </Label>
              </div>

              {!(isEditing ? formData.isAutonomous : profile?.isAutonomous) && (
                <div className="space-y-2">
                  <Label htmlFor="organization" className="text-sm font-medium flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    Organização/Empresa
                  </Label>
                  <Input
                    id="organization"
                    value={isEditing ? formData.organization : (profile?.organization || '')}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    disabled={!isEditing}
                    placeholder="Nome da sua escola, instituto ou empresa"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            {isEditing ? (
              <>
                <Button onClick={handleSave} className="flex-1">
                  Salvar Alterações
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      displayName: profile?.displayName || '',
                      organization: profile?.organization || '',
                      isAutonomous: profile?.isAutonomous || false
                    });
                  }}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </>
            ) : (
              <Button
                onClick={() => setIsEditing(true)}
                variant="gradient"
                className="flex-1"
              >
                Editar Perfil
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};