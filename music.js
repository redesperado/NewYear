class MusicController {
    constructor() {
        this.isMuted = false;
        this.setupAudio();
        this.setupUI();
    }

    setupAudio() {
        this.audio = new Audio('assets/music/background.mp3');
        this.audio.loop = true;
        
        // 用户交互后自动播放
        document.addEventListener('click', () => {
            if (!this.isMuted && this.audio.paused) {
                this.audio.play().catch(e => console.log('Audio play failed:', e));
            }
        }, { once: true });
    }

    setupUI() {
        const musicControl = document.createElement('div');
        musicControl.className = 'music-control';
        musicControl.innerHTML = `
            <div class="music-icon playing">
                <div class="note-icon">♪</div>
            </div>
        `;
        document.body.appendChild(musicControl);

        const musicIcon = musicControl.querySelector('.music-icon');
        musicIcon.addEventListener('click', () => this.toggleMute());

        // 添加样式
        const style = document.createElement('style');
        style.textContent = `
            .music-control {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
            }

            .music-icon {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: rgba(0, 0, 0, 0.6);
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.3s ease;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
            }

            .music-icon:hover {
                transform: scale(1.1);
                background: rgba(0, 0, 0, 0.8);
            }

            .note-icon {
                color: #FFD700;
                font-size: 24px;
                text-shadow: 0 0 5px rgba(255, 215, 0, 0.8);
            }

            .music-icon.playing .note-icon {
                animation: musicBounce 1s infinite ease-in-out;
            }

            .music-icon.muted .note-icon {
                animation: none;
                opacity: 0.5;
            }

            @keyframes musicBounce {
                0%, 100% {
                    transform: translateY(0);
                }
                50% {
                    transform: translateY(-5px);
                }
            }
        `;
        document.head.appendChild(style);
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        const musicIcon = document.querySelector('.music-icon');
        
        if (this.isMuted) {
            this.audio.pause();
            musicIcon.classList.remove('playing');
            musicIcon.classList.add('muted');
        } else {
            this.audio.play().catch(e => console.log('Audio play failed:', e));
            musicIcon.classList.add('playing');
            musicIcon.classList.remove('muted');
        }
    }
}

// 初始化音乐控制器
window.addEventListener('load', () => {
    new MusicController();
});
