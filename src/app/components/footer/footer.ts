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
            <img src="logo.png" alt="Logo" class="logo-img">
            <span class="logo-text">LTN</span><span class="logo-accent"> Chile</span>
          </div>
          <p class="copyright mono">© {{ currentYear }} Engineering of Trust. Todos los derechos reservados.</p>
        </div>
        
        <div class="footer-contact">
          <span class="contact-label mono">CONTÁCTANOS</span>
          <div class="contact-links">
            <a href="mailto:contacto@latamtrust.cl" class="contact-link">
              <span class="contact-icon">✉</span> contacto@latamtrust.cl
            </a>
            <a href="https://wa.me/56978566562" target="_blank" rel="noopener noreferrer" class="contact-link">
              <span class="contact-icon">💬</span> WhatsApp: +56 9 7856 6562
            </a>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background: #000000;
      padding: 3.5rem 0;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      margin-top: 5rem;
      position: relative;
      z-index: 10;
    }
    .footer-inner {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 2rem;
    }
    .logo { 
      font-family: 'Montserrat', sans-serif;
      font-size: 1.3rem; 
      font-weight: 700; 
      letter-spacing: -0.5px;
      display: flex;
      align-items: center;
      gap: 0.6rem;
      margin-bottom: 0.6rem;
    }
    .logo-img { 
      height: 26px; 
      width: auto; 
      opacity: 0.9; 
    }
    .logo-text { 
      color: var(--text-main); 
    }
    .logo-accent { 
      color: var(--primary); 
    }
    
    .copyright {
      font-size: 0.7rem;
      color: var(--text-muted);
      letter-spacing: 0.5px;
      opacity: 0.8;
    }
    
    .footer-contact {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.5rem;
    }
    
    .contact-label {
      font-size: 0.7rem;
      color: var(--primary);
      letter-spacing: 2px;
      font-weight: 700;
    }

    .contact-links {
      display: flex;
      flex-direction: column;
      gap: 0.8rem;
    }

    .contact-link {
      color: var(--text-muted);
      text-decoration: none;
      font-size: 0.82rem;
      font-weight: 500;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .contact-icon {
      font-size: 1rem;
      opacity: 0.8;
    }

    .contact-link:hover {
      color: var(--text-main);
      transform: translateX(-4px);
    }

    @media (max-width: 768px) {
      .footer-inner {
        flex-direction: column;
        text-align: center;
        gap: 2.5rem;
      }
      .logo { justify-content: center; }
      .footer-contact {
        align-items: center;
      }
      .contact-link:hover {
        transform: translateY(-2px);
      }
    }
  `]
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}
