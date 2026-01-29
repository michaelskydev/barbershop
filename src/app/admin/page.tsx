"use client";

import { useState, useEffect } from 'react';
import styles from './page.module.css';

type Barber = { id: number; name: string; color: string };
type Appointment = {
    id: number;
    startDate: string;
    status: string;
    customerName: string;
    service: { name: string; duration: number };
    barberId: number;
};

export default function AdminPage() {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [barbers, setBarbers] = useState<Barber[]>([]);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        const [barbersRes, appointmentsRes] = await Promise.all([
            fetch('/api/barbers'),
            fetch(`/api/appointments?date=${date}`)
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

    const [tab, setTab] = useState<'calendar' | 'barbers'>('calendar');
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
        for (let i = 1; i <= 6; i++) { // Mon-Sat
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

    const hours = [9, 10, 11, 12, 13, 14, 15, 16, 17]; // 9am to 6pm
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>Admin Dashboard</h1>
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
                                        {h > 12 ? h - 12 : h} {h >= 12 ? 'PM' : 'AM'}
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
                                            {/* Background lines for hours */
                                                hours.map(h => (
                                                    <div key={h} className={styles.hourCell}></div>
                                                ))
                                            }

                                            {/* Render Appointments */
                                                appointments
                                                    .filter(app => app.barberId === barber.id)
                                                    .map(app => {
                                                        const start = new Date(app.startDate);
                                                        const startHour = start.getHours();
                                                        const startMin = start.getMinutes();
                                                        const offsetMinutes = (startHour - 9) * 60 + startMin;
                                                        const top = offsetMinutes * (100 / 60);
                                                        const height = app.service.duration * (100 / 60);

                                                        return (
                                                            <div
                                                                key={app.id}
                                                                className={`${styles.appointment} ${styles[app.status.toLowerCase()]}`}
                                                                style={{ top: `${top}px`, height: `${height}px` }}
                                                            >
                                                                <div className={styles.appTime}>
                                                                    {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </div>
                                                                <div className={styles.appName}>{app.customerName}</div>
                                                                <div className={styles.appService}>{app.service.name}</div>

                                                                {app.status === 'PENDING' && (
                                                                    <div className={styles.actions}>
                                                                        <button onClick={() => updateStatus(app.id, 'APPROVED')} title="Approve">✓</button>
                                                                        <button onClick={() => updateStatus(app.id, 'REJECTED')} title="Reject">✕</button>
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
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
