import { useEffect } from "react";
import { Calculator } from "./components/site/calculator";
import { Catalog } from "./components/site/catalog";
import { setupMagnetic, setupParallax, setupReveal } from "./components/site/fx";
import { RequestDrawer, RequestProvider } from "./components/site/request";
import { Branches, Contact, Finishes, Footer, Gallery, Header, Marquee, Offers, Sanitary } from "./components/site/sections";
import { Showroom } from "./components/site/showroom";

export function App() {
  useEffect(() => {
    document.documentElement.classList.add("js");
    const cleanups = [setupReveal(), setupParallax(), setupMagnetic()];
    return () => cleanups.forEach((c) => c());
  }, []);

  return (
    <RequestProvider>
      <div className="site">
        <a href="#catalog" className="skip">
          تخطَّ إلى الأصناف
        </a>
        <Header />
        <main>
          <Showroom />
          <Marquee />
          <Catalog />
          <Calculator />
          <Finishes />
          <Sanitary />
          <Offers />
          <Gallery />
          <Branches />
          <Contact />
        </main>
        <Footer />
      </div>
      <RequestDrawer />
    </RequestProvider>
  );
}
