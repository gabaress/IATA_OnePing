const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

let orders = [
    { id: 1, name: "Order #1", status: "Pending", favorite: false },
    { id: 2, name: "Order #2", status: "Shipped", favorite: false },
    { id: 3, name: "Order #3", status: "Delivered", favorite: false }
];

// Fetch the latest logistics event and update Order #1
async function updateOrderStatus() {
    try {
        const response = await axios.get("http://localhost:8080/logistics-objects/civic/logistics-events/", {
            headers: {
                "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJGYzdaSHZUNGozbldNenZkX2xuYUsySGZWWnUtYWtBLTB0TGMwLVgwc1BZIn0.eyJleHAiOjE3NDA0NjA1ODYsImlhdCI6MTc0MDQyNDU4NiwianRpIjoiMmIzMjg1N2ItN2RjNi00MWQzLWJiM2EtOGEyZDFkMzA4ZWI0IiwiaXNzIjoiaHR0cDovL2xvY2FsaG9zdDo4OTg5L3JlYWxtcy9uZW9uZSIsImF1ZCI6ImFjY291bnQiLCJzdWIiOiIwYWU4OThmMy1kMjQ4LTRlYWMtODY4MS1iMDM4MWM4MmQ2YzAiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJuZW9uZS1jbGllbnQiLCJhY3IiOiIxIiwiYWxsb3dlZC1vcmlnaW5zIjpbIioiXSwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbIm9mZmxpbmVfYWNjZXNzIiwiZGVmYXVsdC1yb2xlcy1uZW9uZSIsInVtYV9hdXRob3JpemF0aW9uIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsiYWNjb3VudCI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsIm1hbmFnZS1hY2NvdW50LWxpbmtzIiwidmlldy1wcm9maWxlIl19fSwic2NvcGUiOiJwcm9maWxlIGVtYWlsIiwiY2xpZW50SG9zdCI6IjE3Mi4xOC4wLjEiLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImxvZ2lzdGljc19hZ2VudF91cmkiOiJodHRwOi8vbG9jYWxob3N0OjgwODAvbG9naXN0aWNzLW9iamVjdHMvX2RhdGEtaG9sZGVyIiwicHJlZmVycmVkX3VzZXJuYW1lIjoic2VydmljZS1hY2NvdW50LW5lb25lLWNsaWVudCIsImNsaWVudEFkZHJlc3MiOiIxNzIuMTguMC4xIiwiY2xpZW50X2lkIjoibmVvbmUtY2xpZW50In0.BYxBfDk7C4OMesA5sqH0Yv6jdur1KWIqGm0hCAMWt7yixEchb2VpMGfqR75Xbq817T5g29_SD00eCw_jRU80S-0TmE0c4AmCev47qCH1en_Haw8u84CnErpwqanJjaC9sQ7aiV4nffDQG0WbQnWe0MYcCkaslb8XFWBraVs2o2DJMFOtT1LhPbOOo-_qeqisZvZZDWu61cyH1lnkJudnC85q4PaExKkKpWizlisSD-cwypxSai5Q0ZA5M5dltMEdNRfCpH56lA8oqS95hmeDtfcfTi7fqW8RL93J_p_wqcD3dIzG_30EJKyhr1YC-_Zv_ovCau6fCMxd-CnGUXbBBw",
                "Accept": "application/ld+json; version=2.0.0-dev",
                "Content-Type": "application/ld+json; version=2.0.0-dev"
            }
        });

        if (response.data && response.data["@graph"]) {
            // Sort events by `creationDate` in descending order (newest first)
            const sortedEvents = response.data["@graph"]
                .filter(event => event["@type"] === "LogisticsEvent" && event.creationDate)
                .sort((a, b) => new Date(b.creationDate["@value"]) - new Date(a.creationDate["@value"]));

            if (sortedEvents.length > 0) {
                const latestEvent = sortedEvents[0]; // Get the most recent event
                console.log("📌 Latest Event Retrieved:", latestEvent);

                if (latestEvent.eventName) {
                    orders[0].status = latestEvent.eventName; // Update Order #1
                    console.log(`✅ Order #1 updated to: ${latestEvent.eventName}`);
                }
            } else {
                console.log("⚠️ No valid logistics events found.");
            }
        }
    } catch (error) {
        console.error("❌ Error fetching logistics events:", error.response ? error.response.data : error.message);
    }
}

// API to get all orders
app.get("/orders", (req, res) => {
    res.json(orders);
});

// API to toggle favorite order
app.put("/orders/:id/favorite", (req, res) => {
    const orderId = parseInt(req.params.id);
    const order = orders.find(order => order.id === orderId);
    
    if (!order) {
        return res.status(404).json({ error: "Order not found" });
    }

    order.favorite = !order.favorite; // Toggle favorite status
    res.json(order);
});

// API to manually update order status
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

// Auto-fetch logistics data every 10 seconds
setInterval(updateOrderStatus, 10000);

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    updateOrderStatus(); // Fetch event on startup
});
