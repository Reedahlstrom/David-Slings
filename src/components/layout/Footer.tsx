import { Copy, useSite } from "@/lib/storefront";
import { ArrowUpRight } from "lucide-react";
export default function Footer() {
  const {content}=useSite();
  return (
    <footer className="site-footer shell">
      <a className="wordmark" href="/">
        <Copy field="header.david-slings" /><span className="brand-dot">✳</span>
      </a>
      <p><Copy field="footer.a-little-less-screen-time-a-little-more-outside" /></p>
      <a href={`mailto:${content.contactEmail}`}>
        <Copy field="footer.say-hello" /> <ArrowUpRight size={15} />
      </a>
      <small>© {new Date().getFullYear()} <Copy field="footer.david-slings" /></small>
    </footer>
  );
}
