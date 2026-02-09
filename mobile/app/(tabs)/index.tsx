import { StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import { Link, router } from 'expo-router';

import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Refine Your Style.</Text>
        <Text style={styles.subtitle}>Premium grooming for the modern gentleman.</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/book')}
        >
          <Text style={styles.buttonText}>Book Appointment</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: Colors.dark.text, // Force light text for dark theme vibe
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 40,
    color: Colors.dark.textMuted,
  },
  button: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 8,
    shadowColor: '#c29b5e4d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  buttonText: {
    color: '#1a1a1a',
    fontSize: 18,
    fontWeight: '600',
  },
});
