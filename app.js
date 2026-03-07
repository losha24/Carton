const CURRENT_VERSION = "3.3.0";

// משוב שגיאה
const markWrong = (el) => {
    el.classList.add('wrong');
    setTimeout(() => el.classList.remove('wrong'), 800);
};

document.body.addEventListener('change', (e) => {
    if (e.target.dataset.ans) {
        const input = e.target;
        const val = parseInt(input.value);
        const ans = parseInt(input.dataset.ans);
        
        if (val === ans) {
            if (!input.classList.contains('correct')) {
                input.classList.add('correct');
                input.disabled = true;
                handleCorrectAnswer(input.dataset.type);
            }
        } else if (!isNaN(val)) {
            markWrong(input);
        }
    }
});

let solvedCount = 0;
function handleCorrectAnswer(type) {
    let s = parseInt(localStorage.getItem('math_coins')) || 0;
    s += (type === 'multiplication' || type === 'division') ? 3 : 1;
    localStorage.setItem('math_coins', s);
    
    solvedCount++;
    let prog = (solvedCount % 10) * 10;
    if (prog === 0 && solvedCount > 0) prog = 100;
    document.getElementById('progress-bar').style.width = prog + '%';
    
    if (solvedCount % 10 === 0) {
        confetti();
        setTimeout(() => document.getElementById('progress-bar').style.width = '0%', 1500);
    }
    updateUI();
}

// שאר הפונקציות (חנות, רענון וכו') נשארות כפי שהיו ב-3.2.0
// רק וידאתי שאין התנגשויות גלילה
window.toggleSection = (id) => {
    const el = document.getElementById(id);
    el.classList.toggle('collapsed');
};

window.checkVersion = (isManual = false) => {
    if (isManual) alert("גרסה 3.3.0 מעודכנת!");
    localStorage.setItem('app_version', CURRENT_VERSION);
};

window.refreshTable = (type) => {
    const container = document.getElementById(`${type}-table`);
    if (!container) return;
    container.innerHTML = '';
    const range = 10; 
    for (let i = 0; i < 3; i++) {
        let n1, n2, ans, sym;
        if (type === 'addition') { n1 = Math.floor(Math.random()*9)+1; n2 = Math.floor(Math.random()*9)+1; ans = n1+n2; sym = '+'; }
        else if (type === 'subtraction') { n1 = Math.floor(Math.random()*9)+5; n2 = Math.floor(Math.random()*n1); ans = n1-n2; sym = '-'; }
        else if (type === 'multiplication') { n1 = Math.floor(Math.random()*8)+2; n2 = Math.floor(Math.random()*8)+2; ans = n1*n2; sym = '×'; }
        else if (type === 'division') { n2 = Math.floor(Math.random()*7)+2; let res = Math.floor(Math.random()*8)+1; n1 = n2 * res; ans = res; sym = '÷'; }
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
    
    // ניווט
    document.querySelectorAll('.tabs button:not(#refresh-btn):not(#reset-game-btn)').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
            document.querySelectorAll('.tabs button').forEach(b => b.classList.remove('active'));
            btn.classList.add('active'); 
            document.getElementById(`view-${btn.id.split('-')[1]}`).classList.remove('hidden');
        };
    });
    
    document.getElementById('reset-game-btn').onclick = () => {
        if(confirm("לאפס את הכל?")) { localStorage.clear(); location.reload(); }
    };
});
