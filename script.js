const PASSWORD = "123";
const exercises = [
    { id: 1, name: "跑步", img: "running.jpg" },
    { id: 2, name: "伏地挺身", img: "pushup.jpg" },
    { id: 3, name: "深蹲", img: "squat.jpg" },
];

// 檢查是否需要重置（每週）
function checkWeeklyReset() {
    const lastReset = localStorage.getItem('lastResetDate');
    const now = new Date();
    
    // 獲取本週週一的日期
    const currentMonday = new Date(now);
    currentMonday.setDate(now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1));
    currentMonday.setHours(0, 0, 0, 0);

    if (!lastReset || new Date(lastReset) < currentMonday) {
        // 如果跨週了，重置所有打勾狀態
        const savedPlan = JSON.parse(localStorage.getItem('myExPlan')) || {};
        Object.keys(savedPlan).forEach(key => {
            savedPlan[key].completedDays = []; // 清空完成紀錄
        });
        localStorage.setItem('myExPlan', JSON.stringify(savedPlan));
        localStorage.setItem('lastResetDate', currentMonday.toISOString());
    }
}

function showMainPage() {
    document.querySelectorAll('.container').forEach(el => el.classList.add('hidden'));
    document.getElementById('main-page').classList.remove('hidden');
}

function enterEditMode() {
    const pass = prompt("請輸入密碼：");
    if (pass === PASSWORD) showEditPage();
    else alert("密碼錯誤！");
}

function showEditPage() {
    document.querySelectorAll('.container').forEach(el => el.classList.add('hidden'));
    const list = document.getElementById('exercise-list');
    const savedPlan = JSON.parse(localStorage.getItem('myExPlan')) || {};

    list.innerHTML = exercises.map(ex => `
        <div class="ex-item">
            <input type="checkbox" id="check-${ex.id}" ${savedPlan[ex.id] ? 'checked' : ''}>
            <img src="${ex.img}">
            <div class="input-group">
                <strong>${ex.name}</strong>
                次數/週: <input type="number" id="freq-${ex.id}" value="${savedPlan[ex.id]?.freq || 0}" min="0" max="7">
                時長(分): <input type="number" id="dur-${ex.id}" value="${savedPlan[ex.id]?.dur || 0}">
            </div>
        </div>
    `).join('');
    document.getElementById('edit-page').classList.remove('hidden');
}

function savePlan() {
    const newPlan = {};
    exercises.forEach(ex => {
        if (document.getElementById(`check-${ex.id}`).checked) {
            newPlan[ex.id] = {
                name: ex.name,
                img: ex.img,
                freq: parseInt(document.getElementById(`freq-${ex.id}`).value) || 0,
                dur: document.getElementById(`dur-${ex.id}`).value,
                completedDays: [] // 初始化點選紀錄
            };
        }
    });
    localStorage.setItem('myExPlan', JSON.stringify(newPlan));
    localStorage.setItem('lastResetDate', new Date().toISOString());
    alert("計畫已儲存！");
    showMainPage();
}

function showViewPage() {
    checkWeeklyReset(); // 開啟查看頁面時先檢查是否過期
    document.querySelectorAll('.container').forEach(el => el.classList.add('hidden'));
    const display = document.getElementById('plan-display');
    const savedPlan = JSON.parse(localStorage.getItem('myExPlan')) || {};
    const items = Object.entries(savedPlan);

    if (items.length === 0) {
        display.innerHTML = "<p>目前沒有計畫。</p>";
    } else {
        display.innerHTML = items.map(([id, item]) => {
            let boxes = '';
            for (let i = 0; i < item.freq; i++) {
                const isChecked = item.completedDays && item.completedDays.includes(i) ? 'checked' : '';
                boxes += `<input type="checkbox" class="progress-box" onclick="toggleBox('${id}', ${i})" ${isChecked}>`;
            }
            return `
                <div class="ex-item">
                    <img src="${item.img}">
                    <div>
                        <strong>${item.name}</strong> (${item.dur} 分鐘)<br>
                        <div class="checkbox-container">進度：${boxes}</div>
                    </div>
                </div>
            `;
        }).join('');
    }
    document.getElementById('view-page').classList.remove('hidden');
}

// 點選進度方框時即時儲存
function toggleBox(exId, boxIndex) {
    const savedPlan = JSON.parse(localStorage.getItem('myExPlan'));
    if (!savedPlan[exId].completedDays) savedPlan[exId].completedDays = [];
    
    const index = savedPlan[exId].completedDays.indexOf(boxIndex);
    if (index > -1) {
        savedPlan[exId].completedDays.splice(index, 1); // 取消選取
    } else {
        savedPlan[exId].completedDays.push(boxIndex); // 選取
    }
    localStorage.setItem('myExPlan', JSON.stringify(savedPlan));
}
