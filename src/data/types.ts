export type LevelKey = 'a1_a2' | 'b1_b2';

export type VocabCategory =
  | 'noun'
  | 'verb'
  | 'adjective'
  | 'adverb'
  | 'phrase'
  | 'connector'
  | 'preposition'
  | 'pronoun'
  | 'other';

export interface VocabularyWord {
  id: string;
  topicId: number;
  topicName: string;
  level: LevelKey;
  de: string;
  pos: VocabCategory;
  en: string;
  sentence: string;
  perfekt?: string;
  sentence_perfekt?: string;
}

export type TopicTextType = 'dialog' | 'paragraph' | 'email';

export interface TopicData {
  id: number;
  topic: string;
  level: LevelKey;
  textType?: TopicTextType;
  text?: string;
  words: VocabularyWord[];
  nouns: VocabularyWord[];
  verbs: VocabularyWord[];
  adjectives: VocabularyWord[];
  others: VocabularyWord[];
}

export interface LevelInfo {
  key: LevelKey;
  label: string;
  badge: string;
  sub: string;
  description: string;
  topics: TopicData[];
  words: VocabularyWord[];
  wordCount: number;
  topicCount: number;
}

export interface WordReviewData {
  remembered: boolean;
  rememberedAt?: number;
  reviewCount: number;
  lastReviewedAt?: number;
  correctCount?: number;
  incorrectCount?: number;
  retentionStreak?: number;
}

export type VocabularyItem = VocabularyWord;

export type StudyMode = 'cards' | 'flashcards' | 'quiz';
export type TestFilterMode = 'all' | 'remembered' | 'unlearned';
export type CategoryFilter = 'all' | 'noun' | 'verb' | 'adjective' | 'other';
