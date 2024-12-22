const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

router.post('/addPolicePersonal', upload.single('image'), userController.addPolicePersonal);
router.put('/updatePoliceInfo/:cnic', upload.single('image'), userController.updatePoliceInfo);
router.delete('/removePolicePersonal/:cnic', userController.removePolicePersonal);
router.get('/checkCnic/:cnic', userController.checkCnic);
router.get('/getAllUsers', userController.getAllUsers);

module.exports = router;
