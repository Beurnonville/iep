/**
 * Gère l'affichage des animations en plein écran
 */
export class Lightbox {
  /**
   * @param {HTMLElement} container - Élément conteneur de la lightbox
   * @param {Router} router - Instance du router
   */
  constructor(container, router) {
    this.container = container;
    this.router = router;
    this.isFullscreen = false;
    this.lastFocusedElement = null;
    this.currentIepApp = null;
    this.currentAnimation = null;
    
    // Récupérer les éléments existants
    this.content = container.querySelector('.lightbox-content');
    this.closeButton = container.querySelector('.close-button');
    this.fullscreenButton = container.querySelector('.fullscreen-button');
    this.animationContainer = container.querySelector('#animation-container');
    
    this.setupEventListeners();
  }

  /**
   * Configure les écouteurs d'événements
   * @private
   */
  setupEventListeners() {
    // Gestion du bouton de fermeture
    this.closeButton.addEventListener('click', () => this.close());
    
    // Gestion du bouton plein écran
    this.fullscreenButton.addEventListener('click', () => this.toggleFullscreen());

    // Fermeture en cliquant sur l'overlay
    this.container.addEventListener('click', (e) => {
      if (e.target === this.container) {
        this.close();
      }
    });

    // Gestion des touches clavier
    document.addEventListener('keydown', (e) => {
      if (!this.container.classList.contains('hidden')) {
        if (e.key === 'Escape') {
          this.close();
        } else if (e.key === 'Tab') {
          this.handleTabKey(e);
        }
      }
    });
  }

  /**
   * Gère la navigation au clavier dans la lightbox
   * @param {KeyboardEvent} e
   * @private
   */
  handleTabKey(e) {
    const focusableElements = this.container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  }

  /**
   * Récupère l'animation courante
   * @returns {Object|null} L'animation courante ou null
   * @private
   */
  getCurrentAnimation() {
    return this.currentAnimation;
  }

  /**
   * Affiche la lightbox avec une animation
   * @param {Object} animation - Animation à afficher
   */
  show(animation) {
    this.currentAnimation = animation;
    // Sauvegarder l'élément qui avait le focus
    this.lastFocusedElement = document.activeElement;
    
    // Mettre à jour le titre
    this.content.setAttribute('aria-label', animation.title);
    
    // S'assurer que le conteneur d'animation existe et est vide
    if (!this.animationContainer) {
      this.animationContainer = document.createElement('div');
      this.animationContainer.id = 'animation-container';
      this.content.appendChild(this.animationContainer);
    } else {
      // Vider le conteneur d'animation tout en le préservant
      while (this.animationContainer.firstChild) {
        this.animationContainer.removeChild(this.animationContainer.firstChild);
      }
    }
    
    // Afficher la lightbox
    this.container.classList.remove('hidden');
    
    // Donner le focus au bouton de fermeture
    this.closeButton.focus();
    
    // Empêcher le défilement de la page
    document.body.style.overflow = 'hidden';
    
    // Charger l'animation avec iepLoad
    if (typeof window.iepLoad === 'function') {
      // Construire l'URL absolue en utilisant uniquement l'origine et le chemin (sans le hash)
      const baseUrl = window.location.origin + window.location.pathname;
      // Retirer le dernier segment si l'URL se termine par index.html
      const finalBaseUrl = baseUrl.endsWith('index.html') 
        ? baseUrl.substring(0, baseUrl.lastIndexOf('/'))
        : baseUrl;
      const xmlUrl = `${finalBaseUrl}/${animation.xml_file}`;
      
      console.log('Chargement de l\'animation:', xmlUrl);
      
      window.iepLoad(
        this.animationContainer,
        xmlUrl,
        (error, iepApp) => {
          if (error) {
            console.error('Erreur lors du chargement de l\'animation:', error);
            this.showError('Impossible de charger l\'animation');
          } else {
            this.currentIepApp = iepApp;
          }
        }
      );
    } else {
      console.error('iepLoad n\'est pas disponible');
      this.showError('Le lecteur d\'animation n\'est pas disponible');
    }
  }

  /**
   * Affiche un message d'erreur
   * @param {string} message - Message d'erreur à afficher
   * @private
   */
  showError(message) {
    const errorElement = document.createElement('div');
    errorElement.classList.add('error-message');
    errorElement.textContent = message;
    this.animationContainer.appendChild(errorElement);
  }

  /**
   * Ferme la lightbox
   */
  close() {
    // Sortir du mode plein écran si actif
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(err => {
        console.error(`Erreur lors de la sortie du mode plein écran : ${err.message}`);
      });
    }

    // Récupérer l'animation courante avant de nettoyer
    const animation = this.currentAnimation;    
    
    // Arrêter l'animation si elle est en cours
    if (this.currentIepApp) {
      // Vérifier si l'application a une méthode pour s'arrêter proprement
      if (typeof this.currentIepApp.destroy === 'function') {
        this.currentIepApp.destroy();
      }
      this.currentIepApp = null;
    }
    
    // Vider le conteneur d'animation
    while (this.animationContainer.firstChild) {
      this.animationContainer.removeChild(this.animationContainer.firstChild);
    }
    
    // Cacher la lightbox
    this.container.classList.add('hidden');
    
    // Restaurer le défilement de la page
    document.body.style.overflow = '';
    
    // Restaurer le focus
    if (this.lastFocusedElement) {
      this.lastFocusedElement.focus();
    }

    // Si nous avons une animation et un router, naviguer vers sa catégorie
    if (animation && this.router && animation.category) {      
      // Mettre à jour l'URL avec la catégorie mais sans l'animation
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set('category', animation.category);
      currentUrl.hash = ''; // Supprimer le hash de l'animation
      window.history.replaceState({}, '', currentUrl.toString());
      
      // Déclencher le changement de catégorie
      this.router.handleUrlChange();
    } else {
      console.log('Lightbox close - Pas de navigation:', { 
        hasAnimation: !!animation, 
        hasRouter: !!this.router, 
        category: animation?.category 
      });
    }

    // Nettoyer la référence à l'animation courante
    this.currentAnimation = null;
  }

  /**
   * Bascule le mode plein écran
   */
  toggleFullscreen() {
    if (!document.fullscreenElement) {
      this.container.requestFullscreen().catch(err => {
        console.error(`Erreur lors du passage en plein écran : ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  }
}
