const houses = {
    griffindel: 'Griffendél',
    mardekar: 'Mardekár',
    hollóhát: 'Hollóhát',
    hugrabug: 'Hugrabug'
  };
  
  let players = JSON.parse(localStorage.getItem('quidditchPlayers')) || [
    { id: 1, name: 'Hajtó 1', house: 'griffindel', timer: null, timeLeft: 0, running: false, expired: false },
    { id: 2, name: 'Hajtó 2', house: 'mardekar', timer: null, timeLeft: 0, running: false, expired: false },
    { id: 3, name: 'Hajtó 3', house: 'hollóhát', timer: null, timeLeft: 0, running: false, expired: false },
    { id: 4, name: 'Hajtó 4', house: 'hugrabug', timer: null, timeLeft: 0, running: false, expired: false },
    { id: 5, name: 'Hajtó 5', house: 'griffindel', timer: null, timeLeft: 0, running: false, expired: false },
    { id: 6, name: 'Hajtó 6', house: 'mardekar', timer: null, timeLeft: 0, running: false, expired: false }
  ];
  let sitoutTime = parseInt(localStorage.getItem('sitoutTime'), 10) || 30;
  let playerCount = parseInt(localStorage.getItem('playerCount'), 10) || 6;
  let activePlayerId = parseInt(localStorage.getItem('activePlayerId'), 10) || 1;
  
  function saveState() {
    localStorage.setItem('quidditchPlayers', JSON.stringify(players));
    localStorage.setItem('sitoutTime', sitoutTime);
    localStorage.setItem('playerCount', playerCount);
    localStorage.setItem('activePlayerId', activePlayerId);
  }
  
  function formatTime(seconds) {
    const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
    const secs = String(seconds % 60).padStart(2, '0');
    return `${mins}:${secs}`;
  }
  
  function renderPlayers() {
    const playerList = document.querySelector('.player-list');
    playerList.innerHTML = '';
    const visiblePlayers = players.slice(0, playerCount);
    visiblePlayers.forEach(player => {
      const playerDiv = document.createElement('div');
      playerDiv.className = `player ${player.house} ${player.id === activePlayerId ? 'active' : ''} ${player.expired ? 'blink' : ''}`;
      playerDiv.setAttribute('role', 'tab');
      playerDiv.setAttribute('aria-selected', player.id === activePlayerId);
      playerDiv.innerHTML = `
        <div class="icon"></div>
        <h3>${player.name}</h3>
        <input type="text" value="${player.name}" aria-label="${player.name} neve szerkesztése" />
        <select aria-label="${player.name} házának kiválasztása">
          ${Object.entries(houses).map(([key, value]) => 
            `<option value="${key}" ${player.house === key ? 'selected' : ''}>${value}</option>`
          ).join('')}
        </select>
        <div class="timer" aria-live="polite">${formatTime(player.timeLeft)}</div>
        <button class="start" onclick="startTimer(${player.id})" aria-label="Időzítő indítása ${player.name} számára">Indít</button>
        <button class="stop" onclick="stopTimer(${player.id})" aria-label="Időzítő megállítása ${player.name} számára">Stop</button>
        <button class="reset" onclick="resetTimer(${player.id})" aria-label="Időzítő visszaállítása ${player.name} számára">Reset</button>
      `;
      playerDiv.querySelector('input').addEventListener('change', (e) => {
        player.name = e.target.value || `Hajtó ${player.id}`;
        saveState();
        renderPlayers();
      });
      playerDiv.querySelector('select').addEventListener('change', (e) => {
        player.house = e.target.value;
        saveState();
        renderPlayers();
      });
      playerDiv.addEventListener('click', () => setActivePlayer(player.id));
      playerList.appendChild(playerDiv);
    });
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
        const timerDiv = document.querySelector(`.player[aria-selected="true"] .timer`);
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
  
  function setActivePlayer(playerId) {
    activePlayerId = playerId;
    renderPlayers();
    saveState();
  }
  
  function switchActivePlayer(direction) {
    const visiblePlayers = players.slice(0, playerCount);
    const currentIndex = visiblePlayers.findIndex(p => p.id === activePlayerId);
    let newIndex;
    if (direction === 'next') {
      newIndex = (currentIndex + 1) % visiblePlayers.length;
    } else {
      newIndex = (currentIndex - 1 + visiblePlayers.length) % visiblePlayers.length;
    }
    activePlayerId = visiblePlayers[newIndex].id;
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
    if (activePlayerId > playerCount) {
      activePlayerId = 1;
    }
    saveState();
    renderPlayers();
  });
  
  // Gyorsbillentyűk a swaphez
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') {
      switchActivePlayer('next');
    } else if (e.key === 'ArrowLeft') {
      switchActivePlayer('prev');
    }
  });
  
  // Inicializálja a hajtószám választót
  document.getElementById('player-count').value = playerCount;
  
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js')
      .then(reg => console.log('Service Worker regisztrálva!', reg))
      .catch(err => console.error('Service Worker hiba:', err));
  }
  
  renderPlayers();