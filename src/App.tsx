import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import LandingPage from "./pages/LandingPage";
import { MediaProvider } from "./lib/storefront";
import SiteEditor from "./components/SiteEditor";
const Checkout = lazy(() => import("./pages/Checkout"));
const MediaStudio = lazy(() => import("./pages/MediaStudio"));
const CheckoutSuccess = lazy(() => import("./pages/CheckoutSuccess"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const frame = requestAnimationFrame(() => {
        document.getElementById(hash.slice(1))?.scrollIntoView();
      });
      return () => cancelAnimationFrame(frame);
    }
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname, hash]);
  return null;
}
export default function App() {
  return (
    <MediaProvider>
      <ScrollToTop />
      <Suspense
        fallback={
          <div className="loading-page" role="status">
            One second…
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/studio" element={<MediaStudio />} />
          <Route path="/edit" element={<MediaStudio />} />
          <Route path="/success" element={<CheckoutSuccess />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      <SiteEditor />
    </MediaProvider>
  );
}
