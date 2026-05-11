/**
 * Lee un archivo y devuelve solo la porción Base64 (sin prefijo `data:mime;base64,`),
 * compatible con {@code Base64.getDecoder()} en Java.
 * @param {File} file
 * @returns {Promise<string>}
 */
export function fileToBase64String(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const raw = String(reader.result ?? '');
      const i = raw.indexOf(',');
      resolve(i >= 0 ? raw.slice(i + 1) : raw);
    };
    reader.onerror = () => reject(reader.error ?? new Error('No se pudo leer el archivo'));
    reader.readAsDataURL(file);
  });
}
