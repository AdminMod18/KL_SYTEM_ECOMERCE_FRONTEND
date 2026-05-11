/**
 * Redimensiona y comprime una imagen en el navegador (demo sin servidor de ficheros).
 * @param {File} file
 * @param {number} [maxLen] longitud máxima aproximada del data URL (validación API)
 * @returns {Promise<string>} data URL (jpeg/png)
 */
function drawToDataUrl(file, maxWidth, maxHeight, outputMime, jpegQuality) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Seleccione un archivo de imagen.'));
      return;
    }
    const blobUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(blobUrl);
      let w = img.naturalWidth || img.width;
      let h = img.naturalHeight || img.height;
      const scale = Math.min(1, maxWidth / w, maxHeight / h);
      w = Math.max(1, Math.round(w * scale));
      h = Math.max(1, Math.round(h * scale));
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('No se pudo preparar el lienzo.'));
        return;
      }
      if (outputMime === 'image/jpeg') {
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, w, h);
      }
      ctx.drawImage(img, 0, 0, w, h);
      try {
        if (outputMime === 'image/png') {
          resolve(canvas.toDataURL('image/png'));
        } else {
          resolve(canvas.toDataURL('image/jpeg', jpegQuality));
        }
      } catch (e) {
        reject(e instanceof Error ? e : new Error(String(e)));
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(blobUrl);
      reject(new Error('No se pudo leer la imagen.'));
    };
    img.src = blobUrl;
  });
}

/**
 * @param {File} file
 * @param {number} [maxLen]
 */
export async function compressImageToDataUrl(file, maxLen = 14500) {
  const outputMime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
  let maxW = 900;
  let maxH = 900;
  let jpegQ = 0.82;
  for (let pass = 0; pass < 4; pass++) {
    const dataUrl =
      outputMime === 'image/png'
        ? await drawToDataUrl(file, maxW, maxH, 'image/png', jpegQ)
        : await drawToDataUrl(file, maxW, maxH, 'image/jpeg', jpegQ);
    if (dataUrl.length <= maxLen) return dataUrl;
    maxW = Math.round(maxW * 0.72);
    maxH = Math.round(maxH * 0.72);
    if (outputMime === 'image/jpeg') {
      jpegQ = Math.max(0.45, jpegQ - 0.12);
    }
  }
  const last =
    outputMime === 'image/png'
      ? await drawToDataUrl(file, 400, 400, 'image/png', 0.9)
      : await drawToDataUrl(file, 400, 400, 'image/jpeg', 0.5);
  if (last.length > maxLen + 500) {
    throw new Error('La imagen sigue siendo muy pesada; prueba otra foto o usa una URL.');
  }
  return last;
}
