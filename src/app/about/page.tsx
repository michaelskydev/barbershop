"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

export default function AboutPage() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [aboutInfo, setAboutInfo] = useState({
        story: 'Loading...',
        address: 'Loading...',
        hours: 'Loading...',
        mapsUrl: ''
    });
    const [images, setImages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [infoRes, imagesRes] = await Promise.all([
                    fetch('/api/about'),
                    fetch('/api/about/images')
                ]);
                const infoData = await infoRes.json();
                const imagesData = await imagesRes.json();

                if (infoData) setAboutInfo(infoData);
                setImages(imagesData);
            } catch (error) {
                console.error('Failed to fetch about data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (images.length === 0) return;
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % images.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [images]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert('Thank you for your message! We will get back to you soon.');
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <header className={styles.header}>
                    <Link href="/" className={styles.logo}>GENTLEMEN'S CUT</Link>
                </header>
                <main className={styles.main} style={{ textAlign: 'center', padding: '5rem' }}>
                    <h1>Loading...</h1>
                </main>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <Link href="/" className={styles.logo}>GENTLEMEN'S CUT</Link>
                <nav className={styles.nav}>
                    <Link href="/" className={styles.link}>Home</Link>
                    <Link href="/book" className={styles.link}>Book Now</Link>
                    <Link href="/admin" className={styles.link}>Admin</Link>
                </nav>
            </header>

            <main className={styles.main}>
                <section className={styles.intro}>
                    <h1>Our Story</h1>
                    <p style={{ whiteSpace: 'pre-wrap' }}>{aboutInfo.story}</p>
                </section>

                <section className={styles.carousel}>
                    {images.map((img, index) => (
                        <div
                            key={index}
                            className={`${styles.slide} ${index === currentSlide ? styles.slideActive : ''}`}
                            style={{ backgroundImage: `url(${img.url})` }}
                        >
                            <div className={styles.carouselOverlay}>
                                <h2>{img.title}</h2>
                                <p>{img.subtitle}</p>
                            </div>
                        </div>
                    ))}
                </section>

                <section className={styles.grid}>
                    <div className={styles.story}>
                        <h2>Crafting Confidence</h2>
                        <p>
                            At Gentlemen's Cut, we believe that a great haircut is more than just a service—it's an investment in yourself.
                            Our team of master barbers is dedicated to helping you look and feel your absolute best.
                        </p>
                        <p>
                            From classic fades to modern styling, we take the time to understand your unique needs and preferences,
                            ensuring that every visit leaves you walking out with renewed confidence.
                        </p>

                        <div className={styles.infoGrid}>
                            <div className={styles.infoCard}>
                                <h3>Location</h3>
                                <p style={{ whiteSpace: 'pre-wrap' }}>{aboutInfo.address}</p>
                            </div>
                            <div className={styles.infoCard}>
                                <h3>Hours</h3>
                                <p style={{ whiteSpace: 'pre-wrap' }}>{aboutInfo.hours}</p>
                            </div>
                        </div>

                        {aboutInfo.mapsUrl && (
                            <div className={styles.mapContainer}>
                                <iframe
                                    src={aboutInfo.mapsUrl}
                                    width="100%"
                                    height="300"
                                    style={{ border: 0, borderRadius: '20px' }}
                                    allowFullScreen
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                ></iframe>
                            </div>
                        )}
                    </div>

                    <div className={styles.contactSection}>
                        <h2>Get In Touch</h2>
                        <form className={styles.contactForm} onSubmit={handleSubmit}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Full Name</label>
                                <input type="text" className={styles.input} placeholder="John Doe" required />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Email Address</label>
                                <input type="email" className={styles.input} placeholder="john@example.com" required />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Message</label>
                                <textarea className={styles.textarea} placeholder="How can we help you?" required></textarea>
                            </div>
                            <button type="submit" className={styles.button}>Send Message</button>
                        </form>
                    </div>
                </section>
            </main>
        </div>
    );
}
