import a1Json from './german_vocab_A1-A2_with_texts.json';
import b1Json from './german_vocab_B1-B2_with_texts.json';
import type {
  LevelKey,
  LevelInfo,
  TopicData,
  VocabularyWord,
  VocabCategory,
  TopicTextType
} from './types';

interface RawWord {
  de: string;
  pos: string;
  en: string;
  sentence: string;
  perfekt?: string;
  sentence_perfekt?: string;
}

interface RawTopic {
  id: number;
  topic: string;
  text_type?: TopicTextType;
  text?: string;
  words: RawWord[];
}

interface RawLevelData {
  level: string;
  fields: Record<string, string>;
  topics: RawTopic[];
}

function normalizePos(pos: string): VocabCategory {
  const p = pos.toLowerCase().trim();
  if (['noun', 'verb', 'adjective', 'adverb', 'phrase', 'connector', 'preposition', 'pronoun'].includes(p)) {
    return p as VocabCategory;
  }
  return 'other';
}

function processLevel(raw: RawLevelData, levelKey: LevelKey): { topics: TopicData[]; words: VocabularyWord[] } {
  const words: VocabularyWord[] = [];
  const topics: TopicData[] = (raw.topics || []).map(rawTopic => {
    const topicWords: VocabularyWord[] = (rawTopic.words || []).map(w => {
      const cleanDe = w.de.trim().replace(/\s+/g, '_');
      const item: VocabularyWord = {
        id: `${levelKey}_t${rawTopic.id}_${cleanDe}`,
        topicId: rawTopic.id,
        topicName: rawTopic.topic,
        level: levelKey,
        de: w.de,
        pos: normalizePos(w.pos),
        en: w.en,
        sentence: w.sentence,
        perfekt: w.perfekt,
        sentence_perfekt: w.sentence_perfekt,
      };
      words.push(item);
      return item;
    });

    return {
      id: rawTopic.id,
      topic: rawTopic.topic,
      level: levelKey,
      textType: rawTopic.text_type,
      text: rawTopic.text,
      words: topicWords,
      nouns: topicWords.filter(w => w.pos === 'noun'),
      verbs: topicWords.filter(w => w.pos === 'verb'),
      adjectives: topicWords.filter(w => w.pos === 'adjective'),
      others: topicWords.filter(w => !['noun', 'verb', 'adjective'].includes(w.pos)),
    };
  });

  return { topics, words };
}

const a1Processed = processLevel(a1Json as unknown as RawLevelData, 'a1_a2');
const b1Processed = processLevel(b1Json as unknown as RawLevelData, 'b1_b2');

export const levels: Record<LevelKey, LevelInfo> = {
  a1_a2: {
    key: 'a1_a2',
    label: 'Beginner',
    badge: 'A1 – A2',
    sub: 'Foundational Grammar & Everyday Vocabulary',
    description: 'Master essential German for daily life, introductions, shopping, routines, and basic conversations.',
    topics: a1Processed.topics,
    words: a1Processed.words,
    wordCount: a1Processed.words.length,
    topicCount: a1Processed.topics.length,
  },
  b1_b2: {
    key: 'b1_b2',
    label: 'Intermediate',
    badge: 'B1 – B2',
    sub: 'Professional, Academic & Fluent German',
    description: 'Expand to advanced vocabulary for work, university, debates, culture, and nuanced expression.',
    topics: b1Processed.topics,
    words: b1Processed.words,
    wordCount: b1Processed.words.length,
    topicCount: b1Processed.topics.length,
  },
};

export const wordById = new Map<string, VocabularyWord>();
export const topicById = new Map<number, TopicData>();

[...a1Processed.words, ...b1Processed.words].forEach(w => {
  wordById.set(w.id, w);
});

[...a1Processed.topics, ...b1Processed.topics].forEach(t => {
  topicById.set(t.id, t);
});

function seededRandom(seed: number): () => number {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function wordSeed(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = Math.imul(h, 31) + id.charCodeAt(i);
  }
  return Math.abs(h);
}

/**
 * Generate 3 smart distractors of similar category for a quiz question (English answers)
 */
export function getDistractors(word: VocabularyWord, count = 3): string[] {
  const currentLevelWords = levels[word.level]?.words || [];
  // Prefer same pos first
  const sameCategory = currentLevelWords.filter(
    w => w.id !== word.id && w.pos === word.pos && w.en.trim().toLowerCase() !== word.en.trim().toLowerCase()
  );
  const fallback = currentLevelWords.filter(
    w => w.id !== word.id && w.en.trim().toLowerCase() !== word.en.trim().toLowerCase()
  );

  const candidates = sameCategory.length >= count ? sameCategory : fallback;
  const rand = seededRandom(wordSeed(word.id));
  const shuffled = [...candidates].sort(() => 0.5 - rand());
  const selected: string[] = [];
  const seen = new Set<string>([word.en.toLowerCase().trim()]);

  for (const item of shuffled) {
    const cleanEn = item.en.trim();
    if (!seen.has(cleanEn.toLowerCase())) {
      seen.add(cleanEn.toLowerCase());
      selected.push(cleanEn);
      if (selected.length >= count) break;
    }
  }

  return selected;
}

/**
 * Generate 3 smart German distractors when testing in reverse (EN -> DE)
 */
export function getGermanDistractors(word: VocabularyWord, count = 3): string[] {
  const currentLevelWords = levels[word.level]?.words || [];
  const sameCategory = currentLevelWords.filter(
    w => w.id !== word.id && w.pos === word.pos && w.de.trim().toLowerCase() !== word.de.trim().toLowerCase()
  );
  const fallback = currentLevelWords.filter(
    w => w.id !== word.id && w.de.trim().toLowerCase() !== word.de.trim().toLowerCase()
  );

  const candidates = sameCategory.length >= count ? sameCategory : fallback;
  const rand = seededRandom(wordSeed(word.id) + 999);
  const shuffled = [...candidates].sort(() => 0.5 - rand());
  const selected: string[] = [];
  const seen = new Set<string>([word.de.toLowerCase().trim()]);

  for (const item of shuffled) {
    const cleanDe = item.de.trim();
    if (!seen.has(cleanDe.toLowerCase())) {
      seen.add(cleanDe.toLowerCase());
      selected.push(cleanDe);
      if (selected.length >= count) break;
    }
  }

  return selected;
}
