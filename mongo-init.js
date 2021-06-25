db.createUser({
    user: "dbuser",
    pwd: "dbuserpassword",
    roles: [{
        role: "readWrite",
        db: "hotel-app-db"
    }]
});