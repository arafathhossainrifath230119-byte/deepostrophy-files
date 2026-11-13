/* ============================================================================
   shared.js — DEEPostrophy-র শেয়ার্ড স্তর। index.html ও admin.html দুটোই এটি ব্যবহার করে।
   ভেতরে আছে: শেয়ার্ড CSS, Firebase কনফিগ, রঙ/kind তালিকা, কেন্দ্রীয় অনুবাদ অবজেক্ট (i18n),
   DB লেয়ার (Firestore / localStorage অ্যাডাপ্টার), Auth, স্টেট + টেমপ্লেট, অ্যানিমেশন ইঞ্জিন,
   রুটিং হেল্পার, ক্লিক সাউন্ড ও কাস্টম কার্সার ইঞ্জিন।
   এই ফাইলে কোনো কনটেন্ট নেই — সব লেখা ডেটা মালিক কন্ট্রোল প্যানেল থেকে আসে।
   admin.html-এ window.DEEO_ADMIN = true থাকলে মোজাইক/ড্রিফট/স্ট্যাগার অ্যানিমেশন চলবে না।
   ============================================================================ */

/* ---- শেয়ার্ড CSS — দুটি পেজই হুবহু একই ডিজাইন ---- */
const SHARED_CSS = String.raw`
  :root{
    --bg:#07070c; --bg-2:#0b0b14; --ink:#eef0ff; --muted:#a7a9c4; --faint:#71738f;
    --a1:#8b5cf6; --a2:#22d3ee;
    --glass:rgba(255,255,255,.045); --glass-strong:rgba(255,255,255,.07);
    --stroke:rgba(255,255,255,.10); --stroke-2:rgba(255,255,255,.18);
    --shadow:0 24px 60px -24px rgba(0,0,0,.7);
    --radius:22px; --radius-sm:14px; --ease:cubic-bezier(.22,.61,.36,1); --dur:520ms;
  }
  *{box-sizing:border-box}
  html{scroll-behavior:smooth}
  body{margin:0;font-family:"Noto Sans Bengali", system-ui,-apple-system,"Segoe UI",sans-serif;color:var(--ink);line-height:1.6;
    -webkit-font-smoothing:antialiased;overflow-x:hidden;min-height:100vh;
    background:radial-gradient(1200px 620px at 12% -8%,rgba(139,92,246,.20),transparent 60%),radial-gradient(1000px 560px at 92% 6%,rgba(34,211,238,.14),transparent 55%),radial-gradient(900px 700px at 50% 118%,rgba(139,92,246,.12),transparent 60%),linear-gradient(180deg,var(--bg),var(--bg-2) 60%,var(--bg));background-attachment:fixed}
  a{color:inherit;text-decoration:none} img{max-width:100%;display:block}
  /* EN মোডে লাতিন টেক্সট পরিষ্কার দেখানোর ফন্ট */
  html[lang="en"] body{font-family:"Inter","Noto Sans Bengali", system-ui,-apple-system,"Segoe UI",sans-serif}
  .wrap{width:min(1180px,92vw);margin-inline:auto} .en{letter-spacing:.2px}
  code,.mono{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}

  header.nav{position:sticky;top:0;z-index:50;backdrop-filter:saturate(150%) blur(16px);-webkit-backdrop-filter:saturate(150%) blur(16px);
    background:linear-gradient(180deg,rgba(7,7,12,.72),rgba(7,7,12,.35));border-bottom:1px solid var(--stroke)}
  .nav-inner{display:flex;align-items:center;gap:18px;height:70px}
  .brand{display:flex;align-items:center;gap:11px;font-weight:800;letter-spacing:.2px;cursor:pointer}
  .brand .dot{width:13px;height:13px;border-radius:50%;background:conic-gradient(from 210deg,var(--a1),var(--a2),var(--a1));box-shadow:0 0 18px 1px rgba(139,92,246,.7)}
  .brand .name{font-size:19px} .brand .name .glow{background:linear-gradient(92deg,var(--a1),var(--a2));-webkit-background-clip:text;background-clip:text;color:transparent}
  .nav-links{margin-left:auto;display:flex;gap:6px;align-items:center}
  .nav-links a{padding:9px 15px;border-radius:12px;color:var(--muted);font-weight:600;font-size:15px;transition:color .25s var(--ease),background .25s var(--ease)}
  .nav-links a:hover{color:var(--ink);background:var(--glass)} .nav-links a.active{color:var(--ink);background:var(--glass-strong);border:1px solid var(--stroke)}
  .burger{display:none;margin-left:auto;width:44px;height:40px;border-radius:12px;border:1px solid var(--stroke);background:var(--glass);color:var(--ink);cursor:pointer;font-size:20px}
  .nav-tools{margin-left:10px;display:flex;gap:8px;align-items:center}
  .nav-tool{display:inline-flex;align-items:center;gap:6px;height:36px;padding:0 12px;border-radius:999px;border:1px solid var(--stroke);background:var(--glass);color:var(--muted);
    font-family:inherit;font-size:12.5px;font-weight:700;letter-spacing:.02em;cursor:pointer;transition:color .22s var(--ease),border-color .22s var(--ease),background .22s var(--ease),transform .22s var(--ease)}
  .nav-tool:hover{color:var(--ink);border-color:var(--stroke-2);background:var(--glass-strong);transform:translateY(-1px)}
  .nav-tool svg{width:17px;height:17px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round;display:block}
  .nav-tool .lb{opacity:.42;transition:opacity .22s var(--ease),color .22s var(--ease)} .nav-tool .lb.on{opacity:1;color:var(--ink)}
  .nav-tool .sep{opacity:.3;font-weight:500}
  .nav-tool #sound-off-line{display:none} .nav-tool.muted #sound-on-wave{display:none} .nav-tool.muted #sound-off-line{display:block}
  @media(max-width:820px){ .nav-tools{gap:6px} .nav-tool{padding:0 10px;height:34px} }

  /* ---- ভাষা ড্রপডাউন — টগলের জায়গায়, উপরে সার্চ, প্রতিটি ভাষা নিজের লিপিতে ---- */
  .lang-dd{position:relative}
  .lang-dd .nav-tool{white-space:nowrap}
  .lang-dd .ld-cur{color:var(--ink);opacity:1}
  .lang-dd .ld-caret{font-size:11px;opacity:.6;margin-left:-2px}
  .lang-menu{position:absolute;top:calc(100% + 10px);right:0;width:236px;max-width:80vw;z-index:90;
    background:rgba(11,10,22,.92);backdrop-filter:saturate(150%) blur(18px);-webkit-backdrop-filter:saturate(150%) blur(18px);
    border:1px solid var(--stroke-2);border-radius:16px;box-shadow:var(--shadow);padding:8px;
    display:flex;flex-direction:column;gap:6px;animation:lmIn .18s var(--ease)}
  .lang-menu[hidden]{display:none}
  @keyframes lmIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:none}}
  .lm-search input{width:100%;height:34px;padding:0 12px;border-radius:10px;border:1px solid var(--stroke);
    background:var(--glass);color:var(--ink);font-family:inherit;font-size:13px;outline:none;transition:border-color .18s var(--ease),background .18s var(--ease)}
  .lm-search input:focus{border-color:var(--a1);background:var(--glass-strong)}
  .lm-list{list-style:none;margin:0;padding:0;max-height:262px;overflow:auto;display:flex;flex-direction:column;gap:2px}
  .lm-list li{display:flex;align-items:baseline;gap:8px;padding:8px 10px;border-radius:10px;cursor:pointer;transition:background .16s var(--ease)}
  .lm-list li:hover,.lm-list li.hi{background:var(--glass-strong);outline:none}
  .lm-list li .lm-native{font-size:14px;color:var(--ink);font-family:"Noto Sans Bengali","Noto Sans JP","Noto Sans Devanagari","Segoe UI",system-ui,sans-serif}
  .lm-list li .lm-latin{font-size:11.5px;color:var(--muted)}
  .lm-list li[aria-selected="true"]{background:linear-gradient(90deg,rgba(139,92,246,.24),rgba(34,211,238,.14))}
  .lm-list li[aria-selected="true"] .lm-native{color:var(--a2);font-weight:700}
  .lm-list li .lm-check{margin-left:auto;opacity:0;color:var(--a2);font-size:13px}
  .lm-list li[aria-selected="true"] .lm-check{opacity:1}
  .lm-empty{margin:0;padding:10px;text-align:center;font-size:12.5px;color:var(--muted)}
  .lm-empty[hidden]{display:none}
  @media(max-width:820px){ .lang-menu{width:210px} }

  /* ---- কাস্টম কার্সার (§৭) ---- */
  .cursor-on, .cursor-on *{cursor:none !important}
  #cursor{position:fixed;left:0;top:0;width:32px;height:32px;z-index:2147483000;pointer-events:none;opacity:0;
    transform:translate3d(-64px,-64px,0);will-change:transform;transition:opacity .16s var(--ease)}
  #cursor img{position:absolute;inset:0;width:100%;height:100%;-webkit-user-drag:none;user-select:none;
    transition:transform .14s var(--ease),filter .14s var(--ease)}
  #cursor .dot,#cursor .ring{position:absolute;left:50%;top:50%;border-radius:50%;display:none}
  #cursor .dot{width:9px;height:9px;margin:-4.5px 0 0 -4.5px;background:var(--a1);box-shadow:0 0 14px 3px rgba(139,92,246,.65)}
  #cursor .ring{width:24px;height:24px;margin:-12px 0 0 -12px;border:1.5px solid var(--a2)}
  #cursor.fallback img{display:none} #cursor.fallback .dot,#cursor.fallback .ring{display:block}
  #cursor.hot img{transform:scale(1.16);filter:brightness(1.3) drop-shadow(0 0 7px rgba(34,211,238,.5))}
  #cursor.hot.fallback .ring{transform:scale(1.16);filter:brightness(1.25)}
  #cursor.show{opacity:1}
  #cursor.no-anim,#cursor.no-anim img,#cursor.no-anim .ring{transition:none}
  @media(max-width:820px){
    .burger{display:block}
    .nav-links{position:fixed;inset:70px 4vw auto 4vw;flex-direction:column;align-items:stretch;background:rgba(11,11,20,.92);backdrop-filter:blur(18px);border:1px solid var(--stroke);border-radius:18px;padding:10px;gap:4px;box-shadow:var(--shadow);transform:translateY(-12px);opacity:0;pointer-events:none;transition:.28s var(--ease)}
    .nav-links.open{transform:translateY(0);opacity:1;pointer-events:auto} .nav-links a{padding:13px 15px}
  }

  .modebar{display:none;align-items:center;gap:10px;padding:9px 14px;border-bottom:1px solid var(--stroke);background:rgba(34,211,238,.06);font-size:13px;color:var(--muted)}
  .modebar.show{display:flex} .modebar .pill{margin-left:auto;font-weight:800;color:var(--a2)}

  main{display:block} .page{display:none;padding:44px 0 90px} .page.show{display:block}
  .eyebrow{display:inline-flex;align-items:center;gap:8px;font-size:13px;font-weight:700;color:var(--a2);letter-spacing:.3px}
  .eyebrow::before{content:"";width:22px;height:2px;background:linear-gradient(90deg,var(--a2),transparent);border-radius:2px}
  h1.hero{font-size:clamp(44px,10vw,116px);line-height:.98;font-weight:800;margin:14px 0 6px;letter-spacing:-1px;word-break:break-word}
  h1.hero .grad{background:linear-gradient(96deg,#fff 0%,var(--a1) 52%,var(--a2) 100%);-webkit-background-clip:text;background-clip:text;color:transparent}
  .sub{font-size:clamp(16px,2.4vw,21px);color:var(--muted);max-width:60ch}
  .hero-row{display:flex;align-items:center;gap:clamp(12px,3vw,36px);flex-wrap:wrap}
  .hero-row h1.hero{flex:0 1 auto;min-width:0}
  .hero-anim{flex:1 1 260px;width:100%;max-width:400px;height:auto;aspect-ratio:6/5;pointer-events:none;user-select:none}
  @media(max-width:820px){.hero-anim{max-width:340px;flex-basis:100%;margin:0 auto}}
  .hero-grid{display:flex;gap:12px;flex-wrap:wrap;margin-top:22px}

  .btn{display:inline-flex;align-items:center;gap:9px;font-weight:700;font-size:15px;cursor:pointer;padding:12px 20px;border-radius:14px;border:1px solid var(--stroke);background:var(--glass);color:var(--ink);transition:transform var(--dur) var(--ease),box-shadow var(--dur) var(--ease),background .3s,border-color .3s}
  .btn:hover{transform:translateY(-2px);box-shadow:0 14px 30px -14px rgba(139,92,246,.6);border-color:var(--stroke-2)}
  .btn.primary{background:linear-gradient(96deg,var(--a1),var(--a2));border:none;color:#0a0a12;box-shadow:0 16px 40px -16px rgba(34,211,238,.5)}
  .btn.ghost{background:transparent} .btn.sm{padding:8px 14px;font-size:13.5px;border-radius:11px}
  .btn.disabled,.btn[disabled]{opacity:.5;pointer-events:none;filter:grayscale(.4)}
  .btn.full{width:100%;justify-content:center}

  .section-head{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;margin:52px 0 22px;flex-wrap:wrap}
  .section-head h2{font-size:clamp(24px,4vw,34px);margin:0;font-weight:800;letter-spacing:-.3px} .section-head p{margin:6px 0 0;color:var(--muted)}

  .grid{display:grid;gap:20px;grid-template-columns:repeat(auto-fill,minmax(290px,1fr))}
  .grid.stores{grid-template-columns:repeat(auto-fill,minmax(230px,1fr))}
  .card{position:relative;border-radius:var(--radius);overflow:hidden;background:rgba(255,255,255,.06);border:1px solid var(--stroke);box-shadow:var(--shadow);transition:transform var(--dur) var(--ease),border-color var(--dur) var(--ease),box-shadow var(--dur) var(--ease);display:flex;flex-direction:column}
  .card:hover{transform:translateY(-6px);border-color:var(--stroke-2);box-shadow:0 40px 80px -32px rgba(0,0,0,.85),0 0 0 1px rgba(139,92,246,.25)}
  .cover{height:170px;position:relative;display:flex;align-items:flex-end;padding:16px;overflow:hidden}
  .cover .glow{position:absolute;inset:0} .cover .thumb{position:absolute;inset:0;object-fit:cover;width:100%;height:100%}
  .cover canvas.mosaic{position:absolute;inset:0;width:100%;height:100%;z-index:4;pointer-events:none}
  .cover .type{position:relative;z-index:5;font-size:12.5px;font-weight:700;color:#fff;background:rgba(0,0,0,.45);border:1px solid rgba(255,255,255,.2);padding:5px 11px;border-radius:999px}
  .card-body{padding:18px 18px 20px;display:flex;flex-direction:column;gap:11px;flex:1}
  .card-body h3{margin:0;font-size:20px;font-weight:800;letter-spacing:-.2px}
  .card-body .tagline{margin:-4px 0 0;color:var(--muted);font-size:14.5px;line-height:1.55}
  .langs{display:flex;flex-wrap:wrap;gap:7px;margin-top:2px}
  .chip{font-size:12px;font-weight:700;padding:4px 10px;border-radius:999px;border:1px solid var(--stroke);background:var(--glass);color:var(--muted)}
  .chip.en{font-family:ui-monospace,Menlo,monospace}
  .card-actions{display:flex;gap:9px;margin-top:auto;padding-top:6px;flex-wrap:wrap}
  .flag{position:absolute;left:14px;top:14px;z-index:6;font-size:11px;font-weight:800;letter-spacing:.3px;padding:4px 9px;border-radius:8px}
  .flag.feat{background:linear-gradient(96deg,var(--a1),var(--a2));color:#0a0a12} .flag.draft{background:rgba(0,0,0,.4);color:#ffd27a;border:1px solid rgba(255,210,122,.35)}

  .store-card{padding:22px;align-items:flex-start;gap:12px}
  .store-card .sicon{width:54px;height:54px;border-radius:16px;display:grid;place-items:center;font-size:26px;border:1px solid var(--stroke-2)}
  .store-card .skind{font-size:12px;font-weight:700;color:var(--a2)} .store-card h3{font-size:21px;margin:0}
  .store-card .sdesc{color:var(--muted);font-size:14px;margin:0;flex:1} .store-card .scount{font-size:13px;color:var(--faint);font-weight:700}

  .toolbar{display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-bottom:10px}
  .search{flex:1;min-width:220px;display:flex;align-items:center;gap:10px;background:var(--glass);border:1px solid var(--stroke);border-radius:14px;padding:11px 15px}
  .search input{flex:1;background:transparent;border:none;outline:none;color:var(--ink);font:inherit;font-size:15px}
  .search svg{width:18px;height:18px;stroke:var(--faint);fill:none;stroke-width:2}
  .filters{display:flex;gap:9px;flex-wrap:wrap}
  .filter{cursor:pointer;font-weight:700;font-size:14px;color:var(--muted);padding:9px 15px;border-radius:12px;border:1px solid var(--stroke);background:var(--glass);transition:.25s var(--ease)}
  .filter:hover{color:var(--ink)} .filter.on{color:#0a0a12;background:linear-gradient(96deg,var(--a1),var(--a2));border-color:transparent}

  .drift-wrap{overflow:hidden;-webkit-mask-image:linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent);mask-image:linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent)}
  .drift-track{display:flex;gap:10px;width:max-content;will-change:transform;padding:2px 0} .drift-track .chip{white-space:nowrap;cursor:default}

  .empty{border:1px dashed var(--stroke-2);border-radius:var(--radius);padding:40px 24px;text-align:center;color:var(--muted);background:var(--glass)}
  .empty b{color:var(--ink);display:block;font-size:18px;margin-bottom:6px}
  .skeleton{border:1px solid var(--stroke);border-radius:var(--radius);background:var(--glass);position:relative;overflow:hidden;min-height:280px}
  .skeleton::after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(255,255,255,.06),transparent);transform:translateX(-100%);animation:sh 1.2s infinite}
  @keyframes sh{to{transform:translateX(100%)}}

  .back{display:inline-flex;gap:8px;align-items:center;color:var(--muted);font-weight:700;margin-bottom:18px;cursor:pointer;transition:.25s var(--ease)}
  .back:hover{color:var(--ink);transform:translateX(-3px)}
  .detail-hero{border-radius:var(--radius);overflow:hidden;border:1px solid var(--stroke);background:var(--glass);box-shadow:var(--shadow);position:relative}
  .detail-cover{height:250px;position:relative;display:flex;align-items:flex-end;padding:26px;overflow:hidden}
  .detail-cover canvas.mosaic{position:absolute;inset:0;width:100%;height:100%;z-index:3;pointer-events:none}
  .detail-cover .title{position:relative;z-index:4} .detail-cover h2{margin:0;font-size:clamp(28px,6vw,50px);font-weight:800}
  .detail-cover p{margin:6px 0 0;color:rgba(255,255,255,.92);max-width:60ch}
  .detail-body{display:grid;grid-template-columns:1.6fr 1fr;gap:22px;margin-top:22px}
  @media(max-width:820px){.detail-body{grid-template-columns:1fr}}
  .panel{background:rgba(255,255,255,.06);border:1px solid var(--stroke);border-radius:var(--radius);padding:22px}
  .panel h3{margin:0 0 12px;font-size:18px;font-weight:800}
  .readme{white-space:pre-wrap;color:var(--muted);font-size:14.5px;line-height:1.8}
  .kv{display:flex;flex-direction:column;gap:12px} .kv .row{display:flex;justify-content:space-between;gap:12px;font-size:14px} .kv .row b{color:var(--muted);font-weight:600}
  .prose{color:var(--muted);font-size:16px;line-height:1.85;white-space:pre-wrap}

  .social{display:flex;flex-direction:column;gap:12px}
  .social a{display:flex;align-items:center;gap:12px;padding:14px 16px;border:1px solid var(--stroke);border-radius:14px;background:var(--glass);font-weight:700;transition:.25s var(--ease)}
  .social a:hover{transform:translateX(4px);border-color:var(--stroke-2)}
  .social .ic{width:30px;height:30px;border-radius:9px;display:grid;place-items:center;background:linear-gradient(96deg,var(--a1),var(--a2));color:#0a0a12;font-weight:800}
  .contact-grid{display:grid;grid-template-columns:1fr 1fr;gap:22px;margin-top:24px}
  @media(max-width:820px){.contact-grid{grid-template-columns:1fr}}

  /* অ্যাডমিন */
  .login{max-width:420px;margin:36px auto}
  .login .card{padding:28px;align-items:stretch}
  .badge-sec{display:inline-flex;gap:8px;align-items:center;font-size:12.5px;color:var(--faint);margin-top:14px;line-height:1.5}
  .tabs{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:18px;border-bottom:1px solid var(--stroke);padding-bottom:10px}
  .tab{cursor:pointer;font-weight:700;font-size:14.5px;color:var(--muted);padding:9px 16px;border-radius:12px;border:1px solid transparent;background:transparent;transition:color .2s,background .2s}
  .tab:hover{color:var(--ink)} .tab.on{color:var(--ink);background:var(--glass-strong);border-color:var(--stroke)}
  .tab .cnt{font-size:11px;background:rgba(255,255,255,.1);border-radius:999px;padding:1px 7px;margin-left:6px}
  .admin-bar{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:14px} .admin-bar .sp{flex:1}
  table.pm{width:100%;border-collapse:collapse;font-size:14px}
  table.pm th{text-align:left;color:var(--faint);font-weight:700;font-size:12.5px;padding:10px 12px;border-bottom:1px solid var(--stroke)}
  table.pm td{padding:12px;border-bottom:1px solid var(--stroke);vertical-align:middle}
  table.pm tr:hover td{background:rgba(255,255,255,.02)}
  .row-actions{display:flex;gap:6px;flex-wrap:wrap}
  .mini{font-size:12px;font-weight:700;padding:5px 9px;border-radius:9px;border:1px solid var(--stroke);background:var(--glass);color:var(--muted);cursor:pointer;transition:color .15s,border-color .15s}
  .mini:hover{color:var(--ink);border-color:var(--stroke-2)} .mini.danger:hover{color:#ff9a9a;border-color:rgba(255,154,154,.4)}
  .toggle{display:inline-flex;align-items:center;gap:8px;font-size:12.5px;font-weight:700}
  .sw{width:38px;height:22px;border-radius:999px;background:rgba(255,255,255,.14);position:relative;cursor:pointer;transition:background .2s;border:1px solid var(--stroke);flex:none}
  .sw::after{content:"";position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:50%;background:#fff;transition:transform .2s}
  .sw.on{background:linear-gradient(96deg,var(--a1),var(--a2));border-color:transparent} .sw.on::after{transform:translateX(16px)}

  .field{display:flex;flex-direction:column;gap:7px;margin-bottom:15px}
  .field label{font-size:13.5px;font-weight:700;color:var(--muted)}
  .field input,.field textarea,select.pf{background:var(--glass);border:1px solid var(--stroke);border-radius:12px;padding:12px 14px;color:var(--ink);font:inherit;font-size:15px;outline:none;transition:border-color .2s,box-shadow .2s}
  .field input:focus,.field textarea:focus,select.pf:focus{border-color:var(--a2);box-shadow:0 0 0 3px rgba(34,211,238,.16)}
  .field textarea{resize:vertical;min-height:110px}
  .two{display:grid;grid-template-columns:1fr 1fr;gap:14px} .three{display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px}
  @media(max-width:560px){.two,.three{grid-template-columns:1fr}}
  .note{font-size:13px;color:var(--faint);line-height:1.6}
  .accent-swatches{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
  .sw-acc{width:34px;height:34px;border-radius:10px;border:2px solid transparent;cursor:pointer;position:relative}
  .sw-acc.on{outline:2px solid #fff;outline-offset:1px} .sw-acc input[type=color]{position:absolute;inset:0;opacity:0;cursor:pointer}
  .social-editor{display:flex;flex-direction:column;gap:10px}
  .social-editor .se-row{display:flex;gap:8px} .social-editor .se-row input{flex:1;background:var(--glass);border:1px solid var(--stroke);border-radius:10px;padding:9px 12px;color:var(--ink);font:inherit;outline:none}
  .img-preview{display:block;width:100%;height:74px;border-radius:12px;background-size:cover;background-position:center;border:1px solid var(--stroke);margin-top:8px}

  dialog.modal{border:1px solid var(--stroke-2);background:var(--bg-2);color:var(--ink);border-radius:var(--radius);padding:0;width:min(600px,94vw);box-shadow:var(--shadow)}
  dialog.modal::backdrop{background:rgba(0,0,0,.6);backdrop-filter:blur(4px)}
  .modal-head{display:flex;align-items:center;justify-content:space-between;padding:20px 22px;border-bottom:1px solid var(--stroke)} .modal-head h3{margin:0;font-size:19px}
  .modal-body{padding:22px;max-height:72vh;overflow:auto} .modal-foot{display:flex;gap:10px;justify-content:flex-end;padding:18px 22px;border-top:1px solid var(--stroke)}
  .grp{border-top:1px solid var(--stroke);margin:6px 0 14px;padding-top:14px} .grp > label{color:var(--a2);font-size:12.5px;text-transform:none;letter-spacing:.3px;font-weight:800;display:block;margin-bottom:10px}

  /* FAQ / হেল্পার */
  .helper-fab{position:fixed;right:22px;bottom:22px;z-index:60;width:58px;height:58px;border-radius:50%;border:1px solid var(--stroke-2);cursor:pointer;
    background:linear-gradient(120deg,var(--a1),var(--a2));color:#0a0a12;font-size:26px;display:grid;place-items:center;box-shadow:0 18px 40px -14px rgba(34,211,238,.6)}
  .helper-panel{position:fixed;right:22px;bottom:90px;z-index:60;width:min(380px,92vw);max-height:70vh;display:none;flex-direction:column;
    background:rgba(11,11,20,.96);border:1px solid var(--stroke-2);border-radius:20px;box-shadow:var(--shadow);overflow:hidden}
  .helper-panel.open{display:flex}
  .helper-panel .hh{padding:16px 18px;border-bottom:1px solid var(--stroke);display:flex;align-items:center;gap:8px}
  .helper-panel .hh h4{margin:0;font-size:16px} .helper-panel .hh .mini{margin-left:auto}
  .helper-panel .hb{padding:16px 18px;overflow:auto}
  .faq-q{padding:12px 14px;border:1px solid var(--stroke);border-radius:12px;background:var(--glass);margin-bottom:9px;cursor:pointer;font-weight:700;font-size:14.5px;transition:.2s var(--ease)}
  .faq-q:hover{border-color:var(--stroke-2)} .faq-a{color:var(--muted);font-size:14px;line-height:1.75;padding:2px 14px 12px;white-space:pre-wrap;display:none}
  .faq-item.open .faq-a{display:block}

  footer{border-top:1px solid var(--stroke);margin-top:30px;padding:28px 0;background:rgba(7,7,12,.4)}
  .foot{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;color:var(--faint);font-size:14px} .foot a:hover{color:var(--ink)}

  .boot{position:fixed;inset:0;z-index:80;display:grid;place-items:center;background:var(--bg);transition:opacity .4s} .boot.hide{opacity:0;pointer-events:none}
  .boot .ring{width:46px;height:46px;border-radius:50%;border:3px solid rgba(255,255,255,.15);border-top-color:var(--a2);animation:spin .8s linear infinite} @keyframes spin{to{transform:rotate(360deg)}}

  /* টেক্সট মোজাইক */
  .mx{display:inline-block;white-space:pre-wrap} .mx .c{display:inline-block;will-change:transform,opacity}

  .reveal{opacity:0;transform:translateY(26px);transition:opacity var(--dur) var(--ease),transform var(--dur) var(--ease);transition-delay:calc(var(--i,0)*70ms)} .reveal.in{opacity:1;transform:none}

  @media (prefers-reduced-motion: reduce){
    html{scroll-behavior:auto}
    .reveal{opacity:1!important;transform:none!important;transition:none!important}
    .card:hover,.btn:hover,.social a:hover,.back:hover{transform:none}
    *{animation-duration:.001ms!important;transition-duration:.001ms!important}
    .drift-track{transform:none!important} .boot .ring{animation:none}
  }
`;
document.head.appendChild((function () { const st = document.createElement("style"); st.id = "shared-css"; st.textContent = SHARED_CSS; return st; })());

/* =========================================================
   কনফিগারেশন — এখানে নিজের Firebase মান বসান
   Firebase Console → Project settings → Your apps → SDK setup and configuration → Config
   সেখান থেকে apiKey, authDomain, projectId, storageBucket, appId ইত্যাদি কপি করে বসান।
   placeholder না বদলালে সাইট স্বয়ংক্রিয়ভাবে localStorage মোডে চলবে।
   ========================================================= */
const PLACEHOLDER = "__REPLACE_ME__";
const FIREBASE_CONFIG = {
  apiKey:            "AIzaSyDzvggPAjR64TQ5EVDrSEsLlPddmSSQLIE",
  authDomain:        "deepoostrophy.firebaseapp.com",
  projectId:         "deepoostrophy",
  storageBucket:     "deepoostrophy.firebasestorage.app",
  messagingSenderId: "459815787681",
  appId:             "1:459815787681:web:b5e756aabf740c7a6764e0"
};
// Firebase v10 ES-module SDK এই ঠিকানা থেকে লোড হবে (নির্দিষ্ট ভার্সন):
const FB_VERSION = "10.12.5";
const FB_CDN = "https://www.gstatic.com/firebasejs/" + FB_VERSION + "/";
// মালিক একমাত্র অ্যাডমিন: নিজের Firebase Auth ইমেইল এখানে বসান (অথবা UID)।
const OWNER_EMAIL = "arafathhossainrifath230119@gmail.com"; // <-- Firebase Auth Users-এর হুবহু ইমেইল
const OWNER_UID   = "";                        // চাইলে UID দিন (খালি রাখলে শুধু ইমেইল মিলবে)

const KINDS = {
  apps:{label:"অ্যাপ", icon:"📱", c:["#4338ca","#8b5cf6"]},
  "ai-tools":{label:"AI টুলস", icon:"✨", c:["#6d28d9","#22d3ee"]},
  arts:{label:"কালারফুল আর্টস", icon:"🎨", c:["#7c3aed","#db2777"]},
  "py-ext":{label:"পাইথন এক্সটেনশন", icon:"🧩", c:["#0f766e","#a3e635"]},
  books:{label:"বইয়ের কপি", icon:"📚", c:["#b45309","#f59e0b"]},
  files:{label:"ফাইল সংরক্ষণ", icon:"🗂️", c:["#0e7490","#22d3ee"]},
  links:{label:"লিংক", icon:"🔗", c:["#1e1b4b","#7c3aed"]},
  custom:{label:"কাস্টম", icon:"🏷️", c:["#334155","#0891b2"]},
};
const ITEM_TYPES = ["অ্যাপ","AI টুল","আর্ট","পাইথন এক্সটেনশন","বইয়ের কপি","ফাইল","লিংক","অন্যান্য"];
const PALETTE = [
  "linear-gradient(120deg,#6d28d9,#8b5cf6 45%,#22d3ee)",
  "linear-gradient(120deg,#7c3aed,#db2777 60%,#f59e0b)",
  "linear-gradient(120deg,#0e7490,#22d3ee 60%,#a3e635)",
  "linear-gradient(120deg,#b45309,#f59e0b 60%,#fde68a)",
  "linear-gradient(120deg,#1e1b4b,#4338ca 55%,#7c3aed)",
  "linear-gradient(120deg,#0f172a,#334155 55%,#0891b2)",
];

/* =========================================================
   কেন্দ্রীয় অনুবাদ (i18n) — সাইটের একমাত্র অনুবাদ অবজেক্ট: I18N
   ৮টি ভাষা, সবগুলোতেই UI লেখা বদলায়। ডিফল্ট ভাষা English।
   প্রতিটি ভাষার টেবিলের key = বাংলা মূল লেখা (মার্কআপ বাংলাতেই লেখা, তাই এটিই উৎস), value = সেই ভাষার অনুবাদ।
   es/de/ja/fr/pt/hi টেবিল খালি — মালিক নিজেই এদের ফাঁকা ঘরে নিজ হাতে অনুবাদ লিখবেন (AI নয়)।
   কোনো ঘর খালি থাকলে সেই লেখা চুপচাপ ইংরেজিতে দেখায় — কোনো পপআপ/প্রম্পট আসে না।
   {name} / {n} / {msg} টাইপ placeholder সব ভাষাতেই হুবহু একই থাকে।
   নতুন UI লেখা যোগ করলে শুধু en টেবিলে এক লাইন দিন — বাকি ভাষা তখন সেটি ইংরেজিতেই দেখাবে, পরে মালিক অনুবাদ করবেন।
   মালিকের নিজস্ব কনটেন্ট (স্টোর/আইটেম/FAQ/সেটিংস/About লেখা) অনুবাদ হয় না।
   ========================================================= */
const LANG_KEY = "deeo.lang";
const I18N = {
  default: "en",
  /* dropdown-এ দেখানোর ক্রম + প্রতিটি ভাষার নিজের লিপিতে নাম (native) ও লাতিন নাম (name — সার্চের জন্য) */
  list: [
    { code: "en", native: "English",    name: "English" },
    { code: "bn", native: "বাংলা",        name: "Bangla" },
    { code: "es", native: "Español",    name: "Spanish" },
    { code: "de", native: "Deutsch",    name: "German" },
    { code: "ja", native: "日本語",       name: "Japanese" },
    { code: "fr", native: "Français",   name: "French" },
    { code: "pt", native: "Português",  name: "Portuguese" },
    { code: "hi", native: "हिन्दी",       name: "Hindi" }
  ],
  /* --- মালিক নিজে হাতে পূরণ করবেন: key = বাংলা মূল লেখা, value = ঐ ভাষার অনুবাদ ---
     খালি টেবিল = সব লেখা ইংরেজিতে দেখাবে (silent fallback)। একটা ঘরে কিছু লিখলে সেটাই চলবে। */
  es: {},
  de: {},
  ja: {},
  fr: {},
  pt: {},
  hi: {},
  /* --- English (ডিফল্ট) — এখানেই সব UI লেখার মূল অনুবাদ, বাকি ভাষা এখান থেকেই fallback পায় --- */
  en: {
    /* --- নেভিগেশন / চোম্ব --- */
    "মেনু":"Menu", "হোম":"Home", "যোগাযোগ":"Contact", "সাইট দেখুন":"View the site",
    "স্টোর দেখুন":"Browse the store", "হোমে ফিরুন":"Back to home",
    "← হোমে ফিরুন":"← Back to home", "← স্টোরে ফিরুন":"← Back to store",
    "সাহায্য":"Help", "সাহায্য ও প্রশ্নোত্তর":"Help & FAQ", "প্রশ্ন খুঁজুন…":"Search questions…",
    "ভাষা বদলান":"Change language", "ভাষা খুঁজুন…":"Search languages…", "কোনো ভাষা মেলেনি":"No language matches", "শব্দ চালু":"Sound on", "শব্দ বন্ধ":"Sound off",
    /* --- মোড বার --- */
    "এই সাইট এখন <b>localStorage</b> মোডে চলছে। Firebase কনফিগ বসালেই Firestore/Auth-এ চলে যাবে।":"This site is running in <b>localStorage</b> mode. Add the Firebase config and it switches to Firestore/Auth.",
    "Firebase মোড সক্রিয়। সব ভিজিটর প্রকাশিত কন্টেন্ট দেখবেন।":"Firebase mode active. Every visitor sees your published content.",
    "FIREBASE":"FIREBASE", "LOCAL":"LOCAL",
    /* --- হোম --- */
    "ফিচারড আইটেম":"Featured items", "স্টোরগুলোর বাছাই করা কাজ।":"A curated selection from the stores.",
    "স্টোর":"Store", "স্টোর:":"Store:", "{label} স্টোর":"{label} Store", "প্রতিটি স্টোরে নিজস্ব ধরনের আইটেম সাজানো থাকে।":"Each store keeps items of its own kind.",
    "এখনো কোনো স্টোর যোগ করা হয়নি।":"No stores have been added yet.",
    "কন্ট্রোল প্যানেল থেকে আপনার প্রথম স্টোর তৈরি করুন — তারপর ভেতরে আইটেম বসান।":"Create your first store in the control panel, then add items inside it.",
    "কন্ট্রোল প্যানেল খুলুন":"Open control panel", "কন্ট্রোল প্যানেল":"Control panel",
    /* --- স্টোর / আইটেম --- */
    "নাম, বিবরণ বা ট্যাগ খুঁজুন…":"Search name, description or tag…",
    "ধরন":"Type", "আইটেম":"Item", "টি আইটেম":"items", "{n}টি আইটেম":"{n} items", "আইটেম · {n}টি":"Items · {n}",
    "এই স্টোরে এখনো কিছু যোগ করা হয়নি।":"Nothing has been added to this store yet.",
    "কন্ট্রোল প্যানেল থেকে আইটেম যোগ করুন।":"Add items from the control panel.",
    "কোনো ধরন নেই।":"No types yet.",
    "★ ফিচারড":"★ Featured", "খসড়া":"Draft", "খুলুন":"Open", "সোর্স":"Source", "ডাউনলোড":"Download",
    "সোর্স কোড":"Source code", "লিংক ও ডাউনলোড":"Links & download", "তথ্য":"Details", "বিবরণ":"Description",
    "ইনস্টল নির্দেশ":"Install steps", "README":"README", "লিংক":"Link",
    "এই আইটেমের কোনো লিংক যোগ করা হয়নি।":"No links have been added for this item.",
    "আইটেমটি পাওয়া যায়নি বা প্রকাশিত নয়।":"This item was not found or is not published.",
    "লেখক":"Author", "বছর":"Year",
    /* --- about / contact --- */
    "পরিচয়":"Identity", "সংযোগ":"Connect",
    "কোনো প্রজেক্ট, সহযোগিতা বা প্রশ্ন থাকলে লিখুন।":"Write to me about a project, a collaboration or a question.",
    "নাম":"Name", "আপনার নাম":"Your name", "ইমেইল":"Email", "আপনার ইমেইল":"Your email",
    "মেসেজ":"Message", "কী জানাতে চান…":"What would you like to share…", "পাঠান":"Send",
    "সরাসরি লিংক":"Direct links", "যোগাযোগের লিংক যোগ করা হয়নি।":"No contact links have been added yet.",
    "কন্ট্রোল প্যানেল → সাইট সেটিংস থেকে ইমেইল ও সোশ্যাল লিংক দিন।":"Add your email and social links in Control panel → Site settings.",
    "এই বিভাগে এখনো লেখা যোগ করা হয়নি।":"Nothing has been written for this section yet.",
    "আপনার নাম সর্বোচ্চ ১০০ অক্ষরের হতে হবে।":"Your name must be at most 100 characters.",
    "ইমেইল দিন।":"Please enter your email.",
    "ইমেইল সর্বোচ্চ ১০০ অক্ষরের হতে হবে।":"Email must be at most 100 characters.",
    "সঠিক ইমেইল ঠিকানা দিন (@ সহ)।":"Enter a valid email address (with @).",
    "মেসেজ লিখুন।":"Please write a message.",
    "মেসেজ সর্বোচ্চ ২০০০ অক্ষরের হতে পারে।":"Message can be at most 2000 characters.",
    "ধন্যবাদ! মেসেজটি পাঠানো হয়েছে।":"Thank you! Your message has been sent.",
    "পাঠানো যায়নি: {msg}":"Could not send: {msg}",
    /* --- ৪০৪ --- */
    "এই ঠিকানায় কিছু নেই।":"Nothing lives at this address.",
    /* --- অ্যাডমিন লগইন --- */
    "মালিকের জন্য সুরক্ষিত এলাকা":"Secure area for the owner", "অ্যাডমিন লগইন":"Admin login",
    "শুধু মালিক স্টোর, আইটেম ও সেটিংস নিয়ন্ত্রণ করতে পারবেন।":"Only the owner can manage stores, items and settings.",
    "পাসওয়ার্ড":"Password", "প্রবেশ করুন":"Sign in", "প্রবেশ":"Enter",
    "শুধু মালিকই এখানে ঢুকতে পারবেন।":"Only the owner can sign in here.",
    "পাসকোড":"Passcode", "নতুন পাসকোড সেট করুন (৪+ অক্ষর)":"Set a new passcode (4+ characters)",
    "আপনি মালিক নন।":"You are not the owner.", "লগইন ব্যর্থ।":"Login failed.",
    "সংযোগে সমস্যা হয়েছে। আবার চেষ্টা করুন।":"Connection problem. Please try again.",
    "ইমেইল যাচাই করুন। আপনার ইনবক্সে পাঠানো লিংকে ক্লিক করুন।":"Verify your email. Click the link sent to your inbox.",
    "যাচাই-লিংক আবার পাঠান":"Send the verification link again", "পাঠানো হচ্ছে…":"Sending…",
    "যাচাই-লিংক পাঠানো হয়েছে ✅ ইনবক্স (না-থাকলে স্প্যাম) দেখুন, লিংকে ক্লিক করুন, তারপর আবার লগইন করুন।":"Verification link sent ✅ Check your inbox (and spam), click the link, then sign in again.",
    "পাঠানো যায়নি: {msg}":"Could not send: {msg}",
    "ভুল পাসকোড।":"Wrong passcode.", "পাসকোড অন্তত ৪ অক্ষরের দিন।":"Enter a passcode of at least 4 characters.",
    /* --- অ্যাডমিন প্যানেল --- */
    "সাইট ব্যবস্থাপনা":"Site management", "লগআউট":"Log out",
    "সাইট সেটিংস":"Site settings", "ডেটা":"Data", "FAQ":"FAQ", "ক্রম":"Order", "প্রকাশ":"Publish", "অ্যাকশন":"Actions",
    "সম্পাদনা":"Edit", "মুছুন":"Delete", "সংরক্ষণ":"Save", "বাতিল":"Cancel", "প্রকাশিত":"Published", "ফিচার":"Featured",
    "স্টোর ব্যবস্থাপনা":"Store management", "+ নতুন স্টোর":"+ New store",
    "↑ ↓ দিয়ে ক্রম বদলান। “প্রকাশ” বন্ধ থাকলে স্টোরটি সাইটে দেখাবে না। স্টোর মুছলে তার ভেতরের সব আইটেমও মুছে যাবে।":"Use ↑ ↓ to change the order. A store with “Publish” off stays hidden. Deleting a store also deletes every item inside it.",
    "এখনো কোনো স্টোর নেই। “+ নতুন স্টোর” চেপে শুরু করুন।":"No stores yet. Press “+ New store” to start.",
    "“{name}” স্টোরটি মুছে ফেলবেন? ভেতরের সব আইটেমও মুছে যাবে।":"Delete the store “{name}”? All items inside it will be deleted too.",
    "স্টোর সম্পাদনা":"Edit store", "নতুন স্টোর":"New store",
    "আইকন (একটি ইমোজি/অক্ষর)":"Icon (one emoji or letter)", "যেমন 📱":"e.g. 📱",
    "এই স্টোরে কী কী থাকে…":"What this store contains…", "যেমন: আমার অ্যাপসমূহ":"e.g. My apps",
    "+ নতুন আইটেম":"+ New item", "প্রথমে একটি স্টোর তৈরি করুন।":"Create a store first.",
    "আইটেম সবসময় কোনো না কোনো স্টোরের ভেতরে থাকে।":"Items always live inside a store.",
    "“হোমে ফিচার” দিলে আইটেমটি হোমের ফিচারড সেকশনে দেখাবে। বইয়ের কপির জন্য লেখক/বছর, এক্সটেনশনের জন্য ইনস্টল নির্দেশ ফিল্ড ভরে দিন।":"“Feature on home” shows the item in the featured section. For book copies fill author/year, for extensions fill the install steps.",
    "এই স্টোরে এখনো আইটেম নেই। “+ নতুন আইটেম” চেপে যোগ করুন।":"No items in this store yet. Press “+ New item” to add one.",
    "“{name}” আইটেমটি মুছে ফেলবেন?":"Delete the item “{name}”?",
    "আইটেম সম্পাদনা":"Edit item", "নতুন আইটেম":"New item", "ধরন (type)":"Category",
    "যেমন: Wallora":"e.g. Wallora", "এক লাইনের পরিচয় (tagline)":"One-line tagline", "সংক্ষিপ্ত বর্ণনা":"Short description",
    "বিস্তারিত বিবরণ…":"Detailed description…", "ট্যাগ (কমা দিয়ে)":"Tags (comma separated)",
    "বইয়ের কপি":"Book copy", "লেখকের নাম":"Author name", "এক্সটেনশন":"Extension", "কীভাবে ইনস্টল করবেন…":"How to install it…",
    "কভার":"Cover", "কভার রঙ":"Cover color", "নিজের রঙ":"Custom color",
    "কভার ছবির লিংক":"Cover image link", "https://… (ছবির সরাসরি লিংক)":"https://… (direct image link)",
    "ডাউনলোড ও লিংক":"Download & links", "ডাউনলোড লিংক":"Download link",
    "GitHub Release-এর asset লিংক বা যেকোনো সরাসরি ফাইল লিংক দিন।":"Paste a GitHub Release asset link or any direct file link.",
    "সোর্স লিংক":"Source link", "বিস্তারিত পাতায় দেখানোর নোট…":"Note shown on the detail page…", "হোমে ফিচার":"Feature on home",
    /* --- FAQ প্যানে / হেল্পার --- */
    "প্রশ্নোত্তর (FAQ)":"Questions (FAQ)", "+ নতুন প্রশ্ন":"+ New question", "প্রশ্ন":"Question",
    "এখনো কোনো প্রশ্ন নেই। “+ নতুন প্রশ্ন” চেপে যোগ করুন।":"No questions yet. Press “+ New question” to add one.",
    "প্রশ্নোত্তর":"Questions", "নতুন প্রশ্ন":"New question", "প্রশ্ন সম্পাদনা":"Edit question",
    "উত্তর":"Answer", "যেমন: আপনি কী কী নিয়ে কাজ করেন?":"e.g. What kind of work do you do?",
    "এখানে উত্তর লিখুন…":"Write the answer here…", "প্রশ্নটি মুছে ফেলবেন?":"Delete this question?",
    "এই প্রশ্নোত্তরগুলো সাইটের কোণার ভাসমান হেল্পারে দেখাবে। এগুলো আসল AI নয়, আগে থেকে লেখা উত্তর।":"These questions appear in the floating helper at the corner. They are pre-written answers, not real AI.",
    "কোনো প্রশ্ন পাওয়া যায়নি।":"No questions found.", "অন্য কিছু লিখে দেখুন।":"Try a different wording.", "মালিক এখনো FAQ যোগ করেননি।":"The owner has not added any FAQ yet.",
    /* --- মেসেজ --- */
    "যোগাযোগ মেসেজ":"Contact messages", "রিফ্রেশ":"Refresh",
    "শুধু আপনি (মালিক) এই মেসেজ পড়তে পারবেন; সাধারণ দর্শক পাঠাতে পারবে কিন্তু কারও মেসেজ দেখতে পাবে না।":"Only you (the owner) can read these messages; visitors can send them but never see anyone's message.",
    "কোনো মেসেজ নেই।":"No messages.", "যোগাযোগ ফর্ম থেকে আসা মেসেজ এখানে দেখাবে।":"Messages from the contact form appear here.",
    "— কোনো স্টোর নেই —":"— no stores —",
    /* --- সেটিংস --- */
    "সাইটের নাম":"Site name", "যোগাযোগের ইমেইল":"Contact email",
    "হোমের পরিচয়ের লেখা (এক/দুই লাইন)":"Home identity line (one or two lines)", "আপনি কে, কী নিয়ে কাজ করেন…":"Who you are and what you build…",
    "খালি রাখলে হোমে এই লাইন দেখাবে না।":"Leave it empty to hide this line on the home page.",
    "About DEEPostrophy বিভাগের লেখা":"Text for the About DEEPostrophy section", "লক্ষ্য, দক্ষতা ও পথচলা…":"Goals, skills and the journey…",
    "লেখা সংরক্ষণ":"Save the text", "এই লেখাটি সাইটের About DEEPostrophy বিভাগেই দেখায় — অন্য কোথাও নয়।":"This text appears only in the About DEEPostrophy section of the site — nowhere else.",
    "About DEEPostrophy বিভাগের লেখা":"About DEEPostrophy text", "লক্ষ্য, দক্ষতা ও পথচলা…":"Goals, skills and journey…",
    "ভাষা":"Language", "ডিফল্ট English; ভিজিটার নিজে বেছে নিলে সেটি মনে থাকে।":"Default is English; a visitor's own choice is remembered.",
    "অটো-ভাষা চালু":"Enable auto language", "ভিজিটার এখনো ভাষা বেয়ে না রাখলে তাঁর ব্রাউজারের ভাষাটি চুপচাপ প্রয়োগ হবে — কোনো প্রশ্ন বা পপআপ আসবে না।":"If a visitor has not chosen a language yet, their browser language is applied silently — no prompt or popup.",
    "অনুবাদ (আপনার নিজের হাতে)":"Translations (your own hand)", "৮টি ভাষা চালু; খালি থাকা ঘরগুলো স্বয়ংক্রিয়ভাবে English দেখায়।":"8 languages are active; empty fields automatically show English.",
    "ভাষা তালিকা":"Language list", "প্রতিটি UI লেখার অনুবাদ":"Translation of each UI string",
    "সোশ্যাল লিংক":"Social links", "+ লিংক যোগ করুন":"+ Add link",
    "শুধু আসল লিংক দিন (https:// বা mailto: দিয়ে শুরু)।":"Use real links only (starting with https:// or mailto:).",
    "লেবেল (যেমন GitHub)":"Label (e.g. GitHub)", "সেটিংস সংরক্ষণ":"Save settings", "সংরক্ষিত হয়েছে ✅":"Saved ✅",
    /* --- ডেটা --- */
    "ডেটা রপ্তানি ও আমদানি":"Data export & import",
    "পুরো সাইটের ডেটা (স্টোর, আইটেম, FAQ, সেটিংস, মেসেজ) এক JSON ফাইলে সংরক্ষণ বা ফিরিয়ে আনুন।":"Save or restore the whole site (stores, items, FAQ, settings, messages) as one JSON file.",
    "⬇ JSON রপ্তানি":"⬇ Export JSON", "⬆ JSON আমদানি":"⬆ Import JSON",
    "আমদানি সফল ✅":"Import successful ✅", "ফাইল পড়া যায়নি — সঠিক JSON দিন।":"The file could not be read — provide valid JSON.",
    "লোকাল অ্যাডমিন পাসকোড":"Local admin passcode",
    "Firebase কনফিগ বসানো না থাকলে প্যানেলে ঢুকতে এই লোকাল পাসকোড লাগে (এটি ডিফল্ট নয় — আপনি নিজে সেট করেন)। Firebase চালু হলে এটি প্রযোজ্য থাকবে না।":"Without a Firebase config this local passcode opens the panel (it is not a default — you set it yourself). It no longer applies once Firebase is enabled.",
    "নতুন পাসকোড":"New passcode", "অন্তত ৪ অক্ষর":"At least 4 characters", "পাসকোড সেট / বদলান":"Set / change passcode",
    "পাসকোড অন্তত ৪ অক্ষর।":"The passcode needs at least 4 characters.", "লোকাল পাসকোড সেট হয়েছে ✅":"Local passcode set ✅",
    /* --- kind / type লেবেল --- */
    "অ্যাপ":"App", "AI টুলস":"AI tools", "AI টুল":"AI tool", "কালারফুল আর্টস":"Colorful arts", "আর্ট":"Art",
    "পাইথন এক্সটেনশন":"Python extension", "ফাইল সংরক্ষণ":"File storage", "ফাইল":"File", "কাস্টম":"Custom", "অন্যান্য":"Other",
    /* --- গিটহাব লোকাল-আপলোড (Settings + আইটেম মডাল) --- */
    "গিটহাব আপলোড (লোকাল → GitHub)":"GitHub upload (local → GitHub)",
    "PC থেকে ফাইল বেছে নিয়ে সরাসরি আপনার GitHub রিপোতে আপলোড করুন — ডাউনলোড, সোর্স ও কভার লিংক অটো-ফিল হবে। টোকেন কেবল আপনার এই ব্রাউজারে (localStorage) থাকে।":"Pick a file from your PC and upload it straight to your GitHub repo — the download, source and cover links fill in automatically. The token stays only in this browser (localStorage).",
    "Owner/Repo বা রিপোর লিংক":"Owner/repo or repo link",
    "যেমন: arafath-rifath/deepostrophy-assets":"e.g. arafath-rifath/deepostrophy-assets",
    "GitHub টোকেন (classic: repo স্কোপ, বা fine-grained: Contents: Read and write)":"GitHub token (classic: repo scope, or fine-grained: Contents: Read and write)",
    "এখানে পেস্ট করুন (শুধু এই ব্রাউজারে জমা)":"Paste here (stored only in this browser)",
    "টোকেন যাচাই":"Verify token", "সেভ করুন":"Save", "মুছে ফেলুন":"Clear", "মুছে ফেলা হয়েছে।":"Cleared.", "টোকেন যাচাই হচ্ছে…":"Verifying token…",
    "টোকেন সঠিক ✅":"Token valid ✅", "রিপো লেখার অনুমতি ✅":"Repo writable ✅",
    "টোকেন সঠিক নয়।":"Token is invalid.", "রিপো পাওয়া যায়নি বা লেখার অনুমতি নেই।":"Repo not found or not writable.",
    "প্রথমে টোকেন ও রিপো দিন।":"Enter the token and repo first.",
    "লিংক":"Link", "GitHub-এ আপলোড":"Upload to GitHub",
    "ফাইল বেছে নিন (PC থেকে)":"Choose a file (from PC)",
    "আপলোড করলেই ডাউনলোড ও সোর্স লিংক অটো-ফিল হবে। বড় ফাইলে “লিংক” ট্যাবে সরাসরি লিংক দিন।":"Uploading auto-fills the download and source links. For large files, paste a direct link under the “Link” tab.",
    "কোনো ফাইল বাছাই হয়নি":"No file chosen",
    "GitHub-এ আপলোড ⬆":"Upload to GitHub ⬆", "ছবি আপলোড ⬆":"Upload image ⬆",
    "ফাইল আপলোড হচ্ছে…":"Uploading file…", "কভার ছবি আপলোড হচ্ছে…":"Uploading cover image…",
    "প্রথমে একটি ফাইল বেছে নিন।":"Choose a file first.",
    "প্রথমে Settings → গিটহাব আপলোড-এ টোকেন ও রিপো দিন।":"Set the token and repo under Settings → GitHub upload first.",
    "কভার আপলোড হয়েছে — লিংক বসে গেছে ✅":"Cover uploaded — link filled ✅",
    "আপলোড হয়েছে ✅ — ডাউনলোড ও সোর্স লিংক অটো-ফিল হয়েছে":"Uploaded ✅ — download and source links auto-filled",
    "কভার:":"Cover:", "GitHub আপলোড ব্যর্থ: ":"GitHub upload failed: "
  }
};

/* শুধু তালিকাভুক্ত ৮টি কোডই গ্রাহ্য; আগে বেছে রাখা (deeo.lang) ভাষাই চলবে, না থাকলে ডিফল্ট English */
const LANG_CODES = {};
I18N.list.forEach(l => { LANG_CODES[l.code] = true; });
let LANG = I18N.default;
try { const saved = localStorage.getItem(LANG_KEY); if (LANG_CODES[saved]) LANG = saved; } catch (e) {}

/* উৎস-লেখা (বাংলা key) -> নির্বাচিত ভাষার মান; খালি/না-থাকলে চুপচাপ ইংরেজি, তাও না থাকলে উৎস */
function valueFor(code, key){
  if (code === "bn") return key;
  const tab = I18N[code];
  const v = tab && tab[key];
  if (v !== undefined && v !== "") return v;
  return I18N.en[key] !== undefined ? I18N.en[key] : key;
}
/* যেকোনো ভাষার প্রদর্শিত লেখা -> উৎস বাংলা key (ভাষা A থেকে B-তে সরাসরি পাল্টানোর জন্য) */
const KEY_OF = {};
(function buildKeyIndex(){
  const put = (val, key) => { if (val !== undefined && val !== "" && KEY_OF[val] === undefined) KEY_OF[val] = key; };
  for (const k in I18N.en) { put(k, k); put(I18N.en[k], k); }          // উৎস + ইংরেজি
  for (const l of I18N.list) { const tab = I18N[l.code]; if (!tab || l.code === "en") continue;
    for (const k in tab) put(tab[k], k); }                              // মালিক-পূরণ করা বাকি ভাষা
})();
const t  = s => valueFor(LANG, s);
const tr = (s, vars) => { let o = valueFor(LANG, s);
  if (vars) for (const k in vars) o = o.split("{" + k + "}").join(String(vars[k])); return o; };
const I18N_ATTRS = ["placeholder", "title", "aria-label", "alt"];
/* DOM-এর লেখা (যেকোনো ভাষায়) উৎসে ফিরিয়ে আবার নির্বাচিত ভাষায় অনুবাদ; অজানা লেখা = undefined (মালিকের কনটেন্ট অক্ষুণ্ণ) */
function i18nLookup(text){ const k = KEY_OF[text]; return k === undefined ? undefined : valueFor(LANG, k); }
function applyI18n(root){
  if (!root || !root.closest) return;
  if (root.closest("[data-i18n-keep]")) return;
  const hits = [];
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, {
    acceptNode(n){
      if (n.nodeType === 3) {
        const p = n.parentElement;
        if (!p || p.nodeName === "SCRIPT" || p.nodeName === "STYLE" || p.closest("[data-i18n-keep]")) return NodeFilter.FILTER_REJECT;
        return i18nLookup(n.textContent.trim()) !== undefined ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
      if (n.closest("[data-i18n-keep]")) return NodeFilter.FILTER_SUBTREES;
      for (const a of I18N_ATTRS) { const v = n.getAttribute(a); if (v !== null && i18nLookup(v.trim()) !== undefined) return NodeFilter.FILTER_ACCEPT; }
      return NodeFilter.FILTER_SKIP;
    }
  });
  let n; while ((n = w.nextNode())) hits.push(n);
  for (const node of hits) {
    if (node.nodeType === 3) {
      const raw = node.textContent, key = raw.trim(), val = i18nLookup(key);
      if (val !== undefined && val !== key) node.textContent = raw.replace(key, val);
    } else {
      for (const a of I18N_ATTRS) {
        const raw = node.getAttribute(a); if (raw === null) continue;
        const key = raw.trim(), val = i18nLookup(key);
        if (val !== undefined && val !== key) node.setAttribute(a, raw.replace(key, val));
      }
    }
  }
}

/* DOM-এ পরে বসা টেক্সটও অনুবাদ হয়; observer শুধু body তৈরি হওয়ার পর বসে */
const i18nQueue = new Set();
let i18nTimer = 0;
function i18nFlush(){
  i18nTimer = 0;
  const nodes = [...i18nQueue]; i18nQueue.clear();
  for (const el of nodes) if (el && el.isConnected) applyI18n(el);
}
function attachI18nObserver(){
  if (attachI18nObserver.done) return; attachI18nObserver.done = true;
  new MutationObserver(recs => {
  for (const r of recs) {
    if (r.type === "childList") r.addedNodes.forEach(n => i18nQueue.add(n.nodeType === 1 ? n : n.parentElement));
    else i18nQueue.add(r.target.nodeType === 1 ? r.target : r.target.parentElement);
  }
  if (!i18nTimer) i18nTimer = setTimeout(i18nFlush, 0);
}).observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: I18N_ATTRS });
}

function unmosaic(el){
  if (!el) return;
  const kids = [...el.childNodes];
  const hasC = kids.some(k => k.nodeType === 1 && k.classList && k.classList.contains("c"));
  if (!hasC) { el.removeAttribute("data-mx-done"); return; }
  if (kids.some(k => k.nodeType === 1 && !(k.classList && k.classList.contains("c")))) return;
  el.textContent = el.textContent;
  el.removeAttribute("data-mx-done");
}
function currentLangNative(){ const l = I18N.list.filter(x => x.code === LANG)[0]; return (l || I18N.list[0]).native; }
function langOptionNodes(){ const ul = $("lang-list"); return ul ? [...ul.children] : []; }
function markLangSelected(){ langOptionNodes().forEach(li => li.setAttribute("aria-selected", li.dataset.code === LANG ? "true" : "false")); }
function buildLangMenu(){
  const ul = $("lang-list"); if (!ul) return;
  ul.innerHTML = I18N.list.map(function (l) {
    return '<li role="option" data-code="' + l.code + '" tabindex="-1">' +
      '<span class="lm-native" data-i18n-keep>' + esc(l.native) + '</span>' +
      '<span class="lm-latin en" data-i18n-keep>' + esc(l.name) + '</span>' +
      '<span class="lm-check">✓</span></li>';
  }).join("");
  markLangSelected();
}
function filterLangs(q){
  q = (q || "").trim().toLowerCase();
  let shown = 0;
  langOptionNodes().forEach(function (li){
    const l = I18N.list.filter(x => x.code === li.dataset.code)[0];
    const hay = ((l ? (l.native + " " + l.name) : "") + " " + li.dataset.code).toLowerCase();
    const on = !q || hay.indexOf(q) !== -1;
    li.style.display = on ? "" : "none"; if (on) shown++;
  });
  const empty = $("lang-empty"); if (empty) empty.hidden = shown > 0;
}
function updateLangBtn(){
  const cur = $("lang-cur"); if (cur) cur.textContent = currentLangNative();
  const b = $("lang-btn");
  if (b) { const lbl = t("ভাষা বদলান"); b.setAttribute("title", lbl); b.setAttribute("aria-label", lbl); }
  const m = $("lang-menu"); if (m && !m.hidden) markLangSelected();
}
function refreshSelectLabels(){
  /* ড্রপডাউন দুটি শুধু মালিক প্যানেলে — পাবলিক পেজে কিছু করাই হয় না */
  [["s-kind", "fillKindSelect"], ["i-category", "fillItemTypeSelect"]].forEach(function (p) {
    const el = $(p[0]); if (!el || typeof window[p[1]] !== "function") return;
    const keep = el.value; window[p[1]](); if (keep) el.value = keep;
  });
}

function setLang(next, persist){
  LANG = LANG_CODES[next] ? next : I18N.default;
  if (persist !== false) { try { localStorage.setItem(LANG_KEY, LANG); } catch (e) {} }
  document.documentElement.lang = LANG;
  document.documentElement.dir = "ltr";
  document.title = (S.settings && S.settings.siteName) || document.title;   // সাইটের নাম মালিকের কনটেন্ট — অনুবাদ হয় না
  updateLangBtn(); updateSoundBtn(); refreshSelectLabels();
  document.querySelectorAll("[data-mx-done]").forEach(unmosaic);
  applyI18n(document.body);   // আগে স্ক্যান, নাহলে মোজাইক স্প্যান ভেঙে ফেলে
  route();
}

/* ব্রাউজারের ভাষা থেকে মিলতে-পরা ভাষার কোড, না মিললে ডিফল্ট */
function detectLang(){
  const nav = ((navigator.language || navigator.userLanguage || "en") + "").toLowerCase();
  const hit = I18N.list.filter(l => l.code === "en" ? nav.startsWith("en") : nav.startsWith(l.code))[0];
  return hit ? hit.code : I18N.default;
}
function hasVisitorLangChoice(){ try { return !!localStorage.getItem(LANG_KEY); } catch (e) { return false; } }
/* auto-language সেটিং: মালিক চালু করলে + ভিজিটর আগে ভাষা বেয়ে রাখেননি → ব্রাউজারের ভাষা চুপচাপ প্রয়োগ (কোনো প্রম্পট নেই, localStorage-ও লেখে না) */
function applyAutoLang(){
  if (!S || !S.settings || !S.settings.autoLang) return;
  if (hasVisitorLangChoice()) return;
  const d = detectLang();
  if (d !== LANG) setLang(d, false);
}

/* =========================================================
   DB লেয়ার — সব পড়া-লেখা এখান দিয়ে। adapter বদলেই Firebase।
   ========================================================= */
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = id => document.getElementById(id);
const esc = s => (s||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const uid = () => "x"+Math.random().toString(36).slice(2,9)+Date.now().toString(36).slice(-3);
const isValidUrl = s => typeof s==="string" && /^(https?:\/\/|mailto:|data:)/i.test(s.trim());
const splitList = s => (s||"").split(",").map(x=>x.trim()).filter(Boolean);
const isConfigured = () => Object.values(FIREBASE_CONFIG).every(v => v && v !== PLACEHOLDER);
// Firestore Timestamp বা সংখ্যা — দুটোকেই তুলনীয় মিলিসেকেন্ডে বদলায় (messages sort-এর জন্য)।
const tsNum = t => t && typeof t.toMillis==="function" ? t.toMillis() : (typeof t==="number" ? t : 0);

let FB = null;   // {app,auth,db, api:{...}}  (Storage ব্যবহার হয় না)
let MODE = isConfigured() ? "fs" : "ls";

/* ---- localStorage অ্যাডাপ্টার ---- */
const LS = (()=>{
  const KEY="deeo.state.v3";
  const blank = ()=>({stores:[],items:[],settings:{siteName:"DEEPostrophy",identity:"",about:"",email:"",social:[],autoLang:false},faq:[],messages:[]});
  let st;
  function norm(d){ const b=blank(); d=d&&typeof d==="object"?d:{};
    for(const k of ["stores","items","faq","messages"]) if(!Array.isArray(d[k])) d[k]=b[k];
    d.settings=Object.assign(b.settings,d.settings||{}); if(!Array.isArray(d.settings.social)) d.settings.social=[];
    d.stores.forEach((s,i)=>{ if(typeof s.order!=="number") s.order=i; });
    d.items.forEach((it,i)=>{ if(typeof it.order!=="number") it.order=i; if(!it.links) it.links={source:"",download:""}; if(!Array.isArray(it.tags)) it.tags=[]; });
    return d; }
  function persist(){ try{ localStorage.setItem(KEY, JSON.stringify(st)); }catch(e){} }
  return {
    async read(){ if(!st) st=norm(JSON.parse(localStorage.getItem(KEY)||"null")); return JSON.parse(JSON.stringify(st)); },
    async write(kind,obj){ await this.read(); const arr=st[kind]; const i=obj.id?arr.findIndex(x=>x.id===obj.id):-1;
      if(i>=0) arr[i]=Object.assign(arr[i],obj); else arr.push(obj); persist(); return arr[i>=0?i:arr.length-1]; },
    async remove(kind,id){ await this.read(); st[kind]=st[kind].filter(x=>x.id!==id); persist(); },
    async setSettings(s){ await this.read(); st.settings=Object.assign(st.settings,s); persist(); return st.settings; },
    async replaceAll(d){ st=norm(d); persist(); },
    async removeStoreCascade(storeId){ await this.read(); st.stores=st.stores.filter(s=>s.id!==storeId); st.items=st.items.filter(i=>i.storeId!==storeId); persist(); },
    async reorder(kind,list){ await this.read(); list.forEach((id,i)=>{ const x=st[kind].find(o=>o.id===id); if(x) x.order=i; }); persist(); },
  };
})();

/* ---- Firestore অ্যাডাপ্টার (config থাকলে) ---- */
const FS = {
  async read(){
    const { collection, getDocs, doc, getDoc, query, where } = FB.api;
    const snap = async (name, publishedOnly) => {
      const ref = collection(FB.db, name);
      const qs = publishedOnly ? await getDocs(query(ref, where("published","==",true))) : await getDocs(ref);
      const out = []; qs.forEach(d=>out.push(Object.assign({id:d.id}, d.data()))); return out;
    };
    const mine = Auth.isAdmin();
    const [stores, items, faq] = await Promise.all([snap("stores",!mine), snap("items",!mine), snap("faq",false)]);
    const settings = (await getDoc(doc(FB.db,"settings","site"))).data() || {};
    let messages = []; if(mine){ messages = (await snap("messages",false)).sort((a,b)=>tsNum(b.ts)-tsNum(a.ts)); }
    return { stores, items, settings, faq, messages };
  },
  async write(kind,obj){ const { doc, setDoc } = FB.api; const ref = doc(FB.db, kind, obj.id); const data=Object.assign({},obj); delete data.id; await setDoc(ref, data, {merge:true}); return obj; },
  async remove(kind,id){ const { doc, deleteDoc } = FB.api; await deleteDoc(doc(FB.db,kind,id)); },
  async setSettings(s){ const { doc, setDoc } = FB.api; await setDoc(doc(FB.db,"settings","site"), s, {merge:true}); return s; },
  async replaceAll(d){ await this.write("settings", Object.assign({id:"site"}, d.settings));
    for(const s of d.stores) await this.write("stores", s);
    for(const it of d.items) await this.write("items", it);
    for(const f of (d.faq||[])) await this.write("faq", f); },
  async removeStoreCascade(storeId){ const { collection, getDocs, deleteDoc, doc } = FB.api; await this.remove("stores",storeId);
    const q = await getDocs(collection(FB.db,"items")); const del=[]; q.forEach(d=>{ if(d.data().storeId===storeId) del.push(deleteDoc(doc(FB.db,"items",d.id))); }); await Promise.all(del); },
  async reorder(kind,list){ const { doc, updateDoc } = FB.api; await Promise.all(list.map((id,i)=>updateDoc(doc(FB.db,kind,id),{order:i}))); },
};

const DB = {
  get adapter(){ return MODE==="fs" ? FS : LS; },
  read(){ return this.adapter.read(); },
  writeStore(o){ return this.adapter.write("stores", o); },
  writeItem(o){ return this.adapter.write("items", o); },
  writeFaq(o){ return this.adapter.write("faq", o); },
  addMessage(o){ return this.adapter.write("messages", o); },
  removeStore(id){ return this.adapter.removeStoreCascade(id); },
  removeItem(id){ return this.adapter.remove("items", id); },
  removeFaq(id){ return this.adapter.remove("faq", id); },
  setSettings(s){ return this.adapter.setSettings(s); },
  replaceAll(d){ return this.adapter.replaceAll(d); },
  reorder(kind,list){ return this.adapter.reorder(kind, list); },
  exportJson(){ return S.raw ? JSON.stringify(S.raw, null, 2) : "{}"; },
};

/* =========================================================
   লোকাল ফাইল → GitHub আপলোড ইঞ্জিন
   PC থেকে ফাইল বেছে নিলে GitHub Contents API-তে commit হয়, ফিরে আসে
   ডাউনলোড (media) + সোর্স (blob পেজ) + কাঁচা (raw) লিংক — যা অটো-ফিল হয়।
   টোকেন ও রিপো শুধু এই ব্রাউজারের localStorage-এ থাকে; কেবল api.github.com-এ যায়।
   ========================================================= */
const slug = s => (s||"").toString().toLowerCase().trim().replace(/[^\p{L}\p{N}.]+/gu,"-").replace(/^-+|-+$/g,"").slice(0,60) || "item";
const humanSize = n => { n=+n||0; if(n<1024) return n+" B"; if(n<1048576) return (n/1024).toFixed(0)+" KB"; return (n/1048576).toFixed(1)+" MB"; };
const stripExt = name => { const i=(name||"").lastIndexOf("."); return i>0 ? name.slice(0,i) : (name||""); };
const ghHeaders = withJson => { const st=GH.settings(); const h={ Accept:"application/vnd.github+json", "X-GitHub-Api-Version":"2022-11-28" }; if(withJson) h["Content-Type"]="application/json"; if(st.token) h["Authorization"]="Bearer "+st.token; return h; };

const GH = {
  _TOKEN_KEY:"deeo.github.token",
  _REPO_KEY:"deeo.github.repo",
  settings(){
    let repo=""; try{ repo=localStorage.getItem(this._REPO_KEY)||""; }catch(e){}
    let token=""; try{ token=atob(localStorage.getItem(this._TOKEN_KEY)||""); }catch(e){ token=""; }
    return { token, repo };
  },
  configured(){ const s=this.settings(); return !!(s.token && s.repo); },
  save(cfg){ try{ if(cfg && cfg.token) localStorage.setItem(this._TOKEN_KEY, btoa(cfg.token)); if(cfg && cfg.repo!==undefined) localStorage.setItem(this._REPO_KEY, (cfg.repo||"").trim()); }catch(e){} },
  clear(){ try{ localStorage.removeItem(this._TOKEN_KEY); localStorage.removeItem(this._REPO_KEY); }catch(e){} },
  parseRepo(repo){ const s=(repo||"").trim().replace(/\.git$/,""); const m=s.match(/(?:github\.com[\/:])?([\w.-]+)\/([\w.-]+)/); return m?{owner:m[1],name:m[2]}:null; },
  async currentBranch(o,r){ try{ const res=await fetch("https://api.github.com/repos/"+o+"/"+r,{headers:ghHeaders(false)}); if(res.ok){ const j=await res.json(); if(j&&j.default_branch) return j.default_branch; } }catch(e){} return "main"; },
  async authedUser(){ const res=await fetch("https://api.github.com/user",{headers:ghHeaders(false)}); if(res.status===401) throw new Error("টোকেন সঠিক নয় বা মেয়াদ শেষ।"); if(!res.ok) throw new Error("HTTP "+res.status); return res.json(); },
  /* একটি ফাইল রিপোতে commit করে — {downloadUrl, rawUrl, pageUrl, path, name, size} */
  async upload(file, folder, label){
    const st=this.settings(); const pr=this.parseRepo(st.repo);
    if(!pr) throw new Error("রিপো ঠিক নেই — Settings → গিটহাব আপলোড-এ owner/repo দেখুন।");
    if(!st.token) throw new Error("GitHub টোকেন দেওয়া নেই।");
    if(file.size > 100*1024*1024) throw new Error("ফাইল ১০০MB-এর বড় — GitHub Contents API এত বড় নেয় না; “লিংক” ট্যাবে Release লিংক দিন।");
    const buf=await file.arrayBuffer(); const bin=new Uint8Array(buf); let b64=""; const CH=0x8000;
    for(let i=0;i<bin.length;i+=CH){ b64+=String.fromCharCode.apply(null,bin.subarray(i,i+CH)); }
    b64=btoa(b64);
    const branch=await this.currentBranch(pr.owner,pr.name);
    const name=(label?slug(label)+"-":"")+slug(file.name);
    const path=((folder||"uploads")+"/"+name).replace(/\/+/g,"/");
    let sha=null;
    try{ const c=await fetch("https://api.github.com/repos/"+pr.owner+"/"+pr.name+"/contents/"+path+"?ref="+encodeURIComponent(branch),{headers:ghHeaders(false)}); if(c.ok){ const cj=await c.json(); if(cj&&cj.sha) sha=cj.sha; } }catch(e){}
    const body={ message:"Upload "+name+" via DEEPostrophy", content:b64, branch }; if(sha) body.sha=sha;
    const res=await fetch("https://api.github.com/repos/"+pr.owner+"/"+pr.name+"/contents/"+path,{ method:"PUT", headers:ghHeaders(true), body:JSON.stringify(body) });
    if(res.status===401) throw new Error("টোকেন সঠিক নয় — GitHub → Settings → Developer settings → Tokens থেকে নতুন টোকেন নিয়ে Contents: Read and write দিন।");
    if(res.status===403) throw new Error("টোকেনে এই রিপোতে লেখার অনুমতি নেই (Contents: Read and write) — অথবা রেট-লিমিট।");
    if(res.status===404) throw new Error("রিপো পাওয়া যায়নি — owner/repo আর টোকেন একই অ্যাকাউন্টের কিনা দেখুন।");
    if(!res.ok){ let m=""; try{ m=(await res.json()).message||""; }catch(e){} throw new Error("GitHub ত্রুটি (HTTP "+res.status+")"+(m?": "+m:"")); }
    const j=await res.json(); const c=(j&&j.content)||{};
    const media="https://media.githubusercontent.com/media/"+pr.owner+"/"+pr.name+"/"+branch+"/"+path;
    const raw=c.download_url||("https://raw.githubusercontent.com/"+pr.owner+"/"+pr.name+"/"+branch+"/"+path);
    const html=c.html_url||("https://github.com/"+pr.owner+"/"+pr.name+"/blob/"+branch+"/"+path);
    return { downloadUrl:media, mediaUrl:media, rawUrl:raw, pageUrl:html, path, name, size:file.size };
  }
};

/* =========================================================
   Auth লেয়ার — fs: Firebase Auth; ls: লোকাল পাসকোড
   ========================================================= */
const Auth = {
  user:null,
  isAdmin(){ if(MODE==="fs"){ const u=this.user; if(!u) return false; const match=(OWNER_EMAIL && u.email===OWNER_EMAIL) || (OWNER_UID && u.uid===OWNER_UID); return !!(match && u.emailVerified); } return !!this.user; },
  async onChange(cb){ if(MODE==="fs"){ FB.api.onAuthStateChanged(FB.auth, u=>{ this.user=u; cb(); }); } else { cb(); } },
  async signIn(cred){
    if(MODE==="fs"){ const { signInWithEmailAndPassword } = FB.api; const uc = await signInWithEmailAndPassword(FB.auth, cred.email, cred.pass); this.user = uc.user;
      const match = (OWNER_EMAIL && uc.user.email===OWNER_EMAIL) || (OWNER_UID && uc.user.uid===OWNER_UID);
      if(!match) return {notOwner:true};
      if(!uc.user.emailVerified) return {needVerify:true};
      return {ok:true};
    }
    // ls: পাসকোড
    const saved = localStorage.getItem("deeo.adminpass");
    if(!saved){ // প্রথমবার সেট
      if((cred.pass||"").length<4) return {err:"পাসকোড অন্তত ৪ অক্ষরের দিন।"};
      localStorage.setItem("deeo.adminpass", btoa(cred.pass)); this.user={local:true}; return {ok:true, first:true};
    }
    if(btoa(cred.pass)===saved){ this.user={local:true}; return {ok:true}; }
    return {err:"ভুল পাসকোড।"};
  },
  async signOut(){ if(MODE==="fs"){ const { signOut }=FB.api; await signOut(FB.auth); } this.user=null; },
};

/* =========================================================
   স্টেট + রেন্ডার
   ========================================================= */
const S = { stores:[], items:[], settings:{}, faq:[], messages:[], raw:null, loaded:false };

function applyRaw(raw){
  S.raw = raw;
  S.stores = [...(raw.stores||[])].sort((a,b)=>a.order-b.order);
  S.items  = [...(raw.items||[])].sort((a,b)=>a.order-b.order);
  S.settings = raw.settings||{};
  S.faq = [...(raw.faq||[])].sort((a,b)=>a.order-b.order);
  S.messages = [...(raw.messages||[])].sort((a,b)=>tsNum(b.ts)-tsNum(a.ts));
  S.loaded = true;
}
async function loadData(){ applyRaw(await DB.read()); }
const pubStores = ()=> S.stores.filter(s=>s.published);
const itemsOf = sid => S.items.filter(i=>i.storeId===sid);
const pubItemsOf = sid => itemsOf(sid).filter(i=>i.published);
const countItems = sid => pubItemsOf(sid).length;
const featItems = ()=> S.items.filter(i=>i.published && i.featured);
const storeById = id => S.stores.find(s=>s.id===id);
const itemById = id => S.items.find(i=>i.id===id);

/* ---- টেমপ্লেট ---- */
function coverInner(it){
  const img = it.coverImage && isValidUrl(it.coverImage);
  const grad = it.coverColor || PALETTE[0];
  const base = img ? `<img class="thumb" data-i18n-keep crossorigin="anonymous" src="${esc(it.coverImage)}" alt="${esc(it.name)}" onerror="this.style.display='none'">` : `<div class="glow" style="background:${esc(grad)}"></div>`;
  const overlay = animOff ? "" : `<canvas class="mosaic" data-grad="${img?"":esc(grad)}" data-img="${img?esc(it.coverImage):""}"></canvas>`;
  return `<div class="cover">${base}${overlay}<span class="type">${esc(t(it.category||"আইটেম"))}</span></div>`;
}
function tagsHtml(tags){ return (tags||[]).slice(0,4).map(x=>`<span class="chip en" data-i18n-keep>${esc(x)}</span>`).join(""); }
function flagsHtml(it){ let f=""; if(it.featured) f+='<span class="flag feat">★ ফিচারড</span>'; if(!it.published) f+='<span class="flag draft">খসড়া</span>'; return f; }
function itemCardHtml(it,i){
  const dl=it.links&&isValidUrl(it.links.download), src=it.links&&isValidUrl(it.links.source);
  return `<article class="card reveal" style="--i:${i%8}">${flagsHtml(it)}${coverInner(it)}
    <div class="card-body"><h3 data-i18n-keep>${esc(it.name)}</h3><p class="tagline" data-i18n-keep>${esc(it.tagline||it.description)}</p>
      <div class="langs">${tagsHtml(it.tags)}</div>
      <div class="card-actions"><a class="btn sm primary" href="#item/${it.id}" data-link>খুলুন</a>
        ${src?`<a class="btn sm ghost en" href="${esc(it.links.source)}" target="_blank" rel="noopener">সোর্স</a>`:""}
        ${dl?`<a class="btn sm ghost" href="${esc(it.links.download)}" target="_blank" rel="noopener">ডাউনলোড</a>`:""}</div></div></article>`;
}

/* ---- অ্যানিমেশন: fade/reveal + drift + mosaic ---- */
let io, driftSet=new Set(), driftRAF=0;
/* মালিক প্যানেলে (window.DEEO_ADMIN) মোজাইক/ড্রিফট/স্ট্যাগার চলে না */
const animOff = reduce || !!window.DEEO_ADMIN;
/* ড্রিফট লুপ demand-driven — স্ক্রল বা অবস্থান বদলাচ্ছে তখনই, স্থির হলে বন্ধ */
function driftStep(){
  driftRAF = 0; let moving = false;
  driftSet.forEach(t => {
    const s = t._d; if (!s || s.vis === false) return;              // পর্দার বাইরে — ছোঁয়া হয় না
    const shown = Math.tanh(s.raw / 320) * 150, d = shown - s.x;
    if (Math.abs(d) > 0.05) { s.x += d * 0.12; t.style.transform = "translateX(" + s.x.toFixed(2) + "px)"; moving = true; }
    else if (s.x !== shown) { s.x = shown; t.style.transform = "translateX(" + s.x.toFixed(2) + "px)"; }
  });
  if (moving) driftRAF = requestAnimationFrame(driftStep);            // সব স্থির — লুপ থামল
}
function driftKick(){ if (animOff || driftRAF) return; driftRAF = requestAnimationFrame(driftStep); }
const driftIO = animOff ? null : new IntersectionObserver(es => {
  es.forEach(en => { const t = en.target; if (!t._d) return; t._d.vis = en.isIntersecting; if (en.isIntersecting) driftKick(); });
}, { rootMargin: "120px 0px" });
function ensureDrift(t){ if(animOff||!t||t._d) return; t._d={raw:0,x:0,lastY:scrollY,vis:true};
  addEventListener("scroll",()=>{ const y=scrollY; const d=y-t._d.lastY; t._d.lastY=y; if(d) t._d.raw+=d*0.4; driftKick(); },{passive:true});
  driftSet.add(t); if(driftIO) driftIO.observe(t); }
function observeReveals(){
  document.querySelectorAll(".reveal:not(.in)").forEach(el=>{ if(animOff){el.classList.add("in");} else io.observe(el); });
  observeCoverMosaic();
}
function initDrift(){ if(animOff) return; document.querySelectorAll("[data-drift]").forEach(ensureDrift); driftKick(); }

/* ---- মোজাইক বাজেট: একসাথে সর্বোচ্চ ৪টি; পর্দার বাইরে থাকলে থামে ---- */
const MX_LIMIT = 4;
let mxBusy = 0;
const mxPending = [];
const mxLive = new Set();
function mxState(el){ return el._mx || (el._mx = { vis: true, running: false, finished: false, stop: null }); }
const mxIO = animOff ? null : new IntersectionObserver(es => {
  es.forEach(en => {
    const el = en.target, s = mxState(el);
    s.vis = en.isIntersecting;
    if (en.isIntersecting) mxPump();
    else if (s.running && s.stop) s.stop();          // বাইরে গেলে চলমানটিও থামে
  });
}, { rootMargin: "80px 0px" });
function mxRequest(el, kind){
  const s = mxState(el);
  if (s.running || mxPending.indexOf(el) >= 0) return;
  if (s.finished && el.hasAttribute("data-mx-done")) return;   // সত্যিই শেষ
  s.finished = false;                                           // লেখা/ব্র্যান্ড বদলালে আবার চলবে
  el._mxKind = kind;
  mxPending.push(el);
  if (mxIO) mxIO.observe(el); else s.vis = true;
  mxPump();
}
function mxPump(){
  let guard = mxPending.length;
  while (mxBusy < MX_LIMIT && mxPending.length && guard-- > 0) {
    const i = mxPending.findIndex(el => el.isConnected && mxState(el).vis);
    if (i < 0) break;
    const el = mxPending.splice(i, 1)[0];
    const before = mxBusy;
    mxStartCover(el);                                          // মোজাইক শুধু কভার/কার্ড ছবিতেই
    if (mxBusy === before) { mxPending.push(el); break; }   // জায়গা মাপা যায়নি — পরের রেণ্ডারে আবার চেষ্টা
  }
}
function mxFreed(el){
  const s = mxState(el);
  s.running = false; s.finished = true; s.stop = null;
  mxLive.delete(el); mxBusy = Math.max(0, mxBusy - 1);
  if (mxIO) mxIO.unobserve(el);
  mxPump();
}
function mxReset(){
  mxPending.length = 0;
  [...mxLive].forEach(el => { const s = mxState(el); if (s.stop) s.stop(); });
  mxBusy = 0;
}
/* অক্ষর-ভাঙা টেক্সট মোজাইক বাদ — মোজাইক শুধু কভার ছবিতেই চলে */

/* ক্যানভাস টাইল-মোজাইক (কভার) */
function extractColors(css){ const m=(css||"").match(/#[0-9a-fA-F]{3,6}/g); if(!m) return ["#8b5cf6","#22d3ee"]; if(m.length===1) return [m[0],m[0]]; return [m[0], m[m.length-1]]; }
function lerpHex(a,b,t){ const pa=parseInt(a.slice(1),16), pb=parseInt(b.slice(1),16); const r=Math.round(((pa>>16)&255)+(((pb>>16)&255)-((pa>>16)&255))*t); const g=Math.round(((pa>>8)&255)+(((pb>>8)&255)-((pa>>8)&255))*t); const bb=Math.round((pa&255)+((pb&255)-(pa&255))*t); return `rgb(${r},${g},${bb})`; }
function observeCoverMosaic(){
  if(animOff) return;                                             // মোজাইক নেই: reduced-motion বা মালিক প্যানেল
  document.querySelectorAll("canvas.mosaic:not([data-init])").forEach(cv=>{ cv.setAttribute("data-init","1"); mxRequest(cv, "cover"); });
  mxPump();
}
function mxStartCover(cv){
  const cover = cv.parentElement;
  if (!cover || !cover.clientWidth) { mxState(cv).finished = false; return; }   // মাপ নেই — পরে আবার চেষ্টা হবে
  const s = mxState(cv); s.running = true; mxBusy++; mxLive.add(cv);
  const isMobile = innerWidth < 640;
  const grad=cv.dataset.grad, imgsrc=cv.dataset.img;
  const W=cover.clientWidth, H=cover.clientHeight; cv.width=W; cv.height=H;
  const ctx=cv.getContext("2d");
  const [c1,c2]=extractColors(grad||PALETTE[0]);
  let img=null; if(imgsrc){ img=new Image(); img.crossOrigin="anonymous"; img.src=imgsrc; }

  /* টাইল ~১২–১৬px; মোবাইলে বড় টাইল = কম টুকরো। বড় কভারে সংখ্যা সীমায় ধরা হয় */
  let T = isMobile ? 26 : 14;
  const MAX = isMobile ? 80 : 320;
  while (Math.ceil(W/T) * Math.ceil(H/T) > MAX && T < 200) T += 2;
  const cols=Math.max(1,Math.ceil(W/T)), rows=Math.max(1,Math.ceil(H/T));
  const tw=W/cols, th=H/rows;

  /* প্রতিটি টুকরো এলোমেলো দিক থেকে, এলোমেলো সময়ে, ঘুরতে-বেড়ে বসে */
  const SPAN = 430;                                                  // বিলম্বের সীমা (ms)
  const tiles=[];
  for(let r=0;r<rows;r++)for(let cc=0;cc<cols;cc++){
    const a=Math.random()*Math.PI*2, d=26+Math.random()*58;
    tiles.push({ sx:cc*tw, sy:r*th, cx:cc*tw+tw/2, cy:r*th+th/2,
      jx:Math.cos(a)*d, jy:Math.sin(a)*d,
      rot:(Math.random()*2-1)*Math.PI/2,                             // ±৯০° ঘোরে
      sc:1.7+Math.random()*1.1,                                      // বড় থেকে ছোট হয়ে বসে
      dl:Math.random()*SPAN,                                         // কখন উড়বে
      pd:300+Math.random()*170,                                      // উড়ে বেড়ায় ৩০০–৪৭০ms
      fill:lerpHex(c1,c2,(cc*tw+tw/2)/W) });
  }
  const dur = SPAN + 470;                                            // পুরো effect <১s (৯০০ms)
  const t0=performance.now();
  let raf = 0, ended = false;
  const finish = () => {
    if (ended) return; ended = true;
    if (raf) cancelAnimationFrame(raf);
    cv.style.opacity = "0"; setTimeout(() => cv.remove(), 120);
    cv.setAttribute("data-mx-done","1");
    mxFreed(cv);
  };
  s.stop = finish;
  (function step(now){
    if (ended) return;
    if (!cv.isConnected) { finish(); return; }                                // কার্ড সরে গেলে লুপও থামে
    const el = now - t0;
    const useImg = !!(img && img.complete && img.naturalWidth);
    const ix = useImg ? img.naturalWidth / W : 0, iy = useImg ? img.naturalHeight / H : 0;
    ctx.clearRect(0,0,W,H);
    for(const t of tiles){
      const lp = (el - t.dl) / t.pd; if (lp <= 0) continue;                   // এখনো আসেনি
      const e = lp >= 1 ? 1 : 1 - Math.pow(1 - lp, 3);
      ctx.save();
      ctx.globalAlpha = e;
      ctx.translate(t.cx + t.jx*(1-e), t.cy + t.jy*(1-e));
      ctx.rotate(t.rot*(1-e));
      const k = t.sc + (1 - t.sc)*e; ctx.scale(k,k);
      if (useImg){
        const sx=t.sx*ix, sy=t.sy*iy, sw=Math.min(tw*ix, img.naturalWidth-sx), sh=Math.min(th*iy, img.naturalHeight-sy);
        if (sw > 0 && sh > 0) ctx.drawImage(img, sx, sy, sw, sh, -tw/2, -th/2, tw+0.6, th+0.6);
      } else { ctx.fillStyle = t.fill; ctx.fillRect(-tw/2,-th/2,tw+0.6,th+0.6); }
      ctx.restore();
    }
    if(el < dur) raf = requestAnimationFrame(step); else finish();
  })(t0);
}

/* reveal — পর্দার বাইরে গেলে .in সরে যায়, ফিরলে যেদিক থেকেই হোক আবার চলে */
io = new IntersectionObserver((ents) => ents.forEach(en => {
  en.target.classList.toggle("in", en.isIntersecting);
}), { threshold: .12, rootMargin: "0px 0px -6% 0px" });

/* ---- রুটিং হেল্পার — PAGES ও route() প্রতিটি পেজ নিজের ফাইলে বানায় ---- */
function showPage(n){ PAGES.forEach(p => $("page-" + p).classList.toggle("show", p === n)); }
function setActiveNav(h){ document.querySelectorAll("#navlinks a").forEach(a => a.classList.toggle("active", a.getAttribute("href") === h)); }
function refreshBrand(){
  const nm = S.settings.siteName || "DEEPostrophy";
  const bn = $("brand-name"); if (bn) bn.textContent = nm;
  const ht = $("home-title"); if (!ht) return;                    /* বড় শিরোনাম শুধু হোমে */
  const parts = nm.split(/(?=[A-Z])/);
  ht.innerHTML = parts.length > 1 ? esc(parts[0]) + '<span class="grad">' + esc(parts.slice(1).join("")) + "</span>" : '<span class="grad">' + esc(nm) + "</span>";
  ht.removeAttribute("data-mx-done");
}
addEventListener("hashchange", ()=>{ document.querySelectorAll("[data-mx-done]").forEach(e=>e.removeAttribute("data-mx-done")); document.querySelectorAll("canvas.mosaic").forEach(c=>c.remove()); mxReset(); route(); });

/* ---- শেয়ার্ড বাইন্ডিং — বোতাম না থাকলে চুপচাপ এড়িয়ে যায় ---- */
function bindCommon(){
  const bg = $("burger"); if (bg) bg.addEventListener("click", () => $("navlinks").classList.toggle("open"));
document.addEventListener("click", e=>{ const b=e.target.closest("[data-goto]"); if(b){ location.hash="#"+b.dataset.goto; } });
document.addEventListener("click", e=>{ const a=e.target.closest("a[data-scroll]"); if(!a) return;
  const el=document.getElementById((a.getAttribute("href")||"").slice(1)); if(!el) return;
  e.preventDefault(); el.scrollIntoView({behavior: reduce?"auto":"smooth", block:"start"}); });
}
function openLangMenu(){
  const m = $("lang-menu"), b = $("lang-btn"); if (!m) return;
  buildLangMenu();
  m.hidden = false; if (b) b.setAttribute("aria-expanded", "true");
  const s = $("lang-search"); if (s) { s.value = ""; filterLangs(""); }
  const em = $("lang-empty"); if (em) em.hidden = true;
  if (s) setTimeout(() => { try { s.focus(); } catch (e) {} }, 0);
}
function closeLangMenu(){
  const m = $("lang-menu"), b = $("lang-btn"); if (!m || m.hidden) return;
  m.hidden = true; if (b) b.setAttribute("aria-expanded", "false");
  langOptionNodes().forEach(li => li.classList.remove("hi"));
}
function toggleLangMenu(){ const m = $("lang-menu"); if (!m) return; m.hidden ? openLangMenu() : closeLangMenu(); }
function moveLangHighlight(dir){
  const vis = langOptionNodes().filter(li => li.style.display !== "none"); if (!vis.length) return;
  let i = vis.findIndex(li => li.classList.contains("hi"));
  i = dir > 0 ? (i + 1 + vis.length) % (vis.length || 1) : (i - 1 + vis.length) % (vis.length || 1);
  if (i < 0) i = 0;
  langOptionNodes().forEach(li => li.classList.remove("hi"));
  vis[i].classList.add("hi"); vis[i].scrollIntoView({ block: "nearest" });
}
function bindLangBtn(){
  const b = $("lang-btn"); if (!b) return;
  b.setAttribute("aria-haspopup", "listbox"); b.setAttribute("aria-expanded", "false");
  b.addEventListener("click", e => { e.stopPropagation(); toggleLangMenu(); });
  const m = $("lang-menu");
  if (m) {
    m.addEventListener("click", e => {
      e.stopPropagation();
      const li = e.target.closest("li[data-code]"); if (!li) return;
      setLang(li.dataset.code); closeLangMenu(); if (b) b.focus();
    });
    const s = $("lang-search");
    if (s) s.addEventListener("input", () => filterLangs(s.value));
    m.addEventListener("keydown", e => {
      if (e.key === "ArrowDown")      { e.preventDefault(); moveLangHighlight(1); }
      else if (e.key === "ArrowUp")   { e.preventDefault(); moveLangHighlight(-1); }
      else if (e.key === "Enter")     { e.preventDefault();
        const pick = m.querySelector("li.hi") || m.querySelector('li[aria-selected="true"]') || langOptionNodes().filter(li => li.style.display !== "none")[0];
        if (pick) { setLang(pick.dataset.code); closeLangMenu(); if (b) b.focus(); } }
    });
  }
  /* বাইরে ক্লিক বা Esc — প্যানেল বন্ধ */
  document.addEventListener("click", () => closeLangMenu());
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeLangMenu(); });
}

async function loadFirebase(){
  try{
    const [appM,authM,dbM] = await Promise.all([
      import(FB_CDN+"firebase-app.js"), import(FB_CDN+"firebase-auth.js"), import(FB_CDN+"firebase-firestore.js")
    ]);
    const app=appM.initializeApp(FIREBASE_CONFIG);
    const auth=authM.getAuth(app);
    const db=dbM.getFirestore(app);
    FB={app,auth,db,api:{ ...authM, ...dbM }};
    return true;
  }catch(ex){ console.error("Firebase load failed",ex); return false; }
}

/* =========================================================
   ক্লিক সাউন্ড — Web Audio, কোনো অডিও ফাইল নেই, ডিফল্ট বন্ধ
   ========================================================= */
const SOUND_KEY = "deeo.sound";
let SOUND = false;
try { SOUND = localStorage.getItem(SOUND_KEY) === "on"; } catch (e) {}
let audioCtx = null;
function ensureAudio(){
  if (audioCtx) return audioCtx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  try { audioCtx = new AC(); } catch (e) { audioCtx = null; }
  return audioCtx;
}
function clickPop(){
  if (!SOUND || reduce) return;                       // শব্দ বন্ধ বা অ্যানিমেশন কমানো থাকলে নীরব
  const ctx = ensureAudio(); if (!ctx) return;
  if (ctx.state === "suspended") ctx.resume();        // প্রথম ক্লিকেই জেস্টার আছে
  const now = ctx.currentTime;
  const osc = ctx.createOscillator(), gain = ctx.createGain(), filt = ctx.createBiquadFilter();
  osc.type = "sine";
  osc.frequency.setValueAtTime(620, now);
  osc.frequency.exponentialRampToValueAtTime(230, now + 0.07);   // নরম “পপ”
  filt.type = "lowpass"; filt.frequency.setValueAtTime(1800, now);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.13, now + 0.010);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
  osc.connect(filt); filt.connect(gain); gain.connect(ctx.destination);
  osc.start(now); osc.stop(now + 0.14);
}
function updateSoundBtn(){
  const b = $("sound-btn"); if (!b) return;
  const lbl = t(SOUND ? "শব্দ চালু" : "শব্দ বন্ধ");
  b.setAttribute("title", lbl); b.setAttribute("aria-label", lbl);
  b.setAttribute("aria-pressed", SOUND ? "true" : "false");
  b.classList.toggle("muted", !SOUND);
}
function bindSoundBtn(){
  const b = $("sound-btn"); if (!b) return;
  b.addEventListener("click", () => {
  SOUND = !SOUND;
  try { localStorage.setItem(SOUND_KEY, SOUND ? "on" : "off"); } catch (e) {}
  if (SOUND) { ensureAudio(); clickPop(); }           // চালু করার সঙ্গে সঙ্গে একটা হালকা নিশ্চিতকরণ শব্দ
  updateSoundBtn();
});
}
/* শুধু বোতাম ও লিংকে — hover-এ নয় */
document.addEventListener("click", e => {
  if (!SOUND || reduce) return;
  if (e.target.closest("#sound-btn")) return;
  if (e.target.closest("button, a")) clickPop();
}, true);

/* =========================================================
   কাস্টম কার্সার (§৭) — cursor:none + মাউস-ট্র্যাকিং এলিমেন্ট
   ১৪টি স্টেট assets/cursors/ থেকে; ছবি না মিললে ভায়োলেট ডট + সায়ান রিং
   ========================================================= */
const CURSOR_DIR = "assets/cursors/";
const CURSOR_STATES = {
  arrow:     { f: "arrow.png",        h: [5, 4] },
  link:      { f: "link.png",         h: [10, 3], hot: 1 },
  text:      { f: "text.png",         h: [16, 16] },
  precision: { f: "precision.png",    h: [16, 16] },
  move:      { f: "move.png",         h: [16, 16] },
  help:      { f: "help.png",         h: [5, 4] },
  unavail:   { f: "no-drop.png",      h: [16, 16] },
  ew:        { f: "ew-resize.png",    h: [16, 16] },
  ns:        { f: "ns-resize.png",    h: [16, 16] },
  north:     { f: "up-resize.png",    h: [15, 6] },
  nesw:      { f: "nesw-resize.png",  h: [16, 16] },
  nwse:      { f: "nwse-resize.png",  h: [16, 16] },
  busy:      { f: "busy.apng",        h: [16, 16], anim: 1 },
  working:   { f: "working.apng",     h: [16, 16], anim: 1 }
};
const cursorBox = document.createElement("div");
cursorBox.id = "cursor";
cursorBox.setAttribute("aria-hidden", "true");
cursorBox.innerHTML = '<img alt="" draggable="false"/><span class="dot"></span><span class="ring"></span>';
let cursorImg = null, cursorReady = false, curState = "arrow", curTarget = null;
let mouseX = -80, mouseY = -80, busyCount = 0;
let cursorRaf = 0, cursorPaintedSize = 0, cursorPosX = null, cursorPosY = null, cursorOn = false;
const cursorFiles = {};
const cursorSel = {
  text: 'input[type="text"],input[type="password"],input[type="email"],input[type="number"],input[type="search"],input[type="tel"],input[type="url"],textarea,[contenteditable="true"],#search,#faq-search',
  precision: 'input[type="color"],.sw-acc,#i-accents',
  unavail: '[disabled],.disabled,[aria-disabled="true"]',
  help: '#helper-fab,[data-cursor="help"]',
  link: 'a,button,select,summary,[role="button"],.nav-tool,.sw,.filter,.tab,.mini,.btn',
  move: '[data-drift],[data-cursor="move"]'
};
function cursorDetect(t){
  if (!t || !t.closest) return "arrow";
  if (busyCount > 0) return "busy";                                     // লোড চলছে — সবচেয়ে আগে
  const bl = document.getElementById("boot");
  if (bl && !bl.classList.contains("hide")) return "working";           // বুট লোডার চলছে
  const ov = t.closest("[data-cursor]");
  if (ov && CURSOR_STATES[ov.getAttribute("data-cursor")]) return ov.getAttribute("data-cursor");
  if (t.closest(cursorSel.unavail)) return "unavail";
  if (t.closest(cursorSel.precision)) return "precision";
  if (t.closest(cursorSel.text)) return "text";
  if (t.closest(cursorSel.help)) return "help";
  if (t.closest(cursorSel.link)) return "link";
  if (t.closest(cursorSel.move)) return "move";
  return "arrow";
}
function cursorSize(){ return innerWidth < 640 ? 26 : 32; }   // মোবাইলে একটু ছোট
/* APNG শুধু দরকার হলেই নামে — বুট/ডেটা লোড ছাড়া কখনো চলবে না; reduce থাকলে স্ট্যাটিকই থাকবে */
function cursorLoad(k){
  if (reduce || !CURSOR_STATES[k] || cursorFiles[k] !== undefined) return;
  const im = new Image();
  im.onload = () => { cursorFiles[k] = true; if (k === curState) cursorPaint(); };
  im.onerror = () => { cursorFiles[k] = false; };
  im.src = CURSOR_DIR + CURSOR_STATES[k].f;
}
function cursorPaint(){
  if (!cursorReady) return;
  const st = CURSOR_STATES[curState] || CURSOR_STATES.arrow;
  const size = cursorSize(), scale = size / 32;
  if (size !== cursorPaintedSize) { cursorPaintedSize = size; cursorBox.style.width = size + "px"; cursorBox.style.height = size + "px"; }
  if (st.anim) cursorLoad(curState);
  const src = CURSOR_DIR + st.f;
  if (cursorFiles[curState]) {
    cursorBox.classList.remove("fallback");
    if (cursorImg.getAttribute("src") !== src) cursorImg.setAttribute("src", src);   // সত্যিই বদলালেই বদলায়
  } else cursorBox.classList.add("fallback");
  const org = (st.h[0] * scale).toFixed(2) + "px " + (st.h[1] * scale).toFixed(2) + "px";
  if (cursorImg.style.transformOrigin !== org) cursorImg.style.transformOrigin = org;
  cursorBox.classList.toggle("hot", !!st.hot);
  cursorPlace();
}
function cursorPlace(){
  const st = CURSOR_STATES[curState] || CURSOR_STATES.arrow;
  const scale = cursorSize() / 32;
  const x = mouseX - st.h[0] * scale, y = mouseY - st.h[1] * scale;
  if (x === cursorPosX && y === cursorPosY) return;                                   // একই জায়গা — কিছু লেখা হয় না
  cursorPosX = x; cursorPosY = y;
  cursorBox.style.transform = "translate3d(" + x + "px," + y + "px,0)";
}
/* প্রতি ফ্রেমে একবার — প্রতি mousemove ইভেন্টে নয় */
function cursorApply(){
  if (!cursorReady) return;
  const next = cursorDetect(curTarget);
  if (next !== curState) { curState = next; cursorPaint(); }                           // অবস্থা বদলালেই পেইন্ট
  else cursorPlace();
}
function cursorTick(){ if (cursorRaf || !cursorReady) return; cursorRaf = requestAnimationFrame(() => { cursorRaf = 0; cursorApply(); }); }
function cursorHover(t){ curTarget = t; cursorTick(); }
/* পেজ লোডের সময় ডিফল্ট কার্সারই থাকে; প্রথম মাউস-অবস্থান জানা গেলে তবেই cursor:none হয় */
function cursorActivate(){ if (cursorOn || !cursorReady) return; cursorOn = true; document.body.classList.add("cursor-on"); }
/* ---- মোডাল ও কার্সার ---- <dialog> ব্রাউজারের টপ-লেয়ারে ওঠে, তাই কার্সার এলিমেন্টটিকেও খোলা মোডালের ভেতরে নিতে হয় */
const cursorDialogStack = [];                                   // যে ক্রমে খোলা হয়েছে — DOM ক্রম নয়, z-order
function cursorHostSync(){
  if (!cursorReady) return;
  for (let i = cursorDialogStack.length - 1; i >= 0; i--) if (!cursorDialogStack[i].open) cursorDialogStack.splice(i, 1);
  const host = cursorDialogStack[cursorDialogStack.length - 1] || document.body;   // সবচেয়ে উপরের খোলা স্তর
  if (cursorBox.parentElement !== host) host.appendChild(cursorBox);                // সব বন্ধ হলে আবার পেজের স্তরে
}
(function cursorDialogHooks(){
  if (!window.HTMLDialogElement) return;
  const D = HTMLDialogElement.prototype, prev = { sm: D.showModal, sh: D.show, cl: D.close };
  const push = d => { const i = cursorDialogStack.indexOf(d); if (i >= 0) cursorDialogStack.splice(i, 1); cursorDialogStack.push(d); cursorHostSync(); };
  D.showModal = function(){ prev.sm.apply(this, arguments); push(this); };
  D.show = function(){ prev.sh.apply(this, arguments); push(this); };
  D.close = function(){ prev.cl.apply(this, arguments); const i = cursorDialogStack.indexOf(this); if (i >= 0) cursorDialogStack.splice(i, 1); cursorHostSync(); };
  document.addEventListener("close", cursorHostSync, true);                // Esc / form দিয়ে বন্ধ হলেও ধরা পড়ে
})();
function initCursor(){
  if (!matchMedia("(pointer:fine)").matches) return;          // টাচ/হাইব্রিড ডিভাইসে ডিফল্ট কার্সারই থাকবে
  document.body.appendChild(cursorBox);
  cursorImg = cursorBox.querySelector("img");
  if (reduce) cursorBox.classList.add("no-anim");
  Object.keys(CURSOR_STATES).forEach(k => {                   // স্ট্যাটিক PNG আগে থেকেই, অ্যানিমেটেড পরে
    if (CURSOR_STATES[k].anim) return;                          // APNG বুট/লোডের সময়ই চাই, আগে লোড করবে না
    const im = new Image();
    im.onload = () => { cursorFiles[k] = true; if (k === curState) cursorPaint(); };   // লোড শেষে সঙ্গে সঙ্গে ছবি বসাও
    im.onerror = () => { cursorFiles[k] = false; if (k === curState) cursorPaint(); };
    im.src = CURSOR_DIR + CURSOR_STATES[k].f;
  });
  cursorReady = true;
  addEventListener("mousemove", e => {
    mouseX = e.clientX; mouseY = e.clientY; curTarget = e.target;
    cursorActivate();                                                       // প্রথম অবস্থান জানা গেলেই কার্সার চালু
    if (!cursorBox.classList.contains("show")) cursorBox.classList.add("show");
    cursorTick();
  }, { passive: true });
  document.documentElement.addEventListener("mouseleave", () => {                       // সাইটের বাইরে — ডিফল্ট কার্সার ফিরে আসে
    cursorBox.classList.remove("show"); document.body.classList.remove("cursor-on"); cursorOn = false;
    if (cursorRaf) { cancelAnimationFrame(cursorRaf); cursorRaf = 0; }
  });
  document.documentElement.addEventListener("mouseenter", () => {
    if (!cursorReady) return; cursorActivate(); cursorBox.classList.add("show"); cursorPaint();
  });
  addEventListener("resize", cursorPaint, { passive: true });
  cursorPaint();
}
/* ব্যস্ত থাকলে কার্সার স্টেট */
function cursorBusy(on){ busyCount = Math.max(0, busyCount + (on ? 1 : -1)); if (!curTarget) curTarget = document.body; cursorTick(); }
function cursorWrapDB(){
  Object.keys(DB).forEach(k => {
    const orig = DB[k]; if (typeof orig !== "function") return;
    DB[k] = function(){ const r = orig.apply(DB, arguments);
      if (r && typeof r.then === "function") { cursorBusy(true); return r.finally(() => cursorBusy(false)); }
      return r; };
  });
}

/* =========================================================
   শেয়ার্ড বুট — প্রতিটি পেজ নিজের boot() থেকে এটি ডাকে
   ========================================================= */
async function bootShared(){
  document.documentElement.lang = LANG;
  attachI18nObserver(); bindCommon(); bindLangBtn(); bindSoundBtn();
  initCursor();
  if (isConfigured()) { const ok = await loadFirebase(); MODE = ok ? "fs" : "ls"; }
  await new Promise(res => Auth.onChange(res));
  await loadData();
  applyAutoLang();
  applyI18n(document.body);
  updateLangBtn();
  cursorWrapDB();
}
