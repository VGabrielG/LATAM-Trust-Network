import { Injectable } from '@angular/core';
import { getFirestore, doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getApp } from 'firebase/app';

export interface BrokerProfile {
  name: string;
  bio: string;
  phone: string;
  photoUrl: string;
  email: string;
  company?: string;
  whatsapp?: string;
  rut?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BrokerService {

  private getDb() {
    return getFirestore(getApp());
  }

  private getStorageRef() {
    return getStorage(getApp());
  }

  private withTimeout<T>(promise: Promise<T>, timeoutMs: number = 7000, errorMsg: string = 'Operation timed out'): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(errorMsg));
      }, timeoutMs);
      promise.then(
        (res) => {
          clearTimeout(timer);
          resolve(res);
        },
        (err) => {
          clearTimeout(timer);
          reject(err);
        }
      );
    });
  }

  async getProfile(email: string): Promise<BrokerProfile | null> {
    try {
      const db = this.getDb();
      const docRef = doc(db, 'brokers', email);
      console.log('BrokerService.getProfile: fetching doc at brokers/' + email);
      const snap = await this.withTimeout(getDoc(docRef), 7000, 'Failed to get document because the request timed out');
      console.log('BrokerService.getProfile: snap.exists() =', snap.exists());
      if (snap.exists()) {
        const data = snap.data() as BrokerProfile;
        console.log('BrokerService.getProfile: data =', JSON.stringify(data));
        return data;
      }
      return null;
    } catch (error) {
      console.error('BrokerService.getProfile: ERROR', error);
      return null;
    }
  }

  async saveProfile(email: string, profile: Partial<BrokerProfile>): Promise<void> {
    try {
      const db = this.getDb();
      const docRef = doc(db, 'brokers', email);
      const dataToSave = { ...profile, email };
      console.log('BrokerService.saveProfile: saving to brokers/' + email, JSON.stringify(dataToSave));
      await this.withTimeout(setDoc(docRef, dataToSave, { merge: true }), 7000, 'Failed to save document because the request timed out');
      console.log('BrokerService.saveProfile: SUCCESS');
    } catch (error) {
      console.error('BrokerService.saveProfile: ERROR', error);
      throw error;
    }
  }

  async uploadPhoto(email: string, file: File): Promise<string> {
    const { compressAndConvertToBase64 } = await import('../utils/image-compress');
    try {
      console.log(`Intentando subir foto de perfil a Firebase Storage: ${file.name}`);
      const storage = this.getStorageRef();
      const storageRef = ref(storage, `brokers_photos/${email}/${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      console.log(`Foto de perfil subida con éxito: ${url}`);
      return url;
    } catch (error) {
      console.warn(`Error al subir foto de perfil (CORS/No habilitado). Usando fallback de compresión local Base64: ${file.name}`, error);
      return await compressAndConvertToBase64(file);
    }
  }

  async getAllProfiles(): Promise<BrokerProfile[]> {
    try {
      const db = this.getDb();
      const colRef = collection(db, 'brokers');
      const snap = await this.withTimeout(getDocs(colRef), 7000, 'Failed to list brokers because the request timed out');
      const profiles: BrokerProfile[] = [];
      snap.forEach(doc => {
        profiles.push(doc.data() as BrokerProfile);
      });
      return profiles;
    } catch (error) {
      console.error('BrokerService.getAllProfiles: ERROR', error);
      return [];
    }
  }
}
