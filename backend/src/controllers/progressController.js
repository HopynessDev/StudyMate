const { StudySession, Achievement, Goal } = require('../models/Progress');
const StudyMaterial = require('../models/StudyMaterial');

/**
 * Record a study session
 */
exports.recordSession = async (req, res) => {
  try {
    const {
      materialId,
      startTime,
      endTime,
      duration,
      itemsCompleted,
      itemsCorrect,
      mood,
      notes
    } = req.body;

    // Validate required fields
    if (!materialId || !startTime || !endTime || !duration) {
      return res.status(400).json({
        success: false,
        message: 'Material ID, start time, end time, and duration are required'
      });
    }

    // Check if material exists and belongs to user
    const material = await StudyMaterial.findOne({
      _id: materialId,
      user: req.user.id
    });

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Study material not found'
      });
    }

    // Calculate performance percentage
    let performance = null;
    if (itemsCorrect !== undefined && itemsCompleted !== undefined && itemsCompleted > 0) {
      performance = Math.round((itemsCorrect / itemsCompleted) * 100);
    }

    // Create study session
    const session = await StudySession.create({
      user: req.user.id,
      materialId,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      duration,
      itemsCompleted,
      itemsCorrect,
      performance,
      mood,
      notes
    });

    // Update material progress
    if (itemsCompleted !== undefined) {
      material.progress.completedItems = Math.min(itemsCompleted, material.progress.totalItems);
      material.progress.lastStudiedAt = new Date();
      material.progress.studyCount += 1;
      await material.save();
    }

    // Check for achievements
    await checkAchievements(req.user.id);

    res.status(201).json({
      success: true,
      message: 'Study session recorded successfully',
      data: { session }
    });

  } catch (error) {
    console.error('Record session error:', error);
    res.status(500).json({
      success: false,
      message: 'Error recording study session',
      error: error.message
    });
  }
};

/**
 * Get study sessions
 */
exports.getSessions = async (req, res) => {
  try {
    const { startDate, endDate, materialId, page = 1, limit = 20 } = req.query;

    const query = { user: req.user.id };

    if (materialId) query.materialId = materialId;
    if (startDate) query.startTime = { $gte: new Date(startDate) };
    if (endDate) {
      if (query.startTime) {
        query.startTime.$lte = new Date(endDate);
      } else {
        query.startTime = { $lte: new Date(endDate) };
      }
    }

    const skip = (page - 1) * limit;

    const sessions = await StudySession.find(query)
      .populate('materialId', 'title type subject')
      .sort({ startTime: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await StudySession.countDocuments(query);

    res.json({
      success: true,
      data: {
        sessions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching study sessions',
      error: error.message
    });
  }
};

/**
 * Get study statistics
 */
exports.getStatistics = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const limit = parseInt(days);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - limit);

    // Get sessions within date range
    const sessions = await StudySession.find({
      user: req.user.id,
      startTime: { $gte: startDate }
    });

    // Calculate statistics
    const totalSessions = sessions.length;
    const totalStudyTime = sessions.reduce((sum, session) => sum + session.duration, 0);
    const avgSessionDuration = totalSessions > 0 ? totalStudyTime / totalSessions : 0;

    // Performance statistics
    const sessionsWithPerformance = sessions.filter(s => s.performance !== null);
    const avgPerformance = sessionsWithPerformance.length > 0
      ? sessionsWithPerformance.reduce((sum, s) => sum + s.performance, 0) / sessionsWithPerformance.length
      : 0;

    // Study streak (consecutive days)
    const studyDays = [...new Set(sessions.map(s => s.startTime.toDateString()))].sort((a, b) =>
      new Date(b) - new Date(a)
    );

    let currentStreak = 0;
    if (studyDays.length > 0) {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const checkDate = studyDays.includes(today.toDateString()) ? today : yesterday;

      for (let i = 0; i < studyDays.length; i++) {
        const expectedDate = new Date(checkDate);
        expectedDate.setDate(expectedDate.getDate() - i);

        if (studyDays.includes(expectedDate.toDateString())) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    // Material type breakdown
    const materialTypeBreakdown = {};
    sessions.forEach(session => {
      const type = session.materialId?.type || 'unknown';
      if (!materialTypeBreakdown[type]) {
        materialTypeBreakdown[type] = 0;
      }
      materialTypeBreakdown[type] += session.duration;
    });

    // Mood breakdown
    const moodBreakdown = sessions.reduce((breakdown, session) => {
      if (session.mood) {
        breakdown[session.mood] = (breakdown[session.mood] || 0) + 1;
      }
      return breakdown;
    }, {});

    res.json({
      success: true,
      data: {
        statistics: {
          totalSessions,
          totalStudyTime,
          avgSessionDuration: Math.round(avgSessionDuration),
          avgPerformance: Math.round(avgPerformance),
          currentStreak,
          studyDays: studyDays.length,
          materialTypeBreakdown,
          moodBreakdown
        },
        period: {
          days: limit,
          startDate,
          endDate: new Date()
        }
      }
    });

  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
};

/**
 * Get achievements
 */
exports.getAchievements = async (req, res) => {
  try {
    const achievements = await Achievement.find({
      user: req.user.id
    }).sort({ completed: -1, unlockedAt: -1 });

    res.json({
      success: true,
      data: { achievements }
    });

  } catch (error) {
    console.error('Get achievements error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching achievements',
      error: error.message
    });
  }
};

/**
 * Get goals
 */
exports.getGoals = async (req, res) => {
  try {
    const { status } = req.query;

    const query = { user: req.user.id };
    if (status === 'active') {
      query.completed = false;
    } else if (status === 'completed') {
      query.completed = true;
    }

    const goals = await Goal.find(query)
      .sort({ completed: 1, deadline: 1 });

    res.json({
      success: true,
      data: { goals }
    });

  } catch (error) {
    console.error('Get goals error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching goals',
      error: error.message
    });
  }
};

/**
 * Create a goal
 */
exports.createGoal = async (req, res) => {
  try {
    const { type, title, targetValue, period, deadline } = req.body;

    // Validate required fields
    if (!type || !title || !targetValue) {
      return res.status(400).json({
        success: false,
        message: 'Type, title, and target value are required'
      });
    }

    const goal = await Goal.create({
      user: req.user.id,
      type,
      title,
      targetValue,
      period: period || 'daily',
      deadline: deadline ? new Date(deadline) : null
    });

    res.status(201).json({
      success: true,
      message: 'Goal created successfully',
      data: { goal }
    });

  } catch (error) {
    console.error('Create goal error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating goal',
      error: error.message
    });
  }
};

/**
 * Update goal progress
 */
exports.updateGoalProgress = async (req, res) => {
  try {
    const { currentValue, completed } = req.body;

    const goal = await Goal.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    if (currentValue !== undefined) {
      goal.currentValue = currentValue;
      goal.completed = goal.currentValue >= goal.targetValue;
    }

    if (typeof completed === 'boolean') {
      goal.completed = completed;
    }

    await goal.save();

    res.json({
      success: true,
      message: 'Goal progress updated successfully',
      data: { goal }
    });

  } catch (error) {
    console.error('Update goal progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating goal progress',
      error: error.message
    });
  }
};

/**
 * Delete a goal
 */
exports.deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    await goal.deleteOne();

    res.json({
      success: true,
      message: 'Goal deleted successfully'
    });

  } catch (error) {
    console.error('Delete goal error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting goal',
      error: error.message
    });
  }
};

/**
 * Check and update achievements
 */
async function checkAchievements(userId) {
  try {
    const sessions = await StudySession.find({ user: userId });
    const materials = await StudyMaterial.find({ user: userId });

    // Define achievement criteria
    const achievementTypes = [
      {
        type: 'first-flashcard',
        title: 'Flashcard Beginner',
        description: 'Create your first set of flashcards',
        icon: '🎴',
        check: async () => {
          return await StudyMaterial.exists({
            user: userId,
            type: 'flashcard'
          });
        }
      },
      {
        type: 'first-quiz',
        title: 'Quiz Master',
        description: 'Complete your first quiz',
        icon: '📝',
        check: async () => {
          return await StudySession.exists({
            user: userId,
            'materialId.type': 'quiz'
          });
        }
      },
      {
        type: 'study-streak',
        title: 'Study Streak',
        description: 'Study for 3 consecutive days',
        icon: '🔥',
        target: 3,
        check: async () => {
          const uniqueDays = new Set(sessions.map(s => s.startTime.toDateString()));
          return uniqueDays.size >= 3;
        }
      },
      {
        type: 'perfect-score',
        title: 'Perfect Score',
        description: 'Achieve 100% on a quiz',
        icon: '💯',
        check: async () => {
          return sessions.some(s => s.performance === 100);
        }
      },
      {
        type: 'time-milestone',
        title: 'Dedicated Student',
        description: 'Study for 60 minutes total',
        icon: '⏱️',
        target: 60,
        check: async () => {
          const totalMinutes = sessions.reduce((sum, s) => sum + s.duration, 0);
          return totalMinutes >= 60;
        }
      }
    ];

    for (const achievementType of achievementTypes) {
      const existingAchievement = await Achievement.findOne({
        user: userId,
        type: achievementType.type
      });

      if (!existingAchievement) {
        const isUnlocked = await achievementType.check();

        if (isUnlocked) {
          await Achievement.create({
            user: userId,
            type: achievementType.type,
            title: achievementType.title,
            description: achievementType.description,
            icon: achievementType.icon,
            target: achievementType.target || 1,
            progress: achievementType.target || 1,
            completed: true
          });
        }
      } else if (!existingAchievement.completed) {
        // Update progress for incomplete achievements
        const isUnlocked = await achievementType.check();
        existingAchievement.completed = isUnlocked;
        if (isUnlocked) {
          existingAchievement.progress = existingAchievement.target;
        }
        await existingAchievement.save();
      }
    }

  } catch (error) {
    console.error('Check achievements error:', error);
  }
}

module.exports = { ...exports, checkAchievements };