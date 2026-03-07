/**
 * אלופי המתמטיקה PRO - גרסה 1.2.2
 * פותח עבור: אלכסיי זבודיסקר
 */

// --- ניהול מוצרים וחנות ---

// פתיחה וסגירה של פאנל ניהול הורים
window.toggleAdmin = () => {
    const panel = document.getElementById('admin-panel');
    panel.classList.toggle('hidden');
};

// הוספת מוצר חדש על ידי ההורים
window.addNewItem = () => {
    const nameInput = document.getElementById('new-item-name');
    const priceInput = document.getElementById('new-item-price');
    const iconInput = document.getElementById('new-item-icon');

    const name = nameInput.value.trim();
    const price = parseInt(priceInput.value);
    const icon = iconInput.value;

    if (!name || isNaN(price) || price <= 0) {
        alert("אבא/אמא, נא להזין שם פרס ומחיר תקין");
        return;
    }

    // יצירת מזהה ייחודי שמתחיל ב-c (מציין Custom)
    const newItem = {
        id: "c" + Date.now(),
        name: name,
        price: price,
        icon: icon
    };

    let customItems = JSON.parse(localStorage.getItem('math_custom_store')) || [];
    customItems.push(newItem);
    localStorage.setItem('math_custom_store', JSON.stringify(customItems));

    // איפוס שדות
    nameInput.value = '';
    priceInput.value = '';
    
    renderStore();
    alert("הפרס נוסף בהצלחה לחנות!");
};

// מחיקת מוצר מהחנות
window.deleteItem = (id) => {
    if (confirm("האם אתה בטוח שברצונך למחוק את הפרס הזה מהחנות?")) {
        let customItems = JSON.parse(localStorage.getItem('math_custom_store')) || [];
        customItems = customItems.filter(item => item.id != id);
        localStorage.setItem('math_custom_store', JSON.stringify(customItems));
        renderStore();
    }
};

// פונקציית הקנייה
window.buy = (id) => {
    let score = parseInt(localStorage.getItem('math_coins')) || 0;
    const allItems = [...getDefaultItems(), ...(JSON.parse(localStorage.getItem('math_custom_store')) || [])];
    const item = allItems.find(i => i.id == id);

    if (score >= item.price) {
        // ביצוע רכישה
        score -= item.price;
        localStorage.setItem('math_coins', score);

        // שמירה לאוסף האישי
        let myItems = JSON.parse(localStorage.getItem('math_items')) || [];
        myItems.push({
            ...item,
            purchaseDate: new Date().toLocaleDateString('he-IL')
        });
        localStorage.setItem('math_items', JSON.stringify(myItems));

        // עדכון ממשק
        updateUI();
        renderStore();
        
        if (typeof confetti === 'function') {
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        }
        alert(`תתחדש! קנית את: ${item.name}`);
    } else {
        alert("אופס! אין לך מספיק מטבעות. פתור עוד תרגילים!");
    }
};

// מוצרי ברירת מחדל
const getDefaultItems = () => [
    { id: 'd1', name: '10 דקות משחק', price: 15, icon: '⏱️' },
    { id: 'd2', name: '20 דקות משחק', price: 25, icon: '⏲️' },
    { id: 'd3', name: '30 דקות משחק', price: 35, icon: '⏳' },
    { id: 'd4', name: 'גלידה טעימה', price: 50, icon: '🍦' }
];

// --- לוגיקת תרגילים ---

window.refreshTable = (type) => {
    const container = document.getElementById(`${type}-table`);
    if (!container) return;
    container.innerHTML = '';

    const score = parseInt(localStorage.getItem('math_coins')) || 0;
    let range = score < 60 ? 10 : 20; // הקושי עולה מעט ככל שיש יותר כסף

    for (let i = 0; i < 3; i++) {
        let n1, n2, ans, sym;

        if (type === 'addition') {
            let a = Math.floor(Math.random() * range) + 1;
            let b = Math.floor(Math.random() * range) + 1;
            n1 = Math.max(a, b); n2 = Math.min(a, b); // הגדול ראשון
            ans = n1 + n2; sym = '+';
        } 
        else if (type === 'subtraction') {
            n1 = Math.floor(Math.random() * range) + 5;
            n2 = Math.floor(Math.random() * n1) + 1; // מבטיח תוצאה חיובית
            ans = n1 - n2; sym = '-';
        } 
        else if (type === 'multiplication') {
            n1 = Math.floor(Math.random() * 9) + 2;
            n2 = Math.floor(Math.random() * 9) + 2;
            ans = n1 * n2; sym = '×';
        } 
        else if (type === 'division') {
            n2 = Math.floor(Math.random() * 8) + 2;
            let res = Math.floor(Math.random() * 9) + 1;
            n1 = n2 * res; // מבטיח חילוק שלם
            ans = res; sym = '÷';
        }

        const div = document.createElement('div');
        div.className = 'exercise-row';
        div.innerHTML = `
            <span>${n1} ${sym} ${n2} =</span>
            <input type="number" data-ans="${ans}" data-type="${type}" placeholder="?">
        `;
        container.appendChild(div);
    }
};

// --- ניהול הממשק (UI) ---

const updateUI = () => {
    const score = parseInt(localStorage.getItem('math_coins')) || 0;
    document.getElementById('score').innerText = score;
    document.getElementById('user-level').innerText = Math.floor(score / 50) + 1;
};

const renderStore = () => {
    const score = parseInt(localStorage.getItem('math_coins')) || 0;
    const custom = JSON.parse(localStorage.getItem('math_custom_store')) || [];
    const all = [...getDefaultItems(), ...custom];
    
    const storeContainer = document.getElementById('store-items');
    if (!storeContainer) return;

    storeContainer.innerHTML = all.map(item => `
        <div class="store-item">
            <div style="font-size:2.5rem; margin-bottom:5px;">${item.icon}</div>
            <b style="display:block; margin-bottom:5px;">${item.name}</b>
            <div style="color: var(--secondary); font-weight:bold;">${item.price} 🪙</div>
            <button class="buy-btn" ${score < item.price ? 'disabled' : ''} onclick="buy('${item.id}')">
                ${score < item.price ? 'חסר כסף' : 'קנה עכשיו'}
            </button>
            ${String(item.id).startsWith('c') ? 
                `<button class="admin-del" onclick="deleteItem('${item.id}')" title="מחק מוצר">🗑️</button>` : ''}
        </div>
    `).join('');
};

const renderInventory = () => {
    const myItems = JSON.parse(localStorage.getItem('math_items')) || [];
    const container = document.getElementById('my-items');
    if (!container) return;

    if (myItems.length === 0) {
        container.innerHTML = '<p style="grid-column: 1/-1; text-align:center; color: #888; padding: 20px;">עוד לא קנית פרסים... הגיע זמן לפתור תרגילים!</p>';
        return;
    }

    container.innerHTML = myItems.map(item => `
        <div class="store-item" style="border-color: var(--primary);">
            <div style="font-size:2rem">${item.icon}</div>
            <b>${item.name}</b>
            <div style="font-size:0.75rem; color: #999; margin-top:5px;">נרכש ב: ${item.purchaseDate}</div>
        </div>
    `).join('');
};

// --- אתחול האפליקציה ---

document.addEventListener('DOMContentLoaded', () => {
    let solvedInSession = 0;

    // האזנה לתשובות
    document.body.addEventListener('input', (e) => {
        if (e.target.dataset.ans) {
            const input = e.target;
            const userAns = parseInt(input.value);
            const correctAns = parseInt(input.dataset.ans);

            if (userAns === correctAns) {
                if (!input.classList.contains('correct')) {
                    input.classList.remove('incorrect');
                    input.classList.add('correct');
                    input.disabled = true;

                    // הוספת ניקוד
                    let score = parseInt(localStorage.getItem('math_coins')) || 0;
                    const bonus = (input.dataset.type === 'multiplication' || input.dataset.type === 'division') ? 3 : 1;
                    score += bonus;
                    localStorage.setItem('math_coins', score);

                    // עדכון מד התקדמות
                    solvedInSession++;
                    const progress = Math.min(solvedInSession * 10, 100);
                    document.getElementById('progress-bar').style.width = progress + '%';

                    if (solvedInSession >= 10) {
                        confetti({ particleCount: 150, spread: 70 });
                        solvedInSession = 0;
                        setTimeout(() => {
                            document.getElementById('progress-bar').style.width = '0%';
                        }, 1000);
                    }
                    updateUI();
                }
            } else if (input.value.length >= input.dataset.ans.length) {
                // אם התשובה לא נכונה ואורך המספר תואם
                input.classList.add('incorrect');
                setTimeout(() => input.classList.remove('incorrect'), 500);
            }
        }
    });

    // ניהול טאבים
    document.querySelectorAll('.tabs button:not(.reset-btn)').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
            document.querySelectorAll('.tabs button').forEach(b => b.classList.remove('active'));
            
            btn.classList.add('active');
            const viewId = `view-${btn.id.split('-')[1]}`;
            document.getElementById(viewId).classList.remove('hidden');

            if(btn.id === 'tab-store') renderStore();
            if(btn.id === 'tab-inventory') renderInventory();
        };
    });

    // כפתור איפוס
    document.getElementById('reset-game-btn').onclick = () => {
        if (confirm("האם אתה בטוח שברצונך לאפס את כל ההתקדמות, המטבעות והפרסים?")) {
            localStorage.clear();
            location.reload();
        }
    };

    // הפעלה ראשונית
    ['addition', 'subtraction', 'multiplication', 'division'].forEach(t => window.refreshTable(t));
    updateUI();
});
