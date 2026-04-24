/**
 * Resizes an image if it exceeds a certain maximum dimension or quality
 * directly in the browser using Canvas.
 */
export async function resizeImage(
  base64Str: string, 
  maxWidth = 1200, 
  maxHeight = 1200, 
  quality = 0.7
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      // Calculate new dimensions
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
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // Return as reduced quality jpeg to save significant space
      // Logo specifically might want PNG if transparent, but for simplicity and size we use JPEG
      // Unless it's a small logo, then we can keep it as is.
      const resizedBase64 = canvas.toDataURL('image/jpeg', quality);
      resolve(resizedBase64);
    };
    img.onerror = (err) => reject(err);
  });
}
