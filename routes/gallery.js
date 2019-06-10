const express = require("express");
const router = express.Router();
const fs = require('fs');
let allUsers = JSON.parse(fs.readFileSync("./users.json", "utf8"));
var privateKEY = fs.readFileSync('./private.key', 'utf8');
var publicKEY = fs.readFileSync('./public.key', 'utf8');
var cors = require('cors');
const jwt = require("jsonwebtoken");

async function getUser(tokenId) {

    var verifyOptions = {
        issuer: "PhotoSprite",
        algorithm: ["RS256"]
    };

    var userInfo = jwt.verify(tokenId, publicKEY, verifyOptions)

    return userInfo.userId;
}



router.post("/", (req, res) => {

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
                palettes: [],
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

router.get("/", (req, res) => {
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

router.delete("/:name", (req, res) => {
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

module.exports = router;