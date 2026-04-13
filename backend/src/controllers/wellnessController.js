const Wellness = require('../models/Wellness');

/**
 * Record daily wellness data
 */
exports.recordWellness = async (req, res) => {
  try {
    const {
      stressLevel,
      mood,
      activities,
      notes,
      sleepQuality,
      relaxationSession
    } = req.body;

    // Validate required fields
    if (!stressLevel || !mood) {
      return res.status(400).json({
        success: false,
        message: 'Stress level and mood are required'
      });
    }

    // Validate stress level
    if (stressLevel < 1 || stressLevel > 10) {
      return res.status(400).json({
        success: false,
        message: 'Stress level must be between 1 and 10'
      });
    }

    // Check if user already has a record for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingRecord = await Wellness.findOne({
      user: req.user.id,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });

    let wellnessRecord;

    if (existingRecord) {
      // Update existing record
      const updateFields = {
        stressLevel,
        mood,
        activities: activities || existingRecord.activities,
        notes: notes || existingRecord.notes,
        sleepQuality: sleepQuality || existingRecord.sleepQuality
      };

      if (relaxationSession) {
        updateFields.relaxationSession = relaxationSession;
      }

      wellnessRecord = await Wellness.findByIdAndUpdate(
        existingRecord._id,
        updateFields,
        { new: true }
      );

      res.json({
        success: true,
        message: 'Wellness record updated successfully',
        data: { record: wellnessRecord }
      });
    } else {
      // Create new record
      wellnessRecord = await Wellness.create({
        user: req.user.id,
        stressLevel,
        mood,
        activities: activities || [],
        notes,
        sleepQuality,
        relaxationSession,
        date: new Date()
      });

      res.status(201).json({
        success: true,
        message: 'Wellness record created successfully',
        data: { record: wellnessRecord }
      });
    }

  } catch (error) {
    console.error('Record wellness error:', error);
    res.status(500).json({
      success: false,
      message: 'Error recording wellness data',
      error: error.message
    });
  }
};

/**
 * Get wellness history
 */
exports.getWellnessHistory = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const limit = parseInt(days);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - limit);

    const records = await Wellness.find({
      user: req.user.id,
      date: { $gte: startDate }
    }).sort({ date: -1 });

    res.json({
      success: true,
      data: {
        records,
        count: records.length
      }
    });

  } catch (error) {
    console.error('Get wellness history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching wellness history',
      error: error.message
    });
  }
};

/**
 * Get wellness trends and analytics
 */
exports.getWellnessTrends = async (req, res) => {
  try {
    const { days = 7 } = req.query;

    const trends = await Wellness.getTrends(req.user.id, parseInt(days));

    res.json({
      success: true,
      data: { trends }
    });

  } catch (error) {
    console.error('Get wellness trends error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching wellness trends',
      error: error.message
    });
  }
};

/**
 * Get relaxation content
 */
exports.getRelaxationContent = async (req, res) => {
  try {
    const { type } = req.query;

    const relaxationContent = {
      breathing: [
        {
          id: 'box-breathing',
          name: 'Box Breathing',
          description: 'A simple breathing technique to reduce stress',
          duration: 5,
          steps: [
            'Breathe in slowly for 4 seconds',
            'Hold your breath for 4 seconds',
            'Exhale slowly for 4 seconds',
            'Hold empty lungs for 4 seconds',
            'Repeat for desired duration'
          ]
        },
        {
          id: '4-7-8-breathing',
          name: '4-7-8 Breathing',
          description: 'A breathing pattern that helps with relaxation',
          duration: 3,
          steps: [
            'Breathe in through your nose for 4 seconds',
            'Hold your breath for 7 seconds',
            'Exhale completely through your mouth for 8 seconds',
            'Repeat for desired duration'
          ]
        }
      ],
      meditation: [
        {
          id: 'body-scan',
          name: 'Body Scan Meditation',
          description: 'Progressive muscle relaxation technique',
          duration: 10,
          steps: [
            'Find a comfortable position and close your eyes',
            'Focus on your breathing for a few moments',
            'Starting from your toes, notice any sensations',
            'Slowly move up through your body, relaxing each area',
            'Pay attention to muscles, joints, and feelings',
            'When you reach your head, take a deep breath',
            'Slowly open your eyes when ready'
          ]
        },
        {
          id: 'mindfulness',
          name: 'Mindfulness Meditation',
          description: 'Present moment awareness practice',
          duration: 5,
          steps: [
            'Sit comfortably and close your eyes',
            'Focus on your natural breathing',
            'Notice thoughts without judgment',
            'Gently return focus to breathing when distracted',
            'Practice non-judgmental awareness'
          ]
        }
      ],
      'guided-relaxation': [
        {
          id: 'progressive-relaxation',
          name: 'Progressive Muscle Relaxation',
          description: 'Systematically relax muscle groups',
          duration: 15,
          steps: [
            'Find a quiet, comfortable place to lie down',
            'Start with your toes, tense and then relax',
            'Move to your feet, tense and then relax',
            'Continue up through each muscle group',
            'Tense each group for 5 seconds, then release',
            'Notice the difference between tension and relaxation',
            'Complete with your facial muscles'
          ]
        }
      ]
    };

    const content = type ? relaxationContent[type] : relaxationContent;

    res.json({
      success: true,
      data: { content }
    });

  } catch (error) {
    console.error('Get relaxation content error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching relaxation content',
      error: error.message
    });
  }
};

/**
 * Get mental health resources
 */
exports.getMentalHealthResources = async (req, res) => {
  try {
    const resources = [
      {
        category: 'Stress Management',
        items: [
          {
            title: 'Understanding Stress',
            description: 'Learn about the causes and effects of stress',
            type: 'article',
            url: '#stress-understanding'
          },
          {
            title: 'Stress Reduction Techniques',
            description: 'Practical methods to manage daily stress',
            type: 'guide',
            url: '#stress-reduction'
          }
        ]
      },
      {
        category: 'Mental Wellness',
        items: [
          {
            title: 'Building Resilience',
            description: 'Develop mental strength and flexibility',
            type: 'article',
            url: '#resilience'
          },
          {
            title: 'Mindfulness Practices',
            description: 'Incorporate mindfulness into daily life',
            type: 'guide',
            url: '#mindfulness'
          }
        ]
      },
      {
        category: 'Study-Related Wellness',
        items: [
          {
            title: 'Managing Exam Stress',
            description: 'Coping strategies for test anxiety',
            type: 'guide',
            url: '#exam-stress'
          },
          {
            title: 'Healthy Study Habits',
            description: 'Balance productivity and wellbeing',
            type: 'article',
            url: '#study-habits'
          }
        ]
      },
      {
        category: 'Professional Help',
        items: [
          {
            title: 'When to Seek Help',
            description: 'Signs that professional support may be needed',
            type: 'resource',
            url: '#seek-help'
          },
          {
            title: 'Finding a Counselor',
            description: 'How to find mental health support',
            type: 'resource',
            url: '#find-counselor'
          }
        ]
      }
    ];

    res.json({
      success: true,
      data: { resources }
    });

  } catch (error) {
    console.error('Get mental health resources error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching mental health resources',
      error: error.message
    });
  }
};