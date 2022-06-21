const product = require("../controllers/product");
const express = require("express");
const router = express.Router();

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

router.post(
  "/addProduct",
  verifyAccessToken,
  upload.single("PRODUCT_IMAGE"),
  product.addProduct
);

router.post(
  "/updateProduct",
  verifyAccessToken,
  upload.single("PRODUCT_IMAGE"),
  product.updateProduct
);

router.get("/getProduct", verifyAccessToken, product.getProduct);

router.get("/getCategoryData", verifyAccessToken, product.getCategoryData);

router.get("/getHsnData", verifyAccessToken, product.getHsnData);

router.post("/deleteProduct", verifyAccessToken, product.deleteProduct);

module.exports = router;
