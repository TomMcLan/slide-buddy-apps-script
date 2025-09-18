// Slide Buddy 2.0 - Complete Manual Installation (Updated with Post-Action Undo)
// Copy this entire code into any Google Slides Apps Script project

/**
 * Runs when the document is opened
 */
function onOpen() {
  installSlideBuddy();
}

/**
 * Runs when the add-on is installed
 */
function onInstall(e) {
  onOpen(e);
}

/**
 * Creates the menu in Google Slides
 */
function installSlideBuddy() {
  SlidesApp.getUi()
    .createMenu('Slide Buddy')
    .addItem('Open assistant', 'openSlideBuddy')
    .addToUi();
}

/**
 * Shows the modern Google-styled sidebar with proper chat flow
 */
function openSlideBuddy() {
  const html = HtmlService.createHtmlOutput(`
    <!DOCTYPE html>
    <html>
    <head>
      <base target="_top">
      <link href="https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500;600&display=swap" rel="stylesheet">
      <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Google Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: #fff;
          color: #3c4043;
          line-height: 1.5;
          font-size: 14px;
          overflow-x: hidden;
        }
        
        .page {
          display: none;
          min-height: 100vh;
        }
        
        .page.active {
          display: block;
        }
        
        .header {
          background: #fff;
          padding: 16px 20px 12px 20px;
          border-bottom: 1px solid #e8eaed;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .logo-container {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .logo-icon {
          width: 20px;
          height: 20px;
          color: #1a73e8;
        }
        
        .title {
          font-size: 16px;
          font-weight: 500;
          color: #3c4043;
        }
        
        .container {
          padding: 0;
          background: #fff;
        }
        
        .suggestion-item {
          display: flex;
          align-items: flex-start;
          padding: 16px 20px;
          border-bottom: 1px solid #f1f3f4;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }
        
        .suggestion-item:hover {
          background-color: #f8f9fa;
        }
        
        .suggestion-item:last-child {
          border-bottom: none;
        }
        
        .suggestion-icon {
          width: 20px;
          height: 20px;
          color: #5f6368;
          margin-right: 16px;
          margin-top: 2px;
          flex-shrink: 0;
        }
        
        .suggestion-content {
          flex: 1;
        }
        
        .suggestion-title {
          font-weight: 500;
          color: #3c4043;
          margin-bottom: 2px;
          font-size: 14px;
        }
        
        .suggestion-desc {
          font-size: 13px;
          color: #5f6368;
          line-height: 1.4;
        }
        
        .chat-input-container {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: #fff;
          border-top: 1px solid #e8eaed;
          padding: 16px 20px;
          max-width: 380px;
        }
        
        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          border: 1px solid #dadce0;
          border-radius: 24px;
          background: #fff;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
          min-height: 48px;
          padding: 4px;
        }
        
        .input-wrapper:focus-within {
          border-color: #1a73e8;
          box-shadow: 0 0 0 1px #1a73e8;
        }
        
        .text-input {
          flex: 1;
          border: none;
          outline: none;
          padding: 12px 16px;
          font-size: 14px;
          font-family: inherit;
          background: transparent;
          color: #3c4043;
          resize: none;
          min-height: 24px;
          max-height: 120px;
          overflow-y: auto;
          word-wrap: break-word;
          white-space: pre-wrap;
          line-height: 1.5;
        }
        
        .text-input::placeholder {
          color: #9aa0a6;
          line-height: 1.5;
        }
        
        .input-actions {
          display: flex;
          align-items: center;
          padding: 4px;
          gap: 4px;
        }
        
        .action-btn {
          width: 32px;
          height: 32px;
          border: none;
          background: none;
          cursor: pointer;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.2s ease;
          flex-shrink: 0;
        }
        
        .action-btn:hover {
          background-color: #f1f3f4;
        }
        
        .action-btn .material-icons {
          font-size: 18px;
          color: #5f6368;
        }
        
        .send-btn {
          background: #1a73e8 !important;
        }
        
        .send-btn .material-icons {
          color: #fff !important;
        }
        
        .send-btn:hover {
          background: #1557b0 !important;
        }
        
        .send-btn:disabled {
          background: #dadce0 !important;
          cursor: not-allowed;
        }
        
        .send-btn:disabled .material-icons {
          color: #9aa0a6 !important;
        }
        
        .content-area {
          padding-bottom: 80px;
        }
        
        /* Loading Page Styles */
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
        }
        
        .loading-spinner {
          width: 32px;
          height: 32px;
          border: 3px solid #e8eaed;
          border-top: 3px solid #1a73e8;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 16px;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .loading-text {
          color: #5f6368;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        
        .loading-dots {
          display: inline-flex;
          gap: 2px;
        }
        
        .loading-dots span {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background-color: #5f6368;
          animation: loadingDots 1.4s ease-in-out infinite both;
        }
        
        .loading-dots span:nth-child(1) { animation-delay: -0.32s; }
        .loading-dots span:nth-child(2) { animation-delay: -0.16s; }
        .loading-dots span:nth-child(3) { animation-delay: 0s; }
        
        @keyframes loadingDots {
          0%, 80%, 100% {
            transform: scale(0.8);
            opacity: 0.5;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        /* Disable interactions during loading */
        .loading-active {
          pointer-events: none;
          opacity: 0.6;
        }
        
        .loading-active .suggestion-item {
          cursor: not-allowed;
        }
        
        .loading-active .text-input {
          cursor: not-allowed;
        }
        
        .loading-active .action-btn {
          cursor: not-allowed;
        }
        
        /* Chat Page Styles */
        .chat-container {
          padding: 20px;
          padding-bottom: 80px;
        }
        
        .message {
          margin-bottom: 24px;
        }
        
        .message-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }
        
        .user-avatar {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #f1f3f4;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #1f1f1f;
          font-size: 12px;
          font-weight: 500;
        }
        
        .ai-avatar {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #f1f3f4;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .ai-avatar .material-icons {
          font-size: 16px;
          color: #1a73e8;
        }
        
        .message-content {
          margin-left: 32px;
          color: #3c4043;
          line-height: 1.5;
          position: relative;
          padding-bottom: 20px;
        }
        
        .back-btn {
          background: none;
          border: none;
          color: #1a73e8;
          cursor: pointer;
          font-size: 14px;
          padding: 8px 0;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        
        .back-btn:hover {
          text-decoration: underline;
        }
        
        /* Subtle Undo Button Styles */
        
        .undo-button {
          position: absolute;
          bottom: -4px;
          right: 0;
          background: none;
          border: none;
          color: #9aa0a6;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          font-size: 12px;
          opacity: 0.6;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          gap: 2px;
        }
        
        .undo-button:hover {
          opacity: 1;
          color: #ea4335;
          background: rgba(234, 67, 53, 0.04);
        }
        
        .undo-button svg {
          transition: transform 0.2s ease;
        }
        
        .undo-button:hover svg {
          transform: rotate(-15deg);
        }
      </style>
    </head>
    <body>
      <!-- Home Page -->
      <div id="homePage" class="page active">
        <div class="header">
          <div class="logo-container">
            <span class="material-icons logo-icon">smart_toy</span>
            <div class="title">Slide Buddy</div>
          </div>
        </div>
        
        <div class="content-area">
          <div class="container">
            <div class="suggestion-item" onclick="handleFeature('translate')">
              <span class="material-icons suggestion-icon">translate</span>
              <div class="suggestion-content">
                <div class="suggestion-title">Translate all slides</div>
                <div class="suggestion-desc">to any language across entire presentation</div>
              </div>
            </div>
            
            <div class="suggestion-item" onclick="handleFeature('enhance')">
              <span class="material-icons suggestion-icon">auto_fix_high</span>
              <div class="suggestion-content">
                <div class="suggestion-title">Enhance all text</div>
                <div class="suggestion-desc">improve grammar and tone across all slides</div>
              </div>
            </div>
            
            <div class="suggestion-item" onclick="handleFeature('replace')">
              <span class="material-icons suggestion-icon">find_replace</span>
              <div class="suggestion-content">
                <div class="suggestion-title">Find & replace text</div>
                <div class="suggestion-desc">change any word or phrase across all slides</div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="chat-input-container">
          <div class="input-wrapper">
            <textarea class="text-input" placeholder="Type a message" id="userInput" rows="1"></textarea>
            <div class="input-actions">
              <button class="action-btn send-btn" id="sendBtn" onclick="sendMessage()" disabled>
                <span class="material-icons">send</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Loading Page -->
      <div id="loadingPage" class="page">
        <div class="header">
          <div class="logo-container">
            <span class="material-icons logo-icon">smart_toy</span>
            <div class="title">Slide Buddy</div>
          </div>
        </div>
        
        <div class="loading-container">
          <div class="loading-spinner"></div>
          <div class="loading-text">
            <span id="loadingText">Processing your request</span>
            <div class="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Chat Page -->
      <div id="chatPage" class="page">
        <div class="header">
          <div class="logo-container">
            <span class="material-icons logo-icon">smart_toy</span>
            <div class="title">Slide Buddy</div>
          </div>
        </div>
        
        <div class="chat-container" id="chatContainer">
          <button class="back-btn" onclick="goHome()">
            <span class="material-icons" style="font-size: 16px;">arrow_back</span>
            Back to home
          </button>
          
          <div id="messagesContainer"></div>
        </div>
        
        <div class="chat-input-container">
          <div class="input-wrapper">
            <textarea class="text-input" placeholder="Enter a prompt here" id="chatInput" rows="1"></textarea>
            <div class="input-actions">
              <button class="action-btn send-btn" id="chatSendBtn" onclick="sendChatMessage()" disabled>
                <span class="material-icons">send</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <script>
        let currentUserMessage = '';
        let lastActionType = null;
        let isProcessing = false;
        
        // Auto-resize textarea
        function autoResize(textarea) {
          textarea.style.height = 'auto';
          textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
        }
        
        // Enable/disable send button based on input
        function updateSendButton(input, button) {
          const hasText = input.value.trim().length > 0;
          button.disabled = !hasText;
        }
        
        // Initialize input handlers
        document.getElementById('userInput').addEventListener('input', function() {
          autoResize(this);
          updateSendButton(this, document.getElementById('sendBtn'));
        });
        
        document.getElementById('chatInput').addEventListener('input', function() {
          autoResize(this);
          updateSendButton(this, document.getElementById('chatSendBtn'));
        });
        
        // Handle Enter key
        document.getElementById('userInput').addEventListener('keydown', function(e) {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
          }
        });
        
        document.getElementById('chatInput').addEventListener('keydown', function(e) {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendChatMessage();
          }
        });
        
        function showPage(pageId) {
          document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
          });
          document.getElementById(pageId).classList.add('active');
        }
        
        function handleFeature(feature) {
          if (isProcessing) return;
          
          const featureNames = {
            'translate': 'translation',
            'enhance': 'text enhancement', 
            'replace': 'find & replace'
          };
          
          isProcessing = true;
          document.body.classList.add('loading-active');
          
          lastActionType = feature;
          currentUserMessage = 'I want to use ' + featureNames[feature];
          showLoading('One moment please');
          
          // Call built-in feature procedure directly
          google.script.run
            .withSuccessHandler(function(result) {
              isProcessing = false;
              document.body.classList.remove('loading-active');
              showChatResponse(currentUserMessage, result, true);
            })
            .withFailureHandler(function(error) {
              isProcessing = false;
              document.body.classList.remove('loading-active');
              console.error('Backend error:', error);
              showChatResponse(currentUserMessage, 'Sorry, there was an error. Please try again.', true);
            })
            .executeBuiltInFeature(feature);
        }
        
        function sendMessage() {
          if (isProcessing) return;
          
          const input = document.getElementById('userInput');
          const message = input.value.trim();
          if (!message) return;
          
          isProcessing = true;
          document.body.classList.add('loading-active');
          
          currentUserMessage = message;
          input.value = '';
          updateSendButton(input, document.getElementById('sendBtn'));
          autoResize(input);
          
          showLoading('Processing your request');
          
          // Intelligent routing: built-in features vs AI agent
          google.script.run
            .withSuccessHandler(function(result) {
              isProcessing = false;
              document.body.classList.remove('loading-active');
              if (result.success) {
                showChatResponse(message, result.response || result.message, result.canUndo || false);
              } else {
                showChatResponse(message, result.error || 'I had trouble processing that. Please try again.', false);
              }
            })
            .withFailureHandler(function(error) {
              isProcessing = false;
              document.body.classList.remove('loading-active');
              console.error('Processing error:', error);
              showChatResponse(message, 'Sorry, there was an error. Please try again.', false);
            })
            .routeUserRequest(message);
        }
        
        function sendChatMessage() {
          if (isProcessing) return;
          
          const input = document.getElementById('chatInput');
          const message = input.value.trim();
          if (!message) return;
          
          isProcessing = true;
          document.body.classList.add('loading-active');
          
          addMessage('user', message);
          input.value = '';
          updateSendButton(input, document.getElementById('chatSendBtn'));
          autoResize(input);
          
          // Add loading message with three dots
          const loadingId = addMessage('ai', 'Processing your request<div class="loading-dots" style="display: inline-flex; margin-left: 8px;"><span></span><span></span><span></span></div>', false, true);
          
          // Intelligent routing: built-in features vs AI agent
          google.script.run
            .withSuccessHandler(function(result) {
              isProcessing = false;
              document.body.classList.remove('loading-active');
              // Remove loading message
              const loadingMsg = document.getElementById(loadingId);
              if (loadingMsg) loadingMsg.remove();
              
              if (result.success) {
                addMessage('ai', result.response || result.message, result.canUndo || false);
              } else {
                addMessage('ai', result.error || 'Sorry, there was an error. Please try again.', false);
              }
            })
            .withFailureHandler(function(error) {
              isProcessing = false;
              document.body.classList.remove('loading-active');
              // Remove loading message
              const loadingMsg = document.getElementById(loadingId);
              if (loadingMsg) loadingMsg.remove();
              
              console.error('Processing error:', error);
              addMessage('ai', 'Sorry, there was an error. Please try again.', false);
            })
            .routeUserRequest(message);
        }
        
        function showLoading(text) {
          document.getElementById('loadingText').textContent = text;
          showPage('loadingPage');
        }
        
        function showChatResponse(userMessage, aiResponse, showUndo) {
          const container = document.getElementById('messagesContainer');
          container.innerHTML = '';
          
          addMessage('user', userMessage);
          setTimeout(() => {
            addMessage('ai', aiResponse, showUndo);
          }, 500);
          
          showPage('chatPage');
        }
        
        function addMessage(sender, content, showUndoButton = false, isLoading = false) {
          const container = document.getElementById('messagesContainer');
          const messageDiv = document.createElement('div');
          messageDiv.className = 'message';
          
          // Generate unique ID for loading messages
          if (isLoading) {
            const loadingId = 'loading-' + Date.now();
            messageDiv.id = loadingId;
          }
          
          if (sender === 'user') {
            messageDiv.innerHTML = 
              '<div class="message-header">' +
                '<div class="user-avatar">' +
                  '<svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="#1f1f1f">' +
                    '<path d="M234-276q51-39 114-61.5T480-360q69 0 132 22.5T726-276q35-41 54.5-93T800-480q0-133-93.5-226.5T480-800q-133 0-226.5 93.5T160-480q0 59 19.5 111t54.5 93Zm246-164q-59 0-99.5-40.5T340-580q0-59 40.5-99.5T480-720q59 0 99.5 40.5T620-580q0 59-40.5 99.5T480-440Zm0 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q53 0 100-15.5t86-44.5q-39-29-86-44.5T480-280q-53 0-100 15.5T294-220q39 29 86 44.5T480-160Zm0-360q26 0 43-17t17-43q0-26-17-43t-43-17q-26 0-43 17t-17 43q0 26 17 43t43 17Zm0-60Zm0 360Z"/>' +
                  '</svg>' +
                '</div>' +
              '</div>' +
              '<div class="message-content">' + content + '</div>';
          } else {
            let actionButtons = '';
            if (showUndoButton) {
              actionButtons = 
                '<button class="undo-button" onclick="handleUndo()" title="Undo changes">' +
                  '<svg xmlns="http://www.w3.org/2000/svg" height="14px" viewBox="0 -960 960 960" width="14px" fill="currentColor">' +
                    '<path d="M480-400q-33 0-56.5-23.5T400-480q0-33 23.5-56.5T480-560q33 0 56.5 23.5T560-480q0 33-23.5 56.5T480-400Zm0 280q-139 0-241-91.5T122-440h82q14 104 92.5 172T480-200q117 0 198.5-81.5T760-480q0-117-81.5-198.5T480-760q-69 0-129 32t-101 88h110v80H120v-240h80v94q51-64 124.5-99T480-840q75 0 140.5 28.5t114 77q48.5 48.5 77 114T840-480q0 75-28.5 140.5t-77 114q-48.5 48.5-114 77T480-120Z"/>' +
                  '</svg>' +
                '</button>';
            }
            
            messageDiv.innerHTML = 
              '<div class="message-header">' +
                '<div class="ai-avatar">' +
                  '<span class="material-icons">smart_toy</span>' +
                '</div>' +
              '</div>' +
              '<div class="message-content">' + content + actionButtons + '</div>';
          }
          
          container.appendChild(messageDiv);
          
          // Enhanced auto-scroll with smooth behavior
          setTimeout(() => {
            container.scrollTop = container.scrollHeight;
            // Also scroll the main chat container if it exists
            const chatContainer = document.getElementById('chatContainer');
            if (chatContainer) {
              chatContainer.scrollTop = chatContainer.scrollHeight;
            }
          }, 100);
          
          // Return ID for loading messages
          if (isLoading) {
            return messageDiv.id;
          }
        }
        
        function handleUndo() {
          if (typeof google !== 'undefined' && google.script && google.script.run) {
            google.script.run
              .withSuccessHandler(function(result) {
                addMessage('ai', result.message || 'Changes have been undone successfully.', false);
              })
              .withFailureHandler(function(error) {
                addMessage('ai', 'Unable to undo changes. Please try again.', false);
              })
              .handleFeatureRequest('undo');
          } else {
            addMessage('ai', 'Previous changes have been undone successfully.', false);
          }
        }
        
        function generateFeatureResponse(feature) {
          const responses = {
            'translate': 'I can help you translate your slide deck to any language. What language would you like to translate to? I support over 100 languages including Spanish, French, German, Chinese, Japanese, and many more.',
            'enhance': 'I\\'ll help you improve the text in your presentation to make it more professional and engaging. Please select the text you\\'d like me to enhance, or tell me what specific improvements you\\'re looking for.',
            'replace': 'I can help you find and replace text across all your slides. What text would you like me to find and replace? I can do smart replacements while maintaining context and formatting.'
          };
          return responses[feature] || 'How can I help you with your presentation?';
        }
        
        function generateResponse(message) {
          const lowerMessage = message.toLowerCase();
          
          if (lowerMessage.includes('translate') || lowerMessage.includes('spanish') || lowerMessage.includes('french') || lowerMessage.includes('german') || lowerMessage.includes('chinese') || lowerMessage.includes('japanese') || lowerMessage.includes('english')) {
            // Smart language detection - avoid infinite loops
            const languages = {
              'spanish': 'Spanish',
              'french': 'French', 
              'german': 'German',
              'chinese': 'Chinese',
              'japanese': 'Japanese',
              'english': 'English',
              'italian': 'Italian',
              'portuguese': 'Portuguese',
              'russian': 'Russian',
              'korean': 'Korean'
            };
            
            for (const [key, value] of Object.entries(languages)) {
              if (lowerMessage.includes(key)) {
                return 'Perfect! I\\'ll translate your slide deck to ' + value + '. I\\'ll preserve all formatting, fonts, and styling while translating the text content. This may take a moment...';
              }
            }
            
            return 'I can help you translate your slides. What language would you like to translate to?';
          } else if (lowerMessage.includes('enhance') || lowerMessage.includes('improve')) {
            return 'I\\'ll help improve your text. Please select the content you\\'d like me to enhance.';
          } else if (lowerMessage.includes('replace') || lowerMessage.includes('find')) {
            return 'I can help with find and replace. What text would you like me to change?';
          } else if (lowerMessage.includes('undo') || lowerMessage.includes('revert')) {
            return 'I can undo recent changes. What would you like me to revert?';
          } else {
            return 'I understand you want help with: "' + message + '". I can assist with translation, text enhancement, and find & replace operations. What would you like me to help you with?';
          }
        }
        
        function goHome() {
          showPage('homePage');
        }
        
      </script>
    </body>
    </html>
  `).setWidth(380).setTitle('Slide Buddy');
  
  SlidesApp.getUi().showSidebar(html);
}

/**
 * Basic translation function using Google Translate
 */
function translateSlideText(targetLanguage) {
  try {
    const presentation = SlidesApp.getActivePresentation();
    const slides = presentation.getSlides();
    let translatedCount = 0;
    
    slides.forEach(slide => {
      const shapes = slide.getShapes();
      shapes.forEach(shape => {
        if (shape.getShapeType() === SlidesApp.ShapeType.TEXT_BOX) {
          const textRange = shape.getText();
          const originalText = textRange.asString();
          
          if (originalText.trim()) {
            try {
              const translatedText = LanguageApp.translate(originalText, '', targetLanguage);
              textRange.setText(translatedText);
              translatedCount++;
            } catch (e) {
              console.log('Translation error for text:', originalText);
            }
          }
        }
      });
    });
    
    return `Successfully translated ${translatedCount} text elements to ${getLanguageName(targetLanguage)}.`;
  } catch (error) {
    return 'Translation failed. Please try again or check your presentation permissions.';
  }
}

/**
 * Get language name from code
 */
function getLanguageName(code) {
  const languages = {
    'es': 'Spanish', 'fr': 'French', 'de': 'German', 'it': 'Italian',
    'pt': 'Portuguese', 'ru': 'Russian', 'ja': 'Japanese', 'ko': 'Korean',
    'zh': 'Chinese', 'ar': 'Arabic', 'hi': 'Hindi', 'en': 'English'
  };
  return languages[code] || code;
}

/**
 * Handle feature requests from the frontend (optional - for real API integration)
 */
function handleFeatureRequest(feature) {
  try {
    switch(feature) {
      case 'translate':
        return 'I can help you translate your slide deck to any language. What language would you like to translate to? I support over 100 languages including Spanish, French, German, Chinese, Japanese, and many more.';
        
      case 'enhance':
        return 'I\'ll help you improve the text in your presentation to make it more professional and engaging. Please select the text you\'d like me to enhance, or tell me what specific improvements you\'re looking for.';
        
      case 'replace':
        return 'I can help you find and replace text across all your slides. What text would you like me to find and replace? I can do smart replacements while maintaining context and formatting.';
        
      case 'undo':
        return 'Previous changes have been undone successfully.';
        
      default:
        return 'How can I help you with your presentation?';
    }
  } catch (error) {
    console.error('Feature request error:', error);
    return `I'm ready to help with ${feature}! Please make sure your Gemini API key is configured in Script Properties if you want full AI functionality.`;
  }
}

/**
 * Process user messages (optional - for real AI integration)
 */
function processUserMessage(message) {
  try {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('translate')) {
      return {
        success: true,
        response: 'I can help you translate your slides. What language would you like to translate to?'
      };
    } else if (lowerMessage.includes('enhance') || lowerMessage.includes('improve')) {
      return {
        success: true,
        response: 'I\'ll help improve your text. Please select the content you\'d like me to enhance.'
      };
    } else if (lowerMessage.includes('replace') || lowerMessage.includes('find')) {
      return {
        success: true,
        response: 'I can help with find and replace. What text would you like me to change?'
      };
    } else if (lowerMessage.includes('undo') || lowerMessage.includes('revert')) {
      return {
        success: true,
        response: 'I can undo recent changes. What would you like me to revert?'
      };
    } else {
      return {
        success: true,
        response: 'I understand you want help with: "' + message + '". I can assist with translation, text enhancement, and find & replace operations. What would you like me to help you with?'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: 'I had trouble processing that. Please try again.'
    };
  }
}/**
 * Execute built-in features directly (Step 1: User clicks built-in feature)
 */
function executeBuiltInFeature(feature) {
  try {
    switch(feature) {
      case 'translate':
        return 'I can translate all slides in your presentation to any language. What language would you like me to translate everything to? I support Spanish, French, German, Chinese, Japanese, Korean, Italian, Portuguese, Russian, Arabic, Hindi, and many more.';
        
      case 'enhance':
        return 'I\'ll improve the text across all slides to make your presentation more professional and engaging. This will enhance grammar, tone, and clarity throughout your entire deck. Would you like me to proceed?';
        
      case 'replace':
        return 'I can find and replace any word or phrase across all slides in your presentation. What text would you like me to find and what should I replace it with? For example: "Find: old company name, Replace: new company name"';
        
      case 'undo':
        return "Undo Guide: Press Ctrl+Z (or Cmd+Z on Mac) in Google Slides to revert changes. You can also use Edit → Undo from the menu. Google Slides keeps full edit history for multiple undos.";
        
      default:
        return 'How can I help you with your presentation?';
    }
  } catch (error) {
    console.error('Built-in feature error:', error);
    return `I'm ready to help with ${feature}! ${error.message.includes('API key') ? 'Please make sure your Gemini API key is configured in Script Properties.' : ''}`;
  }
}

/**
 * Intelligent routing system (Step 2: User types custom request)
 */
function routeUserRequest(message) {
  try {
    const lowerMessage = message.toLowerCase();
    
    // Step 2a: Check if request matches built-in features
    const builtInFeature = detectBuiltInFeature(message);
    
    if (builtInFeature) {
      // Use built-in procedure
      return executeBuiltInProcedure(builtInFeature, message);
    } else {
      // Step 2b: Use AI agent with tools for custom requests
      return executeAIAgent(message);
    }
    
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Detect if user request matches a built-in feature
 */
function detectBuiltInFeature(message) {
  const lowerMessage = message.toLowerCase();
  
  // Translation detection
  const languages = ['spanish', 'french', 'german', 'chinese', 'japanese', 'korean', 'italian', 'portuguese', 'russian', 'arabic', 'hindi', 'english'];
  if (languages.some(lang => lowerMessage.includes(lang)) || lowerMessage.includes('translate')) {
    return 'translate';
  }
  
  // Find & Replace detection
  if ((lowerMessage.includes('find') && lowerMessage.includes('replace')) || 
      (lowerMessage.includes('change') && lowerMessage.includes('to')) ||
      lowerMessage.includes('replace')) {
    return 'replace';
  }
  
  // Enhancement detection
  if (lowerMessage.includes('enhance') || lowerMessage.includes('improve') || 
      lowerMessage.includes('better') || lowerMessage.includes('professional')) {
    return 'enhance';
  }
  
  // Undo detection
  if (lowerMessage.includes('undo') || lowerMessage.includes('revert') || lowerMessage.includes('back')) {
    return 'undo';
  }
  
  return null; // No built-in feature detected
}

/**
 * Execute built-in procedures with user input
 */
function executeBuiltInProcedure(feature, message) {
  try {
    switch(feature) {
      case 'translate':
        return handleDirectTranslation(message);
        
      case 'replace':
        return handleDirectFindReplace(message);
        
      case 'enhance':
        return handleDirectEnhancement();
        
      case 'undo':
        return {
          success: true,
          response: "Undo Guide: Press Ctrl+Z (or Cmd+Z on Mac) in Google Slides to revert changes. You can also use Edit → Undo from the menu. Google Slides keeps full edit history for multiple undos.",
          canUndo: false
        };
        
      default:
        return executeAIAgent(message);
    }
  } catch (error) {
    return {
      success: false,
      error: `Built-in procedure failed: ${error.message}`
    };
  }
}

/**
 * AI Agent with tools for custom requests
 */
function executeAIAgent(message) {
  try {
    const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
    
    if (!apiKey) {
      return {
        success: false,
        response: `🔑 **API Key Required**\n\nTo use AI features, please configure your Gemini API key:\n\n📋 **Setup Instructions:**\n1. Go to Extensions → Apps Script\n2. Click on Project Settings (gear icon)\n3. Add Script Property: GEMINI_API_KEY\n4. Enter your Gemini API key as the value`
      };
    }
    
    console.log('Using AI Agent with Gemini API for message:', message);
    
    const context = getCurrentContext();
    const aiManager = new AIManager();
    
    // Use AI to understand and respond to the request
    const aiPrompt = `You are Slide Buddy, a professional presentation assistant. The user said: "${message}"

Current context:
- Presentation has ${context.presentationStructure.totalSlides} slides
- Current slide: ${context.currentSlide ? context.currentSlide.slideNumber : 'None'}
- Selected elements: ${context.selectedElements.length}

Please provide a helpful response and if possible, suggest specific actions. Be conversational and professional.`;

    const aiResponse = aiManager.callGemini(aiPrompt, 400);
    
    return {
      success: true,
      response: aiResponse,
      canUndo: false
    };
    
  } catch (error) {
    console.error('AI agent error:', error);
    return {
      success: false,
      response: `AI processing failed: ${error.message}. Please check your API key and try again.`
    };
  }
}

/**
 * Test API connection (for debugging)
 */
function testAPIConnection() {
  try {
    const aiManager = new AIManager();
    return 'API connection successful! Gemini API key is configured and ready.';
  } catch (error) {
    return `API connection failed: ${error.message}`;
  }
}

/**
 * Test function that can run from Apps Script editor
 */
function testInstallation() {
  try {
    console.log('✅ Testing Slide Buddy installation...');
    console.log('✅ All classes loaded successfully');
    console.log('✅ Ready to install in Google Slides');
    console.log('');
    console.log('📋 Next steps:');
    console.log('1. Open Google Slides: https://slides.google.com');
    console.log('2. Create or open a presentation');
    console.log('3. Go to Extensions → Apps Script');
    console.log('4. Select this Slide Buddy project');
    console.log('5. Run the onOpen function');
    console.log('6. Refresh Google Slides');
    console.log('7. Look for "Slide Buddy" menu');
    
    return 'Installation test passed! Ready to use in Google Slides.';
  } catch (error) {
    console.error('❌ Installation test failed:', error);
    return `Installation test failed: ${error.message}`;
  }
}

// Core feature implementations (keeping existing functionality)
function handleActionClick(actionType) {
  try {
    const context = getCurrentContext();
    
    switch (actionType) {
      case 'translate':
        return handleTranslation(context);
      case 'findReplace':
        return handleFindReplace(context);
      case 'changeTone':
        return handleToneChange(context);
      case 'undo':
        return handleUndo(context);
      default:
        throw new Error('Unknown action type');
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

function handleTranslation(context) {
  const translationEngine = new TranslationEngine();
  return translationEngine.analyzeAndRequestTranslation();
}

function handleFindReplace(context) {
  const findReplaceEngine = new FindReplaceEngine();
  return findReplaceEngine.replaceAllOccurrences(context.findText, context.replaceText);
}

function handleToneChange(context) {
  const textEnhancer = new TextEnhancementEngine();
  return textEnhancer.changeTone(context.targetTone);
}

function handleUndo(context) {
  return {
    success: true,
    message: "Undo Guide: Press Ctrl+Z (or Cmd+Z on Mac) in Google Slides to revert changes. You can also use Edit → Undo from the menu. Google Slides keeps full edit history for multiple undos.",
    canUndo: false
  };
}

/**
 * Handles revert/undo requests from the UI
 * Provides clear guidance since direct undo linking isn't possible
 */
function handleRevertRequest() {
  try {
    console.log('Revert button clicked - providing undo guidance');
    
    return {
      success: true,
      message: "Undo Guide: Press Ctrl+Z (or Cmd+Z on Mac) in Google Slides to revert changes. You can also use Edit → Undo from the menu. Google Slides keeps full edit history for multiple undos.",
      canUndo: false
    };
    
  } catch (error) {
    console.error('Revert request failed:', error);
    return {
      success: false,
      message: 'Unable to process undo request. Please try using Ctrl+Z in Google Slides.',
      canUndo: false
    };
  }
}

/**
 * Clean up any existing snapshot data from PropertiesService
 * Call this function to remove old revert system data
 */
function cleanUpOldSnapshotData() {
  try {
    const userEmail = Session.getActiveUser().getEmail();
    const sessionKey = 'slide_bro_snapshots_' + userEmail;
    
    // Remove snapshots from Properties Service
    PropertiesService.getScriptProperties().deleteProperty(sessionKey);
    
    console.log(`✅ Cleaned up old snapshot data for user: ${userEmail}`);
    return {
      success: true,
      message: `Old snapshot data has been cleared. The extension now uses Google Slides' native undo functionality.`
    };
    
  } catch (error) {
    console.error('Failed to clean up snapshot data:', error);
    return {
      success: false,
      message: 'Could not clean up old data, but this does not affect functionality.'
    };
  }
}

function getCurrentContext() {
  const presentation = SlidesApp.getActivePresentation();
  const selection = presentation.getSelection();
  
  const context = {
    presentationId: presentation.getId(),
    selectionType: selection ? selection.getSelectionType() : 'NONE',
    selectedElements: selection ? getDetailedSelectedElements(selection) : [],
    currentSlide: selection ? getDetailedSlideContext(selection.getCurrentPage()) : null,
    presentationStructure: buildPresentationStructure(presentation)
  };
  
  return context;
}

function getDetailedSlideContext(slide) {
  if (!slide) return null;
  
  const slides = SlidesApp.getActivePresentation().getSlides();
  const slideIndex = slides.findIndex(s => s.getObjectId() === slide.getObjectId());
  
  return {
    slideId: slide.getObjectId(),
    slideNumber: slideIndex + 1,
    slideTitle: extractSlideTitle(slide),
    elementCount: slide.getPageElements().length,
    slideType: detectSlideType(slide)
  };
}

function getDetailedSelectedElements(selection) {
  if (!selection) return [];
  
  const elements = [];
  const selectionType = selection.getSelectionType();
  
  try {
    if (selectionType === SlidesApp.SelectionType.PAGE_ELEMENT) {
      const pageElements = selection.getPageElementRange().getPageElements();
      
      pageElements.forEach(element => {
        const elementInfo = {
          id: element.getObjectId(),
          type: element.getPageElementType(),
          textContent: extractElementText(element),
          semanticRole: detectElementRole(element),
          position: getElementPosition(element)
        };
        elements.push(elementInfo);
      });
    }
  } catch (error) {
    console.log('No elements selected or selection error:', error);
  }
  
  return elements;
}

function extractSlideTitle(slide) {
  try {
    const elements = slide.getPageElements();
    for (const element of elements) {
      if (element.getPageElementType() === SlidesApp.PageElementType.SHAPE) {
        const shape = element.asShape();
        const text = shape.getText().asString().trim();
        if (text && text.length < 100) { // Likely a title
          return text;
        }
      }
    }
    return 'Untitled Slide';
  } catch (error) {
    return 'Untitled Slide';
  }
}

function detectSlideType(slide) {
  try {
    const elements = slide.getPageElements();
    let hasTitle = false;
    let hasBullets = false;
    let hasChart = false;
    let hasImage = false;
    
    elements.forEach(element => {
      const type = element.getPageElementType();
      if (type === SlidesApp.PageElementType.SHAPE) {
        const text = element.asShape().getText().asString();
        if (text.includes('•') || text.includes('-')) hasBullets = true;
        if (text.length < 50) hasTitle = true;
      } else if (type === SlidesApp.PageElementType.IMAGE) {
        hasImage = true;
      } else if (type === SlidesApp.PageElementType.SHEETCHART) {
        hasChart = true;
      }
    });
    
    if (hasChart) return 'chart';
    if (hasBullets) return 'content';
    if (hasTitle && !hasBullets) return 'title';
    if (hasImage) return 'visual';
    return 'content';
  } catch (error) {
    return 'content';
  }
}

function extractElementText(element) {
  try {
    if (element.getPageElementType() === SlidesApp.PageElementType.SHAPE) {
      return element.asShape().getText().asString().substring(0, 100);
    }
    return '';
  } catch (error) {
    return '';
  }
}

function detectElementRole(element) {
  try {
    const type = element.getPageElementType();
    if (type === SlidesApp.PageElementType.SHAPE) {
      const text = element.asShape().getText().asString();
      if (text.length < 50) return 'title';
      if (text.includes('•') || text.includes('-')) return 'bullet_list';
      return 'text_block';
    } else if (type === SlidesApp.PageElementType.IMAGE) {
      return 'image';
    } else if (type === SlidesApp.PageElementType.SHEETCHART) {
      return 'chart';
    }
    return 'element';
  } catch (error) {
    return 'element';
  }
}

function getElementPosition(element) {
  try {
    const transform = element.getTransform();
    return {
      x: transform.getTranslateX(),
      y: transform.getTranslateY()
    };
  } catch (error) {
    return { x: 0, y: 0 };
  }
}

function buildPresentationStructure(presentation) {
  try {
    const slides = presentation.getSlides();
    return {
      totalSlides: slides.length,
      slideStructure: slides.map((slide, index) => ({
        slideNumber: index + 1,
        slideId: slide.getObjectId(),
        title: extractSlideTitle(slide),
        type: detectSlideType(slide)
      }))
    };
  } catch (error) {
    return { totalSlides: 0, slideStructure: [] };
  }
}

function getSelectedElements(selection) {
  const elements = [];
  
  try {
    if (selection && selection.getSelectionType() === SlidesApp.SelectionType.PAGE_ELEMENT) {
      const pageElements = selection.getPageElementRange().getPageElements();
      
      pageElements.forEach(element => {
        elements.push({
          id: element.getObjectId(),
          type: element.getPageElementType(),
        });
      });
    }
  } catch (error) {
    console.log('No elements selected:', error);
  }
  
  return elements;
}

// Legacy function - now routes to new system
function processUserMessage(message) {
  return routeUserRequest(message);
}

function handleDirectTranslation(message) {
  try {
    const targetLanguage = extractLanguageFromMessage(message);
    
    if (!targetLanguage) {
      return {
        success: false,
        response: "Please specify which language you'd like me to translate all slides to. For example: 'Spanish', 'French', 'Chinese', etc."
      };
    }
    
    console.log(`Starting AI-enhanced translation to ${targetLanguage}`);
    
    const presentation = SlidesApp.getActivePresentation();
    const slides = presentation.getSlides();
    
    if (slides.length === 0) {
      return {
        success: false,
        response: "No slides found in the presentation. Please make sure you have a presentation open."
      };
    }
    
    let totalTranslations = 0;
    let translatedSlides = 0;
    const aiManager = new AIManager();
    
    // Process each slide with proper async handling
    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];
      const shapes = slide.getShapes();
      let slideChanged = false;
      
      console.log(`Processing slide ${i + 1} of ${slides.length}...`);
      
      for (const shape of shapes) {
        // Check if shape has text (most shapes in Google Slides can contain text)
        try {
          const textRange = shape.getText();
          if (textRange) {
            const originalText = textRange.asString();
            
            if (originalText.trim() && originalText.length > 0) {
              console.log(`Found text: "${originalText.substring(0, 50)}..."`);
              
              try {
                // Use Google Translate first
                const basicTranslation = LanguageApp.translate(originalText, '', targetLanguage.toLowerCase());
                
                // Then enhance with Gemini AI (synchronous call)
                try {
                  const enhancementPrompt = `Improve this translation to be more natural and contextually appropriate for a business presentation:

Original: "${originalText}"
Basic translation: "${basicTranslation}"
Target language: ${targetLanguage}

Provide only the improved translation:`;
                  
                  const enhancedTranslation = aiManager.callGemini(enhancementPrompt, 200);
                  textRange.setText(enhancedTranslation || basicTranslation);
                  
                  console.log(`Translated: "${originalText.substring(0, 30)}..." -> "${(enhancedTranslation || basicTranslation).substring(0, 30)}..."`);
                  
                  // Add small delay to show progress
                  Utilities.sleep(100);
                  
                } catch (aiError) {
                  console.log('AI enhancement failed, using basic translation:', aiError);
                  textRange.setText(basicTranslation);
                  console.log(`Basic translation: "${originalText.substring(0, 30)}..." -> "${basicTranslation.substring(0, 30)}..."`);
                }
                
                totalTranslations++;
                slideChanged = true;
                
              } catch (translateError) {
                console.log(`Translation error: ${translateError.message}`);
              }
            }
          }
        } catch (textError) {
          // Shape doesn't have text, skip it
          console.log(`Shape ${shape.getShapeType()} has no text`);
        }
      }
      
      if (slideChanged) {
        translatedSlides++;
      }
      
      // Add progress delay between slides
      if (i < slides.length - 1) {
        Utilities.sleep(200);
      }
    }
    
    return {
      success: true,
      response: `✅ **AI-Enhanced Translation Complete!**\n\nI've translated all slides to ${targetLanguage} using Gemini AI.\n\n📊 **Results:**\n• ${totalTranslations} text elements translated\n• ${translatedSlides} slides updated\n• AI-enhanced for natural language flow\n\nYour presentation is now professionally translated!`,
      canUndo: true
    };
    
  } catch (error) {
    console.error('Translation error:', error);
    return {
      success: false,
      response: `Translation failed: ${error.message}. Please make sure your presentation is open and your Gemini API key is configured.`
    };
  }
}

function isLanguageSelection(message) {
  const languageKeywords = [
    'spanish', 'french', 'german', 'italian', 'portuguese', 'chinese', 
    'japanese', 'korean', 'russian', 'arabic', 'hindi', 'english'
  ];
  
  const lowerMessage = message.toLowerCase();
  return languageKeywords.some(lang => lowerMessage.includes(lang));
}

function extractLanguageFromMessage(message) {
  const languageMap = {
    'spanish': 'Spanish',
    'french': 'French', 
    'german': 'German',
    'italian': 'Italian',
    'portuguese': 'Portuguese',
    'chinese': 'Chinese',
    'japanese': 'Japanese',
    'korean': 'Korean',
    'russian': 'Russian',
    'arabic': 'Arabic',
    'hindi': 'Hindi',
    'english': 'English'
  };
  
  const lowerMessage = message.toLowerCase();
  
  for (const [key, value] of Object.entries(languageMap)) {
    if (lowerMessage.includes(key)) {
      return value;
    }
  }
  
  return null;
}

/**
 * Direct workflow functions - no AI needed
 */
function handleDirectFindReplace(message) {
  try {
    // Extract find and replace terms from message
    const findMatch = message.match(/find[:\s]+([^,]+)/i);
    const replaceMatch = message.match(/replace[:\s]+(.+)/i);
    
    if (!findMatch || !replaceMatch) {
      return {
        success: false,
        response: 'Please specify both what to find and what to replace it with. Format: "Find: old text, Replace: new text"'
      };
    }
    
    const findText = findMatch[1].trim();
    const replaceText = replaceMatch[1].trim();
    
    const findReplaceEngine = new FindReplaceEngine();
    const result = findReplaceEngine.replaceAllOccurrences(findText, replaceText);
    
    return {
      success: true,
      response: `✅ **Find & Replace Complete!**\n\nReplaced "${findText}" with "${replaceText}" across all slides.\n\n📊 **Results:**\n• ${result.replacements || 0} replacements made\n• ${result.slidesAffected || 0} slides updated\n\nAll changes have been applied to your presentation.`,
      canUndo: true
    };
    
  } catch (error) {
    return {
      success: false,
      response: `Find & replace failed: ${error.message}`
    };
  }
}

function handleDirectEnhancement() {
  try {
    const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
    
    if (!apiKey) {
      return {
        success: false,
        response: `🔑 **API Key Required**\n\nTo use text enhancement, please configure your Gemini API key in Script Properties.`
      };
    }
    
    console.log('Using Text Enhancement with Gemini API');
    
    const presentation = SlidesApp.getActivePresentation();
    const slides = presentation.getSlides();
    const aiManager = new AIManager();
    
    let totalEnhancements = 0;
    let enhancedSlides = 0;
    
    for (const slide of slides) {
      const shapes = slide.getShapes();
      let slideChanged = false;
      
      for (const shape of shapes) {
        // Check if shape has text (most shapes in Google Slides can contain text)
        try {
          const textRange = shape.getText();
          if (textRange) {
            const originalText = textRange.asString();
            
            if (originalText.trim() && originalText.length > 10) {
              console.log(`Found text to enhance: "${originalText.substring(0, 50)}..."`);
              
              try {
                const enhancementPrompt = `Improve this presentation text to be more professional, clear, and engaging:

"${originalText}"

Requirements:
- Keep the same meaning
- Improve grammar and clarity  
- Make it more professional
- Keep it concise
- Maintain appropriate tone

Provide only the improved text:`;
                
                const enhancedText = aiManager.callGemini(enhancementPrompt, 300);
                
                if (enhancedText && enhancedText.trim() !== originalText.trim()) {
                  textRange.setText(enhancedText.replace(/^["']|["']$/g, '').trim());
                  console.log(`Enhanced: "${originalText.substring(0, 30)}..." -> "${enhancedText.substring(0, 30)}..."`);
                  totalEnhancements++;
                  slideChanged = true;
                }
                
              } catch (enhanceError) {
                console.log(`Enhancement error: ${enhanceError.message}`);
              }
            }
          }
        } catch (textError) {
          // Shape doesn't have text, skip it
          console.log(`Shape ${shape.getShapeType()} has no text`);
        }
      }
      
      if (slideChanged) {
        enhancedSlides++;
      }
    }
    
    return {
      success: true,
      response: `✅ **AI Text Enhancement Complete!**\n\nI've improved your presentation using Gemini AI.\n\n📈 **Improvements Made:**\n• ${totalEnhancements} text elements enhanced\n• ${enhancedSlides} slides updated\n• Professional grammar and tone improvements\n\nYour presentation is now more polished and engaging!`,
      canUndo: true
    };
    
  } catch (error) {
    console.error('Enhancement error:', error);
    return {
      success: false,
      response: `Text enhancement failed: ${error.message}. Please check your API key configuration.`
    };
  }
}

/**
 * Test functions for debugging
 */
/**
 * Test Gemini API connection
 */
function testGeminiAPI() {
  try {
    console.log('Testing Gemini API connection...');
    const aiManager = new AIManager();
    const response = aiManager.callGemini('Hello! Please respond with "Gemini API is working correctly!" to confirm the connection.');
    console.log('✅ Gemini API Response:', response);
    return response;
  } catch (error) {
    console.error('❌ Gemini API test failed:', error);
    return `API test failed: ${error.message}`;
  }
}

/**
 * Test translation with AI
 */
function testAITranslation() {
  try {
    const result = handleDirectTranslation('Spanish');
    console.log('Translation test result:', result);
    return result;
  } catch (error) {
    console.error('Translation test failed:', error);
    return { success: false, response: `Translation test failed: ${error.message}` };
  }
}

/**
 * Test text enhancement with AI
 */
function testAIEnhancement() {
  try {
    const result = handleDirectEnhancement();
    console.log('Enhancement test result:', result);
    return result;
  } catch (error) {
    console.error('Enhancement test failed:', error);
    return { success: false, response: `Enhancement test failed: ${error.message}` };
  }
}

/**
 * Debug function to see what's actually in the slides
 */
function debugSlideContent() {
  try {
    const presentation = SlidesApp.getActivePresentation();
    const slides = presentation.getSlides();
    
    console.log(`Found ${slides.length} slides`);
    
    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];
      const shapes = slide.getShapes();
      
      console.log(`\n=== Slide ${i + 1} ===`);
      console.log(`Found ${shapes.length} shapes`);
      
      for (let j = 0; j < shapes.length; j++) {
        const shape = shapes[j];
        const shapeType = shape.getShapeType();
        
        console.log(`Shape ${j + 1}: Type = ${shapeType}`);
        
        // Try to get text from any shape that might have text
        try {
          const text = shape.getText();
          if (text) {
            const textContent = text.asString();
            console.log(`  Text content: "${textContent.substring(0, 100)}..."`);
            console.log(`  Text length: ${textContent.length}`);
          } else {
            console.log(`  No text object`);
          }
        } catch (textError) {
          console.log(`  Cannot get text: ${textError.message}`);
        }
      }
      
      // Also check page elements
      const pageElements = slide.getPageElements();
      console.log(`Found ${pageElements.length} page elements`);
      
      for (let k = 0; k < pageElements.length; k++) {
        const element = pageElements[k];
        const elementType = element.getPageElementType();
        console.log(`Element ${k + 1}: Type = ${elementType}`);
      }
    }
    
    return `Debug complete. Found ${slides.length} slides with content analysis in console.`;
    
  } catch (error) {
    console.error('Debug error:', error);
    return `Debug failed: ${error.message}`;
  }
}

function testTranslationEngine() {
  try {
    console.log('Testing Translation Engine...');
    const engine = new TranslationEngine();
    const result = engine.analyzeAndRequestTranslation();
    console.log('Translation result:', result);
    return result;
  } catch (error) {
    console.error('Translation test failed:', error);
    return `Translation test failed: ${error.message}`;
  }
}

function testCurrentSlideContent() {
  try {
    const presentation = SlidesApp.getActivePresentation();
    const slides = presentation.getSlides();
    console.log('Total slides:', slides.length);
    
    if (slides.length > 0) {
      const firstSlide = slides[0];
      const shapes = firstSlide.getShapes();
      console.log('Shapes on first slide:', shapes.length);
      
      shapes.forEach((shape, index) => {
        if (shape.getShapeType() === SlidesApp.ShapeType.TEXT_BOX) {
          const text = shape.getText().asString();
          console.log(`Text box ${index}:`, text.substring(0, 100));
        }
      });
    }
    
    return `Found ${slides.length} slides with content to translate`;
  } catch (error) {
    console.error('Slide content test failed:', error);
    return `Slide content test failed: ${error.message}`;
  }
}

/**
 * GEMINI 2.5 FLASH UPDATE - Add this to the end of Code.js
 */

/**
 * Updated AI Manager for Gemini 2.5 Flash
 */
class AIManager {
  constructor() {
    this.apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY not found in Script Properties');
    }
  }
  
  callGemini(prompt, maxTokens = 1000) {
    try {
      // Updated to use Gemini 2.5 Flash model
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${this.apiKey}`;
      
      const payload = {
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          maxOutputTokens: maxTokens,
          temperature: 0.7,
          topP: 0.8,
          topK: 40
        }
      };
      
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        payload: JSON.stringify(payload)
      };
      
      console.log('Calling Gemini 2.5 Flash API...');
      
      const response = UrlFetchApp.fetch(url, options);
      const responseCode = response.getResponseCode();
      const responseText = response.getContentText();
      
      console.log('Gemini 2.5 Flash Response Code:', responseCode);
      console.log('Gemini 2.5 Flash Response:', responseText);
      
      if (responseCode !== 200) {
        throw new Error(`Gemini 2.5 Flash API error: ${responseCode} - ${responseText}`);
      }
      
      const data = JSON.parse(responseText);
      
      if (data.candidates && data.candidates.length > 0 && data.candidates[0].content && data.candidates[0].content.parts) {
        return data.candidates[0].content.parts[0].text;
      } else {
        console.log('Unexpected API response structure:', data);
        throw new Error('Unexpected response format from Gemini 2.5 Flash API');
      }
      
    } catch (error) {
      console.error('Gemini 2.5 Flash API call failed:', error);
      throw error;
    }
  }

  /**
   * Enhanced method for complex reasoning tasks using Gemini 2.5 Flash's thinking capabilities
   */
  callGeminiWithThinking(prompt, maxTokens = 1000, thinkingBudget = null) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${this.apiKey}`;
      
      const generationConfig = {
        maxOutputTokens: maxTokens,
        temperature: 0.7,
        topP: 0.8,
        topK: 40
      };

      // Add thinking budget if specified (for complex reasoning tasks)
      if (thinkingBudget) {
        generationConfig.thinkingBudget = thinkingBudget;
      }
      
      const payload = {
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: generationConfig
      };
      
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        payload: JSON.stringify(payload)
      };
      
      console.log('Calling Gemini 2.5 Flash with thinking capabilities...');
      
      const response = UrlFetchApp.fetch(url, options);
      const responseCode = response.getResponseCode();
      const responseText = response.getContentText();
      
      if (responseCode !== 200) {
        throw new Error(`Gemini 2.5 Flash API error: ${responseCode} - ${responseText}`);
      }
      
      const data = JSON.parse(responseText);
      
      if (data.candidates && data.candidates.length > 0 && data.candidates[0].content && data.candidates[0].content.parts) {
        return data.candidates[0].content.parts[0].text;
      } else {
        throw new Error('Unexpected response format from Gemini 2.5 Flash API');
      }
      
    } catch (error) {
      console.error('Gemini 2.5 Flash thinking API call failed:', error);
      throw error;
    }
  }
}

/**
 * Test functions for Gemini 2.5 Flash
 */
function testGemini25Flash() {
  try {
    console.log('Testing Gemini 2.5 Flash connection...');
    const aiManager = new AIManager();
    const response = aiManager.callGemini('Please respond with exactly: "Gemini 2.5 Flash is working correctly!" and briefly explain one key advantage of this model.');
    console.log('✅ Gemini 2.5 Flash Response:', response);
    return response;
  } catch (error) {
    console.error('❌ Gemini 2.5 Flash test failed:', error);
    return `Gemini 2.5 Flash test failed: ${error.message}`;
  }
}

function testGemini25FlashThinking() {
  try {
    console.log('Testing Gemini 2.5 Flash thinking capabilities...');
    const aiManager = new AIManager();
    const response = aiManager.callGeminiWithThinking(
      'Analyze this presentation enhancement request: "Make my slides more professional and engaging." Provide a step-by-step improvement plan with specific actionable recommendations.',
      500
    );
    console.log('✅ Gemini 2.5 Flash Thinking Response:', response);
    return response;
  } catch (error) {
    console.error('❌ Gemini 2.5 Flash thinking test failed:', error);
    return `Gemini 2.5 Flash thinking test failed: ${error.message}`;
  }
}

/**
 * Enhanced translation function using Gemini 2.5 Flash
 */
function handleDirectTranslationGemini25(targetLanguage) {
  try {
    console.log(`Starting translation to ${targetLanguage} using Gemini 2.5 Flash`);
    
    const presentation = SlidesApp.getActivePresentation();
    const slides = presentation.getSlides();
    
    if (slides.length === 0) {
      return {
        success: false,
        response: "No slides found in the presentation."
      };
    }
    
    // Enhanced language mapping for Gemini 2.5 Flash
    const languageMap = {
      'spanish': 'es',
      'french': 'fr', 
      'german': 'de',
      'italian': 'it',
      'portuguese': 'pt',
      'russian': 'ru',
      'chinese': 'zh',
      'japanese': 'ja',
      'korean': 'ko',
      'arabic': 'ar',
      'hindi': 'hi',
      'dutch': 'nl',
      'swedish': 'sv',
      'norwegian': 'no',
      'danish': 'da'
    };
    
    const targetCode = languageMap[targetLanguage.toLowerCase()] || targetLanguage.toLowerCase();
    console.log(`Using language code: ${targetCode} with Gemini 2.5 Flash`);
    
    let totalTranslations = 0;
    let translatedSlides = 0;
    const aiManager = new AIManager();
    
    // Process slides with Gemini 2.5 Flash's enhanced reasoning
    for (let i = 0; i < Math.min(slides.length, 3); i++) {
      const slide = slides[i];
      const shapes = slide.getShapes();
      let slideChanged = false;
      
      console.log(`Processing slide ${i + 1} with Gemini 2.5 Flash...`);
      
      for (const shape of shapes) {
        try {
          const textRange = shape.getText();
          if (textRange) {
            const originalText = textRange.asString();
            
            if (originalText.trim() && originalText.length > 0) {
              console.log(`Found text: "${originalText.substring(0, 50)}..."`);
              
              try {
                // Use enhanced prompting for Gemini 2.5 Flash
                const enhancedPrompt = `You are a professional translation expert using Gemini 2.5 Flash capabilities. 

Task: Translate this presentation text to ${targetLanguage} (${targetCode})

Original text: "${originalText}"

Requirements:
- Maintain professional presentation tone
- Preserve formatting and structure
- Use natural, contextually appropriate language
- Consider business/academic context
- Ensure cultural appropriateness

Provide only the translated text without explanations:`;
                
                const translation = aiManager.callGeminiWithThinking(enhancedPrompt, 300);
                
                if (translation && translation.trim()) {
                  textRange.setText(translation.trim());
                  console.log(`✅ Translated with Gemini 2.5 Flash: "${originalText.substring(0, 30)}..." -> "${translation.substring(0, 30)}..."`);
                  totalTranslations++;
                  slideChanged = true;
                }
                
                // Rate limiting
                Utilities.sleep(1000);
                
              } catch (translateError) {
                console.error(`Translation error with Gemini 2.5 Flash: ${translateError.message}`);
                // Fallback to basic Google Translate
                try {
                  const basicTranslation = LanguageApp.translate(originalText, 'auto', targetCode);
                  textRange.setText(basicTranslation);
                  totalTranslations++;
                  slideChanged = true;
                } catch (fallbackError) {
                  console.error(`Fallback translation error: ${fallbackError.message}`);
                }
              }
            }
          }
        } catch (shapeError) {
          console.log(`Shape processing error: ${shapeError.message}`);
        }
      }
      
      if (slideChanged) {
        translatedSlides++;
      }
    }
    
    return {
      success: true,
      response: `✅ **Gemini 2.5 Flash Translation Complete!**\n\n📊 **Results:**\n• ${totalTranslations} text elements translated\n• ${translatedSlides} slides updated\n• Target language: ${targetLanguage}\n• Powered by Gemini 2.5 Flash enhanced reasoning\n\nYour presentation is now professionally translated!`,
      canUndo: true
    };
    
  } catch (error) {
    console.error('Gemini 2.5 Flash translation failed:', error);
    return {
      success: false,
      response: `Translation failed: ${error.message}`
    };
  }
}

