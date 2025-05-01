const houses = {
  griffindel: 'Griffendél',
  mardekar: 'Mardekár',
  hollóhát: 'Hollóhát',
  hugrabug: 'Hugrabug'
};

let players = JSON.parse(localStorage.getItem('quidditchPlayers')) || [
  { id: 1, name: 'Hajtó 1', house: 'griffindel', timer: null, timeLeft: 0, running: false, expired: false, nameSet: false, houseSet: false },
  { id: 2, name: 'Hajtó 2', house: 'mardekar', timer: null, timeLeft: 0, running: false, expired: false, nameSet: false, houseSet: false },
  { id: 3, name: 'Hajtó 3', house: 'hollóhát', timer: null, timeLeft: 0, running: false, expired: false, nameSet: false, houseSet: false },
  { id: 4, name: 'Hajtó 4', house: 'hugrabug', timer: null, timeLeft: 0, running: false, expired: false, nameSet: false, houseSet: false },
  { id: 5, name: 'Hajtó 5', house: 'griffindel', timer: null, timeLeft: 0, running: false, expired: false, nameSet: false, houseSet: false },
  { id: 6, name: 'Hajtó 6', house: 'mardekar', timer: null, timeLeft: 0, running: false, expired: false, nameSet: false, houseSet: false }
];
let sitoutTime = parseInt(localStorage.getItem('sitoutTime'), 10) || 30;
let playerCount = parseInt(localStorage.getItem('playerCount'), 10) || 6;

function saveState() {
  localStorage.setItem('quidditchPlayers', JSON.stringify(players));
  localStorage.setItem('sitoutTime', sitoutTime);
  localStorage.setItem('playerCount', playerCount);
}

function formatTime(seconds) {
  const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
  const secs = String(seconds % 60).padStart(2, '0');
  return `${mins}:${secs}`;
}

function renderPlayers() {
  const playerList = document.querySelector('.player-list');
  playerList.innerHTML = ''; // Töröljük a meglévő tartalmat
  const visiblePlayers = players.slice(0, playerCount);
  visiblePlayers.forEach(player => {
    const playerDiv = document.createElement('div');
    playerDiv.className = `player ${player.house} ${player.expired ? 'blink' : ''}`;
    playerDiv.setAttribute('role', 'listitem');

    let htmlContent = `
      <h3 onclick="editName(${player.id})" aria-label="${player.name} nevének szerkesztése">${player.name}</h3>
    `;

    // Név szerkesztése, ha még nincs beállítva vagy szerkesztés alatt van
    if (!player.nameSet) {
      htmlContent += `
        <input type="text" value="${player.name}" aria-label="${player.name} neve szerkesztése" />
      `;
    }

    // Ház kiválasztása, ha még nincs beállítva vagy szerkesztés alatt van
    if (!player.houseSet) {
      htmlContent += `
        <select aria-label="${player.name} házának kiválasztása">
          ${Object.entries(houses).map(([key, value]) => 
            `<option value="${key}" ${player.house === key ? 'selected' : ''}>${value}</option>`
          ).join('')}
        </select>
      `;
    } else {
      // Ház logóját helyettesítő kör
      htmlContent += `
        <div class="house-icon ${player.house}-icon" onclick="editHouse(${player.id})" aria-label="${player.name} házának szerkesztése"></div>
      `;
    }

    htmlContent += `
      <div class="timer" aria-live="polite">${formatTime(player.timeLeft)}</div>
      <button class="start" onclick="startTimer(${player.id})" aria-label="Időzítő indítása ${player.name} számára">Indít</button>
      <button class="stop" onclick="stopTimer(${player.id})" aria-label="Időzítő megállítása ${player.name} számára">Stop</button>
      <button class="reset" onclick="resetTimer(${player.id})" aria-label="Időzítő visszaállítása ${player.name} számára">Reset</button>
    `;

    playerDiv.innerHTML = htmlContent;

    // Név szerkesztése eseménykezelő
    const nameInput = playerDiv.querySelector('input');
    if (nameInput) {
      nameInput.addEventListener('change', (e) => {
        player.name = e.target.value || `Hajtó ${player.id}`;
        player.nameSet = true; // Jelöljük, hogy a név beállítva
        saveState();
        renderPlayers();
      });
    }

    // Házválasztás eseménykezelő
    const houseSelect = playerDiv.querySelector('select');
    if (houseSelect) {
      houseSelect.addEventListener('change', (e) => {
        player.house = e.target.value;
        player.houseSet = true; // Jelöljük, hogy a ház beállítva
        saveState();
        renderPlayers();
      });
    }

    playerList.appendChild(playerDiv);
  });
}

function editName(playerId) {
  const player = players.find(p => p.id === playerId);
  player.nameSet = false; // Név szerkesztési mód bekapcsolása
  saveState();
  renderPlayers();
}

function editHouse(playerId) {
  const player = players.find(p => p.id === playerId);
  player.houseSet = false; // Ház szerkesztési mód bekapcsolása
  saveState();
  renderPlayers();
}

function startTimer(playerId) {
  const player = players.find(p => p.id === playerId);
  if (player.running) return;
  player.running = true;
  player.expired = false;
  player.timeLeft = player.timeLeft > 0 ? player.timeLeft : sitoutTime;
  player.timer = setInterval(() => {
    player.timeLeft--;
    if (player.timeLeft <= 0) {
      stopTimer(playerId);
      player.timeLeft = 0;
      player.expired = true;
      // Értesítés képernyőolvasóknak
      const timerDiv = document.querySelector(`.player .timer`);
      if (timerDiv) timerDiv.setAttribute('aria-label', `${player.name} ideje lejárt`);
    }
    renderPlayers();
    saveState();
  }, 1000);
  renderPlayers();
  saveState();
}

function stopTimer(playerId) {
  const player = players.find(p => p.id === playerId);
  if (!player.running) return;
  player.running = false;
  clearInterval(player.timer);
  renderPlayers();
  saveState();
}

function resetTimer(playerId) {
  const player = players.find(p => p.id === playerId);
  player.running = false;
  player.expired = false;
  clearInterval(player.timer);
  player.timeLeft = 0;
  renderPlayers();
  saveState();
}

document.getElementById('sitout-time').addEventListener('change', (e) => {
  sitoutTime = parseInt(e.target.value, 10) || 30;
  saveState();
});

document.getElementById('player-count').addEventListener('change', (e) => {
  const newCount = parseInt(e.target.value, 10);
  playerCount = (newCount === 3 || newCount === 6) ? newCount : 6; // Érvénytelen érték esetén alapértelmezett 6
  saveState();
  renderPlayers();
});

// Inicializálja a hajtószám választót
document.getElementById('player-count').value = playerCount;

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js')
    .then(reg => console.log('Service Worker regisztrálva!', reg))
    .catch(err => console.error('Service Worker hiba:', err));
}

renderPlayers();