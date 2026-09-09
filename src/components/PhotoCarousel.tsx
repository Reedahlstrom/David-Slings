import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Pause, Play } from 'lucide-react';
import { Copy, useSite } from '@/lib/storefront';

export default function PhotoCarousel() {
  const { content: { media }, editing } = useSite();
  const track = useRef<HTMLDivElement>(null);
  const section = useRef<HTMLElement>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const hovered = useRef(false), focused = useRef(false), touching = useRef(false);
  const manualUntil = useRef(0);
  const count = media.photos.length;
  const looping = count > 1;

  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setPaused(preference.matches);
    sync(); preference.addEventListener('change', sync);
    return () => preference.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    const el = track.current;
    if (!el || !looping) return;
    const reset = () => {
      const first = el.children[0] as HTMLElement;
      const middle = el.children[count * 2] as HTMLElement;
      el.scrollLeft = middle.offsetLeft - first.offsetLeft;
      setIndex(0);
    };
    reset();
    const resize = new ResizeObserver(reset);
    resize.observe(el);
    return () => resize.disconnect();
  }, [count, looping]);

  useEffect(() => {
    const el = track.current;
    if (!el || !section.current || !looping) return;
    let visible = false, frame = 0, previous = 0, remainder = 0;
    const observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; }, { threshold: 0.1 });
    observer.observe(section.current);
    const tick = (now: number) => {
      const delta = previous ? Math.min(now - previous, 50) : 0;
      previous = now;
      if (visible && !document.hidden && !paused && !editing && !hovered.current && !focused.current && !touching.current && now > manualUntil.current) {
        remainder += delta * 0.028;
        const pixels = Math.floor(remainder);
        remainder -= pixels;
        el.scrollLeft += pixels;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); };
  }, [looping, paused, editing]);

  function onScroll() {
    const el = track.current;
    if (!el || !looping) return;
    const first = el.children[0] as HTMLElement;
    const next = el.children[1] as HTMLElement;
    const step = next.offsetLeft - first.offsetLeft;
    const cycle = step * count;
    if (!cycle) return;
    // Identical copies on both sides make the reset invisible, including while swiping.
    if (el.scrollLeft >= cycle * 3) el.scrollLeft -= cycle;
    else if (el.scrollLeft < cycle) el.scrollLeft += cycle;
    setIndex(Math.floor((el.scrollLeft + 1) / step) % count);
  }
  function move(direction: number) {
    const el = track.current;
    if (!el || !looping) return;
    manualUntil.current = performance.now() + 4000;
    const step = (el.children[1] as HTMLElement).offsetLeft - (el.children[0] as HTMLElement).offsetLeft;
    const slot = direction > 0 ? Math.floor((el.scrollLeft + 1) / step) + 1 : Math.ceil((el.scrollLeft - 1) / step) - 1;
    el.scrollTo({ left: slot * step, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }
  return <section ref={section} className="photo-section" aria-label="A little time outside">
    <div className="section-intro shell">
      <p className="eyebrow"><Copy field="home.less-scrolling-more-slinging" /></p>
      <div className="carousel-controls">
        <span>{String(index + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}</span>
        {looping && <button aria-label={paused ? 'Play photo carousel' : 'Pause photo carousel'} onClick={() => setPaused(value => !value)}>{paused ? <Play size={15} /> : <Pause size={15} />}</button>}
        <button aria-label="Previous photo" onClick={() => move(-1)} disabled={!looping}><ArrowLeft size={18} /></button>
        <button aria-label="Next photo" onClick={() => move(1)} disabled={!looping}><ArrowRight size={18} /></button>
      </div>
    </div>
    <div className="photo-track photo-track-loop" ref={track} tabIndex={0} aria-label="Photo carousel. Swipe or use the arrow buttons."
      onScroll={onScroll}
      onPointerEnter={event => { if (event.pointerType === 'mouse') hovered.current = true; }}
      onPointerLeave={() => { hovered.current = false; touching.current = false; }}
      onPointerDown={() => { touching.current = true; }}
      onPointerUp={() => { touching.current = false; manualUntil.current = performance.now() + 4000; }}
      onPointerCancel={() => { touching.current = false; manualUntil.current = performance.now() + 4000; }}
      onWheel={() => { manualUntil.current = performance.now() + 4000; }}
      onFocus={() => { focused.current = true; }} onBlur={() => { focused.current = false; }}
      onKeyDown={event => { if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); move(event.key === 'ArrowRight' ? 1 : -1); } }}>
      {Array.from({ length: looping ? 5 : 1 }, (_, copy) => media.photos.map((photo, i) => {
        const duplicate = looping && copy !== 2;
        return <figure className="photo-card" key={`${copy}-${i}-${photo.src}`} aria-hidden={duplicate || undefined}>
          <div className="photo-frame"><img src={photo.src} alt={duplicate ? '' : photo.alt} style={{ objectPosition: `50% ${photo.position}%` }} loading="lazy" decoding="async" width="1000" height="700" /></div>
        </figure>;
      }))}
    </div>
  </section>;
}
