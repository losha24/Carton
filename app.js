const CURRENT_VERSION = "3.4.0";

// פתיחה וסגירה
window.toggleSection = (id) => {
    const content = document.getElementById(id);
    const icon = document.getElementById('icon-' + id.split('-')[1]);
    content.classList.toggle('collapsed');
    icon.innerText = content.classList.contains('collapsed') ? '◀' : '▼';
};

// חנות
const getDefaultItems = () => [
    { id: 'd1', name: '10 דק טלפון', price: 15, icon: '📱' },
    { id: 'd2', name: '20 דק משחק', price: 25, icon: '🎮' },
    { id: 'd3', name: 'גלידה', price: 40, icon: '🍦' },
    { id: 'd4', name: 'ממתק', price: 10, icon: '🍭' },
    { id: 'd5', name: 'סרט', price: 60, icon: '🍿' },
    { id: 'd6', name: 'הפתעה', price: 100, icon: '🎁' }
];

const renderStore = () => {
    const s = parseInt(localStorage.getItem('math_coins')) || 0;
    const custom = JSON.parse(localStorage.getItem('math_custom_store')) || [];
    const all = [...getDefaultItems(), ...custom];
    const container = document.getElementById('store-items');
    if (!container) return;
    container.innerHTML = all.map(i => `
        <div class="store-item"><div>${i.icon || '🎁'}</div><b>${i.name}</b><div>${i.price} 🪙</div>
        <button class="buy-btn" ${s < i.price ? 'disabled' : ''} onclick="window.buyItem('${i.id}')" 
        style="width:100%; background:var(--primary); color:white; border:none; padding:8px; border-radius:8px; margin-top:5px;">קנה</button></div>
    `).join('');
};

window.buyItem = (id) => {
    let s = parseInt(localStorage.getItem('math_coins')) || 0;
    const all = [...getDefaultItems(), ...(JSON.parse(localStorage.getItem('math_custom_store')) || [])];
    const item = all.find(i => i.id == id);
    if (s >= item.price) {
        s -= item.price; localStorage.setItem('math_coins', s);
        let my = JSON.parse(localStorage.getItem('math_items')) || [];
        my.push({...item, date: new Date().toLocaleDateString('he-IL')});
        localStorage.setItem('math_items', JSON.stringify(my));
        updateUI(); renderStore(); alert("תתחדש!");
    } else { alert("אין מספיק מטבעות!"); }
};

// לוגיקת תשובות
document.body.addEventListener('change', (e) => {
    if (e.target.dataset.ans) {
        const input = e.target;
        if (parseInt(input.value) === parseInt(input.dataset.ans)) {
            input.classList.add('correct'); input.disabled = true;
            handleCorrect(input.dataset.type);
        } else {
            input.classList.add('wrong');
            setTimeout(() => input.classList.remove('wrong'), 800);
        }
    }
});

let solvedCount = 0;
function handleCorrect(type) {
    let s = parseInt(localStorage.getItem('math_coins')) || 0;
    s += (type === 'multiplication' || type === 'division') ? 3 : 1;
    localStorage.setItem('math_coins', s);
    solvedCount++;
    let prog = (solvedCount % 10) * 10 || 100;
    document.getElementById('progress-bar').style.width = prog + '%';
    if (solvedCount % 10 === 0) { confetti(); setTimeout(() => document.getElementById('progress-bar').style.width = '0%', 1500); }
    updateUI();
}

window.refreshTable = (type) => {
    const container = document.getElementById(`${type}-table`);
    if (!container) return; container.innerHTML = '';
    for (let i = 0; i < 3; i++) {
        let n1 = Math.floor(Math.random()*10)+1, n2 = Math.floor(Math.random()*10)+1, ans, sym;
        if (type === 'addition') { ans = n1+n2; sym = '+'; }
        else if (type === 'subtraction') { n1=n1+n2; ans = n1-n2; sym = '-'; }
        else if (type === 'multiplication') { n1=Math.floor(Math.random()*8)+2; n2=Math.floor(Math.random()*8)+2; ans=n1*n2; sym='×'; }
        else if (type === 'division') { n2=Math.floor(Math.random()*7)+2; ans=Math.floor(Math.random()*8)+1; n1=n2*ans; sym='÷'; }
        container.innerHTML += `<div class="exercise-row"><span>${n1} ${sym} ${n2} =</span><input type="number" data-ans="${ans}" data-type="${type}"></div>`;
    }
};

const updateUI = () => {
    const s = parseInt(localStorage.getItem('math_coins')) || 0;
    document.getElementById('score').innerText = s;
    document.getElementById('user-level').innerText = Math.floor(s/50)+1;
};

document.addEventListener('DOMContentLoaded', () => {
    updateUI();
    ['addition', 'subtraction', 'multiplication', 'division'].forEach(t => refreshTable(t));
    document.querySelectorAll('.tabs button:not(#refresh-btn):not(#reset-game-btn)').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
            document.querySelectorAll('.tabs button').forEach(b => b.classList.remove('active'));
            btn.classList.add('active'); 
            document.getElementById(`view-${btn.id.split('-')[1]}`).classList.remove('hidden');
            if(btn.id === 'tab-store') renderStore();
            if(btn.id === 'tab-inventory') {
                const my = JSON.parse(localStorage.getItem('math_items')) || [];
                document.getElementById('my-items').innerHTML = my.map(i => `<div class="store-item"><div>${i.icon}</div><b>${i.name}</b></div>`).join('');
            }
        };
    });
    document.getElementById('reset-game-btn').onclick = () => { if(confirm("לאפס הכל?")) { localStorage.clear(); location.reload(); }};
});
