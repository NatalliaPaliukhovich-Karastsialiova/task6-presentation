import express from 'express';
import {
  createPresentation,
  getPresentationWithRole,
  getUserPresentations,
  addParticipant,
  updatePresentation
} from '../controllers/presentationController.js';

const router = express.Router();

router.post('/', createPresentation);
router.get('/user/:userId', getUserPresentations);
router.post('/:presentationId/participants', addParticipant);
router.get('/:presentationId', getPresentationWithRole);
router.patch('/:presentationId', updatePresentation);

export default router;
