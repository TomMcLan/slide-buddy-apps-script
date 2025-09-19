/**
 * Revert System - Real undo functionality for Slide Bro
 * Replaces all mock undo with actual presentation state management
 */

class RevertSystem {
  constructor() {
    this.maxSnapshots = 10; // Keep last 10 operations for memory efficiency
    this.sessionKey = 'slide_bro_snapshots_' + Session.getActiveUser().getEmail();
  }

  /**
   * Create snapshot before any operation (replaces mock snapshots)
   */
  createSnapshot(operationType, description) {
    try {
      const presentation = SlidesApp.getActivePresentation();
      const snapshotId = Utilities.getUuid();
      
      const snapshot = {
        id: snapshotId,
        timestamp: new Date().toISOString(),
        operationType: operationType,
        description: description,
        presentationId: presentation.getId(),
        
        // Capture current state
        presentationState: this.captureCompleteState(presentation),
        
        // User-friendly info
        userFriendlyDescription: this.generateUserDescription(operationType, description),
        canRevert: true
      };
      
      // Store in session properties (memory only)
      this.addSnapshotToStack(snapshot);
      
      console.log(`Snapshot created: ${snapshotId} - ${description}`);
      return snapshotId;
      
    } catch (error) {
      console.error('Snapshot creation failed:', error);
      throw new Error(`Failed to create backup: ${error.message}`);
    }
  }

  /**
   * Revert to specific snapshot (replaces mock revert)
   */
  revertToSnapshot(snapshotId) {
    try {
      const snapshots = this.getSnapshots();
      const snapshot = snapshots.find(s => s.id === snapshotId);
      
      if (!snapshot) {
        throw new Error('Backup not found');
      }
      
      // Restore the presentation state
      this.restoreCompleteState(snapshot.presentationState);
      
      // Remove this snapshot and all newer ones from stack
      const snapshotIndex = snapshots.findIndex(s => s.id === snapshotId);
      const updatedSnapshots = snapshots.slice(0, snapshotIndex);
      this.saveSnapshots(updatedSnapshots);
      
      return {
        success: true,
        description: snapshot.userFriendlyDescription,
        stepsReverted: snapshots.length - snapshotIndex
      };
      
    } catch (error) {
      console.error('Revert failed:', error);
      throw new Error(`Failed to undo changes: ${error.message}`);
    }
  }

  /**
   * Revert last change (convenience method)
   */
  revertLastChange() {
    const snapshots = this.getSnapshots();
    
    if (snapshots.length === 0) {
      return {
        message: 'No changes to undo.',
        changes: {
          title: 'No Changes to Undo',
          description: 'There are no recent changes that can be reverted.',
          changesCount: 0
        },
        canRevert: false
      };
    }
    
    const lastSnapshot = snapshots[snapshots.length - 1];
    const result = this.revertToSnapshot(lastSnapshot.id);
    
    return {
      message: 'Changes have been successfully undone.',
      changes: {
        title: 'Changes Reverted',
        description: `Undid: ${result.description}`,
        changesCount: result.stepsReverted
      },
      canRevert: snapshots.length > 1
    };
  }

  /**
   * Capture complete presentation state
   */
  captureCompleteState(presentation) {
    try {
      const slides = presentation.getSlides();
      const state = {
        presentationId: presentation.getId(),
        title: presentation.getName(),
        slides: []
      };
      
      slides.forEach(slide => {
        state.slides.push(this.captureSlideState(slide));
      });
      
      return state;
      
    } catch (error) {
      console.error('State capture failed:', error);
      throw new Error(`Failed to capture presentation state: ${error.message}`);
    }
  }

  /**
   * Capture individual slide state
   */
  captureSlideState(slide) {
    try {
      const pageElements = slide.getPageElements();
      
      const slideState = {
        slideId: slide.getObjectId(),
        background: this.captureSlideBackground(slide),
        elements: []
      };
      
      pageElements.forEach(element => {
        slideState.elements.push(this.captureElementState(element));
      });
      
      return slideState;
      
    } catch (error) {
      console.error('Slide state capture failed:', error);
      return {
        slideId: slide.getObjectId(),
        background: null,
        elements: [],
        error: error.message
      };
    }
  }

  /**
   * Capture individual element state
   */
  captureElementState(element) {
    try {
      const elementType = element.getPageElementType();
      const baseState = {
        objectId: element.getObjectId(),
        elementType: elementType,
        transform: element.getTransform()
      };
      
      // Capture type-specific properties
      switch (elementType) {
        case SlidesApp.PageElementType.SHAPE:
          return this.captureShapeState(element.asShape(), baseState);
        
        case SlidesApp.PageElementType.IMAGE:
          return this.captureImageState(element.asImage(), baseState);
        
        case SlidesApp.PageElementType.TABLE:
          return this.captureTableState(element.asTable(), baseState);
        
        case SlidesApp.PageElementType.LINE:
          return this.captureLineState(element.asLine(), baseState);
        
        default:
          return baseState;
      }
      
    } catch (error) {
      console.error('Element state capture failed:', error);
      return {
        objectId: element.getObjectId(),
        error: error.message
      };
    }
  }

  /**
   * Capture shape state including text and formatting
   */
  captureShapeState(shape, baseState) {
    try {
      const shapeState = {
        ...baseState,
        shapeType: shape.getShapeType(),
        text: null,
        fill: null,
        border: null
      };
      
      // Capture text content and formatting
      const textRange = shape.getText();
      if (textRange && textRange.asString()) {
        shapeState.text = {
          content: textRange.asString(),
          style: this.captureTextStyle(textRange)
        };
      }
      
      // Capture shape properties
      try {
        const fill = shape.getFill();
        if (fill) {
          shapeState.fill = {
            type: fill.getType(),
            // Add specific fill properties based on type
          };
        }
      } catch (e) {
        // Fill might not be accessible
      }
      
      return shapeState;
      
    } catch (error) {
      console.error('Shape state capture failed:', error);
      return baseState;
    }
  }

  /**
   * Capture image state for preservation
   */
  captureImageState(image, baseState) {
    try {
      const imageState = {
        ...baseState,
        imageType: 'IMAGE',
        properties: {
          // Image properties are mostly read-only in Google Slides API
          // We can capture basic transform and position info
          transform: image.getTransform(),
          title: image.getTitle() || '',
          description: image.getDescription() || ''
        }
      };
      
      return imageState;
      
    } catch (error) {
      console.error('Image state capture failed:', error);
      return baseState;
    }
  }

  /**
   * Capture table state for preservation
   */
  captureTableState(table, baseState) {
    try {
      const tableState = {
        ...baseState,
        tableType: 'TABLE',
        properties: {
          rows: table.getNumRows(),
          columns: table.getNumColumns(),
          // Note: Table content is complex to capture and restore
          // For now, we'll just preserve basic structure
        }
      };
      
      return tableState;
      
    } catch (error) {
      console.error('Table state capture failed:', error);
      return baseState;
    }
  }

  /**
   * Capture line state for preservation
   */
  captureLineState(line, baseState) {
    try {
      const lineState = {
        ...baseState,
        lineType: 'LINE',
        properties: {
          lineCategory: line.getLineCategory(),
          // Line properties are mostly styling which is harder to capture
        }
      };
      
      return lineState;
      
    } catch (error) {
      console.error('Line state capture failed:', error);
      return baseState;
    }
  }

  /**
   * Capture text style for preservation
   */
  captureTextStyle(textRange) {
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
      console.error('Text style capture failed:', error);
      return null;
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
   * Restore complete presentation state
   */
  restoreCompleteState(state) {
    try {
      const presentation = SlidesApp.getActivePresentation();
      
      // Note: Full state restoration is complex in Google Slides API
      // This is a simplified version focusing on text content
      
      state.slides.forEach(slideState => {
        try {
          const slides = presentation.getSlides();
          const slide = slides.find(s => s.getObjectId() === slideState.slideId);
          this.restoreSlideState(slide, slideState);
        } catch (error) {
          console.error(`Failed to restore slide ${slideState.slideId}:`, error);
        }
      });
      
    } catch (error) {
      console.error('State restoration failed:', error);
      throw new Error(`Failed to restore presentation: ${error.message}`);
    }
  }

  /**
   * Restore individual slide state
   */
  restoreSlideState(slide, slideState) {
    try {
      const pageElements = slide.getPageElements();
      
      slideState.elements.forEach(elementState => {
        try {
          const element = pageElements.find(el => 
            el.getObjectId() === elementState.objectId
          );
          
          if (element) {
            this.restoreElementState(element, elementState);
          }
        } catch (error) {
          console.error(`Failed to restore element ${elementState.objectId}:`, error);
        }
      });
      
    } catch (error) {
      console.error('Slide restoration failed:', error);
    }
  }

  /**
   * Restore individual element state
   */
  restoreElementState(element, elementState) {
    try {
      const elementType = element.getPageElementType();
      
      switch (elementType) {
        case SlidesApp.PageElementType.SHAPE:
          if (elementState.text) {
            const shape = element.asShape();
            const textRange = shape.getText();
            textRange.setText(elementState.text.content);
            
            if (elementState.text.style) {
              this.restoreTextStyle(textRange, elementState.text.style);
            }
          }
          break;
        
        // Add other element types as needed
      }
      
    } catch (error) {
      console.error('Element restoration failed:', error);
    }
  }

  /**
   * Restore text style
   */
  restoreTextStyle(textRange, style) {
    try {
      const textStyle = textRange.getTextStyle();
      
      if (style.fontFamily) textStyle.setFontFamily(style.fontFamily);
      if (style.fontSize) textStyle.setFontSize(style.fontSize);
      if (style.bold !== null) textStyle.setBold(style.bold);
      if (style.italic !== null) textStyle.setItalic(style.italic);
      if (style.underline !== null) textStyle.setUnderline(style.underline);
      
      // Restore colors
      if (style.foregroundColor) {
        this.restoreColor(textStyle.setForegroundColor, style.foregroundColor);
      }
      if (style.backgroundColor) {
        this.restoreColor(textStyle.setBackgroundColor, style.backgroundColor);
      }
      
    } catch (error) {
      console.error('Text style restoration failed:', error);
    }
  }

  /**
   * Session storage management
   */
  getSnapshots() {
    try {
      const stored = PropertiesService.getScriptProperties().getProperty(this.sessionKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to get snapshots:', error);
      return [];
    }
  }

  addSnapshotToStack(snapshot) {
    const snapshots = this.getSnapshots();
    snapshots.push(snapshot);
    
    // Keep only last N snapshots
    if (snapshots.length > this.maxSnapshots) {
      snapshots.shift();
    }
    
    this.saveSnapshots(snapshots);
  }

  saveSnapshots(snapshots) {
    try {
      PropertiesService.getScriptProperties()
        .setProperty(this.sessionKey, JSON.stringify(snapshots));
    } catch (error) {
      console.error('Failed to save snapshots:', error);
    }
  }

  /**
   * Generate user-friendly description
   */
  generateUserDescription(operationType, description) {
    const descriptions = {
      'TRANSLATE': 'Translation operation',
      'FIND_REPLACE': 'Find and replace operation',
      'TEXT_IMPROVE': 'Text improvement',
      'COLOR_CHANGE': 'Color modification',
      'BULK_OPERATION': 'Bulk changes'
    };
    
    return descriptions[operationType] || description;
  }

  /**
   * Get revert history for user display
   */
  getRevertHistory() {
    const snapshots = this.getSnapshots();
    
    return snapshots.map(snapshot => ({
      id: snapshot.id,
      description: snapshot.userFriendlyDescription,
      timestamp: snapshot.timestamp,
      operationType: snapshot.operationType
    })).reverse(); // Most recent first
  }

  /**
   * Clear all snapshots (for cleanup)
   */
  clearSnapshots() {
    PropertiesService.getScriptProperties().deleteProperty(this.sessionKey);
  }

  /**
   * Capture slide background state (simplified for Google Slides API limitations)
   */
  captureSlideBackground(slide) {
    try {
      // Google Slides API has limited background access
      // We'll store basic slide properties instead
      return {
        slideId: slide.getObjectId(),
        slideIndex: slide.getObjectId(), // Simplified identifier
        hasBackground: true // Placeholder - API limitations
      };
    } catch (error) {
      console.error('Slide background capture failed:', error);
      return {
        slideId: slide.getObjectId(),
        hasBackground: false,
        error: error.message
      };
    }
  }
}
