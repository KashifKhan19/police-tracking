const StationLocation = require('../models/stationLocation'); // Assuming StationLocation model path

// Add a new station
exports.addStation = async (req, res) => {
  const { stationName, stationAddress, stationCords, areaCords } = req.body;

  if (areaCords.length !== 4) {
    return res.status(400).json({ message: 'Area must have exactly 4 coordinates.' });
  }

  const station = new StationLocation({
    name: stationName,
    address: stationAddress,
    stationLocation: { cords: stationCords.split(',').map(Number) },
    area: areaCords.map(cord => cord.split(',').map(Number)),
  });

  try {
    await station.save();
    res.status(201).json(station);
  } catch (error) {
    console.error('Error adding station:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET all stations
exports.getStations = async (req, res) => {
  try {
    const stations = await StationLocation.find();
    res.status(200).json(stations);
  } catch (error) {
    console.error('Error fetching stations:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
