import { createChatBotMessage } from 'react-chatbot-kit';

const config = {
  botName: "PromtiorBot",
  initialMessages: [
    createChatBotMessage("Hello, I'm here to help you. I only have answers for two questions:  'What services does promtior offer?' and 'When was the company founded?'"),
  ],
  // You may remove widgets that aren’t needed now.
  widgets: [],
};

export default config;
