/**
 * Agent Tool Helpers - OpenAI Pattern Implementation
 * Handles tool detection and execution for the single agent system
 */

/**
 * Main function to parse agent responses and execute tool calls
 * This handles the "thinking" step where agent decides what tool to use
 */
function parseAndExecuteAgentToolCalls(agentResponse, originalMessage) {
  try {
    console.log(`🔍 Analyzing user request: "${originalMessage}"`);

    // First check for direct tool execution patterns
    const translationIntent = detectTranslationIntent(originalMessage);
    const replaceIntent = detectReplaceIntent(originalMessage);

    if (translationIntent.hasIntent) {
      if (translationIntent.targetLanguage) {
        console.log(`🚀 Executing slide_translate_all("${translationIntent.targetLanguage}", "professional")`);
        const result = slide_translate_all(translationIntent.targetLanguage, 'professional');
        return { success: true, response: result.user_message, canUndo: true };
      } else {
        // Agent needs to ask for language
        return { success: true, response: "What language would you like to translate to?" };
      }
    } else if (replaceIntent.hasIntent) {
      if (replaceIntent.findText && replaceIntent.replaceText) {
        console.log(`🚀 Executing slide_replace_all("${replaceIntent.findText}", "${replaceIntent.replaceText}", false)`);
        const result = slide_replace_all(replaceIntent.findText, replaceIntent.replaceText, false);
        return { success: true, response: result.user_message, canUndo: true };
      } else {
        // Agent needs to ask for find/replace terms
        return { success: true, response: "What text should I find and what should I replace it with?" };
      }
    }

    // No tool intent detected, let the agent respond naturally
    return null;

  } catch (error) {
    console.error('Tool parsing error:', error);
    return null;
  }
}

/**
 * Detect translation intent with PRECISE language detection
 */
function detectTranslationIntent(message) {
  const lowerMessage = message.toLowerCase();
  
  // Translation keywords
  const hasTranslateKeywords = lowerMessage.includes('translate') ||
                               lowerMessage.includes('translation');

  // FIXED: More precise language detection with word boundaries
  const languages = {
    'spanish': 'Spanish', 'español': 'Spanish',
    'french': 'French', 'français': 'French', 
    'german': 'German', 'deutsch': 'German',
    'italian': 'Italian', 'italiano': 'Italian',
    'portuguese': 'Portuguese', 'português': 'Portuguese',
    'chinese': 'Chinese', '中文': 'Chinese',
    'japanese': 'Japanese', '日本語': 'Japanese',
    'korean': 'Korean', '한국어': 'Korean',
    'russian': 'Russian', 'русский': 'Russian',
    'arabic': 'Arabic', 'العربية': 'Arabic',
    'hindi': 'Hindi', 'हिन्दी': 'Hindi',
    'english': 'English'
  };

  // Check if message is EXACTLY a language (complete word match)
  const words = lowerMessage.trim().split(/\s+/);
  for (const word of words) {
    if (languages[word]) {
      return {
        hasIntent: true,
        targetLanguage: languages[word]
      };
    }
  }

  // Check for translation intent with COMPLETE WORD language matches
  if (hasTranslateKeywords) {
    for (const [key, lang] of Object.entries(languages)) {
      // Use word boundary regex to match complete words only
      const wordRegex = new RegExp(`\\b${key}\\b`, 'i');
      if (wordRegex.test(message)) {
        return {
          hasIntent: true,
          targetLanguage: lang
        };
      }
    }
    
    // Has translate keywords but no language detected
    return {
      hasIntent: true,
      targetLanguage: null
    };
  }

  return { hasIntent: false };
}

/**
 * Detect find/replace intent - FIXED VERSION WITH BETTER DEBUGGING
 */
function detectReplaceIntent(message) {
  console.log(`🔍 REPLACE DETECTION: Analyzing "${message}"`);
  
  const lowerMessage = message.toLowerCase();
  
  // Broader detection for find/replace intent
  const hasReplaceKeywords = lowerMessage.includes('replace') ||
                            lowerMessage.includes('change') ||
                            lowerMessage.includes('swap') ||
                            lowerMessage.includes('update') ||
                            lowerMessage.includes('substitute') ||
                            lowerMessage.includes('switch') ||
                            (lowerMessage.includes('find') && lowerMessage.includes('replace'));
  
  console.log(`🔍 Has replace keywords: ${hasReplaceKeywords}`);
  
  if (!hasReplaceKeywords) {
    return { hasIntent: false };
  }

  // Try multiple flexible patterns for extraction
  let findText = null;
  let replaceText = null;

  // Pattern 1: IMPROVED quotes - handle different quote patterns better
  console.log(`🔍 Trying quote pattern extraction...`);
  
  // Try multiple quote patterns
  const quotePatterns = [
    /"([^"]+)"\s*(?:to|with)\s*"([^"]+)"/i,  // "text" to "text" or "text" with "text"
    /"([^"]+)".*?"([^"]+)"/,                  // "text" anything "text" 
    /'([^']+)'\s*(?:to|with)\s*'([^']+)'/i,  // 'text' to 'text' or 'text' with 'text'
    /'([^']+)'.*?'([^']+)'/                   // 'text' anything 'text'
  ];
  
  for (const pattern of quotePatterns) {
    const match = message.match(pattern);
    if (match && match[1] && match[2]) {
      findText = match[1].trim();
      replaceText = match[2].trim();
      console.log(`✅ QUOTE PATTERN MATCH: find="${findText}", replace="${replaceText}"`);
      break;
    }
  }

  // Pattern 2: Natural language - only if quotes didn't work
  if (!findText) {
    console.log(`🔍 Quote patterns failed, trying natural language...`);
    
    const naturalPatterns = [
      /replace\s+(.+?)\s+(?:with|to)\s+(.+?)(?:\s*$)/i,
      /change\s+(.+?)\s+(?:to|into)\s+(.+?)(?:\s*$)/i,
      /swap\s+(.+?)\s+(?:for|with)\s+(.+?)(?:\s*$)/i,
      /update\s+(.+?)\s+(?:to|into)\s+(.+?)(?:\s*$)/i,
      /substitute\s+(.+?)\s+(?:with|for)\s+(.+?)(?:\s*$)/i
    ];

    for (const pattern of naturalPatterns) {
      const match = message.match(pattern);
      if (match && match[1] && match[2]) {
        findText = match[1].trim();
        replaceText = match[2].trim();
        console.log(`⚠️ NATURAL PATTERN MATCH: find="${findText}", replace="${replaceText}"`);
        break;
      }
    }
  }

  console.log(`🔍 FINAL RESULT: findText="${findText}", replaceText="${replaceText}"`);

  return {
    hasIntent: true,
    findText: findText,
    replaceText: replaceText,
    scope: 'all_slides'
  };
}

/**
 * Extract language from message (legacy compatibility)
 */
function extractLanguageFromMessage(message) {
  const translationIntent = detectTranslationIntent(message);
  return translationIntent.targetLanguage;
}

/**
 * Check if message contains translation intent (legacy compatibility)
 */
function containsTranslationIntent(message) {
  const translationIntent = detectTranslationIntent(message);
  return translationIntent.hasIntent;
}

/**
 * Utility: Check if string is a valid language
 */
function isLanguage(text) {
  const languages = ['spanish', 'french', 'german', 'italian', 'portuguese', 
                    'chinese', 'japanese', 'korean', 'russian', 'arabic', 
                    'hindi', 'english', 'español', 'français', 'deutsch'];
  return languages.includes(text.toLowerCase());
}

/**
 * Test function for intent detection
 */
function testIntentDetection() {
  const testCases = [
    'Replace all the "PRD" to "需求文档"',
    "replace PRD with 需求文档",
    "Can you change all instances of OldCorp to NewCorp?",
    "I need to swap company name for the new one",
    "Please update every XYZ to ABC throughout",
    "substitute old text with new content",
    "Spanish",
    "translate to French",
    "change PRD to 需求文档",
    "replace all 'old name' with 'new name'"
  ];

  testCases.forEach(testCase => {
    console.log(`\n=== Testing: "${testCase}" ===`);
    const replaceIntent = detectReplaceIntent(testCase);
    const translationIntent = detectTranslationIntent(testCase);
    
    if (replaceIntent.hasIntent) {
      console.log(`Replace: find="${replaceIntent.findText}", replace="${replaceIntent.replaceText}"`);
    }
    if (translationIntent.hasIntent) {
      console.log(`Translation: language="${translationIntent.targetLanguage}"`);
    }
  });
}
