/**
 * Slide Buddy 2.5 - Core Agent
 * Single agent implementation following OpenAI patterns for intelligent decision-making
 */

/**
 * Single Agent Request Handler - Following OpenAI Agent Pattern
 * All requests go to the agent for intelligent decision-making
 */
function routeUserRequest(message) {
  try {
    // Fix undefined message issue
    console.log('routeUserRequest called with:', message, 'type:', typeof message);
    
    if (!message || typeof message !== 'string') {
      console.log('Invalid message received, using default translation');
      // If message is undefined/invalid, assume translation request
      return handleTranslationDirectly('translate all slides', 'Spanish');
    }
    
    // All requests should go through the agent for proper conversation flow
    // This ensures users see the chat interface and agent questions
    const lowerMessage = message.toLowerCase();
    return executeSlideAgent(message);
    
  } catch (error) {
    console.error('routeUserRequest error:', error);
    return {
      success: false,
      response: `Error processing request: ${error.message}. Please try saying "translate all slides" or "who are you".`
    };
  }
}

/**
 * Single Slide Agent - Following OpenAI Agent Pattern
 * Handles ALL user requests and makes intelligent decisions about tool usage
 */
function executeSlideAgent(message) {
  try {
    const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
    
    if (!apiKey) {
      return {
        success: false,
        response: `🔑 **API Key Required**\n\nTo use AI features, please configure your Gemini API key:\n\n📋 **Setup Instructions:**\n1. Go to Extensions → Apps Script\n2. Click on Project Settings (gear icon)\n3. Add Script Property: GEMINI_API_KEY\n4. Enter your Gemini API key as the value`
      };
    }
    
    // Let agent handle ALL requests - it should decide which tools to use
    
    // Get current slide context
    const context = slide_context_read();
    
    if (!context.success) {
      return {
        success: false,
        response: 'Could not read slide context. Please try again.'
      };
    }
    
    const aiManager = new AIManager();
    
    // Enhanced Agent Instructions with Focus on Last-Mile Slide Optimization
    // Clean Agent Instructions - Intent Detection Focus
    const agentInstructions = `You are Slide Buddy, an AI assistant for Google Slides.

AVAILABLE TOOLS (I will auto-detect and execute these):
1. slide_translate_all(language, style): Translate entire presentation to another language
2. slide_replace_all(find_text, replace_text): Find and replace text across all slides

TOOL DETECTION:
- If user wants translation (or provides a language), I'll execute slide_translate_all
- If user wants find/replace (or says "replace X to Y"), I'll execute slide_replace_all
- If I can't detect tool intent, you should respond naturally

YOUR ROLE:
- For translation: If no language specified, ask "What language would you like to translate to?"
- For find/replace: If missing find/replace terms, ask "What text should I find and what should I replace it with?"
- For other requests: Explain "I can help with translation and find/replace. What would you like to do?"

Context: ${context.presentation?.title || 'Unknown'} presentation (${context.presentation?.total_slides || 0} slides)
User: "${message}"

Keep responses short, friendly, and conversational. No markdown formatting.`;

    const response = aiManager.callGeminiWithThinking(agentInstructions, 200);
    
    // Parse agent response for tool usage intent and execute if appropriate
    const toolResult = parseAndExecuteAgentToolCalls(response, message);
    
    if (toolResult) {
      return toolResult;
    }
    
    return {
      success: true,
      response: response || 'I understand your request. How can I help you improve your presentation?'
    };
    
  } catch (error) {
    return {
      success: false,
      response: `So sorry we are unable to process this request.`
    };
  }
}

/**
 * Process user messages (compatibility function)
 */
function processUserMessage(message) {
  return routeUserRequest(message);
}
