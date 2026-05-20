import Link from "next/link";
import Image from "next/image";

export default function SiteFooter() {
  return (
    <footer className="jk-footer">
      <div className="jk-section-inner jk-footer-inner">
        <div className="jk-footer-brand">
          <Link href="/" className="jk-footer-logo" aria-label="JK Interiors home">
            <Image src="/logo.png" alt="JK Interiors" width={44} height={44} className="object-contain" style={{ maxHeight: "44px", width: "auto" }} />
            <strong>JK Interiors</strong>
          </Link>
          <p>
            Hyderabad-based interior studio shaping calm, practical, premium homes with disciplined execution and
            thoughtful detailing.
          </p>
        </div>

        <div className="jk-footer-columns">
          <div>
            <h3>Studio</h3>
            <Link href="/services">Services</Link>
            <Link href="/about">About</Link>
            <Link href="/gallery">Gallery</Link>
            <Link href="/contact">Contact</Link>
          </div>
          <div>
            <h3>Expertise</h3>
            <span>Residential interiors</span>
            <span>Modular kitchens</span>
            <span>Turnkey execution</span>
            <span>Renovation planning</span>
          </div>
          <div>
            <h3>Contact</h3>
            <a href="tel:+919063096060">+91 90630 96060</a>
            <a href="mailto:Info.thejkinteriors@gmail.com">Info.thejkinteriors@gmail.com</a>
            <span>Hyderabad, Telangana</span>
          </div>
        </div>
      </div>

      <div className="jk-section-inner jk-footer-bottom">
        <span>&copy; 2026 JK Interiors. All rights reserved.</span>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <Link href="/privacy-policy" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-label)", fontSize: "0.72rem", letterSpacing: "0.08em" }}>Privacy Policy</Link>
          <span style={{ color: "rgba(255,255,255,0.15)" }}>·</span>
          <span style={{ color: "rgba(255,255,255,0.25)", fontFamily: "var(--font-label)", fontSize: "0.72rem" }}>Designed for quiet confidence.</span>
        </div>
      </div>
    </footer>
  );
}