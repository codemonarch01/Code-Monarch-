const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKey = process.env.GEMINI_API2_KEY;
const genAI = new GoogleGenerativeAI(apiKey);
// AIzaSyBl3YMY0A7AP0QGSRXsu7d78tDwGLjVeJE old code 
class SkillPathService {   
  constructor() {
    const modelId = process.env.GEMINI_MODEL2;
    this.model = genAI.getGenerativeModel({ model: modelId });
  }

  async generateCareerRecommendations(userData, options = {}) {
    const { useStatic = false, timeoutMs = 30000 } = options;
    if (useStatic) {
      return this.buildFallback(userData);
    }
    try {
      const {
        name,
        grade,
        subject,
        completedTopics = [],
        interests = [],
        strengths = [],
        academicPerformance = {},
        preferences = {}
      } = userData;

      const prompt = `You are an expert AI career and skill path advisor for students.
Analyze the following student profile and provide personalized career path recommendations.

STUDENT PROFILE:
- Name: ${name}
- Current Grade: ${grade || 'Not specified'}
- Subject Focus: ${subject || 'General'}
- Completed Topics: ${completedTopics.join(', ') || 'None'}
- Interests: ${interests.join(', ') || 'Not specified'}
- Strengths: ${strengths.join(', ') || 'Not specified'}
- Academic Performance: ${JSON.stringify(academicPerformance)}
- Preferences: ${JSON.stringify(preferences)}

REQUIREMENTS:
1. Generate 3-4 personalized career path recommendations based on the student's profile
2. For each career path, provide:
   - Career Title
   - Description of the career
   - Required Skills (5-6 skills)
   - Education Path (steps to achieve this career)
   - Estimated Timeline (e.g., "4-6 years")
   - Growth Potential (describe future opportunities)
   - Starting Salary Range (in USD/INR)
   - Match Score (0-100, how well it aligns with student profile)

3. For each skill in the required skills, provide:
   - Skill Name
   - Importance Level (Critical, High, Moderate)
   - Current Status (What the student should develop)
   - Learning Resources (suggestions for developing this skill)

4. Return ONLY valid JSON in this exact schema:

{
  "careerPaths": [
    {
      "title": "Career Title",
      "description": "Detailed description",
      "matchScore": 85,
      "requiredSkills": [
        {
          "name": "Skill Name",
          "importance": "Critical|High|Moderate",
          "currentStatus": "Need to develop",
          "learningResources": "Resources to learn this skill"
        }
      ],
      "educationPath": [
        "Step 1",
        "Step 2",
        "Step 3"
      ],
      "estimatedTimeline": "4-6 years",
      "growthPotential": "Description of future opportunities",
      "startingSalaryRange": "$50,000-$80,000",
      "arVisualizationType": "tech|medical|business|creative|science"
    }
  ],
  "summary": {
    "insights": [
      "Key insight about the student",
      "Another important observation"
    ],
    "recommendations": [
      "Immediate action item",
      "Long-term goal"
    ]
  }
}

IMPORTANT: Return ONLY the JSON object, no additional text or markdown formatting.`;

      console.log('🤖 Calling Gemini API for career recommendations...');
      const result = await Promise.race([
        this.model.generateContent(prompt),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Gemini timeout')), timeoutMs))
      ]);
      const response = await result.response;
      const text = response.text();

      // Clean the response to extract JSON
      let jsonText = text.trim();
      
      // Remove markdown code blocks if present
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      
      // Parse JSON
      const careerData = JSON.parse(jsonText);
      
      console.log('✅ Career recommendations generated successfully');
      return careerData;
    } catch (error) {
      console.error('❌ Skill Path Service Error:', error.message);
      // Throw error so route can handle fallback gracefully
      throw error;
    }
  }

  async generateSkillVisualizationData(skillName, careerTitle) {
    try {
      const prompt = `You are an AI assistant helping visualize a skill in 3D/AR format.
Skill: ${skillName}
Career: ${careerTitle}

Generate a creative 3D/AR visualization description for this skill. Return ONLY a JSON object:

{
  "skillName": "${skillName}",
  "visualization": {
    "type": "geometric|organic|abstract|architectural|medical",
    "colorScheme": {
      "primary": "#hexcode",
      "secondary": "#hexcode",
      "accent": "#hexcode"
    },
    "geometry": {
      "shape": "cube|sphere|mesh|tree|network|molecule",
      "complexity": "simple|medium|complex"
    },
    "animation": {
      "type": "pulse|rotate|float|particle|none",
      "speed": "slow|medium|fast"
    },
    "description": "What this skill represents visually"
  }
}`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      let jsonText = response.text().trim();
      
      // Clean JSON
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      
      return JSON.parse(jsonText);
    } catch (error) {
      console.error('Visualization generation error:', error.message);
      
      // Fallback visualization data
      return {
        skillName: skillName,
        visualization: {
          type: "abstract",
          colorScheme: {
            primary: "#3b82f6",
            secondary: "#8b5cf6",
            accent: "#06b6d4"
          },
          geometry: {
            shape: "sphere",
            complexity: "medium"
          },
          animation: {
            type: "float",
            speed: "slow"
          },
          description: "A floating sphere representing knowledge and skill development"
        }
      };
    }
  }
}

// Helper to build static fallback quickly (no external call)
SkillPathService.prototype.buildFallback = function(userData = {}) {
  return {
    careerPaths: [
      {
        title: "Software Developer",
        description: "Build and maintain software applications using various programming languages and technologies.",
        matchScore: 75,
        requiredSkills: [
          {
            name: "Programming (Python/JavaScript)",
            importance: "Critical",
            currentStatus: "Need to develop",
            learningResources: "Online courses, coding bootcamps, practice on LeetCode"
          },
          {
            name: "Problem Solving",
            importance: "Critical",
            currentStatus: "Need to develop",
            learningResources: "Algorithm practice, math problems, coding challenges"
          },
          {
            name: "Database Management",
            importance: "High",
            currentStatus: "Need to develop",
            learningResources: "SQL courses, MongoDB tutorials, practical projects"
          },
          {
            name: "Version Control (Git)",
            importance: "High",
            currentStatus: "Need to develop",
            learningResources: "GitHub tutorials, hands-on practice, contribute to open source"
          }
        ],
        educationPath: [
          "Complete current grade with strong mathematics and logic foundation",
          "Pursue Computer Science degree or coding bootcamp",
          "Build portfolio of projects (GitHub)",
          "Apply for internships and entry-level positions"
        ],
        estimatedTimeline: "3-5 years",
        growthPotential: "High demand in tech industry, remote work options, excellent career growth",
        startingSalaryRange: "$60,000-$90,000",
        arVisualizationType: "tech"
      }
    ],
    summary: {
      insights: [
        `Hi ${userData?.name || 'Student'}, technology careers align well with your interests.`,
        "Focus on building practical projects to enhance your portfolio."
      ],
      recommendations: [
        "Start learning a programming language (Python recommended for beginners)",
        "Join coding communities and participate in hackathons",
        "Consider STEM subjects in higher education"
      ]
    }
  };
}

module.exports = new SkillPathService();
