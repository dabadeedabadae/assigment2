const express = require("express");
const router = express.Router();

const pool = require("../db");

router.get("/", async (req, res) => {
  try {
    const result = await pool.query("select * from employees order by id");
    res.json(result.rows);
  } catch (err) {
    console.error("Error listing employees:", err);
    res.status(500).json({ error: "Failed to list employees" });
  }
});

router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);

  try {
    const result = await pool.query("select * from employees where id = $1", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "employee not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("error", err);
    res.status(500).json({ error: "error" });
  }
});

router.post("/", async (req, res) => {
  const { name, role } = req.body;

  if (!name || !role) {
    return res.status(400).json({ error: "name and role are required" });
  }

  try {
    const result = await pool.query(
      "insert into employees (name, role) values ($1, $2) returning *",
      [name, role]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("error", err);
    res.status(500).json({ error: "error" });
  }
});

router.put("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { name, role } = req.body;

  try {
    const result = await pool.query(
      "update employees set name = $1, role = $2 where id = $3 returning *",
      [name, role, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "employee not found" });
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
      "delete from employees where id = $1 returning *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "employee not found" });
    }

    res.json({ message: "deleted", employee: result.rows[0] });
  } catch (err) {
    console.error("error", err);
    res.status(500).json({ error: "error" });
  }
});

module.exports = router;
