const express = require('express');
const router = express.Router();
const skillPathService = require('../services/skillPathService');
const { authenticateToken } = require('../middleware/auth');


router.post('/recommend', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const userData = req.body;

    // Merge user data from request with authenticated user info
    const profileData = {
      ...userData,
      userId,
      name: req.user.name || userData.name,
      email: req.user.email || userData.email
    };

    console.log('🎯 Generating career recommendations for user:', userId);

    // Try AI generation with increased timeout
    try {
      const recommendations = await skillPathService.generateCareerRecommendations(profileData, { 
        useStatic: false,
        timeoutMs: 30000 // 30 seconds
      });

      res.json({
        status: 'success',
        message: 'Career recommendations generated successfully',
        data: recommendations
      });
    } catch (aiError) {
      // If AI fails (timeout or other error), use fallback
      console.warn('⚠️ AI generation failed, using fallback:', aiError.message);
      const fallbackRecommendations = await skillPathService.generateCareerRecommendations(profileData, { 
        useStatic: true 
      });

      res.json({
        status: 'success',
        message: 'Career recommendations generated (using fallback due to AI timeout)',
        data: fallbackRecommendations,
        warning: 'AI service timed out, showing rule-based recommendations'
      });
    }
  } catch (error) {
    console.error('❌ Skill Path Recommendation Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate career recommendations',
      error: error.message
    });
  }
});


router.post('/visualize', authenticateToken, async (req, res) => {
  try {
    const { skillName, careerTitle } = req.body;

    if (!skillName) {
      return res.status(400).json({
        status: 'error',
        message: 'Skill name is required'
      });
    }

    console.log('🎨 Generating visualization for skill:', skillName);

    const visualizationData = await skillPathService.generateSkillVisualizationData(
      skillName,
      careerTitle || ''
    );

    res.json({
      status: 'success',
      message: 'Visualization data generated successfully',
      data: visualizationData
    });
  } catch (error) {
    console.error('❌ Visualization Generation Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate visualization',
      error: error.message
    });
  }
});


router.get('/sample', async (req, res) => {
  try {
    const sampleData = {
      name: 'Sample Student',
      grade: '10th',
      subject: 'STEM',
      completedTopics: ['Algebra', 'Basic Programming'],
      interests: ['Technology', 'Innovation'],
      strengths: ['Problem Solving', 'Analytical Thinking'],
      academicPerformance: {
        average: 85,
        math: 88,
        science: 87
      },
      preferences: {
        workType: 'flexible',
        industry: 'technology'
      }
    };

    console.log('🎯 Generating sample career recommendations (static fallback)...');

    // Return static recommendations immediately to avoid external latency in sample mode
    const recommendations = await skillPathService.generateCareerRecommendations(sampleData, { useStatic: true });

    res.json({
      status: 'success',
      message: 'Sample recommendations generated successfully',
      data: recommendations
    });
  } catch (error) {
    console.error('❌ Sample Recommendation Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate sample recommendations',
      error: error.message
    });
  }
});

module.exports = router;
