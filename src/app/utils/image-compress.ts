/**
 * Utility to compress and convert images to Base64 data URLs.
 * This is extremely useful as a fallback when Firebase Storage is not initialized
 * or fails due to CORS/network issues.
 */
export async function compressAndConvertToBase64(
  file: File,
  maxWidth = 800,
  maxHeight = 600,
  quality = 0.7
): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event: any) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Calculate new dimensions keeping aspect ratio
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            // Convert to JPEG with specified quality
            const dataUrl = canvas.toDataURL('image/jpeg', quality);
            resolve(dataUrl);
          } else {
            // Fallback to original base64 if canvas context is unavailable
            resolve(event.target.result as string);
          }
        } catch (e) {
          console.warn('Canvas compression failed, falling back to raw Base64', e);
          resolve(event.target.result as string);
        }
      };
      
      img.onerror = () => {
        // Fallback to original base64 if image loading fails
        resolve(event.target.result as string);
      };
      
      img.src = event.target.result as string;
    };
    
    reader.onerror = () => {
      resolve('');
    };
    
    reader.readAsDataURL(file);
  });
}
