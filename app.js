document.addEventListener('DOMContentLoaded', () => {
    let score = parseInt(localStorage.getItem('math_coins')) || 0;
    let myItems = JSON.parse(localStorage.getItem('math_items')) || [];
    let deferredPrompt;

    // --- רישום Service Worker ---
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').then(() => console.log('SW Active'));
    }

    // --- טיפול בהתקנת PWA ---
    const installContainer = document.getElementById('install-container');
    const installBtn = document.getElementById('install-btn');

    window.addEventListener('beforeinstallprompt', (e) => {
        // מונע מהדפדפן להציג את הבאנר המקורי
        e.preventDefault();
        // שומר את האירוע כדי להפעיל אותו בלחיצה על הכפתור שלנו
        deferredPrompt = e;
        // מציג את כפתור ההתקנה מתחת לחנות
        installContainer.classList.remove('hidden');
    });

    installBtn.addEventListener('click', async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                console.log('User installed the app');
            }
            deferredPrompt = null;
            installContainer.classList.add('hidden');
        }
    });

    // --- שאר הלוגיקה (חנות, משחק וקושי) ---
    const storeItems = [
        { id: 1, name: '5 דקות משחק', price: 10, icon: '⏱️' },
        { id: 2, name: '10 דקות משחק', price: 20, icon: '⏲️' },
        { id: 3, name: '15 דקות משחק', price: 30, icon: '⏳' },
        { id: 4, name: '20 דקות משחק', price: 40, icon: '⌛' }
    ];

    const scoreEl = document.getElementById('score');
    const updateScore = () => {
        scoreEl.innerText = score;
        localStorage.setItem('math_coins', score);
    };

    window.refreshTable = (type) => {
        const container = document.getElementById(`${type}-table`);
        container.innerHTML = '';
        // קושי עולה: עד 10 מטבעות (טווח 10), עד 50 (טווח 20), מעל זה (טווח 50)
        const range = score < 10 ? 10 : (score < 50 ? 20 : 50);

        for (let i = 0; i < 5; i++) {
            let n1 = Math.floor(Math.random() * range) + 1;
            let n2 = Math.floor(Math.random() * range) + 1;
            if (type === 'subtraction' && n1 < n2) [n1, n2] = [n2, n1];
            
            const ans = type === 'addition' ? n1 + n2 : n1 - n2;
            const div = document.createElement('div');
            div.className = 'exercise-row';
            div.innerHTML = `<span>${n1} ${type === 'addition' ? '+' : '-'} ${n2} =</span>
                            <input type="number" data-ans="${ans}">`;
            container.appendChild(div);
        }
    };

    document.body.addEventListener('input', (e) => {
        if (e.target.dataset.ans) {
            const input = e.target;
            const correct = parseInt(input.dataset.ans);
            const user = parseInt(input.value);
            if (user === correct && !input.classList.contains('correct')) {
                input.classList.add('correct');
                input.disabled = true;
                score++;
                updateScore();
            } else if (input.value.length >= input.dataset.ans.length && user !== correct) {
                input.classList.add('incorrect');
            } else {
                input.classList.remove('incorrect');
            }
        }
    });

    // ניווט
    document.querySelectorAll('.tabs button').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
            document.querySelectorAll('.tabs button').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(`view-${btn.id.split('-')[1]}`).classList.remove('hidden');
            if(btn.id === 'tab-store') renderStore();
            if(btn.id === 'tab-inventory') renderInventory();
        });
    });

    const renderStore = () => {
        document.getElementById('store-items').innerHTML = storeItems.map(item => `
            <div class="store-item">
                <div class="icon">${item.icon}</div>
                <div>${item.name}</div>
                <div style="color:var(--secondary); font-weight:bold">${item.price} 🪙</div>
                <button class="buy-btn" ${score < item.price ? 'disabled' : ''} onclick="buy(${item.id})">קנה</button>
            </div>
        `).join('');
    };

    window.buy = (id) => {
        const item = storeItems.find(i => i.id === id);
        if (score >= item.price) {
            score -= item.price;
            myItems.push({...item, date: new Date().toLocaleDateString()});
            localStorage.setItem('math_items', JSON.stringify(myItems));
            updateScore();
            renderStore();
        }
    };

    const renderInventory = () => {
        document.getElementById('my-items').innerHTML = myItems.map(item => `
            <div class="store-item"><div class="icon">${item.icon}</div><div>${item.name}</div><div style="font-size:0.7em">${item.date}</div></div>
        `).join('');
    };

    window.refreshTable('addition');
    window.refreshTable('subtraction');
    updateScore();
});
