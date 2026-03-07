const CURRENT_VERSION = "3.2.0";

// --- פונקציות בסיס ---
window.checkVersion = (isManual = false) => {
    const saved = localStorage.getItem('app_version');
    if (saved && saved !== CURRENT_VERSION && !isManual) { location.reload(); }
    localStorage.setItem('app_version', CURRENT_VERSION);
    if (isManual) alert("גרסה 3.2.0 מעודכנת");
};

window.toggleSection = (id) => {
    const el = document.getElementById(id);
    el.classList.toggle('collapsed');
    const icon = el.previousElementSibling.querySelector('.toggle-icon');
    if(icon) icon.innerText = el.classList.contains('collapsed') ? '◀' : '▼';
};

// --- חנות וניהול הורים ---
const getDefaultItems = () => [
    { id: 'd1', name: '10 דק טלפון', price: 15, icon: '📱' },
    { id: 'd2', name: '20 דק משחק', price: 25, icon: '🎮' },
    { id: 'd3', name: 'גלידה טעימה', price: 40, icon: '🍦' },
    { id: 'd4', name: 'ממתק לבחירה', price: 10, icon: '🍭' },
    { id: 'd5', name: 'סרט עם פופקורן', price: 60, icon: '🍿' },
    { id: 'd6', name: 'מתנה בהפתעה', price: 100, icon: '🎁' }
];

window.toggleAdmin = () => {
    const panel = document.getElementById('admin-panel');
    panel.classList.toggle('hidden');
    if(!panel.classList.contains('hidden')) renderAdminList();
};

window.addNewItem = () => {
    const name = document.getElementById('new-item-name').value;
    const price = parseInt(document.getElementById('new-item-price').value);
    const icon = document.getElementById('new-item-icon').value;
    if (!name || !price) return;
    let custom = JSON.parse(localStorage.getItem('math_custom_store')) || [];
    custom.push({ id: "c" + Date.now(), name, price, icon });
    localStorage.setItem('math_custom_store', JSON.stringify(custom));
    document.getElementById('new-item-name').value = '';
    document.getElementById('new-item-price').value = '';
    renderStore();
    renderAdminList();
};

window.deleteItem = (id) => {
    if(confirm("למחוק את הפרס?")) {
        let custom = JSON.parse(localStorage.getItem('math_custom_store')) || [];
        custom = custom.filter(i => i.id !== id);
        localStorage.setItem('math_custom_store', JSON.stringify(custom));
        renderStore();
        renderAdminList();
    }
};

const renderAdminList = () => {
    const custom = JSON.parse(localStorage.getItem('math_custom_store')) || [];
    const container = document.getElementById('admin-manage-list');
    if (!container) return;
    container.innerHTML = custom.length ? custom.map(i => `
        <div class="manage-item-row">
            <span>${i.icon} ${i.name}</span>
            <button class="delete-btn" onclick="window.deleteItem('${i.id}')">🗑️</button>
        </div>`).join('') : '<p>אין פרסים אישיים.</p>';
};

window.buyItem = (id) => {
    let s = parseInt(localStorage.getItem('math_coins')) || 0;
    const all = [...getDefaultItems(), ...(JSON.parse(localStorage.getItem('math_custom_store')) || [])];
    const item = all.find(i => i.id == id);
    if (s >= item.price) {
        s -= item.price; localStorage.setItem('math_coins', s);
        let my = JSON.parse(localStorage.getItem('math_items')) || [];
        my.push({...item, date: new Date().toLocaleDateString('he-IL')});
        localStorage.setItem('math_items', JSON.stringify(my));
        updateUI(); renderStore(); alert("קנית בהצלחה!");
    } else { alert("חסרים לך מטבעות!"); }
};

// --- לוגיקה כללית ---
const updateUI = () => {
    const s = parseInt(localStorage.getItem('math_coins')) || 0;
    document.getElementById('score').innerText = s;
    document.getElementById('user-level').innerText = Math.floor(s/50)+1;
};

const renderStore = () => {
    const s = parseInt(localStorage.getItem('math_coins')) || 0;
    const custom = JSON.parse(localStorage.getItem('math_custom_store')) || [];
    const all = [...getDefaultItems(), ...custom];
    const container = document.getElementById('store-items');
    if (container) {
        container.innerHTML = all.map(i => `
            <div class="store-item"><div>${i.icon}</div><b>${i.name}</b><div>${i.price} 🪙</div>
            <button class="buy-btn" ${s < i.price ? 'disabled' : ''} onclick="window.buyItem('${i.id}')">קנה</button></div>
        `).join('');
    }
};

window.refreshTable = (type) => {
    const container = document.getElementById(`${type}-table`);
    if (!container) return; container.innerHTML = '';
    const range = (parseInt(localStorage.getItem('math_coins')) || 0) < 50 ? 10 : 20;
    for (let i = 0; i < 3; i++) {
        let n1, n2, ans, sym;
        if (type === 'addition') { n1 = Math.floor(Math.random()*range)+1; n2 = Math.floor(Math.random()*range)+1; ans = n1+n2; sym = '+'; }
        else if (type === 'subtraction') { n1 = Math.floor(Math.random()*range)+5; n2 = Math.floor(Math.random()*n1); ans = n1-n2; sym = '-'; }
        else if (type === 'multiplication') { n1 = Math.floor(Math.random()*9)+2; n2 = Math.floor(Math.random()*9)+2; ans = n1*n2; sym = '×'; }
        else if (type === 'division') { n2 = Math.floor(Math.random()*8)+2; let res = Math.floor(Math.random()*9)+1; n1 = n2 * res; ans = res; sym = '÷'; }
        container.innerHTML += `<div class="exercise-row"><span>${n1} ${sym} ${n2} =</span><input type="number" data-ans="${ans}" data-type="${type}"></div>`;
    }
};

let solvedCount = 0;
document.addEventListener('DOMContentLoaded', () => {
    checkVersion();
    document.body.addEventListener('input', (e) => {
        if (e.target.dataset.ans) {
            const input = e.target;
            if (parseInt(input.value) === parseInt(input.dataset.ans) && !input.classList.contains('correct')) {
                input.classList.add('correct'); input.disabled = true;
                let s = parseInt(localStorage.getItem('math_coins')) || 0;
                s += (input.dataset.type === 'multiplication' || input.dataset.type === 'division') ? 3 : 1;
                localStorage.setItem('math_coins', s);
                solvedCount++;
                let prog = (solvedCount % 10) * 10;
                if (prog === 0 && solvedCount > 0) prog = 100;
                document.getElementById('progress-bar').style.width = prog + '%';
                if (solvedCount % 10 === 0) { confetti(); setTimeout(() => document.getElementById('progress-bar').style.width = '0%', 1500); }
                updateUI();
            }
        }
    });

    document.querySelectorAll('.tabs button:not(#refresh-btn):not(#reset-game-btn)').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
            document.querySelectorAll('.tabs button').forEach(b => b.classList.remove('active'));
            btn.classList.add('active'); 
            document.getElementById(`view-${btn.id.split('-')[1]}`).classList.remove('hidden');
            if(btn.id === 'tab-store') renderStore();
            if(btn.id === 'tab-inventory') {
                const my = JSON.parse(localStorage.getItem('math_items')) || [];
                document.getElementById('my-items').innerHTML = my.map(i => `<div class="store-item"><div>${i.icon}</div><b>${i.name}</b><br><small>${i.date}</small></div>`).join('');
            }
        };
    });

    document.getElementById('reset-game-btn').onclick = () => { if(confirm("לאפס הכל?")) { localStorage.clear(); location.reload(); } };
    ['addition', 'subtraction', 'multiplication', 'division'].forEach(t => refreshTable(t));
    updateUI();
});
