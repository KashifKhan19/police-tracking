const express = require('express');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const { jwtKey } = require('../keys');
// const User = require('../models/policePersonalSchema'); // Assuming User model path
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const User = mongoose.model('PolicePersonal');
const Station = mongoose.model('StationLocation');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

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
    res.json({ message: 'Signin successful!', token: token });
  } catch (err) {
    return res.status(401).send('Password not matched');
  }
});

router.get('/myStation', async (req, res) => {
  const authorization = req.headers.authorization
  try {
    const decoded = jwt.verify(authorization, jwtKey);
    const user = await User.findOne({ _id: decoded._id });
    
    const cnic = user.cnic;
    const station = await Station.findOne({ assignedPersonnel: cnic });
    res.json({ message: 'Station found!', station: station, user: user });
  } catch (err) {
    console.log(err);
    res.status(401).send('Unauthorized');
  }
})

router.post('/updatelocation', async (req, res) => {
  const { latitude, longitude, authorization} = req.body;
  // const authorization = req.headers.authorization
  console.log('123',authorization)
  console.log('1223',latitude, longitude)

  if (!authorization) {
    return res.status(401).send('Authorization header is missing');
  }

  try {
    // const token = authorization.split(' ')[1];  // Assuming 'Bearer token'
    const decoded = jwt.verify(authorization, jwtKey);
    const user = await User.findOne({ _id: decoded._id });

    if (!user) {
      return res.status(404).send('User not found');
    }

    user.location.cords = [latitude, longitude];
    await user.save();
    res.json({ message: 'Location updated!' });
  } catch (err) {
    console.log('Error updating location:', err);
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).send('Unauthorized: Invalid token');
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).send('Unauthorized: Token expired');
    }
    res.status(500).send('Internal Server Error');
  }
});


module.exports = router;
