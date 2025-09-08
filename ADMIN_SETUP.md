# Guia de Configuração do Administrador

## Como criar o primeiro administrador

Este sistema requer pelo menos um usuário administrador para gerenciar outros usuários. Siga os passos abaixo para configurar o primeiro admin:

### Método 1: Via SQL (Recomendado)

1. Acesse o painel do Supabase em [supabase.com](https://supabase.com/dashboard)
2. Vá para seu projeto
3. Acesse "SQL Editor"
4. Execute o seguinte comando SQL (substitua `seu-email@exemplo.com` pelo email do administrador):

```sql
-- Primeiro, encontre o user_id do usuário que deve ser admin
SELECT id, email FROM auth.users WHERE email = 'seu-email@exemplo.com';

-- Depois, promova o usuário a admin (substitua USER_ID_AQUI pelo ID encontrado acima)
INSERT INTO public.user_roles (user_id, role)
VALUES ('USER_ID_AQUI', 'admin'::app_role)
ON CONFLICT (user_id, role) DO NOTHING;
```

### Método 2: Via Função do Sistema

1. Após ter pelo menos um administrador criado via SQL, você pode usar a função `promote_to_admin`:

```sql
SELECT promote_to_admin('email-do-usuario@exemplo.com');
```

### Verificação

Para verificar se o usuário foi promovido corretamente:

```sql
SELECT ur.role, u.email 
FROM user_roles ur 
JOIN auth.users u ON ur.user_id = u.id 
WHERE u.email = 'seu-email@exemplo.com';
```

## Funcionalidades do Administrador

Uma vez logado como administrador, você terá acesso a:

- **Dashboard Administrativo Completo**: Visão geral do sistema com estatísticas
- **Gerenciamento de Usuários**: Promover outros usuários a administradores
- **Monitoramento do Sistema**: Atividades e status em tempo real
- **Ferramentas de Sistema**: Notificações e backup de dados
- **Acesso Total aos Dados**: Visualizar e gerenciar todos os estudantes

## Configuração de Produção

Antes de colocar em produção, certifique-se de:

1. **Configurar URLs no Supabase**:
   - Site URL: `https://seudominio.com`
   - Redirect URLs: `https://seudominio.com/**`

2. **Verificar Configurações de Email**:
   - Confirme que as configurações de SMTP estão corretas no Supabase
   - Teste o envio de emails de confirmação

3. **Criar Primeiro Administrador**:
   - Use o método SQL acima para criar o primeiro admin
   - Faça login e teste todas as funcionalidades

4. **Backup de Segurança**:
   - Configure backups automáticos no Supabase
   - Documente credenciais de acesso de emergência

## Segurança

- O sistema usa Row Level Security (RLS) para proteger os dados
- Verificação por email obrigatória para novos usuários
- Senhas criptografadas e tokens seguros
- Admins podem promover outros usuários apenas via painel dedicado

---

**Nota**: Este sistema está pronto para produção com autenticação segura, verificação por email e painel administrativo completo.