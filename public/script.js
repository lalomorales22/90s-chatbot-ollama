const socket = io();
const messagesArea = document.getElementById('messages');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const userFontSelect = document.getElementById('userFontSelect');
const themeSelect = document.getElementById('themeSelect');
const chatContainer = document.querySelector('.chat-container');
const newChatBtn = document.getElementById('newChatBtn');
const chatList = document.getElementById('chatList');
const currentChatName = document.getElementById('currentChatName');
const toggleSidebar = document.getElementById('toggleSidebar');
const sidebar = document.querySelector('.sidebar');
const randomFontBtn = document.getElementById('randomFontBtn');

let currentChatId = null;
let chats = [];

// User font styles mapping - ALL 30 FONTS!
const userFontStyles = {
    'user1': 'user-style-1',
    'user2': 'user-style-2', 
    'user3': 'user-style-3',
    'user4': 'user-style-4',
    'user5': 'user-style-5',
    'user6': 'user-style-6',
    'user7': 'user-style-7',
    'user8': 'user-style-8',
    'user9': 'user-style-9',
    'user10': 'user-style-10',
    'user11': 'user-style-11',
    'user12': 'user-style-12',
    'user13': 'user-style-13',
    'user14': 'user-style-14',
    'user15': 'user-style-15',
    'user16': 'user-style-16',
    'user17': 'user-style-17',
    'user18': 'user-style-18',
    'user19': 'user-style-19',
    'user20': 'user-style-20',
    'user21': 'user-style-21',
    'user22': 'user-style-22',
    'user23': 'user-style-23',
    'user24': 'user-style-24',
    'user25': 'user-style-25',
    'user26': 'user-style-26',
    'user27': 'user-style-27',
    'user28': 'user-style-28',
    'user29': 'user-style-29',
    'user30': 'user-style-30'
};

// Initialize app
async function initApp() {
    await loadChats();
    bindEvents();
}

// Load all chats from database
async function loadChats() {
    try {
        const response = await fetch('/api/chats');
        chats = await response.json();
        renderChatList();
        
        // Select first chat if available
        if (chats.length > 0) {
            selectChat(chats[0].id);
        }
    } catch (error) {
        console.error('Failed to load chats:', error);
    }
}

// Render chat list in sidebar
function renderChatList() {
    chatList.innerHTML = '';
    
    chats.forEach(chat => {
        const chatItem = document.createElement('div');
        chatItem.className = `chat-item ${currentChatId === chat.id ? 'active' : ''}`;
        chatItem.dataset.chatId = chat.id;
        
        const createdAt = new Date(chat.created_at).toLocaleDateString();
        
        chatItem.innerHTML = `
            <div class="chat-item-name">${escapeHtml(chat.name)}</div>
            <div class="chat-item-time">${createdAt}</div>
            <div class="chat-item-actions">
                <button class="chat-action-btn edit-chat" title="Rename">✏️</button>
                <button class="chat-action-btn delete-chat" title="Delete">🗑️</button>
            </div>
        `;
        
        chatItem.addEventListener('click', () => selectChat(chat.id));
        chatList.appendChild(chatItem);
    });
}

// Create new chat
async function createNewChat() {
    try {
        const response = await fetch('/api/chats', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'New Chat' })
        });
        
        const newChat = await response.json();
        chats.unshift(newChat);
        renderChatList();
        selectChat(newChat.id);
    } catch (error) {
        console.error('Failed to create chat:', error);
    }
}

// Select a chat
async function selectChat(chatId) {
    currentChatId = chatId;
    const chat = chats.find(c => c.id === chatId);
    
    if (chat) {
        currentChatName.textContent = chat.name;
        await loadChatMessages(chatId);
        renderChatList(); // Update active state
        
        // Enable input
        messageInput.disabled = false;
        sendButton.disabled = false;
    }
}

// Load messages for a chat
async function loadChatMessages(chatId) {
    try {
        const response = await fetch(`/api/chats/${chatId}/messages`);
        const messages = await response.json();
        
        messagesArea.innerHTML = '';
        
        messages.forEach(message => {
            if (message.sender === 'user') {
                displayUserMessage(message.content, message.font_style, false);
            } else {
                displayAIMessage({
                    message: message.content,
                    fontStyle: message.font_style,
                    timestamp: new Date(message.created_at).toLocaleTimeString()
                }, false);
            }
        });
        
        scrollToBottom();
    } catch (error) {
        console.error('Failed to load messages:', error);
    }
}

// Rename chat
async function renameChat(chatId) {
    const chat = chats.find(c => c.id === chatId);
    const newName = prompt('Enter new chat name:', chat.name);
    
    if (newName && newName.trim() && newName.trim() !== chat.name) {
        try {
            await fetch(`/api/chats/${chatId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newName.trim() })
            });
            
            chat.name = newName.trim();
            renderChatList();
            
            if (currentChatId === chatId) {
                currentChatName.textContent = chat.name;
            }
        } catch (error) {
            console.error('Failed to rename chat:', error);
        }
    }
}

// Delete chat
async function deleteChat(chatId) {
    const chat = chats.find(c => c.id === chatId);
    
    if (confirm(`Delete chat "${chat.name}"? This cannot be undone.`)) {
        try {
            await fetch(`/api/chats/${chatId}`, { method: 'DELETE' });
            
            chats = chats.filter(c => c.id !== chatId);
            renderChatList();
            
            if (currentChatId === chatId) {
                currentChatId = null;
                messagesArea.innerHTML = '';
                currentChatName.textContent = 'Select or create a chat';
                messageInput.disabled = true;
                sendButton.disabled = true;
                
                // Select first available chat
                if (chats.length > 0) {
                    selectChat(chats[0].id);
                }
            }
        } catch (error) {
            console.error('Failed to delete chat:', error);
        }
    }
}

// Send message function
function sendMessage() {
    const message = messageInput.value.trim();
    if (message && currentChatId) {
        const selectedStyle = userFontSelect.value;
        const userFontClass = userFontStyles[selectedStyle];
        
        // Display user message immediately
        displayUserMessage(message, userFontClass);
        
        // Send to server with chat ID and font style
        socket.emit('chat message', { 
            message: message, 
            chatId: currentChatId,
            userFontStyle: userFontClass
        });
        
        // Clear input
        messageInput.value = '';
        
        // Show typing indicator
        showTypingIndicator();
    }
}

// Display user message with selected font style
function displayUserMessage(message, fontClass, scroll = true) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user-message';
    
    // If fontClass is an object (from database), use it directly
    let styleClass = fontClass;
    if (typeof fontClass === 'object') {
        styleClass = fontClass; // It's already a style object
    } else {
        styleClass = userFontStyles[userFontSelect.value] || fontClass;
    }
    
    messageDiv.innerHTML = `
        <div class="message-content ${typeof styleClass === 'string' ? styleClass : 'user-style-1'}">
            ${escapeHtml(message)}
        </div>
        <div class="message-time">${new Date().toLocaleTimeString()}</div>
    `;
    
    messagesArea.appendChild(messageDiv);
    if (scroll) scrollToBottom();
}

// Display AI message with dynamic styling
function displayAIMessage(data, scroll = true) {
    // Remove typing indicator
    removeTypingIndicator();
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message ai-message';
    
    // Apply the random font style from server
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.textContent = data.message;
    
    // Apply styles
    Object.assign(contentDiv.style, {
        fontFamily: data.fontStyle.fontFamily,
        fontSize: data.fontStyle.fontSize,
        fontWeight: data.fontStyle.fontWeight || 'normal',
        color: data.fontStyle.color,
        textShadow: data.fontStyle.textShadow,
        background: data.fontStyle.background,
        border: data.fontStyle.border,
        borderRadius: '15px',
        padding: '15px',
        display: 'inline-block',
        maxWidth: '100%',
        wordWrap: 'break-word'
    });
    
    const timeDiv = document.createElement('div');
    timeDiv.className = 'message-time';
    timeDiv.textContent = data.timestamp;
    
    messageDiv.appendChild(contentDiv);
    messageDiv.appendChild(timeDiv);
    messagesArea.appendChild(messageDiv);
    
    // Add animation
    messageDiv.style.animation = 'messageAppear 0.8s ease-in-out';
    
    if (scroll) scrollToBottom();
}

// Show typing indicator
function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.id = 'typing-indicator';
    typingDiv.className = 'message ai-message';
    typingDiv.innerHTML = `
        <div class="message-content" style="
            font-family: 'Bangers', cursive;
            font-size: 20px;
            color: #666;
            text-shadow: 1px 1px 0px #FFFFFF;
            background: linear-gradient(45deg, #E0E0E0, #F5F5F5);
            border: 3px dashed #999;
            border-radius: 15px;
            padding: 15px;
            animation: pulse 1.5s infinite;
        ">
            🤖 AI is thinking with FONTS... 💭
        </div>
    `;
    
    messagesArea.appendChild(typingDiv);
    scrollToBottom();
}

// Remove typing indicator
function removeTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// Theme switching function
function switchTheme() {
    const selectedTheme = themeSelect.value;
    
    if (selectedTheme === 'dark') {
        chatContainer.classList.add('dark-theme');
        messagesArea.classList.add('dark-theme');
    } else {
        chatContainer.classList.remove('dark-theme');
        messagesArea.classList.remove('dark-theme');
    }
}

// Toggle sidebar
function toggleSidebarVisibility() {
    sidebar.classList.toggle('hidden');
}

// Random font selection
function selectRandomFont() {
    const fontKeys = Object.keys(userFontStyles);
    const randomKey = fontKeys[Math.floor(Math.random() * fontKeys.length)];
    userFontSelect.value = randomKey;
    
    // Add animation feedback
    randomFontBtn.style.transform = 'rotate(720deg) scale(1.2)';
    setTimeout(() => {
        randomFontBtn.style.transform = '';
    }, 500);
}

// Scroll to bottom of messages
function scrollToBottom() {
    messagesArea.scrollTop = messagesArea.scrollHeight;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Bind all events
function bindEvents() {
    // Main functionality
    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    // Theme switching
    themeSelect.addEventListener('change', switchTheme);
    
    // Sidebar management
    newChatBtn.addEventListener('click', createNewChat);
    toggleSidebar.addEventListener('click', toggleSidebarVisibility);
    
    // Random font button
    randomFontBtn.addEventListener('click', selectRandomFont);
    
    // Chat item actions (using event delegation)
    chatList.addEventListener('click', function(e) {
        e.stopPropagation();
        
        if (e.target.classList.contains('edit-chat')) {
            const chatId = e.target.closest('.chat-item').dataset.chatId;
            renameChat(chatId);
        } else if (e.target.classList.contains('delete-chat')) {
            const chatId = e.target.closest('.chat-item').dataset.chatId;
            deleteChat(chatId);
        }
    });
    
    // Initially disable input until chat is selected
    messageInput.disabled = true;
    sendButton.disabled = true;
}

// Socket event listeners
socket.on('ai response', function(data) {
    displayAIMessage(data);
});

socket.on('connect', function() {
    console.log('Connected to server');
});

socket.on('disconnect', function() {
    console.log('Disconnected from server');
});

// Add pulse animation for typing indicator
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0% { opacity: 0.6; transform: scale(1); }
        50% { opacity: 1; transform: scale(1.05); }
        100% { opacity: 0.6; transform: scale(1); }
    }
`;
document.head.appendChild(style);

// Initialize app when page loads
window.addEventListener('load', function() {
    initApp();
});