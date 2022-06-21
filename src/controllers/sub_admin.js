const knex = require("../../db/config");
const bcrypt = require("bcrypt");

async function insertEditAdmin(req, res) {
  const {
    id,
    admin_name,
    admin_number,
    admin_email,
    admin_password,
    ADMIN_ROLE_ID,
  } = req.body;

  const getAdmin = await knex("tbl_admin").where("id", id).first();

  const salt = bcrypt.genSaltSync(10);
  var hash = bcrypt.hashSync(admin_password, salt);

  var data = {
    admin_name: admin_name,
    admin_number: admin_number,
    admin_email: admin_email,
    admin_password: hash,
    ADMIN_ROLE_ID: ADMIN_ROLE_ID,
  };

  if (getAdmin) {
    await knex("tbl_admin").where({ id: id }).update(data);
    return res.json({ st: true, msg: "Update data successfully." });
  } else {
    const checkAdmin = await knex("tbl_admin")
      .where(function () {
        this.where("admin_email", admin_email).orWhere(
          "admin_number",
          admin_number
        );
      })
      .where("IS_DELETE", 0)
      .first();

    if (checkAdmin) {
      return res.json({
        st: false,
        msg: "Email or Mobile No. Already Registered!!!",
      });
    }

    await knex("tbl_admin").insert(data);

    return res.json({ st: true, msg: "Insert data successfully." });
  }
}

async function getRole(req, res) {
  const getData = await knex("tbl_admin_role").select();

  if (getData) {
    return res.json({ data: getData });
  } else {
    res.json({ st: false, msg: "Not Found Any Data" });
  }
}

async function getSubAdmin(req, res) {
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
}

async function deleteSubAdmin(req, res) {
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
}

const subAdmin = {
  insertEditAdmin,
  getRole,
  getSubAdmin,
  deleteSubAdmin,
};

module.exports = subAdmin;
