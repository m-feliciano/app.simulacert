import {Routes, UrlMatchResult, UrlSegment} from '@angular/router';
import {PublicLayoutComponent} from './core/layouts/public-layout.component';
import {AppLayoutComponent} from './core/layouts/app-layout.component';
import {ExamsListComponent} from './features/exams/exams-list.component';
import {AttemptRunnerComponent} from './features/attempt/attempt-runner.component';
import {authGuard} from './core/guards/auth.guard';
import {ExamsSlugResolver} from './features/exams/exams-slug.resolver';

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function examsIdMatcher(segments: UrlSegment[]): UrlMatchResult | null {
  // Espera: ['exams', '<uuid>']
  if (segments.length === 2 && segments[0].path === 'exams' && uuidRegex.test(segments[1].path)) {
    return { consumed: segments, posParams: { id: segments[1] } } as UrlMatchResult;
  }
  return null;
}

export const routes: Routes = [
  { path: '', redirectTo: 'exams', pathMatch: 'full' },
  { path: '404', loadComponent: () => import('./features/not-found/not-found.component').then(m => m.NotFoundComponent) },
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: 'login', loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent) },
      { path: 'register', loadComponent: () => import('./features/auth/register.component').then(m => m.RegisterComponent) },
      { path: 'forgot-password', loadComponent: () => import('./features/auth/forgot-password.component').then(m => m.ForgotPasswordComponent) },
      { path: 'reset-password', loadComponent: () => import('./features/auth/reset-password.component').then(m => m.ResetPasswordComponent) },
      { path: 'auth/callback', loadComponent: () => import('./features/auth/auth-callback.component').then(m => m.AuthCallbackComponent) },
      { path: 'how-it-works', loadComponent: () => import('./features/how-it-works/how-it-works.component').then(m => m.HowItWorksComponent) },
      { path: 'termos-de-uso', loadComponent: () => import('./features/legal/terms-of-use.component').then(m => m.TermsOfUseComponent) },
      { path: 'contato', loadComponent: () => import('./features/legal/contact.component').then(m => m.ContactComponent) },
      { path: 'politica-de-privacidade', loadComponent: () => import('./features/legal/privacy-policy.component').then(m => m.PrivacyPolicyComponent) },
    ]
  },
  {
    path: '',
    component: AppLayoutComponent,
    children: [
      { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'achievements', loadComponent: () => import('./features/achievements/achievements.component').then(m => m.AchievementsComponent) },
      { path: 'exams', loadComponent: () => import('./features/exams/exams-list.component').then(m => m.ExamsListComponent) },
      { path: 'stats', loadComponent: () => import('./features/stats/stats.component').then(m => m.StatsComponent) },
      { matcher: examsIdMatcher, loadComponent: () => import('./features/exams/exam-detail.component').then(m => m.ExamDetailComponent) },
      { path: 'exams/:slug', resolve: { exam: ExamsSlugResolver }, loadComponent: () => import('./features/exams/exam-detail.component').then(m => m.ExamDetailComponent) },
    ]
  },
  {
    path: '',
    component: AppLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'attempt/:id/result', loadComponent: () => import('./features/result/result.component').then(m => m.ResultComponent) },
      { path: 'attempt/:id/questions', loadComponent: () => import('./features/attempt-result/attempt-questions-result.component').then(m => m.AttemptQuestionsResultComponent) },
      { path: 'admin', loadComponent: () => import('./features/admin/admin.component').then(m => m.AdminComponent) },
    ]
  },

  { path: 'attempt/:id/run', component: AttemptRunnerComponent, canActivate: [authGuard] },
  { path: '**', loadComponent: () => import('./features/not-found/not-found.component').then(m => m.NotFoundComponent)},
];
