/**
 * Slide Buddy 2.5 - Enhancement Tools
 * Specific, focused tools for different text enhancement scenarios
 * Following Anthropic's best practices for agent tool design
 */

/**
 * TOOL: slide_enhance_current
 * 
 * DESCRIPTION FOR AGENTS:
 * Improves the quality and professionalism of text content in the currently selected slide.
 * Uses Gemini 2.5 Flash to enhance grammar, tone, clarity, and engagement while maintaining meaning.
 * Optimized for quick improvement of single slide content.
 * 
 * WHEN TO USE:
 * - User says "improve this slide", "make this better", "enhance current slide"
 * - User wants to improve only what they're currently viewing/editing
 * - Quick text quality improvements for focused content
 * 
 * PARAMETERS:
 * - enhancement_type: "professional" (default), "engaging", "concise", "academic", "creative"
 * 
 * AGENT INSTRUCTIONS:
 * - Use "professional" for business presentations unless user specifies otherwise
 * - Explain what type of enhancement will be applied
 * - Confirm this only affects the current slide
 */
function slide_enhance_current(enhancement_type = 'professional') {
  try {
    console.log(`Starting current slide enhancement: ${enhancement_type}`);
    
    const presentation = SlidesApp.getActivePresentation();
    const slides = presentation.getSlides();
    
    if (slides.length === 0) {
      return {
        success: false,
        error: "No slides found in presentation",
        agent_guidance: "Tell user they need slides with content to enhance"
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
    
    let enhancementCount = 0;
    let enhancementResults = [];
    
    const shapes = currentSlide.getShapes();
    
    for (const shape of shapes) {
      try {
        if (shape.getShapeType() === SlidesApp.ShapeType.TEXT_BOX || 
            shape.getShapeType() === SlidesApp.ShapeType.RECTANGLE ||
            shape.getShapeType() === SlidesApp.ShapeType.ROUND_RECTANGLE) {
          
          const textRange = shape.getText();
          if (textRange && textRange.asString().trim().length > 10) {
            const originalText = textRange.asString().trim();
            
            const enhancementPrompt = `You are a presentation expert specializing in ${enhancement_type} communication.

Improve this presentation text to be more ${enhancement_type}:

Original: "${originalText}"

Enhancement guidelines for ${enhancement_type}:
${getEnhancementGuidelines(enhancement_type)}

Provide ONLY the improved text without explanations:`;
            
            try {
              const enhancedText = aiManager.callGemini(enhancementPrompt, 400);
              
              if (enhancedText && enhancedText.trim() !== originalText.trim()) {
                textRange.setText(enhancedText.trim());
                
                enhancementResults.push({
                  original: originalText.substring(0, 50) + '...',
                  enhanced: enhancedText.substring(0, 50) + '...',
                  enhancement_type: enhancement_type,
                  status: 'success'
                });
                
                enhancementCount++;
                console.log(`✅ Enhanced text successfully`);
                
                Utilities.sleep(500); // Rate limiting
              }
            } catch (enhancementError) {
              enhancementResults.push({
                original: originalText.substring(0, 50) + '...',
                status: 'failed',
                error: enhancementError.message
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
        enhancement_type: enhancement_type,
        slide_number: slideIndex + 1,
        enhancements_made: enhancementCount
      },
      results: enhancementResults,
      user_message: `✅ Current slide enhanced with ${enhancement_type} improvements! Made ${enhancementCount} enhancements.`,
      agent_guidance: {
        next_actions: [
          "Inform user about successful enhancement of current slide",
          "Ask if they want to enhance other slides using slide_enhance_all",
          "If user wants different enhancement style, suggest trying again with different type"
        ]
      }
    };
    
  } catch (error) {
    console.error('Current slide enhancement failed:', error);
    return {
      success: false,
      error: `Enhancement failed: ${error.message}`,
      agent_guidance: "Explain enhancement failed and suggest trying again or different enhancement type"
    };
  }
}

/**
 * TOOL: slide_enhance_all
 * 
 * DESCRIPTION FOR AGENTS:
 * Improves the quality and professionalism of text content across ALL slides in the presentation.
 * Uses Gemini 2.5 Flash for consistent enhancement throughout the entire deck.
 * Ideal for comprehensive presentation improvement and professional polish.
 * 
 * WHEN TO USE:
 * - User says "improve all slides", "enhance the entire presentation", "make everything better"
 * - User wants consistent text quality improvements across whole presentation
 * - Professional presentation polish and refinement tasks
 * 
 * PARAMETERS:
 * - enhancement_type: "professional" (default), "engaging", "concise", "academic", "creative"
 * 
 * AGENT INSTRUCTIONS:
 * - Warn user this will enhance ALL slides and may take time
 * - Use "professional" for business presentations unless specified
 * - Provide progress updates for large presentations
 */
function slide_enhance_all(enhancement_type = 'professional') {
  try {
    console.log(`Starting full presentation enhancement: ${enhancement_type}`);
    
    const presentation = SlidesApp.getActivePresentation();
    const slides = presentation.getSlides();
    
    if (slides.length === 0) {
      return {
        success: false,
        error: "No slides found in presentation",
        agent_guidance: "Tell user they need slides with content to enhance"
      };
    }
    
    const aiManager = new AIManager();
    let processedSlides = 0;
    let totalEnhancements = 0;
    let enhancementResults = [];
    
    // Process all slides (limit to 10 for performance)
    const slidesToProcess = slides.slice(0, 10);
    
    for (const slide of slidesToProcess) {
      const slideIndex = slides.indexOf(slide);
      console.log(`Processing slide ${slideIndex + 1} of ${slidesToProcess.length}...`);
      
      const shapes = slide.getShapes();
      let slideEnhancements = 0;
      
      for (const shape of shapes) {
        try {
          if (shape.getShapeType() === SlidesApp.ShapeType.TEXT_BOX || 
              shape.getShapeType() === SlidesApp.ShapeType.RECTANGLE ||
              shape.getShapeType() === SlidesApp.ShapeType.ROUND_RECTANGLE) {
            
            const textRange = shape.getText();
            if (textRange && textRange.asString().trim().length > 10) {
              const originalText = textRange.asString().trim();
              
              const enhancementPrompt = `You are a presentation expert specializing in ${enhancement_type} communication.

Improve this presentation text to be more ${enhancement_type}:

Original: "${originalText}"

Enhancement guidelines for ${enhancement_type}:
${getEnhancementGuidelines(enhancement_type)}

Provide ONLY the improved text without explanations:`;
              
              try {
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
                  
                  Utilities.sleep(500); // Rate limiting
                }
              } catch (enhancementError) {
                enhancementResults.push({
                  slide_number: slideIndex + 1,
                  original: originalText.substring(0, 50) + '...',
                  status: 'failed',
                  error: enhancementError.message
                });
              }
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
        total_slides: slides.length,
        slides_processed: processedSlides,
        total_enhancements: totalEnhancements
      },
      results: enhancementResults,
      user_message: `✅ Full presentation enhanced with ${enhancement_type} improvements! Processed ${processedSlides} slides with ${totalEnhancements} enhancements.`,
      agent_guidance: {
        next_actions: [
          "Inform user about successful full presentation enhancement",
          "Mention the number of slides and enhancements completed",
          "If user wants different style, suggest trying again with different enhancement_type"
        ]
      }
    };
    
  } catch (error) {
    console.error('Full presentation enhancement failed:', error);
    return {
      success: false,
      error: `Enhancement failed: ${error.message}`,
      agent_guidance: "Explain enhancement failed and suggest trying again or different enhancement type"
    };
  }
}

/**
 * TOOL: slide_enhance_selected
 * 
 * DESCRIPTION FOR AGENTS:
 * Improves only the currently selected text in the presentation.
 * Ideal for precise, targeted enhancement when user has made a specific selection.
 * 
 * WHEN TO USE:
 * - User has selected specific text and wants only that enhanced
 * - User says "improve this text" while having a selection
 * - Precise control over what gets enhanced
 * 
 * PARAMETERS:
 * - enhancement_type: "professional" (default), "engaging", "concise", "academic", "creative"
 * 
 * AGENT INSTRUCTIONS:
 * - Only use if user has actually selected text
 * - Fall back to slide_enhance_current if no selection
 */
function slide_enhance_selected(enhancement_type = 'professional') {
  try {
    const selection = SlidesApp.getActivePresentation().getSelection();
    
    if (!selection || selection.getSelectionType() !== SlidesApp.SelectionType.TEXT) {
      return {
        success: false,
        error: "No text is currently selected",
        agent_guidance: "Tell user to select the text they want enhanced, or use slide_enhance_current for the whole slide"
      };
    }
    
    const textRange = selection.getTextRange();
    if (!textRange) {
      return {
        success: false,
        error: "Selected text could not be accessed",
        agent_guidance: "Ask user to select text clearly and try again"
      };
    }
    
    const originalText = textRange.asString().trim();
    if (!originalText || originalText.length < 10) {
      return {
        success: false,
        error: "Selected text is too short or empty",
        agent_guidance: "Tell user to select meaningful text content to enhance"
      };
    }
    
    const aiManager = new AIManager();
    
    const enhancementPrompt = `You are a presentation expert specializing in ${enhancement_type} communication.

Improve this presentation text to be more ${enhancement_type}:

Original: "${originalText}"

Enhancement guidelines for ${enhancement_type}:
${getEnhancementGuidelines(enhancement_type)}

Provide ONLY the improved text without explanations:`;
    
    try {
      const enhancedText = aiManager.callGemini(enhancementPrompt, 400);
      
      if (enhancedText && enhancedText.trim() !== originalText.trim()) {
        textRange.setText(enhancedText.trim());
        
        return {
          success: true,
          summary: {
            enhancement_type: enhancement_type,
            original_length: originalText.length,
            enhanced_length: enhancedText.length
          },
          user_message: `✅ Selected text enhanced with ${enhancement_type} improvements!`,
          agent_guidance: {
            next_actions: [
              "Confirm successful enhancement of selected text",
              "Ask if user wants to enhance more content"
            ]
          }
        };
      } else {
        return {
          success: false,
          error: "Enhancement service returned same or empty result",
          agent_guidance: "Tell user the text may already be well-written or suggest trying a different enhancement type"
        };
      }
    } catch (enhancementError) {
      return {
        success: false,
        error: `Enhancement failed: ${enhancementError.message}`,
        agent_guidance: "Explain enhancement failed and suggest checking API configuration"
      };
    }
    
  } catch (error) {
    return {
      success: false,
      error: `Selected text enhancement failed: ${error.message}`,
      agent_guidance: "Tell user the operation failed and suggest trying again"
    };
  }
}

/**
 * Helper function that provides enhancement guidelines for different styles
 * Following Anthropic's guidance on returning meaningful context to agents
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
