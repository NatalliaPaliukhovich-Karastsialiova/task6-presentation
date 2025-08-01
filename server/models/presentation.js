import mongoose from 'mongoose';

const participantSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['owner', 'editor', 'viewer'], default: 'viewer' }
});

const slideSchema = new mongoose.Schema({
  title: { type: String, default: 'Untitled Slide' },
  elements: { type: Array, default: [] },
}, { timestamps: true });

const presentationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  participants: [participantSchema],
  slides: [slideSchema]
}, { timestamps: true });

export default mongoose.model('Presentation', presentationSchema);
