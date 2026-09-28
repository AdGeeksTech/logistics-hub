import Image from "next/image";
import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Check,
  ShieldCheck,
} from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Regions } from "@/components/regions";
import { Inquiry } from "@/components/inquiry";
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
  searchParams,
}: {
  searchParams: Promise<{ region?: string }>;
}) {
  const { region } = await searchParams;
  const initialRegion =
    region && ["USA", "Europe", "China"].includes(region)
      ? region
      : "Not sure yet";
  return (
    <>
      <Header />
      <main id="main">
        <section className="hero">
          <Image
            src="/images/hero-porsche.jpg"
            alt="A dark Porsche travelling on an open road"
            fill
            priority
            sizes="100vw"
            className="hero-image"
          />
          <div className="hero-shade" />
          <div className="container hero-content">
            <h1>
              YOUR NEXT CAR.
              <br />A WORLD OF
              <br />
              <span>POSSIBILITIES.</span>
            </h1>
            <p>
              Vehicles from the USA, Europe and China.
              <br />
              Expert support from selection to delivery.
            </p>
            <div className="hero-actions">
              <a href="#inquiry" className="button button-orange">
                Find a vehicle
                <ArrowUpRight size={18} />
              </a>
              <a href="#how-it-works" className="hero-secondary">
                Discover the process
                <ArrowDown size={17} />
              </a>
            </div>
          </div>
          <div className="container hero-bottom">
            <span>Your choice. Our responsibility.</span>
            <span className="hero-coordinate">
              BASED IN TBILISI. THINKING BEYOND BORDERS.
            </span>
          </div>
        </section>
        <div className="origin-rail">
          <div className="container origin-inner">
            <span className="origin-label">
              A world of choice.
              <br />
              <strong>One point of contact.</strong>
            </span>
            <a href="?region=USA#sourcing">
              USA
              <ArrowUpRight />
            </a>
            <a href="?region=Europe#sourcing">
              EUROPE
              <ArrowUpRight />
            </a>
            <a href="?region=China#sourcing">
              CHINA
              <ArrowUpRight />
            </a>
          </div>
        </div>
        <section id="services" className="section services-section container">
          <div className="section-heading">
            <h2>
              You choose the vehicle.
              <br />
              We connect the dots.
            </h2>
            <p>
              From your first shortlist to the final handover, we bring
              expertise and clarity to every step.
            </p>
          </div>
          <div className="service-layout">
            <div className="buyer-photo">
              <Image
                src="/images/vehicle-detail.jpg"
                alt="A silver sports car in an automotive showroom"
                fill
                sizes="(max-width: 760px) 100vw, 50vw"
              />
              <div className="photo-caption">
                <span>For private buyers</span>
                <h3>
                  A car that’s right for you.
                  <br />A team that’s on your side.
                </h3>
                <a
                  href="#inquiry"
                  className="round-link"
                  aria-label="Start a private buyer inquiry"
                >
                  <ArrowUpRight />
                </a>
              </div>
            </div>
            <div className="service-detail">
              <h3>
                More confidence.
                <br />
                Less guesswork.
              </h3>
              <p>
                Buying a vehicle abroad should feel exciting. We help you
                understand the options and make informed decisions.
              </p>
              <ul className="check-list">
                <li>
                  <Check />
                  Vehicle sourcing tailored to your needs
                </li>
                <li>
                  <Check />
                  Expert review before auction bidding
                </li>
                <li>
                  <Check />
                  History checks, including Carfax reports
                </li>
                <li>
                  <Check />
                  Documentation and delivery support
                </li>
              </ul>
              <a className="text-link" href="#inquiry">
                Let’s find your vehicle
                <ArrowUpRight size={18} />
              </a>
            </div>
          </div>
          <Link href="/dealers" className="dealer-strip">
            <div>
              <span>Buying for your business?</span>
              <h3>Your next opportunity starts here.</h3>
            </div>
            <span className="dealer-strip-action">
              Explore dealer services
              <ArrowUpRight size={21} />
            </span>
          </Link>
        </section>
        <div id="sourcing">
          <Regions initialRegion={initialRegion} />
        </div>
        <section
          className="section process-section container"
          id="how-it-works"
        >
          <div className="section-heading">
            <h2>
              A clear road.
              <br />
              From start to finish.
            </h2>
            <p>
              Six steps. One team by your side.
              <br />
              We handle the details and keep you in the loop.
            </p>
          </div>
          <ol className="process-grid">
            {steps.map(([title, description], i) => (
              <li key={title}>
                <span className="step-number">0{i + 1}</span>
                <h3>{title}</h3>
                <p>{description}</p>
              </li>
            ))}
          </ol>
          <div className="inspection-note">
            <ShieldCheck size={25} />
            <p>
              <strong>Expert approval comes first.</strong> We review the lot
              before bidding to help reduce risks and avoid unsuitable vehicles.
            </p>
          </div>
        </section>
        <section id="about" className="about-section">
          <div className="container about-layout">
            <div>
              <h2>
                Built on experience.
                <br />
                Driven by responsibility.
              </h2>
              <p>
                Logistic Hub was founded in Tbilisi by three partners with more
                than 15 years of experience in the automotive industry.
              </p>
              <p>
                We bring that hands-on knowledge to every vehicle search. As an
                independent company, we put transparency, personal support and
                consistent communication at the heart of what we do.
              </p>
              <a className="text-link" href="#inquiry">
                Meet your next automotive partner
                <ArrowUpRight size={18} />
              </a>
            </div>
            <div className="about-proof">
              <div className="experience">
                <span>
                  15<span>+</span>
                </span>
                <p>
                  years of automotive experience
                  <br />
                  among our founders
                </p>
              </div>
              <div className="partner">
                <span>Logistics in trusted hands</span>
                <strong>
                  LION TRANS
                  <ArrowRight size={23} />
                </strong>
                <p>
                  Our logistics partner, helping connect your vehicle’s origin
                  to its destination.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="auction-section container">
          <p>Dealer access to leading US auctions</p>
          <div className="auction-names">
            <span>
              Copart<span className="auction-dot">●</span>
            </span>
            <span>
              IAA<span className="auction-dot">I</span>
            </span>
            <span className="manheim">Manheim</span>
            <span>ADESA</span>
          </div>
          <Link href="/dealers" className="text-link">
            Find out more
            <ArrowUpRight size={16} />
          </Link>
        </section>
        <section className="faq-section section container">
          <div>
            <h2>
              A few things
              <br />
              worth knowing.
            </h2>
            <p>
              Every vehicle is different.
              <br />
              We’ll help you understand yours.
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
              <details key={q}>
                <summary>
                  {q}
                  <span className="faq-plus" aria-hidden="true" />
                </summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </section>
        <Inquiry
          initialRegion={initialRegion}
          connected={Boolean(
            process.env.RESEND_API_KEY &&
            process.env.INQUIRY_TO_EMAIL &&
            process.env.INQUIRY_FROM_EMAIL,
          )}
        />
      </main>
      <Footer />
    </>
  );
}
