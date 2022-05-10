const express = require("express");
const router = express.Router();
const knex = require("../../db/config");
const bcrypt = require("bcrypt");
const createError = require("http-errors");

const { authSchema } = require("../helpers/schema_validation");
const { signAccessToken } = require("../helpers/jwt_helper");

const admin = async (req, res) => {
  try {
    const result = await authSchema.validateAsync(req.body);

    const email = result.admin_email;
    const password = result.admin_password;

    const admin = await knex(process.env.ADMIN_TABLE_NAME)
      .first("*")
      .where({ admin_email: email });

    // console.log(user.USER_CONTACT_NUMBER + " ," + user.USER_EMAIL);
    if (admin) {
      const validPass = await bcrypt.compare(password, admin.admin_password);
      const accessToken = await signAccessToken(admin.admin_id);
      if (validPass) {
        // res.send({ accessToken });
        return res.json({ st: true, msg: "login success", accessToken });
      } else {
        return res.json({ st: false, msg: "fail " });
      }
    } else {
      return res.json({ st: fasle, msg: "Invalid Password/Email" });
    }
  } catch (error) {
    if (error.isJoi === true) {
      return res.json({ st: fasle, msg: "Password/Email Not Found" });
    }

    // console.log(error);
    // res.status(500).send("Something Broke!");
  }
};

router.post("/signin", admin);

module.exports = router;
