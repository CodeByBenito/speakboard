import { useState, useEffect } from 'react';
import { useWeeklyPlanner } from '@/hooks/useWeeklyPlanner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { CalendarRange, Plus, Pencil, Trash2, CheckCircle2, Circle } from 'lucide-react';
import { WeeklyPlan } from '@/types/WeeklyPlanner';
import { toast } from 'sonner';

interface WeeklyPlannerCardProps {
  cicloId: number | null;
  editable: boolean;
}

const TOTAL_SEMANAS = 8;

export const WeeklyPlannerCard = ({ cicloId, editable }: WeeklyPlannerCardProps) => {
  const { plans, upsertPlan, toggleStatus, deletePlan } = useWeeklyPlanner(cicloId);
  const [open, setOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<WeeklyPlan | null>(null);
  const [semana, setSemana] = useState(1);
  const [objetivo, setObjetivo] = useState('');
  const [missao, setMissao] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setSemana(editingPlan?.semana || nextFreeWeek());
      setObjetivo(editingPlan?.objetivo || '');
      setMissao(editingPlan?.missao || '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editingPlan]);

  const nextFreeWeek = () => {
    const used = new Set(plans.map((p) => p.semana));
    for (let i = 1; i <= TOTAL_SEMANAS; i++) if (!used.has(i)) return i;
    return 1;
  };

  const openNew = () => {
    setEditingPlan(null);
    setOpen(true);
  };
  const openEdit = (p: WeeklyPlan) => {
    setEditingPlan(p);
    setOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    await upsertPlan(
      { semana, objetivo: objetivo || null, missao: missao || null },
      editingPlan?.id,
    );
    setSaving(false);
    setOpen(false);
  };

  if (!cicloId) return null;

  return (
    <Card className="p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarRange className="w-5 h-5 text-primary" />
          <h2 className="font-semibold">Planner semanal</h2>
        </div>
        {editable && (
          <Button size="sm" onClick={openNew}>
            <Plus className="w-4 h-4 mr-1" /> Nova semana
          </Button>
        )}
      </div>

      {plans.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nenhuma semana planejada ainda.
        </p>
      ) : (
        <ul className="space-y-2">
          {plans.map((p) => (
            <li
              key={p.id}
              className="rounded-lg border border-border/60 p-3 flex items-start gap-3"
            >
              <button
                onClick={() => editable && toggleStatus(p)}
                className={`mt-0.5 shrink-0 ${editable ? 'cursor-pointer' : 'cursor-default'}`}
                title={editable ? 'Alternar status' : undefined}
              >
                {p.status === 'concluida' ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : (
                  <Circle className="w-5 h-5 text-muted-foreground" />
                )}
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Semana {p.semana}</Badge>
                  {p.status === 'concluida' && (
                    <span className="text-xs text-green-500">Concluída</span>
                  )}
                </div>
                {p.objetivo && <p className="text-sm mt-1">{p.objetivo}</p>}
                {p.missao && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Missão: {p.missao}
                  </p>
                )}
              </div>
              {editable && (
                <div className="flex gap-1 shrink-0">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={() => openEdit(p)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors"
                    onClick={() => {
                      toast.warning('Deseja remover esta semana?', {
                        description: 'Esta ação não poderá ser desfeita.',
                        action: {
                          label: 'Excluir',
                          onClick: () => {
                            deletePlan(p.id);
                            toast.success('Semana excluída com sucesso!');
                          }
                        }
                      });
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {editable && (
        <Dialog open={open} onOpenChange={(o) => !o && setOpen(false)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingPlan ? 'Editar semana' : 'Nova semana'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="wp-semana">Semana (1–{TOTAL_SEMANAS})</Label>
                <Input
                  id="wp-semana"
                  type="number"
                  min={1}
                  max={TOTAL_SEMANAS}
                  value={semana}
                  onChange={(e) =>
                    setSemana(
                      Math.min(TOTAL_SEMANAS, Math.max(1, parseInt(e.target.value) || 1)),
                    )
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wp-obj">Objetivo da semana</Label>
                <Textarea
                  id="wp-obj"
                  value={objetivo}
                  onChange={(e) => setObjetivo(e.target.value)}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wp-missao">Missão prática</Label>
                <Textarea
                  id="wp-missao"
                  value={missao}
                  onChange={(e) => setMissao(e.target.value)}
                  rows={2}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Salvando...' : 'Salvar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
};
