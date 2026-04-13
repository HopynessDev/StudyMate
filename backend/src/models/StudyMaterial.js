const mongoose = require('mongoose');

const studyMaterialSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['flashcard', 'quiz', 'summary'],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  subject: {
    type: String,
    trim: true
  },
  topic: {
    type: String,
    trim: true
  },
  content: {
    type: mongoose.Schema.Types.Mixed, // Flexible content for different material types
    required: true
  },
  originalText: {
    type: String // Store the extracted text from images
  },
  imageUrl: {
    type: String // URL to the uploaded image
  },
  language: {
    type: String,
    enum: ['en', 'es'],
    default: 'en'
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  tags: [{
    type: String,
    trim: true
  }],
  metadata: {
    wordCount: {
      type: Number,
      default: 0
    },
    estimatedStudyTime: {
      type: Number, // in minutes
      default: 5
    },
    aiGenerated: {
      type: Boolean,
      default: true
    }
  },
  progress: {
    totalItems: {
      type: Number,
      default: 0
    },
    completedItems: {
      type: Number,
      default: 0
    },
    lastStudiedAt: {
      type: Date
    },
    studyCount: {
      type: Number,
      default: 0
    }
  },
  isBookmarked: {
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

// Update the updatedAt field before saving
studyMaterialSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Indexes for better query performance
studyMaterialSchema.index({ user: 1, type: 1 });
studyMaterialSchema.index({ user: 1, subject: 1 });
studyMaterialSchema.index({ user: 1, createdAt: -1 });
studyMaterialSchema.index({ tags: 1 });

// Virtual for completion percentage
studyMaterialSchema.virtual('completionPercentage').get(function() {
  if (this.progress.totalItems === 0) return 0;
  return Math.round((this.progress.completedItems / this.progress.totalItems) * 100);
});

// Ensure virtuals are included in JSON
studyMaterialSchema.set('toJSON', { virtuals: true });
studyMaterialSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('StudyMaterial', studyMaterialSchema);