const knex = require("../../db/config");

async function insertEditCustomer(req, res) {
  const {
    CUSTOMER_ID,
    CUSTOMER_NAME,
    CUSTOMER_PHONE_NO,
    CUSTOMER_WHATSAPP_NO,
    CUSTOMER_ADDRESS,
    STATE_ID,
    CITY_ID,
  } = req.body;

  const getCustomer = await knex("tbl_customer")
    .where("CUSTOMER_ID", CUSTOMER_ID)
    .first();

  var data = {
    CUSTOMER_NAME: CUSTOMER_NAME,
    CUSTOMER_PHONE_NO: CUSTOMER_PHONE_NO,
    CUSTOMER_WHATSAPP_NO: CUSTOMER_WHATSAPP_NO,
    CUSTOMER_ADDRESS: CUSTOMER_ADDRESS,
    STATE_ID: STATE_ID,
    CITY_ID: CITY_ID,
  };

  if (getCustomer) {
    data.UPDATED_TIME = new Date();

    const update = await knex("tbl_customer")
      .update(data)
      .where({ CUSTOMER_ID: CUSTOMER_ID });

    if (update) {
      console.log("Update");
      return res.json({ st: true, msg: "Update data successfully." });
    } else {
      console.log("Fail");
      return res.json({ st: true, msg: "Update data Failed." });
    }
  } else {
    data.CREATED_TIME = new Date();

    const insert = await knex("tbl_customer").insert(data);

    if (insert) {
      console.log("Done");
      return res.json({ st: true, msg: "Insert data successfully." });
    } else {
      console.log("Fail");
      return res.json({ st: true, msg: "Insert data Failed." });
    }
  }
}

async function getStateData(req, res) {
  const getData = await knex("tbl_state").select().orderBy("STATE_NAME", "ASC");

  if (getData) {
    return res.json({ data: getData });
  } else {
    res.json({ st: false, msg: "Not Found Any Data" });
  }
}

async function getCityData(req, res) {
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
}

async function getCustomer(req, res) {
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
}

async function deleteCustomer(req, res) {
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
}

const customer = {
  insertEditCustomer,
  getStateData,
  getCityData,
  getCustomer,
  deleteCustomer,
};

module.exports = customer;
