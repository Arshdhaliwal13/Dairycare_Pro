// pakkaSettings.js - Settings with separate rates for Buffalo and Cow
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
    cowFatRate: 9.50,           // ₹ per fat for Cow
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
    document.getElementById('dairyName').value = settings.dairyName;
    document.getElementById('dairyOwner').value = settings.dairyOwner;
    document.getElementById('dairyAddress').value = settings.dairyAddress;
    document.getElementById('dairyPhone').value = settings.dairyPhone;
    document.getElementById('defaultFarmerName').value = settings.defaultFarmerName;
    document.getElementById('defaultFarmerPhone').value = settings.defaultFarmerPhone;
    document.getElementById('buffaloFixedRate').value = settings.buffaloFixedRate;
    document.getElementById('cowFixedRate').value = settings.cowFixedRate;
    document.getElementById('buffaloFatRate').value = settings.buffaloFatRate;
    document.getElementById('cowFatRate').value = settings.cowFatRate;
}

function handleSettingsSubmit(event) {
    event.preventDefault();
    const settings = {
        dairyName: document.getElementById('dairyName').value.trim(),
        dairyOwner: document.getElementById('dairyOwner').value.trim(),
        dairyAddress: document.getElementById('dairyAddress').value.trim(),
        dairyPhone: document.getElementById('dairyPhone').value.trim(),
        defaultFarmerName: document.getElementById('defaultFarmerName').value.trim(),
        defaultFarmerPhone: document.getElementById('defaultFarmerPhone').value.trim(),
        buffaloFixedRate: parseFloat(document.getElementById('buffaloFixedRate').value) || defaultSettings.buffaloFixedRate,
        cowFixedRate: parseFloat(document.getElementById('cowFixedRate').value) || defaultSettings.cowFixedRate,
        buffaloFatRate: parseFloat(document.getElementById('buffaloFatRate').value) || defaultSettings.buffaloFatRate,
        cowFatRate: parseFloat(document.getElementById('cowFatRate').value) || defaultSettings.cowFatRate
    };
    saveSettings(settings);
    updateMainFormFromSettings();  // defined in pakka_logic.js
    closeSettingsModal();
    alert('ਸੈਟਿੰਗਜ਼ ਸੇਵ ਹੋ ਗਈਆਂ!');
}

function openSettingsModal() {
    populateSettingsForm();
    document.getElementById('settingsModal').style.display = 'block';
}

function closeSettingsModal() {
    document.getElementById('settingsModal').style.display = 'none';
}

// ✅ ਮੁੱਖ ਫਾਰਮ ਨੂੰ settings ਤੋਂ ਅੱਪਡੇਟ ਕਰਨ ਲਈ (animal-based rates)
function updateMainFormFromSettings() {
    const settings = loadSettings();
    const farmerInput = document.getElementById('farmerName');
    if (farmerInput) farmerInput.value = settings.defaultFarmerName;

    // Fixed rate display depends on selected animal, so we'll update on animal change too
    // For now just set default values in hidden/disabled fields? Actually fixedRate field will be dynamically updated.
    const marquee = document.getElementById('farmerMarquee');
    if (marquee) marquee.innerText = settings.defaultFarmerName || 'ਕਿਸਾਨ ਦਾ ਨਾਮ';
}

// Helper to get current animal's rates (used in pakka_logic)
function getCurrentRates() {
    const settings = loadSettings();
    const animal = document.querySelector('input[name="animalType"]:checked').value;
    let fixedRate = 0, fatRatePerFat = 0;
    if (animal === 'buffalo') {
        fixedRate = settings.buffaloFixedRate;
        fatRatePerFat = settings.buffaloFatRate;
    } else {
        fixedRate = settings.cowFixedRate;
        fatRatePerFat = settings.cowFatRate;
    }
    return { fixedRate, fatRatePerFat };
}
// Attach settings form submit handler
document.addEventListener('DOMContentLoaded', function () {
    const settingsForm = document.getElementById('settingsForm');
    if (settingsForm) {
        settingsForm.addEventListener('submit', handleSettingsSubmit);
    }
});