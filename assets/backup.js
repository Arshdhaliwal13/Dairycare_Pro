// assets/backup.js - Password Protected JSON Backup/Restore with Beautiful Modal
// Developed for DairyCare Pro

// ==================== Crypto Helpers ====================
function bufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
}

function base64ToBuffer(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes.buffer;
}

async function deriveKey(password, salt) {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
        'raw', encoder.encode(password), 'PBKDF2', false, ['deriveKey']
    );
    return crypto.subtle.deriveKey(
        { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
    );
}

async function encryptData(data, password) {
    const encoder = new TextEncoder();
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveKey(password, salt);
    const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv }, key, encoder.encode(JSON.stringify(data))
    );
    return {
        salt: bufferToBase64(salt),
        iv: bufferToBase64(iv),
        data: bufferToBase64(encrypted)
    };
}

async function decryptData(encryptedObj, password) {
    const decoder = new TextDecoder();
    const salt = base64ToBuffer(encryptedObj.salt);
    const iv = base64ToBuffer(encryptedObj.iv);
    const data = base64ToBuffer(encryptedObj.data);
    const key = await deriveKey(password, salt);
    try {
        const decrypted = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv }, key, data
        );
        return JSON.parse(decoder.decode(decrypted));
    } catch (e) {
        throw new Error('ਗਲਤ ਪਾਸਵਰਡ ਜਾਂ ਫਾਈਲ ਖਰਾਬ ਹੈ');
    }
}

// ==================== Data Collect / Restore ====================
function collectAllData() {
    const keys = [
        'pakkaEntries', 'pakkaSettings', 'kachaSettings',
        'ownerEntries', 'ownerSettings', 'owner_farmers_list',
        'dairycare_expenses'
    ];
    const data = {};
    keys.forEach(key => {
        const value = localStorage.getItem(key);
        if (value !== null) data[key] = value;
    });
    return data;
}

function restoreAllData(data) {
    Object.keys(data).forEach(key => localStorage.setItem(key, data[key]));
}

// ==================== Create Modal HTML ====================
function createBackupModal() {
    if (document.getElementById('backupModal')) return;

    const modalHTML = `
    <div id="backupModal" class="backup-modal" style="display:none;">
        <div class="backup-modal-content">
            <span class="backup-close" onclick="closeBackupModal()">&times;</span>
            
            <div id="backupStep1">
                <h2>🔐 ਡਾਟਾ ਬੈਕਅੱਪ / ਰੀਸਟੋਰ</h2>
                <p style="margin: 15px 0; color:#555;">ਆਪਣਾ ਸਾਰਾ ਡਾਟਾ ਸੁਰੱਖਿਅਤ ਰੱਖੋ ਜਾਂ ਨਵੇਂ ਫੋਨ ’ਤੇ ਲਿਆਓ</p>
                
                <div style="display:flex; gap:12px; margin-top:20px;">
                    <button onclick="showBackupForm()" class="btn btn-primary" style="flex:1;">📥 ਬੈਕਅੱਪ ਲਓ</button>
                    <button onclick="showRestoreForm()" class="btn btn-secondary" style="flex:1;">📤 ਰੀਸਟੋਰ ਕਰੋ</button>
                </div>
            </div>

            <!-- Backup Form -->
            <div id="backupForm" style="display:none;">
                <h2>📥 ਬੈਕਅੱਪ ਬਣਾਓ</h2>
                <div class="backup-warning">
                    ⚠️ ਇਹ ਪਾਸਵਰਡ ਯਾਦ ਰੱਖੋ!<br>
                    ਇਸ ਤੋਂ ਬਿਨਾਂ ਡਾਟਾ ਵਾਪਸ ਨਹੀਂ ਆਵੇਗਾ।
                </div>
                
                <div class="form-group">
                    <label>ਪਾਸਵਰਡ (ਘੱਟੋ-ਘੱਟ 4 ਅੱਖਰ)</label>
                    <div class="password-wrapper">
                        <input type="password" id="backupPassword" class="form-control" placeholder="ਪਾਸਵਰਡ ਲਿਖੋ">
                        <button type="button" class="toggle-pass" onclick="togglePassword('backupPassword', this)">👁️</button>
                    </div>
                </div>
                
                <div class="form-group">
                    <label>ਪਾਸਵਰਡ ਦੁਬਾਰਾ ਲਿਖੋ</label>
                    <div class="password-wrapper">
                        <input type="password" id="backupPasswordConfirm" class="form-control" placeholder="ਪਾਸਵਰਡ ਦੁਬਾਰਾ">
                        <button type="button" class="toggle-pass" onclick="togglePassword('backupPasswordConfirm', this)">👁️</button>
                    </div>
                </div>
                
                <div style="display:flex; gap:10px; margin-top:20px;">
                    <button onclick="doBackup()" class="btn btn-primary" style="flex:1;">✅ ਬੈਕਅੱਪ ਡਾਊਨਲੋਡ ਕਰੋ</button>
                    <button onclick="backToMain()" class="btn btn-secondary">ਪਿੱਛੇ</button>
                </div>
            </div>

            <!-- Restore Form -->
            <div id="restoreForm" style="display:none;">
                <h2>📤 ਡਾਟਾ ਰੀਸਟੋਰ ਕਰੋ</h2>
                <div class="backup-warning">
                    ⚠️ ਮੌਜੂਦਾ ਡਾਟਾ ਮਿਟ ਜਾਵੇਗਾ ਅਤੇ ਨਵਾਂ ਡਾਟਾ ਲੋਡ ਹੋਵੇਗਾ।
                </div>
                
                <div class="form-group">
                    <label>ਬੈਕਅੱਪ ਫਾਈਲ ਚੁਣੋ (.json)</label>
                    <input type="file" id="restoreFile" accept=".json" class="form-control">
                </div>
                
                <div class="form-group">
                    <label>ਪਾਸਵਰਡ</label>
                    <div class="password-wrapper">
                        <input type="password" id="restorePassword" class="form-control" placeholder="ਪਾਸਵਰਡ ਲਿਖੋ">
                        <button type="button" class="toggle-pass" onclick="togglePassword('restorePassword', this)">👁️</button>
                    </div>
                </div>
                
                <div style="display:flex; gap:10px; margin-top:20px;">
                    <button onclick="doRestore()" class="btn btn-primary" style="flex:1;">✅ ਰੀਸਟੋਰ ਕਰੋ</button>
                    <button onclick="backToMain()" class="btn btn-secondary">ਪਿੱਛੇ</button>
                </div>
            </div>
        </div>
    </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Add CSS
    const style = document.createElement('style');
    style.textContent = `
        .backup-modal {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.55); z-index: 9999;
            display: flex; align-items: center; justify-content: center;
            padding: 15px;
        }
        .backup-modal-content {
            background: white; border-radius: 20px; padding: 25px;
            width: 100%; max-width: 420px; position: relative;
            box-shadow: 0 20px 50px rgba(0,0,0,0.25);
            animation: backupFadeIn 0.3s ease;
        }
        @keyframes backupFadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .backup-close {
            position: absolute; top: 12px; right: 18px;
            font-size: 28px; cursor: pointer; color: #666;
        }
        .backup-close:hover { color: #e11d48; }
        .backup-warning {
            background: #fef3c7; border: 1px solid #f59e0b;
            padding: 12px; border-radius: 12px; margin: 15px 0;
            font-size: 0.95rem; color: #92400e; line-height: 1.5;
        }
        .password-wrapper {
            position: relative;
        }
        .password-wrapper input {
            padding-right: 45px;
        }
        .toggle-pass {
            position: absolute; right: 8px; top: 50%;
            transform: translateY(-50%);
            background: none; border: none; font-size: 1.2rem;
            cursor: pointer; padding: 5px;
        }
        .backup-modal .form-group {
            margin-bottom: 15px;
        }
        .backup-modal .form-group label {
            display: block; margin-bottom: 6px; font-weight: 600; color: #333;
        }
        .backup-modal .form-control {
            width: 100%; padding: 12px 14px; border: 2px solid #e2e8f0;
            border-radius: 12px; font-size: 1rem;
        }
        .backup-modal .form-control:focus {
            outline: none; border-color: #2a9d8f;
        }
    `;
    document.head.appendChild(style);
}

// ==================== Modal Controls ====================
function openBackupModal() {
    createBackupModal();
    document.getElementById('backupModal').style.display = 'flex';
    backToMain();
}

function closeBackupModal() {
    const modal = document.getElementById('backupModal');
    if (modal) modal.style.display = 'none';
}

function backToMain() {
    document.getElementById('backupStep1').style.display = 'block';
    document.getElementById('backupForm').style.display = 'none';
    document.getElementById('restoreForm').style.display = 'none';
}

function showBackupForm() {
    document.getElementById('backupStep1').style.display = 'none';
    document.getElementById('backupForm').style.display = 'block';
    document.getElementById('restoreForm').style.display = 'none';
}

function showRestoreForm() {
    document.getElementById('backupStep1').style.display = 'none';
    document.getElementById('backupForm').style.display = 'none';
    document.getElementById('restoreForm').style.display = 'block';
}

function togglePassword(inputId, btn) {
    const input = document.getElementById(inputId);
    if (input.type === 'password') {
        input.type = 'text';
        btn.textContent = '🙈';
    } else {
        input.type = 'password';
        btn.textContent = '👁️';
    }
}

// ==================== Backup Action ====================
async function doBackup() {
    const pass = document.getElementById('backupPassword').value.trim();
    const confirm = document.getElementById('backupPasswordConfirm').value.trim();

    if (pass.length < 4) {
        alert('ਪਾਸਵਰਡ ਘੱਟੋ-ਘੱਟ 4 ਅੱਖਰਾਂ ਦਾ ਹੋਣਾ ਚਾਹੀਦਾ ਹੈ');
        return;
    }
    if (pass !== confirm) {
        alert('ਪਾਸਵਰਡ ਮੇਲ ਨਹੀਂ ਖਾਂਦਾ');
        return;
    }

    try {
        const allData = collectAllData();
        if (Object.keys(allData).length === 0) {
            alert('ਕੋਈ ਡਾਟਾ ਨਹੀਂ ਮਿਲਿਆ ਬੈਕਅੱਪ ਕਰਨ ਲਈ');
            return;
        }

        const encrypted = await encryptData(allData, pass);
        const blob = new Blob([JSON.stringify(encrypted, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `DairyCare_Backup_${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);

        alert('✅ ਬੈਕਅੱਪ ਸਫਲਤਾਪੂਰਵਕ ਡਾਊਨਲੋਡ ਹੋ ਗਿਆ!\nਪਾਸਵਰਡ ਜ਼ਰੂਰ ਯਾਦ ਰੱਖੋ।');
        closeBackupModal();
    } catch (err) {
        console.error(err);
        alert('ਗਲਤੀ: ' + err.message);
    }
}

// ==================== Restore Action ====================
async function doRestore() {
    const fileInput = document.getElementById('restoreFile');
    const password = document.getElementById('restorePassword').value.trim();

    if (!fileInput.files[0]) {
        alert('ਕਿਰਪਾ ਕਰਕੇ ਬੈਕਅੱਪ ਫਾਈਲ ਚੁਣੋ');
        return;
    }
    if (!password) {
        alert('ਪਾਸਵਰਡ ਲਿਖੋ');
        return;
    }

    try {
        const text = await fileInput.files[0].text();
        const encryptedObj = JSON.parse(text);
        const decryptedData = await decryptData(encryptedObj, password);

        if (!confirm('ਕੀ ਤੁਸੀਂ ਮੌਜੂਦਾ ਡਾਟਾ ਮਿਟਾ ਕੇ ਨਵਾਂ ਡਾਟਾ ਲੋਡ ਕਰਨਾ ਚਾਹੁੰਦੇ ਹੋ?')) {
            return;
        }

        const keysToClear = [
            'pakkaEntries', 'pakkaSettings', 'kachaSettings',
            'ownerEntries', 'ownerSettings', 'owner_farmers_list',
            'dairycare_expenses'
        ];
        keysToClear.forEach(k => localStorage.removeItem(k));

        restoreAllData(decryptedData);

        alert('✅ ਡਾਟਾ ਸਫਲਤਾਪੂਰਵਕ ਰੀਸਟੋਰ ਹੋ ਗਿਆ!\nਪੇਜ ਰੀਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...');
        setTimeout(() => location.reload(), 800);
    } catch (err) {
        console.error(err);
        alert('❌ ਗਲਤੀ: ' + err.message);
    }
}

// ==================== Global ====================
window.openBackupModal = openBackupModal;
window.closeBackupModal = closeBackupModal;
window.showBackupForm = showBackupForm;
window.showRestoreForm = showRestoreForm;
window.backToMain = backToMain;
window.doBackup = doBackup;
window.doRestore = doRestore;
window.togglePassword = togglePassword;

// Close when clicking outside
document.addEventListener('click', function (e) {
    const modal = document.getElementById('backupModal');
    if (modal && e.target === modal) closeBackupModal();
});
