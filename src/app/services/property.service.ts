import { Injectable } from '@angular/core';
import { getFirestore, collection, doc, addDoc, updateDoc, deleteDoc, getDocs, getDoc, query, where, Timestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getApp } from 'firebase/app';

export interface Property {
  id?: string;
  brokerEmail: string;
  title: string;
  operationType: 'venta' | 'arriendo';
  value: number;
  commune: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  totalSqm: number;
  usefulSqm: number;
  parking?: number;
  storage?: number;
  commonExpenses?: number;
  amenities?: string;
  description: string;
  photos: string[];
  status: 'disponible' | 'vendida' | 'arrendada';
  createdAt?: Timestamp;
  documents?: {
    [key: string]: {
      name: string;
      url: string;
      uploadedAt: string;
    }
  };
  extraDocuments?: Array<{
    name: string;
    url: string;
    uploadedAt: string;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class PropertyService {
  private collectionName = 'properties';

  private getDb() {
    return getFirestore(getApp());
  }

  private withTimeout<T>(promise: Promise<T>, timeoutMs: number = 5000, errorMsg: string = 'Operation timed out'): Promise<T> {
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

  async getPropertiesByBroker(email: string, role: 'admin' | 'broker' | null = 'broker'): Promise<Property[]> {
    try {
      const db = this.getDb();
      let q;
      if (role === 'admin') {
        q = query(collection(db, this.collectionName));
      } else {
        q = query(collection(db, this.collectionName), where('brokerEmail', '==', email));
      }
      const querySnapshot = await this.withTimeout(getDocs(q), 5000, 'Properties query timed out');
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Property));
    } catch (error) {
      console.error('PropertyService.getPropertiesByBroker: ERROR', error);
      return [];
    }
  }

  async getProperty(id: string): Promise<Property | null> {
    try {
      const db = this.getDb();
      const docRef = doc(db, this.collectionName, id);
      const snap = await this.withTimeout(getDoc(docRef), 5000, 'Property fetch timed out');
      if (snap.exists()) {
        return { id: snap.id, ...snap.data() } as Property;
      }
      return null;
    } catch (error) {
      console.error('PropertyService.getProperty: ERROR', error);
      return null;
    }
  }

  async addProperty(property: Omit<Property, 'id'>): Promise<string> {
    try {
      const db = this.getDb();
      const docRef = await this.withTimeout(
        addDoc(collection(db, this.collectionName), {
          ...property,
          createdAt: Timestamp.now()
        }),
        5000,
        'Add property timed out'
      );
      return docRef.id;
    } catch (error) {
      console.error('PropertyService.addProperty: ERROR', error);
      throw error;
    }
  }

  async updateProperty(id: string, property: Partial<Property>): Promise<void> {
    try {
      const db = this.getDb();
      const docRef = doc(db, this.collectionName, id);
      await this.withTimeout(updateDoc(docRef, property), 5000, 'Update property timed out');
    } catch (error) {
      console.error('PropertyService.updateProperty: ERROR', error);
      throw error;
    }
  }

  async getAllProperties(): Promise<Property[]> {
    try {
      const db = this.getDb();
      const q = query(collection(db, this.collectionName));
      const snapshot = await this.withTimeout(getDocs(q), 5000, 'All properties query timed out');
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Property));
    } catch (error) {
      console.error('PropertyService.getAllProperties: ERROR', error);
      return [];
    }
  }

  async getDistinctBrokers(): Promise<string[]> {
    const all = await this.getAllProperties();
    const set = new Set<string>();
    all.forEach(p => set.add(p.brokerEmail));
    return Array.from(set);
  }

  async deleteProperty(id: string): Promise<void> {
    try {
      const db = this.getDb();
      const docRef = doc(db, this.collectionName, id);
      await this.withTimeout(deleteDoc(docRef), 5000, 'Delete property timed out');
    } catch (error) {
      console.error('PropertyService.deleteProperty: ERROR', error);
      throw error;
    }
  }

  async uploadPropertyPhotos(brokerEmail: string, files: File[]): Promise<string[]> {
    const urls: string[] = [];
    const { compressAndConvertToBase64 } = await import('../utils/image-compress');

    for (const file of files) {
      try {
        console.log(`Intentando subir foto a Firebase Storage: ${file.name}`);
        const storage = getStorage(getApp());
        const storageRef = ref(storage, `properties/${brokerEmail}/${Date.now()}_${file.name}`);
        await this.withTimeout(uploadBytes(storageRef, file), 5000, 'Storage upload timed out');
        const url = await this.withTimeout(getDownloadURL(storageRef), 5000, 'Get download URL timed out');
        console.log(`Foto subida con éxito: ${url}`);
        urls.push(url);
      } catch (error) {
        console.warn(`Error al subir a Firebase Storage (CORS/No habilitado). Usando fallback de compresión local Base64 para: ${file.name}`, error);
        const base64 = await compressAndConvertToBase64(file);
        urls.push(base64);
      }
    }
    return urls;
  }

  async uploadPropertyDocument(brokerEmail: string, propertyId: string, file: File): Promise<string> {
    try {
      console.log(`Intentando subir documento a Firebase Storage: ${file.name}`);
      const storage = getStorage(getApp());
      const storageRef = ref(storage, `properties/${brokerEmail}/${propertyId}/documents/${Date.now()}_${file.name}`);
      await this.withTimeout(uploadBytes(storageRef, file), 10000, 'Storage upload timed out');
      const url = await this.withTimeout(getDownloadURL(storageRef), 10000, 'Get download URL timed out');
      console.log(`Documento subido con éxito: ${url}`);
      return url;
    } catch (error) {
      console.warn(`Error al subir a Firebase Storage. Usando fallback de conversión local Base64 para: ${file.name}`, error);
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
      });
    }
  }
}

