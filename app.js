const CURRENT_VERSION = "3.5.9";

// פונקציית רענון ועדכון גרסה מהשרת
window.forceUpdate = () => {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(function(registrations) {
            for(let registration of registrations) {
                registration.update();
            }
        });
    }
    // רענון כפוי שעוקף זיכרון מטמון
    window.location.reload(true);
};

const state = {
    coins: parseInt(localStorage.getItem('math_coins')) || 0,
    solvedToday: 0,
    inventory: JSON.parse(localStorage.getItem('math_items')) || [],
    customStore: JSON.parse(localStorage.getItem('math_custom_store')) || []
};

// ניהול תצוגה
window.toggleSection = (id) => {
    const el = document.getElementById(id);
    const icon = document.getElementById('icon-' + id.split('-')[1]);
    el.classList.toggle('collapsed');
    if(icon) icon.innerText = el.classList.contains('collapsed') ? '◀' : '▼';
};

window.toggleAdmin = () => document.getElementById('admin-panel').classList.toggle('hidden');

// חנות ופרסים
const defaultItems = [
    { id: 'd1', name: '10 דק טלפון', price: 15, icon: '📱' },
    { id: 'd2', name: 'גלידה', price: 40, icon: '🍦' },
    { id: 'd3', name: 'ממתק', price: 10, icon: '🍭' }
];

window.addNewItem = () => {
    const name = document.getElementById('new-item-name').value;
    const price = parseInt(document.getElementById('new-item-price').value);
    const icon = document.getElementById('new-item-icon').value;
    if (!name || isNaN(price) || price <= 0) return alert("נא להזין שם פרס ומחיר תקין");
    
    state.customStore.push({ id: 'c' + Date.now(), name, price, icon });
    localStorage.setItem('math_custom_store', JSON.stringify(state.customStore));
    
    document.getElementById('new-item-name').value = '';
    document.getElementById('new-item-price').value = '';
    renderStore(); renderAdminList();
    alert("הפרס נוסף לחנות! 🎁");
};

window.deleteItem = (id) => {
    state.customStore = state.customStore.filter(i => i.id !== id);
    localStorage.setItem('math_custom_store', JSON.stringify(state.customStore));
    renderStore(); renderAdminList();
};

const renderAdminList = () => {
    const container = document.getElementById('admin-manage-list');
    container.innerHTML = state.customStore.map(i => `
        <div class="manage-item-row"><span>${i.icon} ${i.name}</span><button class="del-btn" onclick="deleteItem('${i.id}')">מחק</button></div>
    `).join('');
};

const renderStore = () => {
    const container = document.getElementById('store-items');
    const allItems = [...defaultItems, ...state.customStore];
    container.innerHTML = allItems.map(i => `
        <div class="store-item">
            <div style="font-size:2.5rem; margin-bottom:5px">${i.icon}</div>
            <b style="font-size:1.1rem">${i.name}</b><br>
            <span style="font-weight:bold; color:#2d3748">${i.price} 🪙</span>
            <button class="buy-btn" ${state.coins < i.price ? 'disabled' : ''} onclick="buyItem('${i.id}')">קנה</button>
        </div>
    `).join('');
};

window.buyItem = (id) => {
    const allItems = [...defaultItems, ...state.customStore];
    const item = allItems.find(i => i.id === id);
    if (state.coins >= item.price) {
        state.coins -= item.price;
        state.inventory.push({...item, date: new Date().toLocaleDateString('he-IL')});
        saveData(); updateUI(); renderStore();
        alert(`כל הכבוד! קנית ${item.name} ${item.icon}`);
    }
};

// מחולל תרגילים
window.refreshTable = (type) => {
    const container = document.getElementById(`${type}-table`);
    if (!container) return; container.innerHTML = '';
    for (let i = 0; i < 3; i++) {
        let n1, n2, ans, sym;
        if (type === 'addition') { n1 = Math.floor(Math.random()*15)+1; n2 = Math.floor(Math.random()*15)+1; ans = n1+n2; sym = '+'; }
        else if (type === 'subtraction') { n1 = Math.floor(Math.random()*15)+10; n2 = Math.floor(Math.random()*14)+1; ans = n1-n2; sym = '-'; }
        else if (type === 'multiplication') { n1 = Math.floor(Math.random()*8)+2; n2 = Math.floor(Math.random()*8)+2; ans = n1*n2; sym = '×'; }
        else if (type === 'division') { n2 = Math.floor(Math.random()*7)+2; ans = Math.floor(Math.random()*8)+1; n1 = n2 * ans; sym = '÷'; }
        container.innerHTML += `<div class="exercise-row"><span>${n1} ${sym} ${n2} =</span><input type="number" data-ans="${ans}" data-type="${type}"></div>`;
    }
};

const updateUI = () => {
    document.getElementById('score').innerText = state.coins;
    document.getElementById('user-level').innerText = Math.floor(state.coins/50)+1;
};

const saveData = () => {
    localStorage.setItem('math_coins', state.coins);
    localStorage.setItem('math_items', JSON.stringify(state.inventory));
};

document.body.addEventListener('change', (e) => {
    if (e.target.dataset.ans) {
        const input = e.target;
        if (parseInt(input.value) === parseInt(input.dataset.ans)) {
            input.classList.add('correct'); input.disabled = true;
            state.coins += (input.dataset.type.includes('multi') || input.dataset.type.includes('div')) ? 3 : 1;
            state.solvedToday++;
            let prog = (state.solvedToday % 10) * 10 || 100;
            document.getElementById('progress-bar').style.width = prog + '%';
            if (state.solvedToday % 10 === 0) { confetti(); }
            saveData(); updateUI();
        } else {
            input.classList.add('wrong');
            setTimeout(() => { input.classList.remove('wrong'); input.value = ''; }, 800);
        }
    }
});

document.addEventListener('DOMContentLoaded', () => {
    updateUI();
    ['addition', 'subtraction', 'multiplication', 'division'].forEach(t => refreshTable(t));
    
    document.querySelectorAll('.tabs button:not(.update-tab-btn):not(.reset-tab-btn)').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
            document.querySelectorAll('.tabs button').forEach(b => b.classList.remove('active'));
            btn.classList.add('active'); 
            document.getElementById(`view-${btn.id.split('-')[1]}`).classList.remove('hidden');
            if(btn.id === 'tab-store') { renderStore(); renderAdminList(); }
            if(btn.id === 'tab-inventory') {
                document.getElementById('my-items').innerHTML = state.inventory.map(i => `<div class="store-item"><div>${i.icon}</div><b>${i.name}</b><br><small>${i.date}</small></div>`).join('') || '<p style="grid-column:1/3;text-align:center">האוסף ריק</p>';
            }
        };
    });
    
    document.getElementById('reset-game-btn').onclick = () => { 
        if(confirm("בטוח שרוצים לאפס את כל המטבעות והפרסים? זה לא ניתן לביטול!")) { 
            localStorage.clear(); location.reload(); 
        }
    };
});
