const express = require("express");
const router = express.Router();
const uuid = require("uuid");
const knex = require("../../db/config");
const bcrypt = require("bcrypt");

//Registration API
const register = async (req, res) => {
  const USER_EMAIL = req.body.USER_EMAIL;
  const EMAIL = await knex
    .select("USER_EMAIL")
    .from(process.env.USER_TABLE_NAME)
    .where("USER_EMAIL", USER_EMAIL)
    .first();
  //   console.log(EMAIL);

  if (EMAIL == undefined) {
    USER_PASSWORD = req.body.USER_PASSWORD;
    USER_CONFIRM_PASSWORD = req.body.USER_CONFIRM_PASSWORD;

    if (USER_PASSWORD == USER_CONFIRM_PASSWORD) {
      bcrypt.genSalt(async (err, salt) => {
        const insertData = {
          USER_ID: uuid.v4(req.body.USER_ID),
          USER_FIRSTNAME: req.body.USER_FIRSTNAME,
          USER_LASTNAME: req.body.USER_LASTNAME,
          USER_COUNTRY: req.body.USER_COUNTRY,
          USER_DOB: req.body.USER_DOB,
          USER_CONTACT_NUMBER: req.body.USER_CONTACT_NUMBER,
          USER_EMAIL: req.body.USER_EMAIL,
          USER_PASSWORD: await bcrypt.hash(req.body.USER_PASSWORD, salt),
        };
        knex(process.env.USER_TABLE_NAME)
          .insert(insertData)
          .then((data) => {
            res.send({ data: data });
          })
          .catch((err) => {
            console.log(err);
            res.send(err);
          });
      });
    } else {
      res.send("Password Not Match");
    }
  } else {
    if (EMAIL.USER_EMAIL !== req.body.USER_EMAIL) {
      USER_PASSWORD = req.body.USER_PASSWORD;
      USER_CONFIRM_PASSWORD = req.body.USER_CONFIRM_PASSWORD;

      if (USER_PASSWORD == USER_CONFIRM_PASSWORD) {
        bcrypt.genSalt(async (err, salt) => {
          const insertData = {
            USER_ID: uuid.v4(req.body.USER_ID),
            USER_FIRSTNAME: req.body.USER_FIRSTNAME,
            USER_LASTNAME: req.body.USER_LASTNAME,
            USER_COUNTRY: req.body.USER_COUNTRY,
            USER_DOB: req.body.USER_DOB,
            USER_CONTACT_NUMBER: req.body.USER_CONTACT_NUMBER,
            USER_EMAIL: req.body.USER_EMAIL,
            USER_PASSWORD: await bcrypt.hash(req.body.USER_PASSWORD, salt),
          };
          knex(process.env.USER_TABLE_NAME)
            .insert(insertData)
            .then((data) => {
              // res.json(data);
              res.send({ data: data });
            })
            .catch((err) => {
              console.log(err);
              res.send(err);
            });
        });
      } else {
        res.send("Password Not Match");
      }
    } else {
      res.send("Email already register");
    }
  }
};

//Login API
const login = async (req, res) => {
  try {
    const email = req.body.USER_EMAIL;
    const password = req.body.USER_PASSWORD;
    // const number = req.body.USER_CONTACT_NUMBER;

    const user = await knex(process.env.USER_TABLE_NAME)
      .first("*")
      .where({ USER_EMAIL: email })
      .orWhere({ USER_CONTACT_NUMBER: email });

    // console.log(user.USER_CONTACT_NUMBER + " ," + user.USER_EMAIL);
    if (user.USER_EMAIL || user.USER_CONTACT_NUMBER) {
      const validPass = await bcrypt.compare(password, user.USER_PASSWORD);
      if (validPass) {
        res.status(200).send("login done");
      } else {
        res.status(500).send("Wrong Password");
      }
    } else {
      res.status(404).send("User not found");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Something Broke!");
  }
};

router.post("/register", register);
router.post("/login", login);

module.exports = router;
