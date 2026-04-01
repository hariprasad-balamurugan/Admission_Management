const mongoose = require('mongoose');

const applicantSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Date of birth is required'],
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      required: [true, 'Gender is required'],
    },
    category: {
      type: String,
      enum: ['GM', 'SC', 'ST', 'OBC', 'EWS'],
      required: [true, 'Category is required'],
    },
    entryType: {
      type: String,
      enum: ['Regular', 'Lateral'],
      required: [true, 'Entry type is required'],
    },
    quotaType: {
      type: String,
      enum: ['KCET', 'COMEDK', 'Management'],
      required: [true, 'Quota type is required'],
    },
    program: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Program',
      required: [true, 'Program is required'],
    },
    qualifyingMarks: {
      type: Number,
      required: [true, 'Qualifying marks are required'],
      min: 0,
      max: 100,
    },
    allotmentNumber: {
      type: String,
      trim: true,
    },
    admissionMode: {
      type: String,
      enum: ['Government', 'Management'],
      required: [true, 'Admission mode is required'],
    },
    address: {
      type: String,
      trim: true,
    },
    parentName: {
      type: String,
      trim: true,
    },
        documentStatus: {
      type: String,
      enum: ['Pending', 'Submitted', 'Verified'],
      default: 'Pending',
    },

    feeStatus: {
      type: String,
      enum: ['Pending', 'Paid'],
      default: 'Pending',
    },
    seatAllocated: {
      type: Boolean,
      default: false,
    },
    admissionNumber: {
      type: String,
      unique: true,
      sparse: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);
applicantSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

module.exports = mongoose.model('Applicant', applicantSchema);
