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
        price: Number(p.price),
    stock: Number(p.stock ?? 0),
    icon: p.image_url ? "🛍️" : "📦",
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
}
async function checkout() {
  if (!cart.length) {
    alert("Your cart is empty.");
    return;
  }
  if (!currentUser) {
    alert("Please log in first.");
    window.location.href = "account.html";
    return;
  }

  const phone = prompt("DELIVERY PHONE (example 0751234567):");
  if (!phone) return;
  const phoneDigits = phone.replace(/\D/g, "");
  let deliveryPhone = phoneDigits;
  if (deliveryPhone.startsWith("256") && deliveryPhone.length === 12) {
    deliveryPhone = "0" + deliveryPhone.slice(3);
  }
  if (!/^0\d{9}$/.test(deliveryPhone)) {
    alert("Delivery phone must be a number, e.g. 0751234567");
    return;
  }
    const deliveryPrefix = deliveryPhone.slice(0, 3);
  const ugPrefixes = ["070", "074", "075", "076", "077", "078", "079"];
  if (!ugPrefixes.includes(deliveryPrefix)) {
    alert("Delivery phone must be a real MTN or Airtel number.");
    return;
  }
  const location = prompt("DELIVERY LOCATION (place name, not a phone number):");
  if (!location) return;
  if (/\d{7,}/.test(location)) {
    alert("Location looks like a phone number. Please enter a place, e.g. Ndejje Zanta.");
    return;
  }
  const place = location.trim();
  if (place.length < 3 || /^(.)\1+$/i.test(place.replace(/\s/g, ""))) {
    alert("Enter a real place name, e.g. Ndejje Zanta.");
    return;
  }
  const method = prompt("Pay with MTN or Airtel? Type MTN or Airtel:");
  if (!method) return;
  const network = method.trim().toUpperCase();
  if (network !== "MTN" && network !== "AIRTEL") {
    alert("Please type MTN or Airtel.");
    return;
  }

  const momo = prompt("YOUR " + network + " NUMBER (the number you will pay from):");
  if (!momo) return;

  const digits = momo.replace(/\D/g, "");
  let local = digits;
  if (local.startsWith("256") && local.length === 12) local = "0" + local.slice(3);
  if (!/^0\d{9}$/.test(local)) {
    alert("Enter a valid Ugandan number, e.g. 0751234567");
    return;
  }

  const prefix = local.slice(0, 3);
  const mtn = ["076", "077", "078", "079"];
  const airtel = ["075", "070", "074"];
  if (network === "MTN" && !mtn.includes(prefix)) {
      alert("That number is not MTN. Use 077, 078 or 076.");
    return;
  }
  if (network === "AIRTEL" && !airtel.includes(prefix)) {
    alert("That number is not Airtel. Use 075, 070 or 074.");
    return;
  }
  const total = cart.reduce((s, x) => s + x.price * (x.qty || 1), 0);

  const { data: order, error } = await supabaseClient
    .from("orders")
    .insert({
      buyer_id: currentUser.id,
      buyer_name: currentUser.email,
      buyer_phone: deliveryPhone,
      buyer_location: location,
      total: total,
      status: "pending",
       payment_method: network,
      payment_phone: local,
      payment_status: "unpaid"
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
  for (const x of cart) {
    await supabaseClient.rpc("reduce_stock", {
      p_id: x.id,
      qty: x.qty || 1
    });
  }
  cart = [];
  document.querySelector("#cartCount").textContent = 0;
  closeDrawer();
  const { data: shops } = await supabaseClient
    .from("shops")
    .select("name, momo_network, momo_number")
    .not("momo_number", "is", null)
    .limit(1);

  const shop = shops && shops[0];
  const payTo = shop && shop.momo_number
    ? shop.momo_network + " " + shop.momo_number
    : "the seller";

  alert("Order placed! Send UGX " + total.toLocaleString() + " to " + payTo + ". Pay from your " + network + " number " + local + ".");
}
// Start
loadProducts();
checkAuth();
