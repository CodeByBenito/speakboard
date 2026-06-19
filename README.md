# SpeakBoard CRM 🚀

Um sistema moderno, elegante e de alto desempenho para gestão pedagógica e controle financeiro de professores autônomos e escolas de idiomas. Desenvolvido com **React**, **TypeScript**, **Tailwind CSS**, **shadcn/ui** e integrado ao **Supabase**.

---

## ✨ Funcionalidades Principais

### 📊 CRM de Alunos
* **CRUD Completo**: Cadastro e gerenciamento de alunos (nome, idade, nível, contato e dados de aulas).
* **Controle de Progresso**: Acompanhamento visual da taxa de conclusão de aulas contratadas vs. ministradas.
* **Cronograma Pedagógico**: Próximas aulas agendadas com tópicos/temas e datas associadas.
* **Níveis Personalizados**: Badges visuais indicando o nível do estudante (*Iniciante*, *Intermediário*, *Avançado*).

### 💰 Gestão Financeira & Cobrança Integrada
* **Métricas SaaS**: Visão consolidada de Volume de Portfólio, Receita Mensal Recebida, Ticket Médio e Taxa de Adimplência.
* **Controle de Status**: Alinhamento de faturas com status de pagamento (*Pago*, *Pendente*, *Atrasado*).
* **Meta de Faturamento**: Barra de progresso dinâmica em relação a uma meta mensal definida.
* **Integração com WhatsApp**: Geração automática de mensagens de lembrete de cobrança personalizadas com link direto para envio em um clique.

### 📝 Histórico Detalhado do Aluno
* **Histórico de Aulas**: Registro de tópicos, datas e observações de aulas anteriores (com status *Concluída*, *Cancelada* ou *Remarcada*).
* **Relatórios Pedagógicos**: Registro de observações comportamentais, pontos a melhorar e feedbacks (com suporte a edição e exclusão).
* **Histórico Financeiro**: Lista de lançamentos recebidos, pendentes e atrasados, com datas de vencimento.

### 🔐 Autenticação Segura & Perfis
* **Fluxo Completo de Acesso**: Telas de login, cadastro com verificação obrigatória de e-mail e recuperação de senha.
* **Row Level Security (RLS)**: Proteção robusta dos dados diretamente no banco de dados. Cada usuário tem acesso estrito apenas aos seus próprios dados.
* **Perfis Personalizados**: Configuração do professor com avatar (upload integrado ao storage do Supabase), nome, especialidade e metodologia.

### 👨‍💼 Painel Administrativo
* **Estatísticas Globais**: Monitoramento de total de usuários, alunos cadastrados e administradores do sistema.
* **Saúde do Sistema**: Status em tempo real dos serviços (Banco de dados, API, Autenticação).
* **Controle de Acesso**: Ferramenta integrada para promoção de novos administradores de forma segura.

---

## 🎨 Design System & Experiência Visual

O SpeakBoard foi projetado com uma experiência visual premium baseada nas seguintes diretrizes:
* **Tema Escuro Nativo**: Interface otimizada para longos períodos de uso, com tons de grafite profundo e preto puro.
* **Identidade Laranja Néon**: Destaques visuais e sombras utilizando gradientes e glows laranja néon que guiam a atenção do usuário de forma moderna.
* **Efeitos de Vidro (Glassmorphism)**: Painéis com desfoque de fundo (`backdrop-blur-xl`) e bordas translúcidas sutis.
* **Barras de Rolagem Customizadas**: Scrollbars globais ultrafinos e arredondados que permanecem discretos e transicionam para o laranja neon vibrante no hover.

---

## 🛠️ Tecnologias Utilizadas

* **Vite + React 18 + TypeScript**: Ferramental de desenvolvimento rápido e tipagem estática segura.
* **Tailwind CSS + shadcn/ui**: Estilização baseada em utilitários e componentes acessíveis (Radix UI).
* **Supabase**: Backend serverless que fornece banco de dados relacional PostgreSQL, autenticação, storage (buckets de imagens) e RLS.
* **Recharts**: Gráficos cumulativos interativos para visualizar a curva de aprendizado e progresso dos alunos.
* **Date-fns**: Biblioteca utilitária para formatação e manipulação de datas de forma local (`pt-BR`).
* **Lucide React**: Biblioteca moderna de ícones vetoriais.

---

## 📁 Estrutura de Diretórios

```
speakboard/
├── src/
│   ├── components/
│   │   ├── admin/           # Telas e ferramentas do Painel Admin
│   │   ├── dashboard/       # Sidebar CRM, Histórico, Modais e Tabela de Alunos
│   │   ├── finance/         # Gráficos, métricas SaaS e fluxo de caixa
│   │   ├── profile/         # Upload de avatar e informações do professor
│   │   └── ui/              # Componentes de interface base (shadcn/ui customizados)
│   ├── hooks/               # Hooks de conexão (auth, profile, students, history, etc.)
│   ├── pages/               # Páginas roteadas (Auth, Index, Password reset, NotFound)
│   ├── integrations/        # Cliente de inicialização do Supabase
│   ├── lib/                 # Funções utilitárias do projeto
│   ├── types/               # Tipagens e interfaces TypeScript
│   ├── App.tsx              # Roteamento e provedores globais
│   ├── index.css            # Estilos de base, variáveis HSL e scrollbars customizados
│   └── main.tsx             # Ponto de entrada do React
├── supabase/
│   ├── migrations/          # Scripts SQL de estrutura de banco de dados
│   └── config.toml          # Configuração básica do projeto Supabase
└── package.json             # Dependências e scripts do Node.js
```

---

## 🚀 Como Executar Localmente

### 1. Pré-requisitos
* Ter o **Node.js** instalado (versão 18 ou superior).
* Recomendado: utilizar **npm** ou **bun** para gerenciar dependências.

### 2. Passos de Configuração

1. **Clone o repositório**:
   ```bash
   git clone <url-do-repositorio>
   cd speakboard/speakboard
   ```

2. **Instale as dependências**:
   ```bash
   npm install
   # ou se preferir bun:
   bun install
   ```

3. **Configure as variáveis de ambiente**:
   Crie um arquivo `.env` na raiz da pasta `speakboard` e adicione as suas credenciais do Supabase:
   ```env
   VITE_SUPABASE_URL=https://seu-projeto.supabase.co
   VITE_SUPABASE_ANON_KEY=sua-chave-anon-publica-aqui
   ```

4. **Inicie o servidor de desenvolvimento**:
   ```bash
   npm run dev
   # ou
   bun run dev
   ```
   A aplicação estará disponível em `http://localhost:5173`.

---

## 🔒 Configuração do Supabase & Segurança

### 1. Migrações e Tabelas
As tabelas principais do banco de dados PostgreSQL são gerenciadas na pasta `supabase/migrations/` e incluem:
* **`profiles`**: Dados estendidos dos usuários (professores).
* **`students`**: Dados cadastrais dos alunos de cada usuário.
* **`class_history`**: Registro de aulas concluídas e relatórios pedagógicos.
* **`payment_history`**: Histórico detalhado de lançamentos financeiros.
* **`user_roles`**: Perfis de privilégio (identifica administradores).

### 2. Criando o Primeiro Administrador
Para liberar o acesso ao painel do Admin, você precisa promover um usuário no banco de dados. No **SQL Editor** do Supabase, execute:

```sql
-- 1. Encontre o ID do usuário através do email cadastrado
SELECT id, email FROM auth.users WHERE email = 'seu-email@exemplo.com';

-- 2. Promova o usuário a admin (substitua o ID retornado no passo 1)
INSERT INTO public.user_roles (user_id, role)
VALUES ('USER_ID_AQUI', 'admin'::app_role)
ON CONFLICT (user_id, role) DO NOTHING;
```

### 3. Configuração das URLs de Redirecionamento de Auth
Para o correto funcionamento do fluxo de confirmação de e-mail e recuperação de senha, configure no dashboard do Supabase (**Authentication -> URL Configuration**):
* **Site URL**: `http://localhost:5173` (ou a URL de produção)
* **Redirect URLs**: `http://localhost:5173/**` (ou a URL de produção com `/**`)

---

## 📦 Build para Produção

Para gerar o build otimizado para produção:
```bash
npm run build
```
Os arquivos estáticos prontos para deploy serão criados na pasta `dist/`. O projeto está pronto para ser hospedado em plataformas como **Vercel**, **Netlify** ou **GitHub Pages**.

---

Desenvolvido para ser robusto, seguro, escalável e visualmente espetacular. 🚀