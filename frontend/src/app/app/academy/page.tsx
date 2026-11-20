"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Award, Clock, PlayCircle } from "lucide-react";
import { api, post } from "@/lib/api";
import { useMe } from "@/components/app/MeContext";
import Burst from "@/components/app/Burst";

type Mod = { id: number; slug: string; title: string; minutes: number; points: number; badge: string; summary: string };
type Q = { q: string; options: string[] };
type Lesson = Mod & { steps: string[] };
type Result = { passed: boolean; score: number; badge?: string; points?: number; verify_code?: string };

export default function Academy() {
  const { me, refresh } = useMe();
  const [mods, setMods] = useState<Mod[]>([]);
  const [quiz, setQuiz] = useState<{ mod: Mod; qs: Q[]; i: number; answers: number[] } | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [step, setStep] = useState(0);
  async function openLesson(mod: Mod) {
    setResult(null); setStep(0);
    setLesson(await api<Lesson>(`/api/academy/${mod.slug}/lesson`));
  }
  useEffect(() => { api<Mod[]>("/api/academy").then(setMods); }, []);
  const earned = new Set(me?.certifications.map((c) => c.module.badge));

  async function start(mod: Mod) {
    setResult(null); setLesson(null);
    setQuiz({ mod, qs: await api<Q[]>(`/api/academy/${mod.slug}/quiz`), i: 0, answers: [] });
  }
  async function answer(k: number) {
    if (!quiz || !me) return;
    const answers = [...quiz.answers, k];
    if (answers.length < quiz.qs.length) return setQuiz({ ...quiz, answers, i: quiz.i + 1 });
    setResult(await post<Result>(`/api/academy/${quiz.mod.slug}/submit`, { mechanic_id: me.mechanic.id, answers }));
    setQuiz(null); refresh();
  }

  return (
    <div className="px-4 pt-4">
      <h1 className="font-display text-2xl font-bold">Guild Academy</h1>
      <p className="text-sm text-bone-dim">10-minute video lessons in your language. Pass the quiz, earn a badge riders can verify.</p>

      <AnimatePresence mode="wait">
        {lesson && !quiz ? (
          <motion.div key={`l${step}`} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="card mt-5 overflow-hidden">
            <div className="relative grid h-40 place-items-center bg-[linear-gradient(135deg,#2C313B,#101216)]">
              <div className="tread-bg absolute inset-0 opacity-60" />
              <p className="relative px-6 text-center font-display text-xl font-bold">{lesson.steps[step]}</p>
              <div className="absolute inset-x-0 bottom-0 h-1 bg-ink-600"><motion.div className="h-full bg-molten" animate={{ width: `${((step + 1) / lesson.steps.length) * 100}%` }} /></div>
            </div>
            <div className="p-5">
              <p className="font-mono text-[10px] uppercase tracking-widest text-molten">{lesson.title} · step {step + 1}/{lesson.steps.length}</p>
              <div className="mt-4 flex gap-2">
                <button onClick={() => setLesson(null)} className="btn-ghost">Back</button>
                {step < lesson.steps.length - 1 ? (
                  <button onClick={() => setStep(step + 1)} className="btn-primary flex-1">Next step</button>
                ) : (
                  <button onClick={() => start(lesson)} className="btn-primary flex-1">Take the quiz</button>
                )}
              </div>
            </div>
          </motion.div>
        ) : quiz ? (
          <motion.div key={quiz.i} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="card mt-5 p-5">
            <p className="font-mono text-[10px] uppercase tracking-widest text-molten">{quiz.mod.title} · Q{quiz.i + 1}/{quiz.qs.length}</p>
            <p className="mt-2 font-semibold">{quiz.qs[quiz.i].q}</p>
            <div className="mt-4 space-y-2">
              {quiz.qs[quiz.i].options.map((o, k) => (
                <button key={o} onClick={() => answer(k)} className="w-full rounded-xl border border-white/10 bg-ink-700 p-3 text-left text-sm hover:border-molten">{o}</button>
              ))}
            </div>

          </motion.div>
        ) : result ? (
          <motion.div key="res" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative mt-5 overflow-hidden rounded-3xl border border-amber/40 bg-gradient-to-br from-amber/20 to-ink-800 p-6 text-center">
            {result.passed && <Burst />}
            <Award className="mx-auto h-12 w-12 text-amber" />
            <p className="mt-2 font-display text-2xl font-black">{result.passed ? result.badge : "Almost there"}</p>
            {result.passed && !result.points && <p className="text-xs text-bone-dim">Badge already earned. Practice run only.</p>}
            <p className="text-sm text-bone-dim">Score {result.score}%{result.passed && ` · +${result.points} pts`}</p>
            {result.verify_code && <p className="mt-3 font-mono text-xs">Credential: {result.verify_code} · <a className="underline" href={`/board/${me?.mechanic.id}`} target="_blank">shown on your Shop Board</a></p>}
            <button onClick={() => setResult(null)} className="btn-ghost mt-4">Back to modules</button>
          </motion.div>
        ) : (
          <motion.div key="list" className="mt-5 space-y-3">
            {mods.map((m) => (
              <div key={m.id} className="flex gap-3 rounded-2xl bg-ink-800 p-3">
                <button onClick={() => openLesson(m)} aria-label={`Play ${m.title}`} className="relative grid h-20 w-24 shrink-0 place-items-center overflow-hidden rounded-xl bg-[linear-gradient(135deg,#2C313B,#101216)]">
                  <PlayCircle className="h-8 w-8 text-bone/80" />
                  {earned.has(m.badge) && <span className="absolute right-1 top-1 rounded bg-volt px-1 text-[9px] font-bold text-ink">DONE</span>}
                </button>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{m.title}</p>
                  <p className="text-[11px] text-bone-dim">{m.summary}</p>
                  <div className="mt-1.5 flex items-center gap-3 text-[11px] text-bone-mute">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{m.minutes} min</span>
                    <span className="text-volt">+{m.points} pts</span>
                    <button onClick={() => openLesson(m)} className="ml-auto font-semibold text-molten">Start →</button>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
