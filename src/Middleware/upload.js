const path = require('path')
const multer = require('multer')


var Storage = multer.diskStorage({
    destination: function(req,file,cb){
        console.log(file)

        cb(null,'./src/uploads')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + "-" + Date.now()+".jpg")
      }
})
const maxSize = 1 * 1000 * 1000;
module.exports =   upload = multer({ 
    storage: Storage,
    limits: { fileSize: maxSize },
    fileFilter: function (req, file, cb){
        console.log(file)
        // Set the filetypes, it is optional
        var filetypes = /jpeg|jpg|png/;
        var mimetype = filetypes.test(file.mimetype);
  
        var extname = filetypes.test(path.extname(
                    file.originalname).toLowerCase());
        
        if (mimetype && extname) {
            return cb(null,true);
        }else{

            cb("Error: File upload only supports the "
                    + "following filetypes - " + filetypes);
        }
      

    } 
})