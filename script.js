// --- STATE GLOBAL (Valeurs neutres par défaut) ---
const state = {
  username: "Joueur Cyber",
  userAvatar: "🤖",
  userTitle: "👑 Débutant Cyber",
  raveMode: false,
  matrixMode: false,
  titleClicks: 0,
  dilemmeIndex: 0,
  pizzas: 0,
  clickPower: 1,
  pizzasPerSec: 0,
  playTimeSeconds: 0,
  omniPoints: 0,
  feedPosts: [],
  capsules: [],
  secrets: [],
  votedSecrets: [],
  snakeScore: 0,
  isPlaying: false,
  trackIndex: 0,
  currentArcadeGame: 'snake',
  activeSkin: '🍕',
  activeEffectColor: 'cyan',
  activeTheme: 'blue',
  wheelSpunToday: false,
  achievements: {},
  unlockedSkins: ['🍕'],
  unlockedEffects: ['cyan'],
  unlockedThemes: ['blue']
};

// --- RÉINITIALISATION GARANTIE ET COMPLÈTE ---
function reinitialiserTout() {
  const reponse = confirm("⚠️ Es-tu sûr de vouloir supprimer toute ta progression et réinitialiser l'application ?");
  if (reponse) {
    // 1. Suppression de la sauvegarde du navigateur
    localStorage.removeItem("omni_app_full_save");
    localStorage.clear();

    // 2. Remise à zéro forcée de l'objet state
    state.username = "Joueur Cyber";
    state.userAvatar = "🤖";
    state.userTitle = "👑 Débutant Cyber";
    state.pizzas = 0;
    state.clickPower = 1;
    state.pizzasPerSec = 0;
    state.playTimeSeconds = 0;
    state.omniPoints = 0;
    state.feedPosts = [];
    state.capsules = [];
    state.secrets = [];
    state.votedSecrets = [];
    state.snakeScore = 0;
    state.activeSkin = '🍕';
    state.activeEffectColor = 'cyan';
    state.activeTheme = 'blue';
    state.wheelSpunToday = false;
    state.achievements = {};
    state.unlockedSkins = ['🍕'];
    state.unlockedEffects = ['cyan'];
    state.unlockedThemes = ['blue'];

    // 3. Sauvegarde de l'état vierge
    sauvegarderDonnees();

    // 4. Mettre à jour l'affichage avant de recharger
    rafraichirAffichagePizza();

    // 5. Rechargement de la page
    window.location.reload(true);
  }
}

// --- DILEMMES FUNS AVEC VRAIES QUESTIONS & EMOJIS ---
const DILEMMES_BANQUE = [
  { q: "🥐 Quel est le vrai nom de cette viennoiserie ?", o1: "🥐 Pain au Chocolat", o2: "🍫 Chocolatine", p1: 62 },
  { q: "⚡ Quel pouvoir magique tu choisis ?", o1: "🦅 Voler dans les airs", o2: "👻 Être invisible", p1: 48 },
  { q: "🍔 Que préfères-tu manger à vie ?", o1: "🍕 Pizzas à volonté", o2: "🍔 Burgers à volonté", p1: 55 },
  { q: "📱 Quel superpower pour ton téléphone ?", o1: "🔋 Batterie à 100% à vie", o2: "📶 6G Ultra-rapide partout", p1: 71 },
  { q: "⏳ Dans quel temps souhaites-tu voyager ?", o1: "🏛️ Visiter le Passé", o2: "🚀 Explorer le Futur", p1: 43 },
  { q: "🐶 Tu préfères vivre avec quel animal ?", o1: "🐶 10 Chiots mignons", o2: "🐱 10 Chatons câlins", p1: 51 }
];

function chargerDilemmeActuel() {
  const d = DILEMMES_BANQUE[state.dilemmeIndex % DILEMMES_BANQUE.length];
  const qEl = document.getElementById("dilemme-question");
  if (qEl) qEl.innerText = "⚖️ " + d.q;
  const o1 = document.getElementById("opt-1");
  const o2 = document.getElementById("opt-2");
  if (o1) o1.innerText = d.o1;
  if (o2) o2.innerText = d.o2;
}

function voterDilemme(choix) {
  const d = DILEMMES_BANQUE[state.dilemmeIndex % DILEMMES_BANQUE.length];
  document.getElementById("dilemme-options").style.display = "none";
  document.getElementById("dilemme-resultats").style.display = "block";
  document.getElementById("res-texte").innerHTML = `📊 Votes de la communauté :<br><span style="color:#38bdf8">${d.o1} : ${d.p1}%</span><br><span style="color:#eab308">${d.o2} : ${100 - d.p1}%</span>`;
}

function prochainDilemme() {
  state.dilemmeIndex++;
  document.getElementById("dilemme-options").style.display = "flex";
  document.getElementById("dilemme-resultats").style.display = "none";
  chargerDilemmeActuel();
}

// --- ARCADE HUB MULTI-JEUX SANS BUG ---
let arcadeInterval = null;

function switchArcadeGame(game) {
  if (arcadeInterval) clearInterval(arcadeInterval);
  state.currentArcadeGame = game;
  const qte = document.getElementById("qte-container");
  if (qte) qte.style.display = "none";
  
  const canvas = document.getElementById("arcade-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#090d16";
  ctx.fillRect(0, 0, 300, 300);
  
  ctx.fillStyle = "#f8fafc";
  ctx.font = "bold 14px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Jeu sélectionné : " + (game === 'snake' ? '🐍 Snake' : '👾 Invaders'), 150, 150);
  ctx.fillText("Appuie sur 'Lancer la partie' !", 150, 180);
}

function demarrerJeuArcadeActuel() {
  if (arcadeInterval) clearInterval(arcadeInterval);
  const qte = document.getElementById("qte-container");
  if (qte) qte.style.display = "none";
  if (state.currentArcadeGame === 'snake') demarrerSnake();
  else demarrerSpaceInvaders();
}

// CYBER-SNAKE ULTRA-RÉALISTE
function demarrerSnake() {
  const canvas = document.getElementById("arcade-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let snake = [{x: 7, y: 7}, {x: 6, y: 7}, {x: 5, y: 7}];
  let food = {x: 11, y: 7};
  let dx = 0, dy = 0;
  state.snakeScore = 0;

  function drawFrame() {
    ctx.fillStyle = "#090d16";
    ctx.fillRect(0, 0, 300, 300);

    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 300; i += 20) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 300); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(300, i); ctx.stroke();
    }

    const fx = food.x * 20 + 10, fy = food.y * 20 + 10;
    ctx.fillStyle = "#ef4444";
    ctx.beginPath(); ctx.arc(fx, fy + 2, 7, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#fca5a5";
    ctx.beginPath(); ctx.arc(fx - 2, fy, 2, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#15803d"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(fx, fy - 5); ctx.quadraticCurveTo(fx + 4, fy - 10, fx + 6, fy - 8); ctx.stroke();

    snake.forEach((part, idx) => {
      const px = part.x * 20 + 10, py = part.y * 20 + 10;
      if (idx === 0) {
        ctx.fillStyle = "#15803d";
        ctx.beginPath(); ctx.arc(px, py, 9, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#facc15";
        ctx.beginPath(); ctx.arc(px - 3, py - 3, 2.5, 0, Math.PI * 2); ctx.arc(px + 3, py - 3, 2.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#000";
        ctx.beginPath(); ctx.arc(px - 3, py - 3, 1, 0, Math.PI * 2); ctx.arc(px + 3, py - 3, 1, 0, Math.PI * 2); ctx.fill();
      } else {
        ctx.fillStyle = idx % 2 === 0 ? "#16a34a" : "#22c55e";
        ctx.beginPath(); ctx.arc(px, py, 7.5, 0, Math.PI * 2); ctx.fill();
      }
    });
  }

  window.onkeydown = function(e) {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
      if (e.key === "ArrowUp" && dy === 0) { dx = 0; dy = -1; }
      if (e.key === "ArrowDown" && dy === 0) { dx = 0; dy = 1; }
      if (e.key === "ArrowLeft" && dx === 0) { dx = -1; dy = 0; }
      if (e.key === "ArrowRight" && dx === 0) { dx = 1; dy = 0; }
    }
  };

  arcadeInterval = setInterval(() => {
    if (dx === 0 && dy === 0) { drawFrame(); return; }
    const head = {x: snake[0].x + dx, y: snake[0].y + dy};

    if (head.x < 0 || head.x >= 15 || head.y < 0 || head.y >= 15) {
      clearInterval(arcadeInterval);
      alert("🎮 Game Over Snake ! Score : " + state.snakeScore);
      return;
    }

    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
      food = {x: Math.floor(Math.random() * 15), y: Math.floor(Math.random() * 15)};
      state.snakeScore++;
      verifierSucces();
    } else snake.pop();

    drawFrame();
  }, 130);
}

// SPACE INVADERS
function demarrerSpaceInvaders() {
  const canvas = document.getElementById("arcade-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let shipX = 135;
  let bullets = [];
  let enemies = [{x:40, y:30}, {x:100, y:30}, {x:160, y:30}, {x:220, y:30}];

  window.onkeydown = function(e) {
    if (e.key === "ArrowLeft") shipX = Math.max(0, shipX - 15);
    if (e.key === "ArrowRight") shipX = Math.min(270, shipX + 15);
    if (e.key === " ") bullets.push({x: shipX + 12, y: 260});
  };

  arcadeInterval = setInterval(() => {
    ctx.fillStyle = "#090d16"; ctx.fillRect(0, 0, 300, 300);
    ctx.fillStyle = "#38bdf8"; ctx.fillRect(shipX, 270, 30, 15);
    
    bullets.forEach((b, bi) => {
      b.y -= 8;
      ctx.fillStyle = "#eab308"; ctx.fillRect(b.x, b.y, 4, 8);
      enemies.forEach((en, ei) => {
        if (Math.abs(b.x - en.x) < 20 && Math.abs(b.y - en.y) < 20) {
          enemies.splice(ei, 1); bullets.splice(bi, 1); state.pizzas += 500;
        }
      });
    });

    ctx.fillStyle = "#ef4444";
    enemies.forEach(en => ctx.fillRect(en.x, en.y, 20, 15));
    if (!enemies.length) { clearInterval(arcadeInterval); alert("👾 Victoire Space Invaders ! +500 Pizzas"); }
  }, 45);
}

// MINI-JEU QTE HACK
let qteTargetKey = "";
function demarrerQTEHack() {
  if (arcadeInterval) clearInterval(arcadeInterval);
  const keys = ["A", "Z", "E", "R", "T", "Y"];
  qteTargetKey = keys[Math.floor(Math.random() * keys.length)];
  const qte = document.getElementById("qte-container");
  if (qte) qte.style.display = "block";
  const prompt = document.getElementById("qte-prompt");
  if (prompt) prompt.innerText = `⚡ TAPE VITE LA TOUCHE : [ ${qteTargetKey} ]`;
}

window.addEventListener("keydown", (e) => {
  if (qteTargetKey && e.key.toUpperCase() === qteTargetKey) {
    state.pizzas *= 2;
    alert("💥 PIRATAGE RÉUSSI ! Vos pizzas ont été doublées !");
    const qte = document.getElementById("qte-container");
    if (qte) qte.style.display = "none";
    qteTargetKey = "";
    rafraichirAffichagePizza();
  }
});

// --- SHOP COSMÉTIQUE ---
const SKINS_LIST = [{ id: '🍕', name: 'Pizza Classique', cost: 0 }, { id: '👑', name: 'Pizza Dorée', cost: 50 }, { id: '🌌', name: 'Pizza Cosmique', cost: 100 }, { id: '💻', name: 'Pizza Matrix', cost: 150 }];
const EFFECTS_LIST = [{ id: 'cyan', name: 'Cyan & Or', cost: 0 }, { id: 'fire', name: 'Feu Sacré 🔥', cost: 40 }, { id: 'electric', name: 'Électricité ⚡', cost: 80 }];
const THEMES_LIST = [{ id: 'blue', name: 'Cyber Blue', cost: 0 }, { id: 'purple', name: 'Purple Neon', cost: 60 }, { id: 'red', name: 'Red Laser', cost: 100 }];

function genererBoutiqueCosmetique() {
  const skinsG = document.getElementById("pizza-skins-grid");
  const effectsG = document.getElementById("click-effects-grid");
  const themesG = document.getElementById("neon-themes-grid");
  if (!skinsG) return;

  skinsG.innerHTML = SKINS_LIST.map(s => {
    const owned = state.unlockedSkins.includes(s.id);
    const active = state.activeSkin === s.id;
    return `<div class="card" style="text-align:center; padding:10px;"><span style="font-size:30px;">${s.id}</span><br><small>${s.name}</small><br>${owned ? `<button class="music-btn" style="margin-top:5px; width:100%;" onclick="equiperSkin('${s.id}')">${active ? 'Équipé ✅' : 'Équipé'}</button>` : `<button class="music-btn" style="margin-top:5px; width:100%; border-color:#eab308; color:#eab308;" onclick="acheterSkin('${s.id}', ${s.cost})">${s.cost} ⭐</button>`}</div>`;
  }).join("");

  effectsG.innerHTML = EFFECTS_LIST.map(e => {
    const owned = state.unlockedEffects.includes(e.id);
    const active = state.activeEffectColor === e.id;
    return `<div class="card" style="text-align:center; padding:10px;"><small><strong>${e.name}</strong></small><br>${owned ? `<button class="music-btn" style="margin-top:5px; width:100%;" onclick="equiperEffet('${e.id}')">${active ? 'Équipé ✅' : 'Équiper'}</button>` : `<button class="music-btn" style="margin-top:5px; width:100%; border-color:#eab308; color:#eab308;" onclick="acheterEffet('${e.id}', ${e.cost})">${e.cost} ⭐</button>`}</div>`;
  }).join("");

  themesG.innerHTML = THEMES_LIST.map(t => {
    const owned = state.unlockedThemes.includes(t.id);
    const active = state.activeTheme === t.id;
    return `<div class="card" style="text-align:center; padding:10px;"><small><strong>${t.name}</strong></small><br>${owned ? `<button class="music-btn" style="margin-top:5px; width:100%;" onclick="equiperTheme('${t.id}')">${active ? 'Actif ✅' : 'Activer'}</button>` : `<button class="music-btn" style="margin-top:5px; width:100%; border-color:#eab308; color:#eab308;" onclick="acheterTheme('${t.id}', ${t.cost})">${t.cost} ⭐</button>`}</div>`;
  }).join("");
}

function equiperSkin(id) { state.activeSkin = id; document.getElementById("pizza-gigante").innerText = id; genererBoutiqueCosmetique(); sauvegarderDonnees(); }
function acheterSkin(id, cost) { if (state.omniPoints >= cost) { state.omniPoints -= cost; state.unlockedSkins.push(id); equiperSkin(id); } else alert("Points OMNI insuffisants !"); }
function equiperEffet(id) { state.activeEffectColor = id; genererBoutiqueCosmetique(); sauvegarderDonnees(); }
function acheterEffet(id, cost) { if (state.omniPoints >= cost) { state.omniPoints -= cost; state.unlockedEffects.push(id); equiperEffet(id); } else alert("Points OMNI insuffisants !"); }
function equiperTheme(id) { state.activeTheme = id; document.body.className = "theme-" + id; genererBoutiqueCosmetique(); sauvegarderDonnees(); }
function acheterTheme(id, cost) { if (state.omniPoints >= cost) { state.omniPoints -= cost; state.unlockedThemes.push(id); equiperTheme(id); } else alert("Points OMNI insuffisants !"); }

// --- PROFIL & LEADERBOARD ---
const AVATARS = ["🤖", "👽", "👑", "🦊", "🥷", "🦁"];
function changerAvatar() {
  const idx = AVATARS.indexOf(state.userAvatar);
  state.userAvatar = AVATARS[(idx + 1) % AVATARS.length];
  document.getElementById("profile-avatar").innerText = state.userAvatar;
  sauvegarderDonnees();
}

function sauvegarderProfil() {
  const input = document.getElementById("username-input");
  state.username = input ? (input.value || "Joueur Cyber") : "Joueur Cyber";
  const userTag = document.getElementById("user-title-tag");
  if (userTag) userTag.innerText = `${state.username} — ${state.userTitle}`;
  sauvegarderDonnees();
  afficherLeaderboard();
}

function afficherLeaderboard() {
  const list = document.getElementById("leaderboard-list");
  if (!list) return;
  const rank = [
    { name: state.username, score: Math.floor(state.pizzas), avatar: state.userAvatar, isMe: true },
    { name: "Sora_Cyber", score: 150000, avatar: "🦊" },
    { name: "Neo_Matrix", score: 98000, avatar: "🥷" },
    { name: "Luna_Néon", score: 45000, avatar: "💎" }
  ];
  rank.sort((a, b) => b.score - a.score);
  list.innerHTML = rank.map((r, i) => `
    <li style="display:flex; justify-content:space-between; padding:8px; border-bottom:1px solid #334155; ${r.isMe ? 'color:#38bdf8; font-weight:bold;' : ''}">
      <span>#${i+1} ${r.avatar} ${r.name}</span>
      <span>${r.score.toLocaleString()} 🍕</span>
    </li>
  `).join("");
}

// --- 100 SUCCÈS ---
const ACHIEVEMENTS_LIST = [];
for (let i = 1; i <= 25; i++) {
  ACHIEVEMENTS_LIST.push({ id: 'pizza_' + i, title: `🍕 Maître Pizzaiolo #${i}`, desc: `Atteindre ${i * 1000} pizzas.`, points: i <= 5 ? 6 : 10, check: () => state.pizzas >= i * 1000 });
}
for (let i = 26; i <= 50; i++) {
  ACHIEVEMENTS_LIST.push({ id: 'time_' + i, title: `⏱️ Vétéran OMNI #${i-25}`, desc: `Passer ${(i-25)*5} minutes en jeu.`, points: 10, check: () => state.playTimeSeconds >= (i-25)*300 });
}
for (let i = 51; i <= 75; i++) {
  ACHIEVEMENTS_LIST.push({ id: 'snake_' + i, title: `🐍 Serpent Cyber #${i-50}`, desc: `Score Snake de ${i-50} pommes.`, points: 15, check: () => state.snakeScore >= (i-50) });
}
for (let i = 76; i <= 95; i++) {
  ACHIEVEMENTS_LIST.push({ id: 'secret_' + i, title: `🏝️ Gardien des Secrets #${i-75}`, desc: `Poster/Voter ${i-75} secrets.`, points: 20, check: () => (state.secrets.length + state.votedSecrets.length) >= (i-75) });
}
for (let i = 96; i <= 100; i++) {
  ACHIEVEMENTS_LIST.push({ id: 'hidden_' + i, title: `❓ Succès Secret #${i-95}`, desc: `??? (Découvre le mystère)`, points: 50, check: () => state.titleClicks >= 3 && i === 96 });
}

function verifierSucces() {
  ACHIEVEMENTS_LIST.forEach(a => {
    if (!state.achievements[a.id] && a.check && a.check()) {
      debloquerSucces(a.id, a.points, a.title);
    }
  });
  afficherSucces();
}

function debloquerSucces(id, pts, title) {
  if (!state.achievements[id]) {
    state.achievements[id] = true;
    state.omniPoints += pts;
    alert(`🏆 SUCCÈS DÉBLOQUÉ : ${title}\n+${pts} Points OMNI !`);
    sauvegarderDonnees();
  }
}

function afficherSucces() {
  const container = document.getElementById("achievements-grid");
  const counter = document.getElementById("trophy-count");
  if (!container) return;
  let unlockedCount = 0;
  container.innerHTML = "";
  ACHIEVEMENTS_LIST.forEach(a => {
    const unlocked = !!state.achievements[a.id];
    if (unlocked) unlockedCount++;
    const div = document.createElement("div"); div.className = "card";
    div.style.border = unlocked ? "1px solid #22c55e" : "1px solid #334155";
    div.style.opacity = unlocked ? "1" : "0.55"; div.style.marginTop = "0";
    div.innerHTML = `<h4 style="margin:0 0 5px 0; color:${unlocked ? '#4ade80' : '#f8fafc'};">${unlocked ? '✅' : '🔒'} ${a.title}</h4><p style="font-size:12px; color:#94a3b8; margin:0;">${a.desc} <span style="color:#eab308; float:right;">+${a.points}pts</span></p>`;
    container.appendChild(div);
  });
  if (counter) counter.innerText = `${unlockedCount} / 100`;
}

// --- BOUTIQUE DE PRODUCTION (22 ITEMS) ---
const OFFRES_BOUTIQUE = [
  { id: 1, name: "Super Clic", cost: 15, power: 1, cps: 0, desc: "+1 par clic" },
  { id: 2, name: "Livreur à Vélo", cost: 50, power: 0, cps: 1, desc: "+1 pizza/sec" },
  { id: 3, name: "Sauce Tomate Premium", cost: 150, power: 2, cps: 0, desc: "+2 par clic" },
  { id: 4, name: "Four à Bois Turbo", cost: 500, power: 0, cps: 5, desc: "+5 pizza/sec" },
  { id: 5, name: "Fromage Connecté", cost: 1200, power: 5, cps: 0, desc: "+5 par clic" },
  { id: 6, name: "Scooter Électrique", cost: 3000, power: 0, cps: 20, desc: "+20 pizza/sec" },
  { id: 7, name: "Pétrisseur Automatique", cost: 7500, power: 15, cps: 0, desc: "+15 par clic" },
  { id: 8, name: "Pizzeria de Quartier", cost: 16000, power: 0, cps: 75, desc: "+75 pizza/sec" },
  { id: 9, name: "Huile Piquante Quantique", cost: 35000, power: 50, cps: 0, desc: "+50 par clic" },
  { id: 10, name: "Drone de Livraison AI", cost: 85000, power: 0, cps: 250, desc: "+250 pizza/sec" },
  { id: 11, name: "Farine d'Or Lunaire", cost: 200000, power: 150, cps: 0, desc: "+150 par clic" },
  { id: 12, name: "Usine Automatisée", cost: 500000, power: 0, cps: 1000, desc: "+1000 pizza/sec" },
  { id: 13, name: "Ananas Cybernétique", cost: 1200000, power: 500, cps: 0, desc: "+500 par clic" },
  { id: 14, name: "Cargo Interspatial", cost: 3000000, power: 0, cps: 4500, desc: "+4500 pizza/sec" },
  { id: 15, name: "Épice du Néant", cost: 8000000, power: 2000, cps: 0, desc: "+2000 par clic" },
  { id: 16, name: "Trou Noir à Cuisson", cost: 20000000, power: 0, cps: 18000, desc: "+18000 pizza/sec" },
  { id: 17, name: "Graine de Tomate Sacrée", cost: 55000000, power: 7500, cps: 0, desc: "+7500 par clic" },
  { id: 18, name: "Matrice Moléculaire", cost: 150000000, power: 0, cps: 65000, desc: "+65000 pizza/sec" },
  { id: 19, name: "Passeport Multidimensionnel", cost: 450000000, power: 25000, cps: 0, desc: "+25000 par clic" },
  { id: 20, name: "Secte Croûte Éternelle", cost: 1200000000, power: 0, cps: 250000, desc: "+250k pizza/sec" },
  { id: 21, name: "Matière Sombre Fromagère", cost: 4000000000, power: 100000, cps: 0, desc: "+100k par clic" },
  { id: 22, name: "Dieu Suprême de la Pizza", cost: 15000000000, power: 500000, cps: 1000000, desc: "God Mode Pizza" }
];

function genererInterfaceBoutique() {
  const grid = document.getElementById("shop-container");
  if (!grid) return;
  grid.innerHTML = OFFRES_BOUTIQUE.map(item => {
    const canAfford = state.pizzas >= item.cost;
    return `<div class="shop-item ${canAfford ? 'available' : 'locked'}">
      <div><strong>${item.name}</strong><br><small style="color:#94a3b8;">${item.desc}</small><br><span style="color:#eab308; font-weight:bold;">${item.cost} 🍕</span></div>
      <button class="music-btn" ${canAfford ? '' : 'disabled'} onclick="acheterObjet(${item.id})">Acheter</button>
    </div>`;
  }).join("");
}

function acheterObjet(id) {
  const item = OFFRES_BOUTIQUE.find(i => i.id === id);
  if (item && state.pizzas >= item.cost) {
    state.pizzas -= item.cost; state.clickPower += item.power; state.pizzasPerSec += item.cps;
    item.cost = Math.floor(item.cost * 1.2);
    genererInterfaceBoutique(); rafraichirAffichagePizza(); sauvegarderDonnees();
  }
}

// --- PIZZA CLICKER ---
function cliquerPizza(e) {
  state.pizzas += state.clickPower;
  rafraichirAffichagePizza();
  verifierSucces();

  const pizzaEl = document.getElementById("pizza-gigante");
  const container = document.getElementById("pizza-container");
  if (pizzaEl && container) {
    pizzaEl.classList.add("clicked");
    setTimeout(() => pizzaEl.classList.remove("clicked"), 80);

    const floating = document.createElement("div");
    floating.className = "floating-text";
    floating.innerText = "+" + state.clickPower;
    const rect = container.getBoundingClientRect();
    floating.style.left = (e.clientX - rect.left) + "px";
    floating.style.top = (e.clientY - rect.top) + "px";
    container.appendChild(floating);
    setTimeout(() => floating.remove(), 600);

    let colors = ["#38bdf8", "#eab308"];
    if (state.activeEffectColor === 'fire') colors = ["#ef4444", "#f97316"];
    if (state.activeEffectColor === 'electric') colors = ["#a855f7", "#38bdf8"];

    for (let i = 0; i < 10; i++) {
      const sp = document.createElement("div");
      sp.className = "pizza-sparkle";
      const angle = Math.random() * Math.PI * 2;
      const dist = 35 + Math.random() * 55;
      sp.style.setProperty("--dx", Math.cos(angle) * dist + "px");
      sp.style.setProperty("--dy", Math.sin(angle) * dist + "px");
      sp.style.left = (rect.width / 2) + "px"; sp.style.top = (rect.height / 2) + "px";
      sp.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      container.appendChild(sp);
      setTimeout(() => sp.remove(), 500);
    }
  }
  sauvegarderDonnees();
}

function rafraichirAffichagePizza() {
  const pScore = document.getElementById("score-pieces");
  if (pScore) pScore.innerText = Math.floor(state.pizzas);
  const pPps = document.getElementById("pieces-par-seconde");
  if (pPps) pPps.innerText = state.pizzasPerSec;
  const pCpd = document.getElementById("click-power-display");
  if (pCpd) pCpd.innerText = state.clickPower;
  const pOmni = document.getElementById("omni-points-display");
  if (pOmni) pOmni.innerText = state.omniPoints + " pts";
  genererInterfaceBoutique();
  afficherLeaderboard();
}

// --- ROUE OMNI ---
function tournerLaRoue() {
  if (state.wheelSpunToday) { alert("Tu as déjà tourné la roue aujourd'hui !"); return; }
  const el = document.getElementById("wheel-graphic");
  if (el) el.style.transform = "rotate(" + (1800 + Math.random() * 360) + "deg)";
  setTimeout(() => {
    state.wheelSpunToday = true;
    state.omniPoints += 25;
    alert("🎉 BRAVO ! Tu gagnes +25 Points OMNI ⭐ !");
    sauvegarderDonnees();
  }, 3000);
}

// --- AUDIO ---
let audioCtx = null, musicInterval = null, noteIndex = 0;
const TRACK_LIST = [
  { name: "🎵 Track 1: Midnight Cyber Drive", scale: [220, 246.94, 261.63, 293.66, 329.63, 392.00, 440] },
  { name: "🌆 Track 2: Neon Sunset Lo-Fi", scale: [174.61, 196.00, 220.00, 261.63, 293.66, 329.63] }
];

function togglePlayPause() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  state.isPlaying = !state.isPlaying;
  const btn = document.getElementById("play-pause-btn");
  if (state.isPlaying) {
    if (btn) btn.innerText = "⏸️ Pause";
    if (musicInterval) clearInterval(musicInterval);
    musicInterval = setInterval(() => {
      const track = TRACK_LIST[state.trackIndex];
      const freq = track.scale[noteIndex % track.scale.length];
      jouerNote(freq, 'sawtooth', 0.3, 0.04);
      noteIndex++;
      dessinerVisualiseur();
    }, 250);
  } else {
    if (btn) btn.innerText = "▶️ Play";
    if (musicInterval) clearInterval(musicInterval);
  }
}

function jouerNote(freq, type, duration, vol) {
  try {
    const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain();
    osc.type = type; osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(vol, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.start(); osc.stop(audioCtx.currentTime + duration);
  } catch(e){}
}

function dessinerVisualiseur() {
  const canvas = document.getElementById("audio-visualizer-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#38bdf8";
  for (let i = 0; i < 40; i++) {
    const h = Math.random() * 20 + 2;
    ctx.fillRect(i * 20, 25 - h, 12, h);
  }
}

function musiqueSuivante() { state.trackIndex = (state.trackIndex + 1) % TRACK_LIST.length; document.getElementById("track-title").innerText = TRACK_LIST[state.trackIndex].name; }
function musiquePrecedente() { state.trackIndex = (state.trackIndex - 1 + TRACK_LIST.length) % TRACK_LIST.length; document.getElementById("track-title").innerText = TRACK_LIST[state.trackIndex].name; }

// DÉFIS & SECRETS
function publierDefi() {
  const caption = document.getElementById("dare-caption").value;
  const fileInput = document.getElementById("dare-file");
  if (fileInput.files && fileInput.files[0]) {
    const reader = new FileReader();
    reader.onload = function(e) {
      state.feedPosts.unshift({ img: e.target.result, text: caption, likes: 0 });
      document.getElementById("dare-caption").value = ""; fileInput.value = "";
      afficherFeed(); sauvegarderDonnees();
    };
    reader.readAsDataURL(fileInput.files[0]);
  }
}

function afficherFeed() {
  const container = document.getElementById("feed-container");
  if (!container) return;
  container.innerHTML = state.feedPosts.map((post, idx) => `
    <div class="card">
      <p style="margin:0; font-weight:bold;">📸 Soumission de Défi</p>
      <img src="${post.img}" style="max-width:100%; border-radius:8px; margin-top:10px;">
      <p style="margin:5px 0;">${post.text}</p>
      <button onclick="likePost(${idx})" class="music-btn">❤️ ${post.likes}</button>
    </div>
  `).join("");
}

function likePost(idx) { state.feedPosts[idx].likes++; afficherFeed(); sauvegarderDonnees(); }

function detruireSouci() {
  const txt = document.getElementById("vent-input");
  if (!txt || !txt.value.trim()) return;
  txt.classList.add("blackhole-anim");
  setTimeout(() => { txt.value = ""; txt.classList.remove("blackhole-anim"); alert("🌌 Souci aspiré !"); }, 1500);
}

function publierSecret() {
  const txt = document.getElementById("secret-input").value;
  if (!txt.trim()) return;
  state.secrets.push({ id: Date.now(), text: txt, score: 3 });
  document.getElementById("secret-input").value = ""; afficherSecrets(); sauvegarderDonnees();
}

function afficherSecrets() {
  const container = document.getElementById("secrets-list");
  if (!container) return;
  container.innerHTML = "";
  state.secrets = state.secrets.filter(s => s.score > 0);
  state.secrets.forEach(s => {
    const hasVoted = state.votedSecrets.includes(s.id);
    const div = document.createElement("div"); div.className = "card";
    div.style.display = "flex"; div.style.justifyContent = "space-between"; div.style.alignItems = "center";
    div.innerHTML = `<div><p style="margin:0;">"${s.text}"</p><small style="color:#94a3b8;">Score : ${s.score}/5</small></div><div><button class="music-btn" ${hasVoted ? 'disabled' : ''} onclick="voterSecret(${s.id}, 1)">👍</button><button class="music-btn" style="border-color:#ef4444; color:#ef4444;" ${hasVoted ? 'disabled' : ''} onclick="voterSecret(${s.id}, -1)">👎</button></div>`;
    container.appendChild(div);
  });
}

function voterSecret(id, delta) {
  if (state.votedSecrets.includes(id)) return;
  const secret = state.secrets.find(s => s.id === id);
  if (secret) { secret.score += delta; state.votedSecrets.push(id); afficherSecrets(); sauvegarderDonnees(); }
}

function creerCapsule() {
  const text = document.getElementById("capsule-text").value;
  const minutes = parseInt(document.getElementById("capsule-delay").value);
  if (!text.trim()) return;
  state.capsules.push({ text, unlockTime: Date.now() + minutes * 60000 });
  document.getElementById("capsule-text").value = ""; afficherCapsules(); sauvegarderDonnees();
}

function afficherCapsules() {
  const container = document.getElementById("capsules-list");
  if (!container) return;
  container.innerHTML = "";
  const now = Date.now();
  state.capsules.forEach(cap => {
    const isUnlocked = now >= cap.unlockTime;
    const div = document.createElement("div"); div.className = "card";
    div.innerHTML = isUnlocked ? `<p style="color:#22c55e; font-weight:bold;">🔓 Déverrouillée :</p><p>${cap.text}</p>` : `<p style="color:#eab308; font-weight:bold;">🔒 Verrouillée</p><p>Dans : ${Math.max(0, Math.ceil((cap.unlockTime - now) / 1000))}s</p>`;
    container.appendChild(div);
  });
}

// MATRIX & RAVE
let keyBuffer = "";
window.addEventListener("keydown", (e) => {
  keyBuffer += e.key.toLowerCase();
  if (keyBuffer.length > 10) keyBuffer = keyBuffer.slice(-10);
  if (keyBuffer.includes("hacker")) basculerMatrixMode();
});

function compterClicsTitre() {
  state.titleClicks++;
  if (state.titleClicks >= 5) { state.titleClicks = 0; basculerMatrixMode(); }
}

function basculerMatrixMode() {
  state.matrixMode = !state.matrixMode;
  document.body.classList.toggle("matrix-mode", state.matrixMode);
  if (state.matrixMode) lancerPluieMatrix();
}

function lancerPluieMatrix() {
  const canvas = document.getElementById("matrix-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth; canvas.height = window.innerHeight;
  const chars = "01010101OMNIAPPKATANMATRIX987654321";
  const fontSize = 14; const columns = Math.floor(canvas.width / fontSize);
  const drops = Array(columns).fill(1);

  function draw() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.05)"; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#22c55e"; ctx.font = fontSize + "px monospace";
    drops.forEach((y, i) => {
      const text = chars[Math.floor(Math.random() * chars.length)];
      ctx.fillText(text, i * fontSize, y * fontSize);
      if (y * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    });
    if (state.matrixMode) requestAnimationFrame(draw);
  }
  draw();
}

let emojiInterval = null;
function toggleRaveMode() {
  state.raveMode = !state.raveMode;
  const layer = document.getElementById("rave-background-layer");
  if (layer) layer.classList.toggle("active", state.raveMode);
  const btn = document.getElementById("rave-btn");
  if (btn) btn.innerText = state.raveMode ? "🟢 Mode Rave : ON" : "🔴 Mode Rave : OFF";
  if (state.raveMode) {
    emojiInterval = setInterval(() => {
      const container = document.getElementById("rave-emoji-container");
      if (!container) return;
      const list = ["🍕", "🎧", "🚀", "💎", "⚡", "🔥", "✨", "👑", "💖"];
      for (let k = 0; k < 3; k++) {
        const el = document.createElement("div"); el.className = "rave-emoji";
        el.innerText = list[Math.floor(Math.random() * list.length)];
        el.style.left = Math.random() * 100 + "vw";
        container.appendChild(el);
        setTimeout(() => el.remove(), 3000);
      }
    }, 150);
  } else {
    if (emojiInterval) clearInterval(emojiInterval);
    const container = document.getElementById("rave-emoji-container");
    if (container) container.innerHTML = "";
  }
}

// NAVIGATION & SAUVEGARDE
function switchTab(tabId) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.querySelectorAll(".menu-btn").forEach(b => b.classList.remove("active"));
  const p = document.getElementById("page-" + tabId);
  const b = document.getElementById("btn-" + tabId);
  if (p) p.classList.add("active");
  if (b) b.classList.add("active");
}

function chargerDonnees() {
  const save = localStorage.getItem("omni_app_full_save");
  if (save) {
    try { Object.assign(state, JSON.parse(save)); } catch(e){}
  }
}

function sauvegarderDonnees() {
  localStorage.setItem("omni_app_full_save", JSON.stringify(state));
}

window.addEventListener("load", () => {
  chargerDonnees();
  const input = document.getElementById("username-input");
  if (input) input.value = state.username;
  const avatar = document.getElementById("profile-avatar");
  if (avatar) avatar.innerText = state.userAvatar;
  const pGiga = document.getElementById("pizza-gigante");
  if (pGiga) pGiga.innerText = state.activeSkin;
  const userTag = document.getElementById("user-title-tag");
  if (userTag) userTag.innerText = `${state.username} — ${state.userTitle}`;
  if (state.activeTheme !== 'blue') document.body.className = "theme-" + state.activeTheme;

  chargerDilemmeActuel();
  genererInterfaceBoutique(); genererBoutiqueCosmetique();
  afficherCapsules(); afficherSecrets(); afficherFeed();
  afficherSucces(); rafraichirAffichagePizza();
});

setInterval(() => {
  state.playTimeSeconds++;
  const playTime = document.getElementById("play-time-display");
  if (playTime) playTime.innerText = state.playTimeSeconds + "s";
  if (state.playTimeSeconds % 60 === 0) state.omniPoints += 1;
  if (state.pizzasPerSec > 0) { state.pizzas += state.pizzasPerSec; rafraichirAffichagePizza(); }
  verifierSucces(); afficherCapsules(); sauvegarderDonnees();
}, 1000);