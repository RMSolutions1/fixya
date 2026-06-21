import { Prisma } from '@fixya/database';

/** Emails de seed / QA que no deben aparecer en el directorio público. */
export const INTERNAL_DIRECTORY_EMAIL_SUFFIXES = ['@fixya.test', '@fixya.demo'] as const;

export function isInternalDirectoryEmail(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  return INTERNAL_DIRECTORY_EMAIL_SUFFIXES.some((suffix) => normalized.endsWith(suffix));
}

export const PUBLIC_DIRECTORY_USER_WHERE: Prisma.UserWhereInput = {
  NOT: {
    OR: INTERNAL_DIRECTORY_EMAIL_SUFFIXES.map((suffix) => ({
      email: { endsWith: suffix, mode: 'insensitive' as const },
    })),
  },
};
