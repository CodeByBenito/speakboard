import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Conteudo, ConteudoInput } from '@/types/Content';
import { toast } from 'sonner';

interface Filters {
  search?: string;
  tipo?: string; // '' = todos
  nivel?: string; // '' = todos
}

// Biblioteca de Conteúdo (compartilhada). Busca por tema/nível/tipo/texto.
export const useContents = () => {
  const { user } = useAuth();
  const [contents, setContents] = useState<Conteudo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({ search: '', tipo: '', nivel: '' });

  const fetchContents = useCallback(async () => {
    if (!user) {
      setContents([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('conteudos')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setContents((data as Conteudo[]) || []);
    } catch (error) {
      console.error('Error fetching contents:', error);
      toast.error('Erro ao carregar a biblioteca');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchContents();
  }, [fetchContents]);

  const filtered = useMemo(() => {
    const q = (filters.search || '').toLowerCase().trim();
    return contents.filter((c) => {
      if (filters.tipo && c.tipo !== filters.tipo) return false;
      if (filters.nivel && c.nivel !== filters.nivel) return false;
      if (q) {
        const hay = `${c.titulo} ${c.tema ?? ''} ${c.descricao ?? ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [contents, filters]);

  const addContent = async (input: ConteudoInput) => {
    if (!user) return;
    try {
      const { error } = await supabase.from('conteudos').insert({
        user_id: user.id,
        titulo: input.titulo,
        tema: input.tema ?? null,
        tipo: input.tipo,
        nivel: input.nivel,
        descricao: input.descricao ?? null,
        link: input.link ?? null,
      });
      if (error) throw error;
      toast.success('Conteúdo adicionado');
      await fetchContents();
    } catch (error) {
      console.error('Error adding content:', error);
      toast.error('Erro ao adicionar conteúdo');
    }
  };

  const updateContent = async (id: number, input: ConteudoInput) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('conteudos')
        .update({
          titulo: input.titulo,
          tema: input.tema ?? null,
          tipo: input.tipo,
          nivel: input.nivel,
          descricao: input.descricao ?? null,
          link: input.link ?? null,
        })
        .eq('id', id);
      if (error) throw error;
      toast.success('Conteúdo atualizado');
      await fetchContents();
    } catch (error) {
      console.error('Error updating content:', error);
      toast.error('Erro ao atualizar conteúdo');
    }
  };

  const deleteContent = async (id: number) => {
    if (!user) return;
    try {
      const { error } = await supabase.from('conteudos').delete().eq('id', id);
      if (error) throw error;
      toast.success('Conteúdo removido');
      await fetchContents();
    } catch (error) {
      console.error('Error deleting content:', error);
      toast.error('Erro ao remover conteúdo (só o dono ou admin pode)');
    }
  };

  return {
    contents,
    filtered,
    loading,
    filters,
    setFilters,
    addContent,
    updateContent,
    deleteContent,
    refetch: fetchContents,
  };
};
