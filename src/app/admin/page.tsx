"use client";

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import { formatTime12h, formatValueTo12h } from '@/lib/utils';

type Barber = { id: number; name: string; color: string; schedules: any[] };
type Appointment = {
    id: number;
    startDate: string;
    status: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    service: { name: string; duration: number; price: number };
    barberId: number;
};


export default function AdminPage() {
    const getTodayStr = () => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };
    const [date, setDate] = useState(getTodayStr());
    const [barbers, setBarbers] = useState<Barber[]>([]);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        const [barbersRes, appointmentsRes] = await Promise.all([
            fetch('/api/barbers', { cache: 'no-store' }),
            fetch(`/api/appointments?date=${date}`, { cache: 'no-store' })
        ]);
        const barbersData = await barbersRes.json();
        const appointmentsData = await appointmentsRes.json();

        setBarbers(barbersData);
        setAppointments(appointmentsData);
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, [date]);

    const updateStatus = async (id: number, status: string) => {
        await fetch(`/api/appointments/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        fetchData();
    };

    // Helper to position items on grid
    // Grid: Rows = Time (9am - 5pm, 15 min slots?), Cols = Barbers
    // Let's do simple list per barber for MVP or a rigid grid
    // Rigid grid is better for "Calendar View"

    const [tab, setTab] = useState<'calendar' | 'barbers' | 'services' | 'about'>('calendar');
    const [newBarberName, setNewBarberName] = useState('');
    const [newBarberColor, setNewBarberColor] = useState('#000000');

    const addBarber = async (e: React.FormEvent) => {
        e.preventDefault();
        await fetch('/api/barbers', {
            method: 'POST',
            body: JSON.stringify({ name: newBarberName, color: newBarberColor }),
            headers: { 'Content-Type': 'application/json' }
        });
        setNewBarberName('');
        fetchData();
    };
    const [editingSchedule, setEditingSchedule] = useState<Barber | null>(null);
    const [schedule, setSchedule] = useState<any[]>([]);

    const openSchedule = async (barber: Barber) => {
        setEditingSchedule(barber);
        const res = await fetch(`/api/barbers/${barber.id}/schedule`);
        const data = await res.json();
        // Ensure all days are present
        const fullSchedule = [];
        for (let i = 0; i <= 6; i++) { // Sun-Sat
            const existing = data.find((s: any) => s.dayOfWeek === i);
            fullSchedule.push(existing || { dayOfWeek: i, startTime: '09:00', endTime: '17:00', active: false });
        }
        setSchedule(fullSchedule);
    };

    const handleScheduleChange = (index: number, field: string, value: any) => {
        const newSchedule = [...schedule];
        newSchedule[index] = { ...newSchedule[index], [field]: value };
        setSchedule(newSchedule);
    };

    const saveSchedule = async () => {
        if (!editingSchedule) return;
        await fetch(`/api/barbers/${editingSchedule.id}/schedule`, {
            method: 'PUT',
            body: JSON.stringify({ schedules: schedule }),
            headers: { 'Content-Type': 'application/json' }
        });
        setEditingSchedule(null);
    };

    const deleteBarber = async (id: number) => {
        if (!confirm('Are you sure? This will delete all appointments for this barber.')) return;
        await fetch(`/api/barbers/${id}`, { method: 'DELETE' });
        fetchData();
    };

    // Manual Booking State
    const [bookingModalOpen, setBookingModalOpen] = useState(false);
    const [bookingSlot, setBookingSlot] = useState<{ barberId: number, date: string, time: string } | null>(null);
    const [bookingServiceId, setBookingServiceId] = useState<number | null>(null);
    const [bookingCustomerName, setBookingCustomerName] = useState('');
    const [bookingCustomerEmail, setBookingCustomerEmail] = useState('');
    const [bookingCustomerPhone, setBookingCustomerPhone] = useState('');
    const [services, setServices] = useState<any[]>([]);

    const [aboutInfo, setAboutInfo] = useState({ story: '', address: '', hours: '', mapsUrl: '' });
    const [aboutImages, setAboutImages] = useState<any[]>([]);
    const [isSavingAbout, setIsSavingAbout] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [savingImageId, setSavingImageId] = useState<number | null>(null);

    const fetchAboutData = async () => {
        const [infoRes, imagesRes] = await Promise.all([
            fetch('/api/about'),
            fetch('/api/about/images')
        ]);
        const infoData = await infoRes.json();
        const imagesData = await imagesRes.json();
        if (infoData) setAboutInfo(infoData);
        setAboutImages(imagesData);
    };

    useEffect(() => {
        fetch('/api/services').then(res => res.json()).then(setServices);
        fetchAboutData();
    }, []);

    const handleAboutInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setAboutInfo({ ...aboutInfo, [e.target.name]: e.target.value });
    };

    const saveAboutInfo = async () => {
        setIsSavingAbout(true);
        await fetch('/api/about', {
            method: 'POST',
            body: JSON.stringify(aboutInfo),
            headers: { 'Content-Type': 'application/json' }
        });
        setIsSavingAbout(false);
        alert('About information saved!');
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploadingImage(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();

            if (data.url) {
                await fetch('/api/about/images', {
                    method: 'POST',
                    body: JSON.stringify({
                        url: data.url,
                        title: 'New Image',
                        subtitle: 'Add a description',
                        order: aboutImages.length
                    }),
                    headers: { 'Content-Type': 'application/json' }
                });
                await fetchAboutData();
            }
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Upload failed. Please try again.');
        } finally {
            setIsUploadingImage(false);
        }
    };

    const deleteAboutImage = async (id: number) => {
        if (!confirm('Delete this image?')) return;
        await fetch(`/api/about/images/${id}`, { method: 'DELETE' });
        fetchAboutData();
    };

    const handleImageLocalChange = (id: number, field: string, value: string) => {
        setAboutImages(prev => prev.map(img => img.id === id ? { ...img, [field]: value } : img));
    };

    const saveAboutImage = async (id: number) => {
        setSavingImageId(id);
        const img = aboutImages.find(i => i.id === id);
        try {
            await fetch(`/api/about/images/${id}`, {
                method: 'PATCH',
                body: JSON.stringify(img),
                headers: { 'Content-Type': 'application/json' }
            });
            alert('Image details saved!');
        } catch (error) {
            console.error('Failed to save image:', error);
            alert('Failed to save image.');
        } finally {
            setSavingImageId(null);
        }
    };

    const handleSlotClick = (barberId: number, slotVal: number) => {
        const h = Math.floor(slotVal);
        const m = (slotVal % 1 === 0) ? '00' : '30';
        const time = `${h < 10 ? '0' : ''}${h}:${m}`;
        setBookingSlot({ barberId, date, time });
        setBookingModalOpen(true);
    };

    const handleManualBook = async () => {
        if (!bookingSlot || !bookingServiceId) return;
        // Construct stable UTC string: "YYYY-MM-DDT09:00:00.000Z"
        const startDate = `${bookingSlot.date}T${bookingSlot.time}:00.000Z`;

        await fetch('/api/appointments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                barberId: bookingSlot.barberId,
                serviceId: bookingServiceId,
                startDate: startDate,
                customerName: bookingCustomerName || 'Walk-in',
                customerEmail: bookingCustomerEmail || 'admin@local',
                customerPhone: bookingCustomerPhone
            })
        });
        setBookingModalOpen(false);
        setBookingCustomerName('');
        setBookingCustomerPhone('');
        fetchData();
    };

    const hours = [9, 9.5, 10, 10.5, 11, 11.5, 12, 12.5, 13, 13.5, 14, 14.5, 15, 15.5, 16, 16.5, 17, 17.5]; // 9am to 6pm in 30min blocks
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        window.location.href = '/admin/login';
    };

    const [newService, setNewService] = useState({ name: '', duration: 30, price: 0 });

    const addService = async (e: React.FormEvent) => {
        e.preventDefault();
        await fetch('/api/services', {
            method: 'POST',
            body: JSON.stringify(newService),
            headers: { 'Content-Type': 'application/json' }
        });
        setNewService({ name: '', duration: 30, price: 0 });
        const res = await fetch('/api/services'); // re-fetch services
        const data = await res.json();
        setServices(data);
    };

    const deleteService = async (id: number) => {
        if (!confirm('Delete this service?')) return;
        await fetch(`/api/services/${id}`, { method: 'DELETE' });
        const res = await fetch('/api/services');
        const data = await res.json();
        setServices(data);
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.headerTop}>
                    <h1>Admin Dashboard</h1>
                    <button onClick={handleLogout} className={styles.logoutBtn}>Sign Out</button>
                </div>
                <div className={styles.controls}>
                    <button
                        className={tab === 'calendar' ? styles.activeTab : styles.tab}
                        onClick={() => setTab('calendar')}
                    >
                        Calendar
                    </button>
                    <button
                        className={tab === 'barbers' ? styles.activeTab : styles.tab}
                        onClick={() => setTab('barbers')}
                    >
                        Manage Barbers
                    </button>
                    <button
                        className={tab === 'services' ? styles.activeTab : styles.tab}
                        onClick={() => setTab('services')}
                    >
                        Services
                    </button>
                    <button
                        className={tab === 'about' ? styles.activeTab : styles.tab}
                        onClick={() => setTab('about')}
                    >
                        About Us
                    </button>
                    {tab === 'calendar' && (
                        <input
                            type="date"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            className={styles.datePicker}
                        />
                    )}
                </div>
            </header>

            {bookingModalOpen && bookingSlot && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <h2>Manual Booking</h2>
                        <p>Time: {formatTime12h(bookingSlot.time)} on {bookingSlot.date}</p>

                        <div className={styles.formGroup}>
                            <label>Service</label>
                            <select
                                className={styles.input}
                                value={bookingServiceId || ''}
                                onChange={e => setBookingServiceId(parseInt(e.target.value))}
                            >
                                <option value="">Select Service</option>
                                {services.map(s => (
                                    <option key={s.id} value={s.id}>{s.name} (${s.price})</option>
                                ))}
                            </select>

                            <label>Customer Name</label>
                            <input
                                className={styles.input}
                                placeholder="Customer Name"
                                value={bookingCustomerName}
                                onChange={e => setBookingCustomerName(e.target.value)}
                            />

                            <label>Email (Optional)</label>
                            <input
                                className={styles.input}
                                placeholder="Email"
                                value={bookingCustomerEmail}
                                onChange={e => setBookingCustomerEmail(e.target.value)}
                            />

                            <label>Phone (Optional)</label>
                            <input
                                className={styles.input}
                                placeholder="Phone Number"
                                value={bookingCustomerPhone}
                                onChange={e => setBookingCustomerPhone(e.target.value)}
                            />
                        </div>

                        <div className={styles.modalActions}>
                            <button onClick={handleManualBook} className={styles.button}>Book</button>
                            <button onClick={() => setBookingModalOpen(false)} className={styles.smallBtn}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {editingSchedule && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <h2>Edit Schedule: {editingSchedule.name}</h2>
                        <div className={styles.scheduleGrid}>
                            {schedule.map((day, index) => (
                                <div key={day.dayOfWeek} className={styles.dayRow}>
                                    <div className={styles.dayName}>
                                        <input
                                            type="checkbox"
                                            checked={day.active}
                                            onChange={e => handleScheduleChange(index, 'active', e.target.checked)}
                                        />
                                        {days[day.dayOfWeek]}
                                    </div>
                                    <div className={styles.timeInputs}>
                                        <input
                                            type="time"
                                            value={day.startTime}
                                            disabled={!day.active}
                                            onChange={e => handleScheduleChange(index, 'startTime', e.target.value)}
                                        />
                                        <span>to</span>
                                        <input
                                            type="time"
                                            value={day.endTime}
                                            disabled={!day.active}
                                            onChange={e => handleScheduleChange(index, 'endTime', e.target.value)}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className={styles.modalActions}>
                            <button onClick={saveSchedule} className={styles.button}>Save Changes</button>
                            <button onClick={() => setEditingSchedule(null)} className={styles.smallBtn}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {loading ? <div>Loading...</div> : (
                <>
                    {tab === 'calendar' && (
                        <div className={styles.calendar}>
                            <div className={styles.timeline}>
                                <div className={styles.timeHeader}></div>
                                {hours.map(h => (
                                    <div key={h} className={styles.timeLabel}>
                                        {h % 1 === 0 ? formatValueTo12h(h) : ''}
                                    </div>
                                ))}
                            </div>

                            <div className={styles.grid}>
                                {barbers.map(barber => (
                                    <div key={barber.id} className={styles.col}>
                                        <div className={styles.colHeader} style={{ borderTopColor: barber.color }}>
                                            {barber.name}
                                        </div>
                                        <div className={styles.colContent}>
                                            {/* Background lines for hours - CLICKABLE */
                                                hours.map(h => {
                                                    // Calculate local day of week
                                                    const [y, m, d] = date.split('-').map(Number);
                                                    const localDate = new Date(y, m - 1, d);
                                                    const dayOfWeek = localDate.getDay();

                                                    const schedule = barber.schedules?.find(s => s.dayOfWeek === dayOfWeek);
                                                    let isOpen = false;
                                                    if (schedule && schedule.active) {
                                                        const [startH, startM] = schedule.startTime.split(':').map(Number);
                                                        const [endH, endM] = schedule.endTime.split(':').map(Number);
                                                        const startVal = startH + (startM / 60);
                                                        const endVal = endH + (endM / 60);
                                                        if (h >= startVal && h < endVal) {
                                                            isOpen = true;
                                                        }
                                                    }

                                                    return (
                                                        <div
                                                            key={h}
                                                            className={styles.hourCell}
                                                            onClick={() => isOpen && handleSlotClick(barber.id, h)}
                                                            style={{
                                                                cursor: isOpen ? 'pointer' : 'not-allowed',
                                                                backgroundColor: isOpen ? 'transparent' : '#f5f5f5',
                                                                opacity: isOpen ? 1 : 0.5
                                                            }}
                                                            title={isOpen ? `Click to book` : 'Closed'}
                                                        ></div>
                                                    );
                                                })
                                            }

                                            {/* Render Appointments */
                                                appointments
                                                    .filter(app => app.barberId === barber.id)
                                                    .map(app => {
                                                        const start = new Date(app.startDate);
                                                        const startHour = start.getUTCHours();
                                                        const startMin = start.getUTCMinutes();
                                                        const offsetMinutes = (startHour - 9) * 60 + startMin;
                                                        const top = offsetMinutes * (100 / 60);
                                                        const height = app.service.duration * (100 / 60);

                                                        const isRejected = app.status === 'REJECTED';
                                                        const style: React.CSSProperties = {
                                                            top: `${top}px`,
                                                            height: `${height}px`,
                                                            ...(isRejected ? {
                                                                width: '30%',
                                                                left: 'auto',
                                                                right: 0,
                                                                opacity: 0.7,
                                                                zIndex: 5
                                                            } : {})
                                                        };

                                                        return (
                                                            <div
                                                                key={app.id}
                                                                className={`${styles.appointment} ${styles[app.status.toLowerCase()]}`}
                                                                style={style}
                                                                onClick={(e) => { e.stopPropagation(); setSelectedAppointment(app); }}
                                                                title="Click to view details"
                                                            >
                                                                <div className={styles.appTime}>
                                                                    {formatTime12h(`${start.getUTCHours().toString().padStart(2, '0')}:${start.getUTCMinutes().toString().padStart(2, '0')}`)}
                                                                </div>
                                                                <div className={styles.appName}>{app.customerName}</div>
                                                                <div className={styles.appService}>{app.service.name}</div>

                                                                {app.status === 'PENDING' && (
                                                                    <div className={styles.actions}>
                                                                        <button
                                                                            onClick={(e) => { e.stopPropagation(); updateStatus(app.id, 'APPROVED'); }}
                                                                            title="Approve"
                                                                            className={styles.approveAction}
                                                                        >✓</button>
                                                                        <button
                                                                            onClick={(e) => { e.stopPropagation(); updateStatus(app.id, 'REJECTED'); }}
                                                                            title="Reject"
                                                                            className={styles.rejectAction}
                                                                        >✕</button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })
                                            }
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {tab === 'barbers' && (
                        <div className={styles.manageContainer}>
                            <div className={styles.addBarber}>
                                <h2>Add New Barber</h2>
                                <form onSubmit={addBarber} className={styles.rowForm}>
                                    <input
                                        type="text"
                                        placeholder="Barber Name"
                                        value={newBarberName}
                                        onChange={e => setNewBarberName(e.target.value)}
                                        className={styles.input}
                                    />
                                    <input
                                        type="color"
                                        value={newBarberColor}
                                        onChange={e => setNewBarberColor(e.target.value)}
                                        className={styles.colorParams}
                                    />
                                    <button type="submit" className={styles.button}>Add Barber</button>
                                </form>
                            </div>

                            <div className={styles.barberList}>
                                {barbers.map(barber => (
                                    <div key={barber.id} className={styles.barberCard}>
                                        <div className={styles.barberName}>
                                            <span className={styles.colorDot} style={{ backgroundColor: barber.color }}></span>
                                            {barber.name}
                                        </div>
                                        <div className={styles.schedulePreview}>
                                            <button onClick={() => openSchedule(barber)} className={styles.smallBtn}>Edit Schedule</button>
                                            <button onClick={() => deleteBarber(barber.id)} className={styles.deleteBtn} style={{ marginLeft: '0.5rem' }}>Delete</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {tab === 'services' && (
                        <div className={styles.manageContainer}>
                            <div className={styles.addBarber}>
                                <h2>Add New Service</h2>
                                <form onSubmit={addService} className={styles.rowForm}>
                                    <div className={styles.formField}>
                                        <label>Service Name</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Beard Trim"
                                            value={newService.name}
                                            onChange={e => setNewService({ ...newService, name: e.target.value })}
                                            className={styles.input}
                                            required
                                        />
                                    </div>
                                    <div className={`${styles.formField} ${styles.numericField}`}>
                                        <label>Duration</label>
                                        <input
                                            type="number"
                                            placeholder="Mins"
                                            value={newService.duration}
                                            onChange={e => setNewService({ ...newService, duration: parseInt(e.target.value) })}
                                            className={styles.input}
                                        />
                                    </div>
                                    <div className={`${styles.formField} ${styles.numericField}`}>
                                        <label>Price</label>
                                        <input
                                            type="number"
                                            placeholder="USD"
                                            value={newService.price}
                                            onChange={e => setNewService({ ...newService, price: parseFloat(e.target.value) })}
                                            className={styles.input}
                                        />
                                    </div>
                                    <button type="submit" className={styles.button}>Add Service</button>
                                </form>
                            </div>

                            <div className={styles.barberList}>
                                {services.map(service => (
                                    <div key={service.id} className={styles.barberCard}>
                                        <div className={styles.barberName}>
                                            {service.name}
                                            <span style={{ fontSize: '0.9rem', fontWeight: 'normal', marginLeft: '1rem', color: '#888' }}>
                                                {service.duration} min | ${service.price}
                                            </span>
                                        </div>
                                        <div>
                                            <button onClick={() => deleteService(service.id)} className={styles.deleteBtn}>Delete</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {tab === 'about' && (
                        <div className={styles.manageContainer}>
                            <div className={styles.addBarber}>
                                <h2>Edit About Us</h2>
                                <div className={styles.formGroup}>
                                    <div className={styles.formField}>
                                        <label>Our Story</label>
                                        <textarea
                                            name="story"
                                            value={aboutInfo.story}
                                            onChange={handleAboutInfoChange}
                                            className={styles.textarea}
                                            placeholder="Tell your story..."
                                        />
                                    </div>
                                    <div className={styles.formField}>
                                        <label>Location / Address</label>
                                        <textarea
                                            name="address"
                                            value={aboutInfo.address}
                                            onChange={handleAboutInfoChange}
                                            className={styles.textarea}
                                            style={{ minHeight: '80px' }}
                                            placeholder="123 Street, City..."
                                        />
                                    </div>
                                    <div className={styles.formField}>
                                        <label>Opening Hours</label>
                                        <textarea
                                            name="hours"
                                            value={aboutInfo.hours}
                                            onChange={handleAboutInfoChange}
                                            className={styles.textarea}
                                            style={{ minHeight: '80px' }}
                                            placeholder="Mon-Fri: 9-5..."
                                        />
                                    </div>
                                    <div className={styles.formField}>
                                        <label>Google Maps Embed URL</label>
                                        <input
                                            type="text"
                                            name="mapsUrl"
                                            value={aboutInfo.mapsUrl}
                                            onChange={handleAboutInfoChange}
                                            className={styles.input}
                                            placeholder="https://www.google.com/maps/embed?..."
                                        />
                                    </div>
                                    <button
                                        onClick={saveAboutInfo}
                                        className={styles.button}
                                        disabled={isSavingAbout}
                                    >
                                        {isSavingAbout ? 'Saving...' : 'Save Text Changes'}
                                    </button>
                                </div>
                            </div>

                            <div className={styles.addBarber}>
                                <h2>Carousel Images</h2>
                                <div
                                    className={styles.uploadArea}
                                    onClick={() => !isUploadingImage && document.getElementById('imageUpload')?.click()}
                                    style={{ opacity: isUploadingImage ? 0.5 : 1, cursor: isUploadingImage ? 'wait' : 'pointer' }}
                                >
                                    <p>{isUploadingImage ? 'Uploading image...' : 'Click to upload a new image to the carousel'}</p>
                                    <input
                                        id="imageUpload"
                                        type="file"
                                        accept="image/*"
                                        className={styles.hiddenInput}
                                        onChange={handleImageUpload}
                                        disabled={isUploadingImage}
                                    />
                                </div>

                                <div className={styles.imageGrid}>
                                    {aboutImages.map(img => (
                                        <div key={img.id} className={styles.imageCard}>
                                            <div
                                                className={styles.imagePreview}
                                                style={{ backgroundImage: `url(${img.url})` }}
                                            />
                                            <div className={styles.imageInfo}>
                                                <input
                                                    type="text"
                                                    value={img.title}
                                                    onChange={e => handleImageLocalChange(img.id, 'title', e.target.value)}
                                                    className={styles.input}
                                                    style={{ marginBottom: '0.5rem', width: '100%' }}
                                                    placeholder="Title"
                                                />
                                                <input
                                                    type="text"
                                                    value={img.subtitle}
                                                    onChange={e => handleImageLocalChange(img.id, 'subtitle', e.target.value)}
                                                    className={styles.input}
                                                    style={{ width: '100%' }}
                                                    placeholder="Subtitle"
                                                />
                                            </div>
                                            <div className={styles.imageActions}>
                                                <button
                                                    onClick={() => saveAboutImage(img.id)}
                                                    className={styles.button}
                                                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                                                    disabled={savingImageId === img.id}
                                                >
                                                    {savingImageId === img.id ? 'Saving...' : 'Save Changes'}
                                                </button>
                                                <button
                                                    onClick={() => deleteAboutImage(img.id)}
                                                    className={styles.deleteBtn}
                                                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}

            {selectedAppointment && (
                <div className={styles.modalOverlay}>
                    <div className={styles.styledModal}>
                        <div className={`${styles.modalHeader} ${styles[`header${selectedAppointment.status.charAt(0).toUpperCase() + selectedAppointment.status.slice(1).toLowerCase()}`]}`}>
                            <h2>Appointment Details</h2>
                            <span className={styles.statusBadge}>
                                {selectedAppointment.status}
                            </span>
                        </div>

                        <div className={styles.modalBody}>
                            <div className={styles.section}>
                                <div className={styles.sectionTitle}>Customer Info</div>
                                <div className={styles.infoRow}>
                                    <span className={styles.label}>Name</span>
                                    <span className={styles.value}>{selectedAppointment.customerName}</span>
                                </div>
                                <div className={styles.infoRow}>
                                    <span className={styles.label}>Email</span>
                                    <span className={styles.value}>{selectedAppointment.customerEmail}</span>
                                </div>
                                <div className={styles.infoRow}>
                                    <span className={styles.label}>Phone</span>
                                    <span className={styles.value}>{selectedAppointment.customerPhone || 'N/A'}</span>
                                </div>
                            </div>

                            <div className={styles.section}>
                                <div className={styles.sectionTitle}>Appointment Info</div>
                                <div className={styles.infoRow}>
                                    <span className={styles.label}>Service</span>
                                    <span className={styles.value}>{selectedAppointment.service.name}</span>
                                </div>
                                <div className={styles.infoRow}>
                                    <span className={styles.label}>Price / Duration</span>
                                    <span className={styles.value}>${selectedAppointment.service.price} / {selectedAppointment.service.duration} mins</span>
                                </div>
                                <div className={styles.infoRow}>
                                    <span className={styles.label}>Date & Time</span>
                                    <span className={styles.value}>{new Date(selectedAppointment.startDate).toLocaleString(undefined, {
                                        weekday: 'short',
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        hour12: true,
                                        timeZone: 'UTC'
                                    })}</span>
                                </div>
                            </div>
                        </div>

                        <div className={styles.modalFooter}>
                            <div className={styles.statusActions}>
                                <button
                                    onClick={() => { updateStatus(selectedAppointment.id, 'APPROVED'); setSelectedAppointment(null); }}
                                    className={`${styles.actionBtn} ${styles.btnApprove}`}
                                    disabled={selectedAppointment.status === 'APPROVED'}
                                >
                                    Approve
                                </button>
                                <button
                                    onClick={() => { updateStatus(selectedAppointment.id, 'REJECTED'); setSelectedAppointment(null); }}
                                    className={`${styles.actionBtn} ${styles.btnReject}`}
                                    disabled={selectedAppointment.status === 'REJECTED'}
                                >
                                    Reject
                                </button>
                                <button
                                    onClick={() => { updateStatus(selectedAppointment.id, 'PENDING'); setSelectedAppointment(null); }}
                                    className={`${styles.actionBtn} ${styles.btnPending}`}
                                    disabled={selectedAppointment.status === 'PENDING'}
                                >
                                    Set Pending
                                </button>
                            </div>
                            <button onClick={() => setSelectedAppointment(null)} className={styles.closeBtn}>Close Details</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
