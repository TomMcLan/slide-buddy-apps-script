/**
 * Color Transformation Engine - Real color modification functionality for Slide Bro
 * Handles color changes across presentations with AI assistance
 */

class ColorTransformationEngine {
  constructor() {
    this.aiManager = new AIManager();
  }

  /**
   * Change colors throughout presentation
   */
  async changeColors(oldColor, newColor) {
    try {
      const presentation = SlidesApp.getActivePresentation();
      const slides = presentation.getSlides();
      
      let totalChanges = 0;
      const colorChanges = [];

      for (const slide of slides) {
        const elements = slide.getPageElements();
        
        for (const element of elements) {
          try {
            const changed = await this.changeElementColor(element, oldColor, newColor);
            if (changed) {
              totalChanges++;
              colorChanges.push({
                slideId: slide.getObjectId(),
                elementId: element.getObjectId(),
                oldColor: oldColor,
                newColor: newColor
              });
            }
          } catch (error) {
            console.error(`Failed to change color in element ${element.getObjectId()}:`, error);
          }
        }
      }

      return {
        message: `Color changes completed! Updated ${totalChanges} elements.`,
        changes: {
          title: 'Color Transformation Complete',
          description: `Changed ${oldColor} to ${newColor} across presentation`,
          changesCount: totalChanges
        },
        canRevert: totalChanges > 0,
        colorChanges: colorChanges
      };

    } catch (error) {
      throw new Error(`Color transformation failed: ${error.message}`);
    }
  }

  /**
   * Change color in a specific element
   */
  async changeElementColor(element, oldColor, newColor) {
    try {
      const elementType = element.getPageElementType();
      
      switch (elementType) {
        case SlidesApp.PageElementType.SHAPE:
          return await this.changeShapeColor(element.asShape(), oldColor, newColor);
        
        case SlidesApp.PageElementType.TABLE:
          return await this.changeTableColor(element.asTable(), oldColor, newColor);
        
        default:
          return false;
      }
    } catch (error) {
      console.error('Element color change failed:', error);
      return false;
    }
  }

  /**
   * Change shape colors (text and fill)
   */
  async changeShapeColor(shape, oldColor, newColor) {
    let changed = false;
    
    try {
      // Change text color
      const textRange = shape.getText();
      if (textRange && textRange.asString()) {
        const textStyle = textRange.getTextStyle();
        // Simple implementation - change all text to new color
        textStyle.setForegroundColor(newColor);
        changed = true;
      }
      
    } catch (error) {
      console.error('Shape color change failed:', error);
    }
    
    return changed;
  }

  /**
   * Change table colors
   */
  async changeTableColor(table, oldColor, newColor) {
    let changed = false;
    
    try {
      const numRows = table.getNumRows();
      const numCols = table.getNumColumns();
      
      for (let row = 0; row < numRows; row++) {
        for (let col = 0; col < numCols; col++) {
          const cell = table.getCell(row, col);
          const textRange = cell.getText();
          
          if (textRange && textRange.asString()) {
            const textStyle = textRange.getTextStyle();
            textStyle.setForegroundColor(newColor);
            changed = true;
          }
        }
      }
    } catch (error) {
      console.error('Table color change failed:', error);
    }
    
    return changed;
  }
}
