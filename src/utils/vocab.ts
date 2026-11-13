import type { VocabularyItem } from '../data/types';

export function parseGermanWord(word: string, category: string) {
  const parts = word.split(' ');
  if (
    (category === 'noun' || parts.length > 1) &&
    parts.length > 1 &&
    ['der', 'die', 'das'].includes(parts[0].toLowerCase())
  ) {
    return {
      article: parts[0],
      rest: parts.slice(1).join(' '),
      gender: parts[0].toLowerCase() as 'der' | 'die' | 'das',
    };
  }
  return { article: null as string | null, rest: word, gender: null as 'der' | 'die' | 'das' | null };
}

export function speakGerman(text: string) {
  if (!('speechSynthesis' in window) || !text) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'de-DE';
  const voices = window.speechSynthesis.getVoices();
  const deVoice = voices.find(v => v.lang.toLowerCase().includes('de'));
  if (deVoice) utterance.voice = deVoice;
  window.speechSynthesis.speak(utterance);
}

export function displayWord(item: VocabularyItem) {
  return parseGermanWord(item.w, item.c);
}
