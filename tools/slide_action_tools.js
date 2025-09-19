/**
 * Slide Buddy 2.5 - Action Tools  
 * Functions for executing specific actions on slides (translate, enhance, find/replace)
 */

/**
 * TOOL: slide_translate_content
 * 
 * DESCRIPTION FOR AGENTS:
 * Translates slide content to a specified target language using Gemini 2.5 Flash for
 * natural, contextually appropriate translations suitable for professional presentations.
 * 
 * PARAMETERS:
 * - target_language (required): The language to translate to (e.g., "Spanish", "French", "Japanese")
 * - scope (optional): "current_slide", "selected_text", or "entire_presentation" (default: "current_slide")
 * - style (optional): "professional", "casual", "academic" (default: "professional")
 * 
 * WHAT IT DOES:
 * 1. Identifies text content in the specified scope
 * 2. Uses Gemini 2.5 Flash to create natural, professional translations
 * 3. Preserves formatting and slide structure
 * 4. Returns detailed results about what was changed
 * 
 * AGENT INSTRUCTIONS:
 * - Always call slide_context_read() first to understand what the user wants translated
 * - If user doesn't specify language, ask them to clarify
 * - If translation fails, explain why and suggest alternatives
 */
function slide_translate_content(target_language, scope = 'current_slide', style = 'professional') {
  try {
    if (!target_language) {
      return {
        success: false,
        error: "Target language is required",
        agent_guidance: "Ask the user which language they want to translate to"
      };
    }
    
    console.log(`Starting translation to ${target_language} (scope: ${scope}, style: ${style})`);
    
    const presentation = SlidesApp.getActivePresentation();
    const slides = presentation.getSlides();
    
    if (slides.length === 0) {
      return {
        success: false,
        error: "No slides found in presentation",
        agent_guidance: "Tell user they need to have slides with content to translate"
      };
    }
    
    // Language code mapping for better translation accuracy
    const languageMap = {
      'spanish': 'es', 'french': 'fr', 'german': 'de', 'italian': 'it',
      'portuguese': 'pt', 'russian': 'ru', 'chinese': 'zh', 'japanese': 'ja',
      'korean': 'ko', 'arabic': 'ar', 'hindi': 'hi', 'dutch': 'nl'
    };
    
    const targetCode = languageMap[target_language.toLowerCase()] || target_language.toLowerCase();
    const aiManager = new AIManager();
    
    let processedSlides = 0;
    let totalTranslations = 0;
    let translationResults = [];
    
    // Determine which slides to process based on scope
    let slidesToProcess = [];
    switch (scope) {
      case 'current_slide':
        const selection = SlidesApp.getActivePresentation().getSelection();
        if (selection && selection.getSelectionType() === SlidesApp.SelectionType.CURRENT_PAGE) {
          slidesToProcess = [selection.getCurrentPage()];
        } else {
          // If no current page selected, use the first slide with content
          slidesToProcess = [slides[0]];
        }
        break;
      case 'entire_presentation':
        slidesToProcess = slides; // Process all slides, not just first 10
        break;
      default:
        slidesToProcess = [slides[0]];
    }
    
    // Process each slide
    for (const slide of slidesToProcess) {
      const slideIndex = slides.indexOf(slide);
      console.log(`Processing slide ${slideIndex + 1}...`);
      
      const shapes = slide.getShapes();
      let slideTranslations = 0;
      
      for (const shape of shapes) {
        try {
          // Check if shape has text
          if (shape.getShapeType() === SlidesApp.ShapeType.TEXT_BOX || 
              shape.getShapeType() === SlidesApp.ShapeType.RECTANGLE ||
              shape.getShapeType() === SlidesApp.ShapeType.ROUND_RECTANGLE) {
            
            const textRange = shape.getText();
            if (textRange && textRange.asString().trim()) {
              const originalText = textRange.asString().trim();
              
              // Use Gemini 2.5 Flash for enhanced translation
              const translationPrompt = `You are a professional translator specializing in presentation content.

Translate this ${style} presentation text from its current language to ${target_language} (${targetCode}).

Original text: "${originalText}"

Requirements:
- Maintain ${style} tone appropriate for presentations
- Preserve any formatting structure
- Use natural, contextually appropriate language
- Consider business/academic presentation context
- Keep technical terms appropriate for the field

Provide ONLY the translated text without explanations or quotation marks:`;
            
            try {
              console.log(`Translating: "${originalText.substring(0, 30)}..." to ${target_language}`);
              const translation = aiManager.callGeminiWithThinking(translationPrompt, 300);
              
              if (translation && translation.trim()) {
                // Always apply translation even if similar (for language conversion)
                textRange.setText(translation.trim());
                
                translationResults.push({
                  slide_number: slideIndex + 1,
                  original: originalText.substring(0, 50) + '...',
                  translated: translation.substring(0, 50) + '...',
                  status: 'success'
                });
                
                slideTranslations++;
                totalTranslations++;
                
                console.log(`✅ Translated: "${originalText.substring(0, 20)}..." → "${translation.substring(0, 20)}..."`);
                
                // Rate limiting for API calls
                Utilities.sleep(500);
              } else {
                console.log(`⚠️ No translation returned for: "${originalText.substring(0, 30)}..."`);
              }
            } catch (translationError) {
              console.error(`Translation error: ${translationError.message}`);
              translationResults.push({
                slide_number: slideIndex + 1,
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
      
      if (slideTranslations > 0) {
        processedSlides++;
      }
    }
    
    return {
      success: true,
      summary: {
        target_language: target_language,
        scope: scope,
        slides_processed: processedSlides,
        total_translations: totalTranslations,
        style: style
      },
      results: translationResults,
      user_message: `✅ Translation to ${target_language} complete! Processed ${processedSlides} slide(s) with ${totalTranslations} text elements translated in ${style} style.`,
      agent_guidance: {
        next_actions: [
          "Inform user about successful translation",
          "If user wants to undo, use slide_revert_changes()",
          "If user wants to translate more content, call this tool again with different scope"
        ]
      }
    };
    
  } catch (error) {
    console.error('Translation failed:', error);
    return {
      success: false,
      error: `Translation failed: ${error.message}`,
      agent_guidance: "Explain to user that translation failed and suggest checking API configuration or trying again"
    };
  }
}

/**
 * TOOL: slide_enhance_text
 * 
 * DESCRIPTION FOR AGENTS:
 * Improves the quality and professionalism of text content in slides using Gemini 2.5 Flash.
 * This tool makes text more engaging, clear, and appropriate for professional presentations.
 * 
 * PARAMETERS:
 * - enhancement_type: "professional", "engaging", "concise", "academic", "creative"
 * - scope: "current_slide", "selected_text", "entire_presentation"
 * 
 * USE CASES:
 * - User says "make this better", "improve this text", "make it more professional"
 * - User wants to enhance clarity or engagement
 * - User needs help with tone or style
 */
function slide_enhance_text(enhancement_type = 'professional', scope = 'current_slide') {
  try {
    console.log(`Starting text enhancement: ${enhancement_type} (scope: ${scope})`);
    
    const presentation = SlidesApp.getActivePresentation();
    const slides = presentation.getSlides();
    const aiManager = new AIManager();
    
    let processedSlides = 0;
    let totalEnhancements = 0;
    let enhancementResults = [];
    
    // Determine slides to process
    let slidesToProcess = [];
    switch (scope) {
      case 'current_slide':
        const selection = SlidesApp.getActivePresentation().getSelection();
        if (selection && selection.getSelectionType() === SlidesApp.SelectionType.CURRENT_PAGE) {
          slidesToProcess = [selection.getCurrentPage()];
        } else {
          slidesToProcess = [slides[0]];
        }
        break;
      case 'entire_presentation':
        slidesToProcess = slides.slice(0, 10);
        break;
      default:
        slidesToProcess = [slides[0]];
    }
    
    for (const slide of slidesToProcess) {
      const slideIndex = slides.indexOf(slide);
      const shapes = slide.getShapes();
      let slideEnhancements = 0;
      
      for (const shape of shapes) {
        try {
          const textRange = shape.getText();
          if (textRange && textRange.asString().trim().length > 10) {
            const originalText = textRange.asString();
            
            const enhancementPrompt = `You are a presentation expert specializing in ${enhancement_type} communication.

Improve this presentation text to be more ${enhancement_type}:

Original: "${originalText}"

Enhancement guidelines for ${enhancement_type}:
${getEnhancementGuidelines(enhancement_type)}

Provide ONLY the improved text without explanations:`;
            
            const enhancedText = aiManager.callGemini(enhancementPrompt, 400);
            
            if (enhancedText && enhancedText.trim() !== originalText.trim()) {
              textRange.setText(enhancedText.trim());
              
              enhancementResults.push({
                slide_number: slideIndex + 1,
                original: originalText.substring(0, 50) + '...',
                enhanced: enhancedText.substring(0, 50) + '...',
                enhancement_type: enhancement_type,
                status: 'success'
              });
              
              slideEnhancements++;
              totalEnhancements++;
              
              Utilities.sleep(500);
            }
          }
        } catch (shapeError) {
          console.log(`Shape processing error: ${shapeError.message}`);
        }
      }
      
      if (slideEnhancements > 0) {
        processedSlides++;
      }
    }
    
    return {
      success: true,
      summary: {
        enhancement_type: enhancement_type,
        scope: scope,
        slides_processed: processedSlides,
        total_enhancements: totalEnhancements
      },
      results: enhancementResults,
      user_message: `✅ Text enhancement complete! Enhanced ${totalEnhancements} text elements with ${enhancement_type} improvements.`,
      agent_guidance: {
        next_actions: [
          "Tell user about successful enhancements",
          "If user wants different style, call this tool again with different enhancement_type",
          "If user wants to undo, use slide_revert_changes()"
        ]
      }
    };
    
  } catch (error) {
    return {
      success: false,
      error: `Enhancement failed: ${error.message}`,
      agent_guidance: "Explain enhancement failed and suggest trying again or different enhancement type"
    };
  }
}

/**
 * TOOL: slide_find_replace
 * 
 * DESCRIPTION FOR AGENTS:
 * Finds and replaces text across slides with options for exact match or smart replacement.
 * 
 * PARAMETERS:
 * - find_text (required): Text to search for
 * - replace_text (required): Text to replace with  
 * - scope: "current_slide" or "entire_presentation"
 * - match_case: true/false for case sensitivity
 */
function slide_find_replace(find_text, replace_text, scope = 'current_slide', match_case = false) {
  try {
    if (!find_text || !replace_text) {
      return {
        success: false,
        error: "Both find_text and replace_text are required",
        agent_guidance: "Ask user what text they want to find and what to replace it with"
      };
    }
    
    const presentation = SlidesApp.getActivePresentation();
    const slides = presentation.getSlides();
    
    let slidesToProcess = scope === 'entire_presentation' ? slides : [slides[0]];
    let totalReplacements = 0;
    let replacementResults = [];
    
    for (const slide of slidesToProcess) {
      const slideIndex = slides.indexOf(slide);
      const shapes = slide.getShapes();
      
      for (const shape of shapes) {
        try {
          const textRange = shape.getText();
          if (textRange) {
            let text = textRange.asString();
            let originalText = text;
            
            // Perform replacement based on case sensitivity
            const searchText = match_case ? find_text : find_text.toLowerCase();
            const compareText = match_case ? text : text.toLowerCase();
            
            if (compareText.includes(searchText)) {
              if (match_case) {
                text = text.replaceAll(find_text, replace_text);
              } else {
                const regex = new RegExp(find_text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
                text = text.replace(regex, replace_text);
              }
              
              if (text !== originalText) {
                textRange.setText(text);
                totalReplacements++;
                
                replacementResults.push({
                  slide_number: slideIndex + 1,
                  replacements_made: (originalText.match(new RegExp(find_text, 'gi')) || []).length,
                  status: 'success'
                });
              }
            }
          }
        } catch (shapeError) {
          console.log(`Shape processing error: ${shapeError.message}`);
        }
      }
    }
    
    return {
      success: true,
      summary: {
        find_text: find_text,
        replace_text: replace_text,
        scope: scope,
        total_replacements: totalReplacements,
        match_case: match_case
      },
      results: replacementResults,
      user_message: `✅ Find & Replace complete! Made ${totalReplacements} replacements of "${find_text}" with "${replace_text}".`,
      agent_guidance: {
        next_actions: [
          "Inform user about successful replacements",
          "If user wants to undo, use slide_revert_changes()"
        ]
      }
    };
    
  } catch (error) {
    return {
      success: false,
      error: `Find & Replace failed: ${error.message}`,
      agent_guidance: "Tell user the operation failed and suggest checking their search terms"
    };
  }
}

/**
 * Helper function that provides enhancement guidelines for different styles
 */
function getEnhancementGuidelines(type) {
  const guidelines = {
    'professional': '- Use clear, confident language\n- Eliminate filler words\n- Make points concise and impactful\n- Use active voice\n- Maintain formal tone',
    'engaging': '- Use compelling language\n- Add rhetorical questions\n- Include vivid examples\n- Create emotional connection\n- Use dynamic verbs',
    'concise': '- Remove unnecessary words\n- Combine related ideas\n- Use bullet points\n- Eliminate redundancy\n- Focus on key messages',
    'academic': '- Use scholarly terminology\n- Include precise qualifiers\n- Maintain objective tone\n- Reference methodologies\n- Use formal structure',
    'creative': '- Use metaphors and analogies\n- Add storytelling elements\n- Include surprising insights\n- Use varied sentence structure\n- Create memorable phrases'
  };
  
  return guidelines[type] || guidelines['professional'];
}
