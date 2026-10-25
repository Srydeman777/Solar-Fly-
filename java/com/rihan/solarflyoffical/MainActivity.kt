package com.rihan.solarflyoffical

import android.Manifest
import android.annotation.SuppressLint
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.BitmapFactory
import android.graphics.Color
import android.media.AudioAttributes
import android.media.MediaPlayer
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.provider.Settings
import android.util.Log
import android.view.Gravity
import android.view.View
import android.view.ViewGroup
import android.view.WindowManager
import android.webkit.ConsoleMessage
import android.webkit.CookieManager
import android.webkit.JavascriptInterface
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebStorage
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.FrameLayout
import android.widget.Toast
import android.widget.VideoView
import androidx.annotation.RequiresPermission
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.core.content.ContextCompat
import androidx.core.content.edit
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import androidx.work.Worker
import androidx.work.WorkerParameters
import com.android.billingclient.api.AcknowledgePurchaseParams
import com.android.billingclient.api.BillingClient
import com.android.billingclient.api.BillingClientStateListener
import com.android.billingclient.api.BillingFlowParams
import com.android.billingclient.api.BillingResult
import com.android.billingclient.api.PendingPurchasesParams
import com.android.billingclient.api.ProductDetails
import com.android.billingclient.api.ProductDetailsResponseListener
import com.android.billingclient.api.Purchase
import com.android.billingclient.api.QueryProductDetailsParams
import com.android.billingclient.api.QueryProductDetailsResult
import com.android.billingclient.api.QueryPurchasesParams
import com.google.android.gms.ads.AdError
import com.google.android.gms.ads.AdListener
import com.google.android.gms.ads.AdRequest
import com.google.android.gms.ads.AdSize
import com.google.android.gms.ads.AdView
import com.google.android.gms.ads.FullScreenContentCallback
import com.google.android.gms.ads.LoadAdError
import com.google.android.gms.ads.MobileAds
import com.google.android.gms.ads.RequestConfiguration

import com.google.android.gms.ads.AdLoader
import com.google.android.gms.ads.nativead.NativeAd
import com.google.android.gms.ads.nativead.NativeAdOptions
import com.google.android.gms.ads.interstitial.InterstitialAd
import com.google.android.gms.ads.interstitial.InterstitialAdLoadCallback
import com.google.android.gms.ads.rewarded.RewardedAd
import com.google.android.gms.ads.rewarded.RewardedAdLoadCallback
import com.google.android.gms.games.PlayGames
import com.google.android.gms.games.PlayGamesSdk
import com.google.android.gms.tasks.OnCompleteListener
import com.google.android.gms.tasks.Task
import com.google.android.play.core.appupdate.AppUpdateManager
import com.google.android.play.core.appupdate.AppUpdateManagerFactory
import com.google.android.play.core.appupdate.AppUpdateOptions
import com.google.android.play.core.install.model.AppUpdateType
import com.google.android.play.core.install.model.UpdateAvailability
import com.google.android.play.core.review.ReviewInfo
import com.google.android.play.core.review.ReviewManager
import com.google.android.play.core.review.ReviewManagerFactory
import com.google.android.ump.ConsentForm
import com.google.android.ump.ConsentInformation
import com.google.android.ump.ConsentRequestParameters
import com.google.android.ump.UserMessagingPlatform
import org.json.JSONObject
import java.io.File

/**
 * SOLAR FLY OFFICIAL - PROFESSIONAL GAME WRAPPER
 * ----------------------------------------------
 * Features: Adaptive Ads, In-App Updates, JS Bridge,
 * Play Games Integration, and Immersive UI.
 */

/**
 * Custom VideoView that forces full-screen rendering
 */
class FullScreenVideoView(context: Context) : VideoView(context) {
    override fun onMeasure(widthMeasureSpec: Int, heightMeasureSpec: Int) {
        val width = MeasureSpec.getSize(widthMeasureSpec)
        val height = MeasureSpec.getSize(heightMeasureSpec)
        setMeasuredDimension(width, height)
    }
}

class MainActivity : AppCompatActivity() {

    // --- SYSTEM TAGS ---
    private val TAG = "SolarFly_Engine"
    private val UPDATE_REQUEST_CODE = 777
    private val AD_RETRY_DELAY = 15000L // 15 Seconds

    // --- AD UNIT IDs ---
    // Banner: ca-app-pub-2102713511305370/3686826118
    // Interstitial: ca-app-pub-2102713511305370/8923675078
    // Rewarded: ca-app-pub-2102713511305370/7097132671
    // Native (advanced): ca-app-pub-2102713511305370/8723877756
    private val ID_BANNER = "ca-app-pub-2102713511305370/3686826118"
    private val ID_INTERSTITIAL = "ca-app-pub-2102713511305370/8923675078"
    private val ID_REWARDED = "ca-app-pub-2102713511305370/7097132671"
    private val ID_NATIVE = "ca-app-pub-2102713511305370/8723877756"

    // --- UI CORE ---
    private lateinit var rootContainer: FrameLayout
    private var gameWebView: WebView? = null
    private var splashPlayer: FullScreenVideoView? = null

    // --- FILE CHOOSER ---
    private var filePathCallback: ValueCallback<Array<Uri>>? = null

    // --- AD OBJECTS ---
    private var bannerAdView: AdView? = null
    private var interstitialAd: InterstitialAd? = null
    private var rewardedAd: RewardedAd? = null
    private var nativeAd: NativeAd? = null
    private var isInterstitialLoading = false
    private var currentScore = 0
    private var rewardShownRecently = false
    private var isAdMobReady = false

    // --- UMP CONSENT ---
    private lateinit var consentInformation: ConsentInformation
    private var consentForm: ConsentForm? = null

    // --- SYSTEM MANAGERS ---
    private lateinit var appUpdateManager: AppUpdateManager
    private lateinit var reviewManager: ReviewManager
    private var bgmPlayer: MediaPlayer? = null
    private val mainHandler = Handler(Looper.getMainLooper())
    private var isMusicActive = false
    private var isAppInBackground = false
    private var latestUpdateAvailable = false
    private var latestUpdateVersion = -1
    private var latestUpdateVersionName = "1.0"
    private var installedAppVersionName = "1.0"
    private var installedAppVersionCode = 0
    private var isWebViewReady = false
    private var launchShortcutId: String? = null
    private var isPlayGamesSignedIn = false
    private var isPlayGamesSignInInProgress = false
    private var playGamesProfileName: String? = null
    private var playGamesProfileAvatarUrl: String? = null

    // --- GOOGLE PLAY BILLING ---
    private lateinit var billingClient: BillingClient
    private var isBillingReady = false
    private val billingProductCache = linkedMapOf<String, ProductDetails>()

    // --- RATE PROMPT STATE KEYS ---
    private val PREFS_NAME = "solar_fly_prefs"
    private val PREF_MATCH_COUNT = "match_count"
    private val PREF_GAME_RATED = "game_rated"
    private val PREF_DONT_SHOW_RATE = "dont_show_rate"
    private val PREF_ANDROID_STORAGE_CLEANUP_DONE = "android_storage_cleanup_done"

    // --- UPDATE PROMPT STATE KEYS ---
    private val PREF_APP_UPDATE_DISMISSED = "app_update_dismissed"
    private val PREF_LAST_PROMPT_VERSION = "last_prompt_version"

    // ==========================================================
    // 🚀 LIFECYCLE: ON CREATE
    // ==========================================================
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // 1. Fullscreen / Immersive Mode setup
        setupImmersiveEnvironment()

        // 1.1. Android-only storage bootstrap for HTML/WebView access
        prepareAndroidStorageForHtmlAccess()

        // 2. Init SDKs (AdMob consent / Play Games)
        try {
            val testDeviceIds = listOf(AdRequest.DEVICE_ID_EMULATOR)
            val config = RequestConfiguration.Builder().setTestDeviceIds(testDeviceIds).build()
            MobileAds.setRequestConfiguration(config)
        } catch (e: Exception) {
            Log.w(TAG, "Failed to set test device IDs: ${e.message}")
        }

        // Initialize UMP consent early so consent checks start on app startup
        initUserMessagingPlatformConsent()

        PlayGamesSdk.initialize(this)
        initializeBillingClient()

        // 3. Root Layout Creation
        rootContainer = FrameLayout(this)
        rootContainer.setBackgroundColor(Color.BLACK)
        setContentView(rootContainer)

        // 3.1. Review Manager (for in-app rating)
        reviewManager = ReviewManagerFactory.create(this)

        // 4. In-App Updates (Checks for new version on Play Store)
        checkInAppUpdates()

        // 5. Sequence: Splash Video -> Game Setup
        startSplash()
        handleLaunchIntent(intent)

        // 6. Setup notification channel for inactive player reminders
        createNotificationChannel()

        // 7. Schedule inactive notification (2 days)
        scheduleInactiveNotification()
    }

    override fun onNewIntent(intent: Intent?) {
        super.onNewIntent(intent)
        setIntent(intent)
        handleLaunchIntent(intent)
        if (isWebViewReady) {
            sendShortcutLaunchToWeb()
        }
    }

    private fun handleLaunchIntent(intent: Intent?) {
        launchShortcutId = getShortcutIdFromIntent(intent)
    }

    private fun getShortcutIdFromIntent(intent: Intent?): String? {
        if (intent == null) return null
        intent.data?.let { uri ->
            if (uri.scheme == "solarfly" && uri.host == "shortcut") {
                return uri.lastPathSegment?.lowercase()?.takeIf { it.isNotBlank() }
            }
        }
        return intent.getStringExtra("shortcut_id")?.lowercase()?.takeIf { it.isNotBlank() }
    }

    private fun sendShortcutLaunchToWeb() {
        val shortcutId = launchShortcutId ?: return
        launchShortcutId = null
        gameWebView?.post {
            try {
                val safeId = shortcutId.replace("'", "\\'")
                gameWebView?.evaluateJavascript(
                    "window.handleShortcutLaunch && window.handleShortcutLaunch('$safeId')",
                    null
                )
            } catch (_: Exception) {
                // ignore JS send failure
            }
        }
    }

    private fun setupImmersiveEnvironment() {
        WindowCompat.setDecorFitsSystemWindows(window, false)
        val controller = WindowInsetsControllerCompat(window, window.decorView)
        controller.hide(WindowInsetsCompat.Type.systemBars())
        controller.systemBarsBehavior = WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            window.attributes.layoutInDisplayCutoutMode =
                WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES
        }

        // Keep screen on during gameplay
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
    }

    // ==========================================================
    // �️ AD MOB UMP CONSENT
    private fun initUserMessagingPlatformConsent() {
        consentInformation = UserMessagingPlatform.getConsentInformation(this)

        val params = ConsentRequestParameters.Builder()
            .setTagForUnderAgeOfConsent(false)
            .build()

        consentInformation.requestConsentInfoUpdate(
            this,
            params,
            {
                if (consentInformation.isConsentFormAvailable) {
                    loadConsentForm()
                } else {
                    initializeAdMob()
                }
            },
            {
                // FAIL SAFE → still start ads
                initializeAdMob()
            }
        )
    }

    private fun loadConsentForm() {
        UserMessagingPlatform.loadConsentForm(
            this,
            { form ->
                consentForm = form

                val status = consentInformation.consentStatus

                if (status == ConsentInformation.ConsentStatus.REQUIRED) {
                    form.show(this) {
                        initializeAdMob()
                    }
                } else {
                    initializeAdMob()
                }
            },
            {
                initializeAdMob()
            }
        )
    }

    private fun initializeAdMob() {
        try {
            MobileAds.initialize(this) {
                isAdMobReady = true
                Log.d(TAG, "AdMob Ready")
                startAdsIfReady()
            }
        } catch (e: Exception) {
            Log.w(TAG, "AdMob initialization failed: ${e.message}")
        }
    }

    private fun startAdsIfReady() {
        if (!isAdMobReady) return
        try {
            // If this is a TV device, prefer serving native advanced ads
            if (isTvDevice()) {
                Log.d(TAG, "Device identified as TV - loading native advanced ad")
                loadNativeAd()
                return
            }

            // Normal mobile behaviour
            setupAdaptiveBanner()
            loadInterstitial()
            mainHandler.postDelayed({ loadInterstitial() }, 1500L)
            loadRewardedAd()
        } catch (e: Exception) {
            Log.w(TAG, "startAdsIfReady failed: ${e.message}")
        }
    }

    // Detect TV devices (leanback / television features or UI mode)
    private fun isTvDevice(): Boolean {
        return try {
            val pm = packageManager
            if (pm.hasSystemFeature("android.software.leanback") || pm.hasSystemFeature(PackageManager.FEATURE_TELEVISION)) {
                true
            } else {
                val uiMode = getSystemService(Context.UI_MODE_SERVICE) as? android.app.UiModeManager
                uiMode?.currentModeType == android.content.res.Configuration.UI_MODE_TYPE_TELEVISION
            }
        } catch (e: Exception) {
            false
        }
    }

    // Load an advanced native ad and forward its assets to the WebView for rendering
    private fun loadNativeAd() {
        if (!isAdMobReady) {
            Log.d(TAG, "AdMob not ready - skipping native ad load")
            return
        }

        Log.d(TAG, "Loading native advanced ad...")
        val builder = AdLoader.Builder(this, ID_NATIVE)
            .forNativeAd { ad: NativeAd ->
                // Destroy previous native ad to avoid memory leaks
                try {
                    nativeAd?.destroy()
                } catch (_: Exception) {
                }
                nativeAd = ad
                Log.d(TAG, "Native ad loaded")
                sendNativeAdToWeb(ad)
            }
            .withNativeAdOptions(NativeAdOptions.Builder().build())

        val adLoader = builder.withAdListener(object : AdListener() {
            override fun onAdFailedToLoad(error: LoadAdError) {
                Log.e(TAG, "Native ad failed to load: ${error.message}")
                mainHandler.postDelayed({ loadNativeAd() }, AD_RETRY_DELAY)
            }
        }).build()

        adLoader.loadAd(AdRequest.Builder().build())
    }

    private fun sendNativeAdToWeb(ad: NativeAd) {
        try {
            val obj = JSONObject()
            obj.put("headline", ad.headline ?: "")
            obj.put("body", ad.body ?: "")
            obj.put("callToAction", ad.callToAction ?: "")
            obj.put("advertiser", ad.advertiser ?: "")
            ad.icon?.uri?.let { obj.put("iconUri", it.toString()) }
            ad.images?.firstOrNull()?.uri?.let { obj.put("imageUri", it.toString()) }

            // Indicate whether media has video so the web UI can choose appropriate rendering
            val mediaHasVideo = try {
                ad.mediaContent?.hasVideoContent() ?: false
            } catch (_: Exception) {
                false
            }
            obj.put("mediaHasVideo", mediaHasVideo)

            // Suggest render types the game can convert this native ad into
            val renderArray = org.json.JSONArray()
            renderArray.put("banner")
            renderArray.put("interstitial")
            renderArray.put("rewarded")
            obj.put("renderOptions", renderArray)

            val json = obj.toString()
            gameWebView?.post {
                try {
                    // Send a richer payload so the game can render the native ad as
                    // a banner, interstitial, or rewarded style UI using the provided assets.
                    gameWebView?.evaluateJavascript("window.onNativeAdLoaded && window.onNativeAdLoaded($json)", null)
                } catch (_: Exception) {
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Failed to send native ad to web: ${e.message}")
        }
    }

    // ==========================================================
    // �🔄 GOOGLE PLAY UPDATE SYSTEM
    // ==========================================================
    private fun checkInAppUpdates(shouldNotifyWeb: Boolean = false) {
        appUpdateManager = AppUpdateManagerFactory.create(this)
        readInstalledVersionInfo()
        val appUpdateInfoTask = appUpdateManager.appUpdateInfo

        appUpdateInfoTask.addOnSuccessListener { info ->
            val isAvailable = info.updateAvailability() == UpdateAvailability.UPDATE_AVAILABLE
                && info.isUpdateTypeAllowed(AppUpdateType.IMMEDIATE)
            val availableVersion = if (isAvailable) info.availableVersionCode() else -1
            val availableVersionName = if (isAvailable) info.availableVersionCode().toString() else installedAppVersionName
            latestUpdateAvailable = isAvailable
            latestUpdateVersion = availableVersion
            latestUpdateVersionName = availableVersionName

            if (shouldNotifyWeb) {
                sendUpdateAvailabilityToWeb(isAvailable, availableVersion, availableVersionName)
            }
        }.addOnFailureListener {
            if (shouldNotifyWeb) {
                sendUpdateAvailabilityToWeb(false, -1, installedAppVersionName)
            }
        }
    }

    private fun readInstalledVersionInfo() {
        try {
            val packageInfo = packageManager.getPackageInfo(packageName, 0)
            installedAppVersionName = packageInfo.versionName ?: "1.0"
            installedAppVersionCode = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                packageInfo.longVersionCode.toInt()
            } else {
                packageInfo.versionCode
            }
        } catch (e: Exception) {
            Log.w(TAG, "Failed to read installed app version info", e)
            installedAppVersionName = "1.0"
            installedAppVersionCode = 0
        }
    }

    private fun sendUpdateAvailabilityToWeb(isAvailable: Boolean, availableVersion: Int, availableVersionName: String) {
        gameWebView?.post {
            try {
                val escapedVersionName = availableVersionName.replace("'", "\\'")
                val escapedInstalledVersionName = installedAppVersionName.replace("'", "\\'")
                gameWebView?.evaluateJavascript(
                    "window.handleUpdateAvailability($isAvailable, $availableVersion, '$escapedVersionName', '$escapedInstalledVersionName');",
                    null
                )
            } catch (_: Exception) {
                // ignore if JS bridge isn't ready yet
            }
        }
    }

    private fun showUpdateAvailableDialog(info: com.google.android.play.core.appupdate.AppUpdateInfo, availableVersion: Int) {
        val prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

        runOnUiThread {
            val checkbox = android.widget.CheckBox(this).apply {
                text = "Don't show this again for this update"
                setTextColor(Color.WHITE)
                setPadding(20, 20, 20, 20)
            }

            val layout = android.widget.LinearLayout(this).apply {
                orientation = android.widget.LinearLayout.VERTICAL
                setPadding(40, 30, 40, 10)
                addView(android.widget.TextView(this@MainActivity).apply {
                    text = "A new version is available. Update now for the best experience."
                    setTextColor(Color.WHITE)
                    textSize = 16f
                    setPadding(0, 0, 0, 16)
                })
                addView(checkbox)
            }

            androidx.appcompat.app.AlertDialog.Builder(this)
                .setTitle("New update available")
                .setView(layout)
                .setPositiveButton("Update") { dialog, _ ->
                    prefs.edit {
                        putInt(PREF_LAST_PROMPT_VERSION, availableVersion)
                        putBoolean(PREF_APP_UPDATE_DISMISSED, false)
                    }

                    try {
                        appUpdateManager.startUpdateFlowForResult(
                            info,
                            this,
                            AppUpdateOptions.defaultOptions(AppUpdateType.IMMEDIATE),
                            UPDATE_REQUEST_CODE
                        )
                    } catch (_: Exception) {
                        launchPlayStorePage()
                    }

                    dialog.dismiss()
                }
                .setNegativeButton("Keep this version") { dialog, _ ->
                    prefs.edit {
                        putInt(PREF_LAST_PROMPT_VERSION, availableVersion)
                        putBoolean(PREF_APP_UPDATE_DISMISSED, true)
                    }
                    dialog.dismiss()
                }
                .setNeutralButton("Remind me later") { dialog, _ ->
                    if (checkbox.isChecked) {
                        prefs.edit {
                            putInt(PREF_LAST_PROMPT_VERSION, availableVersion)
                            putBoolean(PREF_APP_UPDATE_DISMISSED, true)
                        }
                    }
                    dialog.dismiss()
                }
                .setCancelable(true)
                .show()
        }
    }

    // ==========================================================
    // 🎬 SPLASH VIDEO & GAME START
    // ==========================================================
    private fun startSplash() {
        // Use FullScreenVideoView to ensure video fills the screen
        splashPlayer = FullScreenVideoView(this)

        val videoUri = Uri.parse("android.resource://${packageName}/raw/sryde")

        splashPlayer?.apply {
            setVideoURI(videoUri)

            // Force full-screen layout
            layoutParams = FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT
            )

            setOnCompletionListener {
                onSplashDone() // Move to game after video ends
            }

            setOnErrorListener { _, _, _ ->
                onSplashDone() // Skip video if it fails to play
                true
            }
        }

        // Add splash to root container at top
        rootContainer.addView(splashPlayer)
        splashPlayer?.start()

        // Start silent Play Games sign-in as soon as the splash begins playing
        attemptSilentPlayGamesSignIn()
    }

    private fun onSplashDone() {
        splashPlayer?.stopPlayback()
        rootContainer.removeView(splashPlayer)
        splashPlayer = null

        // Initialize Game Components
        setupGameWebView()
        // Request ads safely once AdMob is ready
        startAdsIfReady()
        // Play Games sign-in is already triggered while the splash plays
    }

    // ==========================================================
    // 🌐 WEBVIEW ENGINE
    // ==========================================================
    @SuppressLint("SetJavaScriptEnabled", "JavascriptInterface")
    private fun setupGameWebView() {
        gameWebView = WebView(this).apply {
            layoutParams = FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT
            )

            settings.apply {
                javaScriptEnabled = true
                domStorageEnabled = true
                allowFileAccess = true
                allowContentAccess = true
                allowFileAccessFromFileURLs = true
                allowUniversalAccessFromFileURLs = true
                databaseEnabled = true
                cacheMode = WebSettings.LOAD_DEFAULT
                mediaPlaybackRequiresUserGesture = false
                mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
            }

            webChromeClient = object : WebChromeClient() {
                override fun onConsoleMessage(cm: ConsoleMessage?): Boolean {
                    cm?.let {
                        Log.d(TAG, "JS: ${it.message()} -- ${it.sourceId()}:${it.lineNumber()}")
                    }
                    return true
                }

                override fun onShowFileChooser(
                    webView: WebView?,
                    filePathCallback: ValueCallback<Array<Uri>>?,
                    fileChooserParams: FileChooserParams?
                ): Boolean {
                    this@MainActivity.filePathCallback = filePathCallback

                    // Create intent to pick images only
                    val intent = Intent(Intent.ACTION_GET_CONTENT).apply {
                        addCategory(Intent.CATEGORY_OPENABLE)
                        type = "image/*" // only images
                    }

                    try {
                        @Suppress("DEPRECATION")
                        startActivityForResult(Intent.createChooser(intent, "Select Image"), 1002)
                    } catch (_: Exception) {
                        this@MainActivity.filePathCallback = null
                        return false
                    }
                    return true
                }
            }
            webViewClient = object : WebViewClient() {
                override fun onPageFinished(view: WebView?, url: String?) {
                    Log.d(TAG, "Solar Fly Engine Initialized")
                    isWebViewReady = true
                    if (latestUpdateAvailable) {
                        sendUpdateAvailabilityToWeb(latestUpdateAvailable, latestUpdateVersion, latestUpdateVersionName)
                    }
                    sendShortcutLaunchToWeb()
                }

                override fun shouldOverrideUrlLoading(view: WebView?, url: String?): Boolean {
                    if (url.isNullOrBlank()) return false
                    if (!url.startsWith("http://") && !url.startsWith("https://") && !url.startsWith("mailto:")) {
                        return false
                    }

                    return try {
                        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url)).apply {
                            addCategory(Intent.CATEGORY_BROWSABLE)
                            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                        }
                        startActivity(intent)
                        true
                    } catch (e: Exception) {
                        Log.e(TAG, "Failed to open external URL from WebView: ${url}", e)
                        false
                    }
                }
            }

            addJavascriptInterface(SolarFlyBridge(), "Android")
            loadUrl("file:///android_asset/Solar_Fly.html")
        }

        rootContainer.addView(gameWebView, 0)
    }

    // ==========================================================
    // 🎯 ADMOB: ADAPTIVE BANNER
    // ==========================================================
    private fun setupAdaptiveBanner() {
        if (!isAdMobReady) {
            Log.d(TAG, "AdMob not ready - skipping banner setup")
            return
        }
        bannerAdView = AdView(this).apply {
            adUnitId = ID_BANNER
            setAdSize(calculateAdSize())
        }

        // Listen for banner load/fail events to notify JS and retry on failure
        bannerAdView?.adListener = object : AdListener() {
            override fun onAdLoaded() {
                Log.d(TAG, "Banner ad loaded successfully")
                gameWebView?.evaluateJavascript("window.onBannerLoaded && window.onBannerLoaded()", null)
            }

            override fun onAdFailedToLoad(error: LoadAdError) {
                Log.e(TAG, "Banner ad failed to load: ${error.message}")
                gameWebView?.evaluateJavascript("window.onBannerFailed && window.onBannerFailed()", null)
            }
        }

        val params = FrameLayout.LayoutParams(
            FrameLayout.LayoutParams.MATCH_PARENT,
            FrameLayout.LayoutParams.WRAP_CONTENT
        ).apply {
            gravity = Gravity.BOTTOM
        }

        // Keep banner hidden by default; JS will call showBanner() when appropriate
        bannerAdView?.visibility = View.GONE

        rootContainer.addView(bannerAdView, params)
        bannerAdView?.loadAd(AdRequest.Builder().build())
    }

    private fun calculateAdSize(): AdSize {
        val outMetrics = resources.displayMetrics
        val adWidthPixels = outMetrics.widthPixels.toFloat()
        val density = outMetrics.density
        val adWidth = (adWidthPixels / density).toInt()
        return AdSize.getCurrentOrientationAnchoredAdaptiveBannerAdSize(this, adWidth)
    }

    // ==========================================================
    // 🎯 ADMOB: FULLSCREEN ADS
    // ==========================================================
    private fun loadInterstitial() {
        if (!isAdMobReady) {
            Log.d(TAG, "AdMob not ready - skipping interstitial load")
            return
        }
        if (isInterstitialLoading || interstitialAd != null) return
        isInterstitialLoading = true
        Log.d(TAG, "Loading interstitial ad...")

        val request = AdRequest.Builder().build()
        InterstitialAd.load(this, ID_INTERSTITIAL, request, object : InterstitialAdLoadCallback() {
            override fun onAdLoaded(ad: InterstitialAd) {
                interstitialAd = ad
                isInterstitialLoading = false
                Log.d(TAG, "Interstitial ad loaded successfully")
                gameWebView?.evaluateJavascript("window.onInterstitialAdLoaded && window.onInterstitialAdLoaded()", null)
                interstitialAd?.fullScreenContentCallback = object : FullScreenContentCallback() {
                    override fun onAdDismissedFullScreenContent() {
                        Log.d(TAG, "Interstitial ad dismissed")
                        interstitialAd = null
                        loadInterstitial()
                        gameWebView?.evaluateJavascript("window.onAdDismissed && window.onAdDismissed()", null)
                    }
                    override fun onAdFailedToShowFullScreenContent(e: AdError) {
                        Log.e(TAG, "Interstitial ad failed to show: ${e.message}")
                        interstitialAd = null
                        loadInterstitial()
                        gameWebView?.evaluateJavascript("window.onInterstitialAdFailed && window.onInterstitialAdFailed()", null)
                    }
                }
            }
            override fun onAdFailedToLoad(e: LoadAdError) {
                Log.e(TAG, "Interstitial ad failed to load: ${e.message}")
                interstitialAd = null
                isInterstitialLoading = false
                // Notify JS that interstitial failed to load so fallback UI can proceed
                gameWebView?.evaluateJavascript("window.onInterstitialAdFailed && window.onInterstitialAdFailed()", null)
                mainHandler.postDelayed({ loadInterstitial() }, AD_RETRY_DELAY)
            }
        })
    }

    private fun loadRewardedAd() {
        if (!isAdMobReady) {
            Log.d(TAG, "AdMob not ready - skipping rewarded load")
            return
        }
        Log.d(TAG, "Loading rewarded ad...")
        val request = AdRequest.Builder().build()
        RewardedAd.load(this, ID_REWARDED, request, object : RewardedAdLoadCallback() {
            override fun onAdLoaded(ad: RewardedAd) {
                rewardedAd = ad
                Log.d(TAG, "Rewarded ad loaded successfully")
                // Notify the WebView that rewarded ad is available
                gameWebView?.evaluateJavascript("window.onRewardedAdLoaded && window.onRewardedAdLoaded()", null)
                rewardedAd?.fullScreenContentCallback = object : FullScreenContentCallback() {
                    override fun onAdDismissedFullScreenContent() {
                        Log.d(TAG, "Rewarded ad dismissed")
                        rewardedAd = null
                        loadRewardedAd() // preload next one
                    }
                    override fun onAdFailedToShowFullScreenContent(e: AdError) {
                        Log.e(TAG, "Rewarded ad failed to show: ${e.message}")
                        rewardedAd = null
                        // Tell JS the ad failed so it can end the game
                        gameWebView?.evaluateJavascript("window.adFailedRevive && window.adFailedRevive()", null)
                        loadRewardedAd()
                    }
                }
            }
            override fun onAdFailedToLoad(e: LoadAdError) {
                Log.e(TAG, "Rewarded ad failed to load: ${e.message}")
                rewardedAd = null
                // Notify JS that rewarded ad failed to load so it can show fallback UI
                gameWebView?.evaluateJavascript("window.onRewardedAdFailed && window.onRewardedAdFailed()", null)
                mainHandler.postDelayed({ loadRewardedAd() }, AD_RETRY_DELAY)
            }
        })
    }

    private fun showRewarded() {
        if (rewardedAd != null) {
            Log.d(TAG, "Showing rewarded ad")
            rewardedAd?.show(this@MainActivity) { _ ->
                rewardShownRecently = true
                Log.d(TAG, "Reward earned by user")
                // SUCCESS! Tell the HTML game to revive the player
                gameWebView?.evaluateJavascript("adSuccessRevive()", null)
            }
        } else {
            // Ad not ready yet
            Log.w(TAG, "Rewarded ad not ready yet")
            Toast.makeText(this, "Ad is loading, please try again...", Toast.LENGTH_SHORT).show()
            gameWebView?.evaluateJavascript("adFailedRevive()", null)
            loadRewardedAd()
        }
    }

    // ==========================================================
    // 🎮 PLAY GAMES SIGN-IN
    // ==========================================================
    private fun attemptSilentPlayGamesSignIn() {
        if (isPlayGamesSignInInProgress) {
            Log.d(TAG, "Play Games sign-in already in progress")
            return
        }
        isPlayGamesSignInInProgress = true

        val client = PlayGames.getGamesSignInClient(this)

        // Silent sign-in attempt. No UI should be shown unless the user explicitly requests login.
        Log.d(TAG, "Attempting silent Play Games sign-in")
        client.isAuthenticated().addOnCompleteListener(this) { signInTask ->
            isPlayGamesSignInInProgress = false
            if (signInTask.isSuccessful && signInTask.result.isAuthenticated) {
                Log.d(TAG, "Silent Play Games sign-in succeeded")
                requestPlayGamesProfileInfo()
            } else {
                Log.d(TAG, "Silent Play Games sign-in not available; staying signed out")
                isPlayGamesSignedIn = false
                playGamesProfileName = null
                playGamesProfileAvatarUrl = null
                sendPlayGamesProfileToWeb()
            }
        }
    }

    private fun performInteractivePlayGamesSignIn() {
        if (isPlayGamesSignInInProgress) {
            Log.d(TAG, "Play Games sign-in already in progress")
            return
        }
        if (isPlayGamesSignedIn) {
            Log.d(TAG, "Play Games already signed in")
            return
        }

        isPlayGamesSignInInProgress = true
        val client = PlayGames.getGamesSignInClient(this)

        Log.d(TAG, "Starting interactive Play Games sign-in")
        client.signIn().addOnCompleteListener(this, OnCompleteListener { signInTask: Task<*> ->
            isPlayGamesSignInInProgress = false
            if (signInTask.isSuccessful) {
                Log.d(TAG, "Interactive Play Games sign-in succeeded")
                requestPlayGamesProfileInfo()
            } else {
                Log.w(TAG, "Interactive Play Games sign-in failed or cancelled")
                isPlayGamesSignedIn = false
                playGamesProfileName = null
                playGamesProfileAvatarUrl = null
                sendPlayGamesProfileToWeb()
            }
        })
    }

    private fun requestPlayGamesProfileInfo() {
        PlayGames.getPlayersClient(this).currentPlayer.addOnCompleteListener { task ->
            if (task.isSuccessful && task.result != null) {
                val player = task.result!!
                playGamesProfileName = player.displayName
                playGamesProfileAvatarUrl = player.iconImageUri?.toString()
                isPlayGamesSignedIn = true
                Log.d(TAG, "Play Games profile loaded: ${playGamesProfileName}")
            } else {
                playGamesProfileName = null
                playGamesProfileAvatarUrl = null
                isPlayGamesSignedIn = false
                Log.w(TAG, "Failed to load Play Games profile")
            }
            sendPlayGamesProfileToWeb()
        }
    }

    private fun getPlayGamesProfileJson(): String {
        return try {
            JSONObject().apply {
                put("active", isPlayGamesSignedIn)
                put("name", playGamesProfileName ?: "")
                put("avatar", playGamesProfileAvatarUrl ?: "")
            }.toString()
        } catch (e: Exception) {
            "{\"active\":false,\"name\":\"\",\"avatar\":\"\"}"
        }
    }

    private fun sendPlayGamesProfileToWeb() {
        val isFullyConnected = isPlayGamesSignedIn && !playGamesProfileName.isNullOrBlank()
        val profileJson = try {
            JSONObject().apply {
                put("active", isFullyConnected)
                put("name", playGamesProfileName ?: "")
                put("avatar", playGamesProfileAvatarUrl ?: "")
            }.toString()
        } catch (e: Exception) {
            "{\"active\":false,\"name\":\"\",\"avatar\":\"\"}"
        }
        val signInStatus = if (isFullyConnected) "true" else "false"
        Log.d(TAG, "Sending Play Games profile to web: $profileJson ; connected=$signInStatus")
        gameWebView?.post {
            try {
                gameWebView?.evaluateJavascript("window.onPlayGamesSignIn && window.onPlayGamesSignIn($signInStatus);", null)
                gameWebView?.evaluateJavascript("window.onPlayGamesProfile && window.onPlayGamesProfile($profileJson);", null)
            } catch (e: Exception) {
                Log.e(TAG, "Failed to send Play Games profile to web", e)
            }
        }
    }

    private fun ensurePlayGamesAchievementAccess(): Boolean {
        return if (isPlayGamesSignedIn && !playGamesProfileName.isNullOrBlank()) {
            true
        } else {
            performInteractivePlayGamesSignIn()
            false
        }
    }

    private fun unlockPlayGamesAchievementInternal(achievementId: String): Boolean {
        if (achievementId.isBlank()) {
            Log.w(TAG, "Attempted to unlock an empty Play Games achievement ID")
            return false
        }

        if (!ensurePlayGamesAchievementAccess()) {
            Log.d(TAG, "Play Games sign-in requested before unlocking achievement: $achievementId")
            return false
        }

        return try {
            val achievementsClient = PlayGames.getAchievementsClient(this)
            achievementsClient.unlock(achievementId)
            Log.d(TAG, "Play Games achievement unlock requested: $achievementId")
            true
        } catch (e: Exception) {
            Log.w(TAG, "Play Games achievement unlock bridge failed for: $achievementId", e)
            false
        }
    }

    private fun incrementPlayGamesAchievementInternal(achievementId: String, steps: Int): Boolean {
        if (achievementId.isBlank() || steps <= 0) {
            Log.w(TAG, "Attempted to increment an invalid Play Games achievement: $achievementId with steps=$steps")
            return false
        }

        if (!ensurePlayGamesAchievementAccess()) {
            Log.d(TAG, "Play Games sign-in requested before incrementing achievement: $achievementId")
            return false
        }

        return try {
            val achievementsClient = PlayGames.getAchievementsClient(this)
            achievementsClient.increment(achievementId, steps)
            Log.d(TAG, "Play Games achievement increment requested: $achievementId by $steps")
            true
        } catch (e: Exception) {
            Log.w(TAG, "Play Games achievement increment bridge failed for: $achievementId", e)
            false
        }
    }

    private fun syncGooglePlayGameStateInternal(stateJson: String): Boolean {
        if (stateJson.isBlank()) {
            Log.w(TAG, "Game state sync called with empty payload")
            return false
        }

        if (!isPlayGamesSignedIn || playGamesProfileName.isNullOrBlank()) {
            Log.d(TAG, "Skipping Play Games game-state sync because user is not signed in")
            return false
        }

        return try {
            Log.d(TAG, "Play Games game-state sync ready: ${stateJson.take(200)}")
            gameWebView?.post {
                gameWebView?.evaluateJavascript(
                    "window.onGooglePlayGameState && window.onGooglePlayGameState(${JSONObject.quote(stateJson)});",
                    null
                )
            }
            true
        } catch (e: Exception) {
            Log.w(TAG, "Play Games game-state sync bridge failed", e)
            false
        }
    }

    private fun requestGooglePlayGameState(): String {
        if (!isPlayGamesSignedIn || playGamesProfileName.isNullOrBlank()) {
            return ""
        }

        return try {
            Log.d(TAG, "Play Games game-state requested")
            ""
        } catch (e: Exception) {
            Log.w(TAG, "Play Games game-state request bridge failed", e)
            ""
        }
    }

    private fun isConnectedToNetwork(): Boolean {
        val connectivityManager = getSystemService(Context.CONNECTIVITY_SERVICE) as? ConnectivityManager
            ?: return false

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            val network = connectivityManager.activeNetwork ?: return false
            val capabilities = connectivityManager.getNetworkCapabilities(network) ?: return false
            return capabilities.hasTransport(NetworkCapabilities.TRANSPORT_WIFI)
                || capabilities.hasTransport(NetworkCapabilities.TRANSPORT_CELLULAR)
                || capabilities.hasTransport(NetworkCapabilities.TRANSPORT_ETHERNET)
                || capabilities.hasTransport(NetworkCapabilities.TRANSPORT_BLUETOOTH)
        }

        @Suppress("DEPRECATION")
        val networkInfo = connectivityManager.activeNetworkInfo
        return networkInfo?.isConnected == true
    }

    private fun openConnectionSettings() {
        try {
            startActivity(Intent(Settings.ACTION_WIFI_SETTINGS))
        } catch (e: Exception) {
            Toast.makeText(this, "Cannot open connection settings", Toast.LENGTH_SHORT).show()
        }
    }

    // ==========================================================
    // ⭐ RATE PROMPT (Every 10 play sessions)
    // ==========================================================
    private fun handleMatchFinished() {
        val prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val alreadyRated = prefs.getBoolean(PREF_GAME_RATED, false)
        val dontShow = prefs.getBoolean(PREF_DONT_SHOW_RATE, false)

        if (alreadyRated || dontShow) return

        val matches = prefs.getInt(PREF_MATCH_COUNT, 0) + 1
        prefs.edit { putInt(PREF_MATCH_COUNT, matches) }

        // The HTML/JS game already controls the rate prompt UI.
        // Keep native match counting, but do not display a second rating dialog.
        // if (matches % 10 == 0) {
        //     showRateDialog()
        // }
    }

    private fun showRateDialog() {
        val prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

        runOnUiThread {
            val checkbox = android.widget.CheckBox(this).apply {
                text = "Don't show me again"
                setTextColor(Color.WHITE)
                setPadding(20, 20, 20, 20)
            }

            val layout = android.widget.LinearLayout(this).apply {
                orientation = android.widget.LinearLayout.VERTICAL
                setPadding(40, 30, 40, 10)
                addView(android.widget.TextView(this@MainActivity).apply {
                    text = "Enjoying Solar Fly? Please rate us on Play Store!"
                    setTextColor(Color.WHITE)
                    textSize = 16f
                    setPadding(0, 0, 0, 16)
                })
                addView(checkbox)
            }

            androidx.appcompat.app.AlertDialog.Builder(this)
                .setTitle("Rate our game")
                .setView(layout)
                .setPositiveButton("Yes") { dialog, _ ->
                    prefs.edit {
                        putBoolean(PREF_GAME_RATED, true)
                        putBoolean(PREF_DONT_SHOW_RATE, true)
                    }
                    launchInAppReviewFlow()
                    dialog.dismiss()
                }
                .setNegativeButton("No") { dialog, _ ->
                    if (checkbox.isChecked) {
                        prefs.edit { putBoolean(PREF_DONT_SHOW_RATE, true) }
                    }
                    dialog.dismiss()
                }
                .setCancelable(true)
                .show()
        }
    }

    private fun launchInAppReviewFlow() {
        val request = reviewManager.requestReviewFlow()
        request.addOnCompleteListener { task ->
            if (task.isSuccessful) {
                val reviewInfo: ReviewInfo = task.result
                val flow = reviewManager.launchReviewFlow(this, reviewInfo)
                flow.addOnCompleteListener {
                    // Review flow complete; no further action required.
                }
            } else {
                launchPlayStorePage()
            }
        }
    }

    private fun launchPlayStorePage() {
        val appPackageName = packageName
        try {
            startActivity(Intent(Intent.ACTION_VIEW, Uri.parse("market://details?id=$appPackageName")))
        } catch (_: Exception) {
            startActivity(Intent(Intent.ACTION_VIEW, Uri.parse("https://play.google.com/store/apps/details?id=$appPackageName")))
        }
    }

    private fun requestPlayGamesSignIn() {
        if (!isPlayGamesSignedIn) {
            performInteractivePlayGamesSignIn()
            Toast.makeText(this, "Connecting Play Games...", Toast.LENGTH_SHORT).show()
        }
    }

    private fun initializeBillingClient() {
        billingClient = BillingClient.newBuilder(this)
            .setListener { billingResult, purchases ->
                if (billingResult.responseCode == BillingClient.BillingResponseCode.OK && !purchases.isNullOrEmpty()) {
                    handlePurchase(purchases)
                } else {
                    Log.w(TAG, "Billing purchase failed: ${billingResult.debugMessage}")
                    Toast.makeText(this, "Purchase cancelled or failed", Toast.LENGTH_SHORT).show()
                }
            }
            .enablePendingPurchases(
                PendingPurchasesParams.newBuilder()
                    .enableOneTimeProducts()
                    .build()
            )
            .enableAutoServiceReconnection()
            .build()

        billingClient.startConnection(object : BillingClientStateListener {
            override fun onBillingSetupFinished(billingResult: BillingResult) {
                if (billingResult.responseCode == BillingClient.BillingResponseCode.OK) {
                    isBillingReady = true
                    queryExistingPurchases()
                } else {
                    Log.w(TAG, "Billing setup failed: ${billingResult.debugMessage}")
                }
            }

            override fun onBillingServiceDisconnected() {
                isBillingReady = false
                Log.w(TAG, "Billing service disconnected")
            }
        })
    }

    private fun queryExistingPurchases() {
        if (!isBillingReady) return

        val subsParams = QueryPurchasesParams.newBuilder()
            .setProductType(BillingClient.ProductType.SUBS)
            .build()
        billingClient.queryPurchasesAsync(subsParams) { _, purchases ->
            purchases.forEach { purchase ->
                if (purchase.purchaseState == Purchase.PurchaseState.PURCHASED) {
                    Log.d(TAG, "Existing subscription purchase found: ${purchase.products}")
                }
            }
        }

        val inAppParams = QueryPurchasesParams.newBuilder()
            .setProductType(BillingClient.ProductType.INAPP)
            .build()
        billingClient.queryPurchasesAsync(inAppParams) { _, purchases ->
            purchases.forEach { purchase ->
                if (purchase.purchaseState == Purchase.PurchaseState.PURCHASED) {
                    Log.d(TAG, "Existing one-time purchase found: ${purchase.products}")
                }
            }
        }
    }

    private fun launchBillingPurchase(productId: String, productType: String) {
        val safeId = productId.trim()
        if (safeId.isBlank()) {
            Toast.makeText(this, "Purchase product id is empty", Toast.LENGTH_SHORT).show()
            return
        }

        if (!isBillingReady) {
            Toast.makeText(this, "Billing is not ready yet", Toast.LENGTH_SHORT).show()
            return
        }

        val cachedDetails = billingProductCache[safeId]
        if (cachedDetails != null) {
            launchBillingFlow(safeId, productType, cachedDetails)
            return
        }

        val product = QueryProductDetailsParams.Product.newBuilder()
            .setProductId(safeId)
            .setProductType(productType)
            .build()

        val params = QueryProductDetailsParams.newBuilder()
            .setProductList(listOf(product))
            .build()

        billingClient.queryProductDetailsAsync(params, ProductDetailsResponseListener { billingResult: BillingResult, queryProductDetailsResult: QueryProductDetailsResult ->
            if (billingResult.responseCode == BillingClient.BillingResponseCode.OK) {
                var foundProductDetails: ProductDetails? = null
                val productDetailsList = queryProductDetailsResult.productDetailsList
                if (productDetailsList != null) {
                    for (pd in productDetailsList) {
                        try {
                            if (pd.productId == safeId) {
                                foundProductDetails = pd
                                break
                            }
                        } catch (_: Exception) {
                            // ignore malformed entry and continue
                        }
                    }
                }

                if (foundProductDetails != null) {
                    billingProductCache[safeId] = foundProductDetails
                    launchBillingFlow(safeId, productType, foundProductDetails)
                } else {
                    Toast.makeText(this@MainActivity, "Product was not found in Play Console", Toast.LENGTH_SHORT).show()
                }
            } else {
                Toast.makeText(this@MainActivity, "Unable to load product details", Toast.LENGTH_SHORT).show()
            }
        })
    }

    private fun launchBillingFlow(productId: String, productType: String, productDetails: ProductDetails) {
        val paramsBuilder = BillingFlowParams.ProductDetailsParams.newBuilder()
            .setProductDetails(productDetails)

        if (productType == BillingClient.ProductType.SUBS) {
            productDetails.subscriptionOfferDetails?.firstOrNull()?.offerToken?.let { token ->
                paramsBuilder.setOfferToken(token)
            }
        }

        val billingFlowParams = BillingFlowParams.newBuilder()
            .setProductDetailsParamsList(listOf(paramsBuilder.build()))
            .build()

        val billingResult = billingClient.launchBillingFlow(this, billingFlowParams)
        if (billingResult.responseCode != BillingClient.BillingResponseCode.OK) {
            Log.w(TAG, "Billing flow launch failed: ${billingResult.debugMessage}")
            Toast.makeText(this, "Unable to start purchase flow", Toast.LENGTH_SHORT).show()
        }
    }

    private fun handlePurchase(purchases: List<Purchase>) {
        purchases.filter { it.purchaseState == Purchase.PurchaseState.PURCHASED }.forEach { purchase ->
            if (!purchase.isAcknowledged) {
                val acknowledgeParams = AcknowledgePurchaseParams.newBuilder()
                    .setPurchaseToken(purchase.purchaseToken)
                    .build()

                billingClient.acknowledgePurchase(acknowledgeParams) { ackResult ->
                    if (ackResult.responseCode != BillingClient.BillingResponseCode.OK) {
                        Log.w(TAG, "Purchase acknowledge failed: ${ackResult.debugMessage}")
                    }
                }
            }
        }
    }

    // ==========================================================
    // 🔗 JS BRIDGE: NATIVE TO WEB COMMUNICATION
    // ==========================================================
    inner class SolarFlyBridge {

        @JavascriptInterface
        fun showInterstitialAd() {
            mainHandler.post {
                if (!isAdMobReady) {
                    return@post
                }

                if (interstitialAd != null) {
                    Log.d(TAG, "Showing interstitial ad")
                    interstitialAd?.show(this@MainActivity)
                } else {
                    Log.w(TAG, "Interstitial ad not loaded yet, loading now...")
                    loadInterstitial()
                    Toast.makeText(this@MainActivity, "Interstitial is loading, please try again shortly...", Toast.LENGTH_SHORT).show()
                }
            }
        }

        @JavascriptInterface
        fun isInterstitialReady(): Boolean = interstitialAd != null

        @JavascriptInterface
        fun loadInterstitialAd() {
            Log.d(TAG, "loadInterstitialAd called from JavaScript")
            mainHandler.post {
                if (!isAdMobReady) {
                    gameWebView?.evaluateJavascript("window.onInterstitialAdFailed && window.onInterstitialAdFailed()", null)
                    return@post
                }
                loadInterstitial()
            }
        }

        @JavascriptInterface
        fun showRewardedAd() {
            mainHandler.post {
                if (!isAdMobReady) {
                    return@post
                }
                showRewarded()
            }
        }

        @JavascriptInterface
        fun loadRewardedAd() {
            Log.d(TAG, "loadRewardedAd called from JavaScript")
            mainHandler.post {
                if (!isAdMobReady) {
                    gameWebView?.evaluateJavascript("window.onRewardedAdFailed && window.onRewardedAdFailed()", null)
                    return@post
                }
                loadRewardedAd()
            }
        }

        @JavascriptInterface
        fun isRewardedReady(): Boolean = rewardedAd != null

        @JavascriptInterface
        fun setScore(score: Int) {
            currentScore = score
        }

        @JavascriptInterface
        fun resetRewardFlag() {
            rewardShownRecently = false
        }

        @JavascriptInterface
        fun onMatchFinished() {
            mainHandler.post { handleMatchFinished() }
        }

        @JavascriptInterface
        fun requestRatingPrompt(): Boolean {
            return try {
                mainHandler.post { launchInAppReviewFlow() }
                true
            } catch (e: Exception) {
                Log.e(TAG, "Request rating prompt failed", e)
                false
            }
        }

        @JavascriptInterface
        fun markGameRated() {
            val prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            prefs.edit {
                putBoolean(PREF_GAME_RATED, true)
                putBoolean(PREF_DONT_SHOW_RATE, true)
            }
        }

        @JavascriptInterface
        fun hasUserRated(): Boolean {
            val prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            return prefs.getBoolean(PREF_GAME_RATED, false)
        }

        @JavascriptInterface
        fun isAndroidSupported(): Boolean {
            return true
        }

        @JavascriptInterface
        fun isAndroidConnected(): Boolean {
            return isConnectedToNetwork()
        }

        @JavascriptInterface
        fun requestAndroidConnection(): Boolean {
            mainHandler.post { openConnectionSettings() }
            return true
        }

        @JavascriptInterface
        fun isPlayGamesActive(): Boolean {
            return isPlayGamesSignedIn
        }

        @JavascriptInterface
        fun isPlayGamesConnected(): Boolean {
            return isPlayGamesSignedIn && !playGamesProfileName.isNullOrBlank()
        }

        @JavascriptInterface
        fun requestPlayGamesSignIn(): Boolean {
            mainHandler.post { performInteractivePlayGamesSignIn() }
            return true
        }

        @JavascriptInterface
        fun signInGooglePlayGames(): Boolean {
            mainHandler.post { performInteractivePlayGamesSignIn() }
            return true
        }

        @JavascriptInterface
        fun getPlayGamesProfile(): String {
            return try {
                JSONObject().apply {
                    put("active", isPlayGamesConnected())
                    put("name", playGamesProfileName ?: "")
                    put("avatar", playGamesProfileAvatarUrl ?: "")
                }.toString()
            } catch (e: Exception) {
                "{\"active\":false,\"name\":\"\",\"avatar\":\"\"}"
            }
        }

        @JavascriptInterface
        fun refreshPlayGamesProfile(): Boolean {
            mainHandler.post { requestPlayGamesProfileInfo() }
            return true
        }

        @JavascriptInterface
        fun canAccessPlayGamesAchievements(): Boolean {
            return isPlayGamesSignedIn && !playGamesProfileName.isNullOrBlank()
        }

        @JavascriptInterface
        fun requestPlayGamesAchievementAccess(): Boolean {
            mainHandler.post {
                if (!canAccessPlayGamesAchievements()) {
                    performInteractivePlayGamesSignIn()
                }
            }
            return true
        }

        @JavascriptInterface
        fun grantPlayGamesAchievementAccess(): Boolean {
            return requestPlayGamesAchievementAccess()
        }

        @JavascriptInterface
        fun unlockAchievement(achievementId: String): Boolean {
            mainHandler.post {
                unlockPlayGamesAchievementInternal(achievementId)
            }
            return true
        }

        @JavascriptInterface
        fun unlockPlayGamesAchievement(achievementId: String): Boolean {
            return unlockAchievement(achievementId)
        }

        @JavascriptInterface
        fun incrementAchievement(achievementId: String, steps: Int): Boolean {
            mainHandler.post {
                incrementPlayGamesAchievementInternal(achievementId, steps)
            }
            return true
        }

        @JavascriptInterface
        fun incrementPlayGamesAchievement(achievementId: String, steps: Int): Boolean {
            return incrementAchievement(achievementId, steps)
        }

        @JavascriptInterface
        fun syncGooglePlayGameState(stateJson: String): Boolean {
            return try {
                mainHandler.post {
                    syncGooglePlayGameStateInternal(stateJson)
                }
                true
            } catch (e: Exception) {
                Log.w(TAG, "Play Games game-state sync invoke failed", e)
                false
            }
        }

        @JavascriptInterface
        fun getGooglePlayGameState(): String {
            return try {
                requestGooglePlayGameState()
            } catch (e: Exception) {
                Log.w(TAG, "Play Games game-state request invoke failed", e)
                ""
            }
        }

        @JavascriptInterface
        fun getAppVersionName(): String {
            return try {
                val packageInfo = packageManager.getPackageInfo(packageName, 0)
                packageInfo.versionName ?: "1.0"
            } catch (e: Exception) {
                Log.w(TAG, "Failed to read app version name", e)
                "1.0"
            }
        }

        @JavascriptInterface
        fun getAppVersionCode(): Int {
            return try {
                val packageInfo = packageManager.getPackageInfo(packageName, 0)
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                    packageInfo.longVersionCode.toInt()
                } else {
                    packageInfo.versionCode
                }
            } catch (e: Exception) {
                Log.w(TAG, "Failed to read app version code", e)
                0
            }
        }

        @JavascriptInterface
        fun getAppVersionInfo(): String {
            return try {
                JSONObject().apply {
                    put("name", getAppVersionName())
                    put("code", getAppVersionCode())
                }.toString()
            } catch (e: Exception) {
                "{\"name\":\"1.0\",\"code\":0}"
            }
        }

        @JavascriptInterface
        fun queryUpdateAvailability() {
            mainHandler.post { checkInAppUpdates(true) }
        }

        @JavascriptInterface
        fun isBillingAvailable(): Boolean = isBillingReady

        @JavascriptInterface
        fun purchaseSubscription(productId: String): Boolean {
            mainHandler.post { launchBillingPurchase(productId, BillingClient.ProductType.SUBS) }
            return true
        }

        @JavascriptInterface
        fun purchaseOneTimeProduct(productId: String): Boolean {
            mainHandler.post { launchBillingPurchase(productId, BillingClient.ProductType.INAPP) }
            return true
        }

        @JavascriptInterface
        fun restorePurchases(): Boolean {
            mainHandler.post { queryExistingPurchases() }
            return true
        }

        @JavascriptInterface
        fun requestAppUpdate() {
            mainHandler.post {
                if (latestUpdateAvailable && latestUpdateVersion > 0) {
                    val appUpdateInfoTask = appUpdateManager.appUpdateInfo
                    appUpdateInfoTask.addOnSuccessListener { info ->
                        try {
                            appUpdateManager.startUpdateFlowForResult(
                                info,
                                this@MainActivity,
                                AppUpdateOptions.defaultOptions(AppUpdateType.IMMEDIATE),
                                UPDATE_REQUEST_CODE
                            )
                        } catch (_: Exception) {
                            launchPlayStorePage()
                        }
                    }
                }
            }
        }

        @JavascriptInterface
        fun playMusic(file: String) {
            mainHandler.post { startAudio(file) }
        }

        @JavascriptInterface
        fun stopMusic() {
            mainHandler.post { stopAudio() }
        }

        @JavascriptInterface
        fun showBanner() {
            mainHandler.post {
                if (!isAdMobReady) {
                    return@post
                }
                bannerAdView?.visibility = View.VISIBLE
                Log.d(TAG, "Banner Ad shown")
            }
        }

        @JavascriptInterface
        fun loadBanner() {
            mainHandler.post {
                try {
                    if (!isAdMobReady) {
                        return@post
                    }
                    Log.d(TAG, "JS requested banner reload")
                    bannerAdView?.loadAd(AdRequest.Builder().build())
                } catch (e: Exception) {
                    Log.e(TAG, "loadBanner failed: ${e.message}")
                }
            }
        }

        @JavascriptInterface
        fun hideBanner() {
            mainHandler.post {
                bannerAdView?.visibility = View.GONE
                Log.d(TAG, "Banner Ad hidden")
            }
        }

        @JavascriptInterface
        fun loadNativeAd() {
            Log.d(TAG, "loadNativeAd called from JavaScript")
            mainHandler.post {
                if (!isAdMobReady) {
                    gameWebView?.evaluateJavascript("window.onNativeAdFailed && window.onNativeAdFailed()", null)
                    return@post
                }
                this@MainActivity.loadNativeAd()
            }
        }

        @JavascriptInterface
        fun isNativeReady(): Boolean = nativeAd != null

        @JavascriptInterface
        fun openExternalUrl(url: String?) {
            if (url.isNullOrBlank()) return
            mainHandler.post {
                try {
                    val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url)).apply {
                        addCategory(Intent.CATEGORY_BROWSABLE)
                        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                    }
                    startActivity(intent)
                } catch (e: Exception) {
                    Log.e(TAG, "Failed to open external URL via Android bridge: $url", e)
                }
            }
        }

        @JavascriptInterface
        fun clearAppDataAndRestart(): Boolean {
            mainHandler.post {
                clearAndroidAppStorage()
                restartApp()
            }
            return true
        }

        @JavascriptInterface
        fun quit() {
            mainHandler.post {
                finishAffinity() // closes entire app properly
            }
        }
    }

    // ==========================================================
    // 🎵 AUDIO ENGINE
    // ==========================================================
    private fun startAudio(fileName: String) {
        stopAudio()
        try {
            val afd = assets.openFd(fileName)
            bgmPlayer = MediaPlayer().apply {
                setDataSource(afd.fileDescriptor, afd.startOffset, afd.length)
                isLooping = true
                prepare()
                start()
            }
            afd.close()
            isMusicActive = true
            // If this is the splash / sryde audio, kick off Play Games sign-in attempt
            if (fileName.contains("sryde", ignoreCase = true)) {
                mainHandler.post { attemptSilentPlayGamesSignIn() }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Audio Error: ${e.message}")
        }
    }

    private fun stopAudio() {
        bgmPlayer?.let {
            if (it.isPlaying) it.stop()
            it.release()
        }
        bgmPlayer = null
        isMusicActive = false
    }

    // ==========================================================
    // 🛠 UTILITIES & LIFECYCLE
    // ==========================================================
    private fun requestNeededPermissions() {
        // No runtime permission prompt is required for app-data reset on Android.
    }

    internal fun storageCleanupDoneKey(): String = PREF_ANDROID_STORAGE_CLEANUP_DONE

    private fun prepareAndroidStorageForHtmlAccess() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.LOLLIPOP) return

        val prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        if (prefs.getBoolean(PREF_ANDROID_STORAGE_CLEANUP_DONE, false)) return

        // Preserve the HTML/WebView save state across app updates.
        // Automatically clearing Android app storage here deletes the game’s localStorage
        // progress and causes existing saves to disappear after an update.
        prefs.edit { putBoolean(PREF_ANDROID_STORAGE_CLEANUP_DONE, true) }
    }

    private fun clearAndroidAppStorage() {
        try {
            WebStorage.getInstance().deleteAllData()
            CookieManager.getInstance().removeAllCookies(null)
            CookieManager.getInstance().flush()
        } catch (e: Exception) {
            Log.w(TAG, "Failed to clear WebView storage: ${e.message}")
        }

        try {
            val webView = WebView(this)
            webView.clearCache(true)
            webView.clearHistory()
            webView.clearFormData()
            webView.clearSslPreferences()
            webView.destroy()
        } catch (e: Exception) {
            Log.w(TAG, "Failed to clear WebView cache: ${e.message}")
        }

        try {
            deleteDirectory(cacheDir)
            deleteDirectory(filesDir)
            getExternalFilesDir(null)?.let(::deleteDirectory)
        } catch (e: Exception) {
            Log.w(TAG, "Failed to clear app private storage: ${e.message}")
        }

        try {
            getSharedPreferences("SolarFlyPrefs", Context.MODE_PRIVATE).edit { clear() }
        } catch (e: Exception) {
            Log.w(TAG, "Failed to clear app prefs: ${e.message}")
        }
    }

    private fun restartApp() {
        val intent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        }
        startActivity(intent)
        finishAffinity()
    }

    private fun deleteDirectory(directory: File?) {
        if (directory == null || !directory.exists()) return
        if (directory.isDirectory) {
            directory.listFiles()?.forEach { child -> deleteDirectory(child) }
        }
        directory.delete()
    }

    private fun scheduleInactiveNotification() {
        val prefs = getSharedPreferences("SolarFlyPrefs", Context.MODE_PRIVATE)
        val lastOpen = prefs.getLong("last_open", System.currentTimeMillis())

        androidx.work.WorkManager.getInstance(this).cancelAllWorkByTag("inactive_notification")

        val delay = 2 * 24 * 60 * 60 * 1000L - (System.currentTimeMillis() - lastOpen)
        if (delay > 0) {
            val workRequest = androidx.work.OneTimeWorkRequestBuilder<InactiveNotificationWorker>()
                .setInitialDelay(delay, java.util.concurrent.TimeUnit.MILLISECONDS)
                .addTag("inactive_notification")
                .build()
            androidx.work.WorkManager.getInstance(this).enqueue(workRequest)
        }
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = android.app.NotificationChannel(
                "solar_channel",
                "Solar Fly Notifications",
                android.app.NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Notifications for inactive players"
            }

            // Use app bundled sound for notifications
            try {
                val soundUri = Uri.parse("android.resource://$packageName/raw/noti")
                val audioAttributes = AudioAttributes.Builder()
                    .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                    .setUsage(AudioAttributes.USAGE_NOTIFICATION)
                    .build()
                channel.setSound(soundUri, audioAttributes)
            } catch (_: Exception) {
                // ignore if sound resource isn't present
            }

            val manager = getSystemService(android.app.NotificationManager::class.java)
            manager.createNotificationChannel(channel)
        }
    }

    private fun sendHeyPilotNotification() {
        try {
            val intent = Intent(this, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
            }
            val pendingIntent = PendingIntent.getActivity(
                this,
                0,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )

            val largeIcon = BitmapFactory.decodeResource(resources, R.drawable.icon)
            val soundUri = Uri.parse("android.resource://$packageName/raw/noti")

            val notification = NotificationCompat.Builder(this, "solar_channel")
                .setSmallIcon(R.drawable.ic_notification)
                .setLargeIcon(largeIcon)
                .setContentTitle("Hey pilot")
                .setContentText("Universe is waiting for you.. Let's continue the journey.")
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setContentIntent(pendingIntent)
                .setAutoCancel(true)
                .setSound(soundUri)
                .build()

            if (Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU ||
                ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED
            ) {
                NotificationManagerCompat.from(this).notify(1000, notification)
            }
        } catch (e: Exception) {
            Log.w(TAG, "Failed to send Hey pilot notification: ${e.message}")
        }
    }

    override fun onResume() {
        super.onResume()

        bannerAdView?.resume()
        gameWebView?.onResume()
        gameWebView?.evaluateJavascript("window.checkForUpdateIfNeeded && window.checkForUpdateIfNeeded();", null)

        splashPlayer?.let { player ->
            if (isAppInBackground) {
                try {
                    player.start() // 🔥 resume video properly
                } catch (_: Exception) {
                    onSplashDone() // fallback if broken
                }
            }
        }

        isAppInBackground = false

        if (isMusicActive) bgmPlayer?.start()

        val prefs = getSharedPreferences("SolarFlyPrefs", Context.MODE_PRIVATE)
        prefs.edit { putLong("last_open", System.currentTimeMillis()) }

        scheduleInactiveNotification()
    }

    override fun onPause() {
        super.onPause()

        isAppInBackground = true // 👈 user left app

        splashPlayer?.pause()
        bannerAdView?.pause()
        gameWebView?.onPause()
        bgmPlayer?.pause()
    }

    override fun onDestroy() {
        bannerAdView?.destroy()
        try {
            nativeAd?.destroy()
        } catch (_: Exception) {
        }
        stopAudio()
        gameWebView?.apply {
            (parent as? ViewGroup)?.removeView(this)
            destroy()
        }
        gameWebView = null
        mainHandler.removeCallbacksAndMessages(null)
        super.onDestroy()
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)

        if (requestCode == UPDATE_REQUEST_CODE) {
            when (resultCode) {
                RESULT_OK -> {
                    Toast.makeText(this, "Update accepted, installing...", Toast.LENGTH_SHORT).show()
                }
                RESULT_CANCELED -> {
                    Toast.makeText(this, "Update postponed", Toast.LENGTH_SHORT).show()
                }
                else -> {
                    Toast.makeText(this, "Update failed or canceled", Toast.LENGTH_SHORT).show()
                }
            }
            return
        }

        if (requestCode == 1002) {
            val results = if (resultCode == RESULT_OK && data != null) {
                arrayOf(data.data!!)
            } else null

            filePathCallback?.onReceiveValue(results)
            filePathCallback = null
        }
    }
}

/**
 * Worker for sending notifications to inactive players
 */
class InactiveNotificationWorker(
    context: Context,
    params: WorkerParameters
) : Worker(context, params) {

    @RequiresPermission(Manifest.permission.POST_NOTIFICATIONS)
    override fun doWork(): Result {
        val prefs = applicationContext.getSharedPreferences("SolarFlyPrefs", Context.MODE_PRIVATE)
        val lastOpen = prefs.getLong("last_open", 0L)
        val now = System.currentTimeMillis()

        if (now - lastOpen >= 2 * 24 * 60 * 60 * 1000L) { // 2 days
            sendNotification()
        }
        return Result.success()
    }

    @RequiresPermission(Manifest.permission.POST_NOTIFICATIONS)
    private fun sendNotification() {
        val intent = Intent(applicationContext, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        }
        val pendingIntent = PendingIntent.getActivity(
            applicationContext,
            0,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val largeIcon = BitmapFactory.decodeResource(applicationContext.resources, R.drawable.icon)

        val soundUri = Uri.parse("android.resource://${applicationContext.packageName}/raw/noti")

        val notification = NotificationCompat.Builder(applicationContext, "solar_channel")
            .setSmallIcon(R.drawable.ic_notification)
            .setLargeIcon(largeIcon)
            .setContentTitle("Hey pilot")
            .setContentText("Universe is waiting for you.. Let's continue the journey.")
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setContentIntent(pendingIntent)
            .setAutoCancel(true)
            .setSound(soundUri)
            .build()

        NotificationManagerCompat.from(applicationContext).notify(1001, notification)
    }
}