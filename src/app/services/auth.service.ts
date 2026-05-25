import { Injectable, inject, signal } from '@angular/core';
import { Auth, authState, GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, User, signInWithPopup } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';
import { doc, setDoc } from 'firebase/firestore';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private router = inject(Router);

  // Signals para el estado reactivo
  public currentUser = signal<User | null>(null);
  public isAuthorized = signal<boolean>(false);
  public userRole = signal<'admin' | 'broker' | null>(null);
  public isLoading = signal<boolean>(true);

  private initialized = false;

  constructor() {
    // Fallback de seguridad
    setTimeout(() => {
      if (this.isLoading()) {
        this.isLoading.set(false);
      }
    }, 2500);

    // Escuchar cambios de estado de autenticación
    authState(this.auth).subscribe(async (user) => {
      this.currentUser.set(user);
      
      if (user) {
        this.isAuthorized.set(true);
        this.userRole.set('broker');

        if (this.router.url === '/login') {
          this.router.navigate(['/panel/perfil']);
        }
      } else {
        this.isAuthorized.set(false);
        this.userRole.set(null);
      }
      this.isLoading.set(false);
    });
  }

  async loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    try {
      this.isLoading.set(true);
      const result = await signInWithPopup(this.auth, provider);
      await this.handleAuthResult(result.user);
    } catch (error: any) {
      console.error('Error iniciando popup de Google:', error);
      this.isLoading.set(false);
    }
  }

  async loginWithEmail(email: string, pass: string) {
    this.isLoading.set(true);
    try {
      const result = await signInWithEmailAndPassword(this.auth, email, pass);
      await this.handleAuthResult(result.user);
    } catch (error) {
      console.error('Error en login con correo', error);
      this.isLoading.set(false);
      throw error;
    }
  }

  async registerWithEmail(email: string, pass: string) {
    this.isLoading.set(true);
    try {
      const result = await createUserWithEmailAndPassword(this.auth, email, pass);
      await this.handleAuthResult(result.user);
    } catch (error) {
      console.error('Error en registro con correo', error);
      this.isLoading.set(false);
      throw error;
    }
  }

  async registerNewBrokerByAdmin(email: string, pass: string, role: 'admin' | 'broker') {
    const { initializeApp, deleteApp } = await import('firebase/app');
    const { getAuth, createUserWithEmailAndPassword } = await import('firebase/auth');
    const { environment } = await import('../../environments/environment');

    const tempAppName = `temp_register_${Date.now()}`;
    const tempApp = initializeApp(environment.firebase, tempAppName);
    const tempAuth = getAuth(tempApp);

    try {
      await createUserWithEmailAndPassword(tempAuth, email, pass);
      const adminRef = doc(this.firestore, `authorized_brokers/${email}`);
      await setDoc(adminRef, { role });
      await deleteApp(tempApp);
    } catch (error) {
      await deleteApp(tempApp);
      throw error;
    }
  }

  private async handleAuthResult(user: User) {
    if (user) {
      this.isAuthorized.set(true);
      this.userRole.set('broker');
      this.router.navigate(['/panel/perfil']);
    }
  }

  async logout() {
    await signOut(this.auth);
    this.router.navigate(['/']);
  }
}

