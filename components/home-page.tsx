import { localizedPath, type Locale } from "@/lib/i18n";
import { getT } from "@/lib/site-texts";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUpRight, Check, ShieldCheck } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Regions } from "@/components/regions";
import { Inquiry } from "@/components/inquiry";
import { LatestCars } from "@/components/latest-cars";
// Logos are the owners' trademarks; sources in public/images/SOURCES.md.
const auctionLogos = [
  { name: "Copart", src: "/images/logos/copart.svg", width: 141, height: 53 },
  { name: "IAA", src: "/images/logos/iaa.svg", width: 73, height: 53 },
  { name: "Manheim", src: "/images/logos/manheim.svg", width: 240, height: 57 },
  { name: "ADESA", src: "/images/logos/adesa.svg", width: 90, height: 48 },
];
const steps = [
  [
    "Vehicle selection",
    "Tell us what you’re looking for, or send us a lot you already have in mind.",
  ],
  [
    "Expert inspection",
    "We review the available information, vehicle history and documentation before bidding.",
  ],
  [
    "Auction bidding",
    "Only after expert approval do we move forward with bidding on your selected vehicle.",
  ],
  [
    "Documentation & logistics",
    "Our team coordinates the paperwork and delivery arrangements with Lion Trans.",
  ],
  [
    "Updates at every stage",
    "Stay informed throughout the process, with clear communication from our team.",
  ],
  [
    "Vehicle delivery",
    "Support continues until your vehicle is received. Your choice becomes your next drive.",
  ],
];
export default async function Home({
  locale = "en",
  initialRegion = "Not sure yet",
}: {
  locale?: Locale;
  initialRegion?: string;
}) {
  const t = await getT(locale);
  return (
    <>
      <Header locale={locale} />
      <main id="main">
        <section className="hero">
          <Image
            src="/images/hero-porsche.jpg"
            alt={t("A dark Porsche travelling on an open road")}
            fill
            priority
            sizes="100vw"
            className="hero-image"
          />
          <div className="hero-shade" />
          <div className="container hero-content">
            <h1>
              {t("YOUR NEXT CAR.")}
              <br />
              {t("A WORLD OF")}
              <br />
              <span>{t("POSSIBILITIES.")}</span>
            </h1>
            <p>
              {t("Vehicles from the USA, Europe and China.")}
              <br />
              {t("Expert support from selection to delivery.")}
            </p>
            <div className="hero-actions">
              <a href="#inquiry" className="button button-orange">
                {t("Find a vehicle")}
                <ArrowUpRight size={18} />
              </a>
              <a href="#how-it-works" className="hero-secondary">
                {t("Discover the process")}
                <ArrowDown size={17} />
              </a>
            </div>
          </div>
          <div className="container hero-bottom">
            <span>{t("Your choice. Our responsibility.")}</span>
            <span className="hero-coordinate">
              {t("BASED IN TBILISI. THINKING BEYOND BORDERS.")}
            </span>
          </div>
        </section>
        <div className="origin-rail">
          <div className="container origin-inner">
            <span className="origin-label">
              {t("A world of choice.")}
              <br />
              <strong>{t("One point of contact.")}</strong>
            </span>
            <a href="?region=USA#sourcing">
              {t("USA")}
              <ArrowUpRight />
            </a>
            <a href="?region=Europe#sourcing">
              {t("EUROPE")}
              <ArrowUpRight />
            </a>
            <a href="?region=China#sourcing">
              {t("CHINA")}
              <ArrowUpRight />
            </a>
          </div>
        </div>
        <section id="services" className="section services-section container">
          <div className="section-heading">
            <h2>
              {t("You choose the vehicle.")}
              <br />
              {t("We connect the dots.")}
            </h2>
            <p>
              {t(
                "From your first shortlist to the final handover, we bring expertise and clarity to every step.",
              )}
            </p>
          </div>
          <div className="service-layout">
            <div className="buyer-photo">
              <Image
                src="/images/vehicle-detail.jpg"
                alt={t("A silver sports car in an automotive showroom")}
                fill
                sizes="(max-width: 760px) 100vw, 50vw"
              />
              <div className="photo-caption">
                <span>{t("For private buyers")}</span>
                <h3>
                  {t("A car that’s right for you.")}
                  <br />
                  {t("A team that’s on your side.")}
                </h3>
                <a
                  href="#inquiry"
                  className="round-link"
                  aria-label={t("Start a private buyer inquiry")}
                >
                  <ArrowUpRight />
                </a>
              </div>
            </div>
            <div className="service-detail">
              <h3>
                {t("More confidence.")}
                <br />
                {t("Less guesswork.")}
              </h3>
              <p>
                {t(
                  "Buying a vehicle abroad should feel exciting. We help you understand the options and make informed decisions.",
                )}
              </p>
              <ul className="check-list">
                <li>
                  <Check />
                  {t("Vehicle sourcing tailored to your needs")}
                </li>
                <li>
                  <Check />
                  {t("Expert review before auction bidding")}
                </li>
                <li>
                  <Check />
                  {t("History checks, including Carfax reports")}
                </li>
                <li>
                  <Check />
                  {t("Documentation and delivery support")}
                </li>
              </ul>
              <a className="text-link" href="#inquiry">
                {t("Let’s find your vehicle")}
                <ArrowUpRight size={18} />
              </a>
            </div>
          </div>
          <Link
            href={localizedPath(locale, "/dealers")}
            className="dealer-strip"
          >
            <div>
              <span>{t("Buying for your business?")}</span>
              <h3>{t("Your next opportunity starts here.")}</h3>
            </div>
            <span className="dealer-strip-action">
              {t("Explore dealer services")}
              <ArrowUpRight size={21} />
            </span>
          </Link>
        </section>
        <LatestCars locale={locale} />
        <div id="sourcing">
          <Regions locale={locale} initialRegion={initialRegion} />
        </div>
        <section
          className="section process-section container"
          id="how-it-works"
        >
          <div className="section-heading">
            <h2>
              {t("A clear road.")}
              <br />
              {t("From start to finish.")}
            </h2>
            <p>
              {t("Six steps. One team by your side.")}
              <br />
              {t("We handle the details and keep you in the loop.")}
            </p>
          </div>
          <ol className="process-grid">
            {steps.map(([title, description], i) => (
              <li key={t(title)}>
                <span className="step-number">0{i + 1}</span>
                <h3>{t(title)}</h3>
                <p>{t(description)}</p>
              </li>
            ))}
          </ol>
          <div className="inspection-note">
            <ShieldCheck size={25} />
            <p>
              <strong>{t("Expert approval comes first.")}</strong>{" "}
              {t(
                "We review the lot before bidding to help reduce risks and avoid unsuitable vehicles.",
              )}
            </p>
          </div>
        </section>
        <section id="about" className="about-section">
          <div className="container about-layout">
            <div>
              <h2>
                {t("Built on experience.")}
                <br />
                {t("Driven by responsibility.")}
              </h2>
              <p>
                {t(
                  "Logistic Hub was founded in Tbilisi by three partners with more than 15 years of experience in the automotive industry.",
                )}
              </p>
              <p>
                {t(
                  "We bring that hands-on knowledge to every vehicle search. As an independent company, we put transparency, personal support and consistent communication at the heart of what we do.",
                )}
              </p>
              <a className="text-link" href="#inquiry">
                {t("Meet your next automotive partner")}
                <ArrowUpRight size={18} />
              </a>
            </div>
            <div className="about-proof">
              <div className="experience">
                <span>
                  15<span>+</span>
                </span>
                <p>
                  {t("years of automotive experience")}
                  <br />
                  {t("among our founders")}
                </p>
              </div>
              <div className="partner">
                <span>{t("Logistics in trusted hands")}</span>
                {/* Lion Trans's site uses its group mark ("Lion Auto Auction"), so
                    the name stays beside it. */}
                <div className="partner-brand">
                  <Image
                    className="partner-logo"
                    src="/images/logos/lion-trans.webp"
                    alt=""
                    width={160}
                    height={160}
                    sizes="72px"
                  />
                  <strong>Lion Trans</strong>
                </div>
                <p>
                  {t(
                    "Our logistics partner, helping connect your vehicle’s origin to its destination.",
                  )}
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="auction-section container">
          <p>{t("Dealer access to leading US auctions")}</p>
          <ul className="auction-logos">
            {auctionLogos.map((logo) => (
              <li key={logo.name} className={`logo-${logo.name.toLowerCase()}`}>
                <Image
                  src={logo.src}
                  alt={logo.name}
                  width={logo.width}
                  height={logo.height}
                />
              </li>
            ))}
          </ul>
          <Link href={localizedPath(locale, "/dealers")} className="text-link">
            {t("Find out more")}
            <ArrowUpRight size={16} />
          </Link>
        </section>
        <section className="faq-section section container">
          <div>
            <h2>
              {t("A few things")}
              <br />
              {t("worth knowing.")}
            </h2>
            <p>
              {t("Every vehicle is different.")}
              <br />
              {t("We’ll help you understand yours.")}
            </p>
          </div>
          <div className="faq-list">
            {[
              [
                "Can you help if I have already found a vehicle?",
                "Yes. Send us the auction lot or vehicle details. Our team reviews the available vehicle information, history and documentation before proceeding with bidding.",
              ],
              [
                "Where do you source vehicles?",
                "We source vehicles from the USA, Europe and China. A manager can discuss available options, delivery destinations and arrangements for your specific vehicle.",
              ],
              [
                "Do you work with automotive dealers?",
                "Yes. We support professional dealers with access to major US auctions, expert lot review, bidding, documentation and logistics. Individual partnership terms are discussed with a manager.",
              ],
              [
                "How much will it cost, and how long does delivery take?",
                "Costs and timelines depend on the vehicle, its location and delivery arrangements. A manager will explain the specific costs, payment schedule and expected timeline for your inquiry.",
              ],
            ].map(([q, a]) => (
              <details key={t(q)}>
                <summary>
                  {t(q)}
                  <span className="faq-plus" aria-hidden="true" />
                </summary>
                <p>{t(a)}</p>
              </details>
            ))}
          </div>
        </section>
        <Inquiry
          locale={locale}
          initialRegion={initialRegion}
          connected={Boolean(
            process.env.RESEND_API_KEY &&
            process.env.INQUIRY_TO_EMAIL &&
            process.env.INQUIRY_FROM_EMAIL,
          )}
        />
      </main>
      <Footer locale={locale} />
    </>
  );
}
