import { useSite } from '@/lib/storefront';

export default function BrandLogo() {
  const { media } = useSite();
  const source = media.logo || '/images/david-slings-logo.png';
  // Frame the supplied artwork without changing the original image file.
  if (source === '/images/david-slings-logo.png') {
    return <svg className="brand-logo" viewBox="150 320 1020 680" role="img" aria-label="David Slings">
      <image href={source} width="1254" height="1254" />
    </svg>;
  }
  return <img className="brand-logo" src={source} alt="David Slings" />;
}
