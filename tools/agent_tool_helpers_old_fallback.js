/**
 * Pure AI Extraction Tool Helpers
 * Uses LLM intelligence to extract parameters without rigid patterns
 */

/**
 * Parse AI's intelligent extraction using simple delimiter format
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
    
    // No execution commands found, return AI response as-is (for questions/clarifications)
    console.log(`💬 AI CONVERSATIONAL RESPONSE: No execution commands found`);
    return null;
    
  } catch (error) {
    console.error('AI extraction parsing error:', error);
    return null;
  }
}

/**
 * BACKUP: Fallback to original logic for compatibility
 * This should rarely be needed with pure AI approach
 */
function parseAndExecuteAgentToolCalls(agentResponse, originalMessage) {
  // First try the pure AI extraction
  const aiResult = parseAIIntelligentExtraction(agentResponse, originalMessage);
  if (aiResult) {
    return aiResult;
  }
  
  // If AI didn't provide execution commands, return the response as-is
  // This allows for natural conversation and clarifying questions
  return null;
}

// Legacy compatibility functions - simplified since we rely on AI
function detectTranslationIntent(message) {
  const lowerMessage = message.toLowerCase();
  return {
    hasIntent: lowerMessage.includes('translate') || lowerMessage.includes('translation'),
    targetLanguage: null // Let AI extract this
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
  // Let AI handle this
  return null;
}

function containsTranslationIntent(message) {
  return detectTranslationIntent(message).hasIntent;
}

function isLanguage(text) {
  const languages = ['spanish', 'french', 'german', 'italian', 'portuguese', 
                    'chinese', 'japanese', 'korean', 'russian', 'arabic', 
                    'hindi', 'english', 'español', 'français', 'deutsch'];
  return languages.includes(text.toLowerCase());
}

/**
 * Test function for pure AI extraction
 */
function testPureAIExtraction() {
  const testCases = [
    {
      userMessage: 'Replace "PRD" with 需求文档',
      expectedAI: 'EXECUTE_REPLACE|PRD|需求文档'
    },
    {
      userMessage: 'Change all instances of PRD to 需求文档',
      expectedAI: 'EXECUTE_REPLACE|PRD|需求文档'
    },
    {
      userMessage: 'Update company name from OldCorp to NewCorp',
      expectedAI: 'EXECUTE_REPLACE|OldCorp|NewCorp'
    },
    {
      userMessage: 'translate all slides',
      expectedAI: 'What language would you like to translate to?'
    },
    {
      userMessage: 'Spanish',
      expectedAI: 'EXECUTE_TRANSLATE|Spanish'
    }
  ];

  testCases.forEach(testCase => {
    console.log(`\n=== Testing Pure AI Extraction ===`);
    console.log(`User: "${testCase.userMessage}"`);
    console.log(`Expected AI: "${testCase.expectedAI}"`);
    
    // Simulate AI response parsing
    const result = parseAIIntelligentExtraction(testCase.expectedAI, testCase.userMessage);
    console.log(`Parse Result:`, result ? 'SUCCESS' : 'CONVERSATIONAL');
  });
}
