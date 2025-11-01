import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  Loader2, 
  X, 
  Minimize2, 
  Maximize2,
  Sparkles,
  Brain,
  Lightbulb,
  BookOpen,
  Target,
  MoreHorizontal,
  Trash2,
  RotateCcw
} from 'lucide-react';
import { aiAPI } from '../api/api';

// Custom Typing Animation Component
const TypingAnimation = () => (
  <div className="flex items-center space-x-2">
    <motion.div
      animate={{ opacity: [0.3, 1, 0.3] }}
      transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
      className="w-2 h-2 bg-gray-500 rounded-full"
    />
    <motion.div
      animate={{ opacity: [0.3, 1, 0.3] }}
      transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
      className="w-2 h-2 bg-gray-500 rounded-full"
    />
    <motion.div
      animate={{ opacity: [0.3, 1, 0.3] }}
      transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
      className="w-2 h-2 bg-gray-500 rounded-full"
    />
  </div>
);

const AIAssistant = ({ isOpen, onClose, user, currentContext = {} }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Initialize with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: 1,
          type: 'ai',
          content: `Hello ${user?.name || 'there'}! I'm your AI learning assistant. I can help you with:\n\n• Course recommendations\n• Study tips and strategies\n• Progress insights\n• 3D model explanations\n• General learning questions\n\nHow can I assist you today?`,
          timestamp: new Date(),
          suggestions: [
            "Show me my learning progress",
            "Recommend courses for me",
            "Explain a 3D model",
            "Give me study tips"
          ]
        }
      ]);
    }
  }, [isOpen, user, messages.length]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (message = inputMessage) => {
    if (!message.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: message.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      // Send message to AI backend with chat history for context
      console.log('🤖 Sending message to AI:', message);
      console.log('🤖 Previous messages:', messages.length);
      console.log('🤖 Context:', currentContext);
      console.log('🤖 User:', user);
      
      // Build conversation history from last 10 messages for context
      const conversationHistory = messages
        .slice(-10) // Last 10 messages
        .map(msg => ({
          role: msg.type === 'user' ? 'user' : 'assistant',
          content: msg.content
        }));
      
      // Prepare context with conversation history
      const contextWithHistory = {
        ...currentContext,
        user: user,
        timestamp: new Date(),
        conversationHistory: conversationHistory,
        previousMessages: messages.map(m => ({
          type: m.type,
          content: m.content
        }))
      };
      
      console.log('📝 Sending context with history:', contextWithHistory);
      
      const response = await aiAPI.chat(message, contextWithHistory, {
        includeHistory: true
      });
      console.log('🤖 Full AI response object:', response);
      console.log('🤖 Response data:', response.data);
      console.log('🤖 Response data.data:', response.data?.data);

      let aiResponseText = '';
      let aiSuggestions = [];
      const d = response?.data;
      if (d?.data?.response) {
        aiResponseText = d.data.response;
        aiSuggestions = d.data.suggestions || d?.data?.suggestions || d?.suggestions || [];
      } else if (d?.response) {
        aiResponseText = d.response;
        aiSuggestions = d.suggestions || [];
      } else if (d?.data?.answer) {
        aiResponseText = d.data.answer;
        aiSuggestions = d.data.suggestions || [];
      } else if (d?.answer) {
        aiResponseText = d.answer;
        aiSuggestions = d.suggestions || [];
      } else if (d?.message && typeof d.message === 'string') {
        aiResponseText = d.message;
        aiSuggestions = d.suggestions || [];
      } else if (d?.result?.text) {
        aiResponseText = d.result.text;
        aiSuggestions = d.result.suggestions || d.suggestions || [];
      } else if (Array.isArray(d?.choices) && d.choices[0]?.message?.content) {
        aiResponseText = d.choices[0].message.content;
        aiSuggestions = d.suggestions || [];
      } else if (typeof d === 'string') {
        aiResponseText = d;
      } else if (response?.response) {
        aiResponseText = response.response;
      } else if (typeof d === 'object' && d?.text) {
        aiResponseText = d.text;
      } else {
        console.error('🤖 Unexpected response structure:', response);
        throw new Error('Invalid response structure from AI');
      }

      console.log('🤖 Parsed AI response text:', aiResponseText);

      // Check if response is actually different
      if (!aiResponseText || aiResponseText.trim() === '') {
        console.warn('⚠️ Empty response from AI');
        throw new Error('AI returned empty response');
      }

      const aiMessage = {
        id: Date.now() + Math.random(), // Ensure unique ID
        type: 'ai',
        content: aiResponseText,
        timestamp: new Date(),
        suggestions: aiSuggestions && aiSuggestions.length > 0 ? aiSuggestions : [
          "Can you explain this in more detail?",
          "Show me a practical example",
          "What are the key points to remember?",
          "Help me with practice problems"
        ]
      };

      // Verify this is a new unique message
      console.log('✅ Adding AI message:', aiMessage.id);
      
      setMessages(prev => {
        // Ensure we don't add duplicate messages
        const isDuplicate = prev.some(m => m.id === aiMessage.id || 
          (m.content === aiMessage.content && m.type === 'ai'));
        
        if (isDuplicate) {
          console.warn('⚠️ Duplicate message detected, skipping');
          return prev;
        }
        
        return [...prev, aiMessage];
      });
    } catch (error) {
      console.error('❌ AI Chat error:', error);
      console.error('❌ Error response:', error.response);
      console.error('❌ Error data:', error.response?.data);
      console.error('❌ Error message:', error.message);
      
      // Check if it's a timeout error
      const isTimeout = error.code === 'ECONNABORTED' || error.message?.includes('timeout');
      const errorMsg = error.response?.data?.message || error.message || 'Unknown error';
      
      // Create a helpful error message
      let fallbackResponse = '';
      
      if (isTimeout) {
        fallbackResponse = `I apologize, but I'm taking longer than usual to respond to "${message}". This can happen when processing complex questions.

Here's what you can do:
• Try rephrasing your question in a simpler way
• Ask about a specific topic (e.g., "What is an operating system?")
• Try one of the suggestions below

I'm still here to help with your learning!`;
      } else {
        fallbackResponse = `I understand you're asking about "${message}". I'm experiencing a technical issue (${errorMsg}), but I'm still here to help!

Let me try to assist you:
• I can explain concepts in simple terms
• Provide study tips and strategies
• Recommend learning resources
• Help with your learning progress

Try asking your question again, or use one of the suggestions below.`;
      }

      // Show original user message again for retry
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: fallbackResponse,
        timestamp: new Date(),
        isError: true,
        retryMessage: message, // Store original message for retry
        suggestions: [
          `Try again: "${message.substring(0, 30)}${message.length > 30 ? '...' : ''}"`,
          "Rephrase this question",
          "Browse available courses",
          "Check my learning progress"
        ]
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInputMessage(suggestion);
    handleSendMessage(suggestion);
  };

  // Retry handler for error messages
  const handleRetry = async (originalMessage) => {
    console.log('🔄 Retrying message:', originalMessage);
    setIsLoading(true);
    setIsTyping(true);
    
    // Remove the error message
    setMessages(prev => prev.filter(m => !m.isError || m.retryMessage !== originalMessage));
    
    // Retry with the original message
    await handleSendMessage(originalMessage);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ type: "spring", damping: 20, stiffness: 300 }}
      className={`fixed bottom-6 right-6 z-50 ${isMinimized ? 'w-80 h-16' : 'w-[450px] h-[600px]'} glass-effect gradient-border rounded-3xl shadow-strong overflow-hidden flex flex-col`}
      style={{ 
        background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.9) 100%)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)'
      }}
    >
      {/* Header */}
      <motion.div 
        className="sticky top-0 z-10 bg-gradient-to-r from-green-600 to-emerald-700 text-white px-4 h-16 flex items-center justify-between cursor-pointer shadow-medium backdrop-blur-sm border-b border-white/10"
        style={{ background: 'linear-gradient(135deg, #16a34a 0%, #047857 100%)' }}
        onClick={() => isMinimized && setIsMinimized(false)}
        whileHover={isMinimized ? { scale: 1.02 } : {}}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        <div className="flex items-center space-x-3">
          <motion.div 
            className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center backdrop-blur-sm ring-1 ring-white/30"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            <Bot className="w-5 h-5" />
          </motion.div>
          <div>
            <h3 className="font-semibold text-lg">AI Tutor</h3>
            <p className="text-xs text-white/80 flex items-center">
              <motion.span
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                ●
              </motion.span>
              <span className="ml-1">Online</span>
              {isMinimized && messages.length > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full"
                >
                  {messages.length}
                </motion.span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={clearChat}
            className="p-2 hover:bg-white/15 rounded-xl transition-all duration-200"
            title="Refresh"
          >
            <RotateCcw className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="p-2 hover:bg-white/15 rounded-xl transition-all duration-200"
            title="Close"
          >
            <X className="w-4 h-4" />
          </motion.button>
        </div>
      </motion.div>

    {!isMinimized && (
      <>
        {/* Messages */}
        <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-4 bg-gradient-to-b from-white/60 to-white/90">
          <AnimatePresence mode="popLayout">
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                layout
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.8 }}
                transition={{ 
                  type: "spring", 
                  damping: 20, 
                  stiffness: 300,
                  delay: index * 0.1 
                }}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-end space-x-3 max-w-[85%] ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  {/* Avatar */}
                  <motion.div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center shadow-medium ring-2 ring-white/60 ${
                      message.type === 'user' 
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' 
                        : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    }`}
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    {message.type === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </motion.div>
                  
                  {/* Message Bubble */}
                  <motion.div 
                    className={`relative rounded-2xl px-5 py-3.5 shadow-medium ${
                      message.type === 'user'
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-2xl'
                        : message.isError
                        ? 'bg-red-50 text-red-800 border border-red-200 rounded-bl-2xl'
                        : 'bg-white text-gray-800 border border-gray-200 rounded-bl-2xl'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <motion.p 
                      className="text-sm whitespace-pre-wrap leading-relaxed"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                    >
                      {message.content}
                    </motion.p>
                    <motion.p 
                      className="text-[10px] opacity-70 mt-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.7 }}
                      transition={{ delay: 0.5 }}
                    >
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </motion.p>
                  </motion.div>
                </div>
              </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing Indicator */}
            <AnimatePresence>
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.8 }}
                  transition={{ 
                    type: "spring", 
                    damping: 20, 
                    stiffness: 300
                  }}
                  className="flex justify-start"
                >
                  <div className="flex items-end space-x-3">
                    
                    <motion.div 
                      className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full flex items-center justify-center shadow-medium ring-2 ring-white/60"
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <Bot className="w-4 h-4" />
                    </motion.div>
                    
                    {/* Message Bubble - Same styling as AI messages */}
                    <motion.div 
                      className="relative rounded-2xl px-5 py-3.5 shadow-medium bg-white text-gray-800 border border-gray-200 rounded-bl-2xl"
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    >
                      <TypingAnimation />
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions */}
          <AnimatePresence>
            {messages.length > 0 && messages[messages.length - 1]?.suggestions && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="px-5 pb-3"
              >
                <div className="flex flex-wrap gap-2">
                  {messages[messages.length - 1].suggestions.map((suggestion, index) => {
                    const isRetry = messages[messages.length - 1]?.isError && suggestion.includes('Try again:');
                    const lastMessage = messages[messages.length - 1];
                    
                    return (
                      <motion.button
                        key={index}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          if (isRetry && lastMessage?.retryMessage) {
                            handleRetry(lastMessage.retryMessage);
                          } else {
                            handleSuggestionClick(suggestion);
                          }
                        }}
                        className={`text-xs px-4 py-2.5 rounded-full transition-all duration-200 border shadow-medium hover:shadow-strong ${
                          isRetry 
                            ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 hover:from-green-100 hover:to-emerald-100 border-green-200/50'
                            : 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 hover:from-blue-100 hover:to-indigo-100 border-blue-200/50'
                        }`}
                      >
                        {suggestion}
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </>
      )}

      {/* Quick Actions - Always visible when minimized */}
      {isMinimized && (
        <div className="px-4 py-2 bg-gradient-to-r from-blue-50/60 to-indigo-50/60 border-t border-gray-200/30 backdrop-blur-sm">
          <div className="flex flex-wrap gap-2">
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSuggestionClick("Show me my learning progress")}
              className="text-xs bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 px-3 py-1.5 rounded-full hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 border border-blue-200/50 shadow-sm"
            >
              📊 Progress
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSuggestionClick("Recommend courses for me")}
              className="text-xs bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 px-3 py-1.5 rounded-full hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 border border-blue-200/50 shadow-sm"
            >
              📚 Courses
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSuggestionClick("Give me study tips")}
              className="text-xs bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 px-3 py-1.5 rounded-full hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 border border-blue-200/50 shadow-sm"
            >
              💡 Tips
            </motion.button>
          </div>
        </div>
      )}

      {/* Input - Always visible */}
      <div className="p-4 border-t border-gray-200/50 bg-white/80 backdrop-blur-md">
        <motion.div 
          className="flex items-center space-x-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isMinimized ? "Type a message..." : "Ask me anything about your learning..."}
              className="w-full px-5 py-3 border border-gray-300/50 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400/60 focus:border-blue-400 transition-all duration-200 bg-white/90 backdrop-blur-md shadow-medium hover:shadow-strong"
              disabled={isLoading}
            />
            {/* Typing indicator in input */}
            {isLoading && (
              <motion.div
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <TypingAnimation />
              </motion.div>
            )}
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={inputMessage.trim() ? { scale: [1, 1.02, 1] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
            onClick={() => handleSendMessage()}
            disabled={!inputMessage.trim() || isLoading}
            className="p-3.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-strong"
          >
            <Send className="w-4 h-4" />
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AIAssistant;
