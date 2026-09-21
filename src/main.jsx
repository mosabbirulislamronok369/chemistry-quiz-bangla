import React, {useEffect, useMemo, useState} from "react";
import {createRoot} from "react-dom/client";
import {BookOpen, FlaskConical, Gamepad2, Clock3, Trophy, Sparkles, Play, RotateCcw, ChevronRight, CheckCircle2, XCircle, Settings2} from "lucide-react";
import "./styles.css";

const CHAPTERS = [
  [1,"রসায়নের ধারণা ও ব্যবহার"],[2,"পদার্থের অবস্থা"],[3,"পদার্থের গঠন"],[4,"পর্যায় সারণি"],
  [5,"রাসায়নিক বন্ধন"],[6,"মোল ও রাসায়নিক গণনা"],[7,"রাসায়নিক বিক্রিয়া"],[8,"অম্ল, ক্ষার ও লবণ"],
  [9,"খনিজ সম্পদ ও ধাতু"],[10,"জৈব রসায়ন"]
];

function shuffle(a){ return [...a].sort(()=>Math.random()-0.5); }
function loadQuestions(){ return fetch("/data/questions.json").then(r=>r.json()); }

function App(){
  const [questions,setQuestions]=useState([]);
  const [view,setView]=useState("home");
  const [selected,setSelected]=useState(CHAPTERS.map(x=>x[0]));
  const [count,setCount]=useState(10);
  const [minutes,setMinutes]=useState(10);
  const [exam,setExam]=useState(null);
  const [best,setBest]=useState(()=>Number(localStorage.getItem("chemBest")||0));
  useEffect(()=>{ loadQuestions().then(setQuestions); if("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js"); },[]);
  const pool=useMemo(()=>questions.filter(q=>selected.includes(q.chapter)),[questions,selected]);

  function startExam(){
    if(!pool.length) return;
    const n=Math.min(Number(count),pool.length);
    const qs=shuffle(pool).slice(0,n); // unique IDs because source IDs are unique
    setExam({qs,index:0,answers:{},remaining:minutes*60,started:Date.now(),finished:false});
    setView("exam");
  }
  useEffect(()=>{
    if(view!=="exam" || !exam || exam.finished) return;
    const t=setInterval(()=>setExam(e=>{
      if(!e || e.finished) return e;
      if(e.remaining<=1) return finish(e);
      return {...e,remaining:e.remaining-1};
    }),1000);
    return ()=>clearInterval(t);
  },[view,exam?.finished]);
  function answer(i){
    setExam(e=>({...e,answers:{...e.answers,[e.qs[e.index].id]:i}}));
  }
  function next(){
    setExam(e=>e.index===e.qs.length-1 ? finish(e) : {...e,index:e.index+1});
  }
  function finish(e){
    const score=e.qs.reduce((s,q)=>s+(e.answers[q.id]===q.answer?1:0),0);
    const best2=Math.max(best,score);
    localStorage.setItem("chemBest",String(best2)); setBest(best2);
    return {...e,finished:true,score};
  }
  if(view==="game") return <Game onHome={()=>setView("home")}/>;
  if(view==="exam" && exam){
    if(exam.finished) return <Result exam={exam} onHome={()=>setView("home")} onAgain={startExam}/>;
    const q=exam.qs[exam.index], chosen=exam.answers[q.id];
    return <main className="app"><header className="topbar"><button className="brand" onClick={()=>setView("home")}><FlaskConical/>Chemistry Quiz BD</button><span className="timer"><Clock3/>{fmt(exam.remaining)}</span></header>
      <section className="exam-wrap"><div className="progress"><span>প্রশ্ন {exam.index+1} / {exam.qs.length}</span><span>{Object.keys(exam.answers).length} উত্তর</span></div>
      <div className="progressbar"><i style={{width:`${((exam.index+1)/exam.qs.length)*100}%`}}/></div>
      <article className="question-card"><div className="eyebrow">{q.chapterName}</div><h1>{q.q}</h1>
      <div className="options">{q.options.map((o,i)=><button key={o} className={`option ${chosen===i?"chosen":""}`} onClick={()=>answer(i)}><span>{String.fromCharCode(2453+i)}.</span>{o}</button>)}</div>
      <div className="bottom-row"><button className="ghost" onClick={()=>setView("home")}><RotateCcw/>বাতিল</button><button className="primary" disabled={chosen===undefined} onClick={next}>{exam.index===exam.qs.length-1?"ফলাফল":"পরের প্রশ্ন"}<ChevronRight/></button></div>
      </article></section></main>
  }
  return <Home selected={selected} setSelected={setSelected} count={count} setCount={setCount} minutes={minutes} setMinutes={setMinutes} pool={pool} best={best} startExam={startExam} setView={setView}/>;
}

function Home({selected,setSelected,count,setCount,minutes,setMinutes,pool,best,startExam,setView}){
  const all=selected.length===CHAPTERS.length;
  return <main className="app"><header className="topbar"><div className="brand"><FlaskConical/>Chemistry Quiz BD</div><span className="pill">Class 9–10 • NCTB 2026</span></header>
  <section className="hero"><div><div className="eyebrow"><Sparkles/> বাংলা কুইজ প্ল্যাটফর্ম</div><h1>রসায়ন শেখো,<br/><em>কুইজে জয় করো।</em></h1><p>অধ্যায়ভিত্তিক Practice, Multiple Chapter Exam, Model Test এবং Chemistry Game—সব এক জায়গায়।</p>
  <div className="hero-actions"><button className="primary big" onClick={startExam}><Play/>এখনই কুইজ</button><button className="secondary big" onClick={()=>setView("game")}><Gamepad2/>Chemistry Game</button></div></div>
  <div className="orb"><div className="orbit a"/><div className="orbit b"/><div className="atom">⚛</div><span>H₂O</span><span>Na⁺</span><span>CO₂</span></div></section>
  <section className="grid">
    <div className="panel"><div className="panel-head"><div><h2><BookOpen/> পরীক্ষা সেটআপ</h2><p>নিজের মতো সময়, মার্ক ও অধ্যায় বেছে নাও</p></div><Settings2/></div>
      <div className="field"><label>অধ্যায় নির্বাচন</label><button className="select-all" onClick={()=>setSelected(all?[]:CHAPTERS.map(x=>x[0]))}>{all?"সব বাদ দাও":"সব অধ্যায় নির্বাচন"}</button>
      <div className="chapters">{CHAPTERS.map(([id,name])=><label className={`chapter ${selected.includes(id)?"active":""}`} key={id}><input type="checkbox" checked={selected.includes(id)} onChange={e=>setSelected(s=>e.target.checked?[...s,id]:s.filter(x=>x!==id))}/><span>{id}</span>{name}</label>)}</div></div>
      <div className="settings-row"><div><label>প্রশ্ন / মার্ক</label><input type="number" min="1" max={Math.max(pool.length,1)} value={count} onChange={e=>setCount(e.target.value)}/></div><div><label>সময় (মিনিট)</label><input type="number" min="1" max="180" value={minutes} onChange={e=>setMinutes(e.target.value)}/></div></div>
      <div className="preset"><button onClick={()=>{setCount(10);setMinutes(10)}}>10 মিনিট • 10 মার্ক</button><button onClick={()=>{setCount(20);setMinutes(20)}}>20 মিনিট • 20 মার্ক</button><button onClick={()=>{setCount(30);setMinutes(30)}}>30 মিনিট • 30 মার্ক</button></div>
      <button className="primary full" disabled={!selected.length || !pool.length} onClick={startExam}><Play/>Exam শুরু করো <span>{pool.length} প্রশ্ন available</span></button>
    </div>
    <aside className="side"><div className="stat"><Trophy/><div><small>Best Score</small><strong>{best} / {Math.max(Number(count),1)}</strong></div></div>
    <button className="feature" onClick={startExam}><span className="ico purple"><Sparkles/></span><div><b>Random Quiz</b><small>নির্বাচিত অধ্যায় থেকে non-repeat প্রশ্ন</small></div><ChevronRight/></button>
    <button className="feature" onClick={()=>setView("game")}><span className="ico green"><Gamepad2/></span><div><b>Chemistry Game</b><small>ইন্টার‌্যাক্টিভ mini-game hub</small></div><ChevronRight/></button>
    <div className="note"><b>পরবর্তী আপগ্রেড</b><p>সৃজনশীল প্রশ্নোত্তরের জন্য data schema প্রস্তুত রাখা হয়েছে—পরে একই UI-তে যোগ করা যাবে।</p></div></aside>
  </section>
  <footer>Local-first • No Supabase • PWA ready • Cloudflare Pages ready</footer>
  </main>
}

function Result({exam,onHome,onAgain}){
  const pct=Math.round(exam.score/exam.qs.length*100);
  return <main className="app result-page"><div className="result-card"><div className="result-icon"><Trophy/></div><div className="eyebrow">পরীক্ষা শেষ</div><h1>{exam.score} / {exam.qs.length}</h1><p>{pct>=80?"দারুণ! তোমার প্রস্তুতি ভালো হচ্ছে।":pct>=50?"ভালো চেষ্টা! ভুলগুলো দেখে আবার অনুশীলন করো।":"আবার চেষ্টা করো—প্রতিটি ভুল শেখার সুযোগ।"}</p>
  <div className="result-actions"><button className="secondary big" onClick={onHome}>হোমে ফিরুন</button><button className="primary big" onClick={onAgain}><RotateCcw/>আবার দিন</button></div></div></main>
}
function Game({onHome}){ return <main className="app"><header className="topbar"><button className="brand" onClick={onHome}><FlaskConical/>Chemistry Quiz BD</button></header><section className="game"><div className="eyebrow"><Gamepad2/> Chemistry Game</div><h1>Atom Lab</h1><p>এই hub-এ পরবর্তীতে electron arrangement, bonding, reaction balancing-এর animated mini-game যোগ করা যাবে।</p><div className="game-grid"><div className="game-card"><div className="game-art">⚛️</div><h3>Build an Atom</h3><span>Coming next</span></div><div className="game-card"><div className="game-art">🧪</div><h3>Reaction Lab</h3><span>Coming next</span></div><div className="game-card"><div className="game-art">🔗</div><h3>Bond Builder</h3><span>Coming next</span></div></div><button className="secondary big" onClick={onHome}>কুইজে ফিরে যান</button></section></main>}

function fmt(s){return `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`}

function Root(){ const [page,setPage]=useState("app"); return page==="app"?<App/>:<Game/> }
createRoot(document.getElementById("root")).render(<Root/>);