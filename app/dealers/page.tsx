import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowUpRight, Check } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Inquiry } from "@/components/inquiry";
export const metadata: Metadata = {
  title: "For automotive dealers",
  description:
    "Access leading US vehicle auctions with expert lot review, bidding support, documentation and logistics from Logistic Hub.",
};
export default function Dealers() {
  return (
    <>
      <Header />
      <main id="main">
        <section className="dealer-hero">
          <div className="container">
            <Link className="text-link back-link" href="/">
              <ArrowLeft size={16} />
              Back to home
            </Link>
            <div className="dealer-hero-grid">
              <div>
                <h1>
                  A stronger partner.
                  <br />
                  For your next
                  <br />
                  <span>move.</span>
                </h1>
                <p>
                  Auction access, expert review and dependable logistics. Build
                  your vehicle sourcing operation with a team that understands
                  the business.
                </p>
                <a className="button button-orange" href="#inquiry">
                  Talk dealer opportunities
                  <ArrowUpRight size={18} />
                </a>
              </div>
              <div className="dealer-image">
                <Image
                  src="/images/vehicle-detail.jpg"
                  alt="Vehicles in an automotive showroom; illustrative photography"
                  fill
                  priority
                  sizes="(max-width:760px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>
        </section>
        <section className="section container dealer-content">
          <h2>
            Access the auctions.
            <br />
            Keep the support.
          </h2>
          <div>
            <p>
              Logistic Hub gives professional dealers access to major US
              automotive auctions, including Copart, IAAI, Manheim, ADESA and
              other available platforms.
            </p>
            <ul className="check-list">
              <li>
                <Check />
                Review of your selected lots before bidding
              </li>
              <li>
                <Check />
                Vehicle history and documentation checks
              </li>
              <li>
                <Check />
                Bidding after expert approval
              </li>
              <li>
                <Check />
                Logistics coordination with Lion Trans
              </li>
              <li>
                <Check />
                Regular updates until the vehicle is received
              </li>
            </ul>
            <p>
              Partnership terms, payment arrangements and documentation
              requirements are explained directly by a sales manager, based on
              your needs.
            </p>
          </div>
        </section>
        <Inquiry
          dealer
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
