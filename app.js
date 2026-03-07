document.addEventListener('DOMContentLoaded', () => {
    let score = parseInt(localStorage.getItem('math_coins')) || 0;
    let myItems = JSON.parse(localStorage.getItem('math_items')) || [];
    let solvedCount = 0;
    const targetCount = 12; // כמות תרגילים לסיום שלב

    // פונקציות עזר
    const updateUI = () => {
        document.getElementById('score').innerText = score;
        document.getElementById('user-level').innerText = Math.floor(score / 50) + 1;
        localStorage.setItem('math_coins', score);
        updateProgress();
    };

    const updateProgress = () => {
        const percent = (solvedCount / targetCount) * 100;
        document.getElementById('progress-bar').style.width = Math.min(percent, 100) + '%';
        document.getElementById('progress-text').innerText = 
            percent >= 100 ? "מעולה! סיימת את השלב 🏆" : `עוד ${targetCount - solvedCount} תרגילים לרמה הבאה`;
        
        if (solvedCount >= targetCount) {
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
            solvedCount = 0; // איפוס התקדמות לשלב הבא
        }
    };

    // יצירת תרגילים
    window.refreshTable = (type) => {
        const container = document.getElementById(`${type}-table`);
        container.innerHTML = '';
        let range = score < 50 ? 10 : 20;
        if (type === 'multiplication' || type === 'division') range = score < 100 ? 6 : 10;

        for (let i = 0; i < 3; i++) {
            let n1, n2, ans, sym;
            if (type === 'addition') { n1 = Math.floor(Math.random()*range)+1; n2 = Math.floor(Math.random()*range)+1; ans = n1+n2; sym = '+'; }
            else if (type === 'subtraction') { n1 = Math.floor(Math.random()*range)+5; n2 = Math.floor(Math.random()*n1)+1; ans = n1-n2; sym = '-'; }
            else if (type === 'multiplication') { n1 = Math.floor(Math.random()*range)+2; n2 = Math.floor(Math.random()*range)+2; ans = n1*n2; sym = '×'; }
            else if (type === 'division') { n2 = Math.floor(Math.random()*(range-1))+2; ans = Math.floor(Math.random()*(range-1))+1; n1 = n2*ans; sym = '÷'; }

            const div = document.createElement('div');
            div.className = 'exercise-row';
            div.innerHTML = `<span>${n1} ${sym} ${n2} =</span><input type="number" data-ans="${ans}" data-type="${type}">`;
            container.appendChild(div);
        }
    };

    // בדיקת תשובות
    document.body.addEventListener('input', (e) => {
        if (e.target.dataset.ans) {
            const input = e.target;
            const isAdvanced = (input.dataset.type === 'multiplication' || input.dataset.type === 'division');
            
            if (parseInt(input.value) === parseInt(input.dataset.ans)) {
                if (!input.classList.contains('correct')) {
                    input.classList.add('correct');
                    input.disabled = true;
                    score += isAdvanced ? 3 : 1;
                    solvedCount++;
                    updateUI();
                }
            } else if (input.value.length >= input.dataset.ans.length) {
                input.classList.add('incorrect');
                setTimeout(() => input.classList.remove('incorrect'), 500);
            }
        }
    });

    // ניווט וניהול חנות (נשאר דומה לגרסה קודמת אך מעודכן ויזואלית)
    const storeItems = [
        {id:1, name:'5 דקות מחשב', price:15, icon:'⏱️'},
        {id:2, name:'גלידה טעימה', price:30, icon:'🍦'},
        {id:3, name:'חצי שעה משחק', price:50, icon:'🎮'},
        {id:4, name:'מתנה קטנה', price:100, icon:'🎁'}
    ];

    window.buy = (id) => {
        const item = storeItems.find(i => i.id === id);
        if (score >= item.price) {
            score -= item.price;
            myItems.push({...item, date: new Date().toLocaleTimeString()});
            localStorage.setItem('math_items', JSON.stringify(myItems));
            updateUI(); renderStore();
        }
    };

    const renderStore = () => {
        document.getElementById('store-items').innerHTML = storeItems.map(item => `
            <div class="store-item">
                <div style="font-size:2rem">${item.icon}</div>
                <b>${item.name}</b>
                <div>${item.price} 🪙</div>
                <button class="buy-btn" ${score < item.price ? 'disabled' : ''} onclick="buy(${id=item.id})">קנה</button>
            </div>
        `).join('');
    };

    // אתחול
    ['addition', 'subtraction', 'multiplication', 'division'].forEach(t => window.refreshTable(t));
    updateUI();
});
