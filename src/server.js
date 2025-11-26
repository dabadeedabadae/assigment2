const express = require("express");

const customerRoutes = require("./routes/customers");
const employeeRoutes = require("./routes/employees");
const productRoutes = require("./routes/products");
const orderRoutes = require("./routes/orders");
const path = require("path")
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use("/api/customers", customerRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use(express.static(path.join(__dirname, "..", "public")));

app.get("/", (req,res) => {
    res.send("Come on over and do the twist, uh-huh")
});

app.get("/api/health", (req, res) => {
    res.json({ status: "Winner winner chicken dinner"});
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
