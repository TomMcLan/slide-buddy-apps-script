/**
 * Slide Buddy 2.5 - Context & Analysis Tools
 * Functions for reading and understanding slide context, user selection, and presentation structure
 */

/**
 * TOOL: slide_context_read
 * 
 * DESCRIPTION FOR AGENTS:
 * Reads and analyzes the current context of the user's Google Slides presentation.
 * This includes their current selection, slide content, and overall presentation structure.
 * 
 * RETURNS:
 * - success: boolean
 * - context: { presentation_overview, user_selection, current_slide_analysis, suggested_actions }
 * - agent_guidance: { next_steps }
 * 
 * AGENT INSTRUCTIONS:
 * Always call this function first to understand what the user is working with before taking any action.
 */
function slide_context_read() {
  try {
    const presentation = SlidesApp.getActivePresentation();
    const slides = presentation.getSlides();
    
    // Get current selection context
    const selection = SlidesApp.getActivePresentation().getSelection();
    let selectionContext = {
      type: 'none',
      details: 'No specific selection detected'
    };
    
    if (selection) {
      const selectionType = selection.getSelectionType();
      switch (selectionType) {
        case SlidesApp.SelectionType.CURRENT_PAGE:
          const currentSlide = selection.getCurrentPage();
          const slideIndex = slides.indexOf(currentSlide);
          selectionContext = {
            type: 'slide',
            slide_number: slideIndex + 1,
            slide_title: extractSlideTitle(currentSlide),
            total_slides: slides.length,
            details: `User is viewing slide ${slideIndex + 1} of ${slides.length}`
          };
          break;
        case SlidesApp.SelectionType.PAGE_ELEMENT:
          const elements = selection.getPageElementRange().getPageElements();
          selectionContext = {
            type: 'elements',
            element_count: elements.length,
            details: `User has selected ${elements.length} element(s) on the slide`,
            element_types: elements.map(el => el.getPageElementType().toString())
          };
          break;
        case SlidesApp.SelectionType.TEXT:
          const textRange = selection.getTextRange();
          selectionContext = {
            type: 'text',
            selected_text: textRange.asString().substring(0, 100),
            details: 'User has selected specific text',
            character_count: textRange.asString().length
          };
          break;
      }
    }
    
    // Analyze current slide content
    let currentSlideAnalysis = null;
    if (selectionContext.slide_number) {
      const slide = slides[selectionContext.slide_number - 1];
      currentSlideAnalysis = analyzeSlideContent(slide);
    }
    
    // Build presentation overview
    const presentationOverview = {
      title: presentation.getName(),
      total_slides: slides.length,
      slide_structure: slides.slice(0, 5).map((slide, index) => ({
        slide_number: index + 1,
        title: extractSlideTitle(slide),
        content_summary: getSlideContentSummary(slide)
      }))
    };
    
    return {
      success: true,
      context: {
        presentation_overview: presentationOverview,
        user_selection: selectionContext,
        current_slide_analysis: currentSlideAnalysis,
        suggested_actions: getSuggestedActionsFromContext(selectionContext, currentSlideAnalysis)
      },
      agent_guidance: {
        next_steps: [
          "Analyze the user's request against this context",
          "If user wants translation, use slide_translate_content()",
          "If user wants enhancement, use slide_enhance_text()",
          "If user wants to find/replace, use slide_find_replace()"
        ]
      }
    };
    
  } catch (error) {
    return {
      success: false,
      error: `Context reading failed: ${error.message}`,
      agent_guidance: {
        fallback: "Ask user to clarify what they want to do and which slide/content they're referring to"
      }
    };
  }
}

/**
 * Analyzes the content and structure of a specific slide
 */
function analyzeSlideContent(slide) {
  try {
    const shapes = slide.getShapes();
    let textElements = [];
    let hasImages = false;
    let hasCharts = false;
    
    for (const shape of shapes) {
      const shapeType = shape.getPageElementType();
      
      if (shapeType === SlidesApp.PageElementType.SHAPE && shape.getText()) {
        const text = shape.getText().asString();
        if (text.trim()) {
          textElements.push({
            text: text.substring(0, 100),
            length: text.length,
            type: detectTextType(text)
          });
        }
      } else if (shapeType === SlidesApp.PageElementType.IMAGE) {
        hasImages = true;
      } else if (shapeType === SlidesApp.PageElementType.CHART) {
        hasCharts = true;
      }
    }
    
    return {
      text_elements: textElements,
      has_images: hasImages,
      has_charts: hasCharts,
      slide_type: detectSlideType(slide),
      content_density: textElements.length > 5 ? 'high' : textElements.length > 2 ? 'medium' : 'low'
    };
  } catch (error) {
    return { error: error.message };
  }
}

/**
 * Gets a brief summary of slide content
 */
function getSlideContentSummary(slide) {
  try {
    const shapes = slide.getShapes();
    let allText = '';
    
    for (const shape of shapes) {
      if (shape.getText()) {
        allText += shape.getText().asString() + ' ';
      }
    }
    
    return allText.substring(0, 150).trim() + (allText.length > 150 ? '...' : '');
  } catch (error) {
    return 'Content analysis failed';
  }
}

/**
 * Suggests actions based on current context
 */
function getSuggestedActionsFromContext(selectionContext, slideAnalysis) {
  let suggestions = [];
  
  if (selectionContext.type === 'text') {
    suggestions.push('translate selected text', 'enhance selected text', 'find and replace similar text');
  } else if (selectionContext.type === 'slide') {
    suggestions.push('translate entire slide', 'enhance slide content', 'improve slide design');
  } else {
    suggestions.push('analyze presentation content', 'translate presentation', 'enhance text quality');
  }
  
  if (slideAnalysis && slideAnalysis.content_density === 'high') {
    suggestions.push('simplify content', 'break into multiple slides');
  }
  
  return suggestions;
}

/**
 * Extracts the title from a slide (usually the first text element)
 */
function extractSlideTitle(slide) {
  try {
    const elements = slide.getPageElements();
    for (const element of elements) {
      if (element.getPageElementType() === SlidesApp.PageElementType.SHAPE) {
        const shape = element.asShape();
        const text = shape.getText().asString().trim();
        if (text && text.length < 100) { // Likely a title
          return text;
        }
      }
    }
    return 'Untitled Slide';
  } catch (error) {
    return 'Error reading title';
  }
}

/**
 * Detects the type of slide based on its content structure
 */
function detectSlideType(slide) {
  try {
    const elements = slide.getPageElements();
    let hasTitle = false;
    let hasBullets = false;
    let hasChart = false;
    let hasImage = false;
    
    elements.forEach(element => {
      const type = element.getPageElementType();
      if (type === SlidesApp.PageElementType.SHAPE) {
        const text = element.asShape().getText().asString();
        if (text.length < 50) hasTitle = true;
        if (text.includes('•') || text.includes('-')) hasBullets = true;
      } else if (type === SlidesApp.PageElementType.SHEETCHART) {
        hasChart = true;
      } else if (type === SlidesApp.PageElementType.IMAGE) {
        hasImage = true;
      }
    });
    
    if (hasChart) return 'chart_slide';
    if (hasImage && hasTitle) return 'image_slide';
    if (hasBullets) return 'bullet_slide';
    if (hasTitle) return 'title_slide';
    return 'content_slide';
  } catch (error) {
    return 'unknown';
  }
}

/**
 * Detects the type of text content
 */
function detectTextType(text) {
  const trimmed = text.trim();
  if (trimmed.length < 50 && !trimmed.includes('.')) {
    return 'title';
  } else if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.includes('\n•')) {
    return 'bullet_list';
  } else if (trimmed.length > 200) {
    return 'paragraph';
  } else {
    return 'content';
  }
}

/**
 * Extracts text from an element
 */
function extractElementText(element) {
  try {
    if (element.getPageElementType() === SlidesApp.PageElementType.SHAPE) {
      return element.asShape().getText().asString().substring(0, 100);
    }
    return '';
  } catch (error) {
    return '';
  }
}

/**
 * Detects the role of an element (title, content, etc.)
 */
function detectElementRole(element) {
  try {
    const type = element.getPageElementType();
    if (type === SlidesApp.PageElementType.SHAPE) {
      const text = element.asShape().getText().asString();
      if (text.length < 50) return 'title';
      if (text.includes('•') || text.includes('-')) return 'bullet_list';
      return 'text_block';
    } else if (type === SlidesApp.PageElementType.IMAGE) {
      return 'image';
    } else if (type === SlidesApp.PageElementType.SHEETCHART) {
      return 'chart';
    }
    return 'other';
  } catch (error) {
    return 'unknown';
  }
}

/**
 * Gets the position of an element on the slide
 */
function getElementPosition(element) {
  try {
    const transform = element.getTransform();
    return {
      x: transform.getTranslateX(),
      y: transform.getTranslateY()
    };
  } catch (error) {
    return { x: 0, y: 0 };
  }
}

/**
 * Builds a structural overview of the entire presentation
 */
function buildPresentationStructure(presentation) {
  try {
    const slides = presentation.getSlides();
    return {
      totalSlides: slides.length,
      slideStructure: slides.map((slide, index) => ({
        slideNumber: index + 1,
        slideId: slide.getObjectId(),
        title: extractSlideTitle(slide),
        type: detectSlideType(slide)
      }))
    };
  } catch (error) {
    return { error: error.message };
  }
}

/**
 * Gets details about currently selected elements
 */
function getSelectedElements(selection) {
  const elements = [];
  
  try {
    if (selection && selection.getSelectionType() === SlidesApp.SelectionType.PAGE_ELEMENT) {
      const pageElements = selection.getPageElementRange().getPageElements();
      
      pageElements.forEach(element => {
        elements.push({
          id: element.getObjectId(),
          type: element.getPageElementType(),
          role: detectElementRole(element),
          text: extractElementText(element),
          position: getElementPosition(element)
        });
      });
    }
  } catch (error) {
    console.error('Error getting selected elements:', error);
  }
  
  return elements;
}
