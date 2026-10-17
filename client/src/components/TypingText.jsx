import { useEffect, useRef, useState } from 'react';
import './TypingText.css';

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Types each phrase, pauses, deletes it, then types the next.
 * Screen readers hear the full list once — the animated line is hidden from them.
 */
export default function TypingText({ phrases = [], typeMs = 70, deleteMs = 35, pauseMs = 2000 }) {
  const list = Array.isArray(phrases) ? phrases.filter(Boolean) : [];
  const phraseKey = list.join('\u0001');
  const listRef = useRef(list);
  listRef.current = list;
  const [index, setIndex] = useState(0);
  const [text, setText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(prefersReducedMotion());
  }, []);

  useEffect(() => {
    setIndex(0);
    setText('');
    setDeleting(false);
  }, [phraseKey]);

  useEffect(() => {
    const currentList = listRef.current;
    if (!currentList.length || reduced) return undefined;
    const current = currentList[index % currentList.length];
    let timer;

    if (!deleting && text === current) {
      timer = setTimeout(() => setDeleting(true), pauseMs);
    } else if (deleting && text === '') {
      setDeleting(false);
      setIndex((i) => (i + 1) % currentList.length);
    } else {
      const next = deleting
        ? current.slice(0, Math.max(0, text.length - 1))
        : current.slice(0, text.length + 1);
      timer = setTimeout(() => setText(next), deleting ? deleteMs : typeMs);
    }

    return () => clearTimeout(timer);
  }, [text, deleting, index, phraseKey, typeMs, deleteMs, pauseMs, reduced]);

  if (!list.length) return null;

  const shown = reduced ? list[0] : text;

  return (
    <p className="typing-text">
      <span className="typing-text__line" aria-hidden="true">
        <span className="typing-text__value">{shown}</span>
        <span className="typing-text__caret" />
      </span>
      <span className="typing-text__sr">{list.join('. ')}</span>
    </p>
  );
}
