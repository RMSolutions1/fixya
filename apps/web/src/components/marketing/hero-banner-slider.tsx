'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ChevronDown, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SolDeMayo } from '@/components/brand/sol-de-mayo';
import { HeroSearch } from '@/components/marketing/marketing-blocks';
import { HERO_SLIDE_IMAGES } from '@/lib/marketing-images';
import { cn } from '@/lib/utils';

export interface HeroSlide {
  id: string;
  badge: string;
  title: string;
  highlight: string;
  subtitle: string;
  image: string;
  imageAlt: string;
  overlay?: 'campo' | 'industria' | 'ciudad' | 'celeste';
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
}

const defaultSlides: HeroSlide[] = [
  {
    id: 'campo',
    badge: 'Campo & Pampa · Interior profundo',
    title: 'El campo argentino',
    highlight: 'trabaja con vos',
    subtitle:
      'Veterinarios, fletes, jardineros y servicios rurales. Profesionales del interior conectados con quienes los necesitan.',
    image: HERO_SLIDE_IMAGES.campo,
    imageAlt: 'Campo y pampa argentina al atardecer',
    overlay: 'campo',
    primaryCta: { label: 'Buscar en mi zona', href: '/profesionales' },
    secondaryCta: { label: 'Ver rubros', href: '/servicios' },
  },
  {
    id: 'industria',
    badge: 'Industria & Oficios · Matriculados',
    title: 'Oficios que mueven',
    highlight: 'la industria',
    subtitle:
      'Gasistas, electricistas, soldadores y técnicos industriales. Calidad certificada para fábricas, talleres y obras.',
    image: HERO_SLIDE_IMAGES.industria,
    imageAlt: 'Trabajadores en obra de construcción industrial',
    overlay: 'industria',
    primaryCta: { label: 'Ver profesionales', href: '/profesionales' },
    secondaryCta: { label: 'Cómo funciona', href: '/para-quienes' },
  },
  {
    id: 'ciudad',
    badge: 'Ciudad & Hogar · CABA y GBA',
    title: 'Tu barrio,',
    highlight: 'tu especialista',
    subtitle:
      'Plomeros, cerrajeros, limpieza y mudanzas. Profesionales cerca tuyo en las 24 provincias.',
    image: HERO_SLIDE_IMAGES.ciudad,
    imageAlt: 'Profesional de limpieza trabajando en un hogar',
    overlay: 'ciudad',
    primaryCta: { label: 'Encontrar profesional', href: '/profesionales' },
    secondaryCta: { label: 'Cómo funciona', href: '/para-quienes' },
  },
  {
    id: 'celeste',
    badge: 'Beta abierta · Grupo Emprenor',
    title: 'Argentina entera,',
    highlight: 'un click',
    subtitle:
      'Miles de profesionales en el mapa. Pedí presupuesto gratis, compará y seguí tu solicitud en un solo lugar.',
    image: HERO_SLIDE_IMAGES.celeste,
    imageAlt: 'Paisaje con cielo celeste y montañas',
    overlay: 'celeste',
    primaryCta: { label: 'Pedir presupuesto', href: '/marketplace/requests/new' },
    secondaryCta: { label: 'Ver profesionales', href: '/profesionales' },
  },
];

const slideBackgrounds: Record<NonNullable<HeroSlide['overlay']>, string> = {
  campo:
    'radial-gradient(ellipse 60% 50% at 75% 40%, hsl(142 35% 28% / 0.35) 0%, transparent 70%)',
  industria:
    'radial-gradient(ellipse 50% 40% at 65% 35%, hsl(215 25% 25% / 0.4) 0%, transparent 65%)',
  ciudad:
    'radial-gradient(ellipse 70% 50% at 50% 90%, hsl(201 62% 38% / 0.3) 0%, transparent 70%)',
  celeste:
    'radial-gradient(ellipse 80% 60% at 50% 110%, hsl(43 96% 56% / 0.15) 0%, transparent 55%)',
};

const overlayClasses: Record<NonNullable<HeroSlide['overlay']>, string> = {
  campo: 'from-[hsl(150_35%_18%/0.95)] via-[hsl(var(--brand-indigo)/0.88)] to-[hsl(var(--brand-indigo)/0.95)]',
  industria: 'from-slate-950/95 via-[hsl(var(--brand-indigo)/0.9)] to-[hsl(var(--brand-indigo)/0.96)]',
  ciudad: 'from-[hsl(var(--brand-indigo)/0.94)] via-[hsl(var(--brand-indigo)/0.82)] to-[hsl(var(--brand-indigo)/0.94)]',
  celeste: 'from-[hsl(var(--brand-indigo)/0.94)] via-primary/80 to-[hsl(var(--brand-indigo)/0.96)]',
};

interface HeroBannerSliderProps {
  slides?: HeroSlide[];
  stats?: { professionalsCount: number; categoriesCount: number; verifiedProfessionalsCount?: number; completedRequests?: number };
  showSearch?: boolean;
}

export function HeroBannerSlider({
  slides = defaultSlides,
  stats,
  showSearch = true,
}: HeroBannerSliderProps) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => {
    setActive((i) => (i + 1) % slides.length);
  }, [slides.length]);

  const prev = useCallback(() => {
    setActive((i) => (i - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(next, 7000);
    return () => clearInterval(timer);
  }, [next, paused]);

  const slide = slides[active];

  return (
    <section
      className="relative min-h-[88vh] overflow-hidden text-white"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slides background */}
      {slides.map((s, i) => (
        <div
          key={s.id}
          className={cn(
            'absolute inset-0 transition-opacity duration-1000 ease-in-out',
            i === active ? 'opacity-100' : 'opacity-0',
          )}
        >
          {s.image ? (
            <Image
              src={s.image}
              alt={s.imageAlt}
              fill
              priority={i === 0}
              sizes="100vw"
              className="object-cover object-center"
            />
          ) : null}
          <div
            className={cn(
              'absolute inset-0 bg-gradient-to-br',
              overlayClasses[s.overlay ?? 'celeste'],
            )}
            style={{ backgroundImage: slideBackgrounds[s.overlay ?? 'celeste'] }}
          />
        </div>
      ))}

      {/* Sol decorativo — solo pantallas grandes */}
      <div className="pointer-events-none absolute right-[6%] top-[20%] hidden opacity-25 xl:block">
        <SolDeMayo size={120} animated />
      </div>

      {/* Acento bandera argentina (sutil) */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-1 stripes-argentina opacity-30" />

      {/* Content */}
      <div className="relative mx-auto flex min-h-[88vh] max-w-7xl flex-col justify-center px-4 pb-28 pt-24 sm:px-6 sm:pt-28">
        <div key={slide.id} className="max-w-3xl animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest backdrop-blur-sm">
            <span className="h-2 w-2 animate-pulse rounded-full bg-sol" />
            {slide.badge}
          </span>

          <h1 className="mt-6 text-4xl font-bold leading-[1.1] tracking-tight text-white drop-shadow-sm sm:text-5xl lg:text-6xl xl:text-7xl">
            {slide.title}{' '}
            <span className="text-sol">{slide.highlight}</span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/85 sm:text-xl">
            {slide.subtitle}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" variant="emprenor" asChild>
              <Link href={slide.primaryCta.href}>
                {slide.primaryCta.label}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outlineOnDark" asChild>
              <Link href={slide.secondaryCta.href}>{slide.secondaryCta.label}</Link>
            </Button>
          </div>

          {showSearch && active === 0 && (
            <div className="mt-10 max-w-xl">
              <HeroSearch />
            </div>
          )}
        </div>

        {/* Stats — estilo CRONEC / Emprenor */}
        <div className="mt-auto grid max-w-3xl grid-cols-2 gap-4 border-t border-white/20 pt-8 sm:grid-cols-4">
          {[
            { value: stats?.categoriesCount ?? '—', label: 'Rubros' },
            {
              value:
                stats?.verifiedProfessionalsCount != null
                  ? stats.verifiedProfessionalsCount
                  : stats?.professionalsCount != null
                    ? stats.professionalsCount
                    : '—',
              label: 'Profesionales',
            },
            { value: '24', label: 'Provincias' },
            { value: stats?.completedRequests ?? '—', label: 'Servicios' },
          ].map(({ value, label }) => (
            <div key={label} className="text-center sm:text-left">
              <p className="text-3xl font-bold tabular-nums text-white">{value}</p>
              <p className="text-xs font-medium uppercase tracking-widest text-white/60">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 items-center gap-4">
        <button
          type="button"
          onClick={prev}
          className="rounded-full border border-white/30 bg-black/20 p-2 backdrop-blur-sm transition-colors hover:bg-white/20"
          aria-label="Slide anterior"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex gap-2">
          {slides.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setActive(i)}
              className={cn(
                'h-2 rounded-full transition-all duration-300',
                i === active ? 'w-8 bg-sol' : 'w-2 bg-white/40 hover:bg-white/70',
              )}
              aria-label={`Ir a slide ${i + 1}`}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={next}
          className="rounded-full border border-white/30 bg-black/20 p-2 backdrop-blur-sm transition-colors hover:bg-white/20"
          aria-label="Slide siguiente"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Scroll hint */}
      <a
        href="#contenido"
        className="absolute bottom-8 right-6 hidden flex-col items-center gap-1 text-xs text-white/50 transition-colors hover:text-white sm:flex"
      >
        Descubrir
        <ChevronDown className="h-4 w-4 animate-bounce" />
      </a>
    </section>
  );
}
