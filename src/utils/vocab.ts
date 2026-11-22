import type { VocabularyWord } from '../data/types';

export function parseGermanWord(word: string, category?: string) {
  if (!word) {
    return { article: null as string | null, rest: '', gender: null as 'der' | 'die' | 'das' | null };
  }
  const parts = word.trim().split(' ');
  const firstLower = parts[0]?.toLowerCase();
  const isGenderWord = ['der', 'die', 'das'].includes(firstLower);
  if (parts.length > 1 && (category === 'noun' || isGenderWord)) {
    return {
      article: parts[0],
      rest: parts.slice(1).join(' '),
      gender: (isGenderWord ? firstLower : null) as 'der' | 'die' | 'das' | null,
    };
  }
  return { article: null as string | null, rest: word, gender: null as 'der' | 'die' | 'das' | null };
}

export function speakGerman(text: string) {
  if (!('speechSynthesis' in window) || !text) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'de-DE';
    const voices = window.speechSynthesis.getVoices();
    const deVoice = voices.find(v => v.lang.toLowerCase().includes('de'));
    if (deVoice) utterance.voice = deVoice;
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('Speech synthesis error:', err);
  }
}

export function displayWord(item: VocabularyWord) {
  return parseGermanWord(item.de, item.pos);
}
