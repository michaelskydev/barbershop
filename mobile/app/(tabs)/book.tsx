import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, Platform, View, Text, KeyboardAvoidingView } from 'react-native';
import { router } from 'expo-router';
import CalendarPicker from '@/components/CalendarPicker';

import Colors from '@/constants/Colors';
import { API_URL } from '@/constants/Config';

type Barber = { id: number; name: string; color: string };
type Service = { id: number; name: string; duration: number; price: number };

export default function BookScreen() {
    const [step, setStep] = useState(1);
    const [barbers, setBarbers] = useState<Barber[]>([]);
    const [services, setServices] = useState<Service[]>([]);

    const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
    const [selectedService, setSelectedService] = useState<Service | null>(null);

    // Date handling
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [availableSlots, setAvailableSlots] = useState<string[]>([]);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [loadingSlots, setLoadingSlots] = useState(false);

    // Customer details
    const [customerName, setCustomerName] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');

    const [submitting, setSubmitting] = useState(false);
    const [bookSuccess, setBookSuccess] = useState(false);

    const resetForm = () => {
        setStep(1);
        setSelectedBarber(null);
        setSelectedService(null);
        setDate(new Date());
        setSelectedTime(null);
        setCustomerName('');
        setCustomerEmail('');
        setCustomerPhone('');
        setBookSuccess(false);
    };

    useEffect(() => {
        fetchBarbersAndServices();
    }, []);

    useEffect(() => {
        if (selectedBarber && date) {
            fetchSlots();
        }
    }, [selectedBarber, date]);

    const fetchBarbersAndServices = async () => {
        try {
            const [barbersRes, servicesRes] = await Promise.all([
                fetch(`${API_URL}/barbers`),
                fetch(`${API_URL}/services`)
            ]);
            const barbersData = await barbersRes.json();
            const servicesData = await servicesRes.json();
            setBarbers(barbersData);
            setServices(servicesData);
        } catch (error) {
            Alert.alert(
                'Connection Error',
                `Failed to load data from ${API_URL}.\n\nCheck your network connection and ensure the server is running.\n\nError details: ${error}`
            );
            console.error(error);
        }
    };

    const fetchSlots = async () => {
        setLoadingSlots(true);
        setAvailableSlots([]);
        try {
            const dateStr = date.toISOString().split('T')[0];
            const res = await fetch(`${API_URL}/slots?barberId=${selectedBarber?.id}&date=${dateStr}`);
            const data = await res.json();
            setAvailableSlots(data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingSlots(false);
        }
    };

    const handleDateChange = (selectedDate: Date) => {
        setDate(selectedDate);
        setSelectedTime(null);
    };

    const handleSubmit = async () => {
        console.log('handleSubmit triggered');
        if (!customerName || !customerEmail) {
            console.log('Validation failed: missing name or email');
            Alert.alert('Error', 'Please fill in your name and email.');
            return;
        }

        if (!selectedBarber || !selectedService || !selectedTime) {
            console.log('Validation failed: missing selections', { selectedBarber: !!selectedBarber, selectedService: !!selectedService, selectedTime: !!selectedTime });
            Alert.alert('Error', 'Please complete all selection steps.');
            return;
        }

        setSubmitting(true);
        try {
            const dateStr = date.toISOString().split('T')[0];
            const startDate = `${dateStr}T${selectedTime}:00.000Z`;

            const payload = {
                barberId: selectedBarber.id,
                serviceId: selectedService.id,
                startDate: startDate,
                customerName,
                customerEmail,
                customerPhone
            };

            console.log('Sending booking request to:', `${API_URL}/appointments`);
            console.log('Payload:', JSON.stringify(payload));

            const res = await fetch(`${API_URL}/appointments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            console.log('Response Status:', res.status);

            if (res.ok) {
                console.log('Booking successful');
                setBookSuccess(true);

                // Fallback for Web/Browser environments
                if (Platform.OS === 'web') {
                    alert('Success: Appointment booked successfully!');
                }

                Alert.alert('Success', 'Appointment booked successfully!', [
                    {
                        text: 'OK',
                        onPress: () => {
                            resetForm();
                            router.replace('/');
                        }
                    }
                ]);

                // Auto-clear and navigate after a delay if alert is missed
                setTimeout(() => {
                    if (bookSuccess) {
                        resetForm();
                    }
                }, 3000);

            } else {
                const errorData = await res.json().catch(() => ({ error: 'Unknown server error' }));
                console.error('Booking failed server-side:', errorData);
                throw new Error(errorData.error || errorData.details || 'Booking failed');
            }
        } catch (error) {
            console.error('handleSubmit error:', error);
            Alert.alert('Booking Error', `Failed: ${error}`);
            if (Platform.OS === 'web') {
                alert(`Booking Error: ${error}`);
            }
        } finally {
            setSubmitting(false);
        }
    };

    // Helper to format time
    const formatTime = (time: string) => {
        const [h, m] = time.split(':');
        const hour = parseInt(h);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${m} ${ampm}`;
    };

    const renderStep1 = () => (
        <View style={styles.stepContainer}>
            <Text style={styles.header}>Select Barber</Text>
            {barbers.map((barber: Barber) => (
                <TouchableOpacity
                    key={barber.id}
                    style={[styles.card, selectedBarber?.id === barber.id && styles.selectedCard]}
                    onPress={() => setSelectedBarber(barber)}
                >
                    <View style={[styles.avatar, { backgroundColor: barber.color }]}>
                        <Text style={styles.avatarText}>{barber.name[0]}</Text>
                    </View>
                    <Text style={styles.cardText}>{barber.name}</Text>
                </TouchableOpacity>
            ))}
        </View>
    );

    const renderStep2 = () => (
        <View style={styles.stepContainer}>
            <Text style={styles.header}>Select Service</Text>
            {services.map((service: Service) => (
                <TouchableOpacity
                    key={service.id}
                    style={[styles.card, selectedService?.id === service.id && styles.selectedCard]}
                    onPress={() => setSelectedService(service)}
                >
                    <View>
                        <Text style={styles.cardText}>{service.name}</Text>
                        <Text style={styles.subText}>{service.duration} mins</Text>
                    </View>
                    <Text style={styles.priceText}>${service.price}</Text>
                </TouchableOpacity>
            ))}
        </View>
    );

    const renderStep3 = () => (
        <View style={styles.stepContainer}>
            <Text style={styles.header}>Select Date & Time</Text>

            <CalendarPicker
                selectedDate={date}
                onDateChange={handleDateChange}
                minimumDate={new Date()}
            />

            <View style={{ marginTop: 25 }}>
                <Text style={styles.slotsHeader}>Available Times</Text>
                {loadingSlots ? (
                    <Text style={styles.infoText}>Loading slots...</Text>
                ) : availableSlots.length > 0 ? (
                    <View style={styles.slotsGrid}>
                        {availableSlots.map((time: string) => (
                            <TouchableOpacity
                                key={time}
                                style={[styles.timeSlot, selectedTime === time && styles.selectedTimeSlot]}
                                onPress={() => setSelectedTime(time)}
                            >
                                <Text style={[styles.timeText, selectedTime === time && styles.selectedTimeText]}>
                                    {formatTime(time)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                ) : (
                    <Text style={styles.infoText}>No slots available for this date.</Text>
                )}
            </View>
        </View>
    );

    const renderStep4 = () => (
        <View style={styles.stepContainer}>
            <Text style={styles.header}>Your Details</Text>

            <View style={styles.summaryBox}>
                <Text style={styles.summaryText}>Service: {selectedService?.name}</Text>
                <Text style={styles.summaryText}>Barber: {selectedBarber?.name}</Text>
                <Text style={styles.summaryText}>Time: {date.toDateString()} at {selectedTime && formatTime(selectedTime)}</Text>
            </View>

            <Text style={styles.label}>Full Name</Text>
            <TextInput
                style={styles.textInput}
                placeholder="John Doe"
                placeholderTextColor="#666"
                value={customerName}
                onChangeText={setCustomerName}
            />

            <Text style={styles.label}>Email Address</Text>
            <TextInput
                style={styles.textInput}
                placeholder="john@example.com"
                placeholderTextColor="#666"
                value={customerEmail}
                onChangeText={setCustomerEmail}
                autoCapitalize="none"
                keyboardType="email-address"
            />

            <Text style={styles.label}>Phone (Optional)</Text>
            <TextInput
                style={styles.textInput}
                placeholder="(555) 123-4567"
                placeholderTextColor="#666"
                value={customerPhone}
                onChangeText={setCustomerPhone}
                keyboardType="phone-pad"
            />
        </View>
    );

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {bookSuccess ? (
                    <View style={styles.successStep}>
                        <Text style={styles.successTitle}>Booking Confirmed!</Text>
                        <Text style={styles.successText}>We've received your appointment request. See you soon!</Text>
                        <TouchableOpacity style={styles.button} onPress={() => { resetForm(); router.replace('/'); }}>
                            <Text style={styles.buttonText}>Back to Home</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <>
                        {step === 1 && renderStep1()}
                        {step === 2 && renderStep2()}
                        {step === 3 && renderStep3()}
                        {step === 4 && renderStep4()}
                    </>
                )}
            </ScrollView>

            {!bookSuccess && (
                <View style={styles.footer}>
                    {step > 1 && (
                        <TouchableOpacity style={styles.backButton} onPress={() => setStep(step - 1)}>
                            <Text style={styles.backButtonText}>Back</Text>
                        </TouchableOpacity>
                    )}

                    {step < 4 ? (
                        <TouchableOpacity
                            style={[styles.button, { opacity: (step === 1 && !selectedBarber) || (step === 2 && !selectedService) || (step === 3 && !selectedTime) ? 0.5 : 1 }]}
                            onPress={() => setStep(step + 1)}
                            disabled={(step === 1 && !selectedBarber) || (step === 2 && !selectedService) || (step === 3 && !selectedTime)}
                        >
                            <Text style={styles.buttonText}>Continue</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            style={styles.button}
                            onPress={handleSubmit}
                            disabled={submitting}
                        >
                            <Text style={styles.buttonText}>{submitting ? 'Booking...' : 'Confirm Booking'}</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.dark.background,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 100,
    },
    stepContainer: {
        flex: 1,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.dark.tint,
        marginBottom: 20,
    },
    card: {
        backgroundColor: Colors.dark.surface,
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    selectedCard: {
        borderColor: Colors.dark.tint,
        backgroundColor: '#3a3a3a',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 15,
    },
    avatarText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 18,
    },
    cardText: {
        fontSize: 18,
        color: Colors.dark.text,
        fontWeight: '600',
    },
    subText: {
        color: Colors.dark.textMuted,
        marginTop: 2,
    },
    priceText: {
        fontSize: 18,
        color: Colors.dark.tint,
        fontWeight: 'bold',
        marginLeft: 'auto',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        backgroundColor: Colors.dark.background,
        borderTopWidth: 1,
        borderTopColor: Colors.dark.surface,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    button: {
        backgroundColor: Colors.dark.tint,
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 8,
        flex: 1,
        alignItems: 'center',
        marginLeft: 10,
    },
    buttonText: {
        color: '#1a1a1a',
        fontWeight: 'bold',
        fontSize: 16,
    },
    backButton: {
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 8,
        backgroundColor: Colors.dark.surface,
    },
    backButtonText: {
        color: Colors.dark.text,
        fontSize: 16,
    },
    slotsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    timeSlot: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        backgroundColor: Colors.dark.surface,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    selectedTimeSlot: {
        borderColor: Colors.dark.tint,
        backgroundColor: Colors.dark.tint,
    },
    timeText: {
        color: Colors.dark.text,
        fontWeight: '600',
    },
    selectedTimeText: {
        color: '#1a1a1a',
    },
    infoText: {
        color: Colors.dark.textMuted,
        fontStyle: 'italic',
        marginTop: 10,
    },
    input: {
        backgroundColor: Colors.dark.surface,
        padding: 15,
        borderRadius: 8,
        marginBottom: 20,
    },
    inputText: {
        color: Colors.dark.text,
        fontSize: 16,
    },
    textInput: {
        backgroundColor: Colors.dark.surface,
        padding: 15,
        borderRadius: 8,
        marginBottom: 15,
        color: Colors.dark.text,
        fontSize: 16,
    },
    label: {
        color: Colors.dark.textMuted,
        marginBottom: 5,
        fontSize: 14,
    },
    summaryBox: {
        backgroundColor: Colors.dark.surface,
        padding: 15,
        borderRadius: 8,
        marginBottom: 25,
        borderLeftWidth: 4,
        borderLeftColor: Colors.dark.tint,
    },
    summaryText: {
        color: Colors.dark.text,
        marginBottom: 5,
        fontSize: 16,
    },
    iosPickerContainer: {
        backgroundColor: Colors.dark.surface,
        borderRadius: 12,
        marginTop: 10,
        paddingBottom: 10,
    },
    doneButton: {
        padding: 10,
        alignItems: 'flex-end',
        borderBottomWidth: 1,
        borderBottomColor: '#444',
    },
    doneButtonText: {
        color: Colors.dark.tint,
        fontWeight: 'bold',
        fontSize: 16,
    },
    successStep: {
        alignItems: 'center',
        paddingVertical: 50,
    },
    successTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: Colors.dark.tint,
        marginBottom: 15,
        textAlign: 'center',
    },
    successText: {
        fontSize: 18,
        color: Colors.dark.text,
        textAlign: 'center',
        marginBottom: 30,
        lineHeight: 26,
    },
    slotsHeader: {
        fontSize: 16,
        color: Colors.dark.textMuted,
        fontWeight: 'bold',
        marginBottom: 15,
        textTransform: 'uppercase',
    },
});
