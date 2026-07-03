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
  Conteudo,
  ConteudoInput,
  CONTENT_TIPOS,
  CONTENT_NIVEIS,
  CONTENT_TEMAS_SUGERIDOS,
} from '@/types/Content';

interface ContentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (input: ConteudoInput) => Promise<void> | void;
  initial?: Conteudo | null;
}

export const ContentDialog = ({ isOpen, onClose, onSave, initial }: ContentDialogProps) => {
  const [titulo, setTitulo] = useState('');
  const [tema, setTema] = useState('');
  const [tipo, setTipo] = useState<string>('prompt');
  const [nivel, setNivel] = useState<string>('Todos');
  const [descricao, setDescricao] = useState('');
  const [link, setLink] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTitulo(initial?.titulo || '');
      setTema(initial?.tema || '');
      setTipo(initial?.tipo || 'prompt');
      setNivel(initial?.nivel || 'Todos');
      setDescricao(initial?.descricao || '');
      setLink(initial?.link || '');
    }
  }, [isOpen, initial]);

  const handleSave = async () => {
    if (!titulo.trim()) return;
    setSaving(true);
    await onSave({
      titulo: titulo.trim(),
      tema: tema || null,
      tipo,
      nivel,
      descricao: descricao || null,
      link: link || null,
    });
    setSaving(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initial ? 'Editar conteúdo' : 'Novo conteúdo'}</DialogTitle>
          <DialogDescription>
            Material da biblioteca (compartilhada entre professores).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="ct-titulo">Título</Label>
            <Input
              id="ct-titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex.: Warm-up: small talk de aeroporto"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={tipo} onValueChange={setTipo}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONTENT_TIPOS.map((t) => (
                    <SelectItem key={t.key} value={t.key}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Nível</Label>
              <Select value={nivel} onValueChange={setNivel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONTENT_NIVEIS.map((n) => (
                    <SelectItem key={n} value={n}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ct-tema">Tema</Label>
            <Input
              id="ct-tema"
              value={tema}
              onChange={(e) => setTema(e.target.value)}
              placeholder="Ex.: Viagem, Trabalho, Entrevista..."
              list="temas-sugeridos"
            />
            <datalist id="temas-sugeridos">
              {CONTENT_TEMAS_SUGERIDOS.map((t) => (
                <option key={t} value={t} />
              ))}
            </datalist>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ct-link">Link / arquivo (URL)</Label>
            <Input
              id="ct-link"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ct-desc">Descrição</Label>
            <Textarea
              id="ct-desc"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows={3}
              placeholder="Como usar este material, objetivo, etc."
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving || !titulo.trim()}>
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
