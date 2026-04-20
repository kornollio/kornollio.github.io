// Компоненты для чата в стиле Telegram Dark (фиолетовый ретро).
const { useState, useEffect, useRef, useMemo, useLayoutEffect } = React;

// Общие данные профиля (для попапа и сценария)
const PROFILE = {
  name: "Андрей Осягин",
  subtitle: "Продуктовый менеджер, Авито Недвижимость",
  photo: "assets/photo.webp",
  email: "for@privetandrey.ru",
  socials: [
    { name: "Facebook", href: "https://www.facebook.com/osyagin", color: "#3B5998", key: "fb", handle: "@osyagin" },
    { name: "YouTube", href: "https://www.youtube.com/user/osyagin", color: "#FF0000", key: "yt", handle: "@osyagin" },
    { name: "Instagram", href: "https://www.instagram.com/andreyosyagin/", color: "#E1306C", key: "ig", handle: "@andreyosyagin" },
  ],
};
window.PROFILE = PROFILE;

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

// ---------- Chat Header ----------
function ChatHeader({ onOpenProfile }) {
  return (
    <header className="chat-header">
      <button
        className="chat-header-trigger"
        onClick={onOpenProfile}
        type="button"
        aria-label="Открыть профиль"
      >
        <Avatar src={PROFILE.photo} size={44} online />
        <div className="chat-header-info">
          <div className="chat-header-name">{PROFILE.name}</div>
          <div className="chat-header-status">в сети</div>
        </div>
      </button>
    </header>
  );
}

// ---------- Profile popup ----------
function ProfilePopup({ open, onClose }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="profile-modal" onClick={onClose}>
      <div className="profile-card" onClick={(e) => e.stopPropagation()}>
        <button className="profile-close" onClick={onClose} aria-label="Закрыть">
          <svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
        </button>
        <div className="profile-photo-wrap">
          <img className="profile-photo" src={PROFILE.photo} alt={PROFILE.name} />
        </div>
        <div className="profile-name">{PROFILE.name}</div>
        <div className="profile-sub">{PROFILE.subtitle}</div>

        <div className="profile-section">
          <div className="profile-section-title">Почта</div>
          <a className="profile-row" href={"mailto:" + PROFILE.email}>
            <div className="profile-row-ico mail">
              <svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 4l-8 5-8-5V6l8 5 8-5z"/></svg>
            </div>
            <div className="profile-row-body">
              <div className="profile-row-label">Написать письмо</div>
              <div className="profile-row-value">{PROFILE.email}</div>
            </div>
          </a>
        </div>

        <div className="profile-section">
          <div className="profile-section-title">Соцсети</div>
          {PROFILE.socials.map((s) => (
            <a key={s.key} className="profile-row" href={s.href} target="_blank" rel="noopener">
              <div className="profile-row-ico" style={{ background: s.color }}>
                {s.key === "fb" && "f"}
                {s.key === "yt" && "▶"}
                {s.key === "ig" && "◉"}
              </div>
              <div className="profile-row-body">
                <div className="profile-row-label">{s.name}</div>
                <div className="profile-row-value">{s.handle}</div>
              </div>
            </a>
          ))}
        </div>

        <div className="profile-disclaimer">
          <em>Некоторые из перечисленных соцсетей принадлежат компании Meta, признанной экстремистской и запрещённой в РФ.</em>
        </div>
      </div>
    </div>
  );
}

// ---------- Message wrapper ----------
function Bubble({ children, muted, noPadding, className = "" }) {
  return (
    <div className="bubble-row">
      <div
        className={
          "bubble " + (muted ? "muted " : "") + (noPadding ? "no-pad " : "") + className
        }
      >
        {children}
      </div>
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
function TextMessage({ text, muted, time }) {
  if (muted) {
    return (
      <Bubble muted>
        <div className="text-content">
          <span>{text}</span>
        </div>
      </Bubble>
    );
  }
  return (
    <Bubble>
      <div className="text-content">
        <span>{text}</span>
        <MessageMeta time={time} />
      </div>
    </Bubble>
  );
}

// ---------- Photo message ----------
function PhotoMessage({ src, caption, time }) {
  return (
    <Bubble noPadding>
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
function LinkPreview({ url, site, title, description, color, initial, time }) {
  return (
    <Bubble>
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
function VideoPreview({ src, thumb, title, duration, time }) {
  // Извлекаем ссылку для внешней вкладки из embed-URL
  const watchUrl = (() => {
    const m = /embed\/([^?&]+)/.exec(src || "");
    return m ? "https://www.youtube.com/watch?v=" + m[1] : src;
  })();
  return (
    <Bubble noPadding>
      <div className="video-msg">
        <a className="video-thumb" href={watchUrl} target="_blank" rel="noopener">
          <img src={thumb} alt="" />
          <span className="video-badge">
            <svg viewBox="0 0 24 24" width="14" height="10"><path fill="#fff" d="M21.6 7.2a2.5 2.5 0 0 0-1.76-1.77C18.27 5 12 5 12 5s-6.27 0-7.84.43A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.76 1.77C5.73 19 12 19 12 19s6.27 0 7.84-.43a2.5 2.5 0 0 0 1.76-1.77A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8zM10 15V9l5.2 3L10 15z"/></svg>
            YouTube
          </span>
          <button className="play-btn" aria-label="Открыть на YouTube" tabIndex={-1}>
            <svg viewBox="0 0 24 24" width="26" height="26"><path fill="#fff" d="M8 5v14l11-7z"/></svg>
          </button>
          <span className="video-duration">{duration}</span>
        </a>
        <a className="video-caption" href={watchUrl} target="_blank" rel="noopener">
          <span>{title}</span>
          <MessageMeta time={time} />
        </a>
      </div>
    </Bubble>
  );
}

// ---------- Contact card ----------
function ContactCard({ label, value, href, time }) {
  return (
    <Bubble>
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
function SocialsCard({ items, time }) {
  return (
    <Bubble>
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

// ---------- Day divider ----------
function DayDivider({ label }) {
  return <div className="day-divider"><span>{label}</span></div>;
}

// ---------- Pinned message ----------
function PinnedBar({ onOpenProfile }) {
  return (
    <button
      className="pinned-bar"
      onClick={onOpenProfile}
      type="button"
    >
      <div className="pinned-stripe" />
      <div className="pinned-body">
        <div className="pinned-title">Закреплённое сообщение</div>
        <div className="pinned-text">👀 Если хотите куда-то меня позвать — напишите</div>
      </div>
    </button>
  );
}

// ---------- Typing loader ----------
function RetroLoader({ visible }) {
  return (
    <div className={"typing-loader " + (visible ? "" : "hidden")}>
      <div className="typing-loader-bubble">
        <div className="dots">
          <span></span><span></span><span></span>
        </div>
      </div>
      <div className="typing-loader-label">Андрей печатает...</div>
    </div>
  );
}

Object.assign(window, {
  Avatar, ChatHeader, Bubble, MessageMeta,
  TextMessage, PhotoMessage, LinkPreview, VideoPreview,
  ContactCard, SocialsCard, DayDivider, PinnedBar,
  ProfilePopup, RetroLoader,
});
