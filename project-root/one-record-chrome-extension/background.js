console.log("ONETrackr Extension Installed");

// Store previous order statuses
let previousOrderStatuses = {};

// Function to check for updates on favorited orders
async function checkForOrderUpdates() {
    try {
        const response = await fetch("http://localhost:4000/orders");
        const orders = await response.json();

        orders.forEach(order => {
            if (order.favorite) {
                const prevStatus = previousOrderStatuses[order.id];

                // If status has changed, send a notification
                if (prevStatus && prevStatus !== order.status) {
                    chrome.notifications.create({
                        type: "basic",
                        iconUrl: "icon.png",
                        title: "Order Update",
                        message: `${order.name} is now ${order.status}!`
                    });
                }

                // Update stored status
                previousOrderStatuses[order.id] = order.status;
            }
        });
    } catch (error) {
        console.error("Error checking order updates:", error);
    }
}

// Check for updates every 10 seconds
setInterval(checkForOrderUpdates, 10000);
