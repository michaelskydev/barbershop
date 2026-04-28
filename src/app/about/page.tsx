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
    const [images, setImages] = useState<{url: string, title?: string, subtitle?: string}[]>([]);
    const [loading, setLoading] = useState(true);
    const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormStatus('submitting');

        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setFormStatus('success');
                setFormData({ name: '', email: '', message: '' });
            } else {
                setFormStatus('error');
            }
        } catch (error) {
            console.error('Submission error:', error);
            setFormStatus('error');
        }
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <header className={styles.header}>
                    <Link href="/" className={styles.logo}>SPLITT ENDS - Stylist & Barber</Link>
                </header>
                <main className={`${styles.main} ${styles.mainLoading}`}>
                    <h1>Loading...</h1>
                </main>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <Link href="/" className={styles.logo}>SPLITT ENDS - Stylist & Barber</Link>
                <nav className={styles.nav}>
                    <Link href="/" className={styles.link}>Home</Link>
                    <Link href="/book" className={styles.link}>Book Now</Link>
                    <Link href="/admin" className={styles.link}>Admin</Link>
                </nav>
            </header>

            <main className={styles.main}>
                <section className={styles.intro}>
                    <h1>Our Story</h1>
                    <p className={styles.preWrap}>{aboutInfo.story}</p>
                </section>

                <section className={styles.carousel}>
                    {images.map((img, index) => (
                        <div
                            key={index}
                            className={`${styles.slide} ${index === currentSlide ? styles.slideActive : ''}`}
                            style={{ '--bg-image': `url(${img.url})` } as React.CSSProperties} /* NOSONAR */
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
                            At Splitt Ends, we believe that a great haircut is more than just a service, it is an investment in yourself.
                            Our team of master barbers is dedicated to helping you look and feel your absolute best.
                        </p>
                        <p>From classic fades to modern styling, we take the time to understand your unique needs and preferences,
                            ensuring that every visit leaves you walking out with renewed confidence.
                        </p>
                        <h3>Cancellation Policy</h3>
                        <p>
                            Cancellations accepted up to 24 hours before the scheduled service.
                            Within 24 hours of the service, cancellations will be charged 50% of the scheduled cost.
                        </p>

                        <div className={styles.infoGrid}>
                            <div className={styles.infoCard}>
                                <h3>Location</h3>
                                <p className={styles.preWrap}>
                                    {aboutInfo.address !== 'Loading...' ? (
                                        <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(aboutInfo.address)}`} target="_blank" rel="noopener noreferrer" className={styles.contactLink}>
                                            {aboutInfo.address}
                                        </a>
                                    ) : (
                                        aboutInfo.address
                                    )}
                                </p>
                            </div>
                            <div className={styles.infoCard}>
                                <h3>Hours</h3>
                                <p className={styles.preWrap}>{aboutInfo.hours}</p>
                            </div>
                        </div>

                        {(aboutInfo.address && aboutInfo.address !== 'Loading...') && (
                            <div className={styles.mapContainer}>
                                <iframe
                                    src={(aboutInfo.mapsUrl && aboutInfo.mapsUrl.includes('embed')) ? aboutInfo.mapsUrl : `https://maps.google.com/maps?q=${encodeURIComponent(aboutInfo.address)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                                    width="100%"
                                    height="300"
                                    className={styles.mapIframe}
                                    title="Google Maps Location"
                                    allowFullScreen
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                ></iframe>
                            </div>
                        )}
                    </div>

                    <div className={styles.contactSection}>
                        <h2>Get In Touch</h2>
                        {formStatus === 'success' ? (
                            <div className={styles.successMessage}>
                                <p>Thank you for your message! We will get back to you soon.</p>
                                <button className={styles.button} onClick={() => setFormStatus('idle')}>Send Another Message</button>
                            </div>
                        ) : (
                            <form className={styles.contactForm} onSubmit={handleSubmit}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Full Name</label>
                                    <input
                                        type="text"
                                        className={styles.input}
                                        placeholder="John Doe"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Email Address</label>
                                    <input
                                        type="email"
                                        className={styles.input}
                                        placeholder="john@example.com"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Message</label>
                                    <textarea
                                        className={styles.textarea}
                                        placeholder="How can we help you?"
                                        required
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    ></textarea>
                                </div>
                                {formStatus === 'error' && <p className={styles.errorText}>Something went wrong. Please try again.</p>}
                                <button
                                    type="submit"
                                    className={styles.button}
                                    disabled={formStatus === 'submitting'}
                                >
                                    {formStatus === 'submitting' ? 'Sending...' : 'Send Message'}
                                </button>
                            </form>
                        )}

                        <div className={`${styles.infoCard} ${styles.contactInfoCard}`}>
                            <h3>Contact Info</h3>
                            <p className={styles.preWrap}>
                                <a href="tel:9024298360" className={styles.contactLink}>(902) 429-8360</a>
                            </p>
                            <p>
                                <a href="mailto:splittendssalon@gmail.com" className={styles.contactLink}>Send Email</a>

                            </p>
                        </div>
                    </div>

                </section>
            </main>
        </div>
    );
}
