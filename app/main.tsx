import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Keyboard, Pressable, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import storage from './lib/storage';

export default function Main() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const s = await storage.getSavedStats();
        if (!mounted) return;
        setStats(s);
      } catch (e: any) {
        console.warn('main: failed to load stats', e);
        if (mounted) setError(String(e?.message ?? e));
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.text}>Loading saved garden…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
        <View style={styles.inner}>
          {error ? <Text style={styles.text}>Error loading: {error}</Text> : null}

          {stats ? (
            <View style={styles.preview}>
              <Text style={styles.title}>Saved Garden</Text>
              <Text style={styles.text}>Dominant: {stats.dominant ?? '—'}</Text>
              <Text style={styles.text}>Energy: {stats.energy}</Text>
              <Text style={styles.text}>Creativity: {stats.creativity}</Text>
              <Text style={styles.text}>Calmness: {stats.calmness}</Text>
              <Text style={styles.text}>Kindness: {stats.kindness}</Text>
              <Text style={styles.text}>Discipline: {stats.discipline}</Text>
            </View>
          ) : (
            <View style={styles.previewEmpty}>
              <Text style={styles.title}>No saved garden</Text>
              <Text style={styles.text}>Start a new garden to save your results.</Text>
            </View>
          )}

          <View style={styles.buttons}>
            {stats ? (
              <Pressable style={styles.button} onPress={() => router.replace('/result')}>
                <Text style={styles.buttonText}>View Result</Text>
              </Pressable>
            ) : null}

            <Pressable
              style={[styles.button, styles.secondary]}
              onPress={async () => {
                // start fresh: clear saved stats and go to form
                await storage.clearStats();
                router.replace('/form');
              }}
            >
              <Text style={styles.buttonText}>Start New Garden</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  inner: { flex: 1, padding: 20, justifyContent: 'center' },
  preview: { alignItems: 'center', marginBottom: 24 },
  previewEmpty: { alignItems: 'center', marginBottom: 24 },
  title: { color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 8 },
  text: { color: '#fff', fontSize: 14, marginTop: 6 },
  buttons: { marginTop: 20, alignItems: 'center' },
  button: { backgroundColor: '#fff', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8, marginBottom: 12 },
  secondary: { backgroundColor: '#444' },
  buttonText: { color: '#000', fontWeight: '700' },
});