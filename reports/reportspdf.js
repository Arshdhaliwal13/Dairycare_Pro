// reportspdf.js - Generate PDF Reports with Charts, Shift Column, and Entries List
// Developed by Arshdeep Singh

// ==================== PDF Generation ====================
function generatePDF() {
    // Get settings
    const settings = typeof loadSettings === 'function' ? loadSettings() : {};

    // 🛡️ Sanitize filename (like pakka/kacha)
    function sanitizeFileName(name) {
        try {
            return name.replace(/[^\p{L}\p{M}\p{N}_\-. ]/gu, '_');
        } catch (e) {
            return name.replace(/[^a-zA-Z0-9\u0A00-\u0A7F_\-. ]/g, '_');
        }
    }

    const farmerName = prompt('ਕਿਸਾਨ ਦਾ ਨਾਮ ਦਰਜ ਕਰੋ:', settings.defaultFarmerName || '_____________');
    if (farmerName === null) return;
    const farmerPhone = prompt('ਕਿਸਾਨ ਦਾ ਫ਼ੋਨ ਨੰਬਰ:', settings.defaultFarmerPhone || '_____________');
    if (farmerPhone === null) return;

    // Get filtered data (from reports.js global filteredData)
    if (typeof filteredData === 'undefined' || filteredData.length === 0) {
        alert('PDF ਬਣਾਉਣ ਲਈ ਕੋਈ ਡਾਟਾ ਨਹੀਂ ਹੈ।');
        return;
    }

    const includeEntries = document.getElementById('includeEntriesList')?.checked ?? true;

    // 🛡️ Check if html2canvas is loaded
    if (typeof html2canvas === 'undefined' || typeof window.jspdf === 'undefined') {
        alert('PDF ਲਾਇਬ੍ਰੇਰੀ ਲੋਡ ਨਹੀਂ ਹੋਈ। ਕਿਰਪਾ ਕਰਕੇ ਪੇਜ ਰਿਫ੍ਰੈਸ਼ ਕਰੋ।');
        return;
    }

    // Prepare chart images (capture canvases)
    const chartsContainer = document.querySelector('.charts-section');
    if (!chartsContainer) {
        alert('ਚਾਰਟ ਸੈਕਸ਼ਨ ਨਹੀਂ ਮਿਲਿਆ।');
        return;
    }

    // Use html2canvas to capture charts section
    html2canvas(chartsContainer, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true
    }).then(canvas => {
        const chartImg = canvas.toDataURL('image/jpeg', 0.9);

        // Generate report HTML
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

        // Load Punjabi font (only if not already loaded)
        if (!document.querySelector('link[href*="Noto+Sans+Gurmukhi"]')) {
            const link = document.createElement('link');
            link.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+Gurmukhi:wght@400;500;700&display=swap';
            link.rel = 'stylesheet';
            document.head.appendChild(link);
        }

        // Style tag appended to reportContainer (no memory leak)
        const style = document.createElement('style');
        style.textContent = `
            #pdf-report-container, #pdf-report-container * {
                font-family: 'Noto Sans Gurmukhi', 'Arial Unicode MS', 'Poppins', 'Arial', sans-serif !important;
            }
        `;
        reportContainer.id = 'pdf-report-container';
        reportContainer.appendChild(style);

        // Build HTML report
        const displayDairyName = settings.dairyName || 'DairyCare Pro';
        let html = `
            <div style="text-align: center; margin-bottom: 10px;">
                <h1 style="color: #2a9d8f; margin: 0;">${displayDairyName}</h1>
                <p style="font-size: 12px; margin: 2px 0;"><strong>ਮਾਲਕ:</strong> ${settings.dairyOwner || ''} | <strong>ਪਤਾ:</strong> ${settings.dairyAddress || ''} | 📞 ${settings.dairyPhone || ''}</p>
                <hr style="border: 1px solid #2a9d8f; width: 80%;">
                <h2 style="color: #2c3e50; margin: 5px 0;">ਰਿਪੋਰਟ</h2>
                <p style="font-size: 12px; margin: 2px 0;"><strong>ਕਿਸਾਨ:</strong> ${farmerName} | <strong>ਕਿਸਾਨ ਦਾ ਫ਼ੋਨ:</strong> ${farmerPhone}</p>
            </div>
        `;

        // Add summary stats
        const totalMilk = filteredData.reduce((acc, e) => acc + (e.milk || 0), 0).toFixed(1);
        const totalIncome = filteredData.reduce((acc, e) => acc + (e.total || 0), 0).toFixed(0);
        html += `
            <div style="display: flex; justify-content: space-around; margin: 10px 0;">
                <div><strong>ਕੁੱਲ ਦੁੱਧ:</strong> ${totalMilk} L</div>
                <div><strong>ਕੁੱਲ ਕਮਾਈ:</strong> ₹${totalIncome}</div>
            </div>
        `;

        // Add chart image
        html += `<div style="text-align: center; margin: 15px 0;">
            <img src="${chartImg}" style="max-width: 100%; height: auto;" />
        </div>`;

        // Add entries list if checked (with Shift column)
        if (includeEntries) {
            html += `<table style="width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 10px;">
                <thead>
                    <tr style="background: #2a9d8f; color: white;">
                        <th style="padding: 4px; border: 1px solid #ddd;">ਤਾਰੀਖ਼</th>
                        <th style="padding: 4px; border: 1px solid #ddd;">ਸ਼ਿਫਟ</th>
                        <th style="padding: 4px; border: 1px solid #ddd;">ਕਿਸਮ</th>
                        <th style="padding: 4px; border: 1px solid #ddd;">ਦੁੱਧ (L)</th>
                        <th style="padding: 4px; border: 1px solid #ddd;">ਰੇਟ (₹)</th>
                        <th style="padding: 4px; border: 1px solid #ddd;">ਕੁੱਲ (₹)</th>
                    </tr>
                </thead>
                <tbody>`;
            filteredData.forEach(e => {
                // Safe date split check
                const dateParts = (e.date || '').split('-');
                const date = dateParts.length === 3 ? `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}` : (e.date || '-');

                const shift = e.shiftDisplay || (e.shift === 'morning' ? 'ਸਵੇਰ' : (e.shift === 'evening' ? 'ਸ਼ਾਮ' : '-'));
                const animal = e.animal === 'buffalo' ? 'ਮੱਝ' : 'ਗਾਂ';
                html += `<tr>
                    <td style="padding: 4px; border: 1px solid #ddd;">${date}</td>
                    <td style="padding: 4px; border: 1px solid #ddd;">${shift}</td>
                    <td style="padding: 4px; border: 1px solid #ddd;">${animal}</td>
                    <td style="padding: 4px; border: 1px solid #ddd; text-align: right;">${(e.milk || 0).toFixed(2)}</td>
                    <td style="padding: 4px; border: 1px solid #ddd; text-align: right;">${(e.rate || 0).toFixed(2)}</td>
                    <td style="padding: 4px; border: 1px solid #ddd; text-align: right;">${(e.total || 0).toFixed(2)}</td>
                </tr>`;
            });
            html += `</tbody></table>`;
        }

        // Footer
        html += `
            <div style="text-align: center; margin-top: 15px; font-size: 9px; color: #666;">
                ⚡ ਇਹ ਰਿਪੋਰਟ ਕੰਪਿਊਟਰ ਦੁਆਰਾ ਤਿਆਰ ਕੀਤੀ ਗਈ ਹੈ।
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

        reportContainer.insertAdjacentHTML('beforeend', html);

        // Render PDF
        setTimeout(() => {
            html2canvas(reportContainer, {
                scale: 2,
                backgroundColor: '#ffffff',
                logging: false,
                useCORS: true
            }).then(canvas => {
                const imgData = canvas.toDataURL('image/jpeg', 0.9);
                const { jsPDF } = window.jspdf || {};
                if (!jsPDF) throw new Error("jsPDF ਲਾਇਬ੍ਰੇਰੀ ਉਪਲਬਧ ਨਹੀਂ ਹੈ।");
                const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

                const pageWidth = doc.internal.pageSize.getWidth();
                const pageHeight = doc.internal.pageSize.getHeight();
                const leftMargin = 10;
                const rightMargin = 10;
                const topMargin = 3;
                const contentWidth = pageWidth - leftMargin - rightMargin;
                const contentHeight = (canvas.height * contentWidth) / canvas.width;

                // Simple and bug‑free pagination (like kachaPdf.js)
                let heightLeft = contentHeight;
                let position = topMargin;

                doc.addImage(imgData, 'JPEG', leftMargin, position, contentWidth, contentHeight, undefined, 'FAST');
                heightLeft -= pageHeight;

                while (heightLeft > 0) {
                    position = heightLeft - contentHeight;
                    doc.addPage();
                    doc.addImage(imgData, 'JPEG', leftMargin, position, contentWidth, contentHeight, undefined, 'FAST');
                    heightLeft -= pageHeight;
                }

                // Secure file naming with farmer's name
                const timestamp = new Date().toISOString().slice(0, 10);
                const safeName = sanitizeFileName(farmerName);
                const fileName = `${safeName.replace(/\s+/g, '_')}_Report_${timestamp}.pdf`;
                doc.save(fileName);
            }).catch(error => {
                console.error('PDF generation error:', error);
                alert('PDF ਬਣਾਉਣ ਵਿੱਚ ਸਮੱਸਿਆ: ' + error.message);
            }).finally(() => {
                if (reportContainer.parentNode) {
                    document.body.removeChild(reportContainer);
                }
            });
        }, 800);
    }).catch(error => {
        console.error('Chart capture error:', error);
        alert('ਚਾਰਟ ਕੈਪਚਰ ਕਰਨ ਵਿੱਚ ਸਮੱਸਿਆ: ' + error.message);
    });
}

// ==================== Excel Export ====================
function exportToCSV() {
    if (typeof filteredData === 'undefined' || filteredData.length === 0) {
        alert('ਐਕਸਪੋਰਟ ਕਰਨ ਲਈ ਕੋਈ ਡਾਟਾ ਨਹੀਂ ਹੈ।');
        return;
    }

    let csv = 'ਤਾਰੀਖ਼,ਸ਼ਿਫਟ,ਕਿਸਮ,ਦੁੱਧ (L),ਰੇਟ (₹),ਕੁੱਲ (₹)\n';
    filteredData.forEach(e => {
        const row = [
            `"${(e.date || '').replace(/"/g, '""')}"`,
            `"${(e.shiftDisplay || '').replace(/"/g, '""')}"`,
            `"${e.animal === 'buffalo' ? 'ਮੱਝ' : 'ਗਾਂ'}"`,
            e.milk || 0,
            e.rate || 0,
            e.total || 0
        ];
        csv += row.join(',') + '\r\n';
    });

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `DairyCare_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// ==================== Event Listeners ====================
document.addEventListener('DOMContentLoaded', function () {
    const pdfBtn = document.getElementById('generateReportsPdfBtn');
    if (pdfBtn) pdfBtn.addEventListener('click', generatePDF);

    // Excel export is handled in reports.js – no duplicate listener needed here.
});
