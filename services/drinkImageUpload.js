//const util = require("util");
const multer = require("multer");
//const GridFsStorage = require("multer-gridfs-storage");

// Storage for the images
const storage = multer.diskStorage({
	//destination for files
	destination: function (request, file, callback) {
		callback(null, "./assets/uploads/images");
	},

	//add back the extension
	filename: function (request, file, callback) {
		callback(null, `Drink_Image-${file.originalname}`);
	},
});

//upload parameters for multer
const upload = multer({
	storage: storage,
	limits: {
		fieldSize: 1024 * 1024 * 3,
	},
});

module.exports = { upload };
