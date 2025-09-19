/**
 * Slide Buddy 2.5 - Pure AI Extraction Agent
 * Lets the LLM intelligently extract find/replace terms without rigid patterns
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
 * Pure AI Agent - No rigid patterns, full LLM intelligence
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
    
    const context = slide_context_read();
    
    if (!context.success) {
      return {
        success: false,
        response: 'Could not read slide context. Please try again.'
      };
    }
    
    const aiManager = new AIManager();
    
    // PURE AI INSTRUCTIONS - No rigid formats, full intelligence
    const agentInstructions = `You are Slide Buddy, an AI assistant for Google Slides.

AVAILABLE TOOLS:
1. slide_translate_all(language, style): Translate entire presentation to another language  
2. slide_replace_all(find_text, replace_text): Find and replace text across all slides

YOUR INTELLIGENCE ROLE:
Analyze the user's request and determine:
1. Do they want TRANSLATION or FIND/REPLACE?
2. Can you extract the specific parameters needed?

FOR FIND/REPLACE - Extract the EXACT text to find and replace:
- Ignore quotes, formatting, or extra words
- Focus on the core content the user wants to change
- Be smart about what they actually mean

EXAMPLES:
User: 'Replace "PRD" with 需求文档' 
→ You understand: find_text="PRD", replace_text="需求文档"
→ Respond: "EXECUTE_REPLACE|PRD|需求文档"

User: 'Change all instances of PRD to 需求文档'
→ You understand: find_text="PRD", replace_text="需求文档"  
→ Respond: "EXECUTE_REPLACE|PRD|需求文档"

User: 'Update company name from OldCorp to NewCorp'
→ You understand: find_text="OldCorp", replace_text="NewCorp"
→ Respond: "EXECUTE_REPLACE|OldCorp|NewCorp"

FOR TRANSLATION:
User: 'translate all slides'
→ Ask: "What language would you like to translate to?"

User: 'Spanish' (after asking)
→ Respond: "EXECUTE_TRANSLATE|Spanish"

CRITICAL FORMAT:
- If you can extract find/replace terms: "EXECUTE_REPLACE|[FIND_TEXT]|[REPLACE_TEXT]"
- If you can extract language: "EXECUTE_TRANSLATE|[LANGUAGE]"  
- If you need clarification: Ask naturally in conversational tone

Context: ${context.presentation?.title || 'Unknown'} presentation (${context.presentation?.total_slides || 0} slides)
User: "${message}"

Use your intelligence to extract the exact terms the user wants, ignoring formatting artifacts.`;

    const response = aiManager.callGeminiWithThinking(agentInstructions, 150);
    
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
