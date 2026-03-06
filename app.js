document.addEventListener('DOMContentLoaded', () => {
    let score = parseInt(localStorage.getItem('math_coins')) || 0;
    let myItems = JSON.parse(localStorage.getItem('math_items')) || [];

    const storeItems = [
        { id: 1, name: 'גלידה', price: 5, icon: '🍦' },
        { id: 2, name: 'כדורגל', price: 10, icon: '⚽' },
        { id: 3, name: 'גיטרה', price: 20, icon: '🎸' },
        { id: 4, name: 'מכונית', price: 50, icon: '🏎️' },
        { id: 5, name: 'רובוט', price: 100, icon: '🤖' }
    ];

    const scoreEl = document.getElementById('score');
    const updateScore = () => {
        scoreEl.innerText = score;
        localStorage.setItem('math_coins', score);
    };

    const renderExercises = () => {
        ['addition', 'subtraction'].forEach(type => {
            const container = document.getElementById(`${type}-table`);
            container.innerHTML = '';
            for (let i = 0; i < 5; i++) {
                let n1 = Math.floor(Math.random() * 10) + 1;
                let n2 = Math.floor(Math.random() * 10) + 1;
                if (type === 'subtraction' && n1 < n2) [n1, n2] = [n2, n1];
                
                const ans = type === 'addition' ? n1 + n2 : n1 - n2;
                const div = document.createElement('div');
                div.className = 'exercise-row';
                div.innerHTML = `<span>${n1} ${type === 'addition' ? '+' : '-'} ${n2} =</span>
                                <input type="number" data-ans="${ans}">`;
                container.appendChild(div);
            }
        });
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
                <div>${item.name}</div>
                <div>${item.price} 🪙</div>
                <button class="buy-btn" ${score < item.price ? 'disabled' : ''} onclick="buy(${item.id})">קנה</button>
            </div>
        `).join('');
    };

    window.buy = (id) => {
        const item = storeItems.find(i => i.id === id);
        if (score >= item.price) {
            score -= item.price;
            myItems.push(item);
            localStorage.setItem('math_items', JSON.stringify(myItems));
            updateScore();
            renderStore();
        }
    };

    const renderInventory = () => {
        const container = document.getElementById('my-items');
        container.innerHTML = myItems.map(item => `
            <div class="store-item"><div class="icon">${item.icon}</div><div>${item.name}</div></div>
        `).join('');
    };

    document.getElementById('refresh-exercises-btn').addEventListener('click', renderExercises);
    renderExercises();
    updateScore();
});
