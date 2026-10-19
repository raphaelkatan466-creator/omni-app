const state = {
  username: "Joueur Cyber", userAvatar: "🤖",
  pizzas: 0, clickPower: 1, pizzasPerSec: 0, omniPoints: 100,
  activeSkin: '🍕', unlockedSkins: ['🍕'],
  activeEffect: 'cyan', unlockedEffects: ['cyan'],
  secrets: [], capsules: [], titleClicks: 0, matrixMode: false, raveMode: false, crtMode: false
};

function chargerDonnees() {
  const save = localStorage.getItem("omni_app_full_save");
  if (save) try { Object.assign(state, JSON.parse(save)); } catch(e){}
}
function sauvegarderDonnees() {
  localStorage.setItem("omni_app_full_save", JSON.stringify(state));
}
function reinitialiserTout() {
  if (confirm("⚠️ Es-tu sûr de vouloir supprimer toute ta progression ?")) {
    localStorage.clear();
    window.location.reload(true);
  }
}

// AUDIO DEVERROUILLE AUTOMATIQUEMENT
let audioCtx = null;
function initAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}
window.addEventListener("click", initAudio, { once: true });
window.addEventListener("touchstart", initAudio, { once: true });

function jouerNote(freq, duration = 0.08, vol = 0.1) {
  if (!audioCtx) initAudio();
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(vol, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.start(); osc.stop(audioCtx.currentTime + duration);
  } catch(e){}
}

// MATRIX & RAVE
let matrixCanvas, matrixCtx, matrixInterval;
const matrixChars = "01ABCDEFGHIJKLMNOPQRSTUVWXYZ";
let matrixDrops = [];

function initMatrixEngine() {
  matrixCanvas = document.getElementById("matrix-canvas");
  if (!matrixCanvas) return;
  matrixCtx = matrixCanvas.getContext("2d");
  matrixCanvas.width = window.innerWidth;
  matrixCanvas.height = window.innerHeight;
  const columns = Math.floor(matrixCanvas.width / 16);
  matrixDrops = [];
  for (let i = 0; i < columns; i++) matrixDrops[i] = Math.floor(Math.random() * -50);
}
function drawMatrixFrame() {
  if (!state.matrixMode || !matrixCtx) return;
  matrixCtx.fillStyle = "rgba(0, 0, 0, 0.05)";
  matrixCtx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);
  matrixCtx.fillStyle = "#00ff66";
  matrixCtx.font = "14px monospace";
  for (let i = 0; i < matrixDrops.length; i++) {
    const text = matrixChars.charAt(Math.floor(Math.random() * matrixChars.length));
    matrixCtx.fillText(text, i * 16, matrixDrops[i] * 16);
    if (matrixDrops[i] * 16 > matrixCanvas.height && Math.random() > 0.975) matrixDrops[i] = 0;
    matrixDrops[i]++;
  }
}
function toggleMatrix() {
  state.matrixMode = !state.matrixMode;
  document.body.classList.toggle("matrix-mode", state.matrixMode);
  if (state.matrixMode) {
    initMatrixEngine();
    if (!matrixInterval) matrixInterval = setInterval(drawMatrixFrame, 33);
  } else {
    if (matrixCtx) matrixCtx.clearRect(0, 0, matrixCanvas.width, matrixCanvas.height);
  }
}
function compterClicsTitre() {
  state.titleClicks++;
  if (state.titleClicks >= 5) {
    state.titleClicks = 0;
    toggleMatrix();
    alert("💻 MODE MATRIX ACTIVÉ !");
  }
}

let raveEmojiInterval;
function toggleRaveMode() {
  state.raveMode = !state.raveMode;
  document.body.classList.toggle("rave-active", state.raveMode);
  document.getElementById("rave-btn").innerText = state.raveMode ? "🟢 Mode Rave : ON" : "🔴 Mode Rave : OFF";
}
function toggleCRTMode() {
  state.crtMode = !state.crtMode;
  document.getElementById("crt-overlay").style.display = state.crtMode ? "block" : "none";
}

function changerAvatar() {
  const avatars = ["🤖", "👽", "👑", "🦊", "🥷", "🦁", "👾"];
  state.userAvatar = avatars[(avatars.indexOf(state.userAvatar) + 1 || 0) % avatars.length];
  document.getElementById("profile-avatar").innerText = state.userAvatar;
  sauvegarderDonnees();
}
function sauvegarderProfil() {
  state.username = document.getElementById("username-input").value || "Joueur Cyber";
  sauvegarderDonnees();
}

// CLICKER & BOUTIQUE
function cliquerPizza(e) {
  state.pizzas += state.clickPower;
  rafraichirAffichagePizza();
  sauvegarderDonnees();
  jouerNote(400, 0.05, 0.05);

  const pizzaEl = document.getElementById("pizza-gigante");
  if (pizzaEl) {
    pizzaEl.classList.add("clicked");
    setTimeout(() => pizzaEl.classList.remove("clicked"), 80);
  }
}
function rafraichirAffichagePizza() {
  if (document.getElementById("score-pieces")) document.getElementById("score-pieces").innerText = Math.floor(state.pizzas);
  if (document.getElementById("pieces-par-seconde")) document.getElementById("pieces-par-seconde").innerText = state.pizzasPerSec;
  if (document.getElementById("click-power-display")) document.getElementById("click-power-display").innerText = state.clickPower;
  if (document.getElementById("omni-points-display")) document.getElementById("omni-points-display").innerText = state.omniPoints;
  genererInterfaceBoutique();
}

const OFFRES_BOUTIQUE = [
  { id: 1, name: "Super Clic", cost: 15, power: 1, cps: 0, desc: "+1 par clic" },
  { id: 2, name: "Livreur à Vélo", cost: 50, power: 0, cps: 1, desc: "+1 pizza/sec" },
  { id: 3, name: "Sauce Tomate Premium", cost: 150, power: 2, cps: 0, desc: "+2 par clic" },
  { id: 4, name: "Four à Bois Turbo", cost: 500, power: 0, cps: 5, desc: "+5 pizza/sec" }
];
function genererInterfaceBoutique() {
  const grid = document.getElementById("shop-container");
  if (!grid) return;
  grid.innerHTML = OFFRES_BOUTIQUE.map(item => {
    const canAfford = state.pizzas >= item.cost;
    return `<div class="shop-item ${canAfford ? 'available' : ''}">
      <div><strong>${item.name}</strong><br><small style="color:#94a3b8;">${item.desc}</small><br><span style="color:var(--neon-gold); font-weight:bold;">${item.cost} 🍕</span></div>
      <button class="music-btn" ${canAfford ? '' : 'disabled'} onclick="acheterObjet(${item.id})">Acheter</button>
    </div>`;
  }).join("");
}
function acheterObjet(id) {
  const item = OFFRES_BOUTIQUE.find(i => i.id === id);
  if (item && state.pizzas >= item.cost) {
    state.pizzas -= item.cost;
    state.clickPower += item.power;
    state.pizzasPerSec += item.cps;
    item.cost = Math.floor(item.cost * 1.25);
    rafraichirAffichagePizza();
    sauvegarderDonnees();
  }
}

// CARTES RARES (BOOSTER)
function ouvrirBooster() {
  document.getElementById("booster-container").style.display = "none";
  document.getElementById("cards-selection-container").style.display = "block";
  jouerNote(600, 0.2, 0.1);
}
const cardsList = [
  "🐉 Dragon Cybernétique (Légendaire)",
  "🍕 Pizza Quantique d'Or (Mythique)",
  "⚡ Matrix Hacker (Rare)",
  "🛸 Soucoupe Volante Néon (Épique)"
];
function revelerCarte(id) {
  const card = cardsList[Math.floor(Math.random() * cardsList.length)];
  document.getElementById("cards-selection-container").style.display = "none";
  document.getElementById("card-result").style.display = "block";
  document.getElementById("card-result-name").innerText = "🎉 Tu as obtenu : " + card;
  jouerNote(800, 0.3, 0.2);
}
function reinitialiserBooster() {
  document.getElementById("booster-container").style.display = "block";
  document.getElementById("cards-selection-container").style.display = "none";
  document.getElementById("card-result").style.display = "none";
}

// SIMON SAYS
let simonSeq = [], simonUserStep = 0, simonPlaying = false;
function demarrerSimonGame() {
  simonSeq = [Math.floor(Math.random() * 4)];
  simonUserStep = 0;
  jouerSequenceSimon();
}
function jouerSequenceSimon() {
  simonPlaying = false;
  document.getElementById("simon-status").innerText = "👀 OBSERVE LA SÉQUENCE...";
  let i = 0;
  const interval = setInterval(() => {
    flasherBoutonSimon(simonSeq[i]);
    i++;
    if (i >= simonSeq.length) {
      clearInterval(interval);
      setTimeout(() => { simonPlaying = true; document.getElementById("simon-status").innerText = "👉 À TON TOUR !"; }, 500);
    }
  }, 700);
}
function flasherBoutonSimon(id) {
  const btn = document.getElementById("simon-" + id);
  if(!btn) return;
  btn.style.opacity = "0.3";
  setTimeout(() => { btn.style.opacity = "1"; }, 300);
}
function cliquerSimon(id) {
  if (!simonPlaying) return;
  flasherBoutonSimon(id);
  if (id === simonSeq[simonUserStep]) {
    simonUserStep++;
    if (simonUserStep >= simonSeq.length) {
      simonUserStep = 0;
      simonSeq.push(Math.floor(Math.random() * 4));
      setTimeout(jouerSequenceSimon, 800);
    }
  } else {
    alert("💥 Erreur Simon ! Score : " + (simonSeq.length - 1));
    simonPlaying = false;
    document.getElementById("simon-status").innerText = "🔴 Appuie sur Jouer";
  }
}

// ROBOT IA
function envoyerMessageIA() {
  const input = document.getElementById("ai-user-input");
  const text = input.value.trim();
  if (!text) return;
  const chatBox = document.getElementById("ai-chat-box");
  const userMsg = document.createElement("div");
  userMsg.style.cssText = "background:var(--neon-blue); color:#0f172a; font-weight:bold; padding:8px 12px; border-radius:8px; align-self:flex-end; max-width:80%; font-size:13px;";
  userMsg.innerText = text;
  chatBox.appendChild(userMsg);
  input.value = "";

  setTimeout(() => {
    const aiMsg = document.createElement("div");
    aiMsg.style.cssText = "background:#1e293b; padding:8px 12px; border-radius:8px; align-self:flex-start; max-width:80%; font-size:13px;";
    aiMsg.innerHTML = `🤖 <strong>Cyber-Bot :</strong> J'ai bien analysé "${text}". Tu gères !`;
    chatBox.appendChild(aiMsg);
    chatBox.scrollTop = chatBox.scrollHeight;
  }, 500);
}

// PAPIER BULLE & PIXEL ART
let isSwipingBubble = false;
function initPapierBulle() {
  const container = document.getElementById("bubble-wrap-container");
  if(!container) return;
  container.innerHTML = "";
  for (let i = 0; i < 40; i++) {
    const bubble = document.createElement("div");
    bubble.className = "bubble-item";
    const pop = () => {
      if (!bubble.classList.contains("popped")) {
        bubble.classList.add("popped");
        jouerNote(300, 0.04, 0.1);
      }
    };
    bubble.onmouseover = () => { if (isSwipingBubble) pop(); };
    bubble.onmousedown = pop;
    bubble.ontouchmove = (e) => {
      const touch = e.touches[0];
      const elem = document.elementFromPoint(touch.clientX, touch.clientY);
      if (elem && elem.classList.contains("bubble-item")) {
        elem.classList.add("popped");
        jouerNote(300, 0.04, 0.1);
      }
    };
    container.appendChild(bubble);
  }
}

let currentColor = "#38bdf8";
let isDrawingPixel = false;
const colorsList = ["#38bdf8", "#ef4444", "#22c55e", "#eab308", "#a855f7", "#ec4899", "#ffffff", "#0f172a"];
function initPixelArtPro() {
  const palette = document.getElementById("palette-container");
  if(!palette) return;
  palette.innerHTML = "";
  colorsList.forEach((c, idx) => {
    const swatch = document.createElement("div");
    swatch.className = "color-swatch" + (idx === 0 ? " active" : "");
    swatch.style.background = c;
    if(c === "#0f172a") swatch.style.border = "1px solid #334155";
    swatch.onclick = () => {
      document.querySelectorAll(".color-swatch").forEach(s => s.classList.remove("active"));
      swatch.classList.add("active");
      currentColor = c;
    };
    palette.appendChild(swatch);
  });

  const grid = document.getElementById("pixel-grid");
  if(!grid) return;
  grid.innerHTML = "";
  for (let i = 0; i < 144; i++) {
    const cell = document.createElement("div");
    cell.style.width = "18px"; cell.style.height = "18px";
    cell.style.background = "#1e293b"; cell.style.borderRadius = "2px";
    cell.style.cursor = "pointer";
    const paint = () => { cell.style.background = currentColor; };
    cell.onmousedown = paint;
    cell.onmouseenter = () => { if (isDrawingPixel) paint(); };
    grid.appendChild(cell);
  }
}

// GRAFFITI & CHAT
let gCanvas, gCtx, isDrawing = false;
function initGraffiti() {
  gCanvas = document.getElementById("graffiti-canvas");
  if (!gCanvas) return;
  gCtx = gCanvas.getContext("2d");
  gCtx.strokeStyle = "#38bdf8";
  gCtx.lineWidth = 3;
  gCtx.lineCap = "round";

  const startDraw = (e) => { isDrawing = true; draw(e); };
  const stopDraw = () => { isDrawing = false; gCtx.beginPath(); };
  const draw = (e) => {
    if (!isDrawing) return;
    const rect = gCanvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
    gCtx.lineTo(x, y);
    gCtx.stroke();
    gCtx.beginPath();
    gCtx.moveTo(x, y);
  };

  gCanvas.onmousedown = startDraw; gCanvas.onmouseup = stopDraw; gCanvas.onmousemove = draw;
  gCanvas.ontouchstart = startDraw; gCanvas.ontouchend = stopDraw; gCanvas.ontouchmove = draw;
}
function effacerGraffiti() { if (gCtx) gCtx.clearRect(0, 0, gCanvas.width, gCanvas.height); }

function envoyerChatCommunautaire() {
  const input = document.getElementById("community-input");
  const text = input.value.trim();
  if (!text) return;
  const chatBox = document.getElementById("community-chat-box");
  const msg = document.createElement("div");
  msg.style.cssText = "background:#1e293b; padding:6px 10px; border-radius:6px; font-size:13px;";
  msg.innerHTML = `<strong style="color:#22c55e;">Moi :</strong> ${text}`;
  chatBox.appendChild(msg);
  input.value = "";
  chatBox.scrollTop = chatBox.scrollHeight;
}
function voterHumeur(humeur) { alert(`Humeur enregistrée : ${humeur} !`); }

// CITATIONS & DILEMMES
const aiSubjects = ["L'intelligence artificielle", "La matrice néon", "Le réseau quantique", "La pizza sacrée"];
const aiVerbs = ["illumine", "transcende", "recalibre", "harmonise"];
const aiContexts = ["les réalités virtuelles.", "le futur du Cyber-Espace.", "les possibilités de l'OmniApp."];
function genererCitationIA() {
  const sub = aiSubjects[Math.floor(Math.random() * aiSubjects.length)];
  const verb = aiVerbs[Math.floor(Math.random() * aiVerbs.length)];
  const ctx = aiContexts[Math.floor(Math.random() * aiContexts.length)];
  document.getElementById("citation-display").innerText = `« ${sub} ${verb} ${ctx} »`;
}

const dilemmesIADatabase = [
  { q: "🥐 Quel est le vrai nom sacré de cette viennoiserie ?", o1: "🥐 Pain au Chocolat", o2: "🍫 Chocolatine" },
  { q: "⚡ Quel pouvoir cyberpunk choisis-tu d'incarner ?", o1: "🦅 Voler dans les airs", o2: "👻 Invisibilité totale" },
  { q: "🍔 Que préfères-tu manger gratuitement à vie ?", o1: "🍕 Pizzas à volonté", o2: "🍔 Burgers gastronomiques" }
];
let currentDilemmeIndex = 0;
function chargerDilemmeIA() {
  const d = dilemmesIADatabase[currentDilemmeIndex % dilemmesIADatabase.length];
  if(document.getElementById("dilemme-question")) {
    document.getElementById("dilemme-question").innerText = "⚖️ " + d.q;
    document.getElementById("opt-1").innerText = d.o1;
    document.getElementById("opt-2").innerText = d.o2;
  }
}
function voterDilemme(choix) {
  const p1 = Math.floor(Math.random() * 40) + 30;
  document.getElementById("dilemme-options").style.display = "none";
  document.getElementById("dilemme-resultats").style.display = "block";
  document.getElementById("res-texte").innerHTML = `📊 Résultats :<br><span style="color:var(--neon-blue)">Choix 1 : ${p1}%</span> | <span style="color:var(--neon-gold)">Choix 2 : ${100 - p1}%</span>`;
}
function prochainDilemmeIA() {
  currentDilemmeIndex++;
  document.getElementById("dilemme-options").style.display = "flex";
  document.getElementById("dilemme-resultats").style.display = "none";
  chargerDilemmeIA();
}

// CAPSULES & SECRETS
function creerCapsule() {
  const txt = document.getElementById("capsule-text").value.trim();
  if (!txt) return;
  const delay = parseInt(document.getElementById("capsule-delay").value);
  const unlockTime = Date.now() + delay * 60000;
  state.capsules.push({ text: txt, unlockTime });
  document.getElementById("capsule-text").value = "";
  afficherCapsules();
  sauvegarderDonnees();
  alert("📦 Capsule verrouillée avec succès !");
}
function afficherCapsules() {
  const container = document.getElementById("capsules-list");
  if(!container) return;
  container.innerHTML = state.capsules.map((c) => {
    const locked = Date.now() < c.unlockTime;
    return `<div class="card" style="border-color:${locked ? '#ef4444' : 'var(--neon-green)'};">
      <h4 style="color:${locked ? '#ef4444' : 'var(--neon-green)'};">${locked ? '🔒 Capsule Verrouillée' : '🔓 Capsule Déverrouillée !'}</h4>
      <p>${locked ? '<i>Message scellé... Revenez plus tard !</i>' : c.text}</p>
    </div>`;
  }).join("");
}

function publierSecret() {
  const txt = document.getElementById("secret-input").value.trim();
  if (!txt) return;
  state.secrets.unshift(txt);
  document.getElementById("secret-input").value = "";
  afficherSecrets();
  sauvegarderDonnees();
}
function afficherSecrets() {
  const container = document.getElementById("secrets-list");
  if(!container) return;
  container.innerHTML = state.secrets.map(s => `
    <div class="card" style="border-color:var(--neon-blue);">
      <p style="font-size:16px; margin:0;">🤫 "${s}"</p>
    </div>
  `).join("");
}

function detruireSouciGeant() {
  const textarea = document.getElementById("vent-input");
  if (!textarea || !textarea.value.trim()) return;
  textarea.style.transition = "transform 0.8s ease, opacity 0.8s ease";
  textarea.style.transform = "scale(0) rotate(720deg)";
  textarea.style.opacity = "0";
  setTimeout(() => {
    textarea.value = "";
    textarea.style.transform = "none";
    textarea.style.opacity = "1";
    alert("🌌 Ton souci a été définitivement anéanti dans le néant cosmique !");
  }, 800);
}

// BOUTIQUE COSMÉTIQUE
const SKINS_LIST = [
  { id: '🍕', name: 'Pizza Classique', cost: 0 },
  { id: '👑', name: 'Pizza Royale', cost: 50 },
  { id: '🌌', name: 'Pizza Cosmique', cost: 100 }
];
const EFFECTS_LIST = [
  { id: 'cyan', name: 'Étincelles Cyan', cost: 0 },
  { id: 'fire', name: 'Flammes 🔥', cost: 40 }
];
function genererBoutiqueCosmetique() {
  const grid = document.getElementById("pizza-skins-grid");
  if(grid) {
    grid.innerHTML = SKINS_LIST.map(s => {
      const owned = state.unlockedSkins.includes(s.id);
      return `<div class="cosmetic-card ${owned ? 'owned' : ''}">
        <span style="font-size:45px;">${s.id}</span>
        <h4 style="margin:10px 0 5px 0;">${s.name}</h4>
        <p style="color:var(--neon-gold); font-size:13px; margin:0 0 10px 0;">${s.cost} ⭐</p>
        ${owned ? 
          `<button class="music-btn" onclick="equiperSkin('${s.id}')">${state.activeSkin === s.id ? 'Équipé ✅' : 'Équiper'}</button>` :
          `<button class="btn" style="padding:6px; font-size:13px;" onclick="acheterSkin('${s.id}',${s.cost})">Acheter</button>`
        }
      </div>`;
    }).join("");
  }
}
function acheterSkin(id, cost) {
  if (state.omniPoints >= cost) {
    state.omniPoints -= cost;
    state.unlockedSkins.push(id);
    equiperSkin(id);
    genererBoutiqueCosmetique();
    rafraichirAffichagePizza();
    sauvegarderDonnees();
  } else alert("Points OMNI ⭐ insuffisants !");
}
function equiperSkin(id) {
  state.activeSkin = id;
  const pizzaEl = document.getElementById("pizza-gigante");
  if(pizzaEl) pizzaEl.innerText = id;
  genererBoutiqueCosmetique();
  sauvegarderDonnees();
}

// ROUE XL
let wheelCanvas, wheelCtx;
const rewards = ["+100 ⭐", "Rien... 😢", "+500 🍕", "+10 ⭐", "✨ LÉGENDAIRE", "Rien !"];
function ouvrirGrandeRoue() {
  document.getElementById("wheel-modal").style.display = "flex";
  dessinerRoue();
}
function fermerGrandeRoue() {
  document.getElementById("wheel-modal").style.display = "none";
}
function dessinerRoue() {
  wheelCanvas = document.getElementById("wheel-canvas");
  if(!wheelCanvas) return;
  wheelCtx = wheelCanvas.getContext("2d");
  const numOptions = rewards.length;
  const arcSize = (2 * Math.PI) / numOptions;
  const colors = ["#ef4444", "#38bdf8", "#a855f7", "#eab308", "#22c55e", "#ec4899"];

  wheelCtx.clearRect(0,0,320,320);
  for (let i = 0; i < numOptions; i++) {
    wheelCtx.beginPath();
    wheelCtx.fillStyle = colors[i];
    wheelCtx.moveTo(160, 160);
    wheelCtx.arc(160, 160, 150, i * arcSize, (i + 1) * arcSize);
    wheelCtx.fill();

    wheelCtx.save();
    wheelCtx.translate(160, 160);
    wheelCtx.rotate(i * arcSize + arcSize / 2);
    wheelCtx.fillStyle = "white";
    wheelCtx.font = "bold 13px sans-serif";
    wheelCtx.fillText(rewards[i], 50, 5);
    wheelCtx.restore();
  }
}
let isSpinning = false;
function tournerLaGrandeRoue() {
  if (isSpinning || !wheelCanvas) return;
  isSpinning = true;
  const degrees = Math.floor(3600 + Math.random() * 360);
  wheelCanvas.style.transform = `rotate(${degrees}deg)`;

  setTimeout(() => {
    isSpinning = false;
    state.omniPoints += 50;
    rafraichirAffichagePizza();
    sauvegarderDonnees();
    alert("🎉 Bravo ! Tu a remporté +50 Points OMNI ⭐ !");
    fermerGrandeRoue();
  }, 4000);
}

function switchTab(tabId) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.querySelectorAll(".menu-btn").forEach(b => b.classList.remove("active"));
  const p = document.getElementById("page-" + tabId);
  const b = document.getElementById("btn-" + tabId);
  if(p) p.classList.add("active");
  if(b) b.classList.add("active");
}

window.onload = () => {
  chargerDonnees();
  initMatrixEngine();
  initPapierBulle();
  initPixelArtPro();
  initGraffiti();
  chargerDilemmeIA();
  genererBoutiqueCosmetique();
  afficherCapsules();
  afficherSecrets();
  rafraichirAffichagePizza();
  
  const pizzaEl = document.getElementById("pizza-gigante");
  if(pizzaEl) pizzaEl.innerText = state.activeSkin;
};

window.addEventListener("resize", () => {
  if (matrixCanvas) {
    matrixCanvas.width = window.innerWidth;
    matrixCanvas.height = window.innerHeight;
  }
});

setInterval(() => {
  state.playTimeSeconds = (state.playTimeSeconds || 0) + 1;
  if (state.pizzasPerSec > 0) {
    state.pizzas += state.pizzasPerSec;
    rafraichirAffichagePizza();
  }
  sauvegarderDonnees();
}, 1000);
