export default async function getCroppedImg(imageSrc: string, crop: any): Promise<string> {
    const createImage = (url: string): Promise<HTMLImageElement> =>
      new Promise((resolve, reject) => {
        const image = new Image();
        image.crossOrigin = "anonymous"; // Para evitar problemas de CORS
        image.src = url;
        image.onload = () => resolve(image);
        image.onerror = (error) => reject(error);
      });
  
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
  
    if (!ctx) {
      throw new Error("No se pudo obtener el contexto del canvas");
    }
  
    // Configurar el tamaño del canvas según el recorte
    canvas.width = crop.width;
    canvas.height = crop.height;
  
    ctx.drawImage(
      image,
      crop.x,
      crop.y,
      crop.width,
      crop.height,
      0,
      0,
      crop.width,
      crop.height
    );
  
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          console.error("❌ Error al generar la imagen recortada.");
          return;
        }
        resolve(URL.createObjectURL(blob)); // Retorna la URL de la imagen recortada
      }, "image/jpeg");
    });
  }