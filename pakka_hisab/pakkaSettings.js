// pakkaSettings.js - Settings with separate rates for Buffalo and Cow + SNF for Cow
// Developed by Arshdeep Singh

let defaultSettings = {
    dairyName: '',
    dairyOwner: '',
    dairyAddress: '',
    dairyPhone: '',
    defaultFarmerName: '',
    defaultFarmerPhone: '',
    buffaloFixedRate: 50,      // ₹ per liter for Buffalo
    cowFixedRate: 40,          // ₹ per liter for Cow
    buffaloFatRate: 8.50,      // ₹ per fat for Buffalo
    cowFatRate: 9.50,          // ₹ per fat for Cow
    cowSnfRate: 5.00           // ₹ per SNF for Cow
};

function loadSettings() {
    const stored = localStorage.getItem('pakkaSettings');
    if (stored) {
        return { ...defaultSettings, ...JSON.parse(stored) };
    }
    return { ...defaultSettings };
}

function saveSettings(settings) {
    localStorage.setItem('pakkaSettings', JSON.stringify(settings));
}

function populateSettingsForm() {
    const settings = loadSettings();

    const dairyNameEl = document.getElementById('dairyName');
    if (dairyNameEl) dairyNameEl.value = settings.dairyName;

    const dairyOwnerEl = document.getElementById('dairyOwner');
    if (dairyOwnerEl) dairyOwnerEl.value = settings.dairyOwner;

    const dairyAddressEl = document.getElementById('dairyAddress');
    if (dairyAddressEl) dairyAddressEl.value = settings.dairyAddress;

    const dairyPhoneEl = document.getElementById('dairyPhone');
    if (dairyPhoneEl) dairyPhoneEl.value = settings.dairyPhone;

    const defaultFarmerNameEl = document.getElementById('defaultFarmerName');
    if (defaultFarmerNameEl) defaultFarmerNameEl.value = settings.defaultFarmerName;

    const defaultFarmerPhoneEl = document.getElementById('defaultFarmerPhone');
    if (defaultFarmerPhoneEl) defaultFarmerPhoneEl.value = settings.defaultFarmerPhone;

    const buffaloFixedRateEl = document.getElementById('buffaloFixedRate');
    if (buffaloFixedRateEl) buffaloFixedRateEl.value = settings.buffaloFixedRate;

    const cowFixedRateEl = document.getElementById('cowFixedRate');
    if (cowFixedRateEl) cowFixedRateEl.value = settings.cowFixedRate;

    const buffaloFatRateEl = document.getElementById('buffaloFatRate');
    if (buffaloFatRateEl) buffaloFatRateEl.value = settings.buffaloFatRate;

    const cowFatRateEl = document.getElementById('cowFatRate');
    if (cowFatRateEl) cowFatRateEl.value = settings.cowFatRate;

    const cowSnfRateEl = document.getElementById('cowSnfRate');
    if (cowSnfRateEl) cowSnfRateEl.value = settings.cowSnfRate;
}

function handleSettingsSubmit(event) {
    event.preventDefault();

    // 🛡️ ਸੁਰੱਖਿਅਤ ਤਰੀਕੇ ਨਾਲ value ਪੜ੍ਹੋ
    const getSafeVal = (id) => {
        const el = document.getElementById(id);
        return el ? el.value.trim() : '';
    };

    // 🛡️ ਸੁਰੱਖਿਅਤ ਨੰਬਰ ਪਾਰਸਿੰਗ (0 ਵੀ ਸੇਵ ਹੋਵੇ)
    const getSafeRate = (id, defaultVal) => {
        const el = document.getElementById(id);
        if (!el) return defaultVal;
        const val = parseFloat(el.value);
        return !isNaN(val) ? val : defaultVal;
    };

    const settings = {
        dairyName: getSafeVal('dairyName'),
        dairyOwner: getSafeVal('dairyOwner'),
        dairyAddress: getSafeVal('dairyAddress'),
        dairyPhone: getSafeVal('dairyPhone'),
        defaultFarmerName: getSafeVal('defaultFarmerName'),
        defaultFarmerPhone: getSafeVal('defaultFarmerPhone'),
        buffaloFixedRate: getSafeRate('buffaloFixedRate', defaultSettings.buffaloFixedRate),
        cowFixedRate: getSafeRate('cowFixedRate', defaultSettings.cowFixedRate),
        buffaloFatRate: getSafeRate('buffaloFatRate', defaultSettings.buffaloFatRate),
        cowFatRate: getSafeRate('cowFatRate', defaultSettings.cowFatRate),
        cowSnfRate: getSafeRate('cowSnfRate', defaultSettings.cowSnfRate)
    };

    saveSettings(settings);
    updateMainFormFromSettings();
    closeSettingsModal();
    alert('ਸੈਟਿੰਗਜ਼ ਸੇਵ ਹੋ ਗਈਆਂ!');
}

function openSettingsModal() {
    populateSettingsForm();
    const modal = document.getElementById('settingsModal');
    if (modal) modal.style.display = 'block';
}

function closeSettingsModal() {
    const modal = document.getElementById('settingsModal');
    if (modal) modal.style.display = 'none';
}

// ਮੁੱਖ ਫਾਰਮ ਨੂੰ settings ਤੋਂ ਅੱਪਡੇਟ ਕਰਨ ਲਈ (animal-based rates)
function updateMainFormFromSettings() {
    const settings = loadSettings();
    const farmerInput = document.getElementById('farmerName');
    if (farmerInput) farmerInput.value = settings.defaultFarmerName;

    const marquee = document.getElementById('farmerMarquee');
    if (marquee) marquee.innerText = settings.defaultFarmerName || 'ਕਿਸਾਨ ਦਾ ਨਾਮ';
}

// ਮੌਜੂਦਾ ਪਸ਼ੂ ਦੇ ਰੇਟ ਪ੍ਰਾਪਤ ਕਰੋ (ਪੱਕੇ ਦੇ ਲੌਜਿਕ ਲਈ)
function getCurrentRates() {
    const settings = loadSettings();
    const animalEl = document.querySelector('input[name="animalType"]:checked');

    // 🛡️ Null check: ਜੇਕਰ ਕੋਈ ਰੇਡੀਓ ਬਟਨ ਸਿਲੈਕਟ ਨਹੀਂ ਹੈ, ਤਾਂ 0 ਵਾਪਸ ਕਰੋ
    if (!animalEl) {
        return { fixedRate: 0, fatRatePerFat: 0, cowSnfRate: 0 };
    }

    const animal = animalEl.value;
    let fixedRate = 0, fatRatePerFat = 0, cowSnfRate = 0;

    if (animal === 'buffalo') {
        fixedRate = settings.buffaloFixedRate;
        fatRatePerFat = settings.buffaloFatRate;
        cowSnfRate = 0;
    } else {
        fixedRate = settings.cowFixedRate;
        fatRatePerFat = settings.cowFatRate;
        cowSnfRate = settings.cowSnfRate || 0;
    }
    return { fixedRate, fatRatePerFat, cowSnfRate };
}

// Settings form submit listener
document.addEventListener('DOMContentLoaded', function () {
    const settingsForm = document.getElementById('settingsForm');
    if (settingsForm) {
        settingsForm.addEventListener('submit', handleSettingsSubmit);
    }
});
