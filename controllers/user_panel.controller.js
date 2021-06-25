const { saveCustomer, findRoom, saveBooking } = require('../config/booking.config');

// User Panel | Dashboard Page
exports.getUserPanel = (req, res) => {
    res.render('panel/panel', {
        user: req.user,
        title: 'User Panel',
        layout: './layouts/panelLayout'
    })
}

// User Panel - GET | Bookings Page
exports.getBoookingPanel = (req, res) => {
    res.render('panel/bookings', {
        user: req.user,
        title: 'Bookings',
        layout: './layouts/panelLayout'
    })
};

// User Panel - POST | Bookings Page
exports.postBookingPanel = (req, res) => {
    let customerID
    let roomID

    // Body of Request 
    const {
        firstname,
        lastname,
        id_number,
        phone_number,
        email,
        numberAdults,
        numberKids,
        roomType,
        roomNumber,
        check_in_date,
        check_out_date
    } = req.body

    // Create a customer details | Object
    let customerDetails = {
        firstname,
        lastname,
        id_number,
        phone_number,
        email
    }

    // Save the customer details
    saveCustomer(customerDetails)
        .then((id) => {
            console.log(`CustomerID: ${id}`);
            req.flash(
                'success_msg',
                `${customerDetails.firstname}'s details has been saved successfully...`
            );
        })
        .catch((err) => {
            console.log("Controller error>" + err.message);
            req.flash(
                'error_msg',
                `Saving customer details failed...`
            );
        })

    // Create a room details | Object
    let roomDetails = {
        roomType,
        roomCapacity: (parseInt(numberAdults) + parseInt(numberKids)),
        roomNumber
    }

    // Save the room details
    // findRoom(roomDetails)
    //     .then((id) => {
    //         console.log(`RoomID: ${id}`);
    //         req.flash(
    //             'success_msg',
    //             `${roomDetails.room_number_select}'s details has been successfully retrieved...`
    //         );
    //     })
    //     .catch((err) => {
    //         console.log("Controller error>" + err.message);
    //         req.flash(
    //             'error_msg',
    //             `Saving customer details failed...`
    //         );
    //     })

    let bookingDetails = {
        customerID,
        numberAdults,
        numberKids,
        roomID,
        check_in_date,
        check_out_date
    }

    //console.log(customerDetails);
    //console.log(roomDetails);
    //console.log(bookingDetails);

    res.render('panel/bookingsInvoice', {
        user: req.user,
        customerDetails,
        roomDetails,
        bookingDetails,
        title: 'Hotel Booking Invoice | Receipt',
        layout: './layouts/panelLayout'
    })
};

// User Panel | Bar Page
exports.getBarPanel = (req, res) => {
    res.render('panel/bar', {
        user: req.user,
        title: 'Bar',
        layout: './layouts/panelLayout'
    })
};

// User Panel | Restaurant Page
exports.getRestaurantPanel = (req, res) => {
    res.render('panel/restaurant', {
        user: req.user,
        title: 'Restaurant',
        layout: './layouts/panelLayout'
    })
};

// User Panel | Facility Page
exports.getFacilitiesPanel = (req, res) => {
    res.render('panel/facilities', {
        user: req.user,
        title: 'Facilities',
        layout: './layouts/panelLayout'
    })
};

// Logout | User Panel
exports.logout = (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/login');
};