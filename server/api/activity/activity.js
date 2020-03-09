const mongoose = require('mongoose')
const Schema = mongoose.Schema
const idvalidator = require('mongoose-id-validator')
const { accessibleRecordsPlugin, accessibleFieldsPlugin } = require('@casl/mongoose')
const slug = require('limax')

const ActivitySchema = new Schema({
  name: { type: String, required: true }, // "Growing in the garden",
  slug: {
    type: String,
    index: { unique: true }
  },
  subtitle: String, // "Growing digitally in the garden",
  imgUrl: { type: String, required: true, default: '/static/img/activity/activity.png' },
  description: String, // "Project to grow something in the garden",
  duration: String, // "15 Minutes",
  offerOrg: { type: Schema.Types.ObjectId, ref: 'Organisation' },
  owner: { type: Schema.Types.ObjectId, ref: 'Person' },
  resource: {
    type: String,
    default: ''
  },
  volunteers: {
    type: Number,
    default: 1
  },
  space: {
    type: String,
    default: ''
  },
  time: {
    type: [Date]
  },
  tags: [String],
  equipment: {
    type: [String],
    default: []
  },
  status: {
    type: String,
    required: true,
    default: 'draft',
    enum: ['draft', 'active', 'retired']
  },
  fileUrls: {
    type: [String]
  },
},
{
  timestamps: true
})

ActivitySchema.pre('save', async function () {
  this.slug = slug(this.name)
})

ActivitySchema.plugin(idvalidator)
ActivitySchema.plugin(accessibleRecordsPlugin)
ActivitySchema.plugin(accessibleFieldsPlugin)
ActivitySchema.index({ tags: 1 })

// protect multiple imports
var Activity

if (mongoose.models.Activity) {
  Activity = mongoose.model('Activity')
} else {
  Activity = mongoose.model('Activity', ActivitySchema)
}

module.exports = Activity
