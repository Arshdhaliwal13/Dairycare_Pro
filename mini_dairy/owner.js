// owner.js - FINAL BUG-FREE (with 3 fixes applied)
// Developed by Arshdeep Singh

let entries = [];

function loadEntries() {
    const stored = localStorage.getItem('ownerEntries');
    if (stored) {
        try { entries = JSON.parse(stored); } catch (e) { entries = []; }
    }
}
function saveEntries() { localStorage.setItem('ownerEntries', JSON.stringify(entries)); }

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

function updateSummary() {
    const dateInput = document.getElementById('entryDate');
    if (!dateInput) return;
    const selectedDate = dateInput.value;
    const todayEntries = entries.filter(e => e.date === selectedDate);
    let totalMilk = 0, totalIncome = 0;
    todayEntries.forEach(e => { totalMilk += e.milk; totalIncome += e.total; });
    const milkEl = document.getElementById('totalMilkToday');
    const incomeEl = document.getElementById('totalIncomeToday');
    if (milkEl) milkEl.innerText = totalMilk.toFixed(2) + ' L';
    if (incomeEl) incomeEl.innerText = '₹' + totalIncome.toFixed(2);
}

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

// ========== FIX 1: toggleRateType now calls updateMainFormFromSettings if available ==========
function toggleRateType() {
    const rateTypeEl = document.querySelector('input[name="rateType"]:checked');
    const animalEl = document.querySelector('input[name="animalType"]:checked');
    if (!rateTypeEl || !animalEl) return;

    // ✅ When animal changes, re-fetch farmer rates from settings (if function exists)
    if (typeof window.updateMainFormFromSettings === 'function') {
        window.updateMainFormFromSettings();
    }

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
    const rates = (typeof window.getCurrentRates === 'function') ? window.getCurrentRates() : { fixedRate: 0, fatRatePerFat: 0, cowSnfRate: 0 };
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

// ========== FIX 3: saveEntry now keeps farmer name and marquee as is (no reset) ==========
// But we added a separate clearForm that will reset everything including farmer name.
function saveEntry() {
    const farmerEl = document.getElementById('farmerName');
    const milkLiterEl = document.getElementById('milkLiter');
    const dateEl = document.getElementById('entryDate');
    const animalEl = document.querySelector('input[name="animalType"]:checked');
    const rateTypeEl = document.querySelector('input[name="rateType"]:checked');
    const shiftRadioEl = document.querySelector('input[name="shiftChoice"]:checked');
    if (!farmerEl || !milkLiterEl || !dateEl || !animalEl || !rateTypeEl) {
        alert('ਜ਼ਰੂਰੀ ਫੀਲਡ ਨਹੀਂ ਮਿਲੇ। ਪੇਜ ਰਿਫ੍ਰੈਸ਼ ਕਰੋ।');
        return;
    }
    const farmer = farmerEl.value.trim();
    const farmerSelect = document.getElementById('farmerSelect');
    const farmerId = farmerSelect ? farmerSelect.value : null;
    const milk = parseFloat(milkLiterEl.value);
    const date = dateEl.value;
    const animal = animalEl.value;
    const rateType = rateTypeEl.value;
    // Shift: if radio is checked, use its value, else fallback to time-based
    const shift = shiftRadioEl ? shiftRadioEl.value : (new Date().getHours() < 12 ? 'morning' : 'evening');
    const shiftDisplay = shift === 'morning' ? 'ਸਵੇਰ (Morning)' : 'ਸ਼ਾਮ (Evening)';
    if (!farmer) { alert('ਕਿਸਾਨ ਦਾ ਨਾਮ ਭਰੋ।'); return; }
    if (isNaN(milk) || milk <= 0) { alert('ਸਹੀ ਲੀਟਰ ਭਰੋ (0 ਤੋਂ ਵੱਧ)।'); return; }
    if (!date) { alert('ਤਾਰੀਖ਼ ਗਲਤ ਹੈ।'); return; }
    const rates = (typeof window.getCurrentRates === 'function') ? window.getCurrentRates() : { fixedRate: 0, fatRatePerFat: 0, cowSnfRate: 0 };
    const fixedRate = rates.fixedRate || 0;
    const fatRatePerFat = rates.fatRatePerFat || 0;
    const cowSnfRate = rates.cowSnfRate || 0;
    let rate = 0, fatPercent = 0, snfPercent = 0;
    const fatInputEl = document.getElementById('fatPercent');
    const snfInputEl = document.getElementById('snfPercent');
    fatPercent = parseFloat(fatInputEl?.value) || 0;
    if (animal === 'cow') snfPercent = parseFloat(snfInputEl?.value) || 0;
    if (rateType === 'fat') {
        if (!fatPercent || fatPercent <= 0) { alert('ਫੈਟ % 0 ਨਹੀਂ ਹੋ ਸਕਦਾ।'); return; }
        if (animal === 'cow' && snfPercent <= 0) { alert('ਗਾਂ ਲਈ SNF % ਜ਼ਰੂਰੀ ਹੈ।'); return; }
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
        farmerId: farmerId,
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
    // Clear only milk, fat, snf — farmer name stays for next entry
    if (milkLiterEl) milkLiterEl.value = '';
    if (fatInputEl) fatInputEl.value = '';
    if (snfInputEl) snfInputEl.value = '';
    calculateTotal();
    if (milkLiterEl) milkLiterEl.focus();
}

// ========== FIX 3 (continued): clearForm now resets farmer name and marquee too ==========
function clearForm() {
    const milkEl = document.getElementById('milkLiter');
    const fatEl = document.getElementById('fatPercent');
    const snfEl = document.getElementById('snfPercent');
    const farmerEl = document.getElementById('farmerName');
    const marquee = document.getElementById('farmerMarquee');
    const select = document.getElementById('farmerSelect');

    if (milkEl) milkEl.value = '';
    if (fatEl) fatEl.value = '';
    if (snfEl) snfEl.value = '';
    if (farmerEl) {
        farmerEl.value = '';
        if (marquee) marquee.innerText = 'ਕਿਸਾਨ ਦਾ ਨਾਮ';
    }
    if (select) select.value = '';
    // Also reset selected farmer ID to null
    window._selectedFarmerId = null;

    calculateTotal();
    if (milkEl) milkEl.focus();
}

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
    if (milkLiter) {
        milkLiter.addEventListener('input', calculateTotal);
        milkLiter.addEventListener('keypress', function (e) { if (e.key === 'Enter') { e.preventDefault(); saveEntry(); } });
    }
    if (fatPercentEl) fatPercentEl.addEventListener('input', calculateTotal);
    if (fixedRateEl) fixedRateEl.addEventListener('input', calculateTotal);
    if (fatPercentEl) {
        fatPercentEl.addEventListener('keypress', function (e) { if (e.key === 'Enter') { e.preventDefault(); saveEntry(); } });
    }
    if (snfInput) {
        snfInput.addEventListener('keypress', function (e) { if (e.key === 'Enter') { e.preventDefault(); saveEntry(); } });
        snfInput.addEventListener('input', calculateTotal);
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
    document.querySelectorAll('input[name="shiftChoice"]').forEach(r => r.addEventListener('change', updateShiftDisplay));
    document.querySelectorAll('input[name="animalType"]').forEach(r => r.addEventListener('change', toggleRateType));
}

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