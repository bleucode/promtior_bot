// MessageParser.js
class MessageParser {
    constructor(actionProvider) {
      this.actionProvider = actionProvider;
    }
  
    parse(message) {
      // Treat every incoming message as a question for OpenAI.
      this.actionProvider.handleOpenAIQuestion(message);
    }
  }
  
  export default MessageParser;
  