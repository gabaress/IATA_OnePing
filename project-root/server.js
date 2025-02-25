require("dotenv").config();
const { z } = require("zod");
const { zodResponseFormat } = require("openai/helpers/zod"); // Changed from import to require
const { OpenAI } = require("openai");
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

const openai = new OpenAI();

const AnalysisSchema = z.object({  // Changed variable name for consistency
    id: z.string(),
    name: z.string(),
    status: z.string(),
    summary: z.string(),
});

// Fetch the latest logistics event and update Order #1
async function updateOrderStatus() {
    try {
        const response = await axios.get("http://localhost:8080/logistics-objects/civic/logistics-events/", {
            headers: {
                "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJGYzdaSHZUNGozbldNenZkX2xuYUsySGZWWnUtYWtBLTB0TGMwLVgwc1BZIn0.eyJleHAiOjE3NDA1MDIwMTIsImlhdCI6MTc0MDQ2NjAxMywianRpIjoiMjdlNWMzNDQtMWU5NS00NTRlLTgyNmUtZDMwZDM0OGI4MTQyIiwiaXNzIjoiaHR0cDovL2xvY2FsaG9zdDo4OTg5L3JlYWxtcy9uZW9uZSIsImF1ZCI6ImFjY291bnQiLCJzdWIiOiIwYWU4OThmMy1kMjQ4LTRlYWMtODY4MS1iMDM4MWM4MmQ2YzAiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJuZW9uZS1jbGllbnQiLCJhY3IiOiIxIiwiYWxsb3dlZC1vcmlnaW5zIjpbIioiXSwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbIm9mZmxpbmVfYWNjZXNzIiwiZGVmYXVsdC1yb2xlcy1uZW9uZSIsInVtYV9hdXRob3JpemF0aW9uIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsiYWNjb3VudCI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsIm1hbmFnZS1hY2NvdW50LWxpbmtzIiwidmlldy1wcm9maWxlIl19fSwic2NvcGUiOiJwcm9maWxlIGVtYWlsIiwiY2xpZW50SG9zdCI6IjE3Mi4xOC4wLjEiLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImxvZ2lzdGljc19hZ2VudF91cmkiOiJodHRwOi8vbG9jYWxob3N0OjgwODAvbG9naXN0aWNzLW9iamVjdHMvX2RhdGEtaG9sZGVyIiwicHJlZmVycmVkX3VzZXJuYW1lIjoic2VydmljZS1hY2NvdW50LW5lb25lLWNsaWVudCIsImNsaWVudEFkZHJlc3MiOiIxNzIuMTguMC4xIiwiY2xpZW50X2lkIjoibmVvbmUtY2xpZW50In0.uqoro_BhoEniyHpaYu8ZyvABFMntSu367q6B1TlVlqcNzTIh08C3InSmPktrm-SP2ayiROeK-Z8cdwirkN1Og15UK1w75zQIxdOJpoZ9HEWiBMRsvi3jwERG92AVZUgBsvO5F332JE5rqRARK14tPBV6aVJ9pzGvhvI6L_naRqMIXWkw4E9KfUzjuaVWW4KkkZWfYL1VR7zxcY1llWxkRZZoxkMBOV1bK0JNtvvjod-XvPfR74CJQwVOfVdms12AAq348ZRGuzrUz-_LWGA5UsILnS51HpAe3pFy4Qy5HRnQbdrZX_XHcrGWeNVW6CbpEOxGuuZ5OrxNPJJgmrmXaw",
                "Accept": "application/ld+json; version=2.0.0-dev",
                "Content-Type": "application/ld+json; version=2.0.0-dev"
            }
        });

        const logisticsEvents = response.data;
        const transcript = JSON.stringify(logisticsEvents, null, 2);
        console.log("Raw API Data:", transcript);
    
        // ✅ 3. Call OpenAI API to generate a structured summary
        const completion = await openai.beta.chat.completions.parse({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "your job is to, based on a transcript you're given, write a detailed report detailing the newest order and its positive values e.g id, name, status. You should then print out a 3 sentence summary of what is going on with each value, so that a non technical human can read it " },
            { role: "user", content: transcript }
          ],
          response_format: zodResponseFormat(AnalysisSchema, "analysis") // Now using the correctly named AnalysisSchema
        });

        const analysis = completion.choices[0].message.parsed;
        console.log("Structured Analysis:", JSON.stringify(analysis, null, 2));

        return analysis;

    } catch (error) {
        console.error("Error:", error);
        return { error: "Failed to process AI analysis" };
    }
}

updateOrderStatus().then(summary => {
    console.log("Final Summary:", summary);
});

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
const PORT = 4000;
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    updateOrderStatus(); // Fetch event on startup
});