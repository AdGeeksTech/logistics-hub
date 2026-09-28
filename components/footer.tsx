import Link from "next/link";
import { Brand } from "./header";
import { ArrowUpRight } from "lucide-react";
export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-top">
        <div>
          <Brand />
          <p>Your choice. Our responsibility.</p>
        </div>
        <div className="footer-links">
          <Link href="/#services">Our services</Link>
          <Link href="/dealers">For dealers</Link>
          <Link href="/#how-it-works">How it works</Link>
          <Link href="/#inquiry">
            Start an inquiry <ArrowUpRight size={15} />
          </Link>
        </div>
        <p className="footer-location">
          Founded in Tbilisi, Georgia.
          <br />
          Connected to a world of vehicles.
        </p>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} Logistic Hub</span>
        <span>USA · Europe · China</span>
        <span>Vehicle photography is illustrative.</span>
      </div>
    </footer>
  );
}
