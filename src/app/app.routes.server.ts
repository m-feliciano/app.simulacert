import {RenderMode, ServerRoute} from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'exams',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'how-it-works',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'termos-de-uso',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'politica-de-privacidade',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'contato',
    renderMode: RenderMode.Prerender
  },
  // Rotas parametrizadas: SSR (não prerender) para não precisar de getPrerenderParams.
  {
    path: 'exams/:slug',
    renderMode: RenderMode.Server
  },
  // Rotas utilitárias/privadas: SSR.
  {
    path: 'login',
    renderMode: RenderMode.Server
  },
  {
    path: 'register',
    renderMode: RenderMode.Server
  },
  {
    path: 'forgot-password',
    renderMode: RenderMode.Server
  },
  {
    path: 'reset-password',
    renderMode: RenderMode.Server
  },
  {
    path: 'auth/callback',
    renderMode: RenderMode.Server
  },
  {
    path: 'dashboard',
    renderMode: RenderMode.Server
  },
  {
    path: 'stats',
    renderMode: RenderMode.Server
  },
  {
    path: 'attempt/:id/run',
    renderMode: RenderMode.Server
  },
  {
    path: 'attempt/:id/result',
    renderMode: RenderMode.Server
  },
  {
    path: 'attempt/:id/questions',
    renderMode: RenderMode.Server
  },
  // Fallback: SSR para qualquer outra rota, incluindo 404.
  {
    path: '**',
    renderMode: RenderMode.Server
  }
];
