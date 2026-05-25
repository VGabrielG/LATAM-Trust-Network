import { Component, EventEmitter, Output, HostListener, inject, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <header class="header" [class.scrolled]="isScrolled">
      <div class="header-inner container">
        <div class="brand">
          <div class="logo" routerLink="/">
            <img src="favicon.png" alt="Logo" class="logo-img">
            <span class="logo-text">LATAM</span><span class="logo-accent">TRUST</span>
          </div>
        </div>
        
        <div class="header-actions">
          <a routerLink="/marketplace" class="dropdown-nav-link desktop-only" style="font-size: 0.8rem; letter-spacing: 1px; padding: 0 10px; font-weight: 700;">MARKETPLACE</a>
          <a routerLink="/unete" class="dropdown-nav-link desktop-only" style="font-size: 0.8rem; letter-spacing: 1px; padding: 0 10px; font-weight: 700;">ÚNETE COMO CORREDOR</a>
          <button class="btn-tech desktop-only" (click)="onContactClick()">CONSULTORÍA GRATIS</button>
          
          <!-- Si NO está autenticado, muestra el icono de usuario/login -->
          <a *ngIf="!authService.isAuthorized()" routerLink="/login" class="login-icon-btn" title="Acceso Corredores">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </a>
          
          <!-- Si SÍ está autenticado, muestra el avatar de usuario con dropdown propio -->
          <div *ngIf="authService.isAuthorized()" class="user-menu-container">
            <button class="avatar-btn" (click)="toggleDropdown($event)">
              <img *ngIf="authService.currentUser()?.photoURL" 
                   [src]="authService.currentUser()?.photoURL" 
                   alt="Avatar" class="avatar-img">
              <div *ngIf="!authService.currentUser()?.photoURL" class="avatar-placeholder">
                {{ getUserInitial() }}
              </div>
              <span class="user-status-dot"></span>
            </button>
            
            <div class="user-dropdown" *ngIf="dropdownOpen">
              <div class="dropdown-header">
                <span class="user-welcome">Hola,</span>
                <span class="user-name">{{ authService.currentUser()?.displayName || authService.currentUser()?.email }}</span>
              </div>
              <div class="dropdown-divider"></div>
              <a routerLink="/panel/propiedades" class="dropdown-item" (click)="dropdownOpen = false; menuOpen = false">
                <span class="icon">🏢</span> Mis Propiedades
              </a>
              <a routerLink="/panel/perfil" class="dropdown-item" (click)="dropdownOpen = false; menuOpen = false">
                <span class="icon">👤</span> Mi Perfil
              </a>
              <a *ngIf="authService.userRole() === 'admin'" routerLink="/panel/autorizados" class="dropdown-item" (click)="dropdownOpen = false; menuOpen = false" style="color: #fbbf24;">
                <span class="icon">🔒</span> Lista Autorizada
              </a>
              <a routerLink="/panel/publicar" class="dropdown-item" (click)="dropdownOpen = false; menuOpen = false">
                <span class="icon">➕</span> Publicar Inmueble
              </a>
              <div class="dropdown-divider"></div>
              <button class="dropdown-item logout-item" (click)="logout()">
                <span class="icon">🚪</span> Cerrar Sesión
              </button>
            </div>
          </div>

          <!-- Hamburger Button (Siempre visible) -->
          <button class="hamburger-btn" (click)="toggleMenu($event)" [class.active]="menuOpen" aria-label="Abrir Menú">
            <span class="bar"></span>
            <span class="bar"></span>
            <span class="bar"></span>
          </button>
        </div>
      </div>

      <!-- Hamburger Dropdown Menu (Premium glassmorphic dropdown) -->
      <div class="hamburger-dropdown" *ngIf="menuOpen">
        <nav class="dropdown-nav">
          <a routerLink="/" class="dropdown-nav-link" (click)="menuOpen = false">
            <span class="nav-number">01</span> HOME
          </a>
          <a routerLink="/marketplace" class="dropdown-nav-link" (click)="menuOpen = false">
            <span class="nav-number">02</span> MARKETPLACE
          </a>
          <a routerLink="/nosotros" class="dropdown-nav-link" (click)="menuOpen = false">
            <span class="nav-number">03</span> NOSOTROS
          </a>
          <a routerLink="/corredores" class="dropdown-nav-link" (click)="menuOpen = false">
            <span class="nav-number">04</span> CORREDORES
          </a>
          <a routerLink="/unete" class="dropdown-nav-link" (click)="menuOpen = false">
            <span class="nav-number">05</span> ÚNETE COMO CORREDOR
          </a>
          <a routerLink="/panel" *ngIf="authService.isAuthorized()" class="dropdown-nav-link panel-highlight" (click)="menuOpen = false">
            <span class="nav-number">06</span> PANEL DE CONTROL
          </a>
          <a href="javascript:void(0)" class="dropdown-nav-link" (click)="onContactClick(); menuOpen = false">
            <span class="nav-number" *ngIf="!authService.isAuthorized()">06</span>
            <span class="nav-number" *ngIf="authService.isAuthorized()">07</span>
            CONTÁCTANOS
          </a>
        </nav>
      </div>

    </header>
  `,
  styles: [`
    .header {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      z-index: 1000;
      background: rgba(0, 0, 0, 0.2);
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(0px);
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      height: 80px;
      display: flex;
      align-items: center;
    }
    .header.scrolled {
      background: rgba(0, 0, 0, 0.85);
      height: 80px;
      backdrop-filter: blur(20px) saturate(180%);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    }
    .header-inner {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      transition: all 0.4s ease;
    }
    .brand { display: flex; flex-direction: column; }
    .logo { 
      font-size: 1.8rem; 
      font-weight: 800; 
      letter-spacing: -1px;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 0.8rem;
      cursor: pointer;
    }
    .logo-img {
      height: 38px;
      width: auto;
      filter: drop-shadow(0 0 10px rgba(251, 191, 36, 0.3));
      transition: all 0.3s ease;
    }
    .logo-text { color: #fff; }
    .logo-accent { color: var(--primary); }
    
    .header-actions {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .phone-link {
      font-size: 0.85rem;
      color: var(--primary);
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .phone-link .dot {
      width: 6px;
      height: 6px;
      background: var(--primary);
      border-radius: 50%;
      box-shadow: 0 0 10px var(--primary);
      display: inline-block;
    }
    
    .btn-tech {
      background: var(--primary);
      border: 1px solid var(--primary);
      color: #000;
      padding: 0.6rem 1.2rem;
      font-size: 0.75rem;
      font-weight: 800;
      letter-spacing: 0.5px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      cursor: pointer;
      text-transform: uppercase;
      box-shadow: 0 4px 15px rgba(251, 191, 36, 0.2);
    }
    .btn-tech:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(251, 191, 36, 0.4);
      background: #fff;
      border-color: #fff;
    }

    .login-icon-btn {
      color: rgba(255, 255, 255, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 8px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.03);
      transition: all 0.3s ease;
      text-decoration: none;
    }
    .login-icon-btn:hover {
      color: var(--primary);
      border-color: var(--primary);
      box-shadow: 0 0 10px rgba(251, 191, 36, 0.2);
    }
    
    /* User Menu Dropdown & Avatar Styles */
    .user-menu-container {
      position: relative;
      display: inline-block;
    }
    .avatar-btn {
      background: none;
      border: none;
      padding: 0;
      cursor: pointer;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .avatar-btn:hover {
      transform: scale(1.08);
    }
    .avatar-img {
      width: 42px;
      height: 42px;
      border-radius: 50%;
      border: 2px solid var(--primary);
      box-shadow: 0 0 10px rgba(251, 191, 36, 0.3);
      object-fit: cover;
      transition: all 0.3s ease;
    }
    .avatar-btn:hover .avatar-img {
      border-color: #fff;
      box-shadow: 0 0 15px rgba(255, 255, 255, 0.5);
    }
    .avatar-placeholder {
      width: 42px;
      height: 42px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--primary) 0%, #d97706 100%);
      color: #000;
      font-weight: 800;
      font-size: 1.1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid var(--primary);
      box-shadow: 0 0 10px rgba(251, 191, 36, 0.3);
      transition: all 0.3s ease;
    }
    .avatar-btn:hover .avatar-placeholder {
      border-color: #fff;
      box-shadow: 0 0 15px rgba(255, 255, 255, 0.5);
    }
    .user-status-dot {
      position: absolute;
      bottom: 0;
      right: 0;
      width: 10px;
      height: 10px;
      background: #10b981;
      border: 2px solid #000;
      border-radius: 50%;
      box-shadow: 0 0 5px #10b981;
    }
    .user-dropdown {
      position: absolute;
      top: calc(100% + 15px);
      right: 0;
      width: 250px;
      background: rgba(10, 10, 10, 0.95);
      backdrop-filter: blur(25px) saturate(180%);
      -webkit-backdrop-filter: blur(25px) saturate(180%);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.6);
      padding: 15px;
      display: flex;
      flex-direction: column;
      gap: 5px;
      z-index: 1100;
      animation: dropdownFadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      transform-origin: top right;
    }
    @keyframes dropdownFadeIn {
      from {
        opacity: 0;
        transform: translateY(10px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
    .dropdown-header {
      display: flex;
      flex-direction: column;
      padding: 5px 10px 10px 10px;
      text-align: left;
    }
    .user-welcome {
      font-size: 0.7rem;
      color: rgba(255, 255, 255, 0.5);
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .user-name {
      font-size: 0.9rem;
      font-weight: 700;
      color: #fff;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-top: 2px;
    }
    .dropdown-divider {
      height: 1px;
      background: rgba(255, 255, 255, 0.08);
      margin: 5px 0;
    }
    .dropdown-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      border-radius: 8px;
      color: rgba(255, 255, 255, 0.8);
      text-decoration: none;
      font-size: 0.85rem;
      font-weight: 500;
      transition: all 0.2s ease;
      cursor: pointer;
      background: transparent;
      border: none;
      text-align: left;
      width: 100%;
      box-sizing: border-box;
    }
    .dropdown-item:hover {
      background: rgba(251, 191, 36, 0.1);
      color: var(--primary);
      transform: translateX(4px);
    }
    .dropdown-item .icon {
      font-size: 0.95rem;
      transition: transform 0.2s ease;
    }
    .dropdown-item:hover .icon {
      transform: scale(1.15);
    }
    .logout-item {
      color: #f87171;
    }
    .logout-item:hover {
      background: rgba(239, 68, 68, 0.1);
      color: #f87171;
    }

    /* Hamburger Button Styles */
    .hamburger-btn {
      background: none;
      border: none;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding: 8px;
      z-index: 1200;
      transition: all 0.3s ease;
    }
    .hamburger-btn .bar {
      width: 24px;
      height: 2px;
      background-color: #fff;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .hamburger-btn:hover .bar {
      background-color: var(--primary);
    }
    .hamburger-btn.active .bar:nth-child(1) {
      transform: translateY(8px) rotate(45deg);
      background-color: var(--primary);
    }
    .hamburger-btn.active .bar:nth-child(2) {
      opacity: 0;
    }
    .hamburger-btn.active .bar:nth-child(3) {
      transform: translateY(-8px) rotate(-45deg);
      background-color: var(--primary);
    }

    /* Hamburger Dropdown Menu Styles */
    .hamburger-dropdown {
      position: absolute;
      top: 80px;
      right: 2rem;
      width: 320px;
      background: rgba(10, 10, 10, 0.96);
      backdrop-filter: blur(25px) saturate(190%);
      -webkit-backdrop-filter: blur(25px) saturate(190%);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 16px;
      padding: 2rem;
      display: flex;
      flex-direction: column;
      gap: 2rem;
      z-index: 999;
      box-sizing: border-box;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.7);
      animation: slideDownMenu 0.35s cubic-bezier(0.16, 1, 0.3, 1);
      transform-origin: top right;
    }
    @keyframes slideDownMenu {
      from {
        opacity: 0;
        transform: translateY(-15px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
    .dropdown-nav {
      display: flex;
      flex-direction: column;
      gap: 0.8rem;
    }
    .dropdown-nav-link {
      font-size: 1.1rem;
      font-weight: 700;
      color: rgba(255, 255, 255, 0.85);
      text-decoration: none;
      letter-spacing: 2px;
      padding: 10px 12px;
      border-radius: 8px;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 1rem;
      text-align: left;
    }
    .dropdown-nav-link .nav-number {
      font-size: 0.75rem;
      font-family: monospace;
      color: var(--primary);
      opacity: 0.6;
    }
    .dropdown-nav-link:hover {
      color: #fff;
      background: rgba(251, 191, 36, 0.08);
      padding-left: 18px;
    }
    .dropdown-nav-link.panel-highlight {
      color: var(--primary);
      background: rgba(251, 191, 36, 0.03);
    }
    .dropdown-nav-link.panel-highlight:hover {
      background: rgba(251, 191, 36, 0.1);
    }
    .dropdown-footer {
      display: flex;
      flex-direction: column;
      gap: 1.2rem;
    }
    .footer-divider {
      height: 1px;
      background: rgba(255, 255, 255, 0.08);
    }
    .footer-phone-link {
      font-size: 0.95rem;
      color: var(--primary);
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      justify-content: center;
      padding: 5px 0;
    }
    .footer-phone-link .dot {
      width: 6px;
      height: 6px;
      background: var(--primary);
      border-radius: 50%;
      box-shadow: 0 0 10px var(--primary);
    }
    .w-full {
      width: 100%;
    }
    .desktop-only {
      display: flex !important;
    }

    @media (max-width: 991px) {
      .desktop-only {
        display: none !important;
      }
      .hamburger-dropdown {
        right: 1rem;
        left: 1rem;
        width: calc(100% - 2rem);
        top: 80px;
      }
      .header.scrolled .hamburger-dropdown {
        top: 80px;
      }
    }
  `]
})
export class HeaderComponent {
  @Output() contactClick = new EventEmitter<void>();
  isScrolled = false;
  dropdownOpen = false;
  menuOpen = false;

  authService = inject(AuthService);
  private elementRef = inject(ElementRef);

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 50;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.dropdownOpen = false;
      this.menuOpen = false;
    }
  }

  onContactClick() {
    this.contactClick.emit();
  }

  toggleDropdown(event: Event) {
    event.stopPropagation();
    this.dropdownOpen = !this.dropdownOpen;
    if (this.dropdownOpen) {
      this.menuOpen = false; // close the main menu if avatar is opened
    }
  }

  toggleMenu(event: Event) {
    event.stopPropagation();
    this.menuOpen = !this.menuOpen;
    if (this.menuOpen) {
      this.dropdownOpen = false; // close avatar dropdown if main menu is opened
    }
  }

  getUserInitial(): string {
    const user = this.authService.currentUser();
    if (!user) return 'C';
    if (user.displayName) return user.displayName.charAt(0).toUpperCase();
    if (user.email) return user.email.charAt(0).toUpperCase();
    return 'C';
  }

  async logout() {
    this.dropdownOpen = false;
    this.menuOpen = false;
    await this.authService.logout();
  }
}


