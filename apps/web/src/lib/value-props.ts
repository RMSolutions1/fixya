import type { LucideIcon } from 'lucide-react';
import {
  Shield,
  CreditCard,
  FileCheck,
  MapPin,
  Clock,
  Users,
} from 'lucide-react';

export interface ValuePropItem {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
}

/** Fuente única de copy para propuestas de valor FixYa */
export const VALUE_PROPS: Record<string, ValuePropItem> = {
  identity: {
    id: 'identity',
    icon: Shield,
    title: 'Identidad revisada',
    description: 'Identidad y documentación revisadas antes de operar en la plataforma.',
  },
  mp: {
    id: 'mp',
    icon: CreditCard,
    title: 'Mercado Pago',
    description: 'Pagos en pesos argentinos. Fondos retenidos hasta tu conformidad.',
  },
  expediente: {
    id: 'expediente',
    icon: FileCheck,
    title: 'Expediente digital',
    description: 'Trazabilidad de cada servicio. Factura fiscal en roadmap con Emitia.',
  },
  coverage: {
    id: 'coverage',
    icon: MapPin,
    title: 'Cobertura nacional',
    description: '24 provincias — del NOA a la Patagonia.',
  },
  agile: {
    id: 'agile',
    icon: Clock,
    title: 'Respuesta ágil',
    description: 'Presupuestos comparables y seguimiento del estado de cada servicio.',
  },
  network: {
    id: 'network',
    icon: Users,
    title: 'Todo el país conectado',
    description: 'Del NOA al sur, del campo a la capital. Una red nacional de oficios independientes.',
  },
  nearby: {
    id: 'nearby',
    icon: MapPin,
    title: 'Cerca tuyo',
    description: 'Buscá por zona, categoría y calificación. Encontrá al especialista ideal en tu barrio.',
  },
};

/** Strip compacto — páginas de servicios y landings */
export const VALUE_PROP_STRIP_IDS = ['mp', 'expediente', 'identity', 'coverage'] as const;

/** Grid expandido — home y sección “Por qué FixYa” */
export const VALUE_PROP_GRID_IDS = [
  'identity',
  'mp',
  'expediente',
  'agile',
  'network',
  'nearby',
] as const;

export function getValueProps(ids: readonly string[]): ValuePropItem[] {
  return ids.map((id) => VALUE_PROPS[id]).filter(Boolean);
}
