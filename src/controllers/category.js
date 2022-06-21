const knex = require("../../db/config");

async function addCategory(req, res) {
  const insertData = {
    CATEGORY_NAME: req.body.CATEGORY_NAME,
    CATEGORY_DESCRIPTION: req.body.CATEGORY_DESCRIPTION,
    DESCRIPTION_IMAGE: "images/" + req.file.filename,
    CREATED_TIME: new Date(),
  };

  const insert = await knex("tbl_category").insert(insertData);

  if (insert) {
    console.log("Done");
    return res.json({ st: true, msg: "Insert data successfully." });
  } else {
    console.log("Fail");
    return res.json({ st: false, msg: "Insert data Failed." });
  }
}

async function updateCategory(req, res) {
  const id = req.body.CATEGORY_ID;
  var Data = {
    CATEGORY_NAME: req.body.CATEGORY_NAME,
    CATEGORY_DESCRIPTION: req.body.CATEGORY_DESCRIPTION,
    UPDATED_TIME: new Date(),
    // DESCRIPTION_IMAGE: Data.IMAGE[0].DESCRIPTION_IMAGE,
  };
  if (req.file) {
    Data.DESCRIPTION_IMAGE = "images/" + req.file.filename;
  }
  const update = await knex("tbl_category")
    .update(Data)
    .where({ CATEGORY_ID: id });

  if (update) {
    console.log("Update");
    return res.json({ st: true, msg: "Update data successfully." });
  } else {
    console.log("Fail");
    return res.json({ st: false, msg: "Update data Failed." });
  }
}

async function getCategory(req, res) {
  try {
    let { page, per_page, search } = req.query;
    if (!page) {
      page = 1;
    }

    const limit = parseInt(per_page);
    const skip = (page - 1) * per_page;

    const total = await knex("tbl_category")
      .count("CATEGORY_ID as total")
      .first()
      .where({ IS_DELETE: 0 });

    // console.log("abhi1");

    if (search !== "") {
      const searchData = await knex("tbl_category")
        .orderBy("CATEGORY_ID", "desc")
        .select()
        .where({ IS_DELETE: 0 })
        .where((builder) =>
          builder
            .whereILike("CATEGORY_NAME", `%${search}%`)
            .orWhereILike("CATEGORY_DESCRIPTION", `%${search}%`)
        )

        .limit(limit)
        .offset(skip);
      // console.log("abhi2");
      return res.json({ page, per_page, total: total.total, data: searchData });
    } else {
      // console.log("abhi");

      const getData = await knex("tbl_category")
        .orderBy("CATEGORY_ID", "desc")
        .select()
        .where({ IS_DELETE: 0 })
        .limit(limit)
        .offset(skip);
      // .toSQL();
      // console.log(getData);
      // console.log("abhi3");
      if (getData) {
        return res.json({ page, per_page, total: total.total, data: getData });
      } else {
        // console.log("abhi4");
        res.json({ st: false, msg: "Not Found Any Data" });
      }
    }
  } catch (error) {
    console.log(error);
  }
}

async function deleteCategory(req, res) {
  const id = req.body.CATEGORY_ID;

  const isDelete = await knex("tbl_category")
    .update({ IS_DELETE: 1 })
    .where({ CATEGORY_ID: id });
  if (isDelete) {
    console.log("Deleted");
    return res.json({ st: true, msg: "Delete data successfully." });
  } else {
    console.log("Failed");
    return res.json({ st: true, msg: "Delete data Failed." });
  }
}

const category = {
  addCategory,
  updateCategory,
  getCategory,
  deleteCategory,
};

module.exports = category;
