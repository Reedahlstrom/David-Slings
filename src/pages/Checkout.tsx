import { Copy, useCopy } from "@/lib/storefront";
import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronRight,
  CreditCard,
  Camera,
  LockKeyhole,
  Minus,
  Plus,
  Truck,
} from "lucide-react";
import { IS_PREVIEW, useMedia } from "@/lib/storefront";

interface Shipping {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  apartment: string;
  city: string;
  state: string;
  postal: string;
  country: string;
}
const empty: Shipping = {
  email: "",
  firstName: "",
  lastName: "",
  address: "",
  apartment: "",
  city: "",
  state: "",
  postal: "",
  country: "US",
};
export default function Checkout() {
  const t = useCopy();
  const { media, content } = useMedia();
  const PRICE = content.price;
  const [params] = useSearchParams();
  const requested = Number(params.get("quantity") ?? 1);
  const [quantity, setQuantity] = useState(
    Number.isInteger(requested) ? Math.min(10, Math.max(1, requested)) : 1,
  );
  const [step, setStep] = useState(0);
  const [shipping, setShipping] = useState<Shipping>(empty);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  function field(key: keyof Shipping) {
    return {
      value: shipping[key],
      onChange: (
        event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
      ) => setShipping({ ...shipping, [key]: event.target.value }),
    };
  }
  function next(event: FormEvent) {
    event.preventDefault();
    const required: (keyof Shipping)[] = [
      "email",
      "firstName",
      "lastName",
      "address",
      "city",
      "state",
      "postal",
    ];
    if (required.some((key) => !shipping[key].trim())) {
      setError("Please fill in each required field.");
      return;
    }
    setError("");
    setStep(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  async function completePreview() {
    if (!IS_PREVIEW) {
      setError("Online checkout isn’t open yet. Please check back soon.");
      return;
    }
    setBusy(true);
    navigate("/success?preview=1", {
      state: { preview: true, quantity, email: shipping.email },
    });
  }
  return (
    <div className="checkout-page">
      <header className="checkout-header shell">
        <Link className="wordmark" to="/">
          <Copy field="header.david-slings" /><span className="brand-dot">✳</span>
        </Link>
        <span>
          <LockKeyhole size={14} />
          {IS_PREVIEW ? "Checkout preview" : "Checkout"}
        </span>
      </header>
      <main className="checkout-grid shell">
        <div className="checkout-main">
          <Link className="back-link" to="/#sling">
            <ArrowLeft size={15} />
            <Copy field="checkout.back-to-the-sling" /></Link>
          <nav className="checkout-steps" aria-label="Checkout progress">
            {[t("checkout.shipping"), t("checkout.review-step"), t("checkout.payment-step")].map((label, i) => (
              <span
                key={label}
                className={step === i ? "current" : step > i ? "complete" : ""}
                aria-current={step === i ? "step" : undefined}
              >
                <button
                  disabled={i > step}
                  onClick={() => {
                    setStep(i);
                    setError("");
                  }}
                >
                  <span className="step-dot">
                    {i < step ? <Check size={12} /> : i + 1}
                  </span>
                  {label}
                </button>
                {i < 2 && <ChevronRight size={13} />}
              </span>
            ))}
          </nav>
          {IS_PREVIEW && (
            <div className="preview-notice">
              Just a walkthrough. No payment or order will be placed.
            </div>
          )}
          {step === 0 && (
            <form className="shipping-form" onSubmit={next}>
              <h1><Copy field="checkout.where-s-it-headed" /></h1>
              <p className="checkout-subtitle">
                <Copy field="checkout.a-few-details-and-you-re-on-your-way-outside" /></p>
              <h2 className="form-heading"><Copy field="checkout.your-email" /></h2>
              <label>
                <Copy field="checkout.email-address" /><input
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  required
                  maxLength={254}
                  {...field("email")}
                />
              </label>
              <p className="field-note"><Copy field="checkout.for-your-receipt-and-order-updates" /></p>
              <h2 className="form-heading shipping-heading">
                <Copy field="checkout.shipping-address" /></h2>
              <div className="field-grid">
                <label>
                  <Copy field="checkout.first-name" /><input
                    name="given-name"
                    autoComplete="given-name"
                    required
                    maxLength={80}
                    {...field("firstName")}
                  />
                </label>
                <label>
                  <Copy field="checkout.last-name" /><input
                    name="family-name"
                    autoComplete="family-name"
                    required
                    maxLength={80}
                    {...field("lastName")}
                  />
                </label>
                <label className="full-width">
                  <Copy field="checkout.country" /><select
                    name="country"
                    autoComplete="country"
                    {...field("country")}
                  >
                    <option value="US">{t("checkout.united-states")}</option>
                    <option value="CA">{t("checkout.canada")}</option>
                  </select>
                </label>
                <label className="full-width">
                  <Copy field="checkout.street-address" /><input
                    name="address-line1"
                    autoComplete="address-line1"
                    required
                    maxLength={200}
                    {...field("address")}
                  />
                </label>
                <label className="full-width">
                  <Copy field="checkout.apartment-suite-etc" />{" "}
                  <span className="optional"><Copy field="checkout.optional" /></span>
                  <input
                    name="address-line2"
                    autoComplete="address-line2"
                    maxLength={100}
                    {...field("apartment")}
                  />
                </label>
                <label className="full-width">
                  <Copy field="checkout.city" /><input
                    name="address-level2"
                    autoComplete="address-level2"
                    required
                    maxLength={100}
                    {...field("city")}
                  />
                </label>
                <label>
                  {shipping.country === "CA" ? t("checkout.province") : t("checkout.state")}
                  <input
                    name="address-level1"
                    autoComplete="address-level1"
                    required
                    maxLength={80}
                    {...field("state")}
                  />
                </label>
                <label>
                  {shipping.country === "CA" ? t("checkout.postal-code") : t("checkout.zip-code")}
                  <input
                    name="postal-code"
                    autoComplete="postal-code"
                    required
                    maxLength={12}
                    pattern={
                      shipping.country === "US"
                        ? "[0-9]{5}(-[0-9]{4})?"
                        : "[A-Za-z][0-9][A-Za-z] ?[0-9][A-Za-z][0-9]"
                    }
                    title={
                      shipping.country === "US"
                        ? "Enter a 5-digit ZIP code, optionally followed by four more digits."
                        : "Enter a Canadian postal code, such as A1A 1A1."
                    }
                    {...field("postal")}
                  />
                </label>
              </div>
              <div className="shipping-method">
                <Truck size={20} />
                <span>
                  <Copy field="checkout.standard-shipping" /><small><Copy field="checkout.to-your-door-on-us" /></small>
                </span>
                <strong><Copy field="checkout.free" /></strong>
                <Check size={17} />
              </div>
              {error && (
                <p className="error-message" role="alert">
                  {error}
                </p>
              )}
              <button className="button full-button" type="submit">
                <Copy field="checkout.review-your-order" /> <ArrowRight size={17} />
              </button>
            </form>
          )}
          {step === 1 && (
            <section className="review-panel">
              <h1><Copy field="checkout.looking-good" /></h1>
              <p className="checkout-subtitle">
                <Copy field="checkout.give-everything-a-quick-look-before-the-last-step" /></p>
              <div className="review-block">
                <div>
                  <h2><Copy field="checkout.your-email" /></h2>
                  <button className="edit-link" onClick={() => setStep(0)}>
                    <Copy field="checkout.edit" /></button>
                </div>
                <p>{shipping.email}</p>
              </div>
              <div className="review-block">
                <div>
                  <h2><Copy field="checkout.send-it-here" /></h2>
                  <button className="edit-link" onClick={() => setStep(0)}>
                    <Copy field="checkout.edit" /></button>
                </div>
                <address>
                  {shipping.firstName} {shipping.lastName}
                  <br />
                  {shipping.address}
                  <br />
                  {shipping.apartment && (
                    <>
                      {shipping.apartment}
                      <br />
                    </>
                  )}
                  {shipping.city}, {shipping.state} {shipping.postal}
                  <br />
                  {shipping.country === "US" ? "United States" : "Canada"}
                </address>
              </div>
              <div className="review-block">
                <div>
                  <h2><Copy field="checkout.shipping" /></h2>
                  <strong><Copy field="checkout.free" /></strong>
                </div>
                <p><Copy field="checkout.standard-shipping" /></p>
              </div>
              <button
                className="button full-button"
                onClick={() => {
                  setStep(2);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                <Copy field="checkout.continue-to-payment" /> <ArrowRight size={17} />
              </button>
            </section>
          )}
          {step === 2 && (
            <section className="payment-panel">
              <h1><Copy field="checkout.the-last-little-bit" /></h1>
              <p className="checkout-subtitle">
                <Copy field="checkout.then-it-s-time-to-find-some-open-space" /></p>
              <div className="payment-option">
                <CreditCard size={20} />
                <strong><Copy field="checkout.pay-by-card" /></strong>
                <Check size={17} />
              </div>
              {IS_PREVIEW ? (
                <>
                  <div className="sample-card">
                    <div>
                      <span><Copy field="checkout.payment-preview" /></span>
                      <CreditCard size={25} />
                    </div>
                    <p><Copy field="checkout.nbsp-nbsp-nbsp-4242" /></p>
                    <small><Copy field="checkout.sample-card-no-real-card-details-needed" /></small>
                  </div>
                  <p className="payment-explanation">
                    This is a sample payment screen. The live store will use
                    Stripe’s secure checkout for card details.
                  </p>
                  <button
                    className="button full-button"
                    onClick={completePreview}
                    disabled={busy}
                  >
                    {busy ? "One second…" : "Finish checkout preview"}
                    <ArrowRight size={17} />
                  </button>
                  <p className="field-note centered">
                    Nothing will be charged.
                  </p>
                </>
              ) : (
                <div className="preview-notice">
                  Online payments are being set up. Please check back soon.
                </div>
              )}
              {error && (
                <p className="error-message" role="alert">
                  {error}
                </p>
              )}
              <button className="back-step" onClick={() => setStep(1)}>
                <ArrowLeft size={14} />
                <Copy field="checkout.back-to-your-details" /></button>
            </section>
          )}
        </div>
        <aside className="order-summary" aria-label="Order summary">
          <p className="eyebrow"><Copy field="checkout.coming-along-for-the-ride" /></p>
          <div className="summary-product">
            <div className="summary-image">
              <img
                src={media.product}
                alt="The David Sling"
                width="1536"
                height="1024"
              />
              <span
                className="summary-quantity-badge"
                aria-label={`${quantity} ${quantity === 1 ? "sling" : "slings"}`}
              >
                {quantity}
              </span>
            </div>
            <div className="summary-product-details">
              <h2><Copy field="home.the-david-sling" /></h2>
              <p><Copy field="checkout.leather-paracord" /></p>
              <span>${PRICE}<Copy field="checkout.00-each" /></span>
            </div>
          </div>
          <div className="summary-quantity">
            <span><Copy field="checkout.quantity" /></span>
            <div className="quantity-control">
              <button
                aria-label="Remove one sling"
                disabled={quantity === 1}
                onClick={() => setQuantity(quantity - 1)}
              >
                <Minus size={14} />
              </button>
              <output aria-live="polite">{quantity}</output>
              <button
                aria-label="Add one sling"
                disabled={quantity === 10}
                onClick={() => setQuantity(quantity + 1)}
              >
                <Plus size={14} />
              </button>
            </div>
          </div>
          <dl className="order-totals">
            <div>
              <dt><Copy field="checkout.subtotal" /></dt>
              <dd>${(PRICE * quantity).toFixed(2)}</dd>
            </div>
            <div>
              <dt><Copy field="checkout.shipping" /></dt>
              <dd><Copy field="checkout.free" /></dd>
            </div>
            <div>
              <dt><Copy field="checkout.tax" /></dt>
              <dd className="tax-note">
                {IS_PREVIEW
                  ? "Not included in preview"
                  : "Calculated at payment"}
              </dd>
            </div>
            <div className="total">
              <dt>{IS_PREVIEW ? "Preview total" : "Total before tax"}</dt>
              <dd>
                <small><Copy field="checkout.usd" /></small> ${(PRICE * quantity).toFixed(2)}
              </dd>
            </div>
          </dl>
          <p className="handwritten summary-note"><Copy field="checkout.good-afternoons-ahead" /></p>
          <a
            className="slinging-club-link"
            href={content.instagram}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Camera size={17} aria-hidden="true" />
            <Copy field="checkout.join-the-slinging-club" /><ArrowUpRight size={15} aria-hidden="true" />
          </a>
          <div className="checkout-help">
            <Copy field="checkout.need-a-hand" />{" "}
            <a href={`mailto:${content.contactEmail}`}><Copy field="checkout.say-hello" /></a>
          </div>
        </aside>
      </main>
      <footer className="checkout-footer shell">
        <span>© {new Date().getFullYear()} <Copy field="footer.david-slings" /></span>
        <a href={`mailto:${content.contactEmail}`}><Copy field="checkout.questions-we-re-around" /></a>
      </footer>
    </div>
  );
}
