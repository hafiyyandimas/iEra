import { Router } from 'express';
import {
  deleteFavorite,
  getFavorites,
  putFavorite,
  putFavorites
} from '../controllers/favoriteController.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

router.get('/', requireAuth, getFavorites);
router.put('/', requireAuth, putFavorites);
router.put('/:animalId', requireAuth, putFavorite);
router.delete('/:animalId', requireAuth, deleteFavorite);

export default router;
