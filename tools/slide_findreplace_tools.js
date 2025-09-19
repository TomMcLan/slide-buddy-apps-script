/**
 * Slide Buddy 2.5 - Find & Replace Tools
 * Specific, focused tools for different text replacement scenarios
 * Following Anthropic's best practices for agent tool design
 */

/**
 * TOOL: slide_replace_current
 * 
 * DESCRIPTION FOR AGENTS:
 * Finds and replaces text within the currently selected slide only.
 * Ideal for quick, focused text changes without affecting the entire presentation.
 * 
 * WHEN TO USE:
 * - User says "change X to Y in this slide", "replace X with Y here"
 * - User wants to modify text only in current slide
 * - Quick, localized text corrections or updates
 * 
 * PARAMETERS:
 * - find_text (required): Text to search for
 * - replace_text (required): Text to replace with
 * - match_case (optional): true/false for case sensitivity (default: false)
 * 
 * AGENT INSTRUCTIONS:
 * - Always confirm what text to find and replace if unclear
 * - Explain this only affects the current slide
 * - Use case-insensitive search unless user specifically requests case matching
 */
function slide_replace_current(find_text, replace_text, match_case = false) {
  try {
    if (!find_text || !replace_text) {
      return {
        success: false,
        error: "Both find_text and replace_text are required",
        agent_guidance: "Ask user: 'What text should I find and what should I replace it with in this slide?'"
      };
    }
    
    console.log(`Starting current slide find & replace: "${find_text}" → "${replace_text}"`);
    
    const presentation = SlidesApp.getActivePresentation();
    const slides = presentation.getSlides();
    
    if (slides.length === 0) {
      return {
        success: false,
        error: "No slides found in presentation",
        agent_guidance: "Tell user they need slides with content to modify"
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
    let replacementCount = 0;
    let replacementResults = [];
    
    const shapes = currentSlide.getShapes();
    
    for (const shape of shapes) {
      try {
        if (shape.getShapeType() === SlidesApp.ShapeType.TEXT_BOX || 
            shape.getShapeType() === SlidesApp.ShapeType.RECTANGLE ||
            shape.getShapeType() === SlidesApp.ShapeType.ROUND_RECTANGLE) {
          
          const textRange = shape.getText();
          if (textRange) {
            let text = textRange.asString();
            const originalText = text;
            
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
                const instancesReplaced = (originalText.match(new RegExp(find_text, match_case ? 'g' : 'gi')) || []).length;
                replacementCount += instancesReplaced;
                
                replacementResults.push({
                  shape_number: shapes.indexOf(shape) + 1,
                  instances_replaced: instancesReplaced,
                  status: 'success'
                });
              }
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
        find_text: find_text,
        replace_text: replace_text,
        slide_number: slideIndex + 1,
        total_replacements: replacementCount,
        match_case: match_case
      },
      results: replacementResults,
      user_message: `Find & Replace Complete! Current slide updated with ${replacementCount} replacements of "${find_text}" with "${replace_text}". Please review the changes to ensure they look correct.`,
      agent_guidance: {
        next_actions: [
          "Inform user about successful replacements in current slide",
          "Ask if they want to replace text in other slides using slide_replace_all",
          "If user wants to undo, suggest using slide_revert_changes"
        ]
      }
    };
    
  } catch (error) {
    console.error('Current slide find & replace failed:', error);
    return {
      success: false,
      error: `Find & Replace failed: ${error.message}`,
      agent_guidance: "Tell user the operation failed and suggest checking their search terms"
    };
  }
}

/**
 * TOOL: slide_replace_all
 * 
 * DESCRIPTION FOR AGENTS:
 * Finds and replaces text across ALL slides in the presentation.
 * Ideal for comprehensive text updates, rebranding, or global corrections throughout the deck.
 * 
 * WHEN TO USE:
 * - User says "change X to Y everywhere", "replace X with Y in all slides"
 * - Global text updates like company names, product names, or terms
 * - Comprehensive find and replace operations across entire presentation
 * 
 * PARAMETERS:
 * - find_text (required): Text to search for
 * - replace_text (required): Text to replace with
 * - match_case (optional): true/false for case sensitivity (default: false)
 * 
 * AGENT INSTRUCTIONS:
 * - Warn user this will search and replace across ALL slides
 * - Confirm find and replace text before proceeding
 * - Explain how many replacements were made across how many slides
 */
function slide_replace_all(find_text, replace_text, match_case = false) {
  try {
    if (!find_text || !replace_text) {
      return {
        success: false,
        error: "Both find_text and replace_text are required",
        agent_guidance: "Ask user: 'What text should I find and what should I replace it with across all slides?'"
      };
    }
    
    console.log(`Starting full presentation find & replace: "${find_text}" → "${replace_text}"`);
    
    const presentation = SlidesApp.getActivePresentation();
    const slides = presentation.getSlides();
    
    if (slides.length === 0) {
      return {
        success: false,
        error: "No slides found in presentation",
        agent_guidance: "Tell user they need slides with content to modify"
      };
    }
    
    let totalReplacements = 0;
    let slidesAffected = 0;
    let replacementResults = [];
    
    // Process all slides
    for (const slide of slides) {
      const slideIndex = slides.indexOf(slide);
      const shapes = slide.getShapes();
      let slideReplacements = 0;
      
      for (const shape of shapes) {
        try {
          if (shape.getShapeType() === SlidesApp.ShapeType.TEXT_BOX || 
              shape.getShapeType() === SlidesApp.ShapeType.RECTANGLE ||
              shape.getShapeType() === SlidesApp.ShapeType.ROUND_RECTANGLE) {
            
            const textRange = shape.getText();
            if (textRange) {
              let text = textRange.asString();
              const originalText = text;
              
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
                  const instancesReplaced = (originalText.match(new RegExp(find_text, match_case ? 'g' : 'gi')) || []).length;
                  slideReplacements += instancesReplaced;
                  totalReplacements += instancesReplaced;
                }
              }
            }
          }
        } catch (shapeError) {
          console.log(`Shape processing error: ${shapeError.message}`);
        }
      }
      
      if (slideReplacements > 0) {
        slidesAffected++;
        replacementResults.push({
          slide_number: slideIndex + 1,
          replacements_made: slideReplacements,
          status: 'success'
        });
      }
    }
    
    return {
      success: true,
      summary: {
        find_text: find_text,
        replace_text: replace_text,
        total_slides: slides.length,
        slides_affected: slidesAffected,
        total_replacements: totalReplacements,
        match_case: match_case
      },
      results: replacementResults,
      user_message: `Find & Replace Complete! Full presentation updated with ${totalReplacements} replacements of "${find_text}" with "${replace_text}" across ${slidesAffected} slides. Please review the changes to ensure they look correct.`,
      agent_guidance: {
        next_actions: [
          "Inform user about successful replacements across all slides",
          "Mention the number of slides affected and total replacements made",
          "If user wants to undo, suggest using slide_revert_changes"
        ]
      }
    };
    
  } catch (error) {
    console.error('Full presentation find & replace failed:', error);
    return {
      success: false,
      error: `Find & Replace failed: ${error.message}`,
      agent_guidance: "Tell user the operation failed and suggest checking their search terms"
    };
  }
}

/**
 * TOOL: slide_replace_smart
 * 
 * DESCRIPTION FOR AGENTS:
 * Performs intelligent find and replace with context awareness and suggestions.
 * Uses AI to understand context and provide smart replacement options.
 * 
 * WHEN TO USE:
 * - User wants context-aware replacements
 * - Complex text transformations that need understanding
 * - When simple find/replace isn't sufficient
 * 
 * PARAMETERS:
 * - find_text (required): Text or concept to search for
 * - replace_text (required): Text or concept to replace with
 * - scope: "current_slide" (default) or "entire_presentation"
 * 
 * AGENT INSTRUCTIONS:
 * - Use this for complex replacements that need context understanding
 * - Explain that this uses AI for intelligent context-aware replacement
 */
function slide_replace_smart(find_text, replace_text, scope = 'current_slide') {
  try {
    if (!find_text || !replace_text) {
      return {
        success: false,
        error: "Both find_text and replace_text are required",
        agent_guidance: "Ask user: 'What text or concept should I find and what should I replace it with?'"
      };
    }
    
    console.log(`Starting smart find & replace: "${find_text}" → "${replace_text}" (scope: ${scope})`);
    
    const presentation = SlidesApp.getActivePresentation();
    const slides = presentation.getSlides();
    
    if (slides.length === 0) {
      return {
        success: false,
        error: "No slides found in presentation",
        agent_guidance: "Tell user they need slides with content to modify"
      };
    }
    
    // Determine slides to process
    let slidesToProcess = [];
    if (scope === 'entire_presentation') {
      slidesToProcess = slides;
    } else {
      const selection = SlidesApp.getActivePresentation().getSelection();
      if (selection && selection.getSelectionType() === SlidesApp.SelectionType.CURRENT_PAGE) {
        slidesToProcess = [selection.getCurrentPage()];
      } else {
        slidesToProcess = [slides[0]];
      }
    }
    
    const aiManager = new AIManager();
    let totalReplacements = 0;
    let slidesAffected = 0;
    let replacementResults = [];
    
    for (const slide of slidesToProcess) {
      const slideIndex = slides.indexOf(slide);
      const shapes = slide.getShapes();
      let slideReplacements = 0;
      
      for (const shape of shapes) {
        try {
          if (shape.getShapeType() === SlidesApp.ShapeType.TEXT_BOX || 
              shape.getShapeType() === SlidesApp.ShapeType.RECTANGLE ||
              shape.getShapeType() === SlidesApp.ShapeType.ROUND_RECTANGLE) {
            
            const textRange = shape.getText();
            if (textRange && textRange.asString().trim()) {
              const originalText = textRange.asString().trim();
              
              // Check if text contains the concept we're looking for
              const containsTarget = originalText.toLowerCase().includes(find_text.toLowerCase());
              
              if (containsTarget) {
                const smartReplacePrompt = `You are a smart text replacement assistant for presentations.

Replace all instances of "${find_text}" with "${replace_text}" in this text, considering context and maintaining natural flow:

Original text: "${originalText}"

Requirements:
- Replace "${find_text}" with "${replace_text}" intelligently
- Maintain natural sentence structure and flow
- Consider context and grammar
- Preserve formatting and style
- Keep professional presentation tone

Provide ONLY the updated text without explanations:`;
                
                try {
                  const updatedText = aiManager.callGemini(smartReplacePrompt, 400);
                  
                  if (updatedText && updatedText.trim() !== originalText.trim()) {
                    textRange.setText(updatedText.trim());
                    slideReplacements++;
                    totalReplacements++;
                    
                    replacementResults.push({
                      slide_number: slideIndex + 1,
                      original: originalText.substring(0, 50) + '...',
                      updated: updatedText.substring(0, 50) + '...',
                      status: 'success'
                    });
                    
                    Utilities.sleep(500); // Rate limiting
                  }
                } catch (replaceError) {
                  replacementResults.push({
                    slide_number: slideIndex + 1,
                    original: originalText.substring(0, 50) + '...',
                    status: 'failed',
                    error: replaceError.message
                  });
                }
              }
            }
          }
        } catch (shapeError) {
          console.log(`Shape processing error: ${shapeError.message}`);
        }
      }
      
      if (slideReplacements > 0) {
        slidesAffected++;
      }
    }
    
    return {
      success: true,
      summary: {
        find_text: find_text,
        replace_text: replace_text,
        scope: scope,
        slides_affected: slidesAffected,
        total_replacements: totalReplacements
      },
      results: replacementResults,
      user_message: `Find & Replace Complete! Smart replacement updated ${totalReplacements} instances of "${find_text}" with "${replace_text}" across ${slidesAffected} slides. Please review the changes to ensure they look correct.`,
      agent_guidance: {
        next_actions: [
          "Inform user about successful smart replacements",
          "Explain that AI was used for context-aware replacement",
          "If user wants to undo, suggest using slide_revert_changes"
        ]
      }
    };
    
  } catch (error) {
    console.error('Smart find & replace failed:', error);
    return {
      success: false,
      error: `Smart find & replace failed: ${error.message}`,
      agent_guidance: "Tell user the operation failed and suggest trying regular find & replace instead"
    };
  }
}
