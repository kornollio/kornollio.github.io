// Компоненты для чата в стиле Telegram Dark (фиолетовый ретро).
const { useState, useEffect, useRef, useMemo, useLayoutEffect } = React;

// ---------- Avatar ----------
function Avatar({ src, initial, color, size = 36, online = false }) {
  const bg = color || "#8B7BD8";
  return (
    <div className="avatar-wrap" style={{ width: size, height: size }}>
      {src ? (
        <img className="avatar" src={src} alt="" style={{ width: size, height: size }} />
      ) : (
        <div
          className="avatar initial"
          style={{ width: size, height: size, background: bg, fontSize: size * 0.42 }}
        >
          {initial}
        </div>
      )}
      {online && <span className="online-dot" />}
    </div>
  );
}

// ---------- Chat Header (slim — no action buttons) ----------
function ChatHeader({ isTyping }) {
  return (
    <header className="chat-header">
      <Avatar src="assets/photo.webp" size={44} online />
      <div className="chat-header-info">
        <div className="chat-header-name">Андрей Осягин</div>
        <div className={"chat-header-status " + (isTyping ? "typing" : "")}>
          {isTyping ? "печатает..." : "в сети"}
        </div>
      </div>
    </header>
  );
}

// ---------- Reaction picker + interactive reactions ----------
const REACTION_OPTIONS = ["❤️", "🔥", "👍", "😍", "🤩", "😂", "🙌", "🎉"];

function ReactionsRow({ msgId, initial = [] }) {
  const mineKey = "reactions_mine_" + msgId;
  const [counts, setCounts] = useState({}); // глобальные счётчики из Firebase: { emoji: number }
  const [mine, setMine] = useState(() => {
    try {
      const raw = localStorage.getItem(mineKey);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return {};
  });
  const [pickerOpen, setPickerOpen] = useState(false);
  const [seededRef] = useState(() => ({ done: false }));

  // Сохраняем "свои" реакции
  useEffect(() => {
    try { localStorage.setItem(mineKey, JSON.stringify(mine)); } catch (e) {}
  }, [mine]);

  // Подписка на Firebase + начальный сид реакций из сценария (один раз на сообщение, глобально)
  useEffect(() => {
    if (!window.reactionsAPI) return;
    const api = window.reactionsAPI;
    const unsub = api.subscribe(msgId, (raw) => {
      const decoded = {};
      Object.entries(raw || {}).forEach(([k, v]) => {
        decoded[api.decodeEmoji(k)] = v;
      });
      setCounts(decoded);

      // Один раз — если в БД пусто и у нас есть начальные реакции из сценария, посеем их
      if (!seededRef.done && Object.keys(decoded).length === 0 && initial && initial.length) {
        seededRef.done = true;
        const seedFlag = "reactions_seeded_" + msgId;
        if (!localStorage.getItem(seedFlag)) {
          localStorage.setItem(seedFlag, "1");
          initial.forEach((e) => api.bump(msgId, e, 1));
        }
      } else {
        seededRef.done = true;
      }
    });
    return () => unsub && unsub();
  }, [msgId]);

  const toggle = async (emoji) => {
    const isMine = !!mine[emoji];
    const delta = isMine ? -1 : 1;
    setMine((m) => {
      const n = { ...m };
      if (isMine) delete n[emoji]; else n[emoji] = 1;
      return n;
    });
    setPickerOpen(false);
    if (window.reactionsAPI) {
      try { await window.reactionsAPI.bump(msgId, emoji, delta); }
      catch (e) { console.warn("reaction bump failed", e); }
    }
  };

  // Объединяем: показываем все emoji где count>0, плюс любые mine (на случай оптимистичного клика до ответа БД)
  const allEmojis = new Set([
    ...Object.keys(counts).filter((e) => counts[e] > 0),
    ...Object.keys(mine),
  ]);
  const entries = [...allEmojis].map((e) => ({
    emoji: e,
    count: counts[e] || 0,
    mine: !!mine[e],
  })).filter((x) => x.count > 0);

  return (
    <div className="reactions-wrap">
      <div className="reactions">
        {entries.map(({ emoji, count, mine: isMine }) => (
          <button
            key={emoji}
            className={"reaction " + (isMine ? "mine" : "")}
            onClick={() => toggle(emoji)}
            type="button"
          >
            <span className="reaction-emoji">{emoji}</span>
            <span className="reaction-count">{count}</span>
          </button>
        ))}
        <div className="reaction-add-wrap">
          <button
            className="reaction-add"
            type="button"
            onClick={() => setPickerOpen((o) => !o)}
            aria-label="Добавить реакцию"
          >
            <svg viewBox="0 0 24 24" width="14" height="14">
              <path fill="currentColor" d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8zm-3.5-9.5A1.5 1.5 0 1 1 10 9a1.5 1.5 0 0 1-1.5 1.5zm7 0A1.5 1.5 0 1 1 17 9a1.5 1.5 0 0 1-1.5 1.5zM12 17.5a5.48 5.48 0 0 1-4.9-3h9.8a5.48 5.48 0 0 1-4.9 3z"/>
            </svg>
            <span className="plus">+</span>
          </button>
          {pickerOpen && (
            <>
              <div className="picker-backdrop" onClick={() => setPickerOpen(false)} />
              <div className="reaction-picker">
                {REACTION_OPTIONS.map((e) => (
                  <button key={e} className="picker-option" onClick={() => toggle(e)} type="button">
                    {e}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------- Message wrapper ----------
function Bubble({ children, msgId, initialReactions, muted, noPadding, className = "" }) {
  return (
    <div className="bubble-row">
      <div
        className={
          "bubble " + (muted ? "muted " : "") + (noPadding ? "no-pad " : "") + className
        }
      >
        {children}
      </div>
      {!muted && msgId !== undefined && (
        <ReactionsRow msgId={msgId} initial={initialReactions || []} />
      )}
    </div>
  );
}

function MessageMeta({ time = "15:42", seen = true }) {
  return (
    <span className="meta">
      <span className="meta-time">{time}</span>
      {seen && (
        <svg className="meta-seen" viewBox="0 0 18 14" width="16" height="12">
          <path fill="currentColor" d="M11.5 0.5L5 7l-2.5-2.5-1 1L5 9 12.5 1.5zM16 0.5L9.5 7 8 5.5l-1 1L9.5 9 17 1.5z"/>
        </svg>
      )}
    </span>
  );
}

// ---------- Text message ----------
function TextMessage({ text, muted, time, msgId, initialReactions }) {
  return (
    <Bubble msgId={msgId} initialReactions={initialReactions} muted={muted}>
      <div className="text-content">
        <span>{text}</span>
        <MessageMeta time={time} />
      </div>
    </Bubble>
  );
}

// ---------- Photo message ----------
function PhotoMessage({ src, caption, time, msgId, initialReactions }) {
  return (
    <Bubble msgId={msgId} initialReactions={initialReactions} noPadding>
      <div className="photo-msg">
        <img src={src} alt="" />
        {caption && (
          <div className="photo-caption">
            <span>{caption}</span>
            <MessageMeta time={time} />
          </div>
        )}
        {!caption && <div className="photo-meta"><MessageMeta time={time} /></div>}
      </div>
    </Bubble>
  );
}

// ---------- Link preview ----------
function LinkPreview({ url, site, title, description, color, initial, time, msgId, initialReactions }) {
  return (
    <Bubble msgId={msgId} initialReactions={initialReactions}>
      <div className="link-preview">
        <div className="link-accent">
          <div className="link-badge" style={{ background: color }}>{initial}</div>
          <div className="link-body">
            <div className="link-site">{site}</div>
            <div className="link-title">{title}</div>
            <div className="link-desc">{description}</div>
          </div>
        </div>
        <a className="link-cta" href={url} target="_blank" rel="noopener">
          <span>{url.replace("https://", "")}</span>
          <svg viewBox="0 0 24 24" width="14" height="14"><path fill="currentColor" d="M14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3z"/></svg>
        </a>
        <MessageMeta time={time} />
      </div>
    </Bubble>
  );
}

// ---------- Video preview ----------
function VideoPreview({ src, thumb, title, duration, time, msgId, initialReactions }) {
  const [playing, setPlaying] = useState(false);
  return (
    <Bubble msgId={msgId} initialReactions={initialReactions} noPadding>
      <div className="video-msg">
        {!playing ? (
          <div className="video-thumb" onClick={() => setPlaying(true)}>
            <img src={thumb} alt="" />
            <button className="play-btn" aria-label="Play">
              <svg viewBox="0 0 24 24" width="26" height="26"><path fill="#fff" d="M8 5v14l11-7z"/></svg>
            </button>
            <span className="video-duration">{duration}</span>
          </div>
        ) : (
          <div className="video-frame">
            <iframe src={src + "&autoplay=1"} title={title} frameBorder="0" allow="autoplay; encrypted-media" allowFullScreen></iframe>
          </div>
        )}
        <div className="video-caption">
          <span>{title}</span>
          <MessageMeta time={time} />
        </div>
      </div>
    </Bubble>
  );
}

// ---------- Contact card ----------
function ContactCard({ label, value, href, time, msgId, initialReactions }) {
  return (
    <Bubble msgId={msgId} initialReactions={initialReactions}>
      <a className="contact-card" href={href}>
        <div className="contact-ico">
          <svg viewBox="0 0 24 24" width="22" height="22"><path fill="currentColor" d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 4l-8 5-8-5V6l8 5 8-5z"/></svg>
        </div>
        <div className="contact-body">
          <div className="contact-label">{label}</div>
          <div className="contact-value">{value}</div>
        </div>
      </a>
      <MessageMeta time={time} />
    </Bubble>
  );
}

// ---------- Socials row ----------
function SocialsCard({ items, time, msgId, initialReactions }) {
  return (
    <Bubble msgId={msgId} initialReactions={initialReactions}>
      <div className="socials-card">
        <div className="socials-title">Где меня найти</div>
        <div className="socials-grid">
          {items.map((s) => (
            <a key={s.key} className="social-item" href={s.href} target="_blank" rel="noopener">
              <div className="social-ico" style={{ background: s.color }}>
                {s.key === "fb" && "f"}
                {s.key === "yt" && "▶"}
                {s.key === "ig" && "◉"}
              </div>
              <span>{s.name}</span>
            </a>
          ))}
        </div>
        <div className="socials-disclaimer">
          <em>Некоторые из перечисленных соцсетей принадлежат компании Meta, признанной экстремистской и запрещённой в РФ.</em>
        </div>
        <MessageMeta time={time} />
      </div>
    </Bubble>
  );
}

// ---------- Typing indicator ----------
function TypingBubble() {
  return (
    <div className="bubble-row">
      <div className="bubble typing-bubble">
        <div className="dots">
          <span></span><span></span><span></span>
        </div>
      </div>
    </div>
  );
}

// ---------- Day divider ----------
function DayDivider({ label }) {
  return <div className="day-divider"><span>{label}</span></div>;
}

// ---------- Pinned message ----------
function PinnedBar() {
  return (
    <div className="pinned-bar">
      <div className="pinned-stripe" />
      <div className="pinned-body">
        <div className="pinned-title">Закреплённое сообщение</div>
        <div className="pinned-text">👀 Если хотите куда-то меня позвать — напишите</div>
      </div>
    </div>
  );
}

function Composer() {
  return null;
}

function CatFooter() {
  return null;
}

Object.assign(window, {
  Avatar, ChatHeader, Bubble, MessageMeta,
  TextMessage, PhotoMessage, LinkPreview, VideoPreview,
  ContactCard, SocialsCard, TypingBubble, DayDivider, PinnedBar, Composer,
  CatFooter, ReactionsRow,
});
