const express = require('express');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const { jwtKey } = require('../keys');
const User = require('../models/policePersonalSchema'); // Assuming User model path
const bcrypt = require('bcrypt');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// user registration/signup
router.post('/addPolicepersonal', upload.single('image'), async (req, res) => {
  const { fullName, phoneNumber, password, cnic, policeOfficerId, stationName } = req.body;
  const image = req.file.buffer;

  try {
    const existingUser = await User.findOne({ cnic });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const newUser = new User({
      fullName,
      phoneNumber: Number(phoneNumber),
      password,
      cnic: Number(cnic),
      policeOfficerId: Number(policeOfficerId),
      stationName,
      image
    });

    await newUser.save();
    res.status(201).json({ message: 'User Added successfully!', user: newUser });
  } catch (err) {
    console.error(err.message);
    res.status(422).send(err.message);
  }
});

// user login
router.post('/signin', async (req, res) => {
  const { cnic, password } = req.body;
  if (!cnic || !password) {
    return res.status(400).send('Please provide cnic and password');
  }

  try {
    const user = await User.findOne({ cnic });
    if (!user) {
      return res.status(401).send('cnic not found!');
    }

    await user.comparePassword(password);
    const token = jwt.sign({ _id: user._id }, jwtKey);
    res.json({ message: 'Signin successful!', token });
  } catch (err) {
    return res.status(401).send('Password not matched');
  }
});

// update user info
router.put('/updatePoliceInfo/:cnic', upload.single('image'), async (req, res) => {
  const { password, stationName, phoneNumber } = req.body;
  const { cnic } = req.params;

  try {
    let updateData = { stationName, phoneNumber: Number(phoneNumber) };

    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      updateData.password = hashedPassword;
    }

    const updatedUser = await User.findOneAndUpdate({ cnic: Number(cnic) }, updateData, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'Successfully Updated', user: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Remove user by CNIC
router.delete('/removePolicePersonal/:cnic', async (req, res) => {
  const { cnic } = req.params;

  try {
    const result = await User.findOneAndDelete({ cnic: Number(cnic) });
    if (!result) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User removed successfully', removedUser: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Check if CNIC exists
router.get('/checkCnic/:cnic', async (req, res) => {
  const { cnic } = req.params;

  try {
    const person = await User.findOne({ cnic: Number(cnic) });
    if (person) {
      const base64Image = person.image.toString('base64');
      res.set('Content-Type', 'image/png');
      res.json({ exists: true, person, image: base64Image });
    } else {
      res.json({ exists: false });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while checking the CNIC.' });
  }
});

// Get all users
router.get('/getAllUsers', async (req, res) => {
  try {
    const users = await User.find({});
    const usersWithImages = users.map(user => ({
      ...user.toObject(),
      image: user.image ? user.image.toString('base64') : null
    }));
    res.status(200).json(usersWithImages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
