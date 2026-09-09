import BrandLogo from "@/components/BrandLogo";
import { Copy } from "@/lib/storefront";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
export default function Header() {
  return (
    <header className="site-header shell">
      <Link className="wordmark" to="/" aria-label="David Slings home">
        <BrandLogo />
      </Link>
      <nav aria-label="Main navigation">
        <a href="/#how-to"><Copy field="home.how-to-sling" /></a>
        <Link className="header-shop" to="/checkout">
          <Copy field="header.get-a-sling" /> <ArrowUpRight size={16} />
        </Link>
      </nav>
    </header>
  );
}
