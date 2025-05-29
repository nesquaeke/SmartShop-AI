/**
 * SmartShop AI - Main Application
 * Clean, organized, and optimized frontend application
 */

class SmartShopApp {
    constructor() {
        this.currentTab = 'products';
        this.shoppingList = [];
        this.stores = this.getPolishStores();
        this.productCategories = this.getProductCategories();
        this.isLoading = false;
        
        this.init();
    }

    /**
     * Initialize the application
     */
    init() {
        console.log('🚀 SmartShop AI initializing...');
        
        // Wait for DOM and config to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupApp());
        } else {
            this.setupApp();
        }
    }

    /**
     * Setup application after DOM is ready
     */
    setupApp() {
        this.setupEventListeners();
        this.setupDarkMode();
        this.loadInitialData();
        
        console.log('✅ SmartShop AI ready!');
    }

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Search functionality
        const searchBtn = document.getElementById('searchBtn');
        const searchInput = document.getElementById('searchInput');
        
        searchBtn?.addEventListener('click', () => this.performSearch());
        searchInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.performSearch();
        });

        // Shopping list optimization
        const optimizeBtn = document.getElementById('optimizeBtn');
        optimizeBtn?.addEventListener('click', () => this.optimizeShoppingList());

        // Dark mode toggle
        const darkModeToggle = document.getElementById('darkModeToggle');
        darkModeToggle?.addEventListener('click', () => this.toggleDarkMode());
    }

    /**
     * Setup dark mode functionality
     */
    setupDarkMode() {
        const isDark = localStorage.getItem('darkMode') === 'true';
        if (isDark) {
            document.body.classList.add('dark');
            this.updateDarkModeIcon(true);
        }
    }

    /**
     * Toggle dark mode
     */
    toggleDarkMode() {
        const isDark = document.body.classList.toggle('dark');
        localStorage.setItem('darkMode', isDark.toString());
        this.updateDarkModeIcon(isDark);
    }

    /**
     * Update dark mode icon
     */
    updateDarkModeIcon(isDark) {
        const icon = document.querySelector('#darkModeToggle span');
        if (icon) {
            icon.textContent = isDark ? '☀️' : '🌙';
        }
    }

    /**
     * Switch between tabs
     */
    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active', 'border-blue-600', 'text-blue-600');
            btn.classList.add('border-transparent', 'text-gray-500');
        });

        const activeBtn = document.querySelector(`[data-tab="${tabName}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active', 'border-blue-600', 'text-blue-600');
            activeBtn.classList.remove('border-transparent', 'text-gray-500');
        }

        // Show/hide content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.add('hidden');
        });

        const activeContent = document.getElementById(`${tabName}-content`);
        if (activeContent) {
            activeContent.classList.remove('hidden');
        }

        this.currentTab = tabName;

        // Load content for the active tab
        this.loadTabContent(tabName);
    }

    /**
     * Load content for specific tab
     */
    async loadTabContent(tabName) {
        switch (tabName) {
            case 'products':
                await this.loadProducts();
                break;
            case 'stores':
                this.loadStores();
                break;
            case 'shopping-list':
                this.updateShoppingList();
                break;
        }
    }

    /**
     * Load initial data
     */
    async loadInitialData() {
        await this.loadProducts();
    }

    /**
     * Load products from API
     */
    async loadProducts(searchQuery = '') {
        if (this.isLoading) return;
        
        this.setLoading(true);
        
        try {
            const endpoint = searchQuery ? 
                window.API.get('/products/search', { q: searchQuery }) :
                window.API.get('/products');
            
            const data = await endpoint;
            this.renderProducts(data.products || []);
            
            if (data.message) {
                this.showNotification(data.message, 'info');
            }
            
        } catch (error) {
            console.error('Error loading products:', error);
            this.showNotification('Błąd podczas ładowania produktów. Używamy danych demonstracyjnych.', 'warning');
            
            // Use fallback data
            const fallbackData = window.API.getFallbackProducts();
            this.renderProducts(fallbackData.products);
        } finally {
            this.setLoading(false);
        }
    }

    /**
     * Render products in the grid
     */
    renderProducts(products) {
        const grid = document.getElementById('productsGrid');
        if (!grid) return;

        if (!products || products.length === 0) {
            grid.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <p class="text-gray-500 text-lg">Brak produktów do wyświetlenia</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = products.map(product => `
            <div class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-4">
                <div class="text-center mb-3">
                    <h3 class="font-semibold text-gray-900 mb-1">${this.escapeHtml(product.name)}</h3>
                    <p class="text-sm text-gray-600">${this.escapeHtml(product.description || product.category || '')}</p>
                </div>
                
                <div class="flex justify-between items-center mb-3">
                    <span class="text-lg font-bold text-green-600">${product.price.toFixed(2)} PLN</span>
                    <span class="text-sm px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                        ${this.escapeHtml(product.store)}
                    </span>
                </div>
                
                <button 
                    onclick="app.addToShoppingList('${product.id}')"
                    class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
                >
                    ➕ Dodaj do listy
                </button>
            </div>
        `).join('');
    }

    /**
     * Load and display stores
     */
    loadStores() {
        const grid = document.getElementById('storesGrid');
        if (!grid) return;

        grid.innerHTML = this.stores.map(store => `
            <div class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
                <div class="text-center">
                    <div class="text-4xl mb-3">${store.icon}</div>
                    <h3 class="text-xl font-semibold text-gray-900 mb-2">${store.name}</h3>
                    <p class="text-gray-600 mb-4">${store.description}</p>
                    <div class="text-sm text-gray-500">
                        <p>📍 ${store.locations} lokalizacji</p>
                        <p>⭐ Popularne kategorie: ${store.categories.slice(0, 3).join(', ')}</p>
                    </div>
                </div>
            </div>
        `).join('');
    }

    /**
     * Perform search
     */
    async performSearch() {
        const searchInput = document.getElementById('searchInput');
        const query = searchInput?.value.trim();
        
        if (!query) {
            this.showNotification('Wprowadź frazę do wyszukania', 'warning');
            return;
        }

        await this.loadProducts(query);
        
        // Switch to products tab if not already active
        if (this.currentTab !== 'products') {
            this.switchTab('products');
        }
    }

    /**
     * Add product to shopping list
     */
    async addToShoppingList(productId) {
        try {
            // Get product details
            const productData = await window.API.get(`/products/${productId}`);
            const product = productData.product;
            
            // Check if already in list
            const existingItem = this.shoppingList.find(item => item.id === productId);
            
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                this.shoppingList.push({
                    id: productId,
                    name: product.name,
                    price: product.price,
                    store: product.store,
                    quantity: 1
                });
            }
            
            this.updateShoppingList();
            this.showNotification(`${product.name} dodano do listy zakupów!`, 'success');
            
        } catch (error) {
            console.error('Error adding to shopping list:', error);
            this.showNotification('Błąd podczas dodawania do listy', 'error');
        }
    }

    /**
     * Update shopping list display
     */
    updateShoppingList() {
        const listContainer = document.getElementById('shoppingList');
        const totalPriceEl = document.getElementById('totalPrice');
        
        if (!listContainer) return;

        if (this.shoppingList.length === 0) {
            listContainer.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <p class="text-lg">Twoja lista zakupów jest pusta</p>
                    <p class="text-sm">Dodaj produkty z zakładki "Produkty"</p>
                </div>
            `;
            if (totalPriceEl) totalPriceEl.textContent = '0.00 PLN';
            return;
        }

        listContainer.innerHTML = this.shoppingList.map((item, index) => `
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div class="flex-1">
                    <h4 class="font-medium text-gray-900">${this.escapeHtml(item.name)}</h4>
                    <p class="text-sm text-gray-600">${this.escapeHtml(item.store)} • ${item.price.toFixed(2)} PLN</p>
                </div>
                <div class="flex items-center space-x-3">
                    <div class="flex items-center space-x-2">
                        <button onclick="app.updateQuantity(${index}, -1)" class="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center">-</button>
                        <span class="w-8 text-center font-medium">${item.quantity}</span>
                        <button onclick="app.updateQuantity(${index}, 1)" class="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center">+</button>
                    </div>
                    <button onclick="app.removeFromShoppingList(${index})" class="text-red-600 hover:text-red-700">
                        🗑️
                    </button>
                </div>
            </div>
        `).join('');

        // Update total price
        const totalPrice = this.shoppingList.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        if (totalPriceEl) {
            totalPriceEl.textContent = `${totalPrice.toFixed(2)} PLN`;
        }
    }

    /**
     * Update item quantity in shopping list
     */
    updateQuantity(index, change) {
        if (index < 0 || index >= this.shoppingList.length) return;
        
        this.shoppingList[index].quantity += change;
        
        if (this.shoppingList[index].quantity <= 0) {
            this.shoppingList.splice(index, 1);
        }
        
        this.updateShoppingList();
    }

    /**
     * Remove item from shopping list
     */
    removeFromShoppingList(index) {
        if (index >= 0 && index < this.shoppingList.length) {
            this.shoppingList.splice(index, 1);
            this.updateShoppingList();
            this.showNotification('Produkt usunięty z listy', 'info');
        }
    }

    /**
     * Optimize shopping list using AI
     */
    async optimizeShoppingList() {
        if (this.shoppingList.length === 0) {
            this.showNotification('Twoja lista zakupów jest pusta', 'warning');
            return;
        }

        this.setLoading(true);
        
        try {
            const optimizationData = await window.API.post('/ai/optimize', {
                shopping_list: this.shoppingList
            });
            
            this.shoppingList = optimizationData.optimized_list;
            this.updateShoppingList();
            
            // Show optimization results
            this.showOptimizationResults(optimizationData);
            
        } catch (error) {
            console.error('Error optimizing shopping list:', error);
            this.showNotification('Błąd podczas optymalizacji. Spróbuj ponownie.', 'error');
        } finally {
            this.setLoading(false);
        }
    }

    /**
     * Show optimization results
     */
    showOptimizationResults(data) {
        const message = `
            <div class="text-center">
                <h4 class="font-bold text-green-600 mb-2">🤖 Optymalizacja zakończona!</h4>
                <p class="text-sm">💰 Oszczędzisz: ${data.savings?.toFixed(2) || 0} PLN</p>
                <p class="text-sm">📊 Całkowity koszt: ${data.total_cost?.toFixed(2) || 0} PLN</p>
            </div>
        `;
        
        this.showNotification(message, 'success');
    }

    /**
     * Set loading state
     */
    setLoading(isLoading) {
        this.isLoading = isLoading;
        const indicator = document.getElementById('loadingIndicator');
        
        if (indicator) {
            if (isLoading) {
                indicator.classList.remove('hidden');
            } else {
                indicator.classList.add('hidden');
            }
        }
    }

    /**
     * Show notification to user
     */
    showNotification(message, type = 'info') {
        // Create notification element if it doesn't exist
        let notification = document.getElementById('notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'notification';
            notification.className = 'fixed top-4 right-4 z-50 max-w-sm';
            document.body.appendChild(notification);
        }

        const typeClasses = {
            success: 'bg-green-500',
            error: 'bg-red-500',
            warning: 'bg-yellow-500',
            info: 'bg-blue-500'
        };

        notification.innerHTML = `
            <div class="${typeClasses[type]} text-white p-4 rounded-lg shadow-lg">
                ${message}
            </div>
        `;

        notification.classList.remove('hidden');

        // Auto-hide after 5 seconds
        setTimeout(() => {
            notification.classList.add('hidden');
        }, 5000);
    }

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Get Polish stores data
     */
    getPolishStores() {
        return [
            {
                name: 'Biedronka',
                icon: '🛒',
                description: 'Najpopularniejsza sieć dyskontów w Polsce',
                locations: '3000+',
                categories: ['Pieczywo', 'Nabiał', 'Mięso', 'Warzywa', 'Owoce']
            },
            {
                name: 'LIDL',
                icon: '🏪',
                description: 'Niemiecki dyskont z wysokiej jakości produktami',
                locations: '800+',
                categories: ['Produkty ekologiczne', 'Pieczywo', 'Mięso', 'Nabiał']
            },
            {
                name: 'Auchan',
                icon: '🏬',
                description: 'Hipermarket z szerokim asortymentem',
                locations: '90+',
                categories: ['Elektronika', 'Odzież', 'Dom i ogród', 'Spożywcze']
            },
            {
                name: 'Carrefour',
                icon: '🛍️',
                description: 'Francuski hipermarket z bogatą ofertą',
                locations: '90+',
                categories: ['Spożywcze', 'Elektronika', 'Odzież', 'Sport']
            },
            {
                name: 'Netto',
                icon: '🥬',
                description: 'Duński dyskont z świeżymi produktami',
                locations: '400+',
                categories: ['Warzywa', 'Owoce', 'Pieczywo', 'Nabiał']
            },
            {
                name: 'Żabka',
                icon: '🐸',
                description: 'Sieć sklepów convenience',
                locations: '8000+',
                categories: ['Przekąski', 'Napoje', 'Podstawowe artykuły']
            }
        ];
    }

    /**
     * Get product categories
     */
    getProductCategories() {
        return [
            'Pieczywo', 'Nabiał', 'Mięso i ryby', 'Warzywa', 'Owoce',
            'Napoje', 'Słodycze', 'Przekąski', 'Mrożonki', 'Przyprawy',
            'Chemia gospodarcza', 'Higiena osobista', 'Artykuły dla dzieci'
        ];
    }
}

// Initialize the application
const app = new SmartShopApp(); 