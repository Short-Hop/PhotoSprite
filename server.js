const express = require('express');
const app = express();
var cors = require('cors');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client("417105554681-9dhq2bb9o7cfa864nv2nnk75f2jfbtvi.apps.googleusercontent.com");
var getPixels = require("get-pixels");
var multer = require('multer');
var Jimp = require('jimp');
var PNGImage = require("pngjs-image");
const fs = require('fs');
const download = require('image-downloader');
var currentFileName = "";
let tempID = 0;
const jwt = require("jsonwebtoken");
const path = require("path")

app.use(cors());
app.use(express.json());
app.use("/api/palette", require("./routes/palette"));
app.use("/api/gallery", require("./routes/gallery"));
// app.use(express.static(path.join(__dirname, "photosprite", "build")))

let allUsers = JSON.parse(fs.readFileSync("./users.json", "utf8"));
var privateKEY = fs.readFileSync('./private.key', 'utf8');
var publicKEY = fs.readFileSync('./public.key', 'utf8');


setInterval(() => {
    let files = fs.readdirSync("./uploads")
    files.forEach(filename => {
        let time = parseInt(filename.substr(0, 13))
        if (Date.now() - time > 3600000) {
            fs.unlinkSync("./uploads/" + filename);
        }
        console.log(time);
    })
    
}, 3600000);


var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads')
    },
    filename: function (req, file, cb) {
        console.log((file.mimetype));
        extension = ".jpg"
        currentFileName = tempID;
        cb(null, currentFileName + ".png")
    }
})

var upload = multer({ storage: storage }).single('fileInput');

async function verify(tokenId) {
    const ticket = await client.verifyIdToken({
        idToken: tokenId,
        audience: "417105554681-9dhq2bb9o7cfa864nv2nnk75f2jfbtvi.apps.googleusercontent.com",  
    });
    const payload = ticket.getPayload();
    const userid = payload['sub'];
    return(userid);
}

async function getUser(tokenId) {

    var verifyOptions = {
        issuer: "PhotoSprite",
        algorithm: ["RS256"]
    };

    var userInfo = jwt.verify(tokenId, publicKEY, verifyOptions)
        
    return userInfo.userId;
}

app.get("/api/uploads/:id", (req, res) => {

    if (fs.existsSync(__dirname + '/uploads/' + req.params.id)) {

            
        res.sendFile(__dirname + '/uploads/' + req.params.id)
    } else {
        res.sendStatus(404)
    }
})

app.post("/api/signin", (req, res) =>{   
    verify(req.body.tokenId).then(response => {

        let payload = {
            userId: response
        }

        var signOptions = {
            issuer: "PhotoSprite",
            algorithm: "RS256"
        };

        let userData = {
            googleId: response,
            token: jwt.sign(payload, privateKEY, signOptions)
        }

        res.send(userData);
    }).catch(error => {
        console.log(error);
        res.sendStatus(403)
    });
})

app.post("/api/tempID", (req, res) => {

    console.log(req.body.tempID);
    if (req.body.tempID) {
        tempID = req.body.tempID;
        res.sendStatus(200);
    } else {
        res.sendStatus(400);
    }
    
})

app.post("/api/upload", (req, res) => {

    upload(req, res, function (err) {  

        if (err instanceof multer.MulterError) {
            return res.status(500).json(err)
        } else if (err) {
            return res.status(500).json(err)
        }

        if (req.body.fileInput) {


            let options = {
                url: req.body.fileInput,
                dest: `./uploads/${tempID}.png`,
            }

            download.image(options).then(() => {
                res.send(`${tempID}.png`);
            }).catch(()=> {
                res.statusCode(400);
            })
        } else {
            res.send(tempID + ".png");
        }
    })
})

app.post('/api/convertImage', (req, res) => {
    let paletteArray = req.body.paletteArray;

    if (fs.existsSync("./uploads/" + req.body.tempID + ".png")) {
        Jimp.read("./uploads/" + req.body.tempID + ".png").then(image => {
            return image
                .resize(parseInt(req.body.width), parseInt(req.body.height), Jimp.RESIZE_NEAREST_NEIGHBOR) // resize
                .write("./uploads/" + req.body.tempID + "-converted" + ".png"); // save
        }).then(() => {

            getPixels("./uploads/" + req.body.tempID + "-converted" + ".png", function (err, pixels) {
                if (err) {
                    console.log("Error getting pixels")
                    res.sendStatus(500)
                    return
                }

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

                finalImage.writeImage("./uploads/" + req.body.tempID + "-converted" + ".png", (err) => {
                    if (err) throw err;
                    console.log("File written");
                    let files = [req.body.tempID + ".png", req.body.tempID + "-converted" + ".png"]

                    return res.send(files);

                });

            })
        }).catch(error => {
            console.log(error);
            res.send(404);
        })
    } else {
        res.sendStatus(404);
    }    
})

app.get("/api/gallery/:id/:token", (req, res) => {

    getUser(req.params.token).then(userId => {

        if (fs.existsSync(__dirname + '/users/' + userId + "/" + req.params.id)) {


            res.sendFile(__dirname + '/users/' + userId + "/" + req.params.id)
        } else {
            res.sendStatus(404)
        }
    }).catch(error => {
        console.log(error)
        res.sendStatus(403)
    })
})

// let port = process.env.PORT;
// if (port == null || port == "") {
//     port = 8080;
// }

// console.log(port)

// app.get("*", (req, res) => {
//     console.log(path.join(__dirname + "/photosprite/build/index.html"))
//     res.sendFile(path.join(__dirname + "/photosprite/build/index.html"));
// });

app.listen(8081, () => {
    console.log("Listening. . .")
});

