# Banco de Dados - Saúde Connect

## Setup do Banco de Dados

### 1. Configurar Supabase (Recomendado)

1. Acesse [supabase.com](https://supabase.com)
2. Crie uma nova conta ou faça login
3. Crie um novo projeto
4. Vá em **Settings > Database**
5. Copie a **Connection String** e substitua `[YOUR-PASSWORD]` pela senha do banco

### 2. Executar Schema SQL

1. Acesse o **SQL Editor** no Supabase
2. Copie o conteúdo do arquivo `schema.sql`
3. Execute o script para criar as tabelas

### 3. Configurar Variáveis de Ambiente

No Vercel, adicione as seguintes variáveis:

```
DATABASE_URL=postgresql://postgres:[SUA_SENHA]@db.xxxxx.supabase.co:5432/postgres
JWT_SECRET=sua_chave_jwt_super_segura
FRONTEND_URL=https://seu-frontend.vercel.app
NODE_ENV=production
```

### 4. Estrutura das Tabelas

#### Users (Pacientes)
- `id` - ID único
- `name` - Nome completo
- `email` - Email único
- `password` - Senha hash
- `phone` - Telefone
- `cpf` - CPF
- `created_at` - Data de criação
- `updated_at` - Data de atualização

#### Professionals (Profissionais)
- `id` - ID único
- `name` - Nome completo
- `email` - Email único
- `password` - Senha hash
- `specialty` - Especialidade médica
- `crm` - CRM único
- `phone` - Telefone
- `created_at` - Data de criação
- `updated_at` - Data de atualização

#### Appointments (Consultas)
- `id` - ID único
- `patient_id` - ID do paciente
- `professional_id` - ID do profissional
- `date` - Data da consulta
- `time` - Horário da consulta
- `notes` - Observações
- `status` - Status (scheduled, confirmed, completed, cancelled)
- `created_at` - Data de criação
- `updated_at` - Data de atualização

#### Admins (Administradores)
- `id` - ID único
- `name` - Nome completo
- `email` - Email único
- `password` - Senha hash
- `role` - Função (admin)
- `created_at` - Data de criação
- `updated_at` - Data de atualização

### 5. Dados de Exemplo

O schema inclui dados de exemplo:

**Admin:**
- Email: `admin@saudeconnect.com`
- Senha: `admin123`

**Profissional:**
- Email: `joao@saudeconnect.com`
- Senha: `prof123`

**Usuário:**
- Email: `maria@exemplo.com`
- Senha: `user123`

### 6. Testando a Conexão

Após configurar, teste a conexão:

```bash
GET https://seu-backend.vercel.app/health
```

Se retornar `"status": "OK"`, a conexão está funcionando!

### 7. Próximos Passos

1. Configure as variáveis de ambiente no Vercel
2. Faça deploy do backend
3. Teste os endpoints de autenticação
4. Configure o frontend para usar a API
