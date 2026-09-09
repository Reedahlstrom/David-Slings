import { ArrowUpRight } from "lucide-react";
export default function Footer() {
  return (
    <footer className="site-footer shell">
      <a className="wordmark" href="/">
        david slings<span className="brand-dot">✳</span>
      </a>
      <p>A little less screen time. A little more outside.</p>
      <a href="mailto:contact@david-slings.com">
        Say hello <ArrowUpRight size={15} />
      </a>
      <small>© {new Date().getFullYear()} David Slings</small>
    </footer>
  );
}
