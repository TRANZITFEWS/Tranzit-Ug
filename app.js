const SUPABASE_URL = 'https://mvqzrkaxuthhkicclfaf.supabase.co';
const SUPABASE_KEY = 'sb_publishable_8iaoevUboXIPBkja1GvozA_SCI5-m8f';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let currentUser = null;

let data = [];
let cat = "All", cart = [];
const fmt = n => "UGX " + Number(n).toLocaleString();

async function loadProducts() {
  const { data: rows, error } = await supabaseClient
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  data = (rows || []).map(p => ({
    id: p.id,
    name: p.name,
    cat: p.category || "Other",
    price: Number(p.price),
        id: p.id,
    name: p.name,
    cat: p.category || "Other",
    price: Number(p.price),
    icon: p.image_url ? "🛍️" : "📦",
    image: p.image_url || ""
  }));

  if (error) {
    console.error(error);
  }
  render();
}

function render() {
  const searchBox = document.querySelector("#search");
  let q = searchBox ? searchBox.value.toLowerCase() : "";
  let rows = data.filter(x => (cat === "All" || x.cat === cat) && x.name.toLowerCase().includes(q));
  document.querySelector("#resultText").textContent = rows.length + " products";
  document.querySelector("#products").innerHTML = rows.map(x =>
    `<article class="product">
      <div class="pic">${x.image ? `<img src="${x.image}" alt="${x.name}" style="width:100%;height:100%;object-fit:cover;border-radius:12px;">` : x.icon}</div>
      <div class="info">
        <small>${x.cat}</small>
        <h3>${x.name}</h3>
        <div class="price">${fmt(x.price)}</div>
        <button onclick="add('${x.id}')">Add to cart</button>
      </div>
    </article>`
  ).join("") || "<p>No products found.</p>";
}

function add(id) {
  const item = data.find(x => x.id === id);
  if (!item) return;
  const existing = cart.find(x => x.id === id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...item, qty: 1 });
  }
  document.querySelector("#cartCount").textContent = cart.reduce((s, x) => s + x.qty, 0);
function add(id) {
  const item = data.find(x => x.id === id);
  if (!item) return;
  const existing = cart.find(x => x.id === id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...item, qty: 1 });
  }
  document.querySelector("#cartCount").textContent = cart.reduce((s, x) => s + x.qty, 0);
  showCart();
}

function showCart() {
  document.querySelector("#drawer").classList.add("open");
  document.querySelector("#overlay").classList.add("show");
  document.querySelector("#cartItems").innerHTML = cart.length
    ? cart.map(x => `<div class="cart-row"><span>${x.icon} ${x.name} x${x.qty || 1}</span><b>${fmt(x.price * (x.qty || 1))}</b></div>`).join("")
    : "<p>Your cart is empty.</p>";
  document.querySelector("#total").textContent = fmt(cart.reduce((s, x) => s + x.price * (x.qty || 1), 0));
}

function closeDrawer() {
function showCart() {
  document.querySelector("#drawer").classList.add("open");
  document.querySelector("#overlay").classList.add("show");
  document.querySelector("#cartItems").innerHTML = cart.length
    ? cart.map(x => `<div class="cart-row"><span>${x.icon} ${x.name}</span><b>${fmt(x.price)}</b></div>`).join("")
    : "<p>Your cart is empty.</p>";
  document.querySelector("#total").textContent = fmt(cart.reduce((s, x) => s + x.price, 0));
}

function closeDrawer() {
  document.querySelector("#drawer").classList.remove("open");
  document.querySelector("#overlay").classList.remove("show");
}

document.querySelector("#cartBtn").onclick = showCart;

// ===== AUTH =====
async function checkAuth() {
  const { data: { user } } = await supabaseClient.auth.getUser();
  currentUser = user;
  updateAccountButton();
}

function updateAccountButton() {
  const btn = document.querySelector("#accountBtn");
  if (!btn) return;

  if (currentUser) {
    btn.textContent = "👤 " + (currentUser.email.split("@")[0] || "Account");
    btn.onclick = () => window.location.href = "account.html";
  } else {
    btn.textContent = "👤 Account";
    btn.onclick = () => window.location.href = "account.html";
  }
}

// Seller buttons – only allow if logged in
document.querySelectorAll("#sellerBtn, #sellerBtn2").forEach(b => {
  b.onclick = () => {
    if (!currentUser) {
      alert("Please log in first to become a seller.");
      window.location.href = "account.html";
      return;
    }
    window.location.href = "seller.html";
  };
});
// Menu
const menuBtn = document.querySelector("#menuBtn");
const menuPanel = document.querySelector("#menuPanel");

if (menuBtn && menuPanel) {
  menuBtn.onclick = () => menuPanel.classList.toggle("open");
  menuPanel.querySelectorAll("a").forEach(link => {
    link.onclick = () => menuPanel.classList.remove("open");
  });
}
async function checkout() {
  if (!cart.length) {
    alert("Your cart is empty.");
    return;
  const total = cart.reduce((s, x) => s + x.price * (x.qty || 1), 0);
  if (!currentUser) {
    alert("Please log in first.");
    window.location.href = "account.html";
    return;
  }

  const phone = prompt("Phone number for delivery:");
  if (!phone) return;
  const location = prompt("Delivery location:");
  if (!location) return;

  const total = cart.reduce((s, x) => s + x.price, 0);

  const { data: order, error } = await supabaseClient
    .from("orders")
    .insert({
      buyer_id: currentUser.id,
      buyer_name: currentUser.email,
      buyer_phone: phone,
      buyer_location: location,
      total: total,
      status: "pending"
    })
    .select()
    .single();

  if (error) {
    alert(error.message);
    return;
  }

  const items = cart.map(x => ({
    order_id: order.id,
    product_id: x.id,
    product_name: x.name,
    price: x.price,
    quantity: x.qty || 1
  }));

  const { error: itemError } = await supabaseClient
    .from("order_items")
    .insert(items);

  if (itemError) {
    alert(itemError.message);
    return;
  }

  cart = [];
  document.querySelector("#cartCount").textContent = 0;
  closeDrawer();
  alert("Order placed! We will contact you on " + phone);
}
// Start
loadProducts();
checkAuth();
