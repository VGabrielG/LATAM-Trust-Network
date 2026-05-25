import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="footer">
      <div class="container footer-inner">
        <div class="footer-brand">
          <div class="logo">
            <img src="favicon.png" alt="Logo" class="logo-img">
            <span class="logo-text">LATAM</span><span class="logo-accent">TRUST</span>
          </div>
          <p class="copyright mono">© {{ currentYear }} Engineering of Trust. Todos los derechos reservados.</p>
        </div>
        
        <div class="footer-links">
          <a href="#" class="footer-link">Términos</a>
          <a href="#" class="footer-link">Privacidad</a>
          <a href="mailto:contacto@latamtrust.cl" class="footer-link">Contacto</a>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background: #050505;
      padding: 3rem 0;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      margin-top: 5rem;
    }
    .footer-inner {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 2rem;
    }
    .logo { 
      font-size: 1.2rem; 
      font-weight: 800; 
      letter-spacing: -1px;
      display: flex;
      align-items: center;
      gap: 0.6rem;
      margin-bottom: 0.5rem;
    }
    .logo-img { height: 24px; width: auto; opacity: 0.8; }
    .logo-text { color: #fff; }
    .logo-accent { color: var(--primary); }
    
    .copyright {
      font-size: 0.7rem;
      color: rgba(255, 255, 255, 0.3);
      letter-spacing: 0.5px;
    }
    
    .footer-links {
      display: flex;
      gap: 2rem;
    }
    .footer-link {
      color: rgba(255, 255, 255, 0.5);
      text-decoration: none;
      font-size: 0.75rem;
      font-weight: 600;
      transition: color 0.3s ease;
    }
    .footer-link:hover {
      color: var(--primary);
    }

    @media (max-width: 768px) {
      .footer-inner {
        flex-direction: column;
        text-align: center;
      }
      .logo { justify-content: center; }
      .footer-links { justify-content: center; gap: 1.5rem; }
    }
  `]
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}
