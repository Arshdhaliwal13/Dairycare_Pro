// reports.js - Full Reports Logic with Charts, Filters, and Analytics
// Developed by Arshdeep Singh

// ==================== Chart.js Registration (v4) ====================
// Ensure registerables are registered globally
if (typeof Chart !== 'undefined' && Chart.registerables) {
    Chart.register(...Chart.registerables);
}

// ==================== Global Variables ====================
let filteredData = [];
let dailyChart = null;
let animalChart = null;
let monthlyChart = null;
let entriesTableBody = null;

// ==================== Initialize ====================
document.addEventListener('DOMContentLoaded', function () {
    // Get DOM elements
    entriesTableBody = document.getElementById('entriesBody');

    // Populate year selector (dynamic)
    const yearSelect = document.getElementById('yearSelector');
    if (yearSelect) {
        const currentYear = new Date().getFullYear();
        for (let y = currentYear; y >= currentYear - 5; y--) {
            const opt = document.createElement('option');
            opt.value = y;
            opt.textContent = y;
            yearSelect.appendChild(opt);
        }
    }


    // Populate month selector (all months)
    const monthSelect = document.getElementById('monthSelector');
    if (monthSelect) {
        const months = ['ਜਨਵਰੀ', 'ਫਰਵਰੀ', 'ਮਾਰਚ', 'ਅਪ੍ਰੈਲ', 'ਮਈ', 'ਜੂਨ', 'ਜੁਲਾਈ', 'ਅਗਸਤ', 'ਸਤੰਬਰ', 'ਅਕਤੂਬਰ', 'ਨਵੰਬਰ', 'ਦਸੰਬਰ'];
        const currentMonth = new Date().getMonth();
        months.forEach((name, index) => {
            const opt = document.createElement('option');
            opt.value = index + 1;
            opt.textContent = name;
            if (index === currentMonth) opt.selected = true;
            monthSelect.appendChild(opt);
        });
    }

    // Set today's date as default filter
    const today = new Date();
    const startDate = document.getElementById('startDate');
    const endDate = document.getElementById('endDate');
    if (startDate && endDate) {
        startDate.value = today.toISOString().split('T')[0];
        endDate.value = today.toISOString().split('T')[0];
    }

    // Event listeners
    document.getElementById('applyFiltersBtn')?.addEventListener('click', applyFilters);
    document.getElementById('resetFiltersBtn')?.addEventListener('click', resetFilters);
    document.getElementById('toggleEntriesBtn')?.addEventListener('click', toggleEntries);
    document.getElementById('exportExcelBtn')?.addEventListener('click', exportToExcel);
    document.getElementById('monthSelector')?.addEventListener('change', updateDetailedReports);
    document.getElementById('yearSelector')?.addEventListener('change', updateDetailedReports);

    // Initial load
    applyFilters();
});

// ==================== Quick Date Shortcuts ====================
function setDateRange(type) {
    const start = document.getElementById('startDate');
    const end = document.getElementById('endDate');
    if (!start || !end) return;

    const now = new Date();
    let s = new Date(now);

    if (type === 'today') {
        // keep today
    } else if (type === 'week') {
        s.setDate(now.getDate() - now.getDay()); // start of week (Sunday)
    } else if (type === 'month') {
        s = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (type === 'last30') {
        s.setDate(now.getDate() - 30);
    }

    const format = (d) => d.toISOString().split('T')[0];
    start.value = format(s);
    end.value = format(now);

    document.getElementById('applyFiltersBtn')?.click();
}

// ==================== Filter Logic ====================
function applyFilters() {
    // Collect filter values
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const includeBuffalo = document.getElementById('filterBuffalo').checked;
    const includeCow = document.getElementById('filterCow').checked;
    const shiftFilter = document.querySelector('input[name="filterShift"]:checked')?.value || 'all';

    // Access global entries (assumes pakka_logic.js loads entries)
    let data = window.entries || [];

    // Filter by date
    if (startDate && endDate) {
        data = data.filter(e => e.date >= startDate && e.date <= endDate);
    }

    // Filter by animal type
    data = data.filter(e => {
        if (includeBuffalo && e.animal === 'buffalo') return true;
        if (includeCow && e.animal === 'cow') return true;
        return false;
    });

    // Filter by shift
    if (shiftFilter !== 'all') {
        data = data.filter(e => e.shift === shiftFilter);
    }

    filteredData = data;
    updateAllChartsAndReports();
}

function resetFilters() {
    document.getElementById('filterBuffalo').checked = true;
    document.getElementById('filterCow').checked = true;
    document.querySelector('input[name="filterShift"][value="all"]').checked = true;
    // Reset date to today
    const today = new Date();
    document.getElementById('startDate').value = today.toISOString().split('T')[0];
    document.getElementById('endDate').value = today.toISOString().split('T')[0];
    applyFilters();
}

// ==================== Update Everything ====================
function updateAllChartsAndReports() {
    updateSummaryCards();
    updateAnalytics();
    updateEntriesTable();
    updateDetailedReports();
    renderCharts();
}

// ==================== Update Summary Cards ====================
function updateSummaryCards() {
    const today = new Date().toISOString().split('T')[0];
    const todayEntries = filteredData.filter(e => e.date === today);
    let milk = 0, income = 0;
    todayEntries.forEach(e => {
        milk += e.milk || 0;
        income += e.total || 0;
    });
    document.getElementById('todayMilk').innerText = milk.toFixed(1) + ' L';
    document.getElementById('todayIncome').innerText = '₹' + income.toFixed(0);
}

// ==================== Update Analytics ====================
function updateAnalytics() {
    const data = filteredData;
    if (data.length === 0) {
        document.getElementById('avgMilkPerDay').innerText = '0 L';
        document.getElementById('avgFatPercent').innerText = '0%';
        document.getElementById('maxMilkDay').innerText = '-';
        document.getElementById('minMilkDay').innerText = '-';
        document.getElementById('avgRatePerLiter').innerText = '₹0.00';
        return;
    }

    // Average milk per day (based on distinct dates)
    const dates = [...new Set(data.map(e => e.date))];
    const totalMilk = data.reduce((acc, e) => acc + (e.milk || 0), 0);
    const avgMilk = totalMilk / dates.length;
    document.getElementById('avgMilkPerDay').innerText = avgMilk.toFixed(1) + ' L';

    // Average fat % (only entries with fatPercent)
    const fatEntries = data.filter(e => e.fatPercent && e.fatPercent > 0);
    const avgFat = fatEntries.reduce((acc, e) => acc + e.fatPercent, 0) / (fatEntries.length || 1);
    document.getElementById('avgFatPercent').innerText = avgFat.toFixed(1) + '%';

    // Max and Min milk day
    const dailyTotals = {};
    data.forEach(e => {
        dailyTotals[e.date] = (dailyTotals[e.date] || 0) + (e.milk || 0);
    });
    let maxDay = '', minDay = '';
    let maxVal = 0, minVal = Infinity;
    for (const [date, milk] of Object.entries(dailyTotals)) {
        if (milk > maxVal) { maxVal = milk; maxDay = date; }
        if (milk < minVal) { minVal = milk; minDay = date; }
    }
    document.getElementById('maxMilkDay').innerText = maxDay ? formatDate(maxDay) : '-';
    document.getElementById('minMilkDay').innerText = minDay ? formatDate(minDay) : '-';

    // Average Rate per Liter
    const totalIncome = data.reduce((acc, e) => acc + (e.total || 0), 0);
    const avgRate = totalMilk > 0 ? totalIncome / totalMilk : 0;
    document.getElementById('avgRatePerLiter').innerText = '₹' + avgRate.toFixed(2);
}

// ==================== Update Entries Table ====================
function updateEntriesTable() {
    if (!entriesTableBody) return;
    if (filteredData.length === 0) {
        entriesTableBody.innerHTML = '<tr><td colspan="6" class="text-center">ਕੋਈ ਐਂਟਰੀ ਨਹੀਂ</td></tr>';
        return;
    }
    let html = '';
    filteredData.slice().reverse().forEach(e => {
        const date = formatDate(e.date);
        const animal = e.animal === 'buffalo' ? 'ਮੱਝ' : 'ਗਾਂ';
        const shift = e.shift === 'morning' ? 'ਸਵੇਰ' : (e.shift === 'evening' ? 'ਸ਼ਾਮ' : '-');

        html += `<tr>
            <td>${date}</td>
            <td>${shift}</td>
            <td>${animal}</td>
            <td>${(e.milk || 0).toFixed(2)}</td>
            <td>${(e.rate || 0).toFixed(2)}</td>
            <td>${(e.total || 0).toFixed(2)}</td>
        </tr>`;
    });
    entriesTableBody.innerHTML = html;
}

// ==================== Update Detailed Reports ====================
function updateDetailedReports() {
    // Farmer Report: all-time totals
    const totalMilk = filteredData.reduce((acc, e) => acc + (e.milk || 0), 0);
    const totalIncome = filteredData.reduce((acc, e) => acc + (e.total || 0), 0);
    document.getElementById('farmerTotalMilk').innerText = totalMilk.toFixed(1) + ' L';
    document.getElementById('farmerTotalIncome').innerText = '₹' + totalIncome.toFixed(0);

    // Monthly Report
    const monthSelect = document.getElementById('monthSelector');
    const selectedMonth = parseInt(monthSelect?.value || 1);
    const selectedYear = parseInt(document.getElementById('yearSelector')?.value || new Date().getFullYear());
    const monthData = filteredData.filter(e => {
        const d = new Date(e.date);
        return d.getMonth() + 1 === selectedMonth && d.getFullYear() === selectedYear;
    });
    const monthMilk = monthData.reduce((acc, e) => acc + (e.milk || 0), 0);
    const monthIncome = monthData.reduce((acc, e) => acc + (e.total || 0), 0);
    document.getElementById('monthlyMilk').innerText = monthMilk.toFixed(1) + ' L';
    document.getElementById('monthlyIncome').innerText = '₹' + monthIncome.toFixed(0);

    // Yearly Report
    const yearData = filteredData.filter(e => {
        const d = new Date(e.date);
        return d.getFullYear() === selectedYear;
    });
    const yearMilk = yearData.reduce((acc, e) => acc + (e.milk || 0), 0);
    const yearIncome = yearData.reduce((acc, e) => acc + (e.total || 0), 0);
    document.getElementById('yearlyMilk').innerText = yearMilk.toFixed(1) + ' L';
    document.getElementById('yearlyIncome').innerText = '₹' + yearIncome.toFixed(0);

}

// ==================== Chart Rendering ====================
function renderCharts() {
    const data = filteredData;
    if (data.length === 0) {
        if (dailyChart) dailyChart.destroy();
        if (animalChart) animalChart.destroy();
        if (monthlyChart) monthlyChart.destroy();
        dailyChart = animalChart = monthlyChart = null;
        return;
    }

    // 1. Daily Milk Chart
    const dailyData = {};
    data.forEach(e => {
        dailyData[e.date] = (dailyData[e.date] || 0) + (e.milk || 0);
    });
    const dates = Object.keys(dailyData).sort();
    const milkValues = dates.map(d => dailyData[d]);

    const ctxDaily = document.getElementById('dailyMilkChart')?.getContext('2d');
    if (ctxDaily) {
        if (dailyChart) dailyChart.destroy();
        dailyChart = new Chart(ctxDaily, {
            type: 'bar',
            data: {
                labels: dates.map(d => formatDate(d)),
                datasets: [{
                    label: 'ਦੁੱਧ (L)',
                    data: milkValues,
                    backgroundColor: 'rgba(42, 157, 143, 0.6)',
                    borderColor: '#2a9d8f',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }

    // 2. Animal Comparison Chart
    const buffaloMilk = data.filter(e => e.animal === 'buffalo').reduce((acc, e) => acc + (e.milk || 0), 0);
    const cowMilk = data.filter(e => e.animal === 'cow').reduce((acc, e) => acc + (e.milk || 0), 0);
    const ctxAnimal = document.getElementById('animalCompareChart')?.getContext('2d');
    if (ctxAnimal) {
        if (animalChart) animalChart.destroy();
        animalChart = new Chart(ctxAnimal, {
            type: 'pie',
            data: {
                labels: ['ਮੱਝ', 'ਗਾਂ'],
                datasets: [{
                    data: [buffaloMilk, cowMilk],
                    backgroundColor: ['#ffb74d', '#4ecdc4']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }

    // 3. Monthly Trend Chart (last 12 months)
    const monthlyData = {};
    data.forEach(e => {
        const d = new Date(e.date);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        monthlyData[key] = (monthlyData[key] || 0) + (e.milk || 0);
    });
    const monthKeys = Object.keys(monthlyData).sort().slice(-12);
    const monthLabels = monthKeys.map(k => {
        const [y, m] = k.split('-');
        const months = ['ਜਨ', 'ਫਰ', 'ਮਾਰ', 'ਅਪ੍ਰੈ', 'ਮਈ', 'ਜੂਨ', 'ਜੁਲਾ', 'ਅਗ', 'ਸਤੰ', 'ਅਕਤੂ', 'ਨਵੰ', 'ਦਸੰ'];
        return months[parseInt(m) - 1] + ' ' + y.slice(-2);
    });
    const monthMilkValues = monthKeys.map(k => monthlyData[k]);

    const ctxMonthly = document.getElementById('monthlyTrendChart')?.getContext('2d');
    if (ctxMonthly) {
        if (monthlyChart) monthlyChart.destroy();
        monthlyChart = new Chart(ctxMonthly, {
            type: 'line',
            data: {
                labels: monthLabels,
                datasets: [{
                    label: 'ਦੁੱਧ (L)',
                    data: monthMilkValues,
                    borderColor: '#6c63ff',
                    backgroundColor: 'rgba(108, 99, 255, 0.1)',
                    fill: true,
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }
}

// ==================== Toggle Entries Table ====================
function toggleEntries() {
    const tableResp = document.querySelector('.entries-card .table-responsive');
    const btn = document.getElementById('toggleEntriesBtn');
    if (!tableResp || !btn) return;

    tableResp.classList.toggle('show');
    if (tableResp.classList.contains('show')) {
        btn.innerText = '🔼 ਛੁਪਾਓ';
    } else {
        btn.innerText = '🔽 ਦਿਖਾਓ';
    }
}

// ==================== Helper: Format Date ====================
function formatDate(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
}

// ==================== Excel / CSV Export ====================
function exportToExcel() {
    if (!filteredData || filteredData.length === 0) {
        alert('ਐਕਸਪੋਰਟ ਕਰਨ ਲਈ ਕੋਈ ਡਾਟਾ ਨਹੀਂ ਹੈ!');
        return;
    }

    let csvContent = "\uFEFF"; // UTF-8 BOM ਪੰਜਾਬੀ ਅੱਖਰਾਂ ਲਈ
    csvContent += "ਤਾਰੀਖ਼,ਸ਼ਿਫਟ,ਪਸ਼ੂ,ਦੁੱਧ (L),ਰੇਟ (₹),ਕੁੱਲ (₹)\n";

    filteredData.forEach(e => {
        const date = formatDate(e.date);
        const shift = e.shift === 'morning' ? 'ਸਵੇਰ' : (e.shift === 'evening' ? 'ਸ਼ਾਮ' : '-');
        const animal = e.animal === 'buffalo' ? 'ਮੱਝ' : 'ਗਾਂ';
        const row = [
            `"${date}"`,
            `"${shift}"`,
            `"${animal}"`,
            `"${e.milk || 0}"`,
            `"${e.rate || 0}"`,
            `"${e.total || 0}"`
        ];
        csvContent += row.join(",") + "\n";
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `DairyCare_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
