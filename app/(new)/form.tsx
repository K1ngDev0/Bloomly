import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Animated, Image, Keyboard, StyleSheet, TouchableWithoutFeedback } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import QuestionTemplate, { Question } from "../../components/QuestionTemplate";

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

  const baseline: Record<string, number> = { ...DEFAULT_STATS } as any;
  const traitAcc: Record<string, { sum: number; weight: number; values: number[] }> = {};
  traitNames.forEach(t => (traitAcc[t] = { sum: 0, weight: 0, values: [] }));

  const explicitContributions: Record<string, number> = { energy: 0, creativity: 0, calmness: 0, kindness: 0, discipline: 0 };
  const explicitCounts: Record<string, number> = { energy: 0, creativity: 0, calmness: 0, kindness: 0, discipline: 0 };

  if (questionsArr && questionsArr.length) {
    for (let i = 0; i < answers.length; i++) {
      const ans = answers[i];
      const q = questionsArr[i];
      if (!q || !ans) continue;
      const weightMap = QUESTION_TRAIT_WEIGHTS[q.id] ?? {};

      const effect = (q as any).effects?.[ans];
      if (effect) {
        (Object.keys(effect) as (keyof Stats)[]).forEach(k => {
          const delta = effect[k] ?? 0;

          baseline[k] = (baseline[k] ?? 0) + delta;
          explicitContributions[k] = (explicitContributions[k] ?? 0) + delta;
          explicitCounts[k] = (explicitCounts[k] ?? 0) + 1;
        });
        continue;
      }

      let numericVal = 1;
      if (Array.isArray(q.options)) {
        const idx = q.options.findIndex(o => o === ans);
        const maxIdx = Math.max(0, q.options.length - 1);
        numericVal = maxIdx - Math.max(0, idx);
      } else {
        const parsed = parseFloat(ans);
        if (!Number.isNaN(parsed)) numericVal = parsed;
      }

      const scaleMax = Array.isArray(q.options) && q.options.length > 1 ? Math.max(1, q.options.length - 1) : 3;
      Object.entries(weightMap).forEach(([trait, w]) => {
        if (!traitAcc[trait]) traitAcc[trait] = { sum: 0, weight: 0, values: [] };
        traitAcc[trait].sum += (numericVal / scaleMax) * (w ?? 0);
        traitAcc[trait].weight += (w ?? 0);
        traitAcc[trait].values.push(numericVal / scaleMax);
      });
    }
  } else {
  }

  const results: any = {};
  const confidences: Record<string, number> = {};
  const counts: Record<string, number> = {};

  traitNames.forEach(trait => {
    let val = baseline[trait] ?? 50;

    // if we have accumulated weighted answers for this trait, map them to a delta around the baseline
    const acc = traitAcc[trait];
    if (acc.weight > 0 && acc.values.length > 0) {
      const weightedAvg = acc.sum / Math.max(1e-6, acc.weight); // in 0..1 range
      const scaleMid = 0.5;
      // deltaNormalized roughly in (-0.5..0.5)
      const deltaNormalized = weightedAvg - scaleMid;
      // scale to an interpretable delta (tunable)
      const delta = deltaNormalized * 40; // about +/-20 points max
      val = (val ?? 50) + delta;
    }

    // clamp
    results[trait] = clamp(val);

    // build confidence: coverage (how many Qs contributed) and consistency (low variance => higher)
    const values = acc.values.length ? acc.values : [];
    const count = values.length + (explicitCounts[trait] || 0);
    counts[trait] = count;

    const expectedCount = 2; // expected #questions per trait (tweakable)
    const coverage = Math.min(1, count / expectedCount);

    let consistency = 0.5; // fallback
    if (values.length >= 1) {
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const variance = values.reduce((a, b) => a + (b - mean) * (b - mean), 0) / values.length;
      const maxVar = Math.pow(0.5, 2); // since normalized values are 0..1, variance can't exceed 0.25; use half-range squared as conservative
      consistency = 1 - Math.min(1, variance / (maxVar || 1e-6));
    } else if (explicitCounts[trait] > 0) {
      // explicit mappings count as stronger evidence; treat as high consistency
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
  const fadeAnim = useRef(new Animated.Value(0)).current; // 0 -> visible, 1 -> fully black

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
        const rawStats = await AsyncStorage.getItem(STORAGE_STATS);
        if (rawStats) setStats(JSON.parse(rawStats));
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
        <Image source={image} style={styles.backgroundImage} resizeMode="cover" />

        {index < questions.length ? (
          <QuestionTemplate question={currentQuestion} onAnswer={handleAnswer} />
        ) : (
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