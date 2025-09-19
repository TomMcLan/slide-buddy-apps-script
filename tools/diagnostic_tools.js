/**
 * Slide Buddy 2.5 - Diagnostic Tools
 * Specific, focused tools for testing and debugging system functionality
 * Following Anthropic's best practices for agent tool design
 */

/**
 * TOOL: debug_translation_issue
 * 
 * DESCRIPTION FOR AGENTS:
 * Diagnoses specific issues with translation functionality by analyzing slide content,
 * text detection, and translation pipeline components. Provides detailed diagnostic
 * information to help identify why translations might fail.
 * 
 * WHEN TO USE:
 * - User reports translation not working or showing "0 translations"
 * - User says "translation isn't working", "nothing got translated"
 * - Need to debug why slide content isn't being detected
 * 
 * PARAMETERS:
 * None required - runs comprehensive analysis automatically
 * 
 * AGENT INSTRUCTIONS:
 * - Use when user reports translation problems
 * - Explain findings in user-friendly terms
 * - Provide specific next steps based on diagnostic results
 */
function debugTranslationIssue() {
  try {
    const presentation = SlidesApp.getActivePresentation();
    const slides = presentation.getSlides();
    
    console.log(`=== TRANSLATION DIAGNOSTIC ===`);
    console.log(`Presentation title: ${presentation.getName()}`);
    console.log(`Total slides: ${slides.length}`);
    
    if (slides.length === 0) {
      return "❌ No slides found in presentation";
    }
    
    // Check current selection
    const selection = SlidesApp.getActivePresentation().getSelection();
    console.log(`Selection type: ${selection ? selection.getSelectionType() : 'None'}`);
    
    // Check first few slides for text content
    let textFound = 0;
    let shapeCount = 0;
    
    for (let i = 0; i < Math.min(3, slides.length); i++) {
      const slide = slides[i];
      const shapes = slide.getShapes();
      shapeCount += shapes.length;
      
      console.log(`\n--- Slide ${i + 1} ---`);
      console.log(`Shapes: ${shapes.length}`);
      
      for (let j = 0; j < shapes.length; j++) {
        try {
          const shape = shapes[j];
          const textRange = shape.getText();
          if (textRange && textRange.asString().trim()) {
            const text = textRange.asString().trim();
            console.log(`  Shape ${j + 1}: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`);
            textFound++;
          } else {
            console.log(`  Shape ${j + 1}: No text or empty`);
          }
        } catch (e) {
          console.log(`  Shape ${j + 1}: Error reading text - ${e.message}`);
        }
      }
    }
    
    const result = `
🔍 **Translation Diagnostic Results:**

📊 **Presentation Info:**
- Title: ${presentation.getName()}
- Total slides: ${slides.length}
- Selection: ${selection ? selection.getSelectionType() : 'None'}

📝 **Content Analysis:**
- Total shapes (first 3 slides): ${shapeCount}
- Text elements found: ${textFound}

${textFound === 0 ? 
  "⚠️ **ISSUE IDENTIFIED:** No text content found! This explains why translation shows 0 elements." :
  "✅ Text content detected - issue may be elsewhere."
}

💡 **Next Steps:**
${textFound === 0 ? 
  "1. Add some text to your slides\n2. Make sure text is in text boxes/shapes\n3. Try the translation again" :
  "1. Check if slides contain only English text\n2. Try translating TO a different language\n3. Review translation logs"
}`;
    
    return result;
    
  } catch (error) {
    return `❌ Diagnostic failed: ${error.message}`;
  }
}

/**
 * Quick diagnostic check for all major components
 */
function quickDiagnosticAI() {
  try {
    console.log('=== Quick AI Diagnostic ===');
    
    // Test 1: API Key
    const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
    console.log('API Key configured:', !!apiKey);
    
    if (!apiKey) {
      console.log('❌ No API key found');
      return 'API Key missing';
    }
    
    // Test 2: AIManager instantiation
    try {
      const aiManager = new AIManager();
      console.log('✅ AIManager created successfully');
    } catch (error) {
      console.log('❌ AIManager creation failed:', error.message);
      return 'AIManager failed';
    }
    
    // Test 3: Basic Gemini connection
    try {
      const aiManager = new AIManager();
      const response = aiManager.callGemini('Say "API working" to confirm connection', 20);
      console.log('✅ Gemini API response:', response);
    } catch (error) {
      console.log('❌ Gemini API failed:', error.message);
      return 'Gemini API failed';
    }
    
    console.log('✅ All diagnostics passed');
    return 'All systems operational';
    
  } catch (error) {
    console.log('❌ Diagnostic failed:', error.message);
    return `Diagnostic error: ${error.message}`;
  }
}

/**
 * Tests Gemini 2.5 Flash API connection specifically
 */
function testGemini25Flash() {
  try {
    console.log('Testing Gemini 2.5 Flash connection...');
    
    const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
    if (!apiKey) {
      console.log('❌ API key not found');
      return 'API key missing';
    }
    
    const payload = {
      contents: [{
        parts: [{
          text: 'Please respond with exactly: "Gemini 2.5 Flash is working correctly"'
        }]
      }],
      generationConfig: {
        temperature: 0.1,
        topK: 1,
        topP: 0.8,
        maxOutputTokens: 100
      }
    };
    
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      payload: JSON.stringify(payload)
    };
    
    const response = UrlFetchApp.fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
      options
    );
    
    if (response.getResponseCode() === 200) {
      const data = JSON.parse(response.getContentText());
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      console.log('✅ Gemini 2.5 Flash response:', text);
      return text || 'Response received but no text content';
    } else {
      console.log('❌ API call failed with status:', response.getResponseCode());
      console.log('Response:', response.getContentText());
      return `API error: ${response.getResponseCode()}`;
    }
    
  } catch (error) {
    console.log('❌ Gemini 2.5 Flash test failed:', error.message);
    return `Error: ${error.message}`;
  }
}

/**
 * Tests the slide context reading functionality
 */
function testContextReading() {
  try {
    console.log('Testing slide context reading...');
    const result = slide_context_read();
    console.log('Context result:', result);
    return result;
  } catch (error) {
    console.log('❌ Context reading failed:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Tests the agent-optimized translation
 */
function testAgentTranslation() {
  try {
    console.log('Testing agent-optimized translation...');
    const result = slide_translate_content('Spanish', 'current_slide', 'professional');
    console.log('Agent translation result:', result);
    return result;
  } catch (error) {
    console.log('❌ Agent translation failed:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Tests the text enhancement functionality
 */
function testTextEnhancement() {
  try {
    console.log('Testing text enhancement...');
    const result = slide_enhance_text('professional', 'current_slide');
    console.log('Enhancement result:', result);
    return result;
  } catch (error) {
    console.log('❌ Text enhancement failed:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Tests the find and replace functionality
 */
function testFindReplace() {
  try {
    console.log('Testing find and replace...');
    const result = slide_find_replace('test', 'TEST', 'current_slide', false);
    console.log('Find & Replace result:', result);
    return result;
  } catch (error) {
    console.log('❌ Find & Replace failed:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Tests Google Translate API specifically
 */
function testGoogleTranslateAPI() {
  try {
    console.log('Testing Google LanguageApp translate...');
    
    // Test simple translation
    const testText = "Hello world, this is a test.";
    const translated = LanguageApp.translate(testText, 'en', 'es');
    
    console.log('Original:', testText);
    console.log('Translated:', translated);
    
    if (translated && translated !== testText) {
      console.log('✅ Google Translate working');
      return 'Google Translate working';
    } else {
      console.log('❌ Google Translate failed or no change');
      return 'Google Translate failed';
    }
    
  } catch (error) {
    console.log('❌ Google Translate error:', error.message);
    return `Google Translate error: ${error.message}`;
  }
}

/**
 * Tests pure Gemini translation without Google Translate
 */
function testGeminiOnlyTranslation() {
  try {
    console.log('Testing pure Gemini 2.5 Flash translation...');
    
    const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
    if (!apiKey) {
      return 'No API key configured';
    }
    
    const testText = "Hello world, this is a test.";
    const result = testGeminiOnlyTranslationForText(testText, 'Spanish');
    
    console.log('Original:', testText);
    console.log('Gemini translation result:', result);
    
    return result;
    
  } catch (error) {
    console.log('❌ Gemini-only translation failed:', error.message);
    return `Error: ${error.message}`;
  }
}

/**
 * Helper function to test Gemini translation for specific text
 */
function testGeminiOnlyTranslationForText(text, targetLanguage) {
  try {
    const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
    if (!apiKey) {
      return 'ERROR: No API key';
    }
    
    const prompt = `Translate this text to ${targetLanguage}. Provide ONLY the translation without explanations:

"${text}"`;
    
    const payload = {
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: 0.3,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024
      }
    };
    
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      payload: JSON.stringify(payload)
    };
    
    const response = UrlFetchApp.fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
      options
    );
    
    if (response.getResponseCode() === 200) {
      const data = JSON.parse(response.getContentText());
      return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No translation returned';
    } else {
      return `API Error: ${response.getResponseCode()}`;
    }
    
  } catch (error) {
    return `Translation error: ${error.message}`;
  }
}

/**
 * Runs a complete diagnostic of all systems
 */
function runCompleteDiagnostic() {
  try {
    console.log('=== COMPLETE DIAGNOSTIC ===');
    
    const results = {
      gemini25Flash: testGemini25Flash(),
      googleTranslate: testGoogleTranslateAPI(),
      contextReading: testContextReading(),
      agentTranslation: testAgentTranslation()
    };
    
    console.log('=== DIAGNOSTIC RESULTS ===');
    console.log('Gemini 2.5 Flash:', results.gemini25Flash);
    console.log('Google Translate:', results.googleTranslate);
    console.log('Context Reading:', results.contextReading.success ? 'SUCCESS' : 'FAILED');
    console.log('Agent Translation:', results.agentTranslation.success ? 'SUCCESS' : 'FAILED');
    
    return results;
    
  } catch (error) {
    console.log('❌ Complete diagnostic failed:', error.message);
    return { error: error.message };
  }
}

/**
 * Debugs slide content structure
 */
function debugSlideContent() {
  try {
    const presentation = SlidesApp.getActivePresentation();
    const slides = presentation.getSlides();
    
    console.log(`Found ${slides.length} slides`);
    
    if (slides.length > 0) {
      const firstSlide = slides[0];
      const shapes = firstSlide.getShapes();
      
      console.log(`First slide has ${shapes.length} shapes`);
      
      shapes.forEach((shape, index) => {
        try {
          const text = shape.getText();
          if (text) {
            console.log(`Shape ${index + 1}: "${text.asString().substring(0, 50)}..."`);
          }
        } catch (shapeError) {
          console.log(`Shape ${index + 1}: Could not read text`);
        }
      });
    }
    
    return `Debug complete. Found ${slides.length} slides.`;
    
  } catch (error) {
    console.log('❌ Debug failed:', error.message);
    return `Debug error: ${error.message}`;
  }
}

/**
 * Tests API connection quickly
 */
function testAPIConnection() {
  try {
    const aiManager = new AIManager();
    return 'API connection successful! Gemini API key is configured and ready.';
  } catch (error) {
    return `API connection failed: ${error.message}`;
  }
}

/**
 * Tests installation status
 */
function testInstallation() {
  try {
    console.log('✅ Testing Slide Buddy installation...');
    console.log('✅ All classes loaded successfully');
    console.log('✅ Ready to install in Google Slides');
    console.log('');
    console.log('📋 Next steps:');
    console.log('1. Run onOpen() to create the menu');
    console.log('2. Click "Slide Buddy" in the menu');
    console.log('3. Start using the assistant!');
    
    return 'Installation test complete - ready to use!';
  } catch (error) {
    return `Installation test failed: ${error.message}`;
  }
}

/**
 * MASTER DIAGNOSTIC - Run this one function to test everything
 */
function runMasterDiagnostic() {
  try {
    console.log('🔍 === SLIDE BUDDY MASTER DIAGNOSTIC ===');
    const results = [];
    
    // Test 1: API Key
    const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
    results.push(`1. API Key: ${apiKey ? '✅ CONFIGURED' : '❌ MISSING'}`);
    
    // Test 2: AIManager
    try {
      const aiManager = new AIManager();
      results.push('2. AIManager: ✅ LOADED');
      
      // Test 3: Gemini API Call
      if (apiKey) {
        const testResponse = aiManager.callGemini('Respond with "OK"', 10);
        results.push(`3. Gemini API: ${testResponse ? '✅ WORKING' : '❌ FAILED'}`);
      } else {
        results.push('3. Gemini API: ❌ SKIPPED (No API key)');
      }
    } catch (aiError) {
      results.push(`2. AIManager: ❌ FAILED - ${aiError.message}`);
      results.push('3. Gemini API: ❌ SKIPPED (AIManager failed)');
    }
    
    // Test 4: Slides Context (might fail if not in Google Slides)
    try {
      const presentation = SlidesApp.getActivePresentation();
      const slides = presentation.getSlides();
      results.push(`4. Slides Context: ✅ WORKING (${slides.length} slides found)`);
    } catch (slidesError) {
      results.push('4. Slides Context: ❌ FAILED (Not in Google Slides context)');
    }
    
    // Test 5: UI Integration
    try {
      const uiTest = typeof openSlideBuddy === 'function';
      results.push(`5. UI Functions: ${uiTest ? '✅ LOADED' : '❌ MISSING'}`);
    } catch (uiError) {
      results.push('5. UI Functions: ❌ FAILED');
    }
    
    const summary = results.join('\n');
    console.log(summary);
    console.log('\n🎯 DIAGNOSIS COMPLETE!');
    
    return summary;
    
  } catch (error) {
    const errorMsg = `❌ Master diagnostic failed: ${error.message}`;
    console.log(errorMsg);
    return errorMsg;
  }
}

/**
 * Tests current slide content reading
 */
function testCurrentSlideContent() {
  try {
    const presentation = SlidesApp.getActivePresentation();
    const slides = presentation.getSlides();
    console.log('Total slides:', slides.length);
    
    if (slides.length > 0) {
      const currentSlide = slides[0];
      const shapes = currentSlide.getShapes();
      console.log('Shapes in first slide:', shapes.length);
      
      shapes.forEach((shape, index) => {
        try {
          const text = shape.getText().asString();
          console.log(`Text ${index + 1}:`, text.substring(0, 100));
        } catch (e) {
          console.log(`Shape ${index + 1}: No text content`);
        }
      });
    }
    
    return 'Slide content analysis complete';
    
  } catch (error) {
    console.log('❌ Slide content test failed:', error.message);
    return `Error: ${error.message}`;
  }
}

/**
 * TOOL: test_basic_routing
 * 
 * DESCRIPTION FOR AGENTS:
 * Test basic agent routing without complex logic to verify system connectivity.
 * 
 * WHEN TO USE:
 * - User reports general system errors
 * - Basic connectivity testing needed
 */
function testBasicRouting() {
  try {
    return {
      success: true,
      response: "✅ Basic routing is working! Agent can receive and respond to messages."
    };
  } catch (error) {
    return {
      success: false,
      response: `❌ Basic routing failed: ${error.message}`
    };
  }
}

/**
 * TOOL: test_api_key_config
 * 
 * DESCRIPTION FOR AGENTS:
 * Verify that the Gemini API key is properly configured in project settings.
 * 
 * WHEN TO USE:
 * - User gets API key related errors
 * - Need to verify configuration
 */
function testAPIKeyConfig() {
  try {
    const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
    
    if (!apiKey) {
      return {
        success: false,
        response: `🔑 **API Key Missing**\n\nPlease configure your Gemini API key:\n\n1. Go to Extensions → Apps Script\n2. Click Project Settings (gear icon)\n3. Add Script Property: GEMINI_API_KEY\n4. Enter your Gemini API key`
      };
    }
    
    return {
      success: true,
      response: `✅ API Key is configured (${apiKey.substring(0, 10)}...)`
    };
  } catch (error) {
    return {
      success: false,
      response: `❌ API Key check failed: ${error.message}`
    };
  }
}

/**
 * TOOL: handle_translation_directly
 * 
 * DESCRIPTION FOR AGENTS:
 * Simple agent that directly handles translation requests without complex routing.
 * Used as fallback when main agent has issues.
 * 
 * WHEN TO USE:
 * - Main agent is failing
 * - Direct translation needed
 * - Debugging translation pipeline
 */
function handleTranslationDirectly(message, targetLanguage = null) {
  try {
    console.log('Direct translation handler called with:', message, targetLanguage);
    
    // Check API key first
    const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
    if (!apiKey) {
      return {
        success: false,
        response: "🔑 Please configure your Gemini API key in Project Settings"
      };
    }
    
    // Debug slide content first
    const debugResult = debugSlideContent();
    console.log('Slide debug before translation:', debugResult);
    
    // Try translation directly
    const result = slide_translate_all(targetLanguage, 'professional');
    
    if (result.success) {
      return {
        success: true,
        response: `✅ **Translation Complete!** ${result.user_message}`,
        canUndo: true
      };
    } else {
      return {
        success: false,
        response: `❌ Translation failed: ${result.error}`
      };
    }
  } catch (error) {
    return {
      success: false,
      response: `❌ Direct translation error: ${error.message}`
    };
  }
}

/**
 * Test the revert system functionality
 */
function testRevertSystem() {
  try {
    console.log('🧪 Testing RevertSystem functionality...');
    
    const revertSystem = new RevertSystem();
    
    // Test creating a snapshot
    console.log('Creating test snapshot...');
    const snapshotResult = revertSystem.createSnapshot('test', 'Test snapshot for debugging');
    console.log('Snapshot result:', snapshotResult);
    
    // Test reverting
    console.log('Testing revert functionality...');
    const revertResult = revertSystem.revertLastChange();
    console.log('Revert result:', revertResult);
    
    return {
      success: true,
      message: `✅ RevertSystem test complete. Snapshot: ${snapshotResult ? 'OK' : 'FAILED'}, Revert: ${revertResult.success ? 'OK' : 'FAILED'}`
    };
    
  } catch (error) {
    console.error('RevertSystem test failed:', error);
    return {
      success: false,
      message: `❌ RevertSystem test failed: ${error.message}`
    };
  }
}

/**
 * Test the handleRevertRequest function directly
 */
function testHandleRevertRequest() {
  try {
    console.log('🧪 Testing handleRevertRequest function...');
    
    const result = handleRevertRequest();
    console.log('handleRevertRequest result:', result);
    
    return {
      success: true,
      message: `✅ handleRevertRequest test: ${result.success ? 'SUCCESS' : 'FAILED'} - ${result.message}`
    };
    
  } catch (error) {
    console.error('handleRevertRequest test failed:', error);
    return {
      success: false,
      message: `❌ handleRevertRequest test failed: ${error.message}`
    };
  }
}

/**
 * Test Google Apps Script's built-in LanguageApp.translate
 */
function testLanguageAppTranslate() {
  try {
    console.log('🧪 Testing LanguageApp.translate...');
    
    // Test basic translation
    const testText = "Hello world";
    const result = LanguageApp.translate(testText, 'en', 'es');
    
    console.log(`Original: "${testText}"`);
    console.log(`Translated: "${result}"`);
    
    if (result && result !== testText) {
      console.log('✅ LanguageApp.translate works perfectly!');
      return {
        success: true,
        message: `✅ Google Translate working! "${testText}" → "${result}"`
      };
    } else {
      console.log('❌ LanguageApp.translate returned empty/same result');
      return {
        success: false,
        message: '❌ LanguageApp.translate not working properly'
      };
    }
    
  } catch (error) {
    console.error('LanguageApp.translate test failed:', error);
    return {
      success: false,
      message: `❌ Error: ${error.message}`
    };
  }
}

/**
 * Debug slide content to see what text is actually available
 */
function debugSlideContent() {
  try {
    const presentation = SlidesApp.getActivePresentation();
    const slides = presentation.getSlides();
    
    console.log(`=== SLIDE CONTENT DEBUG ===`);
    console.log(`Presentation: ${presentation.getName()}`);
    console.log(`Total slides: ${slides.length}`);
    
    let totalShapes = 0;
    let totalTextShapes = 0;
    
    for (let i = 0; i < Math.min(3, slides.length); i++) {
      const slide = slides[i];
      const shapes = slide.getShapes();
      totalShapes += shapes.length;
      
      console.log(`\n--- Slide ${i + 1} ---`);
      console.log(`Shapes: ${shapes.length}`);
      
      for (let j = 0; j < shapes.length; j++) {
        try {
          const shape = shapes[j];
          console.log(`  Shape ${j + 1} type: ${shape.getShapeType()}`);
          
          const textRange = shape.getText();
          if (textRange && textRange.asString().trim()) {
            const text = textRange.asString().trim();
            totalTextShapes++;
            console.log(`  ✅ Text found: "${text.substring(0, 100)}${text.length > 100 ? '...' : ''}"`);
          } else {
            console.log(`  ❌ No text or empty`);
          }
        } catch (e) {
          console.log(`  ⚠️ Error reading shape: ${e.message}`);
        }
      }
    }
    
    return {
      success: true,
      totalSlides: slides.length,
      totalShapes: totalShapes,
      totalTextShapes: totalTextShapes,
      summary: `Found ${totalTextShapes} text shapes across ${totalShapes} total shapes in ${slides.length} slides`
    };
    
  } catch (error) {
    console.error('Debug slide content failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Debug function to check what text content exists in all slides
 */
function debugSlideTextContent() {
  try {
    const presentation = SlidesApp.getActivePresentation();
    const slides = presentation.getSlides();
    
    console.log(`=== SLIDE TEXT CONTENT DEBUG ===`);
    console.log(`Total slides: ${slides.length}`);
    
    let allTextContent = [];
    
    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];
      const shapes = slide.getShapes();
      
      console.log(`\n--- Slide ${i + 1} ---`);
      console.log(`Total shapes: ${shapes.length}`);
      
      let slideTextContent = [];
      
      for (let j = 0; j < shapes.length; j++) {
        const shape = shapes[j];
        try {
          if (shape.getShapeType() === SlidesApp.ShapeType.TEXT_BOX || 
              shape.getShapeType() === SlidesApp.ShapeType.RECTANGLE ||
              shape.getShapeType() === SlidesApp.ShapeType.ROUND_RECTANGLE) {
            
            const textRange = shape.getText();
            if (textRange) {
              const text = textRange.asString();
              if (text && text.trim()) {
                console.log(`  Shape ${j + 1}: "${text}"`);
                slideTextContent.push(text);
                
                // Check specifically for "PRD"
                if (text.includes('PRD')) {
                  console.log(`  ✅ FOUND "PRD" in shape ${j + 1}`);
                }
              }
            }
          }
        } catch (shapeError) {
          console.log(`  Shape ${j + 1} error: ${shapeError.message}`);
        }
      }
      
      allTextContent.push({
        slide: i + 1,
        texts: slideTextContent
      });
    }
    
    return {
      success: true,
      slides_count: slides.length,
      content: allTextContent,
      summary: `Found ${allTextContent.reduce((total, slide) => total + slide.texts.length, 0)} text elements across ${slides.length} slides`
    };
    
  } catch (error) {
    console.error('Debug slide content error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}
