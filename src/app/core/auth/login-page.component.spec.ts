import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { LoginPageComponent } from './login-page.component';

describe('LoginPageComponent', () => {
  let fixture: ComponentFixture<LoginPageComponent>;
  let component: LoginPageComponent;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    authService = jasmine.createSpyObj<AuthService>('AuthService', ['login']);
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [CommonModule, FormsModule, LoginPageComponent],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPageComponent);
    component = fixture.componentInstance;
  });

  it('navigates to the role-safe dashboard after login', () => {
    authService.login.and.returnValue(of({
      accessToken: 'a',
      refreshToken: 'r',
      tokenType: 'Bearer',
      expiresInMs: 60_000,
      refreshExpiresInMs: 120_000,
      username: 'admin',
      role: 'ADMIN',
      enseignantId: null,
      etudiantId: null
    }));

    component.login();

    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

  it('shows backend login errors', () => {
    authService.login.and.returnValue(throwError(() => ({ error: { message: 'Bad credentials' } })));

    component.login();

    expect(component.errorMessage).toBe('Bad credentials');
    expect(component.loading).toBeFalse();
  });
});
