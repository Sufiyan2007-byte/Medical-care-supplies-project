import { useEffect, useRef, useState } from 'react';
import './TypingText.css';

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Types each phrase, pauses, deletes it, then types the next.
 * The letters are written straight to the DOM so each tick does not
 * re-render the page (that re-render was the lag).
 * Screen readers hear the full list once — the animated line is hidden from them.
 */
export default function TypingText({ phrases = [], typeMs = 48, deleteMs = 24, pauseMs = 1400 }) {
  const list = Array.isArray(phrases) ? phrases.filter(Boolean) : [];
  const phraseKey = list.join('\u0001');
  const listRef = useRef(list);
  listRef.current = list;
  const valueRef = useRef(null);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(prefersReducedMotion());
  }, []);

  useEffect(() => {
    const node = valueRef.current;
    const currentList = listRef.current;
    if (!node || !currentList.length) return undefined;

    if (reduced || currentList.length < 2) {
      node.textContent = currentList[0];
      return undefined;
    }

    let phrase = 0;
    let count = 0;
    let deleting = false;
    let timer = 0;

    const tick = () => {
      const words = listRef.current;
      const current = words[phrase % words.length] || '';

      if (!deleting) {
        count += 1;
        node.textContent = current.slice(0, count);
        if (count >= current.length) {
          deleting = true;
          timer = window.setTimeout(tick, pauseMs);
          return;
        }
        timer = window.setTimeout(tick, typeMs);
        return;
      }

      count -= 1;
      node.textContent = current.slice(0, Math.max(0, count));
      if (count <= 0) {
        deleting = false;
        phrase = (phrase + 1) % words.length;
      }
      timer = window.setTimeout(tick, deleteMs);
    };

    timer = window.setTimeout(tick, typeMs);
    return () => window.clearTimeout(timer);
  }, [phraseKey, reduced, typeMs, deleteMs, pauseMs]);

  if (!list.length) return null;

  return (
    <p className="typing-text">
      <span className="typing-text__line" aria-hidden="true">
        <span className="typing-text__value" ref={valueRef}>{reduced ? list[0] : ''}</span>
        <span className="typing-text__caret" />
      </span>
      <span className="typing-text__sr">{list.join('. ')}</span>
    </p>
  );
}
