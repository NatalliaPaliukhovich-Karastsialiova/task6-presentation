import presentation from "../models/presentation.js";

export const getPresentationWithRole = async (data) => {
  try {

    const {presentationId, userId} = data

    const pres = await presentation
      .findById(presentationId)
      .populate('participants.user', 'nickname')
      .populate('owner', 'nickname');

    if (!pres) throw new Error({ message: 'Not found' });

    let role = 'viewer';
    if (pres.owner._id.toString() === userId) {
      role = 'owner';
    } else {
      const participant = pres.participants.find(
        (p) => p.user._id.toString() === userId
      );
      if (participant) role = participant.role;
    }

    return { presentation: pres, role };
  } catch (err) {
    throw new Error(err.message);
  }
};

export const updateParticipantRole = async (data) => {
  try {
    const { presentationId, participantId, role } = data;

    if (!['viewer', 'editor'].includes(role)) throw new Error({ error: 'Invalid role' });

    const pres = await presentation.findById(presentationId);
    if (!pres) throw new Error({ error: 'Presentation not found' });

    const participant = pres.participants.id(participantId);
    if (!participant) throw new Error({ error: 'Participant not found' });

    participant.role = role;
    await pres.save();

    const updated = await presentation
      .findById(presentationId)
      .populate('participants.user', 'nickname');

    return updated.participants;
  } catch (err) {
    throw new Error({ error: err.message });
  }
};

export const updatePresentation = async (data) => {
  try {
    const { presentationId, slides } = data;

    const updated = await presentation.findByIdAndUpdate(
      presentationId,
      { slides },
      { new: true }
    );
    if (!updated) throw new Error({ error: 'Presentation not found' });

    return updated.slides;
  } catch (err) {
    throw new Error({ error: err.message });
  }
};
