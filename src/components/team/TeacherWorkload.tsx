import { useTeacherWorkload } from '@/hooks/useTeacherWorkload';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users2, GraduationCap, CalendarDays } from 'lucide-react';

export const TeacherWorkload = () => {
  const { rows, loading, isAdmin } = useTeacherWorkload();

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users2 className="w-6 h-6 text-primary" />
          Equipe — carga de trabalho
        </h1>
        <p className="text-sm text-muted-foreground">
          {isAdmin
            ? 'Alunos e aulas da semana por professor.'
            : 'Sua carga de trabalho nesta semana.'}
        </p>
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground">Carregando...</div>
      ) : rows.length === 0 ? (
        <Card className="p-10 text-center text-muted-foreground">
          Nenhum dado de carga de trabalho disponível.
        </Card>
      ) : (
        <div className="space-y-3">
          {rows.map((r) => (
            <Card key={r.user_id} className="p-4">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">
                    {r.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium">{r.name}</p>
                    <p className="text-xs text-muted-foreground">Professor(a)</p>
                  </div>
                </div>

                <div className="flex items-center gap-5">
                  <div className="text-center">
                    <p className="text-xl font-bold">{r.totalStudents}</p>
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Users2 className="w-3 h-3" /> Alunos
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold">{r.activeStudents}</p>
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <GraduationCap className="w-3 h-3" /> Ciclos ativos
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold">{r.weekClasses}</p>
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <CalendarDays className="w-3 h-3" /> Aulas/semana
                    </p>
                  </div>
                </div>
              </div>

              {r.weekClasses >= 15 && (
                <div className="mt-2">
                  <Badge variant="destructive">Carga alta nesta semana</Badge>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
