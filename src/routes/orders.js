// src/routes/orders.js
// REST API for orders: add orders, view order details, calculate totals,
// link orders with customers and products.

const express = require("express");
const router = express.Router();
const pool = require("../db");

router.get("/", async (req, res) => {
  try {
    const result = await pool.query("select * from orders order by id");
    res.json(result.rows);
  } catch (err) {
    console.error("Error listing orders:", err);
    res.status(500).json({ error: "Failed to list orders" });
  }
});

router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);

  try {
    const orderResult = await pool.query(
      "select * from orders where id = $1",
      [id]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: "order not found" });
    }

    const itemsResult = await pool.query(
      `select oi.id,oi.product_id,p.name as product_name,oi.quantity,oi.price
       from order_items oi
       join products p on p.id = oi.product_id
       where oi.order_id = $1`,
      [id]
    );

    res.json({
      order: orderResult.rows[0],
      items: itemsResult.rows,
    });
  } catch (err) {
    console.error("error", err);
    res.status(500).json({ error: "error" });
  }
});

router.post("/", async (req, res) => {
  const { customer_id, items } = req.body;

  // простая валидация
  if (!customer_id || !Array.isArray(items) || items.length === 0) {
    return res
      .status(400)
      .json({ error: "customer_id and items are required" });
  }

  const client = await pool.connect();

  try {
    await client.query("begin");

    const customerResult = await client.query(
      "select id from customers where id = $1",
      [customer_id]
    );
    if (customerResult.rows.length === 0) {
      await client.query("rollback");
      return res.status(400).json({ error: "customer does not exist" });
    }

    let total = 0;
    const orderItemsToInsert = [];

    for (const item of items) {
      const productId = Number(item.product_id);
      const quantity = Number(item.quantity);

      const productResult = await client.query(
        "select id, price, stock from products where id = $1",
        [productId]
      );
      if (productResult.rows.length === 0) {
        await client.query("rollback");
        return res
          .status(400)
          .json({ error: `product ${productId} does not exist` });
      }

      const product = productResult.rows[0];

      if (product.stock < quantity) {
        await client.query("rollback");
        return res.status(400).json({
          error: `not enough stock for product ${productId}`,
        });
      }

      const price = Number(product.price);
      total += price * quantity;

      await client.query(
        "update products set stock = stock - $1 where id = $2",
        [quantity, productId]
      );

      orderItemsToInsert.push({
        product_id: productId,
        quantity,
        price,
      });
    }

    const orderResult = await client.query(
      "insert into orders (customer_id, total) values ($1, $2) returning *",
      [customer_id, total]
    );
    const order = orderResult.rows[0];

    const insertedItems = [];
    for (const item of orderItemsToInsert) {
      const itemResult = await client.query(
        `insert into order_items (order_id, product_id, quantity, price)
         values ($1, $2, $3, $4)
         returning *`,
        [order.id, item.product_id, item.quantity, item.price]
      );
      insertedItems.push(itemResult.rows[0]);
    }

    await client.query("commit");

    res.status(201).json({
      message: "order created",
      order,
      items: insertedItems,
    });
  } catch (err) {
    await client.query("rollback");
    console.error("error", err);
    res.status(500).json({ error: "error" });
  } finally {
    client.release();
  }
});

module.exports = router;
