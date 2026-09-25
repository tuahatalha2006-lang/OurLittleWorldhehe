/* ============================================
   RUSHNA'S LITTLE WORLD — script.js
   ============================================ */

(function(){
"use strict";

/* ---------- STATE (localStorage) ---------- */
const STORAGE_KEY = "rushnaWorldProgress";
const TOTAL_MILESTONES = 11;

function loadState(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(raw) return JSON.parse(raw);
  }catch(e){}
  return {
    cake:false, gifts:{}, flowers:{}, gardenDone:false,
    quizDone:false, reasonsDone:false, nightDone:false, secretUnlocked:false,
    reasonIndex:0
  };
}
let state = loadState();

function saveState(){
  try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }catch(e){}
}

function countMilestones(){
  let n = 0;
  if(state.cake) n++;
  n += Object.values(state.gifts).filter(Boolean).length; // up to 5
  if(state.gardenDone) n++;
  if(state.quizDone) n++;
  if(state.nightDone) n++;
  if(state.reasonsDone) n++;
  if(state.secretUnlocked) n++;
  return Math.min(n, TOTAL_MILESTONES);
}

const progressPill = document.getElementById("progressPill");
const progressText = document.getElementById("progressText");
function updateProgress(){
  const n = countMilestones();
  progressText.textContent = `${n} / ${TOTAL_MILESTONES} surprises found`;
  progressPill.classList.add("bump");
  setTimeout(()=>progressPill.classList.remove("bump"), 300);
  saveState();
}

/* ---------- PETAL FIELD (ambient) ---------- */
const petalEmojis = ["🌸","🌷","🪻","🌹","✨"];
const petalField = document.getElementById("petalField");
function spawnPetal(){
  const p = document.createElement("div");
  p.className = "petal";
  p.textContent = petalEmojis[Math.floor(Math.random()*petalEmojis.length)];
  const left = Math.random()*100;
  const duration = 9 + Math.random()*8;
  const drift = (Math.random()*80 - 40) + "px";
  p.style.left = left + "vw";
  p.style.setProperty("--drift", drift);
  p.style.animationDuration = duration + "s";
  p.style.fontSize = (14 + Math.random()*10) + "px";
  petalField.appendChild(p);
  setTimeout(()=>p.remove(), duration*1000 + 500);
}
for(let i=0;i<5;i++) setTimeout(spawnPetal, i*1200);
setInterval(spawnPetal, 2200);

/* ---------- sparkle layer on gate ---------- */
const sparkleLayer = document.querySelector(".sparkle-layer");
if(sparkleLayer){
  for(let i=0;i<26;i++){
    const s = document.createElement("div");
    s.textContent = "✨";
    s.style.position = "absolute";
    s.style.left = Math.random()*100 + "%";
    s.style.top = Math.random()*100 + "%";
    s.style.fontSize = (8 + Math.random()*10) + "px";
    s.style.opacity = (0.3 + Math.random()*0.5).toFixed(2);
    s.style.animation = `pulse ${2+Math.random()*2}s ease-in-out infinite`;
    s.style.animationDelay = (Math.random()*2)+"s";
    sparkleLayer.appendChild(s);
  }
}

/* ---------- GATE -> WORLD ---------- */
const gateScreen = document.getElementById("gateScreen");
const world = document.getElementById("world");
const enterBtn = document.getElementById("enterBtn");
enterBtn.addEventListener("click", ()=>{
  gateScreen.style.transition = "opacity .7s ease";
  gateScreen.style.opacity = "0";
  setTimeout(()=>{
    gateScreen.style.display = "none";
    world.classList.add("show");
    progressPill.classList.add("show");
    document.getElementById("musicPlayer").classList.add("show");
    updateProgress();
    window.scrollTo(0,0);
  }, 650);
});

/* ---------- MUSIC PLAYER ---------- */
const playlist = [
  {src:"our-song.mp3", title:"Afreen Afreen", sub:"our song, kind of"},
  {src:"our-song-2.mp3", title:"Our Song", sub:"the other one we love"}
];
let trackIndex = 0;
const audio = document.getElementById("bgAudio");
const musicToggle = document.getElementById("musicToggle");
const musicNext = document.getElementById("musicNext");
const musicTitle = document.getElementById("musicTitle");
const musicSub = document.getElementById("musicSub");
const playIcon = document.getElementById("playIcon");
const pauseIcon = document.getElementById("pauseIcon");
const volumeSlider = document.getElementById("volumeSlider");
const musicNotes = document.getElementById("musicNotes");
audio.volume = 0.6;

function loadTrack(i, autoplay){
  trackIndex = (i + playlist.length) % playlist.length;
  const wasPlaying = !audio.paused;
  audio.src = playlist[trackIndex].src;
  musicTitle.textContent = playlist[trackIndex].title;
  musicSub.textContent = playlist[trackIndex].sub;
  if(autoplay || wasPlaying){
    audio.play().catch(()=>{});
  }
}

musicToggle.addEventListener("click", ()=>{
  if(audio.paused){
    audio.play().catch(()=>{});
  } else {
    audio.pause();
  }
});
musicNext.addEventListener("click", ()=>{
  loadTrack(trackIndex + 1, true);
});
audio.addEventListener("play", ()=>{
  playIcon.style.display = "none";
  pauseIcon.style.display = "block";
  startNotes();
});
audio.addEventListener("pause", ()=>{
  playIcon.style.display = "block";
  pauseIcon.style.display = "none";
});
volumeSlider.addEventListener("input", (e)=>{ audio.volume = parseFloat(e.target.value); });

let noteInterval = null;
function startNotes(){
  if(noteInterval) return;
  noteInterval = setInterval(()=>{
    if(audio.paused){ clearInterval(noteInterval); noteInterval=null; return; }
    const n = document.createElement("span");
    n.className = "music-note";
    n.textContent = Math.random() > 0.5 ? "🎵" : "💗";
    n.style.left = "0px";
    musicNotes.appendChild(n);
    setTimeout(()=>n.remove(), 2300);
  }, 900);
}

/* ---------- CAKE ---------- */
const candles = document.querySelectorAll(".candle");
const cakeReveal = document.getElementById("cakeReveal");
let blownOut = 0;
candles.forEach(c=>{
  c.addEventListener("click", ()=>{
    if(c.classList.contains("out")) return;
    c.classList.add("out");
    blownOut++;
    if(blownOut === candles.length){
      launchConfetti();
      launchFloatingHearts();
      cakeReveal.classList.add("show");
      state.cake = true;
      updateProgress();
    }
  });
});
document.getElementById("wishMadeBtn").addEventListener("click", (e)=>{
  document.getElementById("cakeFinal").classList.add("show");
  e.target.style.display = "none";
});

function launchConfetti(){
  const colors = ["#ff5fa2","#c9a7f7","#ffd6ea","#9b6fd6","#fff"];
  for(let i=0;i<60;i++){
    const c = document.createElement("div");
    c.className = "confetti-piece";
    c.style.left = Math.random()*100 + "vw";
    c.style.background = colors[Math.floor(Math.random()*colors.length)];
    c.style.transform = `rotate(${Math.random()*360}deg)`;
    document.body.appendChild(c);
    const duration = 2200 + Math.random()*1500;
    c.animate([
      {transform:`translateY(0) rotate(0deg)`, opacity:1},
      {transform:`translateY(100vh) rotate(${360+Math.random()*360}deg)`, opacity:0.9}
    ], {duration, easing:"cubic-bezier(.3,.6,.5,1)"});
    setTimeout(()=>c.remove(), duration);
  }
}
function launchFloatingHearts(count=18){
  for(let i=0;i<count;i++){
    setTimeout(()=>{
      const h = document.createElement("div");
      h.className = "float-heart";
      h.textContent = Math.random()>0.5 ? "💗" : "🌹";
      h.style.left = Math.random()*100 + "vw";
      h.style.top = "100vh";
      document.body.appendChild(h);
      const duration = 2600 + Math.random()*1200;
      h.animate([
        {transform:"translateY(0)", opacity:1},
        {transform:`translateY(-110vh) translateX(${Math.random()*60-30}px)`, opacity:0}
      ], {duration, easing:"ease-out"});
      setTimeout(()=>h.remove(), duration);
    }, i*70);
  }
}

/* ---------- GIFTS ---------- */
const giftContent = {
  1: {
    title:"a love letter",
    html:`<p>Mera bacha, if you're reading this — hi. I just wanted to write you something small before the bigger letters later in this world. You make the ordinary parts of my life feel really blessed, and nothing actually is left ordinary. That's it. That's the whole gift. I love you, mwahhh.</p>`
  },
  2: {
    title:"a cute memory",
    html:`<p>Remember the day when we held hands for the first time and your class got cancelled, and we literally got to sit so chipak kr for 2 hours — literally such a cutu day it was. And your eyes, ufff, I miss them so much.</p>`
  },
  3: {
    title:"10 things I love about you",
    html:`<ul>
      <li>The way you say "I don't care" while clearly caring the most</li>
      <li>Your laugh when you are comfy with me</li>
      <li>How you argue and try to make me better roz roz</li>
      <li>The way you pose for photos like it's a competition — hehe, such a baby girl</li>
      <li>How soft you get with me when you are close to me</li>
      <li>Your annoyed face, which is somehow still cute to me</li>
      <li>How you remember tiny things I mention once</li>
      <li>Your beautiful big eyes</li>
      <li>The way you say my nicknames back at me — your hubby, loverboy, and so much more</li>
      <li>Just... you. All of it, honestly</li>
    </ul>`
  },
  4: {
    title:"a romantic surprise",
    html:`<p>Consider this your official IOU: one full day, whenever you want it, where I plan everything — food, place, decorations, all of it, hehe. Then we go out for a walk and have ourselves all relaxed and together, and just so sooo close to each other :)</p>`
  },
  5: {
    title:"a secret",
    html:`<p>Okay, actual secret: I've been planning this website for quite long than I should admit, and I had to sometimes pretend I'm busy or something, so yeah — please, my love, forgive me for that. Mera chanda, I love you so so much.</p>`
  }
};
document.querySelectorAll(".gift-box").forEach(box=>{
  box.addEventListener("click", ()=>{
    const id = box.dataset.gift;
    box.classList.add("opened");
    if(!state.gifts[id]){
      state.gifts[id] = true;
      updateProgress();
    }
    openModal(giftContent[id].title, giftContent[id].html);
  });
});

/* generic modal */
let modalOverlay;
function openModal(title, html){
  if(!modalOverlay){
    modalOverlay = document.createElement("div");
    modalOverlay.className = "gift-modal-overlay";
    modalOverlay.innerHTML = `<div class="gift-modal">
      <h3></h3>
      <div class="modal-body"></div>
      <button class="pill-btn modal-close">close</button>
    </div>`;
    document.body.appendChild(modalOverlay);
    modalOverlay.querySelector(".modal-close").addEventListener("click", closeModal);
    modalOverlay.addEventListener("click", (e)=>{ if(e.target === modalOverlay) closeModal(); });
  }
  modalOverlay.querySelector("h3").textContent = title;
  modalOverlay.querySelector(".modal-body").innerHTML = html;
  modalOverlay.classList.add("show");
}
function closeModal(){ modalOverlay.classList.remove("show"); }

/* ---------- FLOWER GARDEN ---------- */
const flowers = [
  {emoji:"🌷", msg:"Tulip says: you make ordinary days feel like a whole event."},
  {emoji:"🌹", msg:"Rose says: you will always be my favourite."},
  {emoji:"🪻", msg:"Lavender says: breathe. you're doing better than you think, meri jaanu."},
  {emoji:"🌷", msg:"Tulip says: your voice is genuinely my favourite sound."},
  {emoji:"🌹", msg:"Rose says: I'd pick you in every version and mood, every time."},
  {emoji:"🪻", msg:"Lavender says: it's okay to slow down today. it's your day, my love."},
  {emoji:"🌷", msg:"Tulip says: you're the most stubborn person I know, and I love it."},
  {emoji:"🌹", msg:"Rose says: mera chanda, you make me feel so loved and happy."},
  {emoji:"🪻", msg:"Lavender says: last flower — go see what you've unlocked hehehe"}
];
const gardenBed = document.getElementById("gardenBed");
const gardenMsgEl = document.createElement("p");
gardenMsgEl.className = "flower-msg";
gardenMsgEl.id = "flowerMsg";
let foundCount = 0;
flowers.forEach((f, i)=>{
  const el = document.createElement("div");
  el.className = "flower";
  el.textContent = f.emoji;
  el.addEventListener("click", ()=>{
    if(el.classList.contains("found")) return;
    el.classList.add("found");
    gardenMsgEl.textContent = f.msg;
    gardenMsgEl.classList.add("show");
    if(!state.flowers[i]){
      state.flowers[i] = true;
      foundCount++;
      if(foundCount === flowers.length){
        document.getElementById("gardenComplete").classList.add("show");
        state.gardenDone = true;
        launchFloatingHearts(12);
      }
      updateProgress();
    }
  });
  gardenBed.appendChild(el);
});
gardenBed.after(gardenMsgEl);
// restore already-found flowers on reload
foundCount = Object.keys(state.flowers).length;
if(foundCount > 0){
  const flowerEls = gardenBed.querySelectorAll(".flower");
  Object.keys(state.flowers).forEach(i=>flowerEls[i].classList.add("found"));
}
if(state.gardenDone) document.getElementById("gardenComplete").classList.add("show");

/* ---------- MEMORIES SCRAPBOOK ---------- */
const pages = document.querySelectorAll(".scrapbook-page");
const memoryDots = document.getElementById("memoryDots");
let currentPage = 0;
pages.forEach((_, i)=>{
  const dot = document.createElement("span");
  if(i===0) dot.classList.add("active");
  memoryDots.appendChild(dot);
});
function showPage(i){
  pages.forEach(p=>p.classList.remove("active"));
  memoryDots.querySelectorAll("span").forEach(d=>d.classList.remove("active"));
  pages[i].classList.add("active");
  memoryDots.children[i].classList.add("active");
  currentPage = i;
}
document.getElementById("nextMemory").addEventListener("click", ()=>{
  showPage((currentPage+1) % pages.length);
});
document.getElementById("prevMemory").addEventListener("click", ()=>{
  showPage((currentPage-1+pages.length) % pages.length);
});

/* ---------- REASONS I LOVE YOU ---------- */
const reasons = [
  "Because you always make ordinary days feel special.",
  "Because you're my favorite person ever.",
  "Because your smile can completely change my mood.",
  "Because you're my jaanu, and that word actually means something to me.",
  "Because you're my haseen si begum ji.",
  "Because you argue like you're always right, and I let you win cuz you are always right.",
  "Because you remember things I mentioned once, long ago.",
  "Because even in your bad days, you still trust me enough to show up.",
  "Because you make fun of me in a way that feels like affection.",
  "Because you're ridiculously stubborn and I wouldn't change it.",
  "Because you're my wifey lifey before it's even official, hehehe.",
  "Because being boring with you still feels like the best plan.",
  "Because you say my name like it means everything to you too.",
  "Because you're soft in the ways that matter and tough in the rest.",
  "Because you're mera bacha, and I will always be a little protective of you.",
  "Because you make me want to be better at showing up, not just feeling things.",
  "Because you're my chanda — the thing I look for without meaning to.",
  "Because, simply, you're it for me, Rushna."
];
const bigHeart = document.getElementById("bigHeart");
const reasonCard = document.getElementById("reasonCard");
const reasonText = document.getElementById("reasonText");
const reasonCount = document.getElementById("reasonCount");
const reasonsHint = document.getElementById("reasonsHint");
let reasonIndex = state.reasonIndex || 0;
function updateReasonCount(){
  reasonCount.textContent = reasonIndex >= reasons.length
    ? "all reasons found 💗"
    : `${reasonIndex} / ${reasons.length} reasons found`;
}
updateReasonCount();
bigHeart.addEventListener("click", ()=>{
  if(reasonIndex >= reasons.length){
    reasonText.textContent = "That's all of them, Rushi Gushi — though honestly, the list never really ends.";
    reasonCard.classList.add("show");
    return;
  }
  reasonText.textContent = reasons[reasonIndex];
  reasonCard.classList.remove("show");
  void reasonCard.offsetWidth; // restart animation
  reasonCard.classList.add("show");
  reasonIndex++;
  state.reasonIndex = reasonIndex;
  updateReasonCount();
  if(reasonIndex === reasons.length){
    state.reasonsDone = true;
    reasonsHint.textContent = "you found them all — tap once more 💗";
    updateProgress();
  }
});
if(reasonIndex > 0 && reasonIndex < reasons.length){
  reasonsHint.textContent = `${reasons.length - reasonIndex} more to find`;
} else if(reasonIndex >= reasons.length){
  reasonsHint.textContent = "you found them all — tap once more 💗";
}

/* ---------- QUIZ ---------- */
const quizQuestions = [
  {q:"Who fell harder?", options:["Definitely him","Definitely her","Both, equally, immediately"]},
  {q:"Who is more annoying?", options:["Him, constantly","Her, but cutely","It's a tie, honestly"]},
  {q:"Who says sorry first?", options:["Him, usually","Her, after a long pause","Whoever misses the other more that day"]},
  {q:"Who loves the other more?", options:["Him","Her","Trick question — same amount, different volume"]},
  {q:"Who is the actual baby?", options:["Him, obviously","Her, obviously","Both. No contest."]}
];
const quizQ = document.getElementById("quizQ");
const quizOptions = document.getElementById("quizOptions");
const quizResult = document.getElementById("quizResult");
const quizBox = document.getElementById("quizBox");
let quizIndex = 0;
function renderQuiz(){
  if(quizIndex >= quizQuestions.length){
    quizBox.style.display = "none";
    quizResult.classList.add("show");
    if(!state.quizDone){
      state.quizDone = true;
      updateProgress();
    }
    return;
  }
  const item = quizQuestions[quizIndex];
  quizQ.textContent = item.q;
  quizOptions.innerHTML = "";
  item.options.forEach(opt=>{
    const b = document.createElement("button");
    b.className = "quiz-opt";
    b.textContent = opt;
    b.addEventListener("click", ()=>{
      quizIndex++;
      renderQuiz();
    });
    quizOptions.appendChild(b);
  });
}
document.getElementById("quizReplay").addEventListener("click", ()=>{
  quizIndex = 0;
  quizBox.style.display = "block";
  quizResult.classList.remove("show");
  renderQuiz();
});
renderQuiz();

/* ---------- NIGHT SKY ---------- */
const starMessages = [
  "You are my favorite notification.",
  "You make my heart loved and happy.",
  "Mera chanda, you're my home.",
  "You make my biggest problems the smallest ones with your smile.",
  "I'd choose the version of life with you in it, every single time.",
  "You're the last thing I think about every night."
];
const starsField = document.getElementById("starsField");
const starPositions = [
  {top:"12%",left:"14%"},{top:"20%",left:"70%"},{top:"32%",left:"40%"},
  {top:"45%",left:"18%"},{top:"15%",left:"85%"},{top:"50%",left:"75%"}
];
let starMsgEl = document.createElement("p");
starMsgEl.className = "star-msg";
let starsFound = 0;
starMessages.forEach((msg,i)=>{
  const s = document.createElement("div");
  s.className = "star";
  s.textContent = "⭐";
  s.style.top = starPositions[i].top;
  s.style.left = starPositions[i].left;
  s.style.animationDelay = (i*0.3)+"s";
  s.addEventListener("click", ()=>{
    starMsgEl.textContent = msg;
    starMsgEl.classList.add("show");
    if(!s.classList.contains("found")){
      s.classList.add("found");
      starsFound++;
      if(starsFound === starMessages.length && !state.nightDone){
        state.nightDone = true;
        updateProgress();
      }
    }
  });
  starsField.appendChild(s);
});
document.getElementById("nightSection").appendChild(starMsgEl);

/* ---------- SECRET UNLOCK ---------- */
const unlockBtn = document.getElementById("unlockBtn");
const lockIcon = document.getElementById("lockIcon");
const lockbox = document.getElementById("lockbox");
const finalReveal = document.getElementById("finalReveal");
let unlockTries = 0;
unlockBtn.addEventListener("click", ()=>{
  unlockTries++;
  if(unlockTries < 2){
    lockIcon.classList.add("shake");
    lockIcon.textContent = "🔒";
    unlockBtn.querySelector("span")?.remove();
    setTimeout(()=>lockIcon.classList.remove("shake"), 500);
    return;
  }
  lockIcon.textContent = "🔓";
  setTimeout(()=>{
    lockbox.classList.add("unlocked");
    finalReveal.classList.add("show");
    launchConfetti();
    launchFloatingHearts(24);
    state.secretUnlocked = true;
    updateProgress();
  }, 500);
});

/* ---------- restore visited state on load ---------- */
document.querySelectorAll(".gift-box").forEach(box=>{
  if(state.gifts[box.dataset.gift]) box.classList.add("opened");
});
if(state.cake){
  candles.forEach(c=>c.classList.add("out"));
  cakeReveal.classList.add("show");
}
if(state.quizDone){
  quizBox.style.display = "none";
  quizResult.classList.add("show");
}

updateProgress();

})();
