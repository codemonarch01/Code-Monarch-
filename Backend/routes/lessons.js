const express = require('express');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const Topic = require('../models/Topic');
const Progress = require('../models/Progress');

const router = express.Router();

// GET /api/lessons - list video lessons (topics with videoUrl)
router.get('/lessons', optionalAuth, async (req, res) => {
  try {
    const topics = await Topic.find({ isPublished: true, 'content.videoUrl': { $exists: true, $ne: '' } })
      .select('title description content.videoUrl')
      .sort({ createdAt: -1 })
      .limit(50);

    const lessons = topics.map(t => ({
      id: t._id,
      title: t.title,
      description: t.description,
      videoUrl: t.content?.videoUrl || ''
    }));

    res.json(lessons);
  } catch (err) {
    console.error('List lessons error:', err);
    res.status(500).json({ message: 'Failed to fetch lessons' });
  }
});

// GET /api/notes/:lessonId - get personal notes for a lesson (from Progress.notes)
router.get('/notes/:lessonId', optionalAuth, async (req, res) => {
  try {
    const { lessonId } = req.params;

    if (!req.user) {
      // Not authenticated, return empty notes so UI still works
      return res.json({ notes: '' });
    }

    const topic = await Topic.findById(lessonId).populate('course');
    if (!topic) return res.status(404).json({ message: 'Lesson not found' });

    const progress = await Progress.findOne({ user: req.user._id, course: topic.course._id, topic: topic._id });

    const notes = progress?.notes?.map(n => n.content).join('\n') || '';
    res.json({ notes });
  } catch (err) {
    console.error('Get notes error:', err);
    res.status(500).json({ message: 'Failed to fetch notes' });
  }
});

// POST /api/notes/:lessonId - save/replace personal notes for a lesson
router.post('/notes/:lessonId', authenticateToken, async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { notes } = req.body;

    const topic = await Topic.findById(lessonId).populate('course');
    if (!topic) return res.status(404).json({ message: 'Lesson not found' });

    let progress = await Progress.findOne({ user: req.user._id, course: topic.course._id, topic: topic._id });
    if (!progress) {
      progress = new Progress({ user: req.user._id, course: topic.course._id, topic: topic._id });
    }

    // Replace existing notes with a single consolidated note entry
    progress.notes = [];
    if (notes && notes.trim().length > 0) {
      progress.notes.push({ content: notes.trim(), timestamp: 0 });
    }

    await progress.save();
    res.json({ message: 'Notes saved' });
  } catch (err) {
    console.error('Save notes error:', err);
    res.status(500).json({ message: 'Failed to save notes' });
  }
});

// GET /api/comments/:lessonId - fetch comments for a lesson
router.get('/comments/:lessonId', async (req, res) => {
  try {
    const { lessonId } = req.params;
    const topic = await Topic.findById(lessonId).populate('comments.user', 'name');
    if (!topic) return res.status(404).json({ message: 'Lesson not found' });

    const comments = topic.comments.map(c => ({ id: c._id, author: c.user?.name || 'User', content: c.content, time: c.timestamp }));
    res.json(comments);
  } catch (err) {
    console.error('Get comments error:', err);
    res.status(500).json({ message: 'Failed to fetch comments' });
  }
});

// POST /api/comments/:lessonId - add a comment to a lesson
router.post('/comments/:lessonId', authenticateToken, async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { content, timestamp = 0 } = req.body;

    const topic = await Topic.findById(lessonId);
    if (!topic) return res.status(404).json({ message: 'Lesson not found' });

    await topic.addComment(req.user._id, content, timestamp);
    res.status(201).json({ message: 'Comment added' });
  } catch (err) {
    console.error('Add comment error:', err);
    res.status(500).json({ message: 'Failed to add comment' });
  }
});

// POST /api/progress/:lessonId - save playback progress (maps to Progress.updateProgress)
router.post('/progress/:lessonId', authenticateToken, async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { currentTime = 0 } = req.body; // seconds

    const topic = await Topic.findById(lessonId).populate('course');
    if (!topic) return res.status(404).json({ message: 'Lesson not found' });

    let progress = await Progress.findOne({ user: req.user._id, course: topic.course._id, topic: topic._id });
    if (!progress) {
      progress = new Progress({ user: req.user._id, course: topic.course._id, topic: topic._id });
    }

    // Estimate percent based on available duration if present
    let percent = 0;
    if (topic.content?.videoDuration && topic.content.videoDuration > 0) {
      percent = Math.min(100, Math.round((currentTime / topic.content.videoDuration) * 100));
    }

    // Convert seconds to minutes for timeSpent
    const minutes = Math.max(0, Math.round(currentTime / 60));

    await progress.updateProgress(percent, minutes);
    res.json({ message: 'Progress saved', progress });
  } catch (err) {
    console.error('Save progress error:', err);
    res.status(500).json({ message: 'Failed to save progress' });
  }
});

module.exports = router;
