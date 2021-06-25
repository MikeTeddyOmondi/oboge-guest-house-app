const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
    roomType: {
        type: String,
        required: true
    },
    roomCapacity: {
        type: Number,
        required: true
    },
    roomNumber: {
        type: String,
        required: true,
        unique: true
    },
    roomRate: {
        type: Number,
        required: true
    },
    isBooked: {
        type: Boolean,
        default: false
    },
    createdDate: {
        type: Date,
        default: Date.now
    },
    updatedDate: {
        type: Date,
        default: ''
    }
});

const Room = mongoose.model('Room', RoomSchema);

module.exports = Room;