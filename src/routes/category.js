const category = require("../controllers/category");
const express = require("express");
const router = express.Router();
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

router.post(
  "/updateCategory",
  verifyAccessToken,
  upload.single("DESCRIPTION_IMAGE"),
  category.updateCategory
);

router.post(
  "/Category",
  verifyAccessToken,
  upload.single("DESCRIPTION_IMAGE"),
  category.addCategory
);

router.get("/getCategory", verifyAccessToken, category.getCategory);

router.post("/deleteCategory", verifyAccessToken, category.deleteCategory);

module.exports = router;
