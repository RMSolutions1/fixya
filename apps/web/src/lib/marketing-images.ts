/** Unsplash verificado — uso en hero y páginas marketing */
export function unsplashPhoto(photoId: string, width = 1920) {
  return `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=${width}&q=80`;
}

/** Imágenes del hero slider — genéricas, sin marcas ni referencias extranjeras.
    Remoto permitido en next.config (images.unsplash.com). */
export const HERO_SLIDE_IMAGES = {
  campo: unsplashPhoto('1500382017468-9049fed747ef', 1920),
  industria: unsplashPhoto('1504307651254-35680f356dfd', 1920),
  ciudad: unsplashPhoto('1581578731548-c64695cc6952', 1920),
  celeste: unsplashPhoto('1469474968028-56623f02e42e', 1920),
} as const;

export const MARKETING_IMAGES = {
  nosotros: unsplashPhoto('1486406146926-c627a92ad1ab', 900),
  paraQuienes: unsplashPhoto('1504307651254-35680f356dfd', 900),
} as const;
