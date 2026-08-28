// ownerSettings.js - Settings with separate rates for Buffalo and Cow + SNF for Cow
// Developed by Arshdeep Singh

let defaultSettings = {
    dairyName: '',
    dairyOwner: '',
    dairyAddress: '',
    dairyPhone: '',
    defaultFarmerName: '',
    defaultFarmerPhone: '',
    buffaloFixedRate: 50,
    cowFixedRate: 40,
    buffaloFatRate: 8.50,
    cowFatRate: 9.50,
    cowSnfRate: 5.00
};

function loadSettings() {
    const stored = localStorage.getItem('ownerSettings');
    if (stored) {
        return { ...defaultSettings, ...JSON.parse(stored) };
    }
    return { ...defaultSettings };
}

function saveSettings(settings) {
    localStorage.setItem('ownerSettings', JSON.stringify(settings));
}

function populateSettingsForm() {
    const settings = loadSettings();
    const fields = ['dairyName', 'dairyOwner', 'dairyAddress', 'dairyPhone', 'defaultFarmerName', 'defaultFarmerPhone', 'buffaloFixedRate', 'cowFixedRate', 'buffaloFatRate', 'cowFatRate', 'cowSnfRate'];
    fields.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = settings[id] !== undefined ? settings[id] : '';
    });
}

function handleSettingsSubmit(event) {
    event.preventDefault();
    const getSafeVal = (id) => {
        const el = document.getElementById(id);
        return el ? el.value.trim() : '';
    };
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
    // HTML embedded script ਵਿੱਚ ਪਹਿਲਾਂ ਹੀ renderFarmerTable ਅਤੇ populateFarmerDropdowns ਮੌਜੂਦ ਹਨ
    // ਇਸ ਲਈ ਉਹਨਾਂ ਨੂੰ ਸਿੱਧਾ ਕਾਲ ਕਰੋ (window object ਤੋਂ)
    if (typeof window.renderFarmerTable === 'function') {
        window.renderFarmerTable();
    }
    if (typeof window.populateFarmerDropdowns === 'function') {
        window.populateFarmerDropdowns();
    }
}

function closeSettingsModal() {
    const modal = document.getElementById('settingsModal');
    if (modal) modal.style.display = 'none';
}

function updateMainFormFromSettings() {
    const settings = loadSettings();
    const farmerInput = document.getElementById('farmerName');
    if (farmerInput) farmerInput.value = settings.defaultFarmerName || '';
    const marquee = document.getElementById('farmerMarquee');
    if (marquee) marquee.innerText = settings.defaultFarmerName || 'ਕਿਸਾਨ ਦਾ ਨਾਮ';
}

// Original getCurrentRates (used as fallback)
function getCurrentRates() {
    const settings = loadSettings();
    const animalEl = document.querySelector('input[name="animalType"]:checked');
    if (!animalEl) return { fixedRate: 0, fatRatePerFat: 0, cowSnfRate: 0 };
    const animal = animalEl.value;
    let fixedRate = 0, fatRatePerFat = 0, cowSnfRate = 0;
    if (animal === 'buffalo') {
        fixedRate = settings.buffaloFixedRate;
        fatRatePerFat = settings.buffaloFatRate;
    } else {
        fixedRate = settings.cowFixedRate;
        fatRatePerFat = settings.cowFatRate;
        cowSnfRate = settings.cowSnfRate || 0;
    }
    return { fixedRate, fatRatePerFat, cowSnfRate };
}

// ========== MULTI-FARMER EXTENSIONS ==========
const FARMER_LIST_KEY = 'owner_farmers_list';

function getFarmers() {
    try { return JSON.parse(localStorage.getItem(FARMER_LIST_KEY) || '[]'); } catch { return []; }
}
function saveFarmers(farmers) { localStorage.setItem(FARMER_LIST_KEY, JSON.stringify(farmers)); }

function addFarmer(name, phone, rates) {
    const farmers = getFarmers();
    if (farmers.some(f => f.name.toLowerCase() === name.toLowerCase())) {
        alert('ਇਹ ਨਾਮ ਪਹਿਲਾਂ ਹੀ ਮੌਜੂਦ ਹੈ!');
        return false;
    }
    const newFarmer = {
        id: Date.now().toString(),
        name: name.trim(),
        phone: phone.trim() || '',
        buffaloFixed: rates.buffaloFixed || 0,
        buffaloFat: rates.buffaloFat || 0,
        cowFixed: rates.cowFixed || 0,
        cowFat: rates.cowFat || 0,
        cowSnf: rates.cowSnf || 0
    };
    farmers.push(newFarmer);
    saveFarmers(farmers);
    return true;
}

function editFarmer(id, updates) {
    const farmers = getFarmers();
    const idx = farmers.findIndex(f => String(f.id) === String(id));
    if (idx === -1) return false;
    const farmer = farmers[idx];
    if (updates.name !== undefined) {
        if (farmers.some((f, i) => i !== idx && f.name.toLowerCase() === updates.name.trim().toLowerCase())) {
            alert('ਇਹ ਨਾਮ ਪਹਿਲਾਂ ਹੀ ਮੌਜੂਦ ਹੈ!');
            return false;
        }
        farmer.name = updates.name.trim();
    }
    if (updates.phone !== undefined) farmer.phone = updates.phone.trim() || '';
    if (updates.buffaloFixed !== undefined) farmer.buffaloFixed = parseFloat(updates.buffaloFixed) || 0;
    if (updates.buffaloFat !== undefined) farmer.buffaloFat = parseFloat(updates.buffaloFat) || 0;
    if (updates.cowFixed !== undefined) farmer.cowFixed = parseFloat(updates.cowFixed) || 0;
    if (updates.cowFat !== undefined) farmer.cowFat = parseFloat(updates.cowFat) || 0;
    if (updates.cowSnf !== undefined) farmer.cowSnf = parseFloat(updates.cowSnf) || 0;
    saveFarmers(farmers);
    return true;
}

function deleteFarmer(id) {
    let farmers = getFarmers();
    farmers = farmers.filter(f => String(f.id) !== String(id));
    saveFarmers(farmers);
}

function getFarmerById(id) {
    const farmers = getFarmers();
    return farmers.find(f => String(f.id) === String(id)) || null;
}

// Override getCurrentRates to use selected farmer's rates
const originalGetCurrentRates = window.getCurrentRates || getCurrentRates;
window.getCurrentRates = function () {
    const selectedFarmerId = window._selectedFarmerId || null;
    let farmer = null;
    if (selectedFarmerId) farmer = getFarmerById(selectedFarmerId);
    const animalEl = document.querySelector('input[name="animalType"]:checked');
    const animal = animalEl ? animalEl.value : 'buffalo';
    let fixedRate = 0, fatRatePerFat = 0, cowSnfRate = 0;
    if (farmer) {
        if (animal === 'buffalo') {
            fixedRate = farmer.buffaloFixed || 0;
            fatRatePerFat = farmer.buffaloFat || 0;
        } else {
            fixedRate = farmer.cowFixed || 0;
            fatRatePerFat = farmer.cowFat || 0;
            cowSnfRate = farmer.cowSnf || 0;
        }
    } else {
        const settings = loadSettings();
        if (animal === 'buffalo') {
            fixedRate = settings.buffaloFixedRate;
            fatRatePerFat = settings.buffaloFatRate;
        } else {
            fixedRate = settings.cowFixedRate;
            fatRatePerFat = settings.cowFatRate;
            cowSnfRate = settings.cowSnfRate || 0;
        }
    }
    return { fixedRate, fatRatePerFat, cowSnfRate };
};

// ========== NOTE: populateFarmerDropdowns and renderFarmerTable are defined in HTML ==========
// They are NOT defined here to avoid infinite recursion.
// openSettingsModal() calls them via window object.

document.addEventListener('DOMContentLoaded', function () {
    const settingsForm = document.getElementById('settingsForm');
    if (settingsForm) settingsForm.addEventListener('submit', handleSettingsSubmit);
});