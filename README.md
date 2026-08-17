# SpeakBoard 🎓🚀

Plataforma profissional e moderna para gestão pedagógica, progresso acadêmico e controle financeiro de professores autônomos e escolas de idiomas. Desenvolvido com **React**, **TypeScript**, **Tailwind CSS**, **shadcn/ui** e integrado com **Supabase** (PostgreSQL com Row Level Security).

---

## 🏛️ Os 4 Pilares Centrais

### 1. 📅 Painel Geral & Aulas
* **Visão Geral Inteligente**: Métricas do dia (Alunos Ativos, Aulas na Semana, Pendências Financeiras e Checkpoints).
* **Controle de Status em 1 Clique**: Alterne o status das aulas entre *Agendada*, *Em Andamento*, *Concluída* e *Cancelada* com feedback tátil e instantâneo.
* **Alternância de Visualização**: Lista Dinâmica de Aulas ou Quadro Kanban com drag & drop.
* **Anotações Pedagógicas**: Modal de sessão para registrar vocabulário, contexto, pontos de atenção e missões pós-aula.

### 2. 🎓 Alunos & Progresso (Ficha Única Integrada)
* **Master-Detail Pedagógico**: Lista rápida e pesquisável à esquerda com filtro por níveis (*Iniciante*, *Intermediário*, *Avançado*) e ficha pedagógica completa à direita.
* **Ciclo de 12 Semanas**: Acompanhamento visual da evolução semanal e metas do estudante.
* **Snapshot de Habilidades**: Indicador visual de domínio em competências essenciais (*Speaking, Listening, Grammar, Vocabulary, Pronunciation*).
* **Feedbacks Contínuos**: Histórico de pontos fortes, pontos de melhoria e conquistas.
* **Ações Rápidas**: Contato direto via WhatsApp, agendamento de nova aula, edição de cadastro e histórico.

### 3. 💰 Financeiro & Cobrança
* **Métricas SaaS**: Volume de Portfólio, Receita Mensal Recebida, Ticket Médio e Taxa de Adimplência.
* **Controle de Status**: Monitoramento claro de pagamentos *Pagos*, *Pendentes* e *Atrasados*.
* **Meta de Faturamento**: Acompanhamento percentual de metas mensais.
* **Cobrança Rápida via WhatsApp**: Geração automática de mensagens de lembrete com link direto.

### 4. 📚 Biblioteca de Conteúdos
* **Organização de Materiais**: Gestão de PDFs, links, documentos e recursos pedagógicos categorizados por nível e módulo.

---

## 🔒 Segurança e Back-End

* **Row Level Security (RLS)**: Isolamento total dos dados de cada professor diretamente no PostgreSQL.
* **Controle de Permissões**: Funções de administrador (`admin` vs `user`) gerenciadas via roles seguras.
* **Proteção de Credenciais**: Variáveis de ambiente isoladas e protegidas contra vazamento.

---

## 🎨 Design System & Experiência de Uso

* **Visual EdTech Premium**: Estética SaaS moderna com glassmorphism sutil, tipografia nítida e alto contraste.
* **100% Responsivo**: Layout otimizado para desktop e dispositivos móveis com barra flutuante inferior e navegação fluida em 1 toque.

---

## 🛠️ Tecnologias Utilizadas

* **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, Lucide Icons, Radix UI.
* **Backend**: Supabase (PostgreSQL, Auth, RLS, Edge Functions).
* **Utilidades**: date-fns (locale pt-BR), sonner (toasts).

---

## 🚀 Como Executar Localmente

1. **Clone o repositório**:
   ```bash
   git clone <url-do-repositorio>
   cd speakboard/speakboard
   ```

2. **Instale as dependências**:
   ```bash
   npm install
   ```

3. **Inicie o servidor de desenvolvimento**:
   ```bash
   npm run dev
   ```

4. **Acesse no navegador**:
   ```
   http://localhost:8080
   ```