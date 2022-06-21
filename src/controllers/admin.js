const knex = require("../../db/config");
const bcrypt = require("bcrypt");
const { signAccessToken } = require("../helpers/jwt_helper");

async function admin(req, res) {
  try {
    // const result = await authSchema.validateAsync(req.body);

    const email = req.body.admin_email;
    const password = req.body.admin_password;

    const admin = await knex(process.env.ADMIN_TABLE_NAME)
      .first("*")
      .where({ admin_email: email })
      .orWhere({ admin_number: email });

    // console.log(user.USER_CONTACT_NUMBER + " ," + user.USER_EMAIL);
    if (admin.admin_email || admin.admin_number) {
      const validPass = await bcrypt.compare(password, admin.admin_password);
      const accessToken = await signAccessToken(admin.admin_id);
      if (validPass) {
        // res.send({ accessToken });
        return res.json({
          accessToken,

          user: {
            id: admin.admin_id,
            role: admin.ADMIN_ROLE_ID,
            st: true,
            msg: "login success",
          },
        });
      } else {
        return res.json({ st: false, msg: "fail " });
      }
    } else {
      return res.json({ st: false, msg: "Invalid Password/Email" });
    }
  } catch (error) {
    if (error.isJoi === true) {
      return res.json({ st: false, msg: "Password/Email Not Found" });
    }

    // console.log(error);
    // res.status(500).send("Something Broke!");
  }
}

async function profile(req, res) {
  const id = req.params.id;

  // console.log(id);
  const profile = await knex(process.env.ADMIN_TABLE_NAME)
    .where({
      admin_id: id,
    })
    .first();

  if (profile) {
    return res.json({ profile });
  } else {
    res.json({ st: false, msg: "Not Found Any Data" });
  }
}

async function reset(req, res) {
  // const id = req.params.id;

  // console.log(id);

  const id = req.body.admin_id;
  const password = req.body.admin_password;
  const check = await knex(process.env.ADMIN_TABLE_NAME)
    .where({ admin_id: id })
    .first();

  // console.log(password);
  // console.log(check);
  if (check) {
    const validPass = await bcrypt.compare(password, check.admin_password);
    if (validPass) {
      admin_new_password = req.body.admin_new_password;
      admin_confirm_password = req.body.admin_confirm_password;

      if (admin_new_password == admin_confirm_password) {
        bcrypt.genSalt(async (err, salt) => {
          const updateData = await knex(process.env.ADMIN_TABLE_NAME)
            .where({ admin_id: check.admin_id })
            .update({
              admin_password: await bcrypt.hash(
                req.body.admin_new_password,
                salt
              ),
            });
          if (updateData) {
            return res.json({
              statement: { st: true, msg: "password update successfully" },
            });
          } else {
            return res.json({ st: false, msg: "password update fail" });
          }
        });
      }
    } else {
      return res.json({ st: false, msg: "password not match" });
    }
  } else {
    return res.json({ st: false, msg: "Password not Found" });
  }
}

const controllerAdmin = {
  admin,
  profile,
  reset,
};

module.exports = controllerAdmin;
