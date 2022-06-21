const sales = require("../controllers/sales");
const express = require("express");
const router = express.Router();
const knex = require("../../db/config");

const { verifyAccessToken } = require("../helpers/jwt_helper");

router.post("/insertEditSales", verifyAccessToken, sales.insertEditSales);

router.get("/getCustomerData", verifyAccessToken, sales.getCustomerData);

router.get("/getProductData", verifyAccessToken, sales.getProductData);

router.get("/getbill", verifyAccessToken, sales.getbill);

router.post("/deleteBill", verifyAccessToken, sales.deleteBill);

router.post("/getbillAllData", verifyAccessToken, sales.getbillAllData);

module.exports = router;
