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
    icon: p.image_url ? "🛍️" : "📦"
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
      <div class="pic">${x.icon}</div>
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
  cart.push(item);
  document.querySelector("#cartCount").textContent = cart.length;
  showCart();
}
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

// Start
loadProducts();
checkAuth();
