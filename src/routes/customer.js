const customer = require("../controllers/customer");
const express = require("express");
const router = express.Router();

const { verifyAccessToken } = require("../helpers/jwt_helper");

router.post(
  "/insertEditCustomer",
  verifyAccessToken,
  customer.insertEditCustomer
);

router.get("/getCustomer", verifyAccessToken, customer.getCustomer);

router.get("/getStateData", verifyAccessToken, customer.getStateData);

router.post("/getCityData", verifyAccessToken, customer.getCityData);

router.post("/deleteCustomer", verifyAccessToken, customer.deleteCustomer);

module.exports = router;
