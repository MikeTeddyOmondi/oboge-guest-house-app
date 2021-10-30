## Oboge Guest House Management System Project

---

```sh
git clone https://github.com/MikeTeddyOmondi/oboge-guest-house-app.git
```

---

### Developer(s)

##### Mike Teddy Omondi | Rancko Solutions LLC
---

### Proposed System Requirements.

1. Administration control panel.
2. User authentication system.
3. User Panel: accommodation, bar and restaurant UI.
4. Additional website to provide more information to potential clients to allow more conversions.
5. Additional bulky sms system and mailing list to send promos and offers to clients registered in the system or subscribed to newsletters.
6. Additional API payment platform using Lipa na M-Pesa to allow remote booking.
7. Database Management.
8. System maintenance.

---

### Areas of focus:

1. Accommodation/booking of rooms(Checking in & out)
2. Bar - stock availability in the database & invoicing/billing.
3. Restaurant - food availability in the database & invoicing/billing.
4. Guest details - room availability & accommodation cost pricing
5. Room details - description & specifics of rooms in the database.
6. Recreational facilities access
7. Route restrictions: based on user role.
8. Data analytics - admin dashboard displaying: rooms booked and generated revenues.

---

### Documents Involved:

1. Booking invoice
2. Check-in invoice
3. Check-out
4. Sales invoice
5. Facility booking invoice
6. Credit note

---

### Website:

- This landing page will allow potential customer(s) to easily get contacts and also check availability of any type of rooms within the hotel.

---

### User Panel:

- Capturing user feedback: UI & business logic(send alert email to admin)
- Reset user password: UI & business logic (using links and token)
- Booking clients: UI (customer details & booking details - room number & type plus duration) & business logic

Requirements for: _Booking Clients_

- Room capacity
- Room number
- Room availability

---

- Bar PoS : UI & business logic
- Restaurant PoS: UI & business logic
- Facility & laundry request: UI & business logic
- Route restrictions: based on user role.

---

### Admin Panel:

- Add users: based on roles (business logic)
- Add customers: UI & business logic
- Add rooms: UI & business logic
- Add bar stocks and stocks information: UI & business logic
- Add restaurant menu: UI & business logic
- Add facilities: UI & business logic
- Add laundry requests: UI & business logic

- Reports:

1. Users
2. Bookings
3. Bar stocks available
4. Bar stock sold
5. Restaurant menu available
6. Restaurant menu sold
7. Room cleaning requests/ requests attended to
8. Laundry requests/ requests attended to
9. Credit notes generated

- General settings:

1. Edit Users profile
2. Customers
3. Bookings
4. Bar stocks
5. Restaurant menu
6. Facilities
7. Room cleaning
8. Laundry requests

- System settings:

1. Backup system
2. Restore system

---
## Details:

### 1. Bookings
Requirements: 

1. Firstname
2. Lastname
3. ID number
4. Check in date
5. Check out date  

### 2. Stock Control

Requirements:

1. Stock in - track receipt, name, type, number & value of stocks brought in
2. Stock out - track receipt, name, type, number & value of stocks sold/ broken.
3. Transaction tracked through salesperson depending on the shifts.
