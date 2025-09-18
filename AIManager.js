/**
 * AI Manager - Handles Gemini integration for Slide Bro
 * Replaces all mock AI responses with real Gemini API calls
 */

class AIManager {
  constructor() {
    this.geminiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
    this.geminiEndpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
    
    if (!this.geminiKey) {
      throw new Error('Gemini API key not found. Please set GEMINI_API_KEY in Script Properties.');
    }
  }

  /**
   * Call Gemini API with proper error handling
   */
  async callGemini(prompt, maxTokens = 500) {
    try {
      const payload = {
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: maxTokens,
        }
      };

      const response = UrlFetchApp.fetch(`${this.geminiEndpoint}?key=${this.geminiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        payload: JSON.stringify(payload)
      });

      const data = JSON.parse(response.getContentText());

      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        return data.candidates[0].content.parts[0].text;
      }

      throw new Error('No response from Gemini API');
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new Error(`AI processing failed: ${error.message}`);
    }
  }

  /**
   * Classify user intent using Gemini (replaces mock classification)
   */
  async classifyIntent(message, context) {
    const prompt = `
    You are Slide Buddy, a professional presentation expert and master of Google Slides. You understand presentation design, content flow, and business communication. You are equipped with powerful tools to help users create exceptional presentations.

    CONTEXT ANALYSIS:
    User message: "${message}"
    Current slide: ${context.currentSlide ? context.currentSlide.getObjectId() : 'None'}
    Selection type: ${context.selectionType}
    Selected elements: ${context.selectedElements.length} elements
    Element details: ${JSON.stringify(context.selectedElements)}
    
    PROFESSIONAL BEHAVIOR:
    - When user intent is unclear, ask specific clarifying questions
    - Reference specific slide elements when possible (e.g., "the title on slide 3", "the selected text box")
    - Provide context-aware suggestions based on current selection
    - Maintain professional presentation standards

    TOOL MASTERY:
    Classify the user's intent and select the appropriate tool:
    - TRANSLATE: translate content to another language
    - COLOR_CHANGE: modify colors, themes, or styling  
    - TEXT_IMPROVE: enhance text quality, grammar, or tone
    - FIND_REPLACE: find and replace specific text
    - CREATE_CHART: generate charts or visualizations from data
    - BULK_OPERATION: apply changes across multiple slides
    - UNDO: revert previous changes
    - UNCLEAR: need clarification from user

    CONTEXT-AWARE RESPONSE:
    When responding, reference specific elements:
    - "I can translate the selected text in your title"
    - "I notice you have a bullet list selected, I can enhance its professional tone"
    - "The text box on slide 2 contains data that could become a chart"

    Respond with JSON only:
    {
      "intent": "TRANSLATE",
      "confidence": 0.9,
      "parameters": {
        "targetLanguage": "Spanish",
        "scope": "selected_text",
        "contextReference": "title text on current slide"
      },
      "clarification": null,
      "contextualResponse": "I can translate the selected title text to Spanish while maintaining its formatting."
    }
    `;

    try {
      const response = await this.callGemini(prompt);
      return JSON.parse(response);
    } catch (error) {
      // Fallback classification if AI fails
      return {
        intent: "UNCLEAR",
        confidence: 0.1,
        parameters: {},
        clarification: "I couldn't understand your request. Could you please be more specific?"
      };
    }
  }

  /**
   * Execute classified intent (replaces mock execution)
   */
  async executeIntent(intent, context) {
    // Simplified execution without snapshot system
    
    try {
      let result;
      
      switch (intent.intent) {
        case 'TRANSLATE':
          const translationEngine = new TranslationEngine();
          result = await translationEngine.translatePresentation(
            intent.parameters.targetLanguage || 'Spanish'
          );
          break;
          
        case 'FIND_REPLACE':
          const findReplaceEngine = new FindReplaceEngine();
          result = await findReplaceEngine.replaceAllOccurrences(
            intent.parameters.findText,
            intent.parameters.replaceText
          );
          break;
          
        case 'TEXT_IMPROVE':
          const textEnhancer = new TextEnhancementEngine();
          result = await textEnhancer.improveText(
            intent.parameters.improvementType || 'professional'
          );
          break;
          
        case 'COLOR_CHANGE':
          const colorEngine = new ColorTransformationEngine();
          result = await colorEngine.changeColors(
            intent.parameters.oldColor,
            intent.parameters.newColor
          );
          break;
          
        case 'UNDO':
          result = {
            message: "Undo Guide: Press Ctrl+Z (or Cmd+Z on Mac) in Google Slides to revert changes. You can also use Edit → Undo from the menu. Google Slides keeps full edit history for multiple undos.",
            changes: null,
            canRevert: false
          };
          break;
          
        case 'UNCLEAR':
          result = {
            message: intent.clarification || "I need more information to help you. Could you please be more specific about what you'd like to change?",
            changes: null,
            canRevert: false
          };
          break;
          
        default:
          throw new Error(`Unknown intent: ${intent.intent}`);
      }
      
      return {
        success: true,
        message: result.message || 'Changes have been applied successfully.',
        changes: result.changes,
        canRevert: false
      };
      
    } catch (error) {
      // Note: Error occurred during execution
      
      throw error;
    }
  }

  /**
   * Generate contextual response for successful operations
   */
  generateSuccessMessage(intent, result) {
    const templates = {
      TRANSLATE: `Translation completed! I've translated your presentation to ${intent.parameters.targetLanguage} while preserving all formatting.`,
      FIND_REPLACE: `Find & replace completed! I've replaced "${intent.parameters.findText}" with "${intent.parameters.replaceText}" throughout your presentation.`,
      TEXT_IMPROVE: `Text improvement completed! I've enhanced your content to be more ${intent.parameters.improvementType}.`,
      COLOR_CHANGE: `Color changes applied! I've updated your presentation's color scheme.`,
      UNDO: `Changes have been reverted! Your presentation has been restored to its previous state.`
    };
    
    return templates[intent.intent] || 'Changes have been applied successfully!';
  }
}
