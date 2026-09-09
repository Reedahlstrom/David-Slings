import { Link, useLocation, useSearchParams } from "react-router-dom";
import { ArrowUpRight, Check, Package } from "lucide-react";
import { IS_PREVIEW, PRICE, useMedia } from "@/lib/storefront";
export default function CheckoutSuccess() {
  const [params] = useSearchParams();
  const { state } = useLocation();
  const { media } = useMedia();
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
          david slings<span className="brand-dot">✳</span>
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
            <p className="eyebrow">THIS IS THE ORDER CONFIRMATION DESIGN</p>
            <h1>Good times ahead.</h1>
            <p className="confirmation-description">
              Your sling’s next stop? Outside.
            </p>
            <div className="confirmation-product">
              <img
                src={media.hero}
                alt="David Sling illustration"
                width="1536"
                height="1024"
              />
              <div>
                <h2>{quantity} × The David Sling</h2>
                <p>${quantity * PRICE}.00 · Free shipping</p>
                <span>Sample order</span>
              </div>
            </div>
            <div className="confirmation-next">
              <Package size={21} />
              <div>
                <h2>Here’s what comes next.</h2>
                <p>
                  For a real order, we’ll confirm your purchase and send
                  tracking when your sling ships.
                </p>
              </div>
            </div>
            <p className="handwritten">Thanks for coming along.</p>
            <Link className="button" to="/">
              Back outside <ArrowUpRight size={18} />
            </Link>
            <Link className="restart-preview" to="/checkout">
              Try checkout again
            </Link>
          </>
        ) : (
          <>
            <span className="confirmation-check">
              <Package size={29} />
            </span>
            <h1>Checking on your order?</h1>
            <p className="confirmation-description">
              We can’t confirm a payment from this page yet. If you completed a
              purchase, check your receipt or get in touch and we’ll help.
            </p>
            <a className="button" href="mailto:contact@david-slings.com">
              Ask about your order <ArrowUpRight size={18} />
            </a>
            <Link className="restart-preview" to="/">
              Back to the slings
            </Link>
          </>
        )}
      </main>
    </div>
  );
}
