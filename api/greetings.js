// Load the greetings data
const fs = require('fs');
const path = require('path');

let greetings = [];
try {
    const dataPath = path.join(process.cwd(), 'greetings-data.json');
    const defaultPath = path.join(process.cwd(), 'default-greetings.json');
    
    // Try to load existing greetings, fall back to defaults if none exist
    if (fs.existsSync(dataPath)) {
        greetings = JSON.parse(fs.readFileSync(dataPath, 'utf8')).greetings;
    } else if (fs.existsSync(defaultPath)) {
        greetings = JSON.parse(fs.readFileSync(defaultPath, 'utf8')).greetings;
    }
} catch (error) {
    console.error('Error loading greetings:', error);
}

export default function handler(req, res) {
    if (req.method === 'GET') {
        // Return all greetings
        res.status(200).json({ greetings });
    } else if (req.method === 'POST') {
        // Add new greeting
        const { text } = req.body;
        if (!text) {
            return res.status(400).json({ error: 'Text is required' });
        }

        const newGreeting = {
            text,
            timestamp: new Date().toISOString()
        };

        greetings.push(newGreeting);

        // Keep only the latest 1000 greetings
        if (greetings.length > 1000) {
            greetings = greetings.slice(-1000);
        }

        // Try to save to file if we're in development
        try {
            const dataPath = path.join(process.cwd(), 'greetings-data.json');
            fs.writeFileSync(dataPath, JSON.stringify({ greetings }, null, 2));
        } catch (error) {
            console.error('Error saving greetings:', error);
        }

        res.status(200).json(newGreeting);
    } else {
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
