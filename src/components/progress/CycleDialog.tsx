import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Cycle,
  CycleInput,
  HABILIDADES,
  CICLO_STATUS_VALUES,
  CICLO_STATUS_LABELS,
  CICLO_TOTAL_SEMANAS,
  CicloStatus,
} from '@/types/Cycle';

interface CycleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (input: CycleInput) => Promise<unknown> | void;
  studentName?: string;
  initial?: Cycle | null;
}

export const CycleDialog = ({
  isOpen,
  onClose,
  onSave,
  studentName,
  initial,
}: CycleDialogProps) => {
  const [objetivo, setObjetivo] = useState('');
  const [semana, setSemana] = useState(1);
  const [status, setStatus] = useState<CicloStatus>('ativo');
  const [habilidades, setHabilidades] = useState<string[]>([]);
  const [proximoFoco, setProximoFoco] = useState('');
  const [checkpoint, setCheckpoint] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setObjetivo(initial?.objetivo || '');
      setSemana(initial?.semana_atual || 1);
      setStatus(initial?.status || 'ativo');
      setHabilidades(initial?.habilidades_prioritarias || []);
      setProximoFoco(initial?.proximo_foco || '');
      setCheckpoint(initial?.checkpoint_date || '');
    }
  }, [isOpen, initial]);

  const toggleHabilidade = (key: string) => {
    setHabilidades((prev) =>
      prev.includes(key) ? prev.filter((h) => h !== key) : [...prev, key],
    );
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave({
      objetivo: objetivo || null,
      semana_atual: semana,
      status,
      habilidades_prioritarias: habilidades,
      proximo_foco: proximoFoco || null,
      checkpoint_date: checkpoint || null,
    });
    setSaving(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initial ? 'Editar ciclo' : 'Novo ciclo'}</DialogTitle>
          <DialogDescription>
            {studentName ? `Aluno: ${studentName}. ` : ''}
            Um ciclo (Evolution Plan) dura {CICLO_TOTAL_SEMANAS} semanas.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="ciclo-objetivo">Objetivo do ciclo</Label>
            <Textarea
              id="ciclo-objetivo"
              value={objetivo}
              onChange={(e) => setObjetivo(e.target.value)}
              placeholder="Ex.: Ganhar fluência em reuniões de trabalho"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="ciclo-semana">Semana atual (1–{CICLO_TOTAL_SEMANAS})</Label>
              <Input
                id="ciclo-semana"
                type="number"
                min={1}
                max={CICLO_TOTAL_SEMANAS}
                value={semana}
                onChange={(e) =>
                  setSemana(
                    Math.min(
                      CICLO_TOTAL_SEMANAS,
                      Math.max(1, parseInt(e.target.value) || 1),
                    ),
                  )
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as CicloStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CICLO_STATUS_VALUES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {CICLO_STATUS_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Habilidades prioritárias</Label>
            <div className="flex flex-wrap gap-2">
              {HABILIDADES.map((h) => {
                const active = habilidades.includes(h.key);
                return (
                  <button
                    key={h.key}
                    type="button"
                    onClick={() => toggleHabilidade(h.key)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                      active
                        ? 'bg-primary text-white border-primary'
                        : 'bg-transparent text-muted-foreground border-border hover:border-primary/50'
                    }`}
                  >
                    {h.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ciclo-foco">Próximo foco</Label>
            <Textarea
              id="ciclo-foco"
              value={proximoFoco}
              onChange={(e) => setProximoFoco(e.target.value)}
              placeholder="O que trabalhar em seguida (aparece no Guia de Progresso)"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ciclo-checkpoint">Data do próximo checkpoint</Label>
            <Input
              id="ciclo-checkpoint"
              type="date"
              value={checkpoint}
              onChange={(e) => setCheckpoint(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar ciclo'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
