import { useState } from 'react';
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
  LayoutDashboard,
} from 'lucide-react';
import { CLASS_STATUS_LABELS, normalizeClassStatus } from '@/types/Session';
import { cn } from '@/lib/utils';
import { StudentDashboard } from './StudentDashboard';

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
  const [activeTab, setActiveTab] = useState<'overview' | 'students'>('overview');

  return (
    <div className="p-4 md:p-8 w-full max-w-none px-4 md:px-10 space-y-8 animate-fade-in">
      {/* Chalkboard / Quadro Negro Banner */}
      <div className="relative overflow-hidden rounded-3xl border-4 border-amber-800/60 bg-zinc-950 p-6 md:p-8 shadow-card text-white flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-900 via-neutral-950 to-zinc-950 opacity-95 pointer-events-none" />
        
        <div className="space-y-2.5 text-center md:text-left z-10">
          <Badge className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border border-amber-500/20 rounded-full py-1 px-3 font-semibold uppercase tracking-wider text-[9px]">
            Painel Pedagógico Speak&amp;Go Evolution 🎓
          </Badge>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white font-mono flex items-center justify-center md:justify-start gap-2">
            Quadro de Ensino 📝
          </h1>
          <p className="text-xs text-zinc-300 max-w-xl font-medium leading-relaxed">
            Monitore o progresso acadêmico, aulas semanais, evolução dos ciclos e pendências de seus estudantes em tempo real através do painel educativo.
          </p>
        </div>

        {!loading && (
          <div className="flex-shrink-0 flex items-center justify-center bg-zinc-900/60 border border-white/5 rounded-2xl p-4 backdrop-blur-md z-10 min-w-[140px]">
            <div className="text-center space-y-1">
              <span className="text-[9px] uppercase font-bold text-zinc-400 tracking-wider">Total de Alunos</span>
              <div className="text-3xl font-black text-primary font-mono animate-glow-pulse">
                {data.totalStudents}
              </div>
              <p className="text-[9px] text-zinc-500 font-semibold">Ativos no CRM</p>
            </div>
          </div>
        )}
      </div>

      {/* Visual Toggles (Abas) */}
      <div className="flex items-center gap-1.5 rounded-xl border border-border/40 p-1.5 bg-card/45 backdrop-blur-md shadow-soft w-fit">
        <button
          onClick={() => setActiveTab('overview')}
          className={cn(
            "px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 flex items-center gap-2",
            activeTab === 'overview'
              ? "bg-primary text-white shadow-soft scale-105"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <LayoutDashboard className="w-4 h-4" />
          Visão Geral
        </button>
        <button
          onClick={() => setActiveTab('students')}
          className={cn(
            "px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 flex items-center gap-2",
            activeTab === 'students'
              ? "bg-primary text-white shadow-soft scale-105"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Users className="w-4 h-4" />
          Gestão de Alunos (CRM)
        </button>
      </div>

      {activeTab === 'students' ? (
        <StudentDashboard />
      ) : loading ? (
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
                          Ciclo termina em{' '}
                          {new Date(c.end_date + 'T00:00:00').toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <Badge variant="outline" className="rounded-lg font-bold text-[10px] border-border/55">
                        Foco: {c.focus}
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
                Nenhuma pendência financeira.
              </div>
            ) : (
              <ul className="space-y-3">
                {data.financePending.map((f) => (
                  <li
                    key={f.id}
                    className="flex items-center justify-between rounded-xl border border-border/40 bg-muted/20 p-4 transition-all duration-300 hover:bg-muted/40"
                  >
                    <div>
                      <p className="text-sm font-bold text-foreground">{f.student_name}</p>
                      {f.payment_due_date && (
                        <p className="text-xs text-muted-foreground font-semibold mt-1">
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
