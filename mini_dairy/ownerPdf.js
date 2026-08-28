// ownerPdf.js - Final PDF Generation with Multi-Farmer Support
// Developed by Arshdeep Singh

function generatePDF() {
    // Load settings
    const settings = typeof loadSettings === 'function' ? loadSettings() : {};

    // Sanitize filename
    function sanitizeFileName(name) {
        try {
            return name.replace(/[^\p{L}\p{M}\p{N}_\-. ]/gu, '_');
        } catch (e) {
            return name.replace(/[^a-zA-Z0-9\u0A00-\u0A7F_\-. ]/g, '_');
        }
    }

    // Guard: entries
    if (typeof entries === 'undefined' || !Array.isArray(entries)) {
        alert('ਡਾਟਾ ਲੋਡ ਨਹੀਂ ਹੋਇਆ। ਪੇਜ ਰਿਫ੍ਰੈਸ਼ ਕਰੋ।');
        return;
    }

    // DOM elements
    const pdfDateRangeEl = document.getElementById('pdfDateRange');
    const pdfStartDateEl = document.getElementById('pdfStartDate');
    const pdfEndDateEl = document.getElementById('pdfEndDate');
    const includeBuffaloEl = document.getElementById('includeBuffalo');
    const includeCowEl = document.getElementById('includeCow');
    const pdfFarmerSelect = document.getElementById('pdfFarmerSelect');

    if (!pdfDateRangeEl || !includeBuffaloEl || !includeCowEl) {
        alert('PDF ਫਾਰਮ ਦੇ ਕੁਝ ਐਲੀਮੈਂਟਸ ਨਹੀਂ ਮਿਲੇ। ਪੇਜ ਰਿਫ੍ਰੈਸ਼ ਕਰੋ।');
        return;
    }

    // Get selected farmer
    let farmerName = 'ਸਭ ਕਿਸਾਨ';
    let farmerPhone = '';
    let farmerId = null;
    if (pdfFarmerSelect) {
        const selectedId = pdfFarmerSelect.value;
        if (selectedId) {
            let farmers = [];
            try {
                farmers = JSON.parse(localStorage.getItem('owner_farmers_list') || '[]');
            } catch (e) { /* ignore */ }
            const farmer = farmers.find(f => String(f.id) === String(selectedId));
            if (farmer) {
                farmerName = farmer.name;
                farmerPhone = farmer.phone || '';
                farmerId = farmer.id;
            }
        }
    }
    if (!farmerId) {
        farmerName = settings.defaultFarmerName || 'ਸਭ ਕਿਸਾਨ';
        farmerPhone = settings.defaultFarmerPhone || '';
    }

    // jsPDF check
    if (typeof window.jspdf === 'undefined') {
        alert('PDF ਲਾਇਬ੍ਰੇਰੀ ਲੋਡ ਨਹੀਂ ਹੋਈ। ਪੇਜ ਰਿਫ੍ਰੈਸ਼ ਕਰੋ।');
        return;
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    // Date range
    const range = pdfDateRangeEl.value;
    let startDate, endDate;
    if (range === 'all') {
        startDate = '1900-01-01';
        endDate = '2999-12-31';
    } else if (range === 'custom') {
        startDate = pdfStartDateEl ? pdfStartDateEl.value : '';
        endDate = pdfEndDateEl ? pdfEndDateEl.value : '';
        if (!startDate || !endDate) {
            alert('ਕਿਰਪਾ ਕਰਕੇ ਸ਼ੁਰੂ ਅਤੇ ਅੰਤ ਦੀ ਤਾਰੀਖ਼ ਚੁਣੋ।');
            return;
        }
    } else {
        endDate = new Date().toISOString().split('T')[0];
        const days = parseInt(range) || 1;
        const start = new Date();
        start.setDate(start.getDate() - days + 1);
        startDate = start.toISOString().split('T')[0];
    }

    const includeBuffalo = includeBuffaloEl.checked;
    const includeCow = includeCowEl.checked;

    // Filter entries
    let filtered = entries.filter(e => {
        const matchesDate = e.date >= startDate && e.date <= endDate;
        const matchesAnimal = ((includeBuffalo && e.animal === 'buffalo') || (includeCow && e.animal === 'cow'));
        let matchesFarmer = true;
        if (farmerId) {
            matchesFarmer = (e.farmerId && String(e.farmerId) === String(farmerId)) || (e.farmer === farmerName);
        }
        return matchesDate && matchesAnimal && matchesFarmer;
    });

    if (filtered.length === 0) {
        alert('ਚੁਣੀ ਰੇਂਜ ਵਿੱਚ ਕੋਈ ਐਂਟਰੀ ਨਹੀਂ ਹੈ।');
        return;
    }
    filtered.sort((a, b) => a.date.localeCompare(b.date));

    // Totals
    const totalMilk = filtered.reduce((acc, e) => acc + (Number(e.milk) || 0), 0).toFixed(2);
    const totalIncome = filtered.reduce((acc, e) => acc + (Number(e.total) || 0), 0).toFixed(2);
    const totalNet = filtered.reduce((acc, e) => acc + (Number(e.net) || Number(e.total) || 0), 0).toFixed(2);

    function formatDate(dateStr) {
        if (!dateStr) return '';
        const parts = dateStr.split('-');
        if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
        return dateStr;
    }

    // ========== FIX 1: Date range text for "all" ==========
    let dateRangeText = '';
    if (range === 'all') {
        dateRangeText = 'ਸਭ ਰਿਕਾਰਡ (All Time)';
    } else {
        dateRangeText = startDate === endDate ? formatDate(startDate) : `${formatDate(startDate)} ਤੋਂ ${formatDate(endDate)}`;
    }

    const hasSnfData = filtered.some(e => e.snfPercent && e.snfPercent > 0);

    // Build report HTML
    const reportContainer = document.createElement('div');
    reportContainer.style.position = 'absolute';
    reportContainer.style.top = '0';
    reportContainer.style.left = '-9999px';
    reportContainer.style.width = '800px';
    reportContainer.style.padding = '20px';
    reportContainer.style.backgroundColor = '#ffffff';
    reportContainer.style.fontFamily = '"Noto Sans Gurmukhi", "Arial Unicode MS", "Poppins", "Arial", sans-serif';
    reportContainer.style.fontSize = '12px';
    reportContainer.style.lineHeight = '1.4';
    reportContainer.style.zIndex = '9999';
    document.body.appendChild(reportContainer);

    // Load Punjabi font if needed
    if (!document.querySelector('link[href*="Noto+Sans+Gurmukhi"]')) {
        const link = document.createElement('link');
        link.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+Gurmukhi:wght@400;500;700&display=swap';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
    }

    // ========== FIX 2: Style tag inside container (clean memory) ==========
    const style = document.createElement('style');
    style.textContent = `
        #pdf-report-container, #pdf-report-container * {
            font-family: 'Noto Sans Gurmukhi', 'Arial Unicode MS', 'Poppins', 'Arial', sans-serif !important;
        }
    `;
    reportContainer.id = 'pdf-report-container';
    reportContainer.appendChild(style); // instead of document.head.appendChild

    // Get dairy info from settings
    const dairyName = settings.dairyName || 'DairyCare Pro';
    const dairyOwner = settings.dairyOwner || '';
    const dairyAddress = settings.dairyAddress || '';
    const dairyPhone = settings.dairyPhone || '';

    let html = `
        <div style="text-align: center; margin-bottom: 10px;">
            <h1 style="color: #2a9d8f; margin: 0;">${dairyName}</h1>
            <p style="font-size: 12px; margin: 2px 0;"><strong>ਮਾਲਕ:</strong> ${dairyOwner} | <strong>ਪਤਾ:</strong> ${dairyAddress} | 📞 ${dairyPhone}</p>
            <hr style="border: 1px solid #2a9d8f; width: 80%;">
            <h2 style="color: #2c3e50; margin: 5px 0;">ਰਿਪੋਰਟ</h2>
            <p style="font-size: 12px; margin: 2px 0;"><strong>ਕਿਸਾਨ:</strong> ${farmerName} ${farmerPhone ? '| <strong>ਫ਼ੋਨ:</strong> ' + farmerPhone : ''}</p>
            <p style="font-size: 12px; margin: 2px 0;"><strong>ਮਿਤੀ ਰੇਂਜ:</strong> ${dateRangeText}</p>
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 10px;">
            <thead>
                <tr style="background: #2a9d8f; color: white;">
                    <th style="padding: 6px; border: 1px solid #ddd;">ਤਾਰੀਖ਼</th>
                    <th style="padding: 6px; border: 1px solid #ddd;">ਸ਼ਿਫਟ</th>
                    <th style="padding: 6px; border: 1px solid #ddd;">ਕਿਸਮ</th>
                    <th style="padding: 6px; border: 1px solid #ddd;">ਦੁੱਧ (L)</th>
                    <th style="padding: 6px; border: 1px solid #ddd;">ਰੇਟ (₹)</th>
                    ${hasSnfData ? `<th style="padding: 6px; border: 1px solid #ddd;">SNF %</th>` : ''}
                    <th style="padding: 6px; border: 1px solid #ddd;">ਕੁੱਲ (₹)</th>
                </tr>
            </thead>
            <tbody>
    `;

    filtered.forEach(entry => {
        const displayDate = formatDate(entry.date);
        const shift = entry.shiftDisplay || (entry.shift === 'morning' ? 'ਸਵੇਰ' : 'ਸ਼ਾਮ');
        const animal = entry.animal === 'buffalo' ? 'ਮੱਝ' : 'ਗਾਂ';
        const snfDisplay = (entry.snfPercent && entry.snfPercent > 0) ? entry.snfPercent.toFixed(1) : '-';
        const milkVal = Number(entry.milk) || 0;
        const rateVal = Number(entry.rate) || 0;
        const totalVal = Number(entry.total) || 0;
        html += `
            <tr>
                <td style="padding: 4px; border: 1px solid #ddd;">${displayDate}</td>
                <td style="padding: 4px; border: 1px solid #ddd;">${shift}</td>
                <td style="padding: 4px; border: 1px solid #ddd;">${animal}</td>
                <td style="padding: 4px; border: 1px solid #ddd; text-align: right;">${milkVal.toFixed(2)}</td>
                <td style="padding: 4px; border: 1px solid #ddd; text-align: right;">${rateVal.toFixed(2)}</td>
                ${hasSnfData ? `<td style="padding: 4px; border: 1px solid #ddd; text-align: center;">${snfDisplay}</td>` : ''}
                <td style="padding: 4px; border: 1px solid #ddd; text-align: right;">${totalVal.toFixed(2)}</td>
            </tr>
        `;
    });

    html += `
            </tbody>
        </table>
        <div style="margin-top: 15px; display: flex; justify-content: space-between;">
            <div style="width: 45%;">
                <h3 style="color: #2a9d8f;">ਸੰਖੇਪ</h3>
                <p><strong>ਕੁੱਲ ਦੁੱਧ:</strong> ${totalMilk} L</p>
                <p><strong>ਕੁੱਲ ਕਮਾਈ:</strong> ₹${totalIncome}</p>
                <p><strong>ਨੈੱਟ ਭੁਗਤਾਨ:</strong> ₹${totalNet}</p>
            </div>
            <div style="width: 45%; text-align: right;">
                <div style="border: 1px solid #ccc; width: 220px; height: 130px; margin-left: auto; padding: 8px; text-align: left;">
                    <p><strong>ਤਾਰੀਖ਼:</strong> ______________</p>
                    <p><strong>ਡੇਅਰੀ ਮਾਲਕ ਦੇ ਦਸਤਖ਼ਤ:</strong> ________________</p>
                    <p><strong>ਕਿਸਾਨ ਦੇ ਦਸਤਖ਼ਤ:</strong> ________________</p>
                    <p><strong>ਡੇਅਰੀ ਮੋਹਰ:</strong></p>
                    <div style="border: 1px dashed #aaa; width: 100px; height: 40px; margin-top: 5px; text-align: center; line-height: 40px; color: #999;">(ਮੋਹਰ)</div>
                </div>
            </div>
        </div>
        <div style="text-align: center; margin-top: 10px; font-size: 9px; color: #666;">
            ⚡ ਇਹ ਰਿਪੋਰਟ ਕੰਪਿਊਟਰ ਦੁਆਰਾ ਤਿਆਰ ਕੀਤੀ ਗਈ ਹੈ, ਬਿਨਾਂ ਦਸਤਖਤ ਅਤੇ ਮੋਹਰ ਦੇ ਵੈਧ ਨਹੀਂ।
        </div>
        <div style="text-align: center; margin-top: 8px; padding: 8px; background: linear-gradient(135deg, #2a9d8f, #264653); color: white; border-radius: 4px;">
            <span style="font-size: 10px; letter-spacing: 0.5px; text-transform: uppercase;">
                ✨ Free Digital Dairy Management Software ✨
            </span>
            <div style="font-size: 12px; font-weight: bold; margin-top: 2px; color: #ffe66d;">
                DairyCare Pro (Designed by : Arshdeep Singh)
            </div>
        </div>
    `;

    reportContainer.innerHTML = html;

    // html2canvas
    if (typeof html2canvas === 'undefined') {
        alert('html2canvas ਲਾਇਬ੍ਰੇਰੀ ਲੋਡ ਨਹੀਂ ਹੋਈ। PDF ਬਣਾਉਣ ਲਈ ਪੇਜ ਰਿਫ੍ਰੈਸ਼ ਕਰੋ।');
        if (reportContainer.parentNode) document.body.removeChild(reportContainer);
        return;
    }

    // ========== FIX 3 (FINAL): Correct multi-page PDF generation with dynamic offset ==========
    setTimeout(() => {
        html2canvas(reportContainer, { scale: 2, backgroundColor: '#ffffff', logging: false, useCORS: true })
            .then(canvas => {
                const imgData = canvas.toDataURL('image/jpeg', 0.95);
                const imgWidth = 190; // A4 width minus margins (210 - 20)
                const pageHeight = 287; // A4 usable height (297 - 10)
                const imgHeight = (canvas.height * imgWidth) / canvas.width;

                let heightLeft = imgHeight;
                let position = 5; // top margin for first page

                // First page
                doc.addImage(imgData, 'JPEG', 10, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;

                // Additional pages with dynamic offset
                while (heightLeft > 0) {
                    // Calculate the correct vertical offset for the next slice
                    position = - (imgHeight - (imgHeight - heightLeft) - 5);
                    // Alternatively: position = heightLeft - imgHeight + 5;
                    // Using the simpler: position = heightLeft - imgHeight + 5; works correctly
                    // Let's use the cleaner version:
                    position = heightLeft - imgHeight + 5;
                    doc.addPage();
                    doc.addImage(imgData, 'JPEG', 10, position, imgWidth, imgHeight);
                    heightLeft -= pageHeight;
                }

                const timestamp = new Date().toISOString().slice(0, 10);
                const safeName = sanitizeFileName(farmerName);
                const fileName = `${safeName.replace(/\s+/g, '_')}_${timestamp}_owner_hisab_report.pdf`;
                doc.save(fileName);
            })
            .catch(error => {
                console.error('PDF error:', error);
                alert('PDF ਬਣਾਉਣ ਵਿੱਚ ਸਮੱਸਿਆ: ' + error.message);
            })
            .finally(() => {
                if (reportContainer.parentNode) document.body.removeChild(reportContainer);
            });
    }, 800);
}

document.addEventListener('DOMContentLoaded', function () {
    const btn = document.getElementById('downloadPdfBtn');
    if (btn) btn.addEventListener('click', generatePDF);
});