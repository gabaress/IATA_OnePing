document.addEventListener("DOMContentLoaded", async function () {
    const ordersContainer = document.getElementById("orders-container");

    // Fetch and display orders
    async function fetchOrders() {
        try {
            const response = await fetch("http://localhost:4000/orders");
            const orders = await response.json();
            updateOrders(orders);
        } catch (error) {
            console.error("Error fetching orders:", error);
            ordersContainer.innerHTML = "<p>Failed to load orders.</p>";
        }
    }

    // Function to update order statuses dynamically
    function updateOrders(orders) {
        ordersContainer.innerHTML = "";
        orders.forEach(order => {
            const orderElement = document.createElement("div");
            orderElement.classList.add("order-item");
            orderElement.setAttribute("data-id", order.id);

            orderElement.innerHTML = `
                <p><strong>${order.name}</strong> - <span class="order-status">Status: ${order.status}</span></p>
                <label>
                    <input type="checkbox" class="fav-checkbox" data-id="${order.id}" ${order.favorite ? "checked" : ""}>
                    Favourite
                </label>
            `;
            ordersContainer.appendChild(orderElement);

            orderElement.querySelector(".fav-checkbox").addEventListener("change", () => toggleFavorite(order.id));
        });
    }

    // Function to toggle favorite orders in the server
    async function toggleFavorite(orderId) {
        try {
            await fetch(`http://localhost:4000/orders/${orderId}/favorite`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" }
            });
        } catch (error) {
            console.error("Error updating favorite:", error);
        }
    }

    fetchOrders();
    setInterval(fetchOrders, 5000); // Auto-refresh every 5 seconds
});

const toggleButton = document.getElementById('toggle-btn')
const sidebar = document.getElementById('sidebar')

function toggleSidebar(){
  sidebar.classList.toggle('close')
  toggleButton.classList.toggle('rotate')

  closeAllSubMenus()
}

function toggleSubMenu(button){

  if(!button.nextElementSibling.classList.contains('show')){
    closeAllSubMenus()
  }

  button.nextElementSibling.classList.toggle('show')
  button.classList.toggle('rotate')

  if(sidebar.classList.contains('close')){
    sidebar.classList.toggle('close')
    toggleButton.classList.toggle('rotate')
  }
}

function closeAllSubMenus(){
  Array.from(sidebar.getElementsByClassName('show')).forEach(ul => {
    ul.classList.remove('show')
    ul.previousElementSibling.classList.remove('rotate')
  })
}