const subAdmin = require("../controllers/sub_admin");
const express = require("express");
const router = express.Router();

const { verifyAccessToken } = require("../helpers/jwt_helper");

router.post("/insertEditAdmin", verifyAccessToken, subAdmin.insertEditAdmin);

router.get("/getRole", verifyAccessToken, subAdmin.getRole);

router.get("/getSubAdmin", verifyAccessToken, subAdmin.getSubAdmin);

router.post("/deleteSubAdmin", verifyAccessToken, subAdmin.deleteSubAdmin);

module.exports = router;
