import { useEffect, useId, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuoteCart } from '../context/QuoteCartContext';
import { loadXelpovProducts } from '../utils/xelpovData';
import {
  GREETING, UI, TIPS, QUICK_REPLIES, FALLBACK, pick, answerQuestion,
} from '../bot/knowledge';
import './MedBot.css';

const TIPS_KEY = 'medportal_medbot_tips';

function reducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function isFinePointer() {
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
}

function RobotFace({ look }) {
  const px = look.x * 2.2;
  const py = look.y * 1.6;
  return (
    <svg className="medbot-svg" viewBox="0 0 64 72" aria-hidden="true">
      <line className="medbot-antenna" x1="32" y1="8" x2="32" y2="16" strokeWidth="2" strokeLinecap="round" />
      <circle className="medbot-antenna-tip" cx="32" cy="6.5" r="2.4" />
      <rect className="medbot-head" x="10" y="16" width="44" height="36" rx="10" />
      <rect className="medbot-screen" x="16" y="22" width="32" height="20" rx="5" />
      <g className="medbot-eyes">
        <circle cx={26 + px} cy={32 + py} r="2.15" />
        <circle cx={38 + px} cy={32 + py} r="2.15" />
      </g>
      <rect className="medbot-body" x="20" y="54" width="24" height="8" rx="3" />
    </svg>
  );
}

export default function MedBot({ company }) {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToQuote } = useQuoteCart();
  const lang = i18n.language.startsWith('ar') ? 'ar' : 'en';
  const panelId = useId();

  const rootRef = useRef(null);
  const faceRef = useRef(null);
  const inputRef = useRef(null);
  const threadRef = useRef(null);
  const productsRef = useRef(null);
  const msgId = useRef(1);

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState([]);
  const [look, setLook] = useState({ x: 0, y: 0 });
  const [tipKey, setTipKey] = useState(null);
  const [greet, setGreet] = useState('wait');
  const [liveGreeting, setLiveGreeting] = useState('');
  const [tipsOff, setTipsOff] = useState(() => {
    try { return localStorage.getItem(TIPS_KEY) === 'off'; } catch { return false; }
  });

  const greeting = pick(GREETING, lang);
  const ui = (key) => (typeof UI[key] === 'string' ? UI[key] : pick(UI[key], lang));

  useEffect(() => {
    const timer = setTimeout(() => {
      setGreet((state) => (state === 'wait' ? 'show' : state));
      setLiveGreeting(pick(GREETING, i18n.language.startsWith('ar') ? 'ar' : 'en'));
    }, 1500);
    return () => clearTimeout(timer);
  }, [i18n.language]);

  useEffect(() => {
    if (open || tipKey) setGreet('done');
  }, [open, tipKey]);

  useEffect(() => {
    let frame = 0;
    const onMove = (event) => {
      if (reducedMotion()) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const face = faceRef.current;
        if (!face) return;
        const box = face.getBoundingClientRect();
        const dx = (event.clientX - (box.left + box.width / 2)) / 160;
        const dy = (event.clientY - (box.top + box.height / 2)) / 160;
        setLook({
          x: Math.max(-1, Math.min(1, dx)),
          y: Math.max(-1, Math.min(1, dy)),
        });
      });
    };
    window.addEventListener('mousemove', onMove);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('mousemove', onMove);
    };
  }, []);

  useEffect(() => {
    if (tipsOff || open) return undefined;
    if (!isFinePointer()) return undefined;

    let active = null;
    let showTimer = 0;
    let hideTimer = 0;

    const clearOutline = () => {
      document.querySelectorAll('.medbot-tip-target').forEach((el) => el.classList.remove('medbot-tip-target'));
    };

    const onOver = (event) => {
      if (event.target.closest?.('.medbot')) return;
      const el = event.target.closest?.('[data-tip]');
      if (!el) return;
      if (el === active) {
        window.clearTimeout(hideTimer);
        return;
      }
      window.clearTimeout(hideTimer);
      window.clearTimeout(showTimer);
      showTimer = window.setTimeout(() => {
        clearOutline();
        active = el;
        el.classList.add('medbot-tip-target');
        setTipKey(el.getAttribute('data-tip'));
      }, 300);
    };

    const onOut = (event) => {
      const el = event.target.closest?.('[data-tip]');
      if (!el) return;
      if (event.relatedTarget?.closest?.('[data-tip]')) return;
      window.clearTimeout(showTimer);
      hideTimer = window.setTimeout(() => {
        clearOutline();
        active = null;
        setTipKey(null);
      }, 1200);
    };

    document.addEventListener('mouseover', onOver);
    document.addEventListener('mouseout', onOut);
    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(hideTimer);
      clearOutline();
      document.removeEventListener('mouseover', onOver);
      document.removeEventListener('mouseout', onOut);
    };
  }, [tipsOff, open, location.pathname]);

  useEffect(() => {
    if (tipsOff || open || isFinePointer()) return undefined;
    const seen = new Set();
    let hideTimer = 0;
    const observer = new IntersectionObserver((entries) => {
      const hit = entries.find((entry) => {
        const key = entry.target.getAttribute('data-tip-scroll');
        return entry.isIntersecting && key && !seen.has(key);
      });
      if (!hit) return;
      const key = hit.target.getAttribute('data-tip-scroll');
      seen.add(key);
      setTipKey(key);
      window.clearTimeout(hideTimer);
      hideTimer = window.setTimeout(() => setTipKey(null), 4200);
    }, { threshold: 0.45 });

    document.querySelectorAll('[data-tip-scroll]').forEach((el) => observer.observe(el));
    return () => {
      observer.disconnect();
      window.clearTimeout(hideTimer);
    };
  }, [tipsOff, open, location.pathname]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 40);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.clearTimeout(focusTimer);
    };
  }, [open]);

  useEffect(() => {
    const thread = threadRef.current;
    if (thread) thread.scrollTop = thread.scrollHeight;
  }, [messages, typing, open]);

  const turnOffTips = () => {
    try { localStorage.setItem(TIPS_KEY, 'off'); } catch { /* ignore */ }
    setTipsOff(true);
    setTipKey(null);
    setGreet('done');
    document.querySelectorAll('.medbot-tip-target').forEach((el) => el.classList.remove('medbot-tip-target'));
  };

  const applyLanguage = (next) => {
    i18n.changeLanguage(next);
    document.documentElement.dir = next === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = next;
  };

  const runAction = (action) => {
    if (!action) return;
    const behavior = reducedMotion() ? 'auto' : 'smooth';
    if (action.type === 'language') {
      applyLanguage(action.lang);
      return;
    }
    if (action.type === 'focusSearch') {
      const inputEl = [...document.querySelectorAll('.site-topbar-search-input, .xsp-search input')]
        .find((node) => node.getClientRects().length);
      if (inputEl) {
        inputEl.focus();
        inputEl.scrollIntoView({ behavior, block: 'center' });
      }
      return;
    }
    if (action.type === 'scroll') {
      const el = [...document.querySelectorAll(action.selector)]
        .find((node) => node.getClientRects().length);
      if (el) el.scrollIntoView({ behavior, block: 'center' });
      else if (action.path) navigate(action.path);
    }
  };

  const pushReply = async (text, intent) => {
    const trimmed = (text || '').trim();
    if (!trimmed || typing) return;
    const userMsg = { id: msgId.current++, role: 'user', text: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setTyping(true);
    try {
      if (!productsRef.current) productsRef.current = await loadXelpovProducts();
    } catch {
      productsRef.current = productsRef.current || [];
    }
    await new Promise((resolve) => { setTimeout(resolve, reducedMotion() ? 0 : 700); });
    const result = answerQuestion(trimmed, {
      lang,
      products: productsRef.current,
      company,
      intent,
    }) || { text: pick(FALLBACK, lang), products: [], action: null };
    setTyping(false);
    setMessages((prev) => [...prev, {
      id: msgId.current++,
      role: 'bot',
      text: result.text,
      products: result.products || [],
    }]);
    runAction(result.action);
  };

  const tipText = tipKey && TIPS[tipKey] ? pick(TIPS[tipKey], lang) : '';
  const showGreeting = greet === 'show' && !open && !tipText;
  const bubble = tipText || (showGreeting ? greeting : '');

  return (
    <div className="medbot" ref={rootRef}>
      <span className="medbot-sr" aria-live="polite">{liveGreeting}</span>

      {bubble && (
        <div className="medbot-bubble" role="status">
          <p>{bubble}</p>
          {!tipsOff && (
            <button type="button" className="medbot-link" onClick={turnOffTips}>
              {ui('turnOff')}
            </button>
          )}
        </div>
      )}

      {open && (
        <div
          className="medbot-panel"
          id={panelId}
          role="dialog"
          aria-label={ui('title')}
        >
          <header className="medbot-panel-head">
            <strong>{ui('title')}</strong>
            <button type="button" className="medbot-link" onClick={turnOffTips} disabled={tipsOff}>
              {ui('turnOff')}
            </button>
          </header>

          <div className="medbot-thread" ref={threadRef} aria-live="polite" aria-label={ui('messages')}>
            {messages.length === 0 && (
              <p className="medbot-msg medbot-msg--bot">{greeting}</p>
            )}
            {messages.map((msg) => (
              <div key={msg.id} className={`medbot-msg medbot-msg--${msg.role}`}>
                <p>{msg.text}</p>
                {msg.products?.length > 0 && (
                  <ul className="medbot-cards">
                    {msg.products.map((product) => (
                      <li key={product.slug}>
                        <Link to={`/catalogue/all/${product.slug}`} onClick={() => setOpen(false)}>
                          {product.name}
                        </Link>
                        <span className="medbot-ref" dir="ltr">{product.slug}</span>
                        <button
                          type="button"
                          onClick={() => addToQuote({
                            slug: product.slug,
                            name: product.name,
                            image: product.image,
                            mainCategory: product.mainCategory,
                            specialty: 'all',
                          })}
                        >
                          {ui('addQuote')}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
            {typing && (
              <div className="medbot-msg medbot-msg--bot" aria-hidden="true">
                <span className="medbot-dots" aria-label={ui('typing')}><i /><i /><i /></span>
              </div>
            )}
          </div>

          <div className="medbot-chips" role="group" aria-label={ui('title')}>
            {QUICK_REPLIES.map((chip) => (
              <button
                key={chip.id}
                type="button"
                className="medbot-chip"
                onClick={() => pushReply(pick(chip, lang), chip.intent)}
              >
                {pick(chip, lang)}
              </button>
            ))}
          </div>

          <form
            className="medbot-form"
            onSubmit={(event) => {
              event.preventDefault();
              pushReply(input);
            }}
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={ui('placeholder')}
              aria-label={ui('placeholder')}
              autoComplete="off"
            />
            <button type="submit" aria-label={ui('send')}>{ui('send')}</button>
          </form>
        </div>
      )}

      <button
        type="button"
        className="medbot-launcher"
        ref={faceRef}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? ui('close') : ui('open')}
        onClick={() => setOpen((value) => !value)}
      >
        <RobotFace look={look} />
        <span className="medbot-status">
          <span className="medbot-dot" aria-hidden="true" />
          {UI.online}
        </span>
      </button>
    </div>
  );
}
