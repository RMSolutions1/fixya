import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Store,
  FileText,
  Wallet,
  Heart,
  Users,
  ClipboardList,
} from 'lucide-react';

export type DashboardRole =
  | 'CLIENTE'
  | 'PROFESIONAL'
  | 'EMPRESA'
  | 'SUPER_ADMIN'
  | 'CONTADOR'
  | 'SUPERVISOR'
  | 'OPERADOR'
  | 'AUDITOR'
  | 'GESTOR_DOCUMENTAL';

export interface DashboardNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
}

const clientNav: DashboardNavItem[] = [
  { href: '/dashboard', label: 'Inicio', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/solicitudes', label: 'Mis solicitudes', icon: ClipboardList },
  { href: '/profesionales', label: 'Profesionales', icon: Users },
  { href: '/favorites', label: 'Favoritos', icon: Heart },
  { href: '/marketplace/requests/new', label: 'Solicitar servicio', icon: FileText },
];

const professionalNav: DashboardNavItem[] = [
  { href: '/dashboard', label: 'Inicio', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/solicitudes', label: 'Oportunidades', icon: ClipboardList },
  { href: '/marketplace', label: 'Marketplace', icon: Store },
  { href: '/wallet', label: 'Wallet', icon: Wallet },
];

const adminNav: DashboardNavItem[] = [
  { href: '/dashboard', label: 'Inicio', icon: LayoutDashboard, exact: true },
  { href: '/marketplace', label: 'Marketplace', icon: Store },
  { href: '/dashboard/solicitudes', label: 'Solicitudes', icon: ClipboardList },
  { href: '/wallet', label: 'Wallet', icon: Wallet },
];

const auditorNav: DashboardNavItem[] = [
  { href: '/dashboard', label: 'Inicio', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/solicitudes', label: 'Solicitudes', icon: ClipboardList },
  { href: '/wallet', label: 'Libro contable', icon: Wallet },
];

const gestorNav: DashboardNavItem[] = [
  { href: '/dashboard', label: 'Inicio', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/solicitudes', label: 'Expedientes', icon: ClipboardList },
];

const ADMIN_ROLES: DashboardRole[] = [
  'SUPER_ADMIN',
  'EMPRESA',
  'CONTADOR',
  'SUPERVISOR',
  'OPERADOR',
];

export function resolveDashboardRole(role?: string): DashboardRole {
  const known: DashboardRole[] = [
    'CLIENTE',
    'PROFESIONAL',
    'EMPRESA',
    'SUPER_ADMIN',
    'CONTADOR',
    'SUPERVISOR',
    'OPERADOR',
    'AUDITOR',
    'GESTOR_DOCUMENTAL',
  ];
  if (role && known.includes(role as DashboardRole)) {
    return role as DashboardRole;
  }
  return 'CLIENTE';
}

export function getDashboardNav(role?: string): DashboardNavItem[] {
  const r = resolveDashboardRole(role);
  if (r === 'PROFESIONAL') return professionalNav;
  if (r === 'AUDITOR') return auditorNav;
  if (r === 'GESTOR_DOCUMENTAL') return gestorNav;
  if (ADMIN_ROLES.includes(r)) return adminNav;
  return clientNav;
}

export function getDashboardDescription(role: DashboardRole): string {
  switch (role) {
    case 'PROFESIONAL':
      return 'Panel profesional FixYa · Grupo Emprenor — oportunidades e ingresos';
    case 'SUPER_ADMIN':
      return 'Administración FixYa · Grupo Emprenor';
    case 'EMPRESA':
      return 'Panel empresarial FixYa — operaciones y marketplace';
    case 'CONTADOR':
      return 'Panel contable FixYa — wallet, ledger y comisiones';
    case 'SUPERVISOR':
      return 'Supervisión FixYa — monitoreo de operaciones';
    case 'OPERADOR':
      return 'Panel operativo FixYa — solicitudes y marketplace';
    case 'AUDITOR':
      return 'Auditoría FixYa — solicitudes y libro contable';
    case 'GESTOR_DOCUMENTAL':
      return 'Expedientes FixYa — contrataciones y documentación';
    default:
      return 'Tu panel FixYa · Grupo Emprenor';
  }
}

export function canAccessWallet(role: DashboardRole): boolean {
  return role !== 'GESTOR_DOCUMENTAL';
}

export function canCreateRequest(role: DashboardRole): boolean {
  return role === 'CLIENTE';
}

export function canSubmitQuotation(role: DashboardRole): boolean {
  return role === 'PROFESIONAL' || role === 'EMPRESA';
}

/** Rutas del dashboard a verificar en E2E por rol */
export function getDashboardRoutesForRole(role: DashboardRole): string[] {
  const nav = getDashboardNav(role).map((item) => item.href);
  return [...new Set(nav)];
}
