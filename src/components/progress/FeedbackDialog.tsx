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
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  FEEDBACK_AREAS,
  NIVEL_VALUES,
  NIVEL_LABELS,
  NivelPercebido,
  Feedback,
  FeedbackInput,
} from '@/types/Feedback';

interface FeedbackDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (input: FeedbackInput) => Promise<void> | void;
  cicloId?: number | null;
  studentName?: string;
  initial?: Feedback | null;
}

const emptyLevels = () =>
  Object.fromEntries(FEEDBACK_AREAS.map((a) => [a.key, null])) as Record<
    (typeof FEEDBACK_AREAS)[number]['key'],
    NivelPercebido | null
  >;

export const FeedbackDialog = ({
  isOpen,
  onClose,
  onSave,
  cicloId,
  studentName,
  initial,
}: FeedbackDialogProps) => {
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);
  const [observacao, setObservacao] = useState('');
  const [isConquista, setIsConquista] = useState(false);
  const [levels, setLevels] = useState(emptyLevels());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setData(initial?.data || new Date().toISOString().split('T')[0]);
      setObservacao(initial?.observacao || '');
      setIsConquista(initial?.is_conquista || false);
      const lv = emptyLevels();
      if (initial) {
        for (const a of FEEDBACK_AREAS) lv[a.key] = initial[a.key];
      }
      setLevels(lv);
    }
  }, [isOpen, initial]);

  const handleSave = async () => {
    setSaving(true);
    const input: FeedbackInput = {
      data,
      observacao: observacao || undefined,
      is_conquista: isConquista,
      ciclo_id: cicloId ?? null,
      ...levels,
    };
    await onSave(input);
    setSaving(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initial ? 'Editar feedback' : 'Registrar feedback'}</DialogTitle>
          <DialogDescription>
            {studentName ? `Aluno: ${studentName}. ` : ''}
            Avalie o nível percebido em cada área (opcional) e registre uma observação.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="feedback-date">Data</Label>
            <Input
              id="feedback-date"
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
            />
          </div>

          <div className="space-y-3">
            <Label>Nível percebido</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {FEEDBACK_AREAS.map((area) => (
                <div key={area.key} className="space-y-1">
                  <span className="text-xs text-muted-foreground">{area.label}</span>
                  <Select
                    value={levels[area.key] ?? 'none'}
                    onValueChange={(v) =>
                      setLevels((prev) => ({
                        ...prev,
                        [area.key]: v === 'none' ? null : (v as NivelPercebido),
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="—" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">—</SelectItem>
                      {NIVEL_VALUES.map((n) => (
                        <SelectItem key={n} value={n}>
                          {NIVEL_LABELS[n]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="feedback-obs">Observação</Label>
            <Textarea
              id="feedback-obs"
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              placeholder="O que evoluiu, pontos de atenção, contexto da avaliação..."
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border/60 p-3">
            <div>
              <Label htmlFor="feedback-conquista" className="cursor-pointer">
                Marcar como conquista
              </Label>
              <p className="text-xs text-muted-foreground">
                Conquistas aparecem no Guia de Progresso do aluno.
              </p>
            </div>
            <Switch
              id="feedback-conquista"
              checked={isConquista}
              onCheckedChange={setIsConquista}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar feedback'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
