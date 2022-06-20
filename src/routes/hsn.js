const express = require("express");
const router = express.Router();
const knex = require("../../db/config");
const { verifyAccessToken } = require("../helpers/jwt_helper");

const addHsn = async (req, res) => {
  const insertData = {
    HSN_CODE: req.body.HSN_CODE,
    IGST: req.body.IGST,
    CGST: req.body.CGST,
    SGST: req.body.SGST,
    DESCRIPTION: req.body.DESCRIPTION,
    CREATED_TIME: new Date(),
  };
  //   console.log(req.body);
  //   console.log(insertData);
  const insert = await knex("hsn_master").insert(insertData);

  if (insert) {
    console.log("Done");
    return res.json({ st: true, msg: "Insert data successfully." });
  } else {
    console.log("Fail");
    return res.json({ st: true, msg: "Insert data Failed." });
  }
};

const getHSN = async (req, res) => {
  let { page, per_page, search } = req.query;
  if (!page) {
    page = 1;
  }

  const limit = parseInt(per_page);
  const skip = (page - 1) * per_page;

  const total = await knex("hsn_master")
    .count("HSN_ID as total")
    .first()
    .where({ IS_DELETE: 0 });

  if (search !== "") {
    const searchData = await knex("hsn_master")
      .orderBy("HSN_ID", "desc")
      .select()
      .where({ IS_DELETE: 0 })
      .where((builder) =>
        builder
          .whereILike("HSN_CODE", `%${search}%`)
          .orWhereILike("DESCRIPTION", `%${search}%`)
      )
      .limit(limit)
      .offset(skip);
    return res.json({ page, per_page, total: total.total, data: searchData });
  } else {
    const getData = await knex("hsn_master")
      .orderBy("HSN_ID", "desc")
      .select()
      .where({ IS_DELETE: 0 })
      .limit(limit)
      .offset(skip);
    if (getData) {
      return res.json({ page, per_page, total: total.total, data: getData });
    } else {
      res.json({ st: true, msg: "Not Found Any Data" });
    }
  }
};

const deleteHsn = async (req, res) => {
  const id = req.body.HSN_ID;

  const isDelete = await knex("hsn_master")
    .update({ IS_DELETE: 1 })
    .where({ HSN_ID: id });
  if (isDelete) {
    console.log("Deleted");
    return res.json({ st: true, msg: "Delete data successfully." });
  } else {
    console.log("Failed");
    return res.json({ st: true, msg: "Delete data Failed." });
  }
};

const updateHsn = async (req, res) => {
  const id = req.body.HSN_ID;
  var Data = {
    HSN_CODE: req.body.HSN_CODE,
    IGST: req.body.IGST,
    CGST: req.body.CGST,
    SGST: req.body.SGST,
    DESCRIPTION: req.body.DESCRIPTION,

    UPDATED_TIME: new Date(),
  };

  const update = await knex("hsn_master").update(Data).where({ HSN_ID: id });

  if (update) {
    console.log("Update");
    return res.json({ st: true, msg: "Update data successfully." });
  } else {
    console.log("Fail");
    return res.json({ st: true, msg: "Update data Failed." });
  }
};

router.post("/addHsn", verifyAccessToken, addHsn);

router.get("/getHSN", verifyAccessToken, getHSN);

router.post("/deleteHsn", verifyAccessToken, deleteHsn);

router.post("/updateHsn", verifyAccessToken, updateHsn);

module.exports = router;
