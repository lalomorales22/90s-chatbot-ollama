# 💥 SUP CHAT 💥
![Uploading Screenshot 2025-07-28 at 12.39.31 PM.png…]()

A fun, colorful AI chatbot with AMAZING fonts! Chat with AI using the local Ollama gemma3:4b model and save all your conversations.

## ✨ Features

### 🎭 Font System
- **30+ AI Font Styles**: Every AI response uses a different comic book style font
- **8 User Font Styles**: Choose your own font style (Hero Bold, Villain Dark, Cyber Tech, etc.)
- **Font Categories**: Action/Hero, Horror/Dark, Playful/Fun, Military/Stencil, Futuristic, Graffiti, and more!

### 💾 Chat Management
- **SQLite Database**: All chats and messages are saved locally
- **Left Sidebar**: Manage multiple chat conversations
- **Create/Rename/Delete**: Full chat management with edit and delete options
- **Persistent History**: All your conversations are saved and can be reopened

### 🎨 Interface
- **Dark/Light Themes**: Toggle between light and dark chat backgrounds
- **Animated Scrollbar**: Colorful, comic-style scrollbar
- **Responsive Design**: Works perfectly on desktop and mobile
- **Real-time Chat**: WebSocket-based instant messaging

## 🚀 Setup Instructions

### 1. Install Ollama (if not already installed)
```bash
# On macOS
brew install ollama

# Or download from: https://ollama.ai
```

### 2. Start Ollama and Download Model
```bash
# Start Ollama service
ollama serve

# In another terminal, pull the gemma3:4b model
ollama pull gemma3:4b
```

### 3. Run the Chatbot
```bash
# Install dependencies (already done)
npm install

# Start the server
npm start

# Or for development with auto-restart
npm run dev
```

### 4. Open in Browser
Open your browser and go to: **http://localhost:3000**

## 🎭 Font Styles

### AI Fonts (30+ Random Styles)
- **Action/Hero**: Righteous, Faster One, Racing Sans One
- **Horror/Dark**: Nosifer, Butcherman, Creepster
- **Playful/Fun**: Luckiest Guy, Schoolbell, Finger Paint
- **Military/Stencil**: Stardos Stencil, Diplomata SC, Black Ops One
- **Tech/Sci-fi**: Orbitron, Audiowide, Exo 2, Russo One
- **Graffiti**: Permanent Marker, Marker Felt
- **Retro/Neon**: Monoton, Wallpoet, Iceberg
- **Comic**: Bungee, Bangers, Fredoka One, Comic Neue
- **Decorative**: Alfa Slab One, Griffy, Shrikhand
- **And many more!**

### User Fonts (8 Choices)
- **Hero Bold**: Red/gold hero style (Righteous)
- **Villain Dark**: Dark red villain style (Nosifer)
- **Retro Pop**: Pink/cyan retro style (Faster One)
- **Electric Neon**: Green/magenta electric style (Bungee)
- **Classic Comic**: Blue/yellow classic style (Bangers)
- **Cyber Tech**: Cyan/pink tech style (Orbitron)
- **Space Force**: Navy/orange space style (Audiowide)
- **Ice Cold**: Light blue/royal blue ice style (Iceberg)

## 🛠 Troubleshooting

### Ollama Issues
- Make sure Ollama is running: `ollama serve`
- Verify model is installed: `ollama list`
- Check Ollama is on port 11434: `curl http://localhost:11434/api/tags`

### Node.js Issues
- Check Node.js version: `node --version` (needs v14+)
- Reinstall dependencies: `rm -rf node_modules && npm install`

## 🎨 Customization

Want to add more fonts? Edit:
- `server.js`: Add new font styles to `getRandomFontStyle()`
- `public/style.css`: Add new user font classes
- `public/script.js`: Update `userFontStyles` mapping

## 💡 Tips

- Try asking about fonts, typography, or design - the AI loves that topic!
- The AI personality is tuned to be enthusiastic about fonts and comic books
- Each message gets a random comic book font style
- Your font choice persists until you change it

Have fun chatting with your colorful AI buddy! 🦾✨
