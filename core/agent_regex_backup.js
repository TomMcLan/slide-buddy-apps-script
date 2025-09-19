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
      return executeSlideAgent(message || "translate all slides");
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
    
    // SMART AGENT INSTRUCTIONS - Natural Language Understanding
    const agentInstructions = `You are Slide Buddy, an AI assistant for Google Slides.

AVAILABLE TOOLS (I will auto-detect and execute these):
1. slide_translate_all(language, style): Translate entire presentation to another language  
2. slide_replace_all(find_text, replace_text): Find and replace text across all slides

INTELLIGENT DETECTION:
I detect user intent and automatically execute tools when I have enough information.

SMART EXTRACTION FOR FIND/REPLACE:
When users say things like:
- "replace PRD with 需求文档" → Extract: find="PRD", replace="需求文档"
- "change old company name to new one" → Ask for specifics
- "update all XYZ to ABC" → Extract: find="XYZ", replace="ABC"  
- "swap OldCorp for NewCorp" → Extract: find="OldCorp", replace="NewCorp"
- "substitute every instance of X with Y" → Extract: find="X", replace="Y"

YOUR RESPONSES:
- Translation: If no language specified → "What language would you like to translate to?"
- Find/Replace: If you can extract both terms → "I'll replace all '[FIND]' with '[REPLACE]'"
- Find/Replace: If terms unclear → "What text should I find and what should I replace it with?"
- Other: "I can help with translation and find/replace. What would you like to do?"

Context: ${context.presentation?.title || 'Unknown'} presentation (${context.presentation?.total_slides || 0} slides)
User: "${message}"

Be conversational. Extract find/replace terms intelligently from natural language.`;

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
