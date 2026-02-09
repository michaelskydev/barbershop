import { StyleSheet, ScrollView, Image } from 'react-native';

import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';

export default function AboutScreen() {
    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Our Story</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.text}>
                    At Gentlemen's Cut, we believe that a great haircut is more than just a service—it's an investment in yourself.
                    Our team of master barbers is dedicated to helping you look and feel your absolute best.
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.subtitle}>Get In Touch</Text>
                <Text style={styles.text}>
                    Location: 123 Barber Lane, Cityville{'\n'}
                    Hours: Mon-Fri 9am - 8pm{'\n'}
                    Phone: (555) 123-4567
                </Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.dark.background,
    },
    header: {
        padding: 20,
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: Colors.dark.tint,
    },
    section: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: Colors.dark.surface,
    },
    subtitle: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 10,
        color: Colors.dark.text,
    },
    text: {
        fontSize: 16,
        lineHeight: 24,
        color: Colors.dark.text,
    },
});
