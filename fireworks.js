class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.velocity = {
            x: (Math.random() - 0.5) * 8,
            y: Math.random() * -8 - 2
        };
        this.alpha = 1;
        this.decay = Math.random() * 0.015 + 0.015;
        this.gravity = 0.2;
        this.size = Math.random() * 3 + 2;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    update() {
        this.velocity.y += this.gravity;
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.alpha -= this.decay;
        return this.alpha > 0;
    }
}

class Rocket {
    constructor(x, targetX, targetY) {
        this.x = x;
        this.y = window.innerHeight;
        this.targetX = targetX;
        this.targetY = targetY;
        this.speed = 15;
        this.angle = Math.atan2(targetY - this.y, targetX - this.x);
        this.velocity = {
            x: Math.cos(this.angle) * this.speed,
            y: Math.sin(this.angle) * this.speed
        };
        this.trail = [];
        this.trailLength = 10;
        this.color = `hsl(${Math.random() * 360}, 100%, 70%)`;
        this.size = 3;
    }

    draw(ctx) {
        // 绘制火箭尾迹
        for (let i = 0; i < this.trail.length; i++) {
            const pos = this.trail[i];
            const alpha = i / this.trail.length;
            ctx.save();
            ctx.globalAlpha = alpha * 0.6; // 降低尾迹透明度
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, this.size * alpha, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // 绘制火箭主体
        ctx.save();
        ctx.globalAlpha = 0.8; // 降低火箭主体透明度
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    update() {
        // 更新尾迹
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > this.trailLength) {
            this.trail.shift();
        }

        // 更新位置
        this.x += this.velocity.x;
        this.y += this.velocity.y;

        // 检查是否到达目标
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance > 10;
    }
}

class FireworksManager {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.rockets = [];
        this.isActive = false;

        // 设置画布
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '9999'; // 将z-index设置为很高的值
        document.body.appendChild(this.canvas);

        // 调整画布大小
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        // 添加点击事件
        document.addEventListener('click', (e) => this.createRocket(e));
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createRocket(e) {
        // 在点击位置x轴附近的随机位置发射
        const randomOffset = (Math.random() - 0.5) * 100; // 最大偏移±50像素
        const startX = Math.max(0, Math.min(this.canvas.width, e.clientX + randomOffset));
        this.rockets.push(new Rocket(startX, e.clientX, e.clientY));
        
        if (!this.isActive) {
            this.isActive = true;
            this.animate();
        }
    }

    explode(x, y) {
        const particleCount = 100;
        const color = `hsl(${Math.random() * 360}, 100%, 70%)`;
        for (let i = 0; i < particleCount; i++) {
            this.particles.push(new Particle(x, y, color));
        }
    }

    animate() {
        // 使用透明背景清除画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 更新和绘制火箭
        for (let i = this.rockets.length - 1; i >= 0; i--) {
            const rocket = this.rockets[i];
            rocket.draw(this.ctx);
            if (!rocket.update()) {
                this.explode(rocket.x, rocket.y);
                this.rockets.splice(i, 1);
            }
        }

        // 更新和绘制粒子
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.draw(this.ctx);
            if (!particle.update()) {
                this.particles.splice(i, 1);
            }
        }

        // 继续动画或停止
        if (this.particles.length > 0 || this.rockets.length > 0) {
            requestAnimationFrame(() => this.animate());
        } else {
            this.isActive = false;
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }
}

// 初始化烟花管理器
window.addEventListener('load', () => {
    new FireworksManager();
});
