"use client";

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import Link from 'next/link';
import { formatTime12h } from '@/lib/utils';

type Barber = { id: number; name: string; color: string };
type Service = { id: number; name: string; duration: number; price: number };

export default function BookPage() {
    const getTodayStr = () => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    const [step, setStep] = useState(1);
    const [barbers, setBarbers] = useState<Barber[]>([]);
    const [services, setServices] = useState<Service[]>([]);

    const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [selectedDate, setSelectedDate] = useState(getTodayStr());
    const [selectedTime, setSelectedTime] = useState<string>('');
    const [customerName, setCustomerName] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const [availableSlots, setAvailableSlots] = useState<string[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);

    useEffect(() => {
        // Fetch initial data
        Promise.all([
            fetch('/api/barbers').then(res => res.json()),
            fetch('/api/services').then(res => res.json())
        ]).then(([barbersData, servicesData]) => {
            setBarbers(barbersData);
            setServices(servicesData);
            setLoading(false);
        });
    }, []);

    useEffect(() => {
        if (selectedBarber && selectedDate) {
            setLoadingSlots(true);
            fetch(`/api/slots?barberId=${selectedBarber.id}&date=${selectedDate}`, { cache: 'no-store' })
                .then(res => res.json())
                .then(data => {
                    setAvailableSlots(data || []);
                    setLoadingSlots(false);
                });
        } else {
            setAvailableSlots([]);
        }
    }, [selectedBarber, selectedDate]);

    const handleNext = () => setStep(s => s + 1);
    const handleBack = () => setStep(s => s - 1);

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            // Construct stable UTC string: "YYYY-MM-DDT09:00:00.000Z"
            const startDate = `${selectedDate}T${selectedTime}:00.000Z`;

            const res = await fetch('/api/appointments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    barberId: selectedBarber?.id,
                    serviceId: selectedService?.id,
                    startDate: startDate,
                    customerName,
                    customerEmail,
                    customerPhone
                })
            });

            if (res.ok) {
                setSuccess(true);
            }
        } catch (error) {
            console.error(error);
            alert('Something went wrong');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className={styles.loading}>Loading...</div>;

    if (success) return (
        <div className={styles.successContainer}>
            <div className={styles.successCard}>
                <h1>Appointment Requested!</h1>
                <p>We have received your booking request. You will receive a confirmation email shortly.</p>
                <Link href="/" className={styles.button}>Back to Home</Link>
            </div>
        </div>
    );

    return (
        <div className={styles.container}>
            <div className={styles.wizard}>
                <div className={styles.progress}>
                    <div className={`${styles.step} ${step >= 1 ? styles.active : ''}`}>Barber</div>
                    <div className={styles.line}></div>
                    <div className={`${styles.step} ${step >= 2 ? styles.active : ''}`}>Service</div>
                    <div className={styles.line}></div>
                    <div className={`${styles.step} ${step >= 3 ? styles.active : ''}`}>Time</div>
                    <div className={styles.line}></div>
                    <div className={`${styles.step} ${step >= 4 ? styles.active : ''}`}>Details</div>
                </div>

                <div className={styles.content}>
                    {step === 1 && (
                        <div className={styles.grid}>
                            {barbers.map(barber => (
                                <div
                                    key={barber.id}
                                    className={`${styles.card} ${selectedBarber?.id === barber.id ? styles.selected : ''}`}
                                    onClick={() => setSelectedBarber(barber)}
                                >
                                    <div className={styles.avatar} style={{ backgroundColor: barber.color }}>
                                        {barber.name[0]}
                                    </div>
                                    <h3>{barber.name}</h3>
                                </div>
                            ))}
                        </div>
                    )}

                    {step === 2 && (
                        <div className={styles.list}>
                            {services.map(service => (
                                <div
                                    key={service.id}
                                    className={`${styles.listItem} ${selectedService?.id === service.id ? styles.selected : ''}`}
                                    onClick={() => setSelectedService(service)}
                                >
                                    <div className={styles.serviceInfo}>
                                        <h3>{service.name}</h3>
                                        <span>{service.duration} mins</span>
                                    </div>
                                    <div className={styles.price}>${service.price}</div>
                                </div>
                            ))}
                        </div>
                    )}

                    {step === 3 && (
                        <div className={styles.formGroup}>
                            <label>Select Date</label>
                            <input
                                type="date"
                                className={styles.input}
                                min={getTodayStr()}
                                value={selectedDate}
                                onChange={e => {
                                    setSelectedDate(e.target.value);
                                    setSelectedTime('');
                                }}
                            />
                            <label>Select Time</label>
                            <select
                                className={styles.input}
                                value={selectedTime}
                                onChange={e => setSelectedTime(e.target.value)}
                                disabled={!selectedDate || loadingSlots}
                            >
                                <option value="">-- Select Time --</option>
                                {availableSlots.map(time => (
                                    <option key={time} value={time}>{formatTime12h(time)}</option>
                                ))}
                            </select>
                            {availableSlots.length === 0 && selectedDate && !loadingSlots && (
                                <p className={styles.errorText}>No available slots for this date.</p>
                            )}
                        </div>
                    )}

                    {step === 4 && (
                        <div className={styles.formGroup}>
                            <div className={styles.summary}>
                                <h3>Booking Summary</h3>
                                <p><strong>Barber:</strong> {selectedBarber?.name}</p>
                                <p><strong>Service:</strong> {selectedService?.name} (${selectedService?.price})</p>
                                <p><strong>When:</strong> {selectedDate} at {formatTime12h(selectedTime)}</p>
                            </div>
                            <label>Your Name</label>
                            <input
                                type="text"
                                className={styles.input}
                                value={customerName}
                                onChange={e => setCustomerName(e.target.value)}
                                placeholder="John Doe"
                            />
                            <label>Email Address</label>
                            <input
                                type="email"
                                className={styles.input}
                                value={customerEmail}
                                onChange={e => setCustomerEmail(e.target.value)}
                                placeholder="john@example.com"
                            />
                            <label>Phone Number (Optional)</label>
                            <input
                                type="tel"
                                className={styles.input}
                                value={customerPhone}
                                onChange={e => setCustomerPhone(e.target.value)}
                                placeholder="(555) 123-4567"
                            />
                        </div>
                    )}
                </div>

                <div className={styles.footer}>
                    {step > 1 && (
                        <button className={styles.buttonSecondary} onClick={handleBack}>Back</button>
                    )}

                    {step < 4 ? (
                        <button
                            className={styles.button}
                            onClick={handleNext}
                            disabled={
                                (step === 1 && !selectedBarber) ||
                                (step === 2 && !selectedService) ||
                                (step === 3 && (!selectedDate || !selectedTime))
                            }
                        >
                            Continue
                        </button>
                    ) : (
                        <button
                            className={styles.button}
                            onClick={handleSubmit}
                            disabled={submitting || !customerName || !customerEmail}
                        >
                            {submitting ? 'Booking...' : 'Confirm Booking'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
