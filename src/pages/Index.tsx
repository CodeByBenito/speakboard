import { StudentDashboard } from "@/components/dashboard/StudentDashboard";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

const Index = () => {
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="flex justify-between items-center p-4 bg-card/50 backdrop-blur-sm border-b">
        <h1 className="text-xl font-semibold bg-gradient-primary bg-clip-text text-transparent">
          Controller Dashboard
        </h1>
        <Button onClick={handleSignOut} variant="ghost" size="sm">
          <LogOut className="w-4 h-4 mr-2" />
          Sair
        </Button>
      </div>
      <StudentDashboard />
    </div>
  );
};

export default Index;
