// ActionProvider.js
class ActionProvider {
  constructor(createChatBotMessage, setStateFunc) {
    this.createChatBotMessage = createChatBotMessage;
    this.setState = setStateFunc;
  }

  handleOpenAIQuestion = async (message, url) => {
    // First, add a loading message
    const loadingMessage = this.createChatBotMessage("Cargando...");
    this.setState((prev) => ({
      ...prev,
      messages: [...prev.messages, loadingMessage],
    }));
    
    try {
      // Send the question and url to your Flask backend
      const response = await fetch('http://promtiorbot-env.eba-x4hapbrj.us-east-2.elasticbeanstalk.com/ask', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST,PATCH,OPTIONS'
        },
        body: JSON.stringify({
          question: message
        }),
      });
  
      const data = await response.json();
      // Create a bot message with the answer
      const botMessage = this.createChatBotMessage(data.answer || "No answer available.");
      this.setState((prev) => ({
        ...prev,
        messages: [...prev.messages, botMessage],
      }));
    } catch (error) {
      const errorMessage = this.createChatBotMessage("Lo siento, algo salió mal.");
      this.setState((prev) => ({
        ...prev,
        messages: [...prev.messages, errorMessage],
      }));
    }
  }
  
}

export default ActionProvider;
