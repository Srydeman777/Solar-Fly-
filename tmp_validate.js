
    import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
    import {
      getFirestore,
      doc,
      getDoc,
      setDoc,
      deleteDoc,
      onSnapshot,
      runTransaction,
      collection,
      query,
      updateDoc
    } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

    console.debug('Firebase imports successful', { 
        collection: typeof collection, 
        onSnapshot: typeof onSnapshot,
        query: typeof query,
        getFirestore: typeof getFirestore
    });

    const firebaseConfig = {
      apiKey: "AIzaSyBh3iu2SHzxfzbxRAvREoOzaSHhaORqhhM",
      authDomain: "solar-fly.firebaseapp.com",
      projectId: "solar-fly",
      storageBucket: "solar-fly.firebasestorage.app",
      messagingSenderId: "272161581720",
      appId: "1:272161581720:web:23b365b98498d8ab98feed"
    };

    try {
      const app = initializeApp(firebaseConfig);
      const db = getFirestore(app);
      
      const firebaseObj = Object.freeze({
        app,
        db,
        doc,
        getDoc,
        setDoc,
        updateDoc,
        deleteDoc,
        runTransaction,
        collection,
        query,
        onSnapshot,
        __firebaseReady: true,
        __timestamp: Date.now()
      });
      
      // Use Object.defineProperty to prevent overwriting
      Object.defineProperty(window, 'firebase', {
        value: firebaseObj,
        writable: false,
        configurable: false
      });
      
      window.firebaseReady = true;
      document.dispatchEvent(new CustomEvent('firebaseReady', { detail: firebaseObj }));
      
      console.debug('Firebase initialization successful', { 
          hasDb: !!firebaseObj.db,
          firebaseKeys: Object.keys(firebaseObj),
          collectionType: typeof firebaseObj.collection,
          isReadOnly: !Object.getOwnPropertyDescriptor(window, 'firebase').writable
      });
    } catch (err) {
      console.error('Firebase initialization failed', err);
      const errorObj = Object.freeze({ __firebaseError: err.message, __timestamp: Date.now() });
      Object.defineProperty(window, 'firebase', {
        value: errorObj,
        writable: false,
        configurable: false
      });
      window.firebaseReady = false;
      console.error('Setting firebaseReady to false due to init error');
    }
  

    (function () {
      const adminStorageKey = 'adminenable';
      const adminStartScoreStorageKey = 'adminstartscore';

      function getStoredAdminEnable() {
        const savedValue = localStorage.getItem(adminStorageKey);
        if (savedValue === 'yes') return 'yes';
        if (savedValue === 'no') return 'no';
        localStorage.setItem(adminStorageKey, 'no');
        return 'no';
      }

// Function to update ranking after a tiebreaker match completes
// Function to update ranking after a tiebreaker match completes
function updateTiebreakerRanking(partyName, isTiebreakerMatch = false) {
    if (!partyName) return;
    const parties = getSavedParties();
    const party = parties.find(p => String(p.name || '').toLowerCase() === String(partyName || '').toLowerCase());
    if (!party) return;
    const order = getFamilyTurnOrder(party);
    const partyScores = window.__familyPartyScores && window.__familyPartyScores[String(partyName)] 
        ? window.__familyPartyScores[String(partyName)] 
        : {};
    const tiebreak = window.__familyTiebreak;
    if (!tiebreak || !tiebreak.players) return;
    const tiebreakPlayers = tiebreak.players.map(Number);
    const baselineCounts = tiebreak.baselineCounts || {};

    const playerTotals = {};
    const playerBaselineTotals = {};
    tiebreakPlayers.forEach(pnum => {
        const arr = Array.isArray(partyScores[Number(pnum)]) ? partyScores[Number(pnum)] : [];
        // Calculate baseline total (first 3 matches only)
        const baselineArr = arr.slice(0, 3);
        const baselineTotal = baselineArr.reduce((s, v) => s + Number(v || 0), 0);
        playerBaselineTotals[pnum] = baselineTotal;
        
        // For tiebreaker ranking, we need to consider the tiebreaker scores
        let total = baselineTotal;
        // If this is a tiebreaker match, include the tiebreaker score in the total for ranking
        if (isTiebreakerMatch && tiebreak.tiebreakerScores && tiebreak.tiebreakerScores[Number(pnum)] !== undefined) {
            total = baselineTotal + tiebreak.tiebreakerScores[Number(pnum)];
        }
        playerTotals[pnum] = total;
    });

    const sorted = tiebreakPlayers.slice().sort((a, b) => {
        const totalA = playerTotals[a] || 0;
        const totalB = playerTotals[b] || 0;
        if (totalB !== totalA) return totalB - totalA;
        return a - b;
    });

    tiebreak.currentRanking = sorted.map(pnum => ({ 
        playerNum: pnum, 
        total: playerTotals[pnum] || 0,
        baselineTotal: playerBaselineTotals[pnum] || 0
    }));

    const readyOverlay = document.getElementById('familyPartyReadyOverlay');
    if (readyOverlay) {
        const selectedPartyName = window.__selectedFamilyParty || partyName;
        const turnIndex = window.__familyPartyTurnIndex || 0;
        try { readyOverlay.remove(); } catch (e) {}
        try { 
            showPartyReadyPrompt(selectedPartyName, { turnIndex: turnIndex, isTiebreaker: true }); 
        } catch (e) { 
            console.warn('Failed re-showing ready prompt after tiebreak update', e); 
        }
    }
}

      function saveAdminEnable(value) {
        const normalized = value === 'no' ? 'no' : 'yes';
        localStorage.setItem(adminStorageKey, normalized);
        return normalized;
      }

      function getAdminStartScore() {
        if (getStoredAdminEnable() !== 'yes') {
          return 0;
        }

        
        const rawValue = localStorage.getItem(adminStartScoreStorageKey);
        const parsedValue = parseInt(rawValue, 10);
        if (Number.isFinite(parsedValue) && parsedValue >= 0) {
          return parsedValue;
        }
        localStorage.setItem(adminStartScoreStorageKey, '0');
        return 0;
      }

      function saveAdminStartScore(value) {
        const parsedValue = parseInt(value, 10);
        const safeValue = Number.isFinite(parsedValue) && parsedValue >= 0 ? parsedValue : 0;
        localStorage.setItem(adminStartScoreStorageKey, String(safeValue));
        return safeValue;
      }

      window.getStoredAdminEnable = getStoredAdminEnable;
      window.saveAdminEnable = saveAdminEnable;
      window.getAdminStartScore = getAdminStartScore;
      window.saveAdminStartScore = saveAdminStartScore;

            // Infinity star admin helpers
            const adminInfinityStorageKey = 'adminInfinity';
            const adminPrevStarsStorageKey = 'adminPrevStars';
            const adminUnlockAllPlanetsStorageKey = 'adminUnlockAllPlanets';
            const adminPrevUnlockStatusStorageKey = 'adminPrevUnlockStatus';
            const adminUnlockAllAchievementsStorageKey = 'adminUnlockAllAchievements';
            const adminPrevAchievementStatusStorageKey = 'adminPrevAchievementStatus';
            const adminPrevAchievementNewStorageKey = 'adminPrevAchievementNew';

            function getAdminInfinity() {
                const v = localStorage.getItem(adminInfinityStorageKey);
                if (v === 'yes') return 'yes';
                if (v === 'no') return 'no';
                localStorage.setItem(adminInfinityStorageKey, 'no');
                return 'no';
            }

            function saveAdminInfinity(value) {
                const normalized = value === 'yes' ? 'yes' : 'no';
                localStorage.setItem(adminInfinityStorageKey, normalized);
                return normalized;
            }

            function saveAdminPrevStars(val) {
                try {
                    localStorage.setItem(adminPrevStarsStorageKey, String(val));
                } catch (e) { console.warn('Failed saving prev stars', e); }
            }

            function getAdminPrevStars() {
                const raw = localStorage.getItem(adminPrevStarsStorageKey);
                const parsed = parseInt(raw, 10);
                return Number.isFinite(parsed) ? parsed : 0;
            }

            function getAdminUnlockAllPlanets() {
                const v = localStorage.getItem(adminUnlockAllPlanetsStorageKey);
                if (v === 'yes') return 'yes';
                if (v === 'no') return 'no';
                localStorage.setItem(adminUnlockAllPlanetsStorageKey, 'no');
                return 'no';
            }

            function saveAdminUnlockAllPlanets(value) {
                const normalized = value === 'yes' ? 'yes' : 'no';
                localStorage.setItem(adminUnlockAllPlanetsStorageKey, normalized);
                return normalized;
            }

            function saveAdminPrevUnlockStatus(value) {
                try {
                    const normalized = Array.isArray(value) ? value.slice(0, planetData.length) : [];
                    localStorage.setItem(adminPrevUnlockStatusStorageKey, JSON.stringify(normalized));
                } catch (e) { console.warn('Failed saving previous unlock status', e); }
            }

            function getAdminPrevUnlockStatus() {
                try {
                    const raw = localStorage.getItem(adminPrevUnlockStatusStorageKey);
                    if (!raw) return [];
                    const parsed = JSON.parse(raw);
                    return Array.isArray(parsed) ? parsed : [];
                } catch (e) {
                    console.warn('Failed reading previous unlock status', e);
                    return [];
                }
            }

            function applyAdminUnlockAllPlanets() {
                if (getAdminUnlockAllPlanets() !== 'yes') return false;
                const nextUnlockState = planetData.map((planet) => planet.key === 'pluto' ? false : true);
                unlocked = nextUnlockState;
                saveGameData();
                if (typeof refreshPlanetGrid === 'function') refreshPlanetGrid();
                if (typeof updateProfileDisplay === 'function') updateProfileDisplay();
                if (typeof updateMenuButtons === 'function') updateMenuButtons();
                return true;
            }

            function restoreAdminUnlockAllPlanets() {
                const previousState = getAdminPrevUnlockStatus();
                if (Array.isArray(previousState) && previousState.length >= planetData.length) {
                    unlocked = previousState.slice(0, planetData.length);
                } else {
                    unlocked = planetData.map((p, i) => i === 0);
                }
                if (!Array.isArray(unlocked) || unlocked.length < planetData.length) {
                    unlocked = planetData.map((p, i) => i === 0);
                }
                if (unlocked[0] !== true) unlocked[0] = true;
                saveGameData();
                if (typeof refreshPlanetGrid === 'function') refreshPlanetGrid();
                if (typeof updateProfileDisplay === 'function') updateProfileDisplay();
                if (typeof updateMenuButtons === 'function') updateMenuButtons();
                return true;
            }

            function getAdminUnlockAllAchievements() {
                const v = localStorage.getItem(adminUnlockAllAchievementsStorageKey);
                if (v === 'yes') return 'yes';
                if (v === 'no') return 'no';
                localStorage.setItem(adminUnlockAllAchievementsStorageKey, 'no');
                return 'no';
            }

            function saveAdminUnlockAllAchievements(value) {
                const normalized = value === 'yes' ? 'yes' : 'no';
                localStorage.setItem(adminUnlockAllAchievementsStorageKey, normalized);
                return normalized;
            }

            function saveAdminPrevAchievementState(statusState, newState) {
                try {
                    const statusSnapshot = {};
                    const newSnapshot = {};
                    const statusSource = statusState && typeof statusState === 'object' ? statusState : {};
                    const newSource = newState && typeof newState === 'object' ? newState : {};
                    achievements.forEach((achievement) => {
                        statusSnapshot[achievement.key] = Boolean(statusSource[achievement.key]);
                        newSnapshot[achievement.key] = Boolean(newSource[achievement.key]);
                    });
                    localStorage.setItem(adminPrevAchievementStatusStorageKey, JSON.stringify(statusSnapshot));
                    localStorage.setItem(adminPrevAchievementNewStorageKey, JSON.stringify(newSnapshot));
                } catch (e) { console.warn('Failed saving previous achievement state', e); }
            }

            function getAdminPrevAchievementState() {
                try {
                    const statusRaw = localStorage.getItem(adminPrevAchievementStatusStorageKey);
                    const newRaw = localStorage.getItem(adminPrevAchievementNewStorageKey);
                    const statusObj = statusRaw ? JSON.parse(statusRaw) : {};
                    const newObj = newRaw ? JSON.parse(newRaw) : {};
                    return {
                        status: statusObj && typeof statusObj === 'object' ? statusObj : {},
                        new: newObj && typeof newObj === 'object' ? newObj : {}
                    };
                } catch (e) {
                    console.warn('Failed reading previous achievement state', e);
                    return { status: {}, new: {} };
                }
            }

            function applyAdminUnlockAllAchievements() {
                if (getAdminUnlockAllAchievements() !== 'yes') return false;
                achievementStatus = {};
                achievementNew = {};
                achievements.forEach((achievement) => {
                    achievementStatus[achievement.key] = true;
                    achievementNew[achievement.key] = false;
                });
                saveGameData();
                if (typeof refreshAchievementGrid === 'function') refreshAchievementGrid();
                if (typeof updateProfileDisplay === 'function') updateProfileDisplay();
                return true;
            }

            function restoreAdminUnlockAllAchievements() {
                const previousState = getAdminPrevAchievementState();
                achievementStatus = {};
                achievementNew = {};
                achievements.forEach((achievement) => {
                    achievementStatus[achievement.key] = Boolean(previousState.status[achievement.key]);
                    achievementNew[achievement.key] = Boolean(previousState.new[achievement.key]);
                });
                saveGameData();
                if (typeof refreshAchievementGrid === 'function') refreshAchievementGrid();
                if (typeof updateProfileDisplay === 'function') updateProfileDisplay();
                return true;
            }

            // Update all star UI elements consistently
            function updateStarsUI() {
                const isInf = getAdminInfinity() === 'yes';
                const display = isInf ? '∞' : (typeof totalStars === 'number' ? String(totalStars) : String(parseInt(localStorage.getItem('solarFlyTotalStars')||'0',10)));
                const prefix = isInf ? '⭐ ' : '⭐ ';
                const starsText = prefix + display;
                try { if (starsDisplay) starsDisplay.textContent = starsText; } catch (e) {}
                try { if (menuStars) menuStars.textContent = starsText; } catch (e) {}
                try { const profileEl = document.getElementById('profileTotalStars'); if (profileEl) profileEl.textContent = display; } catch (e) {}
            }

            window.getAdminInfinity = getAdminInfinity;
            window.saveAdminInfinity = saveAdminInfinity;
            window.getAdminPrevStars = getAdminPrevStars;
            window.saveAdminPrevStars = saveAdminPrevStars;
            window.getAdminUnlockAllPlanets = getAdminUnlockAllPlanets;
            window.saveAdminUnlockAllPlanets = saveAdminUnlockAllPlanets;
            window.saveAdminPrevUnlockStatus = saveAdminPrevUnlockStatus;
            window.getAdminPrevUnlockStatus = getAdminPrevUnlockStatus;
            window.applyAdminUnlockAllPlanets = applyAdminUnlockAllPlanets;
            window.restoreAdminUnlockAllPlanets = restoreAdminUnlockAllPlanets;
            window.getAdminUnlockAllAchievements = getAdminUnlockAllAchievements;
            window.saveAdminUnlockAllAchievements = saveAdminUnlockAllAchievements;
            window.saveAdminPrevAchievementState = saveAdminPrevAchievementState;
            window.getAdminPrevAchievementState = getAdminPrevAchievementState;
            window.applyAdminUnlockAllAchievements = applyAdminUnlockAllAchievements;
            window.restoreAdminUnlockAllAchievements = restoreAdminUnlockAllAchievements;
            window.updateStarsUI = updateStarsUI;

      function initAdminPanel() {
        const adminPanelBody = document.getElementById('adminPanelBody');
        const passwordRow = document.getElementById('adminPasswordRow');
        const statusMessage = document.getElementById('adminStatusMessage');

        if (!adminPanelBody || !passwordRow || !statusMessage) {
          return;
        }

        const setStatus = (message, tone = 'info') => {
          statusMessage.textContent = message || '';
          statusMessage.className = 'settings-admin-status';
          if (tone === 'success') {
            statusMessage.classList.add('is-success');
          } else if (tone === 'error') {
            statusMessage.classList.add('is-error');
          } else {
            statusMessage.classList.add('is-info');
          }
        };

        const storageKey = 'adminenable';
        const startScoreStorageKey = 'adminstartscore';

        const getStoredAdminEnable = () => {
          const savedValue = localStorage.getItem(storageKey);
          if (savedValue === 'yes') return 'yes';
          if (savedValue === 'no') return 'no';
          localStorage.setItem(storageKey, 'no');
          return 'no';
        };

        const saveAdminEnable = (value) => {
          const normalized = value === 'no' ? 'no' : 'yes';
          localStorage.setItem(storageKey, normalized);
          return normalized;
        };

        const getAdminStartScore = () => {
          if (getStoredAdminEnable() !== 'yes') {
            return 0;
          }
          const rawValue = localStorage.getItem(startScoreStorageKey);
          const parsedValue = parseInt(rawValue, 10);
          if (Number.isFinite(parsedValue) && parsedValue >= 0) {
            return parsedValue;
          }
          localStorage.setItem(startScoreStorageKey, '0');
          return 0;
        };

        const saveAdminStartScore = (value) => {
          const parsedValue = parseInt(value, 10);
          const safeValue = Number.isFinite(parsedValue) && parsedValue >= 0 ? parsedValue : 0;
          localStorage.setItem(startScoreStorageKey, String(safeValue));
          return safeValue;
        };

        const renderInitialState = () => {
          passwordRow.innerHTML = `
            <button id="adminEnterBtn" class="settings-admin-btn" type="button">Enter ⭐</button>
          `;
          const enterButton = document.getElementById('adminEnterBtn');
          if (enterButton) {
            enterButton.addEventListener('click', () => {
              renderPasswordPrompt();
            });
          }
        };

        const renderUnlockedControl = (value = getStoredAdminEnable()) => {
          const normalizedValue = value === 'no' ? 'no' : 'yes';
          passwordRow.innerHTML = `
            <div class="settings-admin-toggle-row">
              <label class="settings-admin-label" for="adminEnableSelect">Enable</label>
              <select id="adminEnableSelect" class="settings-admin-select">
                <option value="yes" ${normalizedValue === 'yes' ? 'selected' : ''}>Yes</option>
                <option value="no" ${normalizedValue === 'no' ? 'selected' : ''}>No</option>
              </select>
            </div>
            <div class="settings-admin-toggle-row">
              <label class="settings-admin-label" for="adminStartScoreInput">Start score</label>
              <input id="adminStartScoreInput" class="settings-admin-input" type="number" min="0" step="1" value="${getAdminStartScore()}">
            </div>
                        <div class="settings-admin-toggle-row">
                            <label class="settings-admin-label" for="adminInfinitySelect">Infinity stars</label>
                            <select id="adminInfinitySelect" class="settings-admin-select">
                                <option value="no" ${getAdminInfinity() === 'no' ? 'selected' : ''}>Off</option>
                                <option value="yes" ${getAdminInfinity() === 'yes' ? 'selected' : ''}>On</option>
                            </select>
                        </div>
                        <div class="settings-admin-toggle-row">
                            <label class="settings-admin-label" for="adminUnlockAllPlanetsSelect">Unlock all planets</label>
                            <select id="adminUnlockAllPlanetsSelect" class="settings-admin-select">
                                <option value="no" ${getAdminUnlockAllPlanets() === 'no' ? 'selected' : ''}>Off</option>
                                <option value="yes" ${getAdminUnlockAllPlanets() === 'yes' ? 'selected' : ''}>On</option>
                            </select>
                        </div>
                        <div class="settings-admin-toggle-row">
                            <label class="settings-admin-label" for="adminUnlockAllAchievementsSelect">Unlock all achievements</label>
                            <select id="adminUnlockAllAchievementsSelect" class="settings-admin-select">
                                <option value="no" ${getAdminUnlockAllAchievements() === 'no' ? 'selected' : ''}>Off</option>
                                <option value="yes" ${getAdminUnlockAllAchievements() === 'yes' ? 'selected' : ''}>On</option>
                            </select>
                        </div>
          `;
          const select = document.getElementById('adminEnableSelect');
          const startScoreInput = document.getElementById('adminStartScoreInput');
                    const infinitySelect = document.getElementById('adminInfinitySelect');
                    const unlockAllPlanetsSelect = document.getElementById('adminUnlockAllPlanetsSelect');
                    const unlockAllAchievementsSelect = document.getElementById('adminUnlockAllAchievementsSelect');
          if (select) {
            select.addEventListener('change', (event) => {
              const selectedValue = saveAdminEnable(event.target.value);
              if (selectedValue === 'no') {
                setStatus('Admin disabled. Enter password again to change this setting.', 'info');
                saveAdminInfinity('no');
                saveAdminUnlockAllPlanets('no');
                saveAdminUnlockAllAchievements('no');
                try {
                    restoreAdminUnlockAllPlanets();
                    restoreAdminUnlockAllAchievements();
                    updateStarsUI();
                } catch (e) { console.warn('Error updating admin UI on disable', e); }
                renderInitialState();
              } else {
                setStatus('Admin enabled.', 'success');
                renderUnlockedControl('yes');
              }
            });
          }
                    if (infinitySelect) {
                        infinitySelect.addEventListener('change', (event) => {
                            const v = String(event.target.value) === 'yes' ? 'yes' : 'no';
                            saveAdminInfinity(v);
                            try {
                                updateStarsUI();
                                setStatus(v === 'yes' ? 'Infinity stars enabled.' : 'Infinity stars disabled.', v === 'yes' ? 'success' : 'info');
                            } catch (e) {
                                console.warn('Failed to update infinity star UI', e);
                                setStatus('Unable to update infinity star mode.', 'error');
                            }
                        });
                    }
                    if (unlockAllPlanetsSelect) {
                        unlockAllPlanetsSelect.addEventListener('change', (event) => {
                            const v = String(event.target.value) === 'yes' ? 'yes' : 'no';
                            if (v === 'yes') {
                                try {
                                    const currentUnlockState = Array.isArray(unlocked) ? unlocked.slice(0, planetData.length) : [];
                                    if (!Array.isArray(getAdminPrevUnlockStatus()) || getAdminPrevUnlockStatus().length < planetData.length) {
                                        saveAdminPrevUnlockStatus(currentUnlockState);
                                    }
                                    saveAdminUnlockAllPlanets('yes');
                                    applyAdminUnlockAllPlanets();
                                    setStatus('All planets unlocked except Pluto.', 'success');
                                } catch (e) {
                                    console.warn('Failed to unlock all planets', e);
                                    setStatus('Unable to unlock all planets.', 'error');
                                }
                            } else {
                                try {
                                    saveAdminUnlockAllPlanets('no');
                                    restoreAdminUnlockAllPlanets();
                                    setStatus('Planet unlocks restored.', 'info');
                                } catch (e) {
                                    console.warn('Failed to restore planet unlocks', e);
                                    setStatus('Unable to restore planet unlocks.', 'error');
                                }
                            }
                        });
                    }
                    if (unlockAllAchievementsSelect) {
                        unlockAllAchievementsSelect.addEventListener('change', (event) => {
                            const v = String(event.target.value) === 'yes' ? 'yes' : 'no';
                            if (v === 'yes') {
                                try {
                                    saveAdminPrevAchievementState(achievementStatus, achievementNew);
                                    saveAdminUnlockAllAchievements('yes');
                                    applyAdminUnlockAllAchievements();
                                    setStatus('All achievements unlocked.', 'success');
                                } catch (e) {
                                    console.warn('Failed to unlock all achievements', e);
                                    setStatus('Unable to unlock all achievements.', 'error');
                                }
                            } else {
                                try {
                                    saveAdminUnlockAllAchievements('no');
                                    restoreAdminUnlockAllAchievements();
                                    setStatus('Achievement unlocks restored.', 'info');
                                } catch (e) {
                                    console.warn('Failed to restore achievement unlocks', e);
                                    setStatus('Unable to restore achievement unlocks.', 'error');
                                }
                            }
                        });
                    }
          if (startScoreInput) {
            startScoreInput.addEventListener('change', (event) => {
              const savedValue = saveAdminStartScore(event.target.value);
              setStatus(`Start score saved as ${savedValue}.`, 'success');
            });
          }
        };

        const renderPasswordPrompt = () => {
          passwordRow.innerHTML = `
            <input id="adminPasswordInput" class="settings-admin-input" type="password" placeholder="Enter password" autocomplete="off">
            <button id="adminEnterBtn" class="settings-admin-btn" type="button">Enter ⭐</button>
          `;
          const passwordInputEl = document.getElementById('adminPasswordInput');
          const enterButtonEl = document.getElementById('adminEnterBtn');
          if (passwordInputEl) {
            passwordInputEl.focus();
            passwordInputEl.addEventListener('keydown', (event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                handlePasswordSubmit();
              }
            });
          }
          if (enterButtonEl) {
            enterButtonEl.addEventListener('click', handlePasswordSubmit);
          }
        };

        const handlePasswordSubmit = async () => {
          const passwordInputEl = document.getElementById('adminPasswordInput');
          const password = passwordInputEl ? passwordInputEl.value.trim() : '';

          if (!password) {
            setStatus('Please enter a password.', 'error');
            return;
          }

          try {
            const firebaseInstance = window.firebase;
            if (!firebaseInstance || !firebaseInstance.db || typeof firebaseInstance.doc !== 'function' || typeof firebaseInstance.getDoc !== 'function') {
              setStatus('Firebase is unavailable right now.', 'error');
              return;
            }

            const passwordDocRef = firebaseInstance.doc(firebaseInstance.db, 'password', 'solaradmin');
            const snapshot = await firebaseInstance.getDoc(passwordDocRef);
            const storedPassword = snapshot.exists() ? String(snapshot.data().password || '') : '';

            if (storedPassword && storedPassword.trim() === password) {
              saveAdminEnable('yes');
              setStatus('Password accepted.', 'success');
              renderUnlockedControl('yes');
            } else {
              setStatus('Wrong pass', 'error');
              if (passwordInputEl) {
                passwordInputEl.value = '';
              }
            }
          } catch (error) {
            console.error('Admin password check failed', error);
            setStatus('Unable to verify password right now.', 'error');
          }
        };

        const currentState = getStoredAdminEnable();
        if (currentState === 'yes') {
          setStatus('Admin enabled.', 'success');
          renderUnlockedControl('yes');
        } else {
          setStatus('Admin disabled. Enter password to enable it.', 'info');
          renderInitialState();
        }
      }

            // Centralized star updater that preserves actual star progress and only displays infinity in UI when enabled.
            function addStars(amount) {
                try {
                    const delta = Number.isFinite(Number(amount)) ? Number(amount) : parseInt(amount || '0', 10) || 0;
                    totalStars = (Number.isFinite(Number(totalStars)) ? Number(totalStars) : parseInt(localStorage.getItem('solarFlyTotalStars')||'0',10) || 0) + delta;
                    saveGameData();
                    updateStarsUI();
                } catch (e) {
                    console.warn('addStars failed', e);
                }
            }

            window.addStars = addStars;
      const billingApi = {
        isAvailable() {
          if (typeof window.Android === 'undefined') return false;
          if (typeof window.Android.isBillingAvailable !== 'function') return false;
          try {
            return !!window.Android.isBillingAvailable();
          } catch (e) {
            console.warn('Billing availability check failed', e);
            return false;
          }
        },
        canAccess() {
          return this.isAvailable();
        },
        buySubscription(productId) {
          if (!this.canAccess()) return false;
          try {
            return window.Android.purchaseSubscription(productId);
          } catch (e) {
            console.warn('Subscription purchase call failed', e);
            return false;
          }
        },
        buyOneTime(productId) {
          if (!this.canAccess()) return false;
          try {
            return window.Android.purchaseOneTimeProduct(productId);
          } catch (e) {
            console.warn('One-time purchase call failed', e);
            return false;
          }
        },
        restore() {
          if (!this.canAccess()) return false;
          try {
            return window.Android.restorePurchases();
          } catch (e) {
            console.warn('Restore purchases call failed', e);
            return false;
          }
        }
      };

      window.SolarFlyBilling = billingApi;
      window.requestInAppPurchaseAccess = function () {
        return billingApi.canAccess();
      };
      window.buySubscription = function (productId) {
        return billingApi.buySubscription(productId);
      };
      window.buyOneTimePurchase = function (productId) {
        return billingApi.buyOneTime(productId);
      };
      window.restoreBillingPurchases = function () {
        return billingApi.restore();
      };

            window.addEventListener('DOMContentLoaded', function () {
                if (typeof window.Android !== 'undefined') {
                    window.SolarFlyBilling = billingApi;
                }
                initAdminPanel();
                try { if (typeof initHowToCreateVideoControls === 'function') initHowToCreateVideoControls(); } catch (e) { console.warn('initHowToCreateVideoControls failed', e); }
            });
    })();
  

  // --- ELEMENT REFERENCES ---
  const canvas=document.getElementById('c'),ctx=canvas.getContext('2d');
  const menu=document.getElementById('menu'),playBtn=document.getElementById('playBtn');
  const planetsBtn=document.getElementById('planetsBtn'),difficultyBtn=document.getElementById('difficultyBtn');
  const scorePanel=document.getElementById('scorePanel'),scoreTxt=document.getElementById('scoreTxt');
  const starsDisplay=document.getElementById('starsDisplay'),volumeBtn=document.getElementById('volumeBtn'),volumeBtnFixed=document.getElementById('volumeBtnFixed');
  const quitBtn=document.getElementById('quitBtn');
  const gameOver=document.getElementById('gameOver'),finalScore=document.getElementById('finalScore');
  const deathTypeLabel=document.getElementById('deathTypeLabel');
  const playAgainBtn=document.getElementById('playAgainBtn'),backMenuBtn=document.getElementById('backMenuBtn');
  const planetMenu=document.getElementById('planetMenu'),planetGrid=document.getElementById('planetGrid');
  const closePlanetBtn=document.getElementById('closePlanetBtn');
  const difficultyMenu=document.getElementById('difficultyMenu'),closeDiffBtn=document.getElementById('closeDiffBtn');
  const highScoreDisplay=document.getElementById('highScoreDisplay');
  const newHighScoreOverlay=document.getElementById('newHighScoreOverlay');
  const newHighScoreValue=document.getElementById('newHighScoreValue');
  const newHighScoreText=document.getElementById('newHighScoreText');
  const newHighScoreSubtext=document.getElementById('newHighScoreSubtext');
  let newHighScoreCallback = null;
  if (newHighScoreOverlay) {
      newHighScoreOverlay.addEventListener('pointerdown', () => {
          if (audioOn) playSound('tap');
          hideNewHighScoreOverlay();
      });
  }
  const profileNameDisplay = document.getElementById('profileName');
  const menuStars = document.getElementById('menuStars');
  const socialMenuBtn = document.getElementById('socialMenuBtn');
  const socialMediaOverlay = document.getElementById('socialMediaOverlay');
  const closeSocialMediaBtn = document.getElementById('closeSocialMediaBtn');
  const settingsMenuBtn = document.getElementById('settingsMenuBtn');
  const settingsOverlay = document.getElementById('settingsOverlay');
  const closeSettingsBtn = document.getElementById('closeSettingsBtn');
  const settingsSectionButtons = Array.from(document.querySelectorAll('.settings-nav-btn'));
  const settingsSectionPanels = Array.from(document.querySelectorAll('.settings-section-panel'));
  const globalMusicToggleBtn = document.getElementById('globalMusicToggleBtn');
  const bgMusicToggleBtn = document.getElementById('bgMusicToggleBtn');
  const sfxToggleBtn = document.getElementById('sfxToggleBtn');
  const masterVolumeSlider = document.getElementById('masterVolumeSlider');
  const masterVolumeValue = document.getElementById('masterVolumeValue');
  const classicGameModeBtn = document.getElementById('classicGameModeBtn');
  const familyGameModeBtn = document.getElementById('familyGameModeBtn');
  const touchControlsBtn = document.getElementById('touchControlsBtn');
  const buttonControlsBtn = document.getElementById('buttonControlsBtn');
  const journeyBoardToggleBtn = document.getElementById('journeyBoardToggleBtn');
  const reviveButtonToggleBtn = document.getElementById('reviveButtonToggleBtn');
  const enableAddOnsToggleBtn = document.getElementById('enableAddOnsToggleBtn');
  const journeyBoardElement = document.getElementById('journeyBoard');
  const gameModeStorageKey = 'solarFlyGameMode';
  const gameplayControlsStorageKey = 'solarFlyGameplayControls';
  const textureSystemStorageKey = 'solarFlyTextureSystem';
  const textureSystemForceStorageKey = 'solarFlyForceTextureSystem';
  const halloweenStartDate = { month: 9, day: 27 };
  const halloweenEndDate = { month: 10, day: 13 };
  let gameMode = localStorage.getItem(gameModeStorageKey) === 'family' ? 'family' : 'classic';
  let gameplayControls = localStorage.getItem(gameplayControlsStorageKey) === 'button' ? 'button' : 'touch';
  let textureSystem = 'default';

  function getHalloweenTextureSystemForDate(date = new Date()) {
      const start = new Date(date.getFullYear(), halloweenStartDate.month, halloweenStartDate.day, 0, 0, 0, 0);
      const end = new Date(date.getFullYear(), halloweenEndDate.month, halloweenEndDate.day, 23, 59, 59, 999);
      return date >= start && date <= end ? 'halloween' : 'default';
  }

  function getTextureSystem() {
      const forcedValue = localStorage.getItem(textureSystemForceStorageKey);
      if (forcedValue === 'halloween' || forcedValue === 'default') {
          textureSystem = forcedValue;
          if (localStorage.getItem(textureSystemStorageKey) !== forcedValue) {
              localStorage.setItem(textureSystemStorageKey, forcedValue);
          }
          return textureSystem;
      }

      const savedValue = localStorage.getItem(textureSystemStorageKey);
      const currentSeasonValue = getHalloweenTextureSystemForDate();
      const normalizedSaved = savedValue === 'halloween' || savedValue === 'default' ? savedValue : null;
      const effectiveValue = normalizedSaved || currentSeasonValue;
      if (savedValue !== effectiveValue) {
          localStorage.setItem(textureSystemStorageKey, effectiveValue);
      }
      textureSystem = effectiveValue;
      return textureSystem;
  }

  function setTextureSystem(value) {
      const normalized = value === 'halloween' ? 'halloween' : 'default';
      if (textureSystem === normalized && localStorage.getItem(textureSystemStorageKey) === normalized) {
          return textureSystem;
      }
      textureSystem = normalized;
      localStorage.setItem(textureSystemStorageKey, normalized);
      applyTextureSystem();
      return textureSystem;
  }

  function applyTextureSystem() {
      const activeTextureSystem = getTextureSystem();
      if (document.documentElement) {
          document.documentElement.setAttribute('data-texture-system', activeTextureSystem);
      }
      if (document.body) {
          document.body.setAttribute('data-texture-system', activeTextureSystem);
      }
      return activeTextureSystem;
  }

  function refreshTextureSystemByDate() {
      const detectedTextureSystem = getHalloweenTextureSystemForDate();
      const previousTextureSystem = textureSystem;
      if (detectedTextureSystem !== previousTextureSystem) {
          textureSystem = detectedTextureSystem;
          localStorage.setItem(textureSystemStorageKey, detectedTextureSystem);
          applyTextureSystem();
      } else {
          const savedValue = localStorage.getItem(textureSystemStorageKey);
          if (savedValue !== detectedTextureSystem) {
              localStorage.setItem(textureSystemStorageKey, detectedTextureSystem);
          }
          if (document.body && document.body.getAttribute('data-texture-system') !== detectedTextureSystem) {
              applyTextureSystem();
          }
      }
      return textureSystem;
  }

  textureSystem = getTextureSystem();
  applyTextureSystem();
  setInterval(refreshTextureSystemByDate, 1000);

  // ===== FAMILY MODE FUNCTIONS =====
  // These must be defined BEFORE restoreMenuButtonFunctions() is called

  function clearFamilyRoundOverlays() {
      const overlayIds = ['familyPartyReadyOverlay', 'familyPartyChooserOverlay', 'familySessionCompleteOverlay'];
      overlayIds.forEach(id => {
          const el = document.getElementById(id);
          if (el) el.remove();
      });
      if (gameOver) {
          gameOver.style.display = 'none';
          gameOver.style.background = 'rgba(0,0,0,0.8)';
      }
      if (pauseMenu) pauseMenu.style.display = 'none';
      if (menu) menu.style.display = 'none';
      isOnDeathScreen = false;
  }

  function handleFamilySessionComplete(party) {
      // Improved family session complete handling with tiebreaker animation
      clearFamilyRoundOverlays();
      const existing = document.getElementById('familySessionCompleteOverlay');
      if (existing) existing.remove();

      const overlay = document.createElement('div');
      overlay.id = 'familySessionCompleteOverlay';
      overlay.style.position = 'fixed';
      overlay.style.inset = '0';
      overlay.style.background = 'rgba(0,0,0,0.95)';
      overlay.style.zIndex = '200000';
      overlay.style.display = 'flex';
      overlay.style.alignItems = 'center';
      overlay.style.justifyContent = 'center';
      overlay.style.flexDirection = 'column';
      overlay.style.color = '#fff';
      overlay.style.textAlign = 'center';
      overlay.style.padding = '20px';

      const textEl = document.createElement('div');
      textEl.id = 'familyTiebreakerText';
      textEl.style.fontSize = '48px';
      textEl.style.fontWeight = '800';
      textEl.style.letterSpacing = '2px';
      textEl.style.opacity = '0';
      textEl.style.transition = 'opacity 400ms ease, transform 500ms cubic-bezier(.2,.9,.2,1)';
      textEl.style.transform = 'translateY(12px) scale(0.98)';
      overlay.appendChild(textEl);

      const subEl = document.createElement('div');
      subEl.id = 'familyTiebreakerSub';
      subEl.style.fontSize = '26px';
      subEl.style.marginTop = '18px';
      subEl.style.opacity = '0';
      subEl.style.transition = 'opacity 300ms ease';
      overlay.appendChild(subEl);

      document.body.appendChild(overlay);
      window.__familySessionComplete = true;

      // Mute background audio during the tiebreaker sequence and remember previous state
      let __prevBgMuted = null;
      let __prevBgPlaying = false;
      try {
          if (typeof bgAudio !== 'undefined' && bgAudio) {
              __prevBgMuted = Boolean(bgAudio.muted);
              __prevBgPlaying = !(bgAudio.paused);
              try { bgAudio.muted = true; } catch (e) {}
          }
          try { window.__familyTiebreakPrevBgMuted = __prevBgMuted; window.__familyTiebreakPrevBgPlaying = __prevBgPlaying; } catch (e) {}
      } catch (e) { console.warn('Failed to mute bgAudio for tiebreaker', e); }

      // Compute totals and detect ties
          try {
          const partyName = String(party && party.name || '');
          const partyScores = (window.__familyPartyScores || {})[partyName] || {};
          // Create a clean copy of scores without tiebreaker points
          // This ensures tiebreaker points are never permanently saved
          const cleanScores = {};
          const MAX_REGULAR_MATCHES_TB = 3;
          // For each player, keep only the regular matches (first 3)
          // Tiebreaker points are temporary and should NOT be saved
          const order = getFamilyTurnOrder(party) || [];
          order.forEach(pnum => {
              const arr = Array.isArray(partyScores[Number(pnum)]) ? partyScores[Number(pnum)] : [];
              cleanScores[Number(pnum)] = arr.slice(0, MAX_REGULAR_MATCHES_TB);
          });
          // Use current partyScores (including any tiebreak extra matches) to evaluate ties
          const totals = order.map(num => {
              const arr = Array.isArray(partyScores[Number(num)]) ? partyScores[Number(num)] : [];
              return { num: Number(num), total: arr.reduce((s, v) => s + Number(v || 0), 0) };
          });

          if (!totals || totals.length === 0) {
              textEl.textContent = 'Session Complete';
              textEl.style.opacity = '1';
              return;
          }

          const maxScore = Math.max.apply(null, totals.map(t => t.total));
          const tiedPlayers = totals.filter(t => t.total === maxScore).map(t => t.num);

          // Use an editable active list so we can switch to a different tied group for animation
          let activeTiedPlayers = tiedPlayers.slice();

          // Prepare display names
          const tiedNames = tiedPlayers.map(pnum => {
              const info = getFamilyPlayerInfo(party, pnum) || {};
              return String(info.name || ('Player ' + pnum));
          });

          if (tiedPlayers.length <= 1) {
              // No tie at top: check if there are other lower-score groups that are tied
              const groupsMap = {};
              totals.forEach(t => {
                  groupsMap[t.total] = groupsMap[t.total] || [];
                  groupsMap[t.total].push(t.num);
              });
              const groupsList = Object.keys(groupsMap).map(k => ({ total: Number(k), players: groupsMap[k] })).sort((a,b) => b.total - a.total);
              const nextTie = groupsList.find(g => Array.isArray(g.players) && g.players.length > 1 && g.total !== maxScore);
              if (nextTie) {
                  // Run a full tiebreak animation for the next tied group instead
                  const nextPlayers = nextTie.players.slice();
                  // switch the active tied players so the later TIEBREAKER SEQUENCE runs for this group
                  try { activeTiedPlayers = nextPlayers.slice(); } catch (e) { activeTiedPlayers = nextPlayers.slice(); }
                  // continue execution so the shared tiebreak animation code runs below
                  } else {
                  // Final family finish: use a custom 4-player podium reveal instead of the black screen
                  const finalTotals = totals.slice().sort((a, b) => b.total - a.total);
                  const finalOrder = finalTotals.map(item => {
                      const info = getFamilyPlayerInfo(party, item.num) || {};
                      return {
                          num: Number(item.num),
                          total: Number(item.total || 0),
                          name: String(info.name || `Player ${item.num}`),
                          icon: info.icon || '',
                          color: info.color || '#4dd0ff'
                      };
                  });

                  const isMultiPlayerFinish = Array.isArray(order) && order.length >= 2 && finalOrder.length >= 2;

                  const finalizeTiebreakState = () => {
                      try {
                          if (window.__familyTiebreak) {
                              const partyName = window.__familyTiebreak.partyName;
                              const partyScores = window.__familyPartyScores || {};
                              if (partyName && partyScores[partyName]) {
                                  const players = window.__familyTiebreak.players || [];
                                  players.forEach(pnum => {
                                      const pn = Number(pnum);
                                      if (partyScores[partyName][pn]) {
                                          partyScores[partyName][pn] = partyScores[partyName][pn].slice(0, 3);
                                      }
                                  });
                                  window.__familyPartyScores = partyScores;
                              }
                              if (window.__familyTiebreakerPoints) {
                                  delete window.__familyTiebreakerPoints[partyName];
                              }
                              try { window.__familyTiebreak.finished = true; } catch (e) {}
                              try { window.__familyTiebreak = null; } catch (e) { try { delete window.__familyTiebreak; } catch (ee) {} }
                          }
                      } catch (e) { console.warn('Failed cleaning up tiebreak scores', e); }
                  };

                  if (isMultiPlayerFinish) {
                      overlay.innerHTML = '';
                      overlay.style.background = 'radial-gradient(circle at 20% 18%, rgba(255,255,255,0.12), transparent 12%), radial-gradient(circle at 80% 30%, rgba(90,140,255,0.08), transparent 18%), linear-gradient(135deg, rgba(7,12,20,0.96), rgba(17,31,46,0.92), rgba(18,13,24,0.92))';
                      overlay.style.backdropFilter = 'blur(8px)';
                      overlay.style.cursor = 'default';

                      const stage = document.createElement('div');
                      stage.style.position = 'relative';
                      stage.style.width = 'min(92vw, 760px)';
                      stage.style.display = 'flex';
                      stage.style.alignItems = 'center';
                      stage.style.justifyContent = 'center';
                      stage.style.textAlign = 'center';
                      stage.style.color = '#fff';
                      stage.style.gap = '18px';

                      // Background styles for ranks (apply in order of reveal)
                      const rankBackgrounds = [
                          'linear-gradient(135deg, rgba(45,30,8,0.96), rgba(152,112,17,0.92), rgba(22,31,20,0.96))', // 1st
                          'linear-gradient(135deg, rgba(26,35,52,0.96), rgba(98,130,160,0.9), rgba(18,22,32,0.96))', // 2nd
                          'linear-gradient(135deg, rgba(58,33,14,0.96), rgba(121,74,36,0.9), rgba(24,20,18,0.96))', // 3rd
                          'linear-gradient(135deg, rgba(34,41,54,0.96), rgba(62,76,92,0.86), rgba(16,18,26,0.96))'  // 4th
                      ];

                      // Build rank sequence dynamically for available players (reveal lowest..highest)
                      const rankSequence = [];
                      for (let r = finalOrder.length; r >= 1; r--) {
                          rankSequence.push({ rank: r, background: rankBackgrounds[r - 1] || rankBackgrounds[rankBackgrounds.length - 1] });
                      }

                      let currentCard = null;
                      const revealRank = (entry, index) => {
                          // finalOrder is sorted descending (highest first), map rank -> index (rank 1 -> 0)
                          const player = finalOrder[entry.rank - 1];
                          if (!player) return;

                          const card = document.createElement('div');
                          card.style.width = 'min(88vw, 640px)';
                          card.style.minHeight = '420px';
                          card.style.borderRadius = '28px';
                          card.style.background = entry.background;
                          card.style.border = '1px solid rgba(255,255,255,0.12)';
                          card.style.boxShadow = '0 24px 60px rgba(0,0,0,0.4)';
                          card.style.display = 'flex';
                          card.style.flexDirection = 'column';
                          card.style.alignItems = 'center';
                          card.style.justifyContent = 'center';
                          card.style.padding = '24px';
                          card.style.opacity = '0';
                          card.style.transform = 'translateY(18px) scale(0.96)';
                          card.style.transition = 'opacity 420ms ease, transform 500ms cubic-bezier(.2,.9,.2,1)';

                          const badge = document.createElement('div');
                          badge.textContent = `Our ${entry.rank}${entry.rank === 1 ? 'st' : entry.rank === 2 ? 'nd' : entry.rank === 3 ? 'rd' : 'th'} Position Is`;
                          badge.style.fontSize = 'clamp(22px, 3.5vw, 36px)';
                          badge.style.fontWeight = '800';
                          badge.style.letterSpacing = '1.5px';
                          badge.style.marginBottom = '22px';
                          badge.style.textTransform = 'uppercase';
                          badge.style.opacity = '0.95';

                          const iconWrap = document.createElement('div');
                          iconWrap.style.width = '170px';
                          iconWrap.style.height = '170px';
                          iconWrap.style.borderRadius = '50%';
                          iconWrap.style.border = '4px solid rgba(255,255,255,0.18)';
                          iconWrap.style.boxShadow = '0 0 30px rgba(255,255,255,0.16)';
                          iconWrap.style.display = 'flex';
                          iconWrap.style.alignItems = 'center';
                          iconWrap.style.justifyContent = 'center';
                          iconWrap.style.overflow = 'hidden';
                          // If an explicit icon URL is present, use an <img> so we can detect load failures.
                          // Otherwise prefer a default avatar image if available, else fall back to player color + initials.
                          const defaultAvatar = (window.__defaultPlayerAvatar || '').trim();
                          const avatarSrc = player.icon || defaultAvatar || '';
                          if (avatarSrc) {
                              // clear background and add an <img> with object-fit cover
                              iconWrap.style.background = '';
                              const img = document.createElement('img');
                              img.src = avatarSrc;
                              img.alt = String(player.name || `P${player.num}`);
                              img.style.width = '100%';
                              img.style.height = '100%';
                              img.style.objectFit = 'cover';
                              img.style.display = 'block';
                              img.onerror = function() {
                                  try {
                                      if (img && img.parentNode) img.parentNode.removeChild(img);
                                  } catch (e) {}
                                  iconWrap.style.background = player.color || '#666';
                                  iconWrap.textContent = String(player.name || `P${player.num}`).slice(0,2).toUpperCase();
                              };
                              iconWrap.textContent = '';
                              iconWrap.appendChild(img);
                          } else {
                              iconWrap.style.background = player.color || '#666';
                              iconWrap.textContent = String(player.name || `P${player.num}`).slice(0,2).toUpperCase();
                          }
                          iconWrap.style.color = '#fff';
                          iconWrap.style.fontWeight = '900';
                          iconWrap.style.fontSize = '48px';

                          const nameText = document.createElement('div');
                          nameText.textContent = player.name;
                          nameText.style.fontSize = 'clamp(28px, 5vw, 54px)';
                          nameText.style.fontWeight = '900';
                          nameText.style.marginTop = '24px';
                          nameText.style.lineHeight = '1.1';
                          nameText.style.textShadow = '0 6px 18px rgba(0,0,0,0.35)';

                          const sparkle = document.createElement('div');
                          sparkle.textContent = '✦';
                          sparkle.style.fontSize = '32px';
                          sparkle.style.marginTop = '18px';
                          sparkle.style.opacity = '0.9';

                          card.appendChild(badge);
                          card.appendChild(iconWrap);
                          card.appendChild(nameText);
                          card.appendChild(sparkle);

                          if (currentCard && currentCard.parentNode) {
                              currentCard.parentNode.removeChild(currentCard);
                          }
                          stage.appendChild(card);
                          currentCard = card;

                          requestAnimationFrame(() => {
                              card.style.opacity = '1';
                              card.style.transform = 'translateY(0) scale(1)';
                          });

                          playFamilyFinishCue(index);
                      };

                      overlay.appendChild(stage);

                      rankSequence.forEach((entry, index) => {
                          setTimeout(() => {
                              revealRank(entry, index);
                          }, index * 2900); // wait 2.9s between reveals
                      });

                      setTimeout(() => {
                          try {
                              if (typeof bgAudio !== 'undefined' && bgAudio && __prevBgMuted !== null) {
                                  bgAudio.muted = __prevBgMuted;
                                  activeSoundsState.bgAudioWasPlaying = Boolean(__prevBgPlaying && audioOn);
                                  activeSoundsState.menuSoundWasPlaying = Boolean(sounds.menu && !sounds.menu.paused && !running);
                                  try { restoreActiveSounds(); } catch (ee) { console.warn('restoreActiveSounds failed after family finish', ee); }
                              }
                          } catch (e) { console.warn('Failed to restore bgAudio after family finish', e); }
                          finalizeTiebreakState();
                          setTimeout(() => {
                              try { overlay.remove(); } catch (e) {}
                              try { showMenu(); } catch (e) { console.warn('Failed to return to menu after family finish', e); }
                          }, 900);
                      }, rankSequence.length * 2900 + 900); // cleanup after sequence completes
                      return;
                  }

                  // Fallback for all other finishes: keep the result visible and let the user continue
                  try { overlay.style.background = 'black'; overlay.textContent = ''; } catch (e) {}
                  try { if (window.__familyTiebreak) window.__familyTiebreak.finished = true; } catch (e) {}
                  if (audioOn) try { playSound('unlock'); } catch (e) {}
                  setTimeout(() => {
                      try {
                              if (typeof bgAudio !== 'undefined' && bgAudio && __prevBgMuted !== null) {
                                      try { bgAudio.muted = __prevBgMuted; } catch (e) {}
                                      try {
                                          activeSoundsState.bgAudioWasPlaying = Boolean(__prevBgPlaying && audioOn);
                                          activeSoundsState.menuSoundWasPlaying = Boolean(sounds.menu && !sounds.menu.paused && !running);
                                          try { restoreActiveSounds(); } catch (ee) { console.warn('restoreActiveSounds failed after tiebreak', ee); }
                                      } catch (e) { console.warn('Error restoring bgAudio (tiebreak)', e); }
                                  }
                      } catch (e) { console.warn('Failed to restore bgAudio after winner', e); }
                      try {
                          overlay.style.cursor = 'pointer';
                          const cont = document.createElement('div');
                          cont.textContent = 'Tiebreak complete — tap to continue';
                          cont.style.position = 'absolute';
                          cont.style.bottom = '24px';
                          cont.style.left = '50%';
                          cont.style.transform = 'translateX(-50%)';
                          cont.style.padding = '10px 14px';
                          cont.style.borderRadius = '10px';
                          cont.style.background = 'rgba(0,0,0,0.6)';
                          cont.style.color = '#fff';
                          cont.style.fontWeight = '700';
                          cont.style.fontSize = '16px';
                          cont.style.pointerEvents = 'none';
                          overlay.appendChild(cont);
                          const onTap = function() {
                              try { if (audioOn) playSound('tap'); } catch (e) {}
                              try {
                                  if (window.__familyTiebreak) {
                                      try {
                                          const partyName = window.__familyTiebreak.partyName;
                                          const partyScores = window.__familyPartyScores || {};
                                          if (partyName && partyScores[partyName]) {
                                              const players = window.__familyTiebreak.players || [];
                                              players.forEach(pnum => {
                                                  const pn = Number(pnum);
                                                  if (partyScores[partyName][pn]) {
                                                      partyScores[partyName][pn] = partyScores[partyName][pn].slice(0, 3);
                                                  }
                                              });
                                              window.__familyPartyScores = partyScores;
                                          }
                                          if (window.__familyTiebreakerPoints) {
                                              delete window.__familyTiebreakerPoints[partyName];
                                          }
                                      } catch (e) { console.warn('Failed cleaning up tiebreak scores', e); }
                                      try { window.__familyTiebreak.finished = true; } catch (e) {}
                                      try { window.__familyTiebreak = null; } catch (e) { try { delete window.__familyTiebreak; } catch (ee) {} }
                                  }
                              } catch (e) {}
                              try { overlay.removeEventListener('click', onTap); } catch (e) {}
                              try { if (cont && cont.parentNode) cont.parentNode.removeChild(cont); } catch (e) {}
                              try { overlay.remove(); } catch (e) {}
                          };
                          try { overlay.addEventListener('click', onTap); } catch (e) {}
                      } catch (e) { console.warn('Failed adding continue affordance', e); }
                  }, 2200);
                  return;
              }
          }

          // TIEBREAKER SEQUENCE
          const showText = (txt, el = textEl, css = {}) => {
              el.textContent = txt;
              requestAnimationFrame(() => {
                  el.style.opacity = '1';
                  el.style.transform = 'translateY(0) scale(1)';
                  Object.keys(css).forEach(k => el.style[k] = css[k]);
              });
          };

          const hideText = (el = textEl) => {
              el.style.opacity = '0';
              el.style.transform = 'translateY(-20px) scale(0.98)';
          };

          // Ensure sounds exist (fall back to existing ones)
          if (!sounds.tiebreak) sounds.tiebreak = new Audio('music/noti.mp3');
          if (!sounds.announce) sounds.announce = new Audio('music/success-340660.mp3');
          [sounds.tiebreak, sounds.announce].forEach(s => { try { s.preload = 'auto'; } catch (e) {} });

          // Step 1: show "Tiebreaker" (show "Again, Tiebreaker" on repeat attempts)
          let attempt = 1;
          try {
              if (window.__familyTiebreak && String(window.__familyTiebreak.partyName || '') === partyName) {
                  attempt = Number(window.__familyTiebreak.attempt || 1) + 0; // keep attempt value if set
              }
          } catch (e) { attempt = 1; }

          // Determine prefix: if this tiebreak is for a different player group than the stored one, show "Next, ";
          // if it's the same group and attempt > 1, show "Again, ". Otherwise no prefix.
          let prefix = '';
          try {
              if (window.__familyTiebreak && Array.isArray(window.__familyTiebreak.players)) {
                  const prevPlayers = window.__familyTiebreak.players.map(Number);
                  const curPlayers = Array.isArray(activeTiedPlayers) ? activeTiedPlayers.map(Number) : [];
                  const sameGroup = prevPlayers.length === curPlayers.length && prevPlayers.every((v, i) => Number(v) === Number(curPlayers[i]));
                  if (!sameGroup && prevPlayers.length > 0) {
                      prefix = 'Next, ';
                  } else if (Number(window.__familyTiebreak.attempt || 1) > 1) {
                      prefix = 'Again, ';
                  }
              } else if (Number(window.__familyTiebreak && window.__familyTiebreak.attempt || 1) > 1) {
                  prefix = 'Again, ';
              }
          } catch (e) { prefix = (Number(window.__familyTiebreak && window.__familyTiebreak.attempt || 1) > 1) ? 'Again, ' : ''; }
          showText(prefix + 'Tiebreaker');
          if (audioOn) try { playSound('tiebreak'); } catch (e) {}

          // Step 2: after short delay remove text with effect, then show 'Between..'
          setTimeout(() => {
              if (audioOn) try { playSound('announce'); } catch (e) {}
              hideText(textEl);
              // show Between...
              setTimeout(() => {
                  showText('Between..', textEl);
                  // After another delay show the names
                  setTimeout(() => {
                      hideText(textEl);
                      // Render player icons + names
                      try {
                          subEl.innerHTML = '';
                          const listWrap = document.createElement('div');
                          listWrap.style.display = 'flex';
                          listWrap.style.flexDirection = 'row';
                          listWrap.style.gap = '18px';
                          listWrap.style.alignItems = 'center';
                          activeTiedPlayers.forEach(pnum => {
                              const info = getFamilyPlayerInfo(party, pnum) || {};
                              const item = document.createElement('div');
                              item.style.display = 'flex';
                              item.style.alignItems = 'center';
                              item.style.gap = '10px';

                              if (info.icon) {
                                  const img = document.createElement('img');
                                  img.src = info.icon;
                                  img.alt = info.name || ('Player ' + pnum);
                                  img.style.width = '56px';
                                  img.style.height = '56px';
                                  img.style.borderRadius = '50%';
                                  img.style.objectFit = 'cover';
                                  img.style.boxShadow = '0 2px 8px rgba(0,0,0,0.5)';
                                  // If the image fails to load, fall back to the CSS initials dot
                                  img.onerror = function() {
                                      try {
                                          const dot = document.createElement('div');
                                          dot.style.width = '56px';
                                          dot.style.height = '56px';
                                          dot.style.borderRadius = '50%';
                                          dot.style.background = info.color || '#1e90ff';
                                          dot.style.display = 'flex';
                                          dot.style.alignItems = 'center';
                                          dot.style.justifyContent = 'center';
                                          dot.style.color = '#fff';
                                          dot.style.fontWeight = '700';
                                          dot.style.fontSize = '18px';
                                          const initials = String(info.name || ('P' + pnum)).split(' ').map(s=>s[0]||'').slice(0,2).join('').toUpperCase();
                                          dot.textContent = initials;
                                          if (img.parentNode) img.parentNode.replaceChild(dot, img);
                                      } catch (e) { try { if (img.parentNode) img.parentNode.removeChild(img); } catch (ee) {} }
                                  };
                                  item.appendChild(img);
                              } else {
                                  const dot = document.createElement('div');
                                  dot.style.width = '56px';
                                  dot.style.height = '56px';
                                  dot.style.borderRadius = '50%';
                                  dot.style.background = info.color || '#1e90ff';
                                  dot.style.display = 'flex';
                                  dot.style.alignItems = 'center';
                                  dot.style.justifyContent = 'center';
                                  dot.style.color = '#fff';
                                  dot.style.fontWeight = '700';
                                  dot.style.fontSize = '18px';
                                  const initials = String(info.name || ('P' + pnum)).split(' ').map(s=>s[0]||'').slice(0,2).join('').toUpperCase();
                                  dot.textContent = initials;
                                  item.appendChild(dot);
                              }

                              const nameWrap = document.createElement('div');
                              nameWrap.style.fontSize = '20px';
                              nameWrap.style.fontWeight = '700';
                              nameWrap.textContent = info.name || ('Player ' + pnum);
                              item.appendChild(nameWrap);

                              listWrap.appendChild(item);
                          });
                          subEl.appendChild(listWrap);
                          subEl.style.opacity = '1';
                      } catch (e) {
                          subEl.textContent = tiedNames.join(' and ');
                          subEl.style.opacity = '1';
                      }
                      if (audioOn) try { playSound('unlock'); } catch (e) {}

                      // Initialize tiebreak state: baseline counts and played map
                      try {
                          const baseline = {};
                          activeTiedPlayers.forEach(pnum => {
                              const arr = Array.isArray(partyScores[Number(pnum)]) ? partyScores[Number(pnum)] : [];
                              // Baseline count = number of regular matches (max 3)
                              baseline[Number(pnum)] = Math.min(arr.length, 3);
                          });
                          window.__familyTiebreak = {
                              partyName: partyName,
                              players: activeTiedPlayers.slice(),
                              attempt: Number((window.__familyTiebreak && window.__familyTiebreak.attempt) || 1),
                              baselineCounts: baseline,
                              played: {},
                              finished: false  // Ensure this is set to false initially
                          };

                          // Start tiebreak by prompting the first tied player
                          const first = activeTiedPlayers[0];
                          const firstIdx = (order || getFamilyTurnOrder(party) || []).indexOf(Number(first));
                          setTimeout(() => {
                              try { showPartyReadyPrompt(String(party.name), { turnIndex: firstIdx }); } catch (e) { console.warn('Failed to start tiebreak ready prompt', e); }
                          }, 700);
                      } catch (e) {
                          console.warn('Failed initializing tiebreak state', e);
                          // Restore bg audio and clean up
                          try {
                              if (typeof bgAudio !== 'undefined' && bgAudio && __prevBgMuted !== null) {
                                  try { bgAudio.muted = __prevBgMuted; } catch (ee) {}
                                  try {
                                      activeSoundsState.bgAudioWasPlaying = Boolean(__prevBgPlaying && audioOn);
                                      activeSoundsState.menuSoundWasPlaying = Boolean(sounds.menu && !sounds.menu.paused && !running);
                                      try { restoreActiveSounds(); } catch (eee) { console.warn('restoreActiveSounds failed after tiebreak init failure', eee); }
                                  } catch (e) { console.warn('Error restoring bgAudio (tiebreak init failure)', e); }
                              }
                          } catch (ee) { console.warn('Failed to restore bgAudio after tiebreak init failure', ee); }
                          try { overlay.remove(); } catch (ee) {}
                      }
                  }, 1300);
              }, 700);
          }, 1400);
      } catch (e) {
          console.warn('handleFamilySessionComplete error', e);
      }
  }

  function getFamilyTurnOrder(party) {
      if (!party) return [];
      const rawOrder = Array.isArray(party.order) ? party.order.filter(n => Number.isFinite(Number(n))) : [];
      if (rawOrder.length > 0) {
          return rawOrder.map(Number);
      }
      const count = Number(party.players) || Math.max(1, Array.isArray(party.playersInfo) ? party.playersInfo.length : 1);
      return Array.from({ length: count }, (_, index) => index + 1);
  }

  function getFamilyPlayerInfo(party, playerNumber) {
      const playersInfo = Array.isArray(party && party.playersInfo) ? party.playersInfo : [];
      return playersInfo.find(player => Number(player.num) === Number(playerNumber)) || {
          num: Number(playerNumber),
          name: `Player ${playerNumber}`,
          icon: null,
          color: '#1e90ff'
      };
  }

  function showPartyReadyPrompt(selectedPartyName, options = {}) {
      // Ensure any blocking session-complete overlay is removed before showing Ready prompt
      try {
          const existingComplete = document.getElementById('familySessionCompleteOverlay');
          if (existingComplete) existingComplete.remove();
      } catch (e) { console.warn('Failed removing familySessionCompleteOverlay before ready prompt', e); }
      const parties = getSavedParties();
      const party = parties.find(p => String(p.name || '').toLowerCase() === String(selectedPartyName || '').toLowerCase()) || null;
      if (!party) {
          return false;
      }

      const order = getFamilyTurnOrder(party);
      const turnIndex = Number(options.turnIndex ?? Number(window.__familyPartyTurnIndex ?? 0));
      const normalizedTurnIndex = order.length > 0 ? ((turnIndex % order.length) + order.length) % order.length : 0;
      const activePlayerNumber = order[normalizedTurnIndex] || order[0] || 1;
      const activePlayer = getFamilyPlayerInfo(party, activePlayerNumber);
      const starterName = String(activePlayer.name || `Player ${activePlayerNumber}`).trim() || `Player ${activePlayerNumber}`;

      window.__selectedFamilyParty = String(party.name || selectedPartyName || '');
      window.__selectedFamilyStarter = starterName;
      window.__familyPartyTurnIndex = normalizedTurnIndex;
      window.__familyCurrentPlayerNum = activePlayerNumber;

      const readyOverlay = document.createElement('div');
      readyOverlay.id = 'familyPartyReadyOverlay';
      readyOverlay.style.position = 'fixed';
      readyOverlay.style.inset = '0';
      readyOverlay.style.display = 'flex';
      readyOverlay.style.alignItems = 'center';
      readyOverlay.style.justifyContent = 'center';
      readyOverlay.style.background = 'radial-gradient(circle at 20% 20%, rgba(110, 170, 255, 0.26), transparent 24%), radial-gradient(circle at 80% 30%, rgba(205, 120, 255, 0.18), transparent 20%), radial-gradient(circle at 50% 80%, rgba(120, 220, 255, 0.12), transparent 26%), linear-gradient(135deg, rgba(4,9,20,0.82), rgba(10,18,36,0.68), rgba(13,9,25,0.8))';
      readyOverlay.style.backdropFilter = 'blur(12px) saturate(1.2)';
      readyOverlay.style.webkitBackdropFilter = 'blur(12px) saturate(1.2)';
      readyOverlay.style.zIndex = '101010';
      readyOverlay.style.padding = '20px';
      readyOverlay.style.boxSizing = 'border-box';

      const panel = document.createElement('div');
      panel.style.width = 'min(92vw, 560px)';
      panel.style.minHeight = '62vh';
      panel.style.display = 'flex';
      panel.style.flexDirection = 'column';
      panel.style.alignItems = 'center';
      panel.style.justifyContent = 'center';
      panel.style.background = 'linear-gradient(180deg, rgba(8,16,32,0.98), rgba(16,26,44,0.96))';
      panel.style.borderRadius = '22px';
      panel.style.border = '1px solid rgba(120,190,255,0.3)';
      panel.style.boxShadow = '0 22px 60px rgba(0,0,0,0.5)';
      panel.style.textAlign = 'center';
      panel.style.padding = '32px 28px';
      panel.style.color = '#fff';

      const partyLabel = document.createElement('div');
      partyLabel.textContent = `Party: ${String(party.name || selectedPartyName || 'Selected Party')}`;
      partyLabel.style.fontSize = '17px';
      partyLabel.style.fontWeight = '700';
      partyLabel.style.opacity = '0.85';
      partyLabel.style.marginBottom = '18px';
      partyLabel.style.letterSpacing = '0.5px';

      const scoreBoard = document.createElement('div');
      scoreBoard.style.width = '100%';
      scoreBoard.style.display = 'flex';
      scoreBoard.style.flexDirection = 'column';
      scoreBoard.style.gap = '8px';
      scoreBoard.style.marginBottom = '22px';
      scoreBoard.style.padding = '12px';
      scoreBoard.style.background = 'rgba(18, 30, 54, 0.82)';
      scoreBoard.style.border = '1px solid rgba(120, 190, 255, 0.18)';
      scoreBoard.style.borderRadius = '16px';

      const scoreHeader = document.createElement('div');
      scoreHeader.textContent = 'Players Score';
      scoreHeader.style.fontSize = '13px';
      scoreHeader.style.fontWeight = '800';
      scoreHeader.style.textTransform = 'uppercase';
      scoreHeader.style.letterSpacing = '1px';
      scoreHeader.style.opacity = '0.8';
      scoreHeader.style.marginBottom = '4px';
      scoreBoard.appendChild(scoreHeader);

      const familyScores = window.__familyPartyScores && window.__familyPartyScores[String(party.name || selectedPartyName)]
          ? window.__familyPartyScores[String(party.name || selectedPartyName)]
          : {};

      // Build an array of players with total scores, then sort by total desc
      const playersSummary = order.map(playerNumber => {
          const player = getFamilyPlayerInfo(party, playerNumber);
          const hisScores = Array.isArray(familyScores[Number(playerNumber)]) ? familyScores[Number(playerNumber)] : [];
          const total = hisScores.reduce((sum, value) => sum + Number(value || 0), 0);
          return { playerNumber, player, hisScores, total };
      });

      // If a tiebreak is in progress or being displayed, avoid allowing tied-group players
      // to leapfrog players who were above the tie before the tiebreak started.
      let tiedSet = new Set();
      let preTieTotal = null;
      try {
          if (window.__familyTiebreak && window.__familyTiebreak.players && window.__familyTiebreak.baselineCounts) {
              const list = Array.isArray(window.__familyTiebreak.players) ? window.__familyTiebreak.players.map(Number) : [];
              list.forEach(n => tiedSet.add(Number(n)));
              // compute pre-tiebreak total from baselineCounts for the first tied player available
              const first = list[0];
              if (typeof first !== 'undefined' && window.__familyTiebreak.baselineCounts && party && party.name) {
                  try {
                      const fs = Number(first);
                      const baselineCount = Number(window.__familyTiebreak.baselineCounts[fs] || 0);
                      const arr = Array.isArray(familyScores[fs]) ? familyScores[fs] : [];
                      preTieTotal = arr.slice(0, baselineCount).reduce((s, v) => s + Number(v || 0), 0);
                  } catch (e) { preTieTotal = null; }
              }
          }
      } catch (e) { tiedSet = new Set(); preTieTotal = null; }

      // While a tiebreak is active (and not yet finalized), treat tiebreak-added points as provisional:
      // for players in the tied set, display totals using only the baseline counts so non-tied
      // players do not get displaced by provisional tiebreak points until the tiebreak is acknowledged.
      try {
          const tb = window.__familyTiebreak;
          if (tb && tb.baselineCounts && !tb.finished) {
              playersSummary.forEach(ps => {
                  if (tiedSet.has(Number(ps.playerNumber))) {
                      try {
                          const pn = Number(ps.playerNumber);
                          const baselineCount = Number(tb.baselineCounts[pn] || 0);
                          if (baselineCount >= 0 && Array.isArray(ps.hisScores)) {
                              ps.total = ps.hisScores.slice(0, baselineCount).reduce((s, v) => s + Number(v || 0), 0);
                          }
                      } catch (e) { /* ignore */ }
                  }
              });
          }
      } catch (e) {}

      playersSummary.sort((a, b) => {
          // NEW: Ranking logic that properly handles tiebreaker positions
          // First, get the pre-tiebreak totals for tied players
          const preTieTotals = {};
          if (window.__familyTiebreak && window.__familyTiebreak.baselineCounts) {
              const tb = window.__familyTiebreak;
              const partyName = String(party.name || selectedPartyName || '');
              const familyScores = window.__familyPartyScores && window.__familyPartyScores[partyName] ? window.__familyPartyScores[partyName] : {};
              
              // Get the pre-tiebreak totals for all players (what they had before tiebreaker started)
              order.forEach(pnum => {
                  const arr = Array.isArray(familyScores[Number(pnum)]) ? familyScores[Number(pnum)] : [];
                  const baselineCount = tb.baselineCounts && tb.baselineCounts[Number(pnum)] !== undefined 
                      ? Number(tb.baselineCounts[Number(pnum)]) 
                      : arr.length;
                  const baselineArr = arr.slice(0, baselineCount);
                  const total = baselineArr.reduce((s, v) => s + Number(v || 0), 0);
                  preTieTotals[Number(pnum)] = total;
              });
          }

          // Now sort players with proper tiebreaker ranking
          const aNum = Number(a.playerNumber);
          const bNum = Number(b.playerNumber);
          const aInTiebreak = tiedSet.has(aNum);
          const bInTiebreak = tiedSet.has(bNum);

          // CASE 1: Both players are in the tiebreak group
          if (aInTiebreak && bInTiebreak) {
              if (b.total !== a.total) return b.total - a.total;
              return aNum - bNum;
          }

          // CASE 2: Neither player is in the tiebreak group
          if (!aInTiebreak && !bInTiebreak) {
              if (b.total !== a.total) return b.total - a.total;
              return aNum - bNum;
          }

          // CASE 3: One player is in tiebreak, the other is not
          const tiedPlayer = aInTiebreak ? a : b;
          const regularPlayer = aInTiebreak ? b : a;
          const tiedNum = aInTiebreak ? aNum : bNum;
          const regularNum = aInTiebreak ? bNum : aNum;

          const tiedPreTotal = preTieTotals[tiedNum] || 0;
          const regularTotal = regularPlayer.total || 0;

          const originalOrder = order.map(Number);
          const tiedIndex = originalOrder.indexOf(tiedNum);
          const regularIndex = originalOrder.indexOf(regularNum);

          if (tiedPreTotal > regularTotal) {
              return aInTiebreak ? -1 : 1;
          } else if (tiedPreTotal < regularTotal) {
              return aInTiebreak ? 1 : -1;
          } else {
              if (tiedIndex < regularIndex) {
                  return aInTiebreak ? -1 : 1;
              } else {
                  return aInTiebreak ? 1 : -1;
              }
          }
      });

      // NEW: Proper rank assignment that respects ties
      let lastTotal = null;
      let lastRank = 0;

      // First, group players by total score
      const scoreGroups = {};
      playersSummary.forEach(ps => {
          const total = ps.total || 0;
          if (!scoreGroups[total]) {
              scoreGroups[total] = [];
          }
          scoreGroups[total].push(ps);
      });

      // Sort groups by score descending
      const sortedTotals = Object.keys(scoreGroups).map(Number).sort((a, b) => b - a);

      // Assign ranks to each group - ALL players with same total get SAME rank
      let currentRank = 1;
      sortedTotals.forEach(total => {
          const group = scoreGroups[total];
          // All players in this group get the same rank
          group.forEach(ps => {
              ps.rank = currentRank;
          });
          // Increment rank by the number of players in this group
          currentRank += group.length;
      });

      // Sort players by rank
      playersSummary.sort((a, b) => a.rank - b.rank);

      // Also store the tiebreak players for visual indication
      const tiebreakPlayers = new Set();
      if (window.__familyTiebreak && window.__familyTiebreak.players) {
          window.__familyTiebreak.players.forEach(p => tiebreakPlayers.add(Number(p)));
      }

      playersSummary.forEach((ps) => {
          const row = document.createElement('div');
          row.style.display = 'flex';
          row.style.alignItems = 'center';
          row.style.justifyContent = 'space-between';
          row.style.gap = '10px';
          row.style.padding = '8px 10px';
          row.style.borderRadius = '10px';
          row.style.background = 'rgba(255, 255, 255, 0.04)';
          row.style.border = '1px solid rgba(255,255,255,0.04)';

          const leftWrap = document.createElement('div');
          leftWrap.style.display = 'flex';
          leftWrap.style.alignItems = 'center';
          leftWrap.style.gap = '8px';

          const pn = Number(ps.playerNumber);
          const isInTiebreak = tiebreakPlayers.has(pn);
          const rank = ps.rank || 1;

          const rankBadge = document.createElement('div');
          const rankClass = rank <= 4 ? rank : 4;
          rankBadge.className = 'family-rank-badge rank-' + rankClass;
          const suffix = rank === 1 ? '1st' : rank === 2 ? '2nd' : rank === 3 ? '3rd' : rank + 'th';
          rankBadge.textContent = suffix;

          // Add visual indicator for tiebreak players
          if (isInTiebreak && window.__familyTiebreak && !window.__familyTiebreak.finished) {
              rankBadge.style.border = '2px solid #ffd700';
              rankBadge.style.boxShadow = '0 0 12px rgba(255,215,0,0.6)';
              rankBadge.title = 'Tiebreaker - current rank';
          }

          const iconBadge = document.createElement('div');
          iconBadge.style.width = '24px';
          iconBadge.style.height = '24px';
          iconBadge.style.minWidth = '24px';
          iconBadge.style.borderRadius = '50%';
          iconBadge.style.display = 'flex';
          iconBadge.style.alignItems = 'center';
          iconBadge.style.justifyContent = 'center';
          iconBadge.style.background = ps.player.icon && String(ps.player.icon).startsWith('data:') ? `url("${ps.player.icon}") center/cover no-repeat` : (ps.player.color || '#1e90ff');
          iconBadge.style.color = '#fff';
          iconBadge.style.fontSize = '11px';
          iconBadge.style.fontWeight = '800';
          iconBadge.textContent = ps.player.icon && String(ps.player.icon).startsWith('data:') ? '' : String(ps.playerNumber);
          iconBadge.style.fontWeight = '800';
          iconBadge.textContent = ps.player.icon && String(ps.player.icon).startsWith('data:') ? '' : String(ps.playerNumber);

          const labelWrap = document.createElement('div');
          labelWrap.style.display = 'flex';
          labelWrap.style.flexDirection = 'column';
          labelWrap.style.alignItems = 'flex-start';
          labelWrap.style.flex = '1';
          labelWrap.style.minWidth = '0';

          const nameLine = document.createElement('div');
          nameLine.textContent = String(ps.player.name || `Player ${ps.playerNumber}`);
          nameLine.style.fontWeight = '700';
          nameLine.style.fontSize = '15px';
          nameLine.style.overflow = 'hidden';
          nameLine.style.textOverflow = 'ellipsis';
          nameLine.style.whiteSpace = 'nowrap';
          nameLine.style.maxWidth = '100%';

          const scoreLine = document.createElement('div');
          try {
              const fullScores = Array.isArray(ps.hisScores) ? ps.hisScores.slice() : [];
              const pn = Number(ps.playerNumber);

              // Determine if this player has played a tiebreaker (has more than 3 matches)
              const hasTiebreakerMatches = fullScores.length > 3;

              // ALWAYS separate baseline from extra points for players with 4+ matches
              let displayScores = fullScores.length > 0 ? fullScores.slice(0, 3).join(', ') : '0';
              let bracket = '';
              let displayTotal = ps.total;

              if (hasTiebreakerMatches) {
                  // Split scores into baseline (regular matches) and extra (tiebreaker matches)
                  const baselineArr = fullScores.slice(0, 3);
                  const extraArr = fullScores.slice(3);

                  // Display baseline scores
                  displayScores = baselineArr.length > 0 ? baselineArr.join(', ') : '0';

                  // Calculate extra sum for bracket display
                  const extraSum = extraArr.reduce((s, v) => s + Number(v || 0), 0);

                  // Show bracket if there are extra points
                  if (extraSum > 0) {
                      bracket = ` (+${extraSum})`;
                  } else if (extraArr.length > 0) {
                      const extraValues = extraArr.filter(v => Number(v) > 0);
                      if (extraValues.length > 0) {
                          const actualExtraSum = extraValues.reduce((s, v) => s + Number(v || 0), 0);
                          bracket = ` (+${actualExtraSum})`;
                      }
                  }

                  // CRITICAL: ALWAYS use baseline total for display, NOT ps.total
                  displayTotal = baselineArr.reduce((s, v) => s + Number(v || 0), 0);

                  // If no baseline scores, use 0 as total
                  if (displayTotal === 0 && baselineArr.length === 0) {
                      displayTotal = 0;
                  }
              } else {
                  // Not in tiebreak - use regular total
                  displayTotal = ps.total;
              }

              // Ensure the display shows baseline total + bracket points separately
              scoreLine.textContent = `${displayScores}${bracket} total: ${displayTotal}`;
          } catch (e) {
              // Fallback: display regular scores
              scoreLine.textContent = `${ps.hisScores.length > 0 ? ps.hisScores.join(', ') : '0'} total: ${ps.total}`;
          }
          scoreLine.style.fontSize = '12px';
          scoreLine.style.opacity = '0.8';

          labelWrap.appendChild(nameLine);
          labelWrap.appendChild(scoreLine);

          leftWrap.appendChild(rankBadge);
          leftWrap.appendChild(iconBadge);
          leftWrap.appendChild(labelWrap);

          const rightWrap = document.createElement('div');
          rightWrap.style.fontWeight = '800';
          rightWrap.style.opacity = '0.95';
          rightWrap.textContent = ps.total;

          row.appendChild(leftWrap);
          row.appendChild(rightWrap);
          scoreBoard.appendChild(row);
      });

      const title = document.createElement('div');
      title.textContent = `Are you ready, ${starterName}?`;
      title.style.fontSize = '34px';
      title.style.fontWeight = '900';
      title.style.marginBottom = '24px';
      title.style.lineHeight = '1.2';
      title.style.textShadow = '0 0 12px rgba(110,180,255,0.35)';

      const readyBtn = document.createElement('button');
      readyBtn.type = 'button';
      readyBtn.textContent = 'Ready';
      readyBtn.style.width = '100%';
      readyBtn.style.maxWidth = '260px';
      readyBtn.style.padding = '16px 18px';
      readyBtn.style.border = 'none';
      readyBtn.style.borderRadius = '14px';
      readyBtn.style.background = 'linear-gradient(90deg, #1ed760, #1e90ff)';
      readyBtn.style.color = '#07111d';
      readyBtn.style.fontWeight = '900';
      readyBtn.style.cursor = 'pointer';
      readyBtn.style.fontSize = '18px';
          readyBtn.addEventListener('click', () => {
          if (audioOn) playSound('tap');
          try {
              // If this ready prompt was opened from the tiebreaker, restore previous bgAudio state
              if (typeof window.__familyTiebreakPrevBgMuted !== 'undefined' && typeof bgAudio !== 'undefined' && bgAudio) {
                  try { bgAudio.muted = window.__familyTiebreakPrevBgMuted; } catch (e) {}
                  if (window.__familyTiebreakPrevBgPlaying && audioOn) {
                      try { activeSoundsState.bgAudioWasPlaying = true; restoreActiveSounds(); } catch (e) { try { tryPlayBackgroundMusic(); } catch (ee) {} }
                  }
                  try { delete window.__familyTiebreakPrevBgMuted; delete window.__familyTiebreakPrevBgPlaying; } catch (e) {}
                  try {
                      // If the tiebreak had been marked finished, finalize it now when the player acknowledges
                      if (window.__familyTiebreak && window.__familyTiebreak.finished) {
                          try { window.__familyTiebreak = null; } catch (ee) { try { delete window.__familyTiebreak; } catch (eee) {} }
                      }
                  } catch (e) {}
              }
          } catch (e) { console.warn('Failed to restore bgAudio on Ready click', e); }
          clearFamilyRoundOverlays();
          if (gameWrap) gameWrap.style.display = 'flex';
          const canvasEl = document.getElementById('c');
          if (canvasEl) canvasEl.style.display = 'block';
          applyFamilyForwardRunUI();
          try { if (stagesBtn) stagesBtn.style.display = 'none'; } catch (e) {}
          try {
              // Apply selected player's planet to the gameplay player
              if (activePlayer && activePlayer.planet) {
                  player.planetKey = String(activePlayer.planet);
                  try { localStorage.setItem('solarFlyPlanetKey', player.planetKey); } catch (e) {}
              }
          } catch (e) { console.warn('Failed applying family player planet', e); }
          showLoadingScreen(() => {
              if (menu) menu.style.display = 'none';
              if (gameWrap) gameWrap.style.display = 'flex';
              if (canvasEl) canvasEl.style.display = 'block';
              start();
              if (audioOn) tryPlayBackgroundMusic();
          });
      });

      panel.appendChild(partyLabel);
      panel.appendChild(scoreBoard);
      panel.appendChild(title);
      panel.appendChild(readyBtn);
      readyOverlay.appendChild(panel);
      document.body.appendChild(readyOverlay);
      return true;
  }

  function showPartyChooser() {
      // Remove any existing overlay to ensure fresh render
      const existingOverlay = document.getElementById('familyPartyChooserOverlay');
      if (existingOverlay) {
          existingOverlay.remove();
      }

      showLoadingScreen(() => {
          hideAllScreens();

          if (document.getElementById('familyPartyChooserOverlay')) {
              return;
          }

          const overlay = document.createElement('div');
          overlay.id = 'familyPartyChooserOverlay';
          overlay.className = 'family-modal-overlay';
          overlay.style.position = 'fixed';
          overlay.style.inset = '0';
          overlay.style.display = 'flex';
          overlay.style.flexDirection = 'column';
          overlay.style.alignItems = 'center';
          overlay.style.justifyContent = 'flex-start';
          overlay.style.background = 'radial-gradient(circle at top left, rgba(96, 148, 255, 0.18), transparent 18%), radial-gradient(circle at bottom right, rgba(255, 120, 215, 0.12), transparent 22%), linear-gradient(180deg, rgba(2, 12, 34, 0.96), rgba(3, 8, 24, 0.96))';
          overlay.style.zIndex = '100999';
          overlay.style.pointerEvents = 'auto';
          overlay.style.overflow = 'auto';
          overlay.style.padding = '12px 0 12px 0';
          overlay.style.boxSizing = 'border-box';
                    overlay.innerHTML = `
                            <button class="family-modal-close" id="familyPartyClose" aria-label="Close">✕</button>
                            <div class="family-modal-close-text">Choose or create new party to continue</div>
                            <button id="familyCreatePartyBtn" class="family-modal-disabled-option" type="button" style="pointer-events:all;cursor:pointer;margin-top:8px;">
                                <span>Create a new party</span>
                                <span id="howToCreateSmallBtn" style="font-size:11px;color:#0645AD;text-decoration:underline;opacity:0.95;background:transparent;padding:0;border-radius:0;border:none;cursor:pointer;pointer-events:all;font-weight:600;margin-left:8px;" onclick="event.stopPropagation();openHowToCreateVideo();">How to Create</span>
                            </button>
                            <div class="family-modal-message" style="margin-top:12px;">No party created yet</div>
                            <button class="family-modal-continue-btn" id="familyPartyContinue" type="button" style="margin-top:18px;">Continue</button>
                            <div class="family-modal-info-text" id="familyPartyInfoMessage" style="margin-top:8px;"></div>
                    `;
                    
                    const smallHowToBtn = overlay.querySelector('#howToCreateSmallBtn');
                    if (smallHowToBtn) {
                        howToCreateVideoBtn = smallHowToBtn;
                        smallHowToBtn.addEventListener('click', (e) => {
                            e.stopPropagation();
                            if (typeof openHowToCreateVideo === 'function') openHowToCreateVideo();
                        });
                    }

          document.body.appendChild(overlay);

          // Render list of created parties (if any) below the Create button
          function renderPartiesList() {
              try {
                  const parties = getSavedParties();
                  const created = Array.isArray(parties) ? parties.filter(p => p && String(p.status || '').toLowerCase() === 'created') : [];
                  const infoEl = overlay.querySelector('#familyPartyInfoMessage');
                  const noPartyEl = overlay.querySelector('.family-modal-message');
                  let listEl = overlay.querySelector('#familyPartiesList');
                  if (!listEl) {
                      listEl = document.createElement('div');
                      listEl.id = 'familyPartiesList';
                      listEl.style.position = 'fixed';
                      listEl.style.top = '178px';
                      listEl.style.left = '92px';
                      listEl.style.width = '220px';
                      listEl.style.display = 'flex';
                      listEl.style.flexDirection = 'column';
                      listEl.style.gap = '8px';
                      listEl.style.pointerEvents = 'auto';
                      listEl.style.zIndex = '101000';
                      listEl.style.maxHeight = 'calc((2 * 58px) + (1 * 8px))';
                      listEl.style.overflowY = 'auto';
                      listEl.style.overflowX = 'hidden';
                      listEl.style.scrollbarWidth = 'thin';
                      listEl.style.scrollbarColor = 'rgba(130,180,255,0.7) rgba(255,255,255,0.04)';
                      const createBtnNode = overlay.querySelector('#familyCreatePartyBtn');
                      if (createBtnNode && createBtnNode.parentNode) createBtnNode.parentNode.insertBefore(listEl, createBtnNode.nextSibling);
                  }
                  listEl.innerHTML = '';
                  if (created.length === 0) {
                      if (infoEl) infoEl.textContent = 'No party created yet';
                      if (noPartyEl) noPartyEl.style.display = 'block';
                      if (listEl) listEl.style.display = 'none';
                      return;
                  }
                  // Hide/remove the generic 'No party created yet' message when we have created parties
                  if (infoEl) infoEl.textContent = '';
                  if (noPartyEl) noPartyEl.style.display = 'none';
                  listEl.style.display = 'flex';
                  const maxPartyRows = 2;
                  const partyCardHeight = 58;
                  listEl.style.maxHeight = 'calc((' + maxPartyRows + ' * ' + partyCardHeight + 'px) + (' + Math.max(0, maxPartyRows - 1) + ' * 8px))';

                  created.forEach(p => {
                      const item = document.createElement('button');
                      item.type = 'button';
                      item.className = 'message-card';
                      item.style.cursor = 'pointer';
                      item.style.display = 'flex';
                      item.style.justifyContent = 'space-between';
                      item.style.alignItems = 'center';
                      item.style.padding = '8px 10px';
                      
                      const nameSpan = document.createElement('span');
                      nameSpan.textContent = String(p.name || 'Unnamed');
                      nameSpan.style.fontWeight = '700';
                      const timeSpan = document.createElement('span');
                      const t = p.createdAt ? new Date(Number(p.createdAt)) : null;
                      timeSpan.textContent = t ? t.toLocaleString() : '';
                      timeSpan.style.fontSize = '12px';
                      timeSpan.style.opacity = '0.8';
                      item.appendChild(nameSpan);
                      item.appendChild(timeSpan);

                      item.addEventListener('click', () => {
                          // mark selected visually
                          Array.from(listEl.children).forEach(ch => {
                              ch.style.border = 'none';
                          });
                          item.style.border = '2px solid rgba(100,200,255,0.6)';
                          overlay.dataset.selectedParty = String(p.name || '');
                          if (infoEl) infoEl.textContent = `Selected: ${p.name}`;
                      });

                      // Add action icons container
                      const actionsDiv = document.createElement('div');
                      actionsDiv.className = 'party-item-actions';

                      // Edit button
                      const editBtn = document.createElement('button');
                      editBtn.type = 'button';
                      editBtn.className = 'party-action-btn edit-btn';
                      editBtn.title = 'Edit party';
                      editBtn.textContent = '✎';
                      editBtn.addEventListener('click', (e) => {
                          e.stopPropagation();
                          if (audioOn) playSound('tap');
                          // Close the family party chooser and open create party flow with existing data.
                          // Mark this as an edit so the close X does not trigger the "save as draft" prompt.
                          window.__resumeCreateParty = { name: p.name, isEditing: true };
                          if (document.getElementById('familyPartyChooserOverlay')) {
                              document.getElementById('familyPartyChooserOverlay').remove();
                          }
                          openCreatePartyFlow();
                      });

                      // Delete button
                      const deleteBtn = document.createElement('button');
                      deleteBtn.type = 'button';
                      deleteBtn.className = 'party-action-btn delete-btn';
                      deleteBtn.title = 'Delete party';
                      deleteBtn.textContent = '🗑';
                      deleteBtn.addEventListener('click', (e) => {
                          e.stopPropagation();
                          if (audioOn) playSound('tap');
                          showDialog({
                              title: 'Delete Party?',
                              text: `Do you really want to delete the party "${String(p.name || 'Unnamed')}"? All related data will be permanently removed.`,
                              confirmText: 'Delete',
                              cancelText: 'Cancel',
                              showCancel: true,
                              onConfirm: () => {
                                  if (audioOn) try { playSound('tap'); } catch (e) {}
                                  removePartyByName(p.name);
                                  if (overlay.dataset.selectedParty === String(p.name || '')) {
                                      overlay.dataset.selectedParty = '';
                                      if (infoEl) infoEl.textContent = '';
                                  }
                                  renderPartiesList();
                              },
                              onCancel: () => {
                                  if (audioOn) try { playSound('tap'); } catch (e) {}
                              }
                          });
                      });

                      actionsDiv.appendChild(editBtn);
                      actionsDiv.appendChild(deleteBtn);

                      item.appendChild(actionsDiv);
                      listEl.appendChild(item);
                  });
              } catch (e) { console.warn('Failed rendering parties list', e); }
          }

          // Initial render
          try { renderPartiesList(); } catch (e) { console.warn('renderPartiesList error', e); }
          // Draft detection now happens when the player explicitly clicks "Create a new party".
          // This avoids showing the draft dialog automatically when opening the chooser.
          focusFirstVisibleButton();

          // enable create party button and wire up create flow
          const createBtn = document.getElementById('familyCreatePartyBtn');
          if (createBtn) {
              createBtn.addEventListener('click', (e) => {
                  e.stopPropagation();
                  if (audioOn) playSound('tap');
                  // If there's an existing draft, prompt immediately before creating new
                  try {
                      const partiesNow = getSavedParties();
                      const draftParty = partiesNow.find(p => p && p.status === 'Draft');
                      if (draftParty) {
                          showDialog({
                              title: 'Continue Draft?',
                              text: 'A draft party "' + String(draftParty.name || '') + '" was found. Continue it or delete and create new?',
                              confirmText: 'Continue',
                              cancelText: 'Delete',
                              showCancel: true,
                              onConfirm: () => {
                                  if (audioOn) try { playSound('tap'); } catch (e) {}
                                  window.__resumeCreateParty = { name: draftParty.name };
                                  openCreatePartyFlow();
                              },
                              onCancel: () => {
                                  if (audioOn) try { playSound('tap'); } catch (e) {}
                                  removePartyByName(draftParty.name);
                                  openCreatePartyFlow();
                              }
                          });
                          return;
                      }
                  } catch (e) { console.warn('Error checking for draft on create click', e); }
                  openCreatePartyFlow();
              });
          }

          // Start caching the How-to Create video in background on first open to reduce lag
          try { ensureHowToCreateVideoCached(); } catch (e) { /* ignore */ }

          const familyHowToCreateBtn = document.getElementById('familyHowToCreateVideoBtn');
          if (familyHowToCreateBtn) {
              howToCreateVideoBtn = familyHowToCreateBtn;
              familyHowToCreateBtn.addEventListener('click', () => {
                  if (audioOn) playSound('tap');
                  if (!familyHowToCreateBtn.disabled) openHowToCreateVideo();
              });
          }
          checkHowToCreateVideoAvailability();

          function getFamilyTurnOrder(party) {
              if (!party) return [];
              const rawOrder = Array.isArray(party.order) ? party.order.filter(n => Number.isFinite(Number(n))) : [];
              if (rawOrder.length > 0) {
                  return rawOrder.map(Number);
              }
              const count = Number(party.players) || Math.max(1, Array.isArray(party.playersInfo) ? party.playersInfo.length : 1);
              return Array.from({ length: count }, (_, index) => index + 1);
          }

          function getFamilyPlayerInfo(party, playerNumber) {
              const playersInfo = Array.isArray(party && party.playersInfo) ? party.playersInfo : [];
              return playersInfo.find(player => Number(player.num) === Number(playerNumber)) || {
                  num: Number(playerNumber),
                  name: `Player ${playerNumber}`,
                  icon: null,
                  color: '#1e90ff'
              };
          }

          function clearFamilyRoundOverlays() {
              const overlayIds = ['familyPartyReadyOverlay', 'familyPartyChooserOverlay'];
              overlayIds.forEach(id => {
                  const el = document.getElementById(id);
                  if (el) el.remove();
              });
              if (gameOver) {
                  gameOver.style.display = 'none';
                  gameOver.style.background = 'rgba(0,0,0,0.8)';
              }
              if (pauseMenu) pauseMenu.style.display = 'none';
              if (menu) menu.style.display = 'none';
              isOnDeathScreen = false;
          }

          function showPartyReadyPrompt(selectedPartyName, options = {}) {
              const parties = getSavedParties();
              const party = parties.find(p => String(p.name || '').toLowerCase() === String(selectedPartyName || '').toLowerCase()) || null;
              if (!party) {
                  return false;
              }

              const order = getFamilyTurnOrder(party);
              const turnIndex = Number(options.turnIndex ?? Number(window.__familyPartyTurnIndex ?? 0));
              const normalizedTurnIndex = order.length > 0 ? ((turnIndex % order.length) + order.length) % order.length : 0;
              const activePlayerNumber = order[normalizedTurnIndex] || order[0] || 1;
              const activePlayer = getFamilyPlayerInfo(party, activePlayerNumber);
              const starterName = String(activePlayer.name || `Player ${activePlayerNumber}`).trim() || `Player ${activePlayerNumber}`;

              window.__selectedFamilyParty = String(party.name || selectedPartyName || '');
              window.__selectedFamilyStarter = starterName;
              window.__familyPartyTurnIndex = normalizedTurnIndex;
              window.__familyCurrentPlayerNum = activePlayerNumber;

              const readyOverlay = document.createElement('div');
              readyOverlay.id = 'familyPartyReadyOverlay';
              readyOverlay.style.position = 'fixed';
              readyOverlay.style.inset = '0';
              readyOverlay.style.display = 'flex';
              readyOverlay.style.alignItems = 'center';
              readyOverlay.style.justifyContent = 'center';
              readyOverlay.style.background = 'radial-gradient(circle at 20% 20%, rgba(110, 170, 255, 0.26), transparent 24%), radial-gradient(circle at 80% 30%, rgba(205, 120, 255, 0.18), transparent 20%), radial-gradient(circle at 50% 80%, rgba(120, 220, 255, 0.12), transparent 26%), linear-gradient(135deg, rgba(4,9,20,0.82), rgba(10,18,36,0.68), rgba(13,9,25,0.8))';
              readyOverlay.style.backdropFilter = 'blur(12px) saturate(1.2)';
              readyOverlay.style.webkitBackdropFilter = 'blur(12px) saturate(1.2)';
              readyOverlay.style.backgroundAttachment = 'fixed';
              readyOverlay.style.zIndex = '101010';
              readyOverlay.style.padding = '20px';
              readyOverlay.style.boxSizing = 'border-box';

              const panel = document.createElement('div');
              panel.style.width = 'min(92vw, 560px)';
              panel.style.minHeight = '62vh';
              panel.style.display = 'flex';
              panel.style.flexDirection = 'column';
              panel.style.alignItems = 'center';
              panel.style.justifyContent = 'center';
              panel.style.background = 'linear-gradient(180deg, rgba(8,16,32,0.98), rgba(16,26,44,0.96))';
              panel.style.borderRadius = '22px';
              panel.style.border = '1px solid rgba(120,190,255,0.3)';
              panel.style.boxShadow = '0 22px 60px rgba(0,0,0,0.5)';
              panel.style.textAlign = 'center';
              panel.style.padding = '32px 28px';
              panel.style.color = '#fff';

              const partyLabel = document.createElement('div');
              partyLabel.textContent = `Party: ${String(party.name || selectedPartyName || 'Selected Party')}`;
              partyLabel.style.fontSize = '17px';
              partyLabel.style.fontWeight = '700';
              partyLabel.style.opacity = '0.85';
              partyLabel.style.marginBottom = '18px';
              partyLabel.style.letterSpacing = '0.5px';

              const scoreBoard = document.createElement('div');
              scoreBoard.style.width = '100%';
              scoreBoard.style.display = 'flex';
              scoreBoard.style.flexDirection = 'column';
              scoreBoard.style.gap = '8px';
              scoreBoard.style.marginBottom = '22px';
              scoreBoard.style.padding = '12px';
              scoreBoard.style.background = 'rgba(18, 30, 54, 0.82)';
              scoreBoard.style.border = '1px solid rgba(120, 190, 255, 0.18)';
              scoreBoard.style.borderRadius = '16px';

              const scoreHeader = document.createElement('div');
              scoreHeader.textContent = 'Players Score';
              scoreHeader.style.fontSize = '13px';
              scoreHeader.style.fontWeight = '800';
              scoreHeader.style.textTransform = 'uppercase';
              scoreHeader.style.letterSpacing = '1px';
              scoreHeader.style.opacity = '0.8';
              scoreHeader.style.marginBottom = '4px';
              scoreBoard.appendChild(scoreHeader);

              const familyScores = window.__familyPartyScores && window.__familyPartyScores[String(party.name || selectedPartyName)]
                  ? window.__familyPartyScores[String(party.name || selectedPartyName)]
                  : {};

              // Build players summary and compute totals (respecting baseline during active tiebreak)
              const playersSummary = order.map(playerNumber => {
                  const player = getFamilyPlayerInfo(party, playerNumber);
                  const hisScores = Array.isArray(familyScores[Number(playerNumber)]) ? familyScores[Number(playerNumber)] : [];
                  let total = hisScores.reduce((sum, value) => sum + Number(value || 0), 0);
                  try {
                      const tb = window.__familyTiebreak;
                      if (tb && tb.baselineCounts && Array.isArray(tb.players) && !tb.finished) {
                          const pn = Number(playerNumber);
                          const isTied = tb.players.map(Number).indexOf(pn) !== -1;
                          if (isTied) {
                              const baselineCount = Number(tb.baselineCounts[pn] || 0);
                              if (baselineCount >= 0) {
                                  total = hisScores.slice(0, baselineCount).reduce((s, v) => s + Number(v || 0), 0);
                              }
                          }
                      }
                  } catch (e) {}
                  return { playerNumber, player: getFamilyPlayerInfo(party, playerNumber), hisScores, total };
              });

              // Group by total and assign ranks (ties get same rank; next rank skips by group size)
              const scoreGroups = {};
              playersSummary.forEach(ps => {
                  const total = ps.total || 0;
                  if (!scoreGroups[total]) scoreGroups[total] = [];
                  scoreGroups[total].push(ps);
              });
              const sortedTotals = Object.keys(scoreGroups).map(Number).sort((a, b) => b - a);
              let rankCounter = 1;
              sortedTotals.forEach(total => {
                  const group = scoreGroups[total];
                  group.forEach(ps => ps.rank = rankCounter);
                  rankCounter += group.length;
              });

              // Render rows sorted by rank
              playersSummary.sort((a, b) => a.rank - b.rank);
              const tiebreakPlayers = new Set();
              if (window.__familyTiebreak && window.__familyTiebreak.players) {
                  window.__familyTiebreak.players.forEach(p => tiebreakPlayers.add(Number(p)));
              }

              playersSummary.forEach(ps => {
                  const playerNumber = ps.playerNumber;
                  const player = ps.player;
                  const hisScores = ps.hisScores;
                  const total = ps.total;

                  const row = document.createElement('div');
                  row.style.display = 'flex';
                  row.style.alignItems = 'center';
                  row.style.justifyContent = 'space-between';
                  row.style.gap = '10px';
                  row.style.padding = '8px 10px';
                  row.style.borderRadius = '10px';
                  row.style.background = 'rgba(255, 255, 255, 0.04)';
                  row.style.border = '1px solid rgba(255,255,255,0.04)';

                  const iconBadge = document.createElement('div');
                  iconBadge.style.width = '24px';
                  iconBadge.style.height = '24px';
                  iconBadge.style.minWidth = '24px';
                  iconBadge.style.borderRadius = '50%';
                  iconBadge.style.display = 'flex';
                  iconBadge.style.alignItems = 'center';
                  iconBadge.style.justifyContent = 'center';
                  iconBadge.style.background = player.icon && String(player.icon).startsWith('data:') ? `url("${player.icon}") center/cover no-repeat` : (player.color || '#1e90ff');
                  iconBadge.style.color = '#fff';
                  iconBadge.style.fontSize = '11px';
                  iconBadge.style.fontWeight = '800';
                  iconBadge.textContent = player.icon && String(player.icon).startsWith('data:') ? '' : String(playerNumber);

                  const labelWrap = document.createElement('div');
                  labelWrap.style.display = 'flex';
                  labelWrap.style.flexDirection = 'column';
                  labelWrap.style.alignItems = 'flex-start';
                  labelWrap.style.flex = '1';
                  labelWrap.style.minWidth = '0';

                  const nameLine = document.createElement('div');
                  nameLine.textContent = String(player.name || `Player ${playerNumber}`);
                  nameLine.style.fontWeight = '700';
                  nameLine.style.fontSize = '15px';
                  nameLine.style.overflow = 'hidden';
                  nameLine.style.textOverflow = 'ellipsis';
                  nameLine.style.whiteSpace = 'nowrap';
                  nameLine.style.maxWidth = '100%';

                  const scoreLine = document.createElement('div');
                  try {
                      const fullScores = Array.isArray(hisScores) ? hisScores.slice() : [];
                      const hasTiebreakerMatches = fullScores.length > 3;
                      let displayScores = fullScores.length > 0 ? fullScores.slice(0, 3).join(', ') : '0';
                      let bracket = '';
                      let displayTotal = total;
                      if (hasTiebreakerMatches) {
                          const baselineArr = fullScores.slice(0, 3);
                          const extraArr = fullScores.slice(3);
                          displayScores = baselineArr.length > 0 ? baselineArr.join(', ') : '0';
                          const extraSum = extraArr.reduce((s, v) => s + Number(v || 0), 0);
                          if (extraSum > 0) bracket = ` (+${extraSum})`;
                          displayTotal = baselineArr.reduce((s, v) => s + Number(v || 0), 0);
                          if (displayTotal === 0 && baselineArr.length === 0) displayTotal = 0;
                      } else {
                          displayTotal = total;
                      }
                      scoreLine.textContent = `${displayScores}${bracket} total: ${displayTotal}`;
                  } catch (e) {
                      scoreLine.textContent = `${hisScores.length > 0 ? hisScores.join(', ') : '0'} total: ${total}`;
                  }
                  scoreLine.style.fontSize = '12px';
                  scoreLine.style.opacity = '0.8';

                  labelWrap.appendChild(nameLine);
                  labelWrap.appendChild(scoreLine);

                  row.appendChild(iconBadge);
                  row.appendChild(labelWrap);
                  scoreBoard.appendChild(row);
              });

              const title = document.createElement('div');
              title.textContent = `Are you ready, ${starterName}?`;
              title.style.fontSize = '34px';
              title.style.fontWeight = '900';
              title.style.marginBottom = '24px';
              title.style.lineHeight = '1.2';
              title.style.textShadow = '0 0 12px rgba(110,180,255,0.35)';

              const readyBtn = document.createElement('button');
              readyBtn.type = 'button';
              readyBtn.textContent = 'Ready';
              readyBtn.style.width = '100%';
              readyBtn.style.maxWidth = '260px';
              readyBtn.style.padding = '16px 18px';
              readyBtn.style.border = 'none';
              readyBtn.style.borderRadius = '14px';
              readyBtn.style.background = 'linear-gradient(90deg, #1ed760, #1e90ff)';
              readyBtn.style.color = '#07111d';
              readyBtn.style.fontWeight = '900';
              readyBtn.style.cursor = 'pointer';
              readyBtn.style.fontSize = '18px';
              readyBtn.addEventListener('click', () => {
                  if (audioOn) playSound('tap');
                  try {
                      if (window.__familyTiebreak && window.__familyTiebreak.finished) {
                          try { window.__familyTiebreak = null; } catch (e) { try { delete window.__familyTiebreak; } catch (ee) {} }
                      }
                  } catch (e) {}
                  clearFamilyRoundOverlays();
                  if (gameWrap) gameWrap.style.display = 'flex';
                  const canvasEl = document.getElementById('c');
                  if (canvasEl) canvasEl.style.display = 'block';
                  applyFamilyForwardRunUI();
                  try { if (stagesBtn) stagesBtn.style.display = 'none'; } catch (e) {}
                  try {
                      if (activePlayer && activePlayer.planet) {
                          player.planetKey = String(activePlayer.planet);
                          try { localStorage.setItem('solarFlyPlanetKey', player.planetKey); } catch (e) {}
                      }
                  } catch (e) { console.warn('Failed applying family player planet', e); }
                  showLoadingScreen(() => {
                      if (menu) menu.style.display = 'none';
                      if (gameWrap) gameWrap.style.display = 'flex';
                      if (canvasEl) canvasEl.style.display = 'block';
                      start();
                      if (audioOn) tryPlayBackgroundMusic();
                  });
              });

              panel.appendChild(partyLabel);
              panel.appendChild(scoreBoard);
              panel.appendChild(title);
              panel.appendChild(readyBtn);
              readyOverlay.appendChild(panel);
              document.body.appendChild(readyOverlay);
              return true;
          }

          const continueBtn = document.getElementById('familyPartyContinue');
          const infoMessage = document.getElementById('familyPartyInfoMessage');
          if (continueBtn && infoMessage) {
              continueBtn.onclick = () => {
                  if (audioOn) playSound('tap');
                  const selectedPartyName = (overlay.dataset.selectedParty || '').trim();
                  if (!selectedPartyName) {
                      infoMessage.textContent = 'First, select a Party to Play.';
                      return;
                  }

                  const didShowReady = showPartyReadyPrompt(selectedPartyName);
                  if (!didShowReady) {
                      infoMessage.textContent = 'That party could not be loaded. Please select another party.';
                  }
              };
          }

          const close = document.getElementById('familyPartyClose');
          if (close) {
              close.onclick = () => {
                  if (audioOn) playSound('tap');
                  hideAllScreens();
                  showLoadingScreen(() => {
                      overlay.remove();
                      showMenu();
                      focusFirstVisibleButton();
                  });
              };
          }

      });
  }

    // ===== Create Party Flow (steps 1-2) =====
    let __createPartyState = { inProgress: false, currentName: null, isEditing: false };
    // When set to { name: 'PartyName', isEditing: true|false } before calling openCreatePartyFlow(),
    // the flow will restore and continue the saved draft or an existing party edit.
    window.__resumeCreateParty = null;

    function getSavedParties() {
        try {
            const raw = localStorage.getItem('familyParties') || '[]';
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            console.warn('Failed reading familyParties', e);
            return [];
        }
    }

    function saveParties(arr) {
        try {
            localStorage.setItem('familyParties', JSON.stringify(arr));
        } catch (e) { console.warn('Failed saving familyParties', e); }
    }

    function findPartyByName(name) {
        if (!name) return -1;
        const parties = getSavedParties();
        return parties.findIndex(p => String(p.name || '').toLowerCase() === String(name).toLowerCase());
    }

    function saveOrUpdateParty(party) {
        if (!party || !party.name) return;
        const parties = getSavedParties();
        const idx = findPartyByName(party.name);
        if (idx === -1) {
            parties.push(party);
        } else {
            parties[idx] = Object.assign({}, parties[idx], party);
        }
        saveParties(parties);
    }

    function savePartyProgress(update) {
        if (!__createPartyState || !__createPartyState.currentName) return;
        const currentName = __createPartyState.currentName;
        const parties = getSavedParties();
        const idx = findPartyByName(currentName);

        if (__createPartyState.isEditing) {
            if (idx === -1) {
                saveOrUpdateParty(Object.assign({ name: currentName, status: 'Created', updatedAt: Date.now() }, update));
                return;
            }
            const current = parties[idx] || {};
            parties[idx] = Object.assign({}, current, update, { name: (update && update.name) ? update.name : current.name, updatedAt: Date.now() });
            saveParties(parties);
            return;
        }

        saveOrUpdateParty(Object.assign({ name: currentName, status: 'Draft', updatedAt: Date.now() }, update));
    }

    function removePartyByName(name) {
        const parties = getSavedParties();
        const idx = findPartyByName(name);
        if (idx !== -1) {
            parties.splice(idx, 1);
            saveParties(parties);
        }
    }

    function openCreatePartyFlow() {
        if (document.getElementById('createPartyOverlay')) return;
        __createPartyState = { inProgress: false, currentName: null, isEditing: false };

        const overlay = document.createElement('div');
        overlay.id = 'createPartyOverlay';
        overlay.style.position = 'fixed';
        overlay.style.inset = '0';
        overlay.style.zIndex = '200000';
        overlay.style.display = 'flex';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';
        overlay.style.background = 'linear-gradient(180deg, rgba(0,0,0,0.9), rgba(0,0,0,0.95))';
        overlay.style.padding = '20px';
        overlay.style.boxSizing = 'border-box';
        overlay.innerHTML = `
            <div id="createPartyCard" style="width:100%;height:100%;max-width:none;background:linear-gradient(180deg,#071126,#021226);border-radius:0;padding:28px;color:#fff;box-shadow:none;overflow:auto;display:flex;flex-direction:column;">
                <button id="createPartyClose" aria-label="Close" style="float:right;background:transparent;border:none;color:#fff;font-size:20px;cursor:pointer;">✕</button>
                <h2 style="margin:0 0 12px 0;font-size:20px;">Create Party — Step 1</h2>
                <div id="createPartyStep1">
                    <div style="margin-bottom:8px;">What will be the name of party?</div>
                    <div style="display:flex;gap:8px;align-items:center;">
                        <input id="createPartyNameInput" placeholder="Enter party name" style="flex:1;padding:10px;border-radius:8px;border:1px solid rgba(255,255,255,0.12);background:transparent;color:#fff;" />
                        <button id="createPartyNameSaveBtn" style="padding:10px 14px;border-radius:8px;border:none;background:#1e90ff;color:#fff;cursor:pointer;">Enter</button>
                    </div>
                    <div id="createPartyNameMessage" style="margin-top:8px;color:#ffcccb;font-size:13px;min-height:18px;"></div>
                </div>

                <div id="createPartyStep2" style="margin-top:18px;display:none;">
                    <h3 style="margin:0 0 8px 0;font-size:16px;">Choose how many Players on your party!</h3>
                    <div style="display:flex;gap:10px;">
                        <button id="createPartyPlayers2" style="flex:1;padding:14px;border-radius:10px;border:none;background:#ff4d4f;color:#fff;cursor:pointer;font-weight:700;">2 Players</button>
                        <button id="createPartyPlayers3" style="flex:1;padding:14px;border-radius:10px;border:none;background:#ffd700;color:#000;cursor:pointer;font-weight:700;">3 Players</button>
                        <button id="createPartyPlayers4" style="flex:1;padding:14px;border-radius:10px;border:none;background:#3b82f6;color:#fff;cursor:pointer;font-weight:700;">4 Players</button>
                    </div>
                    <div id="createPartyPlayersMessage" style="margin-top:10px;color:#cfe9ff;font-size:13px;min-height:18px;"></div>
                </div>

                <div id="createPartyStep3" style="margin-top:18px;display:none;">
                    <h3 style="margin:0 0 8px 0;font-size:16px;">Choose difficulty for this Party</h3>
                    <div style="display:flex;gap:10px;">
                        <button class="diffOption" data-diff="easy">Easy</button>
                        <button class="diffOption" data-diff="medium">Medium</button>
                        <button class="diffOption" data-diff="hard">Hard</button>
                        <button class="diffOption" data-diff="extreme">Extreme</button>
                        <button class="diffOption" data-diff="impossible">Impossible</button>
                    </div>
                    <div id="createPartyDiffMessage" style="margin-top:10px;color:#cfe9ff;font-size:13px;min-height:18px;"></div>
                    <div style="display:flex;justify-content:flex-end;margin-top:12px;">
                        <button id="createPartyStep3Continue" style="padding:10px 14px;border-radius:8px;border:none;background:#1e90ff;color:#fff;cursor:pointer;">Continue</button>
                    </div>
                </div>

                <div id="createPartyStep4" style="margin-top:18px;display:none;">
                    <h3 id="createPartyStep4Title" style="margin:0 0 8px 0;font-size:16px;">Which player will start the match?</h3>
                    <div id="createPartyOrderButtons" style="display:flex;gap:10px;flex-wrap:wrap;"></div>
                    <div id="createPartyOrderMessage" style="margin-top:10px;color:#cfe9ff;font-size:13px;min-height:18px;"></div>
                    <div style="display:flex;justify-content:flex-end;margin-top:12px;">
                        <button id="createPartyStep4Done" style="padding:10px 14px;border-radius:8px;border:none;background:#1e90ff;color:#fff;cursor:pointer;display:none;">Done</button>
                    </div>
                </div>

                <div id="createPartyStep5" style="margin-top:18px;display:none;">
                    <h3 style="margin:0 0 8px 0;font-size:16px;">Enter Player Details</h3>
                    <div id="createPartyPlayersDetails" style="display:flex;flex-direction:column;gap:10px;"></div>
                    <div id="createPartyPlayersDetailsMessage" style="margin-top:10px;color:#cfe9ff;font-size:13px;min-height:18px;"></div>
                    <div style="display:flex;justify-content:flex-end;margin-top:12px;">
                        <button id="createPartyStep5Save" style="padding:10px 14px;border-radius:8px;border:none;background:#1e90ff;color:#fff;cursor:pointer;">Save</button>
                    </div>
                </div>

                <div id="createPartyStep6" style="margin-top:18px;display:none;">
                    <h3 id="createPartyStep6Title" style="margin:0 0 8px 0;font-size:16px;">Choose planet for Player</h3>
                    <div id="createPartyPlanetChoices" style="display:flex;gap:10px;flex-wrap:wrap;"></div>
                    <div id="createPartyPlanetMessage" style="margin-top:10px;color:#cfe9ff;font-size:13px;min-height:18px;"></div>
                    <div style="display:flex;justify-content:flex-end;margin-top:12px;">
                        <button id="createPartyStep6Done" style="padding:10px 14px;border-radius:8px;border:none;background:#1e90ff;color:#fff;cursor:pointer;display:none;">Done</button>
                    </div>
                </div>

            </div>
        `;

        document.body.appendChild(overlay);
        const nameInput = document.getElementById('createPartyNameInput');
        const nameBtn = document.getElementById('createPartyNameSaveBtn');
        const nameMsg = document.getElementById('createPartyNameMessage');
        const step2 = document.getElementById('createPartyStep2');
        const playersMsg = document.getElementById('createPartyPlayersMessage');

        function showStep2() {
            // hide step 1 and show step 2 full-screen card
            const step1 = document.getElementById('createPartyStep1');
            if (step1) step1.style.display = 'none';
            step2.style.display = 'block';
            const card = document.getElementById('createPartyCard');
            if (card) {
                card.querySelector('h2').textContent = 'Create Party — Step 2';
                card.style.alignItems = 'stretch';
                card.style.justifyContent = 'flex-start';
            }
            // Highlight previously selected player count if editing
            if (__createPartyState.currentName) {
                const parties = getSavedParties();
                const idx = findPartyByName(__createPartyState.currentName);
                if (idx !== -1 && parties[idx] && parties[idx].players) {
                    const savedPlayers = parties[idx].players;
                    const btn2 = document.getElementById('createPartyPlayers2');
                    const btn3 = document.getElementById('createPartyPlayers3');
                    const btn4 = document.getElementById('createPartyPlayers4');
                    if (btn2) btn2.style.border = savedPlayers === 2 ? '2px solid #0f0' : 'none';
                    if (btn3) btn3.style.border = savedPlayers === 3 ? '2px solid #0f0' : 'none';
                    if (btn4) btn4.style.border = savedPlayers === 4 ? '2px solid #0f0' : 'none';
                }
            }
        }

        nameBtn.addEventListener('click', () => {
            const entered = (nameInput.value || '').trim();
            if (!entered) {
                nameMsg.textContent = 'Please enter a party name.';
                return;
            }
            const originalName = (__createPartyState && __createPartyState.currentName) ? __createPartyState.currentName : null;
            const isSameExistingName = !!(originalName && String(originalName).toLowerCase() === String(entered).toLowerCase());
            const isEditingParty = !!(__createPartyState && __createPartyState.isEditing);
            if (findPartyByName(entered) !== -1 && !isSameExistingName) {
                nameMsg.textContent = 'It already saved as a Party.Choose another name!';
                return;
            }
            if (isEditingParty) {
                const parties = getSavedParties();
                const idx = findPartyByName(originalName || entered);
                if (idx !== -1) {
                    parties[idx] = Object.assign({}, parties[idx], { name: entered, updatedAt: Date.now() });
                    saveParties(parties);
                }
                __createPartyState = { inProgress: true, currentName: entered, isEditing: true };
                nameMsg.style.color = '#b7f5c9';
                nameMsg.textContent = 'Party name updated. Now choose number of players.';
                showStep2();
                return;
            }
            // New creation: save as Draft with status Draft
            const partyObj = { name: entered, status: 'Draft', players: null, createdAt: Date.now() };
            saveOrUpdateParty(partyObj);
            __createPartyState = { inProgress: true, currentName: entered, isEditing: false };
            nameMsg.style.color = '#b7f5c9';
            nameMsg.textContent = 'Saved as Draft. Now choose number of players.';
            showStep2();
        });

        // allow enter key
        nameInput.addEventListener('keydown', (ev) => {
            if (ev.key === 'Enter') {
                ev.preventDefault();
                nameBtn.click();
            }
        });

        function pickPlayers(count) {
            if (!__createPartyState.currentName) {
                playersMsg.textContent = 'Please enter and save a party name first.';
                return;
            }
            savePartyProgress({ players: count });
            playersMsg.textContent = __createPartyState.isEditing
                ? 'Player count saved (' + count + '). You can continue editing.'
                : 'Player count saved (' + count + '). You can continue creating or close to save as draft.';
            // advance to difficulty step (step 3)
            showStep3();
        }

        document.getElementById('createPartyPlayers2').addEventListener('click', () => { if (audioOn) playSound('tap'); pickPlayers(2); });
        document.getElementById('createPartyPlayers3').addEventListener('click', () => { if (audioOn) playSound('tap'); pickPlayers(3); });
        document.getElementById('createPartyPlayers4').addEventListener('click', () => { if (audioOn) playSound('tap'); pickPlayers(4); });

        function showStep3() {
            const step2el = document.getElementById('createPartyStep2');
            const step3el = document.getElementById('createPartyStep3');
            if (step2el) step2el.style.display = 'none';
            if (step3el) step3el.style.display = 'block';
            const card = document.getElementById('createPartyCard');
            if (card) card.querySelector('h2').textContent = 'Create Party — Step 3';
            // Get saved party difficulty if editing, otherwise use global difficulty
            let current = 'easy';
            if (__createPartyState.currentName) {
                const parties = getSavedParties();
                const idx = findPartyByName(__createPartyState.currentName);
                if (idx !== -1 && parties[idx] && parties[idx].difficulty) {
                    current = parties[idx].difficulty;
                }
            }
            // If no saved party difficulty, use global
            if (current === 'easy') {
                current = typeof difficulty !== 'undefined' ? difficulty : (localStorage.getItem('solarFlyDifficulty') || 'easy');
            }
            document.querySelectorAll('.diffOption').forEach(b => {
                b.style.border = (b.dataset.diff === current) ? '2px solid #0f0' : 'none';
            });
            focusFirstVisibleButton();

            // no external menu; difficulty buttons are embedded in this step
        }

        // difficulty selection handlers inside create flow — reuse existing .diffOption behavior
        document.querySelectorAll('.diffOption').forEach(btn => {
            btn.addEventListener('click', () => {
                if (audioOn) playSound('tap');
                const selected = btn.dataset.diff;
                // save to party object in localStorage
                if (__createPartyState.currentName) {
                    saveOrUpdateParty({ name: __createPartyState.currentName, difficulty: selected, updatedAt: Date.now() });
                    const msg = document.getElementById('createPartyDiffMessage');
                    if (msg) msg.textContent = 'Difficulty saved: ' + selected + '.';
                }
                // also set global difficulty and apply
                difficulty = selected;
                try { applyDifficulty(); } catch (e) {}
                try { saveGameData(); } catch (e) {}
                // visually mark selected
                document.querySelectorAll('.diffOption').forEach(b => b.style.border = (b.dataset.diff === selected) ? '2px solid #0f0' : 'none');
            });
        });

        // ===== Step 4: Choose starting order =====
        function showStep4() {
            const step3el = document.getElementById('createPartyStep3');
            const step4el = document.getElementById('createPartyStep4');
            if (step3el) step3el.style.display = 'none';
            if (step4el) step4el.style.display = 'block';
            const card = document.getElementById('createPartyCard');
            if (card) card.querySelector('h2').textContent = 'Create Party — Step 4';
            const parties = getSavedParties();
            const idx = findPartyByName(__createPartyState.currentName);
            const players = (idx !== -1 && parties[idx] && parties[idx].players) ? parties[idx].players : null;
            const orderButtons = document.getElementById('createPartyOrderButtons');
            const orderMsg = document.getElementById('createPartyOrderMessage');
            const doneBtn = document.getElementById('createPartyStep4Done');
            if (!players) {
                if (orderMsg) orderMsg.textContent = 'Please select number of players first.';
                if (orderButtons) orderButtons.innerHTML = '';
                if (doneBtn) doneBtn.style.display = 'none';
                return;
            }

            // Restore saved order if editing, otherwise start fresh.
            // If an existing party already has a complete order, reset the edit choice so the buttons still render
            // instead of leaving Step 4 with an empty set of choices.
            let savedOrder = [];
            if (idx !== -1 && parties[idx] && Array.isArray(parties[idx].order)) {
                savedOrder = Array.from(parties[idx].order);
            }
            const isEditingParty = !!(__createPartyState && __createPartyState.isEditing);
            if (isEditingParty && savedOrder.length >= players) {
                savedOrder = [];
            }

            const remaining = Array.from({length: players}, (_, i) => i + 1).filter(n => !savedOrder.includes(n));
            overlay.__orderState = { chosen: savedOrder, remaining: remaining, total: players };

            function ordinal(n) {
                const s = n % 100;
                if (s >= 11 && s <= 13) return n + 'th';
                switch (n % 10) {
                    case 1: return n + 'st';
                    case 2: return n + 'nd';
                    case 3: return n + 'rd';
                    default: return n + 'th';
                }
            }

            function finalizeOrder() {
                const rs = overlay.__orderState;
                if (!rs) return;
                // save order and proceed to Step 5 (player details)
                savePartyProgress({ order: rs.chosen });
                showStep5();
            }

            function renderOrderButtons() {
                if (!orderButtons) return;
                const rs = overlay.__orderState;
                orderButtons.innerHTML = '';
                rs.remaining.forEach(num => {
                    const b = document.createElement('button');
                    b.className = 'playerOrderBtn';
                    b.textContent = 'Player ' + num;
                    b.dataset.num = String(num);
                    b.style.flex = '1';
                    b.style.minWidth = '90px';
                    b.style.padding = '10px 12px';
                    b.style.borderRadius = '10px';
                    b.style.border = 'none';
                    b.style.cursor = 'pointer';
                    b.style.background = 'linear-gradient(90deg,#0b6,#06f)';
                    b.style.color = '#000';
                    b.style.fontWeight = '700';
                    b.addEventListener('click', () => {
                        if (audioOn) playSound('tap');
                        rs.chosen.push(num);
                        rs.remaining = rs.remaining.filter(x => x !== num);

                        // If only one remains, auto-assign them and finalize
                        if (rs.remaining.length === 1) {
                            const last = rs.remaining[0];
                            rs.chosen.push(last);
                            rs.remaining = [];
                            if (orderMsg) orderMsg.textContent = 'Order chosen: ' + rs.chosen.join(', ');
                            finalizeOrder();
                            return;
                        }

                        // If all chosen (edge-case), finalize
                        if (rs.chosen.length >= rs.total) {
                            if (orderMsg) orderMsg.textContent = 'Order chosen: ' + rs.chosen.join(', ');
                            finalizeOrder();
                            return;
                        }

                        // Prompt for next pick
                        const nextPick = rs.chosen.length + 1;
                        if (orderMsg) orderMsg.textContent = 'Now choose who will play ' + ordinal(nextPick) + '.';
                        renderOrderButtons();
                    });
                    orderButtons.appendChild(b);
                });
            }

            renderOrderButtons();
            if (orderMsg) orderMsg.textContent = 'Choose player who will start.';
            if (doneBtn) doneBtn.style.display = 'none';
            focusFirstVisibleButton();
            // Done button left hidden; flow auto-finalizes when order is complete
        }

        // ===== Step 5: Enter Player Details =====
        function showStep5() {
            const step4el = document.getElementById('createPartyStep4');
            const step5el = document.getElementById('createPartyStep5');
            if (step4el) step4el.style.display = 'none';
            if (step5el) step5el.style.display = 'block';
            const card = document.getElementById('createPartyCard');
            if (card) card.querySelector('h2').textContent = 'Create Party — Step 5';

            const parties = getSavedParties();
            const idx = findPartyByName(__createPartyState.currentName);
            const party = (idx !== -1) ? parties[idx] : null;
            const players = party && party.players ? party.players : null;
            const detailsContainer = document.getElementById('createPartyPlayersDetails');
            const msg = document.getElementById('createPartyPlayersDetailsMessage');
            const saveBtn = document.getElementById('createPartyStep5Save');
            if (!players || !detailsContainer) {
                if (msg) msg.textContent = 'Player count not set. Please go back and choose players.';
                return;
            }

            const defaultColors = ['#d32f2f', '#f4c542', '#1e90ff', '#2e7d32'];
            detailsContainer.innerHTML = '';

            const existing = party && Array.isArray(party.playersInfo) ? party.playersInfo : [];

            for (let i = 1; i <= players; i++) {
                const pi = existing.find(x => x.num === i) || { num: i, name: 'Player ' + i, icon: null, color: defaultColors[(i - 1) % defaultColors.length] };
                const row = document.createElement('div');
                row.style.display = 'flex';
                row.style.alignItems = 'center';
                row.style.gap = '8px';

                const label = document.createElement('div');
                label.textContent = 'Player ' + i;
                label.style.minWidth = '70px';
                label.style.color = '#cfe9ff';

                const nameInput = document.createElement('input');
                nameInput.type = 'text';
                nameInput.value = pi.name || ('Player ' + i);
                nameInput.style.flex = '1';
                nameInput.style.padding = '8px';
                nameInput.style.borderRadius = '8px';
                nameInput.style.border = '1px solid rgba(255,255,255,0.08)';
                nameInput.style.background = 'transparent';
                nameInput.style.color = '#fff';

                const avatarWrap = document.createElement('div');
                avatarWrap.style.display = 'flex';
                avatarWrap.style.alignItems = 'center';
                avatarWrap.style.gap = '8px';

                const avatarPreview = document.createElement('div');
                avatarPreview.style.width = '36px';
                avatarPreview.style.height = '36px';
                avatarPreview.style.borderRadius = '50%';
                avatarPreview.style.display = 'flex';
                avatarPreview.style.alignItems = 'center';
                avatarPreview.style.justifyContent = 'center';
                avatarPreview.style.fontWeight = '700';
                avatarPreview.style.color = '#fff';
                avatarPreview.style.background = pi.color || defaultColors[(i - 1) % defaultColors.length];
                avatarPreview.textContent = String(i);
                avatarPreview.title = 'Player ' + i;

                const fileInput = document.createElement('input');
                fileInput.type = 'file';
                fileInput.accept = 'image/*';
                fileInput.style.display = 'none';

                const uploadBtn = document.createElement('button');
                uploadBtn.type = 'button';
                uploadBtn.textContent = 'Upload';
                uploadBtn.style.padding = '6px 8px';
                uploadBtn.style.borderRadius = '8px';
                uploadBtn.style.border = '1px solid rgba(255,255,255,0.08)';
                uploadBtn.style.cursor = 'pointer';
                uploadBtn.style.background = 'transparent';
                uploadBtn.style.color = '#fff';
                uploadBtn.addEventListener('click', () => fileInput.click());

                fileInput.addEventListener('change', (ev) => {
                    const f = ev.target.files && ev.target.files[0];
                    if (!f) return;
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const data = e.target.result;
                        avatarPreview.style.backgroundImage = 'url("' + data + '")';
                        avatarPreview.style.backgroundSize = 'cover';
                        avatarPreview.style.backgroundPosition = 'center';
                        avatarPreview.style.backgroundColor = 'transparent';
                        avatarPreview.textContent = '';
                        nameInput.dataset.avatar = data;
                    };
                    reader.readAsDataURL(f);
                });

                if (pi.icon && pi.icon.startsWith('data:')) {
                    avatarPreview.style.backgroundImage = 'url("' + pi.icon + '")';
                    avatarPreview.style.backgroundSize = 'cover';
                    avatarPreview.style.backgroundPosition = 'center';
                    avatarPreview.style.backgroundColor = 'transparent';
                    avatarPreview.textContent = '';
                    nameInput.dataset.avatar = pi.icon;
                } else {
                    nameInput.dataset.avatar = pi.icon || null;
                    nameInput.dataset.color = pi.color || defaultColors[(i - 1) % defaultColors.length];
                }

                avatarWrap.appendChild(avatarPreview);
                avatarWrap.appendChild(uploadBtn);
                avatarWrap.appendChild(fileInput);

                row.appendChild(label);
                row.appendChild(nameInput);
                row.appendChild(avatarWrap);
                detailsContainer.appendChild(row);
            }

            if (msg) msg.textContent = 'Upload a photo for each player. If none is uploaded, the default color will be used.';

            saveBtn.onclick = () => {
                console.log('createParty: Step5 Save clicked for', __createPartyState && __createPartyState.currentName);
                const rows = detailsContainer.children;
                const playersInfo = [];
                for (let i = 0; i < rows.length; i++) {
                    const row = rows[i];
                    const input = row.querySelector('input');
                    const defaultColor = defaultColors[i % defaultColors.length];
                    const icon = input.dataset.avatar || null;
                    const name = (input.value || '').trim() || ('Player ' + (i + 1));
                    playersInfo.push({ num: i + 1, name, icon, color: defaultColor });
                }
                savePartyProgress({ playersInfo: playersInfo });
                // Proceed to Step 6: choose planets for each player
                try {
                    // small delay to ensure DOM has updated and styles applied
                    setTimeout(() => {
                        try { console.log('createParty: calling showStep6'); showStep6(); } catch (e) { console.warn('showStep6 error', e); }
                    }, 60);
                } catch (e) {
                    console.warn('Failed scheduling showStep6', e);
                }
            };

            focusFirstVisibleButton();
        }

        // ===== Step 6: Choose planets for each player =====
        function showStep6() {
            console.log('showStep6() start for', __createPartyState && __createPartyState.currentName);
            const step5el = document.getElementById('createPartyStep5');
            const step6el = document.getElementById('createPartyStep6');
            const card = document.getElementById('createPartyCard');
            if (card) card.querySelector('h2').textContent = 'Create Party — Step 6';
            if (step5el) step5el.style.display = 'none';
            if (step6el) step6el.style.display = 'block';
            const title = document.getElementById('createPartyStep6Title');
            const choices = document.getElementById('createPartyPlanetChoices');
            const msg = document.getElementById('createPartyPlanetMessage');

            const parties = getSavedParties();
            const idx = findPartyByName(__createPartyState.currentName);
            const party = (idx !== -1) ? parties[idx] : null;
            if (!party || !party.players || !party.playersInfo) {
                if (msg) msg.textContent = 'Player details missing. Please go back and fill player info.';
                return;
            }

            // Build planet choice list from planetData and unlocked state
            const planetsList = Array.isArray(planetData) ? planetData.map(p => ({ key: p.key || (p.name || '').toLowerCase(), name: p.name || p.label || p.key, icon: p.icon || p.emoji || p.symbol || '', raw: p })) : [];
            const isAdminUnlockAll = (typeof getAdminUnlockAllPlanets === 'function' && getAdminUnlockAllPlanets() === 'yes');

            // attach state
            overlay.__planetState = overlay.__planetState || { idx: 0, playersInfo: JSON.parse(JSON.stringify(party.playersInfo)) };

            const continueBtn = document.getElementById('createPartyStep6Done');
            if (continueBtn) continueBtn.style.display = 'none';

            function renderForIndex() {
                const ps = overlay.__planetState;
                const current = ps.playersInfo[ps.idx];
                if (title) title.textContent = 'Choose the Planet of ' + (current && current.name ? current.name : ('Player ' + (ps.idx + 1)));
                if (!choices) return;
                // Use same grid and cell markup as Planets menu so design matches exactly
                choices.className = 'planetGrid';
                choices.innerHTML = '';

                // Ensure selectedKey falls back to any already-assigned planet for this player
                if (!ps.selectedKey && current && current.planet) ps.selectedKey = current.planet;

                Array.isArray(planetData) && planetData.forEach((pd, i) => {
                    const cell = document.createElement('div');
                    cell.className = 'planetCell';
                    cell.dataset.key = pd.key;
                    cell.dataset.planet = pd.key;
                    cell.tabIndex = 0;

                    const isUnlockedByScore = unlocked[i];
                    const isLocked = !isUnlockedByScore && pd.key !== 'pluto';

                    if (!isLocked && pd.key !== 'pluto') cell.classList.add('unlocked');

                    // visual / name
                    const visualHtml = buildPlanetVisualMarkup(pd.key, 40);

                    if (pd.key === 'pluto') {
                        cell.innerHTML = `<div class="big-lock">🔒</div><div>${pd.name}</div><div class='lockInfo'>Coming Soon</div>`;
                        cell.classList.add('locked');
                        cell.onclick = () => showMessage('Coming Soon', 'It will coming soon message');
                    } else if (isLocked) {
                        cell.innerHTML = `<div class="big-lock">🔒</div><div>${pd.name}</div><div class='lockInfo'>${pd.unlock} Score</div>`;
                        cell.classList.add('locked');
                        cell.onclick = () => {
                            if (high < pd.unlock) {
                                showMessage('Planet Locked', `You need a High Score of ${pd.unlock} to unlock ${pd.name}!`);
                            } else {
                                unlocked[i] = true;
                                keyShown[i] = true;
                                saveGameData();
                                // re-render choices for exact visual parity
                                renderForIndex();
                            }
                        };
                    } else {
                        // check whether this planet is already assigned to this player
                        const assignedKey = ps && ps.playersInfo && ps.playersInfo[ps.idx] ? ps.playersInfo[ps.idx].planet : null;
                        const isSelected = (ps.selectedKey === pd.key) || (assignedKey === pd.key);
                        if (isSelected) {
                            cell.style.border = '2px solid #0f0';
                            cell.style.boxShadow = '0 0 10px rgba(0,255,0,0.5)';
                        }
                        cell.innerHTML = `${visualHtml}<div>${pd.name}</div>${isSelected ? '<div style="font-size:12px;color:#0f0;font-weight:bold;">SELECTED ✅</div>' : `<div class='lockInfo'></div>`}`;

                        // Selection click only marks choice and enables Continue button
                        cell.addEventListener('click', () => {
                            if (audioOn) try { playSound('tap'); } catch (e) {}
                            // If locked/pluto cases handled above won't reach here
                            ps.selectedKey = pd.key;
                            if (continueBtn) continueBtn.style.display = 'inline-block';
                            renderForIndex();
                        });
                    }

                    choices.appendChild(cell);
                });

                if (msg) msg.textContent = 'Tap a planet to assign it to this player.';
            }

            renderForIndex();
            focusFirstVisibleButton();

            // Show Continue if a selection already exists
            try { if (continueBtn && overlay && overlay.__planetState && overlay.__planetState.selectedKey) continueBtn.style.display = 'inline-block'; } catch (e) {}

            // Wire up Continue button to confirm selection
            if (continueBtn) {
                continueBtn.onclick = () => {
                    if (audioOn) try { playSound('tap'); } catch (e) {}
                    const ps = overlay.__planetState;
                    const sel = ps && ps.selectedKey ? ps.selectedKey : (ps && ps.playersInfo && ps.playersInfo[ps.idx] ? ps.playersInfo[ps.idx].planet : null);
                    if (!sel) {
                        if (msg) msg.textContent = 'Please select a planet first.';
                        return;
                    }
                    // assign selected planet to current player
                    ps.playersInfo[ps.idx].planet = sel;
                    savePartyProgress({ playersInfo: ps.playersInfo });
                    // advance to next player or finish
                    if (ps.idx < (ps.playersInfo.length - 1)) {
                        ps.idx += 1;
                        // pre-select next player's planet if already assigned
                        ps.selectedKey = ps.playersInfo[ps.idx].planet || null;
                        // hide continue until a new selection is made (or shown if already assigned)
                        if (!ps.selectedKey) continueBtn.style.display = 'none';
                        renderForIndex();
                    } else {
                        // finalize
                        saveOrUpdateParty({ name: __createPartyState.currentName, playersInfo: ps.playersInfo, status: 'Created', updatedAt: Date.now() });
                        overlay.remove();
                        __createPartyState = { inProgress: false, currentName: null, isEditing: false };
                        // Small delay to ensure localStorage is synced before refreshing the party chooser
                        setTimeout(() => {
                            showPartyChooser();
                        }, 100);
                    }
                };
            }
        }

        const step3Continue = document.getElementById('createPartyStep3Continue');
        if (step3Continue) {
            step3Continue.addEventListener('click', () => {
                if (audioOn) playSound('tap');
                // Ensure party has difficulty saved; if not, default to current global
                const parties = getSavedParties();
                const idx = findPartyByName(__createPartyState.currentName);
                const sel = (idx !== -1 && parties[idx] && parties[idx].difficulty) ? parties[idx].difficulty : (difficulty || localStorage.getItem('solarFlyDifficulty') || 'easy');
                if (__createPartyState.currentName) {
                    savePartyProgress({ difficulty: sel });
                }
                // Advance to Step 4: choose starting order
                showStep4();
            });
        }

        const closeBtn = document.getElementById('createPartyClose');
        closeBtn.addEventListener('click', () => {
            if (audioOn) playSound('tap');
            const isEditingParty = !!(
                (__createPartyState && __createPartyState.isEditing) ||
                (window.__resumeCreateParty && window.__resumeCreateParty.isEditing)
            );

            // Editing mode: close immediately and discard the edit session.
            // No draft save, no delete, no extra prompt.
            if (isEditingParty) {
                window.__resumeCreateParty = null;
                overlay.remove();
                __createPartyState = { inProgress: false, currentName: null, isEditing: false };
                setTimeout(() => {
                    showPartyChooser();
                }, 100);
                return;
            }

            // New creation flow still keeps the old draft behavior.
            const isCreatingNewParty = __createPartyState && __createPartyState.inProgress && __createPartyState.currentName;
            if (isCreatingNewParty) {
                showDialog({
                    title: 'Save Draft?',
                    text: 'Do you want save this party as a draft?',
                    confirmText: 'Yes',
                    cancelText: 'No',
                    showCancel: true,
                    onConfirm: () => {
                        window.__resumeCreateParty = null;
                        overlay.remove();
                        __createPartyState = { inProgress: false, currentName: null, isEditing: false };
                        setTimeout(() => {
                            showPartyChooser();
                        }, 100);
                    },
                    onCancel: () => {
                        if (__createPartyState && __createPartyState.currentName) {
                            removePartyByName(__createPartyState.currentName);
                        }
                        window.__resumeCreateParty = null;
                        overlay.remove();
                        __createPartyState = { inProgress: false, currentName: null, isEditing: false };
                        setTimeout(() => {
                            showPartyChooser();
                        }, 100);
                    }
                });
                return;
            }

            window.__resumeCreateParty = null;
            overlay.remove();
            __createPartyState = { inProgress: false, currentName: null, isEditing: false };
            setTimeout(() => {
                showPartyChooser();
            }, 100);
        });

        // If a resume request was set before opening, restore state and jump to the saved step
        try {
            if (window.__resumeCreateParty && window.__resumeCreateParty.name) {
                const resumeName = window.__resumeCreateParty.name;
                const isEditingParty = !!(window.__resumeCreateParty && window.__resumeCreateParty.isEditing);
                window.__resumeCreateParty = null;
                __createPartyState = { inProgress: true, currentName: resumeName, isEditing: isEditingParty };
                try { nameInput.value = resumeName; } catch (e) {}
                const parties = getSavedParties();
                const idx = findPartyByName(resumeName);
                const party = (idx !== -1) ? parties[idx] : null;

                if (isEditingParty) {
                    try {
                        const step1el = document.getElementById('createPartyStep1');
                        const step2el = document.getElementById('createPartyStep2');
                        const step3el = document.getElementById('createPartyStep3');
                        const step4el = document.getElementById('createPartyStep4');
                        const step5el = document.getElementById('createPartyStep5');
                        const step6el = document.getElementById('createPartyStep6');
                        if (step1el) step1el.style.display = 'block';
                        if (step2el) step2el.style.display = 'none';
                        if (step3el) step3el.style.display = 'none';
                        if (step4el) step4el.style.display = 'none';
                        if (step5el) step5el.style.display = 'none';
                        if (step6el) step6el.style.display = 'none';
                        const card = document.getElementById('createPartyCard');
                        if (card && card.querySelector('h2')) card.querySelector('h2').textContent = 'Create Party — Step 1';
                        nameMsg.textContent = 'Edit the party name, then continue.';
                        nameMsg.style.color = '#cfe9ff';
                    } catch (e) { console.warn('Error preparing edit step 1 state', e); }
                    return;
                }

                try {
                    // Ensure Step1 is hidden when resuming to a later step
                    const step1el = document.getElementById('createPartyStep1'); if (step1el) step1el.style.display = 'none';
                    if (!party || !party.players) {
                        showStep2();
                    } else if (!party.difficulty) {
                        showStep3();
                    } else if (!party.order) {
                        showStep4();
                    } else if (!party.playersInfo) {
                        // players details not filled yet
                        showStep5();
                    } else {
                        // playersInfo exists — if any player missing a planet, resume to Step 6
                        try {
                            const missingPlanet = Array.isArray(party.playersInfo) && party.playersInfo.some(pi => !pi.planet);
                            if (missingPlanet) {
                                showStep6();
                            } else {
                                // All planets assigned — open chooser to review created party
                                showPartyChooser();
                            }
                        } catch (e) {
                            // fallback to step5 if showStep6 errors
                            console.warn('Error evaluating playersInfo for resume', e);
                            showStep5();
                        }
                    }
                } catch (e) { console.warn('Failed to resume create flow steps', e); }
            }
        } catch (e) { console.warn('resume handling error', e); }

        // focus input
        try { nameInput.focus(); } catch (e) {}
    }

  function startGameInFamilyMode() {
      // Launch the game directly in Family mode
      if (savedGameState) {
          continueChoiceMenu.style.display = 'flex';
      } else {
          try {
              // If a party is selected, apply the current player's planet to the gameplay player
              if (window.__selectedFamilyParty) {
                  const parties = getSavedParties();
                  const pname = String(window.__selectedFamilyParty || '').toLowerCase();
                  const party = parties.find(p => String(p.name || '').toLowerCase() === pname) || null;
                  if (party) {
                      const order = getFamilyTurnOrder(party);
                      const turnIndex = Number(window.__familyPartyTurnIndex ?? 0);
                      const activePlayerNumber = order.length > 0 ? order[turnIndex % order.length] : 1;
                      const playersInfo = Array.isArray(party.playersInfo) ? party.playersInfo : [];
                      const info = playersInfo.find(pi => Number(pi.num) === Number(activePlayerNumber));
                      if (info && info.planet) {
                          player.planetKey = String(info.planet);
                          try { localStorage.setItem('solarFlyPlanetKey', player.planetKey); } catch (e) {}
                      }
                  }
              }
          } catch (e) { console.warn('startGameInFamilyMode: failed to apply selected planet', e); }
          if (stagesBtn) stagesBtn.style.display = 'none';
          showLoadingScreen(() => {
              menu.style.display = 'none';
              start();
              if (audioOn) tryPlayBackgroundMusic();
          });
      }
  }

  function isFamilyModeActive() {
      return gameMode === 'family' || localStorage.getItem(gameModeStorageKey) === 'family';
  }

  function isFamilyForwardRunActive() {
      return isFamilyModeActive();
  }

  function applyFamilyForwardRunUI() {
      const saveMenuBtnEl = document.getElementById('saveMenuBtn');
      const quitMenuBtnEl = document.getElementById('quitMenuBtn');
      if (saveMenuBtnEl) {
          saveMenuBtnEl.style.display = isFamilyForwardRunActive() ? 'none' : 'inline-block';
      }
      if (quitMenuBtnEl) {
          quitMenuBtnEl.textContent = isFamilyForwardRunActive() ? 'Menu' : 'Quit & Menu';
      }
      if (gameOver) {
          gameOver.style.background = isFamilyForwardRunActive() ? 'black' : '';
      }
  }

  function debugPlayClick(source, event) {
      if (!playBtn) return;
      const issues = [];
      if (!menu) issues.push('menu element missing');
      if (playBtn.disabled) issues.push('playBtn.disabled is true');
      if (playBtn.style.pointerEvents === 'none') issues.push('playBtn pointer-events is none');
      if (playBtn.classList.contains('family-disabled')) issues.push('playBtn has family-disabled class');
      if (!isFamilyModeActive()) issues.push('Family mode is not active');
      if (typeof showPartyChooser !== 'function') issues.push('showPartyChooser() is not defined');
  }

  function attachFamilyModePlayHandler() {
      if (!playBtn) return;
      const handler = (e) => {
          debugPlayClick('family-mode handler', e);
          if (!isFamilyModeActive()) return;
          if (document.getElementById('familyPartyChooserOverlay')) {
              console.log('Family party chooser already open; ignoring duplicate handler call');
              return;
          }
          e.preventDefault();
          e.stopPropagation();
          showPartyChooser();
      };

      if (playBtn.dataset.familyClickAdded !== '1') {
          playBtn.addEventListener('click', handler, true);
          playBtn.dataset.familyClickAdded = '1';
      }
  }

  function updateGameModeControls() {
      const isFamilyMode = gameMode === 'family';
      if (classicGameModeBtn) {
          classicGameModeBtn.textContent = 'Classic';
          classicGameModeBtn.classList.toggle('is-active', !isFamilyMode);
          classicGameModeBtn.setAttribute('aria-pressed', String(!isFamilyMode));
      }
      if (familyGameModeBtn) {
          familyGameModeBtn.textContent = 'Family';
          familyGameModeBtn.classList.toggle('is-active', isFamilyMode);
          familyGameModeBtn.setAttribute('aria-pressed', String(isFamilyMode));
      }
  }

  function updateGameplayControlsUI() {
      const isButtonMode = gameplayControls === 'button';
      if (touchControlsBtn) {
          touchControlsBtn.textContent = 'Touch';
          touchControlsBtn.classList.toggle('is-active', !isButtonMode);
          touchControlsBtn.setAttribute('aria-pressed', String(!isButtonMode));
      }
      if (buttonControlsBtn) {
          buttonControlsBtn.textContent = 'Button';
          buttonControlsBtn.classList.toggle('is-active', isButtonMode);
          buttonControlsBtn.setAttribute('aria-pressed', String(isButtonMode));
      }
  }

  function setGameMode(mode) {
      const normalizedMode = mode === 'family' ? 'family' : 'classic';
      gameMode = normalizedMode;
      localStorage.setItem(gameModeStorageKey, normalizedMode);
      updateGameModeControls();
      resetMainMenuButtonVisibility();
      applyFamilyModeMenuUI();
      // Update pause/menu UI that depends on family/classic forward-run behavior
      try { if (typeof applyFamilyForwardRunUI === 'function') applyFamilyForwardRunUI(); } catch (e) { console.warn('applyFamilyForwardRunUI failed', e); }
      // 🚀 Sync banner visibility when mode changes
      if (typeof window.updateBannerForGameMode === 'function') {
          window.updateBannerForGameMode(normalizedMode);
      }
      if (typeof applyDifficulty === 'function') {
          applyDifficulty();
      }
      return gameMode;
  }

  function setGameplayControls(mode) {
      const normalizedMode = mode === 'button' ? 'button' : 'touch';
      gameplayControls = normalizedMode;
      localStorage.setItem(gameplayControlsStorageKey, normalizedMode);
      updateGameplayControlsUI();
      updateJumpControlButtonVisibility();
      return gameplayControls;
  }

  function getGameMode() {
      return gameMode;
  }

  function getGameplayControls() {
      return gameplayControls;
  }

  window.getTextureSystem = getTextureSystem;
  window.setTextureSystem = setTextureSystem;
  window.applyTextureSystem = applyTextureSystem;
  window.getGameMode = getGameMode;
  window.setGameMode = setGameMode;
  window.getGameplayControls = getGameplayControls;
  window.setGameplayControls = setGameplayControls;
  const reviveButtonElement = document.getElementById('reviveBtn');
  const marketMenuBtn = document.getElementById('marketMenuBtn');
  const marketplaceOverlay = document.getElementById('marketplaceOverlay');
  const closeMarketplaceBtn = document.getElementById('closeMarketplaceBtn');
  const currentVersionValue = document.getElementById('currentVersionValue');
  const versionStatusText = document.getElementById('versionStatusText');

  function showSettingsEmptyState() {
      settingsSectionButtons.forEach(button => {
          button.classList.remove('is-active');
          button.setAttribute('aria-expanded', 'false');
      });
      settingsSectionPanels.forEach(panel => panel.classList.remove('is-active'));
  }

  function setActiveSettingsSection(sectionId) {
      if (!sectionId) {
          showSettingsEmptyState();
          return;
      }

      const selectedButton = document.querySelector(`.settings-nav-btn[data-section="${sectionId}"]`);
      const selectedPanel = document.getElementById(`settings-panel-${sectionId}`);
      if (!selectedButton || !selectedPanel) return;

      const isAlreadyOpen = selectedButton.classList.contains('is-active');
      showSettingsEmptyState();

      if (!isAlreadyOpen) {
          selectedButton.classList.add('is-active');
          selectedButton.setAttribute('aria-expanded', 'true');
          selectedPanel.classList.add('is-active');
      }
  }

  settingsSectionButtons.forEach(button => {
      button.addEventListener('click', () => {
          const sectionId = button.getAttribute('data-section');
          setActiveSettingsSection(sectionId);
      });
  });

  showSettingsEmptyState();

  // Expose prompt helpers early for browser console testing
  window.showGooglePlayPrompt = window.showGooglePlayPrompt || function(){ console.warn('showGooglePlayPrompt called before init'); };
  window.hideGooglePlayPrompt = window.hideGooglePlayPrompt || function(){ console.warn('hideGooglePlayPrompt called before init'); };
  window.tryGooglePlaySignIn = window.tryGooglePlaySignIn || function(){ console.warn('tryGooglePlaySignIn called before init'); };
  window.isAndroidBridgeAvailable = window.isAndroidBridgeAvailable || function() {
      try {
          return typeof Android !== 'undefined' && Android !== null;
      } catch (e) {
          return false;
      }
  };
  window.isAndroidDevice = window.isAndroidDevice || function(){
      try {
          const hasAndroidBridge = typeof Android !== 'undefined' && Android !== null;
          const uaAndroid = /Android/i.test(navigator.userAgent);
          return hasAndroidBridge || uaAndroid;
      } catch (e) {
          return false;
      }
  };

  function getOperatingSystemProfileInfo() {
      try {
          const ua = navigator.userAgent || '';
          const platform = (navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || '';
          const browserPlatform = (platform || '').toLowerCase();
          const browserUA = (ua || '').toLowerCase();

          if (/android/i.test(browserUA) || /android/i.test(browserPlatform)) {
              return { name: 'Android', icon: 'social_icon/android.png' };
          }
          if (/iphone|ipad|ipod/i.test(browserUA) || /iphone|ipad|ipod/i.test(browserPlatform)) {
              return { name: 'iPhone', icon: 'social_icon/ios.png' };
          }
          if (/windows/i.test(browserUA) || /win/i.test(browserPlatform)) {
              return { name: 'Windows', icon: 'social_icon/Windows.png' };
          }
          if (/linux/i.test(browserUA) || /linux/i.test(browserPlatform)) {
              return { name: 'Linux', icon: 'social_icon/Linux.png' };
          }
          if (/mac/i.test(browserUA) || /mac/i.test(browserPlatform)) {
              return { name: 'Mac OS', icon: 'social_icon/mac.png' };
          }
          if (/cros/i.test(browserUA) || /chrome os/i.test(browserUA)) {
              return { name: 'Chrome OS', icon: 'social_icon/chrome_os.png' };
          }
      } catch (e) {
          // Fall through to Android bridge check below
      }

      try {
          if (typeof Android !== 'undefined' && Android !== null) {
              return { name: 'Android', icon: 'social_icon/android.png' };
          }
      } catch (e) {
          // Fall through to browser fallback
      }

      return { name: '🌐Browser', icon: '' };
  }

  function updateProfileOperatingSystemDisplay() {
      if (!profileOperatingSystemDisplay) return;
      const osInfo = getOperatingSystemProfileInfo();
      if (osInfo.icon) {
          profileOperatingSystemDisplay.innerHTML = '<span class="stat-icon"><img src="' + osInfo.icon + '" alt="' + osInfo.name + '" /></span><span>' + osInfo.name + '</span>';
      } else {
          profileOperatingSystemDisplay.textContent = osInfo.name;
      }
  }
  window.isGooglePlaySignedIn = window.isGooglePlaySignedIn || function(){ return localStorage.getItem('gpgSignedIn') === '1'; };

  // NEW ACHIEVEMENT ELEMENTS
  const achievementsBtn = document.getElementById('achievementsBtn');
  const achievementsMenu = document.getElementById('achievementsMenu');
  const achievementGrid = document.getElementById('achievementGrid');
  const closeAchievementsBtn = document.getElementById('closeAchievementsBtn');
  const achievementFullScreen = document.getElementById('achievementFullScreen');
  const achievementFullScreenTitle = document.getElementById('achievementFullScreenTitle');
  const achievementFullScreenContent = document.getElementById('achievementFullScreenContent');
  const achievementFullScreenBackBtn = document.getElementById('achievementFullScreenBackBtn');

  const stagesBtn = document.getElementById('stagesBtn');
  const stagesBtnIcon = document.getElementById('stagesBtnIcon');
  const stagesBtnBadge = document.getElementById('stagesBtnBadge');
  const stagesOverlay = document.getElementById('stagesOverlay');
  const closeStagesBtn = document.getElementById('closeStagesBtn');
  let stagesOpenedFromGameOver = false;
  const currentStageBadge = document.getElementById('currentStageBadge');
  const nextStageBadge = document.getElementById('nextStageBadge');
  const currentStageName = document.getElementById('currentStageName');
  const nextStageName = document.getElementById('nextStageName');
  const stagesTaskList = document.getElementById('stagesTaskList');
  const stageMainBadge = document.getElementById('stageMainBadge');
  const stageMainView = document.getElementById('stageMainView');
  const seeAllStagesBtn = document.getElementById('seeAllStagesBtn');
  const stagesAllView = document.getElementById('stagesAllView');
  const stagesAllList = document.getElementById('stagesAllList');
  const backToStageSummaryBtn = document.getElementById('backToStageSummaryBtn');
  const journeyCurrentStageBadge = document.getElementById('journeyCurrentStageBadge');
  const journeyNextStageBadge = document.getElementById('journeyNextStageBadge');
  const journeyCurrentStageName = document.getElementById('journeyCurrentStageName');
  const journeyNextStageName = document.getElementById('journeyNextStageName');
  const journeyTaskList = document.getElementById('journeyTaskList');
  const journeyProgressFill = document.getElementById('journeyProgressFill');
  const profileCurrentStage = document.getElementById('profileCurrentStage');

  // Stage transition overlay elements
  const stageTransitionOverlay = document.getElementById('stageTransitionOverlay');
  const transitionPrevBadge = document.getElementById('transitionPrevBadge');
  const transitionPrevName = document.getElementById('transitionPrevName');
  const transitionStagePanel = document.getElementById('transitionStagePanel');
  const transitionFlash = document.getElementById('transitionFlash');
  const transitionResult = document.getElementById('transitionResult');
  const transitionNewBadge = document.getElementById('transitionNewBadge');
  const transitionNewName = document.getElementById('transitionNewName');
  const transitionSkipHint = document.getElementById('transitionSkipHint');
  const beginGameBtn = document.getElementById('beginGameBtn');
  const transitionBackground = stageTransitionOverlay ? stageTransitionOverlay.querySelector('.transition-background') : null;

  let stageTransitionStep = 0;
  let stageTransitionTimer = null;
  let stageTransitionContext = null;
  let stageTransitionPausedBgAudio = false;
  let suppressGooglePlayPrompt = false;

  // NEW DAILY REWARD ELEMENTS
  const dailyRewardMenu = document.getElementById('dailyRewardMenu');
  const rewardGrid = document.getElementById('rewardGrid');
  const collectRewardBtn = document.getElementById('collectRewardBtn');

  const updateModal = document.getElementById('updateModal');
  const updateYesBtn = document.getElementById('updateYesBtn');
  const updateNoBtn = document.getElementById('updateNoBtn');
  const updateSkipCheckbox = document.getElementById('updateSkipCheckbox');
  const manualUpdateBtn = document.getElementById('manualUpdateBtn');
  let updateAvailable = false;
    // Google Play Games prompt elements and helpers
    const gpPromptOverlay = document.getElementById('gpPromptOverlay');
    const gpAddNowBtn = document.getElementById('gpAddNowBtn');
    const gpNotNowBtn = document.getElementById('gpNotNowBtn');
    const gpPromptStatus = document.getElementById('gpPromptStatus');

    function isAndroidDevice() {
        try {
            return /Android/i.test(navigator.userAgent) || typeof Android !== 'undefined';
        } catch (e) {
            return false;
        }
    }

    function isGooglePlaySignedIn() {
        return localStorage.getItem('gpgSignedIn') === '1';
    }

    function showGooglePlayPrompt() {
        if (!gpPromptOverlay) return;
        if (gpPromptStatus) gpPromptStatus.textContent = '';
        gpPromptOverlay.style.display = 'flex';
    }

    function hideGooglePlayPrompt() {
        if (!gpPromptOverlay) return;
        gpPromptOverlay.style.display = 'none';
    }

    function tryGooglePlaySignIn() {
        if (typeof Android !== 'undefined') {
            if (typeof Android.requestPlayGamesSignIn === 'function') {
                try { Android.requestPlayGamesSignIn(); return; } catch (e) { console.warn('Android sign-in call failed', e); }
            } else if (typeof Android.signInGooglePlayGames === 'function') {
                try { Android.signInGooglePlayGames(); return; } catch (e) { console.warn('Android sign-in call failed', e); }
            } else if (Android.requestPlayGamesSignIn) {
                try { Android.requestPlayGamesSignIn(); return; } catch (e) { console.warn('Android sign-in call failed', e); }
            } else if (Android.signInGooglePlayGames) {
                try { Android.signInGooglePlayGames(); return; } catch (e) { console.warn('Android sign-in call failed', e); }
            }
        }
        // No bridge available (e.g., running in browser) — simulate a 409 response so UX moves on
        if (gpPromptStatus) gpPromptStatus.textContent = 'Error 409: cant connect to the operating system';
        setTimeout(() => { window.googlePlaySignInResult && window.googlePlaySignInResult(409); }, 600);
    }

    // Expose helper functions for browser console testing
    window.isAndroidDevice = isAndroidDevice;
    window.isGooglePlaySignedIn = isGooglePlaySignedIn;
    window.showGooglePlayPrompt = showGooglePlayPrompt;
    window.hideGooglePlayPrompt = hideGooglePlayPrompt;
    window.tryGooglePlaySignIn = tryGooglePlaySignIn;

    // Android should call window.googlePlaySignInResult(code)
    window.googlePlaySignInResult = function(code) {
        try {
            console.log('googlePlaySignInResult', code);
            if (code === 200) {
                localStorage.setItem('gpgSignedIn', '1');
            } else if (code === 409) {
                if (gpPromptStatus) gpPromptStatus.textContent = 'Error 409: cant connect to the operating system';
                return;
            }
        } catch (e) { console.warn(e); }
        hideGooglePlayPrompt();
        // Ensure we go to menu after handling
        try { showMenu(); } catch (e) {}
    };

    if (gpAddNowBtn) gpAddNowBtn.addEventListener('click', function(){ if (audioOn) playSound('tap'); tryGooglePlaySignIn(); });
    if (gpNotNowBtn) gpNotNowBtn.addEventListener('click', function(){ if (audioOn) playSound('tap'); hideGooglePlayPrompt(); try { showMenu(); } catch(e){} });
  
  // Notification Panel Elements
  const notificationBtn = document.getElementById('notificationBtn');
  const notificationPanel = document.getElementById('notificationPanel');
  const notificationList = document.getElementById('notificationList');
  const notificationPrevBtn = document.getElementById('notificationPrevBtn');
  const notificationNextBtn = document.getElementById('notificationNextBtn');
  const notificationPageInfo = document.getElementById('notificationPageInfo');
  const closeNotificationBtn = document.getElementById('closeNotificationBtn');
  let notificationPageState = { currentPage: 0, totalPages: 0 };
  let notificationMessages = [];
  const notificationPageSize = 5;
  let notificationReconnectInterval = null;
  
  function updateNotificationPagination() {
      if (!notificationPageInfo) return;
      if (notificationPageState.totalPages <= 0) {
          notificationPageState.currentPage = 0;
          notificationPageInfo.textContent = 'Page 0 of 0';
      } else {
          if (notificationPageState.currentPage < 1) notificationPageState.currentPage = 1;
          if (notificationPageState.currentPage > notificationPageState.totalPages) notificationPageState.currentPage = notificationPageState.totalPages;
          notificationPageInfo.textContent = `Page ${notificationPageState.currentPage} of ${notificationPageState.totalPages}`;
      }

      if (notificationPrevBtn) {
          if (notificationPageState.currentPage > 1) {
              notificationPrevBtn.classList.remove('disabled');
          } else {
              notificationPrevBtn.classList.add('disabled');
          }
      }

      if (notificationNextBtn) {
          if (notificationPageState.currentPage > 0 && notificationPageState.currentPage < notificationPageState.totalPages) {
              notificationNextBtn.classList.remove('disabled');
          } else {
              notificationNextBtn.classList.add('disabled');
          }
      }
  }
  
  if (notificationPrevBtn) {
      notificationPrevBtn.addEventListener('click', (e) => {
          e && e.preventDefault();
          if (notificationPageState.currentPage <= 1) return;
          if (audioOn) playSound('tap');
          notificationPageState.currentPage -= 1;
          renderMessagePage();
      });
  }
  if (notificationNextBtn) {
      notificationNextBtn.addEventListener('click', (e) => {
          e && e.preventDefault();
          if (notificationPageState.currentPage >= notificationPageState.totalPages) return;
          if (audioOn) playSound('tap');
          notificationPageState.currentPage += 1;
          renderMessagePage();
      });
  }
  
  // Notification event listeners
  notificationBtn.addEventListener('click', (e) => {
      e && e.stopPropagation();
      e && e.preventDefault();
      if (audioOn) playSound('tap');
      // Defer opening to next tick to avoid the same-touch causing immediate panel background click
      setTimeout(() => openNotificationPanel(), 120);
  });
  // Prevent touch/pointer events from bubbling to underlying controls (e.g., Play button)
  notificationBtn.addEventListener('pointerdown', (e) => {
      e && e.stopPropagation();
  });
  notificationBtn.addEventListener('pointerup', (e) => {
      e && e.stopPropagation();
  });
  notificationBtn.addEventListener('touchstart', (e) => {
      e && e.stopPropagation();
  }, { passive: false });
  notificationBtn.addEventListener('touchend', (e) => {
      e && e.stopPropagation();
  }, { passive: false });
  
  closeNotificationBtn.addEventListener('click', (e) => {
      e && e.stopPropagation();
      if (audioOn) playSound('tap');
      closeNotificationPanel();
  });
  
  // D-pad and keyboard navigation for notification button
  notificationBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (audioOn) playSound('tap');
          openNotificationPanel();
      }
  });
  
  // Handle D-pad for controller input (gamepad API)
  let notificationBtnFocused = false;
  
  notificationBtn.addEventListener('focus', () => {
      notificationBtnFocused = true;
      notificationBtn.style.outline = '2px solid rgba(100,200,255,0.6)';
      notificationBtn.style.outlineOffset = '2px';
  });
  
  notificationBtn.addEventListener('blur', () => {
      notificationBtnFocused = false;
      notificationBtn.style.outline = 'none';
  });
  
  // Make notification button focusable
  notificationBtn.setAttribute('tabindex', '0');

  // Controller / Gamepad support
  let activeGamepadIndex = null;
  let previousGamepadButtons = [];
  let lastGamepadAxisDirections = { x: 0, y: 0 };
  let lastGamepadJumpAxisValue = 0;

  const GAMEPAD_BUTTON = {
      A: 0,
      B: 1,
      X: 2,
      Y: 3,
      L1: 4,
      R1: 5,
      L2: 6,
      R2: 7,
      SELECT: 8,
      START: 9,
      DPAD_UP: 12,
      DPAD_DOWN: 13,
      DPAD_LEFT: 14,
      DPAD_RIGHT: 15
  };

  function ensureFocusableGamepadItems() {
      const elements = document.querySelectorAll('.diffOption, .planetCell, .achievementItem, .stageCard, .reward-item, .stage-card, .stage-all-card, .profile-card');
      elements.forEach(el => {
          if (!el.hasAttribute('tabindex')) {
              el.setAttribute('tabindex', '0');
          }
      });
  }
  ensureFocusableGamepadItems();
  new MutationObserver(() => ensureFocusableGamepadItems()).observe(document.body, { childList: true, subtree: true });

  function getVisibleGamepadTargets() {
      const selector = 'button, .notification-btn, .diffOption, .profile-card, input, .planetCell, .achievementItem, .stageCard, .reward-item, .stage-card, .stage-all-card';
      const allButtons = Array.from(document.querySelectorAll(selector));
      return allButtons.filter(btn => {
          const style = window.getComputedStyle(btn);
          if (style.display === 'none' || style.visibility === 'hidden' || btn.offsetParent === null) return false;
          let parent = btn.parentElement;
          while (parent && parent !== document.body) {
              const parentStyle = window.getComputedStyle(parent);
              if (parentStyle.display === 'none' || parentStyle.visibility === 'hidden') return false;
              parent = parent.parentElement;
          }
          return true;
      });
  }

  function focusGamepadTarget(direction) {
      const targets = getVisibleGamepadTargets();
      if (targets.length === 0) return;
      let currentIndex = targets.indexOf(document.activeElement);
      if (currentIndex === -1) currentIndex = 0;
      if (direction === 'down' || direction === 'right') {
          currentIndex = (currentIndex + 1) % targets.length;
      } else if (direction === 'up' || direction === 'left') {
          currentIndex = (currentIndex - 1 + targets.length) % targets.length;
      }
      if (targets[currentIndex] && typeof targets[currentIndex].focus === 'function') {
          targets[currentIndex].focus({ preventScroll: true });
      }
  }

  function clickActiveGamepadTarget() {
      const activeElement = document.activeElement;
      if (activeElement && typeof activeElement.click === 'function') {
          activeElement.click();
          return true;
      }
      const firstVisible = getVisibleGamepadTargets()[0];
      if (firstVisible && typeof firstVisible.click === 'function') {
          firstVisible.click();
          return true;
      }
      return false;
  }

  function handleGamepadButtonDown(buttonIndex) {
      switch (buttonIndex) {
          case GAMEPAD_BUTTON.A:
          case GAMEPAD_BUTTON.X:
              if (!clickActiveGamepadTarget()) {
                  if (running && !gameOver.style.display.includes('flex') && pauseMenu.style.display === 'none' && stagesOverlay.style.display !== 'flex' && (!stageTransitionOverlay || stageTransitionOverlay.style.display !== 'flex') && dialogOverlay && dialogOverlay.classList.contains('hidden')) {
                      flap();
                  }
              }
              break;
          case GAMEPAD_BUTTON.B:
          case GAMEPAD_BUTTON.SELECT:
              if (running && pauseMenu.style.display === 'none') {
                  pauseGame();
              } else if (dialogOverlay && !dialogOverlay.classList.contains('hidden')) {
                  if (dialogCancelBtn) dialogCancelBtn.click();
              } else if (stagesOverlay.style.display === 'flex') {
                  closeStagesBtn.click();
              } else if (editNicknameModal && editNicknameModal.classList.contains('show')) {
                  if (closeProfileModal) closeProfileModal.click();
              } else if (menu.style.display === 'flex') {
                  quitBtn.click();
              } else {
                  showMenu();
                  focusFirstVisibleButton();
              }
              break;
          case GAMEPAD_BUTTON.START:
              if (running && pauseMenu.style.display === 'none') {
                  pauseGame();
              } else if (pauseMenu.style.display === 'flex') {
                  resumeBtn.click();
              } else {
                  showMenu();
                  focusFirstVisibleButton();
              }
              break;
          case GAMEPAD_BUTTON.DPAD_UP:
              focusGamepadTarget('up');
              break;
          case GAMEPAD_BUTTON.DPAD_DOWN:
              focusGamepadTarget('down');
              break;
          case GAMEPAD_BUTTON.DPAD_LEFT:
              focusGamepadTarget('left');
              break;
          case GAMEPAD_BUTTON.DPAD_RIGHT:
              focusGamepadTarget('right');
              break;
          default:
              break;
      }
  }

  function processGamepadButtons(gamepad) {
      if (!gamepad || !gamepad.buttons) return;
      gamepad.buttons.forEach((button, index) => {
          const pressed = !!button.pressed;
          const previouslyPressed = !!previousGamepadButtons[index];
          if (pressed && !previouslyPressed) {
              handleGamepadButtonDown(index);
          }
          previousGamepadButtons[index] = pressed;
      });
  }

  function processGamepadAxes(gamepad) {
      if (!gamepad || !gamepad.axes) return;
      const x = gamepad.axes[0] || 0;
      const y = gamepad.axes[1] || 0;
      const threshold = 0.55;
      const directionX = x > threshold ? 1 : x < -threshold ? -1 : 0;
      const directionY = y > threshold ? 1 : y < -threshold ? -1 : 0;

      const jumpAxisValue = (gamepad.axes[1] || 0);
      const shouldTriggerJump = jumpAxisValue < -threshold && lastGamepadJumpAxisValue >= -threshold;
      if (shouldTriggerJump && running && !gameOver.style.display.includes('flex') && pauseMenu.style.display === 'none' && stagesOverlay.style.display !== 'flex' && (!stageTransitionOverlay || stageTransitionOverlay.style.display !== 'flex') && dialogOverlay && dialogOverlay.classList.contains('hidden')) {
          flap();
      }
      lastGamepadJumpAxisValue = jumpAxisValue;

      if (directionX !== lastGamepadAxisDirections.x) {
          lastGamepadAxisDirections.x = directionX;
          if (directionX === 1) focusGamepadTarget('right');
          if (directionX === -1) focusGamepadTarget('left');
      }
      if (directionY !== lastGamepadAxisDirections.y) {
          lastGamepadAxisDirections.y = directionY;
          if (directionY === 1) focusGamepadTarget('down');
          if (directionY === -1) focusGamepadTarget('up');
      }
  }

  function pollGamepad() {
      const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
      if (gamepads && gamepads.length) {
          if (activeGamepadIndex === null) {
              for (let index = 0; index < gamepads.length; index++) {
                  if (gamepads[index]) {
                      activeGamepadIndex = index;
                      break;
                  }
              }
          }
          const gamepad = gamepads[activeGamepadIndex];
          if (gamepad) {
              processGamepadButtons(gamepad);
              processGamepadAxes(gamepad);
          }
      }
      window.requestAnimationFrame(pollGamepad);
  }

  window.addEventListener('gamepadconnected', (event) => {
      activeGamepadIndex = event.gamepad.index;
      previousGamepadButtons = [];
      focusFirstVisibleButton();
      pollGamepad();
  });

  window.addEventListener('gamepaddisconnected', (event) => {
      if (activeGamepadIndex === event.gamepad.index) {
          activeGamepadIndex = null;
          previousGamepadButtons = [];
      }
  });

  if (navigator.getGamepads && navigator.getGamepads().length) {
      window.requestAnimationFrame(pollGamepad);
  }

  function openNotificationPanel() {
      // Prevent immediate background-click close from the same touch
      notificationPanel.style.display = 'flex';
      ignoreNotificationPanelBackgroundClose = true;
      setTimeout(() => { ignoreNotificationPanelBackgroundClose = false; }, 350);
      
      // Clear the unread badge when the panel is opened, even if the user does not tap a message.
      if (unreadMessages.size > 0) {
          unreadMessages.clear();
          saveMessageData();
          updateBadgeCounter();
      }

      loadNotifications();
      // Add capture-phase blockers so events don't reach underlying UI while panel is open
      document.addEventListener('click', notificationPanelCaptureBlocker, true);
      document.addEventListener('pointerdown', notificationPanelCaptureBlocker, true);
      document.addEventListener('touchstart', notificationPanelCaptureBlocker, true);
  }
  
  function closeNotificationPanel() {
      notificationPanel.style.display = 'none';
      if (notificationReconnectInterval !== null) {
          clearInterval(notificationReconnectInterval);
          notificationReconnectInterval = null;
      }
      // Remove capture-phase blockers
      try {
          document.removeEventListener('click', notificationPanelCaptureBlocker, true);
          document.removeEventListener('pointerdown', notificationPanelCaptureBlocker, true);
          document.removeEventListener('touchstart', notificationPanelCaptureBlocker, true);
      } catch (err) {}
  }
  
  // Close notification panel when clicking outside content
  let ignoreNotificationPanelBackgroundClose = false;
  notificationPanel.addEventListener('click', (e) => {
      if (e.target === notificationPanel) {
          // Do NOT close the panel when tapping outside; require explicit close button.
          e && e.stopPropagation();
          e && e.preventDefault();
          return;
      }
  });

  function notificationPanelCaptureBlocker(e) {
      if (!notificationPanel || notificationPanel.style.display !== 'flex') return;

      // Allow interactions inside notification content
      if (notificationPanel.contains(e.target) && e.target.closest('.notification-content')) {
          return;
      }

      // Allow interactions inside the full screen message overlay
      if (typeof messageFullScreen !== 'undefined' && messageFullScreen && messageFullScreen.contains(e.target)) {
          return;
      }

      // Allow interactions inside the dialog overlay
      if (typeof dialogOverlay !== 'undefined' && dialogOverlay && dialogOverlay.contains(e.target)) {
          return;
      }

      // If we're in the initial ignore window, block the event
      if (ignoreNotificationPanelBackgroundClose) {
          e.stopPropagation();
          e.preventDefault();
          return;
      }

      // If click/tap on the overlay itself, do not close - require explicit close button
      if (e.target === notificationPanel) {
          e.stopPropagation();
          e.preventDefault();
          return;
      }

      // Block other outside interactions from reaching underlying UI
      e.stopPropagation();
      e.preventDefault();
  }
  
  function checkInternetConnection() {
      return navigator.onLine;
  }
  
  async function loadNotifications() {
      notificationList.innerHTML = '';

      if (!checkInternetConnection()) {
          notificationPageState = { currentPage: 0, totalPages: 0 };
          updateNotificationPagination();
          notificationList.innerHTML = `
              <div class="notification-no-internet">
                  <div class="notification-no-internet-icon">🌐</div>
                  <div class="notification-no-internet-text">No Internet Connection</div>
                  <div style="font-size: 12px; opacity: 0.8;">Scanning for network...</div>
              </div>
          `;
          
          // Try to reconnect, but only one reconnect timer may run at a time.
          if (notificationReconnectInterval !== null) return;
          let attempts = 0;
          notificationReconnectInterval = setInterval(() => {
              attempts++;
              if (checkInternetConnection()) {
                  clearInterval(notificationReconnectInterval);
                  notificationReconnectInterval = null;
                  loadNotifications();
              } else if (attempts > 30) { // Stop after 30 seconds
                  clearInterval(notificationReconnectInterval);
                  notificationReconnectInterval = null;
              }
          }, 1000);
          return;
      }

      // Load notification messages from messageData and set up pagination
      const visibleMessages = getVisibleMessages();
      const pageSize = notificationPageSize;
      notificationPageState.totalPages = Math.max(1, Math.ceil(visibleMessages.length / pageSize));
      if (visibleMessages.length === 0) {
          notificationPageState.currentPage = 0;
          notificationPageState.totalPages = 0;
      } else if (notificationPageState.currentPage < 1) {
          notificationPageState.currentPage = 1;
      } else if (notificationPageState.currentPage > notificationPageState.totalPages) {
          notificationPageState.currentPage = notificationPageState.totalPages;
      }
      updateNotificationPagination();
      
      notificationList.innerHTML = `
          <div class="notification-scanning">
              <div class="notification-scanning-spinner"></div>
              <div>Checking for new messages...</div>
          </div>
      `;
      
      // Simulate a delay then show messages
      setTimeout(() => {
          if (notificationPanel.style.display === 'flex') {
              const visibleMessages = getVisibleMessages();
              if (visibleMessages.length === 0) {
                  notificationList.innerHTML = `
                      <div class="notification-empty">
                          <div style="font-size: 32px; margin-bottom: 12px;">📭</div>
                          <div>No new messages yet</div>
                      </div>
                  `;
                  notificationPageState.currentPage = 0;
                  notificationPageState.totalPages = 0;
              } else {
                  renderMessagePage();
              }
              updateNotificationPagination();
          }
      }, 1500);
  }

  // MESSAGE SYSTEM
  const messageFullScreen = document.getElementById('messageFullScreen');
  const messageFullScreenClose = document.getElementById('messageFullScreenClose');
  const messageFullScreenContent = document.getElementById('messageFullScreenContent');
  const messageFullScreenDeleteBtn = document.getElementById('messageFullScreenDeleteBtn');
  const notificationBadgeCounter = document.getElementById('notificationBadgeCounter');

  let messageData = [];
  let deletedMessages = new Set();
  let unreadMessages = new Set();
  let currentFullScreenMessageId = null;
  let suppressPlayGamesOnSignInSystemMessage = false;
  let isAdvancedPanelSignIn = false;
  let lastPlayGamesErrorTime = 0;  // Throttle Google Play Connect errors
  let lastRateErrorTime = 0;  // Throttle Rate request errors
      let lastSystemErrorKey = '';
      let lastSystemErrorTime = 0;
      const ERROR_THROTTLE_MS = 10000;  // Min milliseconds between error messages
      const activeSystemErrorKeys = new Set();
      // Pending request flags ensure one error message per user click
      let pendingPlayGamesRequest = false;
      let pendingRateRequest = false;
      let pendingUpdateRequest = false;

  function showThrottledSystemError(key, text) {
      const now = Date.now();
      if (activeSystemErrorKeys.has(key)) {
          return false;
      }
      if (key === lastSystemErrorKey && now - lastSystemErrorTime < ERROR_THROTTLE_MS) {
          return false;
      }
      lastSystemErrorKey = key;
      lastSystemErrorTime = now;
      activeSystemErrorKeys.add(key);
      setTimeout(() => {
          activeSystemErrorKeys.delete(key);
      }, ERROR_THROTTLE_MS);
      showMessage('Error', text);
      return true;
  }

  function formatMessageDateTime(dateValue = new Date()) {
      const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
      return new Intl.DateTimeFormat('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
      }).format(date);
  }

  // Load messages from localStorage
  function loadMessageData() {
      messageData = JSON.parse(localStorage.getItem('solarFlyMessages') || '[]');
      deletedMessages = new Set(JSON.parse(localStorage.getItem('deletedMessages') || '[]'));
      unreadMessages = new Set(JSON.parse(localStorage.getItem('unreadMessages') || '[]'));

      let normalized = false;
      messageData = messageData.map(msg => {
          if (!msg || typeof msg !== 'object') return msg;

          if (!msg.startTime && msg.startDate) {
              const parsedStart = parseServerDateValue(msg.startDate);
              if (parsedStart) {
                  msg.startTime = parsedStart.getTime();
                  normalized = true;
              }
          }
          if (!msg.expireTime && msg.expireDate) {
              const parsedExpire = parseServerDateValue(msg.expireDate);
              if (parsedExpire) {
                  msg.expireTime = parsedExpire.getTime();
                  normalized = true;
              }
          }

          if (msg.startTime) {
              const serverDate = formatServerDate(new Date(msg.startTime));
              if (!msg.date || msg.date !== serverDate) {
                  msg.date = serverDate;
                  normalized = true;
              }
          }

          if (msg.id === 'android_update_available') {
              if (msg.badge !== 'From Game') {
                  msg.badge = 'From Game';
                  normalized = true;
              }
              if (typeof msg.date === 'string' && !msg.date.match(/\d{1,2}:\d{2}/)) {
                  msg.date = formatMessageDateTime(msg.timestamp || Date.now());
                  normalized = true;
              }
              if (typeof msg.date === 'string' && msg.date.match(/\d{1,2}:\d{2}/) && !msg.date.match(/AM|PM/)) {
                  msg.date = formatMessageDateTime(msg.timestamp || Date.now());
                  normalized = true;
              }
          }
          return msg;
      });
      if (normalized) {
          saveMessageData();
      }
  }

  // Save messages to localStorage
  function saveMessageData() {
      localStorage.setItem('solarFlyMessages', JSON.stringify(messageData));
      localStorage.setItem('deletedMessages', JSON.stringify(Array.from(deletedMessages)));
      localStorage.setItem('unreadMessages', JSON.stringify(Array.from(unreadMessages)));
  }

  // Get visible messages (non-deleted)
  function getVisibleMessages() {
      return messageData.filter(m => m && m.id && !deletedMessages.has(m.id)).reverse();
  }

  function isServerMessageActive(data) {
      if (!data || typeof data !== 'object') return false;
      const now = Date.now();
      let startTime = null;
      let expireTime = null;

      if (data.startTime != null) {
          const parsed = parseServerDateValue(data.startTime);
          startTime = parsed ? parsed.getTime() : null;
      } else if (data.startDate) {
          const parsed = parseServerDateValue(data.startDate);
          startTime = parsed ? parsed.getTime() : null;
      }

      if (data.expireTime != null) {
          const parsed = parseServerDateValue(data.expireTime);
          expireTime = parsed ? parsed.getTime() : null;
      } else if (data.expireDate) {
          const parsed = parseServerDateValue(data.expireDate);
          expireTime = parsed ? parsed.getTime() : null;
      }

      if (startTime !== null && !Number.isNaN(startTime) && now < startTime) return false;
      if (expireTime !== null && !Number.isNaN(expireTime) && now >= expireTime) return false;
      return true;
  }

  function addAndroidUpdateMessage() {
      const messageId = 'android_update_available';
      if (messageData.find(m => m.id === messageId)) return;
      const messageText = 'A new update is available!\n\nUpdate the game using the button below to enjoy the latest features, improvements, and bug fixes.';
      const newMessage = {
          id: messageId,
          text: messageText,
          profileName: 'Solar Fly',
          profilePic: 'social_icon/solar_fly.png',
          badge: 'From Game',
          date: formatMessageDateTime(),
          timestamp: Date.now(),
          unread: true,
          actions: [
              { type: 'update', label: 'Update' }
          ]
      };
      messageData.push(newMessage);
      unreadMessages.add(messageId);
      saveMessageData();
      updateBadgeCounter();
  }

  function removeAndroidUpdateMessage() {
      const index = messageData.findIndex(m => m.id === 'android_update_available');
      if (index === -1) return;
      messageData.splice(index, 1);
      deletedMessages.delete('android_update_available');
      unreadMessages.delete('android_update_available');
      saveMessageData();
      updateBadgeCounter();
      renderMessagePage();
  }

  function isManualUpdateButtonVisible() {
      if (!manualUpdateBtn) return false;
      if (manualUpdateBtn.classList.contains('hidden')) return false;
      return manualUpdateBtn.offsetParent !== null;
  }

  function liveUpdateMessageScan() {
      const messageExists = messageData.some(m => m.id === 'android_update_available');
      if (!isAndroidDevice() || !isManualUpdateButtonVisible()) {
          if (messageExists) {
              removeAndroidUpdateMessage();
          }
          return;
      }
      if (updateAvailable && !messageExists) {
          addAndroidUpdateMessage();
      }
  }

  liveUpdateMessageScan();
  setInterval(() => {
      if (navigator.onLine) {
          liveUpdateMessageScan();
      }
  }, 1000);

  function addGooglePlayConnectMessage() {
      const messageId = 'android_gp_connect';
      if (messageData.find(m => m.id === messageId)) return;
      const messageText = 'You have completed Stage 0!\n\nConnect with Google Play Games to earn even more experience and unlock extra features. Tap the button below to get started. We highly recommend connecting your account for the best experience.';
      const newMessage = {
          id: messageId,
          text: messageText,
          profileName: 'Solar Fly',
          profilePic: 'social_icon/solar_fly.png',
          badge: 'From Game',
          date: formatMessageDateTime(),
          timestamp: Date.now(),
          unread: true,
          actions: [{ type: 'connect', label: 'Connect', icon: 'social_icon/google_play.png' }]
      };
      messageData.push(newMessage);
      unreadMessages.add(messageId);
      saveMessageData();
      updateBadgeCounter();
  }

  function addSocialInviteMessage() {
      const messageId = 'social_invite_adventurer';
      if (messageData.find(m => m.id === messageId)) return;
      const messageText = 'You\'re now an Adventurer!\n\nReady to reach even higher? Join our social media communities below for tips, news, and updates to help you on your journey. Thanks for being part of the adventure!';
      const newMessage = {
          id: messageId,
          text: messageText,
          profileName: 'Solar Fly',
          profilePic: 'social_icon/solar_fly.png',
          badge: 'From Game',
          date: formatMessageDateTime(),
          timestamp: Date.now(),
          unread: true,
          actions: [
              { type: 'link', label: 'YouTube', icon: 'social_icon/youtube.png', url: 'https://www.youtube.com/@srydemanofficcal', color: '#ffffff', textColor: '#000000' },
              { type: 'link', label: 'Facebook', icon: 'social_icon/facebook.png', url: 'https://www.facebook.com/r.rihankhan2015', color: '#1877F2', textColor: '#ffffff' },
              { type: 'link', label: 'Itch', icon: 'social_icon/itch.png', url: 'https://itch.io/event/37562697', color: '#8250DF', textColor: '#ffffff' }
          ]
      };
      messageData.push(newMessage);
      unreadMessages.add(messageId);
      saveMessageData();
      updateBadgeCounter();
  }

  function addRateUsMessage() {
      const messageId = 'rate_us_adventurer';
      if (messageData.find(m => m.id === messageId)) return;
      const messageText = 'You\'re doing a nice job!\n\nIf you\'re enjoying the game, please consider leaving a rating and review using the button below. Your feedback helps us make Solar Fly even better.';
      const newMessage = {
          id: messageId,
          text: messageText,
          profileName: 'Solar Fly',
          profilePic: 'social_icon/solar_fly.png',
          badge: 'From Game',
          date: formatMessageDateTime(),
          timestamp: Date.now(),
          unread: true,
          actions: [
              { type: 'rate', label: 'Rate US⭐', color: '#FFD000', textColor: '#000000' }
          ]
      };
      messageData.push(newMessage);
      unreadMessages.add(messageId);
      saveMessageData();
      updateBadgeCounter();
  }

  function addTruePilotMessage() {
      const messageId = 'true_pilot_complete';
      if (messageData.find(m => m.id === messageId)) return;
      const messageText = '🎉 Congratulations! You\'re now a True Pilot!\n\nYou don\'t just play the game—you master it. Reaching this milestone is a remarkable achievement, earned by only 1 in 1,000,000 players.\n\nThank you for your dedication and for being part of the Solar Fly community!';
      const newMessage = {
          id: messageId,
          text: messageText,
          profileName: 'Solar Fly',
          profilePic: 'social_icon/solar_fly.png',
          badge: 'From Game',
          date: formatMessageDateTime(),
          timestamp: Date.now(),
          unread: true,
          actions: []
      };
      messageData.push(newMessage);
      unreadMessages.add(messageId);
      saveMessageData();
      updateBadgeCounter();
  }

  function removeGooglePlayConnectMessage() {
      const index = messageData.findIndex(m => m.id === 'android_gp_connect');
      if (index === -1) return;
      messageData.splice(index, 1);
      deletedMessages.delete('android_gp_connect');
      unreadMessages.delete('android_gp_connect');
      saveMessageData();
      updateBadgeCounter();
      renderMessagePage();
  }

  function loadAndroidNotificationMessage() {
      addAndroidUpdateMessage();
      renderMessagePage();
  }

  // Get responsive page size based on screen width
  function getResponsivePageSize() {
      const width = window.innerWidth;
      if (width <= 768) {
          return 5; // Mobile/Tablet: 5 messages per page
      }
      return 3; // Desktop: 3 messages per page
  }

  // Render messages for current page
  function renderMessagePage() {
      const visibleMessages = getVisibleMessages();
      const pageSize = getResponsivePageSize();
      const totalPages = Math.max(1, Math.ceil(visibleMessages.length / pageSize));
      
      notificationPageState.totalPages = totalPages;
      if (notificationPageState.currentPage < 1) notificationPageState.currentPage = 1;
      if (notificationPageState.currentPage > totalPages) notificationPageState.currentPage = totalPages;
      
      const startIdx = (notificationPageState.currentPage - 1) * pageSize;
      const pageMessages = visibleMessages.slice(startIdx, startIdx + pageSize);
      
      notificationList.innerHTML = pageMessages.map((msg, idx) => {
          const isFirst = startIdx + idx === 0;
          const isUnread = unreadMessages.has(msg.id);
          const isExpanded = false;
          
          return `
              <div class="message-card ${isUnread ? 'unread' : ''}" data-message-id="${msg.id}">
                  ${isUnread ? '<div class="message-unread-indicator"></div>' : ''}
                  <img class="message-profile-pic" src="${msg.profilePic}" alt="${msg.profileName}">
                  <div class="message-content-wrapper">
                      <div class="message-header">
                          <span class="message-profile-name">${msg.profileName}</span>
                          <span class="message-date">${msg.date}</span>
                      </div>
                      <div class="message-header">
                          <span class="message-badge ${msg.badge === 'From Server' ? 'server' : ''}">${msg.badge}</span>
                      </div>
                      <div class="message-text" data-full-text="${msg.text.length > 5 ? 'long' : 'short'}">
                          ${msg.text}
                      </div>
                      ${msg.text.split('\n').length > 5 ? `<a class="message-show-more" data-message-id="${msg.id}">Show Full</a>` : ''}
                      ${msg.actions && msg.actions.length > 0 ? `
                          <div class="message-actions">
                              ${msg.actions.map(action => {
                                  const defaultButtonColor = msg.badge === 'From Server' ? 'rgba(0,0,0,0.6)' : action.icon ? '#1976D2' : '#8250DF';
                                  const bg = action.color || (action.type === 'connect' ? '#4CAF50' : action.type === 'update' ? '#1976D2' : defaultButtonColor);
                                  const textColor = action.textColor || '#fff';
                                  return `<button class="message-action-btn ${action.type === 'update' ? 'message-action-update' : ''}" style="background:${bg}; background-image: none !important; color:${textColor};" onclick="handleMessageAction('${msg.id}', '${action.type}', '${action.url ? encodeURIComponent(action.url) : ''}')">${action.icon ? `<img class="message-action-icon" src="${action.icon}" alt="" style="width:18px;height:18px;margin-right:8px;vertical-align:middle;" />` : ''}${action.label}</button>`
                              }).join('')}
                          </div>
                      ` : ''}
                  </div>
                  ${msg.id !== 'android_update_available' ? `<button class="message-delete-btn" data-message-id="${msg.id}">🗑</button>` : ''}
              </div>
          `;
      }).join('');
      
      // Add event listeners
      document.querySelectorAll('.message-show-more').forEach(btn => {
          btn.addEventListener('click', (e) => {
              if (audioOn) playSound('tap');
              const msgId = e.target.dataset.messageId;
              const card = document.querySelector(`.message-card[data-message-id="${msgId}"]`);
              const textEl = card.querySelector('.message-text');
              textEl.classList.toggle('expanded');
              e.target.textContent = textEl.classList.contains('expanded') ? 'Show Less' : 'Show Full';
          });
      });

      document.querySelectorAll('.message-delete-btn').forEach(btn => {
          btn.addEventListener('click', (e) => {
              if (audioOn) playSound('tap');
              const msgId = e.target.dataset.messageId;
              deleteMessage(msgId);
          });
      });

      document.querySelectorAll('.message-card').forEach(card => {
          card.addEventListener('click', (e) => {
              if (e.target.closest('.message-delete-btn') || e.target.closest('.message-action-btn') || e.target.closest('.message-show-more')) {
                  return; // Don't open full screen if clicking action buttons
              }
              if (audioOn) playSound('tap');
              const msgId = card.dataset.messageId;
              showMessageFullScreen(msgId);
          });
      });

      updateNotificationPagination();
      // Ensure server-sent message buttons render with enforced styles
      try { enforceServerButtonStyles(notificationList); } catch (e) { console.warn('enforceServerButtonStyles call failed', e); }
  }

  // Enforce server button styles at runtime to override stubborn CSS
  function enforceServerButtonStyles(rootEl) {
      try {
          const root = rootEl || document;
          const buttons = root.querySelectorAll('.message-action-btn, .message-full-screen-action-btn');
          buttons.forEach(btn => {
              const card = btn.closest('.message-card');
              if (card) {
                  if (card.querySelector('.message-badge.server')) {
                      btn.style.background = 'rgba(0,0,0,0.6)';
                      btn.style.color = '#fff';
                      btn.style.setProperty('background-image', 'none', 'important');
                  }
              } else {
                  // full-screen context: check for server badge in the full-screen content
                  if (root.querySelector('.message-full-screen-badge.server')) {
                      btn.style.background = 'rgba(0,0,0,0.6)';
                      btn.style.color = '#fff';
                      btn.style.setProperty('background-image', 'none', 'important');
                  }
              }
          });
      } catch (e) {
          console.warn('enforceServerButtonStyles error', e);
      }
  }

  // Delete a message
  function deleteMessage(msgId) {
      deletedMessages.add(msgId);
      unreadMessages.delete(msgId);
      saveMessageData();
      if (getVisibleMessages().length === 0) {
          notificationPageState.currentPage = 0;
          notificationPageState.totalPages = 0;
      } else {
          const pageSize = getResponsivePageSize();
          const totalPages = Math.max(1, Math.ceil(getVisibleMessages().length / pageSize));
          if (notificationPageState.currentPage > totalPages) {
              notificationPageState.currentPage = totalPages;
          }
      }
      renderMessagePage();
      updateBadgeCounter();
      updateNotificationPagination();
  }

  // Show full screen message
  function showMessageFullScreen(msgId) {
      const msg = messageData.find(m => m.id === msgId);
      if (!msg) return;
      
      currentFullScreenMessageId = msgId;
      if (unreadMessages.has(msgId)) {
          unreadMessages.delete(msgId);
          saveMessageData();
          updateBadgeCounter();
      }
      
      const contentHtml = `
          <div class="message-full-screen-profile">
              <img class="message-full-screen-pic" src="${msg.profilePic}" alt="${msg.profileName}">
              <div class="message-full-screen-info">
                  <div class="message-full-screen-name">${msg.profileName}</div>
                  <div class="message-full-screen-date">${msg.date}</div>
              </div>
              <div class="message-full-screen-badge ${msg.badge === 'From Server' ? 'server' : ''}">${msg.badge}</div>
          </div>
          <div class="message-full-screen-text">${msg.text}</div>
                  ${msg.actions && msg.actions.length > 0 ? `
              <div class="message-full-screen-actions">
                  ${msg.actions.map(action => {
                      const defaultButtonColor = msg.badge === 'From Server' ? 'rgba(0,0,0,0.6)' : action.icon ? '#1976D2' : '#8250DF';
                      const bg = action.color || (action.type === 'connect' ? '#4CAF50' : action.type === 'update' ? '#1976D2' : defaultButtonColor);
                      const textColor = action.textColor || '#fff';
                      return `<button class="message-full-screen-action-btn" style="background:${bg}; background-image: none !important; color:${textColor};" onclick="handleMessageAction('${msg.id}', '${action.type}', '${action.url ? encodeURIComponent(action.url) : ''}')">${action.icon ? `<img src="${action.icon}" style="width:18px;height:18px;margin-right:8px;vertical-align:middle;" onerror="this.style.display='none'"/>` : ''}${action.label}</button>`;
                  }).join('')}
              </div>
          ` : ''}
      `;
      
      messageFullScreenContent.innerHTML = contentHtml;
      messageFullScreen.classList.add('active');
      try { enforceServerButtonStyles(messageFullScreenContent); } catch (e) { console.warn('enforceServerButtonStyles (full) failed', e); }
      
      if (msg.id !== 'android_update_available' && msg.actions && msg.actions.length > 0) {
          messageFullScreenDeleteBtn.style.display = 'flex';
      } else {
          messageFullScreenDeleteBtn.style.display = 'none';
      }
  }

  // Close full screen message
  function closeMessageFullScreen() {
      messageFullScreen.classList.remove('active');
      currentFullScreenMessageId = null;
      messageFullScreenContent.innerHTML = '';
      messageFullScreenDeleteBtn.style.display = 'none';
  }

  // Update badge counter
  function updateBadgeCounter() {
      const unreadCount = unreadMessages.size;
      if (unreadCount > 0) {
          const displayCount = unreadCount > 9 ? '9+' : unreadCount;
          notificationBadgeCounter.textContent = displayCount;
          notificationBadgeCounter.classList.remove('hidden');
      } else {
          notificationBadgeCounter.classList.add('hidden');
      }
  }

  function addNotificationMessage(text, options = {}) {
      const existing = messageData.find(msg => msg.text === text && !deletedMessages.has(msg.id));
      if (existing) {
          if (existing.unread) return;
          existing.unread = true;
          unreadMessages.add(existing.id);
          saveMessageData();
          updateBadgeCounter();
          if (notificationPanel && notificationPanel.style.display === 'flex') {
              renderMessagePage();
          }
          return;
      }

      const messageId = options.id || `notification_error_${Date.now()}`;
      const newMessage = {
          id: messageId,
          text,
          profileName: options.profileName || 'Solar Fly',
          profilePic: options.profilePic || 'social_icon/solar_fly.png',
          badge: options.badge || 'From Game',
          date: formatMessageDateTime(),
          timestamp: Date.now(),
          unread: true,
          actions: options.actions || []
      };
      messageData.push(newMessage);
      unreadMessages.add(messageId);
      saveMessageData();
      updateBadgeCounter();
      if (notificationPanel && notificationPanel.style.display === 'flex') {
          renderMessagePage();
      }
  }

  function addSystemMessage(text) {
      addNotificationMessage(text, { id: `system_error_${Date.now()}` });
  }

  function requestAndroidUpdate() {
      try {
          if (pendingUpdateRequest) return;
          // Mark that the update request was initiated by the user
          pendingUpdateRequest = true;
          setTimeout(() => { pendingUpdateRequest = false; }, 30000);
          if (window.Android && typeof Android.requestAppUpdate === 'function') {
              const result = Android.requestAppUpdate();
              if (result === false || result === null || typeof result === 'undefined') {
                  if (pendingUpdateRequest) {
                      showThrottledSystemError('androidUpdate', 'App update request failed. Please try again.');
                      pendingUpdateRequest = false;
                  }
              } else if (result && typeof result.then === 'function') {
                  result
                      .then(response => {
                          if (response === false || response === null || typeof response === 'undefined') {
                              if (pendingUpdateRequest) {
                                  showThrottledSystemError('androidUpdate', 'App update request failed. Please try again.');
                                  pendingUpdateRequest = false;
                              }
                          }
                      })
                      .catch(err => {
                          console.error('Android update request promise failed:', err);
                          if (pendingUpdateRequest) {
                              showThrottledSystemError('androidUpdate', 'App update request failed. Please try again.');
                              pendingUpdateRequest = false;
                          }
                      });
              }
          } else {
              if (pendingUpdateRequest) {
                  showThrottledSystemError('androidUpdate', 'App update request failed. Please try again.');
                  pendingUpdateRequest = false;
              }
          }
      } catch (e) {
          console.error('Failed to request app update:', e);
          if (pendingUpdateRequest) {
              showThrottledSystemError('androidUpdate', 'App update request failed. Please try again.');
              pendingUpdateRequest = false;
          }
      }
  }

  function requestAndroidUpdateFromMessage() {
      try {
          if (pendingUpdateRequest) return;
          // Mark that the update-from-message request was initiated by the user
          pendingUpdateRequest = true;
          setTimeout(() => { pendingUpdateRequest = false; }, 30000);
          if (window.Android && typeof Android.requestAppUpdate === 'function') {
              const result = Android.requestAppUpdate();
              if (result === false || result === null || typeof result === 'undefined') {
                  if (pendingUpdateRequest) {
                      showThrottledSystemError('androidUpdate', 'App update request failed. Please try again.');
                      pendingUpdateRequest = false;
                  }
              } else if (result && typeof result.then === 'function') {
                  result
                      .then(response => {
                          if (response === false || response === null || typeof response === 'undefined') {
                              if (pendingUpdateRequest) {
                                  showThrottledSystemError('androidUpdate', 'App update request failed. Please try again.');
                                  pendingUpdateRequest = false;
                              }
                          } else {
                              removeAndroidUpdateMessage();
                          }
                      })
                      .catch(err => {
                          console.error('Android update request promise failed:', err);
                          if (pendingUpdateRequest) {
                              showThrottledSystemError('androidUpdate', 'App update request failed. Please try again.');
                              pendingUpdateRequest = false;
                          }
                      });
              } else {
                  removeAndroidUpdateMessage();
              }
          } else {
              if (pendingUpdateRequest) {
                  showThrottledSystemError('androidUpdate', 'App update request failed. Please try again.');
                  pendingUpdateRequest = false;
              }
          }
      } catch (e) {
          console.error('Failed to request app update:', e);
          if (pendingUpdateRequest) {
              showThrottledSystemError('androidUpdate', 'App update request failed. Please try again.');
              pendingUpdateRequest = false;
          }
      }
  }

  function requestGooglePlayConnect() {
      if (pendingPlayGamesRequest) return;
      // Mark this as a user-initiated request so only one error shows for this click
      pendingPlayGamesRequest = true;
      // Fail-safe: clear pending after 30s
      setTimeout(() => { pendingPlayGamesRequest = false; }, 30000);
      const profileAdvancedMessage = document.getElementById('advancedMessage');
      const showSystemError = !isAdvancedPanelSignIn && !suppressPlayGamesOnSignInSystemMessage;
      const reportPlayGamesConnectError = (message, err) => {
          if (err) console.warn(message, err);
          else console.warn(message);
          if (showSystemError && pendingPlayGamesRequest) {
              showThrottledSystemError('playGamesSignIn', 'Google Play Games sign-in failed. Please try again.');
              pendingPlayGamesRequest = false;
          }
          if (profileAdvancedMessage) {
              profileAdvancedMessage.textContent = 'Google Play Games sign-in failed. Please try again.';
              profileAdvancedMessage.classList.add('error');
              profileAdvancedMessage.classList.remove('hidden');
          }
      };

      try {
          if (window.Android) {
              if (typeof Android.requestPlayGamesSignIn === 'function') {
                  const result = Android.requestPlayGamesSignIn();
                  if (result === false || result === null || typeof result === 'undefined') {
                      reportPlayGamesConnectError('Google Play Games sign-in failed: no response from Android interface');
                      return;
                  }
                  if (result && typeof result.then === 'function') {
                      result
                          .then(response => {
                              if (response === false || response === null || typeof response === 'undefined') {
                                  reportPlayGamesConnectError('Google Play Games sign-in failed: promise resolved with invalid response');
                              }
                          })
                          .catch(err => {
                              reportPlayGamesConnectError('Google Play Games sign-in promise rejected:', err);
                          });
                      return;
                  }
                  return;
              }
              if (typeof Android.signInGooglePlayGames === 'function') {
                  const result = Android.signInGooglePlayGames();
                  if (result === false || result === null || typeof result === 'undefined') {
                      reportPlayGamesConnectError('Google Play Games sign-in failed: no response from Android interface');
                      return;
                  }
                  if (result && typeof result.then === 'function') {
                      result
                          .then(response => {
                              if (response === false || response === null || typeof response === 'undefined') {
                                  reportPlayGamesConnectError('Google Play Games sign-in failed: promise resolved with invalid response');
                              }
                          })
                          .catch(err => {
                              reportPlayGamesConnectError('Google Play Games sign-in promise rejected:', err);
                          });
                      return;
                  }
                  return;
              }
          }
          reportPlayGamesConnectError('Google Play Games sign-in failed: Android bridge unavailable');
      } catch (e) {
          reportPlayGamesConnectError('Failed to request Google Play Games connect:', e);
      }
  }

  function requestAndroidRate() {
      try {
          if (pendingRateRequest) return;
          // Mark that the rate request was initiated by the user
          pendingRateRequest = true;
          setTimeout(() => { pendingRateRequest = false; }, 30000);
          if (window.Android) {
              const tryCalls = [
                  'openAppRating',
                  'requestAppRating',
                  'openRatingPage',
                  'openPlayStoreRating',
                  'openStoreRating'
              ];
              for (const method of tryCalls) {
                  if (typeof Android[method] === 'function') {
                      const result = Android[method]();
                      if (result === false || result === null || typeof result === 'undefined') {
                          const now = Date.now();
                          if (pendingRateRequest && now - lastRateErrorTime > ERROR_THROTTLE_MS) {
                              lastRateErrorTime = now;
                              showThrottledSystemError('androidRate', 'Unable to open app rating. Please try again.');
                              pendingRateRequest = false;
                          }
                          return;
                      }
                      if (result && typeof result.then === 'function') {
                          result
                              .then(response => {
                                  if (response === false || response === null || typeof response === 'undefined') {
                                      const now = Date.now();
                                      if (pendingRateRequest && now - lastRateErrorTime > ERROR_THROTTLE_MS) {
                                          lastRateErrorTime = now;
                                          showThrottledSystemError('androidRate', 'Unable to open app rating. Please try again.');
                                          pendingRateRequest = false;
                                      }
                                  }
                              })
                              .catch(err => {
                                  console.error('Android rate request promise failed:', err);
                                  const now = Date.now();
                                  if (pendingRateRequest && now - lastRateErrorTime > ERROR_THROTTLE_MS) {
                                      lastRateErrorTime = now;
                                      showThrottledSystemError('androidRate', 'Unable to open app rating. Please try again.');
                                      pendingRateRequest = false;
                                  }
                              });
                          return;
                      }
                      return;
                  }
              }
          }
          const now = Date.now();
          if (pendingRateRequest && now - lastRateErrorTime > ERROR_THROTTLE_MS) {
              lastRateErrorTime = now;
              showThrottledSystemError('androidRate', 'Unable to open app rating. Please try again.');
              pendingRateRequest = false;
          }
      } catch (e) {
          console.error('Failed to request app rating:', e);
          const now = Date.now();
          if (pendingRateRequest && now - lastRateErrorTime > ERROR_THROTTLE_MS) {
              lastRateErrorTime = now;
              showThrottledSystemError('androidRate', 'Unable to open app rating. Please try again.');
              pendingRateRequest = false;
          }
      }
  }

  // Handle message action (internal - for future use)
  function openExternalLink(url) {
      if (!url) return;
      try {
          if (window.Android && typeof Android.openExternalUrl === 'function') {
              Android.openExternalUrl(url);
              return;
          }
      } catch (e) {
          console.warn('Android external URL open failed', e);
      }
      window.open(url, '_blank');
  }

    const HOW_TO_CREATE_VIDEO_URL = 'https://solargo.edgeone.dev/me.mp4';
    const HOW_TO_CREATE_VIDEO_HQ_URL = HOW_TO_CREATE_VIDEO_URL.replace('.mp4', '_1080.mp4');
    let howToCreateVideoBtn = null;
    let howToCreateVideoOverlay = null;
    let howToCreateVideo = null;
    let howToCreateVideoClose = null;

    // Simple IndexedDB helpers for storing video Blob
    function openVideoIDB() {
        return new Promise((resolve, reject) => {
            try {
                const req = indexedDB.open('solarFlyVideoStore', 1);
                req.onupgradeneeded = () => {
                    const db = req.result;
                    if (!db.objectStoreNames.contains('videos')) db.createObjectStore('videos');
                };
                req.onsuccess = () => resolve(req.result);
                req.onerror = () => reject(req.error);
            } catch (e) { reject(e); }
        });
    }

    async function idbPutBlob(key, blob) {
        try {
            const db = await openVideoIDB();
            return new Promise((resolve, reject) => {
                const tx = db.transaction('videos', 'readwrite');
                const store = tx.objectStore('videos');
                const r = store.put(blob, key);
                r.onsuccess = () => { resolve(true); db.close(); };
                r.onerror = () => { reject(r.error); db.close(); };
            });
        } catch (e) { return Promise.reject(e); }
    }

    async function idbGetBlob(key) {
        try {
            const db = await openVideoIDB();
            return new Promise((resolve, reject) => {
                const tx = db.transaction('videos', 'readonly');
                const store = tx.objectStore('videos');
                const r = store.get(key);
                r.onsuccess = () => { resolve(r.result || null); db.close(); };
                r.onerror = () => { reject(r.error); db.close(); };
            });
        } catch (e) { return Promise.reject(e); }
    }

    // Try to fetch and cache the How-to video (prefer HQ if available)
    async function ensureHowToCreateVideoCached() {
        try {
            const already = localStorage.getItem('howToCreateVideoCached');
            if (already === '1') return; // already cached

            // If running from the local file system (origin 'null' or file:),
            // skip fetching the video to avoid CORS errors in the browser.
            try {
                if (location && (location.protocol === 'file:' || String(location.origin) === 'null')) {
                    console.info('Skipping video caching: running from local file origin (CORS would block fetch).');
                    return;
                }
            } catch (e) { /* ignore */ }

            // Try HQ first (HEAD) to check availability
            let videoUrlToFetch = HOW_TO_CREATE_VIDEO_URL;
            try {
                const headResp = await fetch(HOW_TO_CREATE_VIDEO_HQ_URL, {method: 'HEAD'});
                if (headResp && headResp.ok) videoUrlToFetch = HOW_TO_CREATE_VIDEO_HQ_URL;
            } catch (e) { /* ignore and fall back */ }

            const resp = await fetch(videoUrlToFetch);
            if (!resp.ok) return;
            const blob = await resp.blob();
            await idbPutBlob('howToCreate', blob);
            localStorage.setItem('howToCreateVideoCached', '1');
        } catch (e) {
            console.warn('Video cache failed', e);
        }
    }

  function setHowToCreateVideoButtonState(isAvailable) {
      const targetButtons = [
          document.getElementById('howToCreateVideoBtn'),
          document.getElementById('familyHowToCreateVideoBtn'),
          document.getElementById('howToCreateSmallBtn')
      ].filter(Boolean);
      targetButtons.forEach((btn) => {
          if (!btn.dataset.defaultDisplay) {
              btn.dataset.defaultDisplay = btn.style.display || '';
          }
          btn.disabled = !isAvailable;
          btn.setAttribute('aria-disabled', String(!isAvailable));
          btn.style.display = isAvailable ? (btn.dataset.defaultDisplay || '') : 'none';
          btn.title = isAvailable ? 'Play the How to Create video' : 'Video is unavailable right now';
      });
      const statusEl = document.getElementById('howToCreateStatus');
      try {
          if (statusEl) {
              statusEl.textContent = isAvailable ? 'Available' : 'Unavailable';
              statusEl.style.display = isAvailable ? '' : 'none';
          }
      } catch (e) { /* ignore */ }
  }

  function checkHowToCreateVideoAvailability() {
      const targetButtons = [
          document.getElementById('howToCreateVideoBtn'),
          document.getElementById('familyHowToCreateVideoBtn'),
          document.getElementById('howToCreateSmallBtn')
      ].filter(Boolean);
      if (!targetButtons.length) return;
      howToCreateVideoBtn = targetButtons[0];
      // Try to read the availability flag from Firestore at the given path.
      // Path: availability/video/howcreate/solarfly/party/status -> document with field `available` === 'Yes'
      (async () => {
          try {
              const fb = await waitForFirebaseReady();
              if (!fb || !fb.doc || !fb.getDoc) {
                  setHowToCreateVideoButtonState(false);
                  return;
              }

              const statusRef = fb.doc(
                  fb.db,
                  'availability',
                  'video',
                  'howcreate',
                  'solarfly',
                  'party',
                  'status'
              );

              // Read once
              let snap;
              try {
                  snap = await fb.getDoc(statusRef);
              } catch (err) {
                  setHowToCreateVideoButtonState(false);
                  return;
              }
              const snapExists = snap && (typeof snap.exists === 'function' ? snap.exists() : !!snap.exists);
              if (!snapExists) {
                  setHowToCreateVideoButtonState(false);
              } else {
                  const data = typeof snap.data === 'function' ? snap.data() : (snap._data || {});
                  const avail = (data && data.available) ? String(data.available).toLowerCase() : '';
                  const isEnabled = avail === 'yes' || avail === 'true';
                  setHowToCreateVideoButtonState(isEnabled);
              }

              // Also attach a realtime listener if available so UI updates when Firestore changes
              try {
                  if (typeof fb.onSnapshot === 'function') {
                      fb.onSnapshot(statusRef, (docSnap) => {
                          try {
                              const exists = docSnap && (typeof docSnap.exists === 'function' ? docSnap.exists() : !!docSnap.exists);
                              if (!exists) {
                                  setHowToCreateVideoButtonState(false);
                                  return;
                              }
                              const d = typeof docSnap.data === 'function' ? docSnap.data() : (docSnap._data || {});
                              const av = (d && d.available) ? String(d.available).toLowerCase() : '';
                              setHowToCreateVideoButtonState(av === 'yes' || av === 'true');
                          } catch (e) {
                              setHowToCreateVideoButtonState(false);
                          }
                      }, (err) => {
                          setHowToCreateVideoButtonState(false);
                      });
                  }
              } catch (e) {
                  // ignore realtime attach errors
              }
          } catch (e) {
              setHowToCreateVideoButtonState(false);
          }
      })();
  }

    async function openHowToCreateVideo() {
      if (!howToCreateVideoOverlay || !howToCreateVideo || howToCreateVideoBtn && howToCreateVideoBtn.disabled) return;
      
      window.__howToCreatePrevAudioState = {
          bgAudioWasPlaying: !!(typeof bgAudio !== 'undefined' && bgAudio && !bgAudio.paused),
          bgAudioVolume: (typeof bgAudio !== 'undefined' && bgAudio) ? bgAudio.volume : 0.5,
          menuWasPlaying: !!(typeof sounds !== 'undefined' && sounds && sounds.menu && !sounds.menu.paused),
          audioOn: !!audioOn,
          bgMusicEnabled: !!bgMusicEnabled,
          masterVolume: masterVolume,
          soundStates: {}
      };
      
      try {
          if (typeof bgAudio !== 'undefined' && bgAudio) {
              bgAudio.pause();
              bgAudio.currentTime = 0;
          }
      } catch (e) { console.warn('Failed to pause bgAudio', e); }
      
      try {
          if (typeof sounds !== 'undefined' && sounds) {
              Object.entries(sounds).forEach(([name, sound]) => {
                  try {
                      if (sound) {
                          window.__howToCreatePrevAudioState.soundStates[name] = {
                              paused: sound.paused,
                              currentTime: sound.currentTime,
                              volume: sound.volume,
                              muted: !!sound.muted
                          };
                          sound.pause();
                          sound.currentTime = 0;
                          sound.muted = true;
                      }
                  } catch (e) { }
              });
          }
      } catch (e) { console.warn('Failed to pause sounds', e); }
      
      try {
          window.__howToCreatePausedAudios = [];
          const audios = Array.from(document.querySelectorAll('audio')) || [];
          audios.forEach(a => {
              try {
                  window.__howToCreatePausedAudios.push({el: a, paused: a.paused, muted: a.muted, volume: a.volume});
                  a.pause();
                  a.muted = true;
              } catch (e) {}
          });
      } catch (e) { console.warn('Failed to pause <audio> elements', e); }
      
      try { if (window.Howler && typeof Howler.mute === 'function') { Howler.mute(true); window.__howToCreateHowlerMuted = true; } } catch (e) { }

      try { howToCreateVideo.muted = false; howToCreateVideo.removeAttribute && howToCreateVideo.removeAttribute('muted'); howToCreateVideo.volume = 1.0; } catch (e) { }

      // If we previously cached the video blob in IndexedDB, use it to avoid network lag.
      try {
          const cached = await idbGetBlob('howToCreate');
          if (cached) {
              try {
                  const objUrl = URL.createObjectURL(cached);
                  howToCreateVideo.src = objUrl;
              } catch (e) {
                  howToCreateVideo.src = HOW_TO_CREATE_VIDEO_URL;
              }
          } else {
              howToCreateVideo.src = HOW_TO_CREATE_VIDEO_URL;
              howToCreateVideo.preload = 'auto';
          }
      } catch (e) {
          howToCreateVideo.src = HOW_TO_CREATE_VIDEO_URL;
          howToCreateVideo.preload = 'auto';
      }

      howToCreateVideo.load();
      howToCreateVideoOverlay.classList.add('active');
      howToCreateVideoOverlay.setAttribute('aria-hidden', 'false');
      howToCreateVideo.play().catch(() => {});
  }

  function closeHowToCreateVideo() {
      if (!howToCreateVideoOverlay || !howToCreateVideo) return;
      howToCreateVideo.pause();
      howToCreateVideo.removeAttribute('src');
      howToCreateVideo.load();
      howToCreateVideoOverlay.classList.remove('active');
      howToCreateVideoOverlay.setAttribute('aria-hidden', 'true');

      try {
          if (window.__howToCreateHowlerMuted) {
              try { Howler.mute(false); } catch (e) {}
              window.__howToCreateHowlerMuted = false;
          }

          const prevState = window.__howToCreatePrevAudioState || {};
          const shouldAudioBeOn = !!(prevState.audioOn && masterVolume > 0 && getEffectiveAudioOn());

          if (typeof bgAudio !== 'undefined' && bgAudio) {
              bgAudio.muted = !shouldAudioBeOn;
              bgAudio.volume = prevState.bgAudioVolume || 0.5;
              if (shouldAudioBeOn && prevState.bgAudioWasPlaying) {
                  try { bgAudio.play().catch(() => {}); } catch (e) { }
              } else if (!shouldAudioBeOn) {
                  try { bgAudio.pause(); } catch (e) { }
              }
          }

          if (typeof sounds !== 'undefined' && sounds) {
              Object.keys(sounds).forEach((name) => {
                  const sound = sounds[name];
                  if (!sound) return;
                  try {
                      sound.muted = !shouldAudioBeOn;
                      if (window.__howToCreatePrevAudioState && window.__howToCreatePrevAudioState.soundStates && window.__howToCreatePrevAudioState.soundStates[name]) {
                          const st = window.__howToCreatePrevAudioState.soundStates[name];
                          sound.volume = typeof st.volume === 'number' ? st.volume : sound.volume;
                      }
                  } catch (e) { }
              });

              if (shouldAudioBeOn && prevState.menuWasPlaying && sounds.menu && !running) {
                  try {
                      sounds.menu.muted = false;
                      sounds.menu.currentTime = 0;
                      sounds.menu.play().catch(() => {});
                  } catch (e) { }
              }
          }

          if (window.__howToCreatePausedAudios && Array.isArray(window.__howToCreatePausedAudios)) {
              window.__howToCreatePausedAudios.forEach(rec => {
                  try {
                      if (rec && rec.el) {
                          rec.el.muted = rec.muted;
                          if (typeof rec.volume !== 'undefined' && rec.volume !== null) {
                              try { rec.el.volume = rec.volume; } catch (e) {}
                          }
                          if (!rec.paused && shouldAudioBeOn) {
                              try { rec.el.play().catch(() => {}); } catch (e) {}
                          }
                      }
                  } catch (e) {}
              });
              window.__howToCreatePausedAudios = null;
          }

          if (shouldAudioBeOn && typeof ensureMenuMusicPlaying === 'function' && !running && sounds && sounds.menu) {
              ensureMenuMusicPlaying(true);
          }

          window.__howToCreatePrevAudioState = {};
      } catch (e) { console.warn('Failed to restore audio after video closed', e); }

  }

  function initHowToCreateVideoControls() {
      howToCreateVideoBtn = document.getElementById('howToCreateVideoBtn');
      howToCreateVideoOverlay = document.getElementById('howToCreateVideoOverlay');
      howToCreateVideo = document.getElementById('howToCreateVideo');
      howToCreateVideoClose = document.getElementById('howToCreateVideoClose');

      if (howToCreateVideoBtn) {
          howToCreateVideoBtn.addEventListener('click', openHowToCreateVideo);
          if (!document.getElementById('howToCreateStatus')) {
              const span = document.createElement('span');
              span.id = 'howToCreateStatus';
              span.className = 'settings-link-status';
              span.style.marginLeft = '8px';
              span.style.color = '#9fbfff';
              span.textContent = 'Checking...';
              if (howToCreateVideoBtn.parentNode) {
                  howToCreateVideoBtn.parentNode.insertBefore(span, howToCreateVideoBtn.nextSibling);
              }
          }
          // If there's a create-party control, move the small How-to button inside it visually
          try {
              const createBtn = document.getElementById('familyCreatePartyBtn');
              const inlineHow = document.getElementById('familyHowToCreateVideoBtn');
              if (createBtn && inlineHow) {
                  // Replace the create <button> with a wrapper so we can include the small inline control
                  const wrapper = document.createElement('div');
                  wrapper.id = 'familyCreatePartyBox';
                  wrapper.className = createBtn.className || '';
                  wrapper.setAttribute('role', 'button');
                  wrapper.tabIndex = 0;
                  wrapper.style.display = 'inline-flex';
                  wrapper.style.alignItems = 'center';
                  wrapper.style.gap = '8px';
                  wrapper.style.padding = createBtn.style.padding || '10px 14px';
                  wrapper.style.borderRadius = createBtn.style.borderRadius || '12px';
                  wrapper.style.cursor = 'default';
                  // Create label span
                  const label = document.createElement('span');
                  label.className = 'family-create-label';
                  label.textContent = createBtn.textContent || 'Create a new party';
                  wrapper.appendChild(label);
                  // Style the how-to button smaller and move it inside wrapper
                  inlineHow.style.fontSize = '12px';
                  inlineHow.style.padding = '6px 8px';
                  inlineHow.style.margin = '0';
                  inlineHow.style.textDecoration = 'underline';
                  inlineHow.classList.add('smallBtn');
                  wrapper.appendChild(inlineHow);
                  // Replace DOM node
                  createBtn.parentNode.replaceChild(wrapper, createBtn);
                  // Forward click/tab behavior: clicking wrapper focuses or triggers the original button's click if any
                  wrapper.addEventListener('click', (e) => {
                      // If original button had been clickable, trigger the Continue button instead
                      const continueBtn = document.getElementById('familyPartyContinue');
                      if (continueBtn) continueBtn.focus();
                  });
              }
          } catch (e) { console.warn('Failed to move How-to button inside Create box', e); }
      }

      if (howToCreateVideoClose) {
          howToCreateVideoClose.addEventListener('click', closeHowToCreateVideo);
      }

      if (howToCreateVideo) {
          howToCreateVideo.addEventListener('ended', () => {
              closeHowToCreateVideo();
          });
      }

      if (howToCreateVideoOverlay) {
          howToCreateVideoOverlay.addEventListener('click', (event) => {
              if (event.target === howToCreateVideoOverlay) {
                  closeHowToCreateVideo();
              }
          });
      }

      checkHowToCreateVideoAvailability();
  }

  function handleMessageAction(msgId, actionType, encodedUrl) {
      if (audioOn) playSound('tap');
      const url = encodedUrl ? decodeURIComponent(encodedUrl) : '';
      if (actionType === 'update') {
          if (isAndroidDevice()) {
              requestAndroidUpdateFromMessage();
              return;
          }
          if (updateAvailable) {
              showUpdateModal(true);
              return;
          }
          showMessage('Error', '409: cant connect to the operating system');
          return;
      }
      if (actionType === 'connect') {
          if (isAndroidDevice()) {
              requestGooglePlayConnect();
              return;
          }
          showMessage('Error', '409: cant connect to the operating system');
          return;
      }
      if (actionType === 'link') {
          openExternalLink(url);
          return;
      }
      if (actionType === 'rate') {
          if (isAndroidDevice()) {
              requestAndroidRate();
              return;
          }
          showMessage('Error', '409: cant connect to the operating system');
          return;
      }
      console.log('Message action:', msgId, actionType, url);
  }

  // Message full screen event listeners
  messageFullScreenClose.addEventListener('click', (e) => {
      if (audioOn) playSound('tap');
      closeMessageFullScreen();
  });

  messageFullScreenDeleteBtn.addEventListener('click', (e) => {
      if (audioOn) playSound('tap');
      if (currentFullScreenMessageId) {
          deleteMessage(currentFullScreenMessageId);
          closeMessageFullScreen();
      }
  });

  // Initialize message system
  loadMessageData();
  updateBadgeCounter();

  // --- Server messages (Firestore) ---
  function formatServerDate(dateValue) {
      if (!dateValue) return '';
      const d = dateValue instanceof Date ? dateValue : new Date(dateValue);
      try {
          return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }).format(d);
      } catch (e) {
          return d.toLocaleString();
      }
  }

  function parseServerDateValue(v) {
      if (!v) return null;
      try {
          if (v.toDate && typeof v.toDate === 'function') return v.toDate();
          if (typeof v === 'object' && typeof v.seconds === 'number') return new Date(v.seconds * 1000 + (v.nanoseconds || 0) / 1000000);
          if (typeof v === 'number') return new Date(v);
          return new Date(v);
      } catch (e) {
          return new Date(v);
      }
  }

  async function waitForFirebaseReady(maxRetries = 20, intervalMs = 500) {
      return new Promise((resolve, reject) => {
          let attempts = 0;
          let resolved = false;

          const finish = (fb) => {
              if (resolved) return;
              resolved = true;
              resolve(fb);
          };

          const fail = (err) => {
              if (resolved) return;
              resolved = true;
              reject(err);
          };

          // If firebaseReady event fires, take it as success immediately
          const onFirebaseReadyEvent = (ev) => {
              try {
                  const fbDetail = ev && ev.detail ? ev.detail : window.firebase;
                  if (fbDetail) {
                      finish(fbDetail);
                      return;
                  }
              } catch (e) {
                  // ignore
              }
          };
          document.addEventListener('firebaseReady', onFirebaseReadyEvent, { once: true });

          // If Firebase already set global flags, resolve immediately to avoid missing an earlier event
          try {
              if (window.firebase && typeof window.firebase === 'object' && window.firebase.__firebaseReady === true) {
                  finish(window.firebase);
                  return;
              }
              if (window.firebaseReady === true && window.firebase) {
                  finish(window.firebase);
                  return;
              }
          } catch (e) {
              // ignore and continue polling
          }

          const check = () => {
              const fb = window.firebase;

              // Validate we got an object
              if (!fb || typeof fb !== 'object' || Array.isArray(fb)) {
                  console.debug('Firebase object invalid (waiting)', {
                      type: typeof fb,
                      isArray: Array.isArray(fb),
                      isNull: fb === null,
                      attempt: attempts
                  });
                  attempts += 1;
                  if (attempts >= maxRetries) {
                      console.error('Firebase readiness failed - object is not valid after retries', {
                          finalType: typeof fb,
                          finalValue: fb,
                          attempts
                      });
                      fail(new Error('Firebase object invalid'));
                      return;
                  }
                  setTimeout(check, intervalMs);
                  return;
              }

              // Check if it has an error
              if (fb.__firebaseError) {
                  console.error('Firebase initialization had an error', { error: fb.__firebaseError });
                  fail(new Error(`Firebase error: ${fb.__firebaseError}`));
                  return;
              }

              // Check if ready flag is set
              if (fb.__firebaseReady !== true) {
                  attempts += 1;
                  if (attempts >= maxRetries) {
                      console.error('Firebase __firebaseReady flag never set', { attempts });
                      fail(new Error('Firebase __firebaseReady flag not set'));
                      return;
                  }
                  setTimeout(check, intervalMs);
                  return;
              }

              // Validate key functions exist
              if (typeof fb.collection !== 'function' || typeof fb.onSnapshot !== 'function' || !fb.db) {
                  console.error('Firebase missing required functions', {
                      hasDb: !!fb.db,
                      collectionType: typeof fb.collection,
                      onSnapshotType: typeof fb.onSnapshot
                  });
                  fail(new Error('Firebase missing required methods'));
                  return;
              }

              // Success!
              console.debug('Firebase is ready and valid', {
                  keys: Object.keys(fb),
                  timestamp: fb.__timestamp,
                  attempts
              });
              finish(fb);
          };

          // Start checking
          check();
      });
  }

  async function loadServerMessagesOnce() {
      try {
          const firebaseInstance = await waitForFirebaseReady();
          
          // Additional safety check - if we got here, firebaseInstance should be an object
          if (!firebaseInstance || typeof firebaseInstance !== 'object' || Array.isArray(firebaseInstance)) {
              console.error('Firebase instance validation failed', { 
                  type: typeof firebaseInstance, 
                  isArray: Array.isArray(firebaseInstance),
                  value: firebaseInstance 
              });
              return;
          }
          
          // Validate that required functions exist
          const { db, collection, onSnapshot } = firebaseInstance;
          
          if (!db) {
              console.error('Firebase db is not available');
              return;
          }
          
          if (typeof collection !== 'function') {
              console.error('Firebase collection is not a function', { 
                  type: typeof collection, 
                  value: collection 
              });
              return;
          }
          
          if (typeof onSnapshot !== 'function') {
              console.error('Firebase onSnapshot is not a function', { 
                  type: typeof onSnapshot,
                  value: onSnapshot 
              });
              return;
          }
          
          // Now safely create the collection reference
          let col;
          try {
              col = collection(db, 'messages');
              console.debug('Successfully created Firestore collection reference');
          } catch (err) {
              console.error('Failed to create collection reference for "messages"', err);
              return;
          }
          
          // Subscribe to real-time updates
          onSnapshot(col, (snap) => {
              const activeServerMessageIds = new Set();
          snap.docs.forEach(doc => {
                  try {
                      const data = doc.data();
                      const id = (data && typeof data.id === 'string' && data.id.trim()) ? data.id.trim() : doc.id;
                      if (!id) return;

                      if (!isServerMessageActive(data)) {
                          return; // Message not yet started or already expired
                      }

                      activeServerMessageIds.add(id);
                      if (deletedMessages.has(id)) return; // user deleted -> block

                      const actions = [];
                      if (data.links && Array.isArray(data.links) && data.links.length > 0) {
                          const link = data.links[0];
                          if (link && link.url) {
                              actions.push({ type: 'link', label: link.name || 'Open', url: link.url, icon: link.icon || null, color: 'rgba(0,0,0,0.6)', textColor: '#fff' });
                          }
                      }

                      const existingMsg = messageData.find(m => m.id === id);
                      if (existingMsg) {
                          if (existingMsg.text !== (data.text || '')) {
                              existingMsg.text = data.text || '';
                          }
                          if (JSON.stringify(existingMsg.actions) !== JSON.stringify(actions)) {
                              existingMsg.actions = actions;
                          }
                          return;
                      }

                      const newMsg = {
                          id: id,
                          text: data.text || '',
                          profileId: data.profileId || '',
                          profileName: data.profileName || 'Server',
                          profilePic: data.profilePic || 'social_icon/solar_fly.png',
                          badge: 'From Server',
                          date: formatMessageDateTime(new Date()),
                          timestamp: Date.now(),
                          unread: true,
                          actions: actions
                      };

                      messageData.push(newMsg);
                      unreadMessages.add(id);
                  } catch (e) {
                      console.warn('Failed to process server message doc', e);
                  }
              });

              const removedServerIds = new Set();
              messageData = messageData.filter(msg => {
                  if (!msg || msg.badge !== 'From Server') return true;
                  if (msg.id && activeServerMessageIds.has(msg.id)) return true;
                  if (msg.id) removedServerIds.add(msg.id);
                  return false;
              });
              removedServerIds.forEach(id => {
                  unreadMessages.delete(id);
              });

              saveMessageData();
              updateBadgeCounter();
              if (notificationPanel && notificationPanel.style.display === 'flex') renderMessagePage();
          }, (err) => { console.warn('Server messages snapshot error', err); });
      } catch (e) {
          console.warn('Failed to load server messages', e);
      }
  }

  // Start listening for server messages once Firebase is ready
  document.addEventListener('firebaseReady', () => {
      console.debug('Received firebaseReady event, starting server message listener');
      loadServerMessagesOnce();
  });
  
  // Fallback: if Firebase is already ready (race condition), start immediately
  setTimeout(() => {
      if (window.firebaseReady === true && window.firebase && typeof window.firebase.collection === 'function') {
          console.debug('Firebase already ready at timeout check, starting server message listener');
          loadServerMessagesOnce();
      }
  }, 100);
  
  // Handle window resize for responsive pagination
  let resizeTimeout;
  window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
          if (notificationPanel.style.display === 'flex' && getVisibleMessages().length > 0) {
              const pageSize = getResponsivePageSize();
              const totalPages = Math.max(1, Math.ceil(getVisibleMessages().length / pageSize));
              if (notificationPageState.currentPage > totalPages) {
                  notificationPageState.currentPage = totalPages;
              }
              renderMessagePage();
          }
      }, 200);
  });
  
  // Listen for online/offline events
  window.addEventListener('online', () => {
      if (notificationPanel.style.display === 'flex') {
          loadNotifications();
      }
      initializeCountryInfo();
  });

  window.addEventListener('offline', () => {
      if (notificationPanel.style.display === 'flex') {
          loadNotifications();
      }
      updateCountryDisplay();
  });
  const rateModal = document.getElementById('rateModal');
  const rateYesBtn = document.getElementById('rateYesBtn');
  const rateNoBtn = document.getElementById('rateNoBtn');
  const rateSkipCheckbox = document.getElementById('rateSkipCheckbox');

  const achievementNotification = document.getElementById('achievementNotification');
  const splash_loading = document.getElementById('splash_loading');
  const impossibleRedFilter = document.createElement('div');
  impossibleRedFilter.id = 'impossibleRedFilter';
  document.body.appendChild(impossibleRedFilter);
  const laughAudio = new Audio('music/laught.mp3');
  laughAudio.preload = 'auto';
  laughAudio.volume = 0.8;
  let impossibleModeActive = false;
  let impossibleTransitionTimeout = null;
  let impossibleTransitionOverlay = null;

  function isElementVisible(el) {
      if (!el) return false;
      const style = window.getComputedStyle(el);
      return style.display !== 'none' && style.visibility !== 'hidden' && el.getClientRects().length > 0;
  }

  function updateAudioForCurrentMode() {
      if (!audioOn) {
          bgAudio.pause();
          if (sounds.menu) sounds.menu.pause();
          return;
      }
      
      // Check if any splash screen is visible - no audio on splash screens
      const isSplashScreenVisible = 
          isElementVisible(document.getElementById('splash1')) ||
          isElementVisible(document.getElementById('splash_name')) ||
          isElementVisible(document.getElementById('splash_story')) ||
          isElementVisible(document.getElementById('splash3')) ||
          isElementVisible(document.getElementById('splash4')) ||
          isElementVisible(document.getElementById('splash_tutorial_choice')) ||
          isElementVisible(document.getElementById('splash_loading'));
      
      if (isSplashScreenVisible) {
          bgAudio.pause();
          if (sounds.menu) sounds.menu.pause();
          return;
      }
      
      // During impossible transition, silence all audio temporarily
      if (impossibleModeActive && impossibleTransitionOverlay && impossibleTransitionOverlay.parentNode) {
          bgAudio.pause();
          if (sounds.menu) sounds.menu.pause();
          return;
      }
      
      // Ambient soundscape (bgAudio) plays during active gameplay or on death screen
      // It does NOT play on menus or pause screens
      if (running || isOnDeathScreen) {
          tryPlayBackgroundMusic();
          activeSoundsState.bgAudioWasPlaying = true;
      } else {
          bgAudio.pause();
          activeSoundsState.bgAudioWasPlaying = false;
          // Menu music plays when not in gameplay (even in impossible mode)
          ensureMenuMusicPlaying();
      }
  }

  function setImpossibleTheme(enabled) {
      impossibleModeActive = enabled;
      document.body.classList.toggle('impossible-theme', enabled);
      impossibleRedFilter.style.display = enabled ? 'block' : 'none';
      updateAudioForCurrentMode();
  }

  function finishImpossibleTransition() {
      if (impossibleTransitionOverlay) {
          impossibleTransitionOverlay.style.animation = 'fadeOutOverlay 0.5s ease-out forwards';
          setTimeout(() => {
              if (impossibleTransitionOverlay) {
                  impossibleTransitionOverlay.remove();
                  impossibleTransitionOverlay = null;
              }
          }, 500);
      }
      if (impossibleTransitionTimeout) {
          clearTimeout(impossibleTransitionTimeout);
          impossibleTransitionTimeout = null;
      }
      setImpossibleTheme(true);
      document.body.classList.add('impossible-theme');
      impossibleRedFilter.style.display = 'block';
      impossibleRedFilter.style.opacity = '1';
  }

  function triggerImpossibleTransition() {
      // Ensure impossible theme is applied (fallback if audio fails)
      setImpossibleTheme(true);
      document.body.classList.add('impossible-theme');
      stopAllBackgroundAudio();
      impossibleTransitionOverlay = document.createElement('div');
      impossibleTransitionOverlay.id = 'impossibleTransitionOverlay';
      impossibleTransitionOverlay.innerHTML = `
          <div class="impossible-transition-card">
              <div class="impossible-title">IMPOSSIBLE MODE</div>
              <div class="evil-face">
                  <div class="evil-eye left"></div>
                  <div class="evil-eye right"></div>
                  <div class="evil-mouth"></div>
              </div>
              <div class="impossible-skip">Tap anywhere to skip</div>
          </div>
      `;
      impossibleTransitionOverlay.addEventListener('pointerdown', finishImpossibleTransition, { once: true });
      document.body.appendChild(impossibleTransitionOverlay);
      laughAudio.currentTime = 0;
      
      // Wrap audio play in try...catch to ensure animation runs even if audio fails
      try {
          laughAudio.play().catch(err => {
              console.log('laugh play error:', err);
              // Animation will continue even if audio fails
          });
      } catch (err) {
          // Browser blocked audio or file path is invalid - animation continues unaffected
          console.log('laugh audio error (try-catch):', err);
          // Ensure impossible theme stays applied as fallback
          document.body.classList.add('impossible-theme');
      }
      
      impossibleTransitionTimeout = setTimeout(()=>{
          if (impossibleTransitionOverlay && impossibleTransitionOverlay.parentNode) {
              impossibleTransitionOverlay.remove();
              impossibleTransitionOverlay = null;
          }
      }, 4000);
  }

  function stopAllBackgroundAudio() {
      if (bgAudio) {
          bgAudio.pause();
          bgAudio.currentTime = 0;
      }
      if (sounds.menu) {
          sounds.menu.pause();
          sounds.menu.currentTime = 0;
      }
      Object.values(sounds).forEach(sound => {
          if (sound !== sounds.menu) {
              sound.pause();
              sound.currentTime = 0;
          }
      });
  }
  const pauseBtn = document.getElementById('pauseBtn');
  const pauseMenu = document.getElementById('pauseMenu');
  const resumeBtn = document.getElementById('resumeBtn');
  const saveMenuBtn = document.getElementById('saveMenuBtn');
  const quitMenuBtn = document.getElementById('quitMenuBtn');
  const continueChoiceMenu = document.getElementById('continueChoiceMenu');
  const continueGameBtn = document.getElementById('continueGameBtn');
  const newGameBtn = document.getElementById('newGameBtn');
  // NEW HEALTH ELEMENT
  const healthDisplay = document.getElementById('healthDisplay');
  const jumpControlBtn = document.getElementById('jumpControlBtn');
  // NEW DOOR ELEMENTS
  const doorContainer = document.getElementById('doorContainer');
  // NEW PROFILE ELEMENTS
  const profileCard = document.getElementById('profileCard');
  const avatarDisplay = document.getElementById('avatarDisplay');
  const profileAvatarPreview = document.getElementById('profileAvatarPreview');
  const profileNicknameDisplay = document.getElementById('profileNicknameDisplay');
  const modalNicknameText = document.getElementById('modalNicknameText');
  const profileModalTop = document.querySelector('.profile-modal-top');
  const profileStats = document.querySelector('.profile-stats');
  const profileTotalMatchesDisplay = document.getElementById('profileTotalMatches');
  const profileTotalStarsDisplay = document.getElementById('profileTotalStars');
  const profilePlanetsUnlockedCount = document.getElementById('profilePlanetsUnlocked');
  const profilePlanetsTotalCount = document.getElementById('profilePlanetsTotal');
  const profileAchievementsComplete = document.getElementById('profileAchievementsComplete');
  const profileAchievementsTotal = document.getElementById('profileAchievementsTotal');
  const profileHighScore = document.getElementById('profileHighScore');
  const profileCountryFlag = document.getElementById('profileCountryFlag');
  const profileCountryLabel = document.getElementById('profileCountryLabel');
  const profileOperatingSystemDisplay = document.getElementById('profileOperatingSystemDisplay');
  const closeProfileModal = document.getElementById('closeProfileModal');
  const modalUploadPhotoBtn = document.getElementById('modalUploadPhotoBtn');
  const photoInput = document.getElementById('photoInput');
  const editNicknameModal = document.getElementById('editNicknameModal');
  const nicknameInput = document.getElementById('nicknameInput');
  const saveNicknameBtn = document.getElementById('saveNicknameBtn');
  const cancelNicknameBtn = document.getElementById('cancelNicknameBtn');
  const factoryResetBtn = document.getElementById('factoryResetBtn');
  const confirmResetBtn = document.getElementById('confirmResetBtn');
  const cancelResetBtn = document.getElementById('cancelResetBtn');
  const openAdvancedServicesBtn = document.getElementById('openAdvancedServicesBtn');
  const profileAdvancedPanel = document.getElementById('profileAdvancedPanel');
  const profileAdvancedMessage = document.getElementById('advancedMessage');
  const connectAndroidBtn = document.getElementById('connectAndroidBtn');
  const viewProfileStatsBtn = document.getElementById('viewProfileStatsBtn');
  const androidSupportText = document.getElementById('androidSupportText');
  const playGamesStatusText = document.getElementById('playGamesStatusText');
  const playGamesProfileRow = document.getElementById('playGamesProfileRow');
  const playGamesProfileAvatar = document.getElementById('playGamesProfileAvatar');
  const playGamesProfileName = document.getElementById('playGamesProfileName');
  const dialogOverlay = document.getElementById('dialogOverlay');
  const dialogTitle = document.getElementById('dialogTitle');
  const dialogText = document.getElementById('dialogText');
  const dialogConfirmBtn = document.getElementById('dialogConfirm');
  const dialogCancelBtn = document.getElementById('dialogCancel');
  // --- TUTORIAL ELEMENTS (existing) ---
  const tutorialOverlay = document.getElementById('tutorialOverlay');
  const tutorialPointer = document.getElementById('tutorialPointer');
  const tutorialMessage = document.getElementById('tutorialMessage');
  const tutorialSkipButton = document.getElementById('tutorialSkipButton');
  let isTutorialMode = false;
  let tutorialStep = 0;
  const TUTORIAL_GOAL_1 = 1;
  const TUTORIAL_GOAL_2 = 10;
  let isGoalReached = false;
  let directToTutorialChoice = false;
  let currentIntroScreenIndex = 1; // 1=splash1, 2=splash_name, 3=splash3, 4=splash4, 5=splash_story, 20=splash_tutorial_choice
  let currentTutorialTarget = null;
  let currentTutorialOriginalOnClick = null;

  function setIntroScreenIndex(index) {
      currentIntroScreenIndex = Number(index) || 1;
      try {
          localStorage.setItem('solarFlyIntroScreenIndex', currentIntroScreenIndex.toString());
          localStorage.setItem('solarFlyDirectToTutorialChoice', directToTutorialChoice ? 'true' : 'false');
          saveGameData();
      } catch (e) {
          console.warn('Failed to persist intro screen index:', e);
      }
  }

  function clearIntroScreenIndex() {
      currentIntroScreenIndex = 1;
      try {
          localStorage.removeItem('solarFlyIntroScreenIndex');
          localStorage.removeItem('solarFlyDirectToTutorialChoice');
      } catch (e) {
          console.warn('Failed to clear intro screen index:', e);
      }
  }

  function isPCDevice(){
      // Detect if device is PC (not mobile/tablet)
      const isTouchDevice = () => {
          return (('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0));
      };
      // If no touch and screen width > 768, likely a PC
      return !isTouchDevice() && window.innerWidth > 768;
  }

  function adjustGapForOrientation(){
      if(window.innerWidth > window.innerHeight){
          // Landscape / tablet: narrow obstacles for one-side play
          gapSize = Math.max(80, Math.round(baseGapSize * 0.7));
      } else {
          // Portrait / phone: default gap
          gapSize = Math.max(120, Math.round(baseGapSize * 1.0));
      }

      // PC-only: Make easy difficulty easier
      if (isPCDevice() && difficulty === 'easy') {
          gapSize = Math.max(150, Math.round(baseGapSize * 1.3));
      }
  }

  function fit(){
      canvas.width=Math.min(window.innerWidth-20,640);
      canvas.height=Math.min(window.innerHeight-120,900);
      adjustGapForOrientation();
  }

  window.addEventListener('resize',()=>{ 
    fit(); 
    if (menuCanvas) {
      menuCanvas.width = window.innerWidth;
      menuCanvas.height = window.innerHeight;
    }
  });
  window.addEventListener('orientationchange',()=>{ 
    fit(); 
    if (menuCanvas) {
      menuCanvas.width = window.innerWidth;
      menuCanvas.height = window.innerHeight;
    }
  });


  // ----------------- AUDIO SYSTEM (NEW) -----------------

  // 1️⃣ Background music
  const bgAudio = new Audio('music/ambient-soundscapes-001-space-atmosphere-303246.mp3');
  bgAudio.loop = true;
  bgAudio.volume = 0.5;
  bgAudio.preload = 'auto';

  // 2️⃣ Sound effects list
  const sounds = {
      jump: new Audio('music/pixel-jump-319167.mp3'),
      unlock: new Audio('music/success-340660.mp3'),
      tap: new Audio('music/tap-notification-180637.mp3'),
      achievement: new Audio('music/success-340660.mp3'),
      door: new Audio('music/scifi-door-opening-36171.mp3'),
      key: new Audio('music/key-get-39925.mp3'),
      shoot: new Audio('music/shoot.mp3'),
      move: new Audio('music/move.mp3'),
      over: new Audio('music/over.mp3'),
      eat: new Audio('music/eat.mp3'),
      freeze: new Audio('music/freeze.mp3'),
      unfreeze: new Audio('music/unfreeze.mp3'),
      menu: new Audio('music/Main_menu.mp3')
  };

  // Preload sounds
  Object.values(sounds).forEach(sound => {
      sound.preload = 'auto';
      sound.load();
  });

  sounds.menu.loop = true;
  sounds.menu.volume = 0.5;

  // ===== AUDIO STATE TRACKING FOR MINIMIZE/RESUME =====
  // Track which game sounds are currently playing
  const activeSoundsState = {
      soundsPlaying: new Set(),
      bgAudioWasPlaying: false,
      menuSoundWasPlaying: false
  };
  
  // Original playSound to track active sounds
  const originalPlaySound = playSound;
  function stopSound(name) {
      if (!sounds[name]) return;
      const sound = sounds[name];
      try { sound.pause(); } catch (err) {}
      sound.currentTime = 0;
      activeSoundsState.soundsPlaying.delete(name);
  }

  function playSound(name) {
      if (!audioOn) return;

      if (sounds[name]) {
          const sound = sounds[name];
          activeSoundsState.soundsPlaying.add(name);
          sound.volume = 0.85;
          if (name === 'door') sound.volume = 1.0;
          if (name === 'unlock' || name === 'key') sound.volume = 0.95;

          try { sound.pause(); } catch (err) {}
          sound.currentTime = 0;
          sound.play().catch(err => console.log(name + " play error:", err));
      } else {
          console.log("Sound not found:", name);
      }
  }
  
  // Helper function to restore active sounds
  function restoreActiveSounds() {
      if (!audioOn) return;
      
      // Restore all previously playing game sounds
      activeSoundsState.soundsPlaying.forEach(soundName => {
          const s = sounds[soundName];
          if (!s) return;
          s.muted = !audioOn;
          // Try to play; if browser blocks autoplay, fall back to user tap resume
          s.currentTime = 0;
          s.play().catch(err => {
              console.log(soundName + " restore error:", err);
              setupResumeAudioOnTap();
          });
      });

      // Restore bgAudio if it was playing
      if (activeSoundsState.bgAudioWasPlaying && running) {
          bgAudio.muted = !audioOn;
          if (shouldPlayBackgroundMusic()) {
              bgAudio.play().catch(err => {
                  console.log('bgAudio restore error:', err);
                  setupResumeAudioOnTap();
              });
          } else {
              bgAudio.pause();
          }
      }

      // Restore menu music if it was playing and we're not in gameplay
      if (activeSoundsState.menuSoundWasPlaying && !running && sounds.menu) {
          sounds.menu.muted = !audioOn;
          sounds.menu.currentTime = 0;
          sounds.menu.play().catch(err => {
              console.log('menu restore error:', err);
              setupResumeAudioOnTap();
          });
      }
  }
  
  function ensureMenuMusicPlaying(restart = false) {
      if (!audioOn || !sounds.menu || !bgMusicEnabled || masterVolume <= 0) {
          if (sounds.menu) {
              sounds.menu.pause();
              sounds.menu.muted = true;
          }
          activeSoundsState.menuSoundWasPlaying = false;
          return;
      }

      sounds.menu.muted = false;
      if (restart) {
          sounds.menu.currentTime = 0;
      }

      if (sounds.menu.paused) {
          sounds.menu.play().catch(err => console.log('menu sound play error:', err));
      }
      activeSoundsState.menuSoundWasPlaying = !sounds.menu.paused;
  }

  // Helper function to save active audio state
  function saveAudioState() {
      activeSoundsState.bgAudioWasPlaying = running && !bgAudio.paused;
      activeSoundsState.menuSoundWasPlaying = sounds.menu && !sounds.menu.paused;
  }
  
  // Helper function to clear audio state
  function clearAudioState() {
      activeSoundsState.soundsPlaying.clear();
      activeSoundsState.bgAudioWasPlaying = false;
      activeSoundsState.menuSoundWasPlaying = false;
  }

  let audioUnlocked = false;

  function tryAutoplay(audio, name) {
      audio.muted = false;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
          playPromise.then(() => {
              audio.muted = false;
              audioUnlocked = true;
          }).catch(err => {
              console.log(`${name} autoplay blocked:`, err);
              audio.muted = true;
              audio.play().catch(() => {});
          });
      }
  }

  tryAutoplay(bgAudio, 'bgAudio');
  tryAutoplay(sounds.menu, 'menuMusic');

  // Auto-unlock audio on first user interaction (for browsers that block autoplay)
  function unlockAudio() {
      if (audioUnlocked) return;
      audioUnlocked = true;

      Object.values(sounds).forEach(sound => {
          sound.muted = !audioOn;
      });
      bgAudio.muted = !audioOn;

      if (audioOn) {
          bgAudio.currentTime = 0;
          ensureMenuMusicPlaying();
          updateAudioForCurrentMode();
      }
  }
  document.addEventListener('pointerdown', unlockAudio, { once: true, capture: true });
  document.addEventListener('mousedown', unlockAudio, { once: true, capture: true });
  document.addEventListener('touchstart', unlockAudio, { once: true, capture: true, passive: true });
  document.addEventListener('click', unlockAudio, { once: true, capture: true });
  document.addEventListener('keydown', unlockAudio, { once: true, capture: true });

  // Function to resume ambient soundscape on tap (for continuing paused games)
  function setupResumeAudioOnTap() {
      function resumeAudioOnTap() {
          if (!audioOn || impossibleModeActive) return;
          
          // Ensure bgAudio is not muted
          bgAudio.muted = false;
          
          // Play bgAudio
          if (running) {
              tryPlayBackgroundMusic();
              activeSoundsState.bgAudioWasPlaying = true;
          }
      }
      
      // Listen for tap to resume audio
      document.addEventListener('pointerdown', resumeAudioOnTap, { once: true, capture: true });
      document.addEventListener('touchstart', resumeAudioOnTap, { once: true, capture: true, passive: true });
      document.addEventListener('click', resumeAudioOnTap, { once: true, capture: true });
  }

  // 3️⃣ Play sound effect (redefined below with tracking)

  // 4️⃣ Mute/Unmute
  const savedAudioSettings = JSON.parse(localStorage.getItem('solarFlyAudioSettings') || '{}');
  let saveAudioSettingsForAllTime = savedAudioSettings.saveForAllTime === true;
  let audioOn = saveAudioSettingsForAllTime && typeof savedAudioSettings.audioOn === 'boolean' ? savedAudioSettings.audioOn : true;
  let bgMusicEnabled = saveAudioSettingsForAllTime && typeof savedAudioSettings.bgMusicEnabled === 'boolean' ? savedAudioSettings.bgMusicEnabled : true;
  let sfxEnabled = saveAudioSettingsForAllTime && typeof savedAudioSettings.sfxEnabled === 'boolean' ? savedAudioSettings.sfxEnabled : true;
  let masterVolume = saveAudioSettingsForAllTime && typeof savedAudioSettings.masterVolume === 'number' ? savedAudioSettings.masterVolume : 1.0;
  let showJourneyBoard = typeof savedAudioSettings.showJourneyBoard === 'boolean' ? savedAudioSettings.showJourneyBoard : true;
  let showReviveButton = typeof savedAudioSettings.showReviveButton === 'boolean' ? savedAudioSettings.showReviveButton : true;
  let showAddOns = typeof savedAudioSettings.showAddOns === 'boolean' ? savedAudioSettings.showAddOns : false;

  function saveAudioSettings() {
      if (!saveAudioSettingsForAllTime) return;
      const current = JSON.parse(localStorage.getItem('solarFlyAudioSettings') || '{}');
      localStorage.setItem('solarFlyAudioSettings', JSON.stringify({
          ...current,
          audioOn,
          bgMusicEnabled,
          sfxEnabled,
          masterVolume,
          saveForAllTime: true,
          showJourneyBoard,
          showReviveButton,
          showAddOns
      }));
  }

  function saveGameOverSettings() {
      const current = JSON.parse(localStorage.getItem('solarFlyAudioSettings') || '{}');
      localStorage.setItem('solarFlyAudioSettings', JSON.stringify({
          ...current,
          showJourneyBoard,
          showReviveButton,
          showAddOns
      }));
      localStorage.setItem('add-ons', showAddOns ? 'true' : 'false');
  }

  function setSaveAudioSettingsForAllTime(enabled) {
      saveAudioSettingsForAllTime = enabled;
      if (saveAudioSettingsForAllTime) {
          saveAudioSettings();
      } else {
          localStorage.removeItem('solarFlyAudioSettings');
      }
  }

  function getEffectiveAudioOn() {
      return audioOn && masterVolume > 0;
  }

  function shouldPlayBackgroundMusic() {
      return bgMusicEnabled && getEffectiveAudioOn();
  }

  function tryPlayBackgroundMusic() {
      if (!shouldPlayBackgroundMusic()) {
          if (bgAudio) bgAudio.pause();
          return false;
      }
      if (bgAudio) {
          bgAudio.volume = 0.5 * masterVolume;
          bgAudio.play().catch(() => {});
      }
      return true;
  }

  function restoreAudioFromZeroIfNeeded(shouldEnable = true) {
      if (masterVolume <= 0 && shouldEnable) {
          audioOn = true;
          updateMasterVolume(1);
          return true;
      }
      return false;
  }

  function updateMasterVolume(value) {
      const nextValue = Math.max(0, Math.min(1, value));
      masterVolume = nextValue;
      if (bgAudio) bgAudio.volume = 0.5 * masterVolume;
      if (sounds.menu) sounds.menu.volume = 0.5 * masterVolume;
      if (masterVolumeSlider) masterVolumeSlider.value = Math.round(masterVolume * 100);
      if (masterVolumeValue) masterVolumeValue.textContent = Math.round(masterVolume * 100);

      audioOn = masterVolume > 0;
      const effectiveAudioOn = getEffectiveAudioOn();
      if (bgAudio) bgAudio.muted = !effectiveAudioOn;
      if (sounds.menu) sounds.menu.muted = !effectiveAudioOn;
      Object.keys(sounds).forEach(key => {
          if (sounds[key]) sounds[key].muted = !effectiveAudioOn;
      });

      if (!effectiveAudioOn) {
          if (bgAudio) bgAudio.pause();
          if (sounds.menu) sounds.menu.pause();
      }

      updateMusicSectionControls();
      if (effectiveAudioOn) {
          updateAudioForCurrentMode();
      }
  }

  function updateVolumeButtonIcons() {
      const effectiveAudioOn = getEffectiveAudioOn();
      const icon = effectiveAudioOn ? '🔊' : '🔇';
      if (volumeBtn) volumeBtn.textContent = icon;
      if (volumeBtnFixed) volumeBtnFixed.textContent = icon;
  }

  function updateMusicSectionControls() {
      const effectiveAudioOn = getEffectiveAudioOn();
      if (globalMusicToggleBtn) {
          globalMusicToggleBtn.textContent = effectiveAudioOn ? 'On' : 'Off';
          globalMusicToggleBtn.classList.toggle('is-active', effectiveAudioOn);
      }
      if (bgMusicToggleBtn) {
          bgMusicToggleBtn.textContent = bgMusicEnabled ? 'On' : 'Off';
          bgMusicToggleBtn.classList.toggle('is-active', bgMusicEnabled && effectiveAudioOn);
          bgMusicToggleBtn.disabled = !effectiveAudioOn;
          bgMusicToggleBtn.classList.toggle('is-disabled', !effectiveAudioOn);
      }
      if (sfxToggleBtn) {
          sfxToggleBtn.textContent = sfxEnabled ? 'On' : 'Off';
          sfxToggleBtn.classList.toggle('is-active', sfxEnabled && effectiveAudioOn);
          sfxToggleBtn.disabled = !effectiveAudioOn;
          sfxToggleBtn.classList.toggle('is-disabled', !effectiveAudioOn);
      }
      if (masterVolumeSlider) masterVolumeSlider.value = Math.round(masterVolume * 100);
      if (masterVolumeValue) masterVolumeValue.textContent = Math.round(masterVolume * 100);
      updateVolumeButtonIcons();
      saveAudioSettings();
  }

  function applyGameOverSettings() {
      if (journeyBoardElement) {
          journeyBoardElement.style.display = showJourneyBoard ? '' : 'none';
          journeyBoardElement.classList.toggle('game-over-hidden', !showJourneyBoard);
      }
      if (reviveButtonElement) {
          reviveButtonElement.style.display = showReviveButton ? '' : 'none';
          reviveButtonElement.classList.toggle('game-over-hidden', !showReviveButton);
          reviveButtonElement.disabled = !showReviveButton;
          reviveButtonElement.setAttribute('aria-hidden', showReviveButton ? 'false' : 'true');
      }
      if (gameOver) gameOver.classList.toggle('compact', !showJourneyBoard);
      if (journeyBoardToggleBtn) {
          journeyBoardToggleBtn.textContent = showJourneyBoard ? 'On' : 'Off';
          journeyBoardToggleBtn.classList.toggle('is-active', showJourneyBoard);
      }
      if (reviveButtonToggleBtn) {
          reviveButtonToggleBtn.textContent = showReviveButton ? 'On' : 'Off';
          reviveButtonToggleBtn.classList.toggle('is-active', showReviveButton);
      }
      if (enableAddOnsToggleBtn) {
          enableAddOnsToggleBtn.textContent = showAddOns ? 'Yes' : 'No';
          enableAddOnsToggleBtn.classList.toggle('is-active', showAddOns);
      }
  }

  function setSfxEnabled(enabled) {
      if (masterVolume <= 0 && enabled) {
          restoreAudioFromZeroIfNeeded(true);
      }
      if (!getEffectiveAudioOn()) return;
      sfxEnabled = enabled;
      if (!sfxEnabled) {
          Object.keys(sounds).forEach(key => {
              if (key !== 'menu') stopSound(key);
          });
      }
      updateMusicSectionControls();
      saveAudioSettings();
  }

  function toggleMute() {
      if (masterVolume <= 0) {
          restoreAudioFromZeroIfNeeded(true);
          return;
      }
      audioOn = !audioOn;
      const effectiveAudioOn = getEffectiveAudioOn();
      bgAudio.muted = !effectiveAudioOn;
      sounds.menu.muted = !effectiveAudioOn;

      for (let key in sounds) {
          sounds[key].muted = !effectiveAudioOn;
      }

      if (effectiveAudioOn) {
          unlockAudio();
          updateAudioForCurrentMode();
      } else {
          masterVolume = 0;
          audioOn = false;
          if (bgAudio) bgAudio.volume = 0;
          if (sounds.menu) sounds.menu.volume = 0;
          bgAudio.pause();
          if (sounds.menu) sounds.menu.pause();
      }
      updateMusicSectionControls();
      saveAudioSettings();
  }

  function setBgMusicEnabled(enabled) {
      if (masterVolume <= 0 && enabled) {
          restoreAudioFromZeroIfNeeded(true);
      }
      bgMusicEnabled = enabled;
      if (!getEffectiveAudioOn()) {
          if (bgAudio) {
              bgAudio.pause();
          }
          updateMusicSectionControls();
          saveAudioSettings();
          return;
      }
      updateAudioForCurrentMode();
      updateMusicSectionControls();
      saveAudioSettings();
  }

  function updateAudioForCurrentMode() {
      const effectiveAudioOn = getEffectiveAudioOn();
      if (!effectiveAudioOn) {
          if (bgAudio) bgAudio.pause();
          if (sounds.menu) sounds.menu.pause();
          activeSoundsState.bgAudioWasPlaying = false;
          return;
      }

      const isSplashScreenVisible = 
          isElementVisible(document.getElementById('splash1')) ||
          isElementVisible(document.getElementById('splash_name')) ||
          isElementVisible(document.getElementById('splash_story')) ||
          isElementVisible(document.getElementById('splash3')) ||
          isElementVisible(document.getElementById('splash4')) ||
          isElementVisible(document.getElementById('splash_tutorial_choice')) ||
          isElementVisible(document.getElementById('splash_loading'));

      if (isSplashScreenVisible) {
          if (bgAudio) bgAudio.pause();
          if (sounds.menu) sounds.menu.pause();
          activeSoundsState.bgAudioWasPlaying = false;
          return;
      }

      if (impossibleModeActive && impossibleTransitionOverlay && impossibleTransitionOverlay.parentNode) {
          if (bgAudio) bgAudio.pause();
          if (sounds.menu) sounds.menu.pause();
          activeSoundsState.bgAudioWasPlaying = false;
          return;
      }

      if (running || isOnDeathScreen) {
          if (bgMusicEnabled) {
              if (bgAudio) {
                  bgAudio.volume = 0.5 * masterVolume;
                  tryPlayBackgroundMusic();
              }
              activeSoundsState.bgAudioWasPlaying = true;
          } else {
              if (bgAudio) bgAudio.pause();
              activeSoundsState.bgAudioWasPlaying = false;
          }
      } else {
          if (bgAudio) bgAudio.pause();
          activeSoundsState.bgAudioWasPlaying = false;
          ensureMenuMusicPlaying();
      }
  }

  function playSyntheticTone(frequency, duration = 0.18, type = 'triangle', volume = 0.06, delay = 0) {
      const AudioCtor = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtor) return;
      const ctx = window.__solarFlySynthCtx || new AudioCtor();
      window.__solarFlySynthCtx = ctx;
      try {
          if (ctx.state === 'suspended') ctx.resume();
      } catch (err) {}

      const start = ctx.currentTime + delay;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(frequency, start);
      osc.frequency.exponentialRampToValueAtTime(Math.max(60, frequency * 0.72), start + duration);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(volume, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + duration + 0.04);
  }

  function playFamilyFinishCue(rankIndex = 0) {
      if (!audioOn || !sfxEnabled) return;
      const voiceMap = [
          [220, 320, 420],
          [240, 360, 480],
          [300, 440, 620],
          [360, 540, 760]
      ];
      const tones = voiceMap[Math.min(rankIndex, voiceMap.length - 1)] || voiceMap[0];
      tones.forEach((freq, i) => {
          setTimeout(() => {
              playSyntheticTone(freq, 0.17 + i * 0.04, i % 2 === 0 ? 'triangle' : 'square', 0.065 + i * 0.01, 0);
          }, i * 120);
      });
      setTimeout(() => {
          playSyntheticTone(128 + rankIndex * 22, 0.22, 'sine', 0.08, 0);
      }, 140);
  }

  function playSound(name) {
      if (!getEffectiveAudioOn() || !sfxEnabled) return;

      if (sounds[name]) {
          const sound = sounds[name];
          activeSoundsState.soundsPlaying.add(name);
          let volume = 0.85 * masterVolume;
          if (name === 'door') volume = 1.0 * masterVolume;
          if (name === 'unlock' || name === 'key') volume = 0.95 * masterVolume;

          sound.volume = volume;
          try { sound.pause(); } catch (err) {}
          sound.currentTime = 0;
          sound.play().catch(err => console.log(name + " play error:", err));
      } else {
          console.log("Sound not found:", name);
      }
  }

  if (globalMusicToggleBtn) {
      globalMusicToggleBtn.addEventListener('click', () => {
          toggleMute();
      });
  }
  if (bgMusicToggleBtn) {
      bgMusicToggleBtn.addEventListener('click', () => {
          setBgMusicEnabled(!bgMusicEnabled);
      });
  }
  if (sfxToggleBtn) {
      sfxToggleBtn.addEventListener('click', () => {
          setSfxEnabled(!sfxEnabled);
          updateMusicSectionControls();
      });
  }
  if (classicGameModeBtn) {
      classicGameModeBtn.addEventListener('click', () => {
          setGameMode('classic');
      });
  }
  if (familyGameModeBtn) {
      familyGameModeBtn.addEventListener('click', () => {
          setGameMode('family');
          attachFamilyModePlayHandler();
      });
  }
  if (touchControlsBtn) {
      touchControlsBtn.addEventListener('click', () => {
          setGameplayControls('touch');
      });
  }
  if (buttonControlsBtn) {
      buttonControlsBtn.addEventListener('click', () => {
          setGameplayControls('button');
      });
  }
  if (journeyBoardToggleBtn) {
      journeyBoardToggleBtn.addEventListener('click', () => {
          showJourneyBoard = !showJourneyBoard;
          applyGameOverSettings();
          saveGameOverSettings();
      });
  }
  if (reviveButtonToggleBtn) {
      reviveButtonToggleBtn.addEventListener('click', () => {
          showReviveButton = !showReviveButton;
          applyGameOverSettings();
          saveGameOverSettings();
      });
  }
  if (enableAddOnsToggleBtn) {
      enableAddOnsToggleBtn.addEventListener('click', () => {
          showAddOns = !showAddOns;
          applyGameOverSettings();
          saveGameOverSettings();
      });
  }
  const saveAudioSettingsCheckbox = document.getElementById('saveAudioSettingsCheckbox');
  if (saveAudioSettingsCheckbox) {
      saveAudioSettingsCheckbox.checked = saveAudioSettingsForAllTime;
      saveAudioSettingsCheckbox.addEventListener('change', event => {
          setSaveAudioSettingsForAllTime(event.target.checked);
      });
  }
  if (masterVolumeSlider) {
      masterVolumeSlider.addEventListener('input', event => {
          updateMasterVolume(Number(event.target.value) / 100);
      });
  }

  updateGameModeControls();
  updateGameplayControlsUI();
  updateMusicSectionControls();
  applyGameOverSettings();

  // ----------------- TAB VISIBILITY HANDLER (ENHANCED) -----------------
  // This handles audio state preservation when app is minimized/reopened
  document.addEventListener('visibilitychange', function() {
      if (document.hidden) {
          // App is being minimized - save audio state
          saveAudioState();
          if (running) {
              wasAutoPausedOnBlur = true;
              pauseGame();
              saveGameState(); // Auto-save when app goes to background
          }
          if (audioOn) {
              bgAudio.muted = true;
              for (let key in sounds) {
                  sounds[key].muted = true;
              }
              document.body.dataset.previousAudioState = 'on';
          }
      } else {
          // App is being restored to foreground
          const previousState = document.body.dataset.previousAudioState;
          if (previousState === 'on' && audioOn) {
              // Unmute all audio
              bgAudio.muted = false;
              for (let key in sounds) {
                  sounds[key].muted = false;
              }
              
              // Restore previously playing sounds
              if (running) {
                  // Game is still running - restore active game sounds
                  restoreActiveSounds();
              } else if (activeSoundsState.menuSoundWasPlaying && sounds.menu) {
                  // Menu sound was playing - restore it (fallback to tap resume if blocked)
                  sounds.menu.play().catch(err => { console.log('menu resume error:', err); setupResumeAudioOnTap(); });
              }
          }
          delete document.body.dataset.previousAudioState;
          clearAudioState();
      }
  });

  // Also handle window blur/focus for older browsers (and mobile)
  let wasAutoPausedOnBlur = false; // Flag to track if auto-paused on blur
  
  window.addEventListener('blur', function() {
      saveAudioState();
      // Auto-pause if game is running
      if (running) {
          wasAutoPausedOnBlur = true;
          pauseGame();
          saveGameState(); // Auto-save when leaving
      }
      
      if (audioOn) {
          bgAudio.muted = true;
          for (let key in sounds) {
              sounds[key].muted = true;
          }
          document.body.dataset.previousAudioState = 'on';
      }
  });

  window.addEventListener('focus', function() {
      const previousState = document.body.dataset.previousAudioState;
      if (previousState === 'on' && audioOn) {
          bgAudio.muted = false;
          for (let key in sounds) {
              sounds[key].muted = false;
          }
          
          // Restore previously playing sounds
          if (running) {
              restoreActiveSounds();
          } else if (activeSoundsState.menuSoundWasPlaying && sounds.menu) {
              sounds.menu.play().catch(err => { console.log('menu resume error:', err); setupResumeAudioOnTap(); });
          }
      }
      delete document.body.dataset.previousAudioState;
      clearAudioState();
      // Note: wasAutoPausedOnBlur flag stays for pause screen to know it was auto-paused
  });
  
  async function handleUnloadAnalytics() {
      try {
          await removeActiveUserRecord();
      } catch (e) {
          console.log('Firestore unload analytics failed:', e);
      }
  }

  // Auto-save when tab/window is being closed
  window.addEventListener('beforeunload', function() {
      // Save if game is running OR if there is already a saved game state
      if (running || savedGameState) {
          saveGameState(); // Save before unload
      }
      try {
          localStorage.setItem('solarFlyIntroScreenIndex', currentIntroScreenIndex.toString());
          localStorage.setItem('solarFlyDirectToTutorialChoice', directToTutorialChoice ? 'true' : 'false');
      } catch (e) {
          console.warn('Failed to persist intro screen state on unload:', e);
      }
      handleUnloadAnalytics();
  });

window.addEventListener('pagehide', () => {
      handleUnloadAnalytics();
      stopActiveUserHeartbeat();
  });
  window.addEventListener('unload', () => {
      handleUnloadAnalytics();
      stopActiveUserHeartbeat();
  });
  
  // ----------------- END TAB VISIBILITY HANDLER -----------------


  // --- GAME STATE & LOCAL STORAGE VARIABLES ---
    let running=false,score=0;
  let high=0; // Loaded from localStorage
  let totalStars=0; // Loaded from localStorage
  let totalMatches=0; // Loaded from localStorage
  let meteorhunts = 0;
  let ufoDefenders = 0;
  let blackHoleApproachInProgress = false;
  let blackHoleApproachEscaped = false;
  let newHighScorePending = false; // Track a new high score before overlay is displayed
  let highScoreOverlayVisible = false; // Track whether the new high score overlay is open
  let playerName = null; // Loaded from localStorage or set on first run
  let playerHealth = 3; // NEW: Player health
  let playerDamageStage = 0; // 0 = intact, 1 = first bandage hit, 2 = deeper damage
  let savedGameState = null; // In-progress save/resume state
  let isOnDeathScreen = false; // Track if gameOver screen is displayed
  let deathTypeCode = 'dead:067';
  const deathTypeMessages = {
      'dead:001': 'Dead:001 Smash by the pillar',
      'dead:002': 'Dead:002 Burning in the fire',
      'dead:003': 'Dead:003 Blindly in the hole',
      'dead:004': 'Dead:004 Time of heaven',
      'dead:005': 'Dead:005 Killed by the creature',
      'dead:006': 'Dead:006 Trapped in the ice!',
      'dead:067': 'Dead:067 Unknown death — possible glitch'
  };
  let journeyAnimationRAF = null;
  let journeyAudioContext = null;
  let journeyOscillator = null;
  let journeyGainNode = null;
  let journeyAnimationStart = 0;
  let journeyAnimationDuration = 1700;
  let isJourneyAnimationPlaying = false;
  let journeyOldProgressSnapshot = null;
  let journeyNewProgressSnapshot = null;
  let prevTotalStars = 0;
  let prevTotalMatches = 0;
  let prevScore = 0;
  let counterAnimationRAF = null;

  // Game parameters
  let gravity=0.5,lift=-9;
  let baseGapSize=240; // Base gap from difficulty, adjusted on rotation
  let player={x:80,y:100,r:18,planetKey:'earth',planetIcon:'🌎', vy:0}; // Added vy for clarity
  let obstacles=[],meteors=[],blackHoles=[],aliens=[],shurikens=[],icyHoles=[],explosions=[],eatingBlackHole=null,eatingShuriken=null;
  let shurikenSpawnedAt51 = false;
  let lastSpawn=0,spawnInterval=2000,gapSize=160;
  let lastIcyHoleSpawnScore = -1;
  let icyTrapState = null;
  let icyTrapEscaped = false;
  let icyTrapOverlay = null;
  let icyTrapQuestionEl = null;
  let icyTrapTimerEl = null;
  let icyTrapOptionsEl = null;
  let difficulty='easy';

  // Menu ambient / gameplay-like background in menu
  let inMenuMode = false;
  let menuObstacles = [], menuMeteors = [], menuBlackHoles = [], menuAliens = [];
  let menuLastSpawn = 0, menuSpawnInterval = 1800;
  let menuLastBlackHoleSpawnScore = -1, menuLastUFOSpawnScore = -1;
  let menuScore = 0;
  let menuPlayer = {x: 120, y: 180, r: 18, planetKey:'earth', vy:0};

  // Exact score-based spawns
  let lastBlackHoleSpawnScore = -1;
  let lastUFOSpawnScore = -1;

    const sunImg=new Image(); sunImg.src="bg.png";
    let sunImgFailed=false; sunImg.onerror = ()=>{ sunImgFailed=true; };

    const icyHoleImg=new Image(); icyHoleImg.src="Skins/icy_hole.png";
    let icyHoleImgFailed=false; icyHoleImg.onerror = ()=>{ icyHoleImgFailed=true; };

  // --- PLANET DATA: CUSTOM DRAWING KEYS (existing) ---
  const planetData=[
    // key: unique ID, icon: emoji for menu, name: display name, unlock: score required, drawType: custom/emoji
    {key:'earth', icon:'🌎', name:'Earth', unlock:0, drawType:'custom'},
    {key:'mars', icon:'🔴', name:'Mars', unlock:10, drawType:'custom'},
    {key:'venus', icon:'🟡', name:'Venus', unlock:20, drawType:'custom'},
    {key:'mercury', icon:'⚪', name:'Mercury', unlock:35, drawType:'custom'},
    {key:'uranus', icon:'🧊', name:'Uranus', unlock:50, drawType:'custom'},
    {key:'neptune', icon:'💧', name:'Neptune', unlock:70, drawType:'custom'},
    {key:'saturn', icon:'🪐', name:'Saturn', unlock:100, drawType:'custom'},
    {key:'pluto', icon:'🟣', name:'Pluto', unlock:9999, drawType:'emoji'} // LOCK PLUTO
  ];

  function resolvePlanetKey(value, fallback = 'earth') {
      const key = typeof value === 'string' ? value.trim() : '';
      const candidate = planetData.find((planet) => planet.key === key);
      return candidate ? candidate.key : fallback;
  }

  function applySelectedPlanetKey(nextKey) {
      const normalizedKey = resolvePlanetKey(nextKey, 'earth');
      player.planetKey = normalizedKey;
      const selectedPlanet = planetData.find((planet) => planet.key === normalizedKey) || planetData[0];
      player.planetIcon = selectedPlanet.icon;
      menuPlayer.planetKey = normalizedKey;
      return normalizedKey;
  }

  function buildDamageMarkup(stage = 0) {
      const damageLevel = Math.max(0, Math.min(2, Number(stage) || 0));
      if (damageLevel === 0) return '';

      const stageClass = damageLevel === 1 ? 'damage-stage-1' : 'damage-stage-2';
      const stageMarkup = damageLevel === 1
          ? `
              <span class="damage-bandage bandage-1"></span>
              <span class="damage-bandage bandage-2"></span>
              <span class="damage-bandage bandage-3"></span>
            `
          : `
              <span class="damage-bandage bandage-1"></span>
              <span class="damage-bandage bandage-2"></span>
              <span class="damage-bandage bandage-3"></span>
              <span class="damage-bandage bandage-4"></span>
              <span class="damage-bandage bandage-5"></span>
              <span class="damage-bandage bandage-6"></span>
            `;

      return `<div class="damage-overlay ${stageClass}">${stageMarkup}</div>`;
  }

  function buildPlanetVisualMarkup(planetKey, size = 42, damageStage = 0) {
      const planet = planetData.find((p) => p.key === planetKey) || planetData[0];
      const style = `width:${size}px;height:${size}px;`;
      const damageMarkup = buildDamageMarkup(damageStage);
      const damageClass = damageStage > 0 ? `damage-active damage-stage-${Math.min(2, damageStage)}` : '';

      switch (planetKey) {
          case 'earth':
              return `
                  <div class="planet-visual planet-earth ${damageClass}" style="${style}">
                      ${damageMarkup}
                      <div class="land na"></div>
                      <div class="land greenland"></div>
                      <div class="land central"></div>
                      <div class="land sa"></div>
                      <div class="land eu"></div>
                      <div class="land af"></div>
                      <div class="land asia"></div>
                      <div class="land india"></div>
                      <div class="land arabia"></div>
                      <div class="land japan"></div>
                      <div class="land uk"></div>
                      <div class="land madagascar"></div>
                      <div class="island i1"></div>
                      <div class="island i2"></div>
                      <div class="island i3"></div>
                      <div class="island i4"></div>
                      <div class="island i5"></div>
                      <div class="face"><span class="eye left"></span><span class="eye right"></span><span class="smile"></span></div>
                  </div>
              `;
          case 'mars':
              return `
                  <div class="planet-visual planet-mars ${damageClass}" style="${style}">
                      ${damageMarkup}
                      <span class="crater c1"></span><span class="crater c2"></span><span class="crater c3"></span><span class="crater c4"></span><span class="crater c5"></span><span class="crater c6"></span><span class="crater c7"></span><span class="crater c8"></span>
                      <div class="face"><span class="eye left"></span><span class="eye right"></span><span class="smile"></span></div>
                  </div>
              `;
          case 'venus':
              return `
                  <div class="planet-visual planet-venus ${damageClass}" style="${style}">
                      ${damageMarkup}
                      <div class="face"><span class="eye left"></span><span class="eye right"></span><span class="smile"></span></div>
                  </div>
              `;
          case 'mercury':
              return `
                  <div class="planet-visual planet-mercury ${damageClass}" style="${style}">
                      ${damageMarkup}
                      <div class="face"><span class="eye left"></span><span class="eye right"></span><span class="smile"></span></div>
                  </div>
              `;
          case 'uranus':
              return `
                  <div class="planet-visual planet-uranus ${damageClass}" style="${style}">
                      ${damageMarkup}
                      <span class="ring"></span>
                      <div class="face"><span class="eye left"></span><span class="eye right"></span><span class="smile"></span></div>
                  </div>
              `;
          case 'neptune':
              return `
                  <div class="planet-visual planet-neptune ${damageClass}" style="${style}">
                      ${damageMarkup}
                      <div class="face"><span class="eye left"></span><span class="eye right"></span><span class="smile"></span></div>
                  </div>
              `;
          case 'saturn':
              return `
                  <div class="planet-visual planet-saturn ${damageClass}" style="${style}">
                      ${damageMarkup}
                      <span class="ring"></span>
                      <div class="face"><span class="eye left"></span><span class="eye right"></span><span class="smile"></span></div>
                  </div>
              `;
          case 'pluto':
              return `<div class="planet-visual ${damageClass}" style="${style};background:radial-gradient(circle at 30% 30%, #efe4ff 0%, #bca0db 25%, #7d5f9d 60%, #3f2d5c 100%);">${damageMarkup}</div>`;
          default:
              return `<div class="planet-visual ${damageClass}" style="${style};background:radial-gradient(circle at 35% 35%, #dbeafe 0%, #60a5fa 35%, #1d4ed8 100%);">${damageMarkup}</div>`;
      }
  }
  let unlocked = [];
  let keyShown = [];
  let planetNew = []; // NEW: Tracks if a new planet was unlocked since last visit to Planet Menu

  // NEW: Achievements data and state (grouped into themed sections)
  const achievementSections = [
      {
          key: 'planets',
          title: 'Planets',
          icon: '🌍',
          accent: '#2fcf6d',
          achievements: [
              {key:'first_point', icon:'achievement/planets/Earth.png', name:'First Flight', desc:'Begin your journey by unlocking Earth and taking your first step into space.', type:'score', target:1, section:'planets'},
              {key:'mars_pilot', icon:'achievement/planets/Mars.png', name:'Joy of the Red', desc:'Unlock Mars and embrace the fiery challenge of the red planet.', type:'score', target:10, section:'planets'},
              {key:'venus_pilot', icon:'achievement/planets/Venus.png', name:'Yellow Pea', desc:'Survive and unlock the intense and glowing world of Venus.', type:'score', target:20, section:'planets'},
              {key:'mercury_pilot', icon:'achievement/planets/Mercury.png', name:'Swift Messenger', desc:'Master speed and precision to unlock the fastest planet in the system.', type:'score', target:35, section:'planets'},
              {key:'uranus_pilot', icon:'achievement/planets/Uranus.png', name:'Freedom of Ice', desc:'Break through the frozen depths and claim victory in icy conditions.', type:'score', target:50, section:'planets'},
              {key:'neptune_pilot', icon:'achievement/planets/Neptune.png', name:'Dark is the Great', desc:'Explore the deep blue void and conquer the mysterious Neptune.', type:'score', target:70, section:'planets'},
              {key:'saturn_pilot', icon:'achievement/planets/Saturn.png', name:'Have a Ring', desc:'Unlock Saturn and dominate the skies surrounded by its legendary rings.', type:'score', target:100, section:'planets'}
          ]
      },
      {
          key: 'explore',
          title: 'Explore',
          icon: '💫',
          accent: '#2fcf6d',
          achievements: [
              {key:'cosmic_fire', icon:'achievement/Explore/meteor.png', name:'Cosmic Fire', desc:'Witness the destructive beauty of a meteor for the first time.', type:'time', target:1, scoreThreshold:11, section:'explore'},
              {key:'gravity_embrace', icon:'achievement/Explore/black_hole.png', name:'Gravity\'s Embrace', desc:'Encounter the pull of a black hole and survive its deadly force.', type:'time', target:1, scoreThreshold:25, section:'explore'},
              {key:'alien_encounter', icon:'achievement/Explore/ufo.png', name:'Alien Encounter', desc:'Come face to face with a UFO and experience the unknown.', type:'time', target:1, scoreThreshold:50, section:'explore'},
              {key:'frozen_danger', icon:'Skins/icy_hole.png', name:'Frozen-Danger', desc:'Discover the icy trap and learn how to escape its grip.', type:'time', target:1, scoreThreshold:75, section:'explore'}
          ]
      },
      {
          key: 'impossible',
          title: 'Impossible Dares',
          icon: '👹',
          accent: '#ff4d6d',
          achievements: [
              {key:'impossible_point', icon:'achievement/imp/imp_ch.png', name:'Stellar Rookie', desc:'Score your first point in Impossible Mode. A small step into chaos.', type:'diff_score', target:{diff:'impossible', score:1}, section:'impossible'},
              {key:'star_hoarder', icon:'achievement/imp/bil.png', name:'Star Hoarder', desc:'Collect a massive total of 1000 stars across your journey.', type:'total_stars', target:1000, section:'impossible'},
              {key:'meteor_hunter', icon:'achievement/imp/me_ea.png', name:'Meteor Hunter', desc:'Destroy 500 meteors and prove your mastery of survival.', type:'meteor_count', target:500, section:'impossible'},
              {key:'cosmic_dare', icon:'achievement/imp/bl_ea.png', name:'Cosmic Dare', desc:'Approach a black hole and escape without being consumed.', type:'time', target:1, section:'impossible'},
              {key:'ufo_defender', icon:'achievement/imp/ea_ufo.png', name:'UFO Defender', desc:'Take down 50 UFOs and defend your path through space.', type:'ufo_count', target:50, section:'impossible'}
          ]
      }
  ];
  const achievements = achievementSections.flatMap(section => section.achievements);
  let achievementStatus = {};
  let achievementNew = {}; // NEW: Tracks if a new achievement was unlocked since last visit to Achievements Menu
  let expandedAchievementSection = null;
  let pendingPlayGamesAchievements = [];

  function loadPendingPlayGamesAchievements() {
      try {
          const saved = localStorage.getItem('solarFlyPendingPlayGamesAchievements');
          const parsed = saved ? JSON.parse(saved) : [];
          pendingPlayGamesAchievements = Array.isArray(parsed) ? parsed.filter(Boolean) : [];
      } catch (e) {
          console.warn('Failed to load pending Play Games achievements:', e);
          pendingPlayGamesAchievements = [];
      }
  }

  function savePendingPlayGamesAchievements() {
      try {
          localStorage.setItem('solarFlyPendingPlayGamesAchievements', JSON.stringify(pendingPlayGamesAchievements));
      } catch (e) {
          console.warn('Failed to save pending Play Games achievements:', e);
      }
  }

  function isPlayGamesConnectedSafely() {
      if (typeof window.Android === 'undefined' || window.Android === null) return false;

      try {
          if (typeof Android.isPlayGamesConnected === 'function') {
              return Boolean(Android.isPlayGamesConnected());
          }
      } catch (e) {
          console.warn('Play Games connection check failed:', e);
      }

      try {
          if (typeof Android.getPlayGamesProfile === 'function') {
              const profile = Android.getPlayGamesProfile();
              const profileData = typeof profile === 'string' ? JSON.parse(profile) : profile;
              return profileData && (profileData.active === true || profileData.connected === true) && typeof profileData.name === 'string' && profileData.name !== '';
          }
      } catch (e) {
          console.warn('Play Games profile parse failed:', e);
      }

      return false;
  }

  function queuePendingPlayGamesAchievement(achievementKey) {
      if (!achievementKey || pendingPlayGamesAchievements.includes(achievementKey)) return;
      pendingPlayGamesAchievements.push(achievementKey);
      savePendingPlayGamesAchievements();
  }

  function flushPendingPlayGamesAchievements() {
      if (!pendingPlayGamesAchievements.length) return;
      if (!isPlayGamesConnectedSafely()) return;

      const remaining = [];
      pendingPlayGamesAchievements.forEach((achievementKey) => {
          if (unlockPlayGamesAchievementForKey(achievementKey)) {
              console.log('Synced pending Play Games achievement:', achievementKey);
          } else {
              remaining.push(achievementKey);
          }
      });

      pendingPlayGamesAchievements = remaining;
      savePendingPlayGamesAchievements();
  }

  const playGamesAchievementIds = {
      first_point: 'CgkI-uPQ3MYZEAIQAQ',
      mars_pilot: 'CgkI-uPQ3MYZEAIQAg',
      venus_pilot: 'CgkI-uPQ3MYZEAIQAw',
      mercury_pilot: 'CgkI-uPQ3MYZEAIQCw',
      uranus_pilot: 'CgkI-uPQ3MYZEAIQBg',
      neptune_pilot: 'CgkI-uPQ3MYZEAIQCA',
      saturn_pilot: 'CgkI-uPQ3MYZEAIQCg',
      cosmic_fire: 'CgkI-uPQ3MYZEAIQBA',
      gravity_embrace: 'CgkI-uPQ3MYZEAIQBQ',
      alien_encounter: 'CgkI-uPQ3MYZEAIQBw',
      frozen_danger: 'CgkI-uPQ3MYZEAIQCQ',
      impossible_point: 'CgkI-uPQ3MYZEAIQDA',
      star_hoarder: 'CgkI-uPQ3MYZEAIQDQ',
      meteor_hunter: 'CgkI-uPQ3MYZEAIQDg',
      cosmic_dare: 'CgkI-uPQ3MYZEAIQDw',
      ufo_defender: 'CgkI-uPQ3MYZEAIQEA'
  };

  const playGamesIncrementalAchievementIds = {
      star_hoarder: 'CgkI-uPQ3MYZEAIQDQ',
      meteor_hunter: 'CgkI-uPQ3MYZEAIQDg',
      ufo_defender: 'CgkI-uPQ3MYZEAIQEA'
  };

  function incrementPlayGamesAchievementForKey(achievementKey, steps = 1) {
      const achievementId = playGamesIncrementalAchievementIds[achievementKey];
      if (!achievementId || steps <= 0) return;
      if (!isPlayGamesConnectedSafely()) return;

      const androidBridge = typeof Android !== 'undefined' && Android !== null ? Android : (typeof window !== 'undefined' ? window.Android : undefined);
      if (!androidBridge || typeof androidBridge.incrementPlayGamesAchievement !== 'function') return;

      try {
          androidBridge.incrementPlayGamesAchievement(achievementId, steps);
      } catch (e) {
          console.warn('Failed to increment Play Games achievement for key:', achievementKey, e);
      }
  }

  const stageDefinitions = [
      {
          key: 'age0',
          name: 'Age 0',
          badge: '0',
          tasks: [
              { id: 'playMatches', label: 'Play 3 matches', type: 'matches', target: 3 }
          ]
      },
      {
          key: 'beginner',
          name: 'Beginner',
          badge: 'B',
          tasks: [
              { id: 'highScore15', label: 'Reach a High Score of 15', type: 'highScore', target: 15 },
              { id: 'stars100', label: 'Collect 100 Stars', type: 'stars', target: 100 },
              { id: 'consecutive5', label: 'Score 5+ points in 3 consecutive matches', type: 'consecutiveMatches', target: 3, requiredScore: 5 }
          ]
      },
      {
          key: 'adventurer',
          name: 'Adventurer',
          badge: 'A',
          tasks: [
              { id: 'highScore50', label: 'Reach a High Score of 50', type: 'highScore', target: 50 },
              { id: 'stars500', label: 'Collect 500 Stars', type: 'stars', target: 500 },
              { id: 'firstWeekReward', label: 'Complete 1st-week reward', type: 'rewardWeek', target: 1 }
          ]
      },
      {
          key: 'master',
          name: 'Master',
          badge: 'M',
          tasks: [
              { id: 'unlockPlanets', label: 'Unlock 7 planets', type: 'unlockPlanets', target: 7 },
              { id: 'allAchievements', label: 'Complete 11 achievements', type: 'achievements', target: 11 },
              { id: 'consecutiveDays', label: 'Play 10 days continuously with 50+ points', type: 'consecutiveDays', target: 10, requiredScore: 50 }
          ]
      },
      {
          key: 'truePilot',
          name: 'True Pilot',
          badge: 'TP',
          tasks: []
      }
  ];

  let stageProgress = null;
    // Tracks the last stage index we advanced from (used to trigger post-stage prompts)
    let lastAdvancedFromStageIndex = null;
  let lastRenderedProgress = null;
  let journeySnapshot = null;
  let oldJourneyStats = null;

  function createDefaultStageProgress() {
      return {
          currentStage: 0,
          stages: stageDefinitions.map(stage => ({
              tasks: stage.tasks.map(task => ({
                  id: task.id,
                  current: 0,
                  complete: false
              }))
          })),
          lastMatchScores: [],
          consecutiveDays: {
              count: 0,
              lastDate: '',
              lastQualifiedDate: '',
              lastPlayedDate: ''
          },
          newTaskCount: 0
      };
  }

  function saveStageData() {
      localStorage.setItem('solarFlyStageProgress', JSON.stringify(stageProgress));
  }

  function loadStageData() {
      const saved = localStorage.getItem('solarFlyStageProgress');
      if (saved) {
          try {
              const parsed = JSON.parse(saved);
              if (parsed && typeof parsed.currentStage === 'number' && Array.isArray(parsed.stages)) {
                  stageProgress = parsed;
                  while (stageProgress.stages.length < stageDefinitions.length) {
                      stageProgress.stages.push({ tasks: [] });
                  }
                  stageProgress.stages = stageProgress.stages.map((stage, index) => ({
                      tasks: (stage.tasks || stageDefinitions[index].tasks.map(task => ({ id: task.id, current: 0, complete: false }))).map(task => ({
                          id: task.id,
                          current: typeof task.current === 'number' ? task.current : 0,
                          complete: !!task.complete
                      }))
                  }));
                  stageProgress.lastMatchScores = Array.isArray(stageProgress.lastMatchScores) ? stageProgress.lastMatchScores.slice(-10) : [];
                  stageProgress.consecutiveDays = {
                      count: typeof stageProgress.consecutiveDays?.count === 'number' ? stageProgress.consecutiveDays.count : 0,
                      lastDate: typeof stageProgress.consecutiveDays?.lastDate === 'string' ? stageProgress.consecutiveDays.lastDate : '',
                      lastQualifiedDate: typeof stageProgress.consecutiveDays?.lastQualifiedDate === 'string' ? stageProgress.consecutiveDays.lastQualifiedDate : '',
                      lastPlayedDate: typeof stageProgress.consecutiveDays?.lastPlayedDate === 'string' ? stageProgress.consecutiveDays.lastPlayedDate : ''
                  };
                  // Auto-reset streak if player missed a day (no qualifying play yesterday)
                  try {
                      const today = new Date().toISOString().slice(0, 10);
                      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
                      const cd = stageProgress.consecutiveDays;
                      if (cd && cd.lastQualifiedDate) {
                          if (cd.lastQualifiedDate !== today && cd.lastQualifiedDate !== yesterday) {
                              // If the master task is not complete, clear the streak
                              const masterIndex = stageDefinitions.findIndex(s => s.key === 'master');
                              if (masterIndex >= 0) {
                                  const masterDef = stageDefinitions[masterIndex];
                                  const taskDefIndex = masterDef.tasks ? masterDef.tasks.findIndex(t => t.type === 'consecutiveDays' || t.id === 'consecutiveDays') : -1;
                                  if (taskDefIndex >= 0) {
                                      const masterState = stageProgress.stages[masterIndex];
                                      const taskState = masterState && masterState.tasks ? masterState.tasks[taskDefIndex] : null;
                                      if (!taskState || !taskState.complete) {
                                          cd.count = 0;
                                          cd.lastQualifiedDate = '';
                                      }
                                  }
                              }
                          }
                      }
                  } catch (e) {
                      console.warn('Auto-reset check failed:', e);
                  }
                  stageProgress.currentStage = Math.min(Math.max(0, stageProgress.currentStage), stageDefinitions.length - 1);
                  stageProgress.newTaskCount = typeof stageProgress.newTaskCount === 'number' ? stageProgress.newTaskCount : 0;
                  return;
              }
          } catch (e) {
              console.warn('Failed to load stage progress:', e);
          }
      }
      stageProgress = createDefaultStageProgress();
      saveStageData();
  }

  function getCurrentStageDefinition() {
      return stageDefinitions[stageProgress.currentStage] || stageDefinitions[0];
  }

  function getNextStageDefinition() {
      return stageDefinitions[stageProgress.currentStage + 1] || null;
  }

  function resetCurrentStageProgress() {
      const stage = stageProgress.currentStage;
      if (!stageDefinitions[stage]) return;
      const stageState = stageProgress.stages[stage];
      if (stageState && Array.isArray(stageState.tasks)) {
          stageState.tasks.forEach(task => {
              task.current = 0;
              task.complete = false;
          });
      }
      stageProgress.lastMatchScores = [];
      if (stage === 3) {
          stageProgress.consecutiveDays.count = 0;
          stageProgress.consecutiveDays.lastDate = '';
          stageProgress.consecutiveDays.lastQualifiedDate = '';
          stageProgress.consecutiveDays.lastPlayedDate = '';
      }
      saveStageData();
  }

  function updateStageTaskValues() {
      const stageDef = getCurrentStageDefinition();
      const stageState = stageProgress.stages[stageProgress.currentStage];
      if (!stageDef || !stageState) return;
      stageDef.tasks.forEach((taskDef, index) => {
          const taskState = stageState.tasks[index];
          if (!taskState) return;
          switch (taskDef.type) {
              case 'highScore':
                  taskState.current = Math.min(high, taskDef.target);
                  taskState.complete = high >= taskDef.target;
                  break;
              case 'stars':
                  taskState.current = Math.min(totalStars, taskDef.target);
                  taskState.complete = totalStars >= taskDef.target;
                  break;
              case 'matches':
                  taskState.current = Math.min(totalMatches, taskDef.target);
                  taskState.complete = totalMatches >= taskDef.target;
                  break;
              case 'rewardWeek':
                  taskState.current = rewardWeekCompleted ? taskDef.target : 0;
                  taskState.complete = rewardWeekCompleted;
                  break;
              case 'unlockPlanets':
                  taskState.current = countPlanetsUnlocked();
                  taskState.complete = countPlanetsUnlocked() >= countAvailablePlanets();
                  break;
              case 'achievements':
                  taskState.current = countAchievementsComplete();
                  taskState.complete = countAchievementsComplete() >= (taskDef.target || 11);
                  break;
              case 'consecutiveMatches':
                  if (taskState.complete) {
                      taskState.current = taskDef.target;
                      taskState.complete = true;
                  } else {
                      const requiredScore = taskDef.requiredScore || 0;
                      const recentScores = Array.isArray(stageProgress.lastMatchScores) ? stageProgress.lastMatchScores : [];
                      let consecutiveCount = 0;
                      for (let i = recentScores.length - 1; i >= 0; i--) {
                          if (recentScores[i] >= requiredScore) {
                              consecutiveCount += 1;
                          } else {
                              break;
                          }
                      }
                      taskState.current = Math.min(consecutiveCount, taskDef.target);
                      taskState.complete = consecutiveCount >= taskDef.target;
                  }
                  break;
              case 'consecutiveDays':
                  if (taskState.complete) {
                      taskState.current = taskDef.target;
                      taskState.complete = true;
                  } else {
                      taskState.current = stageProgress.consecutiveDays.count;
                      taskState.complete = stageProgress.consecutiveDays.count >= taskDef.target;
                  }
                  break;
              default:
                  taskState.current = taskState.current || 0;
                  taskState.complete = !!taskState.complete;
          }
      });
  }

  function cloneStageProgressSnapshot() {
      if (!stageProgress) return null;
      return {
          currentStage: stageProgress.currentStage,
          stages: stageProgress.stages.map(stage => ({
              tasks: (stage.tasks || []).map(task => ({
                  current: task.current,
                  complete: task.complete
              }))
          })),
          consecutiveDays: stageProgress.consecutiveDays ? { ...stageProgress.consecutiveDays } : {},
          lastMatchScores: Array.isArray(stageProgress.lastMatchScores) ? [...stageProgress.lastMatchScores] : []
      };
  }

  function calculateSnapshotJourneyProgress(snapshot) {
      if (!snapshot || !stageDefinitions || !stageDefinitions[snapshot.currentStage]) return 0;
      const stageDef = stageDefinitions[snapshot.currentStage];
      const stageState = snapshot.stages[snapshot.currentStage];
      if (!stageDef || !stageState || !Array.isArray(stageDef.tasks) || !Array.isArray(stageState.tasks)) return 0;
      let totalProgress = 0;
      stageDef.tasks.forEach((taskDef, index) => {
          const taskState = stageState.tasks[index];
          if (!taskState) return;
          const targetValue = taskDef.type === 'unlockPlanets' ? countAvailablePlanets() : taskDef.target;
          if (targetValue > 0) {
              totalProgress += Math.min(100, Math.floor((taskState.current / targetValue) * 100));
          } else {
              totalProgress += taskState.complete ? 100 : 0;
          }
      });
      return stageDef.tasks.length ? Math.floor(totalProgress / stageDef.tasks.length) : 0;
  }

  function appendStageMatchScore(score) {
      if (!stageProgress) return;
      stageProgress.lastMatchScores = stageProgress.lastMatchScores || [];
      stageProgress.lastMatchScores.push(score);
      if (stageProgress.lastMatchScores.length > 10) {
          stageProgress.lastMatchScores.shift();
      }
  }

  function updateConsecutiveDaysProgress(score) {
      if (!stageProgress || !stageProgress.consecutiveDays) return;
      const today = new Date().toISOString().slice(0, 10);
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      const consecutive = stageProgress.consecutiveDays;

      // If the master 'consecutiveDays' task is already complete, do not reset or modify it
      try {
          const masterIndex = stageDefinitions.findIndex(s => s.key === 'master');
          if (masterIndex >= 0) {
              const masterDef = stageDefinitions[masterIndex];
              const taskDefIndex = masterDef.tasks ? masterDef.tasks.findIndex(t => t.type === 'consecutiveDays' || t.id === 'consecutiveDays') : -1;
              if (taskDefIndex >= 0) {
                  const masterState = stageProgress.stages[masterIndex];
                  const taskState = masterState && masterState.tasks ? masterState.tasks[taskDefIndex] : null;
                  if (taskState && taskState.complete) return;
              }
          }
      } catch (e) {
          // If anything goes wrong checking completion, fall back to default behavior
      }

      if (consecutive.lastPlayedDate !== today) {
          consecutive.lastPlayedDate = today;
          console.log('[StreakDebug] New day detected. today=', today, 'lastQualifiedDate=', consecutive.lastQualifiedDate, 'lastPlayedDate set to', consecutive.lastPlayedDate);
          // Do not reset the streak immediately on a first below-50 play; postpone reset until day change check on load/next day.
          saveStageData();
      }

      if (score < 50) {
          console.log('[StreakDebug] Play today but score below 50. score=', score, 'no change. lastQualifiedDate=', consecutive.lastQualifiedDate);
          // Save play info so load-time auto-reset knows the player played and didn't qualify today
          saveStageData();
          return;
      }
      if (consecutive.lastQualifiedDate === today) {
          console.log('[StreakDebug] Already qualified today. skipping.');
          return;
      }

      if (consecutive.lastQualifiedDate === yesterday) {
          consecutive.count += 1;
      } else {
          consecutive.count = 1;
      }
      consecutive.lastQualifiedDate = today;
      console.log('[StreakDebug] Qualified today. new count=', consecutive.count, 'lastQualifiedDate=', consecutive.lastQualifiedDate);
      saveStageData();
  }

  function advanceStageIfNeeded() {
      if (!stageProgress) return;
      const currentStage = stageProgress.currentStage;
      const stageDef = getCurrentStageDefinition();
      if (!stageDef || !stageDef.tasks.length) return;
      const stageState = stageProgress.stages[currentStage];
      if (!stageState) return;
      const allComplete = stageDef.tasks.every((taskDef, index) => stageState.tasks[index] && stageState.tasks[index].complete);
      if (allComplete && currentStage < stageDefinitions.length - 1) {
          const previousStageIndex = currentStage;
          stageProgress.currentStage += 1;
          // remember the previous stage index so callers (like showMenu) can react
          lastAdvancedFromStageIndex = previousStageIndex;
          stageProgress.stages[stageProgress.currentStage] = {
              tasks: stageDefinitions[stageProgress.currentStage].tasks.map(task => ({ id: task.id, current: 0, complete: false }))
          };
          saveStageData();
          updateProfileStageDisplay();
          updateStagesBtnBadge();
          showStageTransitionSequence(previousStageIndex, stageProgress.currentStage);
      }
  }

  function updateStageProgressAfterMatch(score) {
      if (isFamilyForwardRunActive()) {
          return;
      }

      // Update stageProgress with new match results
      const currentStage = stageProgress.currentStage;
      const stageState = stageProgress.stages[currentStage];
      const beforeComplete = stageState ? stageState.tasks.map(t => !!t.complete) : [];
      appendStageMatchScore(score);
      updateConsecutiveDaysProgress(score);
      updateStageTaskValues();
      const newlyCompleted = stageState ? stageState.tasks.reduce((sum, task, index) => sum + ((!beforeComplete[index] && task.complete) ? 1 : 0), 0) : 0;
      if (newlyCompleted > 0) {
          const currentStageDef = getCurrentStageDefinition();
          // If we're at True Pilot (final), don't track new-task notifications
          if (currentStageDef && currentStageDef.key === 'truePilot') {
              stageProgress.newTaskCount = 0;
          } else {
              stageProgress.newTaskCount = (stageProgress.newTaskCount || 0) + newlyCompleted;
          }
      }
      const previousStage = stageProgress.currentStage;
      advanceStageIfNeeded();
      if (stageProgress.currentStage !== previousStage) {
          updateStageTaskValues();
      }
      saveStageData();
      updateProfileStageDisplay();
      updateStagesBtnBadge();

      // Third: DO NOT call renderJourneyBoard() immediately. Instead, delay and preserve old journey state if a new high score is pending.
      setTimeout(() => {
          if ((newHighScorePending || highScoreOverlayVisible) && oldJourneyStats) {
              renderJourneyBoard(false, oldJourneyStats);
          } else {
              renderJourneyBoard(true);
          }
      }, 1000);
  }

  function getProfileStageLabel() {
      const stage = getCurrentStageDefinition();
      return stage ? stage.name : 'Age 0';
  }

  function getStageBadgeMarkup(stageIndex) {
      const stage = stageDefinitions[stageIndex] || stageDefinitions[0];
      const iconMap = {
          age0: '0',
          beginner: '🔍',
          adventurer: '🧭',
          master: '★',
          truePilot: '👨‍✈️'
      };
      const icon = iconMap[stage.key] || stage.badge;
      return `
          <div class="stage-badge stage-${stage.key}">
              <div class="wing left"></div>
              <div class="wing right"></div>
              <div class="shield"></div>
              <div class="center">${icon}</div>
          </div>
      `;
  }

  function updateProfileStageDisplay() {
      const stageIndex = stageProgress.currentStage;
      profileCurrentStage.innerHTML = `<span class="profile-stage-badge">${getStageBadgeMarkup(stageIndex)}</span><span class="profile-stage-label">${getProfileStageLabel()}</span>`;
  }

  function getStageButtonIcon(stageIndex) {
      const stage = stageDefinitions[stageIndex] || stageDefinitions[0];
      const iconMap = {
          age0: '0',
          beginner: '🔍',
          adventurer: '🧭',
          master: '★',
          truePilot: '👨‍✈️'
      };
      return iconMap[stage.key] || stage.badge || '🚀';
  }

  function updateStagesBtnDisplay() {
      updateStagesBtnBadge();
      if (!stagesBtnIcon || !stageProgress) return;
      stagesBtnIcon.textContent = getStageButtonIcon(stageProgress.currentStage);
  }

  function updateStagesBtnBadge() {
      if (!stagesBtn || !stagesBtnBadge || !stageProgress) return;
      // If current stage is True Pilot, there are no new stages to show
      const currentStage = stageDefinitions[stageProgress.currentStage];
      if (currentStage && currentStage.key === 'truePilot') {
          stagesBtnBadge.classList.add('hidden');
          return;
      }

      const count = Math.max(0, stageProgress.newTaskCount || 0);
      if (count > 0) {
          stagesBtnBadge.textContent = count > 9 ? '9+' : count;
          stagesBtnBadge.classList.remove('hidden');
      } else {
          stagesBtnBadge.classList.add('hidden');
      }
  }

  function playStageTransitionSound(type) {
      if (!audioOn || !(window.AudioContext || window.webkitAudioContext)) return;
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      ctx.resume().catch(() => {});
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime;
      osc.connect(gain).connect(ctx.destination);
      gain.gain.setValueAtTime(type === 'rocket' ? 0.5 : 0.24, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + (type === 'rocket' ? 0.5 : 1.4));
      if (type === 'rocket') {
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(160, now);
          osc.frequency.exponentialRampToValueAtTime(780, now + 0.5);
      } else {
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(120, now);
          osc.frequency.exponentialRampToValueAtTime(420, now + 1.4);
      }
      osc.start(now);
      osc.stop(now + (type === 'rocket' ? 0.55 : 1.5));
  }

  function clearStageTransitionTimer() {
      if (stageTransitionTimer) {
          clearTimeout(stageTransitionTimer);
          stageTransitionTimer = null;
      }
  }

  function setStageTransitionStep(step) {
      stageTransitionStep = step;
      if (!stageTransitionOverlay) return;
      if (step === 0) {
          stageTransitionOverlay.classList.add('active');
          transitionStagePanel.classList.remove('hidden');
          transitionFlash.classList.add('hidden');
          transitionResult.classList.add('hidden');
          transitionSkipHint.style.display = 'block';
          beginGameBtn.style.display = 'none';
          transitionBackground.style.opacity = '0.95';
          transitionBackground.style.filter = 'blur(0px)';
          clearStageTransitionTimer();
          stageTransitionTimer = setTimeout(() => setStageTransitionStep(1), 2800);
      } else if (step === 1) {
          transitionStagePanel.classList.remove('hidden');
          transitionFlash.classList.remove('hidden');
          transitionResult.classList.add('hidden');
          transitionSkipHint.style.display = 'block';
          beginGameBtn.style.display = 'none';
          transitionBackground.style.opacity = '0.75';
          clearStageTransitionTimer();
          stageTransitionTimer = setTimeout(() => setStageTransitionStep(2), 2200);
      } else if (step === 2) {
          transitionStagePanel.classList.add('hidden');
          transitionFlash.classList.add('hidden');
          transitionResult.classList.remove('hidden');
          transitionSkipHint.style.display = 'none';
          beginGameBtn.style.display = 'inline-flex';
          transitionBackground.style.opacity = '1';
          transitionBackground.style.background = transitionBackground.dataset.finalBg || transitionBackground.style.background;
          clearStageTransitionTimer();
      }
  }

  function hideStageTransitionOverlay() {
      if (!stageTransitionOverlay) return;
      clearStageTransitionTimer();
      stageTransitionOverlay.classList.remove('active');
      stageTransitionOverlay.style.display = 'none';
      transitionFlash.classList.add('hidden');
      transitionResult.classList.add('hidden');
      transitionSkipHint.style.display = 'none';
      beginGameBtn.style.display = 'none';

      if (stageTransitionPausedBgAudio) {
          stageTransitionPausedBgAudio = false;
          if (audioOn && running && bgAudio && bgAudio.paused) {
              tryPlayBackgroundMusic();
          }
      }
  }

  function showStageTransitionSequence(prevStageIndex, nextStageIndex) {
      if (!stageTransitionOverlay || !stageDefinitions[prevStageIndex] || !stageDefinitions[nextStageIndex]) return;
      const prevStage = stageDefinitions[prevStageIndex];
      const nextStage = stageDefinitions[nextStageIndex];
      transitionPrevBadge.innerHTML = getStageBadgeMarkup(prevStageIndex);
      transitionNewBadge.innerHTML = getStageBadgeMarkup(nextStageIndex);
      transitionPrevName.textContent = prevStage.name;
      transitionNewName.textContent = nextStage.name;
      transitionStagePanel.classList.remove('stage-age0', 'stage-beginner', 'stage-adventurer', 'stage-master', 'stage-truePilot');
      transitionStagePanel.classList.add(`stage-${prevStage.key}`);
      // If next stage is truePilot, prefer gold theme for the transition visuals
      const initialBgKey = (nextStage && nextStage.key === 'truePilot') ? 'truePilot' : prevStage.key;
      const finalBgKey = nextStage ? nextStage.key : prevStage.key;

      transitionBackground.style.background = {
          age0: 'radial-gradient(circle at top, #f7f8fa, #d9dbdf 50%, #fafbfe 100%)',
          beginner: 'radial-gradient(circle at top, #0f2c6c, #08152c 60%, #020713 100%)',
          adventurer: 'radial-gradient(circle at top, #02061a, #051021 55%, #000509 100%)',
          master: 'radial-gradient(circle at top, #040816, #040611 55%, #000 100%)',
          // truePilot should use a gold theme for transitions
          truePilot: 'radial-gradient(circle at top, #fff7d6, #ffea9a 45%, #ffd24d 100%)'
      }[initialBgKey] || 'radial-gradient(circle at top, #0e214a, #041225 60%, #010408 100%)';
      transitionBackground.dataset.finalBg = {
          age0: 'radial-gradient(circle at top, #dfe3e9, #ffffff 60%, #fafcff 100%)',
          beginner: 'radial-gradient(circle at top, #1f4cbd, #0b1f47 55%, #081125 100%)',
          adventurer: 'radial-gradient(circle at top, #0b1f39, #020613 60%, #01020a 100%)',
          master: 'radial-gradient(circle at top, #111624, #05070f 60%, #000 100%)',
          truePilot: 'radial-gradient(circle at top, #ffefbf, #ffd77f 45%, #ffca3a 100%)'
      }[finalBgKey] || transitionBackground.style.background;

      if (audioOn && bgAudio && !bgAudio.paused) {
          stageTransitionPausedBgAudio = true;
          bgAudio.pause();
      }

      stageTransitionOverlay.style.display = 'flex';
      transitionResult.classList.add('hidden');
      transitionFlash.classList.add('hidden');
      transitionSkipHint.style.display = 'block';
      beginGameBtn.style.display = 'none';
      setStageTransitionStep(0);
  }

  function maybeSkipStageTransition() {
      if (stageTransitionStep < 2) {
          setStageTransitionStep(2);
      }
  }

  if (stageTransitionOverlay) {
      stageTransitionOverlay.addEventListener('pointerdown', function () {
          maybeSkipStageTransition();
          if (audioOn) playSound('tap');
      });
  }

  if (beginGameBtn) {
      beginGameBtn.addEventListener('click', function () {
          if (audioOn) playSound('tap');
          console.log('Begin to Game button clicked.');
          hideStageTransitionOverlay();
          showMenu();
          
          // Show Google Play Games prompt if user just completed stage 0
          if (lastAdvancedFromStageIndex === 0 && typeof showGooglePlayPrompt === 'function') {
              setTimeout(function() {
                  showGooglePlayPrompt();
              }, 300);
          }
          
          if (stagesBtn) stagesBtn.style.display = 'inline-flex';
          updateStagesBtnBadge();
      });
  }

  // Developer test helper: call this from the browser console to confirm the Begin flow.
  window.testBeginToGame = function() {
      const answer = prompt('Test Begin to Game flow. Type YES to continue or NO to cancel.');
      console.log('testBeginToGame prompt result:', answer);
      if (answer && answer.trim().toLowerCase() === 'yes') {
          if (beginGameBtn) {
              beginGameBtn.click();
          } else {
              console.warn('beginGameBtn is not available');
          }
      }
  };

  function renderStagesOverlay() {
      updateStageTaskValues();
      stageProgress.newTaskCount = 0;
      saveStageData();
      updateStagesBtnBadge();
      const currentStageIndex = stageProgress.currentStage;
      const currentStage = getCurrentStageDefinition();
      const nextStage = getNextStageDefinition();
      currentStageBadge.innerHTML = getStageBadgeMarkup(currentStageIndex);
      currentStageName.textContent = currentStage.name;

      // If current stage is True Pilot, we don't show the next-stage box and hide the main badge box
      if (currentStage.key === 'truePilot') {
          // Hide next-stage UI
          nextStageBadge.style.display = 'none';
          nextStageName.style.display = 'none';
          // Hide the whole next-stage card (box)
          try { const nextCard = nextStageBadge.closest('.stage-card'); if (nextCard) nextCard.style.display = 'none'; } catch(e){}
          // Hide the large badge box on the stages view as requested
          stageMainBadge.style.display = 'none';
      } else {
          // Normal rendering
          nextStageBadge.style.display = '';
          nextStageName.style.display = '';
          // Ensure next-stage card visible
          try { const nextCard = nextStageBadge.closest('.stage-card'); if (nextCard) nextCard.style.display = ''; } catch(e){}
          if (nextStage) {
              nextStageBadge.innerHTML = getStageBadgeMarkup(currentStageIndex + 1);
              nextStageName.textContent = nextStage.name;
          } else {
              nextStageBadge.innerHTML = getStageBadgeMarkup(stageDefinitions.length - 1);
              nextStageName.textContent = 'True Pilot';
          }
          stageMainBadge.style.display = '';
          stageMainBadge.innerHTML = getStageBadgeMarkup(currentStageIndex);
      }
      stageMainView.style.display = 'block';
      stagesAllView.classList.add('hidden');
      // Don't show 'See all stages' when player is already at True Pilot
      if (currentStage.key === 'truePilot') {
          if (seeAllStagesBtn) seeAllStagesBtn.style.display = 'none';
      } else {
          if (seeAllStagesBtn) seeAllStagesBtn.style.display = 'inline-flex';
      }
      
      renderStageTasks(currentStage, currentStageIndex);
  }

  function renderStageTasks(stageDef, stageIndex) {
      stagesTaskList.innerHTML = '';
      if (!stageDef.tasks.length) {
          const item = document.createElement('div');
          item.className = 'stage-task-item';
          item.innerHTML = '<div class="task-label">Final stage reached</div><div class="task-progress">No more tasks, you reach True Pilot.</div>';
          stagesTaskList.appendChild(item);
          return;
      }
      const stageState = stageProgress.stages[stageIndex] || { tasks: [] };
      stageDef.tasks.forEach((taskDef, index) => {
          const taskState = stageState.tasks[index] || { current: 0, complete: false };
          const targetValue = taskDef.type === 'unlockPlanets' ? countAvailablePlanets() : taskDef.target;
          const progressValue = targetValue > 0 ? Math.min(100, Math.floor((taskState.current / targetValue) * 100)) : (taskState.complete ? 100 : 0);
          let displayProgress = `${taskState.current}/${targetValue}`;
          if (taskDef.type === 'rewardWeek') {
              displayProgress = rewardWeekCompleted ? '1/1' : '0/1';
          }
          const statusText = taskState.complete ? '<span class="stage-task-complete">Completed</span>' : '<span class="stage-task-warning">In progress</span>';
          const item = document.createElement('div');
          item.className = 'stage-task-item';
          item.innerHTML = `
              <div class="task-label"><span class="stage-task-number">${index < 9 ? index + 1 : '9+'}</span>${taskDef.label}</div>
              <div class="task-progress">${displayProgress} ${statusText}</div>
              <div class="progress-bar"><div class="progress-fill" style="width:${progressValue}%;"></div></div>
          `;
          stagesTaskList.appendChild(item);
      });
  }

  function animateJourneyBoardProgress(oldProgress, newProgress) {
      const stageDef = getCurrentStageDefinition();
      if (!stageDef) return;

      // Get old and new values for stars and matches
      const oldStars = oldProgress.totalStars || 0;
      const newStars = newProgress.totalStars || 0;
      const oldMatches = oldProgress.totalMatches || 0;
      const newMatches = newProgress.totalMatches || 0;

      // Calculate max increments
      const starsDiff = newStars - oldStars;
      const matchesDiff = newMatches - oldMatches;
      const maxIncrements = Math.max(starsDiff, matchesDiff);

      if (maxIncrements <= 0) {
          // No progress, just render final state
          renderJourneyTasksWithValues(stageDef, newProgress.currentStage, newStars, newMatches);
          if (journeyProgressFill) {
              const newPercent = getTaskProgressPercentage();
              journeyProgressFill.style.width = `${newPercent}%`;
          }
          lastRenderedProgress = JSON.parse(JSON.stringify(newProgress));
          return;
      }

      // Set initial display to old values
      renderJourneyTasksWithValues(stageDef, oldProgress.currentStage, oldStars, oldMatches);

      // Set progress bar to old percentage
      if (journeyProgressFill) {
          const oldPercent = calculateSnapshotJourneyProgress(oldProgress);
          journeyProgressFill.style.width = `${oldPercent}%`;
      }

      let currentStars = oldStars;
      let currentMatches = oldMatches;
      let increment = 0;

      const tickInterval = setInterval(() => {
          increment++;
          const shouldIncrementStars = increment <= starsDiff;
          const shouldIncrementMatches = increment <= matchesDiff;

          if (shouldIncrementStars) {
              currentStars++;
              playSound('point');
          }
          if (shouldIncrementMatches) {
              currentMatches++;
              playSound('point');
          }

          // Update display
          updateJourneyTaskDisplays(currentStars, currentMatches);

          if (increment >= maxIncrements) {
              clearInterval(tickInterval);
              // Set progress bar to new percentage after 100ms
              setTimeout(() => {
                  if (journeyProgressFill) {
                      const newPercent = getTaskProgressPercentage();
                      journeyProgressFill.style.width = `${newPercent}%`;
                  }
              }, 100);
              // Update lastRenderedProgress
              lastRenderedProgress = JSON.parse(JSON.stringify(newProgress));
              lastRenderedProgress.totalStars = newStars;
              lastRenderedProgress.totalMatches = newMatches;
          }
      }, 200); // 200ms per tick
  }

  function renderJourneyBoard(shouldAnimate = false, state = stageProgress) {
      if (!state) return;
      const currentStageIndex = state.currentStage;
      const currentStage = stageDefinitions[currentStageIndex] || getCurrentStageDefinition();
      const nextStage = stageDefinitions[currentStageIndex + 1] || null;
      journeyCurrentStageBadge.innerHTML = getStageBadgeMarkup(currentStageIndex);
      journeyCurrentStageName.textContent = currentStage.name;

      // If current is True Pilot, only show current on journey board (hide next)
      if (currentStage.key === 'truePilot') {
          journeyNextStageBadge.innerHTML = '';
          journeyNextStageBadge.style.display = 'none';
          journeyNextStageName.textContent = '';
          journeyNextStageName.style.display = 'none';
          // Hide the entire next-stage pair and arrow
          try { const nextPair = journeyNextStageBadge.closest('.journeyStagePair'); if (nextPair) nextPair.style.display = 'none'; } catch(e){}
          try { const arrow = document.querySelector('#journeyBoard .journeyStageArrow'); if (arrow) arrow.style.display = 'none'; } catch(e){}
      } else {
          journeyNextStageBadge.style.display = '';
          journeyNextStageName.style.display = '';
          try { const nextPair = journeyNextStageBadge.closest('.journeyStagePair'); if (nextPair) nextPair.style.display = ''; } catch(e){}
          try { const arrow = document.querySelector('#journeyBoard .journeyStageArrow'); if (arrow) arrow.style.display = ''; } catch(e){}
          journeyNextStageBadge.innerHTML = getStageBadgeMarkup(currentStageIndex + 1 < stageDefinitions.length ? currentStageIndex + 1 : currentStageIndex);
          journeyNextStageName.textContent = nextStage ? nextStage.name : 'True Pilot';
      }

      if (shouldAnimate && oldJourneyStats) {
          const stageDef = currentStage;
          const stageState = state.stages[currentStageIndex] || { tasks: [] };
          const oldStageState = (oldJourneyStats.stages && oldJourneyStats.stages[currentStageIndex]) || { tasks: [] };
          renderJourneyTasksWithValues(currentStage, currentStageIndex, 0, 0);
          const taskItems = Array.from(document.querySelectorAll('#journeyTaskList .stage-task-item'));
          if (taskItems.length === 0) return;

          if (journeyProgressFill) {
              journeyProgressFill.style.width = '0%';
          }

          taskItems.forEach((item, index) => {
              const taskDef = stageDef.tasks[index];
              if (!taskDef) return;
              const targetValue = taskDef.type === 'unlockPlanets' ? countAvailablePlanets() : taskDef.target;
              const progress = item.querySelector('.task-progress');
              const progressFill = item.querySelector('.progress-fill');
              if (progress) {
                  progress.innerHTML = `0/${targetValue} <span class="stage-task-warning">In progress</span>`;
              }
              if (progressFill) {
                  progressFill.style.width = '0%';
              }
          });

          taskItems.forEach((item, index) => {
              const taskDef = stageDef.tasks[index];
              if (!taskDef) return;

              const newTaskState = stageState.tasks[index] || { current: 0, complete: false };
              const oldTaskState = oldStageState.tasks[index] || { current: 0, complete: false };
              const targetValue = taskDef.type === 'unlockPlanets' ? countAvailablePlanets() : taskDef.target;
              let newValue = Math.min(newTaskState.current || 0, targetValue);
              const wasAlreadyComplete = oldTaskState.complete;
              const isNowComplete = newTaskState.complete;
              if (isNowComplete && targetValue > 0) {
                  newValue = targetValue;
              }

              if (isNowComplete && wasAlreadyComplete) {
                  const progress = item.querySelector('.task-progress');
                  const progressFill = item.querySelector('.progress-fill');
                  if (progress) {
                      progress.innerHTML = `${targetValue}/${targetValue} <span class="stage-task-complete">Completed</span>`;
                  }
                  if (progressFill) {
                      progressFill.style.width = '100%';
                  }
                  return;
              }

              if (newValue <= 0) {
                  const progress = item.querySelector('.task-progress');
                  const progressFill = item.querySelector('.progress-fill');
                  if (progress) {
                      progress.innerHTML = `0/${targetValue} <span class="stage-task-warning">In progress</span>`;
                  }
                  if (progressFill) {
                      progressFill.style.width = '0%';
                  }
                  return;
              }

              const maxTicks = newValue > 6 ? 3 : newValue;
              const step = newValue > 6 ? Math.ceil(newValue / maxTicks) : 1;
              const intervalMs = newValue > 6 ? 333 : 150;

              let currentValue = 0;
              const incrementInterval = setInterval(() => {
                  currentValue = Math.min(currentValue + step, newValue);
                  playTaskTickSound();

                  const progress = item.querySelector('.task-progress');
                  const progressFill = item.querySelector('.progress-fill');
                  if (progress) {
                      const isComplete = currentValue >= targetValue;
                      progress.innerHTML = `${currentValue}/${targetValue} <span class="${isComplete ? 'stage-task-complete' : 'stage-task-warning'}">${isComplete ? 'Completed' : 'In progress'}</span>`;
                  }
                  if (progressFill) {
                      const percent = targetValue > 0 ? Math.min(100, Math.floor((currentValue / targetValue) * 100)) : (currentValue >= targetValue ? 100 : 0);
                      progressFill.style.width = percent + '%';
                  }

                  if (currentValue >= newValue) {
                      clearInterval(incrementInterval);
                      if (isNowComplete && !wasAlreadyComplete) {
                          playTaskCompleteSound();
                          animateTaskCompleteEffect(item);
                      }
                  }
              }, intervalMs);
          });

          requestAnimationFrame(() => {
              if (journeyProgressFill) {
                  const newPercent = getTaskProgressPercentage();
                  journeyProgressFill.style.width = `${newPercent}%`;
              }
          });
      } else {
          // Static render
          renderJourneyTasksWithValues(currentStage, currentStageIndex, state.totalStars || totalStars, state.totalMatches || totalMatches);
          if (journeyProgressFill) {
              const currentPercent = calculateSnapshotJourneyProgress(state);
              journeyProgressFill.style.width = `${currentPercent}%`;
          }
      }
  }

  function renderJourneyTasksWithValues(stageDef, stageIndex, displayStars, displayMatches) {
      journeyTaskList.innerHTML = '';
      if (!stageDef.tasks.length) {
          const item = document.createElement('div');
          item.className = 'stage-task-item';
          item.innerHTML = '<div class="task-label">Final stage reached</div><div class="task-progress">No more tasks, you reach True Pilot.</div>';
          journeyTaskList.appendChild(item);
          return;
      }
      
      stageDef.tasks.forEach((taskDef, index) => {
          let displayValue = 0;
          if (taskDef.type === 'stars') {
              displayValue = displayStars;
          } else if (taskDef.type === 'matches') {
              displayValue = displayMatches;
          } else if (taskDef.type === 'highScore') {
              displayValue = getDisplayHighScore();
          } else if (taskDef.type === 'unlockPlanets') {
              displayValue = countAvailablePlanets();
          } else if (taskDef.type === 'rewardWeek') {
              displayValue = rewardWeekCompleted ? 1 : 0;
          }

          const targetValue = taskDef.type === 'unlockPlanets' ? countAvailablePlanets() : taskDef.target;
          const isComplete = displayValue >= targetValue;
          const percent = targetValue > 0 ? Math.min(100, Math.floor((displayValue / targetValue) * 100)) : (isComplete ? 100 : 0);

          let displayProgress = `${displayValue}/${targetValue}`;
          if (taskDef.type === 'rewardWeek') {
              displayProgress = rewardWeekCompleted ? '1/1' : '0/1';
          }
          const statusText = isComplete ? '<span class="stage-task-complete">Completed</span>' : '<span class="stage-task-warning">In progress</span>';
          
          const item = document.createElement('div');
          item.className = 'stage-task-item';
          item.innerHTML = `
              <div class="task-label"><span class="stage-task-number">${index < 9 ? index + 1 : '9+'}</span>${taskDef.label}</div>
              <div class="task-progress">${displayProgress} ${statusText}</div>
              <div class="progress-bar"><div class="progress-fill"></div></div>
          `;
          journeyTaskList.appendChild(item);
          
          // Set width to current display value instantly (no animation for initial render)
          const progressFill = item.querySelector('.progress-fill');
          if (progressFill) {
              progressFill.style.width = percent + '%';
          }
      });
  }

  function renderJourneyTasks(stageDef, stageIndex) {
      journeyTaskList.innerHTML = '';
      if (!stageDef.tasks.length) {
          const item = document.createElement('div');
          item.className = 'stage-task-item';
          item.innerHTML = '<div class="task-label">Final stage reached</div><div class="task-progress">No more tasks, you reach True Pilot.</div>';
          journeyTaskList.appendChild(item);
          return;
      }
      const stageState = stageProgress.stages[stageIndex] || { tasks: [] };
      stageDef.tasks.forEach((taskDef, index) => {
          const taskState = stageState.tasks[index] || { current: 0, complete: false };
          const targetValue = taskDef.type === 'unlockPlanets' ? countAvailablePlanets() : taskDef.target;
          const progressValue = targetValue > 0 ? Math.min(100, Math.floor((taskState.current / targetValue) * 100)) : (taskState.complete ? 100 : 0);
          let displayProgress = `${taskState.current}/${targetValue}`;
          if (taskDef.type === 'rewardWeek') {
              displayProgress = rewardWeekCompleted ? '1/1' : '0/1';
          }
          const statusText = taskState.complete ? '<span class="stage-task-complete">Completed</span>' : '<span class="stage-task-warning">In progress</span>';
          const item = document.createElement('div');
          item.className = 'stage-task-item';
          item.innerHTML = `
              <div class="task-label"><span class="stage-task-number">${index < 9 ? index + 1 : '9+'}</span>${taskDef.label}</div>
              <div class="task-progress">${displayProgress} ${statusText}</div>
              <div class="progress-bar"><div class="progress-fill" style="width:${progressValue}%;"></div></div>
          `;
          journeyTaskList.appendChild(item);
      });
  }

  function initJourneyAudio() {
      if (journeyAudioContext || !(window.AudioContext || window.webkitAudioContext)) return;
      journeyAudioContext = new (window.AudioContext || window.webkitAudioContext)();
      journeyAudioContext.resume().catch(() => {});
  }

  function stopJourneySound() {
      if (journeyOscillator) {
          try { journeyOscillator.stop(); } catch (e) {}
          journeyOscillator.disconnect();
          journeyOscillator = null;
      }
      if (journeyGainNode) {
          journeyGainNode.disconnect();
          journeyGainNode = null;
      }
  }

  function playJourneyTone() {
      if (!audioOn) return;
      initJourneyAudio();
      if (!journeyAudioContext) return;
      stopJourneySound();
      journeyOscillator = journeyAudioContext.createOscillator();
      journeyGainNode = journeyAudioContext.createGain();
      journeyOscillator.type = 'square';
      const now = journeyAudioContext.currentTime;
      journeyOscillator.frequency.setValueAtTime(360, now);
      journeyOscillator.frequency.exponentialRampToValueAtTime(920, now + journeyAnimationDuration / 1000);
      journeyGainNode.gain.setValueAtTime(0.24, now);
      journeyGainNode.gain.exponentialRampToValueAtTime(0.001, now + journeyAnimationDuration / 1000);
      journeyOscillator.connect(journeyGainNode).connect(journeyAudioContext.destination);
      journeyOscillator.start(now);
  }

  function playTaskTickSound() {
      if (!audioOn || !(window.AudioContext || window.webkitAudioContext)) return;
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.08);
  }

  function playTaskCompleteSound() {
      if (!audioOn || !(window.AudioContext || window.webkitAudioContext)) return;
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(520, ctx.currentTime);
      gain.gain.setValueAtTime(0.16, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14);
      osc.connect(gain).connect(ctx.destinaadstion);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.14);
  }

  function animateTaskCompleteEffect(item) {
      item.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
      item.style.transform = 'scale(0.92)';
      item.style.boxShadow = '0 0 15px rgba(255, 215, 0, 0.6)';
      setTimeout(() => {
          item.style.transform = 'scale(1)';
          item.style.boxShadow = '0 0 0 rgba(255, 215, 0, 0)';
      }, 300);
  }

  function getTaskProgressPercentage() {
      if (!stageProgress || !stageDefinitions) return 0;
      const stageDef = stageDefinitions[stageProgress.currentStage];
      if (!stageDef || !stageDef.tasks.length) return 100;
      
      const stageState = stageProgress.stages[stageProgress.currentStage];
      let totalProgress = 0;
      
      stageDef.tasks.forEach((taskDef, index) => {
          const taskState = stageState?.tasks[index];
          if (!taskState) return;
          const targetValue = taskDef.type === 'unlockPlanets' ? countAvailablePlanets() : taskDef.target;
          if (targetValue > 0) {
              totalProgress += Math.min(100, Math.floor((taskState.current / targetValue) * 100));
          } else if (taskState.complete) {
              totalProgress += 100;
          }
      });
      
      return Math.floor(totalProgress / stageDef.tasks.length);
  }

  function updateJourneyProgressBar() {
      if (!journeyProgressFill) return;
      const progress = getTaskProgressPercentage();
      journeyProgressFill.style.width = `${progress}%`;
      playMassiveCounterSound();
  }

  function startJourneyBarAnimation() {
      // Don't animate bar, just set it to current task progress
      if (!journeyProgressFill) return;
      journeyProgressFill.style.width = '0%';
      isJourneyAnimationPlaying = false;
  }

  function stopJourneyBarAnimation(forceComplete = false) {
      if (!isJourneyAnimationPlaying) return;
      isJourneyAnimationPlaying = false;
      if (journeyAnimationRAF) {
          cancelAnimationFrame(journeyAnimationRAF);
          journeyAnimationRAF = null;
      }
      if (forceComplete && journeyProgressFill) {
          journeyProgressFill.style.width = '100%';
      }
      stopJourneySound();
  }

  function playMassiveCounterSound() {
      if (!audioOn) return;
      try {
          if (!journeyAudioContext || journeyAudioContext.state === 'closed') {
              journeyAudioContext = new (window.AudioContext || window.webkitAudioContext)();
          }
          journeyAudioContext.resume().catch(() => {});
          
          const now = journeyAudioContext.currentTime;
          const duration = 0.8;
          
          // Stop any existing oscillator
          if (journeyOscillator) {
              try { journeyOscillator.stop(); } catch (e) {}
              journeyOscillator.disconnect();
          }
          if (journeyGainNode) journeyGainNode.disconnect();
          
          journeyOscillator = journeyAudioContext.createOscillator();
          journeyGainNode = journeyAudioContext.createGain();
          
          journeyOscillator.type = 'sine';
          journeyOscillator.frequency.setValueAtTime(100, now);
          journeyOscillator.frequency.exponentialRampToValueAtTime(250, now + duration);
          
          journeyGainNode.gain.setValueAtTime(1.0, now);
          journeyGainNode.gain.exponentialRampToValueAtTime(0.08, now + duration);
          
          journeyOscillator.connect(journeyGainNode).connect(journeyAudioContext.destination);
          journeyOscillator.start(now);
          journeyOscillator.stop(now + duration);
      } catch (e) {
          console.log('Massive sound error:', e);
      }
  }

  function startCounterAnimation(fromScore, toScore, fromStars, toStars) {
      if (counterAnimationRAF) {
          cancelAnimationFrame(counterAnimationRAF);
      }
      
      const startTime = performance.now();
      const duration = 800;
      
      playMassiveCounterSound();
      
      function step(timestamp) {
          const elapsed = timestamp - startTime;
          const progress = Math.min(1, elapsed / duration);
          
          const currentScore = Math.floor(fromScore + (toScore - fromScore) * progress);
          const currentStars = Math.floor(fromStars + (toStars - fromStars) * progress);
          
          finalScore.textContent = currentScore;
          
          if (progress < 1) {
              counterAnimationRAF = requestAnimationFrame(step);
          } else {
              finalScore.textContent = toScore;
              counterAnimationRAF = null;
          }
      }
      
      counterAnimationRAF = requestAnimationFrame(step);
  }

  function playStarPullSound() {
      if (!audioOn) return;
      try {
          if (!journeyAudioContext || journeyAudioContext.state === 'closed') {
              journeyAudioContext = new (window.AudioContext || window.webkitAudioContext)();
          }
          journeyAudioContext.resume().catch(() => {});
          
          const now = journeyAudioContext.currentTime;
          const duration = 1.2; // Slightly longer for pull effect
          
          // Stop any existing oscillators
          if (journeyOscillator) {
              try { journeyOscillator.stop(); } catch (e) {}
              journeyOscillator.disconnect();
          }
          if (journeyGainNode) journeyGainNode.disconnect();
          
          journeyOscillator = journeyAudioContext.createOscillator();
          journeyGainNode = journeyAudioContext.createGain();
          
          // Create a "pulling bar" sound - starts higher, descends like a ratchet
          journeyOscillator.type = 'square'; // Square wave for more distinctive sound
          journeyOscillator.frequency.setValueAtTime(400, now);
          journeyOscillator.frequency.exponentialRampToValueAtTime(150, now + duration * 0.7);
          journeyOscillator.frequency.setValueAtTime(150, now + duration * 0.7);
          journeyOscillator.frequency.exponentialRampToValueAtTime(80, now + duration);
          
          journeyGainNode.gain.setValueAtTime(0.5, now);
          journeyGainNode.gain.linearRampToValueAtTime(0.35, now + duration * 0.3);
          journeyGainNode.gain.linearRampToValueAtTime(0.5, now + duration * 0.6);
          journeyGainNode.gain.exponentialRampToValueAtTime(0.02, now + duration);
          
          journeyOscillator.connect(journeyGainNode).connect(journeyAudioContext.destination);
          journeyOscillator.start(now);
          journeyOscillator.stop(now + duration);
      } catch (e) {
          console.log('Star pull sound error:', e);
      }
  }

  let taskAnimationRAF = null;

  function animateJourneyTasks(oldState, newState, fromStars, toStars, fromMatches, toMatches) {
      if (!stageProgress) return;
      const stageIndex = newState?.currentStage ?? stageProgress.currentStage;
      const stageDef = stageDefinitions[stageIndex] || getCurrentStageDefinition();
      if (!stageDef) return;

      const progressBars = Array.from(document.querySelectorAll('#journeyTaskList .progress-fill'));
      const taskItems = Array.from(document.querySelectorAll('#journeyTaskList .stage-task-item'));
      if (progressBars.length === 0 || taskItems.length === 0) return;

      // Calculate differences for staggered animation
      const starsDiff = toStars - fromStars;
      const matchesDiff = toMatches - fromMatches;
      const totalIncrements = Math.max(starsDiff, matchesDiff);
      if (totalIncrements <= 0) {
          // No progress to animate, just update progress bar
          updateJourneyProgressBarAfterAnimation();
          return;
      }

      let currentStars = fromStars;
      let currentMatches = fromMatches;
      let incrementIndex = 0;

      // Update initial display
      updateTaskDisplay(currentStars, currentMatches);

      const animateStep = () => {
          incrementIndex++;
          const shouldIncrementStars = incrementIndex <= starsDiff;
          const shouldIncrementMatches = incrementIndex <= matchesDiff;

          if (shouldIncrementStars) {
              currentStars++;
              playSound('point');
          }
          if (shouldIncrementMatches) {
              currentMatches++;
              playSound('point');
          }

          // Update task display with new values
          updateTaskDisplay(currentStars, currentMatches);

          // Update progress bars
          updateProgressBars(currentStars, currentMatches, stageDef, progressBars);

          if (incrementIndex < totalIncrements) {
              setTimeout(animateStep, 300); // 300ms delay between increments
          } else {
              // Animation complete, update progress bar
              setTimeout(updateJourneyProgressBarAfterAnimation, 500);
          }
      };

      setTimeout(animateStep, 500); // Initial delay before starting animation
  }

  function updateProgressBars(currentStars, currentMatches, stageDef, progressBars) {
      progressBars.forEach((bar, index) => {
          const taskDef = stageDef.tasks[index];
          if (!taskDef) return;

          let displayValue = 0;
          if (taskDef.type === 'stars') {
              displayValue = currentStars;
          } else if (taskDef.type === 'matches') {
              displayValue = currentMatches;
          } else if (taskDef.type === 'highScore') {
              displayValue = getDisplayHighScore();
          } else if (taskDef.type === 'unlockPlanets') {
              displayValue = countAvailablePlanets();
          } else if (taskDef.type === 'rewardWeek') {
              displayValue = rewardWeekCompleted ? 1 : 0;
          }

          const targetValue = taskDef.type === 'unlockPlanets' ? countAvailablePlanets() : taskDef.target;
          const percent = targetValue > 0 ? Math.min(100, Math.floor((displayValue / targetValue) * 100)) : (displayValue >= targetValue ? 100 : 0);

          bar.style.width = percent + '%';
      });
  }

  function updateJourneyProgressBarAfterAnimation() {
      if (!journeyProgressFill) return;
      const progress = getTaskProgressPercentage();
      journeyProgressFill.style.width = `${progress}%`;
  }
  
  function updateJourneyTaskDisplays(displayStars, displayMatches) {
      const taskItems = Array.from(document.querySelectorAll('#journeyTaskList .stage-task-item'));
      const stageDef = getCurrentStageDefinition();
      if (!taskItems.length || !stageDef) return;

      taskItems.forEach((item, index) => {
          const taskDef = stageDef.tasks[index];
          if (!taskDef) return;

          const progress = item.querySelector('.task-progress');
          if (!progress) return;

          let displayValue = 0;
          if (taskDef.type === 'stars') {
              displayValue = displayStars;
          } else if (taskDef.type === 'matches') {
              displayValue = displayMatches;
          } else if (taskDef.type === 'highScore') {
              displayValue = getDisplayHighScore();
          } else if (taskDef.type === 'unlockPlanets') {
              displayValue = countAvailablePlanets();
          } else if (taskDef.type === 'rewardWeek') {
              displayValue = rewardWeekCompleted ? 1 : 0;
          }

          const targetValue = taskDef.type === 'unlockPlanets' ? countAvailablePlanets() : taskDef.target;
          const isComplete = displayValue >= targetValue;

          progress.innerHTML = `${displayValue}/${targetValue} <span class="${isComplete ? 'stage-task-complete' : 'stage-task-warning'}">${isComplete ? 'Completed' : 'In progress'}</span>`;

          // Update progress bar
          const progressFill = item.querySelector('.progress-fill');
          if (progressFill) {
              const percent = targetValue > 0 ? Math.min(100, Math.floor((displayValue / targetValue) * 100)) : (isComplete ? 100 : 0);
              progressFill.style.width = percent + '%';
          }
      });
  }

  function playNewHighScoreTone() {
      if (!audioOn) return;
      if (!window.newHighScoreAudioCtx) {
          window.newHighScoreAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = window.newHighScoreAudioCtx;
      const now = ctx.currentTime;
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.001, now);
      masterGain.gain.linearRampToValueAtTime(0.34, now + 0.02);
      masterGain.gain.exponentialRampToValueAtTime(0.001, now + 0.52);
      masterGain.connect(ctx.destination);

      const burstFrequencies = [920, 760, 1040];
      burstFrequencies.forEach((freq, index) => {
          const osc = ctx.createOscillator();
          osc.type = index === 1 ? 'triangle' : 'square';
          osc.frequency.setValueAtTime(freq, now + index * 0.04);
          osc.connect(masterGain);
          osc.start(now + index * 0.04);
          osc.stop(now + 0.38 + index * 0.04);
      });

      [220, 330, 420].forEach((freq, index) => {
          const popGain = ctx.createGain();
          popGain.gain.setValueAtTime(0.28, now + 0.14 + index * 0.04);
          popGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22 + index * 0.04);
          popGain.connect(ctx.destination);

          const popOsc = ctx.createOscillator();
          popOsc.type = 'sine';
          popOsc.frequency.setValueAtTime(freq, now + 0.14 + index * 0.04);
          popOsc.connect(popGain);
          popOsc.start(now + 0.14 + index * 0.04);
          popOsc.stop(now + 0.24 + index * 0.04);
      });
  }

  function getDisplayHighScore() {
      if (highScoreOverlayVisible && oldJourneyStats && typeof oldJourneyStats.high === 'number') {
          return oldJourneyStats.high;
      }
      return high;
  }

  function hideNewHighScoreOverlay() {
      if (!newHighScoreOverlay) return;
      highScoreOverlayVisible = false;
      newHighScoreOverlay.style.display = 'none';
      newHighScoreOverlay.classList.add('hidden');
      if (typeof newHighScoreCallback === 'function') {
          const cb = newHighScoreCallback;
          newHighScoreCallback = null;
          cb();
      }
  }

  function showNewHighScoreOverlay(scoreValue, callback) {
      highScoreOverlayVisible = true;
      if (!newHighScoreOverlay) {
          if (typeof callback === 'function') callback();
          return;
      }
      // Pause gameplay and music
      running = false;
      bgAudio.pause();
      if (sounds.menu) sounds.menu.pause();
      // Pause any other active sounds if needed
      Object.values(sounds).forEach(sound => {
          if (sound !== sounds.menu && sound !== bgAudio) {
              sound.pause();
          }
      });

      newHighScoreValue.textContent = scoreValue;
      newHighScoreText.textContent = 'New high score';
      newHighScoreSubtext.textContent = 'Tap to continue';
      newHighScoreCallback = callback;
      newHighScoreOverlay.style.display = 'flex';
      newHighScoreOverlay.classList.remove('hidden');
      if (audioOn) playNewHighScoreTone();
  }

  function maybeShowNewHighScoreThen(callback) {
      const shouldShow = score > high || newHighScorePending;
      if (shouldShow) {
          if (score > high) {
              high = score;
          }
          newHighScorePending = false;
          saveGameData();
          if (profileHighScore) profileHighScore.textContent = high;
          if (highScoreDisplay) highScoreDisplay.textContent = 'High Score: ' + high;
          showNewHighScoreOverlay(score, callback);
          return true;
      }
      return false;
  }

  function showGameOverScreen() {
      if (isFamilyForwardRunActive()) {
          const selectedPartyName = window.__selectedFamilyParty || '';
          const party = selectedPartyName ? getSavedParties().find(p => String(p.name || '').toLowerCase() === String(selectedPartyName).toLowerCase()) : null;
          if (party) {
              clearFamilyRoundOverlays();

              const partyScores = window.__familyPartyScores || {};
              if (!partyScores[String(party.name)]) {
                  partyScores[String(party.name)] = {};
              }
              const activePlayerNumber = Number(window.__familyCurrentPlayerNum || 1);
              let history = Array.isArray(partyScores[String(party.name)][activePlayerNumber]) ? partyScores[String(party.name)][activePlayerNumber] : [];

              // Check if this is a tiebreaker round (player already has 3 regular matches)
              const isTiebreakerRound = history.length >= 3;

              // Store the score, but mark tiebreaker scores separately
              const currentScore = Number(score || 0);
              
              // CRITICAL: Always push the score temporarily, but we'll handle tiebreaker separately
              history.push(currentScore);
              partyScores[String(party.name)][activePlayerNumber] = history;
              window.__familyPartyScores = partyScores;
              
              // If this is a tiebreaker round, store the tiebreaker points separately
              if (isTiebreakerRound) {
                  // Store the tiebreaker points in a separate variable for display purposes
                  // But DO NOT add them to the permanent total
                  if (!window.__familyTiebreakerPoints) {
                      window.__familyTiebreakerPoints = {};
                  }
                  if (!window.__familyTiebreakerPoints[String(party.name)]) {
                      window.__familyTiebreakerPoints[String(party.name)] = {};
                  }
                  // Store the tiebreaker points separately
                  window.__familyTiebreakerPoints[String(party.name)][activePlayerNumber] = {
                      points: currentScore,
                      matchIndex: history.length - 1
                  };
              }

              // After saving the player's score, if this is part of a tiebreaker, update rankings
              try {
                  if (window.__familyTiebreak && String(window.__familyTiebreak.partyName || '') === String(party.name || '')) {
                      setTimeout(() => { 
                          try { 
                              updateTiebreakerRanking(String(party.name), true); 
                          } catch (e) { 
                              console.warn('Failed updating tiebreak ranking after match', e); 
                          } 
                      }, 100);
                  }
              } catch (e) {}

              // If a tiebreak is in progress for this party, mark player's extra play and prompt next
              try {
                  const tiebreak = window.__familyTiebreak;
                  if (tiebreak && String(tiebreak.partyName || '') === String(party.name || '')) {
                      if (!tiebreak.played) tiebreak.played = {};
                      const baseCount = Number((tiebreak.baselineCounts && tiebreak.baselineCounts[activePlayerNumber]) || 0);
                      // Only mark as played if this was a tiebreaker round
                      if (isTiebreakerRound && Array.isArray(history) && history.length > baseCount) {
                          tiebreak.played[activePlayerNumber] = true;
                          // Store the tiebreaker score for ranking
                          if (!tiebreak.tiebreakerScores) tiebreak.tiebreakerScores = {};
                          tiebreak.tiebreakerScores[activePlayerNumber] = currentScore;
                      }
                      const allPlayed = (tiebreak.players || []).every(pn => !!tiebreak.played[Number(pn)]);
                      if (!allPlayed) {
                          const next = (tiebreak.players || []).find(pn => !tiebreak.played[Number(pn)]);
                          if (next !== undefined) {
                              const order = getFamilyTurnOrder(party) || [];
                              const nextIdx = order.indexOf(Number(next));
                              try { 
                                  showPartyReadyPrompt(String(party.name), { turnIndex: nextIdx, isTiebreaker: true }); 
                              } catch (e) { 
                                  console.warn('Failed showing next tiebreak prompt', e); 
                              }
                              return;
                          }
                      } else {
                          // All tied players have played their extra match — re-evaluate tie
                          try {
                              if (window.__familyTiebreak && String(window.__familyTiebreak.partyName || '') === String(party.name || '')) {
                                  window.__familyTiebreak.attempt = Number(window.__familyTiebreak.attempt || 1) + 1;
                              }
                              try {
                                  // Update tiebreaker ranking now that all tied players have played
                                  setTimeout(() => {
                                      try { 
                                          updateTiebreakerRanking(String(party.name), false); 
                                      } catch (e) { 
                                          console.warn('Failed to update tiebreak ranking', e); 
                                      }
                                  }, 100);
                              } catch (e) {}
                              handleFamilySessionComplete(party);
                          } catch (e) { 
                              console.warn('tiebreak re-eval failed', e); 
                          }
                          return;
                      }
                  }
              } catch (e) { 
                  console.warn('Error handling tiebreak progress', e); 
              }

              const order = getFamilyTurnOrder(party);
              // If every player has played 3 regular matches, end the family session
              const MAX_MATCHES_PER_PLAYER = 3;
              // Count only regular matches (max 3), not tiebreaker matches
              const allCompleted = order.length > 0 && order.every(pnum => {
                  const arr = partyScores[String(party.name)][pnum] || [];
                  // Count only regular matches (first 3)
                  const regularMatches = Math.min(arr.length, MAX_MATCHES_PER_PLAYER);
                  return regularMatches >= MAX_MATCHES_PER_PLAYER;
              });
              
              if (allCompleted) {
                  try { 
                      handleFamilySessionComplete(party); 
                  } catch (e) { 
                      console.warn('Failed to show family complete overlay', e); 
                  }
                  return;
              }
              
              const nextTurnIndex = order.length > 0 ? (Number(window.__familyPartyTurnIndex ?? 0) + 1) % order.length : 0;
              window.__familyPartyTurnIndex = nextTurnIndex;
              showPartyReadyPrompt(String(party.name), { turnIndex: nextTurnIndex });
              return;
          }

          gameOver.style.display = 'flex';
          gameOver.style.background = 'black';
          gameOver.style.color = '#fff';
          const gameOverContent = gameOver.querySelector('.gameOverContent');
          const journeyBoard = gameOver.querySelector('.journeyBoard');
          if (gameOverContent) gameOverContent.style.display = 'none';
          if (journeyBoard) journeyBoard.style.display = 'none';
          return;
      }

      finalScore.textContent = score;
      scorePanel.style.display = 'none';
      isOnDeathScreen = true;
      document.getElementById('pauseControl').style.display = 'none';

      // Clear any temporary in-progress save state created during the death animation.
      // This prevents a dead match from being offered as a resume/save state.
      if (savedGameState) {
          clearSavedGameState();
      }

      const continueToGameOver = () => {
          if (deathTypeLabel) {
              deathTypeLabel.textContent = deathTypeMessages[deathTypeCode] || deathTypeMessages['dead:067'];
          }
          gameOver.style.display = 'flex';
          renderJourneyBoard(false, oldJourneyStats);
          applyGameOverSettings();
          if (reviveButtonElement) {
              reviveButtonElement.style.display = showReviveButton ? '' : 'none';
              reviveButtonElement.classList.toggle('game-over-hidden', !showReviveButton);
          }
          startCounterAnimation(prevScore, score, prevTotalStars, totalStars);
          focusFirstVisibleButton();
      };

      if (maybeShowNewHighScoreThen(continueToGameOver)) {
          return;
      }

      continueToGameOver();
  }

  function showAllStagesView() {
      renderAllStagesView();
      stageMainView.style.display = 'none';
      stagesAllView.classList.remove('hidden');
  }

  function hideAllStagesView() {
      stageMainView.style.display = 'block';
      stagesAllView.classList.add('hidden');
  }

  function renderAllStagesView() {
      stagesAllList.innerHTML = '';
      stageDefinitions.forEach((stage, index) => {
          const stageState = stageProgress.stages[index] || { tasks: [] };
          const status = index < stageProgress.currentStage ? 'Unlocked' : index === stageProgress.currentStage ? 'Active' : 'Locked';
          const card = document.createElement('div');
          card.className = 'stage-all-card';
          const badge = getStageBadgeMarkup(index);
          const taskHtml = stage.tasks.length ? stage.tasks.map((taskDef, taskIndex) => {
              const taskState = stageState.tasks[taskIndex] || { current: 0, complete: false };
              const targetValue = taskDef.type === 'unlockPlanets' ? countAvailablePlanets() : taskDef.target;
              let displayProgress = `${taskState.current}/${targetValue}`;
              if (taskDef.type === 'rewardWeek') {
                  displayProgress = rewardWeekCompleted ? '1/1' : '0/1';
              }
              const badgeClass = taskState.complete ? 'stage-task-complete' : 'stage-task-warning';
              return `
                  <div class="stage-task-item">
                      <div class="task-label"><span class="stage-task-number">${taskIndex < 9 ? taskIndex + 1 : '9+'}</span>${taskDef.label}</div>
                      <div class="task-progress">${displayProgress} <span class="${badgeClass}">${taskState.complete ? 'Completed' : 'In progress'}</span></div>
                  </div>`;
          }).join('') : '<div class="stage-task-item"><div class="task-label">No tasks</div><div class="task-progress">This stage is the final pilot rank.</div></div>';
          card.innerHTML = `
              <div class="stage-header">
                  ${badge}
                  <h4>${stage.name}</h4>
                  <span class="stage-status">${status}</span>
              </div>
              <div class="stage-all-tasks">${taskHtml}</div>
          `;
          card.tabIndex = 0; // Make focusable for D-pad navigation
          stagesAllList.appendChild(card);
      });
  }

  let isFirstRun = false; // NEW: Tracks if this is the absolute first time playing (for tutorial skip)

  // NEW: Daily Reward data and state
  const dailyRewards = [
      {day: 1, type: 'planet', value: 'earth', amount: 1, icon: '🌎', name: 'Earth Planet'},
      {day: 2, type: 'stars', value: 20, amount: 20, icon: '⭐', name: '20 Stars'},
      {day: 3, type: 'stars', value: 50, amount: 50, icon: '⭐', name: '50 Stars'},
      {day: 4, type: 'stars', value: 75, amount: 75, icon: '⭐', name: '75 Stars'},
      {day: 5, type: 'stars', value: 100, amount: 100, icon: '⭐', name: '100 Stars'},
      {day: 6, type: 'stars', value: 150, amount: 150, icon: '⭐', name: '150 Stars'},
      {day: 7, type: 'mystery', value: '?', amount: 1, icon: '?', name: 'Mystery Item'}
  ];
  let lastRewardClaimTime = 0; // Timestamp of last reward claim
  let currentRewardDay = 1; // Current day in the 7-day cycle (1-7)
  let rewardWeekCompleted = false; // Whether the current week is completed

  // --- LOCAL STORAGE FUNCTIONS (existing) ---

  function saveGameData() {
      if (playerName && playerName !== 'null' && playerName !== 'undefined') {
          localStorage.setItem('solarFlyPlayerName', playerName);
      } else {
          localStorage.removeItem('solarFlyPlayerName');
      }
      player.planetKey = resolvePlanetKey(player.planetKey, 'earth');
      const selectedPlanet = planetData.find((planet) => planet.key === player.planetKey) || planetData[0];
      player.planetIcon = selectedPlanet.icon;
      menuPlayer.planetKey = player.planetKey;
      localStorage.setItem('solarFlyHigh', high);
      localStorage.setItem('solarFlyTotalStars', totalStars);
      localStorage.setItem('solarFlyTotalMatches', totalMatches);
      localStorage.setItem('solarFlyUnlockStatus', JSON.stringify(unlocked));
      localStorage.setItem('solarFlyKeyShown', JSON.stringify(keyShown));
      localStorage.setItem('solarFlyPlanetNew', JSON.stringify(planetNew));
      localStorage.setItem('solarFlyDifficulty', difficulty);
      localStorage.setItem('solarFlyPlanetKey', player.planetKey);
      localStorage.setItem('solarFlyAchievements', JSON.stringify(achievementStatus));
      localStorage.setItem('solarFlyAchievementNew', JSON.stringify(achievementNew));
      localStorage.setItem('solarFlyPendingPlayGamesAchievements', JSON.stringify(pendingPlayGamesAchievements));
      localStorage.setItem('solarFlyMeteorHunts', String(meteorhunts));
      localStorage.setItem('solarFlyUfoDefenders', String(ufoDefenders));
      if (stageProgress) {
          localStorage.setItem('solarFlyStageProgress', JSON.stringify(stageProgress));
      }
      localStorage.setItem('solarFlyIsFirstRun', isFirstRun ? 'true' : 'false'); // SAVE FIRST RUN
      localStorage.setItem('solarFlyLastRewardClaimTime', lastRewardClaimTime);
      localStorage.setItem('solarFlyCurrentRewardDay', currentRewardDay);
      localStorage.setItem('solarFlyRewardWeekCompleted', rewardWeekCompleted ? 'true' : 'false');
      // Persist tutorial state so we can resume if user closes/reopens mid-guide
      try {
          localStorage.setItem('solarFlyTutorial', JSON.stringify({ isTutorialMode: !!isTutorialMode, tutorialStep: tutorialStep || 0 }));
          localStorage.setItem('solarFlyIntroScreenIndex', currentIntroScreenIndex.toString());
          localStorage.setItem('solarFlyDirectToTutorialChoice', directToTutorialChoice ? 'true' : 'false');
      } catch (e) {
          console.warn('Failed to persist tutorial state:', e);
      }
  }

  // --- PROFILE FUNCTIONS ---

  function saveProfileData() {
      localStorage.setItem('solarFlyNickname', playerName || 'Anonymous');
      localStorage.setItem('solarFlyPlayerName', playerName || 'Anonymous');
  }

  function getAnalyticsDeviceId() {
      let deviceId = localStorage.getItem('solarFlyAnalyticsDeviceId');
      if (!deviceId) {
          if (window.crypto && typeof window.crypto.randomUUID === 'function') {
              deviceId = window.crypto.randomUUID();
          } else {
              deviceId = 'device-' + Date.now() + '-' + Math.random().toString(36).slice(2, 10);
          }
          localStorage.setItem('solarFlyAnalyticsDeviceId', deviceId);
      }
      return deviceId;
  }

  function getAnalyticsDate() {
      const now = new Date();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      return `${now.getFullYear()}-${month}-${day}`;
  }

  async function runAnalyticsTransaction(docRef, transactionCallback) {
      try {
          const { db, runTransaction } = window.firebase || {};
          if (!db || !runTransaction) return;
          await runTransaction(db, async tx => {
              const snapshot = await tx.get(docRef);
              const data = snapshot.exists() ? snapshot.data() : { count: 0, names: [], date: getAnalyticsDate() };
              const updated = transactionCallback(data);
              tx.set(docRef, { ...updated, date: getAnalyticsDate() });
          });
      } catch (error) {
          console.log('Firestore analytics transaction failed:', error);
      }
  }

  const ACTIVE_USER_TIMEOUT_MS = 30000;
  const ACTIVE_USER_HEARTBEAT_MS = 20000;
  let activeUserHeartbeatTimer = null;
  let activeUserCurrentName = '';

  async function updateNewUserStamp(name) {
      try {
          const firebase = window.firebase;
          if (!firebase || !firebase.db || !firebase.doc) return;
          const deviceId = getAnalyticsDeviceId();
          const newUserDoc = firebase.doc(firebase.db, 'adminAnalytics', 'New userd');
          await runAnalyticsTransaction(newUserDoc, data => {
              const entries = Array.isArray(data.names) ? [...data.names] : [];
              const index = entries.findIndex(item => item.deviceId === deviceId);
              const now = Date.now();
              if (index >= 0) {
                  entries[index] = { ...entries[index], name, lastUpdated: now };
              } else {
                  entries.push({ deviceId, name, firstSeen: getAnalyticsDate(), lastUpdated: now });
              }
              return {
                  count: entries.length,
                  names: entries
              };
          });
      } catch (error) {
          console.log('Firestore updateNewUserStamp failed:', error);
      }
  }

  function pruneStaleActiveEntries(entries) {
      const cutoff = Date.now() - ACTIVE_USER_TIMEOUT_MS;
      return entries.filter(item => item.lastActive && item.lastActive >= cutoff);
  }

  async function updateActiveUserStamp(name) {
      try {
          const firebase = window.firebase;
          if (!firebase || !firebase.db || !firebase.doc) return;
          const deviceId = getAnalyticsDeviceId();
          const activeUserDoc = firebase.doc(firebase.db, 'adminAnalytics', 'Active userd');
          await runAnalyticsTransaction(activeUserDoc, data => {
              const entries = Array.isArray(data.names) ? [...data.names] : [];
              const now = Date.now();
              const filtered = pruneStaleActiveEntries(entries);
              const index = filtered.findIndex(item => item.deviceId === deviceId);
              if (index >= 0) {
                  filtered[index] = { ...filtered[index], name, lastActive: now, lastUpdated: now };
              } else {
                  filtered.push({ deviceId, name, firstSeen: getAnalyticsDate(), lastActive: now, lastUpdated: now });
              }
              return {
                  count: filtered.length,
                  names: filtered
              };
          });
      } catch (error) {
          console.log('Firestore updateActiveUserStamp failed:', error);
      }
  }

  function stopActiveUserHeartbeat() {
      if (activeUserHeartbeatTimer) {
          clearInterval(activeUserHeartbeatTimer);
          activeUserHeartbeatTimer = null;
      }
  }

  function startActiveUserHeartbeat(name) {
      activeUserCurrentName = name;
      if (activeUserHeartbeatTimer) return;
      updateActiveUserStamp(name).catch(err => console.log('Firestore heartbeat failed:', err));
      activeUserHeartbeatTimer = setInterval(() => {
          if (activeUserCurrentName) {
              updateActiveUserStamp(activeUserCurrentName).catch(err => console.log('Firestore heartbeat failed:', err));
          }
      }, ACTIVE_USER_HEARTBEAT_MS);
  }

  async function recordUserAnalytics(name) {
      try {
          if (!name) return;
          const trimmed = name.trim();
          if (!trimmed) return;

          if (trimmed === 'Test') {
              console.log('recordUserAnalytics: skipping admin analytics for Test profile');
              return;
          }

          // If Firebase isn't yet attached to window, wait a short time for it.
          const fw = window.firebase;
          if (!fw || !fw.db || !fw.doc) {
              const ready = await waitForFirebaseReadyFlag(5000);
              if (!ready) {
                  console.log('recordUserAnalytics: Firebase not ready, skipping analytics');
                  return;
              }
          }

          const isFirstNewUser = localStorage.getItem('solarFlyNewUserRecorded') !== 'true';
          await updateNewUserStamp(trimmed);
          await updateActiveUserStamp(trimmed);
          startActiveUserHeartbeat(trimmed);
          if (isFirstNewUser) {
              localStorage.setItem('solarFlyNewUserRecorded', 'true');
          }
          localStorage.setItem('solarFlyNewUserName', trimmed);
      } catch (error) {
          console.log('Firestore recordUserAnalytics failed:', error);
      }
  }

  // Wait for Firebase objects to be available with a timeout.
  function waitForFirebaseReadyFlag(timeoutMs = 6000, intervalMs = 200) {
      const start = Date.now();
      return new Promise(resolve => {
          (function check() {
              const fw = window.firebase;
              if (fw && fw.db && fw.runTransaction && fw.doc) return resolve(true);
              if (Date.now() - start >= timeoutMs) return resolve(false);
              setTimeout(check, intervalMs);
          })();
      });
  }

  // Ensure analytics are sent on startup when network is available. If offline,
  // wait for the browser to go online and send once. This waits for Firebase
  // to be ready and retries a short while if necessary.
  async function ensureAnalyticsOnReady() {
      try {
          if (!playerName) return;

          const trySend = async () => {
              const ready = await waitForFirebaseReadyFlag();
              if (!ready) return false;
              try {
                  await recordUserAnalytics(playerName);
                  return true;
              } catch (e) {
                  console.log('ensureAnalyticsOnReady send failed:', e);
                  return false;
              }
          };

          if (navigator.onLine) {
              const sent = await trySend();
              if (!sent) {
                  // one more delayed attempt
                  setTimeout(() => { trySend(); }, 1000);
              }
          } else {
              const onOnline = async () => {
                  window.removeEventListener('online', onOnline);
                  await trySend();
              };
              window.addEventListener('online', onOnline);
          }
      } catch (e) {
          console.log('ensureAnalyticsOnReady error:', e);
      }
  }

  async function removeActiveUserRecord() {
      try {
          const firebase = window.firebase;
          if (!firebase || !firebase.db || !firebase.doc) return;
          const deviceId = getAnalyticsDeviceId();
          const activeUserDoc = firebase.doc(firebase.db, 'adminAnalytics', 'Active userd');
          await runAnalyticsTransaction(activeUserDoc, data => {
              const entries = Array.isArray(data.names) ? [...data.names] : [];
              const filtered = entries.filter(item => item.deviceId !== deviceId);
              return {
                  count: filtered.length,
                  names: filtered
              };
          });
      } catch (error) {
          console.log('Firestore removeActiveUserRecord failed:', error);
      }
  }

  function showDialog({ title = 'Notice', text = '', confirmText = 'OK', cancelText = 'Cancel', showCancel = true, onConfirm = null, onCancel = null }) {
      dialogTitle.textContent = title;
      dialogText.textContent = text;
      dialogConfirmBtn.textContent = confirmText;
      dialogCancelBtn.textContent = cancelText;
      dialogCancelBtn.style.display = showCancel ? 'inline-flex' : 'none';
      // Ensure dialog appears above any other overlay (party chooser etc.) by raising z-index
      try {
          if (dialogOverlay) {
              dialogOverlay.__prevZIndex = dialogOverlay.style.zIndex || window.getComputedStyle(dialogOverlay).zIndex || '';
              dialogOverlay.style.zIndex = '2147483647';
          }
      } catch (e) { }
      dialogOverlay.classList.remove('hidden');
      dialogConfirmBtn.onclick = () => {
          hideDialog();
          if (onConfirm) onConfirm();
      };
      dialogCancelBtn.onclick = () => {
          hideDialog();
          if (onCancel) onCancel();
      };
  }

  function hideDialog() {
      if (dialogOverlay) {
          dialogOverlay.classList.add('hidden');
          try {
              if (typeof dialogOverlay.__prevZIndex !== 'undefined') {
                  dialogOverlay.style.zIndex = dialogOverlay.__prevZIndex || '';
                  dialogOverlay.__prevZIndex = undefined;
              }
          } catch (e) {}
      }
      dialogConfirmBtn.onclick = null;
      dialogCancelBtn.onclick = null;
  }

  function showMessage(title, text) {
      showDialog({ title, text, confirmText: 'OK', showCancel: false });
  }

  const UPDATE_SKIP_KEY = 'solarFlyUpdateSkip';
  const RATING_SKIP_KEY = 'solarFlyRatingSkip';
  const RATING_COUNTER_KEY = 'solarFlyRatingCounter';
  const RATING_THRESHOLD = 15;
  let updateModalActive = false;
  let rateModalActive = false;

  function showUpdateModal(force = false) {
      if (!updateModal || updateModalActive) return;
      if (!force && localStorage.getItem(UPDATE_SKIP_KEY) === 'true') return;
      updateSkipCheckbox.checked = false;
      updateModal.classList.remove('hidden');
      updateModalActive = true;
  }

  function hideUpdateModal() {
      if (!updateModal) return;
      updateModal.classList.add('hidden');
      updateModalActive = false;
  }

  function setManualUpdateButtonVisible(visible) {
      updateAvailable = visible;
      if (!manualUpdateBtn) return;
      manualUpdateBtn.classList.toggle('hidden', !visible);
      if (visible && isAndroidDevice()) {
          addAndroidUpdateMessage();
      } else if (!visible) {
          removeAndroidUpdateMessage();
      }
  }

  function handleManualUpdateClick() {
      if (audioOn) playSound('tap');
      if (isAndroidDevice()) {
          requestAndroidUpdate();
          return;
      }
      if (updateAvailable) {
          showUpdateModal(true);
      } else {
          checkForUpdateIfNeeded();
      }
  }

  manualUpdateBtn?.addEventListener('click', handleManualUpdateClick);

  function handleUpdateYes() {
      if (audioOn) playSound('tap');
      if (updateSkipCheckbox.checked) {
          localStorage.setItem(UPDATE_SKIP_KEY, 'true');
      }
      hideUpdateModal();
      try {
          if (window.Android && typeof Android.requestAppUpdate === 'function') {
              const result = Android.requestAppUpdate();
              if (result === false || result === null || typeof result === 'undefined') {
                  showMessage('Error', '409: cant connect to the operating system');
              } else if (result && typeof result.then === 'function') {
                  result
                      .then(response => {
                          if (response === false || response === null || typeof response === 'undefined') {
                              showMessage('Error', '409: cant connect to the operating system');
                          }
                      })
                      .catch(err => {
                          console.error('Android update request promise failed:', err);
                          showMessage('Error', '409: cant connect to the operating system');
                      });
              }
          } else {
              showMessage('Error', '409: cant connect to the operating system');
          }
      } catch (e) {
          console.error('Failed to request app update:', e);
          showMessage('Error', '409: cant connect to the operating system');
      }
  }

  function handleUpdateNo() {
      if (audioOn) playSound('tap');
      if (updateSkipCheckbox.checked) {
          localStorage.setItem(UPDATE_SKIP_KEY, 'true');
      }
      hideUpdateModal();
  }

  function checkIfUserAlreadyRated() {
      try {
          if (isAndroidDevice() && window.Android && typeof Android.hasUserRated === 'function') {
              const result = Android.hasUserRated();
              if (result === true) {
                  console.log('User has already rated on Google Play Store');
                  localStorage.setItem(RATING_SKIP_KEY, 'true');
                  return true;
              }
          }
      } catch (e) {
          console.error('Failed to check if user rated:', e);
      }
      return false;
  }

  function showRateModal() {
      if (!rateModal || rateModalActive || updateModalActive) return;
      if (localStorage.getItem(RATING_SKIP_KEY) === 'true') return;
      // Prevent showing the rating prompt during active gameplay or while
      // the Family party chooser/ready overlays are visible.
      try {
          if (typeof running !== 'undefined' && running) return;
      } catch (e) {}
      if (document.getElementById('familyPartyChooserOverlay') || document.getElementById('familyPartyReadyOverlay')) return;
      // Check if user already rated on Google Play Store
      if (checkIfUserAlreadyRated()) return;
      // Only show the rate modal when the player is online. If offline,
      // defer showing until an "online" event fires.
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
          const showWhenOnline = function() {
              window.removeEventListener('online', showWhenOnline);
              showRateModal();
          };
          window.addEventListener('online', showWhenOnline);
          return;
      }
      rateSkipCheckbox.checked = false;
      rateModal.classList.remove('hidden');
      rateModalActive = true;
  }

  function hideRateModal() {
      if (!rateModal) return;
      rateModal.classList.add('hidden');
      rateModalActive = false;
  }

  function handleRateYes() {
      if (audioOn) playSound('tap');
      try {
          if (window.Android && typeof Android.requestRatingPrompt === 'function') {
              const success = Android.requestRatingPrompt();
              if (success) {
                  localStorage.setItem(RATING_SKIP_KEY, 'true');
                  if (window.Android && typeof Android.markGameRated === 'function') {
                      Android.markGameRated();
                  }
              } else {
                  showMessage('Error', '409: cant connect to the operating system');
              }
          } else {
              showMessage('Error', '409: cant connect to the operating system');
          }
      } catch (e) {
          console.error('Failed to request rating prompt:', e);
          showMessage('Error', '409: cant connect to the operating system');
      }
      hideRateModal();
  }

  function handleRateNo() {
      if (audioOn) playSound('tap');
      if (rateSkipCheckbox.checked) {
          localStorage.setItem(RATING_SKIP_KEY, 'true');
      }
      hideRateModal();
  }

  function getRatingCounter() {
      return parseInt(localStorage.getItem(RATING_COUNTER_KEY) || '0', 10) || 0;
  }

  function setRatingCounter(value) {
      localStorage.setItem(RATING_COUNTER_KEY, value.toString());
  }

  function incrementRatingMatchCounter() {
      if (localStorage.getItem(RATING_SKIP_KEY) === 'true') return;
      let count = getRatingCounter() + 1;
      if (count >= RATING_THRESHOLD) {
          count = 0;
          showRateModal();
      }
      setRatingCounter(count);
  }

  function checkForUpdateIfNeeded() {
      if (!window.Android || typeof Android.queryUpdateAvailability !== 'function') return;
      if (updateModalActive) return;
      if (localStorage.getItem(UPDATE_SKIP_KEY) === 'true') return;
      Android.queryUpdateAvailability();
  }

  let pendingShortcutLaunch = null;

  function runShortcutLaunch(shortcutId) {
      if (!shortcutId || typeof shortcutId !== 'string') return;

      // Block shortcuts during active gameplay, pause menu, or game over screen
      if (running || pauseMenu.style.display === 'flex' || (gameOver.style.display !== 'none' && gameOver.style.display !== '')) {
          console.warn('Shortcuts disabled during gameplay, pause, or game over screen');
          return;
      }

      const target = shortcutId.toLowerCase().trim();

      switch (target) {
          case 'planets':
              if (audioOn) playSound('tap');
              if (stagesBtn) stagesBtn.style.display = 'none';
              showMenu();
              showLoadingScreen(() => {
                  menu.style.display = 'none';
                  planetMenu.style.display = 'flex';
                  refreshPlanetGrid();
                  startMenuSpaceAnimation(planetMenu);
                  if (audioOn) {
                      ensureMenuMusicPlaying();
                  }
              });
              break;
          case 'achievements':
              if (audioOn) playSound('tap');
              if (stagesBtn) stagesBtn.style.display = 'none';
              showMenu();
              showLoadingScreen(() => {
                  menu.style.display = 'none';
                  achievementsMenu.style.display = 'flex';
                  refreshAchievementGrid();
                  startMenuSpaceAnimation(achievementsMenu);
                  if (audioOn) {
                      ensureMenuMusicPlaying();
                  }
              });
              break;
          case 'profile':
              showMenu();
              openProfileModal();
              break;
          case 'difficulty':
              if (audioOn) playSound('tap');
              if (stagesBtn) stagesBtn.style.display = 'none';
              showMenu();
              showLoadingScreen(() => {
                  menu.style.display='none';
                  difficultyMenu.style.display='flex';
                  applyDifficulty();
                  startMenuSpaceAnimation(difficultyMenu);
                  if (audioOn) {
                      ensureMenuMusicPlaying();
                  }
              });
              break;
          case 'stages':
              if (audioOn) playSound('tap');
              if (stagesBtn) stagesBtn.style.display = 'none';
              showMenu();
              showLoadingScreen(() => {
                  renderStagesOverlay();
                  stagesOverlay.style.display = 'flex';
                  if (audioOn) {
                      ensureMenuMusicPlaying();
                  }
              });
              break;
      }
  }

  function queueShortcutLaunch(shortcutId) {
      const target = shortcutId && typeof shortcutId === 'string' ? shortcutId.toLowerCase().trim() : '';
      if (!target) return;

      if (typeof showMenu === 'function' && typeof showLoadingScreen === 'function' && typeof openProfileModal === 'function') {
          runShortcutLaunch(target);
      } else {
          pendingShortcutLaunch = target;
      }
  }

  function flushPendingShortcutLaunch() {
      if (!pendingShortcutLaunch) return;
      const pending = pendingShortcutLaunch;
      pendingShortcutLaunch = null;
      runShortcutLaunch(pending);
  }

  window.handleShortcutLaunch = function(shortcutId) {
      queueShortcutLaunch(shortcutId);
  };

  const APP_VERSION_NAME = '1.02';

  function getAndroidVersionName() {
      try {
          if (!window.Android) return null;
          const candidates = ['getAppVersionName', 'getVersionName', 'getVersion', 'getAppVersion'];
          for (const candidate of candidates) {
              if (typeof window.Android[candidate] === 'function') {
                  const value = window.Android[candidate]();
                  if (value !== null && value !== undefined && value !== '') {
                      return String(value);
                  }
              }
          }
      } catch (e) {
          console.warn('Failed to read Android version name', e);
      }
      return null;
  }

  function parseVersionValue(value) {
      if (value === null || value === undefined || value === '') return null;
      const text = String(value).trim();
      const match = text.match(/(\d+(?:\.\d+)+)/);
      return match ? match[1] : text;
  }

  function normalizeVersion(value) {
      const parsed = parseVersionValue(value);
      if (!parsed) return null;
      const parts = String(parsed).split('.').map(part => parseInt(part, 10) || 0);
      while (parts.length < 3) parts.push(0);
      return parts.join('.');
  }

  function compareVersions(a, b) {
      const aParts = normalizeVersion(a)?.split('.').map(Number) || [0, 0, 0];
      const bParts = normalizeVersion(b)?.split('.').map(Number) || [0, 0, 0];
      const length = Math.max(aParts.length, bParts.length);
      for (let i = 0; i < length; i += 1) {
          const left = aParts[i] || 0;
          const right = bParts[i] || 0;
          if (left > right) return 1;
          if (left < right) return -1;
      }
      return 0;
  }

  function updateVersionStatus(isAvailable, versionCode, availableVersionName, installedVersionName) {
      if (currentVersionValue) {
          const isBrowserMode = !window.isAndroidDevice || !window.isAndroidDevice();
          currentVersionValue.textContent = isBrowserMode ? 'Browser version' : (installedVersionName || APP_VERSION_NAME);
      }
      if (!versionStatusText) return;

      const androidVersionName = getAndroidVersionName();
      const installedLabel = installedVersionName || androidVersionName || APP_VERSION_NAME;
      const availableLabel = availableVersionName || (versionCode !== null && versionCode !== undefined && versionCode !== '' ? String(versionCode) : APP_VERSION_NAME);

      if (isAvailable) {
          versionStatusText.textContent = `New version is available ${availableLabel}!`;
      } else if (window.isAndroidDevice && window.isAndroidDevice()) {
          const installedNormalized = normalizeVersion(installedLabel);
          const availableNormalized = normalizeVersion(availableLabel);
          const isExactMatch = installedNormalized && availableNormalized && compareVersions(installedNormalized, availableNormalized) === 0;
          if (isExactMatch) {
              versionStatusText.textContent = `Current version ${installedLabel}. That is up to date already!`;
          } else {
              versionStatusText.textContent = `Current version ${installedLabel}. That is up to date already!`;
          }
      } else {
          versionStatusText.textContent = 'Using Browser and up to date';
      }
  }

  window.handleUpdateAvailability = function(isAvailable, versionCode, availableVersionName, installedVersionName) {
      setManualUpdateButtonVisible(!!isAvailable);
      updateVersionStatus(!!isAvailable, versionCode, availableVersionName, installedVersionName);
      if (!isAvailable) {
          removeAndroidUpdateMessage();
      }
  };

  updateYesBtn?.addEventListener('click', handleUpdateYes);
  updateNoBtn?.addEventListener('click', handleUpdateNo);
  rateYesBtn?.addEventListener('click', handleRateYes);
  rateNoBtn?.addEventListener('click', handleRateNo);

  updateVersionStatus(false, null, null, APP_VERSION_NAME);
  if (window.isAndroidDevice && window.isAndroidDevice()) {
      checkForUpdateIfNeeded();
  }

  document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
          checkForUpdateIfNeeded();
      }
  });

  function pauseMenuAndBgMusic() {
      bgAudio.pause();
      sounds.menu.pause();
  }

  function resetAppliedSettings() {
      [
          'solarFlyAudioSettings',
          'solarFlyGameMode',
          'solarFlyGameplayControls',
          'add-ons'
      ].forEach(key => localStorage.removeItem(key));

      audioOn = true;
      bgMusicEnabled = true;
      sfxEnabled = true;
      masterVolume = 1.0;
      showJourneyBoard = true;
      showReviveButton = true;
      showAddOns = false;
      gameMode = 'classic';
      gameplayControls = 'touch';

      if (typeof updateSettingsUI === 'function') {
          updateSettingsUI();
      }
      if (typeof updateGameModeControls === 'function') {
          updateGameModeControls();
      }
  }

  function performFactoryReset() {
      resetAppliedSettings();

      [
          'solarFlyPlayerName',
          'solarFlyNickname',
          'solarFlyProfilePhoto',
          'solarFlyHigh',
          'solarFlyTotalStars',
          'solarFlyTotalMatches',
          'solarFlyUnlockStatus',
          'solarFlyKeyShown',
          'solarFlyPlanetNew',
          'solarFlyDifficulty',
          'solarFlyPlanetKey',
          'solarFlyAchievements',
          'solarFlyAchievementNew',
          'solarFlyMeteorHunts',
          'solarFlyUfoDefenders',
          'solarFlyIsFirstRun',
          'solarFlyLastRewardClaimTime',
          'solarFlyCurrentRewardDay',
          'solarFlyRewardWeekCompleted',
          'solarFlyStageProgress',
          'solarFlySavedState',
          'solarFlyMessages',
          'deletedMessages',
          'unreadMessages',
          'gpConnectMessageShown',
          'socialInviteMessageShown',
          'rateUsMessageShown',
          'truePilotMessageShown',
          'familyParties'
      ].forEach(key => localStorage.removeItem(key));

      messageData = [];
      deletedMessages.clear();
      unreadMessages.clear();
      notificationPageState = { currentPage: 0, totalPages: 0 };
      saveMessageData();
      updateBadgeCounter();

      playerName = null;
      stageProgress = createDefaultStageProgress();
      saveStageData();
      high = 0;
      totalStars = 0;
      totalMatches = 0;
      isFirstRun = true;
      difficulty = 'easy';
      player.planetKey = 'earth';
      player.planetIcon = '🌎';
      unlocked = planetData.map((p, i) => i === 0);
      keyShown = planetData.map((p, i) => i === 0);
      planetNew = planetData.map(() => false);
      achievements.forEach(a => achievementStatus[a.key] = false);
      achievements.forEach(a => achievementNew[a.key] = false);
      meteorhunts = 0;
      ufoDefenders = 0;
      lastRewardClaimTime = 0;
      currentRewardDay = 1;
      rewardWeekCompleted = false;

      updateProfileDisplay();
      setAvatarImage(null);
      saveGameData();
      saveProfileData();

      hideAllScreens();
      editNicknameModal.classList.remove('show');
      gameWrap.style.display = 'none';
      splash1.style.display = 'flex';
      pauseMenuAndBgMusic();
  }

  function factoryReset() {
      showDialog({
          title: 'Reset Factory',
          text: 'Reset all game data and restart from the beginning?',
          confirmText: 'Reset',
          cancelText: 'Cancel',
          onConfirm: performFactoryReset
      });
  }

  function loadProfileData() {
      const savedNickname = localStorage.getItem('solarFlyNickname');
      const savedPhoto = localStorage.getItem('solarFlyProfilePhoto');
      const validSavedNickname = savedNickname && savedNickname !== 'null' && savedNickname !== 'undefined' && savedNickname !== 'Anonymous'
          ? savedNickname
          : null;

      if (validSavedNickname) {
          playerName = validSavedNickname;
      }
      
      updateProfileDisplay();
      setAvatarImage(savedPhoto || null);
      setProfileModalAvatarImage(savedPhoto || null);
      if (playerName) {
          ensureAnalyticsOnReady();
      }
  }

  function setAvatarImage(photoData) {
      const placeholder = avatarDisplay.querySelector('.avatar-placeholder');
      if (photoData) {
          avatarDisplay.style.backgroundImage = `url('${photoData}')`;
          if (placeholder) placeholder.style.display = 'none';
      } else {
          avatarDisplay.style.backgroundImage = 'none';
          if (placeholder) placeholder.style.display = 'block';
      }
      setProfileModalAvatarImage(photoData);
  }

  function setProfileModalAvatarImage(photoData) {
      const placeholder = profileAvatarPreview.querySelector('.avatar-placeholder');
      if (photoData) {
          profileAvatarPreview.style.backgroundImage = `url('${photoData}')`;
          if (placeholder) placeholder.style.display = 'none';
      } else {
          profileAvatarPreview.style.backgroundImage = 'none';
          if (placeholder) placeholder.style.display = 'block';
      }
  }

  function getTotalMatches() {
      return parseInt(localStorage.getItem('solarFlyTotalMatches') || '0', 10) || 0;
  }

  function setTotalMatches(value) {
      totalMatches = value;
      localStorage.setItem('solarFlyTotalMatches', value.toString());
  }

  function incrementTotalMatches() {
      setTotalMatches(getTotalMatches() + 1);
  }

  function countPlanetsUnlocked() {
      return unlocked.filter(Boolean).length;
  }

  function countAvailablePlanets() {
      return planetData.filter(p => p.unlock < 9999).length;
  }

  function countAchievementsComplete() {
      return achievements.filter(a => achievementStatus[a.key]).length;
  }

  function applyPlanetUnlocksForScore(scoreValue = score, options = {}) {
      const baseScore = Number.isFinite(scoreValue) ? scoreValue : 0;
      const shouldShowKeyPopup = options.showKeyPopup !== false;
      const shouldSetPending = options.shouldSetPending !== false;

      let newHigh = false;
      if (baseScore > high) {
          high = baseScore;
          newHigh = true;
          if (shouldSetPending) {
              newHighScorePending = true;
          }
      }

      let unlockedAny = false;
      planetData.forEach((planet, index) => {
          if (high >= planet.unlock) {
              if (!unlocked[index]) {
                  unlocked[index] = true;
                  planetNew[index] = true;
                  unlockedAny = true;
              }
              if (unlocked[index] && !keyShown[index]) {
                  if (shouldShowKeyPopup && !isTutorialMode) {
                      showKeyUnlockPopup();
                  }
                  keyShown[index] = true;
              }
          }
      });

      if (newHigh || unlockedAny) {
          saveGameData();
          if (typeof refreshPlanetGrid === 'function') refreshPlanetGrid();
          if (typeof updateProfileDisplay === 'function') updateProfileDisplay();
          if (typeof updateMenuButtons === 'function') updateMenuButtons();
      }

      return { newHigh, unlockedAny };
  }

  const COUNTRY_NAME_MAP = {
      US: 'United States', GB: 'United Kingdom', CA: 'Canada', AU: 'Australia', DE: 'Germany', FR: 'France', ES: 'Spain', IT: 'Italy', JP: 'Japan', CN: 'China', IN: 'India', BR: 'Brazil', MX: 'Mexico', RU: 'Russia', KR: 'South Korea', ZA: 'South Africa', NL: 'Netherlands', SE: 'Sweden', NO: 'Norway', DK: 'Denmark', FI: 'Finland', NZ: 'New Zealand', SG: 'Singapore', AE: 'United Arab Emirates', SA: 'Saudi Arabia', AR: 'Argentina', CL: 'Chile', TR: 'Turkey', BE: 'Belgium', CH: 'Switzerland', AT: 'Austria', IE: 'Ireland', PT: 'Portugal', GR: 'Greece', PL: 'Poland', CZ: 'Czech Republic', HU: 'Hungary', RO: 'Romania', IL: 'Israel', EG: 'Egypt', NG: 'Nigeria', KE: 'Kenya', PK: 'Pakistan', BD: 'Bangladesh', ID: 'Indonesia', TH: 'Thailand', MY: 'Malaysia', PH: 'Philippines', VN: 'Vietnam', KZ: 'Kazakhstan', UA: 'Ukraine', CO: 'Colombia', PE: 'Peru', HR: 'Croatia', SK: 'Slovakia', SI: 'Slovenia', BG: 'Bulgaria', LT: 'Lithuania', LV: 'Latvia', EE: 'Estonia', IS: 'Iceland', LU: 'Luxembourg', MT: 'Malta', CY: 'Cyprus'
  };

    // Full ISO-3166-1 alpha-2 country code list to generate explicit flag map
    const ALL_COUNTRY_CODES = [
        'AF','AX','AL','DZ','AS','AD','AO','AI','AQ','AG','AR','AM','AW','AU','AT','AZ',
        'BS','BH','BD','BB','BY','BE','BZ','BJ','BM','BT','BO','BQ','BA','BW','BV','BR',
        'IO','BN','BG','BF','BI','CV','KH','CM','CA','KY','CF','TD','CL','CN','CX','CC',
        'CO','KM','CG','CD','CK','CR','CI','HR','CU','CW','CY','CZ','DK','DJ','DM','DO',
        'EC','EG','SV','GQ','ER','EE','ET','FK','FO','FJ','FI','FR','GF','PF','TF','GA',
        'GM','GE','DE','GH','GI','GR','GL','GD','GP','GU','GT','GG','GN','GW','GY','HT',
        'HM','VA','HN','HK','HU','IS','IN','ID','IR','IQ','IE','IM','IL','IT','JM','JP',
        'JE','JO','KZ','KE','KI','KP','KR','KW','KG','LA','LV','LB','LS','LR','LY','LI',
        'LT','LU','MO','MK','MG','MW','MY','MV','ML','MT','MH','MQ','MR','MU','YT','MX',
        'FM','MD','MC','MN','ME','MS','MA','MZ','MM','NA','NR','NP','NL','NC','NZ','NI',
        'NE','NG','NU','NF','MP','NO','OM','PK','PW','PS','PA','PG','PY','PE','PH','PN',
        'PL','PT','PR','QA','RE','RO','RU','RW','BL','SH','KN','LC','MF','PM','VC','WS',
        'SM','ST','SA','SN','RS','SC','SL','SG','SX','SK','SI','SB','SO','ZA','GS','SS',
        'ES','LK','SD','SR','SJ','SE','CH','SY','TW','TJ','TZ','TH','TL','TG','TK','TO',
        'TT','TN','TR','TM','TC','TV','UG','UA','AE','GB','US','UM','UY','UZ','VU','VE',
        'VN','VG','VI','WF','EH','YE','ZM','ZW'
    ];

    const COUNTRY_FLAG_MAP = {};
    ALL_COUNTRY_CODES.forEach(code => {
        COUNTRY_FLAG_MAP[code] = code.split('').map(ch => String.fromCodePoint(127397 + ch.charCodeAt(0))).join('');
    });

  let countryInfoCache = null;

  function getFlagEmoji(regionCode) {
      if (!regionCode || regionCode.length !== 2) {
          return '🚫';
      }
      const code = regionCode.toUpperCase();
      if (COUNTRY_FLAG_MAP[code]) return COUNTRY_FLAG_MAP[code];
      return code.split('').map(char => String.fromCodePoint(127397 + char.charCodeAt(0))).join('');
  }

  function getStoredCountryInfo() {
      try {
          const raw = localStorage.getItem('solarFlyCountryInfo');
          if (!raw) return null;
          const parsed = JSON.parse(raw);
          if (!parsed || !parsed.code || !parsed.name) return null;
          let flag = parsed.flag;
          const isAsciiLetters = typeof flag === 'string' && flag.length === 2 && /[A-Z]{2}/i.test(flag);
          if (!flag || isAsciiLetters) {
              flag = getFlagEmoji(parsed.code);
          }
          return {
              code: parsed.code,
              name: parsed.name,
              flag,
              imageData: parsed.imageData || null
          };
      } catch (e) {
          return null;
      }
  }

  function saveCountryInfo(info) {
      try {
          const saved = {
              code: info.code,
              name: info.name,
              flag: info.flag
          };
          if (info.imageData) {
              saved.imageData = info.imageData;
          }
          localStorage.setItem('solarFlyCountryInfo', JSON.stringify(saved));
      } catch (e) {
          console.warn('Failed to save country info', e);
      }
  }

  function getCountryFlagImageUrl(code) {
      if (!code || code.length !== 2) return null;
      return `https://flagcdn.com/w320/${code.toLowerCase()}.png`;
  }

  async function fetchFlagImageDataUrl(code) {
      const url = getCountryFlagImageUrl(code);
      if (!url) return null;
      try {
          const response = await fetch(url, { cache: 'default' });
          if (!response.ok) return null;
          const blob = await response.blob();
          return await new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result);
              reader.onerror = reject;
              reader.readAsDataURL(blob);
          });
      } catch (e) {
          return null;
      }
  }

  async function ensureCountryFlagImage(info) {
      if (!info || !info.code) return info;
      if (info.imageData) return info;
      const stored = getStoredCountryInfo();
      if (stored && stored.code === info.code && stored.imageData) {
          info.imageData = stored.imageData;
          return info;
      }
      if (!navigator.onLine) return info;
      const imageData = await fetchFlagImageDataUrl(info.code);
      if (imageData) {
          info.imageData = imageData;
          saveCountryInfo(info);
      }
      return info;
  }

  function getLocaleCountryInfo() {
      const locale = (navigator.languages && navigator.languages[0]) || navigator.language || '';
      const match = locale.match(/-([A-Za-z]{2})$/) || locale.match(/_([A-Za-z]{2})$/);
      const code = match ? match[1].toUpperCase() : '';
      if (!code) {
          return null;
      }
      return {
          code,
          name: COUNTRY_NAME_MAP[code] || code,
          flag: getFlagEmoji(code)
      };
  }

  async function fetchCountryInfoFromIP() {
      const endpoints = [
          'https://ipinfo.io/json',
          'https://ipapi.co/json/',
          'https://ipwho.is/'
      ];

      for (const url of endpoints) {
          try {
              const response = await fetch(url, { cache: 'no-store' });
              if (!response.ok) {
                  continue;
              }
              const data = await response.json();
              const code = (data.country || data.country_code || data.country_code2 || data.country_code_iso2 || '').toUpperCase();
              let name = data.country_name || data.country_name_long || '';
              if (!name && data.country && data.country.length !== 2) {
                  name = data.country;
              }
              if (!code || code.length !== 2) {
                  continue;
              }
              if (!name || name.toUpperCase() === code) {
                  name = COUNTRY_NAME_MAP[code] || code;
              }
              return {
                  code,
                  name,
                  flag: getFlagEmoji(code)
              };
          } catch (e) {
              // try next endpoint
          }
      }
      throw new Error('Unable to fetch country from IP');
  }

  function setCountryFlagIcon(info) {
      if (!profileCountryFlag) return;
      profileCountryFlag.innerHTML = '';
      if (info && info.imageData) {
          const img = document.createElement('img');
          img.src = info.imageData;
          img.alt = info.code || 'flag';
          img.className = 'country-flag-img';
          profileCountryFlag.appendChild(img);
          return;
      }
      profileCountryFlag.textContent = info && info.flag ? info.flag : '🚫';
  }

  function updateCountryDisplay() {
      const info = countryInfoCache || getStoredCountryInfo();
      if (info && info.name && info.name !== 'No Internet') {
          if (profileCountryLabel) profileCountryLabel.textContent = info.name;
          setCountryFlagIcon(info);
          return;
      }
      if (profileCountryLabel) profileCountryLabel.textContent = 'No Internet';
      if (profileCountryFlag) profileCountryFlag.textContent = '🚫';
  }

  async function initializeCountryInfo() {
      const stored = getStoredCountryInfo();
      if (navigator.onLine === false) {
          if (stored) {
              countryInfoCache = stored;
              await ensureCountryFlagImage(countryInfoCache);
              updateCountryDisplay();
              return;
          }
          countryInfoCache = { code: '', name: 'No Internet', flag: '🚫' };
          updateCountryDisplay();
          return;
      }

      if (stored) {
          // Ensure stored data is sanitized (flag as emoji, not raw code)
          try {
              if (stored.code && (!stored.flag || (typeof stored.flag === 'string' && /^[A-Za-z]{2}$/.test(stored.flag)))) {
                  stored.flag = getFlagEmoji(stored.code);
                  saveCountryInfo(stored);
              }
          } catch (e) {
              // ignore sanitize errors
          }
          countryInfoCache = stored;
          await ensureCountryFlagImage(countryInfoCache);
          updateCountryDisplay();
      }

      try {
          const fetched = await fetchCountryInfoFromIP();
          countryInfoCache = fetched;
          await ensureCountryFlagImage(countryInfoCache);
          saveCountryInfo(countryInfoCache);
          updateCountryDisplay();
          return;
      } catch (e) {
          if (!stored) {
              countryInfoCache = { code: '', name: 'No Internet', flag: '🚫' };
              updateCountryDisplay();
          }
      }
  }

  function refreshProfileModalStats() {
      profileTotalMatchesDisplay.textContent = totalMatches;
    try { profileTotalStarsDisplay.textContent = (typeof getAdminInfinity === 'function' && getAdminInfinity() === 'yes') ? '∞' : String(totalStars); } catch (e) { profileTotalStarsDisplay.textContent = String(totalStars); }
      profilePlanetsUnlockedCount.textContent = countPlanetsUnlocked();
      profilePlanetsTotalCount.textContent = countAvailablePlanets();
      profileAchievementsComplete.textContent = countAchievementsComplete();
      profileAchievementsTotal.textContent = achievements.length;
      profileHighScore.textContent = high;

      updateCountryDisplay();
      updateProfileOperatingSystemDisplay();

      modalNicknameText.textContent = playerName || 'Anonymous';
      updateProfileStageDisplay();
  }

  function updateProfileDisplay() {
      const displayName = playerName || 'Anonymous';
      profileNicknameDisplay.textContent = displayName;
      nicknameInput.value = displayName;
      if (profileNameDisplay) {
          profileNameDisplay.textContent = 'Pilot: ' + (playerName || 'N/A');
      }
      refreshProfileModalStats();
  }

  function openProfileModal() {
      refreshProfileModalStats();
      profileAdvancedPanel?.classList.add('hidden');
      profileModalTop.style.display = 'flex';
      profileStats.style.display = 'flex';
      document.getElementById('profileMainSection').style.display = 'flex';
      showLoadingScreen(() => {
          editNicknameModal.classList.add('show');
          nicknameInput.focus();
      });
      if (audioOn) playSound('tap');
  }

  // Profile card click opens full-screen profile modal with splash loading transition
  profileCard.onclick = (e) => {
      openProfileModal();
  };

  initializeCountryInfo();

  function parseAndroidBoolean(value) {
      return value === true || value === 'true';
  }

  function applyPlayGamesAvatar(element, avatarUrl) {
      if (!element) return;
      const cleanUrl = (avatarUrl || '').trim();
      const placeholder = element.querySelector('.avatar-placeholder');
      const hasValidImage = cleanUrl && cleanUrl !== 'null' && cleanUrl !== 'undefined';

      if (hasValidImage) {
          const safeUrl = cleanUrl.replace(/"/g, '%22').replace(/'/g, '%27');
          element.style.backgroundImage = `url("${safeUrl}")`;
          element.style.backgroundSize = 'cover';
          element.style.backgroundPosition = 'center';
          element.style.backgroundRepeat = 'no-repeat';
          element.style.backgroundColor = 'transparent';
          if (placeholder) placeholder.style.display = 'none';
      } else {
          element.style.backgroundImage = 'none';
          element.style.backgroundColor = 'rgba(100, 150, 200, 0.18)';
          if (placeholder) placeholder.style.display = 'flex';
      }
  }

  function setPlayGamesProfileInfo(profile) {
      const active = profile && (profile.active === true || profile.active === 'true' || profile.connected === true || profile.connected === 'true');
      const name = profile && typeof profile.name === 'string' ? profile.name.trim() : '';
      const avatar = profile && typeof profile.avatar === 'string' ? profile.avatar.trim() : '';
      const hasProfileData = active && (name || avatar);

      if (hasProfileData) {
          if (playGamesProfileRow) {
              playGamesProfileRow.style.display = 'flex';
          }
          if (playGamesProfileName) playGamesProfileName.textContent = name || 'Google Play User';
          if (playGamesProfileAvatar) {
              applyPlayGamesAvatar(playGamesProfileAvatar, avatar || null);
          }
      } else {
          if (playGamesProfileRow) {
              playGamesProfileRow.style.display = 'none';
          }
          if (playGamesProfileName) playGamesProfileName.textContent = '';
          if (playGamesProfileAvatar) {
              applyPlayGamesAvatar(playGamesProfileAvatar, null);
          }
      }
  }

  function requestPlayGamesProfile() {
      if (window.Android && typeof Android.getPlayGamesProfile === 'function') {
          try {
              const raw = Android.getPlayGamesProfile();
              const profile = raw ? JSON.parse(raw) : { active: false };
              setPlayGamesProfileInfo(profile);
              return;
          } catch (e) {
              console.warn('Play Games profile parse error', e);
          }
      }
      setPlayGamesProfileInfo({ active: false });
  }

  window.onPlayGamesProfile = function(profile) {
      try {
          const data = typeof profile === 'string' ? JSON.parse(profile) : profile;
          const isActive = data.active === true || data.connected === true;
          const name = (data.name || '').trim();
          const avatar = (data.avatar || '').trim();
          const hasValidProfile = isActive && (name || avatar);
          
          const playGamesStatusText = document.getElementById('playGamesStatusText');
          if (playGamesStatusText) {
              playGamesStatusText.textContent = hasValidProfile ? 'Active' : 'Deactive';
          }
          
          const connectBtn = document.getElementById('connectAndroidBtn');
          if (connectBtn) {
              if (hasValidProfile) {
                  connectBtn.style.display = 'none';
                  connectBtn.textContent = 'Connected';
              } else {
                  connectBtn.style.display = 'inline-flex';
                  connectBtn.textContent = 'Connect';
              }
          }

          setPlayGamesProfileInfo({ active: hasValidProfile, name: name || 'Google Play User', avatar });
          
          // Close GP prompt if connected now
          if (hasValidProfile) {
              const gpPromptOverlay = document.getElementById('gpPromptOverlay');
              if (gpPromptOverlay && gpPromptOverlay.style.display === 'flex') {
                  if (typeof hideGooglePlayPrompt === 'function') {
                      hideGooglePlayPrompt();
                  }
              }
          }
          
          if (typeof updateAdvancedServiceStatus === 'function') {
              updateAdvancedServiceStatus();
          }
      } catch(e) {
          console.warn('Play Games profile callback parse error', e);
      }
  };

  // Receive real-time status updates from Kotlin
  window.updatePlayGamesStatus = function(status) {
      console.log('Play Games status update:', status);
      try {
          const data = typeof status === 'string' ? JSON.parse(status) : status;
          const isConnected = data.active === true || data.connected === true;
          const playerName = (data.name || '').trim();
          const playerAvatar = (data.avatar || '').trim();
          const hasValidProfile = isConnected && (playerName || playerAvatar);
          
          const statusEl = document.getElementById('playGamesStatusText');
          if (statusEl) {
              statusEl.textContent = hasValidProfile ? 'Active' : 'Deactive';
          }
          
          const connectBtn = document.getElementById('connectAndroidBtn');
          if (connectBtn) {
              if (hasValidProfile) {
                  connectBtn.style.display = 'none';
                  connectBtn.textContent = 'Connected';
              } else {
                  connectBtn.style.display = 'inline-flex';
                  connectBtn.textContent = 'Connect';
              }
          }

          setPlayGamesProfileInfo({ active: hasValidProfile, name: playerName || 'Google Play User', avatar: playerAvatar });
          
          // Update advanced panel if open
          if (typeof updateAdvancedServiceStatus === 'function') {
              updateAdvancedServiceStatus();
          }
      } catch(e) {
          console.error('Failed to parse Play Games status:', e);
      }
  };

  function isPlayGamesReallyConnected() {
      if (typeof Android === 'undefined') return false;
      
      if (typeof Android.isPlayGamesConnected === 'function') {
          return Android.isPlayGamesConnected();
      }
      
      if (typeof Android.getPlayGamesProfile === 'function') {
          try {
              const profile = Android.getPlayGamesProfile();
              const data = typeof profile === 'string' ? JSON.parse(profile) : profile;
              return (data.active === true || data.connected === true) && data.name && data.name !== '';
          } catch(e) {
              return false;
          }
      }
      
      return false;
  }

  function refreshPlayGamesStatus() {
      if (typeof Android !== 'undefined') {
          if (typeof Android.refreshPlayGamesProfile === 'function') {
              Android.refreshPlayGamesProfile();
          }
          if (typeof Android.getPlayGamesProfile === 'function') {
              const profile = Android.getPlayGamesProfile();
              if (typeof window.updatePlayGamesStatus === 'function') {
                  window.updatePlayGamesStatus(profile);
              }
          }
      }
  }

  window.onPlayGamesSignIn = function(isSignedIn) {
      console.log('Play Games sign-in callback:', isSignedIn);
      
      const connectBtn = document.getElementById('connectAndroidBtn');
      if (connectBtn) {
          connectBtn.disabled = false;
          connectBtn.textContent = 'Connect';
      }
      
      if (isSignedIn) {
          removeGooglePlayConnectMessage();
      } else if (isSignedIn === false) {
          if (pendingPlayGamesRequest && !isAdvancedPanelSignIn && !suppressPlayGamesOnSignInSystemMessage) {
              showThrottledSystemError('playGamesSignIn', 'Google Play Games sign-in failed. Please try again.');
              pendingPlayGamesRequest = false;
          }
          console.warn('Google Play Games sign-in failed', isAdvancedPanelSignIn ? '(advanced panel suppressing system message)' : '(dialog shown)');
          
          if (connectBtn) {
              connectBtn.disabled = false;
              connectBtn.textContent = 'Connect';
          }
          if (profileAdvancedMessage) {
              profileAdvancedMessage.textContent = 'Google Play Games sign-in failed. Please try again.';
              profileAdvancedMessage.classList.add('error');
          }
      }
      suppressPlayGamesOnSignInSystemMessage = false;
      isAdvancedPanelSignIn = false;
      
      setTimeout(function() {
          if (typeof refreshPlayGamesStatus === 'function') {
              refreshPlayGamesStatus();
          }
          if (typeof updateAdvancedServiceStatus === 'function') {
              updateAdvancedServiceStatus();
          }
          if (isSignedIn && typeof flushPendingPlayGamesAchievements === 'function') {
              flushPendingPlayGamesAchievements();
          }
      }, 1000);
  };

  function updateAdvancedServiceStatus() {
      const supported = window.Android && typeof Android.isAndroidSupported === 'function' && parseAndroidBoolean(Android.isAndroidSupported());
      
      // Get REAL Play Games status - check BOTH connection AND profile name
      let isActuallyConnected = false;
      let profileName = '';
      
      if (window.Android) {
          if (typeof Android.isPlayGamesConnected === 'function') {
              isActuallyConnected = Android.isPlayGamesConnected();
          }
          
          if (typeof Android.getPlayGamesProfile === 'function') {
              try {
                  const profileRaw = Android.getPlayGamesProfile();
                  const profile = typeof profileRaw === 'string' ? JSON.parse(profileRaw) : profileRaw;
                  isActuallyConnected = profile.active === true || profile.connected === true;
                  profileName = profile.name || '';
              } catch(e) {
                  console.warn('Failed to get Play Games profile:', e);
              }
          }
      }
      
      const playerAvatar = (() => {
          if (!window.Android || typeof Android.getPlayGamesProfile !== 'function') return '';
          try {
              const profileRaw = Android.getPlayGamesProfile();
              const profile = typeof profileRaw === 'string' ? JSON.parse(profileRaw) : profileRaw;
              return profile && profile.avatar ? profile.avatar : '';
          } catch (e) {
              return '';
          }
      })();
      const hasValidProfile = isActuallyConnected && (profileName || playerAvatar);
      
      const playGamesStatusText = document.getElementById('playGamesStatusText');
      const playGamesProfileRow = document.getElementById('playGamesProfileRow');
      const playGamesProfileName = document.getElementById('playGamesProfileName');
      const playGamesProfileAvatar = document.getElementById('playGamesProfileAvatar');
      const connectAndroidBtn = document.getElementById('connectAndroidBtn');
      const advancedMessage = document.getElementById('advancedMessage');
      const androidSupportText = document.getElementById('androidSupportText');
      
      if (androidSupportText) androidSupportText.textContent = supported ? 'Yes' : 'No';
      
      if (playGamesStatusText) {
          playGamesStatusText.textContent = hasValidProfile ? 'Active' : 'Deactive';
      }
      
      if (hasValidProfile) {
          if (playGamesProfileRow) playGamesProfileRow.style.display = 'flex';
          if (playGamesProfileName) playGamesProfileName.textContent = profileName || 'Google Play User';
          if (playGamesProfileAvatar) {
              applyPlayGamesAvatar(playGamesProfileAvatar, playerAvatar);
          }
          if (connectAndroidBtn) {
              connectAndroidBtn.style.display = 'none';
              connectAndroidBtn.textContent = 'Connected';
          }
          if (advancedMessage) {
              advancedMessage.textContent = 'Google Play Games is connected and active.';
              advancedMessage.classList.remove('error');
          }
      } else {
          if (playGamesProfileRow) playGamesProfileRow.style.display = 'none';
          if (playGamesProfileAvatar) {
              applyPlayGamesAvatar(playGamesProfileAvatar, null);
          }
          if (connectAndroidBtn) {
              connectAndroidBtn.style.display = 'inline-flex';
              connectAndroidBtn.textContent = 'Connect';
          }
          
          if (!supported) {
              if (advancedMessage) advancedMessage.textContent = 'Google Play Games support is unavailable on this device.';
          } else if (isActuallyConnected && !profileName) {
              if (advancedMessage) advancedMessage.textContent = 'Partial connection — sign out and sign in again to fix.';
          } else {
              if (advancedMessage) advancedMessage.textContent = 'Tap Connect to sign in to Google Play Games.';
          }
          if (advancedMessage) advancedMessage.classList.add('error');
      }
      
      if (connectAndroidBtn) {
          connectAndroidBtn.disabled = !supported;
          connectAndroidBtn.classList.toggle('supported', supported && !hasValidProfile);
          connectAndroidBtn.classList.toggle('unsupported', !supported);
      }
      
      if (advancedMessage) advancedMessage.classList.remove('hidden');
  }

  function openAdvancedServices() {
      showLoadingScreen(() => {
          profileModalTop.style.display = 'none';
          profileStats.style.display = 'none';
          document.getElementById('profileMainSection').style.display = 'none';
          profileAdvancedPanel.classList.remove('hidden');
          if (!checkInternetConnection()) {
              profileAdvancedMessage.textContent = 'Try again with a stable connection.';
              profileAdvancedMessage.classList.add('error');
              profileAdvancedMessage.classList.remove('hidden');
              connectAndroidBtn.style.display = 'none';
              androidSupportText.textContent = 'Unknown';
              playGamesStatusText.textContent = 'Offline';
              return;
          }
          // Refresh Play Games status from native code
          if (window.Android && typeof Android.isPlayGamesActive === 'function') {
              const currentStatus = parseAndroidBoolean(Android.isPlayGamesActive());
              console.log('Play Games current status:', currentStatus);
          }
          updateAdvancedServiceStatus();
      });
      if (audioOn) playSound('tap');
  }

  function closeAdvancedServices() {
      profileAdvancedPanel.classList.add('hidden');
      profileModalTop.style.display = 'flex';
      profileStats.style.display = 'flex';
      document.getElementById('profileMainSection').style.display = 'flex';
  }

  openAdvancedServicesBtn.onclick = () => openAdvancedServices();
  connectAndroidBtn.onclick = () => {
      const supported = window.Android && typeof Android.isAndroidSupported === 'function' && parseAndroidBoolean(Android.isAndroidSupported());
      
      // Check if already REALLY connected (has valid profile)
      let isReallyConnected = false;
      if (window.Android && typeof Android.isPlayGamesConnected === 'function') {
          isReallyConnected = Android.isPlayGamesConnected();
      }
      
      if (!supported) {
          profileAdvancedMessage.textContent = 'Google Play Games is not supported on this device.';
          profileAdvancedMessage.classList.add('error');
          return;
      }
      
      if (isReallyConnected) {
          profileAdvancedMessage.textContent = 'Google Play Games is already connected and active.';
          profileAdvancedMessage.classList.remove('error');
          connectAndroidBtn.style.display = 'none';
          return;
      }
      
      profileAdvancedMessage.textContent = 'Connecting to Play Games...';
      profileAdvancedMessage.classList.remove('error');
      profileAdvancedMessage.classList.remove('hidden');
      connectAndroidBtn.disabled = true;
      connectAndroidBtn.textContent = 'Connecting...';
      suppressPlayGamesOnSignInSystemMessage = true;
      isAdvancedPanelSignIn = true;

      let timeoutId = setTimeout(() => {
          if (window.Android && typeof Android.isPlayGamesConnected === 'function') {
              const stillNotConnected = !Android.isPlayGamesConnected();
              if (stillNotConnected) {
                  profileAdvancedMessage.textContent = 'Play Games is not responding. Try again!';
                  profileAdvancedMessage.classList.add('error');
                  connectAndroidBtn.disabled = false;
                  connectAndroidBtn.textContent = 'Connect';
              }
          }
      }, 10000);

      if (window.Android && typeof Android.requestPlayGamesSignIn === 'function') {
          try {
              Android.requestPlayGamesSignIn();
              setTimeout(() => {
                  clearTimeout(timeoutId);
                  setTimeout(() => {
                      const isNowConnected = window.Android && typeof Android.isPlayGamesConnected === 'function'
                          ? Android.isPlayGamesConnected() : false;
                      if (isNowConnected) {
                          profileAdvancedMessage.textContent = 'Google Play Games connected successfully!';
                          profileAdvancedMessage.classList.remove('error');
                          connectAndroidBtn.style.display = 'none';
                      } else {
                          profileAdvancedMessage.textContent = 'Play Games is not responding. Try again!';
                          profileAdvancedMessage.classList.add('error');
                          connectAndroidBtn.disabled = false;
                          connectAndroidBtn.textContent = 'Connect';
                      }
                  }, 3000);
              }, 500);
          } catch (e) {
              clearTimeout(timeoutId);
              console.error('Failed to request Play Games sign-in:', e);
              profileAdvancedMessage.textContent = 'Play Games is not responding. Try again!';
              profileAdvancedMessage.classList.add('error');
              connectAndroidBtn.disabled = false;
              connectAndroidBtn.textContent = 'Connect';
          }
      } else {
          clearTimeout(timeoutId);
          profileAdvancedMessage.textContent = 'Play Games is not responding. Try again!';
          profileAdvancedMessage.classList.add('error');
          connectAndroidBtn.disabled = false;
          connectAndroidBtn.textContent = 'Connect';
      }
  };
  viewProfileStatsBtn.onclick = () => closeAdvancedServices();

  stagesBtn.onclick = () => {
      if (audioOn) playSound('tap');
      stagesOpenedFromGameOver = false;
      showLoadingScreen(() => {
          renderStagesOverlay();
          stagesOverlay.style.display = 'flex';
          stagesBtn.style.display = 'none';
      });
  };

  closeStagesBtn.onclick = () => {
      if (audioOn) playSound('tap');
      showLoadingScreen(() => {
          stagesOverlay.style.display = 'none';
          hideAllStagesView();
          if (stagesOpenedFromGameOver) {
              stagesOpenedFromGameOver = false;
              showGameOverScreen();
          } else {
              showMenu();
              resetMainMenuButtonVisibility();
              if (stagesBtn) stagesBtn.style.display = 'inline-flex';
              updateStagesBtnBadge();
              startMenuSpaceAnimation(menu);
          }
      });
  };

  const journeyGoStagesBtn = document.getElementById('journeyGoStagesBtn');
  if (journeyGoStagesBtn) {
      journeyGoStagesBtn.onclick = () => {
          if (audioOn) playSound('tap');
          stagesOpenedFromGameOver = true;
          showLoadingScreen(() => {
              renderStagesOverlay();
              stagesOverlay.style.display = 'flex';
              if (stagesBtn) stagesBtn.style.display = 'none';
          });
      };
  }

  seeAllStagesBtn.onclick = () => {
      if (audioOn) playSound('tap');
      showAllStagesView();
  };

  backToStageSummaryBtn.onclick = () => {
      if (audioOn) playSound('tap');
      hideAllStagesView();
  };

  closeProfileModal.onclick = () => {
      showLoadingScreen(() => {
          editNicknameModal.classList.remove('show');
      });
      if (audioOn) playSound('tap');
  };

  saveNicknameBtn.onclick = async () => {
      const newName = nicknameInput.value.trim();
      if (newName && newName.length >= 2) {
          playerName = newName.substring(0, 20);
          saveGameData();
          saveProfileData();
          updateProfileDisplay();
          refreshProfileModalStats();
          recordUserAnalytics(playerName);
          showLoadingScreen(() => {
              editNicknameModal.classList.remove('show');
          });
          if (audioOn) playSound('tap');
      } else {
          showMessage('Invalid Name', 'Nickname must be at least 2 characters.');
      }
  };

  cancelNicknameBtn.onclick = () => {
      showLoadingScreen(() => {
          editNicknameModal.classList.remove('show');
      });
      if (audioOn) playSound('tap');
  };

  factoryResetBtn.onclick = (e) => {
      e.stopPropagation();
      document.querySelector('.edit-nickname-content').style.display = 'none';
      document.getElementById('resetConfirmation').style.display = 'flex';
      if (audioOn) playSound('tap');
  };

  confirmResetBtn.onclick = () => {
      performFactoryReset();
  };

  cancelResetBtn.onclick = () => {
      document.querySelector('.edit-nickname-content').style.display = 'flex';
      document.getElementById('resetConfirmation').style.display = 'none';
      if (audioOn) playSound('tap');
  };

  // Close modal on background click
  editNicknameModal.onclick = (e) => {
      if (e.target === editNicknameModal) {
          editNicknameModal.classList.remove('show');
          // Reset to main content when closing
          document.querySelector('.edit-nickname-content').style.display = 'flex';
          document.getElementById('resetConfirmation').style.display = 'none';
      }
  };

  // Allow Enter key to save nickname
  nicknameInput.onkeypress = (e) => {
      if (e.key === 'Enter') saveNicknameBtn.click();
  };

  // Upload Avatar from modal
  modalUploadPhotoBtn.onclick = () => {
      photoInput.click();
      if (audioOn) playSound('tap');
  };

  photoInput.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
              const photoData = event.target.result;
              localStorage.setItem('solarFlyProfilePhoto', photoData);
              setAvatarImage(photoData);
              if (audioOn) playSound('tap');
          };
          reader.readAsDataURL(file);
      }
  };

  function syncGameStateToGooglePlayGames(state = null) {
      if (!isAndroidDevice()) return false;
      if (!window.Android || typeof Android.syncGooglePlayGameState !== 'function') return false;
      try {
          const payload = state || {
              score,
              playerHealth,
              player: {...player},
              meteorhunts,
              ufoDefenders,
              obstacles: obstacles.map(o => ({...o})),
              meteors: meteors.map(m => ({...m})),
              blackHoles: blackHoles.map(b => ({...b})),
              aliens: aliens.map(a => ({...a, acidBalls: a.acidBalls.map(b => ({...b})) })),
              eatingBlackHole: eatingBlackHole ? {...eatingBlackHole} : null,
              lastSpawn,
              lastBlackHoleSpawnScore,
              lastUFOSpawnScore,
              lastShurikenSpawnScore,
              difficulty,
              baseGapSize,
              gapSize,
              playerPosition: {x: player.x, y: player.y, vy: player.vy},
              high,
              totalStars
          };
          return Android.syncGooglePlayGameState(JSON.stringify(payload));
      } catch (e) {
          console.warn('Google Play game-state bridge failed:', e);
          return false;
      }
  }

  function requestGooglePlayGameState() {
      if (!isAndroidDevice()) return null;
      if (!window.Android || typeof Android.getGooglePlayGameState !== 'function') return null;
      try {
          const raw = Android.getGooglePlayGameState();
          if (!raw || raw === 'null' || raw === 'undefined') return null;
          return JSON.parse(raw);
      } catch (e) {
          console.warn('Google Play game-state request failed:', e);
          return null;
      }
  }

  function saveGameState() {
      if (!running && !savedGameState) {
          // nothing to save if not running; still preserving state if already existed
      }
      const state = {
          score,
          playerHealth,
          player: {...player},
          meteorhunts,
          ufoDefenders,
          obstacles: obstacles.map(o => ({...o})),
          meteors: meteors.map(m => ({...m})),
          blackHoles: blackHoles.map(b => ({...b})),
          aliens: aliens.map(a => ({...a, acidBalls: a.acidBalls.map(b => ({...b})) })),
          eatingBlackHole: eatingBlackHole ? {...eatingBlackHole} : null,
          lastSpawn,
          lastBlackHoleSpawnScore,
          lastUFOSpawnScore,
          lastShurikenSpawnScore,
          difficulty,
          baseGapSize,
          gapSize,
          playerPosition: {x: player.x, y: player.y, vy: player.vy},
          high,
          totalStars
      };
      localStorage.setItem('solarFlySavedState', JSON.stringify(state));
      savedGameState = state;
      syncGameStateToGooglePlayGames(state);
  }

  function loadSavedGameState(){
      const saved = localStorage.getItem('solarFlySavedState');
      if(saved){
          try { savedGameState = JSON.parse(saved); }
          catch (err) { savedGameState = null; }
      } else {
          savedGameState = null;
      }
  }

  window.onGooglePlayGameState = function(rawState) {
      try {
          if (!rawState || rawState === 'null' || rawState === 'undefined') return;
          const parsed = typeof rawState === 'string' ? JSON.parse(rawState) : rawState;
          if (parsed && typeof parsed === 'object') {
              savedGameState = parsed;
              localStorage.setItem('solarFlySavedState', JSON.stringify(parsed));
          }
      } catch (e) {
          console.warn('Failed to apply Google Play game state:', e);
      }
  };

  function clearSavedGameState(){
      savedGameState = null;
      localStorage.removeItem('solarFlySavedState');
  }

  function resumeSavedGame(){
      const countdown = document.getElementById('continueCountdown');
      const canvas = document.getElementById('c');
      profileCard.style.display = 'none';
      editNicknameModal.classList.remove('show');
      gameWrap.style.display = 'flex';
      if (canvas) canvas.style.display = 'block';
      scorePanel.style.display = 'block';
      document.getElementById('pauseControl').style.display = 'block';
      let timer = 3;
      countdown.textContent = `Continue in ${timer}`;
      countdown.style.display = 'block';
      const intervalId = setInterval(() => {
          timer--;
          if(timer<=0){
              clearInterval(intervalId);
              countdown.style.display = 'none';
              lastTime = performance.now();

              if(!savedGameState){
                  start();
                  return;
              }

              score = savedGameState.score || 0;
              playerHealth = savedGameState.playerHealth || 3;
              playerDamageStage = Math.max(0, Math.min(2, 3 - playerHealth));
              Object.assign(player, savedGameState.player || {});
              player.x = savedGameState.playerPosition?.x ?? player.x;
              player.y = savedGameState.playerPosition?.y ?? player.y;
              player.vy = savedGameState.playerPosition?.vy ?? player.vy;
              obstacles = (savedGameState.obstacles || []).map(o => ({...o}));
              meteors = (savedGameState.meteors || []).map(m => ({...m}));
              blackHoles = (savedGameState.blackHoles || []).map(b => ({...b}));
              aliens = (savedGameState.aliens || []).map(a => ({...a, acidBalls: (a.acidBalls || []).map(b => ({...b})) }));
              lastSpawn = savedGameState.lastSpawn || 0;
              lastBlackHoleSpawnScore = savedGameState.lastBlackHoleSpawnScore ?? -1;
              lastUFOSpawnScore = savedGameState.lastUFOSpawnScore ?? -1;
              lastShurikenSpawnScore = savedGameState.lastShurikenSpawnScore ?? -1;
              difficulty = savedGameState.difficulty || difficulty;
              applyDifficulty();
              baseGapSize = savedGameState.baseGapSize || baseGapSize;
              gapSize = savedGameState.gapSize || gapSize;
              high = savedGameState.high || high;
              totalStars = savedGameState.totalStars || totalStars;
              meteorhunts = typeof savedGameState.meteorhunts === 'number' ? savedGameState.meteorhunts : meteorhunts;
              ufoDefenders = typeof savedGameState.ufoDefenders === 'number' ? savedGameState.ufoDefenders : ufoDefenders;

              scoreTxt.textContent = score;
              try { if (typeof updateStarsUI === 'function') updateStarsUI(); else { starsDisplay.textContent = '⭐ ' + totalStars; menuStars.textContent = '⭐ ' + totalStars; } } catch (e) { starsDisplay.textContent = '⭐ ' + totalStars; menuStars.textContent = '⭐ ' + totalStars; }
              healthDisplay.textContent = '❤️ ' + playerHealth;
              syncPlayerDamageStage();
              syncPlayerPlanetOverlay();

              pauseMenu.style.display='none';
              isOnDeathScreen = false; // No longer on death screen
              gameOver.style.display='none';
              menu.style.display='none';
              gameWrap.style.display = 'flex';
              document.getElementById('pauseControl').style.display='block';
              const canvas = document.getElementById('c');
              if (canvas) canvas.style.display = 'block';
              scorePanel.style.display='block';
              running=true;
              syncPlayerPlanetOverlay();
              
              // Resume ambient soundscape now that gameplay is restored
              if (audioOn && !impossibleModeActive) {
                  if (sounds.menu) sounds.menu.pause();
                  bgAudio.muted = false;
                  if (shouldPlayBackgroundMusic()) {
                      bgAudio.play().catch(err => {
                          console.log('bgAudio resume error:', err);
                          setupResumeAudioOnTap();
                      });
                      activeSoundsState.bgAudioWasPlaying = true;
                  } else {
                      bgAudio.pause();
                      activeSoundsState.bgAudioWasPlaying = false;
                  }
              }

              clearSavedGameState();
          } else {
              countdown.textContent = `Continue in ${timer}`;
          }
      }, 1000);
  }

  function isOffline() {
      return typeof navigator !== 'undefined' && navigator.onLine === false;
  }

  function handlePlayButtonClicked(){
      if (isTutorialMode && tutorialStep === 1) {
          hideTutorialPointer();
      }
      if(savedGameState){
          gameWrap.style.display = 'flex';
          continueChoiceMenu.style.display = 'flex';
      } else {
          if (stagesBtn) stagesBtn.style.display = 'none';
          showLoadingScreen(() => {
              menu.style.display='none';
              start();
              if(audioOn) tryPlayBackgroundMusic();
          });
      }
  }

  window.pauseGameForAd = function () {
      if (typeof running === 'undefined') return;
      if (running) {
          running = false;
      }
      if (typeof lastTime !== 'undefined') {
          lastTime = performance.now();
      }

      if (bgAudio) {
          bgAudio.pause();
          activeSoundsState.bgAudioWasPlaying = false;
      }
      if (sounds.menu) {
          sounds.menu.pause();
          activeSoundsState.menuSoundWasPlaying = false;
      }
      Object.values(sounds).forEach(sound => {
          if (sound && sound !== sounds.menu) {
              try { sound.pause(); } catch (err) {}
          }
      });
      activeSoundsState.soundsPlaying.clear();

      const canvas = document.getElementById('c');
      if (canvas) {
          canvas.style.pointerEvents = 'none';
      }
  };

  window.resumeGameAfterAd = function (shouldResume) {
      if (typeof running === 'undefined') return;

      if (shouldResume) {
          running = true;
          if (typeof lastTime !== 'undefined') {
              lastTime = performance.now();
          }
          if (audioOn && !impossibleModeActive) {
              if (sounds.menu) sounds.menu.pause();
              bgAudio.muted = false;
              if (shouldPlayBackgroundMusic()) {
                  bgAudio.play().catch(err => {
                      console.log('bgAudio resume error:', err);
                      setupResumeAudioOnTap();
                  });
                  activeSoundsState.bgAudioWasPlaying = true;
              } else {
                  bgAudio.pause();
                  activeSoundsState.bgAudioWasPlaying = false;
              }
          }
      } else {
          running = false;
          if (audioOn && !impossibleModeActive) {
              updateAudioForCurrentMode();
          }
      }

      const canvas = document.getElementById('c');
      if (canvas) {
          canvas.style.pointerEvents = 'auto';
      }
  };

  function pauseGame(){
    if(!running) return;
    running = false;
    saveGameState(); // Auto-save when pausing (both manual and auto-pause)
    
    // Stop ambient soundscape when pausing
    bgAudio.pause();
    activeSoundsState.bgAudioWasPlaying = false;
    
    const canvas = document.getElementById('c');
    canvas.style.pointerEvents = 'none';
        // Ensure pause menu reflects the current game mode (Classic vs Family)
        try { if (typeof applyFamilyForwardRunUI === 'function') applyFamilyForwardRunUI(); } catch (e) { console.warn('applyFamilyForwardRunUI failed', e); }
        pauseMenu.style.display='flex';
  }

  function exitToMenuFromPause(){
      saveGameState();
      running=false;
      pauseMenu.style.display='none';
      const canvas = document.getElementById('c');
      canvas.style.pointerEvents = 'auto';
      canvas.style.zIndex = 'auto';
      applyPlanetUnlocksForScore(score);
      showMenu();
  }

  function exitToMenuAndReset(){
      running=false;
      pauseMenu.style.display='none';
      const canvas = document.getElementById('c');
      canvas.style.pointerEvents = 'auto';
      canvas.style.zIndex = 'auto';
      const exitToMenu = () => {
          applyPlanetUnlocksForScore(score);
          resetGame();
          showMenu();
      };
      if (maybeShowNewHighScoreThen(() => {
          showLoadingScreen(exitToMenu);
      })) {
          return;
      }
      showLoadingScreen(exitToMenu);
  }

  function loadGameData() {
      const storedPlayerName = localStorage.getItem('solarFlyPlayerName');
      const storedNickname = localStorage.getItem('solarFlyNickname');
      const validStoredPlayerName = storedPlayerName && storedPlayerName !== 'null' && storedPlayerName !== 'undefined' ? storedPlayerName : null;
      const validStoredNickname = storedNickname && storedNickname !== 'null' && storedNickname !== 'undefined' && storedNickname !== 'Anonymous' ? storedNickname : null;
      playerName = validStoredPlayerName || validStoredNickname;
      if (playerName && !validStoredPlayerName) {
          localStorage.setItem('solarFlyPlayerName', playerName);
      }
      high = parseInt(localStorage.getItem('solarFlyHigh')) || 0;
      const rawTotalStars = localStorage.getItem('solarFlyTotalStars');
      const storedTotalStars = parseInt(rawTotalStars, 10);
      if (storedTotalStars === 99999999) {
          const fallbackStars = typeof getAdminPrevStars === 'function' ? getAdminPrevStars() : 0;
          totalStars = fallbackStars || 0;
      } else {
          totalStars = Number.isFinite(storedTotalStars) ? storedTotalStars : 0;
      }
      meteorhunts = parseInt(localStorage.getItem('solarFlyMeteorHunts') || '0', 10) || 0;
      ufoDefenders = parseInt(localStorage.getItem('solarFlyUfoDefenders') || '0', 10) || 0;
      isFirstRun = localStorage.getItem('solarFlyIsFirstRun') === 'true'; // LOAD FIRST RUN

      loadStageData();
      updateStageTaskValues();

      // Load daily reward data
      lastRewardClaimTime = parseInt(localStorage.getItem('solarFlyLastRewardClaimTime')) || 0;
      currentRewardDay = parseInt(localStorage.getItem('solarFlyCurrentRewardDay')) || 1;
      rewardWeekCompleted = localStorage.getItem('solarFlyRewardWeekCompleted') === 'true';

      // Load achievement status
      const savedAchievements = localStorage.getItem('solarFlyAchievements');
      const parsedSavedAchievements = savedAchievements ? JSON.parse(savedAchievements) : {};
      achievementStatus = {};
      achievements.forEach(a => {
          achievementStatus[a.key] = Boolean(parsedSavedAchievements[a.key]);
      });

      loadPendingPlayGamesAchievements();

      const savedAchievementNew = localStorage.getItem('solarFlyAchievementNew');
      const parsedSavedAchievementNew = savedAchievementNew ? JSON.parse(savedAchievementNew) : {};
      achievementNew = {};
      achievements.forEach(a => {
          achievementNew[a.key] = Boolean(parsedSavedAchievementNew[a.key]);
      });

      // Clear any saved 'impossible' achievements while the Impossible section remains locked
      try {
          if (!isImpossibleSectionUnlocked()) {
              achievements.filter(a => a.section === 'impossible').forEach(a => {
                  achievementStatus[a.key] = false;
                  achievementNew[a.key] = false;
              });
          }
      } catch (e) {
          // if function not available yet, skip silently
      }
      currentIntroScreenIndex = parseInt(localStorage.getItem('solarFlyIntroScreenIndex') || '1', 10) || 1;
      directToTutorialChoice = localStorage.getItem('solarFlyDirectToTutorialChoice') === 'true';

      // Load planet unlock status
      const savedUnlockStatus = localStorage.getItem('solarFlyUnlockStatus');
      const savedKeyShown = localStorage.getItem('solarFlyKeyShown');
      const savedPlanetNew = localStorage.getItem('solarFlyPlanetNew');

      if (savedUnlockStatus) {
          unlocked = JSON.parse(savedUnlockStatus);
          keyShown = savedKeyShown ? JSON.parse(savedKeyShown) : planetData.map(()=>false);
          planetNew = savedPlanetNew ? JSON.parse(savedPlanetNew) : planetData.map(()=>false);

          while(unlocked.length < planetData.length) {
              unlocked.push(false);
              keyShown.push(false);
              planetNew.push(false);
          }
          unlocked[0] = true;
          keyShown[0] = true;
          planetNew[0] = false; // Earth is never "new" on load
      } else {
          unlocked = planetData.map((p,i)=> i===0);
          keyShown = planetData.map((p,i)=> i===0);
          planetNew = planetData.map((p,i)=> false);
      }

      try {
          if (typeof applyAdminUnlockAllPlanets === 'function' && getAdminUnlockAllPlanets() === 'yes') {
              applyAdminUnlockAllPlanets();
          }
      } catch (e) {
          console.warn('Failed to apply admin planet unlock override', e);
      }

      try {
          if (typeof applyAdminUnlockAllAchievements === 'function' && getAdminUnlockAllAchievements() === 'yes') {
              applyAdminUnlockAllAchievements();
          }
      } catch (e) {
          console.warn('Failed to apply admin achievement unlock override', e);
      }

      // Load difficulty and planet key
      difficulty = localStorage.getItem('solarFlyDifficulty') || 'easy';
      if (difficulty === 'impossible') {
          setImpossibleTheme(true);
      }
      const savedPlanetKey = localStorage.getItem('solarFlyPlanetKey');
      const normalizedPlanetKey = resolvePlanetKey(savedPlanetKey, 'earth');
      player.planetKey = normalizedPlanetKey;
      const planet = planetData.find(p => p.key === normalizedPlanetKey) || planetData[0];
      player.planetIcon = planet.icon;
      menuPlayer.planetKey = normalizedPlanetKey;

      // Update UI elements
      totalMatches = parseInt(localStorage.getItem('solarFlyTotalMatches') || '0', 10) || 0;
      highScoreDisplay.textContent = 'High Score: ' + high;
      // If admin infinity is enabled, keep actual stored stars and only show the infinity icon in the UI.
      try {
          if (typeof getAdminInfinity === 'function' && getAdminInfinity() === 'yes') {
              // preserve actual totalStars already loaded from localStorage; just update display
          }
      } catch (e) { console.warn('admin infinity check failed', e); }
      try { if (typeof updateStarsUI === 'function') updateStarsUI(); else starsDisplay.textContent = '⭐ ' + totalStars; } catch (e) { starsDisplay.textContent = '⭐ ' + totalStars; }
      profileNameDisplay.textContent = 'Pilot: ' + (playerName || 'N/A');
      healthDisplay.textContent = '❤️ 3'; // Reset health display on load

      // Restore tutorial state if present (so reopening the tab returns to the correct flow)
      try {
          const tut = JSON.parse(localStorage.getItem('solarFlyTutorial') || 'null');
          if (tut && typeof tut.isTutorialMode !== 'undefined') {
              isTutorialMode = !!tut.isTutorialMode;
              tutorialStep = parseInt(tut.tutorialStep || '0', 10) || 0;
          }
      } catch (e) {
          console.warn('Failed to restore tutorial state:', e);
          isTutorialMode = false;
          tutorialStep = 0;
      }
  }

  // --- UPDATED Door Animation Logic ---

  const DOOR_ANIMATION_DURATION = 500; // milliseconds for a one-way transition (0.5s)

  /**
   * Executes the door opening and closing animation before running a callback.
   * This is the standard, fast transition.
   * @param {function} callback - The function to run when the doors are fully open.
   */
  function showLoadingScreen(callback) {
      // Hide the fixed volume button during the splash loading animation
      if (volumeBtnFixed) {
          volumeBtnFixed.style.display = 'none';
      }

      // 1. Close doors (starts the 0.5s transition)
      splash_loading.style.display = 'flex';
      doorContainer.classList.remove('door-open');
      if(audioOn){ playSound('door'); }

      // Wait for doors to close (0.5s)
      setTimeout(() => {
          // Run the visual update (hiding old screen, showing new one)
          callback();

          // 2. Open doors (starts the 0.5s transition)
          doorContainer.classList.add('door-open');
          if(audioOn){ playSound('door'); }

          // 3. Wait for door to open (0.5s), then hide loading screen and restore the fixed volume button
          setTimeout(() => {
              splash_loading.style.display = 'none';
              if (volumeBtnFixed) {
                  volumeBtnFixed.style.display = 'inline-flex';
              }
          }, DOOR_ANIMATION_DURATION);

      }, DOOR_ANIMATION_DURATION);
  }

  /**
   * A dedicated function for the initial run that is a bit longer and hides the loading screen after.
   */
  function initialLoadingScreen(callback) {
       // Ensure doors are closed initially
      splash_loading.style.display = 'flex';
      doorContainer.classList.remove('door-open');
      if(audioOn){ playSound('door'); }

      // Wait for initial load/close delay
      setTimeout(() => {
          // Open doors
          doorContainer.classList.add('door-open');
          if(audioOn){ playSound('door'); }

          // Wait for open
          setTimeout(() => {
              splash_loading.style.display = 'none';
              callback();
          }, DOOR_ANIMATION_DURATION);

      }, 500); // 0.5 second pause before opening on initial load for dramatic effect
  }


  // --- TUTORIAL LOGIC (existing, no changes) ---

  function showTutorialPointer(targetElement, message, delay = 0) {
      tutorialOverlay.style.display = 'flex';
      tutorialMessage.textContent = message;
      tutorialMessage.style.display = 'block';
      tutorialSkipButton.style.display = 'block';

      const rect = targetElement.getBoundingClientRect();
      const pointer = tutorialPointer;
      const msg = tutorialMessage;

      // Position the pointer over the center of the target
      pointer.style.left = `${rect.left + rect.width / 2}px`;
      pointer.style.top = `${rect.top + rect.height / 2 - 30}px`;

      // Position the message box above/below the pointer
      const msgTop = rect.top + rect.height / 2 > window.innerHeight / 2
          ? rect.top - msg.offsetHeight - 40 // Above
          : rect.bottom + 40; // Below

      msg.style.left = `50%`;
      msg.style.transform = `translateX(-50%)`;
      msg.style.top = `${msgTop}px`;

      // Make target visible above overlay
      targetElement.style.zIndex = 10002;
      tutorialPointer.style.display = 'block';
  }

  function showTutorialPointerWhenVisible(targetElement, message, delay = 0) {
      const tryShow = () => {
          const rect = targetElement.getBoundingClientRect();
          const isVisible = rect.width > 0 && rect.height > 0 && targetElement.offsetParent !== null;
          if (!isVisible) {
              setTimeout(tryShow, 100);
              return;
          }
          showTutorialPointer(targetElement, message, delay);
      };
      tryShow();
  }

  function hideTutorialPointer() {
      if (currentTutorialTarget) {
          currentTutorialTarget.onclick = currentTutorialOriginalOnClick;
          currentTutorialTarget.style.zIndex = 'auto';
          currentTutorialTarget = null;
          currentTutorialOriginalOnClick = null;
      }
      tutorialOverlay.style.display = 'none';
      tutorialPointer.style.display = 'none';
      tutorialMessage.style.display = 'none';
      tutorialSkipButton.style.display = 'none';
  }

  function nextTutorialStep() {
      tutorialStep++;
      hideTutorialPointer(); // Ensure any previous pointer is hidden

      if (tutorialStep === 1) {
          // Step 1: Locate Play Button (Start the guided game to score 1)
          showTutorialPointerWhenVisible(playBtn, "Tap 'Play' to start your first mission!", 100);
      } else if (tutorialStep === 2) {
          // Step 2: Locate Planets Button
          showMenu(); // Ensure we are on the menu
          showTutorialPointer(planetsBtn, "Great! Tap 'Planets' to explore available worlds.", 100);
      } else if (tutorialStep === 3) {
          // Step 3: Locate Back Button in Planet Menu
          showTutorialPointerWhenVisible(closePlanetBtn, "Tap 'Back' to return to the Main Menu.", 100);
      } else if (tutorialStep === 4) {
          // Step 4: Locate Achievements Button
          showTutorialPointer(achievementsBtn, "Excellent! Tap 'Achievements' to see trophies you can earn.", 100);
      } else if (tutorialStep === 5) {
          // Step 5: Locate Back Button in Achievement Menu
          showTutorialPointerWhenVisible(closeAchievementsBtn, "Tap 'Back' to return.", 100);
      } else if (tutorialStep === 6) {
          // Step 6: Locate Difficulty Button
          showTutorialPointer(difficultyBtn, "Tap 'Difficulty' to set your challenge level.", 100);
      } else if (tutorialStep === 7) {
          // Step 7: Locate Back Button in Difficulty Menu
          showTutorialPointerWhenVisible(closeDiffBtn, "Tap 'Back' to complete the tutorial.", 100);
      }
      // Persist tutorial progress so it can be resumed after a tab close
      try { saveGameData(); } catch (e) { console.warn('Failed to save tutorial progress:', e); }
  }

  function restoreMenuButtonFunctions() {
      // Restore Play button
      playBtn.onclick = () => {
          if (isFamilyModeActive()) {
              // Family mode is handled by the capture handler to avoid duplicate modal calls
              return;
          }
          handlePlayButtonClicked();
      };
      attachFamilyModePlayHandler();

      // Restore Planets button
      planetsBtn.onclick=()=>{
          if (audioOn) playSound('tap');
          if (stagesBtn) stagesBtn.style.display = 'none';
          showLoadingScreen(() => {
              menu.style.display='none';
              planetMenu.style.display='flex';
              refreshPlanetGrid();
              startMenuSpaceAnimation(planetMenu);
              // Keep the existing menu soundtrack playing while the planets screen is open
              if (audioOn) {
                  ensureMenuMusicPlaying();
              }
          });
          // Wait for loading screen animation to complete before advancing tutorial
          setTimeout(() => {
              if (isTutorialMode && tutorialStep === 2) nextTutorialStep();
          }, 1100); // 500*2 + 100ms buffer
      };

      resetMainMenuButtonVisibility();
      closePlanetBtn.onclick=()=>{
          if (audioOn) playSound('tap');
          showLoadingScreen(() => {
              planetMenu.style.display='none';
              menu.style.display='flex';
              updateMenuButtons();
              if (stagesBtn) stagesBtn.style.display = 'inline-flex';
              startMenuSpaceAnimation(menu);
              // Keep the existing menu soundtrack playing when returning to the main menu
              if (audioOn) {
                  ensureMenuMusicPlaying();
              }
          });
          // Wait for loading screen animation to complete before advancing tutorial
          setTimeout(() => {
              if (isTutorialMode && tutorialStep === 3) nextTutorialStep();
          }, 1100); // 500*2 + 100ms buffer
      };

      // Restore Achievements button
      achievementsBtn.onclick=()=>{
          if (audioOn) playSound('tap');
          if (stagesBtn) stagesBtn.style.display = 'none';
          showLoadingScreen(() => {
              menu.style.display='none';
              achievementsMenu.style.display='flex';
              document.body.classList.add('achievements-open');
              refreshAchievementGrid();
              hideAchievementSectionMessage();
              startMenuSpaceAnimation(achievementsMenu);
              // Keep the existing menu soundtrack playing while the achievements screen is open
              if (audioOn) {
                  ensureMenuMusicPlaying();
              }
          });
          // Wait for loading screen animation to complete before advancing tutorial
          setTimeout(() => {
              if (isTutorialMode && tutorialStep === 4) nextTutorialStep();
          }, 1100); // 500*2 + 100ms buffer
      };
      closeAchievementsBtn.onclick=()=>{
          if (audioOn) playSound('tap');
          showLoadingScreen(() => {
              achievementsMenu.style.display='none';
              document.body.classList.remove('achievements-open');
              menu.style.display='flex';
              hideAchievementSectionMessage();
              updateMenuButtons();
              if (stagesBtn) stagesBtn.style.display = 'inline-flex';
              startMenuSpaceAnimation(menu);
              // Keep the existing menu soundtrack playing when returning to the main menu
              if (audioOn) {
                  ensureMenuMusicPlaying();
              }
          });
          // Wait for loading screen animation to complete before advancing tutorial
          setTimeout(() => {
              if (isTutorialMode && tutorialStep === 5) nextTutorialStep();
          }, 1100); // 500*2 + 100ms buffer
      };

      socialMenuBtn.onclick=()=>{
          if (audioOn) playSound('tap');
          if (stagesBtn) stagesBtn.style.display = 'none';
          showLoadingScreen(() => {
              menu.style.display='none';
              if (socialMediaOverlay) socialMediaOverlay.style.display='flex';
              startMenuSpaceAnimation(menu);
          });
      };

      closeSocialMediaBtn.onclick=()=>{
          if (audioOn) playSound('tap');
          showLoadingScreen(() => {
              if (socialMediaOverlay) socialMediaOverlay.style.display='none';
              menu.style.display='flex';
              updateMenuButtons();
              if (stagesBtn) stagesBtn.style.display = 'inline-flex';
              startMenuSpaceAnimation(menu);
              if (audioOn) {
                  ensureMenuMusicPlaying();
              }
          });
      };

      settingsMenuBtn.onclick=()=>{
          if (audioOn) playSound('tap');
          if (stagesBtn) stagesBtn.style.display = 'none';
          showLoadingScreen(() => {
              menu.style.display='none';
              if (settingsOverlay) {
                  settingsOverlay.style.display='flex';
                  showSettingsEmptyState();
              }
              startMenuSpaceAnimation(menu);
          });
      };

      closeSettingsBtn.onclick=()=>{
          if (audioOn) playSound('tap');
          showLoadingScreen(() => {
              if (settingsOverlay) settingsOverlay.style.display='none';
              showSettingsEmptyState();
              menu.style.display='flex';
              updateMenuButtons();
              if (stagesBtn) stagesBtn.style.display = 'inline-flex';
              startMenuSpaceAnimation(menu);
              if (audioOn) {
                  ensureMenuMusicPlaying();
              }
          });
      };

      marketMenuBtn.onclick=()=>{
          if (audioOn) playSound('tap');
          if (stagesBtn) stagesBtn.style.display = 'none';
          showLoadingScreen(() => {
              menu.style.display='none';
              if (marketplaceOverlay) marketplaceOverlay.style.display='flex';
              startMenuSpaceAnimation(menu);
          });
      };

      closeMarketplaceBtn.onclick=()=>{
          if (audioOn) playSound('tap');
          showLoadingScreen(() => {
              if (marketplaceOverlay) marketplaceOverlay.style.display='none';
              menu.style.display='flex';
              updateMenuButtons();
              if (stagesBtn) stagesBtn.style.display = 'inline-flex';
              startMenuSpaceAnimation(menu);
              if (audioOn) {
                  ensureMenuMusicPlaying();
              }
          });
      };

      // NEW DAILY REWARD EVENT LISTENERS
      collectRewardBtn.onclick = () => {
          collectDailyReward();
      };

      // Restore Difficulty button
      difficultyBtn.onclick=()=>{
          if (audioOn) playSound('tap');
          if (stagesBtn) stagesBtn.style.display = 'none';
          showLoadingScreen(() => {
              menu.style.display='none';
              difficultyMenu.style.display='flex';
              applyDifficulty();
              startMenuSpaceAnimation(difficultyMenu);
              // Keep the existing menu soundtrack playing while the difficulty screen is open
              if (audioOn) {
                  ensureMenuMusicPlaying();
              }
          });
          // Wait for loading screen animation to complete before advancing tutorial
          setTimeout(() => {
              if (isTutorialMode && tutorialStep === 6) nextTutorialStep();
          }, 1100); // 500*2 + 100ms buffer
      };
      closeDiffBtn.onclick=()=>{
          if (audioOn) playSound('tap');
          showLoadingScreen(() => {
              difficultyMenu.style.display='none';
              menu.style.display='flex';
              if (stagesBtn) stagesBtn.style.display = 'inline-flex';
              startMenuSpaceAnimation(menu);
              // Keep the existing menu soundtrack playing when returning to the main menu
              if (audioOn) {
                  ensureMenuMusicPlaying();
              }
          });
          // Wait for loading screen animation to complete before ending tutorial
          setTimeout(() => {
              if (isTutorialMode && tutorialStep === 7) {
                  endTutorialSession();
              }
          }, 1100); // 500*2 + 100ms buffer
      };
  }

  // Ensure the main menu shortcuts are bound immediately on first load so Planets/Achievements/Difficulty
  // always open their respective screens instead of falling back to the menu state.
  restoreMenuButtonFunctions();

  // --- ACHIEVEMENT LOGIC (FIXED) ---

  function unlockPlayGamesAchievementForKey(achievementKey) {
      const achievementId = playGamesAchievementIds[achievementKey];
      if (!achievementId) return false;

      if (!isPlayGamesConnectedSafely()) {
          queuePendingPlayGamesAchievement(achievementKey);
          return false;
      }

      const androidBridge = typeof Android !== 'undefined' && Android !== null ? Android : (typeof window !== 'undefined' ? window.Android : undefined);
      if (!androidBridge) {
          queuePendingPlayGamesAchievement(achievementKey);
          return false;
      }

      try {
          if (typeof androidBridge.unlockPlayGamesAchievement === 'function') {
              androidBridge.unlockPlayGamesAchievement(achievementId);
              return true;
          }
          if (typeof androidBridge.unlockAchievement === 'function') {
              androidBridge.unlockAchievement(achievementId);
              return true;
          }
      } catch (e) {
          console.warn('Failed to unlock Play Games achievement for key:', achievementKey, e);
          queuePendingPlayGamesAchievement(achievementKey);
      }

      return false;
  }

  function checkAchievements(isGameOverCheck = false) {
      if (isFamilyForwardRunActive()) {
          return false;
      }

      let newUnlock = false;
      let unlockedAchievementName = '';

      achievements.forEach(a => {
          if (!achievementStatus[a.key]) {
              let achieved = false;

              if (a.type === 'score') {
                  if (high >= a.target) achieved = true;
              } else if (a.type === 'high_score') {
                  if (high >= a.target) achieved = true;
              } else if (a.type === 'total_stars') {
                  if (totalStars >= a.target) achieved = true;
              } else if (a.type === 'meteor_count') {
                  if (meteorhunts >= a.target) achieved = true;
              } else if (a.type === 'ufo_count') {
                  if (ufoDefenders >= a.target) achieved = true;
              } else if (a.type === 'time') {
                  // Time-based achievements trigger once when score threshold is reached
                  if (a.key === 'frozen_danger' && icyTrapEscaped) {
                      achieved = true;
                  } else if (a.scoreThreshold && high >= a.scoreThreshold) {
                      achieved = true;
                  } else if (!a.scoreThreshold && a.key === 'cosmic_dare' && difficulty === 'impossible' && blackHoleApproachEscaped) {
                      achieved = true;
                  }
              } else if (a.type === 'diff_score') {
                  if (isGameOverCheck) {
                      achieved = difficulty === a.target.diff && score >= a.target.score;
                  } else {
                      achieved = difficulty === a.target.diff && score >= a.target.score && a.target.score === 1;
                  }
              }

              if (achieved) {
                  // Do not unlock achievements from the 'impossible' section
                  // until the Impossible section itself has been unlocked via the UI.
                  if (a.section === 'impossible' && !isImpossibleSectionUnlocked()) {
                      // Skip unlocking for now; when the player meets the condition
                      // and the section becomes available the achievement will be
                      // picked up by a subsequent check.
                  } else {
                      achievementStatus[a.key] = true;
                      achievementNew[a.key] = true; // Mark as NEW
                      unlockPlayGamesAchievementForKey(a.key);
                      unlockedAchievementName = a.name;
                      newUnlock = true;
                  }
              }
          }
      });

      if (newUnlock) {
          saveGameData();
          showAchievementNotification(unlockedAchievementName);
      }
  }

  function getAchievementSection(sectionKey) {
      return achievementSections.find(section => section.key === sectionKey) || null;
  }

  function getCompletedAchievementsInSection(sectionKey) {
      const section = getAchievementSection(sectionKey);
      if (!section) return 0;
      return section.achievements.filter(a => achievementStatus[a.key]).length;
  }

  function getSectionProgress(sectionKey) {
      const section = getAchievementSection(sectionKey);
      if (!section) return { total: 0, unlocked: 0, percent: 0 };
      const unlocked = section.achievements.filter(a => achievementStatus[a.key]).length;
      const total = section.achievements.length;
      return { total, unlocked, percent: total ? Math.round((unlocked / total) * 100) : 0 };
  }

  function isImpossibleSectionUnlocked() {
      return getCompletedAchievementsInSection('planets') + getCompletedAchievementsInSection('explore') >= 11;
  }

  function showAchievementSectionMessage(title, text) {
      const overlay = document.getElementById('achievementOverlay');
      const titleEl = document.getElementById('achievementOverlayTitle');
      const textEl = document.getElementById('achievementOverlayText');
      if (!overlay || !titleEl || !textEl) return;
      titleEl.textContent = title;
      textEl.textContent = text;
      overlay.classList.add('active');
      overlay.setAttribute('aria-hidden', 'false');
  }

  function hideAchievementSectionMessage() {
      const overlay = document.getElementById('achievementOverlay');
      if (!overlay) return;
      overlay.classList.remove('active');
      overlay.setAttribute('aria-hidden', 'true');
  }

  function getAchievementProgressSnapshot(achievement, section) {
      const isUnlocked = achievementStatus[achievement.key];

      if (section.key === 'explore') {
          return {
              currentValue: isUnlocked ? 1 : 0,
              target: achievement.target || 1,
              barFill: isUnlocked ? 100 : 0,
              label: `Time ${isUnlocked ? 1 : 0}/${achievement.target || 1}`
          };
      }

      if (achievement.type === 'time') {
          const currentValue = isUnlocked ? 1 : (achievement.key === 'cosmic_dare' && blackHoleApproachEscaped ? 1 : 0);
          return {
              currentValue,
              target: achievement.target || 1,
              barFill: isUnlocked || currentValue >= 1 ? 100 : 0,
              label: `Time ${currentValue}/${achievement.target || 1}`
          };
      }

      if (achievement.type === 'total_stars') {
          const currentValue = Math.min(achievement.target, totalStars);
          return {
              currentValue,
              target: achievement.target,
              barFill: isUnlocked ? 100 : Math.min(100, Math.round((currentValue / achievement.target) * 100)),
              label: `Stars ${currentValue}/${achievement.target}`
          };
      }

      if (achievement.type === 'meteor_count') {
          const currentValue = Math.min(achievement.target, meteorhunts);
          return {
              currentValue,
              target: achievement.target,
              barFill: isUnlocked ? 100 : Math.min(100, Math.round((currentValue / achievement.target) * 100)),
              label: `Hunted ${currentValue}/${achievement.target}`
          };
      }

      if (achievement.type === 'ufo_count') {
          const currentValue = Math.min(achievement.target, ufoDefenders);
          return {
              currentValue,
              target: achievement.target,
              barFill: isUnlocked ? 100 : Math.min(100, Math.round((currentValue / achievement.target) * 100)),
              label: `Destroyed ${currentValue}/${achievement.target}`
          };
      }

      if (achievement.type === 'high_score') {
          const currentValue = Math.min(achievement.target, high);
          return {
              currentValue,
              target: achievement.target,
              barFill: isUnlocked ? 100 : Math.min(100, Math.round((currentValue / achievement.target) * 100)),
              label: `High Score ${currentValue}/${achievement.target}`
          };
      }

      if (achievement.type === 'diff_score') {
          const currentValue = isUnlocked ? 1 : (difficulty === 'impossible' && score >= 1 ? 1 : 0);
          return {
              currentValue,
              target: 1,
              barFill: isUnlocked || currentValue >= 1 ? 100 : 0,
              label: `Score ${currentValue}/1`
          };
      }

      const currentValue = Math.min(achievement.target, high);
      return {
          currentValue,
          target: achievement.target,
          barFill: isUnlocked ? 100 : Math.min(100, Math.round((achievement.target > 0 ? Math.min(1, Math.max(0, high / achievement.target)) : 0) * 100)),
          label: `Score ${currentValue}/${achievement.target}`
      };
  }

  function renderPlanetAchievementRows(section) {
      return section.achievements.map(achievement => {
          const isUnlocked = achievementStatus[achievement.key];
          const progressSnapshot = getAchievementProgressSnapshot(achievement, section);
          const rowBarFill = progressSnapshot.barFill;
          const currentValue = progressSnapshot.currentValue;
          const progressLabel = progressSnapshot.label;
          const newBadge = achievementNew[achievement.key] ? '<span class="new-badge" style="top:6px; right:6px;">1</span>' : '';
          const trophyOverlay = isUnlocked ? '<span style="position:absolute; bottom:-5px; right:-5px; font-size:24px; text-shadow:0 0 4px rgba(0,0,0,0.8);">🏆</span>' : '';
          return `
              <div class="achievementRow" style="position:relative;">
                  ${newBadge}
                  <div style="position:relative; display:inline-block;">
                      <img class="achievementRowIcon" src="${achievement.icon}" alt="${achievement.name}" onerror="this.onerror=null;this.src='https://cdn.jsdelivr.net/gh/twitter/twirpz/files/1f30d.png';">
                      ${trophyOverlay}
                  </div>
                  <div class="achievementRowContent">
                      <div class="achievementRowTitle">${achievement.name}</div>
                      <div class="achievementRowDesc">${achievement.desc}</div>
                      <div class="achievementRowBar">
                          <div class="achievementRowFill" style="width:${rowBarFill}%; background:${section.accent};"></div>
                      </div>
                      <div class="achievementRowMeta">
                          <span>${progressLabel}</span>
                          <span>${isUnlocked ? 'Unlocked' : 'In progress'}</span>
                      </div>
                  </div>
              </div>
          `;
      }).join('');
  }

  function showPlanetAchievementView(section) {
      if (!achievementFullScreen || !achievementFullScreenTitle || !achievementFullScreenContent || !achievementFullScreenBackBtn) return;

      achievementFullScreenTitle.textContent = `${section.title}`;
      achievementFullScreenContent.innerHTML = `
          <div class="achievementRowList active" style="display:flex;">
              ${renderPlanetAchievementRows(section)}
          </div>
      `;

      const hadNewBadges = section.achievements.some(achievement => achievementNew[achievement.key]);
      if (hadNewBadges) {
          section.achievements.forEach(achievement => {
              if (achievementNew[achievement.key]) {
                  achievementNew[achievement.key] = false;
              }
          });
          saveGameData();
          updateMenuButtons();
          if (achievementGrid) refreshAchievementGrid();
      }

      achievementFullScreen.classList.add('active');
      achievementFullScreen.setAttribute('aria-hidden', 'false');
      achievementFullScreenBackBtn.onclick = () => {
          achievementFullScreen.classList.remove('active');
          achievementFullScreen.setAttribute('aria-hidden', 'true');
      };
  }

  function refreshAchievementGrid(){
      let hasNew = false;
      achievementGrid.innerHTML = '';

      const sectionsMarkup = achievementSections.map(section => {
          const progress = getSectionProgress(section.key);
          const locked = section.key === 'impossible' && !isImpossibleSectionUnlocked();
          const buttonClass = `achievementSectionGo${locked ? ' locked' : ''}`;
          const newAchievementsInSection = section.achievements.filter(achievement => achievementNew[achievement.key]).length;
          const sectionBadge = newAchievementsInSection > 0 ? `<span class="new-badge" style="top:0; right:0;">${newAchievementsInSection > 9 ? '9+' : newAchievementsInSection}</span>` : '';

          return `
              <div class="achievementSectionCard" style="position:relative;">
                  ${sectionBadge}
                  <div class="achievementSectionHeader">
                      <div class="achievementSectionIcon" style="color:${section.accent}; border-color:${section.accent};">${section.icon}</div>
                      <div>
                          <h3>${section.title}</h3>
                          <p>${section.achievements.length} achievements</p>
                      </div>
                  </div>
                  <div class="achievementSectionProgress">
                      <div class="achievementSectionBar">
                          <div class="achievementSectionFill" style="width:${progress.percent}%; background:${section.accent};"></div>
                      </div>
                      <div class="achievementSectionMeta">
                          <span>${progress.unlocked}/${progress.total} complete</span>
                          <span>${progress.percent}%</span>
                      </div>
                  </div>
                  <div class="achievementSectionActions">
                      <button class="${buttonClass}" data-section="${section.key}" ${locked ? 'disabled' : ''}>${locked ? '🔒 Go' : 'Go'}</button>
                  </div>
              </div>
          `;
      }).join('');

      achievementGrid.innerHTML = sectionsMarkup;

      achievementGrid.querySelectorAll('.achievementSectionGo').forEach(button => {
          button.addEventListener('click', () => {
              const sectionKey = button.dataset.section;
              if (sectionKey === 'impossible' && !isImpossibleSectionUnlocked()) {
                  showAchievementSectionMessage('Locked', 'First finish previous 11 achievements to begin..');
              } else {
                  const section = getAchievementSection(sectionKey);
                  if (section) {
                      showPlanetAchievementView(section);
                  }
                  playSound('tap');
              }
          });
      });

      const overlayOkBtn = document.getElementById('achievementOverlayOkBtn');
      if (overlayOkBtn) {
          overlayOkBtn.onclick = () => hideAchievementSectionMessage();
      }

      updateMenuButtons();

      // Check if this is the tutorial step for achievements
      if (isTutorialMode && achievementsMenu.style.display === 'flex' && tutorialStep === 4) {
          nextTutorialStep(); // Should move to step 5 (Back button)
      }
  }

  function awardStarsFromScore(matchScore) {
      // Award stars based on match score: 1 star per 20 points
      // Only award if score >= 20
      let earnedStars = 0;
      if (matchScore >= 20) {
          earnedStars = Math.floor(matchScore / 20);
      }
      
    if (earnedStars > 0) addStars(earnedStars);
      if (earnedStars > 0) {
          incrementPlayGamesAchievementForKey('star_hoarder', earnedStars * 10);
          checkAchievements();
      }
  }

  // --- PLANET & DIFFICULTY (existing, refreshPlanetGrid updated to use showLoadingScreen on click) ---

  function refreshPlanetGrid(){
    let hasNew = false;
    planetGrid.innerHTML='';
    planetData.forEach((p,i)=>{
      const cell=document.createElement('div');
      cell.className='planetCell';
      cell.dataset.key = p.key;
      cell.dataset.planet = p.key;

      const isUnlockedByScore = unlocked[i];
      const isLocked = !isUnlockedByScore && p.key !== 'pluto';
      const isSelected = player.planetKey === p.key;

      if (!isLocked && p.key !== 'pluto') {
        cell.classList.add('unlocked');
      }

      let newBadge = planetNew[i] ? '<span class="new-badge">1</span>' : '';
      if (planetNew[i]) hasNew = true;

      cell.style.border = 'none';
      cell.style.boxShadow = 'none';
      cell.tabIndex = 0; // Make focusable for D-pad navigation

      if(p.key === 'pluto'){
        cell.innerHTML=`${newBadge}<div class="big-lock">🔒</div><div>${p.name}</div><div class='lockInfo'>Coming Soon</div>`;
        cell.classList.add('locked');
        cell.onclick = () => {
            showMessage('Coming Soon', 'It will coming soon message');
        };
      } else if(isLocked){
        cell.innerHTML=`${newBadge}<div class="big-lock">🔒</div><div>${p.name}</div><div class='lockInfo'>${p.unlock} Score</div>`;
        cell.classList.add('locked');
        cell.onclick = () => {
            if (high < p.unlock) {
               showMessage('Planet Locked', `You need a High Score of ${p.unlock} to unlock ${p.name}!`);
            } else {
                unlocked[i] = true;
                keyShown[i] = true;
                planetNew[i] = true;
                saveGameData();
                refreshPlanetGrid();
                if (!isTutorialMode) showKeyUnlockPopup();
            }
        };
      } else {
        let unlockInfoText = (p.key === 'earth') ? 'Starting Planet' : '';
        const visualHtml = buildPlanetVisualMarkup(p.key, 40);

        cell.innerHTML=`${newBadge}${visualHtml}<div>${p.name}</div>${isSelected ? '<div style="font-size:12px;color:#0f0;font-weight:bold;">SELECTED ✅</div>' : `<div class='lockInfo'>${unlockInfoText}</div>`}`;

        if(isSelected) {
            cell.style.border = '2px solid #0f0';
            cell.style.boxShadow = '0 0 10px rgba(0,255,0,0.5)';
        }

        cell.onclick=()=>{
          playSound('tap');
          player.planetKey=p.key;
          player.planetIcon=p.icon;
          planetNew[i] = false;
          saveGameData();
          refreshPlanetGrid();
        };
      }
      planetGrid.appendChild(cell);
    });

    // Clear 'new' flags only after the planet menu is actually being viewed
    if (hasNew && planetMenu && planetMenu.style.display === 'flex') {
        planetData.forEach((p, i) => planetNew[i] = false);
        saveGameData();
    }
    updateMenuButtons();

    // Check if this is the tutorial step for planets
    if (isTutorialMode && planetMenu.style.display === 'flex' && tutorialStep === 2) {
        nextTutorialStep(); // Should move to step 3 (Back button)
    }
  }

  function updateMenuButtons() {
      const newPlanetCount = planetNew.filter(Boolean).length;
      const newAchievementCount = Object.values(achievementNew).filter(Boolean).length;
      const planetBadge = newPlanetCount ? `<span class="new-badge badge-counter">${newPlanetCount > 9 ? '9+' : newPlanetCount}</span>` : '';
      const achievementBadge = newAchievementCount ? `<span class="new-badge badge-counter">${newAchievementCount > 9 ? '9+' : newAchievementCount}</span>` : '';

      planetsBtn.innerHTML = `Planets ${planetBadge}`.trim();
      achievementsBtn.innerHTML = `🥇 Achievements ${achievementBadge}`.trim();

      // If in tutorial mode and on step 3, and a new planet is unlocked, proceed
      if (isTutorialMode && newPlanetCount > 0 && tutorialStep === 2) {
          nextTutorialStep();
      }
  }

  function applyDifficulty(){
    if(difficulty==='easy'){gravity=0.5;lift=-9;spawnInterval=3000;baseGapSize=240;}
    else if(difficulty==='medium'){gravity=0.6;lift=-9.5;spawnInterval=2000;baseGapSize=160;}
    else if(difficulty==='hard'){gravity=0.7;lift=-10;spawnInterval=1500;baseGapSize=120;}
    else if(difficulty==='extreme'){gravity=0.8;lift=-10.5;spawnInterval=1200;baseGapSize=100;}
    else if(difficulty==='impossible'){gravity=0.9;lift=-11;spawnInterval=900;baseGapSize=80;}

    adjustGapForOrientation();
    setImpossibleTheme(difficulty === 'impossible');

    document.querySelectorAll('.diffOption').forEach(btn => {
      btn.style.border = (btn.dataset.diff === difficulty) ? '2px solid #0f0' : 'none';
      btn.style.boxShadow = (btn.dataset.diff === difficulty) ? '0 0 10px rgba(0,255,0,0.5)' : 'none';
    });

    // Check if this is the tutorial step for difficulty
    if (isTutorialMode && difficultyMenu.style.display === 'flex' && tutorialStep === 6) {
        nextTutorialStep(); // Move to step 7 (Back button)
    }
  }

  // --- POPUP FUNCTIONS (updated to use new playSound) ---

  function showScorePointPopup(){
    const scorePoint=document.createElement('div');
    scorePoint.className='scorePointPopup';
    scorePoint.textContent='+1';

    const rect = canvas.getBoundingClientRect();
    const x = rect.left + player.x * (rect.width / canvas.width);
    const y = rect.top + player.y * (rect.height / canvas.height);

    scorePoint.style.left = `${x}px`;
    scorePoint.style.top = `${y}px`;

    document.body.appendChild(scorePoint);
    setTimeout(()=>scorePoint.remove(), 800);
  }

  function showHealthPointPopup(){
    const healthPoint=document.createElement('div');
    healthPoint.className='healthPointPopup';
    healthPoint.textContent='-1 ❤️';

    const rect = canvas.getBoundingClientRect();
    const x = rect.left + player.x * (rect.width / canvas.width);
    const y = player.y * (rect.height / canvas.height); // Corrected calculation for y position

    healthPoint.style.left = `${x}px`;
    healthPoint.style.top = `${y}px`;

    document.body.appendChild(healthPoint);
    setTimeout(()=>healthPoint.remove(), 800);
  }

  function showKeyUnlockPopup(){
    const key=document.createElement('div');
    key.className='keyPopup';
    key.textContent='🔑';
    document.body.appendChild(key);
    setTimeout(()=>key.remove(),1200);
    playSound('key'); // UPDATED: Play new key sound
  }

  function showAchievementNotification(name) {
      if (!achievementNotification) return;

      achievementNotification.textContent = `🥇 Achievement Unlocked: ${name}!`;
      achievementNotification.style.display = 'block';
      achievementNotification.classList.remove('show');
      void achievementNotification.offsetWidth;
      achievementNotification.classList.add('show');
      playSound('achievement'); // UPDATED: Play achievement sound

      setTimeout(() => {
          achievementNotification.classList.remove('show');
          setTimeout(() => {
              achievementNotification.style.display = 'none';
              updateMenuButtons(); // Ensure button updates after notification
          }, 350);
      }, 4000);
  }

  // --- DAILY REWARD FUNCTIONS ---

  function isDailyRewardAvailable() {
      if (rewardWeekCompleted) return false;

      const now = Date.now();

      if (lastRewardClaimTime === 0) {
          // First time - reward is available immediately
          return true;
      }

      // Check if 24 hours have passed since last claim
      const hours24 = 24 * 60 * 60 * 1000;
      return (now - lastRewardClaimTime) >= hours24;
  }

  function getCurrentRewardDay() {
      // currentRewardDay is already the next available day
      return currentRewardDay;
  }

  function showDailyRewardMenu() {
      // Hide all other menus, screens, and overlays
      menu.style.display = 'none';
      planetMenu.style.display = 'none';
      difficultyMenu.style.display = 'none';
      achievementsMenu.style.display = 'none';
      pauseMenu.style.display = 'none';
      continueChoiceMenu.style.display = 'none';
      gameWrap.style.display = 'block';
      profileCard.style.display = 'none';
      document.querySelectorAll('.screen').forEach(s => s.style.display = 'none');
      if (typeof splash_loading !== 'undefined' && splash_loading) {
          splash_loading.style.display = 'none';
      }

      // Pause in-game audio during reward screen
      if (sounds.menu) {
          sounds.menu.pause();
          sounds.menu.currentTime = 0;
          sounds.menu.muted = true;
      }
      if (bgAudio) {
          bgAudio.pause();
          bgAudio.currentTime = 0;
          bgAudio.muted = true;
      }

      // Show daily reward menu full screen
      dailyRewardMenu.style.position = 'fixed';
      dailyRewardMenu.style.top = '0';
      dailyRewardMenu.style.left = '0';
      dailyRewardMenu.style.right = '0';
      dailyRewardMenu.style.bottom = '0';
      dailyRewardMenu.style.width = '100vw';
      dailyRewardMenu.style.height = '100vh';
      dailyRewardMenu.style.display = 'flex';
      dailyRewardMenu.style.flexDirection = 'column';
      dailyRewardMenu.style.visibility = 'visible';
      if (stagesBtn) stagesBtn.style.display = 'none';
      dailyRewardMenu.style.opacity = '1';
      dailyRewardMenu.style.zIndex = '100500';
      refreshRewardGrid();
      focusFirstVisibleButton();

      // Start notification pulse if reward is available
      if (isDailyRewardAvailable()) {
          playVibrationSound();
      }
  }

  function refreshRewardGrid() {
      rewardGrid.innerHTML = '';

      dailyRewards.forEach(reward => {
          const item = document.createElement('div');
          item.className = 'reward-item';

          if (rewardWeekCompleted || reward.day < currentRewardDay) {
              item.classList.add('collected');
          } else if (reward.day === currentRewardDay && isDailyRewardAvailable()) {
              item.classList.add('available');
          }

          if (reward.type === 'planet') {
              item.classList.add('earth');
          } else if (reward.type === 'stars') {
              item.classList.add('star');
          } else if (reward.type === 'mystery') {
              item.classList.add('mystery');
          }

          item.innerHTML = `
              <div class="day">Day ${reward.day}</div>
              <div class="icon">${reward.icon}</div>
              <div class="name">${reward.name}</div>
          `;

          if (item.classList.contains('collected')) {
              item.innerHTML += `<div class="status">Claimed</div>`;
          } else if (item.classList.contains('available')) {
              item.innerHTML += `<div class="status available">Available</div>`;
          }

          item.tabIndex = 0; // Make focusable for D-pad navigation
          rewardGrid.appendChild(item);
      });

      // Show collect button if reward is available
      if (isDailyRewardAvailable() && !rewardWeekCompleted) {
          collectRewardBtn.style.display = 'block';
      } else {
          collectRewardBtn.style.display = 'none';
      }
  }

  function playVibrationSound() {
      stopVibrationSound();
      if (!audioOn) return;

      const playPulse = () => {
          const vibrationSound = new Audio('music/noti.mp3');
          vibrationSound.volume = 0.35;
          vibrationSound.play().catch(err => console.log('vibration sound error:', err));
          window.vibrationAudio = vibrationSound;
          setTimeout(() => {
              if (window.vibrationAudio === vibrationSound) {
                  window.vibrationAudio.pause();
                  window.vibrationAudio = null;
              }
          }, 1400);
      };

      playPulse();
      window.vibrationInterval = setInterval(playPulse, 2000);
  }

  function stopVibrationSound() {
      if (window.vibrationInterval) {
          clearInterval(window.vibrationInterval);
          window.vibrationInterval = null;
      }
      if (window.vibrationAudio) {
          window.vibrationAudio.pause();
          window.vibrationAudio = null;
      }
  }

  function stopDailyRewardAudio() {
      stopVibrationSound();
      if (sounds.menu) {
          sounds.menu.pause();
      }
      if (bgAudio) {
          bgAudio.pause();
      }
  }

  window.addEventListener('pagehide', stopDailyRewardAudio);
  window.addEventListener('beforeunload', stopDailyRewardAudio);
  window.addEventListener('unload', stopDailyRewardAudio);
  document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
          stopDailyRewardAudio();
      }
  });

  function collectDailyReward() {
      if (!isDailyRewardAvailable() || rewardWeekCompleted) return;

      const reward = dailyRewards.find(r => r.day === currentRewardDay);
      if (!reward) return;

      stopVibrationSound();
      playSound('reward_collect');

      if (reward.type === 'planet') {
          unlocked[0] = true;
          planetNew[0] = true;
          updateMenuButtons();
      } else if (reward.type === 'stars') {
          addStars(reward.amount);
          if (reward.amount > 0) {
              incrementPlayGamesAchievementForKey('star_hoarder', reward.amount * 10);
              checkAchievements();
          }
      }

      lastRewardClaimTime = Date.now();
      currentRewardDay++;
      if (currentRewardDay > 7) {
          rewardWeekCompleted = true;
          currentRewardDay = 1;
      }
      saveGameData();

      dailyRewardMenu.style.display = 'none';
      showLoadingScreen(() => {
          showMenu();
          setTimeout(() => {
              animateRewardCollection(reward);
              playSound('end');
          }, 500);
      });
  }

  function animateRewardCollection(reward) {
      const animElement = document.createElement('div');
      animElement.className = 'reward-animation';
      animElement.style.left = (window.innerWidth / 2) + 'px';
      animElement.style.top = (window.innerHeight / 2) + 'px';

      if (reward.type === 'planet') {
          animElement.textContent = '🌍';
          animElement.style.animation = 'flyToMenuPlanet 1.3s forwards';
      } else if (reward.type === 'stars') {
          animElement.textContent = '⭐';
          animElement.style.animation = 'flyToMenuStars 1.3s forwards';
      } else {
          animElement.textContent = '?';
          animElement.style.animation = 'mysteryPulse 1.3s forwards';
      }

      document.body.appendChild(animElement);
      setTimeout(() => {
          if (animElement.parentNode) {
              animElement.parentNode.removeChild(animElement);
          }
      }, 1400);
  }

  // --- GAME LOGIC (updated for door screen calls and new playSound) ---

  // Flap handler (updated)
  function flap(){ player.vy=lift; if(running && audioOn){ playSound('jump'); } } // UPDATED: Play jump sound

  function updateJumpControlButtonVisibility() {
      if (!jumpControlBtn) return;
      const isButtonMode = getGameplayControls() === 'button';
      const shouldShow = isButtonMode && running && !gameOver.style.display.includes('flex') && pauseMenu.style.display === 'none' && menu.style.display === 'none' && stagesOverlay.style.display !== 'flex' && (!newHighScoreOverlay || newHighScoreOverlay.style.display !== 'flex') && (!stageTransitionOverlay || stageTransitionOverlay.style.display !== 'flex');
      jumpControlBtn.style.display = shouldShow ? 'flex' : 'none';
  }

  function triggerJumpFromControlButton(event) {
      if (event) {
          event.preventDefault();
          event.stopPropagation();
      }
      if (!running || gameOver.style.display.includes('flex') || pauseMenu.style.display !== 'none' || menu.style.display !== 'none') {
          return;
      }
      flap();
  }
  
  // Comprehensive keyboard shortcuts for PC and Android TV
  window.addEventListener('keydown', function(e) {
      const key = e.key.toLowerCase();
      const isSelectKey = e.keyCode === 13 || e.keyCode === 23 || key === 'select' || key === 'enter';
      const isBackKey = key === 'escape' || key === 'back' || key === 'browserback' || e.keyCode === 27 || e.keyCode === 4 || e.keyCode === 8 || e.keyCode === 10009 || key === 'backspace';
      
      const activeElement = document.activeElement;
      const isTypingTextInput = activeElement &&
          (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA') &&
          ['text', 'search', 'url', 'tel', 'email', 'password', 'number'].includes(activeElement.type);
      const splashNameElement = document.getElementById('splash_name');
      const nameEntryActive = splashNameElement && !splashNameElement.classList.contains('hidden');
      const profileModalActive = editNicknameModal.classList.contains('show');
      const profileNameInputActive = document.activeElement === nicknameInput;
      const isDirectionalKey = ['arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key);
      const isTypingNameField = nameEntryActive || (profileModalActive && profileNameInputActive) || (!profileModalActive && isTypingTextInput);

      if (isSelectKey) {
          // Gameplay select button should flap during active gameplay
          if (running && !gameOver.style.display.includes('flex') && pauseMenu.style.display === 'none' && stagesOverlay.style.display !== 'flex' &&
              (!newHighScoreOverlay || newHighScoreOverlay.style.display !== 'flex') &&
              (!stageTransitionOverlay || stageTransitionOverlay.style.display !== 'flex') &&
              dialogOverlay && dialogOverlay.classList.contains('hidden')) {
              flap();
              e.preventDefault();
              return;
          }

          if (newHighScoreOverlay && newHighScoreOverlay.style.display === 'flex') {
              hideNewHighScoreOverlay();
              e.preventDefault();
              return;
          }

          if (stageTransitionOverlay && stageTransitionOverlay.style.display === 'flex') {
              if (beginGameBtn && beginGameBtn.style.display !== 'none') {
                  beginGameBtn.click();
              } else {
                  maybeSkipStageTransition();
              }
              e.preventDefault();
              return;
          }

          if (dialogOverlay && !dialogOverlay.classList.contains('hidden')) {
              if (dialogConfirmBtn) dialogConfirmBtn.click();
              e.preventDefault();
              return;
          }

          if (activeElement && (activeElement.tagName === 'BUTTON' || activeElement.classList.contains('diffOption') || activeElement.classList.contains('profile-card') || activeElement.classList.contains('planetCell') || activeElement.classList.contains('achievementItem') || activeElement.classList.contains('stageCard') || activeElement.classList.contains('reward-item') || activeElement.classList.contains('stage-card') || activeElement.classList.contains('stage-all-card'))) {
              activeElement.click();
              e.preventDefault();
              return;
          }

          const firstVisibleAction = Array.from(document.querySelectorAll('button, .diffOption, .planetCell, .achievementItem, .stageCard, .reward-item, .stage-card, .stage-all-card'))
              .find(el => el.offsetParent !== null && window.getComputedStyle(el).visibility !== 'hidden');
          if (firstVisibleAction) {
              firstVisibleAction.focus({ preventScroll: true });
              e.preventDefault();
              return;
          }
      }

      // Disable shortcut actions while typing, but keep D-pad navigation working
      if (isTypingNameField) {
          if (!isDirectionalKey && key !== 'enter' && key !== 'tab') {
              return;
          }
      }

      // Global sound toggle shortcut: S toggles audio everywhere except during name entry.
      if (key === 's' && !isTypingNameField) {
          e.preventDefault();
          toggleMute();
          return;
      }

      // Prevent default behavior for our shortcuts, but allow typing letters in the profile nickname input
      if (!profileNameInputActive && [' ', 'b', 'y', 'n', 'p', 'c', 'd', 'a', 's', 'q', 'm', 'f', 'v', 'escape', 'pageup', 'pagedown', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
          e.preventDefault();
      }
      
      // Space for flap (gameplay)
      if (key === ' ' && !document.getElementById('gameWrap').style.display.includes('none')) {
          flap();
          return;
      }

      // D-pad should also flap during active gameplay.
      if (running && !gameOver.style.display.includes('flex') && pauseMenu.style.display === 'none' && stagesOverlay.style.display !== 'flex' && ['arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
          flap();
          return;
      }
      
      // Android TV D-pad navigation: Up/down scroll the stages overlay panel, left/right keep normal button focus behavior.
      if ((key === 'arrowup' || key === 'arrowdown') && stagesOverlay.style.display === 'flex') {
          const stagesPanel = document.querySelector('.stages-panel');
          if (stagesPanel) {
              const scrollAmount = (key === 'arrowdown') ? 80 : -80;
              stagesPanel.scrollBy({ top: scrollAmount, behavior: 'smooth' });
              return;
          }
      }
      
      // Android TV D-pad navigation: Arrow keys to move focus between buttons
      if (key === 'arrowup' || key === 'arrowdown' || key === 'arrowleft' || key === 'arrowright') {
          // Get all visible buttons and focusable cards that can receive focus on the current screen/menu
          let allButtons = Array.from(document.querySelectorAll('button, .notification-btn, .diffOption, .profile-card, input, .planetCell, .achievementItem, .stageCard, .reward-item, .stage-card, .stage-all-card'));
          
          // Filter to only visible buttons
          let visibleButtons = allButtons.filter(btn => {
              let style = window.getComputedStyle(btn);
              let isVisible = style.display !== 'none' && style.visibility !== 'hidden' && btn.offsetParent !== null;
              
              // Check if button is within a visible container
              if (isVisible) {
                  let parent = btn.parentElement;
                  while (parent && parent !== document.body) {
                      let parentStyle = window.getComputedStyle(parent);
                      if (parentStyle.display === 'none' || parentStyle.visibility === 'hidden') {
                          return false;
                      }
                      parent = parent.parentElement;
                  }
              }
              return isVisible;
          });
          
          if (visibleButtons.length === 0) return;
          
          let currentIndex = visibleButtons.indexOf(document.activeElement);
          let nextIndex = currentIndex;
          
          // Handle navigation based on arrow key
          if (key === 'arrowdown' || key === 'arrowright') {
              nextIndex = (currentIndex + 1) % visibleButtons.length;
          } else if (key === 'arrowup' || key === 'arrowleft') {
              nextIndex = (currentIndex - 1 + visibleButtons.length) % visibleButtons.length;
          }
          
          visibleButtons[nextIndex].focus();
          return;
      }
      
      // Scrolling support for menus (Page Up/Down for TV remote)
      if (key === 'pageup' || key === 'pagedown') {
          let scrollableElement = null;
          const scrollAmount = key === 'pageup' ? -80 : 80;
          
          // Check which menu is open and get the scrollable element
          if (achievementsMenu.style.display === 'flex') {
              scrollableElement = achievementGrid;
          } else if (planetMenu.style.display === 'flex') {
              scrollableElement = planetGrid;
          } else if (stagesOverlay.style.display === 'flex') {
              const stagesPanel = document.querySelector('.stages-panel');
              if (stagesPanel) {
                  scrollableElement = stagesPanel;
              }
          } else if (dailyRewardMenu.style.display === 'flex') {
              // Daily reward menu is not scrollable
          }
          
          // Scroll if we found a scrollable element
          if (scrollableElement) {
              scrollableElement.scrollBy({ top: scrollAmount, behavior: 'smooth' });
              return;
          }
      }
      
      // Tutorial shortcuts
      if (isTutorialMode && key === 'b') {
          nextTutorialStep();
          return;
      }
      
      // Yes/No modal shortcuts
      if (updateModalActive) {
          if (key === 'y') {
              handleUpdateYes();
          } else if (key === 'n') {
              handleUpdateNo();
          }
          return;
      }
      
      if (rateModalActive) {
          if (key === 'y') {
              handleRateYes();
          } else if (key === 'n') {
              handleRateNo();
          }
          return;
      }
      
      // Dialog overlay shortcuts (for quit confirmation, reset, etc.)
      if (!dialogOverlay.classList.contains('hidden')) {
          if (key === 'y') {
              dialogConfirmBtn.click();
          } else if (key === 'n' || isBackKey) {
              dialogCancelBtn.click();
          }
          return;
      }

      // Daily reward menu shortcut
      if (dailyRewardMenu.style.display === 'flex' && key === 'c' && collectRewardBtn.style.display !== 'none') {
          collectRewardBtn.click();
          return;
      }
      
      // Menu shortcuts
      if (menu.style.display === 'flex') {
          // Allow Play shortcut in family mode so the overlay still opens.
          if (gameMode === 'family' && ['c', 'd', 'a'].includes(key)) {
              return;
          }
      }

      // Stage overlay keyboard handling
      if (stagesOverlay.style.display === 'flex') {
          if (isBackKey) {
              closeStagesBtn.click();
          }
          return;
      }

      // Profile modal keyboard handling
      if (profileModalActive) {
          if (profileNameInputActive) {
              return;
          }
          if (key === 'm') {
              saveNicknameBtn.click();
          } else if (key === 'c') {
              cancelNicknameBtn.click();
          } else if (isBackKey) {
              closeProfileModal.click();
          }
          return;
      }

      // Menu shortcuts
      if (menu.style.display === 'flex') {
          // In family mode, keep Play active but ignore other menu shortcuts that don't apply.
          if (gameMode === 'family' && ['c', 'd', 'a'].includes(key)) {
              return;
          }
          if (key === 'p') {
              playBtn.click();
          } else if (key === 'c') {
              planetsBtn.click();
          } else if (key === 'd') {
              difficultyBtn.click();
          } else if (key === 'a') {
              achievementsBtn.click();
          } else if (key === 'm') {
              stagesBtn.click();
          } else if (key === 'f') {
              profileCard.click();
          } else if (key === 'q') {
              quitBtn.click();
          }
          return;
      }
      
      // Sub-menu back buttons - also respond to TV back button
      if (planetMenu.style.display === 'flex' && isBackKey) {
          closePlanetBtn.click();
          return;
      }
      
      if (difficultyMenu.style.display === 'flex' && isBackKey) {
          closeDiffBtn.click();
          return;
      }
      
      if (achievementsMenu.style.display === 'flex' && isBackKey) {
          closeAchievementsBtn.click();
          return;
      }
      
      // Gameplay shortcuts
      if (running && key === 'p') {
          pauseBtn.click();
          return;
      }
      
      // Quit during gameplay
      if (running && key === 'q') {
          quitBtn.click();
          return;
      }
      
      // Game over shortcuts
      if (gameOver.style.display === 'flex') {
          if (key === 'p') {
              playAgainBtn.click();
          } else if (key === 'm') {
              backMenuBtn.click();
          }
          return;
      }
      
      // Pause menu shortcuts
      if (pauseMenu.style.display === 'flex') {
          if (key === 'p' || isBackKey) {
              resumeBtn.click();
          } else if (key === 'v') {
              saveMenuBtn.click();
          } else if (key === 'q') {
              quitMenuBtn.click();
          }
          return;
      }
      
      // Android TV back button handling (Escape key, Backspace, or TV back keyCode 4)
      if (isBackKey) {
          if (running) {
              pauseGame();
          } else if (newHighScoreOverlay && newHighScoreOverlay.style.display === 'flex') {
              hideNewHighScoreOverlay();
              showMenu();
              focusFirstVisibleButton();
          } else if (gameOver.style.display === 'flex') {
              backMenuBtn.click();
          } else if (dailyRewardMenu.style.display === 'flex') {
              stopDailyRewardAudio();
              showMenu();
              focusFirstVisibleButton();
          } else if (stagesOverlay.style.display === 'flex') {
              closeStagesBtn.click();
          } else if (profileModalActive) {
              closeProfileModal.click();
          } else if (planetMenu.style.display === 'flex') {
              closePlanetBtn.click();
          } else if (difficultyMenu.style.display === 'flex') {
              closeDiffBtn.click();
          } else if (achievementsMenu.style.display === 'flex') {
              closeAchievementsBtn.click();
          } else if (pauseMenu.style.display === 'flex') {
              resumeBtn.click();
          } else if (menu.style.display === 'flex') {
              quitBtn.click();
          } else {
              hideAllScreens();
              showMenu();
              focusFirstVisibleButton();
          }
          e.preventDefault();
          return;
      }
  });
  
  function handleCanvasJumpInteraction(event) {
      const isTouchInput = event.type === 'touchstart' || event.pointerType === 'touch';
      if (getGameplayControls() === 'button' && isTouchInput) {
          event.preventDefault();
          event.stopPropagation();
          return;
      }

      if (event.type === 'mousedown' && (event.button === 0 || event.button === 2)) {
          event.preventDefault();
          flap();
      } else if (event.type === 'pointerdown' && event.pointerType !== 'touch' && (event.button === 0 || event.button === 2)) {
          event.preventDefault();
          flap();
      } else if (event.type === 'touchstart') {
          flap();
      }
  }

  canvas.addEventListener('pointerdown', handleCanvasJumpInteraction);
  canvas.addEventListener('mousedown', handleCanvasJumpInteraction); // Left (0) and Right (2) click
  canvas.addEventListener('contextmenu',e=>{ e.preventDefault(); }); // Prevent context menu on right click
  canvas.addEventListener('touchstart', handleCanvasJumpInteraction, { passive: false });

  if (jumpControlBtn) {
      jumpControlBtn.addEventListener('click', triggerJumpFromControlButton);
      jumpControlBtn.addEventListener('touchstart', (event) => {
          event.preventDefault();
          event.stopPropagation();
          triggerJumpFromControlButton(event);
      }, { passive: false });
  }

  setInterval(updateJumpControlButtonVisibility, 250);

  // Tap Sound Handler (updated)
  document.addEventListener('click',e=>{
      unlockAudio();
      if(e.target && e.target.tagName==='BUTTON' && audioOn){ playSound('tap'); }
  }); // UPDATED: Play tap sound

  function enableKeyboardNavigation() {
      document.body.classList.add('user-is-tabbing');
  }

  function disableKeyboardNavigation() {
      document.body.classList.remove('user-is-tabbing');
  }

  window.addEventListener('keydown', function(e) {
      const key = e.key.toLowerCase();
      if (['tab', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'enter', 'space'].includes(key)) {
          enableKeyboardNavigation();
      }
  });

  window.addEventListener('mousedown', disableKeyboardNavigation);
  window.addEventListener('touchstart', disableKeyboardNavigation);

  // Volume and Quit Buttons (updated for door screen calls)
  volumeBtn.onclick=()=>{
      if (audioOn) { playSound('tap'); } else { /* no sound if audioOff */ }
      toggleMute(); // UPDATED: Use the new toggleMute function
  };
  if (volumeBtnFixed) {
      volumeBtnFixed.onclick = volumeBtn.onclick;
      volumeBtnFixed.textContent = volumeBtn.textContent;
  }
  quitBtn.onclick=()=>{
      if (audioOn) playSound('tap');
      
      // Check if we're on the main menu
      if (menu.style.display !== 'none') {
          // On main menu - show quit confirmation
          showDialog({
              title: 'Confirm Quit',
              text: 'Do you sure you want leave the flight?',
              confirmText: 'Yes',
              cancelText: 'No',
              onConfirm: () => {
                  try {
                      if (typeof Android !== "undefined" && Android.quit) {
                          Android.quit();
                      } else {
                          throw new Error('Android not available');
                      }
                  } catch (e) {
                      console.error('Failed to quit:', e);
                      showMessage('Error', '409: cant connect to the operating system');
                  }
              }
          });
      } else {
          // In gameplay or other screens - go back to menu
          const exitToMenu = () => {
              applyPlanetUnlocksForScore(score, { showKeyPopup: false });
              resetGame();
              showMenu();
          };
          if (maybeShowNewHighScoreThen(() => {
              showLoadingScreen(exitToMenu);
          })) {
              return;
          }
          showLoadingScreen(exitToMenu);
      }
  };

  // Pause controls
  pauseBtn.addEventListener('click', () => {
      // Only allow pause during active gameplay
      if (!running) return;
      if (audioOn) playSound('tap');
      wasAutoPausedOnBlur = false; // Reset flag - this is a manual pause
      pauseGame();
  });
  resumeBtn.addEventListener('click', () => {
      if (audioOn) playSound('tap');
      const countdown = document.getElementById('continueCountdown');
      let timer = 3;
      countdown.textContent = `Resume in ${timer}`;
      countdown.style.display = 'block';
      pauseMenu.style.display = 'none';
      const intervalId = setInterval(() => {
          timer--;
          if(timer <= 0){
              clearInterval(intervalId);
              countdown.style.display = 'none';
              const canvas = document.getElementById('c');
              canvas.style.pointerEvents = 'auto';
              canvas.style.zIndex = 'auto';
              lastTime = performance.now();
              running = true;
              syncPlayerPlanetOverlay();
              updateAudioForCurrentMode();
          } else {
              countdown.textContent = `Resume in ${timer}`;
              syncPlayerPlanetOverlay();
          }
      }, 1000);
  });
  saveMenuBtn.addEventListener('click', () => {
      if (audioOn) playSound('tap');
      exitToMenuFromPause();
  });
  quitMenuBtn.addEventListener('click', () => {
      if (audioOn) playSound('tap');
      exitToMenuAndReset();
  });
  continueGameBtn.onclick = () => {
      if (audioOn) {
          playSound('tap');
          setupResumeAudioOnTap();
      }
      stopJourneyBarAnimation();
      continueChoiceMenu.style.display = 'none';
      if (stagesBtn) stagesBtn.style.display = 'none';
      menu.style.display='none';
      sounds.menu.pause();
      resumeSavedGame();
  };
  newGameBtn.onclick = () => {
      if (audioOn) playSound('tap');
      continueChoiceMenu.style.display = 'none';
      if (stagesBtn) stagesBtn.style.display = 'none';
      showLoadingScreen(() => {
          menu.style.display='none';
          start();
          if(audioOn) tryPlayBackgroundMusic();
      });
  };

  // Default button handlers (updated to use showLoadingScreen)
  restoreMenuButtonFunctions(); // Set default handlers on load

    // Ensure Play opens family chooser in Family mode even if other handlers interfere
    try {
        if (playBtn && !playBtn.dataset.familyClickAdded) {
            playBtn.addEventListener('click', (e) => {
                if (isFamilyModeActive()) {
                    e.preventDefault();
                    e.stopPropagation();
                    showPartyChooser();
                }
            }, true); // capture to run before other listeners
            playBtn.dataset.familyClickAdded = '1';
        }
    } catch (e) { console.warn('Failed to attach family play handler', e); }

  // Game Over Buttons (updated to use showLoadingScreen)
  playAgainBtn.onclick=()=>{
      stopJourneyBarAnimation();
      clearSavedGameState(); // Clear saved state when user explicitly plays again
      showLoadingScreen(() => {
          isOnDeathScreen = false; // No longer on death screen
          gameOver.style.display='none';
          start();
          isGoalReached = false;
      });
  };
  backMenuBtn.onclick=()=>{
      stopJourneyBarAnimation();
      clearSavedGameState(); // Clear saved state when user explicitly goes back
      showLoadingScreen(() => {
          isOnDeathScreen = false; // No longer on death screen
          gameOver.style.display='none';
          showMenu();
          isGoalReached = false;

          // Check for tutorial interruption (existing logic)
          if (isTutorialMode) {
               if (score === TUTORIAL_GOAL_1 && tutorialStep === 1) {
                  // After scoring 1 point and dying (forced death)
                  tutorialStep = 1;
                  showDialog({
                      title: 'Tutorial Update',
                      text: `Great job, Pilot! You scored ${score} point. Your next goal is to score ${TUTORIAL_GOAL_2} points to unlock the Mars planet. Tap 'Play' to continue the guide.`,
                      confirmText: 'Continue',
                      showCancel: false,
                      onConfirm: nextTutorialStep
                  });
               } else if (score >= TUTORIAL_GOAL_2 && tutorialStep < 3) {
                  // After scoring 10 points and dying (forced death)
                  showDialog({
                      title: 'Tutorial Update',
                      text: `Incredible! You scored ${score} points and unlocked a new planet! Let's check the menu features.`,
                      confirmText: 'Continue',
                      showCancel: false,
                      onConfirm: () => {
                          tutorialStep = 2;
                          nextTutorialStep();
                      }
                  });
               }
          }
      });
  };

  gameOver.addEventListener('click', e => {
      if (isJourneyAnimationPlaying && e.target.tagName === 'BUTTON') {
          stopJourneyBarAnimation();
      }
  });

  // Difficulty Options (with door animation only for menu transitions)
  document.querySelectorAll('.diffOption').forEach(btn=>{
      btn.onclick=()=>{
          if (audioOn) playSound('tap');
          const selectedDiff = btn.dataset.diff;
          difficulty = selectedDiff;
          applyDifficulty();
          saveGameData();
          if (selectedDiff === 'impossible') {
              if (!impossibleModeActive) {
                  triggerImpossibleTransition();
              }
          } else if (impossibleModeActive) {
              setImpossibleTheme(false);
              updateAudioForCurrentMode();
          }
      };
  });


  function spawnObstacle(){ const top=40+Math.random()*(canvas.height-gapSize-80); obstacles.push({x:canvas.width,top:top,gap:gapSize,passed:false}); }
  function spawnMeteor(){ meteors.push({x:canvas.width,y:50+Math.random()*(canvas.height-100),r:15+Math.random()*15}); }
  function spawnAlien(){
    aliens.push({
      x: canvas.width,
      y: Math.random()*(canvas.height-100)+50, // Initial vertical position
      vy: 0, // UFO now moves straight horizontally
      acidBalls: [],
      lastShot: 0,
      shootInterval: 1500 + Math.random() * 1000,
      dodge: null
    });
  }

  function spawnShuriken(){
    if (shurikens.length > 0) return;
    const spawnY = Math.random() < 0.5 
      ? canvas.height / 3 + Math.random() * (canvas.height / 6)
      : canvas.height / 2 + Math.random() * (canvas.height / 6) - canvas.height / 12;
    const r = 15 + Math.random() * 15;
    shurikens.push({
      x: -r,
      y: spawnY,
      r: r,
      vx: 200,
      vy: 0,
      hit: false,
      target: null
    });
  }

  function spawnIcyHole(){
        if (icyTrapState || icyHoles.length > 0) return;
        // Spawn smaller icy holes so they don't overwhelm the scene
        icyHoles.push({
            x: canvas.width + 90,
            y: Math.random() * (canvas.height - 120) + 60,
            r: 38 + Math.random() * 8, // smaller radius (approx 38-46)
            speed: 110 + Math.random() * 25,
            triggered: false,
            drift: Math.random() * 0.6 + 0.4
        });
  }

  function removeIcyHole(hole){
    if (!hole) return;
    const index = icyHoles.indexOf(hole);
    if (index >= 0) icyHoles.splice(index, 1);
  }

  function ensureIcyTrapOverlay(){
    if (icyTrapOverlay) return icyTrapOverlay;
    const wrap = document.getElementById('gameWrap');
    if (!wrap) return null;
    icyTrapOverlay = document.createElement('div');
    icyTrapOverlay.className = 'icy-trap-overlay hidden';
    icyTrapOverlay.style.display = 'none';
    icyTrapOverlay.innerHTML = `
      <div class="icy-trap-card">
        <div class="icy-trap-title">Icy Hole</div>
        <div class="icy-trap-timer-wrap"><div class="icy-trap-timer">7</div></div>
        <div class="icy-trap-question">Solve the escape code</div>
        <div class="icy-trap-options"></div>
      </div>`;
    wrap.appendChild(icyTrapOverlay);
    icyTrapQuestionEl = icyTrapOverlay.querySelector('.icy-trap-question');
    icyTrapTimerEl = icyTrapOverlay.querySelector('.icy-trap-timer');
    icyTrapOptionsEl = icyTrapOverlay.querySelector('.icy-trap-options');
    return icyTrapOverlay;
  }

  function showIcyTrapOverlay(){
    const overlay = ensureIcyTrapOverlay();
    if (!overlay) return;
    const useSubtraction = Math.random() < 0.5;
    let a = 3 + Math.floor(Math.random() * 8);
    let b = 2 + Math.floor(Math.random() * 9);
    if (useSubtraction) {
      a = b + 1 + Math.floor(Math.random() * 4);
    }
    const answer = useSubtraction ? a - b : a + b;
    const prompt = useSubtraction ? `${a} - ${b}` : `${a} + ${b}`;
    const baseOptions = [answer, answer + 2, answer + 5, answer + 1];
    const uniqueOptions = Array.from(new Set(baseOptions.filter(v => v > 0)));
    while (uniqueOptions.length < 4) {
      const candidate = answer + uniqueOptions.length + 1;
      if (!uniqueOptions.includes(candidate)) uniqueOptions.push(candidate);
    }
    icyTrapQuestionEl.textContent = prompt + ' = ?';
    icyTrapTimerEl.textContent = '7';
    icyTrapOptionsEl.innerHTML = '';
    uniqueOptions.sort(() => Math.random() - 0.5).forEach(option => {
      const button = document.createElement('button');
      button.className = 'icy-trap-option';
      button.textContent = option;
      button.onclick = () => resolveIcyTrap(option);
      icyTrapOptionsEl.appendChild(button);
    });
    icyTrapOverlay.classList.remove('hidden');
    icyTrapOverlay.style.display = 'flex';
    icyTrapState.questionAnswer = answer;
  }

  function hideIcyTrapOverlay(){
    if (icyTrapOverlay) {
      icyTrapOverlay.classList.add('hidden');
      icyTrapOverlay.style.display = 'none';
    }
  }

  function triggerIcyTrap(hole){
    if (icyTrapState || !running) return;
    removeIcyHole(hole);
    icyTrapState = {
      hole: hole,
      phase: 'frozen',
      timeLeft: 7000,
      questionAnswer: 0,
      breakProgress: 0,
      breakMax: 800
    };
    running = false;
    player.vy = 0;
    if (audioOn) {
      stopSound('freeze');
      playSound('freeze');
    }
    showIcyTrapOverlay();
    checkAchievements();
  }

  function resolveIcyTrap(choice){
    if (!icyTrapState) return;
    if (choice === icyTrapState.questionAnswer) {
      icyTrapEscaped = true;
      if (audioOn) {
        stopSound('freeze');
        playSound('unfreeze');
      }
      icyTrapState.phase = 'breaking';
      hideIcyTrapOverlay();
      icyTrapState.breakProgress = 0;
      checkAchievements();
    } else {
      failIcyTrap();
    }
  }

  function failIcyTrap(){
    if (!icyTrapState) return;
    deathTypeCode = 'dead:006';
    if (audioOn) stopSound('freeze');
    removeIcyHole(icyTrapState.hole);
    icyTrapState = null;
    hideIcyTrapOverlay();
    hitObstacle();
  }

  function updateIcyTrapState(dt){
    if (!icyTrapState) return;
    if (icyTrapState.phase === 'frozen') {
      icyTrapState.timeLeft = Math.max(0, icyTrapState.timeLeft - dt);
      const seconds = Math.max(1, Math.ceil(icyTrapState.timeLeft / 1000));
      if (icyTrapTimerEl) icyTrapTimerEl.textContent = seconds;
      if (icyTrapState.timeLeft <= 0) {
        failIcyTrap();
      }
    } else if (icyTrapState.phase === 'breaking') {
      icyTrapState.breakProgress += dt;
      if (icyTrapState.breakProgress >= icyTrapState.breakMax) {
        icyTrapState = null;
        hideIcyTrapOverlay();
        running = true;
        player.vy = 0;
      }
    }
  }

  function update(dt){
    if (!running && !eatingBlackHole && !icyTrapState) return;
    const dtSeconds = dt/1000;

    updateIcyTrapState(dt);

    if (icyTrapState && icyTrapState.phase === 'frozen') {
      return;
    }

    if (running) {
      lastSpawn+=dt; if(lastSpawn>spawnInterval){ lastSpawn=0; spawnObstacle(); }

      // Exact score-triggered events
      const shouldSpawnIcyHole = (score === 75 && lastIcyHoleSpawnScore < 75) || (score > 75 && score % 15 === 0 && score - lastIcyHoleSpawnScore >= 15);
      if (shouldSpawnIcyHole) {
          lastIcyHoleSpawnScore = score;
          spawnIcyHole();
      }

      // Black holes spawn every 5 points after 25
      let blackHoleSpawnedThisTick = false;
      if (score >= 25 && score - lastBlackHoleSpawnScore >= 5) {
          lastBlackHoleSpawnScore = score;
          blackHoles.push({x:canvas.width,y:Math.random()*(canvas.height-150)+75,r:40});
          blackHoleSpawnedThisTick = true;
      }

      // UFOs spawn every 7 points after 50
      if (score >= 50 && score - lastUFOSpawnScore >= 7) {
          lastUFOSpawnScore = score;
          spawnAlien();
          // 50% chance for black hole to spawn at same location as UFO
          if (!blackHoleSpawnedThisTick && Math.random() < 0.5) {
              const lastAlien = aliens[aliens.length - 1];
              if (lastAlien) {
                  blackHoles.push({x: lastAlien.x, y: lastAlien.y, r: 40});
                  lastBlackHoleSpawnScore = score;
              }
          }
      }

      // Shurikens spawn every 7 points after 51
      if (score >= 51 && score - lastShurikenSpawnScore >= 7) {
          lastShurikenSpawnScore = score;
          spawnShuriken();
      }

      player.vy+=gravity; player.y+=player.vy;
      if(player.y+player.r>canvas.height){ player.y=canvas.height-player.r; player.vy=0; }
      if(player.y-player.r<0){ player.y=player.r; player.vy=0; }

      // Update obstacles - FIX: Use safer loop for splicing
      for(let i=obstacles.length-1;i>=0;i--){
        let ob=obstacles[i]; ob.x-=200*dtSeconds;

        if(!ob.passed && ob.x+40<player.x-player.r){
            ob.passed=true;
            score++;
            addStars(1);
            if (score >= 11) {
                meteorhunts += 1;
                saveGameData();
            }
            scoreTxt.textContent=score;
            // stars UI updated via addStars()
            if(typeof Android !== "undefined") Android.setScore(score);

            if(score > 10){
                spawnMeteor();
            }

            showScorePointPopup();
            if (score >= 11) {
                incrementPlayGamesAchievementForKey('meteor_hunter', 1);
            }
            checkAchievements();

            // TUTORIAL INTERRUPT
            if (isTutorialMode && (score === TUTORIAL_GOAL_1 && tutorialStep === 1) && !isGoalReached) {
                isGoalReached = true;
                // Complete the first tutorial goal without forcing a death
                setTimeout(() => {
                    running = false;
                    showMenu();
                    showDialog({
                        title: 'Tutorial Continue',
                        text: `Great job, Pilot! You scored ${score} point. Now let's explore the planets menu.`,
                        confirmText: 'Continue',
                        showCancel: false,
                        onConfirm: nextTutorialStep
                    });
                }, 50);
            }
        }

        if(ob.x+80<0) obstacles.splice(i,1);
        // Collision with regular obstacles (causes instant death)
        if(player.x+player.r>ob.x && player.x-player.r<ob.x+60){ if(player.y-player.r<ob.top || player.y+player.r>ob.top+ob.gap){ deathTypeCode = 'dead:001'; hitObstacle(); } }
      }

      // Update meteors - FIX: Use safer loop for splicing
      for(let i=meteors.length-1;i>=0;i--){
        let m=meteors[i]; m.x-=250*dtSeconds;
        if(m.x+m.r<0) {
            meteors.splice(i,1);
            continue;
        }
        let dx=player.x-m.x, dy=player.y-m.y, dist=Math.sqrt(dx*dx+dy*dy);
        if(dist<player.r+m.r) { deathTypeCode = 'dead:002'; hitObstacle(); } // Meteor collision (instant death)
      }

      // Update icy holes - the frozen trap arrives before other hazards
      for(let i=icyHoles.length-1;i>=0;i--){
        let hole=icyHoles[i];
        hole.x -= hole.speed * dtSeconds;
        if (hole.x + hole.r < 0) {
          icyHoles.splice(i,1);
          continue;
        }
        const dx = player.x - hole.x;
        const dy = player.y - hole.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
                if (!hole.triggered && dist < hole.r + 80) {
                    // If revive shield active, ignore icy-hole trigger
                    if (window.reviveShieldActive) {
                        // leave hole un-triggered while shield lasts
                    } else {
                        hole.triggered = true;
                        triggerIcyTrap(hole);
                    }
                }
      }

      // Update black holes - FIX: Use safer loop for splicing
            for(let i=blackHoles.length-1;i>=0;i--){
                let bh=blackHoles[i]; bh.x-=120*dtSeconds;

                // If revive shield is active, ignore black hole interactions
                if (window.reviveShieldActive) {
                    if (bh.x+bh.r<0) blackHoles.splice(i,1);
                    continue;
                }

                if(bh.x+bh.r<0) blackHoles.splice(i,1);
                let dx=player.x-bh.x, dy=player.y-bh.y, dist=Math.sqrt(dx*dx+dy*dy);
                if(dist<200){ player.x-=dx/dist*0.5; player.y-=dy/dist*0.5; }

                if (difficulty === 'impossible' && !blackHoleApproachEscaped) {
                        const approachRadius = bh.r + 120;
                        if (!blackHoleApproachInProgress && dist < approachRadius && dist >= player.r + bh.r - 10) {
                                blackHoleApproachInProgress = true;
                        } else if (blackHoleApproachInProgress && dist >= approachRadius + 20) {
                                blackHoleApproachEscaped = true;
                                blackHoleApproachInProgress = false;
                                checkAchievements();
                        }
                }

                if(dist<player.r+bh.r-10) blackHoleEat(bh); // Black hole collision (planet gets eaten)
            }

      // Update Aliens (UFO) - FIX: Use safer loop for splicing
      for(let i=aliens.length-1;i>=0;i--){
        let alien = aliens[i];

        if (alien.dodge) {
          alien.dodge.t += dt;
          const p = Math.min(1, alien.dodge.t / alien.dodge.maxT);
          const easing = Math.sin(p * Math.PI);
          alien.y = alien.dodge.startY + (alien.dodge.targetY - alien.dodge.startY) * easing;
          alien.x = alien.dodge.startX + Math.sin(p * Math.PI) * 18;
          if (p >= 1) {
            alien.y = alien.dodge.startY;
            alien.x = alien.dodge.startX;
            alien.dodge = null;
          }
        }

        alien.x -= 80 * dtSeconds;

        alien.lastShot += dt;
        if(alien.lastShot > alien.shootInterval) {
            const angle = Math.atan2(player.y - alien.y, player.x - alien.x);
            alien.acidBalls.push({
                x: alien.x, y: alien.y, r: 8,
                vx: Math.cos(angle) * 300, vy: Math.sin(angle) * 300
            });
            if (audioOn) playSound('shoot');
            alien.lastShot = 0;
            alien.shootInterval = 1500 + Math.random() * 1000;
        }

        // Update Acid Balls - FIX: Use safer loop for splicing
        for(let j=alien.acidBalls.length-1;j>=0;j--){
            let ball = alien.acidBalls[j];
            ball.x += ball.vx * dtSeconds;
            ball.y += ball.vy * dtSeconds;
            let dx=player.x-ball.x, dy=player.y-ball.y, dist=Math.sqrt(dx*dx+dy*dy);

            // Collision with acid ball (Health reduction)
            if(dist<player.r+ball.r) {
                alien.acidBalls.splice(j, 1);
                showHealthPointPopup();
                applyPlayerDamage();
                if (playerHealth <= 0) {
                    deathTypeCode = 'dead:004';
                    hitObstacle(); // Game over on 3rd hit
                    return; // Stop update loop to prevent further collisions
                }
            }

            if(ball.x < -10 || ball.x > canvas.width + 10 || ball.y < -10 || ball.y > canvas.height + 10) {
                alien.acidBalls.splice(j, 1);
            }
        }

        if(alien.x + 40 < 0) aliens.splice(i, 1);
        // Collision with UFO itself (instant death) - FIX: Reduced collision radius for UFO body
        let dx_ufo=player.x-alien.x, dy_ufo=player.y-alien.y, dist_ufo=Math.sqrt(dx_ufo*dx_ufo+dy_ufo*dy_ufo);
        if(dist_ufo < player.r + 15) { deathTypeCode = 'dead:005'; hitObstacle(); }
      }

      // Update shurikens
      for (let i = shurikens.length - 1; i >= 0; i--) {
        let shuriken = shurikens[i];
        if (!shuriken.hit) {
          shuriken.x += shuriken.vx * dtSeconds;
          const dx = player.x - shuriken.x;
          const dy = player.y - shuriken.y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < player.r + shuriken.r) {
              shuriken.hit = true;
              shuriken.target = aliens[0] || null;
              if (audioOn) playSound('shoot');
          }
        } else if (shuriken.target) {
          const tx = shuriken.target.x;
          const ty = shuriken.target.y;
          const angle = Math.atan2(ty - shuriken.y, tx - shuriken.x);
          shuriken.x += Math.cos(angle) * 400 * dtSeconds;
          shuriken.y += Math.sin(angle) * 400 * dtSeconds;

          const dx = shuriken.x - tx;
          const dy = shuriken.y - ty;
          if (Math.sqrt(dx*dx + dy*dy) < 12) {
              // Shuriken hit UFO - check for special interactions
              const nearbyBlackHole = blackHoles.find(bh => {
                  const dist = Math.sqrt((bh.x - tx) ** 2 + (bh.y - ty) ** 2);
                  return dist < 150; // Nearby radius
              });

              if (nearbyBlackHole && Math.random() < 0.15) {
                  // 15% chance: Black hole eats shuriken
                  shurikenEaten(shuriken, nearbyBlackHole);
                  shurikens.splice(i, 1);
                  continue;
              } else if (!nearbyBlackHole && Math.random() < 0.15) {
                  // 15% chance: UFO dodges shuriken with a visible upward burst
                  if (shuriken.target && shuriken.target.dodge === null) {
                    const startY = shuriken.target.y;
                    shuriken.target.dodge = {
                      startX: shuriken.target.x,
                      startY: startY,
                      targetY: startY - 70,
                      t: 0,
                      maxT: 320
                    };
                    if (audioOn) playSound('move');
                  }
                  shuriken.target = null; // Stop tracking
                  shurikens.splice(i, 1);
                  continue;
              }

              // Normal: UFO destroyed
              if (audioOn) playSound('over');
              explosions.push({type:'radial', x: tx, y: ty, r: 0, t: 0, maxT: 400});
              ufoDefenders += 1;
              incrementPlayGamesAchievementForKey('ufo_defender', 1);
              saveGameData();
              checkAchievements();
              const targetIndex = aliens.indexOf(shuriken.target);
              if (targetIndex !== -1) aliens.splice(targetIndex, 1);
              shurikens.splice(i, 1);
              continue;
          }
        } else {
          // remove if no target remains
          shurikens.splice(i, 1);
          continue;
        }

        if (shuriken.x - shuriken.r > canvas.width) {
          shurikens.splice(i, 1);
        }
      }

      // Update explosions (planet death blast animation)
      for (let i = explosions.length - 1; i >= 0; i--) {
          let e = explosions[i];
          e.t += dt;
          if (e.t >= e.maxT) { explosions.splice(i, 1); continue; }
          if (e.type !== 'screen') {
              e.r += (dt / e.maxT) * 160;
          }
      }
    }

    // Update black hole eating animation (planet)
    if (eatingBlackHole) {
        eatingBlackHole.t += dt;
            if (eatingBlackHole.t >= eatingBlackHole.maxT) {
            eatingBlackHole = null;
            showGameOverScreen(); // Show game over after animation completes
        } else {
            // Animate planet moving towards black hole center and shrinking
            const progress = eatingBlackHole.t / eatingBlackHole.maxT;
            const startX = eatingBlackHole.planetX;
            const startY = eatingBlackHole.planetY;
            const endX = eatingBlackHole.x;
            const endY = eatingBlackHole.y;

            player.x = startX + (endX - startX) * progress;
            player.y = startY + (endY - startY) * progress;
            player.r = eatingBlackHole.planetR * (1 - progress * 0.8); // Shrink to 20% of original size
        }
    }

    // Update black hole eating animation (shuriken)
    if (eatingShuriken) {
        eatingShuriken.t += dt;
        if (eatingShuriken.t >= eatingShuriken.maxT) {
            eatingShuriken = null;
        } else {
            // Animate shuriken moving towards black hole and shrinking
            const progress = eatingShuriken.t / eatingShuriken.maxT;
            eatingShuriken.x = eatingShuriken.startX + (eatingShuriken.bhX - eatingShuriken.startX) * progress;
            eatingShuriken.y = eatingShuriken.startY + (eatingShuriken.bhY - eatingShuriken.startY) * progress;
            eatingShuriken.r = eatingShuriken.startR * (1 - progress * 0.8);
        }
    }
  }

  function hitObstacle(){
    if (window.reviveShieldActive) {
      return; // Shield is active, ignore obstacle collision
    }
    // Save previous values for counter animation (previous count before increment)
    prevScore = score;
    prevTotalStars = totalStars;
    prevTotalMatches = totalMatches; // Previous was before this match
    
    // Planet death blast and sound
    explosions.push({type:'screen', t:0, maxT:550});
    explosions.push({type:'radial', x: player.x, y: player.y, r: 8, t: 0, maxT:550});
    if (audioOn) { playSound('over'); }

    running=false;
    // Save the current game state immediately so it can be restored if tab closes during gamewrap
    saveGameState();
    finalScore.textContent=score;

    const { newHigh } = applyPlanetUnlocksForScore(score);
    const isNewHighScore = newHigh;

    if (isNewHighScore) {
      newHighScorePending = true;
    }

    try {
      if (window.Android && typeof Android.onMatchFinished === 'function') {
        Android.onMatchFinished();
      }
    } catch (e) {
      console.warn('Android.onMatchFinished not available:', e);
    }

    incrementTotalMatches();
    checkAchievements(true);
    updateStageProgressAfterMatch(score);
    awardStarsFromScore(score); // Award stars based on this match's score

    saveGameData();
    showGameOverScreen();
    incrementRatingMatchCounter();

    // TUTORIAL INTERRUPT: Handle the forced death/menu transition
    if (isTutorialMode) {
        // Reassign buttons to custom tutorial logic (which calls backMenuBtn.onclick's special logic)
        playAgainBtn.onclick = ()=>{
            stopJourneyBarAnimation();
            clearSavedGameState();
            showLoadingScreen(() => {
                isOnDeathScreen = false; // No longer on death screen
                gameOver.style.display='none';
                start();
                isGoalReached = false;
            });
        };
        backMenuBtn.onclick = ()=>{
            stopJourneyBarAnimation();
            clearSavedGameState();
            showLoadingScreen(() => {
                isOnDeathScreen = false; // No longer on death screen
                gameOver.style.display='none';
                showMenu();
                isGoalReached = false;
                // Custom tutorial logic for back to menu is here
                if (score === TUTORIAL_GOAL_1 && tutorialStep === 1) {
                    tutorialStep = 1;
                    showDialog({
                        title: 'Tutorial Continue',
                        text: `Great job, Pilot! You scored ${score} point. Now let's explore the planets menu.`,
                        confirmText: 'Continue',
                        showCancel: false,
                        onConfirm: nextTutorialStep
                    });
                 }
            });
        };
    } else {
      // Normal game over logic (re-set the default function using door screen)
      playAgainBtn.onclick = ()=>{
          stopJourneyBarAnimation();
          clearSavedGameState();
          showLoadingScreen(() => {
              isOnDeathScreen = false; // No longer on death screen
              gameOver.style.display='none';
              start();
          });
      };
      backMenuBtn.onclick = ()=>{
          stopJourneyBarAnimation();
          clearSavedGameState();
          showLoadingScreen(() => {
              isOnDeathScreen = false; // No longer on death screen
              gameOver.style.display='none';
              showMenu();
          });
      };
    }
  }

  function blackHoleEat(bh) {
        if (eatingBlackHole) return; // Already processing black hole eat animation

        // If revive shield is active, ignore black-hole eat events
        if (window.reviveShieldActive) {
            console.log('blackHoleEat ignored due to revive shield');
            return;
        }
    deathTypeCode = 'dead:003';

    // Save previous values for counter animation (previous count before increment)
    prevScore = score;
    prevTotalStars = totalStars;
    prevTotalMatches = totalMatches; // Previous was before this match

    // Planet gets sucked into black hole with animation and sound
    if (audioOn) { playSound('eat'); }
    blackHoleApproachInProgress = false;

    // Remove this black hole so it cannot trigger multiple times
    blackHoles = blackHoles.filter(b => b !== bh);

    // Start eating animation
    eatingBlackHole = {
      x: bh.x,
      y: bh.y,
      r: bh.r,
      planetX: player.x,
      planetY: player.y,
      planetR: player.r,
      t: 0,
      maxT: 1000 // 1 second animation
    };

    running = false;
    // Save the current game state immediately so it can be restored if tab closes during gamewrap
    saveGameState();
    finalScore.textContent = score;

    const { newHigh } = applyPlanetUnlocksForScore(score);

    if (newHigh) {
      // Update stage progress with new high score
      updateStageTaskValues();
    }

    try {
      if (window.Android && typeof Android.onMatchFinished === 'function') {
        Android.onMatchFinished();
      }
    } catch (e) {
      console.warn('Android.onMatchFinished not available:', e);
    }

    incrementTotalMatches();
    checkAchievements(true);
    updateStageProgressAfterMatch(score);
    awardStarsFromScore(score); // Award stars based on this match's score

    saveGameData();
    scorePanel.style.display = 'none';
    // Don't show game over yet - wait for animation to complete
    incrementRatingMatchCounter();

    // TUTORIAL INTERRUPT: Handle the forced death/menu transition
    if (isTutorialMode) {
        // Reassign buttons to custom tutorial logic (which calls backMenuBtn.onclick's special logic)
        playAgainBtn.onclick = ()=>{
            stopJourneyBarAnimation();
            clearSavedGameState();
            showLoadingScreen(() => {
                isOnDeathScreen = false; // No longer on death screen
                gameOver.style.display = 'none';
                start();
                isGoalReached = false;
            });
        };
        backMenuBtn.onclick = ()=>{
            stopJourneyBarAnimation();
            clearSavedGameState();
            showLoadingScreen(() => {
                isOnDeathScreen = false; // No longer on death screen
                gameOver.style.display = 'none';
                showMenu();
                isGoalReached = false;
                // Custom tutorial logic for back to menu is here
                if (score === TUTORIAL_GOAL_1 && tutorialStep === 1) {
                    tutorialStep = 1;
                    showDialog({
                        title: 'Tutorial Continue',
                        text: `Great job, Pilot! You scored ${score} point. Now let's explore the planets menu.`,
                        confirmText: 'Continue',
                        showCancel: false,
                        onConfirm: nextTutorialStep
                    });
                 }
            });
        };
    } else {
      // Normal game over logic (re-set the default function using door screen)
      playAgainBtn.onclick = ()=>{
          stopJourneyBarAnimation();
          clearSavedGameState();
          showLoadingScreen(() => {
              isOnDeathScreen = false; // No longer on death screen
              gameOver.style.display = 'none';
              start();
          });
      };
      backMenuBtn.onclick = ()=>{
          stopJourneyBarAnimation();
          clearSavedGameState();
          showLoadingScreen(() => {
              isOnDeathScreen = false; // No longer on death screen
              gameOver.style.display = 'none';
              showMenu();
          });
      };
    }
  }

  function shurikenEaten(shuriken, blackHole) {
    // Shuriken gets sucked into black hole with animation and sound
    if (audioOn) { playSound('eat'); }

    // Start eating animation
    eatingShuriken = {
      bhX: blackHole.x,
      bhY: blackHole.y,
      startX: shuriken.x,
      startY: shuriken.y,
      startR: shuriken.r,
      x: shuriken.x,
      y: shuriken.y,
      r: shuriken.r,
      t: 0,
      maxT: 800 // 0.8 second animation
    };
  }

  // --- PLANET DRAWING FUNCTION (existing, no changes) ---

  function drawPlanetImage(context, planetKey, x, y, r) {
      const planet = planetData.find(p => p.key === planetKey) || planetData[0];
      if (planet.drawType === 'emoji') {
          context.font = `${r * 2}px serif`;
          context.textAlign = 'center';
          context.textBaseline = 'middle';
          context.fillText(planet.icon, x, y);
          return;
      }

      context.save();
      context.translate(x, y);
      context.beginPath();
      context.arc(0, 0, r, 0, Math.PI * 2);
      context.fillStyle = '#000';
      context.fill();
      context.restore();
  }

  function ensurePlayerPlanetOverlay() {
      if (!document.getElementById('gameWrap')) return null;
      let overlay = document.getElementById('playerPlanetOverlay');
      if (!overlay) {
          overlay = document.createElement('div');
          overlay.id = 'playerPlanetOverlay';
          overlay.style.position = 'absolute';
          overlay.style.left = '0';
          overlay.style.top = '0';
          overlay.style.pointerEvents = 'none';
          overlay.style.zIndex = '8';
          overlay.style.display = 'none';
          document.getElementById('gameWrap').appendChild(overlay);
      }
      return overlay;
  }

  function shouldShowPlayerPlanetOverlay() {
      const pauseOverlayVisible = !!(pauseMenu && pauseMenu.style.display === 'flex');
      const countdown = document.getElementById('continueCountdown');
      const resumeCountdownVisible = !!(countdown && countdown.style.display !== 'none' && /Resume in|Continue in/.test(countdown.textContent || ''));
      const menuVisible = !!(menu && menu.style.display === 'flex');
      const planetMenuVisible = !!(planetMenu && planetMenu.style.display === 'flex');
      const difficultyMenuVisible = !!(difficultyMenu && difficultyMenu.style.display === 'flex');
      const achievementsMenuVisible = !!(achievementsMenu && achievementsMenu.style.display === 'flex');
      const gameOverVisible = !!(gameOver && gameOver.style.display.includes('flex'));
      const newHighScoreVisible = !!(newHighScoreOverlay && newHighScoreOverlay.style.display === 'flex');
      const stageTransitionVisible = !!(stageTransitionOverlay && stageTransitionOverlay.style.display === 'flex');
      const dialogVisible = !!(dialogOverlay && !dialogOverlay.classList.contains('hidden'));

      return (running || pauseOverlayVisible || resumeCountdownVisible || eatingBlackHole || icyTrapState) &&
          !menuVisible && !planetMenuVisible && !difficultyMenuVisible && !achievementsMenuVisible &&
          !gameOverVisible && !newHighScoreVisible && !stageTransitionVisible && !dialogVisible;
  }

  function syncPlayerDamageStage() {
      playerDamageStage = Math.max(0, Math.min(2, 3 - playerHealth));
      if (playerHealth <= 0) {
          playerDamageStage = 2;
      }
      const overlay = ensurePlayerPlanetOverlay();
      if (overlay && player) {
          const canvas = document.getElementById('c');
          const planet = planetData.find(p => p.key === player.planetKey) || planetData[0];
          const size = Math.max(22, Math.round(player.r * 2));
          const canvasX = canvas ? canvas.offsetLeft : 0;
          const canvasY = canvas ? canvas.offsetTop : 0;

          overlay.innerHTML = buildPlanetVisualMarkup(planet.key, size, playerDamageStage);
          overlay.style.width = `${size}px`;
          overlay.style.height = `${size}px`;
          overlay.style.left = `${canvasX + player.x - size / 2}px`;
          overlay.style.top = `${canvasY + player.y - size / 2}px`;
          overlay.style.display = shouldShowPlayerPlanetOverlay() ? 'block' : 'none';
      }
  }

  function syncPlayerPlanetOverlay() {
      const overlay = ensurePlayerPlanetOverlay();
      if (!overlay || !player) return;

      const canvas = document.getElementById('c');
      const planet = planetData.find(p => p.key === player.planetKey) || planetData[0];
      const size = Math.max(22, Math.round(player.r * 2));
      const canvasX = canvas ? canvas.offsetLeft : 0;
      const canvasY = canvas ? canvas.offsetTop : 0;

      overlay.innerHTML = buildPlanetVisualMarkup(planet.key, size, playerDamageStage);
      overlay.style.width = `${size}px`;
      overlay.style.height = `${size}px`;
      overlay.style.left = `${canvasX + player.x - size / 2}px`;
      overlay.style.top = `${canvasY + player.y - size / 2}px`;
      overlay.style.display = shouldShowPlayerPlanetOverlay() ? 'block' : 'none';
  }

  function applyPlayerDamage() {
      if (playerHealth <= 0) return;
      playerHealth = Math.max(0, playerHealth - 1);
      playerDamageStage = Math.max(0, Math.min(2, 3 - playerHealth));
      if (playerHealth <= 0) {
          playerDamageStage = 2;
      }
      healthDisplay.textContent = '❤️ ' + playerHealth;
      syncPlayerDamageStage();
      syncPlayerPlanetOverlay();
  }

  function drawUfoVisual(context, x, y, scale = 1) {
      context.save();
      context.translate(x, y);
      context.scale(scale, scale);

      const glow = context.createRadialGradient(0, 18, 8, 0, 18, 36);
      glow.addColorStop(0, 'rgba(56,189,248,0.14)');
      glow.addColorStop(0.55, 'rgba(56,189,248,0.05)');
      glow.addColorStop(1, 'rgba(56,189,248,0)');
      context.fillStyle = glow;
      context.beginPath();
      context.ellipse(0, 18, 20, 10, 0, 0, Math.PI * 2);
      context.fill();

      const domeGrad = context.createLinearGradient(0, -30, 0, 8);
      domeGrad.addColorStop(0, 'rgba(255,255,255,0.9)');
      domeGrad.addColorStop(0.3, 'rgba(186,230,253,0.45)');
      domeGrad.addColorStop(0.6, 'rgba(14,165,233,0.25)');
      domeGrad.addColorStop(1, 'rgba(2,132,199,0.5)');
      context.fillStyle = domeGrad;
      context.beginPath();
      context.ellipse(0, -12, 21, 15, 0, 0, Math.PI * 2);
      context.fill();

      context.fillStyle = 'rgba(255,255,255,0.85)';
      context.beginPath();
      context.ellipse(-7, -18, 8, 5, -0.75, 0, Math.PI * 2);
      context.fill();

      context.fillStyle = '#94a3b8';
      context.beginPath();
      context.ellipse(0, 2, 15, 13, 0, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = '#1e293b';
      context.fillRect(-9, 8, 18, 8);

      context.fillStyle = '#f8fafc';
      context.beginPath();
      context.ellipse(0, 4, 30, 10, 0, 0, Math.PI * 2);
      context.fill();

      const bodyGrad = context.createLinearGradient(0, -10, 0, 28);
      bodyGrad.addColorStop(0, '#e2e8f0');
      bodyGrad.addColorStop(0.25, '#94a3b8');
      bodyGrad.addColorStop(0.58, '#334155');
      bodyGrad.addColorStop(0.86, '#0f172a');
      bodyGrad.addColorStop(1, '#0284c7');
      context.fillStyle = bodyGrad;
      context.beginPath();
      context.ellipse(0, 10, 34, 13, 0, 0, Math.PI * 2);
      context.fill();

      context.fillStyle = 'rgba(255,255,255,0.55)';
      for (let i = -5; i <= 5; i += 2) {
        context.fillRect(i * 4, 13, 2, 3);
      }

      context.fillStyle = '#1e293b';
      context.beginPath();
      context.ellipse(0, 22, 14, 6, 0, 0, Math.PI * 2);
      context.fill();

      context.fillStyle = 'rgba(56,189,248,0.18)';
      context.beginPath();
      context.ellipse(0, 26, 10, 5, 0, 0, Math.PI * 2);
      context.fill();

      context.fillStyle = '#000';
      context.beginPath();
      context.ellipse(-7, 0, 4, 5, 0.55, 0, Math.PI * 2);
      context.fill();
      context.beginPath();
      context.ellipse(7, 0, 4, 5, -0.55, 0, Math.PI * 2);
      context.fill();

      context.fillStyle = 'rgba(255,255,255,0.8)';
      context.beginPath();
      context.arc(-5.5, -1.5, 1.2, 0, Math.PI * 2);
      context.arc(8.5, -1.5, 1.2, 0, Math.PI * 2);
      context.fill();

      context.restore();
  }

  function drawBlackHoleVisual(context, x, y, r) {
      const pulse = 0.94 + Math.sin((Date.now() / 120)) * 0.06;
      const diskRadius = r * 1.25;

      context.save();
      context.translate(x, y);

      const ambient = context.createRadialGradient(0, 0, r * 0.2, 0, 0, diskRadius * 1.3);
      ambient.addColorStop(0, 'rgba(255,255,255,0)');
      ambient.addColorStop(0.35, 'rgba(90,20,0,0.16)');
      ambient.addColorStop(0.7, 'rgba(20,0,0,0.22)');
      ambient.addColorStop(1, 'rgba(0,0,0,0.05)');
      context.fillStyle = ambient;
      context.beginPath();
      context.arc(0, 0, diskRadius * 1.3, 0, Math.PI * 2);
      context.fill();

      const sideShadow = context.createRadialGradient(-r * 0.38, 0, r * 0.15, -r * 0.38, 0, r * 1.05);
      sideShadow.addColorStop(0, 'rgba(0,0,0,0)');
      sideShadow.addColorStop(0.8, 'rgba(20,2,0,0.55)');
      sideShadow.addColorStop(1, 'rgba(0,0,0,0.7)');
      context.fillStyle = sideShadow;
      context.beginPath();
      context.ellipse(-r * 0.38, 0, r * 0.8, r * 0.95, -0.3, 0, Math.PI * 2);
      context.fill();

      const diskGlow = context.createRadialGradient(0, 0, r * 0.2, 0, 0, diskRadius);
      diskGlow.addColorStop(0, '#040308');
      diskGlow.addColorStop(0.15, '#fff5bb');
      diskGlow.addColorStop(0.32, '#ffe600');
      diskGlow.addColorStop(0.5, '#ff9900');
      diskGlow.addColorStop(0.75, '#ff4400');
      diskGlow.addColorStop(0.9, 'rgba(214,40,0,0.15)');
      diskGlow.addColorStop(1, 'rgba(255,255,255,0)');
      context.fillStyle = diskGlow;
      context.beginPath();
      context.arc(0, 0, diskRadius, 0, Math.PI * 2);
      context.fill();

      for (let i = 0; i < 7; i++) {
          const ringR = r * (0.45 + i * 0.12);
          const ringAlpha = 0.18 + i * 0.06;
          context.strokeStyle = i % 2 === 0 ? `rgba(255,255,200,${ringAlpha})` : `rgba(255,120,0,${ringAlpha})`;
          context.lineWidth = 1.2;
          context.beginPath();
          context.ellipse(0, 0, ringR, ringR * 0.7, Math.PI / 6 + i * 0.18, 0, Math.PI * 2);
          context.stroke();
      }

      context.fillStyle = '#050008';
      context.beginPath();
      context.arc(0, 0, r * 0.48, 0, Math.PI * 2);
      context.fill();

      context.shadowColor = 'rgba(255, 150, 0, 0.9)';
      context.shadowBlur = 20;
      context.fillStyle = 'rgba(255, 136, 0, 0.18)';
      context.beginPath();
      context.arc(0, 0, r * 0.62, 0, Math.PI * 2);
      context.fill();
      context.shadowBlur = 0;

      context.save();
      context.translate(0, -r * 0.06);

      context.fillStyle = '#fff9d6';
      context.beginPath();
      context.ellipse(-r * 0.16, -r * 0.08, r * 0.15, r * 0.11, -0.55, 0, Math.PI * 2);
      context.ellipse(r * 0.16, -r * 0.08, r * 0.15, r * 0.11, 0.55, 0, Math.PI * 2);
      context.fill();

      context.fillStyle = '#ffef7a';
      context.beginPath();
      context.moveTo(-r * 0.22, r * 0.15);
      context.quadraticCurveTo(-r * 0.1, r * 0.26, 0, r * 0.2);
      context.quadraticCurveTo(r * 0.1, r * 0.26, r * 0.22, r * 0.15);
      context.quadraticCurveTo(r * 0.1, r * 0.32, 0, r * 0.38);
      context.quadraticCurveTo(-r * 0.1, r * 0.32, -r * 0.22, r * 0.15);
      context.fill();

      context.restore();

      context.restore();
  }


  function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);

  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

    if(sunImg.complete && !sunImgFailed){ ctx.drawImage(sunImg, canvas.width/2-100, canvas.height/2-100, 200, 200); }
    else {
      const sx = canvas.width/2, sy = canvas.height/2;
      const sr = 80; let g = ctx.createRadialGradient(sx,sy,10,sx,sy,sr);
      g.addColorStop(0,'#ffecb3'); g.addColorStop(0.4,'#ffb74d'); g.addColorStop(1,'#ff6f00'); ctx.fillStyle=g;
      ctx.beginPath(); ctx.arc(sx,sy,sr,0,Math.PI*2); ctx.fill();
    }

    obstacles.forEach(ob=>{ ctx.fillStyle = impossibleModeActive ? 'rgba(255,40,40,0.95)' : 'rgba(120,120,160,0.9)'; ctx.fillRect(ob.x,0,60,ob.top); ctx.fillRect(ob.x,ob.top+ob.gap,60,canvas.height-(ob.top+ob.gap)); });

    shurikens.forEach(shuriken => {
      ctx.save();
      ctx.translate(shuriken.x, shuriken.y);
      // Yellow shield background
      const shieldWidth = shuriken.r * 1.5;
      const shieldHeight = shuriken.r * 2;
      ctx.beginPath();
      ctx.moveTo(-shieldWidth/2, -shieldHeight/2 + shieldWidth/2);
      ctx.arcTo(-shieldWidth/2, -shieldHeight/2, shieldWidth/2, -shieldHeight/2, shieldWidth/2);
      ctx.arcTo(shieldWidth/2, -shieldHeight/2, shieldWidth/2, shieldHeight/2 - shieldWidth/2, shieldWidth/2);
      ctx.lineTo(shieldWidth/2, shieldHeight/2);
      ctx.lineTo(0, shieldHeight/2 + shieldWidth/2);
      ctx.lineTo(-shieldWidth/2, shieldHeight/2);
      ctx.arcTo(-shieldWidth/2, shieldHeight/2 - shieldWidth/2, -shieldWidth/2, -shieldHeight/2 + shieldWidth/2, shieldWidth/2);
      ctx.closePath();
      const gradient = ctx.createLinearGradient(-shieldWidth/2, -shieldHeight/2, shieldWidth/2, shieldHeight/2);
      gradient.addColorStop(0, 'rgba(255, 255, 0, 0.8)');
      gradient.addColorStop(0.5, 'rgba(255, 215, 0, 0.9)');
      gradient.addColorStop(1, 'rgba(255, 140, 0, 0.8)');
      ctx.fillStyle = gradient;
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 2;
      ctx.stroke();
      // Cyan shuriken in the middle
      ctx.fillStyle = shuriken.hit ? '#a8ffff' : '#2ddffe';
      ctx.strokeStyle = shuriken.hit ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 255, 255, 0.95)';
      ctx.lineWidth = 2;
      const s = shuriken.r;
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.9);
      ctx.lineTo(s * 0.18, -s * 0.18);
      ctx.lineTo(s * 0.9, -s * 0.18);
      ctx.lineTo(s * 0.24, s * 0.18);
      ctx.lineTo(s * 0.5, s * 0.9);
      ctx.lineTo(0, s * 0.35);
      ctx.lineTo(-s * 0.5, s * 0.9);
      ctx.lineTo(-s * 0.24, s * 0.18);
      ctx.lineTo(-s * 0.9, -s * 0.18);
      ctx.lineTo(-s * 0.18, -s * 0.18);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.18, 0, Math.PI * 2);
      ctx.fillStyle = shuriken.hit ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.8)';
      ctx.fill();
      ctx.restore();
    });

    // Draw eating shuriken animation
    if (eatingShuriken) {
      ctx.save();
      ctx.translate(eatingShuriken.x, eatingShuriken.y);
      const s = eatingShuriken.r;
      ctx.fillStyle = 'rgba(45, 223, 254, 0.7)';
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.7)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.9);
      ctx.lineTo(s * 0.18, -s * 0.18);
      ctx.lineTo(s * 0.9, -s * 0.18);
      ctx.lineTo(s * 0.24, s * 0.18);
      ctx.lineTo(s * 0.5, s * 0.9);
      ctx.lineTo(0, s * 0.35);
      ctx.lineTo(-s * 0.5, s * 0.9);
      ctx.lineTo(-s * 0.24, s * 0.18);
      ctx.lineTo(-s * 0.9, -s * 0.18);
      ctx.lineTo(-s * 0.18, -s * 0.18);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    meteors.forEach(m=>{
      // Sizzling fire effect for each meteor
      const flame = ctx.createRadialGradient(m.x + 10, m.y, m.r * 0.2, m.x, m.y, m.r * 2);
      flame.addColorStop(0,'rgba(255,255,0,0.8)');
      flame.addColorStop(0.4,'rgba(255,140,0,0.5)');
      flame.addColorStop(1,'rgba(255,0,0,0)');
      ctx.beginPath();
      ctx.fillStyle = flame;
      ctx.arc(m.x - 8, m.y, m.r * 2.1, 0, Math.PI * 2);
      ctx.fill();

      const body = ctx.createRadialGradient(m.x, m.y, m.r * 0.1, m.x, m.y, m.r);
      body.addColorStop(0,'#fff');
      body.addColorStop(0.5,'#ff8c00');
      body.addColorStop(1,'#aa2200');
      ctx.beginPath();
      ctx.fillStyle = body;
      ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
      ctx.fill();

      // Flame tail trailing lines
      for(let t=0;t<3;t++){
          const tailLength = m.r * (1.3 + t * 0.3);
          ctx.beginPath();
          ctx.strokeStyle = `rgba(255,${180 - t * 40},0,${0.35 - t * 0.1})`;
          ctx.lineWidth = 2 - t * 0.5;
          ctx.moveTo(m.x, m.y);
          ctx.lineTo(m.x + tailLength, m.y + Math.sin(Date.now()/60 + t) * 3);
          ctx.stroke();
      }
    });
        icyHoles.forEach(hole => {
            const pulse = 0.8 + Math.sin(Date.now()/400 + hole.x/70) * 0.15;
            const baseX = hole.x;
            const baseY = hole.y;
            const imgSize = hole.r * 7;

            if (icyHoleImg.complete && !icyHoleImgFailed) {
                ctx.save();
                ctx.globalAlpha = 0.98 * pulse;
                ctx.drawImage(icyHoleImg, baseX - imgSize / 2, baseY - imgSize / 2, imgSize, imgSize);
                ctx.restore();
                return;
            }

            const fallbackGlow = ctx.createRadialGradient(baseX, baseY, 2, baseX, baseY, hole.r * 0.95);
            fallbackGlow.addColorStop(0, 'rgba(255,255,255,0.95)');
            fallbackGlow.addColorStop(0.35, 'rgba(140,220,255,0.65)');
            fallbackGlow.addColorStop(1, 'rgba(10,24,44,0.05)');
            ctx.save();
            ctx.globalAlpha = 0.92 * pulse;
            ctx.fillStyle = fallbackGlow;
            ctx.beginPath();
            ctx.arc(baseX, baseY, hole.r * 0.95, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });

    blackHoles.forEach(bh => drawBlackHoleVisual(ctx, bh.x, bh.y, bh.r));

    if (icyTrapState) {
      const fog = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 40, canvas.width / 2, canvas.height / 2, canvas.width * 0.75);
      fog.addColorStop(0, 'rgba(229,244,255,0.14)');
      fog.addColorStop(0.4, 'rgba(180,220,255,0.2)');
      fog.addColorStop(1, 'rgba(12,30,50,0.65)');
      ctx.fillStyle = fog;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.translate(player.x, player.y);
      ctx.strokeStyle = 'rgba(222,246,255,0.95)';
      ctx.lineWidth = 3;
      ctx.strokeRect(-player.r - 12, -player.r - 12, player.r * 2 + 24, player.r * 2 + 24);
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      ctx.fillRect(-player.r - 10, -player.r - 10, player.r * 2 + 20, player.r * 2 + 20);
      ctx.restore();
    }

    aliens.forEach(alien => {
      alien.acidBalls.forEach(ball => {
          ctx.beginPath();
          ctx.fillStyle='lime';
          ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI*2);
          ctx.fill();
      });

      drawUfoVisual(ctx, alien.x, alien.y, 1.1);
    });

    // Draw explosions (planet death blast)
    explosions.forEach(exp => {
        const intensity = 1 - exp.t / exp.maxT;
        if (exp.type === 'screen') {
            ctx.fillStyle = 'rgba(255,255,255,' + (0.5 * intensity) + ')';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            return;
        }

        const grd = ctx.createRadialGradient(exp.x, exp.y, 0, exp.x, exp.y, exp.r);
        grd.addColorStop(0, 'rgba(255,255,255,' + intensity + ')');
        grd.addColorStop(0.5, 'rgba(255,120,20,' + (intensity * 0.9) + ')');
        grd.addColorStop(1, 'rgba(255,0,0,0)');
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(exp.x, exp.y, exp.r, 0, Math.PI * 2);
        ctx.fill();
    });

    // --- Player drawing based on planet ---
    const planet = planetData.find(p => p.key === player.planetKey) || planetData[0];
    const px = player.x, py = player.y, pr = player.r;

    if (planet.drawType === 'custom') {
      const overlay = ensurePlayerPlanetOverlay();
      if (overlay) {
        syncPlayerPlanetOverlay();
      } else {
        drawPlanetImage(ctx, planet.key, px, py, pr);
      }
    } else {
      ctx.font='30px serif';
      ctx.textAlign='center';
      ctx.fillText(planet.icon, px, py+8);
    }

    if (window.reviveShieldActive) {
      ctx.strokeStyle = 'rgba(0, 170, 255, 0.85)';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(px, py, pr + 16, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  let lastTime=performance.now();
  function loop(t){
    const dt = t - lastTime;
    lastTime = t;
    if (running || eatingBlackHole || icyTrapState) {
      update(dt);
    } else if (menu.style.display === 'flex' && menuCanvas) {
      updateMenuSpace(dt);
      drawMenuSpace();
    }
    draw();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  function resetPlayerToSpawnPosition() {
    const safeY = Math.max(player.r + 4, Math.min(canvas.height - player.r - 4, canvas.height / 2));
    player.x = 80;
    player.y = safeY;
    player.vy = 0;
    player.r = 18;
  }

  function start(){
    deathTypeCode = 'dead:067';
    // Note progress at match start
    oldJourneyStats = JSON.parse(JSON.stringify(stageProgress));
    oldJourneyStats.totalStars = totalStars;
    oldJourneyStats.totalMatches = totalMatches;
    oldJourneyStats.high = high;
    oldJourneyStats.rewardWeekCompleted = rewardWeekCompleted;
    oldJourneyStats.availablePlanets = countAvailablePlanets();

    if (typeof clearFamilyRoundOverlays === 'function') {
      clearFamilyRoundOverlays();
    } else {
      if (gameOver) {
        gameOver.style.display = 'none';
        gameOver.style.background = 'rgba(0,0,0,0.8)';
      }
      if (pauseMenu) pauseMenu.style.display = 'none';
      if (menu) menu.style.display = 'none';
    }
    if (gameWrap) gameWrap.style.display = 'flex';
    if (menuCanvas) menuCanvas.style.display = 'none';
    const canvasElement = document.getElementById('c');
    if (canvasElement) {
      canvasElement.style.display = 'block';
    }
    clearSavedGameState();
    const startScore = window.getAdminStartScore ? window.getAdminStartScore() : 0;
    running=true; score=startScore; playerHealth=3; playerDamageStage=0; // Reset health on start
    isOnDeathScreen = false; // Clear death screen flag when starting new game
    scoreTxt.textContent=String(startScore); scorePanel.style.display='block';
    healthDisplay.textContent = '❤️ ' + playerHealth; // Update health display
    syncPlayerDamageStage();
    syncPlayerPlanetOverlay();
    if (typeof updateReviveButtonState === 'function') {
      reviveUsed = false;
      updateReviveButtonState();
    }
    resetPlayerToSpawnPosition();
    obstacles=[]; meteors=[]; blackHoles=[]; aliens=[]; shurikens=[]; icyHoles=[];
    lastSpawn=0;
    lastBlackHoleSpawnScore = score >= 25 ? Math.floor((score - 25) / 5) * 5 + 25 : -1;
    lastUFOSpawnScore = score >= 50 ? Math.floor((score - 50) / 7) * 7 + 50 : -1;
    lastShurikenSpawnScore = score >= 51 ? Math.floor((score - 51) / 7) * 7 + 51 : -1;
    lastIcyHoleSpawnScore = score >= 75 ? Math.floor((score - 75) / 15) * 15 + 75 : -1;
    icyTrapState = null;
    icyTrapEscaped = false;
    hideIcyTrapOverlay();
    eatingBlackHole = null;
    eatingShuriken = null;
    applyDifficulty();
    splash_loading.style.display = 'none'; // Ensure loading screen is hidden when game starts
    document.getElementById('pauseControl').style.display='block';
    profileCard.style.display = 'none'; // hide profile during gameplay

    // Audio: play game music, pause menu music
    sounds.menu.pause();
    if (audioOn) {
      unlockAudio();
      updateAudioForCurrentMode();
    }
    if(typeof Android !== "undefined") Android.resetRewardFlag();
  }

  function resetGame(){
    running=false; score=0;
    obstacles=[]; meteors=[]; blackHoles=[]; aliens=[]; shurikens=[]; icyHoles=[];
    resetPlayerToSpawnPosition();
    lastBlackHoleSpawnScore = -1;
    lastUFOSpawnScore = -1;
    lastShurikenSpawnScore = -1;
    lastIcyHoleSpawnScore = -1;
    icyTrapState = null;
    icyTrapEscaped = false;
    hideIcyTrapOverlay();
    playerHealth=3;
    eatingBlackHole = null;
    eatingShuriken = null;
    playerDamageStage = 0;
    healthDisplay.textContent = '❤️ ' + playerHealth;
    syncPlayerDamageStage();
    syncPlayerPlanetOverlay();
    if(!audioOn) bgAudio.pause();
    splash_loading.style.display = 'none'; // Ensure loading screen is hidden when resetting
    clearSavedGameState(); // Clear saved game state when resetting
  }

  let menuSpaceInterval = null;
  let menuCanvas, menuCtx;

  function initMenuCanvas() {
    if (!menuCanvas) {
      menuCanvas = document.createElement('canvas');
      menuCanvas.id = 'menuCanvas';
      menuCanvas.style.position = 'absolute';
      menuCanvas.style.top = '0';
      menuCanvas.style.left = '0';
      menuCanvas.style.width = '100%';
      menuCanvas.style.height = '100%';
      menuCanvas.style.zIndex = '1';
      menuCanvas.style.pointerEvents = 'none';
      menuCtx = menuCanvas.getContext('2d');
      menu.prepend(menuCanvas);
    }
    menuCanvas.width = window.innerWidth;
    menuCanvas.height = window.innerHeight;
  }

  function resetMenuGameplay(){
    menuPlayer = {x: 120, y: 180, r: 18, planetKey: resolvePlanetKey(player.planetKey, 'earth'), vy:0};
    menuObstacles = [];
    menuMeteors = [];
    menuBlackHoles = [];
    menuAliens = [];
    menuLastSpawn = 0;
    menuLastBlackHoleSpawnScore = -1;
    menuLastUFOSpawnScore = -1;
    menuScore = 0;
  }

  function spawnMenuObstacle(){ 
    const top = 40 + Math.random() * (menuCanvas.height - 240 - 80); 
    menuObstacles.push({x: menuCanvas.width, top: top, gap: 160, passed: false}); 
  }
  
  function spawnMenuMeteor(){ 
    menuMeteors.push({x: menuCanvas.width, y: 50 + Math.random() * (menuCanvas.height - 100), r: 15 + Math.random() * 15}); 
  }
  
  function spawnMenuBlackHole() {
    menuBlackHoles.push({x: menuCanvas.width, y: Math.random() * (menuCanvas.height - 150) + 75, r: 40});
  }
  
  function spawnMenuAlien() {
    menuAliens.push({
      x: menuCanvas.width,
      y: Math.random() * (menuCanvas.height - 100) + 50,
      vy: 0,
      acidBalls: [],
      lastShot: 0,
      shootInterval: 1500 + Math.random() * 1000
    });
  }

  function updateMenuSpace(dt) {
    const dtSeconds = dt / 1000;
    menuLastSpawn += dt; 
    if (menuLastSpawn > menuSpawnInterval) { 
      menuLastSpawn = 0; 
      spawnMenuObstacle(); 
    }

    // Spawn meteors randomly (balanced spawn rate)
    if (Math.random() < 0.008) spawnMenuMeteor();

    // Spawn black holes every 5 "points"
    if (menuScore >= 25 && menuScore - menuLastBlackHoleSpawnScore >= 5) {
      menuLastBlackHoleSpawnScore = menuScore;
      spawnMenuBlackHole();
    }

    // Spawn UFOs every 7 "points"  
    if (menuScore >= 50 && menuScore - menuLastUFOSpawnScore >= 7) {
      menuLastUFOSpawnScore = menuScore;
      spawnMenuAlien();
    }

    // Update obstacles
    for (let i = menuObstacles.length - 1; i >= 0; i--) {
      let ob = menuObstacles[i]; 
      ob.x -= 200 * dtSeconds;
      if (ob.x + 80 < 0) menuObstacles.splice(i, 1);
    }

    // Update meteors
    for (let i = menuMeteors.length - 1; i >= 0; i--) {
      let m = menuMeteors[i]; 
      m.x -= 250 * dtSeconds;
      if (m.x + m.r < 0) menuMeteors.splice(i, 1);
    }

    // Update black holes
    for (let i = menuBlackHoles.length - 1; i >= 0; i--) {
      let bh = menuBlackHoles[i]; 
      bh.x -= 120 * dtSeconds;
      if (bh.x + bh.r < 0) menuBlackHoles.splice(i, 1);
    }

    // Update aliens
    for (let i = menuAliens.length - 1; i >= 0; i--) {
      let alien = menuAliens[i];
      alien.x -= 80 * dtSeconds;

      alien.lastShot += dt;
      if (alien.lastShot > alien.shootInterval) {
        const angle = Math.atan2(menuPlayer.y - alien.y, menuPlayer.x - alien.x);
        alien.acidBalls.push({
          x: alien.x, y: alien.y, r: 8,
          vx: Math.cos(angle) * 300, vy: Math.sin(angle) * 300
        });
        alien.lastShot = 0;
        alien.shootInterval = 1500 + Math.random() * 1000;
      }

      // Update acid balls
      for (let j = alien.acidBalls.length - 1; j >= 0; j--) {
        let ball = alien.acidBalls[j];
        ball.x += ball.vx * dtSeconds;
        ball.y += ball.vy * dtSeconds;
        if (ball.x < -10 || ball.x > menuCanvas.width + 10 || ball.y < -10 || ball.y > menuCanvas.height + 10) {
          alien.acidBalls.splice(j, 1);
        }
      }

      if (alien.x + 40 < 0) menuAliens.splice(i, 1);
    }

    menuScore += dt / 1000; // Slowly increase score for spawning
  }

  function drawMenuSpace() {
    menuCtx.clearRect(0, 0, menuCanvas.width, menuCanvas.height);

    // Draw background
    menuCtx.fillStyle = '#000';
    menuCtx.fillRect(0, 0, menuCanvas.width, menuCanvas.height);

    // Draw sun
    if (sunImg.complete && !sunImgFailed) { 
      menuCtx.drawImage(sunImg, menuCanvas.width/2-100, menuCanvas.height/2-100, 200, 200); 
    } else {
      const sx = menuCanvas.width/2, sy = menuCanvas.height/2;
      const sr = 80; 
      let g = menuCtx.createRadialGradient(sx, sy, 10, sx, sy, sr);
      g.addColorStop(0, '#ffecb3'); 
      g.addColorStop(0.4, '#ffb74d'); 
      g.addColorStop(1, '#ff6f00'); 
      menuCtx.fillStyle = g;
      menuCtx.beginPath(); 
      menuCtx.arc(sx, sy, sr, 0, Math.PI * 2); 
      menuCtx.fill();
    }

    // Draw obstacles
    menuObstacles.forEach(ob => { 
      menuCtx.fillStyle = 'rgba(120,120,160,0.9)'; 
      menuCtx.fillRect(ob.x, 0, 60, ob.top); 
      menuCtx.fillRect(ob.x, ob.top + ob.gap, 60, menuCanvas.height - (ob.top + ob.gap)); 
    });

    // Draw meteors
    menuMeteors.forEach(m => {
      const flame = menuCtx.createRadialGradient(m.x + 10, m.y, m.r * 0.2, m.x, m.y, m.r * 2);
      flame.addColorStop(0, 'rgba(255,255,0,0.8)');
      flame.addColorStop(0.4, 'rgba(255,140,0,0.5)');
      flame.addColorStop(1, 'rgba(255,0,0,0)');
      menuCtx.beginPath();
      menuCtx.fillStyle = flame;
      menuCtx.arc(m.x - 8, m.y, m.r * 2.1, 0, Math.PI * 2);
      menuCtx.fill();

      const body = menuCtx.createRadialGradient(m.x, m.y, m.r * 0.1, m.x, m.y, m.r);
      body.addColorStop(0, '#fff');
      body.addColorStop(0.5, '#ff8c00');
      body.addColorStop(1, '#aa2200');
      menuCtx.beginPath();
      menuCtx.fillStyle = body;
      menuCtx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
      menuCtx.fill();

      for (let t = 0; t < 3; t++) {
        const tailLength = m.r * (1.3 + t * 0.3);
        menuCtx.beginPath();
        menuCtx.strokeStyle = `rgba(255,${180 - t * 40},0,${0.35 - t * 0.1})`;
        menuCtx.lineWidth = 2 - t * 0.5;
        menuCtx.moveTo(m.x, m.y);
        menuCtx.lineTo(m.x + tailLength, m.y + Math.sin(Date.now() / 60 + t) * 3);
        menuCtx.stroke();
      }
    });

    // Draw black holes
    menuBlackHoles.forEach(bh => drawBlackHoleVisual(menuCtx, bh.x, bh.y, bh.r));

    // Draw aliens
    menuAliens.forEach(alien => {
      alien.acidBalls.forEach(ball => {
        menuCtx.beginPath();
        menuCtx.fillStyle = 'lime';
        menuCtx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
        menuCtx.fill();
      });

      drawUfoVisual(menuCtx, alien.x, alien.y, 1.05);
    });
  }

  function getSpaceLayer(container){
    let layer = container.querySelector('.space-layer');
    if(!layer){
      layer = document.createElement('div');
      layer.className='space-layer';
      container.prepend(layer);
    }
    return layer;
  }

  function clearMenuSpaceObjects(){
    document.querySelectorAll('.space-layer').forEach(layer=>layer.innerHTML='');
  }

  function spawnMenuSpaceObjects(container){
    const layer = getSpaceLayer(container);
    layer.innerHTML='';

    const objectTypes = [
      {class:'meteor',count:4},
      {class:'blackhole',count:3},
      {class:'ufo',count:2}
    ];

    objectTypes.forEach((entry)=>{
      for(let i=0;i<entry.count;i++){
        const obj=document.createElement('div');
        obj.className='space-object '+entry.class;

        const top = Math.random()*80 + 5;
        const left = entry.class==='meteor' ? -25 : Math.random()*80 + 5;

        obj.style.top = `${top}%`;
        obj.style.left = `${left}%`;

        let size;
        if(entry.class==='meteor'){
          size = Math.floor(Math.random()*12 + 18);
          obj.style.width = `${size + 4}px`;
          obj.style.height = `${size + 4}px`;
          obj.style.transformOrigin = 'center';
        } else if(entry.class==='blackhole'){
          size = Math.floor(Math.random()*22 + 24);
          obj.style.width = `${size}px`;
          obj.style.height = `${size}px`;
        } else if(entry.class==='ufo'){
          size = Math.floor(Math.random()*18 + 26);
          obj.style.width = `${size + 18}px`;
          obj.style.height = `${Math.floor(size/2)}px`;
        }

        const duration = entry.class==='meteor' ? (Math.random()*3 + 5).toFixed(2) : (Math.random()*4 + 6).toFixed(2);
        obj.style.animationDuration = `${duration}s`;
        obj.style.animationDelay = `${(Math.random()*3).toFixed(2)}s`;

        layer.appendChild(obj);
      }
    });
  }

  function startMenuSpaceAnimation(container = menu){
    stopMenuSpaceAnimation();
    initMenuCanvas();
    menuObstacles = [];
    menuMeteors = [];
    menuBlackHoles = [];
    menuAliens = [];
    menuLastSpawn = 0;
    menuScore = 0;
    menuLastBlackHoleSpawnScore = -1;
    menuLastUFOSpawnScore = -1;
    // spawnMenuSpaceObjects(container);
    // menuSpaceInterval = setInterval(()=>spawnMenuSpaceObjects(container), 8500);
  }

  function stopMenuSpaceAnimation(){
    if(menuSpaceInterval){
      clearInterval(menuSpaceInterval);
      menuSpaceInterval=null;
    }
    clearMenuSpaceObjects();
  }

  function resetMainMenuButtonVisibility() {
    const isFamilyMode = gameMode === 'family';
    // Ensure Play is always visible, but disable it in Family mode.
    playBtn.style.display = 'inline-flex';
    playBtn.style.visibility = 'visible';
    // Visually indicate Family mode state while keeping Play clickable
    playBtn.classList.toggle('family-disabled', isFamilyMode);
    playBtn.style.opacity = '1';
    // Keep the pointer cursor so users know Play is clickable (opens party chooser)
    playBtn.style.cursor = 'pointer';

    if (stagesBtn) {
            // Keep Stages visible in the main menu even when Family mode is selected.
            // Individual navigation handlers will hide the Stages button when they open other screens.
            stagesBtn.style.display = 'inline-flex';
    }

    if (isFamilyMode) {
      planetsBtn.style.display = 'none';
      achievementsBtn.style.display = 'none';
      difficultyBtn.style.display = 'none';
    } else {
      planetsBtn.style.display = 'inline-flex';
      planetsBtn.style.visibility = 'visible';
      planetsBtn.style.opacity = '1';
      achievementsBtn.style.display = 'inline-flex';
      difficultyBtn.style.display = 'inline-flex';
    }
  }

  function applyFamilyModeMenuUI() {
    const isFamilyMode = gameMode === 'family';
    const titleElement = document.getElementById('menuTitle');
    const taglineElement = document.getElementById('menuTagline');
    const menuIconRow = document.querySelector('.menu-icon-row');
    const playBtnWrap = document.querySelector('.play-btn-wrap');
    const notificationBtn = document.getElementById('notificationBtn');
    const menuStars = document.getElementById('menuStars');
    const playBtn = document.getElementById('playBtn');

        // Do not modify `stagesBtn` visibility here. Keep the main menu layout stable
        // so users don't lose access to Stages immediately after toggling Family mode.

    if (isFamilyMode) {
      if (titleElement) {
        titleElement.textContent = 'Solar Fly';
        titleElement.style.color = '#fff';
        titleElement.style.background = 'none';
        titleElement.style.webkitBackgroundClip = 'unset';
        titleElement.style.backgroundClip = 'unset';
        titleElement.style.textShadow = 'none';
        titleElement.style.fontWeight = '700';
      }
      if (taglineElement) {
        taglineElement.innerHTML = '<span style="display:inline-block; font-size:22px; font-weight:900; letter-spacing:1px; background:linear-gradient(90deg, #39f, #f0f, #ff5e78, #4ff5a8); -webkit-background-clip:text; background-clip:text; color:transparent; text-shadow:0 0 12px rgba(63, 94, 255, 0.45), 0 0 10px rgba(255, 94, 120, 0.4);">Family</span>';
        taglineElement.style.textAlign = 'right';
        taglineElement.style.marginTop = '6px';
      }
            if (menuIconRow) {
        menuIconRow.style.position = 'absolute';
        menuIconRow.style.bottom = '88px';
        menuIconRow.style.left = '16px';
        menuIconRow.style.right = 'auto';
        menuIconRow.style.top = 'auto';
        menuIconRow.style.width = 'auto';
        menuIconRow.style.justifyContent = 'flex-start';
        menuIconRow.style.gap = '12px';
        menuIconRow.style.zIndex = '5';
      }
            if (playBtnWrap) {
        playBtnWrap.style.position = 'absolute';
        playBtnWrap.style.left = '16px';
        playBtnWrap.style.bottom = '16px';
        playBtnWrap.style.display = 'flex';
        playBtnWrap.style.alignItems = 'center';
        playBtnWrap.style.gap = '14px';
        playBtnWrap.style.zIndex = '10050';
        playBtnWrap.style.pointerEvents = 'auto';
      }
            if (notificationBtn) {
                notificationBtn.style.left = 'calc(100% + 10px)';
                notificationBtn.style.right = 'auto';
                notificationBtn.style.pointerEvents = 'auto';
            }
            if (playBtn) {
                playBtn.disabled = false;
                playBtn.removeAttribute('disabled');
                playBtn.classList.add('family-disabled');
                playBtn.style.cursor = 'pointer';
                playBtn.style.pointerEvents = 'auto';
                playBtn.style.zIndex = '10051';
                // apply inline filter so it overrides other CSS rules
                try { playBtn.style.filter = 'brightness(0.88) grayscale(0.08)'; } catch(e){}
            }
      if (menuStars) {
        menuStars.style.position = 'absolute';
        menuStars.style.right = '16px';
        menuStars.style.bottom = '20px';
        menuStars.style.margin = '0';
        menuStars.style.textAlign = 'right';
        menuStars.style.zIndex = '5';
      }
    } else {
      if (titleElement) {
        titleElement.textContent = 'Solar Fly';
        titleElement.style.color = '#fff';
        titleElement.style.background = 'none';
        titleElement.style.webkitBackgroundClip = 'unset';
        titleElement.style.backgroundClip = 'unset';
        titleElement.style.textShadow = 'none';
        titleElement.style.fontWeight = '700';
      }
      if (taglineElement) {
        taglineElement.textContent = 'A game made by Rihan';
        taglineElement.style.color = 'white';
        taglineElement.style.textAlign = 'left';
        taglineElement.style.marginTop = '0';
      }
            if (menuIconRow) {
        menuIconRow.style.position = 'static';
        menuIconRow.style.top = '';
        menuIconRow.style.right = '';
        menuIconRow.style.left = '';
        menuIconRow.style.width = 'min(220px, 74vw)';
        menuIconRow.style.justifyContent = 'center';
        menuIconRow.style.gap = '2px';
        menuIconRow.style.zIndex = '';
      }
      if (playBtnWrap) {
        playBtnWrap.style.position = 'relative';
        playBtnWrap.style.left = '';
        playBtnWrap.style.bottom = '';
        playBtnWrap.style.display = 'inline-block';
        playBtnWrap.style.alignItems = '';
        playBtnWrap.style.gap = '';
        playBtnWrap.style.zIndex = '';
      }
            if (notificationBtn) {
                notificationBtn.style.left = '';
                notificationBtn.style.right = '';
                notificationBtn.style.marginLeft = '';
            }
            if (playBtn) {
                playBtn.disabled = false;
                playBtn.removeAttribute('disabled');
                playBtn.classList.remove('family-disabled');
                playBtn.style.cursor = 'pointer';
                playBtn.style.pointerEvents = '';
                playBtn.style.zIndex = '';
                try { playBtn.style.filter = ''; } catch(e){}
            }
      if (menuStars) {
        menuStars.style.position = 'static';
        menuStars.style.right = '';
        menuStars.style.bottom = '';
        menuStars.style.margin = '0 0 8px';
        menuStars.style.textAlign = 'left';
        menuStars.style.zIndex = '';
      }
    }
  }

    // Taglines array for dynamic menu display
    const taglines = [
            'The universe is on your hand',
            'The way is not longer',
            'Go deeper but don\'t lose',
            'You\'re not alone',
            'Its not time to give up',
            'Rescue your friends from the evils',
            'Don\'t fall like a loser',
            'Infinity is Infinity always'
    ];

  function getRandomTagline() {
      return taglines[Math.floor(Math.random() * taglines.length)];
  }

  function showMenu(){
    // Set random tagline on each menu show
    const randomTaglineEl = document.getElementById('randomTagline');
    if (randomTaglineEl) {
        randomTaglineEl.textContent = getRandomTagline();
    }

    // Stop ambient soundscape when showing menu
    bgAudio.pause();
    activeSoundsState.bgAudioWasPlaying = false;
    clearAudioState(); // Clear tracking of game sounds
    
    // Initialize menu canvas for gameplay-like ambient
    if (!menuCanvas) initMenuCanvas();
    if (menuCanvas) {
      menuCanvas.style.display = 'block';
      resetMenuGameplay();
    }

    // Hide all overlays and alternate menus
    gameOver.style.display='none';
    pauseMenu.style.display='none';
    continueChoiceMenu.style.display='none';
    planetMenu.style.display='none';
    difficultyMenu.style.display='none';
    achievementsMenu.style.display='none';
    dailyRewardMenu.style.display='none';
    document.querySelectorAll('.screen').forEach(s => s.style.display='none');

    menu.style.display='flex';
    scorePanel.style.display='none';
    document.getElementById('pauseControl').style.display='none';
    profileCard.style.display = 'flex'; // show profile in menu

    // Ensure Play and Planets buttons are visible after tutorial
    resetMainMenuButtonVisibility();
    if (stagesBtn) {
      stagesBtn.style.display = gameMode === 'family' ? 'none' : 'inline-flex';
      updateStagesBtnDisplay();
    }

    // Ensure menu background is solid black and not showing last frame of game
    ctx.fillStyle='#000';
    ctx.fillRect(0,0,canvas.width,canvas.height);

    // Ensure gameWrap and UI are visible when menu is displayed
    gameWrap.style.display = 'flex';
    const canvasElement = document.getElementById('c');
    if (canvasElement) {
      canvasElement.style.display = 'none';
    }
    profileNameDisplay.style.display = 'block';
    profileNameDisplay.style.cursor = 'pointer';
    profileNameDisplay.title = 'Click to edit pilot name';
    profileNameDisplay.onclick = () => {
        const name = prompt('Enter pilot callsign:', playerName || '');
        if (name && name.trim()) {
            playerName = name.trim().substring(0, 15);
            profileNameDisplay.textContent = 'Pilot: ' + playerName;
            saveGameData();
            saveProfileData();
                        updateProfileDisplay();
                }
        };

        

    highScoreDisplay.textContent = 'High Score: ' + high;
    try { if (typeof updateStarsUI === 'function') updateStarsUI(); else { starsDisplay.textContent = '⭐ ' + totalStars; menuStars.textContent = '⭐ ' + totalStars; } } catch (e) { starsDisplay.textContent = '⭐ ' + totalStars; menuStars.textContent = '⭐ ' + totalStars; }
    profileNameDisplay.textContent = 'Pilot: ' + (playerName || 'N/A');
    updateProfileDisplay();
    healthDisplay.textContent = '❤️ ' + 3; // Reset health display on menu

    checkAchievements(false);
    updateStageTaskValues();
    updateMenuButtons();
    checkForUpdateIfNeeded();

    // Style the tagline: white, below, no animation
    const taglineElement = document.getElementById('menuTagline');
    if (gameMode !== 'family') {
      taglineElement.textContent = 'A game made by Rihan';
      taglineElement.style.color = 'white';
    }

    // Animate title with shrink expand
    const titleElement = document.getElementById('menuTitle');
    titleElement.style.animation = 'menuShrinkExpand 2.5s ease-in-out infinite';

    // Audio: ensure menu music is playing without restarting it
    bgAudio.pause();
    if (audioOn) {
      bgAudio.muted = false;
      ensureMenuMusicPlaying();
    } else {
      bgAudio.muted = true;
      sounds.menu.muted = true;
      sounds.menu.pause();
    }

    // Restore menu button handlers
    restoreMenuButtonFunctions();
    applyFamilyModeMenuUI();

    // Check for daily rewards first (before tutorial)
    if (isDailyRewardAvailable() && !rewardWeekCompleted) {
        if (typeof splash_loading !== 'undefined' && splash_loading) {
            splash_loading.style.display = 'none';
        }
        showDailyRewardMenu();
        return; // Don't show regular menu if daily reward is available
    }

    // Start the guided tutorial if needed
    if (isTutorialMode && tutorialStep === 0) {
        nextTutorialStep();
    }
    // Show post-stage messages for the appropriate stage transitions
    try {
        const noOtherModal = document.getElementById('planetMenu')?.style.display !== 'flex' &&
                             document.getElementById('difficultyMenu')?.style.display !== 'flex' &&
                             document.getElementById('achievementsMenu')?.style.display !== 'flex';

        if (typeof isAndroidDevice === 'function' && isAndroidDevice() && typeof isAndroidBridgeAvailable === 'function' && isAndroidBridgeAvailable()) {
            const justAdvancedFromStage0 = lastAdvancedFromStageIndex === 0;
            const alreadyShown = localStorage.getItem('gpConnectMessageShown') === 'true';
            const isAlreadyConnected = typeof isPlayGamesReallyConnected === 'function' ? isPlayGamesReallyConnected() : false;

            if (justAdvancedFromStage0 && !alreadyShown && !isAlreadyConnected && noOtherModal) {
                setTimeout(function() {
                    addGooglePlayConnectMessage();
                    localStorage.setItem('gpConnectMessageShown', 'true');
                }, 500);
            }

            if (lastAdvancedFromStageIndex === 2 && !localStorage.getItem('rateUsMessageShown') && noOtherModal) {
                setTimeout(function() {
                    addRateUsMessage();
                    localStorage.setItem('rateUsMessageShown', 'true');
                }, 500);
            }
        }

        if (lastAdvancedFromStageIndex === 1 && !localStorage.getItem('socialInviteMessageShown')) {
            setTimeout(function() {
                if (noOtherModal) {
                    addSocialInviteMessage();
                    localStorage.setItem('socialInviteMessageShown', 'true');
                }
            }, 500);
        }

        if (lastAdvancedFromStageIndex === 3 && !localStorage.getItem('truePilotMessageShown')) {
            setTimeout(function() {
                if (noOtherModal) {
                    addTruePilotMessage();
                    localStorage.setItem('truePilotMessageShown', 'true');
                }
            }, 500);
        }

        // Reset the flag so it doesn't trigger again
        lastAdvancedFromStageIndex = null;
    } catch (e) { 
        console.warn('Google Play prompt check failed', e); 
    }

    splash_loading.style.display = 'none'; // Ensure loading screen is hidden when menu shows
  }

  // --- INTRO SCREEN LOGIC (updated to use showLoadingScreen) ---
  const splash1 = document.getElementById('splash1');
  const splash_name = document.getElementById('splash_name');
  const nameInput = document.getElementById('nameInput');
  const nameBtn = document.getElementById('nameBtn');

  // Allow Enter key to submit the name entry screen
  nameInput.onkeypress = (e) => {
      if (e.key === 'Enter') nameBtn.click();
  };

  const splash_story = document.getElementById('splash_story');
  const storyBtn = document.getElementById('storyBtn');
  const splash3 = document.getElementById('splash3');
  const splash4 = document.getElementById('splash4');
  const splash3Btn = document.getElementById('splash3Btn');
  const splash4Btn = document.getElementById('splash4Btn');
  const splash1MenuBtn = document.getElementById('splash1MenuBtn');
  const gameWrap = document.getElementById('gameWrap');
  const splash_tutorial_choice = document.getElementById('splash_tutorial_choice');
  const yesTutorialBtn = document.getElementById('yesTutorialBtn');
  const noTutorialBtn = document.getElementById('noTutorialBtn');
  const skipTutorialFrom3Btn = document.getElementById('skipTutorialFrom3Btn');
  const skipTutorialFrom4Btn = document.getElementById('skipTutorialFrom4Btn');

  function hideAllScreens() {
      document.querySelectorAll('.screen').forEach(el => el.style.display = 'none');
      gameWrap.style.display = 'none';
      menu.style.display = 'none';
      planetMenu.style.display = 'none';
      difficultyMenu.style.display = 'none';
      achievementsMenu.style.display = 'none';
      dailyRewardMenu.style.display = 'none';
      gameOver.style.display = 'none';
      pauseMenu.style.display = 'none';
      continueChoiceMenu.style.display = 'none';
      if (stagesOverlay) stagesOverlay.style.display = 'none';
  }

  function focusFirstVisibleButton() {
      const activeContainer = Array.from(document.querySelectorAll('.screen, #gameOver, #pauseMenu, #dailyRewardMenu, #stagesOverlay, #menu, #planetMenu, #achievementsMenu, #difficultyMenu'))
          .find(el => el.offsetParent !== null && window.getComputedStyle(el).display !== 'none');
      const scope = activeContainer || document.body;
      const firstButton = Array.from(scope.querySelectorAll('button, .diffOption, .profile-card, input, .planetCell, .achievementItem, .stageCard, .reward-item, .stage-card, .stage-all-card'))
          .find(el => el.offsetParent !== null && window.getComputedStyle(el).visibility !== 'hidden');
      if (firstButton && typeof firstButton.focus === 'function') {
          firstButton.focus({ preventScroll: true });
      }
  }

  document.getElementById('splash1Btn').onclick = ()=>{
      showLoadingScreen(() => {
          hideAllScreens();
          pauseMenuAndBgMusic();
          if (!playerName) {
              setIntroScreenIndex(2);
              nameInput.value = playerName || '';
              splash_name.style.display = 'flex';
          } else {
              clearIntroScreenIndex();
              splash_story.style.display = 'flex';
          }
          focusFirstVisibleButton();
      });
  };

  function skipIntroAndTutorial() {
      tutorialStep = 0;
      hideTutorialPointer();
      isTutorialMode = false;
      isFirstRun = false;
      directToTutorialChoice = false;
      clearIntroScreenIndex();
      saveGameData();
      saveProfileData();
      hideAllScreens();
      showMenu();
      resetMainMenuButtonVisibility();
  }

  document.getElementById('splash1MenuBtn').onclick = ()=>{
      if (!playerName) {
          directToTutorialChoice = true;
          setIntroScreenIndex(2);
          hideAllScreens();
          nameInput.value = playerName || '';
          splash_name.style.display = 'flex';
          focusFirstVisibleButton();
      } else {
          directToTutorialChoice = true;
          setIntroScreenIndex(20);
          showLoadingScreen(() => {
              hideAllScreens();
              pauseMenuAndBgMusic();
              splash_tutorial_choice.style.display = 'flex';
              focusFirstVisibleButton();
          });
      }
  };

  nameBtn.onclick = async () => {
      const name = nameInput.value.trim();
      if (name.length < 2) {
          showMessage('Invalid Name', 'Please enter a name of at least 2 characters.');
          return;
      }
      playerName = name.substring(0, 15);
      isFirstRun = true; // Mark as first run after name entry
      const nextIntroScreenIndex = directToTutorialChoice ? 20 : 3;
      setIntroScreenIndex(nextIntroScreenIndex);
      saveGameData();
      saveProfileData();
      updateProfileDisplay();
      profileNameDisplay.textContent = 'Pilot: ' + playerName;
      recordUserAnalytics(playerName);

      showLoadingScreen(() => {
          hideAllScreens();
          pauseMenuAndBgMusic();
          if (directToTutorialChoice) {
              directToTutorialChoice = false;
              splash_tutorial_choice.style.display = 'flex';
          } else {
              splash3.style.display = 'flex';
          }
          focusFirstVisibleButton();
      });
  };

  splash3Btn.onclick = () => {
      showLoadingScreen(() => {
          hideAllScreens();
          pauseMenuAndBgMusic();
          setIntroScreenIndex(4);
          splash4.style.display = 'flex';
          focusFirstVisibleButton();
      });
  };

  splash4Btn.onclick = () => {
      showLoadingScreen(() => {
          hideAllScreens();
          pauseMenuAndBgMusic();
          setIntroScreenIndex(5);
          splash_story.style.display = 'flex';
          focusFirstVisibleButton();
      });
  };

  storyBtn.onclick = ()=>{
      showLoadingScreen(() => {
          hideAllScreens();
          if (isFirstRun) {
              // First time player (just entered name) sees choice
              setIntroScreenIndex(20);
              pauseMenuAndBgMusic();
              splash_tutorial_choice.style.display = 'flex';
              focusFirstVisibleButton();
          } else {
              clearIntroScreenIndex();
              launchGame();
          }
      });
  };

  function endTutorialSession() {
      tutorialStep = 0;
      hideTutorialPointer();
      isTutorialMode = false;
      isFirstRun = false;
      directToTutorialChoice = false;
      clearIntroScreenIndex();
      saveGameData();
      saveProfileData();
      restoreMenuButtonFunctions();
      resetMainMenuButtonVisibility();
      hideAllScreens();
      showMenu();
      focusFirstVisibleButton();
      showMessage('Tutorial Complete', 'Enjoy playing Solar Fly!');
  }

  function skipTutorialScreens() {
      hideAllScreens();
      pauseMenuAndBgMusic();
      setIntroScreenIndex(20);
      splash_tutorial_choice.style.display = 'flex';
      focusFirstVisibleButton();
  }

  skipTutorialFrom3Btn.onclick = skipTutorialScreens;
  skipTutorialFrom4Btn.onclick = skipTutorialScreens;
  tutorialSkipButton.onclick = () => {
      skipIntroAndTutorial();
  };

  yesTutorialBtn.onclick = () => {
      isTutorialMode = true;
      tutorialStep = 0;
      isFirstRun = false; // Tutorial sequence begins, clear first run flag
      clearIntroScreenIndex();
      saveGameData();
      showLoadingScreen(() => {
          hideAllScreens();
          showMenu();
          nextTutorialStep();
          focusFirstVisibleButton();
      });
  };

  noTutorialBtn.onclick = () => {
      isTutorialMode = false;
      isFirstRun = false; // Tutorial skipped, clear first run flag
      directToTutorialChoice = false;
      clearIntroScreenIndex();
      saveGameData();
      showLoadingScreen(() => {
          hideAllScreens();
          showMenu();
      });
  };

  function launchGame() {
      hideAllScreens();
      if (menu) menu.style.display = 'none';
      gameWrap.style.display = 'flex';
      fit();
      refreshPlanetGrid();
      updateProfileDisplay();

      // Stop menu music before starting gameplay
      if (sounds.menu) {
          sounds.menu.pause();
          sounds.menu.currentTime = 0;
      }

      const canvasElement = document.getElementById('c');
      if (canvasElement) {
          canvasElement.style.display = 'block';
      }

      // Apply the selected difficulty and begin the game
      applyDifficulty();
      start();
  }


  // --- INITIALIZATION ---

  window.addEventListener('beforeunload', () => {
      try {
          saveGameData();
      } catch (e) {
          console.warn('Failed to persist game data on unload:', e);
      }
  });

  window.onload=()=>{
    loadGameData();
    loadProfileData();
    loadSavedGameState();
    fit();
    checkForUpdateIfNeeded();

    if (pendingShortcutLaunch) {
        flushPendingShortcutLaunch();
        return;
    }

    // Ensure analytics send on open
    setTimeout(() => ensureAnalyticsOnReady(), 1000);

    // The initial loading screen is always shown, but the delay is longer for a dramatic start.
    if (!playerName) {
        pauseMenuAndBgMusic();
        updateAudioForCurrentMode();
        initialLoadingScreen(() => {
            pauseMenuAndBgMusic();
            updateAudioForCurrentMode();
            hideAllScreens();
            const stage = currentIntroScreenIndex || 1;
            if (stage === 2) {
                nameInput.value = playerName || '';
                splash_name.style.display = 'flex';
            } else if (stage === 3) {
                splash3.style.display = 'flex';
            } else if (stage === 4) {
                splash4.style.display = 'flex';
            } else if (stage === 5) {
                splash_story.style.display = 'flex';
            } else if (stage === 20) {
                splash_tutorial_choice.style.display = 'flex';
            } else {
                splash1.style.display = 'flex';
            }
            focusFirstVisibleButton();
        });
    } else if (isTutorialMode) {
        // If a tutorial was in progress, resume the tutorial flow instead of showing the choice
        // This avoids returning the player to the tutorial choice screen after closing the tab mid-guide
        pauseMenuAndBgMusic();
        updateAudioForCurrentMode();
        initialLoadingScreen(() => {
            pauseMenuAndBgMusic();
            updateAudioForCurrentMode();
            // Show menu then restore tutorial to the saved step
            hideAllScreens();
            showMenu();
            // If tutorialStep is 0 start it, otherwise set tutorialStep back one and advance once
            if (tutorialStep <= 0) {
                nextTutorialStep();
            } else {
                const target = tutorialStep;
                tutorialStep = Math.max(0, target - 1);
                nextTutorialStep();
            }
            focusFirstVisibleButton();
        });
    } else if (isFirstRun && currentIntroScreenIndex) {
        pauseMenuAndBgMusic();
        updateAudioForCurrentMode();
        initialLoadingScreen(() => {
            pauseMenuAndBgMusic();
            updateAudioForCurrentMode();
            hideAllScreens();
            if (currentIntroScreenIndex === 3) {
                splash3.style.display = 'flex';
            } else if (currentIntroScreenIndex === 4) {
                splash4.style.display = 'flex';
            } else if (currentIntroScreenIndex === 5) {
                splash_story.style.display = 'flex';
            } else if (currentIntroScreenIndex === 20) {
                splash_tutorial_choice.style.display = 'flex';
            } else if (currentIntroScreenIndex === 2) {
                nameInput.value = playerName || '';
                splash_name.style.display = 'flex';
            } else {
                splash_tutorial_choice.style.display = 'flex';
            }
            focusFirstVisibleButton();
        });
    } else if (savedGameState) {
        // If there's a saved in-progress game, show the normal menu first and allow the player to choose Continue after tapping Play
        pauseMenuAndBgMusic();
        updateAudioForCurrentMode();
        initialLoadingScreen(() => {
            pauseMenuAndBgMusic();
            updateAudioForCurrentMode();
            hideAllScreens();
            showMenu();
            focusFirstVisibleButton();
        });
    } else if (isFirstRun) {
        // If returning player, but first run flag is still true (meaning they hit 'Begin Mission' but closed before tutorial choice)
        pauseMenuAndBgMusic();
        updateAudioForCurrentMode();
        initialLoadingScreen(() => {
            pauseMenuAndBgMusic();
            updateAudioForCurrentMode();
            splash_tutorial_choice.style.display = 'flex';
            focusFirstVisibleButton();
        });
    } else {
        initialLoadingScreen(() => {
            hideAllScreens();
            showMenu();
            focusFirstVisibleButton();
        });
    }
  };




window.reviveShieldActive = false;
window.reviveShieldExpires = 0;

function resetPlayerForRevive() {
    if (!player || !canvas) return;

    resetPlayerToSpawnPosition();
    player.vx = 0;

    playerHealth = 3;
    if (healthDisplay) {
        healthDisplay.textContent = '❤️ ' + playerHealth;
    }

    explosions = explosions || [];
    explosions.length = 0;

    eatingBlackHole = null;
    eatingShuriken = null;

    if (scorePanel) scorePanel.style.display = 'block';
    if (gameOver) gameOver.style.display = 'none';
    if (document.getElementById('pauseControl')) {
        document.getElementById('pauseControl').style.display = 'block';
    }
}

function revivePlanet() {

    if (!player || !canvas) return;

    resetPlayerForRevive();

    // Game state
    running = false; // pause briefly before resume
    setGamePause(false); // IMPORTANT sync with ad system
    showReviveCountdown();
}

function showReviveCountdown() {
    const existing = document.getElementById('reviveContinueOverlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'reviveContinueOverlay';
    overlay.style = 'position:fixed;inset:0;display:flex;align-items:center;justify-content:center;z-index:100002;pointer-events:none;background:rgba(0,0,0,0.45);';
    overlay.innerHTML = `
        <div style="background:rgba(0,0,0,0.85);padding:20px 24px;border-radius:16px;color:#fff;display:flex;flex-direction:column;align-items:center;gap:10px;min-width:240px;text-align:center;border:1px solid rgba(0, 200, 255, 0.25);box-shadow:0 0 20px rgba(0,200,255,0.25)">
            <div style="font-size:18px;font-weight:700;">Revive loading</div>
            <div style="font-size:16px;">You will continue in <span id="reviveContinueCountdown">3</span>s</div>
            <div style="color:#7edfff;font-size:14px;">Blue shield active after respawn</div>
        </div>
    `;
    document.body.appendChild(overlay);

    let seconds = 3;
    const countdownEl = document.getElementById('reviveContinueCountdown');
    const interval = setInterval(() => {
        seconds -= 1;
        if (countdownEl) countdownEl.innerText = seconds.toString();
        if (seconds <= 0) {
            clearInterval(interval);
            if (overlay) overlay.remove();
            window.reviveShieldActive = true;
            window.reviveShieldExpires = Date.now() + 3000;
            running = true;
            if (audioOn) {
                updateAudioForCurrentMode();
            }
            setTimeout(() => {
                window.reviveShieldActive = false;
            }, 3000);
        }
    }, 1000);
}


  const audioFiles = {
    ambient: "music/ambient-soundscapes-001-space-atmosphere-303246.mp3",
    jump: "music/pixel-jump-319167.mp3",
    unlock: "music/success-340660.mp3",
    tap: "music/tap-notification-180637.mp3",
    achievement: "music/success-340660.mp3",
    door: "music/scifi-door-opening-36171.mp3",
    key: "music/key-get-39925.mp3",
    over: "music/over.mp3",
    menu: "music/Main_menu.mp3",
  };
