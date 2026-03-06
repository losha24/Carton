document.addEventListener('DOMContentLoaded', () => {
    let score = parseInt(localStorage.getItem('math_coins')) || 0;
    let myItems = JSON.parse(localStorage.getItem('math_items')) || [];

    const storeItems = [
        { id: 1, name: '5 דקות משחק', price: 10, icon: '⏱️' },
        { id: 2, name: '10 דקות משחק', price: 20, icon: '⏲️' },
        { id: 3, name: '15 דקות משחק', price: 30, icon: '⏳' },
        { id: 4, name: '20 דקות משחק', price: 40, icon: '⌛' },
        { id: 5, name: 'גלידה וירטואלית', price: 5, icon: '🍦' },
        { id: 6, name: 'כדור זהב', price: 100, icon: '⚽' }
    ];

    const scoreEl = document.getElementById('score');
    
    const updateScore = () => {
        scoreEl.innerText = score;
        localStorage.setItem('math_coins', score);
    };

    // פונקציה לחישוב קושי לפי הניקוד
    const getDifficultyRange = () => {
        if (score < 20) return 10;      // תרגילים עד 10
        if (score < 50) return 20;      // תרגילים עד 20
        if (score < 100) return 50;     // תרגילים עד 50
        return 100;                     // תרגילים עד 100 (רמה קשה)
    };

    window.refreshTable = (type) => {
        const container = document.getElementById(`${type}-table`);
        container.innerHTML = '';
        const range = getDifficultyRange();

        for (let i = 0; i < 5; i++) {
            let n1 = Math.floor(Math.random() * range) + 1;
            let n2 = Math.floor(Math.random() * range) + 1;
            
            if (type === 'subtraction' && n1 < n2) [n1, n2] = [n2, n1];
            
            const ans = type === 'addition' ? n1 + n2 : n1 - n2;
            const div = document.createElement('div');
            div.className = 'exercise-row';
            div.innerHTML = `
                <span>${n1} ${type === 'addition' ? '+' : '-'} ${n2} =</span>
                <input type="number" data-ans="${ans}">
            `;
            container.appendChild(div);
        }
    };

    document.body.addEventListener('input', (e) => {
        if (e.target.dataset.ans) {
            const input = e.target;
            const correct = parseInt(input.dataset.ans);
            const user = parseInt(input.value);

            if (user === correct) {
                if (!input.classList.contains('correct')) {
                    input.classList.add('correct');
                    input.disabled = true;
                    score++;
                    updateScore();
                }
            } else if (input.value.length >= input.dataset.ans.length) {
                input.classList.add('incorrect');
            } else {
                input.classList.remove('incorrect');
            }
        }
    });

    // ניווט טאבים
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
        const container = document.getElementById('store-items');
        container.innerHTML = storeItems.map(item => `
            <div class="store-item">
                <div class="icon">${item.icon}</div>
                <div style="font-weight:bold">${item.name}</div>
                <div class="price-label">${item.price} 🪙</div>
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
            alert(`קנית ${item.name}! תתחדש!`);
        }
    };

    const renderInventory = () => {
        const container = document.getElementById('my-items');
        if (myItems.length === 0) {
            container.innerHTML = '<p style="grid-column: 1/-1; text-align:center">עוד לא קנית כלום, רוץ לפתור תרגילים!</p>';
            return;
        }
        container.innerHTML = myItems.map(item => `
            <div class="store-item">
                <div class="icon">${item.icon}</div>
                <div>${item.name}</div>
                <div style="font-size:0.7em; color:#999">${item.date}</div>
            </div>
        `).join('');
    };

    // אתחול
    window.refreshTable('addition');
    window.refreshTable('subtraction');
    updateScore();
});
