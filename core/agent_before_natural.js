/**
 * Slide Buddy 2.5 - Pure AI Extraction Agent
 * Improved context handling for standalone language inputs
 */

/**
 * Single Agent Request Handler - Following OpenAI Agent Pattern
 * All requests go to the agent for intelligent decision-making
 */
function routeUserRequest(message) {
  try {
    console.log('routeUserRequest called with:', message, 'type:', typeof message);
    
    if (!message || typeof message !== 'string') {
      console.log('Invalid message received, routing to agent');
      return executeSlideAgent(message || "translate all slides");
    }
    
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
 * Pure AI Agent - Enhanced context awareness
 */
function executeSlideAgent(message) {
  try {
    console.log(`🤖 AGENT PROCESSING: "${message}"`);
    
    const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
    
    if (!apiKey) {
      return {
        success: false,
        response: `🔑 **API Key Required**\n\nTo use AI features, please configure your Gemini API key:\n\n📋 **Setup Instructions:**\n1. Go to Extensions → Apps Script\n2. Click on Project Settings (gear icon)\n3. Add Script Property: GEMINI_API_KEY\n4. Enter your Gemini API key as the value`
      };
    }
    
    const context = slide_context_read();
    
    if (!context.success) {
      return {
        success: false,
        response: 'Could not read slide context. Please try again.'
      };
    }
    
    const aiManager = new AIManager();
    
    // ENHANCED AGENT INSTRUCTIONS - Better language detection
    const agentInstructions = `You are Slide Buddy, an AI assistant for Google Slides.

AVAILABLE TOOLS:
1. slide_translate_all(language, style): Translate entire presentation to another language  
2. slide_replace_all(find_text, replace_text): Find and replace text across all slides

CONTEXT AWARENESS:
This might be a follow-up to a previous conversation. If the user provides a single word that looks like a language, treat it as a translation request.

LANGUAGE RECOGNITION:
These are valid languages: English, Spanish, French, German, Italian, Portuguese, Chinese, Japanese, Korean, Russian, Arabic, Hindi, 中文, español, français, deutsch, 日本語, 한국어, русский, العربية, हिन्दी

YOUR INTELLIGENCE ROLE:
1. If user says JUST a language name → This is a translation request
2. If user wants find/replace → Extract the exact terms
3. If unclear → Ask for clarification

EXAMPLES:
User: "English" 
→ Understand: They want to translate to English
→ Respond: "EXECUTE_TRANSLATE|English"

User: "Spanish"
→ Understand: They want to translate to Spanish  
→ Respond: "EXECUTE_TRANSLATE|Spanish"

User: "translate all slides"
→ Ask: "What language would you like to translate to?"

User: 'Replace "PRD" with 需求文档' 
→ Respond: "EXECUTE_REPLACE|PRD|需求文档"

User: 'Change all instances of PRD to 需求文档'
→ Respond: "EXECUTE_REPLACE|PRD|需求文档"

CRITICAL FORMAT:
- Language detected: "EXECUTE_TRANSLATE|[LANGUAGE]"
- Find/replace detected: "EXECUTE_REPLACE|[FIND_TEXT]|[REPLACE_TEXT]"  
- Need clarification: Ask naturally

Context: ${context.presentation?.title || 'Unknown'} presentation (${context.presentation?.total_slides || 0} slides)
User: "${message}"

Analyze this message intelligently and respond in the required format.`;

    console.log(`🤖 CALLING GEMINI with instructions length: ${agentInstructions.length}`);
    
    const response = aiManager.callGeminiWithThinking(agentInstructions, 150);
    
    console.log(`🤖 GEMINI RESPONSE: "${response}"`);
    
    // Parse the AI's intelligent extraction
    const toolResult = parseAIIntelligentExtraction(response, message);
    
    if (toolResult) {
      return toolResult;
    }
    
    return {
      success: true,
      response: response || 'I understand your request. How can I help you improve your presentation?'
    };
    
  } catch (error) {
    console.error('executeSlideAgent error:', error);
    return {
      success: false,
      response: `Agent error: ${error.message}. Please try again.`
    };
  }
}

/**
 * Process user messages (compatibility function)
 */
function processUserMessage(message) {
  return routeUserRequest(message);
}
