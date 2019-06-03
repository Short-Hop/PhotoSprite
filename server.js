const express = require('express')
const app = express()
var cors = require('cors')
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client("417105554681-9dhq2bb9o7cfa864nv2nnk75f2jfbtvi.apps.googleusercontent.com");
var getPixels = require("get-pixels");
var multer = require('multer')
var Jimp = require('jimp');
var PNGImage = require("pngjs-image")
const fs = require('fs')

var imageId = 0;
var currentFileName
var extension;

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads')
    },
    filename: function (req, file, cb) {
        console.log((file.mimetype));
        if(file.mimetype.includes("jpeg")) {
            extension = ".jpg"
            currentFileName = file.fieldname + '-' + imageId;
            cb(null, currentFileName + extension)
            
        } else {
            extension = ".png"
            currentFileName = file.fieldname + '-' + imageId;
            cb(null, currentFileName + extension)
        }
    }
})

var upload = multer({ storage: storage }).fields([{ name: 'fileInput', maxCount: 1 }, { name: "width", maxCount: 1 }, { name: "height", maxcount: 1 }, { name: "paletteArray", maxcount: 1 }])

app.use(cors());

app.use(express.json());


async function verify(tokenId) {
    const ticket = await client.verifyIdToken({
        idToken: tokenId,
        audience: "417105554681-9dhq2bb9o7cfa864nv2nnk75f2jfbtvi.apps.googleusercontent.com",  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    const userid = payload['sub'];

    return(userid);
}

app.get("/:id", (req, res) => {
    if (fs.existsSync("D:/Documents/Brainstation/Capstone/uploads/" + req.params.id)) {
        console.log("Gave image file")
        res.sendFile("D:/Documents/Brainstation/Capstone/uploads/" + req.params.id)
    } else {
        res.statusCode(404)
    }
    
})

app.post("/signin", (req, res) =>{   
    verify(req.body.tokenId).then(response => {
        res.send(response);
    }).catch(error => {
        res.sendStatus(403)
    });
})


app.post('/convertImage', (req, res) => {


    upload(req, res, function (err) {

        let paletteArray = JSON.parse(req.body.paletteArray)

        if (err instanceof multer.MulterError) {
            return res.status(500).json(err)
        } else if (err) {
            return res.status(500).json(err)
        }

        Jimp.read("./uploads/" + currentFileName + extension).then(image => {
            if (err) throw err;

            return image
                .resize(parseInt(req.body.width), parseInt(req.body.height), Jimp.RESIZE_NEAREST_NEIGHBOR) // resize
                .write("./uploads/" + currentFileName + "-converted" + ".png"); // save

            
        }).then(()=> {

            getPixels("./uploads/" + currentFileName + "-converted" + ".png", function (err, pixels) {
                if (err) {
                    console.log("Error getting pixels")
                    res.sendStatus(500)
                    return
                }

                console.log("Alpha at set position is:" + pixels.get(5, 0, 3))

                let finalImage = PNGImage.createImage(req.body.width, req.body.height)

                for (let i = 0; i <= req.body.height; i++) {
                    for (let j = 0; j <= req.body.width; j++) {
                        if (pixels.get(j, i, 3) == 0) {
                            finalImage.setAt(j, i, { red: 0, blue: 0, green: 0, alpha: 0 })
                            // console.log("alpha detected")
                        } else {
                            let difference = 765;
                            let index = 0;
                            paletteArray.forEach((color, currentIndex) => {
                                let currentDifference = 0;
                                currentDifference += Math.abs(pixels.get(j, i, 0) - color.r)
                                currentDifference += Math.abs(pixels.get(j, i, 1) - color.g)
                                currentDifference += Math.abs(pixels.get(j, i, 2) - color.b)
                                if (currentDifference <= difference) {
                                    index = currentIndex;
                                    difference = currentDifference;
                                }
                            })

                            let chosenColor = paletteArray[index];

                            finalImage.setAt(j, i, { red: chosenColor.r, green: chosenColor.g, blue: chosenColor.b, alpha: 255 })
                        }
                    }
                }

                finalImage.writeImage("./uploads/" + currentFileName + "-converted" + ".png", (err) => {
                    if (err) throw err;
                    console.log("File written");
                    let files = [currentFileName + extension, currentFileName + "-converted" + ".png"]

                    return res.send(files);

                });
                console.log(pixels.get(0, 0, 0))

            })
        })
        
        
        
    })
})


app.listen(8080, () => {
    console.log("Listening on 8080. . .")
})
