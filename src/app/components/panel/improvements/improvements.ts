import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { getApp } from 'firebase/app';
import { AuthService } from '../../../services/auth.service';

interface ImprovementSuggestion {
  id?: string;
  brokerEmail: string;
  brokerName: string;
  content: string;
  likes: number;
  likedBy: string[];
  createdAt: string;
}

@Component({
  selector: 'app-improvements',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="improvements-container animate-fade-in">
      <div class="header-section">
        <h2>Foro de Mejoras de la Plataforma</h2>
        <p>¿Tienes alguna idea para mejorar el sitio? Publícala aquí para que otros corredores puedan verla y votar por ella.</p>
      </div>

      <div class="layout-grid">
        <!-- Input Form Box -->
        <div class="suggest-box">
          <h3>Proponer una Mejora</h3>
          <form [formGroup]="suggestForm" (ngSubmit)="onSubmit()" class="suggest-form">
            <div class="form-group">
              <label>Describe tu propuesta de mejora *</label>
              <textarea formControlName="content" rows="4" placeholder="Ej: Me gustaría que las propiedades tengan una opción de filtro por número de bodegas en el buscador..." class="form-control"></textarea>
              <span class="error-text" *ngIf="suggestForm.get('content')?.touched && suggestForm.get('content')?.invalid">Debes escribir una sugerencia válida.</span>
            </div>

            <button type="submit" [disabled]="suggestForm.invalid || isSaving" class="btn-submit">
              {{ isSaving ? 'PUBLICANDO...' : 'PUBLICAR MEJORA' }}
            </button>
          </form>
        </div>

        <!-- Proposals Feed / List Box -->
        <div class="feed-box">
          <h3>Propuestas de la Comunidad</h3>

          <div *ngIf="isLoading" class="loading-state">
            <div class="spinner"></div>
            <p>Cargando ideas de mejora...</p>
          </div>

          <div *ngIf="!isLoading && suggestions.length === 0" class="empty-state">
            <p>Aún no hay propuestas de mejora. ¡Sé el primero en proponer una!</p>
          </div>

          <div class="suggestions-feed" *ngIf="!isLoading && suggestions.length > 0">
            <div class="suggestion-item" *ngFor="let s of suggestions">
              <div class="item-header">
                <div class="author-info">
                  <span class="author-name">{{ s.brokerName || s.brokerEmail.split('@')[0] }}</span>
                  <span class="author-email">{{ s.brokerEmail }}</span>
                </div>
                <span class="date">{{ s.createdAt | date:'dd/MM/yyyy HH:mm' }}</span>
              </div>
              <p class="suggestion-content">{{ s.content }}</p>
              
              <div class="item-actions">
                <button (click)="likeSuggestion(s)" [disabled]="hasLiked(s) || isLikeProcessing" class="btn-like" [class.active]="hasLiked(s)">
                  👍 {{ s.likes }} {{ s.likes === 1 ? 'Voto' : 'Votos' }}
                </button>
                <span class="voted-text" *ngIf="hasLiked(s)">¡Ya votaste por esta idea!</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .improvements-container {
      max-width: 1100px;
      margin: 0 auto;
    }

    .header-section {
      margin-bottom: 2.5rem;
    }

    .header-section h2 {
      margin: 0 0 0.5rem 0;
      color: #1f2937;
      font-size: 1.8rem;
    }

    .header-section p {
      margin: 0;
      color: #6b7280;
      font-size: 1rem;
    }

    .layout-grid {
      display: grid;
      grid-template-columns: 1fr 1.5fr;
      gap: 2.5rem;
      align-items: start;
    }

    @media (max-width: 991px) {
      .layout-grid {
        grid-template-columns: 1fr;
      }
    }

    .suggest-box, .feed-box {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 2rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }

    h3 {
      margin-top: 0;
      margin-bottom: 1.5rem;
      font-size: 1.15rem;
      color: #1f2937;
      border-bottom: 1px solid #f3f4f6;
      padding-bottom: 0.8rem;
    }

    .suggest-form {
      display: flex;
      flex-direction: column;
      gap: 1.2rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }

    .form-group label {
      font-size: 0.82rem;
      font-weight: 600;
      color: #4b5563;
    }

    .form-control {
      padding: 10px 12px;
      border: 1px solid #d1d5db;
      border-radius: 4px;
      font-size: 0.88rem;
      font-family: inherit;
    }

    .form-control:focus {
      outline: none;
      border-color: #3b82f6;
    }

    .btn-submit {
      background: #10b981;
      color: white;
      border: none;
      padding: 12px;
      border-radius: 4px;
      font-weight: 700;
      cursor: pointer;
      font-size: 0.88rem;
      letter-spacing: 0.5px;
      transition: background-color 0.2s;
    }

    .btn-submit:hover:not(:disabled) {
      background: #059669;
    }

    .btn-submit:disabled {
      background: #9ca3af;
      cursor: not-allowed;
    }

    /* Feed suggestion list */
    .suggestions-feed {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .suggestion-item {
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      padding: 1.2rem;
      background: #fafafa;
    }

    .item-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 0.8rem;
    }

    .author-info {
      display: flex;
      flex-direction: column;
    }

    .author-name {
      font-weight: 700;
      color: #1f2937;
      font-size: 0.9rem;
    }

    .author-email {
      font-size: 0.75rem;
      color: #6b7280;
    }

    .date {
      font-size: 0.72rem;
      color: #9ca3af;
    }

    .suggestion-content {
      font-size: 0.88rem;
      color: #374151;
      line-height: 1.5;
      margin: 0 0 1rem 0;
    }

    .item-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .btn-like {
      background: #f3f4f6;
      border: 1px solid #cbd5e1;
      color: #4b5563;
      padding: 6px 12px;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s;
    }

    .btn-like:hover:not(:disabled) {
      background: #e5e7eb;
      border-color: #9ca3af;
    }

    .btn-like.active {
      background: #dcfce7;
      border-color: #86efac;
      color: #166534;
      cursor: not-allowed;
    }

    .voted-text {
      font-size: 0.72rem;
      color: #059669;
      font-weight: 600;
    }

    .error-text {
      font-size: 0.75rem;
      color: #dc2626;
    }

    .loading-state {
      text-align: center;
      padding: 3rem 0;
      color: #6b7280;
    }

    .spinner {
      width: 24px;
      height: 24px;
      border: 2px solid #e5e7eb;
      border-top-color: #3b82f6;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto 0.8rem auto;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    .empty-state {
      text-align: center;
      padding: 3rem 1.5rem;
      border: 1px dashed #d1d5db;
      border-radius: 6px;
      color: #6b7280;
      font-size: 0.88rem;
    }

    .animate-fade-in {
      animation: fadeIn 0.4s ease-out forwards;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class ImprovementsComponent implements OnInit {
  suggestForm: FormGroup;
  suggestions: ImprovementSuggestion[] = [];
  isLoading = true;
  isSaving = false;
  isLikeProcessing = false;

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  constructor() {
    this.suggestForm = this.fb.group({
      content: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  async ngOnInit() {
    await this.loadSuggestions();
  }

  async loadSuggestions() {
    this.isLoading = true;
    try {
      const db = getFirestore(getApp());
      const colRef = collection(db, 'improvements');
      const q = query(colRef, orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      
      this.suggestions = [];
      snap.forEach(doc => {
        this.suggestions.push({
          id: doc.id,
          ...doc.data()
        } as ImprovementSuggestion);
      });

      // Sort by likes desc
      this.suggestions.sort((a, b) => b.likes - a.likes);
    } catch (e) {
      console.error('Error loading suggestions', e);
    } finally {
      this.isLoading = false;
    }
  }

  async onSubmit() {
    if (this.suggestForm.invalid) return;

    const user = this.authService.currentUser();
    const email = user?.email;
    if (!email) return;

    this.isSaving = true;
    try {
      const db = getFirestore(getApp());
      const colRef = collection(db, 'improvements');
      
      const newSuggestion: Omit<ImprovementSuggestion, 'id'> = {
        brokerEmail: email,
        brokerName: user.displayName || email.split('@')[0],
        content: this.suggestForm.value.content,
        likes: 0,
        likedBy: [],
        createdAt: new Date().toISOString()
      };

      await addDoc(colRef, newSuggestion);
      
      this.suggestForm.reset();
      await this.loadSuggestions();
    } catch (e) {
      console.error('Error saving suggestion', e);
      alert('Hubo un error al enviar la propuesta.');
    } finally {
      this.isSaving = false;
    }
  }

  hasLiked(s: ImprovementSuggestion): boolean {
    const email = this.authService.currentUser()?.email;
    if (!email) return false;
    return s.likedBy?.includes(email);
  }

  async likeSuggestion(s: ImprovementSuggestion) {
    const email = this.authService.currentUser()?.email;
    if (!email || !s.id || this.hasLiked(s) || this.isLikeProcessing) return;

    this.isLikeProcessing = true;
    try {
      const db = getFirestore(getApp());
      const docRef = doc(db, 'improvements', s.id);
      
      const updatedLikedBy = [...(s.likedBy || []), email];
      const updatedLikes = s.likes + 1;

      await updateDoc(docRef, {
        likes: updatedLikes,
        likedBy: updatedLikedBy
      });

      s.likes = updatedLikes;
      s.likedBy = updatedLikedBy;
    } catch (e) {
      console.error('Error liking suggestion', e);
    } finally {
      this.isLikeProcessing = false;
    }
  }
}
