const icons: Record<string, string> = {
  electricidad: '⚡',
  plomeria: '🔧',
  gas: '🔥',
  'aire-acondicionado': '❄️',
  seguridad: '🛡️',
  cerrajeria: '🔑',
  mecanica: '🔩',
  pintura: '🎨',
  mudanza: '📦',
  flete: '🚚',
  limpieza: '✨',
  jardineria: '🌿',
  peluqueria: '💇',
  veterinaria: '🐾',
  ninera: '👶',
  'cuidador-adultos': '❤️',
  albanileria: '🧱',
  carpinteria: '🪚',
  'tecnico-pc': '💻',
  'profesor-particular': '📚',
};

export function getCategoryIcon(slug: string): string {
  return icons[slug] ?? '🔧';
}
