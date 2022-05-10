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

//App Definition
const app = express();

//Middleware Setup
app.use(express.json());
app.use(cors());

//USER API
app.use("/", register);
app.use("/", login);

//ADMIN API
app.use("/admin", admin);
// app.use("/admin",uggh, admin);

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});
