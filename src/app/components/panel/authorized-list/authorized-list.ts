import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-authorized-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="authorized-container">
      <div class="header-section">
        <h2>Gestión de Accesos (Lista Autorizada)</h2>
        <p>Agrega o elimina correos electrónicos autorizados para registrarse y acceder al panel de corredores.</p>
      </div>

      <!-- Formulario para agregar correos -->
      <div class="card add-card">
        <h3>Autorizar Nuevo Corredor</h3>
        <form (ngSubmit)="onAddBroker()" class="add-form">
          <div class="form-row">
            <div class="form-group flex-2">
              <label for="newEmail">Correo Electrónico</label>
              <input 
                type="email" 
                id="newEmail" 
                [(ngModel)]="newEmail" 
                name="newEmail"
                placeholder="ejemplo@gmail.com" 
                class="form-control" 
                required
              >
            </div>
            <div class="form-group flex-1">
              <label for="newRole">Rol del Usuario</label>
              <select id="newRole" [(ngModel)]="newRole" name="newRole" class="form-control">
                <option value="broker">Corredor (Broker)</option>
                <option value="admin">Administrador (Admin)</option>
              </select>
            </div>
            <div class="form-action">
              <button type="submit" [disabled]="!newEmail || isSubmitting" class="btn-add">
                {{ isSubmitting ? 'Guardando...' : 'Autorizar Correo' }}
              </button>
            </div>
          </div>
        </form>

        <div *ngIf="successMessage" class="alert success-alert animate-fade-in">
          ✅ {{ successMessage }}
        </div>
        <div *ngIf="errorMessage" class="alert error-alert animate-fade-in">
          ❌ {{ errorMessage }}
        </div>
      </div>

      <!-- Lista de correos autorizados -->
      <div class="card list-card">
        <div class="list-header">
          <h3>Correos Autorizados</h3>
          <div class="search-box">
            <input 
              type="text" 
              [(ngModel)]="searchText" 
              placeholder="Buscar por correo..." 
              class="form-control search-input"
            >
          </div>
        </div>

        <div *ngIf="isLoading" class="loading-state">
          <div class="spinner"></div>
          <span>Cargando lista de autorizados...</span>
        </div>

        <ng-container *ngIf="!isLoading">
          <div class="table-responsive">
            <table class="auth-table">
              <thead>
                <tr>
                  <th>Correo Autorizado</th>
                  <th>Rol</th>
                  <th class="actions-header">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <!-- Admins principales harcodeados para visibilidad -->
                <tr class="admin-row">
                  <td>
                    <span class="email-text">gtefarikisopazo96@gmail.com</span>
                    <span class="badge badge-system">Propietario</span>
                  </td>
                  <td><span class="role-text admin-badge">ADMINISTRADOR</span></td>
                  <td><span class="system-lock" title="Sistema protegido">🔒 Protegido</span></td>
                </tr>
                <tr class="admin-row">
                  <td>
                    <span class="email-text">beltrangodoy@gmail.com</span>
                    <span class="badge badge-system">Propietario</span>
                  </td>
                  <td><span class="role-text admin-badge">ADMINISTRADOR</span></td>
                  <td><span class="system-lock" title="Sistema protegido">🔒 Protegido</span></td>
                </tr>

                <!-- Lista dinámica -->
                <tr *ngFor="let item of filteredList()" class="animate-fade-in">
                  <!-- Excluir a los admins si ya se muestran harcodeados para no duplicar -->
                  <ng-container *ngIf="item.email !== 'gtefarikisopazo96@gmail.com' && item.email !== 'beltrangodoy@gmail.com'">
                    <td>{{ item.email }}</td>
                    <td>
                      <span class="role-text" [ngClass]="item.role === 'admin' ? 'admin-badge' : 'broker-badge'">
                        {{ item.role === 'admin' ? 'ADMINISTRADOR' : 'CORREDOR' }}
                      </span>
                    </td>
                    <td class="actions-cell">
                      <button (click)="onRemoveBroker(item.email)" class="btn-delete" title="Eliminar de la lista">
                        🗑️ Eliminar
                      </button>
                    </td>
                  </ng-container>
                </tr>

                <tr *ngIf="filteredList().length === 0 && searchText">
                  <td colspan="3" class="empty-state">No se encontraron resultados para "{{ searchText }}"</td>
                </tr>
              </tbody>
            </table>
          </div>
        </ng-container>
      </div>
    </div>
  `,
  styles: [`
    .authorized-container {
      max-width: 900px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .header-section h2 {
      margin: 0 0 8px 0;
      color: #1f2937;
      font-size: 1.6rem;
      font-weight: 800;
    }
    .header-section p {
      margin: 0;
      color: #6b7280;
      font-size: 0.95rem;
    }

    .card {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
      border: 1px solid #f3f4f6;
    }
    .card h3 {
      margin-top: 0;
      margin-bottom: 16px;
      font-size: 1.1rem;
      color: #111827;
      border-bottom: 1px solid #f3f4f6;
      padding-bottom: 12px;
    }

    .add-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .form-row {
      display: flex;
      gap: 16px;
      align-items: flex-end;
      flex-wrap: wrap;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .flex-2 { flex: 2; min-width: 250px; }
    .flex-1 { flex: 1; min-width: 150px; }
    
    label {
      font-size: 0.85rem;
      font-weight: 600;
      color: #374151;
    }
    .form-control {
      padding: 10px 12px;
      border: 1.5px solid #e5e7eb;
      border-radius: 8px;
      font-size: 0.95rem;
      font-family: inherit;
      width: 100%;
      box-sizing: border-box;
      background-color: #fff;
      color: #1f2937;
    }
    .form-control:focus {
      outline: none;
      border-color: #fbbf24;
      box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.15);
    }

    .form-action {
      display: flex;
      align-items: flex-end;
    }
    .btn-add {
      background: #1f2937;
      color: white;
      border: none;
      padding: 11px 24px;
      border-radius: 8px;
      font-weight: 700;
      cursor: pointer;
      font-size: 0.95rem;
      transition: all 0.2s ease;
      white-space: nowrap;
      height: 42px;
    }
    .btn-add:hover:not(:disabled) {
      background: #374151;
    }
    .btn-add:disabled {
      background: #cbd5e1;
      cursor: not-allowed;
    }

    .alert {
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 0.88rem;
      margin-top: 16px;
    }
    .success-alert {
      background: #ecfdf5;
      color: #065f46;
      border: 1px solid #a7f3d0;
    }
    .error-alert {
      background: #fef2f2;
      color: #991b1b;
      border: 1px solid #fca5a5;
    }

    /* List section styles */
    .list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      gap: 16px;
      flex-wrap: wrap;
    }
    .list-header h3 {
      margin: 0;
      border: none;
      padding: 0;
    }
    .search-box {
      width: 300px;
    }
    .search-input {
      padding: 8px 12px;
      font-size: 0.88rem;
    }

    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      padding: 40px 0;
      color: #6b7280;
    }
    .spinner {
      width: 28px;
      height: 28px;
      border: 3px solid #f3f4f6;
      border-top-color: #fbbf24;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .table-responsive {
      overflow-x: auto;
    }
    .auth-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 0.95rem;
    }
    .auth-table th, .auth-table td {
      padding: 14px 16px;
      border-bottom: 1px solid #f3f4f6;
    }
    .auth-table th {
      background: #f9fafb;
      font-weight: 700;
      color: #4b5563;
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .auth-table tr:hover:not(.admin-row) {
      background: #fafafa;
    }

    .admin-row {
      background: #fefcf3;
    }
    .email-text {
      font-weight: 500;
      color: #111827;
    }
    .badge {
      font-size: 0.72rem;
      padding: 2px 6px;
      border-radius: 4px;
      margin-left: 8px;
      font-weight: bold;
    }
    .badge-system {
      background: #fef3c7;
      color: #d97706;
      border: 1px solid #fcd34d;
    }

    .role-text {
      font-size: 0.78rem;
      font-weight: bold;
      padding: 4px 8px;
      border-radius: 50px;
    }
    .admin-badge {
      background: #fee2e2;
      color: #b91c1c;
    }
    .broker-badge {
      background: #d1fae5;
      color: #065f46;
    }

    .actions-header {
      text-align: right;
    }
    .actions-cell {
      text-align: right;
    }
    .system-lock {
      color: #9ca3af;
      font-size: 0.85rem;
      font-weight: 500;
    }
    .btn-delete {
      background: none;
      border: 1px solid #fee2e2;
      color: #dc2626;
      padding: 6px 12px;
      border-radius: 6px;
      font-weight: 600;
      font-size: 0.82rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .btn-delete:hover {
      background: #fee2e2;
      border-color: #fca5a5;
    }

    .empty-state {
      text-align: center;
      color: #9ca3af;
      padding: 30px 0;
    }

    .animate-fade-in {
      animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class AuthorizedListComponent implements OnInit {
  private authService = inject(AuthService);

  list: { email: string, role: string }[] = [];
  searchText = '';
  newEmail = '';
  newRole: 'admin' | 'broker' = 'broker';

  isLoading = true;
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  async ngOnInit() {
    await this.loadList();
  }

  async loadList() {
    this.isLoading = true;
    try {
      this.list = await this.authService.getAuthorizedBrokers();
    } catch (e) {
      console.error('Error cargando lista:', e);
    } finally {
      this.isLoading = false;
    }
  }

  filteredList() {
    if (!this.searchText) return this.list;
    const search = this.searchText.toLowerCase().trim();
    return this.list.filter(item => item.email.toLowerCase().includes(search));
  }

  async onAddBroker() {
    if (!this.newEmail) return;

    this.isSubmitting = true;
    this.successMessage = '';
    this.errorMessage = '';

    const emailToAdd = this.newEmail.toLowerCase().trim();

    try {
      // Validar formato básico de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailToAdd)) {
        throw new Error('El formato de correo no es válido.');
      }

      // Validar duplicados
      const exists = this.list.some(item => item.email.toLowerCase() === emailToAdd) || 
                     ['gtefarikisopazo96@gmail.com', 'beltrangodoy@gmail.com'].includes(emailToAdd);
      
      if (exists) {
        throw new Error('Este correo electrónico ya se encuentra autorizado.');
      }

      await this.authService.addAuthorizedBroker(emailToAdd, this.newRole);
      
      this.successMessage = `El correo ${emailToAdd} ha sido autorizado con éxito.`;
      this.newEmail = '';
      this.newRole = 'broker';
      await this.loadList();
    } catch (e: any) {
      this.errorMessage = e.message || 'Ocurrió un error al autorizar el correo.';
    } finally {
      this.isSubmitting = false;
    }
  }

  async onRemoveBroker(email: string) {
    if (confirm(`¿Estás seguro de que deseas revocar el acceso a ${email}?`)) {
      this.successMessage = '';
      this.errorMessage = '';
      try {
        await this.authService.removeAuthorizedBroker(email);
        this.successMessage = `Se ha revocado la autorización de ${email}.`;
        await this.loadList();
      } catch (e: any) {
        this.errorMessage = e.message || 'Ocurrió un error al remover la autorización.';
      }
    }
  }
}
