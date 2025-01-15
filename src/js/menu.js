/**
 * Gère le menu de navigation des catégories
 */
export class Menu {
  /**
   * @param {HTMLElement} container - Élément conteneur du menu
   */
  constructor(container) {
    this.container = container;
    this.callbacks = new Set();
    this.categories = [];
    this.activeCategory = null;
    this.menuContainer = this.container.querySelector('.menu-container');
    this.burgerButton = this.container.querySelector('.burger-menu');
    this.overlay = document.querySelector('.overlay');
    
    this.init();
    this.initBurgerMenu();
  }

  /**
   * Initialise le menu
   * @private
   */
  init() {
    // Configuration de l'accessibilité
    this.container.setAttribute('role', 'navigation');
    this.container.setAttribute('aria-label', 'Catégories d\'animations');

    this.render();
  }

  /**
   * Initialise le menu burger
   * @private
   */
  initBurgerMenu() {
    if (this.burgerButton) {
      this.burgerButton.addEventListener('click', () => {
        const isExpanded = this.burgerButton.getAttribute('aria-expanded') === 'true';
        this.burgerButton.setAttribute('aria-expanded', !isExpanded);
        this.burgerButton.classList.toggle('active');
        this.menuContainer.querySelector('.menu-list')?.classList.toggle('active');
        if (this.overlay) {
          this.overlay.classList.toggle('active');
        }
        document.body.style.overflow = !isExpanded ? 'hidden' : '';
      });
    }

    if (this.overlay) {
      this.overlay.addEventListener('click', () => this.closeMenu());
    }
  }

  /**
   * Ferme le menu mobile
   * @private
   */
  closeMenu() {
    if (this.burgerButton) {
      this.burgerButton.classList.remove('active');
      this.burgerButton.setAttribute('aria-expanded', 'false');
    }
    this.menuContainer.querySelector('.menu-list')?.classList.remove('active');
    if (this.overlay) {
      this.overlay.classList.remove('active');
    }
    document.body.style.overflow = '';
  }

  /**
   * Définit les catégories du menu
   * @param {string[]} categories - Liste des catégories
   */
  setCategories(categories) {
    this.categories = categories;
    this.render();
  }

  /**
   * Définit la catégorie active
   * @param {string} category - Catégorie à activer
   */
  setActiveCategory(category) {
    if (this.activeCategory === category) return;
    
    this.activeCategory = category;
    this.render();
  }

  /**
   * Gère la sélection d'une catégorie
   * @param {string} category - Catégorie sélectionnée
   * @private
   */
  handleSelect(category) {
    if (this.activeCategory === category) return;
    this.callbacks.forEach(callback => callback(category));
    this.closeMenu(); // Fermer le menu après la sélection sur mobile
  }

  /**
   * Ajoute un callback pour la sélection de catégorie
   * @param {Function} callback
   */
  onCategorySelect(callback) {
    this.callbacks.add(callback);
  }

  /**
   * Crée l'item d'accueil
   * @private
   * @returns {HTMLElement}
   */
  createHomeItem() {
    const homeItem = document.createElement('li');
    homeItem.classList.add('menu-item', 'home-item');
    homeItem.setAttribute('role', 'menuitem');
    homeItem.setAttribute('tabindex', '0');
    homeItem.setAttribute('aria-label', 'Accueil');
    
    const img = document.createElement('img');
    img.src = 'src/assets/home.svg';
    img.alt = 'Accueil';
    img.width = 24;
    img.height = 24;
    
    homeItem.appendChild(img);
    
    // Gestion des événements
    homeItem.addEventListener('click', () => this.handleSelect(null));
    homeItem.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.handleSelect(null);
      }
    });
    
    return homeItem;
  }

  /**
   * Affiche le menu
   * @private
   */
  render() {
    // Vider le conteneur du menu
    const menuContainer = this.menuContainer || this.container;
    while (menuContainer.firstChild) {
      menuContainer.removeChild(menuContainer.firstChild);
    }

    // Créer la liste
    const menuList = document.createElement('ul');
    menuList.setAttribute('role', 'menubar');
    menuList.classList.add('menu-list');

    // Ajouter l'item d'accueil
    menuList.appendChild(this.createHomeItem());

    // Créer les items du menu
    this.categories.forEach((category, index) => {
      const item = document.createElement('li');
      item.textContent = category;
      item.classList.add('menu-item');
      
      if (category === this.activeCategory) {
        item.classList.add('active');
        item.setAttribute('aria-current', 'true');
      }
      
      item.setAttribute('role', 'menuitem');
      item.setAttribute('tabindex', index === 0 ? '0' : '-1');
      
      // Gestion des événements
      item.addEventListener('click', () => this.handleSelect(category));
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.handleSelect(category);
        }
      });
      
      menuList.appendChild(item);
    });

    menuContainer.appendChild(menuList);
  }
}

document.addEventListener('DOMContentLoaded', () => {
    const burgerMenu = document.querySelector('.burger-menu');
    const menuList = document.querySelector('.menu-list');
    const overlay = document.querySelector('.overlay');
    
    if (burgerMenu && menuList) {
        burgerMenu.addEventListener('click', () => {
            burgerMenu.classList.toggle('active');
            menuList.classList.toggle('active');
            if (overlay) {
                overlay.classList.toggle('active');
            }
            document.body.style.overflow = menuList.classList.contains('active') ? 'hidden' : '';
        });
    }

    if (overlay) {
        overlay.addEventListener('click', () => {
            burgerMenu.classList.remove('active');
            menuList.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        });
    }

    // Fermer le menu si on clique sur un lien
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            burgerMenu.classList.remove('active');
            menuList.classList.remove('active');
            if (overlay) {
                overlay.classList.remove('active');
            }
            document.body.style.overflow = '';
        });
    });
});
