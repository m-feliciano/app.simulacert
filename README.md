# SimulaCert

## Documentation language

- 🇺🇸 English: see [README.en.md](./README.en.md)
- 🇧🇷 Português (este arquivo)

Plataforma gratuita de simulados para certificações de tecnologia (AWS, Azure, Google Cloud, etc).

Descrição

SimulaCert é uma plataforma destinada a apoiar profissionais na preparação para certificações de provedores de nuvem e outras certificações de TI. A aplicação fornece simulados, explicações, e ferramentas de análise de desempenho.

Status do projeto

- Framework frontend: Angular 21+
- Estado: Em constante aprimoramento, com diversas funcionalidades implementadas e melhorias contínuas planejadas.

Resumo das funcionalidades

- Simulados atualizados com questões no formato dos exames.
- Explicações geradas para apoiar o estudo.
- Estatísticas e análise de desempenho do usuário.
- Interface responsiva com foco em acessibilidade.
- Autenticação segura e gerenciamento de sessões.
- Não é necessário cadastro para acessar simulados, mas funcionalidades avançadas podem exigir login.

Visão geral da estrutura do repositório

O frontend segue a seguinte organização principal:

```
src/
├── app/
│   ├── api/              # Serviços de API e modelos
│   ├── core/             # Funcionalidades core (auth, guards, interceptors, layouts)
│   ├── features/         # Módulos/rotas por funcionalidade (auth, dashboard, exams, attempt, result, stats)
│   └── shared/           # Componentes e utilitários compartilhados
└── environments/         # Variáveis de ambiente
```

Pré-requisitos

- Node.js 18 ou superior
- npm 9 ou superior
- Angular CLI compatível com Angular 17

Instalação e execução em desenvolvimento

1. Clonar repositório

```bash
git clone https://github.com/your-org/simulacert.git
cd simulacert
```

2. Instalar dependências

```bash
npm install
```

3. Preparar variáveis de ambiente (copiar arquivo de exemplo)

```bash
cp src/environments/environment.ts src/environments/environment.development.ts
# editar src/environments/environment.development.ts conforme necessário
```

> Windows (PowerShell) alternative:
>
> ```powershell
> Copy-Item src\environments\environment.ts src\environments\environment.development.ts
> ```

4. Executar em modo de desenvolvimento

```bash
npm start
```

Scripts úteis

- npm start: Executa a aplicação em desenvolvimento (padrão: http://localhost:4200)
- npm run build: Gera build de produção
- npm test: Executa testes unitários
- npm run lint: Executa linting

Autenticação e segurança

- A aplicação usa JWT para autenticação. O token é normalmente armazenado no localStorage.
- Interceptors adicionam o header Authorization nas solicitações quando aplicável.
- Rotas privadas são protegidas por guards configurados em `app/core/guards`.

Observações de arquitetura e desenvolvimento

- Componentes standalone e Signals do Angular são utilizados para reatividade e composição.
- Evitar chamadas desnecessárias ao backend a partir de componentes de layout.
- Preferir rotas sem bloquear indexação pública para páginas legais (Termos, Política de Privacidade).

Guia rápido de contribuição

1. Criar branch com escopo da feature/bugfix
2. Fazer commits claros e atômicos
3. Executar testes e lint localmente
4. Abrir Pull Request com descrição e screenshots quando aplicável

Padrões de commit recomendados

- feat: Nova funcionalidade
- fix: Correção de bug
- docs: Documentação
- refactor: Refatoração
- test: Testes
- chore: Tarefas de build/CI

Licença e contato

Proprietary - © 2026 SimulaCert - Marcelo Feliciano

Website: https://simulacert.com
API: https://api.simulacert.com

Última atualização: 2026-04-10
