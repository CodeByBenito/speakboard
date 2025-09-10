import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StudentDashboard } from "@/components/dashboard/StudentDashboard";
import { FinancialDashboard } from "@/components/finance/FinancialDashboard";
import { UserProfile } from "@/components/profile/UserProfile";
import { Users, DollarSign, User } from "lucide-react";

export const MainTabs = () => {
  const [activeTab, setActiveTab] = useState("students");

  return (
    <div className="p-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="students" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Alunos
          </TabsTrigger>
          <TabsTrigger value="finance" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Financeiro
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Perfil
          </TabsTrigger>
        </TabsList>

        <TabsContent value="students">
          <StudentDashboard />
        </TabsContent>

        <TabsContent value="finance">
          <FinancialDashboard />
        </TabsContent>

        <TabsContent value="profile">
          <UserProfile />
        </TabsContent>
      </Tabs>
    </div>
  );
};