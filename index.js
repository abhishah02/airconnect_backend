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

const sub_admin = require("./src/routes/sub_admin");

const category = require("./src/routes/category");

const product = require("./src/routes/product");

const customer = require("./src/routes/customer");

const hsn = require("./src/routes/hsn");

const sales = require("./src/routes/sales");

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
app.use("/", admin);

//sub-admin
app.use("/", sub_admin);

//Category API
app.use("/", category);

//Product API
app.use("/", product);

//Customer API
app.use("/", customer);

//HSN MASTER API
app.use("/", hsn);

//Sales API
app.use("/", sales);

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
