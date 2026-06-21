'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface RegistryLogoProps {
  acronym: string;
  brandColor: string;
  logoPath: string;
  size?: number;
  className?: string;
}

export function RegistryLogo({
  acronym,
  brandColor,
  logoPath,
  size = 32,
  className,
}: RegistryLogoProps) {
  const [failed, setFailed] = useState(false);
  const label = acronym.length > 5 ? acronym.slice(0, 4) : acronym;

  if (!failed && logoPath) {
    return (
      <Image
        src={logoPath}
        alt={`Logo ${acronym}`}
        width={size}
        height={size}
        className={cn('rounded-lg ring-1 ring-black/5', className)}
        onError={() => setFailed(true)}
        unoptimized
      />
    );
  }

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-lg font-bold text-white ring-1 ring-black/5',
        className,
      )}
      style={{
        width: size,
        height: size,
        backgroundColor: brandColor,
        fontSize: size <= 24 ? 8 : 10,
      }}
      title={acronym}
    >
      {label}
    </div>
  );
}
