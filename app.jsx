const { useState, useEffect, useRef } = React;

function App() {
  const [profileOpen, setProfileOpen] = useState(false);
  const [loaderVisible, setLoaderVisible] = useState(true);

  useEffect(() => {
    // Скрываем лоадер после загрузки страницы + минимум 1.5с (чтобы успеть показать)
    const minTime = new Promise((r) => setTimeout(r, 1500));
    const pageLoad = document.readyState === "complete"
      ? Promise.resolve()
      : new Promise((r) => window.addEventListener("load", r, { once: true }));
    Promise.all([minTime, pageLoad]).then(() => {
      setLoaderVisible(false);
    });
  }, []);

  return (
    <div className="app">
      <RetroLoader visible={loaderVisible} />
      <div className="bg-layer">
        <div className="bg-blob blob-1" />
        <div className="bg-blob blob-2" />
        <div className="bg-blob blob-3" />
        <div className="bg-grain" />
      </div>

      <div className="layout">
        <main className="chat-pane">
          <ChatStream onOpenProfile={() => setProfileOpen(true)} />
        </main>
      </div>

      <ProfilePopup open={profileOpen} onClose={() => setProfileOpen(false)} />
    </div>
  );
}

function ChatStream({ onOpenProfile }) {
  const script = window.CHAT_SCRIPT;
  const [topHidden, setTopHidden] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY || 0;
    let ticking = false;

    const update = () => {
      const y = window.scrollY || 0;
      const delta = y - lastY;
      // Рядом с верхом всегда показываем
      if (y < 80) {
        setTopHidden(false);
      } else if (delta > 8) {
        // Скролл вниз — прячем
        setTopHidden(true);
      } else if (delta < -8) {
        // Скролл вверх — показываем
        setTopHidden(false);
      }
      lastY = y;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const renderMsg = (m, idx) => {
    const time = makeTime(idx);
    switch (m.type) {
      case "text":
        return <TextMessage key={idx} text={m.text} muted={m.muted} time={time} />;
      case "photo":
        return <PhotoMessage key={idx} src={m.src} caption={m.caption} time={time} />;
      case "link-preview":
        return <LinkPreview key={idx} {...m} time={time} />;
      case "video-preview":
        return <VideoPreview key={idx} {...m} time={time} />;
      case "contact":
        return <ContactCard key={idx} label={m.label} value={m.value} href={m.href} time={time} />;
      case "socials":
        return <SocialsCard key={idx} items={m.items} time={time} />;
      default:
        return null;
    }
  };

  return (
    <>
      <div className={"chat-top" + (topHidden ? " chat-top-hidden" : "")}>
        <ChatHeader onOpenProfile={onOpenProfile} />
        <PinnedBar onOpenProfile={onOpenProfile} />
      </div>
      <div className="stream">
        <div className="stream-inner">
          <DayDivider label="Сегодня" />
          {script.map((m, i) => renderMsg(m, i))}
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
