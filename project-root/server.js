const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

let orders = [
    { id: 1, name: "Order #1", status: "Pending", favorite: false },
    { id: 2, name: "Order #2", status: "Shipped", favorite: false },
    { id: 3, name: "Order #3", status: "Delivered", favorite: false }
];

// GET Orders
app.get("/orders", (req, res) => {
    res.json(orders);
});

// PUT (Toggle Favorite Order)
app.put("/orders/:id/favorite", (req, res) => {
    const orderId = parseInt(req.params.id);
    const order = orders.find(order => order.id === orderId);
    
    if (!order) {
        return res.status(404).json({ error: "Order not found" });
    }

    order.favorite = !order.favorite; // Toggle favorite status
    res.json(order);
});

// PUT (Update Order Status)
app.put("/orders/:id", (req, res) => {
    const orderId = parseInt(req.params.id);
    const updatedStatus = req.body.status;

    const order = orders.find(order => order.id === orderId);
    if (!order) {
        return res.status(404).json({ error: "Order not found" });
    }

    order.status = updatedStatus;
    res.json(order);
});

// Start Server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});
