const hsn = require("../controllers/hsn");
const express = require("express");
const router = express.Router();

const { verifyAccessToken } = require("../helpers/jwt_helper");

router.post("/insertEditHsn", verifyAccessToken, hsn.insertEditHsn);

router.get("/getHSN", verifyAccessToken, hsn.getHSN);

router.post("/deleteHsn", verifyAccessToken, hsn.deleteHsn);

module.exports = router;
