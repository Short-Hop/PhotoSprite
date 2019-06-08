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
        currentFileName = tempID;
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

    if (fs.existsSync(__dirname + '/uploads/' + req.params.id)) {

            
        res.sendFile(__dirname + '/uploads/' + req.params.id)
    } else {
        res.sendStatus(404)
    }
})

app.get("/gallery/:id/:token", (req, res) => {

    getUser(req.params.token).then(userId => {

        if (fs.existsSync(__dirname + '/users/' + userId + "/" + req.params.id)) {
            

            res.sendFile(__dirname + '/users/'+ userId + "/" + req.params.id)
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

app.post('/convertImage', (req, res) => {
    let paletteArray = req.body.paletteArray;

    Jimp.read("./uploads/" + req.body.tempID + ".png").then(image => {
        return image
            .resize(parseInt(req.body.width), parseInt(req.body.height), Jimp.RESIZE_NEAREST_NEIGHBOR) // resize
            .write("./uploads/" + req.body.tempID + "-converted" + ".png"); // save
    }).then(()=> {

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
                fs.renameSync("./uploads/" + req.body.tempID + ".png", "./users/" + userId + "/" + req.body.name + ".png");
                fs.renameSync("./uploads/" + req.body.tempID + "-converted.png", "./users/" + userId + "/" + req.body.name + "-p.png");
                res.send("File Saved")
            }
        } else {
            fs.mkdirSync("./users/" + userId + "/");
            fs.renameSync("./uploads/" + req.body.tempID + ".png", "./users/" + userId + "/" + req.body.name + ".png");
            fs.renameSync("./uploads/" + req.body.tempID + "-converted.png", "./users/" + userId + "/" + req.body.name + "-p.png");
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
                palettes:[],
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

app.post("/savePalette/", (req, res) => {

    console.log(req.body);
    getUser(req.headers.token).then(userId => {
        let userIndex = -1
        allUsers.forEach((user, index) => {
            if (user.userId == userId) {
                userIndex = index;
            }
        })

        if (userIndex > -1) {
            let user = allUsers[userIndex]
            if (user.palettes.length > 0) {
                if (user.palettes.filter(palette => palette.name === req.body.name) !== []) {
                    res.send("A palette with that name already exists");
                } else {
                    user.palettes.push(req.body);
                    allUsers[userIndex] = user;
                    fs.writeFileSync("./users.json", JSON.stringify(allUsers));
                    allUsers = JSON.parse(fs.readFileSync("./users.json", "utf8"));

                    res.send("palette saved");
                }
            } else {
                user.palettes.push(req.body)
                allUsers[userIndex] = user;
                fs.writeFileSync("./users.json", JSON.stringify(allUsers));
                allUsers = JSON.parse(fs.readFileSync("./users.json", "utf8"));
                res.send("palette saved");
            }
        } else {
            let user = {
                userId: userId,
                palettes: [req.body],
                conversions: []
            }

            allUsers.push(user);
            fs.writeFileSync("./users.json", JSON.stringify(allUsers));
            allUsers = JSON.parse(fs.readFileSync("./users.json", "utf8"));
            res.send("palette saved");
        }

    }).catch(error => {
        console.log(error)
        res.sendStatus(403)
    }) 
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

app.delete("/gallery/:name", (req, res) => {
    getUser(req.headers.token).then(userId => {
        let userIndex = -1
        allUsers.forEach((user, index) => {
            if (user.userId == userId) {
                userIndex = index;
            }
        })

        if (userIndex > -1) {
            allUsers[userIndex].conversions = allUsers[userIndex].conversions.filter(conversion => conversion.name !== req.params.name)
            fs.unlinkSync("./users/" + userId + "/" + req.params.name + "-p.png")
            fs.unlinkSync("./users/" + userId + "/" + req.params.name + ".png")
        }

        fs.writeFileSync("./users.json", JSON.stringify(allUsers))
        allUsers = JSON.parse(fs.readFileSync("./users.json", "utf8"));
        res.send("Deleted");
        
    }).catch(error => {
        console.log(error)
        res.sendStatus(403)
    })
})


app.listen(8080, () => {
    console.log("Listening on 8080. . .")
})

