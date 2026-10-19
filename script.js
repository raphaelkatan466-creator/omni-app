// --- STATE GLOBAL (Inclus les 21 nouveautés) ---
const state = {
  username: "Joueur Cyber",
  userAvatar: "🤖",
  userTitle: "👑 Débutant Cyber",
  raveMode: false,
  matrixMode: false,
  crtMode: false,
  titleClicks: 0,
  dilemmeIndex: 0,
  pizzas: 0,
  clickPower: 1,
  pizzasPerSec: 0,
  playTimeSeconds: 0,
  omniPoints: 0,
  quantiquePoints: 0,
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
  unlockedThemes: ['blue'],
  userCards: [],
  skills: { clickBoost: 0, autoBoost: 0, luckBoost: 0 },
  pets: { robot: { level: 1, active: true }, dragon: { level: 0, active: false } },
  humeurVotes: { super: 12, cool: 18, fatigue: 5 }
};

// --- RÉINITIALISATION GARANTIE ---
function reinitialiserTout() {
  const reponse = confirm("⚠️ Es-tu sûr de vouloir supprimer toute ta progression et réinitialiser l'application ?");
  if (reponse) {
    localStorage.removeItem("omni_app_full_save");
    localStorage.clear();

    state.username = "Joueur Cyber";
    state.userAvatar = "🤖";
    state.userTitle = "👑 Débutant Cyber";
    state.pizzas = 0;
    state.clickPower = 1;
    state.pizzasPerSec = 0;
    state.playTimeSeconds = 0;
    state.omniPoints = 0;
    state.quantiquePoints = 0;
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
    state.userCards = [];
    state.skills = { clickBoost: 0, autoBoost: 0, luckBoost: 0 };

    sauvegarderDonnees();
    rafraichirAffichagePizza();
    window.location.reload(true);
  }
}

// --- FILTRE CRT & EVENEMENTS HAPPY HOUR ---
function toggleCRTMode() {
  state.crtMode = !state.crtMode;
  document.getElementById("crt-overlay").style.display = state.crtMode ? "block" : "none";
}

function verifierHappyHour() {
  const now = new Date();
  const isHappy = (now.getHours() === 18);
  const banner = document.getElementById("happy-hour-banner");
  if (banner) banner.style.display = isHappy ? "block" : "none";
  return isHappy ? 5 : 1;
}

// --- SYSTEME DE PRESTIGE (PIZZAS QUANTIK) ---
function effectuerPrestige() {
  if (state.pizzas < 1000000) {
    alert("Tu as besoin d'au moins 1 000 000 de Pizzas pour effectuer une Renaissance !");
    return;
  }
  if (confirm("✨ Voulez-vous réinitialiser vos pizzas en échange de Pizzas Quantiques permanentes ?")) {
    const gagne = Math.floor(state.pizzas / 1000000);
    state.quantiquePoints += gagne;
    state.pizzas = 0;
    state.clickPower = 1 + state.quantiquePoints * 2;
    state.pizzasPerSec = 0;
    alert(`🎉 RENAISSANCE RÉUSSIE ! Tu as gagné +${gagne} Pizzas Quantiques !`);
    sauvegarderDonnees();
    rafraichirAffichagePizza();
  }
}

// --- PAQUETS DE CARTES RARES ---
const CARTE_BANQUE = [
  { id: 'c1', name: 'Pizza Originelle', rarity: 'Commune', icon: '🍕', color: '#94a3b8' },
  { id: 'c2', name: 'Livreur Vélo-Laser', rarity: 'Rare', icon: '🚴‍♂️', color: '#38bdf8' },
  { id: 'c3', name: 'Drone Matrice AI', rarity: 'Épique', icon: '🛸', color: '#a855f7' },
  { id: 'c4', name: 'Dieu de la Croûte', rarity: 'Légendaire', icon: '👑', color: '#eab308' },
  { id: 'c5', name: 'Trou Noir Fromager', rarity: 'OMNI', icon: '🌌', color: '#f472b6' }
];

function ouvrirBooster() {
  if (state.omniPoints < 100) {
    alert("Il te faut 100 Points OMNI ⭐ pour ouvrir un paquet !");
    return;
  }
  state.omniPoints -= 100;
  const rand = Math.random();
  let card = CARTE_BANQUE[0];
  if (rand < 0.50) card = CARTE_BANQUE[0];
  else if (rand < 0.75) card = CARTE_BANQUE[1];
  else if (rand < 0.90) card = CARTE_BANQUE[2];
  else if (rand < 0.98) card = CARTE_BANQUE[3];
  else card = CARTE_BANQUE[4];

  if (!state.userCards) state.userCards = [];
  state.userCards.push(card.id);
  alert(`🎉 BOOSTER OUVERT !\nObtenu : ${card.icon} ${card.name} (${card.rarity})`);
  afficherGalerieCartes();
  sauvegarderDonnees();
  rafraichirAffichagePizza();
}

function afficherGalerieCartes() {
  const g = document.getElementById("cards-gallery");
  if (!g) return;
  if (!state.userCards) state.userCards = [];
  g.innerHTML = CARTE_BANQUE.map(c => {
    const count = state.userCards.filter(id => id === c.id).length;
    return `
      <div class="card" style="text-align:center; border: 2px solid ${c.color}; opacity: ${count > 0 ? 1 : 0.4};">
        <span style="font-size:35px;">${c.icon}</span>
        <h4 style="margin:5px 0; color:${c.color}; font-size:13px;">${c.name}</h4>
        <small style="color:#94a3b8;">${c.rarity}</small><br>
        <span style="font-weight:bold; color:white;">x${count}</span>
      </div>
    `;
  }).join("");
}

// --- ARBRE DE COMPÉTENCES ---
function afficherArbreCompetences() {
  const container = document.getElementById("skill-tree-container");
  if (!container) return;
  container.innerHTML = `
    <div class="card" style="text-align:center;">
      <h4>💥 Multiplicateur Clics</h4>
      <p>Niveau : ${state.skills.clickBoost}</p>
      <button class="music-btn" onclick="ameliorerSkill('clickBoost')">Améliorer (10 pts OMNI)</button>
    </div>
    <div class="card" style="text-align:center;">
      <h4>⚙️ Automatisation Turbo</h4>
      <p>Niveau : ${state.skills.autoBoost}</p>
      <button class="music-btn" onclick="ameliorerSkill('autoBoost')">Améliorer (15 pts OMNI)</button>
    </div>
  `;
}

function ameliorerSkill(type) {
  if (state.omniPoints >= 10) {
    state.omniPoints -= 10;
    state.skills[type]++;
    if (type === 'clickBoost') state.clickPower += 2;
    if (type === 'autoBoost') state.pizzasPerSec += 5;
    afficherArbreCompetences();
    rafraichirAffichagePizza();
    sauvegarderDonnees();
  } else alert("Points OMNI insuffisants !");
}

// --- FAMILIERS ---
function afficherFamiliers() {
  const container = document.getElementById("pets-container");
  if (!container) return;
  container.innerHTML = `
    <div class="card" style="text-align:center;">
      <span style="font-size:40px;">🤖</span>
      <h4>Robo-Pizza Companion</h4>
      <p>Niveau : ${state.pets.robot.level}</p>
      <button class="music-btn" onclick="nourrirFamilier('robot')">Nourrir (50 Pizzas)</button>
    </div>
  `;
}

function nourrirFamilier(pet) {
  if (state.pizzas >= 50) {
    state.pizzas -= 50;
    state.pets[pet].level++;
    state.pizzasPerSec += 2;
    afficherFamiliers();
    rafraichirAffichagePizza();
    sauvegarderDonnees();
  }
}

// --- CREATIF & SATISFAISANT (PAPIER BULLE, PIXEL ART, CITATIONS) ---
function initPapierBulle() {
  const grid = document.getElementById("bubble-wrap-container");
  if (!grid || grid.children.length > 0) return;
  for (let i = 0; i < 32; i++) {
    const b = document.createElement("button");
    b.className = "music-btn";
    b.innerText = "⚪";
    b.onclick = () => {
      b.innerText = "💥";
      b.disabled = true;
      jouerNote(600 + Math.random() * 200, 'sine', 0.05, 0.1);
    };
    grid.appendChild(b);
  }
}

function initPixelArt() {
  const grid = document.getElementById("pixel-grid");
  if (!grid || grid.children.length > 0) return;
  const colors = ["#38bdf8", "#ef4444", "#22c55e", "#eab308", "#a855f7"];
  for (let i = 0; i < 100; i++) {
    const cell = document.createElement("div");
    cell.style.width = "20px"; cell.style.height = "20px";
    cell.style.background = "#1e293b"; cell.style.border = "1px solid #0f172a";
    cell.onclick = () => {
      cell.style.background = colors[Math.floor(Math.random() * colors.length)];
      jouerNote(300 + Math.random() * 300, 'square', 0.05, 0.05);
    };
    grid.appendChild(cell);
  }
}

const CITATIONS = [
  "« Le futur appartient à ceux qui croient à la magie des pizzas. »",
  "« Dans la matrice néon, seul le code et la passion demeurent. »",
  "« Un clic aujourd'hui est une galaxie demain. »"
];

function genererCitation() {
  const c = CITATIONS[Math.floor(Math.random() * CITATIONS.length)];
  document.getElementById("citation-display").innerText = c;
}

// --- COMMUNAUTÉ & INTERACTION ---
function voterHumeur(type) {
  alert(`Merci d'avoir partagé ton humeur : ${type} !`);
  document.getElementById("humeur-stats").innerText = "Météo globale : 85% de la communauté est en forme 🔥 !";
}

function genererPseudoCyber() {
  const prefixes = ["Néon", "Cyber", "Vortex", "Matrix", "Quantum", "Shadow"];
  const suffixes = ["Phénix", "Rider", "Hacker", "Viper", "Titan", "Pizzaiolo"];
  const num = Math.floor(Math.random() * 99) + 1;
  const res = prefixes[Math.floor(Math.random() * prefixes.length)] + "_" + suffixes[Math.floor(Math.random() * suffixes.length)] + "_" + num;
  document.getElementById("pseudo-generated").innerText = res;
}

function envoyerLettre() {
  const txt = document.getElementById("letter-input").value;
  if (!txt.trim()) return;
  document.getElementById("letter-input").value = "";
  document.getElementById("received-letter").innerText = "📩 Lettre reçue du cosmos : « Garde le sourire et continue de créer des choses formidables ! »";
}

// --- ARCADE HUB (EXTENSION MULTI-JEUX) ---
let arcadeInterval = null;

function switchArcadeGame(game) {
  if (arcadeInterval) clearInterval(arcadeInterval);
  state.currentArcadeGame = game;
  document.getElementById("typer-display").style.display = game === 'typer' ? "block" : "none";
  document.getElementById("memory-grid").style.display = game === 'memory' ? "grid" : "none";
  document.getElementById("simon-grid").style.display = game === 'simon' ? "grid" : "none";
  document.getElementById("arcade-canvas").style.display = ['snake','invaders','flappy','breaker'].includes(game) ? "inline-block" : "none";
  
  if (game === 'memory') initMemoryGame();
  if (game === 'simon') initSimonGame();
}

function demarrerJeuArcadeActuel() {
  if (arcadeInterval) clearInterval(arcadeInterval);
  if (state.currentArcadeGame === 'snake') demarrerSnake();
  else if (state.currentArcadeGame === 'invaders') demarrerSpaceInvaders();
  else if (state.currentArcadeGame === 'flappy') demarrerFlappyPizza();
  else if (state.currentArcadeGame === 'breaker') demarrerBrickBreaker();
  else if (state.currentArcadeGame === 'typer') demarrerSpeedTyper();
}

// FLAPPY PIZZA
function demarrerFlappyPizza() {
  const canvas = document.getElementById("arcade-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let pizzaY = 150, vel = 0, gravity = 0.4, score = 0, obs = [];

  window.onkeydown = (e) => { if (e.key === " ") vel = -6; };
  canvas.onclick = () => vel = -6;

  arcadeInterval = setInterval(() => {
    vel += gravity; pizzaY += vel;
    if (Math.random() < 0.03) obs.push({ x: 300, top: Math.random() * 150 + 20, w: 25 });

    ctx.fillStyle = "#090d16"; ctx.fillRect(0, 0, 300, 300);
    ctx.font = "24px sans-serif"; ctx.fillText("🍕", 40, pizzaY);

    ctx.fillStyle = "#ef4444";
    obs.forEach((o, i) => {
      o.x -= 3;
      ctx.fillRect(o.x, 0, o.w, o.top);
      ctx.fillRect(o.x, o.top + 90, o.w, 300);
      if (40 > o.x && 40 < o.x + o.w && (pizzaY - 15 < o.top || pizzaY > o.top + 90)) {
        clearInterval(arcadeInterval); alert("💥 Game Over Flappy ! Score : " + score);
      }
      if (o.x < -25) { obs.splice(i, 1); score++; }
    });

    if (pizzaY > 300 || pizzaY < 0) { clearInterval(arcadeInterval); alert("💥 Game Over Flappy ! Score : " + score); }
  }, 30);
}

// BRICK BREAKER
function demarrerBrickBreaker() {
  const canvas = document.getElementById("arcade-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let bx = 150, by = 200, dx = 3, dy = -3, px = 110;
  let bricks = [];
  for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++) bricks.push({ x: c * 58 + 10, y: r * 20 + 30, active: true });

  window.onmousemove = (e) => {
    const rect = canvas.getBoundingClientRect();
    px = Math.max(0, Math.min(220, e.clientX - rect.left - 40));
  };

  arcadeInterval = setInterval(() => {
    bx += dx; by += dy;
    if (bx < 5 || bx > 295) dx = -dx;
    if (by < 5) dy = -dy;

    if (by > 270 && bx > px && bx < px + 80) dy = -dy;
    if (by > 300) { clearInterval(arcadeInterval); alert("💥 Game Over Brick Breaker !"); }

    ctx.fillStyle = "#090d16"; ctx.fillRect(0, 0, 300, 300);
    ctx.fillStyle = "#38bdf8"; ctx.fillRect(px, 280, 80, 10);
    ctx.fillStyle = "#eab308"; ctx.beginPath(); ctx.arc(bx, by, 6, 0, Math.PI*2); ctx.fill();

    ctx.fillStyle = "#a855f7";
    bricks.forEach(b => {
      if (b.active) {
        ctx.fillRect(b.x, b.y, 50, 15);
        if (bx > b.x && bx < b.x + 50 && by > b.y && by < b.y + 15) { b.active = false; dy = -dy; state.pizzas += 50; }
      }
    });
  }, 20);
}

// SPEED TYPER
const WORDS = ["CYBER", "MATRIX", "PIZZA", "OMNI", "HACKER", "NEON", "ROBOT"];
let targetWord = "";
function demarrerSpeedTyper() {
  targetWord = WORDS[Math.floor(Math.random() * WORDS.length)];
  document.getElementById("typer-display").innerText = "Tape vite : " + targetWord;
  window.onkeydown = (e) => {
    if (e.key.toUpperCase() === targetWord[0]) {
      targetWord = targetWord.slice(1);
      if (!targetWord) {
        state.pizzas += 200;
        alert("🎉 Mot validé ! +200 Pizzas");
        demarrerSpeedTyper();
      } else document.getElementById("typer-display").innerText = "Tape vite : " + targetWord;
    }
  };
}

// MEMORY & SIMON
function initMemoryGame() {
  const grid = document.getElementById("memory-grid");
  grid.innerHTML = "";
  const icons = ["🍕","🍕","🤖","🤖","💎","💎","⚡","⚡"];
  icons.sort(() => Math.random() - 0.5);
  icons.forEach(ic => {
    const btn = document.createElement("button"); btn.className = "music-btn"; btn.innerText = "❓";
    btn.onclick = () => { btn.innerText = ic; };
    grid.appendChild(btn);
  });
}

let simonSeq = [], simonStep = 0;
function initSimonGame() {
  simonSeq = [Math.floor(Math.random()*4), Math.floor(Math.random()*4)];
  simonStep = 0;
  alert("Observe les couleurs !");
}
function cliquerSimon(id) {
  if (id === simonSeq[simonStep]) {
    simonStep++;
    if (simonStep >= simonSeq.length) { alert("Bravo ! Niveau suivant !"); simonSeq.push(Math.floor(Math.random()*4)); simonStep = 0; }
  } else alert("Erreur Simon !");
}

// ANCIENS MINI-JEUX SANS BUG
function demarrerSnake() {
  const canvas = document.getElementById("arcade-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let snake = [{x: 7, y: 7}, {x: 6, y: 7}];
  let food = {x: 11, y: 7}, dx = 1, dy = 0;
  state.snakeScore = 0;

  window.onkeydown = (e) => {
    if (e.key === "ArrowUp" && dy === 0) { dx = 0; dy = -1; }
    if (e.key === "ArrowDown" && dy === 0) { dx = 0; dy = 1; }
    if (e.key === "ArrowLeft" && dx === 0) { dx = -1; dy = 0; }
    if (e.key === "ArrowRight" && dx === 0) { dx = 1; dy = 0; }
  };

  arcadeInterval = setInterval(() => {
    const head = {x: snake[0].x + dx, y: snake[0].y + dy};
    if (head.x < 0 || head.x >= 15 || head.y < 0 || head.y >= 15) { clearInterval(arcadeInterval); alert("Game Over Snake !"); return; }
    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
      food = {x: Math.floor(Math.random()*15), y: Math.floor(Math.random()*15)}; state.snakeScore++;
    } else snake.pop();

    ctx.fillStyle = "#090d16"; ctx.fillRect(0, 0, 300, 300);
    ctx.fillStyle = "#ef4444"; ctx.fillRect(food.x*20, food.y*20, 18, 18);
    ctx.fillStyle = "#22c55e"; snake.forEach(s => ctx.fillRect(s.x*20, s.y*20, 18, 18));
  }, 130);
}

function demarrerSpaceInvaders() {
  const canvas = document.getElementById("arcade-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let shipX = 135, bullets = [], enemies = [{x:40, y:30}, {x:120, y:30}, {x:200, y:30}];

  window.onkeydown = (e) => {
    if (e.key === "ArrowLeft") shipX = Math.max(0, shipX - 15);
    if (e.key === "ArrowRight") shipX = Math.min(270, shipX + 15);
    if (e.key === " ") bullets.push({x: shipX + 12, y: 260});
  };

  arcadeInterval = setInterval(() => {
    ctx.fillStyle = "#090d16"; ctx.fillRect(0, 0, 300, 300);
    ctx.fillStyle = "#38bdf8"; ctx.fillRect(shipX, 270, 30, 15);
    bullets.forEach((b, bi) => {
      b.y -= 8; ctx.fillStyle = "#eab308"; ctx.fillRect(b.x, b.y, 4, 8);
      enemies.forEach((en, ei) => {
        if (Math.abs(b.x - en.x) < 20 && Math.abs(b.y - en.y) < 20) { enemies.splice(ei, 1); bullets.splice(bi, 1); state.pizzas += 500; }
      });
    });
    ctx.fillStyle = "#ef4444"; enemies.forEach(en => ctx.fillRect(en.x, en.y, 20, 15));
    if (!enemies.length) { clearInterval(arcadeInterval); alert("Victoire Invaders ! +500 Pizzas"); }
  }, 45);
}

// DILEMMES, SHOP, PROFIL, PIZZA CLICKER
const DILEMMES_BANQUE = [
  { q: "🥐 Viennoiserie ?", o1: "Pain au Chocolat", o2: "Chocolatine", p1: 62 },
  { q: "⚡ Pouvoir ?", o1: "Voler", o2: "Invisibilité", p1: 48 }
];

function chargerDilemmeActuel() {
  const d = DILEMMES_BANQUE[state.dilemmeIndex % DILEMMES_BANQUE.length];
  document.getElementById("dilemme-question").innerText = "⚖️ " + d.q;
  document.getElementById("opt-1").innerText = d.o1;
  document.getElementById("opt-2").innerText = d.o2;
}

function voterDilemme(choix) {
  const d = DILEMMES_BANQUE[state.dilemmeIndex % DILEMMES_BANQUE.length];
  document.getElementById("dilemme-options").style.display = "none";
  document.getElementById("dilemme-resultats").style.display = "block";
  document.getElementById("res-texte").innerHTML = `📊 Votes :<br>${d.o1} : ${d.p1}%<br>${d.o2} : ${100 - d.p1}%`;
}

function prochainDilemme() {
  state.dilemmeIndex++;
  document.getElementById("dilemme-options").style.display = "flex";
  document.getElementById("dilemme-resultats").style.display = "none";
  chargerDilemmeActuel();
}

const SKINS_LIST = [{ id: '🍕', name: 'Classique', cost: 0 }, { id: '👑', name: 'Dorée', cost: 50 }, { id: '🌌', name: 'Cosmique', cost: 100 }];
const EFFECTS_LIST = [{ id: 'cyan', name: 'Cyan', cost: 0 }, { id: 'fire', name: 'Feu 🔥', cost: 40 }];
const THEMES_LIST = [{ id: 'blue', name: 'Cyber Blue', cost: 0 }, { id: 'purple', name: 'Purple Neon', cost: 60 }];

function genererBoutiqueCosmetique() {
  const sG = document.getElementById("pizza-skins-grid");
  if (!sG) return;
  sG.innerHTML = SKINS_LIST.map(s => `<div class="card" style="text-align:center;"><span style="font-size:30px;">${s.id}</span><br><button class="music-btn" onclick="equiperSkin('${s.id}')">Équiper</button></div>`).join("");
}

function equiperSkin(id) { state.activeSkin = id; document.getElementById("pizza-gigante").innerText = id; sauvegarderDonnees(); }

function changerAvatar() {
  const avatars = ["🤖", "👽", "👑", "🦊", "🥷"];
  state.userAvatar = avatars[(avatars.indexOf(state.userAvatar) + 1) % avatars.length];
  document.getElementById("profile-avatar").innerText = state.userAvatar;
  sauvegarderDonnees();
}

function sauvegarderProfil() {
  state.username = document.getElementById("username-input").value || "Joueur Cyber";
  sauvegarderDonnees(); afficherLeaderboard();
}

function afficherLeaderboard() {
  const list = document.getElementById("leaderboard-list");
  if (!list) return;
  list.innerHTML = `<li style="padding:8px; color:#38bdf8;">#1 ${state.userAvatar} ${state.username} : ${Math.floor(state.pizzas)} 🍕</li>`;
}

const OFFRES_BOUTIQUE = [
  { id: 1, name: "Super Clic", cost: 15, power: 1, cps: 0, desc: "+1 par clic" },
  { id: 2, name: "Livreur à Vélo", cost: 50, power: 0, cps: 1, desc: "+1 pizza/sec" }
];

function genererInterfaceBoutique() {
  const grid = document.getElementById("shop-container");
  if (!grid) return;
  grid.innerHTML = OFFRES_BOUTIQUE.map(item => `
    <div class="shop-item">
      <div><strong>${item.name}</strong><br><small>${item.desc}</small><br><span style="color:#eab308;">${item.cost} 🍕</span></div>
      <button class="music-btn" onclick="acheterObjet(${item.id})">Acheter</button>
    </div>
  `).join("");
}

function acheterObjet(id) {
  const item = OFFRES_BOUTIQUE.find(i => i.id === id);
  if (item && state.pizzas >= item.cost) {
    state.pizzas -= item.cost; state.clickPower += item.power; state.pizzasPerSec += item.cps;
    item.cost = Math.floor(item.cost * 1.2);
    genererInterfaceBoutique(); rafraichirAffichagePizza(); sauvegarderDonnees();
  }
}

function cliquerPizza(e) {
  const mult = verifierHappyHour();
  state.pizzas += state.clickPower * mult;
  rafraichirAffichagePizza(); sauvegarderDonnees();
}

function rafraichirAffichagePizza() {
  if (document.getElementById("score-pieces")) document.getElementById("score-pieces").innerText = Math.floor(state.pizzas);
  if (document.getElementById("pieces-par-seconde")) document.getElementById("pieces-par-seconde").innerText = state.pizzasPerSec;
  if (document.getElementById("click-power-display")) document.getElementById("click-power-display").innerText = state.clickPower;
  if (document.getElementById("omni-points-display")) document.getElementById("omni-points-display").innerText = state.omniPoints + " pts";
  if (document.getElementById("quantique-display")) document.getElementById("quantique-display").innerText = state.quantiquePoints;
  genererInterfaceBoutique(); afficherLeaderboard();
}

// AUDIO & RADIOS
let audioCtx = null, musicInterval = null, noteIndex = 0;
const TRACK_LIST = [
  { name: "🎵 Track 1: Synthwave Drive", scale: [220, 246, 261, 293, 329] },
  { name: "☕ Track 2: Lo-Fi Cyber Cafe", scale: [174, 196, 220, 261, 293] }
];

function togglePlayPause() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  state.isPlaying = !state.isPlaying;
  document.getElementById("play-pause-btn").innerText = state.isPlaying ? "⏸️ Pause" : "▶️ Play";
  if (state.isPlaying) {
    musicInterval = setInterval(() => {
      const track = TRACK_LIST[state.trackIndex];
      jouerNote(track.scale[noteIndex % track.scale.length], 'sawtooth', 0.3, 0.03);
      noteIndex++;
    }, 250);
  } else clearInterval(musicInterval);
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

function musiqueSuivante() { state.trackIndex = (state.trackIndex + 1) % TRACK_LIST.length; document.getElementById("track-title").innerText = TRACK_LIST[state.trackIndex].name; }
function musiquePrecedente() { state.trackIndex = (state.trackIndex - 1 + TRACK_LIST.length) % TRACK_LIST.length; document.getElementById("track-title").innerText = TRACK_LIST[state.trackIndex].name; }

// DÉFIS, SECRETS, CAPSULES & AUTRES
function publierDefi() {
  const caption = document.getElementById("dare-caption").value;
  state.feedPosts.unshift({ text: caption, likes: 0 });
  document.getElementById("dare-caption").value = ""; afficherFeed(); sauvegarderDonnees();
}
function afficherFeed() {
  const container = document.getElementById("feed-container");
  if (!container) return;
  container.innerHTML = state.feedPosts.map((p, i) => `<div class="card"><p>${p.text}</p></div>`).join("");
}

function detruireSouci() {
  const txt = document.getElementById("vent-input");
  if (!txt || !txt.value.trim()) return;
  txt.value = ""; alert("🌌 Souci aspiré !");
}

function publierSecret() {
  const txt = document.getElementById("secret-input").value;
  if (!txt.trim()) return;
  state.secrets.push({ text: txt, score: 3 });
  document.getElementById("secret-input").value = ""; afficherSecrets(); sauvegarderDonnees();
}
function afficherSecrets() {
  const container = document.getElementById("secrets-list");
  if (!container) return;
  container.innerHTML = state.secrets.map(s => `<div class="card"><p>"${s.text}"</p></div>`).join("");
}

function creerCapsule() {
  const text = document.getElementById("capsule-text").value;
  if (!text.trim()) return;
  state.capsules.push({ text, unlockTime: Date.now() + 60000 });
  document.getElementById("capsule-text").value = ""; afficherCapsules(); sauvegarderDonnees();
}
function afficherCapsules() {
  const container = document.getElementById("capsules-list");
  if (!container) return;
  container.innerHTML = state.capsules.map(c => `<div class="card"><p>🔒 Capsule Verrouillée</p></div>`).join("");
}

function tournerLaRoue() {
  if (state.wheelSpunToday) return alert("Déjà tourné aujourd'hui !");
  state.wheelSpunToday = true; state.omniPoints += 25;
  alert("🎉 +25 Points OMNI ⭐ !"); sauvegarderDonnees();
}

function compterClicsTitre() {
  state.titleClicks++;
  if (state.titleClicks >= 5) { state.titleClicks = 0; toggleMatrix(); }
}
function toggleMatrix() {
  state.matrixMode = !state.matrixMode;
  document.body.classList.toggle("matrix-mode", state.matrixMode);
}
function toggleRaveMode() {
  state.raveMode = !state.raveMode;
  document.getElementById("rave-btn").innerText = state.raveMode ? "🟢 Mode Rave : ON" : "🔴 Mode Rave : OFF";
}

// NAVIGATION & INITIALISATION
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
  if (save) try { Object.assign(state, JSON.parse(save)); } catch(e){}
}
function sauvegarderDonnees() {
  localStorage.setItem("omni_app_full_save", JSON.stringify(state));
}

window.addEventListener("load", () => {
  chargerDonnees();
  chargerDilemmeActuel(); genererInterfaceBoutique(); genererBoutiqueCosmetique();
  afficherGalerieCartes(); afficherArbreCompetences(); afficherFamiliers();
  initPapierBulle(); initPixelArt(); afficherFeed(); afficherSecrets(); afficherCapsules();
  rafraichirAffichagePizza();
});

setInterval(() => {
  state.playTimeSeconds++;
  if (document.getElementById("play-time-display")) document.getElementById("play-time-display").innerText = state.playTimeSeconds + "s";
  if (state.playTimeSeconds % 60 === 0) state.omniPoints += 1;
  if (state.pizzasPerSec > 0) { state.pizzas += state.pizzasPerSec; rafraichirAffichagePizza(); }
  sauvegarderDonnees();
}, 1000);
