const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // 服务静态文件

// 存储贺词的文件路径
const GREETINGS_FILE = path.join(__dirname, 'greetings-data.json');

// 初始化贺词文件
async function initGreetingsFile() {
    try {
        await fs.access(GREETINGS_FILE);
    } catch {
        // 文件不存在，创建新文件
        const defaultGreetings = require('./default-greetings.json');
        await fs.writeFile(GREETINGS_FILE, JSON.stringify(defaultGreetings, null, 2));
    }
}

// 获取所有贺词
app.get('/api/greetings', async (req, res) => {
    try {
        const data = await fs.readFile(GREETINGS_FILE, 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        res.status(500).json({ error: 'Failed to read greetings' });
    }
});

// 添加新贺词
app.post('/api/greetings', async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) {
            return res.status(400).json({ error: 'Text is required' });
        }

        const data = JSON.parse(await fs.readFile(GREETINGS_FILE, 'utf8'));
        
        // 添加新贺词
        const newGreeting = {
            text,
            timestamp: Date.now()
        };
        
        data.greetings.push(newGreeting);
        
        // 如果贺词超过1000条，删除最旧的
        if (data.greetings.length > 1000) {
            data.greetings = data.greetings.slice(-1000);
        }
        
        // 保存到文件
        await fs.writeFile(GREETINGS_FILE, JSON.stringify(data, null, 2));
        
        res.json(newGreeting);
    } catch (error) {
        res.status(500).json({ error: 'Failed to add greeting' });
    }
});

// 启动服务器
initGreetingsFile().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
});
