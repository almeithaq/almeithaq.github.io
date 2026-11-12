import { Catalog } from "./components/site/catalog";
import { Journey } from "./components/site/journey";
import { Branches, Contact, Footer, Gallery, Nav, Offers, Sanitary } from "./components/site/sections";

export function App() {
  return (
    <div className="am">
      <a href="#catalog" className="am-skip">
        تخطَّ إلى الأصناف
      </a>
      <Nav />
      <main>
        <Journey />
        <Catalog />
        <Sanitary />
        <Offers />
        <Gallery />
        <Branches />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
