const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 41102;

const MOODS = [
  { key: 'guilty', label: '愧疚', emoji: '😔', color: '#ff6b6b' },
  { key: 'regret', label: '遗憾', emoji: '😢', color: '#ffa94d' },
  { key: 'relieved', label: '释然', emoji: '😊', color: '#51cf66' },
  { key: 'anxious', label: '不安', emoji: '😰', color: '#4dabf7' },
  { key: 'sad', label: '难过', emoji: '😭', color: '#9775fa' },
  { key: 'grateful', label: '感恩', emoji: '🙏', color: '#f06595' }
];

const DATA_DIR = path.join(__dirname, 'data');
const SECRETS_FILE = path.join(DATA_DIR, 'secrets.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

if (!fs.existsSync(SECRETS_FILE)) {
  fs.writeFileSync(SECRETS_FILE, JSON.stringify([]));
}

app.use(cors());
app.use(express.json());

function readSecrets() {
  const data = fs.readFileSync(SECRETS_FILE, 'utf8');
  return JSON.parse(data);
}

function writeSecrets(secrets) {
  fs.writeFileSync(SECRETS_FILE, JSON.stringify(secrets, null, 2));
}

app.get('/api/moods', (req, res) => {
  res.json({ moods: MOODS });
});

app.post('/api/secrets', (req, res) => {
  try {
    const { content, mood } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: '秘密内容不能为空' });
    }

    if (mood && !MOODS.some(m => m.key === mood)) {
      return res.status(400).json({ error: '无效的心情选择' });
    }

    const secrets = readSecrets();
    const newSecret = {
      id: uuidv4(),
      content: content.trim(),
      mood: mood || null,
      status: '已宽恕',
      createdAt: new Date().toISOString()
    };

    secrets.push(newSecret);
    writeSecrets(secrets);

    res.json({
      success: true,
      message: '你的秘密已被宽恕',
      secret: newSecret
    });
  } catch (error) {
    console.error('保存秘密时出错:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

app.get('/api/secrets/random', (req, res) => {
  try {
    const { mood } = req.query;
    const secrets = readSecrets();
    let forgivenSecrets = secrets.filter(s => s.status === '已宽恕');

    if (mood && mood !== 'all') {
      forgivenSecrets = forgivenSecrets.filter(s => s.mood === mood);
    }

    if (forgivenSecrets.length === 0) {
      const message = mood && mood !== 'all'
        ? '这个心情下还没有秘密，换个心情看看吧'
        : '还没有被宽恕的秘密，成为第一个分享的人吧';
      return res.json({
        hasSecret: false,
        message
      });
    }

    const randomIndex = Math.floor(Math.random() * forgivenSecrets.length);
    const randomSecret = forgivenSecrets[randomIndex];

    res.json({
      hasSecret: true,
      secret: {
        id: randomSecret.id,
        content: randomSecret.content,
        mood: randomSecret.mood,
        status: randomSecret.status
      }
    });
  } catch (error) {
    console.error('获取随机秘密时出错:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`忏悔室后端服务运行在 http://localhost:${PORT}`);
});
