// This is the corrected handleFeature function
function handleFeature(feature) {
  const featureNames = {
    'translate': 'translation',
    'enhance': 'text enhancement', 
    'replace': 'find & replace'
  };
  
  currentUserMessage = 'I want to use ' + featureNames[feature];
  showLoading('One moment please...');
  
  // Call real backend function instead of demo
  google.script.run
    .withSuccessHandler(function(result) {
      showChatResponse(currentUserMessage, result, true);
    })
    .withFailureHandler(function(error) {
      console.error('Backend error:', error);
      showChatResponse(currentUserMessage, 'Sorry, there was an error. Please try again.', true);
    })
    .handleFeatureRequest(feature);
}
