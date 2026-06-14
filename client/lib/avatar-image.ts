const MAX_SIDE = 512;
const JPEG_QUALITY = 0.85;

export function readImageAsDataUrl(file: File, maxSide = 512): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.match(/^image\/(jpeg|png|webp)$/)) {
      reject(new Error("Выберите JPG, PNG или WebP"));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      reject(new Error("Файл больше 5 МБ"));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const src = reader.result as string;
      compressImage(src, maxSide).then(resolve).catch(reject);
    };
    reader.onerror = () => reject(new Error("Не удалось прочитать файл"));
    reader.readAsDataURL(file);
  });
}

function compressImage(dataUrl: string, maxSide: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      const scale = Math.min(1, maxSide / Math.max(width, height));
      width = Math.round(width * scale);
      height = Math.round(height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Ошибка обработки"));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", JPEG_QUALITY));
    };
    img.onerror = () => reject(new Error("Некорректное изображение"));
    img.src = dataUrl;
  });
}

export function initialsFromName(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
