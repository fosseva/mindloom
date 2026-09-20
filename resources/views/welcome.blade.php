<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="Mindloom turns what you learn into working knowledge through deliberate recall and spaced review.">
    <title>Mindloom — Working knowledge, practiced</title>
    <style>
        :root { color-scheme: light; font-family: "Avenir Next", "Segoe UI", sans-serif; --ink:#17231f; --paper:#f4f1e8; --moss:#315c49; --sage:#dce7dd; --coral:#d96c4c; --amber:#c9922f; }
        * { box-sizing: border-box; }
        body { min-width:320px; min-height:100vh; margin:0; overflow-x:hidden; background:radial-gradient(circle at 80% 15%,rgb(220 231 221 / 85%),transparent 28rem),var(--paper); color:var(--ink); }
        .page { display:flex; min-height:100vh; flex-direction:column; }
        .nav,.hero,.footer { width:min(1120px,calc(100% - 40px)); margin-inline:auto; }
        .nav { display:flex; align-items:center; justify-content:space-between; padding-block:28px; }
        .brand { display:flex; align-items:center; gap:12px; font-size:18px; font-weight:700; letter-spacing:-.02em; }
        .brand-mark { display:grid; width:42px; height:42px; place-items:center; border-radius:14px; background:var(--moss); color:#fff; box-shadow:0 10px 28px rgb(49 92 73 / 18%); }
        .status { display:flex; align-items:center; gap:8px; border:1px solid rgb(23 35 31 / 10%); border-radius:999px; padding:8px 12px; background:rgb(255 255 255 / 45%); color:rgb(23 35 31 / 68%); font-size:13px; font-weight:600; backdrop-filter:blur(12px); }
        .status-dot { width:7px; height:7px; border-radius:50%; background:#58a278; box-shadow:0 0 0 4px rgb(88 162 120 / 14%); }
        .hero { display:grid; flex:1; align-items:center; gap:72px; padding-block:68px 96px; }
        .eyebrow { margin:0 0 20px; color:var(--moss); font-size:13px; font-weight:700; letter-spacing:.14em; text-transform:uppercase; }
        h1 { max-width:760px; margin:0; font-size:clamp(3.25rem,8vw,6.75rem); font-weight:650; letter-spacing:-.065em; line-height:.92; }
        .accent { color:var(--moss); }
        .intro { max-width:610px; margin:30px 0 0; color:rgb(23 35 31 / 64%); font-size:clamp(1.05rem,2vw,1.25rem); line-height:1.65; }
        .principles { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; }
        .principle { min-height:178px; border:1px solid rgb(23 35 31 / 9%); border-radius:24px; padding:24px; background:rgb(255 255 255 / 52%); box-shadow:0 20px 60px rgb(23 35 31 / 5%); backdrop-filter:blur(16px); }
        .principle-icon { display:grid; width:40px; height:40px; place-items:center; border-radius:13px; background:var(--sage); color:var(--moss); }
        .principle:nth-child(2) .principle-icon { background:rgb(201 146 47 / 14%); color:#8b6219; }
        .principle:nth-child(3) .principle-icon { background:rgb(217 108 76 / 13%); color:#a3452a; }
        .principle h2 { margin:22px 0 8px; font-size:17px; letter-spacing:-.02em; }
        .principle p { margin:0; color:rgb(23 35 31 / 58%); font-size:14px; line-height:1.55; }
        .footer { display:flex; justify-content:space-between; gap:20px; border-top:1px solid rgb(23 35 31 / 10%); padding-block:22px 30px; color:rgb(23 35 31 / 48%); font-size:12px; }
        @media (max-width:760px) { .nav,.hero,.footer { width:min(100% - 28px,1120px); } .nav { padding-block:18px; } .status-label { display:none; } .hero { gap:48px; padding-block:48px 64px; } h1 { font-size:clamp(3rem,17vw,5rem); } .principles { grid-template-columns:1fr 1fr; } .principle { min-height:164px; padding:20px; } }
        @media (max-width:440px) { .principles { grid-template-columns:1fr; } .principle { min-height:0; } .footer { flex-direction:column; } }
        @media (prefers-reduced-motion:no-preference) { .brand-mark,.hero-copy,.principle { animation:arrive 650ms ease-out both; } .hero-copy { animation-delay:80ms; } .principle:nth-child(1) { animation-delay:140ms; } .principle:nth-child(2) { animation-delay:200ms; } .principle:nth-child(3) { animation-delay:260ms; } .principle:nth-child(4) { animation-delay:320ms; } @keyframes arrive { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } } }
    </style>
</head>
<body>
<div class="page">
    <nav class="nav" aria-label="Primary navigation">
        <div class="brand"><span class="brand-mark" aria-hidden="true"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 4.5A3.5 3.5 0 0 0 6 8v8a3.5 3.5 0 0 0 3.5 3.5c1 0 1.9-.42 2.5-1.1.6.68 1.5 1.1 2.5 1.1A3.5 3.5 0 0 0 18 16V8a3.5 3.5 0 0 0-3.5-3.5c-1 0-1.9.42-2.5 1.1a3.47 3.47 0 0 0-2.5-1.1Z"/><path d="M12 5.6V18.4M6 10h3M15 10h3M7 15h2M15 15h2"/></svg></span>Mindloom</div>
        <div class="status" aria-label="Mindloom service is online"><span class="status-dot" aria-hidden="true"></span><span class="status-label">Service online</span></div>
    </nav>
    <main class="hero">
        <section class="hero-copy">
            <p class="eyebrow">Deliberate learning, built to last</p>
            <h1>Turn ideas into <span class="accent">working knowledge.</span></h1>
            <p class="intro">Mindloom helps you remember, explain, and apply what matters through active recall and adaptive spaced review.</p>
        </section>
        <section class="principles" aria-label="How Mindloom helps you learn">
            <article class="principle"><span class="principle-icon" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9.5 4.5A3.5 3.5 0 0 0 6 8v8a3.5 3.5 0 0 0 6 2.4V5.6a3.47 3.47 0 0 0-2.5-1.1Z"/><path d="M14.5 4.5A3.5 3.5 0 0 1 18 8v8a3.5 3.5 0 0 1-6 2.4V5.6a3.47 3.47 0 0 1 2.5-1.1Z"/></svg></span><h2>Remember</h2><p>Build reliable recall for the facts and ideas you need.</p></article>
            <article class="principle"><span class="principle-icon" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z"/><path d="M8 9h8M8 13h5"/></svg></span><h2>Explain</h2><p>Put concepts into your own words until they become clear.</p></article>
            <article class="principle"><span class="principle-icon" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></svg></span><h2>Apply</h2><p>Practice using knowledge in decisions and real situations.</p></article>
            <article class="principle"><span class="principle-icon" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M8 13h8M8 17h5"/></svg></span><h2>Revisit</h2><p>Review at the right time, before important knowledge fades.</p></article>
        </section>
    </main>
    <footer class="footer"><span>Mindloom</span><span>Working knowledge, practiced.</span></footer>
</div>
</body>
</html>
