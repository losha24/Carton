// --- פונקציות ניהול חנות והורים (נגישות ל-HTML) ---
window.toggleAdmin = () => document.getElementById('admin-panel').classList.toggle('hidden');

window.addNewItem = () => {
    const name = document.getElementById('new-item-name').value;
    const price = parseInt(document.getElementById('new-item-price').value);
    const icon = document.getElementById('new-item-icon').value;
    
    if (!name || !price) return alert("אבא/אמא, נא להזין שם ומחיר לפרס");
    
    let customItems = JSON.parse(localStorage.getItem('math_custom_store')) || [];
    customItems.push({ id: Date.now(), name, price, icon });
    localStorage.setItem('math_custom_store', JSON.stringify(customItems));
    
    document.getElementById('new-item-name').value = '';
    document.getElementById('new-item-price').value = '';
    window.dispatchEvent(new Event('renderStore'));
};

window.buy = (id) => {
    let score = parseInt(localStorage.getItem('math_coins')) || 0;
    const allItems = [...getDefaultItems(), ...(JSON.parse(localStorage.getItem('math_custom_store')) || [])];
    const item = allItems.find(i => i.id == id);
    
    if (score >= item.price) {
        score -= item.price;
        localStorage.setItem('math_coins', score);
        let myItems = JSON.parse(localStorage.getItem('math_items')) || [];
        myItems.push({ ...item, date: new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) });
        localStorage.setItem('math_items', JSON.stringify(myItems));
        window.dispatchEvent(new Event('refreshUI'));
        alert(`איזה כיף! קנית: ${item.name}. הפרס מחכה לך ב'אוסף'!`);
    } else {
        alert("חסרים לך מטבעות! פתור עוד כמה תרגילים בהצלחה 💪");
    }
};

const getDefaultItems = () => [
    {id: 'd1', name: '10 דקות משחק', price: 15, icon: '⏱️'},
    {id: 'd2', name: '20 דקות משחק', price: 25, icon: '⏲️'},
    {id: 'd3', name: '30 דקות משחק', price: 35, icon: '⏳'},
    {id: 'd4', name: 'גלידה טעימה', price: 50, icon: '🍦'},
    {id: 'd5', name: 'חבילת קלפים', price: 40, icon: '🃏'},
    {id: 'd6', name: 'ביקור בפארק', price: 60, icon: '🌳'}
];

// --- לוגיקת התרגילים (בדיקה ותיקון לפי דרישת המשתמש) ---
window.refreshTable = (type) => {
    const container = document.getElementById(`${type}-table`);
    if (!container) return;
    container.innerHTML = '';
    
    const score = parseInt(localStorage.getItem('math_coins')) || 0;
    let range = score < 60 ? 10 : 25; // הקושי עולה עם הניקוד

    for (let i = 0; i < 3; i++) {
        let n1, n2, ans, sym;
        
        if (type === 'addition') { 
            // חיבור: הגדול ראשון, הקטן שני
            let a = Math.floor(Math.random() * range) + 1;
            let b = Math.floor(Math.random() * range) + 1;
            n1 = Math.max(a, b);
            n2 = Math.min(a, b);
            ans = n1 + n2; 
            sym = '+'; 
        } 
        else if (type === 'subtraction') { 
            // חיסור: הגדול פחות הקטן
            let a = Math.floor(Math.random() * range) + 5;
            let b = Math.floor(Math.random() * a) + 1;
            n1 = a; // תמיד הגדול
            n2 = b; // תמיד הקטן
            ans = n1 - n2; 
            sym = '-'; 
        } 
        else if (type === 'multiplication') { 
            n1 = Math.floor(Math.random() * 9) + 2; 
            n2 = Math.floor(Math.random() * 9) + 2; 
            ans = n1 * n2; 
            sym = '×'; 
        } 
        else if (type === 'division') { 
            ans = Math.floor(Math.random() * 9) + 1;
            n2 = Math.floor(Math.random() * 8) + 2; 
            n1 = n2 * ans; // מבטיח חילוק ללא שארית
            sym = '÷'; 
        }
        
        const div = document.createElement('div');
        div.className = 'exercise-row';
        div.innerHTML = `<span>${n1} ${sym} ${n2} =</span><input type="number" data-ans="${ans}" data-type="${type}">`;
        container.appendChild(div);
    }
};

// --- ניהול אירועים וממשק ---
document.addEventListener('DOMContentLoaded', () => {
    let solvedCount = 0;

    const updateUI = () => {
        const score = parseInt(localStorage.getItem('math_coins')) || 0;
        document.getElementById('score').innerText = score;
        document.getElementById('user-level').innerText = Math.floor(score / 50) + 1;
        document.getElementById('progress-bar').style.width = (solvedCount * 10) + '%';
        if (!document.getElementById('view-store').classList.contains('hidden')) renderStore();
    };

    window.addEventListener('refreshUI', updateUI);
    window.addEventListener('renderStore', () => renderStore());

    document.body.addEventListener('input', (e) => {
        if (e.target.dataset.ans) {
            const input = e.target;
            if (parseInt(input.value) === parseInt(input.dataset.ans)) {
                if (!input.classList.contains('correct')) {
                    input.classList.add('correct'); 
                    input.disabled = true;
                    let score = parseInt(localStorage.getItem('math_coins')) || 0;
                    const isAdv = (input.dataset.type === 'multiplication' || input.dataset.type === 'division');
                    score += isAdv ? 3 : 1;
                    localStorage.setItem('math_coins', score);
                    solvedCount++;
                    if (solvedCount >= 10) { 
                        if (typeof confetti === 'function') confetti({ particleCount: 150, spread: 70 });
                        solvedCount = 0; 
                    }
                    updateUI();
                }
            }
        }
    });

    const renderStore = () => {
        const score = parseInt(localStorage.getItem('math_coins')) || 0;
        const custom = JSON.parse(localStorage.getItem('math_custom_store')) || [];
        const all = [...getDefaultItems(), ...custom];
        document.getElementById('store-items').innerHTML = all.map(item => `
            <div class="store-item">
                <div style="font-size:2rem">${item.icon}</div>
                <b>${item.name}</b><div>${item.price} 🪙</div>
                <button class="buy-btn" ${score < item.price ? 'disabled' : ''} onclick="buy('${item.id}')">קנה</button>
            </div>
        `).join('');
    };

    const renderInventory = () => {
        const myItems = JSON.parse(localStorage.getItem('math_items')) || [];
        document.getElementById('my-items').innerHTML = myItems.length ? myItems.map(item => `
            <div class="store-item"><div>${item.icon}</div><b>${item.name}</b><div style="font-size:0.7rem">${item.date}</div></div>
        `).join('') : '<p style="grid-column: 1/3; color: #999;">עוד לא קנית פרסים... תתחיל לפתור!</p>';
    };

    document.querySelectorAll('.tabs button:not(.reset-btn)').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
            document.querySelectorAll('.tabs button').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(`view-${btn.id.split('-')[1]}`).classList.remove('hidden');
            if(btn.id === 'tab-store') renderStore();
            if(btn.id === 'tab-inventory') renderInventory();
        };
    });

    document.getElementById('reset-game-btn').onclick = () => { if(confirm("לאפס את כל המטבעות והפרסים? זה לא ניתן לביטול!")) { localStorage.clear(); location.reload(); } };
    
    // הפעלה ראשונית
    ['addition', 'subtraction', 'multiplication', 'division'].forEach(t => window.refreshTable(t));
    updateUI();
});
