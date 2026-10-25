// ===============================
// SOLAR FLY - FINAL AD SYSTEM (STABLE)
// ===============================

let reviveUsed = false;
let isAdRunning = false;
let rewardHandled = false;
let interstitialExitCallback = null;
let interstitialShowPending = false;
let rewardCountdownInterval = null;
let rewardCountdownTimeout = null;
let reviveObserverInited = false;
let interstitialLoadTimer = null;
let interstitialPreloadInFlight = false;
let interstitialLoadRetryCount = 0;
let adPauseRestoreState = { active: false, wasRunning: false };
const INTERSTITIAL_SCORE_THRESHOLD = 7;
const INTERSTITIAL_LOAD_TIMEOUT_MS = 10000;
const INTERSTITIAL_MAX_RETRIES = 1;

// ===============================
// GAME PAUSE SYSTEM
// ===============================
function setGamePause(state) {
    if (state) {
        if (isAdRunning) return;
        isAdRunning = true;
        adPauseRestoreState = {
            active: true,
            wasRunning: Boolean(typeof running !== 'undefined' && running)
        };
        if (typeof window.pauseGameForAd === 'function') {
            window.pauseGameForAd();
        }
        return;
    }

    if (!isAdRunning) return;
    isAdRunning = false;
    const shouldResume = adPauseRestoreState.wasRunning;
    adPauseRestoreState = { active: false, wasRunning: false };
    if (typeof window.resumeGameAfterAd === 'function') {
        window.resumeGameAfterAd(shouldResume);
    }
}

function isOffline() {
    return typeof navigator !== 'undefined' && navigator.onLine === false;
}

function clearInterstitialLoadTimer() {
    if (interstitialLoadTimer) {
        clearTimeout(interstitialLoadTimer);
        interstitialLoadTimer = null;
    }
}

function resetInterstitialRequestState() {
    interstitialLoadRetryCount = 0;
    clearInterstitialLoadTimer();
}

function preloadInterstitialAd(force = false) {
    if (isOffline() || !window.Android?.loadInterstitialAd) {
        return false;
    }

    if (window.Android?.isInterstitialReady && window.Android.isInterstitialReady()) {
        interstitialPreloadInFlight = false;
        return true;
    }

    if (!force && (interstitialShowPending || interstitialPreloadInFlight)) {
        return true;
    }

    interstitialPreloadInFlight = true;
    try {
        Android.loadInterstitialAd();
        return true;
    } catch (err) {
        interstitialPreloadInFlight = false;
        console.warn('Interstitial preload failed:', err);
        return false;
    }
}

// ===============================
// SAFE HELPERS
// ===============================
function safeGet(id) {
    return document.getElementById(id);
}

function safeOnClick(id, fn) {
    const el = document.getElementById(id);
    if (el) el.onclick = fn;
}

function hookReviveButton() {
    const reviveBtn = safeGet('reviveBtn');
    if (!reviveBtn) return;

    if (reviveBtn.dataset.rewardHooked === '1') return;
    reviveBtn.dataset.rewardHooked = '1';

    reviveBtn.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation && event.stopPropagation();
        if (reviveUsed) return;
        if (getCurrentScore() <= 0) return;
        tryLoadRewardedAd();
    });
}

function getCurrentScore() {
    const scoreEl = safeGet('scoreTxt');
    return scoreEl ? parseInt(scoreEl.innerText, 10) || 0 : 0;
}

function updateReviveButtonState() {
    const reviveBtn = safeGet('reviveBtn');
    if (!reviveBtn) return;

    const score = getCurrentScore();
    const showButton = score > 0 && !reviveUsed;

    reviveBtn.style.display = showButton ? 'block' : 'none';
    reviveBtn.disabled = !showButton;
    if (showButton) {
        reviveBtn.innerText = '📸 Revive! (Watch Ad)';
    }
}

function initReviveButtonObserver() {
    if (reviveObserverInited) return;
    reviveObserverInited = true;

    const gameOver = safeGet('gameOver');
    if (!gameOver) return;

    const observer = new MutationObserver(() => {
        if (gameOver.style.display !== 'none') {
            updateReviveButtonState();
        }
    });
    observer.observe(gameOver, { attributes: true, attributeFilter: ['style', 'class'] });
}

function clearRewardCountdown() {
    if (rewardCountdownInterval) {
        clearInterval(rewardCountdownInterval);
        rewardCountdownInterval = null;
    }
    if (rewardCountdownTimeout) {
        clearTimeout(rewardCountdownTimeout);
        rewardCountdownTimeout = null;
    }
}

function hideRewardLoadingOverlay() {
    clearRewardCountdown();
    const overlay = document.getElementById('rewardLoadingOverlay');
    if (overlay) overlay.remove();
    const reviveBtn = safeGet('reviveBtn');
    if (reviveBtn && !reviveUsed) {
        reviveBtn.innerText = "📸 Revive! (Watch Ad)";
        reviveBtn.disabled = false;
    }
}

function requestInterstitialAd(callback) {
    resetInterstitialRequestState();
    interstitialExitCallback = () => {
        setGamePause(false);
        callback && callback();
    };

    if (window.Android?.isInterstitialReady && window.Android.isInterstitialReady()) {
        interstitialShowPending = false;
        setGamePause(true);
        try {
            Android.showInterstitialAd();
        } catch (err) {
            console.warn('Interstitial show failed:', err);
            interstitialShowPending = false;
            setGamePause(false);
        }
        return true;
    }

    if (isOffline()) {
        console.warn('Offline: skipping interstitial ad request.');
        interstitialExitCallback = null;
        return false;
    }

    if (window.Android?.loadInterstitialAd) {
        interstitialShowPending = true;
        setGamePause(true);

        const adRequested = preloadInterstitialAd(true);
        if (!adRequested) {
            interstitialShowPending = false;
            setGamePause(false);
            interstitialExitCallback = null;
            return false;
        }

        interstitialLoadTimer = setTimeout(() => {
            if (!interstitialShowPending) return;

            const adReadyNow = window.Android?.isInterstitialReady && window.Android.isInterstitialReady();
            if (adReadyNow) {
                interstitialShowPending = false;
                interstitialPreloadInFlight = false;
                return;
            }

            if (interstitialLoadRetryCount < INTERSTITIAL_MAX_RETRIES) {
                interstitialLoadRetryCount += 1;
                console.info(`Interstitial ad still loading; retrying attempt #${interstitialLoadRetryCount}.`);
                try {
                    Android.loadInterstitialAd();
                } catch (err) {
                    console.warn('Interstitial retry failed:', err);
                }
                interstitialLoadTimer = setTimeout(() => {
                    if (!interstitialShowPending) return;
                    interstitialShowPending = false;
                    interstitialPreloadInFlight = false;
                    console.warn('Interstitial ad did not become ready in time; continuing without it.');
                    setGamePause(false);
                    const fallbackCallback = interstitialExitCallback;
                    interstitialExitCallback = null;
                    if (typeof fallbackCallback === 'function') {
                        fallbackCallback();
                    }
                }, INTERSTITIAL_LOAD_TIMEOUT_MS);
                return;
            }

            interstitialShowPending = false;
            interstitialPreloadInFlight = false;
            console.warn('Interstitial ad did not become ready in time; continuing without it.');
            setGamePause(false);
            const fallbackCallback = interstitialExitCallback;
            interstitialExitCallback = null;
            if (typeof fallbackCallback === 'function') {
                fallbackCallback();
            }
        }, INTERSTITIAL_LOAD_TIMEOUT_MS);

        return true;
    }

    interstitialExitCallback = null;
    return false;
}

function maybeShowInterstitialForExit(callback) {
    const scoreEl = safeGet('scoreTxt');
    const currentScore = scoreEl ? parseInt(scoreEl.innerText, 10) || 0 : 0;

    if (currentScore >= INTERSTITIAL_SCORE_THRESHOLD) {
        return requestInterstitialAd(() => {
            setGamePause(false);
            callback && callback();
        });
    }

    return false;
}

function attachInterstitialHook(button) {
    if (!button || button.dataset.interstitialHooked === '1') return;
    button.dataset.interstitialHooked = '1';

    const originalHandler = button.onclick;
    button.addEventListener('click', function (event) {
        const scoreEl = safeGet('scoreTxt');
        const currentScore = scoreEl ? parseInt(scoreEl.innerText, 10) || 0 : 0;
        const canAttemptInterstitial = currentScore >= INTERSTITIAL_SCORE_THRESHOLD &&
            (window.Android?.isInterstitialReady || window.Android?.loadInterstitialAd);

        if (!canAttemptInterstitial) {
            if (typeof originalHandler === 'function') {
                originalHandler.call(button, event);
            }
            return;
        }

        event.preventDefault();
        event.stopImmediatePropagation && event.stopImmediatePropagation();

        const adRequested = requestInterstitialAd(() => {
            setGamePause(false);
            if (typeof originalHandler === 'function') {
                originalHandler.call(button, event);
            }
        });

        if (!adRequested) {
            setGamePause(false);
            if (typeof originalHandler === 'function') {
                originalHandler.call(button, event);
            }
        }
    }, true);
}

// ===============================
// PLANET DEAD SETUP
// ===============================
function setupDeathScreen() {
    preloadInterstitialAd(false);

    const reviveBtn = safeGet("reviveBtn");

    if (reviveBtn) {
        if (reviveUsed) {
            reviveBtn.style.display = "none";
        } else {
            reviveBtn.style.display = "block";
            reviveBtn.innerText = "Revive (Watch Ad)";
            reviveBtn.disabled = false;

            reviveBtn.onclick = function () {
                tryLoadRewardedAd();
            };
        }
    }

    attachInterstitialHook(safeGet("playAgainBtn"));
    attachInterstitialHook(safeGet("backMenuBtn"));
}

// ===============================
// SAFE OVERRIDES
// ===============================
const originalPlanetDead = window.planetDead || function(){};

window.planetDead = function () {
    originalPlanetDead();
    BannerManager.hide();
    setupDeathScreen();
};

const originalShowMenu = window.showMenu || function(){};

window.showMenu = function () {
    originalShowMenu();
    BannerManager.show();
    preloadInterstitialAd(false);
};

// ===============================
// REWARDED AD SYSTEM
// ===============================
function tryLoadRewardedAd() {

    rewardHandled = false;
    let adResolved = false;

    setGamePause(true);

    const reviveBtn = safeGet("reviveBtn");

    if (reviveBtn) {
        reviveBtn.innerText = "Connecting...";
        reviveBtn.disabled = true;
    }

    // Create a small retry/countdown UI so player sees the 5s waiting period
    if (!document.getElementById('rewardLoadingOverlay')) {
        const overlay = document.createElement('div');
        overlay.id = 'rewardLoadingOverlay';
        overlay.style = `position:fixed;inset:0;display:flex;align-items:center;justify-content:center;z-index:100001;pointer-events:auto`;
        overlay.innerHTML = `
            <div style="background:rgba(0,0,0,0.85);padding:12px 18px;border-radius:12px;color:#fff;display:flex;flex-direction:column;align-items:center;gap:8px;min-width:220px;text-align:center;border:1px solid rgba(255,255,255,0.04)">
                <div style="font-weight:700">Connecting to ad...</div>
                <div>Retry in <span id="rewardCountdown">5</span>s</div>
                <div style="display:flex;gap:8px;margin-top:6px">
                    <button id="rewardCancelBtn" style="padding:6px 10px;border-radius:8px;border:0;background:#666;color:#fff;cursor:pointer">Cancel</button>
                    <button id="rewardNowBtn" style="padding:6px 10px;border-radius:8px;border:0;background:#2b6cff;color:#fff;cursor:pointer">Retry Now</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        let seconds = 5;
        const countdownEl = document.getElementById('rewardCountdown');
        rewardCountdownInterval = setInterval(() => {
            seconds -= 1;
            if (countdownEl) countdownEl.innerText = seconds.toString();
            if (seconds <= 0) {
                hideRewardLoadingOverlay();
                if (window.Android && Android.loadRewardedAd) {
                    try { Android.loadRewardedAd(); } catch(e){}
                }
            }
        }, 1000);

        document.getElementById('rewardCancelBtn').onclick = function() {
            rewardHandled = true;
            hideRewardLoadingOverlay();
            setGamePause(false);
        };

        document.getElementById('rewardNowBtn').onclick = function() {
            hideRewardLoadingOverlay();
            if (window.Android && Android.loadRewardedAd) {
                try { Android.loadRewardedAd(); } catch(e){}
            }
        };
    }

    rewardCountdownTimeout = setTimeout(() => {
        if (!adResolved && !rewardHandled) {
            hideRewardLoadingOverlay();
            showNoConnectionUI();
        }
    }, 5000);

    window.onRewardedAdLoaded = function () {
        if (rewardHandled) return;
        rewardHandled = true;

        adResolved = true;
        if (rewardCountdownTimeout) {
            clearTimeout(rewardCountdownTimeout);
            rewardCountdownTimeout = null;
        }
        hideRewardLoadingOverlay();

        if (window.Android?.showRewardedAd) {
            Android.showRewardedAd();
        } else {
            showNoConnectionUI();
        }
    };

    window.onRewardedAdFailed = function () {
        if (rewardHandled) return;
        rewardHandled = true;

        adResolved = true;
        if (rewardCountdownTimeout) {
            clearTimeout(rewardCountdownTimeout);
            rewardCountdownTimeout = null;
        }
        hideRewardLoadingOverlay();
        showNoConnectionUI();
    };

    if (window.Android?.isRewardedReady && window.Android.isRewardedReady()) {
        hideRewardLoadingOverlay();
        if (window.Android?.showRewardedAd) {
            try {
                Android.showRewardedAd();
            } catch (err) {
                console.warn('Rewarded ad show failed:', err);
                showNoConnectionUI();
            }
            return;
        }
    }

    if (isOffline()) {
        console.warn('Offline: skipping rewarded ad request.');
        showNoConnectionUI();
        return;
    }

    if (window.Android?.loadRewardedAd) {
        try {
            Android.loadRewardedAd();
        } catch (err) {
            console.warn('Rewarded ad load failed:', err);
            showNoConnectionUI();
        }
    }
}

// ===============================
// NO CONNECTION UI
// ===============================
function showNoConnectionUI() {

    setGamePause(false);

    const dialog = document.createElement("div");
    dialog.style = `
        position:fixed;
        inset:0;
        background:rgba(0,0,0,0.9);
        z-index:99999;
        display:flex;
        flex-direction:column;
        align-items:center;
        justify-content:center;
        color:white;
        text-align:center;
    `;

    dialog.innerHTML = `
        <h2 style="color:red;">No Network</h2>
        <p>Ad failed to load</p>
        <button id="closeNoConn">Close</button>
    `;

    document.body.appendChild(dialog);

    safeGet("closeNoConn").onclick = () => {
        dialog.remove();

        const btn = safeGet("reviveBtn");
        if (btn && !reviveUsed) {
            btn.innerText = "Revive (Watch Ad)";
            btn.disabled = false;
            btn.style.display = "block";
        }
    };
}

// ===============================
// AD CALLBACKS
// ===============================
function resetGameDirectly() {
    console.log("🔄 Resetting game directly (ad dismissed)");
    resetGame();
    showMenu();
}

function onAdDismissed() {
    clearInterstitialLoadTimer();
    setGamePause(false);

    if (typeof interstitialExitCallback === 'function') {
        const callback = interstitialExitCallback;
        interstitialExitCallback = null;
        callback();
        return;
    }

    resetGameDirectly();
}

window.onInterstitialAdLoaded = function () {
    resetInterstitialRequestState();
    if (!interstitialShowPending) {
        interstitialPreloadInFlight = false;
        return;
    }
    interstitialShowPending = false;
    interstitialPreloadInFlight = false;
    if (window.Android?.showInterstitialAd) {
        Android.showInterstitialAd();
    } else {
        if (typeof interstitialExitCallback === 'function') {
            const callback = interstitialExitCallback;
            interstitialExitCallback = null;
            callback();
        } else {
            resetGameDirectly();
        }
    }
};

window.onInterstitialAdFailed = function () {
    resetInterstitialRequestState();
    interstitialShowPending = false;
    interstitialPreloadInFlight = false;
    setGamePause(false);
    if (typeof interstitialExitCallback === 'function') {
        const callback = interstitialExitCallback;
        interstitialExitCallback = null;
        callback();
        return;
    }
    console.warn('Interstitial failed without exit callback. Keeping current state.');
};

function onRewardEarned() {
    reviveUsed = true;
    setGamePause(false);

    const btn = safeGet("reviveBtn");
    if (btn) {
        btn.style.display = "none";
    }
    updateReviveButtonState();

    revivePlanet();

    // Ensure audio resumes after the rewarded ad returns (WebView/activity focus shift)
    setTimeout(function () {
        try {
            if (typeof updateAudioForCurrentMode === 'function') updateAudioForCurrentMode();
            if (typeof restoreActiveSounds === 'function') restoreActiveSounds();
            if (typeof tryPlayBackgroundMusic === 'function') tryPlayBackgroundMusic();
        } catch (e) {
            console.warn('Audio resume after reward failed:', e);
        }
    }, 350);
}

// ===============================
// REWARD AD CALLBACK FROM ANDROID
// ===============================
window.adSuccessRevive = function() {
    console.log("✅ Reward earned from Android");
    rewardHandled = true;
    hideRewardLoadingOverlay();
    onRewardEarned();
};

window.adFailedRevive = function() {
    console.log("❌ Reward ad failed from Android");
    if (rewardHandled) return;
    rewardHandled = true;
    hideRewardLoadingOverlay();
    setGamePause(false);
    showNoConnectionUI();
};

// ===============================
// BANNER SYSTEM (with retry/backoff)
// ===============================
const BannerManager = {
    _attempts: 0,
    _maxAttempts: 5,
    _retryTimer: null,
    _baseDelay: 2000,
    set: function (show) {
        if (!window.Android) return;
        if (show) {
            this._reset();
            try {
                Android.showBanner();
            } catch (e) {
                console.warn('Banner show failed:', e);
                if (!isOffline()) this._scheduleRetry();
            }
        } else {
            try {
                Android.hideBanner();
            } catch (e) {
                console.warn('Banner hide failed:', e);
            }
            if (this._retryTimer) { clearTimeout(this._retryTimer); this._retryTimer = null; }
        }
    },
    show: function () { this.set(true); },
    hide: function () { this.set(false); },
    _scheduleRetry: function () {
        if (isOffline()) {
            console.warn('Banner: offline, skipping retries.');
            return;
        }
        this._attempts++;
        if (this._attempts > this._maxAttempts) {
            console.warn('Banner: max retry attempts reached.');
            return;
        }
        const delay = this._baseDelay * Math.pow(2, this._attempts - 1);
        if (this._retryTimer) clearTimeout(this._retryTimer);
        this._retryTimer = setTimeout(() => {
            this._retryTimer = null;
            try {
                if (window.Android && Android.loadBanner) {
                    Android.loadBanner();
                } else if (window.Android && Android.showBanner) {
                    // fallback to showBanner if loadBanner not available
                    Android.showBanner();
                }
            } catch (e) {
                console.warn('Banner retry load failed:', e);
                this._scheduleRetry();
            }
        }, delay);
        console.info(`Banner: scheduling retry #${this._attempts} in ${delay}ms`);
    },
    _reset: function () {
        this._attempts = 0;
        if (this._retryTimer) { clearTimeout(this._retryTimer); this._retryTimer = null; }
    }
};

window.onBannerFailed = function() {
    console.warn('Banner failed to load, scheduling retry.');
    BannerManager._scheduleRetry();
};

window.onBannerLoaded = function() {
    console.info('Banner loaded, resetting retry counter.');
    BannerManager._reset();
};

// Sync banner with game mode changes
window.updateBannerForGameMode = function(mode) {
    try {
        localStorage.setItem('solarFlyGameMode', mode);
    } catch (e) {
        console.warn('Failed to save game mode to localStorage:', e);
    }
    try {
        updateBannerVisibility();
    } catch (e) {
        console.warn('Failed to update banner visibility after game mode change:', e);
    }
};

// ===============================
// RESET ON NEW GAME
// ===============================
const originalLaunch = window.launchGame || function(){};

window.launchGame = function () {
    reviveUsed = false;
    updateReviveButtonState();

    originalLaunch();
    BannerManager.hide();
    preloadInterstitialAd(false);
};

// ===============================
// UI HOOKS
// ===============================
function attachUIHooks() {
    const menuEl = safeGet('menu');
    const quitBtn = safeGet('quitBtn');
    const quitMenuBtn = safeGet('quitMenuBtn');

    const wrapExitHandler = (originalHandler) => {
        return function () {
            if (menuEl && menuEl.style.display !== 'none') {
                return originalHandler && originalHandler();
            }

            const runOriginal = () => {
                if (originalHandler) originalHandler();
            };

            if (maybeShowInterstitialForExit(runOriginal)) {
                return;
            }

            runOriginal();
        };
    };

    if (quitBtn && !quitBtn.dataset.admobHooked) {
        quitBtn.dataset.admobHooked = '1';
        const originalQuit = quitBtn.onclick;
        quitBtn.onclick = wrapExitHandler(originalQuit);
    }

    if (quitMenuBtn && !quitMenuBtn.dataset.admobHooked) {
        quitMenuBtn.dataset.admobHooked = '1';
        const originalQuitMenu = quitMenuBtn.onclick;
        quitMenuBtn.onclick = wrapExitHandler(originalQuitMenu);
    }

    hookReviveButton();
    updateReviveButtonState();
    initReviveButtonObserver();
    preloadInterstitialAd(false);
}

// ===============================
// BANNER VISIBILITY MANAGER
// ===============================
function isVisible(el) {
    if (!el) return false;

    const style = window.getComputedStyle(el);
    return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
}

function areAnyVisible(ids) {
    return ids.some(id => isVisible(safeGet(id)));
}

function shouldBannerBeVisible() {
    if (typeof isTutorialMode !== 'undefined' && isTutorialMode) return false;

    const splashIds = [
        'splash_loading', 'splash1', 'splash_name', 'splash_tutorial_choice',
        'splash3', 'splash4', 'splash_story'
    ];
    if (areAnyVisible(splashIds)) return false;

    const hideIds = [
        'dailyRewardMenu', 'newHighScoreOverlay', 'updateModal', 'rateModal',
        'continueChoiceMenu', 'editNicknameModal', 'stageTransitionOverlay',
        'gpPromptOverlay'
    ];
    if (areAnyVisible(hideIds)) return false;

    // 🚀 FIX: Hide banner on main menu when Family mode is active
    const menuEl = document.getElementById('menu');
    if (menuEl && menuEl.style.display !== 'none') {
        let gameMode = 'classic';
        try {
            gameMode = localStorage.getItem('solarFlyGameMode') || 'classic';
        } catch (e) {
            console.warn('Could not read game mode from localStorage:', e);
        }
        if (gameMode === 'family') {
            return false;
        }
    }

    const showIds = [
        'menu', 'planetMenu', 'difficultyMenu', 'achievementsMenu',
        'stagesOverlay', 'pauseMenu', 'gameOver', 'profileCard',
        'notificationPanel', 'socialMediaOverlay', 'marketplaceOverlay', 'settingsOverlay',
        'familyPartyChooserOverlay'
    ];
    if (areAnyVisible(showIds)) return true;

    return false;
}

function updateBannerVisibility() {
    if (shouldBannerBeVisible()) {
        BannerManager.show();
    } else {
        BannerManager.hide();
    }
}

// Monitor screen changes for banner visibility
function initBannerVisibilityMonitor() {
    // List of all screens to monitor
    const screenIds = [
        'menu', 'gameWrap', 'splash_loading', 'splash1', 'splash_name',
        'splash_tutorial_choice', 'splash3', 'splash4', 'splash_story',
        'planetMenu', 'difficultyMenu', 'achievementsMenu', 'pauseMenu',
        'familyPartyChooserOverlay',
        'gameOver', 'stagesOverlay', 'stageTransitionOverlay', 'dailyRewardMenu',
        'continueChoiceMenu', 'newHighScoreOverlay', 'updateModal', 'rateModal',
        'editNicknameModal', 'profileCard', 'socialMediaOverlay',
        'marketplaceOverlay', 'settingsOverlay'
    ];

    screenIds.forEach(screenId => {
        const el = safeGet(screenId);
        if (!el) return;
        const observer = new MutationObserver(() => updateBannerVisibility());
        observer.observe(el, { attributes: true, attributeFilter: ['style', 'class'] });
    });

    updateBannerVisibility();
}

// INIT
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
        BannerManager.hide();
        initBannerVisibilityMonitor();
        setTimeout(attachUIHooks, 0);
    });
} else {
    BannerManager.hide();
    initBannerVisibilityMonitor();
    setTimeout(attachUIHooks, 0);
}

window.addEventListener('load', attachUIHooks);

// ===============================
// NATIVE AD BRIDGE + RENDERING
// ===============================

function isLikelyTv() {
    try {
        const ua = navigator.userAgent || '';
        if (/Android TV|SmartTV|SMART-TV|TV/.test(ua)) return true;
        if (!('ontouchstart' in window) && (screen.width >= 800 || screen.height >= 600)) return true;
    } catch (e) {}
    return false;
}

function removeNativeContainers() {
    ['native-banner','native-interstitial','native-rewarded'].forEach(id=>{ const el=document.getElementById(id); if(el) el.remove(); });
}

window.onNativeAdLoaded = function(ad) {
    try {
        const obj = (typeof ad === 'string') ? JSON.parse(ad) : ad || {};
        // prefer interstitial on large/TV devices when offered
        const opts = Array.isArray(obj.renderOptions) ? obj.renderOptions : ['banner','interstitial','rewarded'];
        if (opts.indexOf('interstitial') !== -1 && isLikelyTv()) {
            renderNativeAsInterstitial(obj);
            return;
        }
        // prefer rewarded when it includes media/video
        if (opts.indexOf('rewarded') !== -1 && obj.mediaHasVideo) {
            renderNativeAsRewarded(obj);
            return;
        }
        // fallback banner
        if (opts.indexOf('banner') !== -1) {
            renderNativeAsBanner(obj);
            return;
        }
        renderNativeAsBanner(obj);
    } catch (e) {
        console.warn('onNativeAdLoaded handling failed', e);
    }
};

window.onNativeAdFailed = function() {
    console.warn('Native ad failed to load');
};

function renderNativeAsBanner(ad) {
    removeNativeContainers();
    const container = document.createElement('div');
    container.id = 'native-banner';
    container.style = 'position:fixed;left:0;right:0;bottom:0;z-index:100000;background:#000;color:#fff;display:flex;align-items:center;gap:12px;padding:10px;box-sizing:border-box;';
    const img = document.createElement('img'); img.src = ad.iconUri || ad.imageUri || ''; img.style='height:56px;width:56px;object-fit:cover;border-radius:6px;';
    const text = document.createElement('div'); text.style='flex:1'; text.innerHTML = `<div style="font-weight:700">${escapeHtml(ad.headline||'')}</div><div style="font-size:12px;opacity:0.9">${escapeHtml(ad.body||'')}</div>`;
    const cta = document.createElement('button'); cta.innerText = ad.callToAction || 'Open'; cta.style='margin-left:8px;padding:8px 12px;background:#2b6cff;color:#fff;border:0;border-radius:8px;cursor:pointer';
    cta.onclick = function(){
        try {
            if (window.Android && Android.openExternalUrl && ad.clickUrl) {
                Android.openExternalUrl(ad.clickUrl);
            } else if (window.Android && Android.showInterstitialAd) {
                Android.showInterstitialAd();
            }
        } catch (e) { console.warn('CTA click failed', e); }
    };
    container.appendChild(img);
    container.appendChild(text);
    container.appendChild(cta);
    document.body.appendChild(container);
    // auto-hide after 20s
    setTimeout(()=>{ try{ container.remove(); } catch(_){} }, 20000);
}

function renderNativeAsInterstitial(ad) {
    removeNativeContainers();
    setGamePause(true);
    const overlay = document.createElement('div');
    overlay.id = 'native-interstitial';
    overlay.style = 'position:fixed;inset:0;background:rgba(0,0,0,0.95);z-index:100001;display:flex;align-items:center;justify-content:center;padding:24px;box-sizing:border-box;color:#fff';
    overlay.innerHTML = `
        <div style="max-width:1100px;width:95%;background:#000;padding:18px;border-radius:12px;text-align:center">
            <h2 style="margin:6px 0">${escapeHtml(ad.headline||'')}</h2>
            <p style="opacity:0.9">${escapeHtml(ad.body||'')}</p>
            <img src="${ad.imageUri||ad.iconUri||''}" style="max-width:100%;height:auto;margin:12px 0;border-radius:8px"/>
            <div style="display:flex;gap:12px;justify-content:center;margin-top:12px">
                <button id="nativeCloseBtn" style="padding:8px 12px;border-radius:8px;border:0;background:#666;color:#fff">Close</button>
                <button id="nativeCtaBtn" style="padding:8px 12px;border-radius:8px;border:0;background:#2b6cff;color:#fff">${escapeHtml(ad.callToAction||'Open')}</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
    safeGet('nativeCloseBtn').onclick = function(){ overlay.remove(); setGamePause(false); onAdDismissed(); };
    safeGet('nativeCtaBtn').onclick = function(){
        try {
            if (window.Android && Android.openExternalUrl && ad.clickUrl) Android.openExternalUrl(ad.clickUrl);
            else if (window.Android && Android.showInterstitialAd) Android.showInterstitialAd();
        } catch (e) { console.warn('Native interstitial CTA failed', e); }
    };
}

function renderNativeAsRewarded(ad) {
    removeNativeContainers();
    setGamePause(true);
    const overlay = document.createElement('div');
    overlay.id = 'native-rewarded';
    overlay.style = 'position:fixed;inset:0;background:rgba(0,0,0,0.98);z-index:100002;display:flex;align-items:center;justify-content:center;padding:20px;color:#fff';
    overlay.innerHTML = `
        <div style="max-width:800px;width:95%;text-align:center;padding:18px;background:#000;border-radius:12px">
            <h2 style="margin:6px 0">${escapeHtml(ad.headline||'')}</h2>
            <p style="opacity:0.9">${escapeHtml(ad.body||'')}</p>
            <div style="margin-top:12px">
                <button id="nativeWatchBtn" style="padding:10px 16px;border-radius:10px;border:0;background:#2b6cff;color:#fff">Watch & Get Reward</button>
                <button id="nativeSkipBtn" style="padding:10px 16px;border-radius:10px;border:0;background:#666;color:#fff;margin-left:8px">Skip</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
    safeGet('nativeSkipBtn').onclick = function(){ overlay.remove(); setGamePause(false); };
    safeGet('nativeWatchBtn').onclick = function(){
        try {
            if (window.Android && Android.showRewardedAd) {
                Android.showRewardedAd();
            } else {
                // fallback to internal reward flow
                overlay.remove();
                setGamePause(false);
                if (window.adSuccessRevive) window.adSuccessRevive();
            }
        } catch (e) {
            console.warn('Native rewarded CTA failed', e);
            overlay.remove(); setGamePause(false);
        }
    };
}

function escapeHtml(s){ return String(s||'').replace(/[&<">']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

// Auto-request native ad on likely TV devices when bridge is available
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (isLikelyTv() && window.Android && typeof Android.loadNativeAd === 'function') {
            try { Android.loadNativeAd(); } catch (e) { console.warn('Auto loadNativeAd failed', e); }
        }
    });
} else {
    if (isLikelyTv() && window.Android && typeof Android.loadNativeAd === 'function') {
        try { Android.loadNativeAd(); } catch (e) { console.warn('Auto loadNativeAd failed', e); }
    }
}