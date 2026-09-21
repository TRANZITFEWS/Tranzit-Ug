const data=[
{name:"Smartphone X",cat:"Phones",price:850000,icon:"📱"},
{name:"Wireless Headphones",cat:"Electronics",price:120000,icon:"🎧"},
{name:"Classic Sneakers",cat:"Fashion",price:95000,icon:"👟"},
{name:"Blender",cat:"Home",price:145000,icon:"🥤"},
{name:"Smart Watch",cat:"Electronics",price:180000,icon:"⌚"},
{name:"Travel Backpack",cat:"Fashion",price:78000,icon:"🎒"},
{name:"Skin Care Set",cat:"Beauty",price:65000,icon:"🧴"},
{name:"Table Lamp",cat:"Home",price:55000,icon:"💡"}];
let cat="All",cart=[];
const fmt=n=>"UGX "+n.toLocaleString();
function render(){let q=document.querySelector("#search").value.toLowerCase();let rows=data.filter(x=>(cat==="All"||x.cat===cat)&&x.name.toLowerCase().includes(q));document.querySelector("#resultText").textContent=rows.length+" products";document.querySelector("#products").innerHTML=rows.map((x,i)=>`<article class="product"><div class="pic">${x.icon}</div><div class="info"><small>${x.cat}</small><h3>${x.name}</h3><div class="price">${fmt(x.price)}</div><button onclick="add('${x.name}')">Add to cart</button></div></article>`).join("")||"<p>No products found.</p>"}
function runSearch(){render()}document.querySelector("#search").addEventListener("input",render);
document.querySelectorAll("#categories button").forEach(b=>b.onclick=()=>{document.querySelectorAll("#categories button").forEach(x=>x.classList.remove("active"));b.classList.add("active");cat=b.dataset.cat;render()});
function add(name){cart.push(data.find(x=>x.name===name));document.querySelector("#cartCount").textContent=cart.length;showCart()}
function showCart(){document.querySelector("#drawer").classList.add("open");document.querySelector("#overlay").classList.add("show");document.querySelector("#cartItems").innerHTML=cart.length?cart.map(x=>`<div class="cart-row"><span>${x.icon} ${x.name}</span><b>${fmt(x.price)}</b></div>`).join(""):"<p>Your cart is empty.</p>";document.querySelector("#total").textContent=fmt(cart.reduce((s,x)=>s+x.price,0))}
function closeDrawer(){document.querySelector("#drawer").classList.remove("open");document.querySelector("#overlay").classList.remove("show")}
document.querySelector("#cartBtn").onclick=showCart;
document.querySelector("#accountBtn").onclick=()=>alert("Customer accounts will be connected in the next development stage.");
document.querySelectorAll("#sellerBtn,#sellerBtn2").forEach(b=>b.onclick=()=>alert("Seller registration will be connected in the next development stage."));
render();
const menuBtn = document.querySelector("#menuBtn");
const menuPanel = document.querySelector("#menuPanel");

menuBtn.onclick = () => {
  menuPanel.classList.toggle("open");
};

menuPanel.querySelectorAll("a").forEach(link => {
  link.onclick = () => menuPanel.classList.remove("open");
});
