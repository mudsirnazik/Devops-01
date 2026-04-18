// Theme toggle functionality (common for all pages)
(function() {
  const toggleBtn = document.getElementById('theme-toggle');
  const themeIcon = document.getElementById('theme-icon');
  const body = document.body;

  function setTheme(theme) {
    if (theme === 'dark') {
      body.classList.add('dark-mode');
      themeIcon?.classList.remove('fa-sun');
      themeIcon?.classList.add('fa-moon');
    } else {
      body.classList.remove('dark-mode');
      themeIcon?.classList.remove('fa-moon');
      themeIcon?.classList.add('fa-sun');
    }
    localStorage.setItem('diamonixTheme', theme);
  }

  const savedTheme = localStorage.getItem('diamonixTheme') || 'light';
  setTheme(savedTheme);

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const newTheme = body.classList.contains('dark-mode') ? 'light' : 'dark';
      setTheme(newTheme);
    });
  }
})();

// ----- CHAT FUNCTIONALITY (only on home page) -----
if (document.getElementById('chat-button')) {
  const chatButton = document.getElementById('chat-button');
  const chatModal = document.getElementById('chat-modal');
  const closeChat = document.getElementById('close-chat');
  const sendButton = document.getElementById('send-chat');
  const chatInput = document.getElementById('chat-input');
  const chatMessages = document.getElementById('chat-messages');

  chatButton.addEventListener('click', () => {
    chatModal.classList.toggle('active');
  });

  closeChat.addEventListener('click', () => {
    chatModal.classList.remove('active');
  });

  async function sendMessage() {
    const message = chatInput.value.trim();
    if (!message) return;

    // User message
    const userDiv = document.createElement('div');
    userDiv.className = 'user-message';
    userDiv.textContent = message;
    chatMessages.appendChild(userDiv);
    chatInput.value = '';
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Typing indicator
    const typingDiv = document.createElement('div');
    typingDiv.className = 'bot-message';
    typingDiv.textContent = '...';
    typingDiv.id = 'typing';
    chatMessages.appendChild(typingDiv);

    try {
      // 🟢 LOCAL BACKEND (change later to Render URL)
      const response = await fetch('http://127.0.0.1:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });
      const data = await response.json();
      document.getElementById('typing')?.remove();
      const botDiv = document.createElement('div');
      botDiv.className = 'bot-message';
      botDiv.textContent = data.reply || 'Sorry, I didn\'t understand.';
      chatMessages.appendChild(botDiv);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    } catch (error) {
      document.getElementById('typing')?.remove();
      const errorDiv = document.createElement('div');
      errorDiv.className = 'bot-message';
      errorDiv.textContent = 'Error connecting to server.';
      chatMessages.appendChild(errorDiv);
    }
  }

  sendButton.addEventListener('click', sendMessage);
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
  });
}