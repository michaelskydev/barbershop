"use client";

import { useState } from 'react';
import styles from './page.module.css';

type CalendarProps = {
    selectedDate: string;
    onDateChange: (date: string) => void;
    minDate?: string;
};

export default function Calendar({ selectedDate, onDateChange, minDate }: CalendarProps) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [viewDate, setViewDate] = useState(new Date(selectedDate || today));

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
    const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

    const isSelected = (day: number) => {
        const d = new Date(year, month, day);
        return d.toISOString().split('T')[0] === selectedDate;
    };

    const isDisabled = (day: number) => {
        if (!minDate) return false;
        const d = new Date(year, month, day);
        const min = new Date(minDate);
        return d < min;
    };

    const handleSelect = (day: number) => {
        if (isDisabled(day)) return;
        const d = new Date(year, month, day);
        onDateChange(d.toISOString().split('T')[0]);
    };

    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
        days.push(<div key={`empty-${i}`} className={styles.calendarDayEmpty}></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        days.push(
            <div
                key={day}
                className={`${styles.calendarDay} ${isSelected(day) ? styles.calendarDaySelected : ''} ${isDisabled(day) ? styles.calendarDayDisabled : ''}`}
                onClick={() => handleSelect(day)}
            >
                {day}
            </div>
        );
    }

    return (
        <div className={styles.calendarContainer}>
            <div className={styles.calendarHeader}>
                <button onClick={prevMonth} className={styles.calendarNav}>&lt;</button>
                <div className={styles.calendarTitle}>{monthNames[month]} {year}</div>
                <button onClick={nextMonth} className={styles.calendarNav}>&gt;</button>
            </div>
            <div className={styles.calendarWeekdays}>
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                    <div key={d} className={styles.calendarWeekday}>{d}</div>
                ))}
            </div>
            <div className={styles.calendarGrid}>
                {days}
            </div>
        </div>
    );
}
