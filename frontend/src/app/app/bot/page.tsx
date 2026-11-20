"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { CheckCheck, Mic, Send } from "lucide-react";
import { post } from "@/lib/api";
import { useMe } from "@/components/app/MeContext";

type Msg = { from: "me" | "bot"; text: string; quick?: string[]; t: string };

const now = () => new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

function Rich({ text }: { text: string }) {
  // WhatsApp-style *bold* and _italic_
  const parts = text.split(/(\*[^*]+\*|_[^_]+_)/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("*") ? <b key={i}>{p.slice(1, -1)}</b> : p.startsWith("_") ? <i key={i}>{p.slice(1, -1)}</i> : <span key={i}>{p}</span>,
      )}
    </>
  );
}

export default function Bot() {
  const { me, refresh } = useMe();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => { end.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, typing]);
  useEffect(() => { if (me && msgs.length === 0) send("hello", true); }, [me]); // eslint-disable-line react-hooks/exhaustive-deps

  async function send(t: string, silent = false) {
    if (!me || !t.trim()) return;
    if (!silent) setMsgs((m) => [...m, { from: "me", text: t, t: now() }]);
    setText(""); setTyping(true);
    const r = await post<{ messages: { text: string; quick_replies: string[] }[] }>("/api/bot", { mechanic_id: me.mechanic.id, text: t });
    await new Promise((res) => setTimeout(res, 650));
    setTyping(false);
    setMsgs((m) => [...m, ...r.messages.map((x) => ({ from: "bot" as const, text: x.text, quick: x.quick_replies, t: now() }))]);
    refresh();
  }

  const lastQuick = [...msgs].reverse().find((m) => m.from === "bot")?.quick ?? [];

  return (
    <div className="flex h-[calc(100dvh-7rem)] flex-col lg:h-[740px]">
      <header className="flex items-center gap-3 bg-[#1F2C34] px-4 py-3">
        <div className="grid h-10 w-10 place-items-center rounded-full bg-molten font-display text-sm font-black text-ink">GG</div>
        <div>
          <p className="font-semibold">Grip Guild Bot ✓</p>
          <p className="text-[11px] text-bone-mute">{typing ? "typing…" : "Business account · replies instantly"}</p>
        </div>
      </header>
      <div className="flex-1 space-y-2 overflow-y-auto bg-[#0B141A] bg-[radial-gradient(#ffffff08_1px,transparent_1px)] p-3 [background-size:18px_18px] no-scrollbar">
        <p className="mx-auto w-fit rounded-lg bg-[#182229] px-3 py-1 text-[10px] text-bone-mute">Messages are end-to-end encrypted</p>
        {msgs.map((m, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            className={`max-w-[85%] whitespace-pre-line rounded-2xl px-3 py-2 text-[13px] leading-relaxed ${m.from === "me" ? "ml-auto rounded-tr-sm bg-[#005C4B]" : "rounded-tl-sm bg-[#202C33]"}`}>
            <Rich text={m.text} />
            <span className="mt-1 flex items-center justify-end gap-1 text-[9px] text-bone/50">{m.t}{m.from === "me" && <CheckCheck className="h-3 w-3 text-sky" />}</span>
          </motion.div>
        ))}
        {typing && (
          <div className="flex w-fit gap-1 rounded-2xl bg-[#202C33] px-4 py-3">
            {[0, 1, 2].map((i) => <motion.span key={i} className="h-1.5 w-1.5 rounded-full bg-bone-mute" animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }} />)}
          </div>
        )}
        <div ref={end} />
      </div>
      {lastQuick.length > 0 && (
        <div className="flex gap-2 overflow-x-auto bg-[#0B141A] px-3 pb-2 no-scrollbar">
          {lastQuick.map((q) => <button key={q} onClick={() => send(q)} className="shrink-0 rounded-full border border-[#25D366]/40 px-3 py-1 text-xs text-[#25D366]">{q}</button>)}
          {["refer a rider", "tread 2.1mm", "my points"].map((q) => <button key={q} onClick={() => send(q)} className="shrink-0 rounded-full border border-white/10 px-3 py-1 text-xs text-bone-dim">{q}</button>)}
        </div>
      )}
      <form onSubmit={(e) => { e.preventDefault(); send(text); }} className="flex items-center gap-2 bg-[#1F2C34] p-2">
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Message" className="min-w-0 flex-1 rounded-full bg-[#2A3942] px-4 py-2.5 text-sm outline-none" />
        <button className="grid h-10 w-10 place-items-center rounded-full bg-[#00A884]" aria-label="Send">
          {text ? <Send className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </button>
      </form>
    </div>
  );
}
