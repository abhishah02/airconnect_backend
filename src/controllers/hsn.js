const knex = require("../../db/config");

async function insertEditHsn(req, res) {
  const { HSN_ID, HSN_CODE, IGST, CGST, SGST, DESCRIPTION } = req.body;

  const getHsn = await knex("hsn_master").where("HSN_ID", HSN_ID).first();

  var data = {
    HSN_CODE: HSN_CODE,
    IGST: IGST,
    CGST: CGST,
    SGST: SGST,
    DESCRIPTION: DESCRIPTION,
  };

  if (getHsn) {
    data.UPDATED_TIME = new Date();

    const update = await knex("hsn_master")
      .update(data)
      .where({ HSN_ID: HSN_ID });

    if (update) {
      console.log("Update");
      return res.json({ st: true, msg: "Update data successfully." });
    } else {
      console.log("Fail");
      return res.json({ st: true, msg: "Update data Failed." });
    }
  } else {
    data.CREATED_TIME = new Date();

    const insert = await knex("hsn_master").insert(data);

    if (insert) {
      console.log("Done");
      return res.json({ st: true, msg: "Insert data successfully." });
    } else {
      console.log("Fail");
      return res.json({ st: true, msg: "Insert data Failed." });
    }
  }
}

async function getHSN(req, res) {
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
}

async function deleteHsn(req, res) {
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
}

const hsn = {
  insertEditHsn,
  getHSN,
  deleteHsn,
};

module.exports = hsn;
