document.addEventListener('DOMContentLoaded', () => {
    let score = parseInt(localStorage.getItem('math_coins')) || 0;
    let myItems = JSON.parse(localStorage.getItem('math_items')) || [];
    let deferredPrompt;

    // --- רישום Service Worker עם מנגנון רענון ---
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js').then(reg => {
            reg.onupdatefound = () => {
                const installingWorker = reg.installing;
                installingWorker.onstatechange = () => {
                    if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        showUpdateNotification();
                    }
                };
            };
        });
    }

    function showUpdateNotification() {
        if (document.getElementById('update-toast')) return;
        const toast = document.createElement('div');
        toast.id = 'update-toast';
        toast.innerHTML = `<span>גרסה חדשה!</span><button onclick="window.location.reload(true)">עדכן</button>`;
        document.body.appendChild(toast);
    }

    // --- איפוס משחק ---
    document.getElementById('reset-game-btn').addEventListener('click', () => {
        if (confirm("האם אתה בטוח שברצונך לאפס הכל? כל המטבעות והפרסים יימחקו!")) {
            localStorage.clear();
            window.location.reload(true);
        }
    });

    // --- התקנה ---
    const installBtn = document.getElementById('install-btn');
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault(); deferredPrompt = e;
        installBtn.classList.remove('hidden');
    });

    installBtn.addEventListener('click', async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') installBtn.classList.add('hidden');
            deferredPrompt = null;
        }
    });

    const scoreEl = document.getElementById('score');
    const updateScore = () => { scoreEl.innerText = score; localStorage.setItem('math_coins', score); };

    const storeItems = [
        { id: 1, name: '5 דקות משחק', price: 10, icon: '⏱️' },
        { id: 2, name: '10 דקות משחק', price: 20, icon: '⏲️' },
        { id: 3, name: '15 דקות משחק', price: 30, icon: '⏳' },
        { id: 4, name: '20 דקות משחק', price: 40, icon: '⌛' }
    ];

    window.refreshTable = (type) => {
        const container = document.getElementById(`${type}-table`);
        container.innerHTML = '';
        const range = score < 20 ? 10 : (score < 60 ? 25 : 100);
        for (let i = 0; i < 5; i++) {
            let n1 = Math.floor(Math.random() * range) + 1;
            let n2 = Math.floor(Math.random() * range) + 1;
            if (type === 'subtraction' && n1 < n2) [n1, n2] = [n2, n1];
            const ans = type === 'addition' ? n1 + n2 : n1 - n2;
            const div = document.createElement('div');
            div.className = 'exercise-row';
            div.innerHTML = `<span>${n1} ${type === 'addition' ? '+' : '-'} ${n2} =</span><input type="number" data-ans="${ans}">`;
            container.appendChild(div);
        }
    };

    document.body.addEventListener('input', (e) => {
        if (e.target.dataset.ans) {
            const input = e.target;
            if (parseInt(input.value) === parseInt(input.dataset.ans)) {
                if (!input.classList.contains('correct')) {
                    input.classList.add('correct'); input.disabled = true;
                    score++; updateScore();
                }
            } else if (input.value.length >= input.dataset.ans.length) {
                input.classList.add('incorrect');
            }
        }
    });

    document.querySelectorAll('.tabs button:not(#install-btn):not(#reset-game-btn)').forEach(btn => {
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
            <div class="store-item"><div>${item.icon}</div><b>${item.name}</b><div>${item.price} 🪙</div>
            <button class="buy-btn" ${score < item.price ? 'disabled' : ''} onclick="buy(${item.id})">קנה</button></div>
        `).join('');
    };

    window.buy = (id) => {
        const item = storeItems.find(i => i.id === id);
        if (score >= item.price) {
            score -= item.price; myItems.push({...item, date: new Date().toLocaleDateString()});
            localStorage.setItem('math_items', JSON.stringify(myItems));
            updateScore(); renderStore();
        }
    };

    const renderInventory = () => {
        document.getElementById('my-items').innerHTML = myItems.map(item => `
            <div class="store-item"><div>${item.icon}</div><b>${item.name}</b><div style="font-size:0.7rem">${item.date}</div></div>
        `).join('');
    };

    window.refreshTable('addition'); window.refreshTable('subtraction'); updateScore();
});
