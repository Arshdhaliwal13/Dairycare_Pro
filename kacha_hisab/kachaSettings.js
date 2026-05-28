// kachaSettings.js - Settings with separate rates for Buffalo and Cow
// Developed for DairyCare Pro Kacha Hisab

let defaultSettings = {
    dairyName: '',
    dairyOwner: '',
    dairyAddress: '',
    dairyPhone: '',
    defaultFarmerName: '',
    defaultFarmerPhone: '',
    buffaloFixedRate: 45,      // ₹ per liter for Buffalo
    cowFixedRate: 40,          // ₹ per liter for Cow
    buffaloFatRate: 7.80,      // ₹ per fat for Buffalo
    cowFatRate: 7.00           // ₹ per fat for Cow
};

function loadSettings() {
    const stored = localStorage.getItem('kachaSettings');
    if (stored) {
        return { ...defaultSettings, ...JSON.parse(stored) };
    }
    return { ...defaultSettings };
}

function saveSettings(settings) {
    localStorage.setItem('kachaSettings', JSON.stringify(settings));
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
    updateMainFormFromSettings();  // defined in kacha_logic.js
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
