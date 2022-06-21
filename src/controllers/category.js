const knex = require("../../db/config");

async function insertEditCategory(req, res) {
  const { CATEGORY_ID, CATEGORY_NAME, CATEGORY_DESCRIPTION } = req.body;

  const getCategory = await knex("tbl_category")
    .where("CATEGORY_ID", CATEGORY_ID)
    .first();

  var data = {
    CATEGORY_NAME: CATEGORY_NAME,
    CATEGORY_DESCRIPTION: CATEGORY_DESCRIPTION,
  };

  if (getCategory) {
    if (req.file) {
      data.DESCRIPTION_IMAGE = "images/" + req.file.filename;
    }
    data.UPDATED_TIME = new Date();

    const update = await knex("tbl_category")
      .update(data)
      .where({ CATEGORY_ID: CATEGORY_ID });

    if (update) {
      console.log("Update");
      return res.json({ st: true, msg: "Update data successfully." });
    } else {
      console.log("Fail");
      return res.json({ st: false, msg: "Update data Failed." });
    }
  } else {
    data.DESCRIPTION_IMAGE = "images/" + req.file.filename;
    data.CREATED_TIME = new Date();

    const insert = await knex("tbl_category").insert(data);

    if (insert) {
      console.log("Done");
      return res.json({ st: true, msg: "Insert data successfully." });
    } else {
      console.log("Fail");
      return res.json({ st: false, msg: "Insert data Failed." });
    }
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
  insertEditCategory,
  getCategory,
  deleteCategory,
};

module.exports = category;
