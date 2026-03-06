document.addEventListener('DOMContentLoaded', () => {
    // --- State (מצב המערכת) ---
    let score = parseInt(localStorage.getItem('mathScore')) || 0;
    let inventory = JSON.parse(localStorage.getItem('mathInventory')) || [];

    // הגדרת הפרסים בחנות - תוכל לשנות ולעדכן אותם בעתיד בקלות
    const storeItems = [
        { id: 'medal_bronze', name: 'מדליית ארד', cost: 5, icon: '🥉' },
        { id: 'medal_silver', name: 'מדליית כסף', cost: 10, icon: '🥈' },
        { id: 'medal_gold', name: 'מדליית זהב', cost: 20, icon: '🥇' },
        { id: 'crown', name: 'כתר מלכותי', cost: 35, icon: '👑' },
        { id: 'rocket', name: 'חללית', cost: 50, icon: '🚀' },
        { id: 'diamond', name: 'יהלום נדיר', cost: 100, icon: '💎' }
    ];

    const scoreElement = document.getElementById('score');
    updateScoreDisplay();

    // --- ניווט בין המסכים ---
    const tabs = ['play', 'store', 'inventory'];
    tabs.forEach(tab => {
        document.getElementById(`tab-${tab}`).addEventListener('click', () => {
            // עדכון כפתורי הניווט
            tabs.forEach(t => document.getElementById(`tab-${t}`).classList.remove('active'));
            document.getElementById(`tab-${tab}`).classList.add('active');
            
            // עדכון התצוגה
            tabs.forEach(t => document.getElementById(`view-${t}`).classList.add('hidden'));
            const activeView = document.getElementById(`view-${tab}`);
            activeView.classList.remove('hidden');
            activeView.classList.add('active-view');

            // רינדור התוכן הרלוונטי
            if (tab === 'store') renderStore();
            if (tab === 'inventory') renderInventory();
        });
    });

    // --- לוגיקת המשחק והתרגילים ---
    function generateExercise(type) {
        let num1, num2, answer;
        if (type === 'addition') {
            num1 = Math.floor(Math.random() * 10) + 1;
            num2 = Math.floor(Math.random() * 10) + 1;
            answer = num1 + num2;
            return { text: `${num1} + ${num2} = `, answer: answer };
        } else {
            num1 = Math.floor(Math.random() * 10) + 5; 
            num2 = Math.floor(Math.random() * num1) + 1;
            answer = num1 - num2;
            return { text: `${num1} - ${num2} = `, answer: answer };
        }
    }

    function renderExercises(containerId, type, count) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';
        
        for (let i = 0; i < count; i++) {
            const ex = generateExercise(type);
            const row = document.createElement('div');
            row.className = 'exercise-row';
            row.innerHTML = `
                <span>${ex.text}</span>
                <input type="number" data-answer="${ex.answer}">
            `;
            container.appendChild(row);
        }
    }

    function checkAnswers(e) {
        if (e.target.tagName === 'INPUT') {
            const input = e.target;
            const correctAnswer = parseInt(input.getAttribute('data-answer'));
            const userAnswer = parseInt(input.value);

            if (isNaN(userAnswer)) {
                input.className = '';
                return;
            }

            if (userAnswer === correctAnswer) {
                if (!input.classList.contains('correct')) {
                    input.className = 'correct';
                    input.disabled = true; // נועל את התא כדי למנוע ספירה כפולה
                    addScore(1);
                }
            } else {
                input.className = 'incorrect';
            }
        }
    }

    function addScore(points) {
        score += points;
        saveData();
    }

    function saveData() {
        localStorage.setItem('mathScore', score);
        localStorage.setItem('mathInventory', JSON.stringify(inventory));
        updateScoreDisplay();
    }

    function updateScoreDisplay() {
        scoreElement.innerText = score;
    }

    document.getElementById('addition-table').addEventListener('input', checkAnswers);
    document.getElementById('subtraction-table').addEventListener('input', checkAnswers);

    document.getElementById('refresh-exercises-btn').addEventListener('click', () => {
        renderExercises('addition-table', 'addition', 5);
        renderExercises('subtraction-table', 'subtraction', 5);
    });

    // --- לוגיקת חנות הפרסים ---
    function renderStore() {
        const storeContainer = document.getElementById('store-items');
        storeContainer.innerHTML = '';

        storeItems.forEach(item => {
            const isBought = inventory.includes(item.id);
            const canAfford = score >= item.cost;
            
            const el = document.createElement('div');
            el.className = 'store-item';
            el.innerHTML = `
                <div class="icon">${item.icon}</div>
                <div class="name">${item.name}</div>
                <div class="price">${isBought ? 'נרכש ✅' : item.cost + ' 🪙'}</div>
                <button class="buy-btn" ${isBought || !canAfford ? 'disabled' : ''}>
                    ${isBought ? 'כבר שלך' : (canAfford ? 'קנה עכשיו' : 'חסרים מטבעות')}
                </button>
            `;

            if (!isBought && canAfford) {
                el.querySelector('.buy-btn').addEventListener('click', () => buyItem(item));
            }
            storeContainer.appendChild(el);
        });
    }

    function buyItem(item) {
        if (score >= item.cost && !inventory.includes(item.id)) {
            score -= item.cost;
            inventory.push(item.id);
            saveData();
            renderStore(); // רענון תצוגת החנות לאחר קנייה
        }
    }

    // --- לוגיקת המלאי (הפרסים שלי) ---
    function renderInventory() {
        const invContainer = document.getElementById('my-items');
        invContainer.innerHTML = '';

        if (inventory.length === 0) {
            invContainer.innerHTML = '<p style="text-align:center; grid-column: 1 / -1; font-size:1.2em;">עדיין לא קנית פרסים. פתור תרגילים כדי להרוויח מטבעות!</p>';
            return;
        }

        inventory.forEach(itemId => {
            const item = storeItems.find(i => i.id === itemId);
            if (item) {
                const el = document.createElement('div');
                el.className = 'store-item';
                el.innerHTML = `
                    <div class="icon">${item.icon}</div>
                    <div class="name">${item.name}</div>
                `;
                invContainer.appendChild(el);
            }
        });
    }

    // אתחול המערכת בפעם הראשונה
    renderExercises('addition-table', 'addition', 5);
    renderExercises('subtraction-table', 'subtraction', 5);
});
