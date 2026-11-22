import React, { useState, useMemo } from 'react';
import {
  Volume2,
  VolumeX,
  MessageSquare,
  FileText,
  Mail,
  Sparkles,
  Copy,
  Check,
  Eye,
  EyeOff
} from 'lucide-react';
import type { TopicData } from '../data/types';
import { speakGerman } from '../utils/vocab';

interface TopicRealWorldTextProps {
  topic: TopicData;
}

export const TopicRealWorldText: React.FC<TopicRealWorldTextProps> = ({ topic }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [highlightVocab, setHighlightVocab] = useState(true);

  const textType = topic.textType || 'paragraph';
  const rawText = topic.text || '';

  // Vocabulary search map for in-text highlight tooltips
  const vocabMap = useMemo(() => {
    const map = new Map<string, { de: string; en: string; pos: string }>();
    topic.words.forEach(w => {
      // Clean word without article for matching
      const clean = w.de.replace(/^(der|die|das)\s+/i, '').trim();
      if (clean.length >= 3) {
        map.set(clean.toLowerCase(), { de: w.de, en: w.en, pos: w.pos });
      }
    });
    return map;
  }, [topic.words]);

  const handlePlayFullText = () => {
    if (isPlaying) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);
    speakGerman(rawText);

    // Watch speech synthesis end
    const checkSpeech = setInterval(() => {
      if (!('speechSynthesis' in window) || !window.speechSynthesis.speaking) {
        setIsPlaying(false);
        clearInterval(checkSpeech);
      }
    }, 500);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(rawText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!rawText) return null;

  // Render text with word highlights
  const renderHighlightedContent = (content: string) => {
    if (!highlightVocab) {
      return <span>{content}</span>;
    }

    // Split content into words while preserving punctuation & spaces
    const tokens = content.split(/(\s+|[.,!?:;()"“”«»„]+)/);

    return tokens.map((token, idx) => {
      const cleanToken = token.toLowerCase().trim();
      const match = vocabMap.get(cleanToken);

      if (match) {
        return (
          <span
            key={idx}
            className="vocab-inline-highlight"
            title={`${match.de} (${match.pos}): ${match.en}`}
            onClick={(e) => {
              e.stopPropagation();
              speakGerman(match.de);
            }}
          >
            {token}
            <span className="vocab-tooltip">{match.en}</span>
          </span>
        );
      }

      return <span key={idx}>{token}</span>;
    });
  };

  // Render Dialog Mode
  const renderDialog = () => {
    const lines = rawText.split('\n').filter(l => l.trim().length > 0);
    const speakers = new Set<string>();

    // First detect speakers
    lines.forEach(line => {
      const match = line.match(/^([^:]+):/);
      if (match) speakers.add(match[1].trim());
    });
    const speakerList = Array.from(speakers);
    const firstSpeaker = speakerList[0] || '';

    return (
      <div className="dialog-flow-wrapper">
        {lines.map((line, idx) => {
          const colonIndex = line.indexOf(':');
          let speaker = '';
          let dialogue = line;

          if (colonIndex > 0) {
            speaker = line.slice(0, colonIndex).trim();
            dialogue = line.slice(colonIndex + 1).trim();
          }

          const isPrimary = speaker === firstSpeaker;

          return (
            <div
              key={idx}
              className={`dialog-bubble-row ${isPrimary ? 'speaker-primary' : 'speaker-secondary'}`}
            >
              <div className="dialog-speaker-avatar">
                {speaker ? speaker.charAt(0).toUpperCase() : '•'}
              </div>

              <div className="dialog-bubble-content">
                {speaker && <div className="dialog-speaker-name">{speaker}</div>}
                <div className="dialog-speech-text">
                  {renderHighlightedContent(dialogue)}
                </div>

                <button
                  type="button"
                  className="dialog-line-audio-btn"
                  onClick={() => speakGerman(dialogue)}
                  title="Listen to this line"
                >
                  <Volume2 size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Render Email Mode
  const renderEmail = () => {
    const sections = rawText.split('---').map(s => s.trim()).filter(Boolean);

    return (
      <div className="email-client-wrapper">
        {sections.map((sec, secIdx) => {
          const lines = sec.split('\n');
          let subject = '';
          let bodyLines = lines;

          if (lines[0] && lines[0].toLowerCase().startsWith('betreff:')) {
            subject = lines[0].replace(/^betreff:\s*/i, '').trim();
            bodyLines = lines.slice(1);
          }

          return (
            <div key={secIdx} className="email-card">
              <div className="email-card-header">
                <div className="email-meta-field">
                  <span className="email-meta-label">Betreff / Subject:</span>
                  <span className="email-meta-value">{subject || 'Nachricht'}</span>
                </div>
                <button
                  type="button"
                  className="email-audio-btn"
                  onClick={() => speakGerman(sec)}
                  title="Listen to email"
                >
                  <Volume2 size={15} />
                </button>
              </div>

              <div className="email-card-body">
                {bodyLines.map((bLine, bIdx) => (
                  <p key={bIdx} className="email-body-line">
                    {renderHighlightedContent(bLine)}
                  </p>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Render Paragraph / Reading Article Mode
  const renderParagraph = () => {
    const paragraphs = rawText.split('\n\n').filter(p => p.trim().length > 0);

    return (
      <div className="paragraph-article-wrapper">
        {paragraphs.map((p, pIdx) => (
          <p key={pIdx} className="article-paragraph-text">
            {renderHighlightedContent(p)}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="real-world-context-card">
      {/* Header bar */}
      <div className="rwc-header">
        <div className="rwc-title-group">
          <div className="rwc-type-badge">
            {textType === 'dialog' && <MessageSquare size={16} />}
            {textType === 'email' && <Mail size={16} />}
            {textType === 'paragraph' && <FileText size={16} />}
            <span>
              {textType === 'dialog' ? 'Real-World Dialogue' : textType === 'email' ? 'Email & Correspondence' : 'Real-Life Context Story'}
            </span>
          </div>
          <h3 className="rwc-heading">See Vocabulary in Real-World Context</h3>
          <p className="rwc-sub">
            Learn how native speakers naturally combine these words in daily conversation and authentic texts.
          </p>
        </div>

        {/* Toolbar actions */}
        <div className="rwc-actions">
          <button
            type="button"
            className={`rwc-action-btn ${isPlaying ? 'playing' : ''}`}
            onClick={handlePlayFullText}
            title={isPlaying ? 'Stop audio' : 'Listen to full text'}
          >
            {isPlaying ? <VolumeX size={16} /> : <Volume2 size={16} />}
            <span>{isPlaying ? 'Stop' : 'Listen Aloud'}</span>
          </button>

          <button
            type="button"
            className={`rwc-action-btn ${highlightVocab ? 'active' : ''}`}
            onClick={() => setHighlightVocab(!highlightVocab)}
            title="Toggle vocabulary highlighting"
          >
            {highlightVocab ? <Eye size={16} /> : <EyeOff size={16} />}
            <span>Highlights</span>
          </button>

          <button
            type="button"
            className="rwc-action-btn icon-only"
            onClick={handleCopy}
            title="Copy text"
          >
            {copied ? <Check size={16} color="#10b981" /> : <Copy size={16} />}
          </button>
        </div>
      </div>

      {/* Tip Banner */}
      {highlightVocab && (
        <div className="rwc-highlight-tip">
          <Sparkles size={14} />
          <span>
            Highlighted words are vocabulary from this topic. Hover or tap any highlighted word to reveal its English definition!
          </span>
        </div>
      )}

      {/* Content Rendering */}
      <div className="rwc-content-stage">
        {textType === 'dialog' && renderDialog()}
        {textType === 'email' && renderEmail()}
        {textType === 'paragraph' && renderParagraph()}
      </div>
    </div>
  );
};
