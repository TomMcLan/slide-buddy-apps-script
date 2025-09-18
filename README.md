# Slide Buddy - Google Slides AI Assistant

A Google Apps Script extension that adds AI-powered features to Google Slides for translation and text manipulation.

## Features

- 🌐 **Translation**: Translate entire presentations to any language using AI
- 🔍 **Find & Replace**: Smart text replacement across all slides
- 🎯 **Simple Interface**: Clean, professional sidebar integration
- ⚡ **Fast Processing**: Efficient bulk operations

## Installation

1. Open [Google Apps Script](https://script.google.com/)
2. Create a new project
3. Copy the code from this repository
4. Set up your Gemini API key in Script Properties
5. Deploy as a Google Workspace Add-on

## Usage

1. Open any Google Slides presentation
2. Launch Slide Buddy from the Extensions menu
3. Choose from available features:
   - **Translate all slides**: Convert your entire presentation to another language
   - **Find and replace**: Update text across all slides at once

## Technical Details

- **Platform**: Google Apps Script
- **APIs Used**: Google Slides API, Gemini AI API
- **OAuth Scopes**: Presentations, Drive (read-only), UI integration
- **Runtime**: V8

## Files Structure

- `Code.js` - Main orchestration and UI integration
- `AIManager.js` - AI/Gemini API handling
- `TranslationEngine.js` - Translation functionality
- `FindReplaceEngine.js` - Find & replace logic
- `ui/` - HTML, CSS, and JavaScript for the sidebar interface

## Development

### Prerequisites
- Google Apps Script account
- Gemini API key
- `clasp` CLI tool installed

### Local Development
```bash
# Clone this repository
git clone https://github.com/YOUR_USERNAME/slide-buddy.git

# Install clasp if not already installed
npm install -g @google/clasp

# Login to Google Apps Script
clasp login

# Push to your Apps Script project
clasp push
```

## Deployment

This extension is designed for Google Workspace Marketplace deployment. See deployment guide for marketplace submission requirements.

## License

MIT License - see LICENSE file for details.

## Support

For support and feature requests, please create an issue in this repository.
