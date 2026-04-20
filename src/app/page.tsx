import Link from 'next/link';
import styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.logo}>SPLITT ENDS - Stylist & Barber</div>
        <nav className={styles.nav}>
          <Link href="/about" className={styles.link}>About Us</Link>
          <Link href="/admin" className={styles.link}>Admin</Link>
        </nav>
      </header>

      <main className={styles.main}>
        <div className={styles.heroContent}>
          <h1 className={styles.title}>Expert Hair Styling & Barber Services</h1>
          <p className={styles.subtitle}>Halifax&apos;s top barbershop for stylish cuts since 1986.</p>
          <div className={styles.actions}>
            <Link href="/book" className={styles.ctaPrimary}>
              Book Appointment
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
