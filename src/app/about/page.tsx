"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

const images = [
    {
        url: '/images/about-1.png',
        title: 'Premium Atmosphere',
        subtitle: 'Experience grooming in a space designed for the modern gentleman.'
    },
    {
        url: '/images/about-2.png',
        title: 'Master Craftsmanship',
        subtitle: 'Our tools are as sharp as our skills, ensuring perfection in every cut.'
    },
    {
        url: '/images/about-3.png',
        title: 'Dedicated Attention',
        subtitle: 'Every client is unique. Every style is a masterpiece.'
    }
];

export default function AboutPage() {
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % images.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert('Thank you for your message! We will get back to you soon.');
    };

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
                    <p>
                        Established in 2024, Gentlemen's Cut was born from a vision to redefine the traditional barbershop experience.
                        We combine old-school techniques with modern aesthetics to provide a service that is both timeless and trendy.
                    </p>
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
                                <p>5676 Robie Street<br />Halifax, NS B3K 4N5<br />Canada</p>
                            </div>
                            <div className={styles.infoCard}>
                                <h3>Hours</h3>
                                <p>Mon - Fri: 9 AM - 8 PM<br />Sat: 10 AM - 6 PM<br />Sun: 11 AM - 4 PM</p>
                            </div>
                        </div>

                        <div className={styles.mapContainer}>
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2838.745494294406!2d-63.5939223!3d44.6543166!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4b5a21074e2d3161%3A0xc39be27063ea5941!2s5676%20Robie%20St%2C%20Halifax%2C%20NS%20B3K%204N5!5e0!3m2!1sen!2sca!4v1710160000000!5m2!1sen!2sca"
                                width="100%"
                                height="300"
                                style={{ border: 0, borderRadius: '20px' }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            ></iframe>
                        </div>
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
