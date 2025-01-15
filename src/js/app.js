import { loadAnimations } from './dataLoader.js';
import { Router } from './router.js';
import { Menu } from './menu.js';
import { AnimationGrid } from './grid.js';
import { Lightbox } from './lightbox.js';

class App {
  constructor() {
    this.animations = [];
    this.categories = new Set();
    this.currentCategory = null;
    this.currentAnimation = null;
    this.isHandlingChange = false;

    // Initialiser les composants
    this.initComponents();
    
    // Charger les données
    this.loadData();
  }

  /**
   * Initialise tous les composants de l'application
   * @private
   */
  async initComponents() {
    // Initialiser le menu
    const menuContainer = document.getElementById('categories-menu');
    this.menu = new Menu(menuContainer);
    this.menu.onCategorySelect((category) => this.handleCategoryChange(category));

    // Initialiser la grille
    const gridContainer = document.getElementById('animation-grid');
    this.grid = new AnimationGrid(gridContainer);
    this.grid.onAnimationSelect((animation) => this.handleAnimationSelect(animation));

    // Initialiser le router
    this.router = new Router({
      onCategoryChange: (category) => this.handleCategoryChange(category),
      onAnimationChange: (animationId) => this.handleAnimationChange(animationId)
    });

    // Initialiser la lightbox avec le router
    const lightboxContainer = document.getElementById('lightbox');
    this.lightbox = new Lightbox(lightboxContainer, this.router);

    // Afficher le message de bienvenue si aucune catégorie n'est sélectionnée
    const welcomeMessage = document.getElementById('welcome-message');
    if (welcomeMessage) {
      welcomeMessage.classList.toggle('visible', !this.currentCategory);
    }
  }

  /**
   * Charge les données des animations
   * @private
   */
  async loadData() {
    try {
      // Charger les animations
      this.animations = await loadAnimations();
      
      // Extraire les catégories uniques et les ordonner selon l'ordre souhaité
      const categoryOrder = ['Droites', 'Triangles', 'Quadrilatères', 'Angles', 'Transformations', 'Divers'];
      const uniqueCategories = [...new Set(this.animations.map(a => a.category))];
      this.categories = categoryOrder.filter(cat => uniqueCategories.includes(cat));
      
      // Mettre à jour le menu avec les catégories
      this.menu.setCategories(this.categories);
      
      // Récupérer la catégorie depuis l'URL
      const urlParams = new URLSearchParams(window.location.search);
      const categoryFromURL = urlParams.get('category');
      
      // Si une catégorie est spécifiée dans l'URL, l'utiliser
      if (categoryFromURL && this.categories.includes(categoryFromURL)) {
        await this.handleCategoryChange(categoryFromURL);
      } else {
        // Sinon, afficher le message de bienvenue et aucune animation
        await this.handleCategoryChange(null);
      }
      
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    }
  }

  /**
   * Gère le changement de catégorie
   * @param {string} category - Nouvelle catégorie sélectionnée
   * @private
   */
  async handleCategoryChange(category) {
    if (this.isHandlingChange) return;
    this.isHandlingChange = true;

    try {
      this.currentCategory = category;
      this.menu.setActiveCategory(category);
      
      // Gestion du message de bienvenue
      const welcomeMessage = document.getElementById('welcome-message');
      if (welcomeMessage) {
        welcomeMessage.classList.toggle('visible', !category);
      }

      // Filtrer et afficher les animations
      const filteredAnimations = category
        ? this.animations.filter(animation => animation.category === category)
        : [];
      
      this.grid.setAnimations(filteredAnimations);
      
      // Mettre à jour l'URL
      this.router.updateUrl({ category });
    } catch (error) {
      console.error('Erreur lors du changement de catégorie:', error);
    } finally {
      this.isHandlingChange = false;
    }
  }

  /**
   * Met à jour la grille avec les animations filtrées
   * @private
   */
  updateGrid() {
    const filteredAnimations = this.currentCategory
      ? this.animations.filter(a => a.category === this.currentCategory)
      : this.animations;
    
    this.grid.setAnimations(filteredAnimations);
  }

  /**
   * Gère la sélection d'une animation
   * @param {Object} animation - Animation sélectionnée
   * @private
   */
  handleAnimationSelect(animation) {
    if (this.isHandlingChange || this.currentAnimation === animation) return;
    
    try {
      this.isHandlingChange = true;
      this.currentAnimation = animation;
      
      // Mettre à jour la catégorie si nécessaire
      if (animation.category !== this.currentCategory) {
        this.handleCategoryChange(animation.category);
      }
      
      this.lightbox.show(animation);
    } finally {
      this.isHandlingChange = false;
    }
  }

  /**
   * Gère le changement d'animation via l'URL
   * @param {string} animationId - ID de l'animation
   * @private
   */
  async handleAnimationChange(animationId) {
    if (!animationId) {
      this.lightbox.close();
      return;
    }

    const animation = this.animations.find(a => a.id === animationId);
    if (animation) {
      // Mettre à jour la catégorie si nécessaire
      if (animation.category !== this.currentCategory) {
        this.handleCategoryChange(animation.category);
      }
      // Afficher l'animation
      this.lightbox.show(animation);
    }
  }

  /**
   * Affiche un message d'erreur
   * @param {string} message - Message d'erreur
   * @private
   */
  showError(message) {
    // Créer un élément d'erreur
    const errorElement = document.createElement('div');
    errorElement.classList.add('error-message');
    errorElement.textContent = message;
    
    // Ajouter à la page
    document.querySelector('.container').prepend(errorElement);
    
    // Supprimer après 5 secondes
    setTimeout(() => {
      errorElement.remove();
    }, 5000);
  }
}

// Initialiser l'application
document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});
