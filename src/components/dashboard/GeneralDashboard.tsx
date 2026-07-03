import { useDashboard } from '@/hooks/useDashboard';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  CalendarDays,
  DollarSign,
  Flag,
  Target,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { CLASS_STATUS_LABELS, normalizeClassStatus } from '@/types/Session';

const StatBox = ({
  icon,
  label,
  value,
  tone = 'default',
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  tone?: 'default' | 'warning';
}) => (
  <Card className="p-4 flex items-center gap-4 border-border/40 bg-card/40 backdrop-blur-sm shadow-card hover-lift transition-all duration-300">
    <div
      className={`p-3 rounded-2xl ${
        tone === 'warning' ? 'bg-warning/10 text-warning' : 'bg-primary/10 text-primary'
      } shadow-soft`}
    >
      {icon}
    </div>
    <div>
      <p className="text-2xl font-black leading-none text-foreground tracking-tight">{value}</p>
      <p className="text-xs text-muted-foreground mt-1.5 font-medium">{label}</p>
    </div>
  </Card>
);

export const GeneralDashboard = () => {
  const { data, loading } = useDashboard();

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold bg-gradient-primary bg-clip-text text-transparent tracking-tight">
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground mt-1 font-medium">
          Visão geral do método Speak&amp;Go Evolution.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-xs font-semibold text-muted-foreground">Carregando painel...</p>
        </div>
      ) : (
        <>
          {/* Indicadores */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatBox
              icon={<Users className="w-5 h-5" />}
              label="Alunos"
              value={data.totalStudents}
            />
            <StatBox
              icon={<CalendarDays className="w-5 h-5" />}
              label="Aulas nesta semana"
              value={data.weekClasses.length}
            />
            <StatBox
              icon={<DollarSign className="w-5 h-5" />}
              label="Pendências financeiras"
              value={data.financePending.length}
              tone={data.financePending.length > 0 ? 'warning' : 'default'}
            />
            <StatBox
              icon={<Flag className="w-5 h-5" />}
              label="Checkpoints a vencer"
              value={data.upcomingCheckpoints.length}
              tone={data.upcomingCheckpoints.length > 0 ? 'warning' : 'default'}
            />
          </div>

          {/* Alunos por status de ciclo */}
          <Card className="p-6 space-y-4 border-border/40 bg-card/40 backdrop-blur-sm shadow-card">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              <h2 className="font-bold text-foreground">Alunos por status de ciclo</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Ciclo ativo', value: data.cycleStatus.ativo },
                { label: 'Concluído', value: data.cycleStatus.concluido },
                { label: 'Renovado', value: data.cycleStatus.renovado },
                { label: 'Sem ciclo', value: data.cycleStatus.semCiclo },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-border/40 bg-muted/20 p-4 transition-all duration-300 hover:bg-muted/45">
                  <p className="text-2xl font-black text-foreground tracking-tight">{s.value}</p>
                  <p className="text-xs text-muted-foreground font-semibold mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Aulas da semana */}
            <Card className="p-6 space-y-4 border-border/40 bg-card/40 backdrop-blur-sm shadow-card">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-primary" />
                <h2 className="font-bold text-foreground">Aulas da semana</h2>
              </div>
              {data.weekClasses.length === 0 ? (
                <div className="text-center py-10 bg-muted/20 border border-dashed rounded-2xl text-xs text-muted-foreground font-medium">
                  Nenhuma aula nesta semana.
                </div>
              ) : (
                <ul className="space-y-3">
                  {data.weekClasses.map((c) => (
                    <li
                      key={c.id}
                      className="flex items-center justify-between rounded-xl border border-border/40 bg-muted/20 p-4 transition-all duration-300 hover:bg-muted/40"
                    >
                      <div>
                        <p className="text-sm font-bold text-foreground">{c.student_name}</p>
                        <p className="text-xs text-muted-foreground font-medium mt-1">
                          {c.topic || 'Sem tema'} ·{' '}
                          {new Date(c.class_date).toLocaleString('pt-BR', {
                            weekday: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <Badge variant="secondary" className="rounded-lg font-bold text-[10px] uppercase">
                        {CLASS_STATUS_LABELS[normalizeClassStatus(c.status)]}
                      </Badge>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            {/* Checkpoints a vencer */}
            <Card className="p-6 space-y-4 border-border/40 bg-card/40 backdrop-blur-sm shadow-card">
              <div className="flex items-center gap-2">
                <Flag className="w-5 h-5 text-primary" />
                <h2 className="font-bold text-foreground">Checkpoints a vencer (14 dias)</h2>
              </div>
              {data.upcomingCheckpoints.length === 0 ? (
                <div className="text-center py-10 bg-muted/20 border border-dashed rounded-2xl text-xs text-muted-foreground font-medium">
                  Nenhum checkpoint próximo.
                </div>
              ) : (
                <ul className="space-y-3">
                  {data.upcomingCheckpoints.map((c, i) => (
                    <li
                      key={i}
                      className="flex items-center justify-between rounded-xl border border-border/40 bg-muted/20 p-4 transition-all duration-300 hover:bg-muted/40"
                    >
                      <div>
                        <p className="text-sm font-bold text-foreground">{c.student_name}</p>
                        <p className="text-xs text-muted-foreground font-medium mt-1">
                          {c.objetivo || 'Ciclo em andamento'}
                        </p>
                      </div>
                      <Badge variant="outline" className="rounded-lg font-bold text-[10px]">
                        {new Date(c.checkpoint_date + 'T00:00:00').toLocaleDateString('pt-BR')}
                      </Badge>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>

          {/* Pendências financeiras */}
          <Card className="p-6 space-y-4 border-border/40 bg-card/40 backdrop-blur-sm shadow-card">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-warning" />
              <h2 className="font-bold text-foreground">Pendências financeiras</h2>
            </div>
            {data.financePending.length === 0 ? (
              <div className="text-center py-10 bg-muted/20 border border-dashed rounded-2xl text-xs text-muted-foreground font-medium">
                Nenhuma pendência financeira pendente. 🎉
              </div>
            ) : (
              <ul className="space-y-3">
                {data.financePending.map((f, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between rounded-xl border border-border/40 bg-muted/20 p-4 transition-all duration-300 hover:bg-muted/40"
                  >
                    <div>
                      <p className="text-sm font-bold text-foreground">{f.student_name}</p>
                      {f.payment_due_date && (
                        <p className="text-xs text-muted-foreground font-medium mt-1">
                          Vence em{' '}
                          {new Date(f.payment_due_date + 'T00:00:00').toLocaleDateString('pt-BR')}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      {f.payment_amount != null && (
                        <p className="text-sm font-bold text-foreground">
                          R$ {Number(f.payment_amount).toFixed(2)}
                        </p>
                      )}
                      <Badge
                        variant={f.payment_status === 'overdue' ? 'destructive' : 'secondary'}
                        className="rounded-lg font-bold text-[10px] uppercase"
                      >
                        {f.payment_status === 'overdue' ? 'Atrasado' : 'Pendente'}
                      </Badge>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </>
      )}
    </div>
  );
};
