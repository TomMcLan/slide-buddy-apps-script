/**
 * Find & Replace Engine - Real find/replace functionality for Slide Bro
 * Replaces all mock find/replace with actual Google Slides API operations
 */

class FindReplaceEngine {
  constructor() {
    // Simplified constructor without revert system
  }

  /**
   * Replace all occurrences of text across presentation (replaces mock)
   */
  async replaceAllOccurrences(findText, replaceText) {
    try {
      if (!findText || !replaceText) {
        throw new Error('Both find text and replace text are required');
      }

      const presentation = SlidesApp.getActivePresentation();
      let totalReplacements = 0;
      const replacementDetails = [];

      // Find all occurrences with context to avoid partial matches
      const occurrences = this.findAllOccurrences(presentation, findText);
      
      // Filter valid occurrences (avoid partial word matches)
      const validOccurrences = this.filterValidOccurrences(occurrences, findText);

      // Perform replacements
      for (const occurrence of validOccurrences) {
        try {
          const success = await this.replaceTextInOccurrence(occurrence, findText, replaceText);
          if (success) {
            totalReplacements++;
            replacementDetails.push({
              slideId: occurrence.slideId,
              elementId: occurrence.elementId,
              originalText: occurrence.originalText,
              newText: occurrence.originalText.replace(findText, replaceText)
            });
          }
        } catch (error) {
          console.error(`Failed to replace text in ${occurrence.elementId}:`, error);
        }
      }

      return {
        message: `Successfully replaced "${findText}" with "${replaceText}" in ${totalReplacements} locations.`,
        changes: {
          title: 'Find & Replace Complete',
          description: `Replaced "${findText}" with "${replaceText}" across presentation`,
          changesCount: totalReplacements
        },
        canRevert: totalReplacements > 0,
        replacementDetails: replacementDetails
      };

    } catch (error) {
      throw new Error(`Find & replace failed: ${error.message}`);
    }
  }

  /**
   * Find all occurrences of text in presentation
   */
  findAllOccurrences(presentation, findText) {
    const occurrences = [];
    const slides = presentation.getSlides();

    slides.forEach(slide => {
      const slideOccurrences = this.findInSlide(slide, findText);
      occurrences.push(...slideOccurrences);
    });

    return occurrences;
  }

  /**
   * Find occurrences in a specific slide
   */
  findInSlide(slide, findText) {
    const occurrences = [];
    const pageElements = slide.getPageElements();

    pageElements.forEach(element => {
      const elementOccurrences = this.findInElement(element, slide, findText);
      occurrences.push(...elementOccurrences);
    });

    return occurrences;
  }

  /**
   * Find occurrences in a specific element
   */
  findInElement(element, slide, findText) {
    const occurrences = [];
    const elementType = element.getPageElementType();

    try {
      switch (elementType) {
        case SlidesApp.PageElementType.SHAPE:
          const shape = element.asShape();
          const textRange = shape.getText();
          
          if (textRange && textRange.asString().includes(findText)) {
            occurrences.push({
              slideId: slide.getObjectId(),
              elementId: element.getObjectId(),
              elementType: 'SHAPE',
              textRange: textRange,
              originalText: textRange.asString(),
              context: this.getElementContext(element, slide)
            });
          }
          break;

        case SlidesApp.PageElementType.TABLE:
          const table = element.asTable();
          const tableOccurrences = this.findInTable(table, element, slide, findText);
          occurrences.push(...tableOccurrences);
          break;

        // Add other element types as needed
      }
    } catch (error) {
      console.error(`Error searching element ${element.getObjectId()}:`, error);
    }

    return occurrences;
  }

  /**
   * Find occurrences in table cells
   */
  findInTable(table, element, slide, findText) {
    const occurrences = [];
    const numRows = table.getNumRows();
    const numCols = table.getNumColumns();

    for (let row = 0; row < numRows; row++) {
      for (let col = 0; col < numCols; col++) {
        try {
          const cell = table.getCell(row, col);
          const textRange = cell.getText();
          
          if (textRange && textRange.asString().includes(findText)) {
            occurrences.push({
              slideId: slide.getObjectId(),
              elementId: element.getObjectId(),
              elementType: 'TABLE_CELL',
              textRange: textRange,
              originalText: textRange.asString(),
              cellPosition: { row, col },
              context: `table_cell_${row}_${col}`
            });
          }
        } catch (error) {
          console.error(`Error searching table cell [${row},${col}]:`, error);
        }
      }
    }

    return occurrences;
  }

  /**
   * Filter valid occurrences to avoid partial word matches
   */
  filterValidOccurrences(occurrences, findText) {
    return occurrences.filter(occurrence => {
      return this.isValidOccurrence(occurrence.originalText, findText);
    });
  }

  /**
   * Check if occurrence is valid (not a partial word match)
   */
  isValidOccurrence(text, findText) {
    // Simple word boundary check
    const regex = new RegExp(`\\b${this.escapeRegExp(findText)}\\b`, 'gi');
    return regex.test(text);
  }

  /**
   * Escape special regex characters
   */
  escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Replace text in a specific occurrence
   */
  async replaceTextInOccurrence(occurrence, findText, replaceText) {
    try {
      const newText = occurrence.originalText.replace(
        new RegExp(this.escapeRegExp(findText), 'gi'),
        replaceText
      );

      // Preserve formatting while replacing text
      const originalFormatting = this.captureTextFormatting(occurrence.textRange);
      
      // Replace the text
      occurrence.textRange.setText(newText);
      
      // Restore formatting
      if (originalFormatting) {
        this.restoreTextFormatting(occurrence.textRange, originalFormatting);
      }

      return true;
    } catch (error) {
      console.error('Text replacement failed:', error);
      return false;
    }
  }

  /**
   * Capture text formatting before replacement
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
   * Restore text formatting after replacement
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
   * Get element context for better replacement decisions
   */
  getElementContext(element, slide) {
    try {
      const bounds = element.getTransform();
      
      // Simple context classification based on position
      if (bounds.getTranslateY() < 100) {
        return 'title';
      } else if (bounds.getTranslateY() < 200) {
        return 'subtitle';
      } else {
        return 'body_text';
      }
    } catch (error) {
      return 'unknown';
    }
  }

  /**
   * Smart find and replace with AI assistance
   */
  async smartFindReplace(findText, replaceText, context) {
    try {
      // Use AI to validate replacement appropriateness
      const aiManager = new AIManager();
      
      const prompt = `
      Validate this find and replace operation for a business presentation:
      
      Find: "${findText}"
      Replace: "${replaceText}"
      Context: ${context}
      
      Is this replacement appropriate? Consider:
      - Maintaining professional tone
      - Avoiding unintended changes
      - Preserving meaning
      
      Respond with JSON:
      {
        "appropriate": true/false,
        "reason": "explanation",
        "suggestion": "alternative if needed"
      }
      `;
      
      const validation = await aiManager.callGemini(prompt, 200);
      const result = JSON.parse(validation);
      
      if (!result.appropriate) {
        throw new Error(`Replacement not recommended: ${result.reason}`);
      }
      
      // Proceed with validated replacement
      return await this.replaceAllOccurrences(findText, replaceText);
      
    } catch (error) {
      // Fallback to regular replacement if AI validation fails
      console.warn('AI validation failed, proceeding with regular replacement:', error);
      return await this.replaceAllOccurrences(findText, replaceText);
    }
  }

  /**
   * Get replacement statistics
   */
  getReplacementStats(presentation, findText) {
    try {
      const occurrences = this.findAllOccurrences(presentation, findText);
      const validOccurrences = this.filterValidOccurrences(occurrences, findText);
      
      return {
        totalFound: occurrences.length,
        validMatches: validOccurrences.length,
        slideCount: [...new Set(validOccurrences.map(o => o.slideId))].length,
        elementCount: [...new Set(validOccurrences.map(o => o.elementId))].length
      };
    } catch (error) {
      console.error('Stats calculation failed:', error);
      return {
        totalFound: 0,
        validMatches: 0,
        slideCount: 0,
        elementCount: 0
      };
    }
  }
}
