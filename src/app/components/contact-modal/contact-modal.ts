import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contact-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" (click)="close()">
      <div class="modal-content animate-pop" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <div class="mono">Consultoría Gratuita</div>
          <button class="close-btn" (click)="close()">&times;</button>
        </div>
        
        <div class="modal-body">
          <div class="wsp-icon-wrapper">
            <svg class="wsp-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.864-9.858.002-2.634-1.013-5.112-2.86-6.962C16.636 1.936 14.16 1.92 11.53 1.92c-5.438 0-9.861 4.417-9.865 9.856-.001 1.77.481 3.5 1.393 4.992l-.999 3.647 3.738-.981h-.001zM18.14 14.5c-.33-.165-1.951-.963-2.252-1.073-.302-.11-.522-.165-.742.165-.22.33-.852 1.073-1.045 1.293-.193.22-.385.247-.715.082-1.748-.873-2.923-1.636-3.892-3.3a2.44 2.44 0 0 1-.51-1.06c.204-.413.415-.828.62-1.24.184-.367.09-.688-.047-.963-.137-.275-1.226-2.956-1.68-4.047-.442-1.063-.892-.919-1.226-.935-.316-.016-.679-.017-.98-.017-.302 0-.792.113-1.206.564-.413.45-1.579 1.542-1.579 3.76 0 2.22 1.616 4.364 1.84 4.667.224.303 3.18 4.857 7.705 6.81 1.077.464 1.917.741 2.571.948 1.08.343 2.062.295 2.84.18.865-.128 1.951-.798 2.227-1.53.275-.733.275-1.359.193-1.493-.083-.135-.303-.248-.633-.413z"/>
            </svg>
          </div>
          <h3 class="mono text-center">Agendar Asesoría</h3>
          <p class="text-center message-text">Escríbenos a WhatsApp para coordinar tu consultoría completamente gratis.</p>
          
          <div class="phone-display mono text-center">
            +56 9 7856 6562
          </div>

          <a href="https://wa.me/56978566562?text=Hola,%20me%20gustaría%20agendar%20una%20consultoría%20gratuita." 
             target="_blank" 
             class="btn wsp-btn w-full mono text-center"
             (click)="close()">
            ABRIR WHATSAPP
          </a>
        </div>

        <div class="modal-footer mono">
          [Estado: Enlace Directo] [WhatsApp Web/App]
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.85);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
      backdrop-filter: blur(5px);
    }
    .modal-content {
      background: var(--surface-color);
      border: 1px solid var(--primary);
      width: 90%;
      max-width: 420px;
      position: relative;
    }
    .modal-header {
      background: var(--primary);
      color: #000;
      padding: 0.75rem 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 700;
    }
    .close-btn {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      font-weight: 700;
    }
    .modal-body { padding: 2.5rem 2rem; }
    
    .wsp-icon-wrapper {
      display: flex;
      justify-content: center;
      margin-bottom: 1.5rem;
    }
    .wsp-icon {
      width: 64px;
      height: 64px;
      color: #25d366;
      filter: drop-shadow(0 0 8px rgba(37, 211, 102, 0.3));
    }

    h3 {
      font-size: 1.4rem;
      color: #fff;
      margin-bottom: 0.75rem;
    }

    .message-text {
      font-size: 0.9rem;
      color: var(--text-color);
      opacity: 0.8;
      line-height: 1.5;
      margin-bottom: 1.5rem;
    }

    .phone-display {
      font-size: 1.25rem;
      color: var(--primary);
      background: rgba(255, 255, 255, 0.03);
      border: 1px dashed var(--blueprint-line);
      padding: 10px;
      border-radius: 4px;
      margin-bottom: 2rem;
      letter-spacing: 1px;
    }

    .wsp-btn {
      display: block;
      background: #25d366;
      color: #000;
      text-decoration: none;
      font-weight: 800;
      padding: 1rem;
      border-radius: 4px;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(37, 211, 102, 0.2);
    }
    .wsp-btn:hover {
      background: #20ba5a;
      box-shadow: 0 6px 20px rgba(37, 211, 102, 0.4);
      transform: translateY(-2px);
    }
    
    .text-center { text-align: center; }
    .w-full { width: 100%; box-sizing: border-box; }
    .modal-footer {
      padding: 0.75rem 1.5rem;
      border-top: 1px solid var(--blueprint-line);
      font-size: 0.6rem;
      opacity: 0.5;
      text-align: center;
    }

    @keyframes pop {
      from { transform: scale(0.9); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
    .animate-pop { animation: pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
  `]
})
export class ContactModalComponent {
  @Output() closed = new EventEmitter<void>();

  close() {
    this.closed.emit();
  }
}
