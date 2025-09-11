import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StudentDashboard } from "@/components/dashboard/StudentDashboard";
import { FinancialDashboard } from "@/components/finance/FinancialDashboard";
import { UserProfile } from "@/components/profile/UserProfile";
import { Users, DollarSign, User } from "lucide-react";

export const MainTabs = () => {
  const [activeTab, setActiveTab] = useState("students");

  return (
    <div className="p-4 sm:p-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4 sm:mb-6 h-12 sm:h-10">
          <TabsTrigger value="students" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
            <Users className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Alunos</span>
            <span className="sm:hidden">Alunos</span>
          </TabsTrigger>
          <TabsTrigger value="finance" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
            <DollarSign className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Financeiro</span>
            <span className="sm:hidden">Finanças</span>
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
            <User className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Perfil</span>
            <span className="sm:hidden">Perfil</span>
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