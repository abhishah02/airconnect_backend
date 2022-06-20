const express = require("express");
const router = express.Router();
const knex = require("../../db/config");
const uuid = require("uuid");
const bcrypt = require("bcrypt");
const { verifyAccessToken } = require("../helpers/jwt_helper");

const addSubAdmin = async (req, res) => {
  // const admin_number = req.body.admin_number;
  const admin_email = req.body.admin_email;

  const check_email = await knex("tbl_admin")
    .select("admin_email")
    .where("admin_email", admin_email);

  if (check_email.length === 0) {
    bcrypt.genSalt(async (err, salt) => {
      const insertData = {
        admin_id: uuid.v4(req.body.admin_id),
        admin_name: req.body.admin_name,
        admin_number: req.body.admin_number,
        admin_email: req.body.admin_email,
        admin_password: await bcrypt.hash(req.body.admin_password, salt),
        ADMIN_ROLE_ID: req.body.ADMIN_ROLE_ID,
      };
      const insert = await knex("tbl_admin").insert(insertData);
      if (insert) {
        return res.json({ st: true, msg: "Insert data successfully." });
      } else {
        return res.json({ st: false, msg: "Insert data Failed." });
      }
    });
  } else {
    return res.json({ st: false, msg: "Email already inserted." });
  }
};

const updateSubAdmin = async (req, res) => {
  const id = req.body.id;

  bcrypt.genSalt(async (err, salt) => {
    var Data = {
      admin_name: req.body.admin_name,
      admin_number: req.body.admin_number,
      admin_email: req.body.admin_email,
      admin_password: await bcrypt.hash(req.body.admin_password, salt),
      ADMIN_ROLE_ID: req.body.ADMIN_ROLE_ID,
    };

    const update = await knex("tbl_admin").update(Data).where({ id: id });

    if (update) {
      console.log("Update");
      return res.json({ st: true, msg: "Update data successfully." });
    } else {
      console.log("Fail");
      return res.json({ st: true, msg: "Update data Failed." });
    }
  });
};

const getRole = async (req, res) => {
  const getData = await knex("tbl_admin_role").select();

  if (getData) {
    return res.json({ data: getData });
  } else {
    res.json({ st: false, msg: "Not Found Any Data" });
  }
};

const getSubAdmin = async (req, res) => {
  let { page, per_page, search } = req.query;
  if (!page) {
    page = 1;
  }

  const limit = parseInt(per_page);
  const skip = (page - 1) * per_page;

  const total = await knex("tbl_admin")
    .count("id  as total")
    .first()
    .where({ IS_DELETE: 0 });
  if (search !== "") {
    const searchData = await knex("tbl_admin")
      .join(
        "tbl_admin_role",
        "tbl_admin_role.ADMIN_ROLE_ID",
        "=",
        "tbl_admin.ADMIN_ROLE_ID"
      )
      .orderBy("id", "desc")
      .select("tbl_admin.*", "tbl_admin_role.*")
      .where({ "tbl_admin.ADMIN_ROLE_ID": 2 })
      .andWhere({ "tbl_admin.IS_DELETE": 0 })
      .where((builder) =>
        builder
          .whereILike("admin_name", `%${search}%`)
          .orWhereILike("admin_email", `%${search}%`)
          .orWhereILike("admin_number", `%${search}%`)
      )
      .limit(limit)
      .offset(skip);
    return res.json({ page, per_page, total: total.total, data: searchData });
  } else {
    const getData = await knex("tbl_admin")
      .join(
        "tbl_admin_role",
        "tbl_admin_role.ADMIN_ROLE_ID",
        "=",
        "tbl_admin.ADMIN_ROLE_ID"
      )
      .orderBy("id", "desc")
      .select("tbl_admin.*", "tbl_admin_role.*")
      .where({ "tbl_admin.ADMIN_ROLE_ID": 2 })
      .andWhere({ "tbl_admin.IS_DELETE": 0 })
      .limit(limit)
      .offset(skip);
    if (getData) {
      return res.json({ page, per_page, total: total.total, data: getData });
    } else {
      res.json({ st: true, msg: "Not Found Any Data" });
    }
  }
};

const deleteSubAdmin = async (req, res) => {
  const id = req.body.id;

  const isDelete = await knex("tbl_admin")
    .update({ IS_DELETE: 1 })
    .where({ id: id });
  if (isDelete) {
    console.log("Deleted");
    return res.json({ st: true, msg: "Delete data successfully." });
  } else {
    console.log("Failed");
    return res.json({ st: true, msg: "Delete data Failed." });
  }
};

router.post("/addSubAdmin", verifyAccessToken, addSubAdmin);

router.get("/getRole", verifyAccessToken, getRole);

router.get("/getSubAdmin", verifyAccessToken, getSubAdmin);

router.post("/updateSubAdmin", verifyAccessToken, updateSubAdmin);

router.post("/deleteSubAdmin", verifyAccessToken, deleteSubAdmin);

module.exports = router;
