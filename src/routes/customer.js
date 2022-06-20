const express = require("express");
const router = express.Router();
const knex = require("../../db/config");
const { verifyAccessToken } = require("../helpers/jwt_helper");

const addCustomer = async (req, res) => {
  const insertData = {
    CUSTOMER_NAME: req.body.CUSTOMER_NAME,
    CUSTOMER_PHONE_NO: req.body.CUSTOMER_PHONE_NO,
    CUSTOMER_WHATSAPP_NO: req.body.CUSTOMER_WHATSAPP_NO,
    CUSTOMER_ADDRESS: req.body.CUSTOMER_ADDRESS,
    STATE_ID: req.body.STATE_ID,
    CITY_ID: req.body.CITY_ID,
    CREATED_TIME: new Date(),
  };
  //   console.log(req.body);
  //   console.log(insertData);
  const insert = await knex("tbl_customer").insert(insertData);

  if (insert) {
    console.log("Done");
    return res.json({ st: true, msg: "Insert data successfully." });
  } else {
    console.log("Fail");
    return res.json({ st: true, msg: "Insert data Failed." });
  }
};

const getStateData = async (req, res) => {
  const getData = await knex("tbl_state").select().orderBy("STATE_NAME", "ASC");

  if (getData) {
    return res.json({ data: getData });
  } else {
    res.json({ st: false, msg: "Not Found Any Data" });
  }
};

const getCityData = async (req, res) => {
  const id = req.body.STATE_ID;

  // console.log(id);
  const getData = await knex("tbl_cities")
    .where({ STATE_ID: id })
    .select()
    .orderBy("CITY_NAME", "ASC");

  if (getData) {
    return res.json({ data: getData });
  } else {
    res.json({ st: false, msg: "Not Found Any Data" });
  }
};

const getCustomer = async (req, res) => {
  let { page, per_page, search } = req.query;
  if (!page) {
    page = 1;
  }

  const limit = parseInt(per_page);
  const skip = (page - 1) * per_page;

  const total = await knex("tbl_customer")
    .count("CUSTOMER_ID as total")
    .first()
    .where({ IS_DELETE: 0 });

  if (search !== "") {
    const searchData = await knex("tbl_customer")
      .join("tbl_state", "tbl_state.STATE_ID", "=", "tbl_customer.STATE_ID")
      .join("tbl_cities", "tbl_cities.CITY_ID", "=", "tbl_customer.CITY_ID")
      .select("tbl_state.STATE_NAME", "tbl_customer.*", "tbl_cities.CITY_NAME")
      .where({ "tbl_customer.IS_DELETE": 0 })
      .where((builder) =>
        builder
          .whereILike("tbl_customer.CUSTOMER_NAME", `%${search}%`)
          .orWhereILike("tbl_customer.CUSTOMER_ADDRESS", `%${search}%`)
          .orWhereILike("tbl_state.STATE_NAME", `%${search}%`)
          .orWhereILike("tbl_cities.CITY_NAME", `%${search}%`)
      )
      .orderBy("CUSTOMER_ID", "desc")
      .limit(limit)
      .offset(skip);
    return res.json({ page, per_page, total: total.total, data: searchData });
  } else {
    const getData = await knex("tbl_customer")
      .join("tbl_state", "tbl_state.STATE_ID", "=", "tbl_customer.STATE_ID")
      .join("tbl_cities", "tbl_cities.CITY_ID", "=", "tbl_customer.CITY_ID")
      .select("tbl_state.STATE_NAME", "tbl_customer.*", "tbl_cities.CITY_NAME")
      .orderBy("CUSTOMER_ID", "desc")
      .where({ "tbl_customer.IS_DELETE": 0 })
      .limit(limit)
      .offset(skip);
    if (getData) {
      return res.json({ page, per_page, total: total.total, data: getData });
    } else {
      res.json({ st: false, msg: "Not Found Any Data" });
    }
  }
};

const deleteCustomer = async (req, res) => {
  const id = req.body.CUSTOMER_ID;

  const isDelete = await knex("tbl_customer")
    .update({ IS_DELETE: 1 })
    .where({ CUSTOMER_ID: id });
  if (isDelete) {
    console.log("Deleted");
    return res.json({ st: true, msg: "Delete data successfully." });
  } else {
    console.log("Failed");
    return res.json({ st: true, msg: "Delete data Failed." });
  }
};

const updateCustomer = async (req, res) => {
  const id = req.body.CUSTOMER_ID;
  var Data = {
    CUSTOMER_NAME: req.body.CUSTOMER_NAME,
    CUSTOMER_PHONE_NO: req.body.CUSTOMER_PHONE_NO,
    CUSTOMER_WHATSAPP_NO: req.body.CUSTOMER_WHATSAPP_NO,
    CUSTOMER_ADDRESS: req.body.CUSTOMER_ADDRESS,
    CITY_ID: req.body.CITY_ID,
    STATE_ID: req.body.STATE_ID,
    UPDATED_TIME: new Date(),
  };

  const update = await knex("tbl_customer")
    .update(Data)
    .where({ CUSTOMER_ID: id });

  if (update) {
    console.log("Update");
    return res.json({ st: true, msg: "Update data successfully." });
  } else {
    console.log("Fail");
    return res.json({ st: true, msg: "Update data Failed." });
  }
};

router.post("/addCustomer", verifyAccessToken, addCustomer);

router.get("/getCustomer", verifyAccessToken, getCustomer);

router.get("/getStateData", verifyAccessToken, getStateData);

router.post("/getCityData", verifyAccessToken, getCityData);

router.post("/deleteCustomer", verifyAccessToken, deleteCustomer);

router.post("/updateCustomer", verifyAccessToken, updateCustomer);

module.exports = router;
