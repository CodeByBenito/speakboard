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
  <Card className="p-4 flex items-center gap-3">
    <div
      className={`p-2 rounded-lg ${
        tone === 'warning' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-primary/10 text-primary'
      }`}
    >
      {icon}
    </div>
    <div>
      <p className="text-2xl font-bold leading-none">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </div>
  </Card>
);

export const GeneralDashboard = () => {
  const { data, loading } = useDashboard();

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Visão geral do método Speak&amp;Go Evolution.
        </p>
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground">Carregando...</div>
      ) : (
        <>
          {/* Indicadores */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
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
          <Card className="p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              <h2 className="font-semibold">Alunos por status de ciclo</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Ciclo ativo', value: data.cycleStatus.ativo },
                { label: 'Concluído', value: data.cycleStatus.concluido },
                { label: 'Renovado', value: data.cycleStatus.renovado },
                { label: 'Sem ciclo', value: data.cycleStatus.semCiclo },
              ].map((s) => (
                <div key={s.label} className="rounded-lg border border-border/60 p-3">
                  <p className="text-xl font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Aulas da semana */}
            <Card className="p-5 space-y-3">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-primary" />
                <h2 className="font-semibold">Aulas da semana</h2>
              </div>
              {data.weekClasses.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma aula nesta semana.</p>
              ) : (
                <ul className="space-y-2">
                  {data.weekClasses.map((c) => (
                    <li
                      key={c.id}
                      className="flex items-center justify-between rounded-lg border border-border/60 p-3"
                    >
                      <div>
                        <p className="text-sm font-medium">{c.student_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {c.topic || 'Sem tema'} ·{' '}
                          {new Date(c.class_date).toLocaleString('pt-BR', {
                            weekday: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <Badge variant="secondary">
                        {CLASS_STATUS_LABELS[normalizeClassStatus(c.status)]}
                      </Badge>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            {/* Checkpoints a vencer */}
            <Card className="p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Flag className="w-5 h-5 text-primary" />
                <h2 className="font-semibold">Checkpoints a vencer (14 dias)</h2>
              </div>
              {data.upcomingCheckpoints.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum checkpoint próximo.</p>
              ) : (
                <ul className="space-y-2">
                  {data.upcomingCheckpoints.map((c, i) => (
                    <li
                      key={i}
                      className="flex items-center justify-between rounded-lg border border-border/60 p-3"
                    >
                      <div>
                        <p className="text-sm font-medium">{c.student_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {c.objetivo || 'Ciclo em andamento'}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {new Date(c.checkpoint_date + 'T00:00:00').toLocaleDateString('pt-BR')}
                      </Badge>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>

          {/* Pendências financeiras */}
          <Card className="p-5 space-y-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-500" />
              <h2 className="font-semibold">Pendências financeiras</h2>
            </div>
            {data.financePending.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma pendência. 🎉</p>
            ) : (
              <ul className="space-y-2">
                {data.financePending.map((f, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between rounded-lg border border-border/60 p-3"
                  >
                    <div>
                      <p className="text-sm font-medium">{f.student_name}</p>
                      {f.payment_due_date && (
                        <p className="text-xs text-muted-foreground">
                          Vence em{' '}
                          {new Date(f.payment_due_date + 'T00:00:00').toLocaleDateString('pt-BR')}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      {f.payment_amount != null && (
                        <p className="text-sm font-medium">
                          R$ {Number(f.payment_amount).toFixed(2)}
                        </p>
                      )}
                      <Badge
                        variant={f.payment_status === 'overdue' ? 'destructive' : 'secondary'}
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
