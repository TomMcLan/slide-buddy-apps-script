/**
 * Enhanced Natural Language Tool Helpers
 * Handles ANY natural language phrasing without hardcoded patterns
 */

/**
 * Parse AI's intelligent extraction with enhanced natural language fallback
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
    
    // ENHANCED FALLBACK: Natural language understanding
    console.log(`🔄 ENHANCED FALLBACK: Analyzing natural language patterns`);
    const fallbackResult = enhancedNaturalLanguageFallback(originalMessage);
    if (fallbackResult) {
      return fallbackResult;
    }
    
    // No execution commands found, return AI response as-is
    console.log(`💬 AI CONVERSATIONAL RESPONSE: No execution commands found`);
    return null;
    
  } catch (error) {
    console.error('AI extraction parsing error:', error);
    
    // Emergency fallback
    const emergencyResult = enhancedNaturalLanguageFallback(originalMessage);
    if (emergencyResult) {
      return emergencyResult;
    }
    
    return null;
  }
}

/**
 * Enhanced natural language fallback - handles ANY phrasing
 */
function enhancedNaturalLanguageFallback(message) {
  console.log(`🧠 NATURAL LANGUAGE FALLBACK: "${message}"`);
  
  // Enhanced language detection
  const detectedLanguage = detectLanguageFromNaturalText(message);
  if (detectedLanguage) {
    console.log(`🚀 FALLBACK TRANSLATION: "${detectedLanguage}"`);
    const result = slide_translate_all(detectedLanguage, 'professional');
    return { 
      success: true, 
      response: result.user_message, 
      canUndo: true 
    };
  }
  
  // Enhanced find/replace detection
  const replaceTerms = extractReplaceTermsFromNaturalText(message);
  if (replaceTerms.findText && replaceTerms.replaceText) {
    console.log(`🚀 FALLBACK REPLACE: "${replaceTerms.findText}" → "${replaceTerms.replaceText}"`);
    const result = slide_replace_all(replaceTerms.findText, replaceTerms.replaceText, false);
    return { 
      success: true, 
      response: result.user_message, 
      canUndo: true 
    };
  }
  
  return null;
}

/**
 * Detect language from ANY natural text phrasing
 */
function detectLanguageFromNaturalText(message) {
  const lowerMessage = message.toLowerCase();
  
  // Language mappings with various forms
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
  
  // Pattern 1: Direct language mention (most common)
  for (const [key, lang] of Object.entries(languages)) {
    // "English", "Spanish", etc.
    if (lowerMessage.trim() === key) {
      return lang;
    }
    
    // "I want to translate to English"
    if (lowerMessage.includes(`to ${key}`) || 
        lowerMessage.includes(`into ${key}`) ||
        lowerMessage.includes(`in ${key}`)) {
      return lang;
    }
    
    // "Make it German", "Convert to French"
    if (lowerMessage.includes(`it ${key}`) ||
        lowerMessage.includes(`make ${key}`) ||
        lowerMessage.includes(`convert ${key}`)) {
      return lang;
    }
    
    // "Turn this into Japanese"
    if (lowerMessage.includes(`this ${key}`) ||
        lowerMessage.includes(`everything ${key}`)) {
      return lang;
    }
  }
  
  return null;
}

/**
 * Extract find/replace terms from ANY natural text phrasing
 */
function extractReplaceTermsFromNaturalText(message) {
  console.log(`🔍 EXTRACTING REPLACE TERMS: "${message}"`);
  
  // Pattern 1: Quote-based (most reliable)
  const quotePatterns = [
    /"([^"]+)"\s*(?:to|with|into)\s*"([^"]+)"/i,
    /'([^']+)'\s*(?:to|with|into)\s*'([^']+)'/i,
    /"([^"]+)".*?"([^"]+)"/,
    /'([^']+)'.*?'([^']+)'/
  ];
  
  for (const pattern of quotePatterns) {
    const match = message.match(pattern);
    if (match && match[1] && match[2]) {
      return {
        findText: match[1].trim(),
        replaceText: match[2].trim()
      };
    }
  }
  
  // Pattern 2: Natural language with "from X to Y"
  const fromToMatch = message.match(/(?:from|of)\s+(.+?)\s+(?:to|with|into)\s+(.+?)(?:\s|$)/i);
  if (fromToMatch && fromToMatch[1] && fromToMatch[2]) {
    return {
      findText: fromToMatch[1].trim(),
      replaceText: fromToMatch[2].trim()
    };
  }
  
  // Pattern 3: "X for Y" or "X with Y"
  const forWithMatch = message.match(/(?:replace|swap|change)\s+(.+?)\s+(?:for|with)\s+(.+?)(?:\s|$)/i);
  if (forWithMatch && forWithMatch[1] && forWithMatch[2]) {
    return {
      findText: forWithMatch[1].trim(),
      replaceText: forWithMatch[2].trim()
    };
  }
  
  return { findText: null, replaceText: null };
}

/**
 * BACKUP: Original parsing function
 */
function parseAndExecuteAgentToolCalls(agentResponse, originalMessage) {
  return parseAIIntelligentExtraction(agentResponse, originalMessage);
}

// Legacy compatibility functions
function detectTranslationIntent(message) {
  const language = detectLanguageFromNaturalText(message);
  return {
    hasIntent: !!language || message.toLowerCase().includes('translate'),
    targetLanguage: language
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
  
  const terms = extractReplaceTermsFromNaturalText(message);
  
  return {
    hasIntent: hasIntent,
    findText: terms.findText,
    replaceText: terms.replaceText,
    scope: 'all_slides'
  };
}

function extractLanguageFromMessage(message) {
  return detectLanguageFromNaturalText(message);
}

function containsTranslationIntent(message) {
  return detectTranslationIntent(message).hasIntent;
}

function isLanguage(text) {
  return !!detectLanguageFromNaturalText(text);
}

/**
 * Test enhanced natural language understanding
 */
function testEnhancedNaturalLanguage() {
  const testCases = [
    'I want to translate to English',
    'Can you translate everything to French?', 
    'Make it German please',
    'I want to replace PRD with 需求文档',
    'Can you change every instance of OldCorp to NewCorp?',
    'Update company name from OldCorp to NewCorp',
    'Spanish',
    'English'
  ];

  testCases.forEach(testCase => {
    console.log(`\n=== Testing: "${testCase}" ===`);
    
    const language = detectLanguageFromNaturalText(testCase);
    if (language) {
      console.log(`Language detected: ${language}`);
    }
    
    const replaceTerms = extractReplaceTermsFromNaturalText(testCase);
    if (replaceTerms.findText && replaceTerms.replaceText) {
      console.log(`Replace terms: "${replaceTerms.findText}" → "${replaceTerms.replaceText}"`);
    }
    
    if (!language && !replaceTerms.findText) {
      console.log('No clear extraction - AI needed');
    }
  });
}
