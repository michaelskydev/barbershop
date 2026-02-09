import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import Colors from '@/constants/Colors';

type CalendarPickerProps = {
    selectedDate: Date;
    onDateChange: (date: Date) => void;
    minimumDate?: Date;
};

export default function CalendarPicker({ selectedDate, onDateChange, minimumDate }: CalendarPickerProps) {
    const [viewDate, setViewDate] = useState(new Date(selectedDate));

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
        return selectedDate.getDate() === day &&
            selectedDate.getMonth() === month &&
            selectedDate.getFullYear() === year;
    };

    const isDisabled = (day: number) => {
        if (!minimumDate) return false;
        const d = new Date(year, month, day);
        d.setHours(0, 0, 0, 0);
        const min = new Date(minimumDate);
        min.setHours(0, 0, 0, 0);
        return d < min;
    };

    const handleSelect = (day: number) => {
        if (isDisabled(day)) return;
        const d = new Date(year, month, day);
        onDateChange(d);
    };

    const calendarGrid = [];
    // Empty slots for previous month
    for (let i = 0; i < firstDayOfMonth; i++) {
        calendarGrid.push(<View key={`empty-${i}`} style={styles.dayEmpty} />);
    }

    // Days for current month
    for (let day = 1; day <= daysInMonth; day++) {
        const selected = isSelected(day);
        const disabled = isDisabled(day);

        calendarGrid.push(
            <TouchableOpacity
                key={day}
                style={[styles.day, selected && styles.daySelected, disabled && styles.dayDisabled]}
                onPress={() => handleSelect(day)}
                disabled={disabled}
            >
                <Text style={[styles.dayText, selected && styles.dayTextSelected, disabled && styles.dayTextDisabled]}>
                    {day}
                </Text>
            </TouchableOpacity>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={prevMonth} style={styles.navButton}>
                    <Text style={styles.navText}>&lt;</Text>
                </TouchableOpacity>
                <Text style={styles.monthTitle}>{monthNames[month]} {year}</Text>
                <TouchableOpacity onPress={nextMonth} style={styles.navButton}>
                    <Text style={styles.navText}>&gt;</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.weekdays}>
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                    <Text key={d} style={styles.weekdayText}>{d}</Text>
                ))}
            </View>
            <View style={styles.grid}>
                {calendarGrid}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.dark.surface,
        borderRadius: 16,
        padding: 15,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    monthTitle: {
        color: Colors.dark.tint,
        fontSize: 18,
        fontWeight: 'bold',
    },
    navButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 20,
    },
    navText: {
        color: '#fff',
        fontSize: 18,
    },
    weekdays: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    weekdayText: {
        color: Colors.dark.textMuted,
        width: '14.28%',
        textAlign: 'center',
        fontSize: 12,
        fontWeight: 'bold',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    day: {
        width: '14.28%',
        aspectRatio: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
    },
    dayEmpty: {
        width: '14.28%',
    },
    dayText: {
        color: Colors.dark.text,
        fontSize: 14,
    },
    daySelected: {
        backgroundColor: Colors.dark.tint,
    },
    dayTextSelected: {
        color: '#1a1a1a',
        fontWeight: 'bold',
    },
    dayDisabled: {
        opacity: 0.2,
    },
    dayTextDisabled: {
        textDecorationLine: 'none',
    },
});
