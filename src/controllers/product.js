const knex = require("../../db/config");

async function insertEditProduct(req, res) {
  const {
    PRODUCT_ID,
    CATEGORY_ID,
    HSN_ID,
    PRODUCT_NAME,
    PRODUCT_PRICE,
    PRODUCT_DESCRIPTION,
  } = req.body;

  const getProduct = await knex("tbl_product")
    .where("PRODUCT_ID", PRODUCT_ID)
    .first();

  var data = {
    CATEGORY_ID: CATEGORY_ID,
    HSN_ID: HSN_ID,
    PRODUCT_NAME: PRODUCT_NAME,
    PRODUCT_PRICE: PRODUCT_PRICE,
    PRODUCT_DESCRIPTION: PRODUCT_DESCRIPTION,
  };

  if (getProduct) {
    if (req.file) {
      data.PRODUCT_IMAGE = "product-images/" + req.file.filename;
    }
    data.UPDATED_TIME = new Date();
    const update = await knex("tbl_product")
      .update(data)
      .where({ PRODUCT_ID: PRODUCT_ID });

    if (update) {
      console.log("Update");
      return res.json({ st: true, msg: "Update data successfully." });
    } else {
      console.log("Fail");
      return res.json({ st: true, msg: "Update data Failed." });
    }
  } else {
    data.PRODUCT_IMAGE = "product-images/" + req.file.filename;
    data.CREATED_TIME = new Date();

    const insert = await knex("tbl_product").insert(data);

    if (insert) {
      console.log("Done");
      return res.json({ st: true, msg: "Insert data successfully." });
    } else {
      console.log("Fail");
      return res.json({ st: true, msg: "Insert data Failed." });
    }
  }
}

async function getCategoryData(req, res) {
  const getData = await knex("tbl_category")
    .orderBy("CATEGORY_NAME", "ASC")
    .select()
    .where({ IS_DELETE: 0 });

  if (getData) {
    return res.json({ data: getData });
  } else {
    res.json({ st: false, msg: "Not Found Any Data" });
  }
}

async function getHsnData(req, res) {
  const getData = await knex("hsn_master")
    .orderBy("HSN_ID", "ASC")
    .select()
    .where({ IS_DELETE: 0 });
  if (getData) {
    return res.json({ data: getData });
  } else {
    res.json({ st: false, msg: "Not Found Any Data" });
  }
}

async function getProduct(req, res) {
  let { page, per_page, search } = req.query;
  if (!page) {
    page = 1;
  }

  const limit = parseInt(per_page);
  const skip = (page - 1) * per_page;

  const total = await knex("tbl_product")
    .count("PRODUCT_ID as total")
    .first()
    .where({ IS_DELETE: 0 });

  // console.log(searchData);

  if (search !== "") {
    const searchData = await knex("tbl_product")
      .join(
        "tbl_category",
        "tbl_category.CATEGORY_ID",
        "=",
        "tbl_product.CATEGORY_ID"
      )
      .join("hsn_master", "hsn_master.HSN_ID", "=", "tbl_product.HSN_ID")
      .select(
        "tbl_category.CATEGORY_NAME",
        "tbl_product.*",
        "hsn_master.HSN_CODE"
      )
      .where({ "tbl_product.IS_DELETE": 0 })

      .where((builder) =>
        builder
          .whereILike("tbl_product.PRODUCT_NAME", `%${search}%`)
          .orWhereILike("tbl_product.PRODUCT_DESCRIPTION", `%${search}%`)
          .orWhereILike("tbl_category.CATEGORY_NAME", `%${search}%`)
          .orWhereILike("hsn_master.HSN_CODE", `%${search}%`)
      )
      .limit(limit)
      .offset(skip);
    return res.json({ page, per_page, total: total.total, data: searchData });
  } else {
    const getData = await knex("tbl_product")
      .join(
        "tbl_category",
        "tbl_category.CATEGORY_ID",
        "=",
        "tbl_product.CATEGORY_ID"
      )
      .join("hsn_master", "hsn_master.HSN_ID", "=", "tbl_product.HSN_ID")
      .select(
        "tbl_category.CATEGORY_NAME",
        "tbl_product.*",
        "hsn_master.HSN_CODE"
      )
      .where({ "tbl_product.IS_DELETE": 0 })
      .orderBy("PRODUCT_ID", "desc")
      .limit(limit)
      .offset(skip);
    if (getData) {
      return res.json({ page, per_page, total: total.total, data: getData });
    } else {
      res.json({ st: false, msg: "Not Found Any Data" });
    }
  }
}

async function deleteProduct(req, res) {
  const id = req.body.PRODUCT_ID;

  const isDelete = await knex("tbl_product")
    .update({ IS_DELETE: 1 })
    .where({ PRODUCT_ID: id });
  if (isDelete) {
    console.log("Deleted");
    return res.json({ st: true, msg: "Delete data successfully." });
  } else {
    console.log("Failed");
    return res.json({ st: true, msg: "Delete data Failed." });
  }
}

const product = {
  insertEditProduct,

  getCategoryData,
  getHsnData,
  getProduct,
  deleteProduct,
};

module.exports = product;
