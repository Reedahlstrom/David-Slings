import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
export default function Header() {
  return (
    <header className="site-header shell">
      <Link className="wordmark" to="/" aria-label="David Slings home">
        david slings<span className="brand-dot">✳</span>
      </Link>
      <nav aria-label="Main navigation">
        <a href="/#how-to">How to sling</a>
        <Link className="header-shop" to="/checkout">
          Get a sling <ArrowUpRight size={16} />
        </Link>
      </nav>
    </header>
  );
}
