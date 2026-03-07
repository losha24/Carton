// --- ניהול הורים ומוצרים ---
window.toggleAdmin = () => document.getElementById('admin-panel').classList.toggle('hidden');

window.addNewItem = () => {
    const name = document.getElementById('new-item-name').value;
    const price = parseInt(document.getElementById('new-item-price').value);
    const icon = document.getElementById('new-item-icon').value;
    if (!name || !price) return alert("נא להזין שם ומחיר");
    
    let customItems = JSON.parse(localStorage.getItem('math_custom_store')) || [];
    customItems.push({ id: "c" + Date.now(), name, price, icon });
    localStorage.setItem('math_custom_store', JSON.stringify(customItems));
    
    document.getElementById('new-item-name').value = '';
    document.getElementById('new-item-price').value = '';
    renderStore();
};

window.deleteItem = (id) => {
    if (confirm("למחוק את הפרס מהחנות?")) {
        let customItems = JSON.parse(localStorage.getItem('math_custom_store')) || [];
        customItems = customItems.filter(item => item.id != id);
        localStorage.setItem('math_custom_store', JSON.stringify(customItems));
        renderStore();
    }
};

window.buy = (id) => {
    let score = parseInt(localStorage.getItem('math_coins')) || 0;
    const all = [...getDefaultItems(), ...(JSON.parse(localStorage.getItem('math_custom_store')) || [])];
    const item = all.find(i => i.id == id);
    
    if (score >= item.price) {
        score -= item.price;
        localStorage.setItem('math_coins', score);
        let myItems = JSON.parse(localStorage.getItem('math_items')) || [];
        myItems.push({ ...item, date: new Date().toLocaleDateString() });
        localStorage.setItem('math_items', JSON.stringify(myItems));
        updateUI(); renderStore();
        alert(`קנית ${item.name}!`);
    } else {
        alert("אין לך מספיק מטבעות");
    }
};

const getDefaultItems = () => [
    {id: 'd1', name: '10 דקות משחק', price: 15, icon: '⏱️'},
    {id: 'd2', name: '20 דקות משחק', price: 25, icon: '⏲️'},
    {id: 'd3', name: 'גלידה', price: 50, icon: '🍦'}
];

// --- יצירת תרגילים (בדיקת לוגיקה) ---
window.refreshTable = (type) => {
    const container = document.getElementById(`${type}-table`);
    if (!container) return;
    container.innerHTML = '';
    const score = parseInt(localStorage.getItem('math_coins')) || 0;
    let range = score < 50 ? 10 : 25;

    for (let i = 0; i < 3; i++) {
        let n1, n2, ans, sym;
        if (type === 'addition') {
            let a = Math.floor(Math.random()*range)+1;
            let b = Math.floor(Math.random()*range)+1;
            n1 = Math.max(a, b); n2 = Math.min(a, b); // הגדול ראשון
            ans = n1 + n2; sym = '+';
        } else if (type === 'subtraction') {
            n1 = Math.floor(Math.random()*range)+5;
            n2 = Math.floor(Math.random()*n1)+1; // הקטן תמיד פחות מהגדול
            ans = n1 - n2; sym = '-';
        } else if (type === 'multiplication') {
            n1 = Math.floor(Math.random()*9)+2;
            n2 = Math.floor(Math.random()*9)+2;
            ans = n1 * n2; sym = '×';
        } else if (type === 'division') {
            n2 = Math.floor(Math.random()*8)+2;
            ans = Math.floor(Math.random()*9)+1;
            n1 = n2 * ans; sym = '÷';
        }
        const div = document.createElement('div');
        div.className = 'exercise-row';
        div.innerHTML = `<span>${n1} ${sym} ${n2} =</span><input type="number" data-ans="${ans}" data-type="${type}">`;
        container.appendChild(div);
    }
};

// --- אתחול וממשק ---
const updateUI = () => {
    const score = parseInt(localStorage.getItem('math_coins')) || 0;
    document.getElementById('score').innerText = score;
    document.getElementById('user-level').innerText = Math.floor(score / 50) + 1;
};

const renderStore = () => {
    const score = parseInt(localStorage.getItem('math_coins')) || 0;
    const custom = JSON.parse(localStorage.getItem('math_custom_store')) || [];
    const all = [...getDefaultItems(), ...custom];
    document.getElementById('store-items').innerHTML = all.map(item => `
        <div class="store-item">
            <div style="font-size:2rem">${item.icon}</div>
            <b>${item.name}</b><div>${item.price} 🪙</div>
            <button class="buy-btn" ${score < item.price ? 'disabled' : ''} onclick="buy('${item.id}')">קנה</button>
            ${String(item.id).startsWith('c') ? `<button class="admin-del" onclick="deleteItem('${item.id}')">🗑️</button>` : ''}
        </div>
    `).join('');
};

document.addEventListener('DOMContentLoaded', () => {
    let solvedCount = 0;
    document.body.addEventListener('input', (e) => {
        if (e.target.dataset.ans) {
            const input = e.target;
            if (parseInt(input.value) === parseInt(input.dataset.ans)) {
                if (!input.classList.contains('correct')) {
                    input.classList.add('correct'); input.disabled = true;
                    let score = parseInt(localStorage.getItem('math_coins')) || 0;
                    score += (input.dataset.type === 'multiplication' || input.dataset.type === 'division') ? 3 : 1;
                    localStorage.setItem('math_coins', score);
                    solvedCount++;
                    document.getElementById('progress-bar').style.width = (solvedCount * 10) + '%';
                    if (solvedCount >= 10) { confetti(); solvedCount = 0; }
                    updateUI();
                }
            }
        }
    });

    document.querySelectorAll('.tabs button:not(.reset-btn)').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
            document.querySelectorAll('.tabs button').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(`view-${btn.id.split('-')[1]}`).classList.remove('hidden');
            if(btn.id === 'tab-store') renderStore();
            if(btn.id === 'tab-inventory') {
                const myItems = JSON.parse(localStorage.getItem('math_items')) || [];
                document.getElementById('my-items').innerHTML = myItems.map(item => `<div class="store-item"><div>${item.icon}</div><b>${item.name}</b><div style="font-size:0.7rem">${item.date}</div></div>`).join('');
            }
        };
    });

    document.getElementById('reset-game-btn').onclick = () => { if(confirm("לאפס הכל?")) { localStorage.clear(); location.reload(); } };
    ['addition', 'subtraction', 'multiplication', 'division'].forEach(t => window.refreshTable(t));
    updateUI();
});
