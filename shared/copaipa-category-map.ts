/**
 * Mapeo profesión COPAIPA → rubro FixYa (category-catalog slug).
 * Heurística por palabras clave; revisar casos límite al ampliar rubros.
 */
export function mapCopaipaProfessionToCategory(profesion: string): string {
  const p = profesion.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();

  if (/\bGAS\b|GAS NATURAL|GASISTA/.test(p)) return 'gas';
  if (/HIDRAUL|PLOMER|SANITAR|SANEAM/.test(p)) return 'plomeria';
  if (/AIRE ACOND|CLIMATIZ|REFRIGER|CALEFAC/.test(p)) return 'aire-acondicionado';
  if (/AUTOMOT|MECAN|MECATRON|INDUSTRI/.test(p)) return 'mecanica';
  if (/CARPINT|EBANIST/.test(p)) return 'carpinteria';
  if (/PINTOR|PINTURA/.test(p)) return 'pintura';
  if (/JARDIN|PAISAJ|AGRONOM|FOREST|ZOOTEC|AGROPECU/.test(p)) return 'jardineria';
  if (/VETERIN/.test(p)) return 'veterinaria';
  if (/INFORMAT|COMPUT|SISTEMA|PROGRAM|ANALISTA|SOFTWARE|REDES INFO/.test(p)) return 'tecnico-pc';
  if (/SEGURIDAD|HIGIENE|HYS|LABORAL|RIESGO/.test(p)) return 'seguridad';
  if (/ELECTRIC|ELECTRO|ELECTRON|TELECOM|ELECTROMEC/.test(p)) return 'electricidad';
  if (
    /CIVIL|CONSTRUC|ARQUITECT|ALBANIL|MAESTRO MAYOR|AGRIMENS|OBRA|TOPOGRAF|GEODES|HIDRAUL/.test(p)
  ) {
    return 'albanileria';
  }
  if (/LIMPIEZA/.test(p)) return 'limpieza';
  if (/FLETE|MUDAN|TRANSPORT|VIAL|CAMINO/.test(p)) return 'flete';

  // Default: COPAIPA agrupa mayormente ingeniería/agrimensura/arquitectura → rubro de obra.
  return 'albanileria';
}
