export const renderHome = async () => {
    return `
        <section id="home">
            <div class="hero">
                <div class="hero-content">
                    <h1>Royal Elegance for Men</h1>
                    <p>Discover the finest collection of traditional Indian wear</p>
                    <a href="#/shop" class="btn">Shop Collection</a>
                </div>
            </div>

            <div class="categories container">
                <h2 class="section-title">Shop By Category</h2>
                <div class="category-grid">
                    <div class="category-card" onclick="window.location.hash='#/shop?category=Kurta Pajama'" style="cursor:pointer;">
                        <img src="https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80" alt="Kurta">
                        <div class="category-overlay"><h3>Kurta Pajama</h3></div>
                    </div>
                    <div class="category-card" onclick="window.location.hash='#/shop?category=Sherwani'" style="cursor:pointer;">
                        <img src="https://images.unsplash.com/photo-1585914924626-15adac1e6402?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80" alt="Sherwani">
                        <div class="category-overlay"><h3>Royal Sherwani</h3></div>
                    </div>
                    <div class="category-card" onclick="window.location.hash='#/shop?category=Nehru Jacket'" style="cursor:pointer;">
                        <img src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80" alt="Nehru Jacket">
                        <div class="category-overlay"><h3>Nehru Jacket</h3></div>
                    </div>
                    <div class="category-card" onclick="window.location.hash='#/shop?category=Indo-Western'" style="cursor:pointer;">
                        <img src="https://images.unsplash.com/photo-1598033129183-c4f50c736f10?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80" alt="Ethnic Sets">
                        <div class="category-overlay"><h3>Indo-Western</h3></div>
                    </div>
                </div>
            </div>

            <div class="hero hero-promo" style="margin-top: 50px;">
                <div class="hero-content">
                    <h2>Wedding Collection 2026</h2>
                    <p>Exclusive designs for your special day</p>
                    <a href="#/shop" class="btn">Explore Now</a>
                </div>
            </div>
        </section>
    `;
};
