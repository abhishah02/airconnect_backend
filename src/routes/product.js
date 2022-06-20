const express = require("express");
const router = express.Router();
const knex = require("../../db/config");
const uuid = require("uuid");
const multer = require("multer");
const { verifyAccessToken } = require("../helpers/jwt_helper");

//Configuration of Multer
const multerStorage = multer.diskStorage({
  destination: (req, file, callBack) => {
    callBack(null, "public/product-images/");
  },
  filename: (req, file, callBack) => {
    const ext = file.mimetype.split("/")[1];
    callBack(null, `admin-${file.fieldname}-${Date.now()}.${ext}`);
  },
});

//Multer Filter
const multerFilter = (req, file, cb) => {
  if (
    file.mimetype.split("/")[1] === "jpg" ||
    file.mimetype.split("/")[1] === "jpeg"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Not a JPG File!!"), false);
  }
};

//Calling the "multer" Function
const upload = multer({
  //   dest: "public/images/",
  storage: multerStorage,
  fileFilter: multerFilter,
});

const addProduct = async (req, res) => {
  const insertData = {
    CATEGORY_ID: req.body.CATEGORY_ID,
    HSN_ID: req.body.HSN_ID,
    PRODUCT_NAME: req.body.PRODUCT_NAME,
    PRODUCT_PRICE: req.body.PRODUCT_PRICE,
    PRODUCT_DESCRIPTION: req.body.PRODUCT_DESCRIPTION,
    PRODUCT_IMAGE: "product-images/" + req.file.filename,
    CREATED_TIME: new Date(),
  };

  const insert = await knex("tbl_product").insert(insertData);

  if (insert) {
    console.log("Done");
    return res.json({ st: true, msg: "Insert data successfully." });
  } else {
    console.log("Fail");
    return res.json({ st: true, msg: "Insert data Failed." });
  }
};

const updateProduct = async (req, res) => {
  const id = req.body.PRODUCT_ID;

  var Data = {
    CATEGORY_ID: req.body.CATEGORY_ID,
    HSN_ID: req.body.HSN_ID,
    PRODUCT_NAME: req.body.PRODUCT_NAME,
    PRODUCT_PRICE: req.body.PRODUCT_PRICE,
    PRODUCT_DESCRIPTION: req.body.PRODUCT_DESCRIPTION,
    UPDATED_TIME: new Date(),
    // PRODUCT_IMAGE: Data.IMAGE[0].DESCRIPTION_IMAGE,
  };
  if (req.file) {
    Data.PRODUCT_IMAGE = "product-images/" + req.file.filename;
  }
  const update = await knex("tbl_product")
    .update(Data)
    .where({ PRODUCT_ID: id });

  if (update) {
    console.log("Update");
    return res.json({ st: true, msg: "Update data successfully." });
  } else {
    console.log("Fail");
    return res.json({ st: true, msg: "Update data Failed." });
  }
};

const getCategoryData = async (req, res) => {
  const getData = await knex("tbl_category")
    .orderBy("CATEGORY_NAME", "ASC")
    .select()
    .where({ IS_DELETE: 0 });

  if (getData) {
    return res.json({ data: getData });
  } else {
    res.json({ st: false, msg: "Not Found Any Data" });
  }
};

const getHsnData = async (req, res) => {
  const getData = await knex("hsn_master")
    .orderBy("HSN_ID", "ASC")
    .select()
    .where({ IS_DELETE: 0 });
  if (getData) {
    return res.json({ data: getData });
  } else {
    res.json({ st: false, msg: "Not Found Any Data" });
  }
};

const getProduct = async (req, res) => {
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
};

const deleteProduct = async (req, res) => {
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
};

router.post(
  "/addProduct",
  verifyAccessToken,
  upload.single("PRODUCT_IMAGE"),
  addProduct
);

router.post(
  "/updateProduct",
  verifyAccessToken,
  upload.single("PRODUCT_IMAGE"),
  updateProduct
);

router.get("/getProduct", verifyAccessToken, getProduct);

router.get("/getCategoryData", verifyAccessToken, getCategoryData);

router.get("/getHsnData", verifyAccessToken, getHsnData);

router.post("/deleteProduct", verifyAccessToken, deleteProduct);

module.exports = router;
