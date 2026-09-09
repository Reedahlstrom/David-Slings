import { Copy, Section, useCopy } from "@/lib/storefront";
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowDown,
  ArrowUpRight,
  Check,
  Minus,
  Plus,
  Play,
} from "lucide-react";
import PhotoCarousel from "@/components/PhotoCarousel";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useMedia, videoEmbed } from "@/lib/storefront";

export default function LandingPage() {
  const t=useCopy();
  const { media, content } = useMedia();
  const PRICE = content.price;
  const [quantity, setQuantity] = useState(1);
  const [playing, setPlaying] = useState(false);
  const embed = videoEmbed(media.video);
  const sections: Record<string, React.ReactNode> = {
    photos: <Section key="photos" name="photos"><PhotoCarousel /></Section>,
    product: <Section key="product" name="product"><section
          className="product-section shell"
          id="sling"
          aria-labelledby="product-title"
        >
          <div className="product-visual">
            <img
              src={media.product}
              alt={media.productAlt}
              style={{objectPosition:`50% ${media.productPosition}%`}}
              loading="lazy"
              width="1536"
              height="1024"
            />
            <span className="handwritten product-note">
              <Copy field="home.yep-that-s-the-whole-thing" /></span>
          </div>
          <div className="product-copy">
            <p className="eyebrow"><Copy field="home.one-sling-endless-afternoons" /></p>
            <div className="product-title-row">
              <h2 id="product-title"><Copy field="home.the-david-sling" /></h2>
              <span className="product-price">${PRICE}</span>
            </div>
            <p>
              <Copy field="home.a-handmade-shepherd-s-sling-made-from-leather-and-parac" /></p>
            <ul className="product-details">
              <li>
                <Check size={15} />
                <Copy field="home.leather-pouch-paracord" /></li>
              <li>
                <Check size={15} />
                <Copy field="home.made-by-hand" /></li>
              <li>
                <Check size={15} />
                <Copy field="home.no-batteries-obviously" /></li>
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
                <Copy field="home.get" /> {quantity === 1 ? t("home.sling-single") : `${quantity} ${t("home.sling-plural")}`}{" "}
                <span>${PRICE * quantity}</span>
                <ArrowUpRight size={18} />
              </Link>
            </div>
            <p className="small-note"><Copy field="home.free-shipping-just-pick-a-good-spot" /></p>
          </div>
        </section>
        </Section>,
    video: <Section key="video" name="video"><section
          className="how-section shell"
          id="how-to"
          aria-labelledby="how-title"
        >
          <div className="how-heading">
            <div>
              <p className="eyebrow"><Copy field="home.a-little-practice-goes-a-long-way" /></p>
              <h2 id="how-title"><Copy field="home.get-the-hang-of-it" /></h2>
            </div>
            <p>
              <Copy field="home.your-first-throw-probably-won-t-be-your-best" /><br />
              <Copy field="home.that-s-kind-of-the-fun-of-it" /></p>
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
                  src={media.poster}
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
                  <h3><Copy field="home.how-to-sling" /></h3>
                  <p>
                    {embed
                      ? t("home.video-ready")
                      : t("home.video-soon")}
                  </p>
                </div>
                <span className="video-corner"><Copy field="home.david-slings-field-notes" /></span>
              </>
            )}
          </div>
          <p className="safety-note">
            <Copy field="home.find-a-wide-open-space-keep-people-animals-and-anything" /></p>
        </section>
        </Section>,
    closing: <Section key="closing" name="closing"><section className="closing shell">
          <h2><Copy field="home.see-you-outside" /></h2>
          <Link className="text-link" to="/checkout">
            <Copy field="home.bring-a-sling" /> <ArrowUpRight size={18} />
          </Link>
        </section>
      </Section>,
  };
  return (
    <>
      <Header />
      <main className="storefront-sections">
        <section className="hero shell" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow">
              <Copy field="home.made-by-hand-meant-for-outside" /></p>
            <h1 id="hero-title"><Copy field="home.made-for-a-good-time" /></h1>
            <p className="hero-description"><Copy field="home.a-leather-pouch-two-cords" /></p>
            <div className="hero-actions">
              <a className="button" href={content.hiddenSections.includes("product")?"/checkout":"#sling"}>
                <Copy field="home.get-your-sling" /> <span>${PRICE}</span>
                <ArrowUpRight size={19} />
              </a>
              <a className="text-link" href="#how-to">
                <Copy field="home.how-does-it-work" /> <ArrowDown size={15} />
              </a>
            </div>
            <p className="handwritten hero-note"><Copy field="home.go-sling" /></p>
          </div>
          <div className="hero-art">
            <div className="art-label"><Copy field="home.the-original-shepherd-s-sling" /></div>
            <img
              src={media.hero}
              alt={media.heroAlt}
              style={{objectPosition:`50% ${media.heroPosition}%`}}
              fetchPriority="high"
              width="1536"
              height="1024"
            />
            <div className="art-bottom">
              <span><Copy field="home.leather-paracord" /></span>
              <span className="handwritten"><Copy field="home.made-for-a-good-afternoon" /></span>
            </div>
          </div>
        </section>
        {content.sections.map(name=>sections[name])}</main>
      <Footer />

    </>
  );
}
