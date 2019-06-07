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
var currentFileName = "fileInput";
var extension = ".png";
let tempID = 0;
const jwt = require("jsonwebtoken");

let allUsers = JSON.parse(fs.readFileSync("./users.json", "utf8"));
var privateKEY = fs.readFileSync('./private.key', 'utf8');
var publicKEY = fs.readFileSync('./public.key', 'utf8');


var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads')
    },
    filename: function (req, file, cb) {
        console.log((file.mimetype));
        extension = ".jpg"
        currentFileName = file.fieldname + tempID;
        cb(null, currentFileName + ".png")
    }
})

var upload = multer({ storage: storage }).single('fileInput');

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

async function getUser(tokenId) {

    var verifyOptions = {
        issuer: "PhotoSprite",
        algorithm: ["RS256"]
    };

    var userInfo = jwt.verify(tokenId, publicKEY, verifyOptions)
        
    return userInfo.userId;
}

app.get("/uploads/:id", (req, res) => {
    console.log(req.params.id)
    if (fs.existsSync("D:/Documents/Brainstation/Capstone/uploads/" + req.params.id)) {
        console.log("Gave image file")
        res.sendFile("D:/Documents/Brainstation/Capstone/uploads/" + req.params.id)
    } else {
        res.sendStatus(404)
    }
})

app.get("/gallery/:id/:token", (req, res) => {

    getUser(req.params.token).then(userId => {

        if (fs.existsSync("D:/Documents/Brainstation/Capstone/users/" + userId + "/" + req.params.id)) {
            console.log("Gave image file")
            res.sendFile("D:/Documents/Brainstation/Capstone/users/" + userId + "/" + req.params.id)
        } else {
            res.sendStatus(404)
        }
    }).catch(error => {
        console.log(error)
        res.sendStatus(403)
    })
})

app.post("/signin", (req, res) =>{   
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

app.post("/tempID", (req, res) => {

    console.log(req.body.tempID);
    if (req.body.tempID) {
        tempID = req.body.tempID;
        res.sendStatus(200);
    } else {
        res.sendStatus(400);
    }
    
})

app.post("/upload", (req, res) => {

    upload(req, res, function (err) {  

        if (err instanceof multer.MulterError) {
            return res.status(500).json(err)
        } else if (err) {
            return res.status(500).json(err)
        }

        if (req.body.fileInput) {


            let options = {
                url: req.body.fileInput,
                dest: `./uploads/fileInput${tempID}.png`,
            }

            download.image(options).then(() => {
                res.send(`fileInput${tempID}.png`);
            }).catch(()=> {
                res.statusCode(400);
            })
        } else {
            res.send("fileInput" + tempID + ".png");
        }
    })
})

app.post('/convertImage', (req, res) => {
    let paletteArray = req.body.paletteArray;

    Jimp.read("./uploads/fileInput" + req.body.tempID + ".png").then(image => {
        return image
            .resize(parseInt(req.body.width), parseInt(req.body.height), Jimp.RESIZE_NEAREST_NEIGHBOR) // resize
            .write("./uploads/fileInput" + req.body.tempID + "-converted" + ".png"); // save
    }).then(()=> {

        getPixels("./uploads/fileInput" + req.body.tempID + "-converted" + ".png", function (err, pixels) {
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

            finalImage.writeImage("./uploads/fileInput" + req.body.tempID + "-converted" + ".png", (err) => {
                if (err) throw err;
                console.log("File written");
                let files = ['fileInput' + req.body.tempID + ".png", 'fileInput' + req.body.tempID + "-converted" + ".png"]

                return res.send(files);

            });
            console.log(pixels.get(0, 0, 0))

        })
    })
})

app.post("/saveToGallery", (req, res) => {

    getUser(req.headers.token).then(userId => {
        
        console.log(userId);
        if (fs.existsSync("./users/" + userId)) {
            if (fs.existsSync("./users/" + userId + "/" + req.body.name + "-p.png")) {
                return res.send("A conversion with that name already exists");
            } else {
                fs.renameSync("./uploads/fileInput" + req.body.tempID + ".png", "./users/" + userId + "/" + req.body.name + ".png");
                fs.renameSync("./uploads/fileInput" + req.body.tempID + "-converted.png", "./users/" + userId + "/" + req.body.name + "-p.png");
                res.send("File Saved")
            }
        } else {
            fs.mkdirSync("./users/" + userId + "/");
            fs.renameSync("./uploads/fileInput" + req.body.tempID + ".png", "./users/" + userId + "/" + req.body.name + ".png");
            fs.renameSync("./uploads/fileInput" + req.body.tempID + "-converted.png", "./users/" + userId + "/" + req.body.name + "-p.png");
            res.send("File Saved")
        }


        let userIndex = -1
        allUsers.forEach((user, index) => {
            if (user.userId == userId) {
                userIndex = index;
            }
        })

        if (userIndex > -1) {
            let user = allUsers[userIndex];

            let conversion = {
                name: req.body.name,
                original: req.body.name + ".png",
                converted: req.body.name + "-p.png",
                palette: req.body.palette,
            }

            user.conversions.push(conversion);

            allUsers[userIndex] = user;

        } else {

            let user = {
                userId: userId,
                conversions: [
                    {
                        name: req.body.name,
                        original: req.body.name + ".png",
                        converted: req.body.name + "-p.png",
                        palette: req.body.palette
                    }
                ]
            }

            allUsers.push(user);
        }

        fs.writeFileSync("./users.json", JSON.stringify(allUsers));

    }).catch(error => {
        console.log(error)
        res.sendStatus(403)
    });

})

app.get("/gallery/", (req, res) => {
    getUser(req.headers.token).then(userId => {

        console.log(userId)
        let found = allUsers.find(user => user.userId === userId)
        if (found) {
            res.send(found);
        } else {
            res.sendStatus(404);
        }
    }).catch(error => {
        console.log(error)
        res.sendStatus(403)
    })
})


app.listen(8080, () => {
    console.log("Listening on 8080. . .")
})

user = {
    userId: ""

}
