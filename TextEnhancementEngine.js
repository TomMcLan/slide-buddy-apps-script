/**
 * Text Enhancement Engine - Real text improvement functionality for Slide Bro
 * Replaces all mock text enhancement with actual Gemini AI-powered improvements
 */

class TextEnhancementEngine {
  constructor() {
    this.aiManager = new AIManager();
  }

  /**
   * Improve text throughout presentation (replaces mock improvements)
   */
  async improveText(improvementType = 'professional') {
    try {
      const presentation = SlidesApp.getActivePresentation();
      const slides = presentation.getSlides();
      
      let totalImprovements = 0;
      const improvementDetails = [];

      // Extract and improve all text elements
      for (const slide of slides) {
        const textElements = this.extractTextElements(slide);
        
        for (const element of textElements) {
          try {
            const improvedText = await this.improveTextContent(
              element.text,
              improvementType,
              element.context
            );
            
            if (improvedText && improvedText !== element.text) {
              // Apply improvement while preserving formatting
              await this.replaceTextWithFormatting(element, improvedText);
              
              improvementDetails.push({
                slideId: slide.getObjectId(),
                elementId: element.elementId,
                originalText: element.text,
                improvedText: improvedText,
                context: element.context
              });
              
              totalImprovements++;
            }
          } catch (error) {
            console.error(`Failed to improve text in element ${element.elementId}:`, error);
          }
        }
      }

      return {
        message: `Text improvement completed! Enhanced ${totalImprovements} text elements.`,
        changes: {
          title: 'Text Enhancement Complete',
          description: `Made content more ${improvementType} across presentation`,
          changesCount: totalImprovements
        },
        canRevert: totalImprovements > 0,
        improvementDetails: improvementDetails
      };

    } catch (error) {
      throw new Error(`Text improvement failed: ${error.message}`);
    }
  }

  /**
   * Change tone of entire presentation
   */
  async changeTone(targetTone = 'professional') {
    try {
      const presentation = SlidesApp.getActivePresentation();
      const slides = presentation.getSlides();
      
      let totalChanges = 0;
      const toneChanges = [];

      for (const slide of slides) {
        const textElements = this.extractTextElements(slide);
        
        for (const element of textElements) {
          try {
            const adjustedText = await this.adjustTextTone(
              element.text,
              targetTone,
              element.context
            );
            
            if (adjustedText && adjustedText !== element.text) {
              await this.replaceTextWithFormatting(element, adjustedText);
              
              toneChanges.push({
                slideId: slide.getObjectId(),
                elementId: element.elementId,
                originalText: element.text,
                adjustedText: adjustedText,
                targetTone: targetTone
              });
              
              totalChanges++;
            }
          } catch (error) {
            console.error(`Failed to adjust tone in element ${element.elementId}:`, error);
          }
        }
      }

      return {
        message: `Tone adjustment completed! Made ${totalChanges} text elements more ${targetTone}.`,
        changes: {
          title: 'Tone Adjustment Complete',
          description: `Content made more ${targetTone} throughout presentation`,
          changesCount: totalChanges
        },
        canRevert: totalChanges > 0,
        toneChanges: toneChanges
      };

    } catch (error) {
      throw new Error(`Tone adjustment failed: ${error.message}`);
    }
  }

  /**
   * Extract text elements from slides with context
   */
  extractTextElements(slide) {
    const textElements = [];
    const pageElements = slide.getPageElements();

    pageElements.forEach(element => {
      try {
        const elementType = element.getPageElementType();
        
        switch (elementType) {
          case SlidesApp.PageElementType.SHAPE:
            const shape = element.asShape();
            const textRange = shape.getText();
            
            if (textRange && textRange.asString().trim()) {
              textElements.push({
                elementId: element.getObjectId(),
                slideId: slide.getObjectId(),
                text: textRange.asString().trim(),
                textRange: textRange,
                context: this.analyzeTextContext(element, slide),
                formatting: this.captureTextFormatting(textRange),
                elementType: 'SHAPE'
              });
            }
            break;

          case SlidesApp.PageElementType.TABLE:
            const table = element.asTable();
            const tableElements = this.extractTableText(table, element, slide);
            textElements.push(...tableElements);
            break;
        }
      } catch (error) {
        console.error(`Error extracting text from element ${element.getObjectId()}:`, error);
      }
    });

    return textElements;
  }

  /**
   * Extract text from table cells
   */
  extractTableText(table, element, slide) {
    const textElements = [];
    const numRows = table.getNumRows();
    const numCols = table.getNumColumns();

    for (let row = 0; row < numRows; row++) {
      for (let col = 0; col < numCols; col++) {
        try {
          const cell = table.getCell(row, col);
          const textRange = cell.getText();
          
          if (textRange && textRange.asString().trim()) {
            textElements.push({
              elementId: element.getObjectId(),
              slideId: slide.getObjectId(),
              text: textRange.asString().trim(),
              textRange: textRange,
              context: `table_cell_${row}_${col}`,
              formatting: this.captureTextFormatting(textRange),
              elementType: 'TABLE_CELL',
              cellPosition: { row, col }
            });
          }
        } catch (error) {
          console.error(`Error extracting text from table cell [${row},${col}]:`, error);
        }
      }
    }

    return textElements;
  }

  /**
   * Improve text content using Gemini AI
   */
  async improveTextContent(text, improvementType, context) {
    try {
      // Skip very short text or non-meaningful content
      if (text.length < 10 || this.isNonMeaningfulText(text)) {
        return text;
      }

      const prompt = this.buildImprovementPrompt(text, improvementType, context);
      const improvedText = await this.aiManager.callGemini(prompt, 300);
      
      // Validate improvement
      if (this.isValidImprovement(text, improvedText)) {
        return improvedText.trim();
      }
      
      return text; // Return original if improvement is not valid
      
    } catch (error) {
      console.error('Text improvement failed:', error);
      return text; // Return original text on error
    }
  }

  /**
   * Adjust text tone using Gemini AI
   */
  async adjustTextTone(text, targetTone, context) {
    try {
      // Skip very short text or non-meaningful content
      if (text.length < 10 || this.isNonMeaningfulText(text)) {
        return text;
      }

      const prompt = this.buildToneAdjustmentPrompt(text, targetTone, context);
      const adjustedText = await this.aiManager.callGemini(prompt, 300);
      
      // Validate tone adjustment
      if (this.isValidImprovement(text, adjustedText)) {
        return adjustedText.trim();
      }
      
      return text; // Return original if adjustment is not valid
      
    } catch (error) {
      console.error('Tone adjustment failed:', error);
      return text; // Return original text on error
    }
  }

  /**
   * Build improvement prompt for Gemini
   */
  buildImprovementPrompt(text, improvementType, context) {
    const improvementInstructions = {
      professional: 'Make this text more professional and business-appropriate',
      casual: 'Make this text more casual and conversational',
      executive: 'Make this executive-level: concise, impactful, strategic focus',
      accessible: 'Simplify this text for broader audience understanding',
      grammar: 'Fix grammar and spelling errors while maintaining original meaning',
      clarity: 'Make this text clearer and more understandable'
    };

    const instruction = improvementInstructions[improvementType] || 'Improve this text';

    return `
    ${instruction} for a business presentation.
    
    Original text: "${text}"
    Context: ${context}
    
    Requirements:
    - Maintain original length approximately (±20%)
    - Preserve key facts and numbers exactly
    - Keep presentation tone appropriate
    - Ensure the meaning remains the same
    - Return only the improved text, no explanations
    
    Improved text:
    `;
  }

  /**
   * Build tone adjustment prompt for Gemini
   */
  buildToneAdjustmentPrompt(text, targetTone, context) {
    const toneInstructions = {
      professional: 'formal, business-appropriate, and polished',
      casual: 'conversational, friendly, and approachable',
      executive: 'concise, strategic, and high-level',
      academic: 'scholarly, precise, and analytical',
      persuasive: 'compelling, convincing, and action-oriented',
      informative: 'clear, factual, and educational'
    };

    const toneDescription = toneInstructions[targetTone] || targetTone;

    return `
    Adjust the tone of this text to be more ${toneDescription}.
    
    Original text: "${text}"
    Context: ${context}
    Target tone: ${targetTone}
    
    Requirements:
    - Maintain the same core message and facts
    - Keep similar length (±20%)
    - Ensure the tone is consistently ${toneDescription}
    - Preserve any specific numbers or data
    - Return only the adjusted text, no explanations
    
    Adjusted text:
    `;
  }

  /**
   * Check if text is meaningful enough to improve
   */
  isNonMeaningfulText(text) {
    // Skip single words, numbers only, or very short phrases
    const trimmed = text.trim();
    
    if (trimmed.length < 10) return true;
    if (/^\d+$/.test(trimmed)) return true; // Numbers only
    if (/^[^\w\s]+$/.test(trimmed)) return true; // Symbols only
    if (trimmed.split(' ').length < 3) return true; // Less than 3 words
    
    return false;
  }

  /**
   * Validate that improvement is actually better
   */
  isValidImprovement(originalText, improvedText) {
    if (!improvedText || improvedText.trim() === '') return false;
    if (improvedText === originalText) return false;
    
    // Check length difference (shouldn't be drastically different)
    const lengthRatio = improvedText.length / originalText.length;
    if (lengthRatio < 0.5 || lengthRatio > 2.0) return false;
    
    // Check for meaningful content (not just AI disclaimers)
    if (improvedText.toLowerCase().includes('i cannot') || 
        improvedText.toLowerCase().includes('as an ai')) return false;
    
    return true;
  }

  /**
   * Replace text while preserving formatting
   */
  async replaceTextWithFormatting(element, newText) {
    try {
      // Capture original formatting
      const originalFormatting = element.formatting;
      
      // Replace text
      element.textRange.setText(newText);
      
      // Restore formatting
      if (originalFormatting) {
        this.restoreTextFormatting(element.textRange, originalFormatting);
      }
      
    } catch (error) {
      console.error('Text replacement with formatting failed:', error);
      throw error;
    }
  }

  /**
   * Capture text formatting
   */
  captureTextFormatting(textRange) {
    try {
      const textStyle = textRange.getTextStyle();
      
      return {
        fontFamily: textStyle.getFontFamily(),
        fontSize: textStyle.getFontSize(),
        bold: textStyle.isBold(),
        italic: textStyle.isItalic(),
        underline: textStyle.isUnderline(),
        foregroundColor: this.captureColor(textStyle.getForegroundColor()),
        backgroundColor: this.captureColor(textStyle.getBackgroundColor())
      };
    } catch (error) {
      console.error('Formatting capture failed:', error);
      return null;
    }
  }

  /**
   * Restore text formatting
   */
  restoreTextFormatting(textRange, formatting) {
    try {
      const textStyle = textRange.getTextStyle();
      
      if (formatting.fontFamily) textStyle.setFontFamily(formatting.fontFamily);
      if (formatting.fontSize) textStyle.setFontSize(formatting.fontSize);
      if (formatting.bold !== null) textStyle.setBold(formatting.bold);
      if (formatting.italic !== null) textStyle.setItalic(formatting.italic);
      if (formatting.underline !== null) textStyle.setUnderline(formatting.underline);
      
      // Restore colors
      if (formatting.foregroundColor) {
        this.restoreColor(textStyle, 'foreground', formatting.foregroundColor);
      }
      if (formatting.backgroundColor) {
        this.restoreColor(textStyle, 'background', formatting.backgroundColor);
      }
    } catch (error) {
      console.error('Formatting restoration failed:', error);
    }
  }

  /**
   * Capture color information
   */
  captureColor(color) {
    try {
      if (!color) return null;
      
      const colorType = color.getType();
      
      switch (colorType) {
        case SlidesApp.ColorType.RGB:
          const rgbColor = color.asRgbColor();
          return {
            type: 'RGB',
            red: rgbColor.getRed(),
            green: rgbColor.getGreen(),
            blue: rgbColor.getBlue()
          };
        
        case SlidesApp.ColorType.THEME:
          const themeColor = color.asThemeColor();
          return {
            type: 'THEME',
            themeColorType: themeColor.getThemeColorType()
          };
        
        default:
          return { type: 'UNKNOWN' };
      }
    } catch (error) {
      return null;
    }
  }

  /**
   * Restore color
   */
  restoreColor(textStyle, colorType, colorInfo) {
    try {
      if (!colorInfo || colorInfo.type === 'UNKNOWN') return;
      
      if (colorInfo.type === 'RGB') {
        const color = SlidesApp.newRgbColor()
          .setRed(colorInfo.red)
          .setGreen(colorInfo.green)
          .setBlue(colorInfo.blue);
        
        if (colorType === 'foreground') {
          textStyle.setForegroundColor(color);
        } else if (colorType === 'background') {
          textStyle.setBackgroundColor(color);
        }
      } else if (colorInfo.type === 'THEME') {
        const color = SlidesApp.newThemeColor()
          .setThemeColorType(colorInfo.themeColorType);
        
        if (colorType === 'foreground') {
          textStyle.setForegroundColor(color);
        } else if (colorType === 'background') {
          textStyle.setBackgroundColor(color);
        }
      }
    } catch (error) {
      console.error('Color restoration failed:', error);
    }
  }

  /**
   * Analyze text context for better improvements
   */
  analyzeTextContext(element, slide) {
    try {
      const bounds = element.getTransform();
      
      // Simple context classification based on position
      if (bounds.getTranslateY() < 100) {
        return 'title';
      } else if (bounds.getTranslateY() < 200) {
        return 'subtitle';
      } else if (bounds.getTranslateX() > 400) {
        return 'sidebar';
      } else {
        return 'body_text';
      }
    } catch (error) {
      return 'unknown';
    }
  }

  /**
   * Get improvement statistics
   */
  getImprovementStats(presentation) {
    try {
      const slides = presentation.getSlides();
      let totalTextElements = 0;
      let improvableElements = 0;
      
      slides.forEach(slide => {
        const textElements = this.extractTextElements(slide);
        totalTextElements += textElements.length;
        
        textElements.forEach(element => {
          if (!this.isNonMeaningfulText(element.text)) {
            improvableElements++;
          }
        });
      });
      
      return {
        totalTextElements: totalTextElements,
        improvableElements: improvableElements,
        slideCount: slides.length
      };
    } catch (error) {
      console.error('Stats calculation failed:', error);
      return {
        totalTextElements: 0,
        improvableElements: 0,
        slideCount: 0
      };
    }
  }
}
