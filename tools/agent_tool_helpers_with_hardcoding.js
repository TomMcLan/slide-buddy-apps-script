/**
 * Pure AI Extraction Tool Helpers - Enhanced with fallback logic
 * Uses LLM intelligence with smart fallbacks for common cases
 */

/**
 * Parse AI's intelligent extraction with enhanced fallback handling
 */
function parseAIIntelligentExtraction(aiResponse, originalMessage) {
  try {
    console.log(`🤖 AI INTELLIGENT PARSING: "${aiResponse}"`);
    
    // Look for replace command: "EXECUTE_REPLACE|find_text|replace_text"
    if (aiResponse.includes('EXECUTE_REPLACE|')) {
      const parts = aiResponse.split('EXECUTE_REPLACE|')[1].split('|');
      if (parts.length >= 2) {
        const findText = parts[0].trim();
        const replaceText = parts[1].trim();
        
        console.log(`🚀 AI EXTRACTED REPLACE: find="${findText}", replace="${replaceText}"`);
        
        const result = slide_replace_all(findText, replaceText, false);
        return { 
          success: true, 
          response: result.user_message, 
          canUndo: true 
        };
      }
    }
    
    // Look for translate command: "EXECUTE_TRANSLATE|language"
    if (aiResponse.includes('EXECUTE_TRANSLATE|')) {
      const language = aiResponse.split('EXECUTE_TRANSLATE|')[1].split('|')[0].trim();
      
      console.log(`🚀 AI EXTRACTED TRANSLATE: language="${language}"`);
      
      const result = slide_translate_all(language, 'professional');
      return { 
        success: true, 
        response: result.user_message, 
        canUndo: true 
      };
    }
    
    // FALLBACK: If AI didn't provide execution commands, check if it's a direct language input
    console.log(`🔄 AI FALLBACK: Checking for direct language input`);
    const directLanguage = checkDirectLanguageInput(originalMessage);
    if (directLanguage) {
      console.log(`🚀 FALLBACK DETECTED LANGUAGE: "${directLanguage}"`);
      
      const result = slide_translate_all(directLanguage, 'professional');
      return { 
        success: true, 
        response: result.user_message, 
        canUndo: true 
      };
    }
    
    // No execution commands found, return AI response as-is (for questions/clarifications)
    console.log(`💬 AI CONVERSATIONAL RESPONSE: No execution commands found`);
    return null;
    
  } catch (error) {
    console.error('AI extraction parsing error:', error);
    
    // Last resort fallback for common patterns
    const fallbackResult = lastResortFallback(originalMessage);
    if (fallbackResult) {
      return fallbackResult;
    }
    
    return null;
  }
}

/**
 * Check if the message is a direct language input
 */
function checkDirectLanguageInput(message) {
  const trimmed = message.trim().toLowerCase();
  
  // Direct language mappings
  const languages = {
    'english': 'English', 'en': 'English',
    'spanish': 'Spanish', 'español': 'Spanish', 'es': 'Spanish',
    'french': 'French', 'français': 'French', 'fr': 'French',
    'german': 'German', 'deutsch': 'German', 'de': 'German',
    'italian': 'Italian', 'italiano': 'Italian', 'it': 'Italian',
    'portuguese': 'Portuguese', 'português': 'Portuguese', 'pt': 'Portuguese',
    'chinese': 'Chinese', '中文': 'Chinese', 'zh': 'Chinese',
    'japanese': 'Japanese', '日本語': 'Japanese', 'ja': 'Japanese',
    'korean': 'Korean', '한국어': 'Korean', 'ko': 'Korean',
    'russian': 'Russian', 'русский': 'Russian', 'ru': 'Russian',
    'arabic': 'Arabic', 'العربية': 'Arabic', 'ar': 'Arabic',
    'hindi': 'Hindi', 'हिन्दी': 'Hindi', 'hi': 'Hindi'
  };
  
  // Check if the entire message is just a language
  if (languages[trimmed]) {
    return languages[trimmed];
  }
  
  // Check if it's a single word that matches a language
  const words = trimmed.split(/\s+/);
  if (words.length === 1 && languages[words[0]]) {
    return languages[words[0]];
  }
  
  return null;
}

/**
 * Last resort fallback for common patterns when AI fails
 */
function lastResortFallback(message) {
  console.log(`🆘 LAST RESORT FALLBACK: "${message}"`);
  
  // Check for language
  const language = checkDirectLanguageInput(message);
  if (language) {
    console.log(`🆘 FALLBACK TRANSLATION: "${language}"`);
    const result = slide_translate_all(language, 'professional');
    return { 
      success: true, 
      response: result.user_message, 
      canUndo: true 
    };
  }
  
  // Check for basic replace patterns as last resort
  const quotePattern = /"([^"]+)"\s*(?:to|with)\s*"([^"]+)"/i;
  const match = message.match(quotePattern);
  if (match && match[1] && match[2]) {
    console.log(`🆘 FALLBACK REPLACE: "${match[1]}" → "${match[2]}"`);
    const result = slide_replace_all(match[1], match[2], false);
    return { 
      success: true, 
      response: result.user_message, 
      canUndo: true 
    };
  }
  
  return null;
}

/**
 * BACKUP: Fallback to original logic for compatibility
 */
function parseAndExecuteAgentToolCalls(agentResponse, originalMessage) {
  // First try the enhanced AI extraction
  const aiResult = parseAIIntelligentExtraction(agentResponse, originalMessage);
  if (aiResult) {
    return aiResult;
  }
  
  // If AI didn't provide execution commands, return the response as-is
  return null;
}

// Legacy compatibility functions - simplified since we rely on AI + fallbacks
function detectTranslationIntent(message) {
  const lowerMessage = message.toLowerCase();
  const hasIntent = lowerMessage.includes('translate') || lowerMessage.includes('translation');
  const directLanguage = checkDirectLanguageInput(message);
  
  return {
    hasIntent: hasIntent || !!directLanguage,
    targetLanguage: directLanguage
  };
}

function detectReplaceIntent(message) {
  const lowerMessage = message.toLowerCase();
  const hasIntent = lowerMessage.includes('replace') ||
                   lowerMessage.includes('change') ||
                   lowerMessage.includes('swap') ||
                   lowerMessage.includes('update') ||
                   lowerMessage.includes('substitute') ||
                   lowerMessage.includes('switch');
  
  return {
    hasIntent: hasIntent,
    findText: null, // Let AI extract this
    replaceText: null, // Let AI extract this
    scope: 'all_slides'
  };
}

function extractLanguageFromMessage(message) {
  return checkDirectLanguageInput(message);
}

function containsTranslationIntent(message) {
  return detectTranslationIntent(message).hasIntent;
}

function isLanguage(text) {
  return !!checkDirectLanguageInput(text);
}

/**
 * Test function for enhanced extraction
 */
function testEnhancedExtraction() {
  const testCases = [
    {
      userMessage: 'English',
      aiResponse: 'So sorry we are unable to process this request.',
      expectedFallback: 'English translation'
    },
    {
      userMessage: 'Spanish', 
      aiResponse: 'EXECUTE_TRANSLATE|Spanish',
      expectedFallback: 'AI success'
    },
    {
      userMessage: 'Replace "PRD" with 需求文档',
      aiResponse: 'EXECUTE_REPLACE|PRD|需求文档',
      expectedFallback: 'AI success'
    }
  ];

  testCases.forEach(testCase => {
    console.log(`\n=== Testing Enhanced Extraction ===`);
    console.log(`User: "${testCase.userMessage}"`);
    console.log(`AI Response: "${testCase.aiResponse}"`);
    
    const result = parseAIIntelligentExtraction(testCase.aiResponse, testCase.userMessage);
    console.log(`Result: ${result ? 'SUCCESS' : 'CONVERSATIONAL'}`);
    
    if (result) {
      console.log(`Action: ${result.response.includes('translation') ? 'TRANSLATE' : 'REPLACE'}`);
    }
  });
}
