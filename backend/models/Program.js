const mongoose = require('mongoose');
const quotaSchema = new mongoose.Schema({
  name: {
    type: String,
    enum: ['KCET', 'COMEDK', 'Management'],
    required: [true, 'Quota name is required'],
  },
  totalSeats: {
    type: Number,
    required: [true, 'Total seats for quota is required'],
    min: [0, 'Seats cannot be negative'],
  },
  filledSeats: {
    type: Number,
    default: 0,
    min: 0,
  },
});

quotaSchema.virtual('availableSeats').get(function () {
  return this.totalSeats - this.filledSeats;
});

const programSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Program name is required'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Program code is required'],
      uppercase: true,
      trim: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department is required'],
    },
    academicYear: {
      type: String,
      required: [true, 'Academic year is required'],
    },
    courseType: {
      type: String,
      enum: ['UG', 'PG'],
      required: [true, 'Course type is required'],
    },
    entryType: {
      type: String,
      enum: ['Regular', 'Lateral'],
      required: [true, 'Entry type is required'],
    },
    admissionMode: {
      type: String,
      enum: ['Government', 'Management', 'Both'],
      default: 'Both',
    },
    totalIntake: {
      type: Number,
      required: [true, 'Total intake is required'],
      min: [1, 'Intake must be at least 1'],
    },
    quotas: {
      type: [quotaSchema],
      validate: {
        validator: (arr) => arr.length > 0,
        message: 'At least one quota must be defined',
      },
    },
    supernumerarySeats: {
      type: Number,
      default: 0,
    },
    supernumeraryFilled: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Program', programSchema);
