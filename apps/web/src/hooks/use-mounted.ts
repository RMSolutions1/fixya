'use client';

import { useState, useEffect } from 'react';

/** Evita hydration mismatch: queries y DOM solo después del mount en cliente */
export function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
