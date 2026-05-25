import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-panel-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="panel-layout">
      <aside class="sidebar">
        <div class="sidebar-header">
          <h2>Panel de Corredor</h2>
        </div>
        
        <!-- Mostrar cuenta de Google -->
        <div class="user-profile-section" *ngIf="authService.currentUser() as user">
          <img *ngIf="user.photoURL" [src]="user.photoURL" alt="Perfil Google" class="sidebar-avatar">
          <div class="user-info">
            <span class="user-name">{{ user.displayName || 'Corredor' }}</span>
            <span class="user-email">{{ user.email }}</span>
          </div>
        </div>

        <nav class="sidebar-nav">
          <a routerLink="/" class="nav-link back-home-link">
            ← Volver a la Web Principal
          </a>
          <div class="sidebar-divider"></div>
          <a routerLink="/panel/perfil" routerLinkActive="active" class="nav-link">
            Mi Perfil
          </a>
          <a *ngIf="authService.userRole() === 'admin'" routerLink="/panel/autorizados" routerLinkActive="active" class="nav-link" style="color: #fcd34d;">
            🔒 Lista Autorizada
          </a>
          <a routerLink="/panel/propiedades" routerLinkActive="active" class="nav-link">
            Mis Propiedades
          </a>
          <a routerLink="/panel/publicar" routerLinkActive="active" class="nav-link">
            Publicar Propiedad
          </a>
          <a routerLink="/panel/soporte" routerLinkActive="active" class="nav-link">
            Asesoría y Soporte
          </a>
          <a routerLink="/panel/mejoras" routerLinkActive="active" class="nav-link">
            Blog de Mejoras
          </a>
        </nav>

        <div class="sidebar-footer">
          <button (click)="logout()" class="logout-btn">Cerrar Sesión</button>
        </div>
      </aside>
      <main class="panel-content">
        <router-outlet></router-outlet>
      </main>
      
      <!-- Floating Improvement Button (Only within broker panel layout) -->
      <a routerLink="/panel/mejoras" class="floating-feedback-btn" title="Foro de Mejoras / Sugerencias">
        💡 Proponer Mejora
      </a>
    </div>
  `,
  styles: [`
    .panel-layout {
      display: flex;
      min-height: 100vh;
      background-color: #f3f4f6;
    }
    .sidebar {
      width: 250px;
      background-color: #1f2937;
      color: white;
      display: flex;
      flex-direction: column;
    }
    .sidebar-header {
      padding: 20px;
      border-bottom: 1px solid #374151;
    }
    .sidebar-header h2 {
      margin: 0;
      font-size: 1.25rem;
    }
    .sidebar-nav {
      display: flex;
      flex-direction: column;
      flex: 1;
      padding: 10px 0;
    }
    .user-profile-section {
      padding: 15px 20px;
      display: flex;
      align-items: center;
      gap: 12px;
      background-color: #111827;
      border-bottom: 1px solid #374151;
    }
    .sidebar-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 2px solid var(--primary, #fbbf24);
      object-fit: cover;
    }
    .user-info {
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .user-name {
      font-size: 0.9rem;
      font-weight: bold;
      color: white;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .user-email {
      font-size: 0.75rem;
      color: #9ca3af;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .sidebar-divider {
      height: 1px;
      background-color: #374151;
      margin: 10px 0;
    }
    .back-home-link {
      color: var(--primary, #fbbf24) !important;
      font-weight: bold;
    }
    .nav-link {
      color: #d1d5db;
      text-decoration: none;
      padding: 12px 20px;
      transition: background-color 0.2s;
    }
    .nav-link:hover {
      background-color: #374151;
    }
    .nav-link.active {
      background-color: #4b5563;
      color: white;
      font-weight: bold;
    }
    .sidebar-footer {
      padding: 20px;
      border-top: 1px solid #374151;
    }
    .logout-btn {
      width: 100%;
      padding: 10px;
      background-color: #ef4444;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    .logout-btn:hover {
      background-color: #dc2626;
    }
    .panel-content {
      flex: 1;
      padding: 30px;
      overflow-y: auto;
    }
    .floating-feedback-btn {
      position: fixed;
      bottom: 110px;
      right: 40px;
      background: var(--primary, #fbbf24);
      color: #000;
      border: 1px solid var(--primary, #fbbf24);
      padding: 12px 20px;
      border-radius: 50px;
      font-weight: 800;
      font-size: 0.85rem;
      text-decoration: none;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.25);
      z-index: 9999;
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .floating-feedback-btn:hover {
      transform: translateY(-4px) scale(1.03);
      box-shadow: 0 15px 30px rgba(251, 191, 36, 0.5);
      background: #fff;
      border-color: #fff;
    }
    @media (max-width: 768px) {
      .floating-feedback-btn {
        bottom: 80px;
        right: 20px;
      }
    }
  `]
})
export class PanelLayoutComponent {
  authService = inject(AuthService);

  async logout() {
    await this.authService.logout();
  }
}
