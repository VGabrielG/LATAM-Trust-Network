import { Injectable, inject, signal } from '@angular/core';
import { Auth, authState, GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, User, signInWithPopup } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';
import { doc, setDoc, getDoc, collection, getDocs, deleteDoc } from 'firebase/firestore';
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
      this.isLoading.set(true);
      if (user && user.email) {
        const authorized = await this.checkUserAuthorization(user.email);
        if (authorized) {
          this.currentUser.set(user);
          this.isAuthorized.set(true);
          const isAdmin = ['gtefarikisopazo96@gmail.com', 'beltrangodoy@gmail.com'].includes(user.email.toLowerCase().trim());
          this.userRole.set(isAdmin ? 'admin' : 'broker');
          
          if (this.router.url === '/login') {
            this.router.navigate(['/panel/perfil']);
          }
        } else {
          // Si no está autorizado, forzar deslogueo
          await signOut(this.auth);
          this.currentUser.set(null);
          this.isAuthorized.set(false);
          this.userRole.set(null);
          this.router.navigate(['/login'], { queryParams: { error: 'not_authorized' } });
        }
      } else {
        this.currentUser.set(null);
        this.isAuthorized.set(false);
        this.userRole.set(null);
      }
      this.isLoading.set(false);
    });
  }

  async checkUserAuthorization(email: string): Promise<boolean> {
    const formattedEmail = email.toLowerCase().trim();
    if (['gtefarikisopazo96@gmail.com', 'beltrangodoy@gmail.com'].includes(formattedEmail)) {
      return true;
    }
    try {
      const docRef = doc(this.firestore, `authorized_brokers/${formattedEmail}`);
      const docSnap = await getDoc(docRef);
      return docSnap.exists();
    } catch (e) {
      console.error('Error verificando autorización del correo:', e);
      return false;
    }
  }

  // Obtener lista de correos autorizados
  async getAuthorizedBrokers(): Promise<{ email: string, role: string }[]> {
    try {
      const colRef = collection(this.firestore, 'authorized_brokers');
      const snap = await getDocs(colRef);
      const list: { email: string, role: string }[] = [];
      snap.forEach(doc => {
        list.push({ email: doc.id, role: doc.data()['role'] || 'broker' });
      });
      return list;
    } catch (e) {
      console.error('Error obteniendo corredores autorizados:', e);
      return [];
    }
  }

  // Agregar un correo autorizado
  async addAuthorizedBroker(email: string, role: 'admin' | 'broker' = 'broker') {
    try {
      const formattedEmail = email.toLowerCase().trim();
      const docRef = doc(this.firestore, `authorized_brokers/${formattedEmail}`);
      await setDoc(docRef, { role });
    } catch (e) {
      console.error('Error agregando corredor autorizado:', e);
      throw e;
    }
  }

  // Eliminar un correo autorizado
  async removeAuthorizedBroker(email: string) {
    try {
      const formattedEmail = email.toLowerCase().trim();
      // Impedir borrar a los admins principales por seguridad
      if (['gtefarikisopazo96@gmail.com', 'beltrangodoy@gmail.com'].includes(formattedEmail)) {
        throw new Error('No se pueden remover los administradores principales.');
      }
      const docRef = doc(this.firestore, `authorized_brokers/${formattedEmail}`);
      await deleteDoc(docRef);
    } catch (e) {
      console.error('Error eliminando corredor autorizado:', e);
      throw e;
    }
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
    if (user && user.email) {
      const authorized = await this.checkUserAuthorization(user.email);
      if (authorized) {
        this.isAuthorized.set(true);
        const isAdmin = ['gtefarikisopazo96@gmail.com', 'beltrangodoy@gmail.com'].includes(user.email.toLowerCase().trim());
        this.userRole.set(isAdmin ? 'admin' : 'broker');
        this.router.navigate(['/panel/perfil']);
      } else {
        await signOut(this.auth);
        this.isAuthorized.set(false);
        this.userRole.set(null);
        this.router.navigate(['/login'], { queryParams: { error: 'not_authorized' } });
      }
    }
  }

  async logout() {
    await signOut(this.auth);
    this.router.navigate(['/']);
  }
}

