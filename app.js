const SUPABASE_URL = 'https://mvqzrkaxuthhkicclfaf.supabase.co';
const SUPABASE_KEY = 'sb_publishable_8iaoevUboXIPBkja1GvozA_SCI5-m8f';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let currentUser = null;

let data = [];
let cat = "All", cart = JSON.parse(localStorage.getItem('tranzitCart') || '[]');
const fmt = n => "UGX " + Number(n).toLocaleString();

async function loadProducts() {
  const { data: rows, error } = await supabaseClient
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  const { data: shops } = await supabaseClient
    .from("shops")
    .select("id, name");

  const shopName = {};
  (shops || []).forEach(s => { shopName[s.id] = s.name; });

  data = (rows || []).map(p => ({

        id: p.id,
    name: p.name,
    cat: p.category || "Other",
    price: Number(p.price),
 
    stock: Number(p.stock ?? 0),
        shop: shopName[p.shop_id] || "Shop",
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
  let q = searchBox ? 
    searchBox.value.toLowerCase() : "";
  let rows = data.filter(x => (cat === "All" || x.cat === cat) && x.name.toLowerCase().includes(q));
  document.querySelector("#resultText").textContent = rows.length + " products";
  document.querySelector("#products").innerHTML = rows.map(x =>
     `<article class="product" onclick="window.location.href='product.html?id=${x.id}'" style="cursor:pointer;">
      <div class="pic" onclick="location.href='product.html?id=${x.id}'">${x.image ? `<img src="${x.image}" alt="${x.name}" style="width:100%;height:100%;object-fit:cover;border-radius:12px;">` : x.icon}</div>
        <div style="border:1px dashed #1f6b4a;border-radius:10px;padding:10px;background:#f7fbf8">
          <strong style="display:block;text-align:center">${x.shop}</strong>
          <small style="display:block;text-align:center">${x.cat}</small>
          <div style="border-top:1px dashed #1f6b4a;margin:6px 0"></div>
          <h3><a href="product.html?id=${x.id}" style="color:inherit;text-decoration:none">${x.name}</a></h3>
          <div class="price">${fmt(x.price)}</div>
          <small>${Number(x.stock) > 0 ? x.stock + " in stock" : "Out of stock"}</small>
        </div>
        ${Number(x.stock) > 0
          ? `<button onclick="add('${x.id}')">Add to cart</button>`
          : `<button disabled>Out of stock</button>`} 
      </div>
    </article>`
  ).join("") || "<p>No products found.</p>";
}
function add(id) {
  const item = data.find(x => x.id === id);
  if (!item) return;
  const left = Number(item.stock ?? 0);
  if (left < 1) {
    alert("Out of stock");
    return;
  }
  const existing = cart.find(x => x.id === id);
  const nextQty = existing ? existing.qty + 1 : 1;
  if (nextQty > left) {
    alert("Only " + left + " left");
    return;
  }
  if (existing) existing.qty = nextQty;
  else cart.push({ ...item, qty: 1 });
  localStorage.setItem('tranzitCart', JSON.stringify(cart));
  document.querySelector("#cartCount").textContent = cart.reduce((s, x) => s + x.qty, 0);
  showCart();
}

function showCart() {
  document.querySelector("#drawer").classList.add("open");
  document.querySelector("#overlay").classList.add("show");
  document.querySelector("#cartItems").innerHTML = cart.length
? cart.map(x => `<div class="cart-row"><span>${x.icon} ${x.name}</span><div class="cart-controls"><button type="button" onclick="less('${x.id}')">−</button><span>x${x.qty || 1}</span><button type="button" onclick="add('${x.id}')">+</button></div><b>${fmt(x.price * (x.qty || 1))}</b></div>`).join("")
    : "<p>Your cart is empty.</p>";
  document.querySelector("#total").textContent = fmt(cart.reduce((s, x) => s + x.price * (x.qty || 1), 0));
}
function less(id) {
  const item = cart.find(x => x.id === id);
  if (!item) return;
  item.qty -= 1;
  if (item.qty < 1) cart = cart.filter(x => x.id !== id);
  localStorage.setItem('tranzitCart', JSON.stringify(cart));
  document.querySelector("#cartCount").textContent = cart.reduce((s, x) => s + (x.qty || 1), 0);
  showCart();
}
function closeDrawer() {
  document.querySelector("#drawer").classList.remove("open");
  document.querySelector("#overlay").classList.remove("show");
}

document.querySelector("#cartBtn").onclick = showCart;

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
async function checkout() {
  if (!cart.length) {
    alert("Your cart is empty.");
    return;
  }
  localStorage.setItem('tranzitCart', JSON.stringify(cart));
  window.location.href = "checkout.html";
}

// Start
loadProducts();
checkAuth();
document.querySelector("#cartCount").textContent = cart.reduce((s, x) => s + (x.qty || 1), 0);
