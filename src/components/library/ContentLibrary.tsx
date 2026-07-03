import { useState } from 'react';
import { useContents } from '@/hooks/useContents';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Library, Plus, Pencil, Trash2, ExternalLink, Search } from 'lucide-react';
import {
  Conteudo,
  ConteudoInput,
  CONTENT_TIPOS,
  CONTENT_NIVEIS,
  tipoLabel,
} from '@/types/Content';
import { ContentDialog } from './ContentDialog';

export const ContentLibrary = () => {
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const { filtered, loading, filters, setFilters, addContent, updateContent, deleteContent } =
    useContents();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Conteudo | null>(null);

  const canManage = (c: Conteudo) => isAdmin || c.user_id === user?.id;

  const openNew = () => {
    setEditing(null);
    setDialogOpen(true);
  };
  const openEdit = (c: Conteudo) => {
    setEditing(c);
    setDialogOpen(true);
  };
  const handleSave = async (input: ConteudoInput) => {
    if (editing) await updateContent(editing.id, input);
    else await addContent(input);
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Library className="w-6 h-6 text-primary" />
            Biblioteca de Conteúdo
          </h1>
          <p className="text-sm text-muted-foreground">
            Materiais compartilhados entre os professores.
          </p>
        </div>
        <Button onClick={openNew}>
          <Plus className="w-4 h-4 mr-1" /> Novo conteúdo
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Buscar por título, tema ou descrição..."
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
          />
        </div>
        <Select
          value={filters.tipo || 'all'}
          onValueChange={(v) => setFilters((f) => ({ ...f, tipo: v === 'all' ? '' : v }))}
        >
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            {CONTENT_TIPOS.map((t) => (
              <SelectItem key={t.key} value={t.key}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.nivel || 'all'}
          onValueChange={(v) => setFilters((f) => ({ ...f, nivel: v === 'all' ? '' : v }))}
        >
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Nível" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os níveis</SelectItem>
            {CONTENT_NIVEIS.map((n) => (
              <SelectItem key={n} value={n}>
                {n}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground">Carregando...</div>
      ) : filtered.length === 0 ? (
        <Card className="p-10 text-center text-muted-foreground">
          Nenhum conteúdo encontrado. Adicione o primeiro material da biblioteca.
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <Card key={c.id} className="p-4 space-y-3 flex flex-col">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-sm leading-snug">{c.titulo}</h3>
                {canManage(c) && (
                  <div className="flex gap-1 shrink-0">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => openEdit(c)}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-destructive"
                      onClick={() => {
                        if (window.confirm('Remover este conteúdo?')) deleteContent(c.id);
                      }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5">
                <Badge variant="secondary">{tipoLabel(c.tipo)}</Badge>
                <Badge variant="outline">{c.nivel}</Badge>
                {c.tema && <Badge variant="outline">{c.tema}</Badge>}
              </div>

              {c.descricao && (
                <p className="text-xs text-muted-foreground flex-1">{c.descricao}</p>
              )}

              {c.link && (
                <a
                  href={c.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-auto"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Abrir material
                </a>
              )}
            </Card>
          ))}
        </div>
      )}

      <ContentDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
        initial={editing}
      />
    </div>
  );
};
