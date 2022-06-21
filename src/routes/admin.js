const express = require("express");
const router = express.Router();

const controllerAdmin = require("../controllers/admin");

const { verifyAccessToken } = require("../helpers/jwt_helper");

router.post("/admin/signin", controllerAdmin.admin);

router.get("/admin/profile/:id", verifyAccessToken, controllerAdmin.profile);

router.put("/admin/reset", verifyAccessToken, controllerAdmin.reset);

module.exports = router;
