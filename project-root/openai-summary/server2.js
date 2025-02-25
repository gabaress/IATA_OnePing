require("dotenv").config();
const { z } = require("zod");
const { zodResponseFormat } = require("openai/helpers/zod"); 
const { OpenAI } = require("openai");
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const fs = require("fs"); // Importing fs module for file writing
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

let orders = [
    { id: 1, name: "Order #1", status: "Pending", favorite: false },
    { id: 2, name: "Order #2", status: "Shipped", favorite: false },
    { id: 3, name: "Order #3", status: "Delivered", favorite: false }
];

const openai = new OpenAI();

const AnalysisSchema = z.object({  
    id: z.string(),
    name: z.string(),
    status: z.string(),
    summary: z.string(),
});


async function updateOrderStatus() {
    try {
        const response = await axios.get("http://localhost:8080/logistics-objects/A3/logistics-events/", {
            headers: {
                "Authorization": "Bearer <your-token>",
                "Accept": "application/ld+json; version=2.0.0-dev",
                "Content-Type": "application/ld+json; version=2.0.0-dev"
            }
        });

        const logisticsEvents = response.data;
        const transcript = JSON.stringify(logisticsEvents, null, 2);
        console.log("Raw API Data:", transcript);
    

        const completion = await openai.beta.chat.completions.parse({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: `your job is to, based on a transcript you're given, write a detailed
                 report detailing the newest order and its positive values...`},
            { role: "user", content: transcript }
          ],
          response_format: zodResponseFormat(AnalysisSchema, "analysis") 
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
    generateHTMLFile(summary); // Generate the HTML file after fetching the summary
});


function generateHTMLFile(analysis) {
    const htmlContent = `
        <html>
            <head>
                <title>Order Status Analysis</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    h1 { color: #333; }
                    pre { background-color: #f4f4f4; padding: 10px; }
                </style>
            </head>
            <body>
                <h1>Order Status Analysis</h1>
                <h2>Order ID: ${analysis.id}</h2>
                <p><strong>Name:</strong> ${analysis.name}</p>
                <p><strong>Status:</strong> ${analysis.status}</p>
                <h3>Summary</h3>
                <p>${analysis.summary}</p>
            </body>
        </html>
    `;

    // Define the path to the HTML file
    const filePath = path.join(__dirname, 'order-tracker-website', 'index.html');

    // Write the HTML content to the file
    fs.writeFileSync(filePath, htmlContent, "utf-8");
    console.log(`HTML file created successfully at: ${filePath}`);
}


app.get("/orders", (req, res) => {
    res.json(orders);
});


app.put("/orders/:id/favorite", (req, res) => {
    const orderId = parseInt(req.params.id);
    const order = orders.find(order => order.id === orderId);
    
    if (!order) {
        return res.status(404).json({ error: "Order not found" });
    }

    order.favorite = !order.favorite; 
    res.json(order);
});


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


setInterval(updateOrderStatus, 10000);

const PORT = 6000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    updateOrderStatus(); 
});