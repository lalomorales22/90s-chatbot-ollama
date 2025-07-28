const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
const db = require('./database');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Chat management API routes
app.get('/api/chats', async (req, res) => {
  try {
    const chats = await db.getAllChats();
    res.json(chats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/chats', async (req, res) => {
  try {
    const { name } = req.body;
    const chat = await db.createChat(name || 'New Chat');
    res.json(chat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/chats/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    await db.updateChatName(id, name);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/chats/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.deleteChat(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/chats/:id/messages', async (req, res) => {
  try {
    const { id } = req.params;
    const messages = await db.getChatMessages(id);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ollama API interaction
async function callOllama(message) {
  try {
    const response = await axios.post('http://localhost:11434/api/generate', {
      model: 'gemma3:4b',
      prompt: message,
      stream: false,
      system: "You are a fun, energetic AI assistant who loves fonts, typography, and comic books! Always respond enthusiastically and mention something about fonts or typography when relevant. Keep responses conversational and engaging."
    });
    
    return response.data.response;
  } catch (error) {
    console.error('Ollama API error:', error.message);
    return "🎨 FONT ERROR! Make sure Ollama is running with gemma3:4b model! 🎨";
  }
}

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('chat message', async (data) => {
    try {
      const { message, chatId, userFontStyle } = data;
      
      // Save user message to database
      if (chatId) {
        await db.saveMessage(chatId, 'user', message, userFontStyle);
      }
      
      const aiResponse = await callOllama(message);
      const aiFontStyle = getRandomFontStyle();
      
      // Save AI response to database
      if (chatId) {
        await db.saveMessage(chatId, 'ai', aiResponse, aiFontStyle);
      }
      
      // Send AI response with random comic styling
      socket.emit('ai response', {
        message: aiResponse,
        fontStyle: aiFontStyle,
        timestamp: new Date().toLocaleTimeString()
      });
    } catch (error) {
      console.error('Error processing message:', error);
      socket.emit('ai response', {
        message: "💥 COMIC CRASH! Something went wrong with the AI! 💥",
        fontStyle: getRandomFontStyle(),
        timestamp: new Date().toLocaleTimeString()
      });
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Generate random comic book font styles with MANY more fonts
function getRandomFontStyle() {
  const styles = [
    // Original fonts
    {
      fontFamily: '"Bungee", cursive',
      fontSize: '24px',
      color: '#FF6B35',
      textShadow: '3px 3px 0px #000000',
      background: 'linear-gradient(45deg, #FFE66D, #FF6B35)',
      border: '4px solid #000000'
    },
    {
      fontFamily: '"Creepster", cursive',
      fontSize: '26px', 
      color: '#00F5FF',
      textShadow: '2px 2px 0px #FF1493, 4px 4px 0px #000000',
      background: 'linear-gradient(45deg, #00F5FF, #FF1493)',
      border: '5px dotted #000000'
    },
    {
      fontFamily: '"Fredoka One", cursive',
      fontSize: '25px',
      color: '#32CD32',
      textShadow: '3px 3px 0px #8B0000',
      background: 'linear-gradient(45deg, #32CD32, #FFFF00)',
      border: '4px dashed #8B0000'
    },
    {
      fontFamily: '"Bangers", cursive',
      fontSize: '28px',
      color: '#FF4500',
      textShadow: '2px 2px 0px #FFFFFF, 4px 4px 0px #000000',
      background: 'linear-gradient(45deg, #FF4500, #FFD700)',
      border: '6px solid #000000'
    },
    {
      fontFamily: '"Shrikhand", cursive',
      fontSize: '23px',
      color: '#9932CC',
      textShadow: '3px 3px 0px #00FF00, 5px 5px 0px #000000',
      background: 'linear-gradient(45deg, #9932CC, #00FF00)',
      border: '4px double #000000'
    },
    // Tech/Sci-fi fonts
    {
      fontFamily: '"Orbitron", monospace',
      fontSize: '24px',
      color: '#00FFFF',
      textShadow: '2px 2px 0px #FF0080, 4px 4px 0px #000000',
      background: 'linear-gradient(45deg, #001122, #00FFFF)',
      border: '4px solid #00FFFF'
    },
    {
      fontFamily: '"Audiowide", cursive',
      fontSize: '25px',
      color: '#FFFFFF',
      textShadow: '2px 2px 0px #FF4500, 4px 4px 0px #000000',
      background: 'linear-gradient(45deg, #191970, #FF4500)',
      border: '4px solid #FFFFFF'
    },
    {
      fontFamily: '"Black Ops One", cursive',
      fontSize: '22px',
      color: '#FFD700',
      textShadow: '3px 3px 0px #8B0000, 5px 5px 0px #000000',
      background: 'linear-gradient(45deg, #8B0000, #FFD700)',
      border: '5px ridge #FFD700'
    },
    // Retro/Neon fonts
    {
      fontFamily: '"Monoton", cursive',
      fontSize: '26px',
      color: '#FF1493',
      textShadow: '2px 2px 0px #00FF00, 4px 4px 0px #000000',
      background: 'linear-gradient(45deg, #FF1493, #00FF00)',
      border: '4px groove #FF1493'
    },
    {
      fontFamily: '"Wallpoet", cursive',
      fontSize: '23px',
      color: '#9370DB',
      textShadow: '3px 3px 0px #FFD700, 5px 5px 0px #000000',
      background: 'linear-gradient(45deg, #9370DB, #FFD700)',
      border: '4px inset #9370DB'
    },
    {
      fontFamily: '"Iceberg", cursive',
      fontSize: '24px',
      color: '#E0FFFF',
      textShadow: '2px 2px 0px #4169E1, 4px 4px 0px #000000',
      background: 'linear-gradient(45deg, #B0E0E6, #4169E1)',
      border: '4px outset #E0FFFF'
    },
    // NEW FONTS - Action/Hero
    {
      fontFamily: '"Righteous", cursive',
      fontSize: '25px',
      color: '#DC143C',
      textShadow: '2px 2px 0px #FFD700, 4px 4px 0px #000000',
      background: 'linear-gradient(45deg, #DC143C, #FFD700)',
      border: '5px solid #000000'
    },
    {
      fontFamily: '"Faster One", cursive',
      fontSize: '27px',
      color: '#FF69B4',
      textShadow: '2px 2px 0px #00FFFF, 4px 4px 0px #000000',
      background: 'linear-gradient(45deg, #FF69B4, #00FFFF)',
      border: '4px solid #000000'
    },
    {
      fontFamily: '"Racing Sans One", cursive',
      fontSize: '24px',
      color: '#FF8C00',
      textShadow: '3px 3px 0px #000080, 5px 5px 0px #000000',
      background: 'linear-gradient(45deg, #FF8C00, #000080)',
      border: '4px double #FF8C00'
    },
    // Horror/Dark fonts
    {
      fontFamily: '"Nosifer", cursive',
      fontSize: '20px',
      color: '#8B0000',
      textShadow: '2px 2px 0px #FFFFFF, 4px 4px 0px #000000',
      background: 'linear-gradient(45deg, #8B0000, #2F4F4F)',
      border: '4px solid #8B0000'
    },
    {
      fontFamily: '"Butcherman", cursive',
      fontSize: '23px',
      color: '#800080',
      textShadow: '3px 3px 0px #FFFF00, 5px 5px 0px #000000',
      background: 'linear-gradient(45deg, #800080, #FFFF00)',
      border: '5px ridge #800080'
    },
    // Playful/Fun fonts
    {
      fontFamily: '"Luckiest Guy", cursive',
      fontSize: '26px',
      color: '#FF6347',
      textShadow: '2px 2px 0px #00FF7F, 4px 4px 0px #000000',
      background: 'linear-gradient(45deg, #FF6347, #00FF7F)',
      border: '4px solid #000000'
    },
    {
      fontFamily: '"Schoolbell", cursive',
      fontSize: '25px',
      color: '#4169E1',
      textShadow: '2px 2px 0px #FFFF00, 4px 4px 0px #000000',
      background: 'linear-gradient(45deg, #4169E1, #FFFF00)',
      border: '4px dashed #4169E1'
    },
    {
      fontFamily: '"Finger Paint", cursive',
      fontSize: '24px',
      color: '#FF1493',
      textShadow: '3px 3px 0px #00CED1, 5px 5px 0px #000000',
      background: 'linear-gradient(45deg, #FF1493, #00CED1)',
      border: '4px dotted #FF1493'
    },
    // Military/Stencil fonts
    {
      fontFamily: '"Stardos Stencil", cursive',
      fontSize: '25px',
      color: '#228B22',
      textShadow: '2px 2px 0px #FFD700, 4px 4px 0px #000000',
      background: 'linear-gradient(45deg, #228B22, #FFD700)',
      border: '5px solid #228B22'
    },
    {
      fontFamily: '"Diplomata SC", cursive',
      fontSize: '22px',
      color: '#B8860B',
      textShadow: '3px 3px 0px #8B0000, 5px 5px 0px #000000',
      background: 'linear-gradient(45deg, #B8860B, #8B0000)',
      border: '4px inset #B8860B'
    },
    // Decorative/Ornate fonts
    {
      fontFamily: '"Alfa Slab One", cursive',
      fontSize: '24px',
      color: '#FF4500',
      textShadow: '2px 2px 0px #9400D3, 4px 4px 0px #000000',
      background: 'linear-gradient(45deg, #FF4500, #9400D3)',
      border: '4px groove #FF4500'
    },
    {
      fontFamily: '"Griffy", cursive',
      fontSize: '23px',
      color: '#2E8B57',
      textShadow: '3px 3px 0px #FFD700, 5px 5px 0px #000000',
      background: 'linear-gradient(45deg, #2E8B57, #FFD700)',
      border: '4px outset #2E8B57'
    },
    // Futuristic fonts
    {
      fontFamily: '"Exo 2", sans-serif',
      fontSize: '24px',
      fontWeight: '900',
      color: '#00BFFF',
      textShadow: '2px 2px 0px #FF69B4, 4px 4px 0px #000000',
      background: 'linear-gradient(45deg, #00BFFF, #FF69B4)',
      border: '4px solid #00BFFF'
    },
    {
      fontFamily: '"Russo One", sans-serif',
      fontSize: '25px',
      color: '#FF6347',
      textShadow: '2px 2px 0px #40E0D0, 4px 4px 0px #000000',
      background: 'linear-gradient(45deg, #FF6347, #40E0D0)',
      border: '4px double #FF6347'
    },
    // Comic specific fonts
    {
      fontFamily: '"Comic Neue", cursive',
      fontSize: '26px',
      fontWeight: '700',
      color: '#FF00FF',
      textShadow: '3px 3px 0px #00FF00, 5px 5px 0px #000000',
      background: 'linear-gradient(45deg, #FF00FF, #00FF00)',
      border: '4px solid #FF00FF'
    },
    // Wild/Crazy fonts
    {
      fontFamily: '"Jokerman", cursive',
      fontSize: '23px',
      color: '#FF8C00',
      textShadow: '2px 2px 0px #8A2BE2, 4px 4px 0px #000000',
      background: 'linear-gradient(45deg, #FF8C00, #8A2BE2)',
      border: '5px ridge #FF8C00'
    },
    {
      fontFamily: '"Kalam", cursive',
      fontSize: '24px',
      fontWeight: '700',
      color: '#DC143C',
      textShadow: '3px 3px 0px #00FF7F, 5px 5px 0px #000000',
      background: 'linear-gradient(45deg, #DC143C, #00FF7F)',
      border: '4px groove #DC143C'
    },
    // Graffiti style
    {
      fontFamily: '"Permanent Marker", cursive',
      fontSize: '25px',
      color: '#FF1493',
      textShadow: '2px 2px 0px #00FFFF, 4px 4px 0px #000000',
      background: 'linear-gradient(45deg, #FF1493, #00FFFF)',
      border: '4px dashed #FF1493'
    },
    {
      fontFamily: '"Marker Felt", cursive',
      fontSize: '24px',
      color: '#32CD32',
      textShadow: '3px 3px 0px #FF4500, 5px 5px 0px #000000',
      background: 'linear-gradient(45deg, #32CD32, #FF4500)',
      border: '4px dotted #32CD32'
    }
  ];
  
  return styles[Math.floor(Math.random() * styles.length)];
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`💥 SUP CHAT server running on port ${PORT}! 💥`);
  console.log(`Make sure Ollama is running: ollama serve`);
  console.log(`And gemma3:4b model is available: ollama pull gemma3:4b`);
});