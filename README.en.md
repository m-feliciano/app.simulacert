# SimulaCert

## Documentation languages

- 🇧🇷 Português: see [README.md](./README.md)
- 🇺🇸 English (this file)

A free platform for practice exams (“simulados”) for technology certifications (AWS, Azure, Google Cloud, etc.).

## About

SimulaCert helps professionals prepare for cloud-provider and other IT certifications by offering practice exams, explanations, and performance analysis tools.

## Project status

- Frontend framework: Angular 21+
- Status: actively evolving (features implemented; continuous improvements planned)

## Feature highlights

- Up-to-date practice exams with exam-like question formats
- Explanations to support study and learning
- User statistics and performance analysis
- Responsive UI with an accessibility-first approach
- Secure authentication and session management
- No account required to access exams, but advanced features may require login

## Repository structure (high level)

```text
src/
├── app/
│   ├── api/              # API services and domain models
│   ├── core/             # Core features (auth, guards, interceptors, layouts)
│   ├── features/         # Feature-based routes (auth, dashboard, exams, attempt, result, stats)
│   └── shared/           # Shared components and utilities
└── environments/         # Environment variables
```

## Prerequisites

- Node.js 18+
- npm 9+
- Angular CLI compatible with Angular 17

## Installation & running (development)

1. Clone the repository

```bash
git clone https://github.com/your-org/simulacert.git
cd simulacert
```

2. Install dependencies

```bash
npm install
```

3. Prepare environment variables (copy the example file)

```bash
cp src/environments/environment.ts src/environments/environment.development.ts
# edit src/environments/environment.development.ts as needed
```

Windows (PowerShell) alternative:

```powershell
Copy-Item src\environments\environment.ts src\environments\environment.development.ts
```

4. Start the dev server

```bash
npm start
```

Default: http://localhost:4200

## Useful scripts

- `npm start`: Run the application in development
- `npm run build`: Create a production build
- `npm test`: Run unit tests
- `npm run lint`: Run linting

## Authentication & security notes

- The application uses JWT for authentication. The token is typically stored in `localStorage`.
- Interceptors add the `Authorization` header to requests when applicable.
- Private routes are protected by guards configured in `src/app/core/guards`.

## Architecture & development notes

- Standalone components and Angular Signals are used for reactivity and composition.
- Avoid unnecessary backend calls from layout components.
- Prefer publicly indexable routes for legal pages (Terms, Privacy Policy), when applicable.

## Contributing (quick guide)

1. Create a branch scoped to the feature/bugfix
2. Make clear, atomic commits
3. Run tests and lint locally
4. Open a Pull Request with description and screenshots (when applicable)

### Recommended commit prefixes

- `feat`: new feature
- `fix`: bug fix
- `docs`: documentation
- `refactor`: refactor
- `test`: tests
- `chore`: build/CI tasks

## License & contact

Proprietary — © 2026 SimulaCert — Marcelo Feliciano

Website: https://simulacert.com

API: https://api.simulacert.com

Last updated: 2026-04-10

