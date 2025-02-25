require("dotenv").config();
const { z } = require("zod");
const { zodResponseFormat } = require("openai/helpers/zod"); 
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
                "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJGYzdaSHZUNGozbldNenZkX2xuYUsySGZWWnUtYWtBLTB0TGMwLVgwc1BZIn0.eyJleHAiOjE3NDA1MDIwMTIsImlhdCI6MTc0MDQ2NjAxMywianRpIjoiMjdlNWMzNDQtMWU5NS00NTRlLTgyNmUtZDMwZDM0OGI4MTQyIiwiaXNzIjoiaHR0cDovL2xvY2FsaG9zdDo4OTg5L3JlYWxtcy9uZW9uZSIsImF1ZCI6ImFjY291bnQiLCJzdWIiOiIwYWU4OThmMy1kMjQ4LTRlYWMtODY4MS1iMDM4MWM4MmQ2YzAiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJuZW9uZS1jbGllbnQiLCJhY3IiOiIxIiwiYWxsb3dlZC1vcmlnaW5zIjpbIioiXSwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbIm9mZmxpbmVfYWNjZXNzIiwiZGVmYXVsdC1yb2xlcy1uZW9uZSIsInVtYV9hdXRob3JpemF0aW9uIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsiYWNjb3VudCI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsIm1hbmFnZS1hY2NvdW50LWxpbmtzIiwidmlldy1wcm9maWxlIl19fSwic2NvcGUiOiJwcm9maWxlIGVtYWlsIiwiY2xpZW50SG9zdCI6IjE3Mi4xOC4wLjEiLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImxvZ2lzdGljc19hZ2VudF91cmkiOiJodHRwOi8vbG9jYWxob3N0OjgwODAvbG9naXN0aWNzLW9iamVjdHMvX2RhdGEtaG9sZGVyIiwicHJlZmVycmVkX3VzZXJuYW1lIjoic2VydmljZS1hY2NvdW50LW5lb25lLWNsaWVudCIsImNsaWVudEFkZHJlc3MiOiIxNzIuMTguMC4xIiwiY2xpZW50X2lkIjoibmVvbmUtY2xpZW50In0.uqoro_BhoEniyHpaYu8ZyvABFMntSu367q6B1TlVlqcNzTIh08C3InSmPktrm-SP2ayiROeK-Z8cdwirkN1Og15UK1w75zQIxdOJpoZ9HEWiBMRsvi3jwERG92AVZUgBsvO5F332JE5rqRARK14tPBV6aVJ9pzGvhvI6L_naRqMIXWkw4E9KfUzjuaVWW4KkkZWfYL1VR7zxcY1llWxkRZZoxkMBOV1bK0JNtvvjod-XvPfR74CJQwVOfVdms12AAq348ZRGuzrUz-_LWGA5UsILnS51HpAe3pFy4Qy5HRnQbdrZX_XHcrGWeNVW6CbpEOxGuuZ5OrxNPJJgmrmXaw",
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
                 report detailing the newest order and its positive values e.g id, name, status, type of cargo being used. 
                 You should print out a summary that is structured as so:

                 #structure:
                 1) address the order by its id e.g the order (id) is currently in transit
                 2) then talk about the details of the order using simple language, as well as that explain what is going on in simple language.
                 3) for this example: "The order 5ea97c76-03e1-49f3-a888-cb4365162a94 has reached its destination. This particular order is noted for its successful event of touchdown in London. It was created on February 25, 2025. The event time was marked as actual, highlighting the efficiency of this logistics operation."
                    instead of saying the order is recognised for its successful event of touchdown in london, say that the order has successfully touched down in lonodn. 
                 
                 #rules:
                 1) if no information is given to you, to fill out the fields with the previous data, and the summary should reply with there is currently no changes in the data(say this in exact words)
                 2) if the data updates and no changes are made, reply with the same summary as last time
                 3) if an order has the "ARRIVED" status instead of replying with that, reply by printing out that the oder has reached its destination
                 4) do not directly reference the variables but mesh them into a user friendly sentence. e.g instead of saying the status signals that the order has successfully reached its intended location, write instead: the order has reached its destination
        
                 #phrasing
                 1) the language should be friendly and informal 
                 2) explain in detail what event time measures
                 3) use you and your instead of the eg. your order instead of the order
                 `  },
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
});


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

// Route to display structured analysis in HTML
app.get("/analysis", async (req, res) => {
    try {
        const analysis = await updateOrderStatus();

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

        res.send(htmlContent);
    } catch (error) {
        res.status(500).send("<p>Error generating analysis.</p>");
    }
});

setInterval(updateOrderStatus, 10000);


const PORT = 6000;
app.listen(PORT, () => {
    console.log(` Server running on http://localhost:${PORT}`);
    updateOrderStatus(); 
});
