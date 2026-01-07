# 🎓 simulacert

> Plataforma de simulados para certificações de TI (AWS, Azure, GCP)

[![Angular](https://img.shields.io/badge/Angular-17+-dd0031?logo=angular)](https://angular.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![Status](https://img.shields.io/badge/Status-MVP%20em%20Produ%C3%A7%C3%A3o-success)](https://simulacert.com)

---

## 📋 Sobre o Projeto

Plataforma cloud-native desenvolvida para apoiar profissionais de tecnologia na preparação para certificações de TI.

### 🎯 Funcionalidades Principais

- ✅ **Simulados Atualizados** - Questões alinhadas ao formato de exames reais
- 🤖 **Explicações com IA** - Assistente de estudo baseado em IA generativa
- 📊 **Análise de Desempenho** - Estatísticas detalhadas e evolução contínua
- 🎨 **Interface Moderna** - Design responsivo e acessível

---

## 🚀 Status do Projeto

### ✅ Sprint 1 Completa (06/01/2026)

- [x] Otimização de UX/Product/Growth
- [x] Simplificação do fluxo de registro
- [x] Empty state inteligente no dashboard
- [x] Melhoria no contexto das telas de autenticação
- [x] SEO básico implementado

**Documentação:**

- 📊 [Análise UX/Product](./UX_PRODUCT_ANALYSIS.md)
- ✅ [Sprint 1 Completa](./SPRINT_1_COMPLETED.md)
- 🎨 [Guia Visual](./VISUAL_GUIDE.md)
- ⚙️ [Instruções Backend](./BACKEND_INSTRUCTIONS.md)

---

## 🛠️ Tecnologias

### Frontend

- **Framework:** Angular 17+ (Standalone Components)
- **Linguagem:** TypeScript 5+
- **Estado:** Signals (Angular Reactivity)
- **Rotas:** Angular Router
- **HTTP:** HttpClient com Interceptors
- **Forms:** Reactive Forms

### Backend (API)

- **API:** REST
- **Autenticação:** JWT (Bearer Token)
- **Endpoint:** `https://api.simulacert.com`

### Arquitetura

```
src/
├── app/
│   ├── api/              # Serviços de API
│   │   ├── domain/       # Interfaces e modelos
│   │   └── config/       # Configuração da API
│   ├── core/             # Funcionalidades core
│   │   ├── auth/         # Facade de autenticação
│   │   ├── guards/       # Route guards
│   │   ├── interceptors/ # HTTP interceptors
│   │   └── layouts/      # Layouts da aplicação
│   ├── features/         # Features modulares
│   │   ├── auth/         # Login e Registro
│   │   ├── dashboard/    # Dashboard principal
│   │   ├── exams/        # Listagem de exames
│   │   ├── attempt/      # Simulados em andamento
│   │   ├── result/       # Resultados
│   │   └── stats/        # Estatísticas
│   └── shared/           # Componentes compartilhados
└── environments/         # Variáveis de ambiente
```

---

## 📦 Instalação

### Pré-requisitos

- Node.js 18+ e npm 9+
- Angular CLI 17+

### Setup

```bash
# Clonar repositório
git clone https://github.com/your-org/simulacert.git
cd simulacert

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp src/environments/environment.ts src/environments/environment.development.ts
# Editar environment.development.ts com suas configurações

# Rodar em desenvolvimento
npm start

# Build para produção
npm run build
```

---

## 🎮 Scripts Disponíveis

```bash
npm start          # Desenvolvimento (http://localhost:4200)
npm run build      # Build de produção
npm test           # Testes unitários
npm run lint       # Linting
```

---

## 📱 Fluxo do Usuário

### Novo Usuário

```
1. /login → Vê tagline e value props
2. /register → Cadastro simplificado (email + senha)
3. /dashboard → Empty state acolhedor
4. /exams → Escolhe certificação
5. /attempt → Inicia simulado
```

**Tempo estimado até ativação:** ~20 segundos ⚡

### Usuário Existente

```
1. /login → Faz login
2. /dashboard → Vê estatísticas e tentativas recentes
3. /attempt → Continua ou inicia novo simulado
```

---

## 🎨 Design System

### Cores

```css
--color-primary: #ff9900 /* Laranja AWS */
--color-primary-dark: #ec7211
--color-secondary: #37475a /* Azul escuro */
--color-dark: #232f3e
--color-success: #28a745
--color-warning: #ffc107
--color-danger: #d13212
```

### Espaçamento

```css
--spacing-xs:

4
px
--spacing-sm:

8
px
--spacing-md:

16
px
--spacing-lg:

24
px
--spacing-xl:

32
px
--spacing-xxl:

48
px
```

---

## 🔐 Autenticação

### Fluxo JWT

```
1. POST /api/v1/auth/login → Recebe token
2. Token armazenado em localStorage
3. JwtInterceptor adiciona header automaticamente
4. Token válido por 24h
```

### Proteção de Rotas

```typescript
// Rotas privadas (requer autenticação)
{
  path: 'dashboard', component
:
  DashboardComponent, canActivate
:
  [authGuard]
}

// Rotas admin (requer role ADMIN)
{
  path: 'admin', component
:
  AdminComponent, canActivate
:
  [authGuard, adminGuard]
}
```

---

## 📊 Métricas (Sprint 1)

| Métrica              | Antes | Depois | Melhoria |
|----------------------|-------|--------|----------|
| Time to First Action | 60s   | 20s    | 🔥 66%   |
| Activation Rate      | 40%   | 60%    | 📈 50%   |
| Bounce Rate          | 30%   | 15%    | 📉 50%   |
| Tempo de Cadastro    | 45s   | 25s    | ⚡ 44%    |

---

## 🚧 Roadmap

### ✅ Sprint 1 (Completa)

- [x] Análise UX/Product
- [x] Simplificação de registro
- [x] Empty state inteligente
- [x] Contexto em telas de auth

### 🟡 Sprint 2 (Próxima)

- [ ] Melhorar cards de exames (duração, questões, dificuldade)
- [ ] Página "Como Funciona"
- [ ] Quick start no dashboard
- [ ] Recuperação de senha

### 🟢 Sprint 3+

- [ ] Sistema de achievements
- [ ] Recomendação inteligente
- [ ] Modo "Practice" vs "Exam Mode"
- [ ] OAuth/SSO (Google, GitHub)

---

## 🤝 Contribuindo

### Workflow

```bash
# Criar branch
git checkout -b feature/nome-da-feature

# Fazer commits
git commit -m "feat: descrição da mudança"

# Push
git push origin feature/nome-da-feature

# Abrir Pull Request
```

### Padrões de Commit

- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Documentação
- `style:` Formatação
- `refactor:` Refatoração
- `test:` Testes
- `chore:` Tarefas de build/CI

---

## 📄 Licença

Proprietary - © 2026 simulacert

---

## 📞 Contato

- **Website:** [simulacert.com](https://simulacert.com)
- **API Docs:** [api.simulacert.com/docs](https://api.simulacert.com/docs)
- **Support:** support@simulacert.com

---

## 🏆 Time

Desenvolvido com ❤️ por profissionais para profissionais de TI.

**Stack:** Angular 17+ | TypeScript 5+ | Signals | Standalone Components

---

**Última atualização:** 06/01/2026  
**Versão:** 1.0.0 (Sprint 1 Complete)

