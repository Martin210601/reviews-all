const path = require('path')
const multer = require('multer')


var Storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './src/uploads')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + "-" + Math.floor(Math.random() * 11) + Date.now() + ".jpg")

    }
})
const maxSize = 100 * 1000 * 1000;
module.exports = upload = multer({
    storage: Storage,
    limits: { fileSize: maxSize },
    fileFilter: function (req, file, cb) {
        // Set the filetypes, it is optional    
        var filetypes = /image|jpeg|jpg|png/;
        var mimetype = filetypes.test(file.mimetype);

        var extname = filetypes.test(path.extname(
            file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        } else {

            cb("Error: File upload only supports the "
                + "following filetypes - " + filetypes);
        }
    }
})
