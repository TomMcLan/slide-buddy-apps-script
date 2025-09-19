/**
 * Slide Buddy 2.5 - Natural Language Agent
 * Handles any natural language phrasing for translation and find/replace
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
 * Natural Language AI Agent - No hardcoded patterns
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
    
    // PURE NATURAL LANGUAGE INSTRUCTIONS - No hardcoded patterns
    const agentInstructions = `You are Slide Buddy, an AI assistant for Google Slides. You excel at understanding natural language and extracting user intent.

AVAILABLE TOOLS:
1. slide_translate_all(language, style): Translate entire presentation to another language  
2. slide_replace_all(find_text, replace_text): Find and replace text across all slides

YOUR ROLE: INTELLIGENT NATURAL LANGUAGE UNDERSTANDING
Analyze ANY phrasing the user gives you and determine:
- Do they want TRANSLATION? Extract the target language.
- Do they want FIND/REPLACE? Extract the exact terms.
- Do they need clarification? Ask naturally.

TRANSLATION EXAMPLES (any phrasing):
User: "English" → EXECUTE_TRANSLATE|English
User: "Spanish please" → EXECUTE_TRANSLATE|Spanish
User: "I want to translate to English" → EXECUTE_TRANSLATE|English
User: "Can you translate everything to French?" → EXECUTE_TRANSLATE|French
User: "Make it German" → EXECUTE_TRANSLATE|German
User: "Convert all slides to Chinese" → EXECUTE_TRANSLATE|Chinese
User: "Turn this into Japanese" → EXECUTE_TRANSLATE|Japanese
User: "translate all slides" → Ask: "What language would you like to translate to?"

FIND/REPLACE EXAMPLES (any phrasing):
User: 'Replace "PRD" with 需求文档' → EXECUTE_REPLACE|PRD|需求文档
User: 'Change all PRD to 需求文档' → EXECUTE_REPLACE|PRD|需求文档
User: 'I want to replace PRD with 需求文档' → EXECUTE_REPLACE|PRD|需求文档
User: 'Can you change every instance of PRD to 需求文档?' → EXECUTE_REPLACE|PRD|需求文档
User: 'Update company name from OldCorp to NewCorp' → EXECUTE_REPLACE|OldCorp|NewCorp
User: 'Swap all instances of X for Y' → EXECUTE_REPLACE|X|Y

CRITICAL: Use your intelligence to understand intent from ANY natural phrasing. Don't rely on specific keywords.

RESPONSE FORMAT:
- Translation: "EXECUTE_TRANSLATE|[LANGUAGE]"
- Find/Replace: "EXECUTE_REPLACE|[FIND_TEXT]|[REPLACE_TEXT]"  
- Clarification: Natural conversational tone

Context: ${context.presentation?.title || 'Unknown'} presentation (${context.presentation?.total_slides || 0} slides)
User: "${message}"

Use your natural language understanding to extract the intent and parameters from this message.`;

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
