// pakka_logic.js - Clean version for Pakka Hisab
// Developed by Arshdeep Singh

// ==================== GLOBAL VARIABLES ====================
let entries = [];                 // ਸਥਾਈ ਤੌਰ 'ਤੇ ਸਟੋਰ ਕੀਤੀਆਂ ਐਂਟਰੀਆਂ (localStorage)

// ==================== STORAGE FUNCTIONS ====================
function loadEntries() {
    const stored = localStorage.getItem('pakkaEntries');
    if (stored) {
        try {
            entries = JSON.parse(stored);
        } catch (e) {
            entries = [];
        }
    }
}

function saveEntries() {
    localStorage.setItem('pakkaEntries', JSON.stringify(entries));
}

// ==================== DATE SETUP ====================
function setCurrentDate() {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    const dateInput = document.getElementById('entryDate');
    dateInput.value = `${y}-${m}-${d}`;
    dateInput.disabled = false; // ਯੂਜ਼ਰ ਤਾਰੀਖ਼ ਨਾ ਬਦਲ ਸਕੇ
}

// ==================== UPDATE SUMMARY ====================
function updateSummary() {
    const dateInput = document.getElementById('entryDate');
    const selectedDate = dateInput.value;
    const todayEntries = entries.filter(e => e.date === selectedDate);

    let totalMilk = 0, totalIncome = 0;
    todayEntries.forEach(e => {
        totalMilk += e.milk;
        totalIncome += e.total;
    });

    document.getElementById('totalMilkToday').innerText = totalMilk.toFixed(2) + ' L';
    document.getElementById('totalIncomeToday').innerText = '₹' + totalIncome.toFixed(2);
}

// ==================== PREVIOUS DAY TOTAL ====================
function updatePrevDayTotal() {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const y = yesterday.getFullYear();
    const m = String(yesterday.getMonth() + 1).padStart(2, '0');
    const d = String(yesterday.getDate()).padStart(2, '0');
    const yesterdayStr = `${y}-${m}-${d}`;

    const yesterdayEntries = entries.filter(e => e.date === yesterdayStr);
    const total = yesterdayEntries.reduce((sum, e) => sum + e.total, 0);

    document.getElementById('prevDayTotal').innerText = `ਪਿਛਲੇ ਦਿਨ ਦਾ ਕੁੱਲ: ₹${total.toFixed(2)}`;
}

// ==================== AUTO SHIFT DISPLAY ====================
function updateShiftDisplay() {
    const hours = new Date().getHours();
    const shiftText = hours < 12 ? 'ਸਵੇਰ (Morning)' : 'ਸ਼ਾਮ (Evening)';
    document.getElementById('shiftDisplay').innerText = shiftText;
}

// ==================== RATE TYPE TOGGLE & CALCULATIONS ====================
function toggleRateType() {
    const isFixed = document.querySelector('input[name="rateType"]:checked').value === 'fixed';
    document.getElementById('fixedRateRow').style.display = isFixed ? 'flex' : 'none';
    document.getElementById('fatRateRow').style.display = isFixed ? 'none' : 'flex';
    calculateTotal();
}
function calculateTotal() {
    const milk = parseFloat(document.getElementById('milkLiter').value) || 0;
    const rateType = document.querySelector('input[name="rateType"]:checked').value;
    const { fixedRate, fatRatePerFat } = window.getCurrentRates(); // from pakkaSettings.js

    // Update disabled rate display fields (so user sees current rates)
    document.getElementById('fixedRate').value = fixedRate.toFixed(2);
    document.getElementById('fatRatePerFat').value = fatRatePerFat.toFixed(2);

    let rate = 0;
    if (rateType === 'fixed') {
        rate = fixedRate;
    } else {
        const fat = parseFloat(document.getElementById('fatPercent').value) || 0;
        rate = fat * fatRatePerFat;
    }
    document.getElementById('totalAmount').value = (milk * rate).toFixed(2);
}
// ==================== SAVE ENTRY ====================
function saveEntry() {
    const farmer = document.getElementById('farmerName').value.trim();
    const milk = parseFloat(document.getElementById('milkLiter').value);
    const date = document.getElementById('entryDate').value; // YYYY-MM-DD

    if (!farmer || isNaN(milk) || milk <= 0 || !date) {
        alert('ਕਿਰਪਾ ਕਰਕੇ ਸਾਰੀ ਜਾਣਕਾਰੀ ਸਹੀ ਭਰੋ।');
        return;
    }

    const rateType = document.querySelector('input[name="rateType"]:checked').value;
    const { fixedRate, fatRatePerFat } = window.getCurrentRates();
    let rate = 0;
    if (rateType === 'fixed') {
        rate = fixedRate;
    } else {
        const fat = parseFloat(document.getElementById('fatPercent').value) || 0;
        rate = fat * fatRatePerFat;
    }
    const total = milk * rate;
    const shift = new Date().getHours() < 12 ? 'morning' : 'evening';

    const entry = {
        id: Date.now() + Math.random(),
        date: date,
        shift: shift,
        shiftDisplay: document.getElementById('shiftDisplay').innerText,
        farmer: farmer,
        animal: document.querySelector('input[name="animalType"]:checked').value,
        milk: milk,
        rate: rate,
        total: total,
        expense: 0,
        net: total
    };

    entries.push(entry);
    saveEntries();
    updateSummary();
    updatePrevDayTotal();

    // Clear only milk field and focus back
    document.getElementById('milkLiter').value = '';
    document.getElementById('milkLiter').focus();
}

// ==================== CLEAR FORM ====================
function clearForm() {
    document.getElementById('milkLiter').value = '';
    calculateTotal();
    document.getElementById('milkLiter').focus();
}

// ==================== EVENT LISTENERS ====================
function setupEventListeners() {
    // Farmer Name & Marquee
    const fNameInput = document.getElementById('farmerName');
    fNameInput.addEventListener('input', function (e) {
        const name = e.target.value.trim();
        document.getElementById('farmerMarquee').innerText = name || 'ਕਿਸਾਨ ਦਾ ਨਾਮ';
    });

    // Rate type toggle
    document.querySelectorAll('input[name="rateType"]').forEach(r => r.addEventListener('change', toggleRateType));

    // Input calculations
    const milkLiter = document.getElementById('milkLiter');
    milkLiter.addEventListener('input', calculateTotal);
    document.getElementById('fixedRate').addEventListener('input', calculateTotal);
    document.getElementById('fatPercent').addEventListener('input', calculateTotal);

    // Quick Save: Press Enter in milk field
    milkLiter.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            saveEntry();
        }
    });

    // Animal type change -> update rates display
    document.querySelectorAll('input[name="animalType"]').forEach(r => r.addEventListener('change', function () {
        calculateTotal();
    }));

    // Save and clear buttons
    document.getElementById('saveEntryBtn').addEventListener('click', saveEntry);
    document.getElementById('clearFormBtn').addEventListener('click', clearForm);

    // PDF Date Range toggle
    document.getElementById('pdfDateRange').addEventListener('change', function () {
        document.getElementById('customDateRange').style.display = this.value === 'custom' ? 'flex' : 'none';
    });
}


// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', function () {
    loadEntries();
    setCurrentDate();

    updateShiftDisplay();
    setupEventListeners();
    updateSummary();
    updatePrevDayTotal();

    // Load default farmer name and rates from settings
    if (typeof updateMainFormFromSettings === 'function') {
        updateMainFormFromSettings();
    }
    calculateTotal(); // ensure rates are displayed
});

