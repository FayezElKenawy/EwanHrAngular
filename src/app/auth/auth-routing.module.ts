import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { RegisterComponent } from './register/register.component';
import { ThanksComponent } from './thanks/thanks.component';
import { AuthLayoutComponent } from '@shared/layouts/auth-layout/auth-layout.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { UpdateProfileComponent } from './update-profile/update-profile.component';
import { CoreLayoutComponent } from '@shared/layouts/core-layout/core-layout.component';
import { AuthGuard } from '@shared/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'forgot-password', component: ForgotPasswordComponent },
      {
        path: 'reset-password',
        component: ResetPasswordComponent,
        canActivate: [AuthGuard]
      },
      { path: 'thanks', component: ThanksComponent },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ],
    component: AuthLayoutComponent
  },
  {
    path: 'profile',
    children: [
      {
        path: 'user-profile',
        component: UserProfileComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'update-profile',
        component: UpdateProfileComponent,
        canActivate: [AuthGuard]
      }
    ],
    component: CoreLayoutComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule {}
