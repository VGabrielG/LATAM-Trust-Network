import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { HeaderComponent } from '../header/header';
import { FooterComponent } from '../footer/footer';
import { ContactModalComponent } from '../contact-modal/contact-modal';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, FooterComponent, ContactModalComponent],
  template: `
    <app-header (contactClick)="showContactModal = true"></app-header>
    <div class="page-top-offset"></div>

    <div class="login-container">
      <div class="login-box animate-fade-in">
        <div class="login-header mono">// SECURE_ACCESS_PORTAL</div>
        <div class="login-body">
          <h2>Acceso a Corredores</h2>
          <p>Inicia sesión con tu cuenta autorizada para acceder al panel de administración de propiedades.</p>
          
          <div *ngIf="errorMessage" class="error-msg animate-fade-in">
            <span class="error-icon">⚠️</span> {{ errorMessage }}
          </div>
          
          <div class="email-login-section">
            <div class="form-group">
              <input type="email" [(ngModel)]="email" placeholder="Correo electrónico" class="form-control">
            </div>
            <div class="form-group">
              <input type="password" [(ngModel)]="password" placeholder="Contraseña" class="form-control" (keyup.enter)="loginEmail()">
            </div>
            
            <div class="action-buttons">
              <button (click)="loginEmail()" [disabled]="authService.isLoading() || !email || !password" class="btn-email">
                {{ authService.isLoading() ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
              </button>
            </div>
          </div>

          <div class="divider">
            <span>O ingresar con</span>
          </div>

          <button (click)="loginGoogle()" [disabled]="authService.isLoading()" class="btn-google">
            <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
            Acceder con Google
          </button>
        </div>
      </div>
    </div>

    <app-footer></app-footer>
    <app-contact-modal *ngIf="showContactModal" (closed)="showContactModal = false"></app-contact-modal>
  `,
  styles: [`
    .page-top-offset {
      height: 80px;
      background: #000;
    }
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: calc(100vh - 160px);
      background-color: var(--bg-color);
      padding: 4rem 2rem;
      box-sizing: border-box;
      position: relative;
    }
    .login-box {
      background: rgba(255, 255, 255, 0.01);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      box-shadow: 0 20px 50px rgba(0,0,0,0.6);
      width: 100%;
      max-width: 440px;
      overflow: hidden;
      transition: all 0.3s ease;
    }
    .login-box:hover {
      border-color: rgba(251, 191, 36, 0.2);
      box-shadow: 0 25px 60px rgba(251, 191, 36, 0.05);
    }
    .login-header {
      background: rgba(255, 255, 255, 0.03);
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      color: var(--text-muted);
      padding: 0.75rem 1.5rem;
      font-size: 0.75rem;
      letter-spacing: 2px;
      text-align: left;
    }
    .login-body {
      padding: 3rem 2.5rem;
      text-align: center;
    }
    h2 { 
      color: #fff; 
      margin-top: 0; 
      font-size: 2rem; 
      font-weight: 800;
      letter-spacing: -1px;
    }
    p { 
      color: var(--text-muted); 
      margin-bottom: 2.5rem; 
      font-size: 0.95rem; 
      line-height: 1.6;
    }
    
    .error-msg {
      background: rgba(239, 68, 68, 0.12);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #f87171;
      padding: 12px 16px;
      border-radius: 6px;
      font-size: 0.85rem;
      margin-bottom: 1.8rem;
      text-align: left;
      line-height: 1.4;
      display: flex;
      gap: 8px;
    }
    .error-icon {
      font-size: 1rem;
      flex-shrink: 0;
    }
    
    .email-login-section {
      display: flex;
      flex-direction: column;
      gap: 1.2rem;
      margin-bottom: 2rem;
    }
    .form-group {
      text-align: left;
    }
    .form-control {
      width: 100%;
      padding: 14px 16px;
      background: rgba(0, 0, 0, 0.4);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 4px;
      font-size: 0.95rem;
      color: #fff;
      box-sizing: border-box;
      transition: all 0.3s ease;
      font-family: inherit;
    }
    .form-control:focus {
      outline: none;
      border-color: var(--primary);
      background: rgba(0, 0, 0, 0.6);
      box-shadow: 0 0 12px rgba(255, 255, 255, 0.15);
    }
    .action-buttons {
      display: flex;
      margin-top: 5px;
    }
    .btn-email {
      width: 100%;
      padding: 14px;
      border: none;
      border-radius: 4px;
      font-weight: 800;
      cursor: pointer;
      font-size: 0.9rem;
      letter-spacing: 1px;
      text-transform: uppercase;
      background: var(--primary);
      color: #000;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 4px 15px rgba(255, 255, 255, 0.1);
    }
    .btn-email:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(255, 255, 255, 0.25);
      background: #fff;
    }
    
    .divider {
      display: flex;
      align-items: center;
      text-align: center;
      margin: 2rem 0;
      color: rgba(255, 255, 255, 0.2);
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .divider::before, .divider::after {
      content: '';
      flex: 1;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }
    .divider span { padding: 0 12px; }
    
    .btn-google {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      width: 100%;
      padding: 14px;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 4px;
      color: rgba(255, 255, 255, 0.9);
      font-weight: 600;
      font-size: 0.95rem;
      cursor: pointer;
      transition: all 0.3s ease;
      box-sizing: border-box;
    }
    .btn-google:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.06);
      border-color: rgba(255, 255, 255, 0.2);
      color: #fff;
    }
    button:disabled { opacity: 0.5; cursor: not-allowed; transform: none !important; box-shadow: none !important; }
 
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(15px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
      animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
  `]
})
export class LoginComponent implements OnInit {
  authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  
  email = '';
  password = '';
  showContactModal = false;
  errorMessage = '';

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['error'] === 'not_authorized') {
        this.errorMessage = 'Tu correo electrónico no se encuentra en la lista de corredores autorizados de LATAM Trust. Contacta a un administrador.';
      } else {
        this.errorMessage = '';
      }
    });
  }

  loginGoogle() {
    this.authService.loginWithGoogle();
  }

  loginEmail() {
    if (this.email && this.password) {
      this.authService.loginWithEmail(this.email, this.password);
    }
  }
}

