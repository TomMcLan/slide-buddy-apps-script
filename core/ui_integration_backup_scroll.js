/**
 * Slide Buddy 2.5 - UI Integration (Clean)
 * Contains ONLY the Google-styled sidebar UI and display logic
 * All agent logic moved to core/agent.gs and tools/agent_tool_helpers.gs
 */

/**
 * Opens the modern Google-styled sidebar interface
 */
function openSlideBuddy() {
  const html = HtmlService.createHtmlOutput(`
    <!DOCTYPE html>
    <html lang="en">
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
          
          /* Modern AI Chat UX - Inspired by Claude/Cursor */
          
          /* Thinking bubbles */
          .thinking-bubble {
            background: linear-gradient(135deg, #f8f9fa 0%, #e8f0fe 100%);
            border: 1px solid #e3f2fd;
            border-radius: 18px;
            padding: 12px 16px;
            margin: 8px 0;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            font-size: 13px;
            color: #1a73e8;
            animation: slideInUp 0.3s ease, pulse 2s infinite;
            max-width: 280px;
          }
          
          .thinking-dots {
            display: inline-flex;
            gap: 3px;
          }
          
          .thinking-dots span {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: #1a73e8;
            animation: thinkingBounce 1.4s ease-in-out infinite both;
          }
          
          .thinking-dots span:nth-child(1) { animation-delay: 0s; }
          .thinking-dots span:nth-child(2) { animation-delay: 0.2s; }
          .thinking-dots span:nth-child(3) { animation-delay: 0.4s; }
          
          @keyframes thinkingBounce {
            0%, 80%, 100% {
              transform: scale(0.8) translateY(0);
              opacity: 0.6;
            }
            40% {
              transform: scale(1.1) translateY(-4px);
              opacity: 1;
            }
          }
          
          /* Streaming text effect */
          .streaming-text {
            overflow: hidden;
            border-right: 2px solid #1a73e8;
            animation: typing 0.5s steps(1) infinite, blink 1s infinite;
            white-space: pre-wrap;
          }
          
          @keyframes typing {
            from { border-right-color: #1a73e8; }
            to { border-right-color: transparent; }
          }
          
          @keyframes blink {
            0%, 50% { border-right-color: #1a73e8; }
            51%, 100% { border-right-color: transparent; }
          }
          
          /* Progress stages */
          .progress-stage {
            background: white;
            border: 1px solid #e8eaed;
            border-radius: 12px;
            padding: 10px 14px;
            margin: 6px 0;
            font-size: 12px;
            color: #5f6368;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: all 0.3s ease;
          }
          
          .progress-stage.active {
            background: #e8f0fe;
            border-color: #1a73e8;
            color: #1a73e8;
            transform: translateX(4px);
          }
          
          .progress-stage.completed {
            background: #e8f5e8;
            border-color: #34a853;
            color: #34a853;
          }
          
          .progress-stage-icon {
            width: 16px;
            height: 16px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
          }
          
          .progress-stage.active .progress-stage-icon {
            background: #1a73e8;
            color: white;
            animation: pulse 1.5s infinite;
          }
          
          .progress-stage.completed .progress-stage-icon {
            background: #34a853;
            color: white;
          }
          
          /* Natural Progress Display (no box) */
          .thinking-container {
            display: flex;
            align-items: flex-start;
            gap: 12px;
            margin: 8px 0;
          }
          
          .thinking-content {
            display: flex;
            align-items: center;
            gap: 8px;
            flex: 1;
          }
          
          .floating-dots {
            display: inline-flex;
            gap: 4px;
          }
          
          .floating-dots span {
            width: 4px;
            height: 4px;
            border-radius: 50%;
            background: #5f6368;
            animation: floatingBounce 1.4s ease-in-out infinite both;
          }
          
          .floating-dots span:nth-child(1) { animation-delay: 0s; }
          .floating-dots span:nth-child(2) { animation-delay: 0.16s; }
          .floating-dots span:nth-child(3) { animation-delay: 0.32s; }
          
          @keyframes floatingBounce {
            0%, 80%, 100% {
              transform: scale(0.8) translateY(0);
              opacity: 0.7;
            }
            40% {
              transform: scale(1.2) translateY(-6px);
              opacity: 1;
            }
          }
          
          .thinking-text {
            font-size: 14px;
            color: #5f6368;
            font-weight: 500;
          }
          
          /* Enhanced send button for stop state */
          .send-btn.stop-mode {
            background: #f8f9fa !important;
            color: #5f6368 !important;
            border-color: #dadce0 !important;
          }
          
          .send-btn.stop-mode:hover {
            background: #e8eaed !important;
            transform: scale(1.05);
          }
          
          /* Quick action pills */
          .quick-actions-container {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
            margin: 12px 0;
          }
          
          .quick-action-pill {
            background: #f8f9fa;
            border: 1px solid #dadce0;
            border-radius: 16px;
            padding: 6px 12px;
            font-size: 12px;
            color: #3c4043;
            cursor: pointer;
            transition: all 0.2s ease;
            white-space: nowrap;
          }
          
          .quick-action-pill:hover {
            background: #e8f0fe;
            border-color: #1a73e8;
            color: #1a73e8;
            transform: translateY(-1px);
          }
          
          /* Auto-scroll indicator */
          .scroll-indicator {
            position: fixed;
            bottom: 100px;
            right: 20px;
            background: rgba(26, 115, 232, 0.9);
            color: white;
            border-radius: 20px;
            padding: 8px 12px;
            font-size: 11px;
            cursor: pointer;
            transform: translateY(60px);
            transition: transform 0.3s ease;
            z-index: 1000;
          }
          
          .scroll-indicator.visible {
            transform: translateY(0);
          }
          
          /* Missing animations */
          @keyframes slideInUp {
            from { 
              opacity: 0; 
              transform: translateY(20px) scale(0.95); 
            }
            to { 
              opacity: 1; 
              transform: translateY(0) scale(1); 
            }
          }
          
          @keyframes pulse {
            0%, 100% { opacity: 0.8; }
            50% { opacity: 1; }
          }
          
          /* Enhanced message animations */
          .message {
            animation: slideInUp 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            opacity: 1;
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
        
        <div class="content-area">
          <div class="container">
            <div class="suggestion-item" onclick="handleFeature('translate')">
              <span class="material-icons suggestion-icon">translate</span>
              <div class="suggestion-content">
                <div class="suggestion-title">Translate all slides (Beta)</div>
                <div class="suggestion-desc">to any language across entire presentation</div>
              </div>
            </div>
            
            <div class="suggestion-item" onclick="handleFeature('replace')">
              <span class="material-icons suggestion-icon">find_replace</span>
              <div class="suggestion-content">
                <div class="suggestion-title">Find & replace text (Beta)</div>
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
        
        <div class="chat-container" id="chatContainer">
          
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
        
        // Handle Enter key for both inputs
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
          
          const featureMessages = {
            'translate': 'I want to translate all the slides in this presentation',
            'replace': 'I want to find and replace text across all slides in this presentation'
          };
          
          isProcessing = true;
          isTaskRunning = true;
          currentTaskId = 'feature-' + Date.now();
          
          lastActionType = feature;
          currentUserMessage = featureMessages[feature];
          
          // Show interactive thinking instead of loading page
          showInteractiveThinking(currentUserMessage);
          
          // Route through the core agent
          google.script.run
            .withSuccessHandler(function(result) {
              isProcessing = false;
              isTaskRunning = false;
              hideInteractiveThinking();
              if (result.success) {
                showChatResponse(currentUserMessage, result.response || result.message || result.user_message, result.canUndo || false);
              } else {
                showChatResponse(currentUserMessage, result.error || 'So sorry we are unable to process this request.', false);
              }
            })
            .withFailureHandler(function(error) {
              isProcessing = false;
              isTaskRunning = false;
              hideInteractiveThinking();
              console.error('Backend error:', error);
              showChatResponse(currentUserMessage, 'So sorry we are unable to process this request.', false);
            })
            .routeUserRequest(currentUserMessage);
        }
        
        // Global variables for enhanced UX
        let currentTaskId = null;
        let isTaskRunning = false;
        let streamingMessageId = null;
        let progressStages = [];
        
        function sendMessage() {
          if (isProcessing) return;
          
          const input = document.getElementById('userInput');
          const message = input.value.trim();
          if (!message) return;
          
          isProcessing = true;
          isTaskRunning = true;
          currentTaskId = 'task-' + Date.now();
          // Don't disable the entire interface - keep it interactive
          
          currentUserMessage = message;
          input.value = '';
          updateSendButton(input, document.getElementById('sendBtn'));
          autoResize(input);
          
          // Show interactive thinking indicator
          showInteractiveThinking(message);
          
          // Route through the core agent
          google.script.run
            .withSuccessHandler(function(result) {
              isProcessing = false;
              isTaskRunning = false;
              hideInteractiveThinking();
              if (result.success) {
                showChatResponse(message, result.response || result.message || result.user_message, result.canUndo || false);
              } else {
                showChatResponse(message, result.error || 'So sorry we are unable to process this request.', false);
              }
            })
            .withFailureHandler(function(error) {
              isProcessing = false;
              isTaskRunning = false;
              hideInteractiveThinking();
              console.error('Processing error:', error);
              showChatResponse(message, 'So sorry we are unable to process this request.', false);
            })
            .routeUserRequest(message);
        }
        
        function showInteractiveThinking(userMessage) {
          // Show the chat page first
          showPage('chatPage');
          
          // Add user message
          const container = document.getElementById('messagesContainer');
          container.innerHTML = '';
          addMessage('user', userMessage);
          
          // Transform send button to stop button (Cursor-style)
          transformSendToStopButton();
          
          // Add thinking indicator with progress updates
          const thinkingDiv = document.createElement('div');
          thinkingDiv.className = 'message';
          thinkingDiv.id = 'thinking-indicator';
          
          thinkingDiv.innerHTML = 
            '<div class="message-header">' +
              '<div class="ai-avatar">' +
                '<span class="material-icons">smart_toy</span>' +
              '</div>' +
            '</div>' +
            '<div class="message-content">' +
              '<div class="thinking-container">' +
                '<div class="floating-dots">' +
                  '<span></span><span></span><span></span>' +
                '</div>' +
                '<span class="thinking-text" id="progress-text">Processing your request...</span>' +
              '</div>' +
              '<div id="progress-details" style="margin-top: 4px; font-size: 13px; color: #5f6368; line-height: 1.4;"></div>' +
            '</div>';
          
          container.appendChild(thinkingDiv);
          scrollToBottom();
          
          // Start showing progress updates
          startProgressUpdates();
        }
        
        function showInteractiveThinkingForChat(userMessage) {
          // Ensure we're on chat page
          showPage('chatPage');
          
          // Don't clear messages - add to existing conversation
          const container = document.getElementById('messagesContainer');
          addMessage('user', userMessage);
          
          // Transform the chat send button to stop button
          transformChatSendToStopButton();
          
          // Add thinking indicator
          const thinkingDiv = document.createElement('div');
          thinkingDiv.className = 'message';
          thinkingDiv.id = 'thinking-indicator';
          
          thinkingDiv.innerHTML = 
            '<div class="message-header">' +
              '<div class="ai-avatar">' +
                '<span class="material-icons">smart_toy</span>' +
              '</div>' +
            '</div>' +
            '<div class="message-content">' +
              '<div class="thinking-container">' +
                '<div class="floating-dots">' +
                  '<span></span><span></span><span></span>' +
                '</div>' +
                '<span class="thinking-text" id="progress-text">Processing your request...</span>' +
              '</div>' +
              '<div id="progress-details" style="margin-top: 4px; font-size: 13px; color: #5f6368; line-height: 1.4;"></div>' +
            '</div>';
          
          container.appendChild(thinkingDiv);
          scrollToBottom();
          
          // Start showing progress updates
          startProgressUpdates();
        }
        
        function transformSendToStopButton() {
          const sendBtn = document.getElementById('sendBtn');
          if (sendBtn) {
            sendBtn.innerHTML = 
              '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">' +
                '<path d="M320-320h320v-320H320v320ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/>' +
              '</svg>';
            sendBtn.onclick = stopCurrentTask;
            sendBtn.classList.add('stop-mode');
            sendBtn.disabled = false; // Ensure it's clickable
          }
        }
        
        function transformChatSendToStopButton() {
          const chatSendBtn = document.getElementById('chatSendBtn');
          if (chatSendBtn) {
            chatSendBtn.innerHTML = 
              '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">' +
                '<path d="M320-320h320v-320H320v320ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/>' +
              '</svg>';
            chatSendBtn.onclick = stopCurrentTask;
            chatSendBtn.classList.add('stop-mode');
            chatSendBtn.disabled = false;
          }
        }
        
        function restoreSendButton() {
          const sendBtn = document.getElementById('sendBtn');
          if (sendBtn) {
            sendBtn.innerHTML = '<span class="material-icons">send</span>';
            sendBtn.onclick = sendMessage;
            sendBtn.classList.remove('stop-mode');
          }
          
          const chatSendBtn = document.getElementById('chatSendBtn');
          if (chatSendBtn) {
            chatSendBtn.innerHTML = '<span class="material-icons">send</span>';
            chatSendBtn.onclick = sendChatMessage;
            chatSendBtn.classList.remove('stop-mode');
          }
        }
        
        function startProgressUpdates() {
          let updateCount = 0;
          const progressMessages = [
            'Analyzing your request...',
            'Understanding presentation context...',
            'Preparing translation tools...',
            'Processing slide content...',
            'Applying translations...',
            'Finalizing changes...'
          ];
          
          const progressInterval = setInterval(() => {
            if (!isTaskRunning) {
              clearInterval(progressInterval);
              return;
            }
            
            const progressText = document.getElementById('progress-text');
            const progressDetails = document.getElementById('progress-details');
            
            if (progressText && updateCount < progressMessages.length) {
              progressText.textContent = progressMessages[updateCount];
              
              // Add detailed progress info
              if (updateCount >= 2) {
                progressDetails.innerHTML = 
                  '<div style="margin: 4px 0;">• Scanning slides for text elements...</div>' +
                  '<div style="margin: 4px 0;">• Preparing batch translation...</div>';
              }
              
              updateCount++;
              scrollToBottom();
            }
          }, 2000); // Update every 2 seconds
        }
        
        // Function to receive real progress updates from backend
        function updateProgress(message) {
          const progressText = document.getElementById('progress-text');
          const progressDetails = document.getElementById('progress-details');
          
          if (progressText && isTaskRunning) {
            progressText.textContent = message;
            
            // Add specific progress details for translation
            if (message.includes('batch') || message.includes('slide')) {
              if (progressDetails) {
                progressDetails.innerHTML = 
                  '<div style="margin: 4px 0; opacity: 0.8;">• ' + message + '</div>';
              }
            }
            
            scrollToBottom();
          }
        }
        
        function hideInteractiveThinking() {
          const thinkingIndicator = document.getElementById('thinking-indicator');
          if (thinkingIndicator) {
            thinkingIndicator.remove();
          }
          
          // Restore send button
          restoreSendButton();
        }
        
        function stopCurrentTask() {
          if (isTaskRunning) {
            isTaskRunning = false;
            isProcessing = false;
            currentTaskId = null;
            
            hideInteractiveThinking();
            
            // Show helpful stop message
            addMessage('ai', '⏹️ Task stopped. What would you like me to help you with next?', false);
            scrollToBottom();
          }
        }
        
        function showThinkingProcess(userMessage) {
          // Determine task type and show appropriate thinking steps
          const lowerMessage = userMessage.toLowerCase();
          
          if (lowerMessage.includes('translate')) {
            progressStages = [
              { text: '🤔 Understanding your translation request', icon: '1' },
              { text: '🌐 Detecting target language', icon: '2' },
              { text: '📄 Analyzing slide content', icon: '3' },
              { text: '🔄 Translating text elements', icon: '4' },
              { text: '✅ Finalizing changes', icon: '5' }
            ];
          } else if (lowerMessage.includes('enhance') || lowerMessage.includes('improve')) {
            progressStages = [
              { text: '🤔 Understanding enhancement goals', icon: '1' },
              { text: '📝 Analyzing current content', icon: '2' },
              { text: '✨ Improving text quality', icon: '3' },
              { text: '🎯 Applying style preferences', icon: '4' },
              { text: '✅ Finalizing improvements', icon: '5' }
            ];
          } else {
            progressStages = [
              { text: '🤔 Analyzing your request', icon: '1' },
              { text: '🔍 Understanding context', icon: '2' },
              { text: '⚡ Processing your task', icon: '3' },
              { text: '✅ Preparing response', icon: '4' }
            ];
          }
          
          // Show initial thinking bubble
          addThinkingBubble('Analyzing your request...');
          
          // Show progress stages with delays
          setTimeout(() => {
            if (isTaskRunning) {
              hideThinkingBubble();
              showProgressStages();
            }
          }, 1500);
        }
        
        function addThinkingBubble(text) {
          const thinkingDiv = document.createElement('div');
          thinkingDiv.className = 'thinking-bubble';
          thinkingDiv.id = 'thinking-bubble-' + Date.now();
          thinkingDiv.innerHTML = 
            '<span>' + text + '</span>' +
            '<div class="thinking-dots">' +
              '<span></span><span></span><span></span>' +
            '</div>';
          
          document.body.appendChild(thinkingDiv);
          return thinkingDiv.id;
        }
        
        function hideThinkingBubble() {
          const thinkingBubbles = document.querySelectorAll('[id^="thinking-bubble-"]');
          thinkingBubbles.forEach(bubble => bubble.remove());
        }
        
        function showProgressStages() {
          let stagesHTML = '<div style="margin: 16px 0;">';
          
          progressStages.forEach((stage, index) => {
            stagesHTML += 
              '<div class="progress-stage" id="stage-' + index + '">' +
                '<div class="progress-stage-icon">' + stage.icon + '</div>' +
                '<span>' + stage.text + '</span>' +
              '</div>';
          });
          
          // Add stop button
          stagesHTML += 
            '<div style="margin-top: 12px; text-align: center;">' +
              '<span style="font-size: 12px; color: #5f6368;">Working on your request...</span>' +
              '<button class="stop-task-btn" onclick="stopCurrentTask()">' +
                '<span style="font-size: 12px;">⏹</span> Stop' +
              '</button>' +
            '</div>';
          
          stagesHTML += '</div>';
          
          // Replace loading with progress stages
          const loadingDiv = document.querySelector('.loading-message');
          if (loadingDiv) {
            loadingDiv.innerHTML = stagesHTML;
          }
          
          // Animate stages
          animateProgressStages();
        }
        
        function animateProgressStages() {
          const stageDelay = 800; // Time between stages
          
          progressStages.forEach((stage, index) => {
            setTimeout(() => {
              if (isTaskRunning) {
                // Mark previous stage as completed
                if (index > 0) {
                  const prevStage = document.getElementById('stage-' + (index - 1));
                  if (prevStage) {
                    prevStage.classList.remove('active');
                    prevStage.classList.add('completed');
                    prevStage.querySelector('.progress-stage-icon').innerHTML = '✓';
                  }
                }
                
                // Mark current stage as active
                const currentStage = document.getElementById('stage-' + index);
                if (currentStage) {
                  currentStage.classList.add('active');
                }
              }
            }, index * stageDelay);
          });
        }
        
        function stopCurrentTask() {
          if (isTaskRunning) {
            isTaskRunning = false;
            currentTaskId = null;
            
            hideThinkingBubble();
            
            isProcessing = false;
            document.body.classList.remove('loading-active');
            
            showChatResponse(currentUserMessage, '⏹️ Task stopped by user. You can start a new request anytime!', false);
          }
        }
        
        function handleTaskCompletion(result, success) {
          isProcessing = false;
          isTaskRunning = false;
          currentTaskId = null;
          document.body.classList.remove('loading-active');
          
          hideThinkingBubble();
          
          if (success && result.success) {
            showChatResponse(currentUserMessage, result.response || result.message || result.user_message, result.canUndo || false);
          } else {
            showChatResponse(currentUserMessage, result.error || 'Sorry, So sorry we are unable to process this request.', false);
          }
        }
        
        function sendChatMessage() {
          if (isProcessing) return;
          
          const input = document.getElementById('chatInput');
          const message = input.value.trim();
          if (!message) return;
          
          isProcessing = true;
          isTaskRunning = true;
          currentTaskId = 'chat-' + Date.now();
          
          currentUserMessage = message;
          input.value = '';
          updateSendButton(input, document.getElementById('chatSendBtn'));
          autoResize(input);
          
          // Use interactive thinking instead of old loading
          showInteractiveThinkingForChat(message);
          
          // Route through the core agent
          google.script.run
            .withSuccessHandler(function(result) {
              isProcessing = false;
              isTaskRunning = false;
              hideInteractiveThinking();
              if (result.success) {
                showChatResponseContinuous(message, result.response || result.message || result.user_message, result.canUndo || false);
              } else {
                showChatResponseContinuous(message, result.error || 'So sorry we are unable to process this request.', false);
              }
            })
            .withFailureHandler(function(error) {
              isProcessing = false;
              isTaskRunning = false;
              hideInteractiveThinking();
              console.error('Processing error:', error);
              showChatResponseContinuous(message, 'So sorry we are unable to process this request.', false);
            })
            .routeUserRequest(message);
        }
        
        function showLoading(text) {
          // Deprecated - use showInteractiveThinking instead
          // For backwards compatibility, redirect to interactive loading
          if (currentUserMessage) {
            showInteractiveThinking(currentUserMessage);
          } else {
            showInteractiveThinking('Processing request...');
          }
        }
        
        function showChatResponse(userMessage, aiResponse, showUndo) {
          // Ensure we're on the chat page and maintain conversation
          showPage('chatPage');
          
          const container = document.getElementById('messagesContainer');
          
          // Don't clear container if we're continuing a conversation
          // Only add user message if it's not already there
          const lastMessage = container.lastElementChild;
          const isUserMessage = lastMessage && lastMessage.querySelector('.user-avatar');
          
          if (!isUserMessage) {
            addMessage('user', userMessage);
          }
          
          setTimeout(() => {
            addMessage('ai', aiResponse, showUndo);
            // Force scroll to newest message
            setTimeout(() => {
              scrollToBottom();
            }, 100);
          }, 300);
        }
        
        function scrollToBottom() {
          const container = document.getElementById('messagesContainer');
          if (container) {
            // Immediate scroll without delay
            container.scrollTop = container.scrollHeight;
            
            // Use smooth scroll behavior for better UX
            container.scrollTo({
              top: container.scrollHeight,
              behavior: 'smooth'
            });
            
            // Fallback with requestAnimationFrame for reliability
            requestAnimationFrame(() => {
              container.scrollTop = container.scrollHeight;
            });
            
            // Additional fallback after DOM updates
            setTimeout(() => {
              container.scrollTop = container.scrollHeight;
            }, 100);
          }
        }
        
        function showStreamingResponse(text, canUndo) {
          // Add AI message container
          const messageId = addMessage('ai', '', canUndo);
          const messageDiv = document.getElementById(messageId);
          const messageContent = messageDiv.querySelector('.message-content');
          
          // Create streaming text element
          const streamingDiv = document.createElement('div');
          streamingDiv.className = 'streaming-text';
          messageContent.appendChild(streamingDiv);
          
          // Simulate streaming effect
          let charIndex = 0;
          const streamingSpeed = Math.max(20, Math.min(60, text.length / 80)); // Adaptive speed
          
          const streamingInterval = setInterval(() => {
            if (charIndex < text.length) {
              streamingDiv.textContent = text.substring(0, charIndex + 1);
              charIndex++;
              smoothScrollToBottom();
            } else {
              // Streaming complete
              clearInterval(streamingInterval);
              streamingDiv.className = ''; // Remove streaming effect
              streamingDiv.style.borderRight = 'none';
              
              // Add contextual quick actions
              addContextualActions(messageContent, text);
              smoothScrollToBottom();
            }
          }, streamingSpeed);
        }
        
        function addContextualActions(contentDiv, responseText) {
          const lowerText = responseText.toLowerCase();
          const actions = [];
          
          // Smart action suggestions based on response content
          if (lowerText.includes('translat')) {
            actions.push({ text: '🇪🇸 Spanish', action: () => quickAction('Translate all slides to Spanish') });
            actions.push({ text: '🇫🇷 French', action: () => quickAction('Translate all slides to French') });
            actions.push({ text: '🇨🇳 Chinese', action: () => quickAction('Translate all slides to Chinese') });
          } else if (lowerText.includes('enhance') || lowerText.includes('improve')) {
            actions.push({ text: '💼 Professional', action: () => quickAction('Make all text more professional') });
            actions.push({ text: '🎓 Academic', action: () => quickAction('Make all text more academic') });
            actions.push({ text: '✨ Creative', action: () => quickAction('Make all text more creative') });
          } else if (lowerText.includes('what') || lowerText.includes('can') || lowerText.includes('help')) {
            actions.push({ text: '🌐 Translate', action: () => quickAction('Translate all slides') });
            actions.push({ text: '✨ Enhance', action: () => quickAction('Enhance all text') });
            actions.push({ text: '🔍 Find & Replace', action: () => quickAction('Find and replace text') });
          }
          
          if (actions.length > 0) {
            const quickActionsDiv = document.createElement('div');
            quickActionsDiv.className = 'quick-actions-container';
            quickActionsDiv.style.marginTop = '12px';
            
            actions.forEach(action => {
              const actionBtn = document.createElement('button');
              actionBtn.className = 'quick-action-pill';
              actionBtn.textContent = action.text;
              actionBtn.onclick = action.action;
              quickActionsDiv.appendChild(actionBtn);
            });
            
            contentDiv.appendChild(quickActionsDiv);
          }
        }
        
        function quickAction(message) {
          // Auto-fill the input and send
          const input = document.getElementById('userInput');
          if (input) {
            input.value = message;
            sendMessage();
          }
        }
        
        function smoothScrollToBottom() {
          const container = document.getElementById('messagesContainer');
          if (container) {
            container.scrollTo({
              top: container.scrollHeight,
              behavior: 'smooth'
            });
          }
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
          
          // Use the improved scrollToBottom function
          scrollToBottom();
          
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
              .handleRevertRequest();
          } else {
            addMessage('ai', 'Previous changes have been undone successfully.', false);
          }
        }
        
        function showChatResponseContinuous(userMessage, aiResponse, showUndo) {
          // Don't clear conversation - continue in same chat
          // User message already added, just add AI response
          setTimeout(() => {
            addMessage('ai', aiResponse, showUndo);
            scrollToBottom();
          }, 300);
        }
        
        
      </script>
    </body>
    </html>
  `).setWidth(380).setTitle('Slide Buddy');
  
  SlidesApp.getUi().showSidebar(html);
}

/**
 * Processes user messages and routes them to core agent
 */
function processUserMessage(message) {
  return routeUserRequest(message);
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
      message: `🔄 To undo the last changes:

📌 **Quick Method:** Press Ctrl+Z (or Cmd+Z on Mac) in Google Slides

📌 **Menu Method:** Click Edit → Undo in Google Slides

📌 **Multiple Undos:** Repeat Ctrl+Z to undo several changes

💡 **Tip:** Google Slides keeps a full edit history - you can undo multiple operations!`,
      canUndo: false
    };
    
  } catch (error) {
    console.error('Revert request failed:', error);
    return {
      success: false,
      message: `❌ Error: ${error.message}. Use Ctrl+Z in Google Slides to undo changes.`
    };
  }
}
