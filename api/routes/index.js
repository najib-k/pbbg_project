var express = require('express');
const {Player} = require("../config/models/Player");
const bcrypt = require('bcrypt');
const {Op} = require("sequelize");
var router = express.Router();

/* GET home page. */
router.post('/register',  async function(req, res, next) {
  const body = req.body;

  if (!(body.name && body.mail && body.password))
    return res.status(400).send({ error: "Invalid Parameter" });
  var exists = await Player.findOne({
    where: {
      [Op.and]: [
        {name: body.name},
        {mail: body.mail}]
    }});
  if (exists)
    return res.status(400).send({ error: "User already exists." });
  bcrypt.hash(body.password, 10,  async function(err, hash) {
    if (err){
      return res.status(400).send({error: "Error during account creation, please contact an admin."});
    }
    const player = await Player.create({
      name: req.body.name, mail: req.body.mail, password: hash
    });
    return res.status(200).send({player: {
        id: player.id,
        mail: player.mail,
        name: player.name
      },
      users: await Player.findAll()
    });
  });

});

router.get('/register',  function(req, res, next) {
  return res.status(200).send("Registration page");
});

router.get('/login',  function(req, res, next) {
  return res.status(200).send("Login page");
});

router.post('/login',  async function(req, res, next) {
  var body = req.body;

  if (!(body.mail && body.password))
    return res.status(400).send({ error: "Missing credentials." });
  var exists =  await Player.findOne({
    where: {
        mail: body.mail
    }});
  if (!exists)
    return res.status(400).send({error: "Incorrect mail or password."});
  await bcrypt.compare(body.password, exists.password, async function(err, match) {
    if (err || !match)
      return res.status(400).send("Invalid credentials.");
    return res.status(200).send({
      message: "user logged in successfully.",
      player: exists
    });
  });
});

module.exports = router;
