const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const stationLocationSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    stationLocation: {
        cords: {
            type: [Number],
            required: true
        }
    },
    area: {
        type: [[Number]],
        required: true
    },
    assignedPersonnel: {
        type: Array
    }
})


mongoose.model('StationLocation', stationLocationSchema);
