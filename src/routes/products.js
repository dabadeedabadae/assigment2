const express = require("express");
const router = express.Router();

const pool = require("../db");

router.get("/", async (req, res) => {
  try {
    const result = await pool.query("select * from products order by id");
    res.json(result.rows);
  } catch (err) {
    console.error("Error listing products:", err);
    res.status(500).json({ error: "Failed to list products" });
  }
});

router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);

  try {
    const result = await pool.query("select * from products where id = $1", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "product not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("error", err);
    res.status(500).json({ error: "error" });
  }
});


router.post("/", async (req, res) => {
  const { name, price, stock } = req.body;

  if (!name || price == null || stock == null) {
    return res
      .status(400)
      .json({ error: "name, price and stock are required" });
  }

  try {
    const result = await pool.query(
      "insert into products (name, price, stock) values ($1, $2, $3) returning *",
      [name, price, stock]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("error", err);
    res.status(500).json({ error: "error" });
  }
});

router.put("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { name, price, stock } = req.body;

  try {
    const result = await pool.query(
      "update products set name = $1, price = $2, stock = $3 where id = $4 returning *",
      [name, price, stock, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "product not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("error", err);
    res.status(500).json({ error: "error" });
  }
});

router.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);

  try {
    const result = await pool.query(
      "delete from products where id = $1 returning *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "product not found" });
    }

    res.json({ message: "deleted", product: result.rows[0] });
  } catch (err) {
    console.error("error", err);
    res.status(500).json({ error: "error" });
  }
});

module.exports = router;
