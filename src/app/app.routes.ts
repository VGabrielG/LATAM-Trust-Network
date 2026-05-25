import { Routes } from '@angular/router';
import { LandingComponent } from './components/landing/landing';
import { ServiceDetailComponent } from './components/service-detail';
import { TestComponent } from './components/test/test';
import { AboutComponent } from './components/about/about';
import { LoginComponent } from './components/login/login';
import { MarketplaceComponent } from './components/marketplace/marketplace';
import { PanelLayoutComponent } from './components/panel/panel-layout/panel-layout';
import { ProfileComponent } from './components/panel/profile/profile';
import { PropertyListComponent } from './components/panel/property-list/property-list';
import { PropertyFormComponent } from './components/panel/property-form/property-form';
import { PropertyDocumentsComponent } from './components/panel/property-documents/property-documents';
import { BrokerJoinComponent } from './components/broker-join/broker-join';
import { BrokerDirectoryComponent } from './components/broker-directory/broker-directory';
import { BrokerProfileViewComponent } from './components/broker-profile-view/broker-profile-view';
import { SupportRequestComponent } from './components/panel/support-request/support-request';
import { ImprovementsComponent } from './components/panel/improvements/improvements';
import { AuthorizedListComponent } from './components/panel/authorized-list/authorized-list';
import { brokerGuard } from './guards/broker.guard';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'nosotros', component: AboutComponent },
  { path: 'test', component: TestComponent },
  { path: 'marketplace', component: MarketplaceComponent },
  { path: 'unete', component: BrokerJoinComponent },
  { path: 'corredores', component: BrokerDirectoryComponent },
  { path: 'corredores/:email', component: BrokerProfileViewComponent },
  { path: 'servicios/:id', component: ServiceDetailComponent },
  { path: 'login', component: LoginComponent },
  { 
    path: 'panel', 
    component: PanelLayoutComponent,
    canActivate: [brokerGuard],
    children: [
      { path: '', redirectTo: 'propiedades', pathMatch: 'full' },
      { path: 'perfil', component: ProfileComponent },
      { path: 'autorizados', component: AuthorizedListComponent },
      { path: 'propiedades', component: PropertyListComponent },
      { path: 'propiedades/:id/documentos', component: PropertyDocumentsComponent },
      { path: 'publicar', component: PropertyFormComponent },
      { path: 'editar/:id', component: PropertyFormComponent },
      { path: 'soporte', component: SupportRequestComponent },
      { path: 'mejoras', component: ImprovementsComponent }
    ]
  },
  { path: '**', redirectTo: '' }
];
