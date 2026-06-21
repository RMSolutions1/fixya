import { getRegistryById, isProfessionalCredentialRegistry } from '../data/professional-registries';

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

const ONLINE_MS = 15 * 60 * 1000;
const AWAY_MS = 24 * 60 * 60 * 1000;

function extractServiceMetadata(metadata: unknown) {
  if (!metadata || typeof metadata !== 'object') return {} as Record<string, unknown>;
  return metadata as Record<string, unknown>;
}

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

export function buildRegistrySource(
  registryId: string | null | undefined,
  directoryListing: boolean,
): RegistrySourcePublic | null {
  if (!registryId || !isProfessionalCredentialRegistry(registryId)) return null;
  const reg = getRegistryById(registryId);
  if (!reg) return null;
  return {
    id: reg.id,
    acronym: reg.acronym,
    name: reg.name,
    brandColor: reg.brandColor ?? '#1e3a5f',
    logoPath: reg.logoPath ?? `/images/registries/${reg.id}.svg`,
    verificationUrl: reg.verificationUrl,
    directoryUrl: reg.directoryUrl,
    regulates: reg.regulates,
    directoryListing,
  };
}

export const DIRECTORY_REGISTRY_IDS = new Set(['copaipa', 'gasnor', 'aguas-del-norte']);

export function enrichProfessionalPublicFields(
  metadata: unknown,
  lastLoginAt: Date | null | undefined,
  opts: {
    emailVerified: boolean;
    userStatus: string;
    serviceStatus: string;
  },
) {
  const m = extractServiceMetadata(metadata);
  const registryId = typeof m.registryId === 'string' ? m.registryId : null;
  const directoryListing =
    m.directoryListing === true ||
    (registryId != null && DIRECTORY_REGISTRY_IDS.has(registryId));
  const licenseNumber = typeof m.licenseNumber === 'string' ? m.licenseNumber : null;
  const registry = buildRegistrySource(registryId, directoryListing);
  const presence = resolvePresence(lastLoginAt, directoryListing);
  const registryVerified = Boolean(registry && (directoryListing || opts.userStatus === 'ACTIVE'));
  const verified =
    registryVerified || (opts.emailVerified && opts.userStatus === 'ACTIVE');
  const available =
    opts.userStatus === 'ACTIVE' &&
    (opts.serviceStatus === 'ACTIVE' || directoryListing);

  return {
    registry,
    presence,
    licenseNumber,
    registryVerified,
    verified,
    available,
    directoryListing,
  };
}
