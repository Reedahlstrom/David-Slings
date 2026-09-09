import { Copy } from "@/lib/storefront";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { ArrowUpRight, Check, Package } from "lucide-react";
import { IS_PREVIEW, useMedia } from "@/lib/storefront";
export default function CheckoutSuccess() {
  const [params] = useSearchParams();
  const { state } = useLocation();
  const { media, content } = useMedia();
  const PRICE = content.price;
  const preview =
    IS_PREVIEW && params.get("preview") === "1" && state?.preview === true;
  const quantity =
    Number.isInteger(state?.quantity) &&
    state.quantity > 0 &&
    state.quantity <= 10
      ? state.quantity
      : 1;
  return (
    <div className="confirmation-page">
      <header className="checkout-header shell">
        <Link className="wordmark" to="/">
          <Copy field="header.david-slings" /><span className="brand-dot">✳</span>
        </Link>
      </header>
      <main className="confirmation-card">
        {preview ? (
          <>
            <p className="preview-notice">
              Preview complete. No order was placed or payment taken.
            </p>
            <span className="confirmation-check">
              <Check size={29} />
            </span>
            <p className="eyebrow"><Copy field="confirmation.this-is-the-order-confirmation-design" /></p>
            <h1><Copy field="confirmation.good-times-ahead" /></h1>
            <p className="confirmation-description">
              <Copy field="confirmation.your-sling-s-next-stop-outside" /></p>
            <div className="confirmation-product">
              <img
                src={media.product}
                alt="David Sling illustration"
                width="1536"
                height="1024"
              />
              <div>
                <h2>{quantity} <Copy field="confirmation.the-david-sling" /></h2>
                <p>${quantity * PRICE}<Copy field="confirmation.00-free-shipping" /></p>
                <span><Copy field="confirmation.sample-order" /></span>
              </div>
            </div>
            <div className="confirmation-next">
              <Package size={21} />
              <div>
                <h2><Copy field="confirmation.here-s-what-comes-next" /></h2>
                <p>
                  For a real order, we’ll confirm your purchase and send
                  tracking when your sling ships.
                </p>
              </div>
            </div>
            <p className="handwritten"><Copy field="confirmation.thanks-for-coming-along" /></p>
            <Link className="button" to="/">
              <Copy field="confirmation.back-outside" /> <ArrowUpRight size={18} />
            </Link>
            <Link className="restart-preview" to="/checkout">
              <Copy field="confirmation.try-checkout-again" /></Link>
          </>
        ) : (
          <>
            <span className="confirmation-check">
              <Package size={29} />
            </span>
            <h1><Copy field="confirmation.checking-on-your-order" /></h1>
            <p className="confirmation-description">
              We can’t confirm a payment from this page yet. If you completed a
              purchase, check your receipt or get in touch and we’ll help.
            </p>
            <a className="button" href={`mailto:${content.contactEmail}`}>
              <Copy field="confirmation.ask-about-your-order" /> <ArrowUpRight size={18} />
            </a>
            <Link className="restart-preview" to="/">
              <Copy field="confirmation.back-to-the-slings" /></Link>
          </>
        )}
      </main>
    </div>
  );
}
