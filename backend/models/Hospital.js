const mongoose = require('mongoose');

// Department status schema
const departmentStatusSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['green', 'yellow', 'red'],
    default: 'green'
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

// Hospital schema
const hospitalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  hospital_type: {
    type: String,
    enum: ["government", "private", "trust", "clinic"]
  },
  // GeoJSON = [longitude, latitude] and Math = (latitude, longitude)
  location: {
    type: {
      type: String,
      enum: ['Point']
    },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: function (v) {
          if (!Array.isArray(v) || v.length !== 2) return false;

          const [lng, lat] = v;

          return (
            typeof lng === "number" &&
            typeof lat === "number" &&
            lng >= -180 && lng <= 180 &&
            lat >= -90 && lat <= 90
          );
        },
        message: "Coordinates must be valid [longitude, latitude]"
      }
    }
  },

  contact: {
    emergency_phone: String,
    admin_phone: String,
    address: String,
    email: String
  },

  verification: {
    triage_policy_declared: Boolean,
    resuscitation_preparedness_declared: Boolean,
    staff_certification_declared: Boolean,
    stg_adherence_declared: Boolean,
    medico_legal_policy_declared: Boolean,
    disaster_preparedness_declared: Boolean
  },

  has_triage_area: Boolean,
  has_resuscitation_bay: Boolean,
  accepts_medico_legal_cases: Boolean,

  facilities: {
    has_er: { type: Boolean, default: true },
    has_24x7_doctors: { type: Boolean, default: false },
    has_icu: { type: Boolean, default: false },
    has_nicu: { type: Boolean, default: false },
    has_picu: { type: Boolean, default: false },
    has_ventilators: { type: Boolean, default: false },
    has_maternity_unit: { type: Boolean, default: false },
    has_trauma_center: { type: Boolean, default: false },
    has_burn_unit: { type: Boolean, default: false },
    has_cath_lab: { type: Boolean, default: false },
    has_dialysis: { type: Boolean, default: false },
    has_anti_venom: { type: Boolean, default: false }
  },

  status: {
    type: String,
    enum: ['green', 'yellow', 'red'],
    default: 'green'
  },
  department_status: {
    emergency_dept: departmentStatusSchema,
    icu: departmentStatusSchema,
    trauma_center: departmentStatusSchema,
    cath_lab: departmentStatusSchema,
    burn_unit: departmentStatusSchema,
    maternity: departmentStatusSchema,
    dialysis: departmentStatusSchema,
    operation_theater: departmentStatusSchema
  },

  staff: [
    {
      staff_code: String,
      access_code: String,
      role: {
        type: String,
        enum: ["admin", "staff"],
        default: "staff"
      }
    }
  ],

  status_logs: [
    {
      timestamp: {
        type: Date,
        default: Date.now
      },
      facility: String,       
      from: String,           
      to: String,              
      updated_by: String       
    }
  ],
  status_updated_at: {
    type: Date,
    default: Date.now
  },
  updated_by: String,

  insurance: {
    accepts_govt_schemes: { type: Boolean, default: true },
    empanelled_with: [String]
  }
}, {
  timestamps: true
});

hospitalSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Hospital', hospitalSchema);