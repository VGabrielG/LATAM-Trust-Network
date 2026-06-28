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
            <img src="logo.png" alt="Logo" class="logo-img">
            <span class="logo-text">LTN</span><span class="logo-accent"> Chile</span>
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
          
          <!-- Collapsible Services Submenu -->
          <div class="services-submenu-container">
            <a href="javascript:void(0)" class="dropdown-nav-link" (click)="toggleServices($event)">
              <span class="nav-number">03</span> SERVICIOS <span class="arrow-indicator" [class.open]="showServices">▾</span>
            </a>
            
            <div class="submenu-wrapper animate-fade-in" *ngIf="showServices">
              <!-- Category Selector Buttons (Gradient from Black to White) -->
              <div class="category-buttons-row">
                <button *ngFor="let cat of serviceCategories; let idx = index" 
                        class="cat-select-btn mono" 
                        [class.active]="activeCategoryIndex === idx"
                        (click)="selectCategory(idx, $event)"
                        [style.background-color]="getCatBg(idx)"
                        [style.border-color]="getCatBorder(idx)"
                        [style.color]="getCatColor(idx)">
                  {{ cat.shortTitle }}
                </button>
              </div>

              <!-- List of Services in Active Category -->
              <div class="submenu-services-list" *ngIf="activeCategoryIndex !== null">
                <div class="service-accordion-item" *ngFor="let opt of serviceCategories[activeCategoryIndex].options; let sIdx = index">
                  <button class="service-accordion-header" (click)="toggleServiceDetail(sIdx, $event)" [class.expanded]="activeServiceIndex === sIdx">
                    <span class="bullet">//</span> {{ opt.label }}
                    <span class="chevron">{{ activeServiceIndex === sIdx ? '−' : '+' }}</span>
                  </button>
                  <div class="service-accordion-body" *ngIf="activeServiceIndex === sIdx">
                    <p class="service-desc">{{ opt.desc }}</p>
                    <a [routerLink]="opt.link" class="service-go-link mono" (click)="menuOpen = false; showServices = false">
                      Ver Detalles de Servicio →
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <a routerLink="/nosotros" class="dropdown-nav-link" (click)="menuOpen = false">
            <span class="nav-number">04</span> NOSOTROS
          </a>
          <a routerLink="/corredores" class="dropdown-nav-link" (click)="menuOpen = false">
            <span class="nav-number">05</span> CORREDORES
          </a>
          <a routerLink="/unete" class="dropdown-nav-link" (click)="menuOpen = false">
            <span class="nav-number">06</span> ÚNETE COMO CORREDOR
          </a>
          <a routerLink="/panel" *ngIf="authService.isAuthorized()" class="dropdown-nav-link panel-highlight" (click)="menuOpen = false">
            <span class="nav-number">07</span> PANEL DE CONTROL
          </a>
          <a href="javascript:void(0)" class="dropdown-nav-link" (click)="onContactClick(); menuOpen = false">
            <span class="nav-number" *ngIf="!authService.isAuthorized()">07</span>
            <span class="nav-number" *ngIf="authService.isAuthorized()">08</span>
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
      font-family: 'Montserrat', sans-serif;
      font-size: 1.8rem; 
      font-weight: 700; 
      letter-spacing: -0.5px;
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

    /* Collapsible Services Submenu Styles */
    .services-submenu-container {
      display: flex;
      flex-direction: column;
    }
    .arrow-indicator {
      margin-left: auto;
      transition: transform 0.3s ease;
      font-size: 1.2rem;
    }
    .arrow-indicator.open {
      transform: rotate(180deg);
      color: var(--primary);
    }
    
    /* Elegant Accordion Dropdown style */
    .submenu-wrapper {
      padding-left: 0.5rem;
      margin: 0.5rem 0 0.8rem 1.2rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    
    .category-buttons-row {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 0.5rem;
    }
    
    .cat-select-btn {
      flex: 1;
      min-width: 100px;
      font-size: 0.65rem;
      padding: 8px 10px;
      border: 1px solid;
      border-radius: 4px;
      cursor: pointer;
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 0.5px;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .cat-select-btn.active {
      box-shadow: 0 0 12px rgba(255, 255, 255, 0.2);
      transform: translateY(-1px);
      border-color: #fff !important;
    }

    .submenu-services-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      padding: 0.8rem;
      max-height: 250px;
      overflow-y: auto;
    }

    .service-accordion-item {
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
      padding-bottom: 0.5rem;
    }
    .service-accordion-item:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }

    .service-accordion-header {
      width: 100%;
      background: none;
      border: none;
      color: rgba(255, 255, 255, 0.8);
      font-family: inherit;
      font-size: 0.85rem;
      font-weight: 600;
      padding: 8px 0;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: space-between;
      text-align: left;
      transition: color 0.2s;
    }
    .service-accordion-header:hover, 
    .service-accordion-header.expanded {
      color: var(--primary);
    }
    .service-accordion-header .bullet {
      color: var(--primary);
      margin-right: 6px;
      opacity: 0.6;
    }
    .service-accordion-header .chevron {
      font-size: 0.9rem;
      font-family: monospace;
      color: rgba(255, 255, 255, 0.4);
    }

    .service-accordion-body {
      padding: 4px 0 8px 18px;
      animation: expandSlow 0.2s ease-out;
    }

    @keyframes expandSlow {
      from { opacity: 0; transform: translateY(-4px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .service-desc {
      font-size: 0.78rem;
      line-height: 1.4;
      color: rgba(255, 255, 255, 0.6);
      margin: 0 0 8px 0;
    }

    .service-go-link {
      font-size: 0.68rem;
      color: var(--primary);
      text-decoration: none;
      font-weight: 700;
      display: inline-block;
      transition: transform 0.2s;
    }
    .service-go-link:hover {
      transform: translateX(3px);
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
      animation: fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
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
  showServices = false;
  activeCategoryIndex: number | null = null;
  activeServiceIndex: number | null = null;

  serviceCategories = [
    {
      title: 'Quiero Vender — 2% & 2%',
      shortTitle: 'Vender',
      options: [
        { 
          label: 'Venta Tradicional', 
          link: '/servicios/venta-tradicional',
          desc: 'Corretaje premium de propiedades residenciales con comisión transparente de 2% para vendedor y 2% para comprador.'
        },
        { 
          label: 'Con Herencia Pendiente', 
          link: '/servicios/sucesiones',
          desc: 'Regularizamos herencias y posesiones efectivas pendientes de forma paralela a la comercialización del inmueble.'
        },
        { 
          label: 'Propiedad Comercial', 
          link: '/servicios/propiedad-comercial',
          desc: 'Venta de locales, bodegas, oficinas y terrenos comerciales con foco en rentabilidad y clientes corporativos.'
        }
      ]
    },
    {
      title: 'Quiero Arrendar — 50%',
      shortTitle: 'Arrendar',
      options: [
        { 
          label: 'Arriendo Residencial', 
          link: '/servicios/arriendo-residencial',
          desc: 'Evaluación de perfil comercial de arrendatarios, codeudores solidarios, redacción de contratos y entrega del inmueble.'
        },
        { 
          label: 'Arriendo Comercial', 
          link: '/servicios/arriendo-comercial',
          desc: 'Colocación estratégica de oficinas, locales comerciales y retail optimizando los contratos a largo plazo.'
        },
        { 
          label: 'Mediación', 
          link: '/servicios/mediacion',
          desc: 'Arbitraje y resolución de conflictos entre propietarios y arrendatarios para regularizar situaciones complejas.'
        }
      ]
    },
    {
      title: 'Administración de Bienes — 10%',
      shortTitle: 'Admin',
      options: [
        { 
          label: 'Herencias y Posesiones Efectivas', 
          link: '/servicios/herencias-posesiones',
          desc: 'Gestión legal, posesión efectiva testada o intestada para habilitar legalmente la transferencia de bienes raíces.'
        },
        { 
          label: 'Renta Corta', 
          link: '/servicios/renta-corta',
          desc: 'Optimización de arriendos temporales tipo Airbnb, incluyendo limpieza, check-in/out, precios dinámicos y mantención.'
        },
        { 
          label: 'Proyecto Cultural y Comercial', 
          link: '/servicios/proyecto-cultural-comercial',
          desc: 'Asesoría para reconvertir casonas o espacios históricos a fines comerciales, gastronómicos o centros culturales.'
        }
      ]
    },
    {
      title: 'Soy Inversionista',
      shortTitle: 'Invertir',
      options: [
        { 
          label: 'Remates y Oportunidades', 
          link: '/servicios/remates',
          desc: 'Búsqueda activa de propiedades con valores bajo mercado, asesoría en remates judiciales y saneamiento legal.'
        },
        { 
          label: 'Multifamily / Departamentos', 
          link: '/servicios/multifamily',
          desc: 'Evaluación y estructuración de carteras de departamentos residenciales para fondos o inversionistas privados.'
        }
      ]
    }
  ];

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
      this.menuOpen = false;
    }
  }

  toggleMenu(event: Event) {
    event.stopPropagation();
    this.menuOpen = !this.menuOpen;
    if (this.menuOpen) {
      this.dropdownOpen = false;
      this.showServices = false;
      this.activeCategoryIndex = null;
      this.activeServiceIndex = null;
    }
  }

  toggleServices(event: Event) {
    event.stopPropagation();
    this.showServices = !this.showServices;
    if (this.showServices) {
      this.activeCategoryIndex = 0; // Default to first category on open
    } else {
      this.activeCategoryIndex = null;
    }
    this.activeServiceIndex = null;
  }

  selectCategory(idx: number, event: Event) {
    event.stopPropagation();
    this.activeCategoryIndex = idx;
    this.activeServiceIndex = null;
  }

  toggleServiceDetail(sIdx: number, event: Event) {
    event.stopPropagation();
    this.activeServiceIndex = this.activeServiceIndex === sIdx ? null : sIdx;
  }

  getCatBg(idx: number): string {
    // Gradient from black/dark gray to whiter
    // idx: 0 -> #121212
    // idx: 1 -> #2d2d2d
    // idx: 2 -> #555555
    // idx: 3 -> #9c9c9c
    const bgs = ['#121212', '#2a2a2a', '#555555', '#999999'];
    return bgs[idx] || '#121212';
  }

  getCatBorder(idx: number): string {
    const borders = ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.15)', 'rgba(255,255,255,0.25)', 'rgba(0,0,0,0.15)'];
    return borders[idx] || 'rgba(255,255,255,0.1)';
  }

  getCatColor(idx: number): string {
    // If bg is light (last one), text should be black
    return idx === 3 ? '#000000' : '#ffffff';
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


