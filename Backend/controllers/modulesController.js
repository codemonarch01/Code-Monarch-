const MODULES = [
  {
    id: 'tree-planting',
    title: 'Tree Planting',
    description: 'Learn the basics of tree planting and practice via AR.',
    type: 'ar_quiz'
  },
  {
    id: 'waste-segregation',
    title: 'Waste Segregation',
    description: 'Identify and sort waste correctly through interactive challenges.',
    type: 'quiz'
  },
  {
    id: 'climate-change',
    title: 'Climate Change Awareness',
    description: 'Understand climate change impacts with visualizations and a short quiz.',
    type: 'video_quiz'
  }
];

// GET /api/modules
const getModules = async (req, res) => {
  try {
    return res.json({
      status: 'success',
      data: { modules: MODULES }
    });
  } catch (error) {
    console.error('Get modules error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch modules',
      error: error.message
    });
  }
};

module.exports = { getModules };


