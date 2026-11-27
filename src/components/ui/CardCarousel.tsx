"use client";

import { Children, useCallback, useEffect, useRef, useState, type ReactNode } from "react";

interface CardCarouselProps {
  /** Names the list for screen readers, e.g. "Live matches". */
  label: string;
  /** One card per child. Give each a key. */
  children: ReactNode;
}

const buttonClass =
  "flex size-9 cursor-pointer items-center justify-center rounded-[4px] border border-tuna bg-white text-base font-bold text-ink transition-colors hover:border-ink disabled:cursor-default disabled:border-line disabled:text-muted disabled:opacity-50";

/**
 * Cards in one row that scrolls sideways: three in view on desktop, two on tablets, and one plus the edge
 * of the next on phones. The arrows move one card at a time; swiping and trackpads work as usual.
 */
export function CardCarousel({ label, children }: CardCarouselProps) {
  const track = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });
  const count = Children.count(children);

  const measure = useCallback(() => {
    const element = track.current;

    if (!element) {
      return;
    }

    // A pixel of slack: zoomed screens report fractional scroll positions.
    const start = element.scrollLeft <= 1;
    const end = element.scrollLeft + element.clientWidth >= element.scrollWidth - 1;

    setEdges((current) => (current.start === start && current.end === end ? current : { start, end }));
  }, []);

  // Observing again when the number of cards changes also measures again.
  useEffect(() => {
    const element = track.current;

    if (!element) {
      return;
    }

    const observer = new ResizeObserver(measure);
    observer.observe(element);

    return () => observer.disconnect();
  }, [measure, count]);

  const move = (direction: 1 | -1) => {
    const element = track.current;
    const card = element?.firstElementChild;

    if (element && card) {
      const gap = parseFloat(getComputedStyle(element).columnGap) || 0;
      element.scrollBy({ left: direction * (card.getBoundingClientRect().width + gap) });
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-end gap-2">
        <button type="button" aria-label="Previous matches" disabled={edges.start} onClick={() => move(-1)} className={buttonClass}>
          <span aria-hidden="true">←</span>
        </button>
        <button type="button" aria-label="Next matches" disabled={edges.end} onClick={() => move(1)} className={buttonClass}>
          <span aria-hidden="true">→</span>
        </button>
      </div>

      {/* The padding leaves room for each card's focus ring and shadow, which scrolling would clip. */}
      <ul
        ref={track}
        aria-label={label}
        onScroll={measure}
        className="-m-1 flex snap-x snap-mandatory scroll-px-1 [scrollbar-width:none] gap-4 overflow-x-auto scroll-smooth p-1 motion-reduce:scroll-auto [&::-webkit-scrollbar]:hidden"
      >
        {Children.map(children, (child) => (
          <li className="w-[85%] shrink-0 snap-start md:w-[calc((100%-16px)/2)] lg:w-[calc((100%-32px)/3)]">
            {child}
          </li>
        ))}
      </ul>
    </div>
  );
}
