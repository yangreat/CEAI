const mongoose = require('mongoose');

const TrainingSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  exerciseType: {
    type: String,
    required: true
  },
  exerciseId: {
    type: String
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  score: {
    type: Number,
    default: 0
  },
  accuracy: {
    type: Number,
    default: 0
  },
  completionTime: {
    type: Number
  },
  targetTime: {
    type: Number
  },
  mistakes: {
    type: Number,
    default: 0
  },
  details: {
    type: Object
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster querying by user
TrainingSessionSchema.index({ userId: 1 });
// Index for faster querying by exercise type
TrainingSessionSchema.index({ exerciseType: 1 });
// Compound index for user's performance per exercise type
TrainingSessionSchema.index({ userId: 1, exerciseType: 1, createdAt: -1 });

module.exports = mongoose.model('TrainingSession', TrainingSessionSchema); 