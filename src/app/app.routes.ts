import {Routes, UrlSegment, UrlMatchResult} from '@angular/router';
import {PublicLayoutComponent} from './core/layouts/public-layout.component';
import {AppLayoutComponent} from './core/layouts/app-layout.component';
import {LoginComponent} from './features/auth/login.component';
import {RegisterComponent} from './features/auth/register.component';
import {ForgotPasswordComponent} from './features/auth/forgot-password.component';
import {ResetPasswordComponent} from './features/auth/reset-password.component';
import {AuthCallbackComponent} from './features/auth/auth-callback.component';
import {HowItWorksComponent} from './features/how-it-works/how-it-works.component';
import {TermsOfUseComponent} from './features/legal/terms-of-use.component';
import {PrivacyPolicyComponent} from './features/legal/privacy-policy.component';
import {DashboardComponent} from './features/dashboard/dashboard.component';
import {ExamsListComponent} from './features/exams/exams-list.component';
import {ExamDetailComponent} from './features/exams/exam-detail.component';
import {AttemptRunnerComponent} from './features/attempt/attempt-runner.component';
import {ResultComponent} from './features/result/result.component';
import {StatsComponent} from './features/stats/stats.component';
import {AdminComponent} from './features/admin/admin.component';
import {authGuard} from './core/guards/auth.guard';
import {adminGuard} from './core/guards/admin.guard';
import {ContactComponent} from './features/legal/contact.component';
import { ExamsSlugResolver } from './features/exams/exams-slug.resolver';

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function examsIdMatcher(segments: UrlSegment[]): UrlMatchResult | null {
  // Espera: ['exams', '<uuid>']
  if (segments.length === 2 && segments[0].path === 'exams' && uuidRegex.test(segments[1].path)) {
    return { consumed: segments, posParams: { id: segments[1] } } as UrlMatchResult;
  }
  return null;
}

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: 'login', component: LoginComponent },
      {path: 'register', component: RegisterComponent},
      {path: 'forgot-password', component: ForgotPasswordComponent},
      {path: 'reset-password', component: ResetPasswordComponent},
      {path: 'auth/callback', component: AuthCallbackComponent},
      {path: 'how-it-works', component: HowItWorksComponent},
      {path: 'termos-de-uso', component: TermsOfUseComponent},
      {path: 'contato', component: ContactComponent},
      {path: 'politica-de-privacidade', component: PrivacyPolicyComponent}
    ]
  },
  {
    path: '',
    component: AppLayoutComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'exams', component: ExamsListComponent },
      {path: 'stats', component: StatsComponent},
      // matcher para id (UUID)
      { matcher: examsIdMatcher, component: ExamDetailComponent },
      // rota por slug textual com resolver (resolve exam object)
      { path: 'exams/:slug', resolve: { exam: ExamsSlugResolver }, component: ExamDetailComponent },
    ]
  },
  {
    path: '',
    component: AppLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'attempt/:id/result', component: ResultComponent },
      { path: 'attempt/:id/questions', loadComponent: () => import('./features/attempt-result/attempt-questions-result.component').then(m => m.AttemptQuestionsResultComponent) },
      { path: 'admin', component: AdminComponent, canActivate: [adminGuard] }
    ]
  },
  {
    path: 'attempt/:id/run',
    component: AttemptRunnerComponent,
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: 'dashboard' },
];
