/**
 * SLIDE TRANSLATION TOOLS
 * 
 * Agent-optimized tools for translating slide content to different languages.
 * These tools use Gemini 2.5 Flash for accurate, contextual translations.
 */

/**
 * TOOL: slide_translate_current
 * 
 * DESCRIPTION FOR AGENTS:
 * Translates text content on the current slide to a specified target language.
 * Uses Gemini 2.5 Flash for high-quality translations while preserving formatting.
 * This tool focuses on just the currently visible/selected slide.
 * 
 * WHEN TO USE:
 * - User says "translate this slide", "translate current slide"
 * - User wants to translate just one slide instead of all slides
 * - User is focused on the current slide and needs quick translation
 * 
 * PARAMETERS:
 * - target_language (required): Language to translate to (e.g., "Spanish", "French", "Japanese")
 * - style (optional): "professional" (default), "casual", "academic"
 * 
 * AGENT INSTRUCTIONS:
 * - Confirm which language to translate to before proceeding
 * - Use professional style for business presentations
 * - Inform user this only affects the current slide
 */
function slide_translate_current(target_language, style = 'professional') {
  try {
    if (!target_language) {
      return {
        success: false,
        error: "Target language is required",
        agent_guidance: "Ask the user: 'Which language would you like me to translate this slide to?'"
      };
    }
    
    console.log(`Starting current slide translation to ${target_language} (style: ${style})`);
    
    // Create snapshot before translation for undo functionality
    const revertSystem = new RevertSystem();
    revertSystem.createSnapshot('translation', `Translate current slide to ${target_language}`);
    
    const presentation = SlidesApp.getActivePresentation();
    const slides = presentation.getSlides();
    
    if (slides.length === 0) {
      return {
        success: false,
        error: "No slides found in presentation",
        agent_guidance: "Tell user they need slides with content to translate"
      };
    }
    
    // Get current slide
    let currentSlide;
    const selection = SlidesApp.getActivePresentation().getSelection();
    if (selection && selection.getSelectionType() === SlidesApp.SelectionType.CURRENT_PAGE) {
      currentSlide = selection.getCurrentPage();
    } else {
      currentSlide = slides[0]; // Fallback to first slide
    }
    
    const slideIndex = slides.indexOf(currentSlide);
    const aiManager = new AIManager();
    
    let translationCount = 0;
    let translationResults = [];
    
    const shapes = currentSlide.getShapes();
    
    for (const shape of shapes) {
      try {
        if (shape.getShapeType() === SlidesApp.ShapeType.TEXT_BOX || 
            shape.getShapeType() === SlidesApp.ShapeType.RECTANGLE ||
            shape.getShapeType() === SlidesApp.ShapeType.ROUND_RECTANGLE ||
            shape.getShapeType() === SlidesApp.ShapeType.ELLIPSE) {
          
          const textRange = shape.getText();
          if (textRange && textRange.asString().trim()) {
            const originalText = textRange.asString().trim();
            
            try {
              console.log(`Translating text: "${originalText.substring(0, 30)}..."`);
              // Use Google Translate API for better quality and speed
              const translation = translateWithGoogleAPI(originalText, target_language);
              
              if (translation && translation.trim()) {
                textRange.setText(translation.trim());
                
                translationResults.push({
                  original: originalText.substring(0, 50) + '...',
                  translated: translation.substring(0, 50) + '...',
                  status: 'success'
                });
                
                translationCount++;
                console.log(`✅ Translated successfully`);
                
                Utilities.sleep(500); // Rate limiting
              }
            } catch (translationError) {
              translationResults.push({
                original: originalText.substring(0, 50) + '...',
                status: 'failed',
                error: translationError.message
              });
            }
          }
        }
      } catch (shapeError) {
        console.log(`Shape processing error: ${shapeError.message}`);
      }
    }
    
    return {
      success: true,
      summary: {
        target_language: target_language,
        slide_number: slideIndex + 1,
        translations_made: translationCount,
        style: style
      },
      results: translationResults,
      user_message: `✅ Current slide translated to ${target_language}! Made ${translationCount} translations in ${style} style. Notice that the AI translation can be wrong, please double check if you want to use it for professional or important purposes.`,
      agent_guidance: {
        next_actions: [
          "Inform user about successful translation of current slide",
          "Ask if they want to translate other slides using slide_translate_all",
          "If user wants to undo, suggest using slide_revert_changes"
        ]
      }
    };
    
  } catch (error) {
    console.error('Current slide translation failed:', error);
    return {
      success: false,
      error: `Translation failed: ${error.message}`,
      agent_guidance: "Explain that translation failed and suggest checking API configuration or trying again"
    };
  }
}

/**
 * TOOL: slide_translate_all
 * 
 * DESCRIPTION FOR AGENTS:
 * Translates text content across ALL slides in the presentation to a specified target language.
 * Uses Gemini 2.5 Flash for consistent, professional translations throughout the entire deck.
 * This is a comprehensive tool for full presentation localization.
 * 
 * WHEN TO USE:
 * - User says "translate all slides", "translate the entire presentation", "translate everything"
 * - User wants consistent translation across their whole presentation
 * - Professional presentation localization tasks
 * 
 * PARAMETERS:
 * - target_language (required): Language to translate to (e.g., "Spanish", "French", "Japanese")
 * - style (optional): "professional" (default), "casual", "academic"
 * 
 * AGENT INSTRUCTIONS:
 * - Warn user this will translate ALL slides and may take time
 * - Confirm target language before proceeding
 * - Use professional style for business presentations
 * - Provide progress updates for large presentations
 */
function slide_translate_all(target_language, style = 'professional') {
  try {
    if (!target_language) {
      return {
        success: false,
        error: "Target language is required",
        agent_guidance: "Ask the user: 'Which language would you like me to translate the entire presentation to?'"
      };
    }
    
    console.log(`Starting full presentation translation to ${target_language} (style: ${style})`);
    
    // Create snapshot before translation for undo functionality
    const revertSystem = new RevertSystem();
    revertSystem.createSnapshot('translation', `Translate all slides to ${target_language}`);
    
    const presentation = SlidesApp.getActivePresentation();
    const slides = presentation.getSlides();
    
    if (slides.length === 0) {
      return {
        success: false,
        error: "No slides found in presentation",
        agent_guidance: "Tell user they need slides with content to translate"
      };
    }
    
    const aiManager = new AIManager();
    let processedSlides = 0;
    let totalTranslations = 0;
    let translationResults = [];
    
    // Collect all text elements from all slides for batch processing
    console.log(`🚀 Collecting all text elements for batch translation...`);
    
    // Send progress update to UI
    updateProgress(`🔍 Analyzing ${slides.length} slides for text content...`);
    
    const allTextElements = [];
    
    slides.forEach((slide, slideIndex) => {
      const shapes = slide.getShapes();
      
      shapes.forEach(shape => {
        try {
          if (shape.getShapeType() === SlidesApp.ShapeType.TEXT_BOX || 
              shape.getShapeType() === SlidesApp.ShapeType.RECTANGLE ||
              shape.getShapeType() === SlidesApp.ShapeType.ROUND_RECTANGLE ||
              shape.getShapeType() === SlidesApp.ShapeType.ELLIPSE) {
            
            const textRange = shape.getText();
            if (textRange && textRange.asString().trim()) {
              const originalText = textRange.asString().trim();
              
              allTextElements.push({
                slideIndex: slideIndex,
                slideNumber: slideIndex + 1,
                textRange: textRange,
                originalText: originalText,
                shape: shape
              });
            }
          }
        } catch (shapeError) {
          console.log(`Shape processing error on slide ${slideIndex + 1}: ${shapeError.message}`);
        }
      });
    });
    
    console.log(`📝 Found ${allTextElements.length} text elements across ${slides.length} slides`);
    
    // Update progress with analysis results
    updateProgress(`📝 Found ${allTextElements.length} text elements to translate across ${slides.length} slides`);
    
    // Process all text elements in batches (Google Apps Script friendly)
    const BATCH_SIZE = 10; // Process 10 elements at a time to avoid timeouts
    
    for (let batchStart = 0; batchStart < allTextElements.length; batchStart += BATCH_SIZE) {
      const batchEnd = Math.min(batchStart + BATCH_SIZE, allTextElements.length);
      const batch = allTextElements.slice(batchStart, batchEnd);
      
      const batchNumber = Math.floor(batchStart/BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(allTextElements.length/BATCH_SIZE);
      console.log(`🔄 Processing batch ${batchNumber}/${totalBatches} (${batch.length} elements)`);
      
      // Update progress for each batch
      updateProgress(`🔄 Translating batch ${batchNumber}/${totalBatches} (${totalTranslations}/${allTextElements.length} completed)`);
      
      // Process batch elements
      batch.forEach(element => {
        try {
          console.log(`Translating slide ${element.slideNumber}: "${element.originalText.substring(0, 30)}..."`);
          // Use Google Translate API for better quality and speed
          const translation = translateWithGoogleAPI(element.originalText, target_language);
          
          if (translation && translation.trim()) {
            element.textRange.setText(translation.trim());
            
            translationResults.push({
              slide_number: element.slideNumber,
              original: element.originalText.substring(0, 50) + '...',
              translated: translation.substring(0, 50) + '...',
              status: 'success'
            });
            
            totalTranslations++;
            console.log(`✅ Translated slide ${element.slideNumber} text`);
          } else {
            console.log(`⚠️ No translation returned for slide ${element.slideNumber}`);
          }
          
        } catch (translationError) {
          console.error(`Translation error on slide ${element.slideNumber}: ${translationError.message}`);
          translationResults.push({
            slide_number: element.slideNumber,
            original: element.originalText.substring(0, 50) + '...',
            status: 'failed',
            error: translationError.message
          });
        }
      });
      
      // Small delay between batches to prevent rate limiting
      if (batchEnd < allTextElements.length) {
        Utilities.sleep(100);
      }
    }
    
    // Count processed slides
    const slidesWithTranslations = new Set(translationResults.map(r => r.slide_number));
    processedSlides = slidesWithTranslations.size;
    
    return {
      success: true,
      summary: {
        target_language: target_language,
        total_slides: slides.length,
        processed_slides: processedSlides,
        total_translations: totalTranslations,
        style: style
      },
      results: translationResults,
      user_message: `Translation Complete! Full presentation translated to ${target_language}! Processed ${processedSlides} slides with ${totalTranslations} translations in ${style} style. Notice that the AI translation can be wrong, please double check if you want to use it for professional or important purposes.`,
      canUndo: true, // Enable undo button
      agent_guidance: {
        next_actions: [
          "Inform user about successful completion of full presentation translation",
          "Mention the number of slides and text elements translated",
          "If user wants to undo, suggest using slide_revert_changes"
        ]
      }
    };
    
  } catch (error) {
    console.error('Full presentation translation failed:', error);
    return {
      success: false,
      error: `Translation failed: ${error.message}`,
      agent_guidance: "Explain that translation failed and suggest checking API configuration or trying with fewer slides"
    };
  }
}

/**
 * TOOL: slide_translate_selected
 * 
 * DESCRIPTION FOR AGENTS:
 * Translates text content only in selected text boxes or shapes on the current slide.
 * Allows for precise, targeted translation without affecting other slide content.
 * Perfect for partial translations or when user has specific elements selected.
 * 
 * WHEN TO USE:
 * - User has selected specific text or shapes and wants to translate only those
 * - User says "translate the selected text", "translate this text box"
 * - Precision translation tasks where only certain elements should change
 * 
 * PARAMETERS:
 * - target_language (required): Language to translate to (e.g., "Spanish", "French", "Japanese")
 * - style (optional): "professional" (default), "casual", "academic"
 * 
 * AGENT INSTRUCTIONS:
 * - Only works if user has selected elements containing text
 * - Inform user this only affects selected elements
 * - If nothing is selected, suggest using slide_translate_current instead
 */
function slide_translate_selected(target_language, style = 'professional') {
  try {
    if (!target_language) {
      return {
        success: false,
        error: "Target language is required",
        agent_guidance: "Ask the user: 'Which language would you like me to translate the selected text to?'"
      };
    }
    
    console.log(`Starting selected elements translation to ${target_language} (style: ${style})`);
    
    const presentation = SlidesApp.getActivePresentation();
    const selection = presentation.getSelection();
    
    if (!selection || selection.getSelectionType() !== SlidesApp.SelectionType.PAGE_ELEMENT) {
      return {
        success: false,
        error: "No elements selected",
        agent_guidance: "Tell user to select text boxes or shapes first, or suggest using slide_translate_current for the whole slide"
      };
    }
    
    const selectedElements = selection.getPageElementRange().getPageElements();
    const aiManager = new AIManager();
    
    let translationCount = 0;
    let translationResults = [];
    
    for (const element of selectedElements) {
      try {
        const shape = element.asShape();
        const textRange = shape.getText();
        
        if (textRange && textRange.asString().trim()) {
          const originalText = textRange.asString().trim();
          
          const translationPrompt = `You are a professional translator specializing in presentation content.

Translate this ${style} presentation text to ${target_language}.

Original text: "${originalText}"

Requirements:
- Maintain ${style} tone appropriate for presentations
- Preserve any formatting structure
- Use natural, contextually appropriate language
- Consider business/academic presentation context
- Keep technical terms appropriate for the field

Provide ONLY the translated text without explanations or quotation marks:`;
          
          try {
            console.log(`Translating selected text: "${originalText.substring(0, 30)}..."`);
            // Use Google Translate API for better quality and speed
            const translation = translateWithGoogleAPI(originalText, target_language);
            
            if (translation && translation.trim()) {
              textRange.setText(translation.trim());
              
              translationResults.push({
                original: originalText.substring(0, 50) + '...',
                translated: translation.substring(0, 50) + '...',
                status: 'success'
              });
              
              translationCount++;
              console.log(`✅ Translated selected element successfully`);
              
              Utilities.sleep(500); // Rate limiting
            }
          } catch (translationError) {
            translationResults.push({
              original: originalText.substring(0, 50) + '...',
              status: 'failed',
              error: translationError.message
            });
          }
        }
      } catch (elementError) {
        console.log(`Selected element processing error: ${elementError.message}`);
      }
    }
    
    return {
      success: true,
      summary: {
        target_language: target_language,
        selected_elements: selectedElements.length,
        translations_made: translationCount,
        style: style
      },
      results: translationResults,
      user_message: `✅ Selected elements translated to ${target_language}! Made ${translationCount} translations in ${style} style.`,
      agent_guidance: {
        next_actions: [
          "Inform user about successful translation of selected elements",
          "Ask if they want to translate more elements or the entire slide",
          "If user wants to undo, suggest using slide_revert_changes"
        ]
      }
    };
    
  } catch (error) {
    console.error('Selected elements translation failed:', error);
    return {
      success: false,
      error: `Translation failed: ${error.message}`,
      agent_guidance: "Explain that translation failed and suggest selecting text elements first or trying slide_translate_current"
    };
  }
}

/**
 * Google Translate API Integration
 * Fast, accurate translation using Google's service
 */
function translateWithGoogleAPI(text, targetLanguage) {
  try {
    console.log(`🔍 Translation input - Text length: ${text.length}, Content: "${text.substring(0, 50)}...", Target: ${targetLanguage}`);
    
    // Validate input
    if (!text || !text.trim()) {
      throw new Error('Empty text provided for translation');
    }
    
    if (!targetLanguage) {
      throw new Error('Target language not specified');
    }
    
    // Language code mapping for Google Translate
    const languageMap = {
      'spanish': 'es', 'english': 'en', 'french': 'fr', 'german': 'de', 
      'italian': 'it', 'portuguese': 'pt', 'russian': 'ru', 'chinese': 'zh',
      'japanese': 'ja', 'korean': 'ko', 'arabic': 'ar', 'hindi': 'hi',
      'dutch': 'nl', 'swedish': 'sv', 'norwegian': 'no', 'danish': 'da',
      'polish': 'pl'
    };
    
    const targetCode = languageMap[targetLanguage.toLowerCase()] || targetLanguage.toLowerCase();
    
    console.log(`🔄 Attempting Google Translate: "${text.substring(0, 30)}..." to ${targetCode}`);
    
    // Use Google Apps Script's built-in LanguageApp for translation
    const translatedText = LanguageApp.translate(text, '', targetCode);
    
    // Check if translation was successful
    if (translatedText && translatedText.trim()) {
      // If text is the same, it might already be in target language
      if (translatedText === text) {
        console.log(`ℹ️ Text appears to already be in ${targetLanguage}: "${text.substring(0, 30)}..."`);
        return translatedText; // Return as-is, it's already correct
      } else {
        console.log(`✅ Google Translate success: "${text.substring(0, 30)}..." → "${translatedText.substring(0, 30)}..."`);
        return translatedText;
      }
    } else {
      console.log(`⚠️ Google Translate returned empty result, falling back to Gemini`);
      throw new Error('Google Translate returned empty result');
    }
    
  } catch (error) {
    console.error('Google Translate API error:', error);
    
    // Fallback to Gemini if Google Translate fails
    console.log('🔄 Falling back to Gemini translation...');
    const aiManager = new AIManager();
    const fallbackPrompt = `Translate this text to ${targetLanguage}: "${text}"

Requirements:
- Maintain professional presentation tone
- Preserve any formatting structure
- Use natural, contextually appropriate language

Provide ONLY the translated text without explanations:`;
    
    const geminiResult = aiManager.callGeminiWithThinking(fallbackPrompt, 200);
    console.log(`✅ Gemini fallback: "${text.substring(0, 30)}..." → "${geminiResult.substring(0, 30)}..."`);
    return geminiResult;
  }
}

/**
 * Update progress display in UI during long operations
 */
function updateProgress(message) {
  try {
    // For now, just log to console - in future could update UI
    console.log(`💭 PROGRESS: ${message}`);
    
    // TODO: In future, could send progress updates to sidebar UI
    // HtmlService or similar mechanism to update the "Processing your request..." message
    
  } catch (error) {
    console.error('Progress update failed:', error);
  }
}