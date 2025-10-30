import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { FLOWER_ASSETS } from '../components/QuestionTemplate';

const STORAGE_STATS = "@bloomly_stats";

export default function MainLoader() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_STATS);
        if (!mounted) return;
        if (raw) {
          // try to convert stored flower key -> resolved local asset URI so main can show it
          try {
            const parsed = JSON.parse(raw);
            if (parsed && parsed.image && typeof parsed.image === 'string') {
              const key = parsed.image;
              const asset = (FLOWER_ASSETS as any)[key];
              if (asset) {
                // resolve the require(...) to a URI and persist the resolved URI
                const resolved = Image.resolveAssetSource(asset)?.uri;
                if (resolved) {
                  parsed.image = resolved;
                  await AsyncStorage.setItem(STORAGE_STATS, JSON.stringify(parsed));
                }
              }
            }
          } catch (e) {
            // ignore parse/resolve errors and proceed to route
          }
          router.replace('/main');
        } else {
          router.replace('/form');
        }
      } catch (e: any) {
        console.warn('Main loader failed to read saved stats', e);
        if (mounted) setError(String(e?.message ?? e));
        try {
          router.replace('/form');
        } catch (_e) {}
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        {loading ? (
          <>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.text}>Loading your garden…</Text>
          </>
        ) : error ? (
          <Text style={styles.text}>Error: {error}</Text>
        ) : (
          <Text style={styles.text}>Redirecting…</Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  inner: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  text: { color: '#fff', marginTop: 12 },
});
