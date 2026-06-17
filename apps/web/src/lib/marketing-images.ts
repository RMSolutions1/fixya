/** Imágenes del hero slider — almacenadas en /public para evitar fallos del optimizador remoto */
export const HERO_SLIDE_IMAGES = {
  /** Pampa y campo argentino */
  campo: '/images/hero/campo.jpg',
  /** Obra, construcción y oficios matriculados */
  industria: '/images/hero/industria-obra.jpg',
  /** Ciudad, edificios y hogar urbano */
  ciudad: '/images/hero/ciudad.jpg',
  /** Cielo celeste y paisaje — orgullo argentino */
  celeste: '/images/hero/celeste.jpg',
} as const;

/** Unsplash verificado — uso en páginas marketing secundarias */
export function unsplashPhoto(photoId: string, width = 1920) {
  return `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=${width}&q=80`;
}

export const MARKETING_IMAGES = {
  nosotros: unsplashPhoto('1486406146926-c627a92ad1ab', 900),
  paraQuienes: unsplashPhoto('1504307651254-35680f356dfd', 900),
} as const;
