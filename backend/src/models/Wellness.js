const mongoose = require('mongoose');

const wellnessRecordSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  stressLevel: {
    type: Number,
    required: true,
    min: 1,
    max: 10,
    validate: {
      validator: Number.isInteger,
      message: 'Stress level must be an integer'
    }
  },
  mood: {
    type: String,
    enum: ['very-happy', 'happy', 'neutral', 'sad', 'very-sad'],
    required: true
  },
  activities: [{
    type: String,
    enum: ['meditation', 'breathing-exercise', 'stretching', 'walk', 'music', 'reading', 'other']
  }],
  notes: {
    type: String,
    maxlength: 500,
    trim: true
  },
  sleepQuality: {
    type: Number,
    min: 1,
    max: 10,
    validate: {
      validator: Number.isInteger,
      message: 'Sleep quality must be an integer'
    }
  },
  relaxationSession: {
    type: {
      type: String,
      enum: ['breathing', 'meditation', 'guided-relaxation'],
      required: true
    },
    duration: {
      type: Number, // in minutes
      required: true
    },
    completed: {
      type: Boolean,
      default: false
    }
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient querying of wellness records
wellnessRecordSchema.index({ user: 1, date: -1 });
wellnessRecordSchema.index({ user: 1, date: { $gte: new Date() } });

// Static method to get wellness trends
wellnessRecordSchema.statics.getTrends = async function(userId, days = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const records = await this.find({
    user: userId,
    date: { $gte: startDate }
  }).sort({ date: 1 });

  if (records.length === 0) {
    return {
      averageStress: 0,
      moodDistribution: {},
      activityFrequency: {},
      trend: 'stable'
    };
  }

  const totalStress = records.reduce((sum, record) => sum + record.stressLevel, 0);
  const averageStress = totalStress / records.length;

  const moodDistribution = records.reduce((dist, record) => {
    dist[record.mood] = (dist[record.mood] || 0) + 1;
    return dist;
  }, {});

  const activityFrequency = records.reduce((freq, record) => {
    record.activities.forEach(activity => {
      freq[activity] = (freq[activity] || 0) + 1;
    });
    return freq;
  }, {});

  // Calculate trend
  const recentStress = records.slice(-3).reduce((sum, r) => sum + r.stressLevel, 0) / 3;
  const olderStress = records.slice(0, -3).length > 0
    ? records.slice(0, -3).reduce((sum, r) => sum + r.stressLevel, 0) / records.slice(0, -3).length
    : recentStress;

  let trend = 'stable';
  if (recentStress < olderStress - 1) trend = 'improving';
  else if (recentStress > olderStress + 1) trend = 'declining';

  return {
    averageStress: Math.round(averageStress * 10) / 10,
    moodDistribution,
    activityFrequency,
    trend,
    recordCount: records.length
  };
};

module.exports = mongoose.model('Wellness', wellnessRecordSchema);