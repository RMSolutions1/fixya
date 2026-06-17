import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Store,
  FileText,
  Wallet,
  Heart,
  ClipboardList,
  ShieldCheck,
  UserCircle,
  FileUp,
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

const profileNavItem: DashboardNavItem = {
  href: '/dashboard/perfil',
  label: 'Mi perfil',
  icon: UserCircle,
};

const clientNav: DashboardNavItem[] = [
  { href: '/dashboard', label: 'Inicio', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/solicitudes', label: 'Mis solicitudes', icon: ClipboardList },
  { href: '/favorites', label: 'Favoritos', icon: Heart },
  { href: '/marketplace/requests/new', label: 'Solicitar servicio', icon: FileText },
  profileNavItem,
];

const professionalNav: DashboardNavItem[] = [
  { href: '/dashboard', label: 'Inicio', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/solicitudes', label: 'Oportunidades', icon: ClipboardList },
  { href: '/marketplace', label: 'Marketplace', icon: Store },
  { href: '/dashboard/documentacion', label: 'Documentación', icon: FileUp },
  { href: '/wallet', label: 'Wallet', icon: Wallet },
  profileNavItem,
];

const adminNav: DashboardNavItem[] = [
  { href: '/dashboard', label: 'Inicio', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/aprobaciones', label: 'Aprobaciones', icon: ShieldCheck },
  { href: '/marketplace', label: 'Marketplace', icon: Store },
  { href: '/dashboard/solicitudes', label: 'Solicitudes', icon: ClipboardList },
  { href: '/wallet', label: 'Wallet', icon: Wallet },
  profileNavItem,
];

const auditorNav: DashboardNavItem[] = [
  { href: '/dashboard', label: 'Inicio', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/solicitudes', label: 'Solicitudes', icon: ClipboardList },
  { href: '/wallet', label: 'Libro contable', icon: Wallet },
  profileNavItem,
];

const gestorNav: DashboardNavItem[] = [
  { href: '/dashboard', label: 'Inicio', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/solicitudes', label: 'Expedientes', icon: ClipboardList },
  profileNavItem,
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
      return 'Panel profesional — oportunidades e ingresos';
    case 'SUPER_ADMIN':
      return 'Administración FixYa';
    case 'EMPRESA':
      return 'Panel empresarial — operaciones y marketplace';
    case 'CONTADOR':
      return 'Panel contable — wallet, ledger y comisiones';
    case 'SUPERVISOR':
      return 'Supervisión — monitoreo de operaciones';
    case 'OPERADOR':
      return 'Panel operativo — solicitudes y marketplace';
    case 'AUDITOR':
      return 'Auditoría — solicitudes y libro contable';
    case 'GESTOR_DOCUMENTAL':
      return 'Expedientes — contrataciones y documentación';
    default:
      return 'Tu panel FixYa';
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

export function canApproveProfessionals(role: DashboardRole): boolean {
  return role === 'SUPER_ADMIN' || role === 'SUPERVISOR' || role === 'OPERADOR';
}

/** Rutas del dashboard a verificar en E2E por rol */
export function getDashboardRoutesForRole(role: DashboardRole): string[] {
  const nav = getDashboardNav(role).map((item) => item.href);
  return [...new Set(nav)];
}
