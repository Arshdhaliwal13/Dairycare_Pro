// pakkaPdf.js - Final A4 Portrait with correct margins, watermark, and pagination
// Developed by Arshdeep Singh

function generatePDF() {
    const settings = loadSettings();

    const farmerName = prompt('ਕਿਸਾਨ ਦਾ ਨਾਮ ਦਰਜ ਕਰੋ:', settings.defaultFarmerName || '_____________');
    if (farmerName === null) return;
    const farmerPhone = prompt('ਕਿਸਾਨ ਦਾ ਫ਼ੋਨ ਨੰਬਰ:', settings.defaultFarmerPhone || '_____________');
    if (farmerPhone === null) return;

    // Portrait A4 (default orientation is portrait)
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    // Get date range from PDF options
    const range = document.getElementById('pdfDateRange').value;
    let startDate, endDate;
    if (range === 'custom') {
        startDate = document.getElementById('pdfStartDate').value;
        endDate = document.getElementById('pdfEndDate').value;
        if (!startDate || !endDate) {
            alert('ਕਿਰਪਾ ਕਰਕੇ ਸ਼ੁਰੂ ਅਤੇ ਅੰਤ ਦੀ ਤਾਰੀਖ਼ ਚੁਣੋ।');
            return;
        }
    } else {
        endDate = new Date().toISOString().split('T')[0];
        const days = parseInt(range);
        const start = new Date();
        start.setDate(start.getDate() - days + 1);
        startDate = start.toISOString().split('T')[0];
    }

    const includeBuffalo = document.getElementById('includeBuffalo').checked;
    const includeCow = document.getElementById('includeCow').checked;

    let filtered = entries.filter(e => {
        return e.date >= startDate && e.date <= endDate &&
            ((includeBuffalo && e.animal === 'buffalo') || (includeCow && e.animal === 'cow'));
    });

    if (filtered.length === 0) {
        alert('ਚੁਣੀ ਰੇਂਜ ਵਿੱਚ ਕੋਈ ਐਂਟਰੀ ਨਹੀਂ ਹੈ।');
        return;
    }

    filtered.sort((a, b) => a.date.localeCompare(b.date));

    // Totals
    const totalMilk = filtered.reduce((acc, e) => acc + e.milk, 0).toFixed(2);
    const totalIncome = filtered.reduce((acc, e) => acc + e.total, 0).toFixed(2);
    const totalNet = filtered.reduce((acc, e) => acc + (e.net || e.total || 0), 0).toFixed(2);

    const displayFarmer = farmerName;
    let dateRangeText = startDate === endDate
        ? startDate.split('-').reverse().join('/')
        : `${startDate.split('-').reverse().join('/')} ਤੋਂ ${endDate.split('-').reverse().join('/')}`;

    // Create visible container at the bottom of the page (for debugging)
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
    reportContainer.style.boxShadow = '0 0 0 1px red'; // visible border for debugging (remove later)
    document.body.appendChild(reportContainer);

    // Load Punjabi font (Google Fonts)
    if (!document.querySelector('link[href*="Noto+Sans+Gurmukhi"]')) {
        const link = document.createElement('link');
        link.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+Gurmukhi:wght@400;500;700&display=swap';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
    }
    // Force font on all elements in the container
    const style = document.createElement('style');
    style.textContent = `
        #pdf-report-container, #pdf-report-container * {
            font-family: 'Noto Sans Gurmukhi', 'Arial Unicode MS', 'Poppins', 'Arial', sans-serif !important;
        }
    `;
    reportContainer.id = 'pdf-report-container';
    document.head.appendChild(style);

    const displayDairyName = settings.dairyName || '';
    let html = `
        <div style="text-align: center; margin-bottom: 10px;">
            <h1 style="color: #2a9d8f; margin: 0;">${displayDairyName}</h1>
            <p style="font-size: 12px; margin: 2px 0;"><strong>ਮਾਲਕ:</strong> ${settings.dairyOwner || ''} | <strong>ਪਤਾ:</strong> ${settings.dairyAddress || ''} | 📞 ${settings.dairyPhone || ''}</p>
            <hr style="border: 1px solid #2a9d8f; width: 80%;">
            <h2 style="color: #2c3e50; margin: 5px 0;">ਰਿਪੋਰਟ</h2>
            <p style="font-size: 12px; margin: 2px 0;"><strong>ਕਿਸਾਨ:</strong> ${displayFarmer} | <strong>ਕਿਸਾਨ ਦਾ ਫ਼ੋਨ:</strong> ${farmerPhone}</p>
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
                    <th style="padding: 6px; border: 1px solid #ddd;">ਕੁੱਲ (₹)</th>
                </tr>
            </thead>
            <tbody>
    `;

    filtered.forEach(entry => {
        const [y, m, d] = entry.date.split('-');
        const displayDate = `${d}/${m}/${y}`;
        const shift = entry.shiftDisplay || (entry.shift === 'morning' ? 'ਸਵੇਰ' : 'ਸ਼ਾਮ');
        const animal = entry.animal === 'buffalo' ? 'ਮੱਝ' : 'ਗਾਂ';
        html += `
            <tr>
                <td style="padding: 4px; border: 1px solid #ddd;">${displayDate}</td>
                <td style="padding: 4px; border: 1px solid #ddd;">${shift}</td>
                <td style="padding: 4px; border: 1px solid #ddd;">${animal}</td>
                <td style="padding: 4px; border: 1px solid #ddd; text-align: right;">${entry.milk.toFixed(2)}</td>
                <td style="padding: 4px; border: 1px solid #ddd; text-align: right;">${entry.rate.toFixed(2)}</td>
                <td style="padding: 4px; border: 1px solid #ddd; text-align: right;">${entry.total.toFixed(2)}</td>
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
    `;

    reportContainer.innerHTML = html;

    // Wait for fonts and layout
    setTimeout(() => {
        html2canvas(reportContainer, {
            scale: 2,
            backgroundColor: '#ffffff',
            logging: false,
            useCORS: true
        })
            .then(canvas => {
                const imgData = canvas.toDataURL('image/jpeg', 0.9);
                const pageWidth = doc.internal.pageSize.getWidth();  // 210mm for A4 portrait
                const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
                const leftMargin = 10;   // mm
                const rightMargin = 10;   // mm
                const topMargin = 3;     // mm
                const bottomMargin = 15;   // mm

                const contentWidth = pageWidth - leftMargin - rightMargin; // 190mm
                const contentHeight = (canvas.height * contentWidth) / canvas.width;

                // Pagination: draw the image with negative offsets, respecting top margin
                let heightLeft = contentHeight;
                let position = -topMargin;  // start at -topMargin so the first page starts after top margin
                let pageNum = 1;

                while (heightLeft > 0) {
                    if (pageNum > 1) {
                        doc.addPage();
                        position = -topMargin - (pageNum - 1) * pageHeight;
                    }
                    doc.addImage(imgData, 'JPEG', leftMargin, position, contentWidth, contentHeight, undefined, 'FAST');
                    heightLeft -= pageHeight;
                    pageNum++;
                }

                // Unique filename
                const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
                const fileName = `${farmerName.replace(/\s+/g, '_')}_${timestamp}_pakka_hisab_report.pdf`;
                doc.save(fileName);
                document.body.removeChild(reportContainer);
            })
            .catch(error => {
                console.error('PDF generation error:', error);
                alert('PDF ਬਣਾਉਣ ਵਿੱਚ ਸਮੱਸਿਆ ਆਈ: ' + error.message);
                document.body.removeChild(reportContainer);
            });
    }, 800);
}

// Add listener for PDF button
document.addEventListener('DOMContentLoaded', function () {
    const btn = document.getElementById('generatePdfBtn');
    if (btn) btn.addEventListener('click', generatePDF);
});
