import AsyncStorage from "@react-native-async-storage/async-storage";
import { Asset } from "expo-asset";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Animated, Image, Keyboard, StyleSheet, TouchableWithoutFeedback } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import QuestionTemplate, { Question } from "../../components/QuestionTemplate";
import { Colors } from "../../constants/Colors";

const questions: Question[] = [
  {
    id: 'q1',
    prompt: 'When do you feel most productive?',
    image: require('../../assets/images/sunflower.png'),
    options: ['Morning', 'Afternoon', 'Evening', 'Night'],
    effects: {
      Morning: { discipline: 10, energy: 5 },
      Afternoon: { energy: 10 },
      Evening: { creativity: 5, calmness: -5 },
      Night: { creativity: 10, discipline: -5 },
    } as any,
  },
  {
    id: 'q2',
    prompt: 'How many hours do you usually sleep?',
    image: require('../../assets/images/lavender.png'),
    options: ['< 3', '4–6', '7–8', '9+'],
    effects: {
      '< 3': { energy: -15, calmness: -20, creativity: 5 },
      '4–6': { energy: -5, calmness: -5 },
      '7–8': { energy: 5, calmness: 5 },
      '9+': { calmness: 10, energy: -2 },
    } as any,
  },

  {
    id: 'q3',
    prompt: 'How often do you go for a walk or exercise?',
    image: require('../../assets/images/china.png'),
    options: ['Rarely', 'A few times a week', 'Daily'],
    effects: {
      'Rarely': { energy: -10, calmness: 5 },
      'A few times a week': { energy: 5, discipline: 5 },
      'Daily': { energy: 10, discipline: 5, calmness: 3 },
    } as any,
  },
  {
    id: 'q4',
    prompt: 'Do you enjoy being outside?',
    image: require('../../assets/images/flower.png'),
    options: ['Yes, I love it', 'Sometimes', 'Not really'],
    effects: {
      'Yes, I love it': { calmness: 10, creativity: 5 },
      'Sometimes': { calmness: 3 },
      'Not really': { creativity: -2, discipline: 3 },
    } as any,
  },

  // --- Added: Hobbies & Focus (creativity / routine) ---
  {
    id: 'q5',
    prompt: 'What kind of activities do you enjoy most?',
    image: require('../../assets/images/orchid.png'),
    options: ['Creative (art, writing, music)', 'Productive (studying, organizing)', 'Relaxing (gaming, reading, resting)'],
    effects: {
      'Creative (art, writing, music)': { creativity: 10 },
      'Productive (studying, organizing)': { discipline: 10, energy: 2 },
      'Relaxing (gaming, reading, resting)': { calmness: 8, creativity: 2 },
    } as any,
  },
  {
    id: 'q6',
    prompt: 'How often do you start new projects or hobbies?',
    image: require('../../assets/images/vine.png'),
    options: ['Rarely', 'Sometimes', 'Often'],
    effects: {
      'Rarely': { discipline: 5 },
      'Sometimes': { discipline: 3, creativity: 3 },
      'Often': { creativity: 8, energy: -2 },
    } as any,
  },

  {
    id: 'q7',
    prompt: 'Do you prefer spending time with others or alone?',
    image: require('../../assets/images/english-ivy.png'),
    options: ['With others', 'A mix', 'Alone'],
    effects: {
      'With others': { kindness: 10, energy: 5 },
      'A mix': { kindness: 5, calmness: 2 },
      'Alone': { kindness: -2, creativity: 3 },
    } as any,
  },
  {
    id: 'q8',
    prompt: 'How do you usually motivate yourself?',
    image: require('../../assets/images/red-rose.png'),
    options: ['Rewards and goals', 'Inspiration or mood', 'Others motivating me'],
    effects: {
      'Rewards and goals': { discipline: 10 },
      'Inspiration or mood': { creativity: 8 },
      'Others motivating me': { kindness: 5, discipline: 2 },
    } as any,
  },
];

const image = require('../../assets/images/blankBackground.png');
const STORAGE_KEY = "@bloomly_answers";
const STORAGE_STATS = "@bloomly_stats";

export type Stats = {
  energy: number;
  creativity: number;
  calmness: number;
  kindness: number;
  discipline: number;
  // added metadata for trust & transparency
  confidences?: { [trait: string]: number };
  counts?: { [trait: string]: number };
  // dominant trait/flower saved for convenience (optional)
  dominant?: string;
};

const DEFAULT_STATS: Stats = {
  energy: 50,
  creativity: 50,
  calmness: 50,
  kindness: 50,
  discipline: 50,
  confidences: undefined,
  counts: undefined,
};

export function computeStats(answers: string[], questionsArr?: Question[]): Stats {
  const clamp = (v: number) => Math.max(0, Math.min(100, Math.round(v)));

  const traitNames = ['energy', 'creativity', 'calmness', 'kindness', 'discipline'];

  const QUESTION_TRAIT_WEIGHTS: Record<string, Partial<Record<string, number>>> = {
    q1: { discipline: 0.7, energy: 0.3 },
    q2: { energy: 0.8, calmness: 0.2 },
    q3: { energy: 0.6, discipline: 0.4 },
    q4: { calmness: 0.7, creativity: 0.3 },
    q5: { creativity: 0.7, discipline: 0.3 },
    q6: { creativity: 0.6, discipline: 0.4 },
    q7: { kindness: 0.7, energy: 0.3 },
    q8: { discipline: 0.6, creativity: 0.4 },
  };

  // accumulate
  const explicitContributions: Record<string, number> = { energy: 0, creativity: 0, calmness: 0, kindness: 0, discipline: 0 };
  const explicitCounts: Record<string, number> = { energy: 0, creativity: 0, calmness: 0, kindness: 0, discipline: 0 };
  const weightedSums: Record<string, number> = { energy: 0, creativity: 0, calmness: 0, kindness: 0, discipline: 0 };
  const totalWeights: Record<string, number> = { energy: 0, creativity: 0, calmness: 0, kindness: 0, discipline: 0 };
  const valuesByTrait: Record<string, number[]> = { energy: [], creativity: [], calmness: [], kindness: [], discipline: [] };

  if (questionsArr && questionsArr.length) {
    for (let i = 0; i < answers.length; i++) {
      const ans = answers[i];
      const q = questionsArr[i];
      if (!q || ans == null) continue;

      const effect = (q as any).effects?.[ans];
      if (effect) {
        (Object.keys(effect) as (keyof Stats)[]).forEach(k => {
          const delta = effect[k] ?? 0;
          explicitContributions[k] = (explicitContributions[k] ?? 0) + delta;
          explicitCounts[k] = (explicitCounts[k] ?? 0) + 1;
        });
        continue;
      }

      // map answer to a normalized score in [-1, 1]
      let normalized = 0;
      if (Array.isArray(q.options) && q.options.length > 1) {
        const idx = Math.max(0, q.options.findIndex(o => o === ans));
        const maxIdx = q.options.length - 1;
        if (maxIdx > 0) {
          // earlier options are considered "higher" in this form; map to [-1..1]
          normalized = ((maxIdx - idx) / maxIdx) * 2 - 1; // -1..1
        }
      } else {
        const parsed = parseFloat(String(ans));
        if (!Number.isNaN(parsed)) normalized = Math.max(-1, Math.min(1, parsed));
      }

      const weightMap = QUESTION_TRAIT_WEIGHTS[q.id] ?? {};
      Object.entries(weightMap).forEach(([trait, w]) => {
        const weight = (w ?? 0);
        weightedSums[trait] = (weightedSums[trait] ?? 0) + normalized * weight;
        totalWeights[trait] = (totalWeights[trait] ?? 0) + Math.abs(weight);
        valuesByTrait[trait].push(normalized);
      });
    }
  }

  const results: any = {};
  const confidences: Record<string, number> = {};
  const counts: Record<string, number> = {};

  // configuration: how much normalized answers can shift the baseline (in points)
  const DELTA_SCALE = 30; // +/-30 from baseline (50)
  const EXPECTED_COUNT = 2; // expected number of contributing questions per trait

  traitNames.forEach(trait => {
    // compute delta from weighted normalized answers
    let delta = 0;
    if ((totalWeights[trait] || 0) > 0) {
      const avgNorm = weightedSums[trait] / (totalWeights[trait] || 1); // approx in -1..1
      delta = avgNorm * DELTA_SCALE;
    }

    // explicit contributions are treated as direct deltas
    const explicit = explicitContributions[trait] || 0;

    const raw = 50 + delta + explicit;
    results[trait] = clamp(raw);

    const valueList = valuesByTrait[trait] || [];
    const count = (valueList.length) + (explicitCounts[trait] || 0);
    counts[trait] = count;

    // confidence: coverage + consistency
    const coverage = Math.min(1, count / EXPECTED_COUNT);
    let consistency = 0.5;
    if (valueList.length > 0) {
      const mean = valueList.reduce((a, b) => a + b, 0) / valueList.length;
      const variance = valueList.reduce((a, b) => a + (b - mean) * (b - mean), 0) / valueList.length;
      // normalized values in [-1,1] have max variance 1
      consistency = 1 - Math.min(1, variance / 1);
    } else if ((explicitCounts[trait] || 0) > 0) {
      consistency = 0.9;
    }

    const confRaw = 0.6 * coverage + 0.4 * consistency;
    confidences[trait] = Math.round(Math.max(0, Math.min(1, confRaw)) * 100);
  });

  return {
    energy: results.energy,
    creativity: results.creativity,
    calmness: results.calmness,
    kindness: results.kindness,
    discipline: results.discipline,
    confidences,
    counts,
  };
}

export default function Index() {
  const [answers, setAnswers] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current; // 0 -> visible, 1 -> fully black

  useEffect(() => {
    // preload local images used by this screen; if index already preloaded it's fast/no-op
    let mounted = true;
    const preload = async () => {
      try {
        const assetList = [
          image,
          ...questions.map(q => (q.image as any)),
        ].filter(Boolean) as any[];
        const unique = Array.from(new Set(assetList));
        await Promise.all(unique.map(a => Asset.loadAsync(a)));
      } catch (e) {
        console.warn("Form: failed to preload assets", e);
      } finally {
        if (mounted) setAssetsLoaded(true);
      }
    };
    preload();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const stored: string[] = JSON.parse(raw);
          // If a previous session completed all answers, start fresh instead of jumping to results
          if (stored.length >= questions.length) {
            await AsyncStorage.removeItem(STORAGE_KEY);
            setAnswers([]);
            setIndex(0);
          } else {
            setAnswers(stored);
            setIndex(Math.min(stored.length, questions.length));
          }
        }
        // NOTE: per new requirement we DO NOT load saved stats here; we only save them when the quiz completes.
      } catch (e) {
        console.error("Failed to load saved answers", e);
      }
    };
    load();
  }, []);

  const handleAnswer = async (value: string) => {
    try {
      const newAnswers = [...answers, value];
      setAnswers(newAnswers);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newAnswers));

      if (newAnswers.length < questions.length) {
        setIndex(prev => prev + 1);
      } else {
        // compute new stats
        const computed = computeStats(newAnswers, questions as any);

        // smooth with previous saved stats to avoid wild jumps (if we have previous stats)
        const previousRaw = stats;
        const alpha = 0.35; // new data weight (tunable)
        let finalToSave = computed as any;
        if (previousRaw) {
          const blended: any = {};
          (['energy', 'creativity', 'calmness', 'kindness', 'discipline'] as (keyof Stats)[]).forEach(k => {
            blended[k] = Math.round((alpha * (computed as any)[k]) + ((1 - alpha) * (previousRaw as any)[k]));
          });
          // blend confidences (simple average) and preserve counts from computed
          const blendedConf: Record<string, number> = {};
          const compConf = computed.confidences ?? {};
          const prevConf = previousRaw.confidences ?? {};
          Object.keys(compConf).forEach(t => {
            blendedConf[t] = Math.round(((compConf[t] || 0) * alpha) + ((prevConf[t] || 0) * (1 - alpha)));
          });
          blended.confidences = blendedConf;
          blended.counts = computed.counts;
          finalToSave = blended;
        }

        setStats(finalToSave);
        // compute & attach dominant trait (flower) for convenience when rendering results
        try {
          const traitKeys = ['energy', 'creativity', 'calmness', 'kindness', 'discipline'];
          const dominant = traitKeys.reduce((best: string, key: string) => {
            const bestVal = (finalToSave as any)[best] ?? -Infinity;
            const curVal = (finalToSave as any)[key] ?? -Infinity;
            return curVal > bestVal ? key : best;
          }, traitKeys[0]);
          (finalToSave as any).dominant = dominant;
        } catch (err) {
          // ignore
        }

        await AsyncStorage.setItem(STORAGE_STATS, JSON.stringify(finalToSave));
        console.log("Finished. Saved answers and stats:", newAnswers, finalToSave);
        setIndex(questions.length);
      }
    } catch (e) {
      console.error("Failed to save answer", e);
      setAnswers(prev => [...prev, value]);
      setIndex(prev => (prev < questions.length - 1 ? prev + 1 : prev));
    }
  };
  const currentQuestion = questions[index];

  useEffect(() => {
    // Fade to black and then navigate to results only after this session completes and stats exist
    if (index >= questions.length && stats && !isTransitioning) {
      setIsTransitioning(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }).start(() => {
        router.replace('/result');
      });
    }
  }, [index, stats, isTransitioning, fadeAnim]);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
        {/* keep background image but don't render main content until assetsLoaded to avoid any white/blank frame */}
        <Image source={image} style={styles.backgroundImage} resizeMode="cover" />

        {assetsLoaded ? (
          index < questions.length ? (
            <QuestionTemplate question={currentQuestion} onAnswer={handleAnswer} />
          ) : null
        ) : (
          // while loading show nothing but the dark background (no white flash)
          null
        )}

        <Animated.View
          pointerEvents="none"
          style={[StyleSheet.absoluteFillObject, { backgroundColor: 'black', opacity: fadeAnim, zIndex: 10 }]}
        />
        
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        padding: 0,
        backgroundColor: Colors.primary, // restored to previous theme color
    },
    backgroundImage: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: -1,
    },
    answer: {
        position: 'absolute',
        bottom: 24,
        left: 16,
        right: 16,
        textAlign: 'center',
    },
    answerTitle: {
      position: 'absolute',
      bottom: 96,
      left: 16,
      right: 16,
      textAlign: 'center',
      fontWeight: '700',
    },
    answerItem: {
      position: 'absolute',
      bottom: 64,
      left: 16,
      right: 16,
      textAlign: 'center',
      marginTop: 4,
    },
});