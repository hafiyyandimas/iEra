import { Router } from 'express';
import {
  createAnimal,
  deleteAnimal,
  getAnimal,
  getAnimals,
  getAnimalsByYear,
  replaceAnimal
} from '../controllers/animalController.js';
import { requireAdmin } from '../middleware/requireAdmin.js';

const router = Router();

router.get('/', getAnimals);
router.get('/year/:year', getAnimalsByYear);
router.get('/:id', getAnimal);
router.post('/', requireAdmin, createAnimal);
router.put('/:id', requireAdmin, replaceAnimal);
router.delete('/:id', requireAdmin, deleteAnimal);

export default router;
