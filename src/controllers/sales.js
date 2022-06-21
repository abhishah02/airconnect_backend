const knex = require("../../db/config");

async function insertEditSales(req, res) {
  const {
    SALES_ID,
    SALES_BILL_NO,
    SALES_DATE,
    CUSTOMER_ID,
    TOTAL_IGST,
    TOTAL_SGST,
    TOTAL_CGST,
    TOTAL,
    GRAND_TOTAL,
  } = req.body[1];

  const getSale = await knex("tbl_sales").where("SALES_ID", SALES_ID).first();

  const data = {
    SALES_BILL_NO: SALES_BILL_NO,
    SALES_DATE: SALES_DATE,
    CUSTOMER_ID: CUSTOMER_ID,
    TOTAL_IGST: TOTAL_IGST,
    TOTAL_SGST: TOTAL_SGST,
    TOTAL_CGST: TOTAL_CGST,
    TOTAL: TOTAL,
    GRAND_TOTAL: GRAND_TOTAL,
  };

  if (getSale) {
    data.UPDATED_TIME = new Date();
    const update = await knex("tbl_sales")
      .update(data)
      .where({ SALES_ID: SALES_ID });

    if (update) {
      for (let i = 0; i < req.body[0].data.length; i++) {
        const itemId = req.body[0].data[i].SALES_ITEM_ID;
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
          SALES_ID: SALES_ID,
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
      }
      return res.json({ st: true, msg: "Update data successfully." });
    } else {
      console.log("Fail");
      return res.json({ st: true, msg: "Update data Failed." });
    }
  } else {
    data.CREATED_TIME = new Date();
    const insert = await knex("tbl_sales").insert(data);

    if (insert) {
      for (let i = 0; i < req.body[0].data.length; i++) {
        const insertData = {
          SALES_ID: insert[0],
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
      }
      return res.json({ st: true, msg: "Insert data successfully." });
    } else {
      console.log("Fail");
      return res.json({ st: true, msg: "Insert data Failed." });
    }
  }
}

async function getCustomerData(req, res) {
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
}

async function getProductData(req, res) {
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
}

async function getbill(req, res) {
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
}

async function deleteBill(req, res) {
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
}

async function getbillAllData(req, res) {
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

  if (getData) {
    return res.json({ data: getData });
  } else {
    res.json({ st: false, msg: "Not Found Any Data" });
  }
}

const sales = {
  insertEditSales,
  getCustomerData,
  getProductData,
  getbill,
  deleteBill,
  getbillAllData,
};

module.exports = sales;
