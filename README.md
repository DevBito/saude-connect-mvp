# Saúde Connect - MVP

Sistema de agendamento de consultas médicas online desenvolvido como MVP para o Projeto Integrador.

## Funcionalidades

- **Autenticação Segura**: Login e cadastro com JWT
- **Dashboard Intuitivo**: Visualização de consultas e estatísticas
- **Busca de Profissionais**: Filtros por especialidade e localização
- **Agendamento Online**: Sistema de agendamento com calendário
- **Histórico Médico**: Acompanhamento de consultas e resultados
- **Interface Mobile-First**: Design responsivo otimizado para dispositivos móveis
- **Painel Administrativo**: Gestão de profissionais e usuários

## Tecnologias

### Frontend
- **React 18** com Vite
- **React Router** para navegação
- **React Query** para gerenciamento de estado
- **React Hook Form** para formulários
- **Lucide React** para ícones
- **CSS Custom Properties** para estilização

### Backend
- **Node.js** com Express.js
- **PostgreSQL** como banco de dados
- **JWT** para autenticação
- **bcryptjs** para hash de senhas
- **Joi** para validação de dados
- **Helmet** para segurança

### Deploy
- **Vercel** para frontend e backend
- **Railway/Supabase** para banco de dados

## Estrutura do Projeto

```
saude-connect-mvp/
├── frontend/                 # Aplicação React
│   ├── src/
│   │   ├── components/      # Componentes reutilizáveis
│   │   ├── pages/          # Páginas da aplicação
│   │   ├── services/       # Chamadas para API
│   │   ├── context/        # Context API
│   │   └── styles/         # Estilos globais
│   └── package.json
├── backend/                 # API Node.js
│   ├── src/
│   │   ├── routes/         # Rotas da API
│   │   ├── middleware/     # Middlewares
│   │   ├── config/         # Configurações
│   │   └── app.js         # Aplicação principal
│   └── package.json
├── database/               # Scripts do banco
│   └── schema.sql         # Schema PostgreSQL
└── vercel.json           # Configuração de deploy
```

## Como Executar

### Pré-requisitos
- Node.js 18+
- PostgreSQL 14+
- npm ou yarn

### 1. Clone o repositório
```bash
git clone <url-do-repositorio>
cd saude-connect-mvp
```

### 2. Configure o banco de dados
```bash
# Crie o banco de dados
createdb saude_connect

# Execute o schema
psql saude_connect < database/schema.sql
```

### 3. Configure as variáveis de ambiente
```bash
# Copie o arquivo de exemplo
cp env.example .env

# Edite o arquivo .env com suas configurações
```

### 4. Instale as dependências
```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

### 5. Execute o projeto
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

A aplicação estará disponível em:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## Personas e Jornadas

### Cristina Almeida (35 anos)
- **Necessidade**: Agendamento ginecológico
- **Jornada**: Busca → Agendamento → Consulta → Resultados

### Marcos Vieira (25 anos)
- **Necessidade**: Consulta nutricional
- **Jornada**: Cadastro → Busca → Agendamento → Acompanhamento

### Maria Eduarda Santos (16 anos)
- **Necessidade**: Atendimento psicológico remoto
- **Jornada**: Cadastro → Triagem → Sessão online → Diário emocional

## Scripts Disponíveis

### Frontend
```bash
npm run dev      # Desenvolvimento
npm run build    # Build para produção
npm run preview  # Preview do build
npm run lint     # Linting
```

### Backend
```bash
npm run dev      # Desenvolvimento com nodemon
npm start        # Produção
npm test         # Testes
```

## Deploy no Vercel

### 1. Configure as variáveis de ambiente no Vercel
- `DATABASE_URL`: URL do banco PostgreSQL
- `JWT_SECRET`: Chave secreta para JWT
- `FRONTEND_URL`: URL do frontend

### 2. Deploy automático
```bash
# Conecte o repositório ao Vercel
vercel --prod
```

### 3. Configuração do banco
- Use Railway, Supabase ou Neon para PostgreSQL
- Configure a URL de conexão nas variáveis de ambiente

## Banco de Dados

### Principais Tabelas
- `users`: Usuários (pacientes)
- `professionals`: Profissionais de saúde
- `appointments`: Consultas agendadas
- `results`: Resultados e exames
- `reviews`: Avaliações
- `specialties`: Especialidades médicas

## Segurança

- Autenticação JWT
- Hash de senhas com bcrypt
- Validação de dados com Joi
- Rate limiting
- CORS configurado
- Headers de segurança com Helmet

## Próximos Passos

1. **Implementar funcionalidades restantes**:
   - Sistema de notificações
   - Upload de arquivos
   - Videochamadas
   - Pagamentos

2. **Melhorias de UX**:
   - PWA (Progressive Web App)
   - Notificações push
   - Modo offline

3. **Integrações**:
   - APIs de pagamento
   - Sistemas de telemedicina
   - Integração com laboratórios

## Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

## Equipe

- Desenvolvedor: [Seu Nome]
- Orientador: [Nome do Orientador]
- Instituição: [Nome da Instituição]

---

**Saúde Connect** - Conectando pessoas a profissionais de saúde qualificados..
