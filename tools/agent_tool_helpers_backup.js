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
        return { success: true, response: "Which language would you like to translate to?" };
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
 * Detect translation intent with flexible language detection
 */
function detectTranslationIntent(message) {
  const lowerMessage = message.toLowerCase();
  
  // Translation keywords
  const hasTranslateKeywords = lowerMessage.includes('translate') ||
                               lowerMessage.includes('translation');

  // Direct language detection (more comprehensive)
  const languages = {
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
    'hindi': 'Hindi', 'हिन्दी': 'Hindi', 'hi': 'Hindi',
    'english': 'English', 'en': 'English'
  };

  // Check if message is just a language
  for (const [key, lang] of Object.entries(languages)) {
    if (lowerMessage.trim() === key || lowerMessage.trim() === lang.toLowerCase()) {
      return {
        hasIntent: true,
        targetLanguage: lang
      };
    }
  }

  // Check for translation intent with language mentioned
  if (hasTranslateKeywords) {
    for (const [key, lang] of Object.entries(languages)) {
      if (lowerMessage.includes(key)) {
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
 * Detect find/replace intent - MUCH MORE FLEXIBLE
 */
function detectReplaceIntent(message) {
  const lowerMessage = message.toLowerCase();
  
  // Broader detection for find/replace intent
  const hasReplaceKeywords = lowerMessage.includes('replace') ||
                            lowerMessage.includes('change') ||
                            lowerMessage.includes('swap') ||
                            lowerMessage.includes('update') ||
                            lowerMessage.includes('substitute') ||
                            lowerMessage.includes('switch') ||
                            (lowerMessage.includes('find') && lowerMessage.includes('replace'));
  
  if (!hasReplaceKeywords) {
    return { hasIntent: false };
  }

  // Try multiple flexible patterns for extraction
  let findText = null;
  let replaceText = null;

  // Pattern 1: Simple quotes - "old" to "new" or "old" with "new"
  const simpleQuoteMatch = message.match(/"([^"]+)".*?"([^"]+)"/);
  if (simpleQuoteMatch) {
    findText = simpleQuoteMatch[1];
    replaceText = simpleQuoteMatch[2];
  }

  // Pattern 2: Natural language - replace X with Y, change X to Y, etc.
  if (!findText) {
    const naturalPatterns = [
      /replace\s+(.+?)\s+(?:with|to)\s+(.+?)(?:\s|$)/i,
      /change\s+(.+?)\s+(?:to|into)\s+(.+?)(?:\s|$)/i,
      /swap\s+(.+?)\s+(?:for|with)\s+(.+?)(?:\s|$)/i,
      /update\s+(.+?)\s+(?:to|into)\s+(.+?)(?:\s|$)/i,
      /substitute\s+(.+?)\s+(?:with|for)\s+(.+?)(?:\s|$)/i
    ];

    for (const pattern of naturalPatterns) {
      const match = message.match(pattern);
      if (match && match[1] && match[2]) {
        findText = match[1].trim();
        replaceText = match[2].trim();
        break;
      }
    }
  }

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
    console.log(`\nTesting: "${testCase}"`);
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
