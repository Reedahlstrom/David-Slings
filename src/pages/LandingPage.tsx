import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  Minus,
  Plus,
  Play,
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { PRICE, IS_PREVIEW, useMedia, videoEmbed } from "@/lib/storefront";

export default function LandingPage() {
  const { media } = useMedia();
  const track = useRef<HTMLDivElement>(null);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [playing, setPlaying] = useState(false);
  const embed = videoEmbed(media.video);
  function movePhoto(direction: number) {
    const next = Math.max(
      0,
      Math.min(media.photos.length - 1, photoIndex + direction),
    );
    const target = track.current?.children[next] as HTMLElement | undefined;
    if (target && track.current)
      track.current.scrollTo({
        left:
          target.offsetLeft -
          (track.current.children[0] as HTMLElement).offsetLeft,
        behavior: "smooth",
      });
  }
  return (
    <>
      <Header />
      <main>
        <section className="hero shell" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow">
              <span className="tiny-sun">✳</span> MADE BY HAND. MEANT FOR
              OUTSIDE.
            </p>
            <h1 id="hero-title">
              Go throw
              <br />
              some rocks<span className="period">.</span>
            </h1>
            <p className="hero-description">
              A leather pouch. Two cords. A really good
              <br className="desktop-break" /> reason to put your phone down.
            </p>
            <div className="hero-actions">
              <a className="button" href="#sling">
                Get your sling <span>${PRICE}</span>
                <ArrowUpRight size={19} />
              </a>
              <a className="text-link" href="#how-to">
                How does it work? <ArrowDown size={15} />
              </a>
            </div>
            <p className="handwritten hero-note">Simple stuff. Good times.</p>
          </div>
          <div className="hero-art">
            <div className="art-label">THE ORIGINAL SHEPHERD’S SLING</div>
            <img
              src={media.hero}
              alt="Illustration of a leather pouch and paracord shepherd sling"
              fetchPriority="high"
              width="1536"
              height="1024"
            />
            <div className="art-bottom">
              <span>Leather + paracord</span>
              <span className="handwritten">Made for a good afternoon ↗</span>
            </div>
          </div>
        </section>
        <section className="photo-section" aria-label="A little time outside">
          <div className="section-intro shell">
            <p className="eyebrow">LESS SCROLLING. MORE SLINGING.</p>
            <div className="carousel-controls">
              <span aria-live="polite">
                {String(photoIndex + 1).padStart(2, "0")} /{" "}
                {String(media.photos.length).padStart(2, "0")}
              </span>
              <button
                aria-label="Previous photo"
                onClick={() => movePhoto(-1)}
                disabled={photoIndex === 0}
              >
                <ArrowLeft size={18} />
              </button>
              <button
                aria-label="Next photo"
                onClick={() => movePhoto(1)}
                disabled={photoIndex === media.photos.length - 1}
              >
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
          <div
            className="photo-track"
            ref={track}
            tabIndex={0}
            aria-label="Photo carousel. Swipe or use the arrow buttons."
            onScroll={() => {
              const el = track.current;
              if (el && el.children[0])
                setPhotoIndex(
                  Math.min(
                    media.photos.length - 1,
                    Math.round(
                      el.scrollLeft /
                        ((el.children[0] as HTMLElement).offsetWidth + 22),
                    ),
                  ),
                );
            }}
          >
            {media.photos.map((photo, i) => (
              <figure
                className="photo-card"
                key={`${photo.src.slice(0, 80)}-${i}`}
              >
                <div
                  className={`photo-frame ${photo.src.includes("illustration") ? "is-illustration" : ""}`}
                >
                  <img
                    src={photo.src}
                    alt={photo.alt}
                    loading="lazy"
                    width="1000"
                    height="700"
                  />
                </div>
                <figcaption>
                  <span className="photo-number">0{i + 1}</span>
                  {photo.caption}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
        <section
          className="product-section shell"
          id="sling"
          aria-labelledby="product-title"
        >
          <div className="product-visual">
            <img
              src={media.hero}
              alt="The simple leather and paracord sling design"
              loading="lazy"
              width="1536"
              height="1024"
            />
            <span className="handwritten product-note">
              Yep, that’s the whole thing.
            </span>
          </div>
          <div className="product-copy">
            <p className="eyebrow">ONE SLING. ENDLESS AFTERNOONS.</p>
            <div className="product-title-row">
              <h2 id="product-title">The David Sling</h2>
              <span className="product-price">${PRICE}</span>
            </div>
            <p>
              A handmade shepherd’s sling, made from leather and paracord. Small
              enough for your pocket. Way more fun outside of it.
            </p>
            <ul className="product-details">
              <li>
                <Check size={15} />
                Leather pouch & paracord
              </li>
              <li>
                <Check size={15} />
                Made by hand
              </li>
              <li>
                <Check size={15} />
                No batteries. Obviously.
              </li>
            </ul>
            <div className="buy-row">
              <div className="quantity-control" aria-label="Sling quantity">
                <button
                  disabled={quantity === 1}
                  onClick={() => setQuantity(quantity - 1)}
                  aria-label="One fewer sling"
                >
                  <Minus size={16} />
                </button>
                <output aria-live="polite">{quantity}</output>
                <button
                  disabled={quantity === 10}
                  onClick={() => setQuantity(quantity + 1)}
                  aria-label="One more sling"
                >
                  <Plus size={16} />
                </button>
              </div>
              <Link className="button" to={`/checkout?quantity=${quantity}`}>
                Get {quantity === 1 ? "a sling" : `${quantity} slings`}{" "}
                <span>${PRICE * quantity}</span>
                <ArrowUpRight size={18} />
              </Link>
            </div>
            <p className="small-note">Free shipping. Just pick a good spot.</p>
          </div>
        </section>
        <section
          className="how-section shell"
          id="how-to"
          aria-labelledby="how-title"
        >
          <div className="how-heading">
            <div>
              <p className="eyebrow">A LITTLE PRACTICE GOES A LONG WAY.</p>
              <h2 id="how-title">Get the hang of it.</h2>
            </div>
            <p>
              Your first throw probably won’t be your best.
              <br />
              That’s kind of the fun of it.
            </p>
          </div>
          <div className="video-panel">
            {embed && playing ? (
              <iframe
                src={`${embed}?autoplay=1`}
                title="How to use your David Sling"
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <>
                <img
                  src={
                    media.photos.find(
                      (photo) => !photo.src.includes("illustration"),
                    )?.src ?? media.hero
                  }
                  alt="A quiet afternoon outdoors"
                  loading="lazy"
                  width="1500"
                  height="850"
                />
                <div className="video-shade" />
                <div className="video-center">
                  {embed ? (
                    <button
                      className="play-button"
                      aria-label="Play how to sling video"
                      onClick={() => setPlaying(true)}
                    >
                      <Play size={26} fill="currentColor" />
                    </button>
                  ) : (
                    <span
                      className="play-button unavailable"
                      aria-hidden="true"
                    >
                      <Play size={26} />
                    </span>
                  )}
                  <h3>How to sling</h3>
                  <p>
                    {embed
                      ? "Watch the basics. Then head outside."
                      : "We’re putting a little how-to together. Stay tuned."}
                  </p>
                </div>
                <span className="video-corner">DAVID SLINGS / FIELD NOTES</span>
              </>
            )}
          </div>
          <p className="safety-note">
            Find a wide-open space. Keep people, animals, and anything breakable
            well clear. Younger slingers need an adult along.
          </p>
        </section>
        <section className="closing shell">
          <span className="closing-star" aria-hidden="true">
            ✳
          </span>
          <h2>See you outside.</h2>
          <Link className="text-link" to="/checkout">
            Bring a sling <ArrowUpRight size={18} />
          </Link>
        </section>
      </main>
      <Footer />
      {IS_PREVIEW && (
        <div className="preview-tools">
          <span>Design preview</span>
          <Link to="/studio">
            Add your photos <ArrowUpRight size={13} />
          </Link>
        </div>
      )}
    </>
  );
}
