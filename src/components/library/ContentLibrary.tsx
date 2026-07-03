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
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export const ContentLibrary = () => {
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const { filtered, loading, filters, setFilters, addContent, updateContent, deleteContent } =
    useContents();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Conteudo | null>(null);
  const [openedDrawers, setOpenedDrawers] = useState<Record<string, boolean>>({});

  const toggleDrawer = (tipoKey: string) => {
    setOpenedDrawers(prev => ({
      ...prev,
      [tipoKey]: !prev[tipoKey]
    }));
  };

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
    <div className="p-4 md:p-8 w-full max-w-none px-4 md:px-10 space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 border-b border-border/30 pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold bg-gradient-primary bg-clip-text text-transparent flex items-center gap-2">
            <Library className="w-7 h-7 text-primary" />
            Biblioteca de Conteúdo Pedagógico
          </h1>
          <p className="text-xs text-muted-foreground mt-1 font-semibold">
            Explore materiais, apostilas e mídias compartilhados no armário digital institucional.
          </p>
        </div>
        <Button onClick={openNew} className="rounded-lg h-9 text-xs font-semibold">
          <Plus className="w-4 h-4 mr-1" /> Novo Material
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="p-5 space-y-4 border-border/40 bg-card/25 backdrop-blur-sm animate-pulse rounded-2xl">
              <div className="h-4 bg-muted rounded w-2/3"></div>
              <div className="flex gap-1.5">
                <div className="h-5 bg-muted rounded w-16"></div>
                <div className="h-5 bg-muted rounded w-16"></div>
              </div>
              <div className="h-12 bg-muted rounded w-full"></div>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 border border-dashed border-border/50 rounded-3xl bg-muted/10 text-muted-foreground text-center animate-scale-in">
          <Library className="w-12 h-12 text-muted-foreground/30 mb-3" />
          <p className="text-sm font-semibold">Nenhum material encontrado</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs">Use a barra de filtros para redefinir sua busca ou crie um novo material.</p>
          <Button onClick={openNew} size="sm" className="mt-4">
            <Plus className="w-3.5 h-3.5 mr-1" /> Adicionar Material
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {CONTENT_TIPOS.map((tipo) => {
            const items = filtered.filter(c => c.tipo === tipo.key);
            if (items.length === 0) return null; // Only show active drawers
            
            const isOpen = openedDrawers[tipo.key] !== false; // Open by default
            
            return (
              <Card 
                key={tipo.key} 
                className={cn(
                  "border-border/40 bg-card/30 backdrop-blur-md shadow-card rounded-2xl overflow-hidden transition-all duration-500",
                  isOpen ? "border-primary/30" : "hover:border-primary/20"
                )}
              >
                {/* Cabinet Drawer Header with metal handle styling */}
                <div 
                  onClick={() => toggleDrawer(tipo.key)}
                  className="p-5 flex items-center justify-between cursor-pointer bg-muted/10 border-b border-border/30 hover:bg-muted/15 transition-all select-none group"
                >
                  <div className="flex items-center gap-2.5">
                    <Library className="w-5 h-5 text-primary group-hover:animate-bounce" />
                    <div>
                      <h3 className="font-bold text-sm text-foreground">{tipo.label}</h3>
                      <p className="text-[10px] text-muted-foreground font-semibold uppercase">{items.length} pastas</p>
                    </div>
                  </div>
                  
                  {/* Metal Handle graphic styling */}
                  <div className="w-16 h-4 rounded-md border border-neutral-700 bg-gradient-to-b from-neutral-800 to-neutral-600 shadow-[inset_0_1px_3px_rgba(255,255,255,0.2)] flex items-center justify-center relative">
                    <div className="absolute top-1/2 -translate-y-1/2 left-2 right-2 h-1 bg-neutral-900 rounded-sm"></div>
                  </div>
                </div>

                {/* Collapsible content (suspended folders list) */}
                <div className={cn(
                  "p-4 space-y-3.5 transition-all duration-500",
                  isOpen ? "max-h-[800px] opacity-100 overflow-y-auto" : "max-h-0 opacity-0 overflow-hidden p-0 border-none"
                )}>
                  {items.map((c) => (
                    <div 
                      key={c.id} 
                      className="p-4 rounded-xl border border-border/30 bg-card/60 backdrop-blur-sm shadow-soft hover-lift hover:border-primary/30 transition-all duration-300 flex flex-col gap-2.5 animate-scale-in relative group/folder"
                    >
                      {/* Suspended folder tab design decoration */}
                      <div className="absolute -top-1.5 left-6 px-3 py-0.5 rounded-t-md bg-primary/10 border-t border-x border-primary/25 text-[8px] font-bold text-primary tracking-widest uppercase">
                        {c.nivel}
                      </div>

                      <div className="flex items-start justify-between gap-2.5 pt-1">
                        <h4 className="font-bold text-xs leading-snug text-foreground flex-1 mt-0.5">{c.titulo}</h4>
                        {canManage(c) && (
                          <div className="flex gap-1 shrink-0">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6 hover:bg-muted"
                              onClick={(e) => { e.stopPropagation(); openEdit(c); }}
                            >
                              <Pencil className="w-3 h-3 text-muted-foreground" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6 text-destructive hover:bg-destructive/10"
                              onClick={(e) => {
                                e.stopPropagation();
                                toast.warning('Deseja excluir este material?', {
                                  description: 'Esta ação removerá o material permanentemente da biblioteca.',
                                  action: {
                                    label: 'Excluir',
                                    onClick: () => {
                                      deleteContent(c.id);
                                      toast.success('Material removido!');
                                    }
                                  }
                                });
                              }}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                      </div>

                      {c.descricao && (
                        <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">{c.descricao}</p>
                      )}

                      <div className="flex flex-wrap items-center justify-between mt-1 pt-2 border-t border-border/10">
                        {c.tema ? (
                          <Badge variant="outline" className="rounded-lg text-[9px] font-bold text-muted-foreground border-border/60">
                            {c.tema}
                          </Badge>
                        ) : <div />}
                        
                        {c.link && (
                          <a
                            href={c.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline font-bold transition-transform hover:translate-x-1"
                          >
                            <ExternalLink className="w-3 h-3" /> Abrir material
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
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
