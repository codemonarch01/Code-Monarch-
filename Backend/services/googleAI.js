const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyBl3YMY0A7AP0QGSRXsu7d78tDwGLjVeJE';
if (!process.env.GEMINI_API_KEY) {
  console.warn('[GoogleAI] Using fallback API key from code. For production, set GEMINI_API_KEY in Backend/.env');
}
const genAI = new GoogleGenerativeAI(apiKey);

class GoogleAIService {
  constructor() {
    const modelId = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    this.modelIdPrimary = modelId;
    this.modelIdFallback = 'gemini-1.5-pro';
    this.model = genAI.getGenerativeModel({ model: this.modelIdPrimary });
  }

  async generateStructuredNotes(ctx = {}) {
    try {
      const title = ctx.title || ctx.topic || 'Topic';
      const subject = ctx.subject || 'General';
      const grade = ctx.grade || '12th';
      const description = ctx.description || '';
      const difficulty = ctx.difficulty || 'Intermediate';

      const prompt = `You are an expert ${subject} teacher creating detailed, exam-ready notes for grade ${grade}.
Topic: ${title}
Subject: ${subject}
Difficulty: ${difficulty}
Description/context: ${description}

RULES:
- Be specific to the topic ${title}.
- Use short, information-dense bullet points.
- Plain text only. No markdown fences.
- Return ONLY strict JSON with this exact schema.

SCHEMA:
{
  "title": "${title} - AI Generated Notes",
  "sections": [
    {"title": "Overview", "content": ["3-4 bullets giving a crisp overview of ${title}"]},
    {"title": "Key Concepts", "content": ["8 bullets defining core ideas, definitions, rules"]},
    {"title": "Important Equations", "content": ["6 bullets with equation and short meaning"]},
    {"title": "Derivations / Steps", "content": ["4 bullets describing key derivation steps"]},
    {"title": "Real-World Applications", "content": ["6 bullets"]},
    {"title": "Common Misconceptions", "content": ["4 bullets of frequent mistakes + correction"]},
    {"title": "Practice Questions (with answers)", "content": ["5 bullets Q: ... A: ... succinct answers"]}
  ]
}`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      JSON.parse(text);
      return text;
    } catch (err) {
      console.error('Google AI Notes Error:', err);
      throw err;
    }
  }

  async generateEducationalResponse(message, context = {}, user = {}) {
    try {
      console.log('\n🔵 GoogleAI.generateEducationalResponse called');
      console.log('💬 Message:', message);
      console.log('🎯 Context:', JSON.stringify(context, null, 2));
      console.log('👤 User:', user?.name || 'Unknown');

      const systemPrompt = this.buildEducationalPrompt(context, user);
      const fullPrompt = `${systemPrompt}\n\nStudent Question: ${message}\n\nProvide a detailed, educational response that directly answers the student's question.`;

      console.log('📤 Sending to Gemini API (', this.modelIdPrimary, ')...');
      let aiResponse = '';
      try {
        const result = await this.model.generateContent(fullPrompt);
        const response = await result.response;
        aiResponse = response.text();
      } catch (primaryErr) {
        console.warn('⚠️ Primary model failed, trying fallback model:', this.modelIdFallback);
        const fallbackModel = genAI.getGenerativeModel({ model: this.modelIdFallback });
        const result2 = await fallbackModel.generateContent(fullPrompt);
        const response2 = await result2.response;
        aiResponse = response2.text();
      }

      console.log('✅ Gemini response received:', aiResponse.substring(0, 150) + '...');
      if (aiResponse.length < 30) {
        console.log('⚠️ Response too short, returning fallback');
        return "I'm sorry, I couldn't generate a response right now.";
      }

      return aiResponse;
    } catch (error) {
      console.error('❌ Google AI Error:', error.message);
      // Local, deterministic fallback so the chat never replies empty
      try {
        const q = String(message || '').trim();
        let topic = '';
        const m = q.match(/what\s+is\s+(.+?)\??$/i);
        if (m) topic = m[1];
        const safeTopic = topic ? topic.replace(/[^a-z0-9 \-]/gi, '').slice(0, 60) : 'the topic';
        const fallback = `Here is a quick explanation of ${safeTopic}:

Definition:
${safeTopic} refers to a concept or component that plays a specific role in computer science or daily life. In simple terms, it is the thing being asked about.

Key points:
- Understand the purpose: what problem it solves.
- Know the basic structure: inputs, process, outputs.
- See a small example.

Example:
If you asked "what is CPU?", the CPU (Central Processing Unit) is the primary chip in a computer that executes instructions, does arithmetic/logic, and coordinates other components.

Tip: If you share your grade/level, I can tailor the explanation further.`;
        return fallback;
      } catch {
        return "I'm sorry, I couldn't generate a response right now.";
      }
    }
  }

  async generateLearningInsights(userProgress, user) {
    try {
      const prompt = `
Analyze this student's learning progress and provide 3-5 personalized insights:

Student: ${user.name}
Grade: ${user.grade}
Learning Streak: ${user.learningStreak} days
Total Study Hours: ${user.totalStudyHours}

Progress Data:
${JSON.stringify(userProgress, null, 2)}

Provide insights in this JSON format:
[
  {
    "type": "achievement|suggestion|warning|positive",
    "title": "Insight Title",
    "content": "Detailed insight message",
    "priority": "high|medium|low"
  }
]
`;
      const result = await this.model.generateContent(prompt);
      const response = await result.response;

      try {
        return JSON.parse(response.text());
      } catch {
        return [];
      }
    } catch (error) {
      console.error('AI Insights Error:', error);
      return [];
    }
  }

  async generateCourseRecommendations(user, availableCourses, userProgress) {
    try {
      const prompt = `
As an AI education advisor, recommend the best courses for this student:

Student Profile:
- Name: ${user.name}
- Grade: ${user.grade}
- Preferred Subjects: ${user.preferences?.subjects?.join(', ') || 'Not specified'}
- Difficulty Level: ${user.preferences?.difficulty || 'intermediate'}
- Learning Streak: ${user.learningStreak} days

Available Courses:
${availableCourses.map(c => `- ${c.title} (${c.subject}, ${c.difficulty})`).join('\n')}

Current Progress:
${userProgress.map(p => `- ${p.course?.title}: ${p.averageProgress}% complete`).join('\n')}

Recommend 3-5 courses with reasoning. Format as JSON:
[
  {"courseId": "course_id", "reason": "Why recommended", "priority": "high|medium|low"}
]
`;
      const result = await this.model.generateContent(prompt);
      const response = await result.response;

      try {
        return JSON.parse(response.text());
      } catch {
        return [];
      }
    } catch (error) {
      console.error('AI Recommendations Error:', error);
      return [];
    }
  }

  async generateTopicTips(topic, userLevel = 'intermediate') {
    try {
      const prompt = `
Generate 3-4 helpful learning tips for this topic:

Topic: ${topic.title}
Subject: ${topic.subject}
Grade: ${topic.grade}
Difficulty: ${topic.difficulty}
Description: ${topic.description}
Student Level: ${userLevel}

Provide tips in JSON format:
[
  {
    "type": "concept|tip|warning|example",
    "title": "Tip Title",
    "content": "Detailed tip content",
    "time": "5:30"
  }
]
`;
      const result = await this.model.generateContent(prompt);
      const response = await result.response;

      try {
        return JSON.parse(response.text());
      } catch {
        return [];
      }
    } catch (error) {
      console.error('AI Tips Error:', error);
      return [];
    }
  }

  buildEducationalPrompt(context, user) {
    return `
You are an expert AI educational tutor for an e-learning platform.
Your role is to provide detailed, accurate, and helpful educational responses.

Student Context:
- Name: ${user.name || 'Student'}
- Grade: ${user.grade || 'Not specified'}
- Subject: ${context.subject || 'General'}
- Topic: ${context.topic || 'General discussion'}
- Difficulty: ${user.preferences?.difficulty || 'intermediate'}

Response Guidelines:
- Provide a direct, detailed answer to the student's question.
- Use clear educational language appropriate for the grade level.
- Include examples and explanations when needed.
- Be informative, structured, and concise.
- Avoid generic phrases like "I can see you're working on..."
`;
  }
}

module.exports = new GoogleAIService();
