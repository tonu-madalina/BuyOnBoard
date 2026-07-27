const productsContainer = document.getElementById("products");

function renderProducts(){

productsContainer.innerHTML="";

products.forEach(product=>{

productsContainer.innerHTML += `

<div class="product">

<div class="counter">${product.qty}</div>

<img src="${product.image}" alt="${product.name}">

<div class="productName">

${product.name}

</div>

<div class="bottomInfo">

<div class="code">

${product.code}

</div>

<div class="price">

€${product.priceEUR.toFixed(2)}

</div>

</div>

<div class="qty">

<button>-</button>

<span>${product.qty}</span>

<button>+</button>

</div>

</div>

`;

});

}

renderProducts();
