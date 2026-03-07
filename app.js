// 1. הגדרת פונקציות גלובליות מיד (מחוץ ל-DOMContentLoaded) כדי שה-HTML יזהה אותן תמיד
window.buy = function(id) {
    const score = parseInt(localStorage.getItem('math_coins')) || 0;
    const storeItems = [
        {id:1, name:'10 דקות משחק', price:15, icon:'⏱️'},
        {id:2, name:'גלידה טעימה', price:30, icon:'🍦'},
        {id:3, name:'חצי שעה מסך', price:50, icon:'🎮'},
        {id:4, name:'מתנה קטנה', price:100, icon:'🎁'}
    ];
    
    const item = storeItems.find(i => i.id === id);
    if (score >= item.price) {
        const newScore = score - item.price;
        localStorage.setItem('math_coins', newScore);
        
        let myItems = JSON.parse(localStorage.getItem('math_items')) || [];
        myItems.push({...item, date: new Date().toLocaleDateString()});
        localStorage.setItem('math_items', JSON.stringify(myItems));
        
        // רענון התצוגה
        window.dispatchEvent(new Event('scoreUpdated'));
        alert(`תתחדש! קנית ${item.name}`);
    } else {
        alert("אין לך מספיק מטבעות! תמשיך לפתור תרגילים 💪");
    }
};

window.refreshTable = function(type) {
    const container = document.getElementById(`${type}-table`);
    if (!container) return;
    container.innerHTML = '';
    
    const score = parseInt(localStorage.getItem('math_coins')) || 0;
    let range = score < 50 ? 10 : 25;
    if (type === 'multiplication' || type === 'division') range = score < 100 ? 6 : 10;

    for (let i = 0; i < 3; i++) {
        let n1, n2, ans, sym;
        if (type === 'addition') { 
            n1 = Math.floor(Math.random()*range)+1; n2 = Math.floor(Math.random()*range)+1; ans = n1+n2; sym = '+'; 
        } else if (type === 'subtraction') { 
            n1 = Math.floor(Math.random()*range)+5; n2 = Math.floor(Math.random()*n1)+1; ans = n1-n2; sym = '-'; 
        } else if (type === 'multiplication') { 
            n1 = Math.floor(Math.random()*range)+2; n2 = Math.floor(Math.random()*range)+2; ans = n1*n2; sym = '×'; 
        } else if (type === 'division') { 
            n2 = Math.floor(Math.random()*(range-1))+2; ans = Math.floor(Math.random()*(range-1))+1; n1 = n2*ans; sym = '÷'; 
        }

        const div = document.createElement('div');
        div.className = 'exercise-row';
        div.innerHTML = `<span>${n1} ${sym} ${n2} =</span><input type="number" data-ans="${ans}" data-type="${type}">`;
        container.appendChild(div);
    }
};

// 2. לוגיקה שרצה אחרי טעינת הדף
document.addEventListener('DOMContentLoaded', () => {
    let solvedCount = 0;
    const targetCount = 10;

    const updateUI = () => {
        const score = parseInt(localStorage.getItem('math_coins')) || 0;
        document.getElementById('score').innerText = score;
        document.getElementById('user-level').innerText = Math.floor(score / 50) + 1;
        
        const percent = (solvedCount / targetCount) * 100;
        document.getElementById('progress-bar').style.width = Math.min(percent, 100) + '%';
        
        // רענון החנות אם היא פתוחה
        if (!document.getElementById('view-store').classList.contains('hidden')) renderStore();
    };

    // האזנה לעדכון ניקוד ממקורות חיצוניים
    window.addEventListener('scoreUpdated', updateUI);

    // בדיקת תשובות
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
                    if (solvedCount >= targetCount) {
                        if (typeof confetti === 'function') confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
                        solvedCount = 0;
                    }
                    updateUI();
                }
            } else if (input.value.length >= input.dataset.ans.length) {
                input.classList.add('incorrect');
                setTimeout(() => input.classList.remove('incorrect'), 500);
            }
        }
    });

    // ניהול טאבים
    document.querySelectorAll('.tabs button:not(#install-btn):not(#reset-game-btn)').forEach(btn => {
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

    const renderStore = () => {
        const score = parseInt(localStorage.getItem('math_coins')) || 0;
        const storeItems = [
            {id:1, name:'10 דקות משחק', price:15, icon:'⏱️'},
            {id:2, name:'גלידה טעימה', price:30, icon:'🍦'},
            {id:3, name:'חצי שעה מסך', price:50, icon:'🎮'},
            {id:4, name:'מתנה קטנה', price:100, icon:'🎁'}
        ];
        document.getElementById('store-items').innerHTML = storeItems.map(item => `
            <div class="store-item">
                <div style="font-size:2rem">${item.icon}</div>
                <b>${item.name}</b>
                <div>${item.price} 🪙</div>
                <button class="buy-btn" ${score < item.price ? 'disabled' : ''} onclick="buy(${item.id})">קנה</button>
            </div>
        `).join('');
    };

    const renderInventory = () => {
        const myItems = JSON.parse(localStorage.getItem('math_items')) || [];
        document.getElementById('my-items').innerHTML = myItems.map(item => `
            <div class="store-item">
                <div style="font-size:2rem">${item.icon}</div>
                <b>${item.name}</b>
                <div style="font-size:0.7rem">${item.date}</div>
            </div>
        `).join('');
    };

    // איפוס
    document.getElementById('reset-game-btn').onclick = () => {
        if (confirm("לאפס הכל?")) { localStorage.clear(); location.reload(true); }
    };

    // אתחול ראשוני
    ['addition', 'subtraction', 'multiplication', 'division'].forEach(t => window.refreshTable(t));
    updateUI();
});
