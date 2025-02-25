document.addEventListener("DOMContentLoaded", function () {
    const favOrdersContainer = document.getElementById("fav-orders-container");

    async function fetchOrders() {
        try {
            const response = await fetch("http://localhost:4000/orders");
            const orders = await response.json();
            const favOrders = orders.filter(order => order.favorite); // Show only favorited orders
            displayFavOrders(favOrders);
        } catch (error) {
            console.error("Error fetching favorite orders:", error);
            favOrdersContainer.innerHTML = "<p>Failed to load orders.</p>";
        }
    }

    function displayFavOrders(orders) {
        if (orders.length === 0) {
            favOrdersContainer.innerHTML = "<p>No favorite orders.</p>";
            return;
        }

        favOrdersContainer.innerHTML = "";
        orders.forEach(order => {
            const orderElement = document.createElement("div");
            orderElement.classList.add("order-item");
            orderElement.innerHTML = `<p><strong>${order.name}</strong> - Status: ${order.status}</p>`;
            favOrdersContainer.appendChild(orderElement);
        });
    }

    fetchOrders();
    setInterval(fetchOrders, 5000); // Auto-refresh every 5 seconds
});
