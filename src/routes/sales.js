const express = require("express");
const router = express.Router();
const knex = require("../../db/config");

const { verifyAccessToken } = require("../helpers/jwt_helper");

const getCustomerData = async (req, res) => {
  const getData = await knex("tbl_customer")
    .join("tbl_state", "tbl_state.STATE_ID", "=", "tbl_customer.STATE_ID")
    .join("tbl_cities", "tbl_cities.CITY_ID", "=", "tbl_customer.CITY_ID")
    .select(
      "tbl_state.STATE_NAME",
      "tbl_customer.STATE_ID",
      "tbl_customer.CUSTOMER_NAME",
      "tbl_customer.CUSTOMER_ID",
      "tbl_cities.CITY_NAME"
    )
    .where({ "tbl_customer.IS_DELETE": 0 });

  if (getData) {
    return res.json({ data: getData });
  } else {
    res.json({ st: false, msg: "Not Found Any Data" });
  }
};

const getProductData = async (req, res) => {
  const getData = await knex("tbl_product")
    .join("hsn_master", "hsn_master.HSN_ID", "=", "tbl_product.HSN_ID")
    .select("tbl_product.*", "hsn_master.*")
    .where({ "tbl_product.IS_DELETE": 0 });
  var arr = [];
  for (var x in getData) {
    arr.push({
      value: getData[x].PRODUCT_ID,
      label: getData[x].PRODUCT_NAME,
      price: getData[x].PRODUCT_PRICE,
      hsncode: getData[x].HSN_CODE,
      cgst: getData[x].CGST,
      sgst: getData[x].SGST,
      igst: getData[x].IGST,
    });
  }

  return res.json({ data: arr });
};

const addProductData = async (req, res) => {
  const insertData = {
    SALES_BILL_NO: req.body[1].SALES_BILL_NO,
    SALES_DATE: req.body[1].SALES_DATE,
    CUSTOMER_ID: req.body[1].CUSTOMER_ID,
    TOTAL_IGST: req.body[1].TOTAL_IGST,
    TOTAL_SGST: req.body[1].TOTAL_SGST,
    TOTAL_CGST: req.body[1].TOTAL_CGST,
    TOTAL: req.body[1].TOTAL,
    GRAND_TOTAL: req.body[1].GRAND_TOTAL,
    CREATED_TIME: new Date(),
  };

  const insertFirst = await knex("tbl_sales").insert(insertData);
  // console.log(insertData);

  if (insertFirst) {
    for (let i = 0; i < req.body[0].data.length; i++) {
      const insertData = {
        SALES_ID: insertFirst[0],
        PRODUCT_ID: req.body[0].data[i].PRODUCT_ID,
        PRODUCT_PRICE: req.body[0].data[i].PRODUCT_PRICE,
        PRODUCT_NAME: req.body[0].data[i].PRODUCT_NAME,
        HSN_CODE: req.body[0].data[i].HSN_CODE,
        PRODUCT_QTY: req.body[0].data[i].qty,
        IGST: req.body[0].data[i].IGST,
        CGST: req.body[0].data[i].CGST,
        SGST: req.body[0].data[i].SGST,
      };
      await knex("tbl_sales_items").insert(insertData);
      // console.log(insertData);
    }

    console.log("Done");
    return res.json({ st: true, msg: "Insert data successfully." });
  } else {
    console.log("Fail");
    return res.json({ st: true, msg: "Insert data Failed." });
  }
};

const getbill = async (req, res) => {
  let { page, per_page, search } = req.query;
  if (!page) {
    page = 1;
  }

  const limit = parseInt(per_page);
  const skip = (page - 1) * per_page;

  const total = await knex("tbl_sales").count("SALES_ID as total").first();

  if (search !== "") {
    const searchData = await knex("tbl_sales")
      .join(
        "tbl_customer",
        "tbl_customer.CUSTOMER_ID",
        "=",
        "tbl_sales.CUSTOMER_ID"
      )
      .select(
        "tbl_customer.CUSTOMER_NAME",
        "tbl_customer.STATE_ID",
        "tbl_sales.*"
      )
      .where({ "tbl_sales.IS_DELETE": 0 })
      .where((builder) =>
        builder
          .whereILike("tbl_customer.CUSTOMER_NAME", `%${search}%`)
          .orWhereILike("tbl_sales.SALES_BILL_NO", `%${search}%`)
      )
      .orderBy("SALES_ID", "desc")
      .limit(limit)
      .offset(skip);
    return res.json({ page, per_page, total: total.total, data: searchData });
  } else {
    const getData = await knex("tbl_sales")
      .join(
        "tbl_customer",
        "tbl_customer.CUSTOMER_ID",
        "=",
        "tbl_sales.CUSTOMER_ID"
      )
      .select(
        "tbl_customer.CUSTOMER_NAME",
        "tbl_customer.STATE_ID",
        "tbl_sales.*"
      )
      .where({ "tbl_sales.IS_DELETE": 0 })
      .orderBy("SALES_ID", "desc")
      .limit(limit)
      .offset(skip);
    if (getData) {
      return res.json({ page, per_page, total: total.total, data: getData });
    } else {
      res.json({ st: false, msg: "Not Found Any Data" });
    }
  }
};

const deleteBill = async (req, res) => {
  const id = req.body.SALES_ID;
  const isDelete = await knex("tbl_sales")
    .update({ IS_DELETE: 1 })
    .where({ SALES_ID: id });

  if (isDelete) {
    console.log("Deleted");
    return res.json({ st: true, msg: "Delete data successfully." });
  } else {
    console.log("Failed");
    return res.json({ st: true, msg: "Delete data Failed." });
  }
};

const getbillAllData = async (req, res) => {
  const id = req.body.SALES_ID;
  const getData = await knex("tbl_sales")
    .join(
      "tbl_sales_items",
      "tbl_sales_items.SALES_ID",
      "=",
      "tbl_sales.SALES_ID"
    )
    .select("tbl_sales.*", "tbl_sales_items.*")
    .where({ "tbl_sales.SALES_ID": id })
    .andWhere({ "tbl_sales_items.IS_DELETE": 0 });

  // const getDataIsDelete = await knex("tbl_sales")
  //   .select("SALES_ID", "SALES_BILL_NO", "SALES_DATE", "CUSTOMER_ID")
  //   .where({ SALES_ID: id });
  if (getData) {
    return res.json({ data: getData });
  } else {
    // if (getDataIsDelete) {
    //   return res.json({ data: getDataIsDelete });
    // }
    res.json({ st: false, msg: "Not Found Any Data" });
  }
};

const updateBillData = async (req, res) => {
  const id = req.body[1].SALES_ID;

  var Data = {
    SALES_BILL_NO: req.body[1].SALES_BILL_NO,
    SALES_DATE: req.body[1].SALES_DATE,
    CUSTOMER_ID: req.body[1].CUSTOMER_ID,
    TOTAL_IGST: req.body[1].TOTAL_IGST,
    TOTAL_SGST: req.body[1].TOTAL_SGST,
    TOTAL_CGST: req.body[1].TOTAL_CGST,
    TOTAL: req.body[1].TOTAL,
    GRAND_TOTAL: req.body[1].GRAND_TOTAL,
    UPDATED_TIME: new Date(),
  };
  const update = await knex("tbl_sales").update(Data).where({ SALES_ID: id });

  if (update) {
    for (let i = 0; i < req.body[0].data.length; i++) {
      const itemId = req.body[0].data[i].SALES_ITEM_ID;
      console.log(itemId);
      // continue;
      const updateData = {
        PRODUCT_ID: req.body[0].data[i].PRODUCT_ID,
        PRODUCT_PRICE: req.body[0].data[i].PRODUCT_PRICE,
        PRODUCT_NAME: req.body[0].data[i].PRODUCT_NAME,
        HSN_CODE: req.body[0].data[i].HSN_CODE,
        PRODUCT_QTY: req.body[0].data[i].PRODUCT_QTY,
        IGST: req.body[0].data[i].IGST,
        CGST: req.body[0].data[i].CGST,
        SGST: req.body[0].data[i].SGST,
      };

      const insertData = {
        SALES_ID: id,
        PRODUCT_ID: req.body[0].data[i].PRODUCT_ID,
        PRODUCT_PRICE: req.body[0].data[i].PRODUCT_PRICE,
        PRODUCT_NAME: req.body[0].data[i].PRODUCT_NAME,
        HSN_CODE: req.body[0].data[i].HSN_CODE,
        PRODUCT_QTY: req.body[0].data[i].PRODUCT_QTY,
        IGST: req.body[0].data[i].IGST,
        CGST: req.body[0].data[i].CGST,
        SGST: req.body[0].data[i].SGST,
      };

      if (itemId) {
        await knex("tbl_sales_items")
          .update(updateData)
          .where({ SALES_ITEM_ID: itemId });
      } else {
        await knex("tbl_sales_items").insert(insertData);
      }

      // console.log(updatesecond);
    }
    console.log(update);
    return res.json({ st: true, msg: "Update data successfully." });
  } else {
    console.log("Fail");
    return res.json({ st: true, msg: "Update data Failed." });
  }
};

router.get("/getCustomerData", verifyAccessToken, getCustomerData);

router.get("/getProductData", verifyAccessToken, getProductData);

router.post("/addProductData", verifyAccessToken, addProductData);

router.get("/getbill", verifyAccessToken, getbill);

router.post("/deleteBill", verifyAccessToken, deleteBill);

router.post("/getbillAllData", verifyAccessToken, getbillAllData);

router.post("/updateBillData", verifyAccessToken, updateBillData);

module.exports = router;
