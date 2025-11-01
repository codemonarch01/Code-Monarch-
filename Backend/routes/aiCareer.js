const express = require('express');
const router = express.Router();
const googleAIService = require('../services/googleAI');

// Simple relay endpoint: POST /api/getCareerPath { prompt }
router.post('/getCareerPath', async (req, res) => {
  try {
    const { prompt } = req.body || {};
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ status: 'error', message: 'prompt is required' });
    }
    // Try Gemini; if it fails, return canned suggestion
    try {
      const text = await googleAIService.generateEducationalResponse(prompt, { subject: 'Career Guidance' }, {});
      return res.json({ status: 'success', data: { careerPath: text } });
    } catch (e) {
      return res.json({ status: 'success', data: { careerPath: 'Based on your profile, explore Software Development, Data Science, or UI/UX Design. Start by strengthening programming fundamentals and building a small portfolio.' } });
    }
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'AI career path failed', error: error.message });
  }
});

module.exports = router;


