// Models
const Customer = require('../models/Customer')
const Room = require('../models/Room')
const Booking = require('../models/Booking')

// Booking Logic | Customer
module.exports = {
    saveCustomer: async(customer) => {
        // Logic here
        let newCustomer = new Customer({
            firstname: customer.firstname,
            lastname: customer.lastname,
            email: customer.email,
            id_number: customer.id_number,
            phone_number: customer.phone_number
        })
        newCustomer.save()
            .then(() => {
                console.log("Saved customer:" + newCustomer._id);
            })
            .catch((err) => {
                console.log("Config error>" + err.message)
            });
        return newCustomer._id
    },
    findCustomer: async(customer) => {
        // Logic here
        await Customer.findOne({ id_number: customer.id_number })
            .then((err, customerFound) => {
                if (err) throw err
                console.log(customerFound._id);
            })
            .catch((err) => {
                console.log(err.message)
            });
        return customerFound._id
    },
    findRoom: async(room) => {
        // Logic here
        await Room.findOne({ roomNumber: room.roomNumber })
            .then((err, roomFound) => {
                if (err) throw err
                console.log(roomFound._id);
            })
            .catch((err) => {
                console.log(err.message)
            });
        return roomFound._id
    },
    saveBooking: async(booking) => {
        // Logic here
    }
}