import { Injectable, signal } from '@angular/core';
import { FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  Firestore, 
  collection, 
  doc, 
  onSnapshot, 
  getDocs, 
  getDoc,
  setDoc,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Broker {
  id: string;
  name: string;
  role: string;
  photo: string;
  bio: string;
  email: string;
  phone: string;
  whatsapp: string;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  type: 'Casa' | 'Departamento' | 'Oficina' | 'Terreno' | 'Local Comercial';
  contractType: 'Compra' | 'Arriendo';
  price: number;
  priceUnit: 'UF' | 'CLP';
  address: string;
  commune: string;
  bedrooms: number;
  bathrooms: number;
  parking: number;
  areaUseful: number;
  areaTotal: number;
  photo: string;
  brokerId: string;
  status: 'Disponible' | 'Reservado' | 'Vendido';
  createdAt: string;
}

export interface Review {
  id: string;
  brokerId: string;
  clientName: string;
  rating: number;
  comment: string;
  date: string;
}

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private app!: FirebaseApp;
  private db!: Firestore;
  
  private propertiesSubject = new BehaviorSubject<Property[]>([]);
  public properties$ = this.propertiesSubject.asObservable();
  
  // Real-time properties signal
  public properties = signal<Property[]>([]);
  public loading = signal<boolean>(true);

  private firebaseConfig = {
    projectId: "latam-trust",
    appId: "1:614675292097:web:2f65800306ec4ccd471940",
    storageBucket: "latam-trust.firebasestorage.app",
    apiKey: "AIzaSyA9Slr6rZ406FGbEJ9IHhiZhgLX7CrET4g",
    authDomain: "latam-trust.firebaseapp.com",
    messagingSenderId: "614675292097",
    measurementId: "G-76QWPP8846"
  };

  constructor() {
    this.initFirebase();
  }

  private async initFirebase() {
    try {
      // Reuse the Firebase app already initialized by app.config.ts (provideFirebaseApp)
      const { getApp } = await import('firebase/app');
      this.app = getApp();
      // Reuse the Firestore instance already initialized by app.config.ts (provideFirestore)
      this.db = getFirestore(this.app);
      console.log('FirebaseService: Reusing existing Firebase/Firestore instance.');
      
      // First, seed data if empty
      await this.seedDatabaseIfEmpty();
      
      // Then, setup real-time properties sync
      this.setupRealTimeProperties();
    } catch (error) {
      console.error('Error initializing Firebase:', error);
      this.loading.set(false);
    }
  }

  private setupRealTimeProperties() {
    const propsCol = collection(this.db, 'properties');
    // Order properties by creation date
    onSnapshot(propsCol, (snapshot) => {
      const propertiesList: Property[] = [];
      snapshot.forEach((doc) => {
        propertiesList.push({ id: doc.id, ...doc.data() } as Property);
      });
      
      // Sort by status (Disponible first) and then by date desc
      propertiesList.sort((a, b) => {
        if (a.status === 'Disponible' && b.status !== 'Disponible') return -1;
        if (a.status !== 'Disponible' && b.status === 'Disponible') return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      this.propertiesSubject.next(propertiesList);
      this.properties.set(propertiesList);
      this.loading.set(false);
      console.log('Real-time properties loaded:', propertiesList.length);
    }, (error) => {
      console.error('Error reading real-time properties:', error);
      this.loading.set(false);
    });
  }

  // Seeding Logic
  private async seedDatabaseIfEmpty() {
    try {
      const brokersSnapshot = await getDocs(collection(this.db, 'brokers'));
      if (brokersSnapshot.empty) {
        console.log('Database is empty. Starting auto-seeding protocol...');
        await this.seedBrokers();
        await this.seedReviews();
        await this.seedProperties();
        console.log('Auto-seeding protocol completed successfully.');
      } else {
        console.log('Database already populated. Seeding skipped.');
      }
    } catch (e) {
      console.error('Error during database auto-seeding:', e);
    }
  }

  private async seedBrokers() {
    const brokers: Broker[] = [
      {
        id: 'beltran-godoy',
        name: 'Beltrán Godoy',
        role: 'CEO & Co-Founder',
        photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&q=80',
        bio: 'Visionario líder en Ingeniería de Confianza Inmobiliaria. Especialista en la estructuración de transacciones de alto patrimonio y activos comerciales en el sector oriente de Santiago.',
        email: 'beltran@latamtrust.cl',
        phone: '+56 9 7856 6562',
        whatsapp: '56978566562'
      },
      {
        id: 'carolina-santis',
        name: 'Carolina Santis',
        role: 'Directora Residencial',
        photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&q=80',
        bio: 'Especialista en propiedades residenciales de lujo en Vitacura, Las Condes y Lo Barnechea. Más de 10 años de experiencia asesorando a familias en Chile y el extranjero.',
        email: 'carolina@latamtrust.cl',
        phone: '+56 9 8234 5678',
        whatsapp: '56982345678'
      },
      {
        id: 'andres-villalobos',
        name: 'Andrés Villalobos',
        role: 'Director Legal & Técnico',
        photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop&q=80',
        bio: 'Abogado especialista en derecho inmobiliario y tasaciones. Encargado del blindaje contractual y saneamiento de títulos para dar máxima seguridad jurídica al Hub.',
        email: 'andres@latamtrust.cl',
        phone: '+56 9 6123 4567',
        whatsapp: '56961234567'
      },
      {
        id: 'sofia-larrain',
        name: 'Sofía Larraín',
        role: 'Consultora de Inversiones',
        photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&q=80',
        bio: 'Especialista en el mercado de arriendos premium y lofts de diseño en Providencia, Ñuñoa y Santiago Centro. Enfocada en maximizar la rentabilidad de inversionistas.',
        email: 'sofia@latamtrust.cl',
        phone: '+56 9 5555 4444',
        whatsapp: '56955554444'
      }
    ];

    for (const b of brokers) {
      await setDoc(doc(this.db, 'brokers', b.id), b);
    }
  }

  private async seedReviews() {
    const reviews: Review[] = [
      {
        id: 'rev1',
        brokerId: 'sofia-larrain',
        clientName: 'Diego Valenzuela',
        rating: 5,
        comment: 'Excelente gestión en el arriendo del loft. Sofía fue súper transparente, rápida y aclaró todas nuestras dudas jurídicas en el contrato.',
        date: '2026-04-12'
      },
      {
        id: 'rev2',
        brokerId: 'carolina-santis',
        clientName: 'Margarita Cox',
        rating: 5,
        comment: 'Una corredora de primer nivel. Entendió perfectamente nuestras necesidades y nos acompañó en cada etapa de la compra de nuestro departamento en Vitacura.',
        date: '2026-03-20'
      },
      {
        id: 'rev3',
        brokerId: 'beltran-godoy',
        clientName: 'Roberto Silva (Inversiones RS)',
        rating: 5,
        comment: 'El profesionalismo de Beltrán es incomparable. Su enfoque técnico de Ingeniería de Confianza nos dio la tranquilidad que necesitábamos para una transacción de esta envergadura.',
        date: '2026-05-02'
      },
      {
        id: 'rev4',
        brokerId: 'andres-villalobos',
        clientName: 'Patricia Larraín',
        rating: 5,
        comment: 'Andrés resolvió un tema de saneamiento de títulos sumamente complejo en tiempo récord. Totalmente recomendado por su experiencia legal.',
        date: '2026-02-15'
      },
      {
        id: 'rev5',
        brokerId: 'sofia-larrain',
        clientName: 'Francisca Allende',
        rating: 4,
        comment: 'Muy buena experiencia arrendando con Sofía. Excelente comunicación y gestión ágil.',
        date: '2026-05-10'
      },
      {
        id: 'rev6',
        brokerId: 'carolina-santis',
        clientName: 'Esteban Lagos',
        rating: 5,
        comment: 'Carolina es sumamente comprometida. Consiguió un descuento excelente y coordinó todo a la perfección.',
        date: '2026-05-01'
      }
    ];

    for (const r of reviews) {
      await setDoc(doc(this.db, 'reviews', r.id), r);
    }
  }

  private async seedProperties() {
    const properties: Property[] = [
      {
        id: 'prop1',
        title: 'Loft Minimalista Providencia',
        description: 'Luminoso loft con diseño vanguardista de doble altura. Ubicación inmejorable a pasos de comercios, cafés de especialidad y conectividad fluida. Cocina equipada con encimera de cuarzo y grifería de gama alta.',
        type: 'Departamento',
        contractType: 'Arriendo',
        price: 950000,
        priceUnit: 'CLP',
        address: 'Av. Providencia 1480, Providencia',
        commune: 'Providencia',
        bedrooms: 1,
        bathrooms: 1,
        parking: 1,
        areaUseful: 65,
        areaTotal: 72,
        photo: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop&q=80',
        brokerId: 'sofia-larrain',
        status: 'Disponible',
        createdAt: '2026-05-18T10:00:00Z'
      },
      {
        id: 'prop2',
        title: 'Penthouse con Vista al Golf Vitacura',
        description: 'Penthouse de lujo con espectacular terraza panorámica en 360 grados frente al Club de Golf. Terminaciones de primer nivel, piso de madera de ingeniería, calefacción central sectorizada, y seguridad reforzada 24/7.',
        type: 'Departamento',
        contractType: 'Compra',
        price: 16800,
        priceUnit: 'UF',
        address: 'Av. Club de Golf 210, Vitacura',
        commune: 'Vitacura',
        bedrooms: 3,
        bathrooms: 3,
        parking: 2,
        areaUseful: 185,
        areaTotal: 210,
        photo: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80',
        brokerId: 'carolina-santis',
        status: 'Disponible',
        createdAt: '2026-05-15T09:00:00Z'
      },
      {
        id: 'prop3',
        title: 'Casa Mediterránea Lo Barnechea',
        description: 'Impresionante residencia mediterránea proyectada por destacado arquitecto nacional. Grandes ventanales de termopanel, quincho equipado integrado al jardín parquizado, piscina temperada y vistas privilegiadas a la cordillera.',
        type: 'Casa',
        contractType: 'Compra',
        price: 28500,
        priceUnit: 'UF',
        address: 'El Camino 12900, Lo Barnechea',
        commune: 'Lo Barnechea',
        bedrooms: 5,
        bathrooms: 4,
        parking: 4,
        areaUseful: 340,
        areaTotal: 820,
        photo: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop&q=80',
        brokerId: 'beltran-godoy',
        status: 'Disponible',
        createdAt: '2026-05-19T14:30:00Z'
      },
      {
        id: 'prop4',
        title: 'Oficina Corporativa Nueva Las Condes',
        description: 'Planta de oficinas habilitada con mobiliario de alta calidad en pleno barrio de negocios. Cuenta con recepción, sala de reuniones ejecutiva, privados amplios, cocina y estacionamientos privados en subterráneo.',
        type: 'Oficina',
        contractType: 'Arriendo',
        price: 135,
        priceUnit: 'UF',
        address: 'Av. Vitacura 5250, Las Condes',
        commune: 'Las Condes',
        bedrooms: 4,
        bathrooms: 2,
        parking: 3,
        areaUseful: 145,
        areaTotal: 145,
        photo: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80',
        brokerId: 'beltran-godoy',
        status: 'Disponible',
        createdAt: '2026-05-12T08:15:00Z'
      },
      {
        id: 'prop5',
        title: 'Local Comercial Barrio Lastarria',
        description: 'Local en el corazón cultural e histórico de Santiago Centro. Excelente visibilidad y alto flujo peatonal diario. Ideal para cafetería de autor, galería de arte o showroom. Planta libre más trastienda para almacén.',
        type: 'Local Comercial',
        contractType: 'Arriendo',
        price: 1800000,
        priceUnit: 'CLP',
        address: 'José Victorino Lastarria 85, Santiago',
        commune: 'Santiago',
        bedrooms: 2,
        bathrooms: 2,
        parking: 0,
        areaUseful: 95,
        areaTotal: 95,
        photo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
        brokerId: 'andres-villalobos',
        status: 'Disponible',
        createdAt: '2026-05-16T11:00:00Z'
      },
      {
        id: 'prop6',
        title: 'Amplio Departamento Familiar Ñuñoa',
        description: 'Espacioso departamento en sector residencial consolidado. Cuenta con excelente conectividad, a pasos de colegios de prestigio y parques. Dormitorios amplios con closet, suite con walk-in closet y terrazas remodeladas.',
        type: 'Departamento',
        contractType: 'Compra',
        price: 8900,
        priceUnit: 'UF',
        address: 'Av. Irarrázaval 3600, Ñuñoa',
        commune: 'Ñuñoa',
        bedrooms: 3,
        bathrooms: 2,
        parking: 1,
        areaUseful: 98,
        areaTotal: 110,
        photo: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop&q=80',
        brokerId: 'carolina-santis',
        status: 'Reservado',
        createdAt: '2026-05-10T16:20:00Z'
      }
    ];

    for (const p of properties) {
      await setDoc(doc(this.db, 'properties', p.id), p);
    }
  }

  // API Methods
  async getBroker(id: string): Promise<Broker | null> {
    try {
      const docRef = doc(this.db, 'brokers', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data() as Broker;
      }
      return null;
    } catch (e) {
      console.error('Error fetching broker details:', e);
      return null;
    }
  }

  async getBrokerReviews(brokerId: string): Promise<Review[]> {
    try {
      const reviewsCol = collection(this.db, 'reviews');
      const q = query(reviewsCol, where('brokerId', '==', brokerId));
      const querySnapshot = await getDocs(q);
      const reviewsList: Review[] = [];
      querySnapshot.forEach((doc) => {
        reviewsList.push({ id: doc.id, ...doc.data() } as Review);
      });
      // Sort reviews by date desc
      reviewsList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      return reviewsList;
    } catch (e) {
      console.error('Error fetching broker reviews:', e);
      return [];
    }
  }

  async getBrokerProperties(brokerId: string): Promise<Property[]> {
    try {
      const propsCol = collection(this.db, 'properties');
      const q = query(propsCol, where('brokerId', '==', brokerId));
      const querySnapshot = await getDocs(q);
      const propsList: Property[] = [];
      querySnapshot.forEach((doc) => {
        propsList.push({ id: doc.id, ...doc.data() } as Property);
      });
      // Filter out non-Disponible if you want, but the prompt says:
      // "displaying only their 'Available' properties" in public profile.
      // We will return all and filter in component, or query only 'Disponible'.
      return propsList;
    } catch (e) {
      console.error('Error fetching broker properties:', e);
      return [];
    }
  }

  // Get active brokers map to attach broker info to property cards
  async getBrokersMap(): Promise<Record<string, Broker>> {
    try {
      const brokersCol = collection(this.db, 'brokers');
      const querySnapshot = await getDocs(brokersCol);
      const brokersMap: Record<string, Broker> = {};
      querySnapshot.forEach((doc) => {
        brokersMap[doc.id] = doc.data() as Broker;
      });
      return brokersMap;
    } catch (e) {
      console.error('Error fetching brokers map:', e);
      return {};
    }
  }
}
