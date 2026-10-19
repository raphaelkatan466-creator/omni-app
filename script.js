// --- STATE GLOBAL (Inclus la totalité des variables) ---
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
  pets: { robot: { level: 1, active: true }, dragon: { level: 0, active: false } }
};

// --- RÉINITIALISATION GARANTIE ET EFFACEMENT COMPLET ---
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

// --- FILTRE CRT & EVENEMENT HAPPY HOUR ---
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

// --- PIZZA CLICKER & EFFETS VISUELS FLOTTANTS ET PARTICULES ---
function cliquerPizza(e) {
  const mult = verifierHappyHour();
  const gain = state.clickPower * mult;
  state.pizzas += gain;
  rafraichirAffichagePizza();
  verifierSucces();

  const pizzaEl = document.getElementById("pizza-gigante");
  const container = document.getElementById("pizza-container");
  if (pizzaEl && container) {
    pizzaEl.classList.add("clicked");
    setTimeout(() => pizzaEl.classList.remove("clicked"), 80);

    const floating = document.createElement("div");
    floating.className = "floating-text";
    floating.innerText = "+" + gain;
    const rect = container.getBoundingClientRect();
    floating.style.left = (e.clientX - rect.left) + "px";
    floating.style.top = (e.clientY - rect.top) + "px";
    container.appendChild(floating);
    setTimeout(() => floating.remove(), 600);

    let colors = ["#38bdf8", "#eab308"];
    if (state.activeEffectColor === 'fire') colors = ["#ef4444", "#f97316"];

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
  if (document.getElementById("score-pieces")) document.getElementById("score-pieces").innerText = Math.floor(state.pizzas);
  if (document.getElementById("pieces-par-seconde")) document.getElementById("pieces-par-seconde").innerText = state.pizzasPerSec;
  if (document.getElementById("click-power-display")) document.getElementById("click-power-display").innerText = state.clickPower;
  if (document.getElementById("omni-points-display")) document.getElementById("omni-points-display").innerText = state.omniPoints + " pts";
  if (document.getElementById("quantique-display")) document.getElementById("quantique-display").innerText = state.quantiquePoints;
  genererInterfaceBoutique();
  afficherLeaderboard();
}

// --- BOUTIQUE DE PRODUCTION (22 OBJET) ---
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

// --- SYSTEME DE PRESTIGE ---
function effectuerPrestige() {
  if (state.pizzas < 1000000) return alert("Il te faut au moins 1 000 000 de Pizzas !");
  if (confirm("✨ Voulez-vous effectuer une Renaissance pour des Pizzas Quantiques ?")) {
    const gagne = Math.floor(state.pizzas / 1000000);
    state.quantiquePoints += gagne;
    state.pizzas = 0; state.clickPower = 1 + state.quantiquePoints * 2; state.pizzasPerSec = 0;
    alert(`🎉 Renaissance réussie ! +${gagne} Pizzas Quantiques !`);
    sauvegarderDonnees(); rafraichirAffichagePizza();
  }
}

// --- ARCADE HUB (7 MINI-JEUX) ---
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

// CYBER-SNAKE REALISTE
function demarrerSnake() {
  const canvas = document.getElementById("arcade-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let snake = [{x: 7, y: 7}, {x: 6, y: 7}, {x: 5, y: 7}];
  let food = {x: 11, y: 7}, dx = 0, dy = 0;
  state.snakeScore = 0;

  function drawFrame() {
    ctx.fillStyle = "#090d16"; ctx.fillRect(0, 0, 300, 300);
    ctx.strokeStyle = "#1e293b"; ctx.lineWidth = 0.5;
    for (let i = 0; i <= 300; i += 20) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 300); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(300, i); ctx.stroke();
    }
    const fx = food.x * 20 + 10, fy = food.y * 20 + 10;
    ctx.fillStyle = "#ef4444"; ctx.beginPath(); ctx.arc(fx, fy + 2, 7, 0, Math.PI * 2); ctx.fill();

    snake.forEach((part, idx) => {
      const px = part.x * 20 + 10, py = part.y * 20 + 10;
      if (idx === 0) {
        ctx.fillStyle = "#15803d"; ctx.beginPath(); ctx.arc(px, py, 9, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#facc15"; ctx.beginPath(); ctx.arc(px - 3, py - 3, 2.5, 0, Math.PI * 2); ctx.arc(px + 3, py - 3, 2.5, 0, Math.PI * 2); ctx.fill();
      } else {
        ctx.fillStyle = idx % 2 === 0 ? "#16a34a" : "#22c55e"; ctx.beginPath(); ctx.arc(px, py, 7.5, 0, Math.PI * 2); ctx.fill();
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
    if (head.x < 0 || head.x >= 15 || head.y < 0 || head.y >= 15) { clearInterval(arcadeInterval); alert("Game Over Snake ! Score : " + state.snakeScore); return; }
    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
      food = {x: Math.floor(Math.random() * 15), y: Math.floor(Math.random() * 15)};
      state.snakeScore++; verifierSucces();
    } else snake.pop();
    drawFrame();
  }, 130);
}

// SPACE INVADERS
function demarrerSpaceInvaders() {
  const canvas = document.getElementById("arcade-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let shipX = 135, bullets = [], enemies = [{x:40, y:30}, {x:100, y:30}, {x:160, y:30}, {x:220, y:30}];

  window.onkeydown = function(e) {
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
        if (Math.abs(b.x - en.x) < 20 && Math.abs(b.y - en.y) < 20) {
          enemies.splice(ei, 1); bullets.splice(bi, 1); state.pizzas += 500;
        }
      });
    });
    ctx.fillStyle = "#ef4444"; enemies.forEach(en => ctx.fillRect(en.x, en.y, 20, 15));
    if (!enemies.length) { clearInterval(arcadeInterval); alert("👾 Victoire Space Invaders ! +500 Pizzas"); }
  }, 45);
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
      o.x -= 3; ctx.fillRect(o.x, 0, o.w, o.top); ctx.fillRect(o.x, o.top + 90, o.w, 300);
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
        state.pizzas += 200; alert("🎉 Mot validé ! +200 Pizzas");
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
  simonSeq = [Math.floor(Math.random()*4), Math.floor(Math.random()*4)]; simonStep = 0;
  alert("Observe les couleurs !");
}
function cliquerSimon(id) {
  if (id === simonSeq[simonStep]) {
    simonStep++;
    if (simonStep >= simonSeq.length) { alert("Bravo ! Niveau suivant !"); simonSeq.push(Math.floor(Math.random()*4)); simonStep = 0; }
  } else alert("Erreur Simon !");
}

let qteTargetKey = "";
function demarrerQTEHack() {
  if (arcadeInterval) clearInterval(arcadeInterval);
  const keys = ["A", "Z", "E", "R", "T", "Y"];
  qteTargetKey = keys[Math.floor(Math.random() * keys.length)];
  document.getElementById("qte-container").style.display = "block";
  document.getElementById("qte-prompt").innerText = `⚡ TAPE VITE : [ ${qteTargetKey} ]`;
}

window.addEventListener("keydown", (e) => {
  if (qteTargetKey && e.key.toUpperCase() === qteTargetKey) {
    state.pizzas *= 2; alert("💥 PIRATAGE RÉUSSI ! Pizzas doublées !");
    document.getElementById("qte-container").style.display = "none";
    qteTargetKey = ""; rafraichirAffichagePizza();
  }
});

// --- CARTES, COMPETENCES & FAMILIERS ---
const CARTE_BANQUE = [
  { id: 'c1', name: 'Pizza Originelle', rarity: 'Commune', icon: '🍕', color: '#94a3b8' },
  { id: 'c2', name: 'Livreur Vélo-Laser', rarity: 'Rare', icon: '🚴‍♂️', color: '#38bdf8' },
  { id: 'c3', name: 'Drone Matrice AI', rarity: 'Épique', icon: '🛸', color: '#a855f7' },
  { id: 'c4', name: 'Dieu de la Croûte', rarity: 'Légendaire', icon: '👑', color: '#eab308' },
  { id: 'c5', name: 'Trou Noir Fromager', rarity: 'OMNI', icon: '🌌', color: '#f472b6' }
];

function ouvrirBooster() {
  if (state.omniPoints < 100) return alert("100 Points OMNI ⭐ requis !");
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
  afficherGalerieCartes(); sauvegarderDonnees(); rafraichirAffichagePizza();
}

function afficherGalerieCartes() {
  const g = document.getElementById("cards-gallery");
  if (!g) return;
  if (!state.userCards) state.userCards = [];
  g.innerHTML = CARTE_BANQUE.map(c => {
    const count = state.userCards.filter(id => id === c.id).length;
    return `<div class="card" style="text-align:center; border: 2px solid ${c.color}; opacity: ${count > 0 ? 1 : 0.4};">
      <span style="font-size:35px;">${c.icon}</span>
      <h4 style="margin:5px 0; color:${c.color}; font-size:13px;">${c.name}</h4>
      <small style="color:#94a3b8;">${c.rarity}</small><br>
      <span style="font-weight:bold; color:white;">x${count}</span>
    </div>`;
  }).join("");
}

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
    state.omniPoints -= 10; state.skills[type]++;
    if (type === 'clickBoost') state.clickPower += 2;
    if (type === 'autoBoost') state.pizzasPerSec += 5;
    afficherArbreCompetences(); rafraichirAffichagePizza(); sauvegarderDonnees();
  } else alert("Points OMNI insuffisants !");
}

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
    state.pizzas -= 50; state.pets[pet].level++; state.pizzasPerSec += 2;
    afficherFamiliers(); rafraichirAffichagePizza(); sauvegarderDonnees();
  }
}

// --- CREATIF & CHILL ---
function initPapierBulle() {
  const grid = document.getElementById("bubble-wrap-container");
  if (!grid || grid.children.length > 0) return;
  for (let i = 0; i < 32; i++) {
    const b = document.createElement("button"); b.className = "music-btn"; b.innerText = "⚪";
    b.onclick = () => { b.innerText = "💥"; b.disabled = true; jouerNote(600 + Math.random() * 200, 'sine', 0.05, 0.1); };
    grid.appendChild(b);
  }
}

function initPixelArt() {
  const grid = document.getElementById("pixel-grid");
  if (!grid || grid.children.length > 0) return;
  const colors = ["#38bdf8", "#ef4444", "#22c55e", "#eab308", "#a855f7"];
  for (let i = 0; i < 100; i++) {
    const cell = document.createElement("div");
    cell.style.width = "20px"; cell.style.height = "20px"; cell.style.background = "#1e293b"; cell.style.border = "1px solid #0f172a";
    cell.onclick = () => { cell.style.background = colors[Math.floor(Math.random() * colors.length)]; jouerNote(300 + Math.random() * 300, 'square', 0.05, 0.05); };
    grid.appendChild(cell);
  }
}

const CITATIONS = [
  "« Le futur appartient à ceux qui croient à la magie des pizzas. »",
  "« Dans la matrice néon, seul le code et la passion demeurent. »",
  "« Un clic aujourd'hui est une galaxie demain. »"
];

function genererCitation() {
  document.getElementById("citation-display").innerText = CITATIONS[Math.floor(Math.random() * CITATIONS.length)];
}

// --- COMMUNAUTÉ ---
function voterHumeur(type) {
  alert(`Merci d'avoir partagé ton humeur : ${type} !`);
  document.getElementById("humeur-stats").innerText = "Météo globale : 85% de la communauté est en forme 🔥 !";
}

function genererPseudoCyber() {
  const prefixes = ["Néon", "Cyber", "Vortex", "Matrix", "Quantum"];
  const suffixes = ["Phénix", "Rider", "Hacker", "Viper", "Titan"];
  document.getElementById("pseudo-generated").innerText = prefixes[Math.floor(Math.random() * prefixes.length)] + "_" + suffixes[Math.floor(Math.random() * suffixes.length)] + "_" + (Math.floor(Math.random() * 99) + 1);
}

function envoyerLettre() {
  const txt = document.getElementById("letter-input").value;
  if (!txt.trim()) return;
  document.getElementById("letter-input").value = "";
  document.getElementById("received-letter").innerText = "📩 Lettre reçue du cosmos : « Garde le sourire et continue de créer des choses formidables ! »";
}

// --- TRIBUNAL DES DILEMMES ---
const DILEMMES_BANQUE = [
  { q: "🥐 Quel est le vrai nom de cette viennoiserie ?", o1: "🥐 Pain au Chocolat", o2: "🍫 Chocolatine", p1: 62 },
  { q: "⚡ Quel pouvoir magique tu choisis ?", o1: "🦅 Voler dans les airs", o2: "👻 Être invisible", p1: 48 },
  { q: "🍔 Que préfères-tu manger à vie ?", o1: "🍕 Pizzas à volonté", o2: "🍔 Burgers à volonté", p1: 55 }
];

function chargerDilemmeActuel() {
  const d = DILEMMES_BANQUE[state.dilemmeIndex % DILEMMES_BANQUE.length];
  if (document.getElementById("dilemme-question")) document.getElementById("dilemme-question").innerText = "⚖️ " + d.q;
  if (document.getElementById("opt-1")) document.getElementById("opt-1").innerText = d.o1;
  if (document.getElementById("opt-2")) document.getElementById("opt-2").innerText = d.o2;
}

function voterDilemme(choix) {
  const d = DILEMMES_BANQUE[state.dilemmeIndex % DILEMMES_BANQUE.length];
  document.getElementById("dilemme-options").style.display = "none";
  document.getElementById("dilemme-resultats").style.display = "block";
  document.getElementById("res-texte").innerHTML = `📊 Votes :<br><span style="color:#38bdf8">${d.o1} : ${d.p1}%</span><br><span style="color:#eab308">${d.o2} : ${100 - d.p1}%</span>`;
}

function prochainDilemme() {
  state.dilemmeIndex++;
  document.getElementById("dilemme-options").style.display = "flex";
  document.getElementById("dilemme-resultats").style.display = "none";
  chargerDilemmeActuel();
}

// --- PROFIL & LEADERBOARD ---
function changerAvatar() {
  const avatars = ["🤖", "👽", "👑", "🦊", "🥷", "🦁"];
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
  const rank = [
    { name: state.username, score: Math.floor(state.pizzas), avatar: state.userAvatar, isMe: true },
    { name: "Sora_Cyber", score: 150000, avatar: "🦊" },
    { name: "Neo_Matrix", score: 98000, avatar: "🥷" }
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
  ACHIEVEMENTS_LIST.push({ id: 'pizza_' + i, title: `🍕 Maître Pizzaiolo #${i}`, desc: `Atteindre ${i * 1000} pizzas.`, points: 10, check: () => state.pizzas >= i * 1000 });
}
for (let i = 26; i <= 100; i++) {
  ACHIEVEMENTS_LIST.push({ id: 'ach_' + i, title: `🏆 Succès OMNI #${i}`, desc: `Jouer et explorer.`, points: 5, check: () => state.playTimeSeconds >= i * 10 });
}

function verifierSucces() {
  ACHIEVEMENTS_LIST.forEach(a => {
    if (!state.achievements[a.id] && a.check && a.check()) {
      state.achievements[a.id] = true; state.omniPoints += a.points;
      alert(`🏆 SUCCÈS DÉBLOQUÉ : ${a.title}\n+${a.points} Points OMNI !`);
      sauvegarderDonnees();
    }
  });
  afficherSucces();
}

function afficherSucces() {
  const container = document.getElementById("achievements-grid");
  const counter = document.getElementById("trophy-count");
  if (!container) return;
  let unlockedCount = 0; container.innerHTML = "";
  ACHIEVEMENTS_LIST.forEach(a => {
    const unlocked = !!state.achievements[a.id];
    if (unlocked) unlockedCount++;
    const div = document.createElement("div"); div.className = "card";
    div.style.border = unlocked ? "1px solid #22c55e" : "1px solid #334155";
    div.style.opacity = unlocked ? "1" : "0.55";
    div.innerHTML = `<h4 style="margin:0 0 5px 0;">${unlocked ? '✅' : '🔒'} ${a.title}</h4><p style="font-size:12px; margin:0;">${a.desc}</p>`;
    container.appendChild(div);
  });
  if (counter) counter.innerText = `${unlockedCount} / 100`;
}

// --- SHOP COSMETIQUE ---
const SKINS_LIST = [{ id: '🍕', name: 'Classique', cost: 0 }, { id: '👑', name: 'Dorée', cost: 50 }, { id: '🌌', name: 'Cosmique', cost: 100 }];
function genererBoutiqueCosmetique() {
  const sG = document.getElementById("pizza-skins-grid");
  if (!sG) return;
  sG.innerHTML = SKINS_LIST.map(s => `<div class="card" style="text-align:center;"><span style="font-size:30px;">${s.id}</span><br><button class="music-btn" onclick="equiperSkin('${s.id}')">Équiper</button></div>`).join("");
}
function equiperSkin(id) { state.activeSkin = id; document.getElementById("pizza-gigante").innerText = id; sauvegarderDonnees(); }

// --- AUDIO & RADIOS ---
let audioCtx = null, musicInterval = null, noteIndex = 0;
const TRACK_LIST = [
  { name: "🎵 Track 1: Midnight Cyber Drive", scale: [220, 246, 261, 293, 329] },
  { name: "🌆 Track 2: Neon Sunset Lo-Fi", scale: [174, 196, 220, 261, 293] }
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

// --- AUTRES MODULES ---
function publierDefi() {
  const caption = document.getElementById("dare-caption").value;
  state.feedPosts.unshift({ text: caption, likes: 0 });
  document.getElementById("dare-caption").value = ""; afficherFeed(); sauvegarderDonnees();
}
function afficherFeed() {
  const container = document.getElementById("feed-container");
  if (!container) return;
  container.innerHTML = state.feedPosts.map(p => `<div class="card"><p>${p.text}</p></div>`).join("");
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

// --- NAVIGATION & INIT ---
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
  afficherSucces(); rafraichirAffichagePizza();
});

setInterval(() => {
  state.playTimeSeconds++;
  if (document.getElementById("play-time-display")) document.getElementById("play-time-display").innerText = state.playTimeSeconds + "s";
  if (state.playTimeSeconds % 60 === 0) state.omniPoints += 1;
  if (state.pizzasPerSec > 0) { state.pizzas += state.pizzasPerSec; rafraichirAffichagePizza(); }
  verifierSucces(); sauvegarderDonnees();
}, 1000);
