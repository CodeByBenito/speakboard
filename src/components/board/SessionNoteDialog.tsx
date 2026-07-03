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
import { StudentDisplay } from '@/types/Student';
import {
  ClassSession,
  SessionNoteInput,
  CLASS_STATUS_VALUES,
  CLASS_STATUS_LABELS,
} from '@/types/Session';
import { Conteudo } from '@/types/Content';

interface SessionNoteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (input: SessionNoteInput, opts: { id?: string; student_id?: number }) => Promise<void> | void;
  initial?: ClassSession | null;
  students: StudentDisplay[];
  contents?: Conteudo[];
  defaultStatus?: string;
}

export const SessionNoteDialog = ({
  isOpen,
  onClose,
  onSave,
  initial,
  students,
  contents = [],
  defaultStatus = 'scheduled',
}: SessionNoteDialogProps) => {
  const [studentId, setStudentId] = useState<string>('');
  const [date, setDate] = useState('');
  const [status, setStatus] = useState<string>(defaultStatus);
  const [topic, setTopic] = useState('');
  const [contexto, setContexto] = useState('');
  const [vocabulario, setVocabulario] = useState('');
  const [pontosAtencao, setPontosAtencao] = useState('');
  const [missao, setMissao] = useState('');
  const [conteudoId, setConteudoId] = useState<string>('none');
  const [saving, setSaving] = useState(false);

  const isEdit = !!initial;

  useEffect(() => {
    if (isOpen) {
      setStudentId(initial ? String(initial.student_id) : '');
      setDate(
        initial
          ? new Date(initial.class_date).toISOString().slice(0, 16)
          : new Date().toISOString().slice(0, 16),
      );
      setStatus(initial?.status || defaultStatus);
      setTopic(initial?.topic || '');
      setContexto(initial?.contexto || '');
      setVocabulario(initial?.vocabulario || '');
      setPontosAtencao(initial?.pontos_atencao || '');
      setMissao(initial?.missao_pos_aula || '');
      setConteudoId(initial?.conteudo_id ? String(initial.conteudo_id) : 'none');
    }
  }, [isOpen, initial, defaultStatus]);

  const handleSave = async () => {
    setSaving(true);
    const input: SessionNoteInput = {
      class_date: new Date(date).toISOString(),
      status,
      topic: topic || null,
      contexto: contexto || null,
      vocabulario: vocabulario || null,
      pontos_atencao: pontosAtencao || null,
      missao_pos_aula: missao || null,
      conteudo_id: conteudoId === 'none' ? null : parseInt(conteudoId),
    };
    await onSave(input, {
      id: initial?.id,
      student_id: studentId ? parseInt(studentId) : undefined,
    });
    setSaving(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar aula' : 'Nova aula'}</DialogTitle>
          <DialogDescription>
            Registre a aula e sua Session Note (tema, vocabulário, pontos de atenção, missão).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Aluno</Label>
              <Select value={studentId} onValueChange={setStudentId} disabled={isEdit}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CLASS_STATUS_VALUES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {CLASS_STATUS_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sn-date">Data e hora</Label>
            <Input
              id="sn-date"
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sn-topic">Tema / contexto</Label>
            <Input
              id="sn-topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Ex.: Job interview"
            />
          </div>

          {contents.length > 0 && (
            <div className="space-y-2">
              <Label>Material da biblioteca (opcional)</Label>
              <Select value={conteudoId} onValueChange={setConteudoId}>
                <SelectTrigger>
                  <SelectValue placeholder="Anexar material" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {contents.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.titulo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="sn-contexto">Contexto da aula</Label>
            <Textarea
              id="sn-contexto"
              value={contexto}
              onChange={(e) => setContexto(e.target.value)}
              rows={2}
              placeholder="Situação/objetivo da sessão"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sn-vocab">Vocabulário / estruturas trabalhadas</Label>
            <Textarea
              id="sn-vocab"
              value={vocabulario}
              onChange={(e) => setVocabulario(e.target.value)}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sn-pontos">Pontos de atenção</Label>
            <Textarea
              id="sn-pontos"
              value={pontosAtencao}
              onChange={(e) => setPontosAtencao(e.target.value)}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sn-missao">Missão pós-aula</Label>
            <Textarea
              id="sn-missao"
              value={missao}
              onChange={(e) => setMissao(e.target.value)}
              rows={2}
              placeholder="Tarefa prática até a próxima aula"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving || (!isEdit && !studentId)}>
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
