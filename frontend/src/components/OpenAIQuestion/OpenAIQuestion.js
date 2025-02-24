import React, { useState } from 'react';

const OpenAIQuestion = ({ createMessage, setMessages, ...props }) => {
  const [loading, setLoading] = useState(false);

  // This function will be triggered when the user submits a question
  const handleQuestionSubmit = async (question) => {
    if (!question) return;

    setLoading(true);

    try {
      // Send the question to your Flask backend
      const response = await fetch('http://promtiorbot-env.eba-x4hapbrj.us-east-2.elasticbeanstalk.com/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question }),
      });

      const data = await response.json();
      
      // Send the answer back to the chatbot
      const botResponse = createMessage(data.answer || 'No answer available', { widget: 'openaiQuestion' });
      setMessages((prevMessages) => [...prevMessages, botResponse]);
    } catch (error) {
      const errorResponse = createMessage('Lo siento, algo salió mal.', { widget: 'openaiQuestion' });
      setMessages((prevMessages) => [...prevMessages, errorResponse]);
    } finally {
      setLoading(false);
    }
  };

  // This listens for the chatbot's message input and triggers the question submission
  const handleMessageInput = (message) => {
    handleQuestionSubmit(message);
  };

  return null;  // The component doesn't render any UI; it just processes messages
};

export default OpenAIQuestion;
