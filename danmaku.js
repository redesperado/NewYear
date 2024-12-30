class DanmakuManager {
    constructor() {
        this.danmakuList = [];
        this.maxDanmaku = 1000;
        this.lanes = 10;
        this.activeDanmaku = new Set();
        this.isVisible = false;
        this.tips = [
            "来发条贺词，祝福新年！",
            "写下你的新年愿望~",
            "给大家说句吉利话！",
            "新年快乐，说说心里话",
            "来，一起送上新春祝福",
            "新的一年，说说心愿吧",
            "来写个祝福，带来好运气",
            "送上你的新年贺词吧",
            "一起来发弹幕庆新年",
            "写个祝福，传递温暖"
        ];
        this.currentTipIndex = 0;
        
        // 根据环境设置API基础URL
        this.apiBaseUrl = window.location.hostname === 'localhost' 
            ? 'http://localhost:3000/api'
            : '/api';  // 在生产环境中使用相对路径

        this.setupUI();
        this.setupCanvas();
        this.loadEmoji();
        this.loadGreetings();
        this.animate();
        this.startTipAnimation();
        
        // 定期刷新贺词
        setInterval(() => this.loadGreetings(), 30000); // 每30秒刷新一次
    }

    async loadGreetings() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/greetings`);
            if (!response.ok) throw new Error('Failed to fetch greetings');
            
            const data = await response.json();
            // 转换数据格式并随机分配位置和颜色
            this.danmakuList = data.greetings.map(greeting => ({
                text: greeting.text,
                x: Math.random() * window.innerWidth,
                y: Math.floor(Math.random() * this.lanes) * 40 + 40,
                speed: 2 + Math.random() * 2,
                color: `hsl(${Math.random() * 360}, 100%, 70%)`,
                timestamp: greeting.timestamp,
                active: true
            }));
        } catch (error) {
            console.error('Failed to load greetings:', error);
        }
    }

    async addDanmaku(text) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/greetings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text })
            });

            if (!response.ok) throw new Error('Failed to add greeting');

            const newGreeting = await response.json();
            const danmaku = {
                text: newGreeting.text,
                x: window.innerWidth, // Start from the right edge of the screen
                y: Math.floor(Math.random() * this.lanes) * 40 + 40,
                speed: 2 + Math.random() * 2,
                color: `hsl(${Math.random() * 360}, 100%, 70%)`,
                timestamp: newGreeting.timestamp,
                active: true // Add active flag
            };

            this.danmakuList.push(danmaku);
            if (this.danmakuList.length > this.maxDanmaku) {
                this.danmakuList.shift();
            }
        } catch (error) {
            console.error('Failed to add danmaku:', error);
        }
    }

    setupUI() {
        // 创建输入区域容器
        const inputContainer = document.createElement('div');
        inputContainer.className = 'danmaku-input-container';
        inputContainer.innerHTML = `
            <div class="danmaku-toggle-icon">
                <div class="lantern">
                    <div class="lantern-top">◠</div>
                    <div class="lantern-body">
                        <div class="lantern-light">福</div>
                    </div>
                    <div class="lantern-bottom">▼</div>
                </div>
                <div class="tip-bubble"></div>
            </div>
            <div class="danmaku-content" style="display: none;">
                <div class="danmaku-header">
                    <span>贺岁弹幕</span>
                </div>
                <div class="danmaku-input-area">
                    <div class="emoji-picker"></div>
                    <div class="input-group">
                        <input type="text" placeholder="发送新年祝福..." maxlength="50">
                        <button class="send-btn">发送</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(inputContainer);

        // 阻止点击事件冒泡
        inputContainer.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        // 设置事件监听
        const toggleIcon = inputContainer.querySelector('.danmaku-toggle-icon');
        const content = inputContainer.querySelector('.danmaku-content');
        const input = inputContainer.querySelector('input');
        const sendBtn = inputContainer.querySelector('.send-btn');

        toggleIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            this.isVisible = !this.isVisible;
            content.style.display = this.isVisible ? 'block' : 'none';
            toggleIcon.classList.toggle('active');
            // 点击时隐藏气泡
            const bubble = toggleIcon.querySelector('.tip-bubble');
            bubble.style.display = 'none';
        });

        sendBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.sendDanmaku(input);
        });

        input.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        input.addEventListener('keypress', (e) => {
            e.stopPropagation();
            if (e.key === 'Enter') this.sendDanmaku(input);
        });
    }

    startTipAnimation() {
        const showTip = () => {
            if (this.isVisible) return; // 如果输入框已展开，不显示提示

            const bubble = document.querySelector('.tip-bubble');
            if (!bubble) return;

            // 随机选择一条提示语
            this.currentTipIndex = Math.floor(Math.random() * this.tips.length);
            bubble.textContent = this.tips[this.currentTipIndex];
            
            // 显示气泡
            bubble.style.display = 'block';
            bubble.style.animation = 'none';
            bubble.offsetHeight; // 触发重排
            bubble.style.animation = 'tipIn 0.5s ease forwards';

            // 3秒后隐藏气泡
            setTimeout(() => {
                bubble.style.animation = 'tipOut 0.5s ease forwards';
            }, 3000);
        };

        // 立即显示第一个提示
        showTip();
        // 每5秒显示一次提示
        setInterval(showTip, 5000);
    }

    setupCanvas() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.className = 'danmaku-canvas';
        document.body.appendChild(this.canvas);
        
        // 设置画布大小
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    loadEmoji() {
        // 添加常用表情
        const emojiList = ['😊', '🎉', '✨', '🎊', '💖', '🌟', '🎆', '🎇', '🏮', '💝', '🐉', '🧧'];
        const emojiPicker = document.querySelector('.emoji-picker');
        
        emojiList.forEach(emoji => {
            const span = document.createElement('span');
            span.textContent = emoji;
            span.addEventListener('click', (e) => {
                e.stopPropagation(); // 阻止冒泡
                const input = document.querySelector('.danmaku-input-container input');
                input.value += emoji;
                input.focus();
            });
            emojiPicker.appendChild(span);
        });
    }

    sendDanmaku(input) {
        const text = input.value.trim();
        if (text) {
            this.addDanmaku(text);
            input.value = '';
        }
    }

    animate() {
        // Clear the entire canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update and draw danmaku
        this.danmakuList.forEach(danmaku => {
            // Update position
            danmaku.x -= danmaku.speed;

            // If danmaku is off screen, reset to right side
            if (danmaku.x < -this.ctx.measureText(danmaku.text).width) {
                danmaku.x = this.canvas.width;
                // Randomize the vertical position and speed for variety
                danmaku.y = Math.floor(Math.random() * this.lanes) * 40 + 40;
                danmaku.speed = 2 + Math.random() * 2;
            }

            // Draw danmaku
            this.ctx.save();
            this.ctx.fillStyle = danmaku.color;
            this.ctx.font = '24px "Microsoft YaHei"';
            this.ctx.fillText(danmaku.text, danmaku.x, danmaku.y);
            this.ctx.restore();
        });

        requestAnimationFrame(() => this.animate());
    }
}

// 更新样式
const style = document.createElement('style');
style.textContent = `
    .danmaku-canvas {
        position: fixed;
        top: 0;
        left: 0;
        pointer-events: none;
        z-index: 1000;
    }

    .danmaku-input-container {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 10000;
        font-family: "Microsoft YaHei";
    }

    .danmaku-toggle-icon {
        position: relative;
        width: 50px;
        height: 60px;
        cursor: pointer;
        transition: transform 0.3s ease;
    }

    .lantern {
        position: relative;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        animation: swinging 3s ease-in-out infinite;
        transform-origin: top center;
    }

    .lantern-top {
        color: #FFD700;
        font-size: 20px;
        height: 10px;
        text-shadow: 0 0 5px #FF4D4D;
    }

    .lantern-body {
        width: 40px;
        height: 40px;
        background: linear-gradient(135deg, #FF4D4D 0%, #FF0000 100%);
        border-radius: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 0 15px rgba(255, 77, 77, 0.6);
        position: relative;
        overflow: hidden;
    }

    .lantern-body::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: radial-gradient(circle at center, rgba(255, 255, 255, 0.3) 0%, transparent 70%);
        animation: glowing 2s ease-in-out infinite;
    }

    .lantern-light {
        color: #FFD700;
        font-size: 24px;
        text-shadow: 0 0 5px rgba(255, 215, 0, 0.8);
        animation: floating 2s ease-in-out infinite;
    }

    .lantern-bottom {
        color: #FFD700;
        font-size: 12px;
        height: 10px;
        text-shadow: 0 0 5px #FF4D4D;
    }

    @keyframes swinging {
        0%, 100% {
            transform: rotate(5deg);
        }
        50% {
            transform: rotate(-5deg);
        }
    }

    @keyframes floating {
        0%, 100% {
            transform: translateY(-2px);
        }
        50% {
            transform: translateY(2px);
        }
    }

    @keyframes glowing {
        0%, 100% {
            opacity: 0.5;
        }
        50% {
            opacity: 0.8;
        }
    }

    .danmaku-toggle-icon:hover .lantern {
        animation: swinging 1.5s ease-in-out infinite;
    }

    .danmaku-toggle-icon.active .lantern {
        animation: none;
        transform: scale(0.9);
    }

    .tip-bubble {
        display: none;
        position: absolute;
        top: -70px;
        right: 0;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 14px;
        white-space: nowrap;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        z-index: 10001;
    }

    .tip-bubble::after {
        content: '';
        position: absolute;
        bottom: -6px;
        left: 50%;
        margin-left: -6px;
        width: 12px;
        height: 12px;
        background: rgba(0, 0, 0, 0.8);
        transform: rotate(45deg);
    }

    @keyframes tipIn {
        from {
            opacity: 0;
            transform: translateY(10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    @keyframes tipOut {
        from {
            opacity: 1;
            transform: translateY(0);
        }
        to {
            opacity: 0;
            transform: translateY(-10px);
        }
    }

    .danmaku-content {
        position: absolute;
        bottom: 60px;
        right: 0;
        width: 300px;
        background: rgba(0, 0, 0, 0.8);
        border-radius: 10px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
        overflow: hidden;
        transition: transform 0.3s ease;
    }

    .danmaku-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px;
        color: #fff;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .danmaku-input-area {
        padding: 10px;
    }

    .emoji-picker {
        display: flex;
        flex-wrap: wrap;
        gap: 5px;
        margin-bottom: 10px;
        padding: 5px;
        border-radius: 5px;
        background: rgba(255, 255, 255, 0.1);
    }

    .emoji-picker span {
        cursor: pointer;
        font-size: 20px;
        padding: 2px;
        transition: transform 0.2s;
    }

    .emoji-picker span:hover {
        transform: scale(1.2);
    }

    .input-group {
        display: flex;
        gap: 5px;
    }

    .input-group input {
        flex: 1;
        padding: 8px;
        border: none;
        border-radius: 5px;
        background: rgba(255, 255, 255, 0.9);
        font-size: 14px;
    }

    .input-group .send-btn {
        padding: 8px 15px;
        border: none;
        border-radius: 5px;
        background: #ff3860;
        color: white;
        cursor: pointer;
        transition: background 0.3s;
    }

    .input-group .send-btn:hover {
        background: #ff1443;
    }

    @keyframes slideIn {
        from {
            transform: translateY(20px);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }

    .danmaku-content {
        animation: slideIn 0.3s ease;
    }
`;
document.head.appendChild(style);

// 初始化弹幕系统
window.addEventListener('load', () => {
    new DanmakuManager();
});
