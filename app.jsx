const { useState, useEffect, useRef } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "typingSpeed": 2.0,
  "autoStart": true
}/*EDITMODE-END*/;

function App() {
  const [tweaks, setTweaks] = useState(TWEAK_DEFAULTS);
  const [tweaksOpen, setTweaksOpen] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      if (!e.data) return;
      if (e.data.type === "__activate_edit_mode") setTweaksOpen(true);
      if (e.data.type === "__deactivate_edit_mode") setTweaksOpen(false);
    };
    window.addEventListener("message", handler);
    window.parent.postMessage({ type: "__edit_mode_available" }, "*");
    return () => window.removeEventListener("message", handler);
  }, []);

  const updateTweak = (key, val) => {
    setTweaks((t) => {
      const next = { ...t, [key]: val };
      window.parent.postMessage({ type: "__edit_mode_set_keys", edits: { [key]: val } }, "*");
      return next;
    });
  };

  const [restartKey, setRestartKey] = useState(0);
  const restart = () => setRestartKey((k) => k + 1);

  return (
    <div className="app">
      <div className="bg-layer">
        <div className="bg-blob blob-1" />
        <div className="bg-blob blob-2" />
        <div className="bg-blob blob-3" />
        <div className="bg-grain" />
      </div>

      <div className="layout">
        <main className="chat-pane">
          <ChatStream
            key={restartKey}
            speed={tweaks.typingSpeed}
            autoStart={tweaks.autoStart}
          />
        </main>
      </div>

      {tweaksOpen && (
        <div className="tweaks-panel">
          <div className="tweaks-head">
            <span>Tweaks</span>
            <button className="icon-btn" onClick={() => setTweaksOpen(false)}>
              <svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
            </button>
          </div>
          <div className="tweak-row">
            <label>Скорость печати</label>
            <div className="slider-wrap">
              <input
                type="range"
                min="0.2"
                max="3"
                step="0.1"
                value={tweaks.typingSpeed}
                onChange={(e) => updateTweak("typingSpeed", parseFloat(e.target.value))}
              />
              <span className="slider-val">{tweaks.typingSpeed.toFixed(1)}×</span>
            </div>
          </div>
          <div className="tweak-row">
            <label>Автостарт</label>
            <input
              type="checkbox"
              checked={tweaks.autoStart}
              onChange={(e) => updateTweak("autoStart", e.target.checked)}
            />
          </div>
          <button className="tweak-btn" onClick={restart}>↻ Проиграть диалог заново</button>
          <button
            className="tweak-btn secondary"
            onClick={() => {
              Object.keys(localStorage)
                .filter((k) => k.startsWith("reactions_v2_"))
                .forEach((k) => localStorage.removeItem(k));
              restart();
            }}
          >
            Сбросить реакции
          </button>
        </div>
      )}
    </div>
  );
}

function ChatStream({ speed, autoStart }) {
  const script = window.CHAT_SCRIPT;
  const [visible, setVisible] = useState([]);
  const [typing, setTyping] = useState(false);
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [visible, typing]);

  useEffect(() => {
    if (!autoStart) return;
    const t = setTimeout(() => setStarted(true), 400);
    return () => clearTimeout(t);
  }, [autoStart]);

  useEffect(() => {
    if (!started) return;
    let idx = 0;
    let cancelled = false;
    const timers = [];

    const schedule = (fn, ms) => {
      const id = setTimeout(fn, ms);
      timers.push(id);
    };

    const next = () => {
      if (cancelled || idx >= script.length) {
        setTyping(false);
        setDone(true);
        return;
      }
      const msg = script[idx];
      setTyping(true);
      const typingMs = Math.max(300, (msg.typing || 1000) / speed);
      schedule(() => {
        if (cancelled) return;
        setTyping(false);
        setVisible((v) => [...v, { ...msg, _id: idx, _time: makeTime(idx) }]);
        idx++;
        const afterMs = Math.max(150, (msg.after || 500) / speed);
        schedule(next, afterMs);
      }, typingMs);
    };

    schedule(next, 500 / speed);

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [started, speed]);

  const renderMsg = (m) => {
    const common = {
      time: m._time,
      msgId: m._id,
      initialReactions: m.reactions,
    };
    switch (m.type) {
      case "text":
        return <TextMessage key={m._id} text={m.text} muted={m.muted} {...common} />;
      case "photo":
        return <PhotoMessage key={m._id} src={m.src} caption={m.caption} {...common} />;
      case "link-preview":
        return <LinkPreview key={m._id} {...m} {...common} />;
      case "video-preview":
        return <VideoPreview key={m._id} {...m} {...common} />;
      case "contact":
        return <ContactCard key={m._id} label={m.label} value={m.value} href={m.href} {...common} />;
      case "socials":
        return <SocialsCard key={m._id} items={m.items} {...common} />;
      default:
        return null;
    }
  };

  return (
    <>
      <ChatHeader isTyping={typing} />
      <PinnedBar />
      <div className="stream" ref={scrollRef}>
        <div className="stream-inner">
          <DayDivider label="Сегодня" />
          {visible.map((m) => renderMsg(m))}
          {typing && <TypingBubble />}
        </div>
      </div>
    </>
  );
}

function makeTime(i) {
  const base = 15 * 60 + 42;
  const t = base + Math.floor(i / 2);
  const h = Math.floor(t / 60) % 24;
  const m = t % 60;
  return `${h}:${String(m).padStart(2, "0")}`;
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
