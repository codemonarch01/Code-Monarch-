const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKey = process.env.GEMINI_API2_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

// Helper function to fix incomplete JSON
function fixIncompleteJSON(jsonStr) {
  try {
    // Try parsing first - if it works, return as is
    JSON.parse(jsonStr);
    return jsonStr;
  } catch (e) {
    // JSON is incomplete, try to fix it
    let fixed = jsonStr;
    
    // Remove incomplete strings at the end (cut off mid-word)
    fixed = fixed.replace(/"[^"]*$/, ''); // Remove incomplete string
    
    // Remove trailing commas before brackets/braces
    fixed = fixed.replace(/,\s*([\]\}])/g, '$1');
    
    // Remove incomplete property assignments
    fixed = fixed.replace(/,\s*"[^"]*"\s*:\s*"[^"]*$/, '');
    fixed = fixed.replace(/,\s*"[^"]*"\s*:\s*\[[^\]]*$/, '');
    fixed = fixed.replace(/,\s*"[^"]*"\s*:\s*\{[^\}]*$/, '');
    
    // Count open/close braces and brackets
    let openBraces = (fixed.match(/\{/g) || []).length;
    let closeBraces = (fixed.match(/\}/g) || []).length;
    let openBrackets = (fixed.match(/\[/g) || []).length;
    let closeBrackets = (fixed.match(/\]/g) || []).length;
    
    // Close unclosed arrays first (inner to outer)
    while (openBrackets > closeBrackets) {
      // Find incomplete arrays and close them
      const lastOpenBracket = fixed.lastIndexOf('[');
      if (lastOpenBracket !== -1) {
        // Check if there's incomplete content
        const afterBracket = fixed.substring(lastOpenBracket + 1);
        if (!afterBracket.trim().endsWith(']')) {
          // Remove trailing incomplete content
          fixed = fixed.substring(0, lastOpenBracket + 1) + fixed.substring(lastOpenBracket + 1).replace(/,\s*"[^"]*$/, '');
          fixed += ']';
          closeBrackets++;
        }
      } else {
        break;
      }
    }
    
    // Close unclosed objects (inner to outer)
    while (openBraces > closeBraces) {
      // Remove trailing incomplete property
      fixed = fixed.replace(/,\s*"[^"]*"\s*:\s*"[^"]*$/, '');
      fixed = fixed.replace(/,\s*"[^"]*"\s*:\s*\[[^\]]*$/, '');
      fixed += '}';
      closeBraces++;
    }
    
    // Final cleanup - remove trailing commas
    fixed = fixed.replace(/,\s*([\]\}])/g, '$1');
    
    return fixed;
  }
}

// Extract partial career data from incomplete JSON
function extractPartialCareerData(text) {
  try {
    const careerPaths = [];
    
    // Try to find career path objects even if JSON is incomplete
    const careerMatches = text.matchAll(/\{\s*"title"\s*:\s*"([^"]+)"/g);
    
    for (const match of careerMatches) {
      const title = match[1];
      const startPos = match.index;
      
      // Try to extract fields from this career path
      const pathText = text.substring(startPos, startPos + 2000);
      const descriptionMatch = pathText.match(/"description"\s*:\s*"([^"]+)"/);
      const scoreMatch = pathText.match(/"matchScore"\s*:\s*(\d+)/);
      
      if (title) {
        careerPaths.push({
          title: title,
          description: descriptionMatch ? descriptionMatch[1] : `AI-generated career path for ${title}`,
          matchScore: scoreMatch ? parseInt(scoreMatch[1]) : 75,
          requiredSkills: [],
          educationPath: ['Complete relevant courses', 'Build projects', 'Gain experience'],
          estimatedTimeline: '4-6 years',
          growthPotential: 'Strong growth potential in this field',
          startingSalaryRange: '$50,000-$80,000',
          arVisualizationType: 'tech'
        });
      }
      
      // Limit to 3 paths
      if (careerPaths.length >= 3) break;
    }
    
    if (careerPaths.length > 0) {
      return {
        careerPaths: careerPaths,
        summary: {
          insights: ['AI analysis completed with partial data'],
          recommendations: ['Continue building skills', 'Focus on practical projects']
        }
      };
    }
    
    return null;
  } catch (e) {
    return null;
  }
}
// AIzaSyBl3YMY0A7AP0QGSRXsu7d78tDwGLjVeJE old code 
class SkillPathService {   
  constructor() {
    // Use faster model by default, fallback to flash if model2 not set
    const modelId = process.env.GEMINI_MODEL2 || 'gemini-1.5-flash';
    this.model = genAI.getGenerativeModel({ 
      model: modelId,
      generationConfig: {
        maxOutputTokens: 4096, // Increased to allow complete JSON responses
        temperature: 0.7,
      }
    });
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

      // Optimized shorter prompt for faster responses
      const interestsList = Array.isArray(interests) ? interests.slice(0, 10).join(', ') : interests;
      const strengthsList = Array.isArray(strengths) ? strengths.slice(0, 10).join(', ') : strengths;
      const topicsList = Array.isArray(completedTopics) ? completedTopics.slice(0, 10).join(', ') : completedTopics.join(', ');
      
      const prompt = `Analyze this student profile and recommend 3 career paths. Return ONLY JSON, no markdown.

Student: ${name} | Grade: ${grade || 'N/A'} | Focus: ${subject || 'General'}
Interests: ${interestsList || 'None'}
Strengths: ${strengthsList || 'None'}
Completed: ${topicsList || 'None'}
Performance: ${JSON.stringify(academicPerformance)}

Return this JSON structure only:
{
  "careerPaths": [
    {
      "title": "Career Name",
      "description": "Brief 1-2 line description",
      "matchScore": 85,
      "requiredSkills": [
        {"name": "Skill", "importance": "High", "currentStatus": "Develop this", "learningResources": "How to learn"}
      ],
      "educationPath": ["Step 1", "Step 2"],
      "estimatedTimeline": "4-6 years",
      "growthPotential": "Brief future outlook",
      "startingSalaryRange": "$50k-$80k",
      "arVisualizationType": "tech"
    }
  ],
  "summary": {
    "insights": ["Insight 1", "Insight 2"],
    "recommendations": ["Action 1", "Action 2"]
  }
}`;

      console.log('🤖 Calling Gemini API for career recommendations...');
      
      // Check if API key is configured
      if (!apiKey) {
        console.warn('⚠️ GEMINI_API2_KEY not configured, using fallback');
        throw new Error('API key not configured');
      }
      
      try {
        const result = await Promise.race([
          this.model.generateContent(prompt),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Gemini timeout')), timeoutMs)
          )
        ]);
        
        const response = await result.response;
        const text = response.text();

        // Clean and extract JSON from response
        let jsonText = text.trim();
        
        // Remove markdown code blocks if present
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        
        // Extract JSON object from response (handle partial/incomplete JSON)
        const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          jsonText = jsonMatch[0];
        }
        
        // Fix incomplete JSON by closing any open structures
        // Try multiple times to fix nested issues
        let attempts = 0;
        while (attempts < 3) {
          try {
            JSON.parse(jsonText);
            break; // Valid JSON, exit loop
          } catch (e) {
            const oldText = jsonText;
            jsonText = fixIncompleteJSON(jsonText);
            if (oldText === jsonText) break; // No change, stop trying
            attempts++;
          }
        }
        
        // Parse JSON
        try {
          const careerData = JSON.parse(jsonText);
          
          // Validate and fix structure if needed
          if (!careerData.careerPaths || !Array.isArray(careerData.careerPaths)) {
            throw new Error('Invalid response structure');
          }
          
          // Ensure each career path has required fields
          careerData.careerPaths = careerData.careerPaths.map(path => ({
            title: path.title || 'Career Path',
            description: path.description || 'AI-generated career recommendation',
            matchScore: path.matchScore || 75,
            requiredSkills: Array.isArray(path.requiredSkills) ? path.requiredSkills.slice(0, 6) : [],
            educationPath: Array.isArray(path.educationPath) ? path.educationPath : [],
            estimatedTimeline: path.estimatedTimeline || '4-6 years',
            growthPotential: path.growthPotential || 'Strong growth potential in this field',
            startingSalaryRange: path.startingSalaryRange || '$50,000-$80,000',
            arVisualizationType: path.arVisualizationType || 'tech'
          }));
          
          console.log('✅ Career recommendations generated successfully');
          return careerData;
        } catch (parseError) {
          console.error('❌ JSON Parse Error:', parseError.message);
          console.error('Raw response preview:', jsonText.substring(0, 1000));
          // Try to extract partial data and build a valid response
          const partialData = extractPartialCareerData(jsonText);
          if (partialData && partialData.careerPaths && partialData.careerPaths.length > 0) {
            console.log('⚠️ Using partial data from incomplete response');
            return partialData;
          }
          throw new Error('Failed to parse AI response');
        }
      } catch (apiError) {
        if (apiError.message.includes('timeout')) {
          throw new Error('Gemini timeout');
        }
        throw apiError;
      }
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
