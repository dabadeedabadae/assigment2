const express = require("express");
const router = express.Router();

const pool = require("../db");
//get all customers
router.get("/", async (req, res) => {
    try {
        const result = await pool.query("select * from customers order by id");
        res.json(result.rows);
    } catch (err) {
        console.error("Error listing customers:", err);
        res.status(500).json({ error: "Failed to list customers"});
    }
});
// get /api/customers/:id

router.get("/:id", async (req, res) => {
    const id = Number(req.params.id);
    try {
        const result = await pool.query("select * from customers where id = $1", [id]);
        if (result.rows.lenght === 0){
            return res.status(404).json({ error: "customers not found or dead"});
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error("error", err);
        res.status(500).json({ error: "error"});
    }
});
// postic
router.post("/", async (req, res) => {
    const { name, email } = req.body;

    if (!name || !email) {
        return res.status(400).json({ error: "are required"});
    }
    try {
        const result = await pool.query(
            "insert into customers (name, email) values ($1, $2) returning *", [name, email]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("error", err);
        res.status(500).json({ error: "error"});
    }
});

router.put("/:id", async (req,res) => {
    const id = Number(req.params.id);
    const { name, email } = req.body;

    try {
        const result = await pool.query("update customers set name = $1, email = $2 where id = $3 returning *", [name, email, id]

        );
    
    if (result.rows.lenght === 0) {
        return res.status(404).json({ error: " not found"});
    }
    res.json(result.rows[0]);
    } catch (err) {
        console.error("error", err);
        res.status(500).json({ error: "error"});
    }
});

router.delete("/:id", async (req, res) => {
    const id = Number(req.params.id);
    try  {
        const result = await pool.query(
            'delete from customers where id = $1 returning *', [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({error: "not found"});
        }
        res.json({message: "deleted", customer: result.rows[0]});
    } catch (err) {
        console.error("error", err);
        res.status(500).json({error:"errrroroororor"})
    }
});
module.exports = router;
