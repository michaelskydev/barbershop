"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./footer.module.css";

interface AboutInfo {
  address: string;
  hours: string;
}

export default function Footer() {
  const [info, setInfo] = useState<AboutInfo>({
    address: "1030 South Park St, Halifax, NS B3H 2W3",
    hours: "Mon - Sat: 10 AM - 10 PM\nSun: 11 AM - 4 PM",
  });

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const res = await fetch("/api/about");
        if (res.ok) {
          const data = await res.json();
          if (data && data.address && data.hours) {
            setInfo({
              address: data.address,
              hours: data.hours,
            });
          }
        }
      } catch (error) {
        console.error("Failed to fetch footer info:", error);
      }
    };
    fetchInfo();
  }, []);

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        <div className={styles.grid}>
          {/* Brand Info */}
          <div className={styles.column}>
            <div className={styles.brand}>
              <span className={styles.brandAccent}>SPLITT</span> ENDS
            </div>
            <p className={styles.tagline}>Barbershop since 1986</p>
            <p className={styles.description}>
              Halifax&apos;s premier grooming studio. We blend classic barbering techniques with modern styling to craft confidence for every client.
            </p>
            <div className={styles.socials}>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className={styles.socialIcon} aria-label="Instagram">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className={styles.socialIcon} aria-label="Facebook">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className={styles.socialIcon} aria-label="Twitter">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className={styles.column}>
            <h3 className={styles.colTitle}>QUICK LINKS</h3>
            <ul className={styles.linksList}>
              <li>
                <Link href="/" className={styles.link}>
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className={styles.link}>
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/book" className={styles.link}>
                  Book Appointment
                </Link>
              </li>
              <li>
                <Link href="/admin" className={styles.link}>
                  Admin Panel
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className={styles.column}>
            <h3 className={styles.colTitle}>CONTACT US</h3>
            <ul className={styles.contactList}>
              <li>
                <svg className={styles.contactIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                <a href="tel:9024298360" className={styles.contactLink}>
                  (902) 429-8360
                </a>
              </li>
              <li>
                <svg className={styles.contactIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                <a href="mailto:splittendssalon@gmail.com" className={styles.contactLink}>
                  splittendssalon@gmail.com
                </a>
              </li>
              <li>
                <svg className={styles.contactIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(info.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.contactLink}
                >
                  {info.address}
                </a>
              </li>
            </ul>
          </div>

          {/* Business Hours */}
          <div className={styles.column}>
            <h3 className={styles.colTitle}>HOURS OF OPERATION</h3>
            <ul className={styles.hoursList}>
              {info.hours.split("\n").map((line, idx) => {
                const parts = line.split(":");
                if (parts.length >= 2) {
                  const day = parts[0].trim();
                  const time = parts.slice(1).join(":").trim();
                  return (
                    <li key={idx} className={styles.hourRow}>
                      <span className={styles.day}>{day}</span>
                      <span className={styles.time}>{time}</span>
                    </li>
                  );
                }
                return (
                  <li key={idx} className={styles.hourText}>
                    {line}
                  </li>
                );
              })}
            </ul>
            <div className={styles.footerCtaWrapper}>
              <Link href="/book" className={styles.footerCta}>
                Book Instantly
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.bottomBar}>
        <div className={styles.bottomContainer}>
          <p className={styles.copyright}>
            &copy; {new Date().getFullYear()} <span className={styles.brandAccent}>Splitt Ends Barbershop</span>. All rights reserved.
          </p>
          <div className={styles.legalLinks}>
            <Link href="/about" className={styles.legalLink}>Privacy Policy</Link>
            <span className={styles.separator}>|</span>
            <Link href="/about" className={styles.legalLink}>Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
