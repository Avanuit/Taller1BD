let globalInventory = [];
let shoppingCart = [];

function fetchProducts() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            try {
                const products = [
                    { id: 101, name: "mAcBook PrO", price: 2500, inStock: true, image: "src/macbook.png" },
                    { id: 102, name: "iPhOnE 15", price: 1200, inStock: false, image: "src/iphone.png" },
                    { id: 103, name: "AiRpOds mAx", price: 500, inStock: true, image: "src/airpods.png" },
                    { id: 104, name: "iPaD AiR", price: 800, inStock: true, image: "src/ipad.png" },
                    { id: 105, name: "ApPle WaTcH", price: 400, inStock: false, image: "src/watch.png" }
                ];
                resolve(products);
            } catch (error) {
                reject(error);
            }
        }, 2000);
    });
}

function formatProductName(name) {
    return name.toLowerCase().split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

function normalizeProducts(rawProducts) {
    return rawProducts.map(product => ({
        id: product.id,
        name: formatProductName(product.name),
        price: product.price * 1.15,
        inStock: product.inStock,
        image: product.image
    }));
}
//inventory
function createProductElement(product) {
    const card = document.createElement('div');
    card.className = product.inStock ? 'product-card' : 'product-card out-of-stock';

    const image = document.createElement('img');
    image.src = product.image;
    image.alt = product.name;
    image.className = 'product-image';

    const title = document.createElement('h3');
    title.textContent = product.name;

    const status = document.createElement('p');
    status.textContent = product.inStock ? 'Available' : 'Out of stock';

    const price = document.createElement('p');
    price.className = 'price-text';
    price.textContent = `$${product.price.toFixed(2)}`;

    const buyButton = document.createElement('button');
    buyButton.disabled = !product.inStock;
    buyButton.textContent = product.inStock ? 'Add to Bag' : 'Out of stock';
    
    buyButton.onclick = () => handleAddToCart(product.id, card, status, buyButton);

    card.appendChild(image);
    card.appendChild(title);
    card.appendChild(status);
    card.appendChild(price);
    card.appendChild(buyButton);

    return card;
}

function renderInventory() {
    const container = document.getElementById('inventory-container');
    container.innerHTML = '';

    const htmlElements = globalInventory.map(product => createProductElement(product));
    
    htmlElements.forEach(element => {
        container.appendChild(element);
    });
}

//shopping cart
function handleAddToCart(productId, cardElement, statusElement, buttonElement) {
    try {
        const productIndex = globalInventory.findIndex(p => p.id === productId);
        if (productIndex === -1) throw new Error("Product not found");

        const product = globalInventory[productIndex];
        shoppingCart.push(product);
        
        globalInventory[productIndex].inStock = false;
        
        cardElement.className = 'product-card purchased';
        statusElement.textContent = 'In your bag';
        buttonElement.disabled = true;
        buttonElement.textContent = 'Added';
        
        renderCart();
    } catch (error) {
        displayError(error.message);
    }
}

function handleRemoveFromCart(productId) {
    try {
        const cartIndex = shoppingCart.findIndex(p => p.id === productId);
        if (cartIndex === -1) throw new Error("Product not found in cart");

        shoppingCart.splice(cartIndex, 1);

        const inventoryIndex = globalInventory.findIndex(p => p.id === productId);
        if (inventoryIndex !== -1) {
            globalInventory[inventoryIndex].inStock = true;
        }

        renderCart();
        renderInventory();
    } catch (error) {
        alert(error.message);
    }
}

function renderCart() {
    const cartList = document.getElementById('cart-items');
    const totalPriceEl = document.getElementById('cart-total-price');
    
    cartList.innerHTML = '';
    
    if (shoppingCart.length === 0) {
        const emptyMessage = document.createElement('li');
        emptyMessage.className = 'empty-msg';
        emptyMessage.textContent = 'Your bag is empty.';
        cartList.appendChild(emptyMessage);
        totalPriceEl.textContent = '0.00';
        return;
    }

    let total = 0;

    const cartElements = shoppingCart.map(item => {
        const li = document.createElement('li');
        li.style.alignItems = 'center';
        
        const nameSpan = document.createElement('span');
        nameSpan.textContent = item.name;
        
        const priceContainer = document.createElement('div');
        priceContainer.style.display = 'flex';
        priceContainer.style.alignItems = 'center';
        priceContainer.style.gap = '10px';
        
        const priceSpan = document.createElement('span');
        priceSpan.textContent = `$${item.price.toFixed(2)}`;
        
        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'Remove';
        removeBtn.style.backgroundColor = '#ff3b30'; 
        removeBtn.style.width = 'auto';
        removeBtn.style.margin = '0';
        removeBtn.style.padding = '4px 8px';
        removeBtn.style.fontSize = '12px';
        
        removeBtn.onclick = () => handleRemoveFromCart(item.id);
        
        priceContainer.appendChild(priceSpan);
        priceContainer.appendChild(removeBtn);
        
        li.appendChild(nameSpan);
        li.appendChild(priceContainer);
        
        total += item.price;
        return li;
    });

    cartElements.forEach(element => {
        cartList.appendChild(element);
    });

    totalPriceEl.textContent = total.toFixed(2);
}

//checkout
function processCheckout() {
    try {
        if (shoppingCart.length === 0) {
            throw new Error("Your bag is empty");
        }
        
        shoppingCart = [];
        renderCart();
        renderInventory();
        alert("Checkout successful! Thank you for your purchase.");
    } catch (error) {
        alert(error.message);
    }
}

function setupEventListeners() {
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.onclick = processCheckout;
    }
}

function displayError(message) {
    const container = document.getElementById('inventory-container');
    if (container) {
        container.innerHTML = `<p class="error-text">${message}</p>`;
    }
}

async function initInventory() {
    try {
        const container = document.getElementById('inventory-container');
        if (container) {
            container.innerHTML = '<p style="text-align: center; width: 100%;">Loading store data...</p>';
        }

        const rawProducts = await fetchProducts();
        globalInventory = normalizeProducts(rawProducts);
        
        renderInventory();
        setupEventListeners();
    } catch (error) {
        displayError("Failed to load store data.");
    }
}

initInventory();