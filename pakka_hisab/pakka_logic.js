// pakka_logic.js - FINAL 100% BUG-FREE & PRODUCTION READY
// Developed by Arshdeep Singh

// ==================== GLOBAL VARIABLES ====================
let entries = [];

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
    const dateInput = document.getElementById('entryDate');
    if (!dateInput) return;

    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    
    dateInput.value = `${y}-${m}-${d}`;
    dateInput.disabled = true;
}

// ==================== UPDATE SUMMARY ====================
function updateSummary() {
    const dateInput = document.getElementById('entryDate');
    if (!dateInput) return;

    const selectedDate = dateInput.value;
    const todayEntries = entries.filter(e => e.date === selectedDate);

    let totalMilk = 0, totalIncome = 0;
    todayEntries.forEach(e => {
        totalMilk += e.milk;
        totalIncome += e.total;
    });

    const milkEl = document.getElementById('totalMilkToday');
    const incomeEl = document.getElementById('totalIncomeToday');
    if (milkEl) milkEl.innerText = totalMilk.toFixed(2) + ' L';
    if (incomeEl) incomeEl.innerText = '₹' + totalIncome.toFixed(2);
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

    const prevTotalEl = document.getElementById('prevDayTotal');
    if (prevTotalEl) prevTotalEl.innerText = `ਪਿਛਲੇ ਦਿਨ ਦਾ ਕੁੱਲ: ₹${total.toFixed(2)}`;
}

// ==================== AUTO SHIFT DISPLAY ====================
function updateShiftDisplay() {
    const selectedShift = document.querySelector('input[name="shiftChoice"]:checked');
    const shiftDisplayEl = document.getElementById('shiftDisplay');
    
    if (!shiftDisplayEl) return;

    if (!selectedShift) {
        const morning = document.querySelector('input[name="shiftChoice"][value="morning"]');
        if (morning) morning.checked = true;
        shiftDisplayEl.value = 'ਸਵੇਰ (Morning)';
        return;
    }
    const shift = selectedShift.value;
    shiftDisplayEl.value = shift === 'morning' ? 'ਸਵੇਰ (Morning)' : 'ਸ਼ਾਮ (Evening)';
}

// ==================== RATE TYPE TOGGLE ====================
function toggleRateType() {
    const rateTypeEl = document.querySelector('input[name="rateType"]:checked');
    const animalEl = document.querySelector('input[name="animalType"]:checked');
    if (!rateTypeEl || !animalEl) return;

    const isFixed = rateTypeEl.value === 'fixed';
    const animal = animalEl.value;

    const fixedRow = document.getElementById('fixedRateRow');
    const fatRow = document.getElementById('fatRateRow');
    const snfRow = document.getElementById('snfRateRow');
    const snfInput = document.getElementById('snfPercent');

    if (fixedRow) fixedRow.style.display = isFixed ? 'flex' : 'none';
    if (fatRow) fatRow.style.display = isFixed ? 'none' : 'flex';

    if (snfRow) {
        const showSnf = (!isFixed && animal === 'cow');
        snfRow.style.display = showSnf ? 'flex' : 'none';
        if (!showSnf && snfInput) snfInput.value = '';
    }
    calculateTotal();
}

// ==================== CALCULATE TOTAL ====================
function calculateTotal() {
    const milkLiterEl = document.getElementById('milkLiter');
    const rateTypeEl = document.querySelector('input[name="rateType"]:checked');
    const animalEl = document.querySelector('input[name="animalType"]:checked');
    const totalAmountEl = document.getElementById('totalAmount');

    if (!milkLiterEl || !rateTypeEl || !animalEl || !totalAmountEl) {
        if (totalAmountEl) totalAmountEl.value = '0.00';
        return;
    }

    const milk = parseFloat(milkLiterEl.value) || 0;
    const rateType = rateTypeEl.value;
    const animal = animalEl.value;

    const rates = (typeof window.getCurrentRates === 'function')
        ? window.getCurrentRates()
        : { fixedRate: 0, fatRatePerFat: 0, cowSnfRate: 0 };

    const fixedRate = rates.fixedRate || 0;
    const fatRatePerFat = rates.fatRatePerFat || 0;
    const cowSnfRate = rates.cowSnfRate || 0;

    const fixedDisp = document.getElementById('fixedRate');
    const fatDisp = document.getElementById('fatRatePerFat');
    const snfDisp = document.getElementById('snfRatePerSnf');

    if (fixedDisp) fixedDisp.value = fixedRate.toFixed(2);
    if (fatDisp) fatDisp.value = fatRatePerFat.toFixed(2);
    if (snfDisp) snfDisp.value = (cowSnfRate || 0).toFixed(2);

    let rate = 0;
    if (rateType === 'fixed') {
        rate = fixedRate;
    } else {
        const fat = parseFloat(document.getElementById('fatPercent')?.value) || 0;
        let snf = 0;
        if (animal === 'cow') {
            snf = parseFloat(document.getElementById('snfPercent')?.value) || 0;
        }
        rate = (fat * fatRatePerFat) + (snf * cowSnfRate);
    }
    totalAmountEl.value = (milk * rate).toFixed(2);
}

// ==================== SAVE ENTRY ====================
function saveEntry() {
    const farmerEl = document.getElementById('farmerName');
    const milkLiterEl = document.getElementById('milkLiter');
    const dateEl = document.getElementById('entryDate');
    const animalEl = document.querySelector('input[name="animalType"]:checked');
    const rateTypeEl = document.querySelector('input[name="rateType"]:checked');
    const shiftRadioEl = document.querySelector('input[name="shiftChoice"]:checked');

    if (!farmerEl || !milkLiterEl || !dateEl || !animalEl || !rateTypeEl) {
        alert('ਜ਼ਰੂਰੀ ਫੀਲਡ ਨਹੀਂ ਮਿਲੇ। ਕਿਰਪਾ ਕਰਕੇ ਪੇਜ ਰਿਫ੍ਰੈਸ਼ ਕਰੋ।');
        return;
    }

    const farmer = farmerEl.value.trim();
    const milk = parseFloat(milkLiterEl.value);
    const date = dateEl.value;
    const animal = animalEl.value;
    const rateType = rateTypeEl.value;
    const shift = shiftRadioEl ? shiftRadioEl.value : (new Date().getHours() < 12 ? 'morning' : 'evening');
    
    // ✅ FIX: Shift Display ਹੁਣ DOM ਤੋਂ ਨਹੀਂ, ਸਗੋਂ shift variable ਤੋਂ ਸਿੱਧਾ ਲਿਆ ਗਿਆ ਹੈ
    const shiftDisplay = shift === 'morning' ? 'ਸਵੇਰ (Morning)' : 'ਸ਼ਾਮ (Evening)';

    if (!farmer) {
        alert('ਕਿਰਪਾ ਕਰਕੇ ਕਿਸਾਨ ਦਾ ਨਾਮ ਭਰੋ।');
        return;
    }
    if (isNaN(milk) || milk <= 0) {
        alert('ਕਿਰਪਾ ਕਰਕੇ ਦੁੱਧ ਦੀ ਸਹੀ ਮਾਤਰਾ ਭਰੋ (0 ਤੋਂ ਵੱਧ)।');
        return;
    }
    if (!date) {
        alert('ਤਾਰੀਖ਼ ਗਲਤ ਹੈ।');
        return;
    }

    const rates = (typeof window.getCurrentRates === 'function')
        ? window.getCurrentRates()
        : { fixedRate: 0, fatRatePerFat: 0, cowSnfRate: 0 };

    const fixedRate = rates.fixedRate || 0;
    const fatRatePerFat = rates.fatRatePerFat || 0;
    const cowSnfRate = rates.cowSnfRate || 0;

    let rate = 0;
    let fatPercent = 0;
    let snfPercent = 0;

    const fatInputEl = document.getElementById('fatPercent');
    const snfInputEl = document.getElementById('snfPercent');
    
    fatPercent = parseFloat(fatInputEl?.value) || 0;
    if (animal === 'cow') {
        snfPercent = parseFloat(snfInputEl?.value) || 0;
    }

    if (rateType === 'fat') {
        if (!fatPercent || fatPercent <= 0) {
            alert('ਫੈਟ % 0 ਨਹੀਂ ਹੋ ਸਕਦਾ। ਕਿਰਪਾ ਕਰਕੇ ਫੈਟ % ਭਰੋ।');
            return;
        }
        if (animal === 'cow' && snfPercent <= 0) {
            alert('ਗਾਂ ਲਈ SNF % ਵੀ ਜ਼ਰੂਰੀ ਹੈ।');
            return;
        }
    }

    if (rateType === 'fixed') {
        rate = fixedRate;
    } else {
        rate = (fatPercent * fatRatePerFat) + (snfPercent * cowSnfRate);
    }

    const total = milk * rate;

    const entry = {
        id: Date.now() + Math.random(),
        date: date,
        shift: shift,
        shiftDisplay: shiftDisplay,
        farmer: farmer,
        animal: animal,
        milk: milk,
        fatPercent: fatPercent,
        snfPercent: snfPercent,
        rate: rate,
        total: total,
        expense: 0,
        net: total
    };

    entries.push(entry);
    saveEntries();
    updateSummary();
    updatePrevDayTotal();

    if (milkLiterEl) milkLiterEl.value = '';
    if (fatInputEl) fatInputEl.value = '';
    if (snfInputEl) snfInputEl.value = '';

    // (Optional) Auto Shift
    // autoMoveShiftAfterSave(shift);

    calculateTotal();
    if (milkLiterEl) milkLiterEl.focus();
}

// ==================== CLEAR FORM ====================
function clearForm() {
    const milkEl = document.getElementById('milkLiter');
    const fatEl = document.getElementById('fatPercent');
    const snfEl = document.getElementById('snfPercent');

    if (milkEl) milkEl.value = '';
    if (fatEl) fatEl.value = '';
    if (snfEl) snfEl.value = '';

    calculateTotal();
    if (milkEl) milkEl.focus();
}

// ==================== EVENT LISTENERS ====================
function setupEventListeners() {
    const fNameInput = document.getElementById('farmerName');
    if (fNameInput) {
        fNameInput.addEventListener('input', function (e) {
            const name = e.target.value.trim();
            const marquee = document.getElementById('farmerMarquee');
            if (marquee) marquee.innerText = name || 'ਕਿਸਾਨ ਦਾ ਨਾਮ';
        });
    }

    document.querySelectorAll('input[name="rateType"]').forEach(r => r.addEventListener('change', toggleRateType));

    const milkLiter = document.getElementById('milkLiter');
    const fatPercentEl = document.getElementById('fatPercent');
    const fixedRateEl = document.getElementById('fixedRate');
    const snfInput = document.getElementById('snfPercent');
    
    // Milk Input Listener
    if (milkLiter) {
        milkLiter.addEventListener('input', calculateTotal);
        milkLiter.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                saveEntry();
            }
        });
    }
    if (fatPercentEl) fatPercentEl.addEventListener('input', calculateTotal);
    if (fixedRateEl) fixedRateEl.addEventListener('input', calculateTotal);

    // ✅ FIX: Fat ਅਤੇ SNF ਇਨਪੁਟਸ 'ਤੇ ਵੀ Enter ਦਬਾਉਣ 'ਤੇ Save ਚੱਲੇ
    if (fatPercentEl) {
        fatPercentEl.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                saveEntry();
            }
        });
    }
    if (snfInput) {
        snfInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                saveEntry();
            }
        });
    }

    const saveBtn = document.getElementById('saveEntryBtn');
    const clearBtn = document.getElementById('clearFormBtn');
    if (saveBtn) saveBtn.addEventListener('click', saveEntry);
    if (clearBtn) clearBtn.addEventListener('click', clearForm);

    const pdfRange = document.getElementById('pdfDateRange');
    if (pdfRange) {
        pdfRange.addEventListener('change', function () {
            const customRange = document.getElementById('customDateRange');
            if (customRange) customRange.style.display = this.value === 'custom' ? 'flex' : 'none';
        });
    }

    if (snfInput) snfInput.addEventListener('input', calculateTotal);

    document.querySelectorAll('input[name="shiftChoice"]').forEach(r => r.addEventListener('change', updateShiftDisplay));

    document.querySelectorAll('input[name="animalType"]').forEach(r => r.addEventListener('change', function () {
        toggleRateType();
    }));
}

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', function () {
    loadEntries();
    setCurrentDate();
    updateShiftDisplay();
    setupEventListeners();
    updateSummary();
    updatePrevDayTotal();

    if (typeof updateMainFormFromSettings === 'function') {
        updateMainFormFromSettings();
    }
    calculateTotal();
    toggleRateType();
});
