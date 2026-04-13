const mongoose = require('mongoose');

const studySessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  materialId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudyMaterial',
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  duration: {
    type: Number, // in minutes
    required: true
  },
  itemsCompleted: {
    type: Number,
    default: 0
  },
  itemsCorrect: {
    type: Number,
    default: 0
  },
  performance: {
    type: Number, // percentage correct
    min: 0,
    max: 100
  },
  mood: {
    type: String,
    enum: ['focused', 'distracted', 'tired', 'energetic', 'neutral']
  },
  notes: {
    type: String,
    maxlength: 500,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const achievementSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['first-flashcard', 'first-quiz', 'study-streak', 'perfect-score', 'time-milestone'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    default: '🏆'
  },
  unlockedAt: {
    type: Date,
    default: Date.now
  },
  progress: {
    type: Number,
    default: 0
  },
  target: {
    type: Number,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  }
});

const goalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['daily-study-time', 'weekly-materials', 'quiz-accuracy', 'study-streak'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  targetValue: {
    type: Number,
    required: true
  },
  currentValue: {
    type: Number,
    default: 0
  },
  period: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    default: 'daily'
  },
  deadline: {
    type: Date
  },
  completed: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for performance
studySessionSchema.index({ user: 1, startTime: -1 });
studySessionSchema.index({ user: 1, materialId: 1 });
achievementSchema.index({ user: 1, completed: 1 });
goalSchema.index({ user: 1, completed: 1, deadline: 1 });

// Update goal timestamps
goalSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const StudySession = mongoose.model('StudySession', studySessionSchema);
const Achievement = mongoose.model('Achievement', achievementSchema);
const Goal = mongoose.model('Goal', goalSchema);

module.exports = {
  StudySession,
  Achievement,
  Goal
};