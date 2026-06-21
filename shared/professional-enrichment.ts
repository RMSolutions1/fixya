/**
 * Enriquecimiento de profesionales: fuente habilitante (padrón) y presencia en línea.
 */

export type PresenceStatus = 'online' | 'away' | 'offline' | 'directory';

export interface RegistrySourcePublic {
  id: string;
  acronym: string;
  name: string;
  brandColor: string;
  logoPath: string;
  verificationUrl: string;
  directoryUrl?: string;
  regulates: string;
  directoryListing: boolean;
}

export interface PresencePublic {
  status: PresenceStatus;
  label: string;
  isOnline: boolean;
  lastSeenAt: string | null;
}

export interface ServiceMetadataLike {
  registryId?: string | null;
  importedFrom?: string | null;
  directoryListing?: boolean;
  licenseNumber?: string | null;
}

const ONLINE_MS = 15 * 60 * 1000;
const AWAY_MS = 24 * 60 * 60 * 1000;

export function resolvePresence(
  lastLoginAt: Date | string | null | undefined,
  directoryListing?: boolean,
): PresencePublic {
  if (directoryListing) {
    return {
      status: 'directory',
      label: 'Padrón oficial',
      isOnline: false,
      lastSeenAt: null,
    };
  }

  if (!lastLoginAt) {
    return {
      status: 'offline',
      label: 'Desconectado',
      isOnline: false,
      lastSeenAt: null,
    };
  }

  const seen = lastLoginAt instanceof Date ? lastLoginAt : new Date(lastLoginAt);
  const diff = Date.now() - seen.getTime();
  const lastSeenAt = seen.toISOString();

  if (diff <= ONLINE_MS) {
    return { status: 'online', label: 'En línea', isOnline: true, lastSeenAt };
  }
  if (diff <= AWAY_MS) {
    return { status: 'away', label: 'Recientemente activo', isOnline: false, lastSeenAt };
  }
  return { status: 'offline', label: 'Desconectado', isOnline: false, lastSeenAt };
}

export function buildRegistrySourcePublic(
  registryId: string | null | undefined,
  getRegistry: (id: string) => {
    id: string;
    acronym: string;
    name: string;
    brandColor: string;
    logoPath: string;
    verificationUrl: string;
    directoryUrl?: string;
    regulates: string;
  } | undefined,
  directoryListing = false,
): RegistrySourcePublic | null {
  if (!registryId) return null;
  const reg = getRegistry(registryId);
  if (!reg) return null;
  return {
    id: reg.id,
    acronym: reg.acronym,
    name: reg.name,
    brandColor: reg.brandColor,
    logoPath: reg.logoPath,
    verificationUrl: reg.verificationUrl,
    directoryUrl: reg.directoryUrl,
    regulates: reg.regulates,
    directoryListing,
  };
}

export function extractServiceMetadata(
  metadata: unknown,
): ServiceMetadataLike {
  if (!metadata || typeof metadata !== 'object') return {};
  const m = metadata as Record<string, unknown>;
  return {
    registryId: typeof m.registryId === 'string' ? m.registryId : null,
    importedFrom: typeof m.importedFrom === 'string' ? m.importedFrom : null,
    directoryListing: m.directoryListing === true,
    licenseNumber: typeof m.licenseNumber === 'string' ? m.licenseNumber : null,
  };
}
