import presentation from "../models/presentation.js";
import user from "../models/user.js";

export const createPresentation = async (req, res) => {
  try {
    const { title, owner } = req.body;

    const pres = await presentation.create({
      title,
      owner: owner,
      participants: [
        { user: owner, role: 'owner' }
      ],
      slides: [
        { elements: [] }
      ]
    });

    const populatedPres = await presentation
      .findById(pres._id)
      .populate('owner', 'nickname')

    const formatted = {
      _id: populatedPres._id,
      title: populatedPres.title,
      createdAt: populatedPres.createdAt,
      updatedAt: populatedPres.updatedAt,
      owner: populatedPres.owner.nickname,
    };

    res.status(201).json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getUserPresentations = async (req, res) => {
  try {
    const { userId } = req.params;

    const presentations = await presentation.find({
      'participants.user': userId
    })
    .populate('owner', 'nickname')

    const formatted = presentations.map(p => ({
      _id: p._id,
      title: p.title,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      owner: p.owner.nickname,
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const addParticipant = async (req, res) => {
  try {
    const { presentationId } = req.params;
    const { userId, role = 'viewer' } = req.body;

    const pres = await presentation.findById(presentationId);
    if (!pres) {
      return res.status(404).json({ error: 'Presentation not found' });
    }

    const alreadyParticipant = pres.participants.some(
      (p) => p.user.toString() === userId
    );
    if (alreadyParticipant) {
      return res.status(400).json({ error: 'User is already a participant' });
    }

    pres.participants.push({ user: userId, role });
    await pres.save();

    const populatedPres = await presentation
      .findById(presentationId)
      .populate('owner', 'nickname')

    const formatted = {
      _id: populatedPres._id,
      title: populatedPres.title,
      createdAt: populatedPres.createdAt,
      updatedAt: populatedPres.updatedAt,
      owner: populatedPres.owner.nickname,
    };

    res.status(200).json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getPresentationWithRole = async (req, res) => {
  try {
    const { presentationId } = req.params;
    const { userId } = req.query;

    const pres = await presentation
      .findById(presentationId)
      .populate('participants.user', 'nickname')
      .populate('owner', 'nickname');

    if (!pres) return res.status(404).json({ message: 'Not found' });

    let role = 'viewer';
    if (pres.owner._id.toString() === userId) {
      role = 'owner';
    } else {
      const participant = pres.participants.find(
        (p) => p.user._id.toString() === userId
      );
      if (participant) role = participant.role;
    }

    res.json({ presentation: pres, role });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const updatePresentation = async (req, res) => {
  try {
    const { slides } = req.body;
    const updated = await presentation.findByIdAndUpdate(
      req.params.presentationId,
      { slides },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ error: 'Presentation not found' });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
