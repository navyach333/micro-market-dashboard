// GLOBAL STATE
let suppliers = [];
let editIndex = -1;

// UI HOOKS
const container = document.getElementById("supplier-list");
const searchBar = document.getElementById("search-bar");
const sortBtn = document.getElementById("sort-btn");
const API_BASE_URL = "http://localhost:8080/api/suppliers";

/**
 * 1. APP INITIALIZATION (The Handshake)
 */
async function initApp() {
  showLoadingState();
  try {
    // Fetch from port 8080
    const response = await fetch("http://127.0.0.1:8080/api/suppliers");
    if (!response.ok) throw new Error("Server not responding");

    suppliers = await response.json();

    // Refresh UI
    displaySuppliers(suppliers);
    renderCategoryFilters();
    updateDashboardStats();
  } catch (error) {
    console.error("Connection Error:", error);
    container.innerHTML = `<p class="text-center text-red-500 font-bold py-10">⚠️ Backend Offline. Run 'node server.js' in terminal!</p>`;
  }
}

/**
 * 2. CRUD OPERATIONS
 */
async function addNewSupplier() {
  const name = document.getElementById("new-name").value;
  const category = document.getElementById("new-category").value;
  const location = document.getElementById("new-location").value;
  const rating = document.getElementById("new-rating").value;

  if (!name || !category || !location || !rating) {
    alert("Please fill in all fields!");
    return;
  }

  const supplierData = { name, category, location, rating: parseFloat(rating) };

  try {
    if (editIndex === -1) {
      // --- CREATE (POST) ---
      const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(supplierData),
      });
      if (!response.ok) throw new Error("Save failed");
      showToast("Supplier Added!");
    } else {
      const id = suppliers[editIndex].id;
      const response = await fetch(`${API_BASE_URL}/${editIndex}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(supplierData),
      });

      if (!response.ok) throw new Error("Update failed");
      editIndex = -1;
      const btn = document.querySelector("aside button");
      btn.innerText = "Add to Directory";
      btn.classList.replace("bg-green-600", "bg-blue-600");
      showToast("Updated Successfully!");
    }

    // Clean ALL fields
    document.getElementById("new-name").value = "";
    document.getElementById("new-category").value = "";
    document.getElementById("new-location").value = "";
    document.getElementById("new-rating").value = "";

    initApp();
  } catch (error) {
    showToast("Server Error: " + error.message);
  }
}

async function deleteSupplier(index) {
  // A quick safety check so we don't delete by accident
  if (!confirm("Are you sure you want to remove this vendor?")) return;

  try {
    // We tell the server WHICH index to delete via the URL
    const response = await fetch(
      `http://127.0.0.1:8080/api/suppliers/${index}`,
      {
        method: "DELETE", // This is the 'Order Type'
      },
    );

    if (response.ok) {
      // Once the server says 'OK', we refresh the screen
      initApp();
      showToast("Vendor removed from database!");
    }
  } catch (error) {
    console.error("Delete failed:", error);
  }
}

function editSupplier(index) {
  const s = suppliers[index];
  document.getElementById("new-name").value = s.name;
  document.getElementById("new-category").value = s.category;
  document.getElementById("new-location").value = s.location;
  document.getElementById("new-rating").value = s.rating;

  const btn = document.querySelector("aside button");
  btn.innerText = "Update Supplier Info";
  btn.classList.replace("bg-blue-600", "bg-green-600");
  editIndex = index;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/**
 * 3. UI RENDERING
 */
function displaySuppliers(listToDisplay) {
  container.innerHTML = "";
  if (listToDisplay.length === 0) {
    container.innerHTML = `<div class="col-span-full text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
            <p class="text-slate-500 text-xl font-medium">No suppliers found.</p>
        </div>`;
    return;
  }

  listToDisplay.forEach((s, index) => {
    const starColor = getRatingColor(s.rating);

    container.innerHTML += `
        <div class="bg-white rounded-3xl p-8 border border-slate-200 hover:border-blue-500 hover:shadow-xl transition-all">
            <div class="flex justify-between items-start mb-6">
                <span class="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-black uppercase rounded-full">${s.category}</span>
                <div class="flex gap-2">
                    <button onclick="editSupplier(${index})" class="text-slate-300 hover:text-blue-500">✎</button>
                    <button data-index="${index}" class="delete-btn">✕</button>
                </div>
            </div>
            <h3 class="text-2xl font-bold text-slate-900 mb-1">${s.name}</h3>
            <p class="text-slate-500 font-medium mb-8">📍 ${s.location}</p>
            <div class="flex items-center justify-between">
               <span style="color: ${starColor}" class="font-bold">⭐ ${s.rating}</span>
                <button onclick="contactSupplier('${s.name}', '${s.category}')" class="px-6 py-3 bg-slate-50 text-slate-900 font-bold rounded-2xl hover:bg-blue-600 hover:text-white transition-all">Contact</button>
            </div>
        </div>`;
  });
}

function updateDashboardStats() {
  document.getElementById("total-count").innerText = suppliers.length;
  const totalRating = suppliers.reduce(
    (sum, s) => sum + parseFloat(s.rating),
    0,
  );
  document.getElementById("avg-rating").innerText = suppliers.length
    ? (totalRating / suppliers.length).toFixed(1)
    : "0.0";
}

function renderCategoryFilters() {
  const filterContainer = document.getElementById("category-filters");
  const categories = ["All", ...new Set(suppliers.map((s) => s.category))];
  filterContainer.innerHTML = categories
    .map(
      (cat) => `
        <button onclick="filterByCategory('${cat}')" class="px-4 py-2 rounded-full border border-slate-200 bg-white text-slate-600 text-sm font-semibold hover:border-blue-500 hover:text-blue-600 transition-all">
            ${cat}
        </button>
    `,
    )
    .join("");
}

function filterByCategory(category) {
  const filtered =
    category === "All"
      ? suppliers
      : suppliers.filter((s) => s.category === category);
  displaySuppliers(filtered);
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.innerText = message;
  toast.classList.remove("opacity-0", "translate-y-10");
  setTimeout(() => toast.classList.add("opacity-0", "translate-y-10"), 3000);
}

function showLoadingState() {
  container.innerHTML = `<div class="col-span-full text-center py-20 text-slate-400">Loading Vendors...</div>`;
}

function contactSupplier(name, category) {
  const message = encodeURIComponent(
    `Hi! I'm interested in ${name}'s ${category} products.`,
  );
  window.open(`https://wa.me/919999999999?text=${message}`, "_blank");
}

searchBar.addEventListener("input", (e) => {
  const term = e.target.value.toLowerCase();

  const filtered = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(term) ||
      s.location.toLowerCase().includes(term),
  );

  displaySuppliers(filtered);
});

container.addEventListener("click", (e) => {
  // Check if the clicked element is a delete button
  if (e.target.classList.contains("delete-btn")) {
    const index = e.target.getAttribute("data-index");
    deleteSupplier(index);
  }
});

function getRatingColor(rating) {
  const num = parseFloat(rating); // Convert string to a number just in case
  if (num >= 4.5) return "#2ecc71"; // Fresh Green
  if (num >= 3.0) return "#f1c40f"; // Sun Yellow
  return "#e74c3c"; // Alert Red
}

// Start App
initApp();
