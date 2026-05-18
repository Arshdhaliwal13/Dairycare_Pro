// reports.js - Only Pakka Hisab, no expense, no kacha entries
// Developed by Arshdeep Singh

// ==================== GLOBAL VARIABLES ====================
let pakkaEntries = [];
let combinedEntries = [];
let charts = {};

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', function () {
    // Set default date range (last 30 days)
    const today = new Date();
    const endDate = today.toISOString().split('T')[0];
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 30);
    const startDateStr = startDate.toISOString().split('T')[0];

    document.getElementById('generateReportsPdfBtn').addEventListener('click', generateReportsPDF);
    document.getElementById('startDate').value = startDateStr;
    document.getElementById('endDate').value = endDate;

    // Load data
    loadData();

    // Populate month and year selectors
    populateMonthYearSelectors();

    // Apply filters
    applyFilters();

    // Setup event listeners
    setupEventListeners();
});

// ==================== LOAD DATA (ONLY PAKKA) ====================
function loadData() {
    const pakkaStored = localStorage.getItem('pakkaEntries');
    if (pakkaStored) {
        try {
            pakkaEntries = JSON.parse(pakkaStored);
        } catch (e) {
            pakkaEntries = [];
        }
    }
    // No kacha entries
    combinedEntries = pakkaEntries.map(e => ({ ...e, accountType: 'pakka' }));
    combinedEntries.sort((a, b) => b.date.localeCompare(a.date));
}

// ==================== EVENT LISTENERS ====================
function setupEventListeners() {
    document.getElementById('applyFiltersBtn').addEventListener('click', applyFilters);
    document.getElementById('resetFiltersBtn').addEventListener('click', resetFilters);
    document.getElementById('monthSelector').addEventListener('change', () => {
        const filtered = getFilteredEntries();
        updateMonthlyReport(filtered);
    });
    document.getElementById('yearSelector').addEventListener('change', () => {
        const filtered = getFilteredEntries();
        updateYearlyReport(filtered);
    });
    // ✅ Table toggle button (add this)
    const toggleBtn = document.getElementById('toggleEntriesBtn');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            const container = document.querySelector('.entries-card .table-responsive');
            if (container) {
                container.classList.toggle('show');
                toggleBtn.innerText = container.classList.contains('show') ? '🔼 ਲੁਕਾਓ' : '🔽 ਦਿਖਾਓ';
            }
        });
    }
}

// ==================== FILTERS ====================
function getFilteredEntries() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const filterBuffalo = document.getElementById('filterBuffalo').checked;
    const filterCow = document.getElementById('filterCow').checked;
    // Only pakka, ignore kacha filters
    return combinedEntries.filter(entry => {
        if (startDate && entry.date < startDate) return false;
        if (endDate && entry.date > endDate) return false;
        if (entry.animal === 'buffalo' && !filterBuffalo) return false;
        if (entry.animal === 'cow' && !filterCow) return false;
        return true;
    });
}

function applyFilters() {
    const filtered = getFilteredEntries();
    updateSummaryCards(filtered);
    renderEntriesTable(filtered);
    updateCharts(filtered);
    updateDetailedReports(filtered);
    updateAnalytics(filtered);
}

function resetFilters() {
    const today = new Date();
    const endDate = today.toISOString().split('T')[0];
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 30);
    document.getElementById('startDate').value = startDate.toISOString().split('T')[0];
    document.getElementById('endDate').value = endDate;
    document.getElementById('filterBuffalo').checked = true;
    document.getElementById('filterCow').checked = true;
    applyFilters();
}

// ==================== SUMMARY CARDS (no expense) ====================
function updateSummaryCards(entries) {
    const today = new Date().toISOString().split('T')[0];
    const todayEntries = entries.filter(e => e.date === today);
    let totalMilk = 0, totalIncome = 0;
    todayEntries.forEach(e => {
        totalMilk += e.milk || 0;
        totalIncome += e.total || 0;
    });
    document.getElementById('todayMilk').innerText = totalMilk.toFixed(2) + ' L';
    document.getElementById('todayIncome').innerText = '₹' + totalIncome.toFixed(2);
}

// ==================== ENTRIES TABLE (no expense column) ====================
function renderEntriesTable(entries) {
    const tbody = document.getElementById('entriesBody');
    if (entries.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">ਕੋਈ ਐਂਟਰੀ ਨਹੀਂ</td></tr>';
        return;
    }
    let html = '';
    entries.slice(0, 50).forEach(entry => {
        // ਤਾਰੀਖ਼ ਨੂੰ DD/MM/YYYY ਵਿੱਚ ਬਦਲੋ
        const displayDate = entry.date.split('-').reverse().join('/');
        // ਸ਼ਿਫਟ ਨੂੰ ਪੰਜਾਬੀ ਵਿੱਚ ਬਦਲੋ
        const shiftText = entry.shiftDisplay || (entry.shift === 'morning' ? 'ਸਵੇਰ' : 'ਸ਼ਾਮ');

        html += `<tr>
        <td>${displayDate}</td>
        <td>${entry.animal === 'buffalo' ? 'ਮੱਝ' : 'ਗਾਂ'}</td>
        <td>${entry.milk ? entry.milk.toFixed(2) : '0'} L</td>
        <td>₹${entry.rate ? entry.rate.toFixed(2) : '0'}</td>
        <td>₹${entry.total ? entry.total.toFixed(2) : '0'}</td>
    </tr>`;
    });
    tbody.innerHTML = html;
}

// ==================== CHARTS ====================
function updateCharts(entries) {
    Object.values(charts).forEach(chart => { if (chart) chart.destroy(); });

    // 1. Daily milk chart
    const dailyData = {};
    entries.forEach(e => { dailyData[e.date] = (dailyData[e.date] || 0) + (e.milk || 0); });
    const sortedDates = Object.keys(dailyData).sort();
    const dailyMilkValues = sortedDates.map(d => dailyData[d]);
    const ctxDaily = document.getElementById('dailyMilkChart').getContext('2d');
    charts.dailyMilk = new Chart(ctxDaily, {
        type: 'line',
        data: { labels: sortedDates, datasets: [{ label: 'ਦੁੱਧ (L)', data: dailyMilkValues, borderColor: '#2d6a4f', backgroundColor: 'rgba(45,106,79,0.1)', fill: true }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });

    // 2. Buffalo vs Cow milk
    let buffaloMilk = 0, cowMilk = 0;
    entries.forEach(e => {
        if (e.animal === 'buffalo') buffaloMilk += e.milk || 0;
        else if (e.animal === 'cow') cowMilk += e.milk || 0;
    });
    const ctxAnimal = document.getElementById('animalCompareChart').getContext('2d');
    charts.animalCompare = new Chart(ctxAnimal, {
        type: 'bar',
        data: { labels: ['ਮੱਝ', 'ਗਾਂ'], datasets: [{ label: 'ਦੁੱਧ (L)', data: [buffaloMilk, cowMilk], backgroundColor: ['#2d6a4f', '#ffb703'] }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });

    // 4. Monthly trend
    const monthlyData = {};
    entries.forEach(e => {
        const month = e.date.substring(0, 7);
        monthlyData[month] = (monthlyData[month] || 0) + (e.milk || 0);
    });
    const sortedMonths = Object.keys(monthlyData).sort().slice(-6);
    const monthlyMilkValues = sortedMonths.map(m => monthlyData[m]);
    const ctxMonthly = document.getElementById('monthlyTrendChart').getContext('2d');
    charts.monthlyTrend = new Chart(ctxMonthly, {
        type: 'line',
        data: { labels: sortedMonths, datasets: [{ label: 'ਦੁੱਧ (L)', data: monthlyMilkValues, borderColor: '#ffb703', backgroundColor: 'rgba(255,183,3,0.1)', fill: true }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });
}

// ==================== DETAILED REPORTS ====================
function updateDetailedReports(entries) {
    let totalMilk = 0, totalIncome = 0;
    entries.forEach(e => {
        totalMilk += e.milk || 0;
        totalIncome += e.total || 0;
    });
    document.getElementById('farmerTotalMilk').innerText = totalMilk.toFixed(2) + ' L';
    document.getElementById('farmerTotalIncome').innerText = '₹' + totalIncome.toFixed(2);

    updateMonthlyReport(entries);
    updateYearlyReport(entries);
}

function populateMonthYearSelectors() {
    const months = [];
    const years = new Set();
    combinedEntries.forEach(e => {
        const [year, month] = e.date.split('-');
        const monthYear = `${year}-${month}`;
        if (!months.includes(monthYear)) months.push(monthYear);
        years.add(year);
    });
    months.sort().reverse();
    const monthSelect = document.getElementById('monthSelector');
    monthSelect.innerHTML = months.map(m => {
        const [y, mo] = m.split('-');
        const monthName = new Date(y, mo - 1, 1).toLocaleString('pa', { month: 'long' });
        return `<option value="${m}">${monthName} ${y}</option>`;
    }).join('');

    const yearSelect = document.getElementById('yearSelector');
    yearSelect.innerHTML = Array.from(years).sort().reverse().map(y => `<option value="${y}">${y}</option>`).join('');
}

function updateMonthlyReport(filteredEntries) {
    const selectedMonth = document.getElementById('monthSelector').value;
    if (!selectedMonth) return;
    // Use filteredEntries that were passed, then filter by month
    const entries = filteredEntries.filter(e => e.date.startsWith(selectedMonth));
    let milk = 0, income = 0;
    entries.forEach(e => {
        milk += e.milk || 0;
        income += e.total || 0;
    });
    document.getElementById('monthlyMilk').innerText = milk.toFixed(2) + ' L';
    document.getElementById('monthlyIncome').innerText = '₹' + income.toFixed(2);
}
function updateYearlyReport(filteredEntries) {
    const selectedYear = document.getElementById('yearSelector').value;
    if (!selectedYear) return;
    // Use filteredEntries that were passed, then filter by year
    const entries = filteredEntries.filter(e => e.date.startsWith(selectedYear));
    let milk = 0, income = 0;
    entries.forEach(e => {
        milk += e.milk || 0;
        income += e.total || 0;
    });
    document.getElementById('yearlyMilk').innerText = milk.toFixed(2) + ' L';
    document.getElementById('yearlyIncome').innerText = '₹' + income.toFixed(2);
}

// ==================== ANALYTICS ====================
function updateAnalytics(entries) {
    // Average milk per day
    const days = {};
    entries.forEach(e => { days[e.date] = (days[e.date] || 0) + (e.milk || 0); });
    const dayValues = Object.values(days);
    const avgMilk = dayValues.length ? dayValues.reduce((a, b) => a + b, 0) / dayValues.length : 0;
    document.getElementById('avgMilkPerDay').innerText = avgMilk.toFixed(2) + ' L';

    // Average fat %
    let totalFat = 0, fatCount = 0;
    entries.forEach(e => {
        if (e.fatPercent) {
            totalFat += parseFloat(e.fatPercent);
            fatCount++;
        }
    });
    const avgFat = fatCount ? totalFat / fatCount : 0;
    document.getElementById('avgFatPercent').innerText = avgFat.toFixed(2) + '%';

    // Max milk day
    let maxMilk = 0, maxDay = '-';
    for (let [date, milk] of Object.entries(days)) {
        if (milk > maxMilk) { maxMilk = milk; maxDay = date; }
    }
    document.getElementById('maxMilkDay').innerText = maxDay + ' (' + maxMilk.toFixed(2) + ' L)';

    // Min milk day
    let minMilk = Infinity, minDay = '-';
    for (let [date, milk] of Object.entries(days)) {
        if (milk < minMilk) { minMilk = milk; minDay = date; }
    }
    document.getElementById('minMilkDay').innerText = minDay + ' (' + (minMilk === Infinity ? 0 : minMilk.toFixed(2)) + ' L)';
}

