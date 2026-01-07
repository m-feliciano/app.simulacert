import {Routes} from '@angular/router';
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

export const routes: Routes = [
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      { path: 'login', component: LoginComponent },
      {path: 'register', component: RegisterComponent},
      {path: 'forgot-password', component: ForgotPasswordComponent},
      {path: 'reset-password', component: ResetPasswordComponent},
      {path: 'auth/callback', component: AuthCallbackComponent},
      {path: 'how-it-works', component: HowItWorksComponent},
      {path: 'termos-de-uso', component: TermsOfUseComponent},
      {path: 'politica-de-privacidade', component: PrivacyPolicyComponent}
    ]
  },
  {
    path: '',
    component: AppLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'exams', component: ExamsListComponent },
      { path: 'exams/:id', component: ExamDetailComponent },
      { path: 'attempt/:id/result', component: ResultComponent },
      { path: 'attempt/:id/questions', loadComponent: () => import('./features/attempt-result/attempt-questions-result.component').then(m => m.AttemptQuestionsResultComponent) },
      { path: 'stats', component: StatsComponent },
      { path: 'admin', component: AdminComponent, canActivate: [adminGuard] }
    ]
  },
  {
    path: 'attempt/:id/run',
    component: AttemptRunnerComponent,
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: 'login' }
];
