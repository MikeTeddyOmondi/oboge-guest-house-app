const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true
  },
  lastname: {
    type: String,
    required: true
  },
  id_number: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone_number: {
    type: Number,
    required: true
  },
  createdDate: {
    type: Date,
    default: Date.now
  }
});

const Customer = mongoose.model('Customer', CustomerSchema);

module.exports = Customer;
