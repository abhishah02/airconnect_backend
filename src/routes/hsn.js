const hsn = require("../controllers/hsn");
const express = require("express");
const router = express.Router();

const { verifyAccessToken } = require("../helpers/jwt_helper");

router.post("/addHsn", verifyAccessToken, hsn.addHsn);

router.get("/getHSN", verifyAccessToken, hsn.getHSN);

router.post("/deleteHsn", verifyAccessToken, hsn.deleteHsn);

router.post("/updateHsn", verifyAccessToken, hsn.updateHsn);

module.exports = router;
