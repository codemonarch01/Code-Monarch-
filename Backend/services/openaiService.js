const axios = require('axios');


class OpenAIService {
  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      console.warn('[OpenAI] OPENAI_API_KEY is not set. OpenAI-backed endpoints will be unavailable.');
    }
    this.baseURL = 'https://api.openai.com/v1/chat/completions';
    this.model = 'gpt-4o-mini';
  }

  async createChatCompletion(userMessage, context = {}, options = {}) {
    try {
      const system =
        'You are an educational AI assistant for a 3D/AR e-learning app. Answer clearly, step-by-step, and keep responses concise and student-friendly.';

      const payload = {
        model: this.model,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: this._composeUserPrompt(userMessage, context) }
        ],
        temperature: 0.7,
        max_tokens: 400
      };

      
      if (options.responseFormatJson) {
        payload.response_format = { type: 'json_object' };
      }

      const res = await axios.post(this.baseURL, payload, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
        },
        timeout: 20000
      });

      const text = res.data?.choices?.[0]?.message?.content?.trim();
      return text || 'I could not generate a response right now.';
    } catch (err) {
      console.error('[OpenAI] Chat completion error:', err?.response?.data || err.message);
      throw err;
    }
  }

  _composeUserPrompt(message, ctx) {
    const parts = [message];
    if (ctx?.subject) parts.push(`Subject: ${ctx.subject}`);
    if (ctx?.topic) parts.push(`Topic: ${ctx.topic}`);
    if (ctx?.grade) parts.push(`Grade: ${ctx.grade}`);
    return parts.join('\n');
  }
}

module.exports = new OpenAIService();




