import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header';
import { HeroComponent } from '../hero/hero';
import { ContactModalComponent } from '../contact-modal/contact-modal';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    HeroComponent,
    ContactModalComponent
  ],
  template: `
    <div class="landing-wrapper">
      <app-header (contactClick)="openModal()"></app-header>
      
      <main>
        <app-hero (ctaClick)="openModal()"></app-hero>
      </main>

      <!-- FAQ MAESTRO SECTION -->
      <section class="faq" id="preguntas-frecuentes" aria-labelledby="faq-h2">
        <!-- Express Forms Section -->
        <div class="faq__forms-box">
          <div class="forms-box__header">
            <span class="forms-box__badge">// FORMULARIOS EXPRESOS</span>
            <h3>Completar Formulario</h3>
            <p>Selecciona tu perfil para cargar el formulario correspondiente y agilizar tu gestión legal y comercial.</p>
          </div>
          <div class="forms-box__buttons">
            <button class="form-select-btn" [class.active]="selectedForm === 'comprador'" (click)="selectForm('comprador')">
              <span class="btn-icon">🛒</span> Soy Comprador
            </button>
            <button class="form-select-btn" [class.active]="selectedForm === 'vendedor'" (click)="selectForm('vendedor')">
              <span class="btn-icon">🔑</span> Soy Vendedor
            </button>
            <button class="form-select-btn" [class.active]="selectedForm === 'corredor'" (click)="selectForm('corredor')">
              <span class="btn-icon">💼</span> Soy Corredor
            </button>
          </div>

          <!-- Inline Forms Container -->
          <div class="forms-box__container" *ngIf="selectedForm">
            <!-- Formulario Comprador -->
            <form *ngIf="selectedForm === 'comprador' && !formSubmitted" (submit)="submitForm($event)">
              <div class="form-grid">
                <div class="form-group">
                  <label>Nombre Completo</label>
                  <input type="text" placeholder="Ej. Juan Pérez" required name="nombre">
                </div>
                <div class="form-group">
                  <label>WhatsApp / Teléfono</label>
                  <input type="tel" placeholder="Ej. +56912345678" required name="telefono">
                </div>
                <div class="form-group">
                  <label>Presupuesto Estimado</label>
                  <select required name="presupuesto">
                    <option value="">Selecciona rango...</option>
                    <option value="bajo-2000">Menos de 2.000 UF</option>
                    <option value="2000-4000">2.000 - 4.000 UF</option>
                    <option value="4000-8000">4.000 - 8.000 UF</option>
                    <option value="mas-8000">Más de 8.000 UF</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Propiedad de interés</label>
                  <select required name="tipo">
                    <option value="">Selecciona tipo...</option>
                    <option value="casa">Casa</option>
                    <option value="depto">Departamento</option>
                    <option value="terreno">Terreno / Parcela</option>
                    <option value="comercial">Oficina / Local Comercial</option>
                  </select>
                </div>
              </div>
              <button type="submit" class="submit-form-btn">Enviar Formulario de Comprador →</button>
            </form>

            <!-- Formulario Vendedor -->
            <form *ngIf="selectedForm === 'vendedor' && !formSubmitted" (submit)="submitForm($event)">
              <div class="form-grid">
                <div class="form-group">
                  <label>Nombre Completo</label>
                  <input type="text" placeholder="Ej. Ana María" required name="nombre">
                </div>
                <div class="form-group">
                  <label>WhatsApp / Teléfono</label>
                  <input type="tel" placeholder="Ej. +56912345678" required name="telefono">
                </div>
                <div class="form-group">
                  <label>Ubicación de la Propiedad</label>
                  <input type="text" placeholder="Comuna o Ciudad" required name="ubicacion">
                </div>
                <div class="form-group">
                  <label>Valor Estimado</label>
                  <select required name="valor">
                    <option value="">Selecciona rango...</option>
                    <option value="bajo-2000">Menos de 2.000 UF</option>
                    <option value="2000-4000">2.000 - 4.000 UF</option>
                    <option value="4000-8000">4.000 - 8.000 UF</option>
                    <option value="mas-8000">Más de 8.000 UF</option>
                  </select>
                </div>
              </div>
              <button type="submit" class="submit-form-btn">Enviar Formulario de Vendedor →</button>
            </form>

            <!-- Formulario Corredor -->
            <form *ngIf="selectedForm === 'corredor' && !formSubmitted" (submit)="submitForm($event)">
              <div class="form-grid">
                <div class="form-group">
                  <label>Nombre Completo</label>
                  <input type="text" placeholder="Ej. Carlos Soto" required name="nombre">
                </div>
                <div class="form-group">
                  <label>WhatsApp / Teléfono</label>
                  <input type="tel" placeholder="Ej. +56912345678" required name="telefono">
                </div>
                <div class="form-group">
                  <label>Años de Experiencia</label>
                  <select required name="experiencia">
                    <option value="">Selecciona...</option>
                    <option value="sin-exp">Iniciando en el rubro</option>
                    <option value="1-3">1 a 3 años</option>
                    <option value="3-5">3 a 5 años</option>
                    <option value="mas-5">Más de 5 años</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Zona Principal</label>
                  <input type="text" placeholder="Ej. Santiago Oriente, etc." required name="cobertura">
                </div>
              </div>
              <button type="submit" class="submit-form-btn">Registrarme en la Red de Corredores →</button>
            </form>

            <!-- Success State -->
            <div class="form-success" *ngIf="formSubmitted">
              <span class="success-icon">✓</span>
              <h4>¡Formulario enviado correctamente!</h4>
              <p>Hemos recibido tus datos. Un especialista de LTN Chile se pondrá en contacto contigo a la brevedad vía WhatsApp.</p>
              <button class="clear-form-btn" (click)="resetForm($event)">Volver a empezar</button>
            </div>
          </div>
        </div>

        <p class="faq__eyebrow">Centro de confianza · Chile</p>
        <h2 class="faq__title" id="faq-h2">Preguntas frecuentes</h2>
        <p class="faq__intro">Todo lo que necesitas saber para comprar, vender o
          dedicarte al rubro inmobiliario en Chile — respuestas claras, verificadas y
          sin letra chica.</p>

        <!-- ===================== A · COMPRADORES (ALTO ROI) ===================== -->
        <p class="faq__group-label">Si vas a comprar una propiedad</p>

        <!-- KW: "estudio de títulos" | Intención: informacional→transaccional | Ads: Compradores > Estudio de Títulos | ROI ★★★★★ -->
        <details id="faq-estudio-titulos" open>
          <summary>¿Qué es un estudio de títulos y por qué lo necesito antes de comprar?</summary>
          <div class="faq__answer">
            <span class="lead">El <strong>estudio de títulos</strong> es el análisis legal de la historia de una propiedad —normalmente los últimos 10 años— que confirma que el vendedor es el dueño real y que no existen hipotecas, gravámenes, embargos ni litigios ocultos.</span>
            Se realiza después de la promesa de compraventa y antes de la escritura. Si
            compras con crédito hipotecario, el banco lo exige de todas formas.
          </div>
        </details>

        <!-- KW: "estudio de títulos precio" / "cuánto cuesta estudio de títulos" | Intención: transaccional | Ads: Compradores > Estudio de Títulos | ROI ★★★★★ -->
        <details id="faq-precio-estudio">
          <summary>¿Cuánto cuesta un estudio de títulos en Chile?</summary>
          <div class="faq__answer">
            <span class="lead">Como referencia de mercado, un estudio de títulos en Chile cuesta entre <strong>4 y 6 UF</strong>,</span>
            y puede subir según la complejidad (herencias, sociedad conyugal, terrenos
            rurales, cadena de dominio extensa). En LATAM Trust viene integrado con la
            revisión técnica y comercial en una sola operación.
            <span class="note">Valores referenciales; cotiza tu caso para un monto exacto.</span>
          </div>
        </details>

        <!-- KW: "comprar propiedad de forma segura" / "compra segura" | Intención: comercial | Ads: Compradores > Compra Segura | ROI ★★★★★ -->
        <details id="faq-compra-segura">
          <summary>¿Cómo comprar una propiedad de forma segura y sin riesgos?</summary>
          <div class="faq__answer">
            <span class="lead">Para comprar seguro: firma una promesa de compraventa antes de pagar, exige un estudio de títulos completo, paga con vale vista e instrucciones notariales, y nunca cierres bajo presión.</span>
            Con instrucciones notariales, el dinero se libera solo cuando la propiedad
            queda inscrita a tu nombre en el Conservador de Bienes Raíces.
          </div>
        </details>

        <!-- KW: "evitar estafas inmobiliarias" / "fraude inmobiliario" | Intención: informacional (alto volumen) | Ads: Compradores > Compra Segura | ROI ★★★★☆ -->
        <details id="faq-estafas">
          <summary>¿Cómo evito una estafa inmobiliaria al comprar?</summary>
          <div class="faq__answer">
            <span class="lead">Para evitar una estafa inmobiliaria, verifica al dueño en el Conservador de Bienes Raíces, revisa el certificado de hipotecas y gravámenes, y confirma el estado civil del vendedor antes de pagar.</span>
            Señales de alerta: precios muy bajo el mercado, vendedores que no dan la
            cara, presión para pagar reservas altas y entrega de copias en vez de
            originales. En sociedad conyugal, el cónyuge debe firmar o la venta es nula.
          </div>
        </details>

        <!-- KW: "abogado inmobiliario" / "crédito hipotecario abogado" | Intención: comercial | Ads: Compradores > Abogado Inmobiliario | ROI ★★★★★ -->
        <details id="faq-abogado">
          <summary>Si compro con crédito hipotecario, ¿igual necesito asesoría propia?</summary>
          <div class="faq__answer">
            <span class="lead">Sí: el estudio de títulos del banco protege su crédito, no necesariamente todos tus intereses como comprador.</span>
            Una asesoría inmobiliaria propia revisa cláusulas abusivas en la promesa,
            servidumbres, regularización y condiciones que el banco podría no observar.
          </div>
        </details>

        <!-- KW: "promesa de compraventa" | Intención: informacional→transaccional | Ads: Compradores > Compra Segura | ROI ★★★★☆ -->
        <details id="faq-promesa">
          <summary>¿Cuándo se firma la promesa de compraventa y cuándo la escritura?</summary>
          <div class="faq__answer">
            <span class="lead">La promesa de compraventa se firma primero —fija precio, forma de pago y plazos— y la escritura pública se firma después, ante notario, una vez aprobado el estudio de títulos.</span>
            La propiedad recién pasa a tu nombre cuando la escritura se inscribe en el
            Conservador de Bienes Raíces. Nunca saltes de un acuerdo verbal a la escritura.
          </div>
        </details>

        <!-- KW: "gastos de comprar una propiedad" / "costo inscripción conservador" | Intención: informacional | Ads: Compradores > Gastos Compra | ROI ★★★★☆ -->
        <details id="faq-gastos-compra">
          <summary>¿Qué gastos tiene el comprador al comprar una propiedad?</summary>
          <div class="faq__answer">
            <span class="lead">Los gastos del comprador son, principalmente, el estudio de títulos (4–6 UF de referencia), los gastos notariales y la inscripción en el Conservador de Bienes Raíces, que suele costar entre <strong>0,2% y 0,3%</strong> del valor de la propiedad.</span>
            Si compras con crédito hipotecario, suma la tasación y los gastos del mutuo.
          </div>
        </details>

        <!-- KW: "comprar parcela seguro" / "parcelas en blanco" | Intención: informacional (alto interés) | Ads: Compradores > Parcelas | ROI ★★★★☆ -->
        <details id="faq-parcelas">
          <summary>¿Qué debo revisar antes de comprar una parcela?</summary>
          <div class="faq__answer">
            <span class="lead">Antes de comprar una parcela, verifica que tenga subdivisión aprobada y rol propio ante el SII; cuidado con las "parcelas en blanco".</span>
            Las parcelas en blanco se venden como derechos sobre un terreno sin rol
            individual, con riesgo de no poder inscribir el dominio ni construir.
            Revisa además acceso, factibilidad de agua y luz, y uso de suelo.
          </div>
        </details>

        <div class="faq__cta">
          <a class="is-primary" (click)="openModal()" href="javascript:void(0)">Solicita tu estudio de títulos</a>
        </div>

        <!-- ===================== B · VENDEDORES (ALTO ROI) ===================== -->
        <p class="faq__group-label">Si vas a vender tu propiedad</p>

        <!-- KW: "documentos para vender una propiedad" / "documentos para vender una casa en Chile" | Intención: informacional→transaccional | Ads: Vendedores > Documentos | ROI ★★★★☆ -->
        <details id="faq-docs-vender">
          <summary>¿Qué documentos necesito para vender mi propiedad en Chile?</summary>
          <div class="faq__answer">
            <span class="lead">Para vender una propiedad en Chile necesitas, como mínimo: certificado de dominio vigente, certificado de hipotecas, gravámenes y prohibiciones, contribuciones al día, certificado de avalúo fiscal y las escrituras anteriores.</span>
            Si es departamento o condominio, suma gastos comunes al día y reglamento de
            copropiedad; si hiciste ampliaciones, la recepción final de la DOM. La
            mayoría de los certificados del Conservador tienen vigencia cercana a 30 días.
          </div>
        </details>

        <!-- KW: "impuesto por vender una propiedad" / "impuesto al mayor valor" / "ganancia de capital propiedad" | Intención: informacional (alto volumen) | Ads: Vendedores > Impuestos | ROI ★★★★☆ -->
        <details id="faq-impuesto-venta">
          <summary>¿Qué impuestos pago al vender una propiedad?</summary>
          <div class="faq__answer">
            <span class="lead">La mayoría de quienes venden su vivienda en Chile no paga impuesto a la ganancia de capital, gracias a una exención de <strong>8.000 UF</strong> sobre la utilidad acumulada en la vida.</span>
            El impuesto al mayor valor se calcula solo sobre la ganancia (precio de venta
            menos costo de compra reajustado por IPC, más mejoras), no sobre el precio
            total. Si superas las 8.000 UF, el excedente tributa con Impuesto Global
            Complementario o con un Impuesto Único Sustitutivo del 10%.
            <span class="note">Información orientativa; no reemplaza la asesoría de un contador o del SII.</span>
          </div>
        </details>

        <!-- KW: "vender propiedad con hipoteca" / "alzamiento de hipoteca" | Intención: informacional | Ads: Vendedores > Hipoteca | ROI ★★★☆☆ -->
        <details id="faq-vender-hipoteca">
          <summary>¿Puedo vender mi propiedad si todavía tiene hipoteca?</summary>
          <div class="faq__answer">
            <span class="lead">Sí, puedes vender una propiedad con hipoteca vigente: se tramita el alzamiento de la hipoteca, normalmente en simultáneo con la firma de la escritura de compraventa.</span>
            El comprador paga, una parte salda el crédito con el banco y este libera el
            gravamen, dejando la propiedad limpia para el nuevo dueño.
          </div>
        </details>

        <!-- KW: "cuánto cobra un corredor por vender" / "comisión corredor venta" | Intención: comercial | Ads: Vendedores > Comisión | ROI ★★★★☆ -->
        <details id="faq-comision-venta">
          <summary>¿Cuánto cobra un corredor por vender mi propiedad?</summary>
          <div class="faq__answer">
            <span class="lead">Por vender una propiedad, el corredor suele cobrar un <strong>2% del valor de venta más IVA</strong> al vendedor; no es una tarifa fijada por ley, sino práctica de mercado.</span>
            A cambio gestiona la tasación, la promoción, las visitas, la documentación y
            el cierre, lo que en la práctica acelera la venta y reduce riesgos.
          </div>
        </details>

        <!-- KW: "cómo saber el precio de mi casa" / "tasación para vender" | Intención: comercial | Ads: Vendedores > Tasación | ROI ★★★★☆ -->
        <details id="faq-precio-venta">
          <summary>¿Cómo sé cuál es el precio justo para vender mi casa?</summary>
          <div class="faq__answer">
            <span class="lead">El precio justo se determina con una tasación comparada: ventas recientes de propiedades similares en tu zona, plusvalía del sector y estado del inmueble.</span>
            Publicar muy por encima del mercado alarga la venta; muy por debajo te hace
            perder dinero. Una tasación profesional fija un precio defendible.
          </div>
        </details>

        <!-- KW: "regularizar ampliación antes de vender" / "Ley del Mono" / "recepción final" | Intención: informacional | Ads: Vendedores > Regularización | ROI ★★★☆☆ -->
        <details id="faq-regularizar">
          <summary>¿Necesito regularizar ampliaciones antes de vender?</summary>
          <div class="faq__answer">
            <span class="lead">Conviene regularizar las ampliaciones antes de vender: una propiedad sin recepción final o con obras no regularizadas (Ley del Mono) pierde valor y dificulta que el comprador obtenga crédito hipotecario.</span>
            Regularizar en la Dirección de Obras Municipales evita observaciones durante
            el estudio de títulos y retrasos en el cierre.
          </div>
        </details>

        <div class="faq__cta">
          <a class="is-primary" (click)="openModal()" href="javascript:void(0)">Prepara tu venta con respaldo legal</a>
        </div>

        <!-- ===================== C · NUEVOS CORREDORES (EDUCACIÓN GRATIS) ===================== -->
        <p class="faq__group-label">Si quieres ser corredor de propiedades</p>

        <!-- KW: "cómo ser corredor de propiedades en Chile" | Intención: informacional (muy alto volumen) | Ads: Academia > Ser Corredor | ROI ★★★☆☆ (top-of-funnel) -->
        <details id="faq-ser-corredor">
          <summary>¿Qué se necesita para ser corredor de propiedades en Chile?</summary>
          <div class="faq__answer">
            <span class="lead">En Chile no se exige título universitario ni licencia estatal para ser corredor de propiedades: el Registro Nacional de Corredores fue derogado en 1986.</span>
            Para operar legalmente debes iniciar actividades en el SII, sacar patente
            comercial municipal y emitir boletas o facturas. Lo que marca la diferencia
            es la formación: parte legal, tasación, captación y cierre.
          </div>
        </details>

        <!-- KW: "certificación corredor de propiedades" / "es obligatorio curso corredor" | Intención: informacional | Ads: Academia > Ser Corredor | ROI ★★★☆☆ -->
        <details id="faq-certificacion">
          <summary>¿Es obligatorio tener una certificación o curso para ejercer?</summary>
          <div class="faq__answer">
            <span class="lead">No es obligatorio por ley, pero sí altamente recomendable: el corretaje en Chile no está regulado como profesión colegiada.</span>
            Cualquiera puede empezar cumpliendo los requisitos tributarios, pero sin
            bases legales y comerciales la mayoría abandona antes de cerrar su primera
            operación.
          </div>
        </details>

        <!-- KW: "cuánto gana un corredor de propiedades" / "comisión corredor de propiedades" | Intención: informacional (alto volumen) | Ads: Academia > Comisiones | ROI ★★★★☆ -->
        <details id="faq-comisiones-corredor">
          <summary>¿Cuánto gana un corredor de propiedades y cómo se cobran las comisiones?</summary>
          <div class="faq__answer">
            <span class="lead">En Chile, lo habitual es que el corredor cobre 2% del valor a cada parte en compraventa (cerca de 4% total) y el 50% de un mes de renta a cada parte en arriendo.</span>
            Los honorarios no están fijados por ley. El ingreso real depende de cuántas
            operaciones cierres y de tu disciplina de prospección, no de un sueldo fijo.
          </div>
        </details>

        <!-- KW: "requisitos legales corredor de propiedades" / "iniciar actividades corredor SII" | Intención: informacional/transaccional | Ads: Academia > Empezar | ROI ★★★☆☆ -->
        <details id="faq-tramites-corredor">
          <summary>¿Qué trámites legales y tributarios debo hacer para empezar?</summary>
          <div class="faq__answer">
            <span class="lead">Para empezar como corredor: inicia actividades en el SII, obtén patente comercial municipal y emite boletas o facturas por tus servicios.</span>
            Además, los corredores deben presentar la declaración jurada anual al SII por
            arriendos que intermedian y reportar operaciones sospechosas a la UAF
            (Ley 19.913).
          </div>
        </details>

        <!-- KW: "curso corredor de propiedades gratis" / "capacitación inmobiliaria gratuita" | Intención: transaccional (lead magnet) | Ads: Academia > Curso Gratis | ROI ★★★★☆ -->
        <details id="faq-formacion-gratis">
          <summary>¿Dónde puedo capacitarme gratis como corredor de propiedades?</summary>
          <div class="faq__answer">
            <span class="lead">En la <strong>Academia LATAM Trust</strong> ofrecemos formación gratuita en línea para corredores en Chile: fundamentos legales del corretaje, estudio de títulos, tasación, captación y cierre.</span>
            Es nuestra forma de profesionalizar el rubro y construir una red de
            corredores que trabajen con transparencia.
            <a routerLink="/unete">Regístrate gratis aquí</a>.
          </div>
        </details>

        <div class="faq__cta">
          <a class="is-primary" routerLink="/unete">Regístrate gratis en la academia</a>
          <a class="is-ghost" (click)="openModal()" href="javascript:void(0)">Habla con un especialista</a>
        </div>
      </section>

      <!-- Global Modal -->
      <app-contact-modal *ngIf="showModal" (closed)="showModal = false"></app-contact-modal>
    </div>
  `,
  styles: [`
    .landing-wrapper { background-color: var(--bg-color); }
    
    .faq{ max-width:880px; margin:0 auto; padding:96px clamp(20px,6vw,40px); position: relative; z-index: 1; }
    .faq__eyebrow{ font-family:"Space Mono",monospace; font-size:.72rem; letter-spacing:.26em; text-transform:uppercase; color:#c89a5b; margin-bottom:16px; }
    .faq__title{ font-family:"Outfit",sans-serif; font-weight:300; font-size:clamp(2rem,5vw,3.2rem); line-height:1.05; color:#ece7dd; margin-bottom:10px; }
    .faq__intro{ color:#cdc8be; line-height:1.6; max-width:62ch; margin-bottom:40px; }
    .faq__group-label{ font-family:"Space Mono",monospace; font-size:.68rem; letter-spacing:.2em; text-transform:uppercase; color:#8295a4; margin:48px 0 8px; border-top:1px solid rgba(236,231,221,.14); padding-top:28px; }
    .faq details{ border-bottom:1px solid rgba(236,231,221,.14); }
    .faq summary{ list-style:none; cursor:pointer; padding:20px 36px 20px 0; position:relative; font-family:"Outfit",sans-serif; font-size:1.12rem; color:#ece7dd; transition:color .2s ease; }
    .faq summary::-webkit-details-marker{ display:none; }
    .faq summary:hover{ color:#c89a5b; }
    .faq summary::after{ content:"+"; position:absolute; right:4px; top:18px; font-family:"Space Mono",monospace; color:#c89a5b; font-size:1.4rem; }
    .faq details[open] summary::after{ content:"–"; }
    .faq__answer{ padding:0 36px 22px 0; color:#cdc8be; line-height:1.65; font-size:.98rem; }
    .faq__answer strong{ color:#ece7dd; font-weight:600; }
    .faq__answer .lead{ color:#ece7dd; }                 /* frase directa GEO */
    .faq__answer a{ color:#c89a5b; }
    .faq__answer .note{ display:block; margin-top:8px; font-size:.84rem; color:#8295a4; font-style:italic; }
    .faq__cta{ margin-top:44px; display:flex; gap:14px; flex-wrap:wrap; }
    .faq__cta a{ display:inline-block; padding:13px 22px; border-radius:3px; font-family:"Inter",sans-serif; font-size:.92rem; font-weight:600; text-decoration:none; cursor: pointer; }
    .faq__cta .is-primary{ background:#c89a5b; color:#15110a; }
    .faq__cta .is-ghost{ border:1px solid rgba(236,231,221,.3); color:#ece7dd; }
    @media (max-width:560px){ .faq summary{ font-size:1rem; } }

    /* Express Forms Styles */
    .faq__forms-box {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(251, 191, 36, 0.15);
      border-radius: 12px;
      padding: 30px;
      margin: 30px 0 48px 0;
      backdrop-filter: blur(10px);
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    }
    .forms-box__header {
      margin-bottom: 24px;
    }
    .forms-box__badge {
      font-family: "Space Mono", monospace;
      font-size: 0.65rem;
      color: #c89a5b;
      letter-spacing: 2px;
      display: block;
      margin-bottom: 8px;
    }
    .forms-box__header h3 {
      font-family: "Outfit", sans-serif;
      font-size: 1.5rem;
      color: #ece7dd;
      margin: 0 0 8px 0;
      font-weight: 500;
    }
    .forms-box__header p {
      color: #cdc8be;
      font-size: 0.9rem;
      margin: 0;
      line-height: 1.5;
    }
    .forms-box__buttons {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 12px;
      margin-bottom: 24px;
    }
    .form-select-btn {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(236, 231, 221, 0.12);
      color: #ece7dd;
      padding: 12px 18px;
      border-radius: 8px;
      cursor: pointer;
      font-family: "Inter", sans-serif;
      font-weight: 600;
      font-size: 0.9rem;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .form-select-btn:hover {
      border-color: #c89a5b;
      background: rgba(200, 154, 91, 0.05);
      color: #c89a5b;
      transform: translateY(-2px);
    }
    .form-select-btn.active {
      background: #c89a5b;
      border-color: #c89a5b;
      color: #15110a;
      box-shadow: 0 4px 15px rgba(200, 154, 91, 0.2);
    }
    .forms-box__container {
      background: rgba(0, 0, 0, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      padding: 24px;
      animation: formFadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes formFadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
      margin-bottom: 20px;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .form-group label {
      font-size: 0.75rem;
      font-family: "Space Mono", monospace;
      color: #8295a4;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .form-group input, .form-group select {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #fff;
      padding: 10px 14px;
      border-radius: 6px;
      font-family: "Inter", sans-serif;
      font-size: 0.9rem;
      transition: all 0.25s;
    }
    .form-group input:focus, .form-group select:focus {
      border-color: #c89a5b;
      background: rgba(255, 255, 255, 0.06);
      outline: none;
      box-shadow: 0 0 8px rgba(200, 154, 91, 0.15);
    }
    .submit-form-btn {
      background: #c89a5b;
      border: 1px solid #c89a5b;
      color: #15110a;
      padding: 12px 24px;
      font-weight: 700;
      font-size: 0.9rem;
      border-radius: 4px;
      cursor: pointer;
      font-family: "Inter", sans-serif;
      transition: all 0.25s;
      width: 100%;
    }
    .submit-form-btn:hover {
      background: #fff;
      border-color: #fff;
      box-shadow: 0 5px 15px rgba(255, 255, 255, 0.25);
    }
    .form-success {
      text-align: center;
      padding: 20px 10px;
      animation: scaleIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    @keyframes scaleIn {
      from { transform: scale(0.95); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
    .success-icon {
      font-size: 2.5rem;
      color: #10b981;
      display: block;
      margin-bottom: 12px;
    }
    .form-success h4 {
      font-family: "Outfit", sans-serif;
      font-size: 1.3rem;
      color: #fff;
      margin: 0 0 8px 0;
    }
    .form-success p {
      color: #cdc8be;
      font-size: 0.9rem;
      line-height: 1.5;
      margin: 0 0 20px 0;
    }
    .clear-form-btn {
      background: transparent;
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: #ece7dd;
      padding: 8px 18px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.8rem;
      font-weight: 600;
      transition: all 0.2s;
    }
    .clear-form-btn:hover {
      border-color: #c89a5b;
      color: #c89a5b;
    }
  `]
})
export class LandingComponent {
  showModal = false;
  selectedForm: 'comprador' | 'vendedor' | 'corredor' | null = null;
  formSubmitted = false;

  openModal() {
    this.showModal = true;
  }

  openWhatsApp() {
    window.open('https://wa.me/569XXXXXXXX', '_blank');
  }

  selectForm(type: 'comprador' | 'vendedor' | 'corredor') {
    this.selectedForm = type;
    this.formSubmitted = false;
  }

  submitForm(event: Event) {
    event.preventDefault();
    this.formSubmitted = true;
  }

  resetForm(event: Event) {
    event.preventDefault();
    this.selectedForm = null;
    this.formSubmitted = false;
  }
}
