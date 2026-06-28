import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, NgZone, HostListener, effect, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BackgroundService } from '../../services/background.service';

@Component({
  selector: 'app-americas-map',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="globe-wrapper" [class.visible]="visible">
      <div class="ltn-globe" #globeContainer>
        <div class="ltn-tip" #tip></div>
        <span class="ltn-cap">Red de Confianza · LATAM</span>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: contents;
    }

    .globe-wrapper {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      z-index: 0;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.5s ease;
    }

    .globe-wrapper.visible {
      opacity: 1;
      pointer-events: all;
    }

    .ltn-globe {
      position: relative;
      width: 100%;
      height: 100%;
      background: radial-gradient(120% 90% at 70% 30%, rgba(45,212,191,.06), transparent 60%), #0d1117;
      overflow: hidden;
    }

    .ltn-globe canvas {
      display: block;
      width: 100% !important;
      height: 100% !important;
    }

    .ltn-tip {
      position: absolute;
      top: 0;
      left: 0;
      transform: translate(-50%,-140%);
      padding: 5px 10px;
      border-radius: 6px;
      pointer-events: none;
      font-size: 12px;
      letter-spacing: .04em;
      white-space: nowrap;
      color: #dffdf6;
      background: rgba(13,17,23,.78);
      border: 1px solid rgba(45,212,191,.45);
      box-shadow: 0 4px 18px rgba(0,0,0,.4);
      opacity: 0;
      transition: opacity .18s ease;
      will-change: transform, opacity;
      z-index: 3;
      font-family: 'Inter', sans-serif;
    }

    .ltn-tip::after {
      content: "";
      position: absolute;
      left: 50%;
      bottom: -5px;
      width: 8px;
      height: 8px;
      transform: translateX(-50%) rotate(45deg);
      background: rgba(13,17,23,.78);
      border-right: 1px solid rgba(45,212,191,.45);
      border-bottom: 1px solid rgba(45,212,191,.45);
    }

    .ltn-tip.show {
      opacity: 1;
    }

    .ltn-cap {
      position: absolute;
      left: 18px;
      bottom: 16px;
      z-index: 2;
      pointer-events: none;
      font-size: 11px;
      letter-spacing: .28em;
      text-transform: uppercase;
      color: rgba(160,190,200,.55);
      font-family: ui-monospace, "JetBrains Mono", monospace;
    }
  `]
})
export class AmericasMapComponent implements AfterViewInit, OnDestroy {
  @ViewChild('globeContainer', { static: true }) containerRef!: ElementRef<HTMLDivElement>;
  @ViewChild('tip', { static: true }) tipRef!: ElementRef<HTMLDivElement>;

  visible = false;
  private renderer: any = null;
  private animFrameId: number | null = null;
  private activeHub: any = null;
  private arcs: any[] = [];
  private nodes: any[] = [];
  private globeGroup: any = null;
  private pickSphere: any = null;
  private scene: any = null;
  private camera: any = null;
  private ray: any = null;
  private ndc = { x: 0, y: 0 };
  private pointerInside = false;
  private hasPointer = false;
  private rotSpeed = 0.045;
  private targetRot = 0.045;
  private idleTimer = 0;
  private clock: any = null;
  private isDestroyed = false;

  private CFG = {
    radius: 1,
    dotCount: 2600,
    colors: {
      dot:      0x24506b,
      grid:     0x16384a,
      node:     0xdff3f0,
      nodeHot:  0x2dd4bf,
      arc:      0x2dd4bf,
      flow:     0x9af7e8
    },
    arcHeight: 0.45,
    maxArcs: 5,
    autoRotateSpeed: 0.045,
    centerLng: -70
  };

  private CITIES = [
    { name:'Santiago',        lat:-33.45, lng:-70.66, primary:true },
    { name:'Buenos Aires',    lat:-34.60, lng:-58.38, primary:true },
    { name:'Lima',            lat:-12.04, lng:-77.04, primary:true },
    { name:'Bogotá',          lat:  4.71, lng:-74.07, primary:true },
    { name:'São Paulo',       lat:-23.55, lng:-46.63, primary:true },
    { name:'Río de Janeiro',  lat:-22.91, lng:-43.17, primary:true },
    { name:'Ciudad de México',lat: 19.43, lng:-99.13, primary:true },
    { name:'Quito',           lat: -0.18, lng:-78.47, primary:true },
    { name:'Montevideo',      lat:-34.90, lng:-56.16, primary:true },
    { name:'Asunción',        lat:-25.26, lng:-57.58, primary:true },
    { name:'La Paz',          lat:-16.50, lng:-68.15, primary:true },
    { name:'Caracas',         lat: 10.48, lng:-66.90, primary:true },
    { name:'Panamá',          lat:  8.98, lng:-79.52, primary:true },
    { name:'San José',        lat:  9.93, lng:-84.08, primary:true },
    { name:'Guatemala',       lat: 14.63, lng:-90.51, primary:true },
    { name:'Miami',           lat: 25.76, lng:-80.19, primary:false },
    { name:'Nueva York',      lat: 40.71, lng:-74.00, primary:false },
    { name:'Los Ángeles',     lat: 34.05, lng:-118.24,primary:false },
    { name:'Toronto',         lat: 43.65, lng:-79.38, primary:false }
  ];

  constructor(private ngZone: NgZone, public bgService: BackgroundService, private cdr: ChangeDetectorRef) {
    effect(() => {
      this.visible = this.bgService.mode() === 'map';
      this.cdr.markForCheck();
      if (this.visible && !this.renderer) {
        this.loadThreeAndInit();
      }
    });
  }

  ngAfterViewInit() {
    if (this.bgService.mode() === 'map') {
      this.visible = true;
      this.loadThreeAndInit();
    }
  }

  ngOnDestroy() {
    this.isDestroyed = true;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
  }

  private loadThreeAndInit() {
    if ((window as any)['THREE']) {
      this.initThree((window as any)['THREE']);
    } else {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/three@0.160.0/build/three.min.js';
      script.onload = () => {
        if (!this.isDestroyed) {
          this.initThree((window as any)['THREE']);
        }
      };
      document.head.appendChild(script);
    }
  }

  private initThree(THREE: any) {
    this.ngZone.runOutsideAngular(() => {
      const container = this.containerRef.nativeElement;
      const tip = this.tipRef.nativeElement;
      this.clock = new THREE.Clock();

      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      this.renderer.setClearColor(0x000000, 0);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      
      const rect = container.getBoundingClientRect();
      this.renderer.setSize(rect.width || window.innerWidth, rect.height || window.innerHeight, false);
      container.appendChild(this.renderer.domElement);

      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(38, (rect.width || window.innerWidth) / (rect.height || window.innerHeight), 0.1, 100);
      this.camera.position.set(0, 0.35, 2.75);
      this.camera.lookAt(0, -0.18, 0);

      this.scene.add(new THREE.AmbientLight(0xffffff, 1));

      this.globeGroup = new THREE.Group();
      this.globeGroup.rotation.y = THREE.MathUtils.degToRad(-90 - this.CFG.centerLng);
      this.scene.add(this.globeGroup);

      // Glow texture helper
      const glowTex = (() => {
        const s = 64, c = document.createElement('canvas');
        c.width = c.height = s;
        const ctx = c.getContext('2d')!;
        const g = ctx.createRadialGradient(s/2, s/2, 0, s/2, s/2, s/2);
        g.addColorStop(0,   'rgba(255,255,255,1)');
        g.addColorStop(0.25,'rgba(255,255,255,.85)');
        g.addColorStop(0.6, 'rgba(255,255,255,.18)');
        g.addColorStop(1,   'rgba(255,255,255,0)');
        ctx.fillStyle = g; ctx.fillRect(0,0,s,s);
        const t = new THREE.CanvasTexture(c);
        t.colorSpace = THREE.SRGBColorSpace;
        return t;
      })();

      // LatLng projection helper
      const latLngToVec3 = (lat: number, lng: number, r: number) => {
        const phi   = (90 - lat) * Math.PI / 180;
        const theta = (lng + 180) * Math.PI / 180;
        return new THREE.Vector3(
          -r * Math.sin(phi) * Math.cos(theta),
           r * Math.cos(phi),
           r * Math.sin(phi) * Math.sin(theta)
        );
      };

      // Matriz de puntos (dot-matrix)
      const N = this.CFG.dotCount, pos = new Float32Array(N*3);
      const phiGold = Math.PI * (3 - Math.sqrt(5));
      for (let i=0; i<N; i++){
        const y = 1 - (i / (N-1)) * 2;
        const r = Math.sqrt(1 - y*y);
        const th = phiGold * i;
        pos[i*3]   = Math.cos(th) * r * this.CFG.radius;
        pos[i*3+1] = y * this.CFG.radius;
        pos[i*3+2] = Math.sin(th) * r * this.CFG.radius;
      }
      const dGeo = new THREE.BufferGeometry();
      dGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const dMat = new THREE.PointsMaterial({
        color: this.CFG.colors.dot, size: 0.013, sizeAttenuation: true,
        transparent: true, opacity: 0.85, depthWrite: false
      });
      this.globeGroup.add(new THREE.Points(dGeo, dMat));

      // Canvas Map generation to highlight Latin America
      const mapCanvas = document.createElement('canvas');
      mapCanvas.width = 2048;
      mapCanvas.height = 1024;
      const mCtx = mapCanvas.getContext('2d')!;
      mCtx.clearRect(0, 0, 2048, 1024);

      // Lat/Lng to equirectangular coordinates
      const toCanvasCoords = (lng: number, lat: number) => {
        const x = (lng + 180) * (2048 / 360);
        const y = (90 - lat) * (1024 / 180);
        return { x, y };
      };

      const drawPolygon = (pts: any[], fillColor: string, strokeColor: string, strokeWidth: number, glow = false) => {
        mCtx.beginPath();
        pts.forEach((p, idx) => {
          const pt = toCanvasCoords(p.lng, p.lat);
          if (idx === 0) mCtx.moveTo(pt.x, pt.y);
          else mCtx.lineTo(pt.x, pt.y);
        });
        mCtx.closePath();
        
        if (fillColor) {
          mCtx.fillStyle = fillColor;
          mCtx.fill();
        }
        
        // Draw outline with shadow glow
        if (strokeColor) {
          if (glow) {
            mCtx.shadowColor = 'rgba(45, 212, 191, 0.8)';
            mCtx.shadowBlur = 15;
          }
          mCtx.strokeStyle = strokeColor;
          mCtx.lineWidth = strokeWidth;
          mCtx.stroke();
          mCtx.shadowBlur = 0; // reset
        }
      };

      // Define South America, Central America / Mexico, and North America
      const southAmerica = [
        {lng: -80, lat: 12.5}, {lng: -72, lat: 11.5}, {lng: -60, lat: 6.5}, {lng: -50, lat: 0},
        {lng: -35, lat: -6}, {lng: -38, lat: -13}, {lng: -43, lat: -23}, {lng: -48, lat: -28},
        {lng: -58, lat: -34.5}, {lng: -62, lat: -39}, {lng: -65, lat: -43}, {lng: -66, lat: -54.5},
        {lng: -74, lat: -54.5}, {lng: -75, lat: -45}, {lng: -72, lat: -33}, {lng: -70, lat: -20},
        {lng: -81, lat: -4.5}, {lng: -80, lat: 1}, {lng: -77, lat: 7.5}
      ];

      const centralAmerica = [
        {lng: -77, lat: 7.5}, {lng: -80, lat: 9}, {lng: -83, lat: 10}, {lng: -86, lat: 12},
        {lng: -88, lat: 14}, {lng: -90, lat: 14.5}, {lng: -94, lat: 16}, {lng: -105, lat: 19},
        {lng: -110, lat: 23}, {lng: -115, lat: 32}, {lng: -110, lat: 30}, {lng: -105, lat: 26},
        {lng: -97, lat: 26}, {lng: -96, lat: 19}, {lng: -90, lat: 21}, {lng: -87, lat: 21},
        {lng: -88, lat: 18}, {lng: -83, lat: 15}, {lng: -77, lat: 8}
      ];

      const northAmerica = [
        {lng: -125, lat: 48.5}, {lng: -125, lat: 60}, {lng: -165, lat: 65}, {lng: -150, lat: 70},
        {lng: -120, lat: 70}, {lng: -100, lat: 70}, {lng: -80, lat: 60}, {lng: -60, lat: 50},
        {lng: -52, lat: 47}, {lng: -70, lat: 43}, {lng: -74, lat: 40}, {lng: -80, lat: 25},
        {lng: -85, lat: 30}, {lng: -97, lat: 26}, {lng: -115, lat: 32}, {lng: -120, lat: 34},
        {lng: -124, lat: 40}
      ];

      // Draw North America with very faint gray style
      drawPolygon(northAmerica, 'rgba(255, 255, 255, 0.005)', 'rgba(255, 255, 255, 0.04)', 1, false);

      // Draw Latin America (South and Central America) with gorgeous highlighted neon-teal glow
      drawPolygon(southAmerica, 'rgba(45, 212, 191, 0.08)', 'rgba(45, 212, 191, 0.75)', 2.5, true);
      drawPolygon(centralAmerica, 'rgba(45, 212, 191, 0.08)', 'rgba(45, 212, 191, 0.75)', 2.5, true);

      // Create earth mesh using CanvasTexture
      const mapTexture = new THREE.CanvasTexture(mapCanvas);
      const earthMat = new THREE.MeshBasicMaterial({
        map: mapTexture,
        transparent: true,
        opacity: 0.95,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      });
      const earthMesh = new THREE.Mesh(new THREE.SphereGeometry(this.CFG.radius * 0.995, 64, 64), earthMat);
      this.globeGroup.add(earthMesh);

      // Retícula wireframe
      const gMat = new THREE.LineBasicMaterial({
        color: this.CFG.colors.grid, transparent: true, opacity: 0.5, depthWrite: false
      });
      const grid = new THREE.Group();
      for (let lng=-150; lng<=180; lng+=30){
        const pts=[]; for (let lat=-90; lat<=90; lat+=4) pts.push(latLngToVec3(lat,lng,this.CFG.radius*1.001));
        grid.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), gMat));
      }
      for (let lat=-60; lat<=60; lat+=30){
        const pts=[]; for (let lng=-180; lng<=180; lng+=4) pts.push(latLngToVec3(lat,lng,this.CFG.radius*1.001));
        grid.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), gMat));
      }
      this.globeGroup.add(grid);

      // Nodos-ciudad
      this.nodes = this.CITIES.map(city => {
        const p = latLngToVec3(city.lat, city.lng, this.CFG.radius*1.012);
        const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
          map: glowTex, color: city.primary ? this.CFG.colors.nodeHot : this.CFG.colors.node,
          transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
          opacity: city.primary ? 0.95 : 0.7
        }));
        const base = city.primary ? 0.055 : 0.04;
        sprite.scale.setScalar(base);
        sprite.position.copy(p);
        this.globeGroup.add(sprite);
        return { ...city, pos: p, sprite, base, world: new THREE.Vector3() };
      });

      // Esfera invisible para raycasting
      const pickMat = new THREE.MeshBasicMaterial();
      pickMat.colorWrite = false; pickMat.depthWrite = false;
      this.pickSphere = new THREE.Mesh(new THREE.SphereGeometry(this.CFG.radius, 32, 32), pickMat);
      this.globeGroup.add(this.pickSphere);

      this.ray = new THREE.Raycaster();

      // Event listeners para mover e interacciones
      container.addEventListener('pointermove', (e: PointerEvent) => {
        const r = container.getBoundingClientRect();
        this.ndc.x = ((e.clientX - r.left) / r.width) * 2 - 1;
        this.ndc.y = -((e.clientY - r.top) / r.height) * 2 + 1;
        this.hasPointer = true;
      });

      container.addEventListener('pointerenter', () => {
        this.pointerInside = true;
        this.targetRot = this.CFG.autoRotateSpeed * 0.12;
      });

      container.addEventListener('pointerleave', () => {
        this.pointerInside = false;
        this.hasPointer = false;
        this.targetRot = this.CFG.autoRotateSpeed;
        this.activeHub = null;
        tip.classList.remove('show');
      });

      this.animate();
    });
  }

  private buildArcs(hub: any, THREE: any) {
    this.clearArcs();
    this.activeHub = hub;

    const neighbors = this.nodes
      .filter(n => n !== hub)
      .map(n => ({ n, d: hub.world.distanceTo(n.world) - (n.primary ? 0.05 : 0) }))
      .sort((a,b)=> a.d - b.d)
      .slice(0, this.CFG.maxArcs)
      .map(o => o.n);

    neighbors.forEach((dest, idx) => {
      const a = hub.pos.clone(), b = dest.pos.clone();
      const mid = a.clone().add(b).multiplyScalar(0.5)
                   .normalize().multiplyScalar(this.CFG.radius * (1 + this.CFG.arcHeight + a.distanceTo(b)*0.18));
      const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
      const pts = curve.getPoints(54);

      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      const cols = new Float32Array(pts.length*3);
      const c0 = new THREE.Color(this.CFG.colors.flow), c1 = new THREE.Color(this.CFG.colors.arc);
      for (let i=0;i<pts.length;i++){
        const c = c0.clone().lerp(c1, i/(pts.length-1));
        cols[i*3]=c.r; cols[i*3+1]=c.g; cols[i*3+2]=c.b;
      }
      geo.setAttribute('color', new THREE.BufferAttribute(cols,3));
      const mat = new THREE.LineBasicMaterial({
        vertexColors:true, transparent:true, opacity:0,
        blending:THREE.AdditiveBlending, depthWrite:false
      });
      const line = new THREE.Line(geo, mat);
      this.globeGroup.add(line);

      const flows: any[] = [];
      const flowN = dest.primary ? 2 : 1;
      for (let k=0;k<flowN;k++){
        const glowTex = this.nodes[0].sprite.material.map;
        const fmat = new THREE.SpriteMaterial({
          map: glowTex, color:this.CFG.colors.flow, transparent:true,
          blending:THREE.AdditiveBlending, depthWrite:false, opacity:0
        });
        const s = new THREE.Sprite(fmat); s.scale.setScalar(0.05);
        this.globeGroup.add(s);
        flows.push({ sprite:s, mat:fmat, curve, t:k*0.5, speed:0.55+Math.random()*0.25 });
      }
      this.arcs.push({ line, mat, flows, curve, life:0, delay:idx*0.05 });
    });
  }

  private clearArcs() {
    this.arcs.forEach(a=>{
      a.line.geometry.dispose();
      a.mat.dispose();
      this.globeGroup.remove(a.line);
      a.flows.forEach((f: any)=>{
        f.mat.dispose();
        this.globeGroup.remove(f.sprite);
      });
    });
    this.arcs = [];
  }

  private pickHub(THREE: any) {
    if (!this.hasPointer) return;
    this.ray.setFromCamera(this.ndc, this.camera);
    const hit = this.ray.intersectObject(this.pickSphere, false)[0];
    if (!hit){
      this.activeHub = null;
      this.tipRef.nativeElement.classList.remove('show');
      return;
    }

    let best: any = null, bestD = Infinity;
    for (const n of this.nodes){
      const d = hit.point.distanceTo(n.world);
      if (d < bestD){ bestD = d; best = n; }
    }

    if (best && bestD < this.CFG.radius*0.42){
      if (best !== this.activeHub) {
        this.buildArcs(best, THREE);
      }
      // tooltip placement
      const v = best.world.clone().project(this.camera);
      if (v.z < 1){
        const rect = this.containerRef.nativeElement.getBoundingClientRect();
        const tip = this.tipRef.nativeElement;
        tip.style.left = ( (v.x*0.5+0.5)*rect.width ) + 'px';
        tip.style.top  = ( (-v.y*0.5+0.5)*rect.height ) + 'px';
        tip.textContent = best.name;
        tip.classList.add('show');
      }
      this.nodes.forEach(n=> n.sprite.scale.setScalar(n.base * (n===best?1.8:1)));
    } else {
      this.activeHub = null;
      this.tipRef.nativeElement.classList.remove('show');
      this.nodes.forEach(n=> n.sprite.scale.setScalar(n.base));
    }
  }

  @HostListener('window:resize')
  resize() {
    if (!this.renderer || !this.containerRef) return;
    const container = this.containerRef.nativeElement;
    const r = container.getBoundingClientRect();
    if (!r.width || !r.height) return;
    this.renderer.setSize(r.width, r.height, false);
    this.camera.aspect = r.width / r.height;
    this.camera.updateProjectionMatrix();
  }

  private animate = () => {
    if (this.isDestroyed) return;
    this.animFrameId = requestAnimationFrame(this.animate);
    if (!this.visible || !this.renderer) return;

    const THREE = (window as any)['THREE'];
    const dt = Math.min(this.clock.getDelta(), 0.05);

    this.rotSpeed += (this.targetRot - this.rotSpeed) * Math.min(1, dt*3);
    this.globeGroup.rotation.y += this.rotSpeed * dt;

    if (this.hasPointer){
      this.globeGroup.rotation.x += ((this.ndc.y*0.18) - this.globeGroup.rotation.x) * Math.min(1, dt*2);
    }

    this.globeGroup.updateMatrixWorld();
    for (const n of this.nodes) n.sprite.getWorldPosition(n.world);

    this.pickHub(THREE);

    // Idle Pulse
    if (!this.pointerInside) {
      this.idleTimer -= dt;
      if (this.idleTimer <= 0) {
        this.idleTimer = 3.2;
        const activeNodes = this.nodes.filter(n => n.primary);
        const hub = activeNodes[Math.floor(Math.random() * activeNodes.length)];
        if (hub) {
          this.buildArcs(hub, THREE);
          this.activeHub = hub;
          setTimeout(() => {
            if (!this.pointerInside) this.activeHub = null;
          }, 2200);
        }
      }
    }

    // Update kinetic arcs & flows
    for (const a of this.arcs){
      a.life += dt;
      const target = this.activeHub ? 0.9 : 0;
      a.mat.opacity += (target - a.mat.opacity) * Math.min(1, dt*6);
      for (const f of a.flows){
        f.t = (f.t + dt * f.speed) % 1;
        f.curve.getPointAt(f.t, f.sprite.position);
        f.mat.opacity = a.mat.opacity * Math.sin(f.t * Math.PI);
      }
    }

    if (!this.activeHub && this.arcs.length && this.arcs[0].mat.opacity < 0.02) {
      this.clearArcs();
    }

    this.renderer.render(this.scene, this.camera);
  }
}
