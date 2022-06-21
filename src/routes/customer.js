const customer = require("../controllers/customer");
const express = require("express");
const router = express.Router();

const { verifyAccessToken } = require("../helpers/jwt_helper");

router.post("/addCustomer", verifyAccessToken, customer.addCustomer);

router.get("/getCustomer", verifyAccessToken, customer.getCustomer);

router.get("/getStateData", verifyAccessToken, customer.getStateData);

router.post("/getCityData", verifyAccessToken, customer.getCityData);

router.post("/deleteCustomer", verifyAccessToken, customer.deleteCustomer);

router.post("/updateCustomer", verifyAccessToken, customer.updateCustomer);

module.exports = router;
