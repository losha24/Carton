/**
 * אלופי המתמטיקה PRO - גרסה 2.0
 * פותח עבור אלכסיי זבודיסקר
 */

const CURRENT_VERSION = "2";

// בדיקת גרסה לרענון
function checkVersion() {
    const saved = localStorage.getItem('app_version');
    if (saved && saved !== CURRENT_VERSION) {
        document.getElementById('update-banner').classList.remove('hidden');
    }
    localStorage.setItem('app_version', CURRENT_VERSION);
}

// לוגיקת הורים
window.toggleAdmin = () => document.getElementById('admin-panel').classList.toggle('hidden');

window.addNewItem = () => {
    const name = document.getElementById('new-item-name').value;
    const price = parseInt(document.getElementById('new-item-price').value);
    const icon = document.getElementById('new-item-icon').value;

    if (!name || isNaN(price)) return alert("הזן שם ומחיר תקינים");

    const custom = JSON.parse(localStorage.getItem('math_custom_store')) || [];
    custom.push({ id: "c" + Date.now(), name, price, icon });
    localStorage.setItem('math_custom_store', JSON.stringify(custom));
    
    document.getElementById('new-item-name').value = '';
    document.getElementById('new-item-price').value = '';
    renderStore();
};

window.deleteItem = (id) => {
    if (confirm("למחוק מהחנות?")) {
        let items = JSON.parse(localStorage.getItem('math_custom_store')) || [];
        localStorage.setItem('math_custom_store', JSON.stringify(items.filter(i => i.id != id)));
        renderStore();
    }
};

// רכישה
window.buy = (id) => {
    let s = parseInt(localStorage.getItem('math_coins')) || 0;
    const def = [
        { id: 'd1', name: '10 דקות משחק', price: 15, icon: '⏱️' },
        { id: 'd2', name: 'גלידה', price: 50, icon: '🍦' }
    ];
    const custom = JSON.parse(localStorage.getItem('math_custom_store')) || [];
    const item = [...def, ...custom].find(i => i.id == id);

    if (s >= item.price) {
        s -= item.price;
        localStorage.setItem('math_coins', s);
        let inventory = JSON.parse(localStorage.getItem('math_items')) || [];
        inventory.push({ ...item, date: new Date().toLocaleDateString('he-IL') });
        localStorage.setItem('math_items', JSON.stringify(inventory));
        
        updateUI();
        renderStore();
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        alert(`קנית ${item.name}! איזה כיף!`);
    } else {
        alert("אין לך מספיק מטבעות. תמשיך לפתור!");
    }
};

// יצירת תרגילים
window.refreshTable = (type) => {
    const container = document.getElementById(`${type}-table`);
    if (!container) return;
    container.innerHTML = '';
    
    const coins = parseInt(localStorage.getItem('math_coins')) || 0;
    const range = coins < 50 ? 10 : 20;

    for (let i = 0; i < 3; i++) {
        let n1, n2, ans, sym;
        
        if (type === 'addition') {
            let a = Math.floor(Math.random() * range) + 1;
            let b = Math.floor(Math.random() * range) + 1;
            n1 = Math.max(a, b); n2 = Math.min(a, b);
            ans = n1 + n2; sym = '+';
        } else if (type === 'subtraction') {
            n1 = Math.floor(Math.random() * range) + 5;
            n2 = Math.floor(Math.random() * n1) + 1;
            ans = n1 - n2; sym = '-';
        } else if (type === 'multiplication') {
            n1 = Math.floor(Math.random() * 9) + 2;
            n2 = Math.floor(Math.random() * 9) + 2;
            ans = n1 * n2; sym = '×';
        } else if (type === 'division') {
            n2 = Math.floor(Math.random() * 8) + 2;
            let res = Math.floor(Math.random() * 9) + 1;
            n1 = n2 * res; ans = res; sym = '÷';
        }

        container.innerHTML += `
            <div class="exercise-row">
                <span>${n1} ${sym} ${n2} =</span>
                <input type="number" data-ans="${ans}" data-type="${type}" placeholder="?">
            </div>`;
    }
};

const updateUI = () => {
    const s = parseInt(localStorage.getItem('math_coins')) || 0;
    document.getElementById('score').innerText = s;
    document.getElementById('user-level').innerText = Math.floor(s / 50) + 1;
};

const renderStore = () => {
    const s = parseInt(localStorage.getItem('math_coins')) || 0;
    const custom = JSON.parse(localStorage.getItem('math_custom_store')) || [];
    const all = [
        { id: 'd1', name: '10 דקות משחק', price: 15, icon: '⏱️' },
        { id: 'd2', name: 'גלידה', price: 50, icon: '🍦' },
        ...custom
    ];
    
    document.getElementById('store-items').innerHTML = all.map(i => `
        <div class="store-item">
            <div style="font-size:3rem; margin-bottom:10px;">${i.icon}</div>
            <b style="font-size:1.1rem;">${i.name}</b>
            <div style="color:var(--secondary); font-weight:bold; margin:5px 0;">${i.price} 🪙</div>
            <button class="buy-btn" ${s < i.price ? 'disabled' : ''} onclick="buy('${i.id}')">קנה עכשיו</button>
            ${String(i.id).startsWith('c') ? `<button class="admin-del" onclick="deleteItem('${i.id}')">מחק 🗑️</button>` : ''}
        </div>`).join('');
};

document.addEventListener('DOMContentLoaded', () => {
    checkVersion();
    let solved = 0;

    document.body.addEventListener('input', (e) => {
        if (e.target.dataset.ans) {
            const input = e.target;
            if (parseInt(input.value) === parseInt(input.dataset.ans) && !input.classList.contains('correct')) {
                input.classList.add('correct');
                input.disabled = true;
                let s = parseInt(localStorage.getItem('math_coins')) || 0;
                s += (input.dataset.type === 'multiplication' || input.dataset.type === 'division') ? 3 : 1;
                localStorage.setItem('math_coins', s);
                solved++;
                document.getElementById('progress-bar').style.width = (solved * 10) + '%';
                if (solved >= 10) { 
                    confetti(); 
                    solved = 0; 
                    setTimeout(() => document.getElementById('progress-bar').style.width = '0%', 1000);
                }
                updateUI();
            } else if (input.value.length >= input.dataset.ans.length && parseInt(input.value) !== parseInt(input.dataset.ans)) {
                input.classList.add('incorrect');
                setTimeout(() => input.classList.remove('incorrect'), 500);
            }
        }
    });

    document.querySelectorAll('.tabs button:not(.reset-btn)').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
            document.querySelectorAll('.tabs button').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(`view-${btn.id.split('-')[1]}`).classList.remove('hidden');
            if (btn.id === 'tab-store') renderStore();
            if (btn.id === 'tab-inventory') {
                const my = JSON.parse(localStorage.getItem('math_items')) || [];
                document.getElementById('my-items').innerHTML = my.length ? my.map(i => `
                    <div class="store-item" style="border-color:var(--primary)">
                        <div style="font-size:2.5rem">${i.icon}</div>
                        <b>${i.name}</b>
                        <div style="font-size:0.75rem; color:#999; margin-top:8px;">נרכש ב: ${i.date}</div>
                    </div>`).join('') : '<p style="grid-column:1/-1; color:#999;">עוד לא קנית פרסים...</p>';
            }
        };
    });

    document.getElementById('reset-game-btn').onclick = () => {
        if (confirm("זה ימחק את כל המטבעות והפרסים. בטוח?")) {
            localStorage.clear();
            location.reload();
        }
    };

    ['addition', 'subtraction', 'multiplication', 'division'].forEach(t => window.refreshTable(t));
    updateUI();
});
