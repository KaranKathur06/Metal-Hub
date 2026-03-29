'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

type HeroSlide = {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  ctaText: string;
  ctaLink: string;
};

type HeroCarouselProps = {
  slides: HeroSlide[];
};

const AUTO_DELAY = 5000;

export default function HeroCarousel({ slides }: HeroCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    if (slides.length <= 1) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, AUTO_DELAY);

    return () => window.clearInterval(timer);
  }, [slides.length]);

  if (!slides.length) {
    return null;
  }

  const goTo = (index: number) => {
    setActiveIndex(index);
  };

  const goNext = () => {
    setActiveIndex((current) => (current + 1) % slides.length);
  };

  const goPrev = () => {
    setActiveIndex((current) => (current - 1 + slides.length) % slides.length);
  };

  const onTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.changedTouches[0]?.clientX ?? null;
  };

  const onTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null) return;

    const touchEndX = event.changedTouches[0]?.clientX ?? touchStartX.current;
    const delta = touchStartX.current - touchEndX;

    if (Math.abs(delta) < 40) {
      touchStartX.current = null;
      return;
    }

    if (delta > 0) {
      goNext();
    } else {
      goPrev();
    }

    touchStartX.current = null;
  };

  return (
    <section className="relative overflow-hidden border-b border-slate-200 bg-slate-950">
      <div
        className="flex transition-transform duration-700 ease-out"
        style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {slides.map((slide, index) => (
          <article key={slide.id} className="relative min-w-full">
            <div className="relative h-[70vh] min-h-[520px] w-full">
              <Image
                src={slide.imageUrl}
                alt={slide.title}
                fill
                priority={index === 0}
                sizes="100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/55 to-slate-900/20" />

              <div className="container relative z-10 mx-auto flex h-full items-center px-6">
                <div className="max-w-3xl">
                  <span className="inline-flex items-center rounded-full border border-blue-300/30 bg-blue-400/10 px-4 py-1 text-sm font-semibold text-blue-100">
                    Industrial B2B Marketplace
                  </span>
                  <h1 className="mt-6 text-4xl font-bold leading-tight text-white md:text-6xl">
                    {slide.title}
                  </h1>
                  <p className="mt-5 max-w-2xl text-base text-slate-200 md:text-lg">
                    {slide.subtitle}
                  </p>
                  <div className="mt-8">
                    <Link href={slide.ctaLink}>
                      <Button className="h-11 rounded-xl bg-blue-600 px-6 text-base font-semibold text-white hover:bg-blue-500">
                        {slide.ctaText}
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      {slides.length > 1 ? (
        <>
          <button
            type="button"
            onClick={goPrev}
            className="absolute left-6 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/30 bg-black/40 p-2 text-white backdrop-blur hover:bg-black/60"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={goNext}
            className="absolute right-6 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/30 bg-black/40 p-2 text-white backdrop-blur hover:bg-black/60"
            aria-label="Next slide"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                aria-label={`Go to slide ${index + 1}`}
                onClick={() => goTo(index)}
                className={`h-2.5 rounded-full transition-all ${
                  index === activeIndex ? 'w-8 bg-white' : 'w-2.5 bg-white/40 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        </>
      ) : null}
    </section>
  );
}
