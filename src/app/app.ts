import { Component, signal } from '@angular/core';
import { FooterComponent } from './components/footer/footer';
import { RouterOutlet } from '@angular/router';
import { ParticlesComponent } from './components/particles/particles';
import { AmericasMapComponent } from './components/americas-map/americas-map';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet, 
    FooterComponent, 
    ParticlesComponent,
    AmericasMapComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('latam-trust');
}
