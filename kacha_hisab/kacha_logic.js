// kacha_logic.js - Complete Kacha Hisab Logic (FIXED)
// Developed for DairyCare Pro

// ==================== GLOBAL VARIABLES ====================
let sessionEntries = [];
let editMode = false;
let editId = null;

// ==================== SESSION STORAGE ====================
function saveSession() {
    sessionStorage.setItem('kachaEntries', JSON.stringify(sessionEntries));
}

// ==================== DATE PICKER (FIXED) ====================

function setCurrentDate() {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    document.getElementById('entryDate').value = `${y}-${m}-${d}`;
}

// ==================== RATE & TOTAL CALCULATION ====================
function getCurrentRates() {
    const settings = loadSettings();
    const animal = document.querySelector('input[name="animalType"]:checked').value;
    let fixedRate = 0, fatRatePerFat = 0;
    if (animal === 'buffalo') {
        fixedRate = settings.buffaloFixedRate || 45;
        fatRatePerFat = settings.buffaloFatRate || 7.80;
    } else {
        fixedRate = settings.cowFixedRate || 40;
        fatRatePerFat = settings.cowFatRate || 7.00;
    }
    return { fixedRate, fatRatePerFat };
}

function calculateTotal() {
    const milk = parseFloat(document.getElementById('milkLiter').value) || 0;
    const { fixedRate, fatRatePerFat } = getCurrentRates();
    const rateType = document.querySelector('input[name="rateType"]:checked').value;
    let rate = 0;
    if (rateType === 'fixed') {
        rate = fixedRate;
    } else {
        const fatPercent = parseFloat(document.getElementById('fatPercent').value) || 0;
        rate = fatPercent * fatRatePerFat;
    }
    const total = milk * rate;
    document.getElementById('totalAmount').value = total.toFixed(2);
    // Update disabled rate display fields
    document.getElementById('fixedRate').value = fixedRate.toFixed(2);
    document.getElementById('fatRatePerFat').value = fatRatePerFat.toFixed(2);
}

// ==================== UPDATE MAIN FORM FROM SETTINGS ====================
function updateMainFormFromSettings() {
    const settings = loadSettings();
    document.getElementById('farmerName').value = settings.defaultFarmerName || '';
    document.getElementById('farmerMarquee').innerText = settings.defaultFarmerName || 'ਕਿਸਾਨ ਦਾ ਨਾਮ';
    calculateTotal(); // ensures rates are shown
}

// ==================== TOGGLE RATE TYPE ROWS ====================
function toggleRateType() {
    const isFixed = document.querySelector('input[name="rateType"]:checked').value === 'fixed';
    document.getElementById('fixedRateRow').style.display = isFixed ? 'flex' : 'none';
    document.getElementById('fatRateRow').style.display = isFixed ? 'none' : 'flex';
    calculateTotal();
}

// ==================== SHIFT AUTO-MOVE ====================
function autoMoveShiftAfterSave(savedShift) {
    const shiftMorning = document.querySelector('input[name="shiftChoice"][value="morning"]');
    const shiftEvening = document.querySelector('input[name="shiftChoice"][value="evening"]');
    if (savedShift === 'morning') {
        shiftEvening.checked = true;
        document.getElementById('shiftDisplay').value = 'ਸ਼ਾਮ (Evening)';
    } else if (savedShift === 'evening') {
        shiftMorning.checked = true;
        document.getElementById('shiftDisplay').value = 'ਸਵੇਰ (Morning)';
        let currentDate = document.getElementById('entryDate').value;
        if (currentDate) {
            let nextDate = new Date(currentDate);
            nextDate.setDate(nextDate.getDate() + 1);
            let ny = nextDate.getFullYear();
            let nm = String(nextDate.getMonth() + 1).padStart(2, '0');
            let nd = String(nextDate.getDate()).padStart(2, '0');
            document.getElementById('entryDate').value = `${ny}-${nm}-${nd}`;
        }
        updateShiftDisplay();
    }
}

function updateShiftDisplay() {
    const selectedShift = document.querySelector('input[name="shiftChoice"]:checked');
    if (!selectedShift) {
        // Fallback: if no radio checked, check the morning one
        const morningRadio = document.querySelector('input[name="shiftChoice"][value="morning"]');
        if (morningRadio) {
            morningRadio.checked = true;
            document.getElementById('shiftDisplay').value = 'ਸਵੇਰ (Morning)';
        }
        return;
    }
    const shift = selectedShift.value;
    const shiftDisplay = document.getElementById('shiftDisplay');
    shiftDisplay.value = shift === 'morning' ? 'ਸਵੇਰ (Morning)' : 'ਸ਼ਾਮ (Evening)';
}

// ==================== SAVE ENTRY (FIXED – ensures animal is stored) ====================
function saveEntry() {
    const farmer = document.getElementById('farmerName').value.trim();
    const milk = parseFloat(document.getElementById('milkLiter').value);
    const dateNative = document.getElementById('entryDate').value;
    const displayDate = dateNative.split('-').reverse().join('/');

    if (!farmer || isNaN(milk) || milk <= 0 || !dateNative) {
        alert('ਕਿਰਪਾ ਕਰਕੇ ਸਾਰੀ ਜਾਣਕਾਰੀ ਸਹੀ ਭਰੋ (ਕਿਸਾਨ ਦਾ ਨਾਮ, ਦੁੱਧ, ਤਾਰੀਖ਼)।');
        return;
    }

    const shift = document.querySelector('input[name="shiftChoice"]:checked').value;
    const shiftDisplay = shift === 'morning' ? 'ਸਵੇਰ (Morning)' : 'ਸ਼ਾਮ (Evening)';
    const animal = document.querySelector('input[name="animalType"]:checked').value; // 'buffalo' or 'cow'
    const rateType = document.querySelector('input[name="rateType"]:checked').value;
    const { fixedRate, fatRatePerFat } = getCurrentRates();
    let rate = 0, fatPercent = 0;
    if (rateType === 'fixed') {
        rate = fixedRate;
    } else {
        fatPercent = parseFloat(document.getElementById('fatPercent').value) || 0;
        rate = fatPercent * fatRatePerFat;
    }
    const total = milk * rate;

    const entry = {
        id: editMode ? editId : Date.now() + Math.random(),
        date: dateNative,
        dateDisplay: displayDate,
        shift: shift,
        shiftDisplay: shiftDisplay,
        farmer: farmer,
        animal: animal,
        milk: milk,
        rateType: rateType,
        fixedRate: fixedRate,
        fatPercent: fatPercent,
        fatRatePerFat: fatRatePerFat,
        rate: rate,
        total: total
    };

    if (editMode) {
        // Edit Mode: ਪੁਰਾਣੀ ਐਂਟਰੀ ਨੂੰ ਉਸੇ ID 'ਤੇ ਅੱਪਡੇਟ ਕਰੋ
        sessionEntries = sessionEntries.map(e => e.id === editId ? entry : e);
        editMode = false;
        editId = null;
        document.getElementById('saveEntryBtn').innerHTML = '💾 ਐਂਟਰੀ ਸੇਵ ਕਰੋ (Enter)';
    } else {
        // New Entry Mode: ਨਵੀਂ ਐਂਟਰੀ ਜੋੜੋ
        sessionEntries.push(entry);
    }
    saveSession();

    // ਪਹਿਲਾਂ ਟੋਟਲ ਅੱਪਡੇਟ ਕਰੋ, ਫਿਰ ਟੇਬਲ ਰੈਂਡਰ ਕਰੋ
    updateRunningTotals();
    renderEntries();

    // Clear milk field and auto-move shift
    document.getElementById('milkLiter').value = '';
    autoMoveShiftAfterSave(shift);
    calculateTotal();
    document.getElementById('milkLiter').focus();
}

// ==================== CLEAR FORM ====================
function clearForm() {
    document.getElementById('milkLiter').value = '';
    calculateTotal();
    document.getElementById('milkLiter').focus();
}

// ==================== EDIT ENTRY ====================
function editEntry(id) {
    const entry = sessionEntries.find(e => e.id === id);
    if (!entry) return;

    editMode = true;
    editId = id;

    document.getElementById('entryDate').value = entry.date;
    document.querySelector(`input[name="animalType"][value="${entry.animal}"]`).checked = true;
    document.querySelector(`input[name="shiftChoice"][value="${entry.shift}"]`).checked = true;
    updateShiftDisplay();
    const settings = loadSettings();
    document.getElementById('farmerName').value = settings.defaultFarmerName || entry.farmer;
    document.getElementById('milkLiter').value = entry.milk;
    document.querySelector(`input[name="rateType"][value="${entry.rateType}"]`).checked = true;
    if (entry.rateType === 'fat') {
        document.getElementById('fatPercent').value = entry.fatPercent;
    }
    calculateTotal();
    toggleRateType();

    document.getElementById('saveEntryBtn').innerHTML = '✏️ ਅੱਪਡੇਟ ਕਰੋ (Enter)';
    document.getElementById('milkLiter').focus();
}

// ==================== RENDER ENTRIES TABLE (FIXED: animal type display) ====================
function renderEntries() {
    const tbody = document.getElementById('entriesBody');
    if (sessionEntries.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">ਕੋਈ ਐਂਟਰੀ ਨਹੀਂ</td></tr>';
        return;
    }
    tbody.innerHTML = '';
    sessionEntries.forEach(entry => {
        // Ensure animal type is displayed correctly
        const animalText = entry.animal === 'buffalo' ? 'ਮੱਝ' : 'ਗਾਂ';
        // Extract day and month from entry.date (YYYY-MM-DD)
        const dateParts = entry.date.split('-');
        const displayDateOnly = `${dateParts[2]}/${dateParts[1]}`;  // DD/MM

        const row = `
            <tr>
                <td>${displayDateOnly}</td>
                <td>${entry.shift === 'morning' ? 'ਸਵੇਰ' : 'ਸ਼ਾਮ'}</td>
                <td>${entry.milk.toFixed(2)}</td>
                <td>${entry.rate.toFixed(2)}</td>
                <td>${entry.total.toFixed(2)}</td>
                <td><button class="btn btn-sm edit-btn" data-id="${entry.id}">✏️</button></td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseFloat(btn.getAttribute('data-id'));
            editEntry(id);
        });
    });
}

// ==================== UPDATE RUNNING TOTALS ====================
function updateRunningTotals() {
    const totals = sessionEntries.reduce((acc, e) => {
        acc.milk += e.milk;
        acc.income += e.total;
        return acc;
    }, { milk: 0, income: 0 });
    document.getElementById('totalMilk').innerText = totals.milk.toFixed(2) + ' L';
    document.getElementById('totalIncome').innerText = '₹' + totals.income.toFixed(2);
}

// ==================== EVENT LISTENERS ====================
function setupEventListeners() {
    document.getElementById('farmerName').addEventListener('input', function (e) {
        document.getElementById('farmerMarquee').innerText = e.target.value.trim() || 'ਕਿਸਾਨ ਦਾ ਨਾਮ';
    });

    document.querySelectorAll('input[name="rateType"]').forEach(r => r.addEventListener('change', toggleRateType));
    document.querySelectorAll('input[name="animalType"]').forEach(r => r.addEventListener('change', calculateTotal));

    const milkLiter = document.getElementById('milkLiter');
    milkLiter.addEventListener('input', calculateTotal);
    document.getElementById('fatPercent').addEventListener('input', calculateTotal);

    milkLiter.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            saveEntry();
        }
    });

    document.getElementById('saveEntryBtn').addEventListener('click', saveEntry);
    document.getElementById('clearFormBtn').addEventListener('click', clearForm);

    document.getElementById('settingsBtn').addEventListener('click', openSettingsModal);
    document.getElementById('settingsForm').addEventListener('submit', handleSettingsSubmit);

    document.querySelectorAll('input[name="shiftChoice"]').forEach(r => r.addEventListener('change', updateShiftDisplay));

    const pdfRange = document.getElementById('pdfDateRange');
    if (pdfRange) {
        pdfRange.addEventListener('change', function () {
            const customDiv = document.getElementById('customDateRange');
            if (customDiv) customDiv.style.display = this.value === 'custom' ? 'flex' : 'none';
        });
    }
}

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', function () {
    sessionStorage.removeItem('kachaEntries');
    setCurrentDate();
    updateMainFormFromSettings();
    setupEventListeners();
    renderEntries();
    updateRunningTotals();
    updateShiftDisplay();
    toggleRateType();
    calculateTotal();
});

// Expose functions for modals
window.copyEmail = function () {
    const email = 'kjaspal483@gmail.com';
    navigator.clipboard.writeText(email).then(() => alert('ਈਮੇਲ ਕਾਪੀ ਹੋ ਗਈ!'))
        .catch(() => alert('ਕਾਪੀ ਕਰਨ ਵਿੱਚ ਸਮੱਸਿਆ'));
};
window.closeModal = function () {
    document.getElementById('contactModal').style.display = 'none';
};
window.onclick = function (event) {
    const modal = document.getElementById('contactModal');
    if (event.target === modal) modal.style.display = 'none';
    const settingsModal = document.getElementById('settingsModal');
    if (event.target === settingsModal) closeSettingsModal();
};

