import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, ScrollView, Image, View, Text, Dimensions, TextInput, TouchableOpacity, ActivityIndicator, Alert, Linking, Animated, Platform } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import Colors from '@/constants/Colors';
import { API_URL } from '@/constants/Config';

type AboutInfo = {
    story: string;
    address: string;
    hours: string;
    mapsUrl?: string;
};

type AboutImage = {
    url: string;
    title: string;
    subtitle: string;
};

export default function AboutScreen() {
    const [loading, setLoading] = useState(true);
    const [info, setInfo] = useState<AboutInfo | null>(null);
    const [images, setImages] = useState<AboutImage[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', message: '' });

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    const width = Dimensions.get('window').width;

    const BASE_URL = API_URL.replace('/api', '');

    const normalizeUrl = (url: string) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        return `${BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
    };

    const openMap = () => {
        if (info?.mapsUrl) {
            Linking.openURL(info.mapsUrl);
        } else if (info?.address) {
            const encodedAddress = encodeURIComponent(info.address);
            const url = Platform.select({
                ios: `maps:0,0?q=${encodedAddress}`,
                android: `geo:0,0?q=${encodedAddress}`,
                default: `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`
            });
            Linking.openURL(url);
        }
    };

    useEffect(() => {
        fetchAboutData();
    }, []);

    useEffect(() => {
        if (!loading) {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 800,
                    useNativeDriver: true,
                })
            ]).start();
        }
    }, [loading]);

    const fetchAboutData = async () => {
        try {
            const [infoRes, imagesRes] = await Promise.all([
                fetch(`${API_URL}/about`),
                fetch(`${API_URL}/about/images`)
            ]);
            setInfo(await infoRes.json());
            setImages(await imagesRes.json());
        } catch (error) {
            console.error('Failed to fetch about data:', error);
            Alert.alert('Error', 'Failed to load about information.');
        } finally {
            setLoading(false);
        }
    };

    const handleContactSubmit = async () => {
        if (!form.name || !form.email || !form.message) {
            Alert.alert('Error', 'Please fill in all fields.');
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch(`${API_URL}/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });

            if (res.ok) {
                Alert.alert('Success', "Thank you for your message! We'll get back to you soon.");
                setForm({ name: '', email: '', message: '' });
            } else {
                throw new Error('Failed to send message');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to send message. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color={Colors.dark.tint} />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
            <View style={styles.header}>
                <Text style={styles.title}>Our Story</Text>
            </View>

            {images.length > 0 && (
                <View style={styles.carouselContainer}>
                    <Carousel
                        loop
                        width={width}
                        height={250}
                        autoPlay={true}
                        data={images}
                        scrollAnimationDuration={1000}
                        onSnapToItem={(index) => console.log('current index:', index)}
                        renderItem={({ item }) => (
                            <View style={styles.slide}>
                                <Image source={{ uri: normalizeUrl(item.url) }} style={styles.image} />
                                <View style={styles.carouselOverlay}>
                                    <Text style={styles.slideTitle}>{item.title}</Text>
                                    <Text style={styles.slideSubtitle}>{item.subtitle}</Text>
                                </View>
                            </View>
                        )}
                    />
                </View>
            )}

            <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                <View style={styles.section}>
                    <Text style={styles.text}>{info?.story || 'No story found.'}</Text>
                </View>

                <View style={styles.infoRow}>
                    <TouchableOpacity style={styles.infoCard} onPress={openMap}>
                        <Text style={styles.infoLabel}>Location 📍</Text>
                        <Text style={styles.infoValue}>{info?.address}</Text>
                        <Text style={styles.clickHint}>Tap to open in Maps</Text>
                    </TouchableOpacity>
                    <View style={styles.infoCard}>
                        <Text style={styles.infoLabel}>Hours ⏰</Text>
                        <Text style={styles.infoValue}>{info?.hours}</Text>
                    </View>
                </View>

                <View style={styles.contactSection}>
                    <Text style={styles.subtitle}>Get In Touch</Text>

                    <Text style={styles.label}>Full Name</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="John Doe"
                        placeholderTextColor="#666"
                        value={form.name}
                        onChangeText={(val) => setForm({ ...form, name: val })}
                    />

                    <Text style={styles.label}>Email Address</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="john@example.com"
                        placeholderTextColor="#666"
                        autoCapitalize="none"
                        keyboardType="email-address"
                        value={form.email}
                        onChangeText={(val) => setForm({ ...form, email: val })}
                    />

                    <Text style={styles.label}>Message</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="How can we help you?"
                        placeholderTextColor="#666"
                        multiline
                        numberOfLines={4}
                        value={form.message}
                        onChangeText={(val) => setForm({ ...form, message: val })}
                    />

                    <TouchableOpacity
                        style={[styles.button, submitting && styles.buttonDisabled]}
                        onPress={handleContactSubmit}
                        disabled={submitting}
                    >
                        <Text style={styles.buttonText}>{submitting ? 'Sending...' : 'Send Message'}</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.dark.background,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        padding: 20,
        alignItems: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: Colors.dark.tint,
        letterSpacing: 1,
    },
    carouselContainer: {
        height: 250,
        backgroundColor: '#000',
    },
    slide: {
        flex: 1,
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
        opacity: 0.7,
    },
    carouselOverlay: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
    },
    slideTitle: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
    },
    slideSubtitle: {
        color: Colors.dark.tint,
        fontSize: 14,
        fontWeight: '600',
        marginTop: 4,
    },
    section: {
        padding: 25,
    },
    text: {
        fontSize: 16,
        lineHeight: 26,
        color: Colors.dark.text,
        textAlign: 'justify',
    },
    infoRow: {
        paddingHorizontal: 20,
        marginBottom: 20,
        flexDirection: 'row',
        gap: 15,
    },
    infoCard: {
        flex: 1,
        backgroundColor: Colors.dark.surface,
        padding: 15,
        borderRadius: 12,
        borderLeftWidth: 3,
        borderLeftColor: Colors.dark.tint,
    },
    infoLabel: {
        color: Colors.dark.tint,
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 5,
        textTransform: 'uppercase',
    },
    infoValue: {
        color: Colors.dark.text,
        fontSize: 15,
        lineHeight: 22,
    },
    clickHint: {
        color: Colors.dark.textMuted,
        fontSize: 10,
        marginTop: 8,
        fontStyle: 'italic',
    },
    contactSection: {
        padding: 25,
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderRadius: 20,
        marginHorizontal: 20,
    },
    subtitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: Colors.dark.tint,
    },
    label: {
        color: Colors.dark.textMuted,
        fontSize: 14,
        marginBottom: 8,
    },
    input: {
        backgroundColor: Colors.dark.surface,
        borderRadius: 10,
        padding: 15,
        color: Colors.dark.text,
        fontSize: 16,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    textArea: {
        height: 120,
        textAlignVertical: 'top',
    },
    button: {
        backgroundColor: Colors.dark.tint,
        padding: 18,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    buttonText: {
        color: '#1a1a1a',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
