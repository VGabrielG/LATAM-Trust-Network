let isLoaded = false;
let loadPromise: Promise<any> | null = null;

export function loadGoogleMaps(): Promise<any> {
  if (isLoaded) {
    return Promise.resolve((window as any).google);
  }
  
  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && (window as any).google) {
      isLoaded = true;
      resolve((window as any).google);
      return;
    }

    if (typeof document === 'undefined') {
      reject(new Error('Document is not defined (SSR environment)'));
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBaeJSQO0iwueiL6VMSKMjP3aFY3pGkJco&libraries=places`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      isLoaded = true;
      resolve((window as any).google);
    };

    script.onerror = (err) => {
      reject(err);
    };

    document.head.appendChild(script);
  });

  return loadPromise;
}
