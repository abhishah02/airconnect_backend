const express = require("express");
const router = express.Router();
const knex = require("../../db/config");
const uuid = require("uuid");
const multer = require("multer");
const { verifyAccessToken } = require("../helpers/jwt_helper");

//Configuration of Multer
const multerStorage = multer.diskStorage({
  destination: (req, file, callBack) => {
    callBack(null, "public/images/");
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

const addCategory = async (req, res) => {
  //   console.log(req);
  const insertData = {
    CATEGORY_ID: uuid.v4(req.body.CATEGORY_ID),
    CATEGORY_NAME: req.body.CATEGORY_NAME,
    CATEGORY_DESCRIPTION: req.body.CATEGORY_DESCRIPTION,
    DESCRIPTION_IMAGE: "images/" + req.file.filename,
  };

  const insert = await knex("tbl_category").insert(insertData);

  if (insert) {
    console.log("Done");
    return res.json({ st: true, msg: "Insert data successfully." });
  } else {
    console.log("Fail");
    return res.json({ st: true, msg: "Insert data Failed." });
  }
};

const getCategory = async (req, res) => {
  let { page, per_page } = req.query;
  if (!page) {
    page = 1;
  }

  const limit = parseInt(per_page);
  const skip = (page - 1) * per_page;

  const total = await knex("tbl_category").count("id as total").first();
  const getData = await knex("tbl_category")
    .orderBy("id", "desc")
    .select()
    .limit(limit)
    .offset(skip);

  if (getData) {
    return res.json({ page, per_page, total: total.total, data: getData });
  } else {
    res.json({ st: false, msg: "Not Found Any Data" });
  }
};

router.post(
  "/Category",
  verifyAccessToken,
  upload.single("DESCRIPTION_IMAGE"),
  addCategory
);

router.get("/getCategory", verifyAccessToken, getCategory);

module.exports = router;

// ?page=${page}&size=${size}&delay=1
