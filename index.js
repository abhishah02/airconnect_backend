// NPM Libraries
const express = require("express");
const cors = require("cors");
// const uuid = require("uuid");
const bcrypt = require("bcrypt");
// const mysql = require("mysql");

require("dotenv").config();

//call files
const knex = require("./db/config");
const register = require("./src/routes/user");
const login = require("./src/routes/user");
const admin = require("./src/routes/admin");
const profile = require("./src/routes/admin");
const reset = require("./src/routes/admin");

const addCategory = require("./src/routes/category");
const getCategory = require("./src/routes/category");
const path = require("path");
// const { path } = require("express/lib/application");
// const { verifyAccessToken } = require("./src/helpers/jwt_helper");

//App Definition
const app = express();

app.use(express.static(path.join(__dirname, "./public")));

//Middleware Setup
app.use(express.json());
app.use(cors());

//USER API
app.use("/", register);
app.use("/", login);

//ADMIN API
app.use("/admin", admin);
app.use("/admin/profile", profile);
app.use("/admin", reset);

//Category API
app.use("/", addCategory);
app.use("/", getCategory);

//internal server error
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.send({
    error: {
      st: false,
      status: err.status || 500,
      message: err.message,
    },
  });
});

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});
