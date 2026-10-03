const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const authMiddleware = require('../middleware/auth');

router.post('/analyze', authMiddleware, projectController.analyzeProject);
router.post('/compare', authMiddleware, projectController.compareProjects);
router.get('/user', authMiddleware, projectController.getUserProjects);
router.get('/', authMiddleware, projectController.getUserProjects);

module.exports = router;
