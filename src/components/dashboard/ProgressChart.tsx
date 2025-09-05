import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Student } from "@/types/Student";
import { TrendingUp } from "lucide-react";

interface ProgressChartProps {
  students: Student[];
}

export const ProgressChart = ({ students }: ProgressChartProps) => {
  // Dados para gráfico de barras por nível
  const levelData = students.reduce((acc, student) => {
    const existing = acc.find(item => item.level === student.level);
    if (existing) {
      existing.completed += student.completedClasses;
      existing.pending += (student.totalClasses - student.completedClasses);
      existing.total += student.totalClasses;
    } else {
      acc.push({
        level: student.level,
        completed: student.completedClasses,
        pending: student.totalClasses - student.completedClasses,
        total: student.totalClasses
      });
    }
    return acc;
  }, [] as Array<{level: string, completed: number, pending: number, total: number}>);

  // Dados para gráfico de pizza geral
  const totalCompleted = students.reduce((sum, student) => sum + student.completedClasses, 0);
  const totalPending = students.reduce((sum, student) => sum + (student.totalClasses - student.completedClasses), 0);
  
  const pieData = [
    { name: 'Aulas Realizadas', value: totalCompleted, color: 'hsl(var(--success))' },
    { name: 'Aulas Pendentes', value: totalPending, color: 'hsl(var(--warning))' }
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card p-3 rounded-lg shadow-medium border">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.dataKey === 'completed' ? 'Realizadas' : 'Pendentes'}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-card p-3 rounded-lg shadow-medium border">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm" style={{ color: data.payload.color }}>
            {data.value} aulas ({((data.value / (totalCompleted + totalPending)) * 100).toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Gráfico de Barras por Nível */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Progresso por Nível
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={levelData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="level" 
                className="text-xs"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                className="text-xs"
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="completed" 
                fill="hsl(var(--success))" 
                name="Realizadas"
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="pending" 
                fill="hsl(var(--warning))" 
                name="Pendentes"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico de Pizza Geral */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Visão Geral
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<PieTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          
          <div className="flex justify-center gap-6 mt-4">
            {pieData.map((entry, index) => (
              <div key={index} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm font-medium">{entry.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};