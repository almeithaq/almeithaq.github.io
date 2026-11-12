import { useEffect, useRef } from "react";
import { branches, company, facebookUrl, gallery, offers, socials, telHref } from "../../site-data";
import { onViewProgress, prefersReducedMotion } from "./fx";

const navLinks = [
  { href: "#catalog", label: "الأصناف" },
  { href: "#offers", label: "العروض" },
  { href: "#branches", label: "الفروع" },
];

export function Nav() {
  return (
    <header className="am-nav">
      <div className="am-wrap am-nav-in">
        <a href="#top" className="am-logo" aria-label={company.nameAr}>
          <span className="am-mark" aria-hidden="true" />
          <span className="am-word" aria-hidden="true" />
        </a>
        <nav className="am-links" aria-label="التنقل الرئيسي">
          {navLinks.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <a href="#contact" className="am-nav-cta">
          تواصل معنا
        </a>
      </div>
    </header>
  );
}

export function Sanitary() {
  return (
    <section className="am-section am-alt" id="sanitary">
      <div className="am-wrap am-san">
        <div className="am-san-copy">
          <h2 className="am-h2">المواد الصحية</h2>
          <p className="am-lead">أطقم حمامات ومغاسل وخلاطات تكمل ما بدأته الأرضية. اسألنا عن المتوفر منها.</p>
        </div>
        <img src="assets/cat-sanitary.jpg" alt="حمام حديث بطقم صحي أبيض وجدار أزرق" loading="lazy" width={1400} height={1050} />
        <img src="assets/cat-mixers.jpg" alt="خلاط مغسلة كروم لامع" loading="lazy" width={1400} height={1050} />
      </div>
    </section>
  );
}

export function Offers() {
  return (
    <section className="am-section" id="offers">
      <div className="am-wrap am-offers">
        <div className="am-offers-art">
          <img src="assets/offers-gift.jpg" alt="رزمة بلاط أبيض مربوطة بشريط أزرق" loading="lazy" width={1200} height={900} />
        </div>
        <div>
          <h2 className="am-h2">العروض والتخفيضات</h2>
          {offers.length > 0 ? (
            <ul className="am-offer-list">
              {offers.map((o) => (
                <li key={o.title}>
                  <div>
                    <strong>{o.title}</strong>
                    {o.until ? <small>{o.until}</small> : null}
                  </div>
                  <b>{o.detail}</b>
                </li>
              ))}
            </ul>
          ) : (
            <>
              <p className="am-lead">نعلن تخفيضاتنا الجديدة أولاً على صفحاتنا. تابعنا حتى لا يفوتك عرض.</p>
              <p className="am-pending">تفاصيل العروض الحالية تُضاف هنا قريباً.</p>
            </>
          )}
          <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="am-cta-fb">
            تابعنا على فيسبوك <span aria-hidden="true">←</span>
          </a>
        </div>
      </div>
    </section>
  );
}

export function Gallery() {
  const boxRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const box = boxRef.current;
    const row = rowRef.current;
    if (!box || !row || prefersReducedMotion()) return;
    box.classList.add("is-pan");
    const fit = () => {
      const cs = getComputedStyle(box);
      const inner = box.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      row.style.setProperty("--gd", `${Math.max(0, row.scrollWidth - inner)}px`);
    };
    fit();
    window.addEventListener("resize", fit);
    const stop = onViewProgress(box, (p) => {
      row.style.setProperty("--gp", Math.min(1, Math.max(0, (p - 0.18) / 0.64)).toFixed(4));
    });
    return () => {
      stop();
      window.removeEventListener("resize", fit);
      box.classList.remove("is-pan");
    };
  }, []);

  return (
    <section className="am-section am-alt" id="gallery">
      <div className="am-wrap">
        <h2 className="am-h2">أفكار لمساحتك</h2>
        <p className="am-lead">لمسة زرقاء على أرضية هادئة تغير شكل المكان كله.</p>
      </div>
      <div className="am-gal" ref={boxRef}>
        <div className="am-gal-row" ref={rowRef}>
          {gallery.map((g) => (
            <figure key={g.image}>
              <img src={g.image} alt={g.alt} loading="lazy" width={g.w} height={g.h} />
              <figcaption>{g.caption}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Branches() {
  return (
    <section className="am-section am-grout" id="branches">
      <div className="am-wrap">
        <h2 className="am-h2">فروعنا</h2>
        <p className="am-lead">زرنا في أقرب فرع لتعاين الأصناف بنفسك.</p>
        <div className="am-branches">
          {branches.map((b) => (
            <article key={b.name} className="am-branch">
              <h3>{b.name}</h3>
              <dl>
                <dt>العنوان</dt>
                <dd>{b.address ?? <span className="am-soon">يُضاف العنوان قريباً</span>}</dd>
                {b.hours ? (
                  <>
                    <dt>ساعات العمل</dt>
                    <dd>{b.hours}</dd>
                  </>
                ) : null}
              </dl>
              <dl>
                <dt>{b.phones && b.phones.length > 1 ? "الهواتف" : "الهاتف"}</dt>
                {b.phones && b.phones.length > 0 ? (
                  <dd className="am-phones">
                    {b.phones.map((phone) => (
                      <span key={phone.number} className="am-phone">
                        <span className="am-phone-name">{phone.name}</span>
                        <a href={telHref(phone.number)} className="am-branch-link" dir="ltr" aria-label={`اتصل بـ${phone.name}: ${phone.number}`}>
                          {phone.number}
                        </a>
                      </span>
                    ))}
                  </dd>
                ) : (
                  <dd>
                    <span className="am-soon">يُضاف رقم الهاتف قريباً</span>
                  </dd>
                )}
                {b.mapUrl ? (
                  <dd>
                    <a href={b.mapUrl} target="_blank" rel="noopener noreferrer" className="am-branch-link">
                      الموقع على الخريطة
                    </a>
                  </dd>
                ) : null}
              </dl>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Contact() {
  return (
    <section className="am-section am-alt" id="contact">
      <div className="am-wrap">
        <h2 className="am-h2">تواصل معنا</h2>
        <p className="am-lead">راسلنا على صفحاتنا للسؤال عن الأصناف والأسعار، وشاهد جديدنا أولاً بأول.</p>
        <div className="am-contact-rows">
          {socials.map((s) => (
            <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer" className="am-row">
              <strong>{s.platform}</strong>
              <div className="am-row-meta">
                <span>{s.handle}</span>
                <i aria-hidden="true">←</i>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="am-foot">
      <div className="am-wrap">
        <div className="am-foot-in">
          <div className="am-foot-brand">
            <span className="am-mark" aria-hidden="true" />
            <span className="am-word" role="img" aria-label={company.nameAr} />
            <p>{company.nameEn}</p>
          </div>
          <nav className="am-foot-links" aria-label="روابط الموقع">
            {navLinks.map((l) => (
              <a key={l.href} href={l.href}>
                {l.label}
              </a>
            ))}
            <a href="#sanitary">المواد الصحية</a>
            <a href="#gallery">أفكار لمساحتك</a>
          </nav>
          <nav className="am-foot-links" aria-label="صفحاتنا">
            {socials.map((s) => (
              <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer">
                {s.platform} <span dir="ltr">{s.handle.startsWith("@") ? s.handle : ""}</span>
              </a>
            ))}
          </nav>
        </div>
        <p className="am-foot-base">
          <span>
            © {2026} {company.nameAr}. {company.tagline}.
          </span>
          <span>الصور توضيحية، وتختلف الألوان والنقشات حسب المتوفر في الفروع.</span>
        </p>
      </div>
    </footer>
  );
}
