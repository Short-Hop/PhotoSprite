const express = require("express");
const router = express.Router();
const fs = require('fs');
let allUsers = JSON.parse(fs.readFileSync("./users.json", "utf8"));
var privateKEY = fs.readFileSync('./private.key', 'utf8');
var publicKEY = fs.readFileSync('./public.key', 'utf8');
var cors = require('cors');
const jwt = require("jsonwebtoken");

console.log(allUsers[0]);


async function getUser(tokenId) {

    var verifyOptions = {
        issuer: "PhotoSprite",
        algorithm: ["RS256"]
    };

    var userInfo = jwt.verify(tokenId, publicKEY, verifyOptions)

    return userInfo.userId;
}

router.get("/", (req, res) => {
    getUser(req.headers.token).then(userId => {

        let userIndex = -1
        allUsers.forEach((user, index) => {
            if (user.userId == userId) {
                userIndex = index;
            }
        })

        if (userIndex > -1) {
            console.log(allUsers[userIndex].palettes)
            res.send(allUsers[userIndex].palettes);
        }

    }).catch(error => {
        console.log(error)
        res.sendStatus(403)
    })
})

router.post("/", (req, res) => {
    console.log("request body: " + req.body);
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
                // console.log("the current user palette name is: " + user.palettes[0].name)
                // console.log(req.body.name)
                if (user.palettes.filter(palette => palette.name === req.body.name).length !== 0) {
                    res.send("A palette with that name already exists");
                } else {
                    user.palettes.push(req.body);
                    allUsers[userIndex] = user;
                    fs.writeFileSync("./users.json", JSON.stringify(allUsers));
                    allUsers = JSON.parse(fs.readFileSync("./users.json", "utf8"));

                    res.send("Palette saved");
                }
            } else {
                user.palettes.push(req.body)
                allUsers[userIndex] = user;
                fs.writeFileSync("./users.json", JSON.stringify(allUsers));
                allUsers = JSON.parse(fs.readFileSync("./users.json", "utf8"));
                res.send("Palette saved");
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
            res.send("Palette saved");
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
            let user = allUsers[userIndex]

            user.palettes = user.palettes.filter(palette => palette.name !== req.params.name);

            allUsers[userIndex] = user;

            fs.writeFileSync("./users.json", JSON.stringify(allUsers));
            allUsers = JSON.parse(fs.readFileSync("./users.json", "utf8"));

            res.send("Palette deleted");
        } else {
            res.sendStatus(403);
        }
    }).catch(error => {
        console.log(error)
        res.sendStatus(403)
    })
})

module.exports = router;