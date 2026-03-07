const CURRENT_VERSION = "3.5.1";

// --- ניהול תצוגה וגרסה ---
window.checkVersion = (manual) => {
    if(manual) alert("גרסה 3.5.1 מעודכנת ✅");
    localStorage.setItem('app_version', CURRENT_VERSION);
};

window.toggleSection = (id) => {
    const el = document.getElementById(id);
    const icon = document.getElementById('icon-' + id.split('-')[1]);
    el.classList.toggle('collapsed');
    if(icon) icon.innerText = el.classList.contains('collapsed') ? '◀' : '▼';
};

window.toggleAdmin = () => document.getElementById('admin-panel').classList.toggle('hidden');

// --- חנות וניהול הורים ---
const defaultItems = [
    { id: 'd1', name: '10 דק טלפון', price: 15, icon: '📱' },
    { id: 'd2', name: '20 דק משחק', price: 25, icon: '🎮' },
    { id: 'd3', name: 'גלידה', price: 40, icon: '🍦' },
    { id: 'd4', name: 'ממתק', price: 10, icon: '🍭' },
    { id: 'd5', name: 'סרט', price: 60, icon: '🍿' },
    { id: 'd6', name: 'הפתעה', price: 100, icon: '🎁' }
];

const getItems = () => [...defaultItems, ...(JSON.parse(localStorage.getItem('math_custom_store')) || [])];

window.addNewItem = () => {
    const name = document.getElementById('new-item-name').value;
    const price = parseInt(document.getElementById('new-item-price').value);
    const icon = document.getElementById('new-item-icon').value;
    
    if (!name || isNaN(price) || price <= 0) {
        alert("נא להזין שם תקין ומחיר מעל 0");
        return;
    }
    
    let custom = JSON.parse(localStorage.getItem('math_custom_store')) || [];
    custom.push({ id: 'c' + Date.now(), name, price, icon });
    localStorage.setItem('math_custom_store', JSON.stringify(custom));
    
    // איפוס שדות
    document.getElementById('new-item-name').value = '';
    document.getElementById('new-item-price').value = '';
    
    renderStore(); renderAdminList();
    alert("הפרס נוסף בהצלחה!");
};

window.deleteItem = (id) => {
    if(!confirm("למחוק את הפרס הזה?")) return;
    let custom = JSON.parse(localStorage.getItem('math_custom_store')) || [];
    custom = custom.filter(i => i.id !== id);
    localStorage.setItem('math_custom_store', JSON.stringify(custom));
    renderStore(); renderAdminList();
};

const renderAdminList = () => {
    const custom = JSON.parse(localStorage.getItem('math_custom_store')) || [];
    const container = document.getElementById('admin-manage-list');
    if(!container) return;
    container.innerHTML = custom.length ? '<b>פרסים שהוספת:</b>' + custom.map(i => `
        <div class="manage-item-row"><span>${i.icon} ${i.name}</span><button class="del-btn" onclick="deleteItem('${i.id}')">מחק 🗑️</button></div>
    `).join('') : '<p>אין פרסים אישיים ברשימה.</p>';
};

const renderStore = () => {
    const coins = parseInt(localStorage.getItem('math_coins')) || 0;
    const container = document.getElementById('store-items');
    if(!container) return;
    container.innerHTML = getItems().map(i => `
        <div class="store-item">
            <div style="font-size:2.5rem; margin-bottom:5px;">${i.icon}</div>
            <b style="font-size:1.1rem">${i.name}</b><br>
            <span style="color:#2d3748; font-weight:bold;">${i.price} 🪙</span>
            <button class="buy-btn" ${coins < i.price ? 'disabled' : ''} onclick="buyItem('${i.id}')">קנה</button>
        </div>
    `).join('');
};

window.buyItem = (id) => {
    let coins = parseInt(localStorage.getItem('math_coins')) || 0;
    const item = getItems().find(i => i.id === id);
    if (coins >= item.price) {
        coins -= item.price;
        localStorage.setItem('math_coins', coins);
        let my = JSON.parse(localStorage.getItem('math_items')) || [];
        my.push({...item, date: new Date().toLocaleDateString('he-IL')});
        localStorage.setItem('math_items', JSON.stringify(my));
        updateUI(); renderStore(); alert(`תתחדש! קנית ${item.name} ${item.icon}`);
    }
};

// --- משחק ותרגילים ---
let solvedCount = 0;
window.refreshTable = (type) => {
    const container = document.getElementById(`${type}-table`);
    if (!container) return; container.innerHTML = '';
    for (let i = 0; i < 3; i++) {
        let n1, n2, ans, sym;
        if (type === 'addition') { n1 = Math.floor(Math.random()*10)+1; n2 = Math.floor(Math.random()*10)+1; ans = n1+n2; sym = '+'; }
        else if (type === 'subtraction') { n1 = Math.floor(Math.random()*10)+10; n2 = Math.floor(Math.random()*9)+1; ans = n1-n2; sym = '-'; }
        else if (type === 'multiplication') { n1 = Math.floor(Math.random()*8)+2; n2 = Math.floor(Math.random()*8)+2; ans = n1*n2; sym = '×'; }
        else if (type === 'division') { n2 = Math.floor(Math.random()*7)+2; ans = Math.floor(Math.random()*8)+1; n1 = n2 * ans; sym = '÷'; }
        container.innerHTML += `<div class="exercise-row"><span>${n1} ${sym} ${n2} =</span><input type="number" data-ans="${ans}" data-type="${type}"></div>`;
    }
};

const updateUI = () => {
    const coins = parseInt(localStorage.getItem('math_coins')) || 0;
    document.getElementById('score').innerText = coins;
    document.getElementById('user-level').innerText = Math.floor(coins/50)+1;
};

document.body.addEventListener('change', (e) => {
    if (e.target.dataset.ans) {
        const input = e.target;
        if (parseInt(input.value) === parseInt(input.dataset.ans)) {
            input.classList.add('correct'); input.disabled = true;
            let coins = parseInt(localStorage.getItem('math_coins')) || 0;
            coins += (input.dataset.type === 'multiplication' || input.dataset.type === 'division') ? 3 : 1;
            localStorage.setItem('math_coins', coins);
            solvedCount++;
            let prog = (solvedCount % 10) * 10 || 100;
            document.getElementById('progress-bar').style.width = prog + '%';
            if (solvedCount % 10 === 0) { confetti(); setTimeout(() => document.getElementById('progress-bar').style.width = '0%', 1500); }
            updateUI();
        } else {
            input.classList.add('wrong');
            setTimeout(() => { input.classList.remove('wrong'); input.value = ''; }, 800);
        }
    }
});

document.addEventListener('DOMContentLoaded', () => {
    updateUI();
    ['addition', 'subtraction', 'multiplication', 'division'].forEach(t => refreshTable(t));
    
    document.querySelectorAll('.tabs button:not(#refresh-btn):not(#reset-game-btn)').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
            document.querySelectorAll('.tabs button').forEach(b => b.classList.remove('active'));
            btn.classList.add('active'); 
            const viewId = `view-${btn.id.split('-')[1]}`;
            document.getElementById(viewId).classList.remove('hidden');
            if(btn.id === 'tab-store') { renderStore(); renderAdminList(); }
            if(btn.id === 'tab-inventory') {
                const my = JSON.parse(localStorage.getItem('math_items')) || [];
                document.getElementById('my-items').innerHTML = my.length ? my.map(i => `<div class="store-item"><div>${i.icon}</div><b>${i.name}</b><br><small>${i.date}</small></div>`).join('') : '<p style="grid-column:1/3;text-align:center">האוסף שלך ריק</p>';
            }
        };
    });
    document.getElementById('reset-game-btn').onclick = () => { if(confirm("למחוק הכל ולהתחיל מהתחלה?")) { localStorage.clear(); location.reload(); }};
});
