import { useEffect, useRef, useState } from 'react';
import './TypingText.css';

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Shows each phrase in full, then fades to the next.
 * Phrases are never deleted character by character — that breaks Arabic.
 * Screen readers hear the full list once; the animated line is hidden from them.
 */
export default function TypingText({ phrases = [], pauseMs = 2600 }) {
  const list = Array.isArray(phrases) ? phrases.filter(Boolean) : [];
  const phraseKey = list.join('\u0001');
  const listRef = useRef(list);
  listRef.current = list;
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(prefersReducedMotion());
  }, []);

  useEffect(() => {
    setIndex(0);
    setVisible(true);
  }, [phraseKey]);

  useEffect(() => {
    const currentList = listRef.current;
    if (reduced || currentList.length < 2) return undefined;
    const timer = setTimeout(() => setVisible(false), pauseMs);
    return () => clearTimeout(timer);
  }, [index, phraseKey, pauseMs, reduced]);

  useEffect(() => {
    if (visible || reduced) return undefined;
    const timer = setTimeout(() => {
      const currentList = listRef.current;
      setIndex((i) => (i + 1) % currentList.length);
      setVisible(true);
    }, 280);
    return () => clearTimeout(timer);
  }, [visible, reduced]);

  if (!list.length) return null;

  const shown = reduced ? list[0] : list[index % list.length];

  return (
    <p className="typing-text">
      <span className="typing-text__line" aria-hidden="true">
        <span className={`typing-text__value${visible ? '' : ' is-out'}`}>{shown}</span>
      </span>
      <span className="typing-text__sr">{list.join('. ')}</span>
    </p>
  );
}
