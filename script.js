// 农历月份名称
const lunarMonths = ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊'];
const lunarDays = ['初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
    '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
    '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'];

// 当前时间是2024年12月30日，对应农历十一月三十
const currentLunarData = {
    date: new Date('2024-12-30T00:00:00+08:00'),
    month: 10, // 十一月
    day: 29    // 三十（数组索引从0开始）
};

// 农历新年是2025年正月初一，对应公历2025年1月29日
const lunarNewYear = new Date('2025-01-29T00:00:00+08:00');

function getLunarDate(date) {
    const diffDays = Math.floor((date - currentLunarData.date) / (24 * 60 * 60 * 1000));
    let month = currentLunarData.month;
    let day = currentLunarData.day + diffDays;

    // 处理日期变化
    const daysInMonth = 30; // 假设每月30天
    if (day >= daysInMonth) {
        day = day % daysInMonth;
        month++;
        if (month >= lunarMonths.length) {
            month = 0;
        }
    }

    return {
        month: lunarMonths[month],
        day: lunarDays[day]
    };
}

function updateLunarDate() {
    const now = new Date();
    const lunar = getLunarDate(now);
    document.querySelector('.lunar-date').textContent = `农历${lunar.month}月${lunar.day}`;
}

function updateYearTitle(isNewYear) {
    const glitchText = isNewYear ? '乙巳年' : '甲辰年';
    const glitchElement = document.querySelector('.glitch');
    glitchElement.textContent = glitchText;
    glitchElement.setAttribute('data-text', glitchText);
}

function updateCountdown() {
    const now = new Date();
    const diff = lunarNewYear - now;

    // 如果已经过了春节
    if (diff < 0) {
        document.querySelector('.message').innerHTML = '恭贺新春！';
        document.querySelectorAll('.number').forEach(el => el.textContent = '00');
        document.querySelector('.lunar-date').textContent = '农历正月初一';
        updateYearTitle(true); // 更新为乙巳年
        return;
    }

    // 更新为甲辰年
    updateYearTitle(false);

    // 计算剩余时间
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    // 更新显示
    document.getElementById('days').textContent = String(days).padStart(2, '0');
    document.getElementById('hours').textContent = String(hours).padStart(2, '0');
    document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
    document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');

    // 添加闪烁效果
    const numbers = document.querySelectorAll('.number');
    numbers.forEach(number => {
        if (Math.random() < 0.1) {
            number.style.textShadow = '0 0 20px rgba(255, 255, 255, 0.8)';
            setTimeout(() => {
                number.style.textShadow = '0 0 15px rgba(255, 255, 255, 0.5)';
            }, 50);
        }
    });
}

// 初始化和定时更新
function init() {
    updateLunarDate();
    updateCountdown();
    setInterval(updateLunarDate, 60000); // 每分钟更新农历日期
    setInterval(updateCountdown, 1000); // 每秒更新倒计时
}

// 添加鼠标移动效果
document.addEventListener('mousemove', (e) => {
    const { clientX, clientY } = e;
    const xPos = (clientX / window.innerWidth - 0.5) * 20;
    const yPos = (clientY / window.innerHeight - 0.5) * 20;
    
    document.querySelector('.container').style.transform = 
        `translate(${xPos}px, ${yPos}px)`;
});

// 启动应用
document.addEventListener('DOMContentLoaded', init);
