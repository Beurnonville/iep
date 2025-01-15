/**
 * Gère le routage et la navigation dans l'application
 */
export class Router {
  constructor(callbacks) {
    this.animationCallbacks = new Set();
    this.categoryCallbacks = new Set();
    this.isHandlingUrlChange = false;
    
    // Enregistre les callbacks initiaux
    if (callbacks) {
      if (callbacks.onCategoryChange) this.onCategoryChange(callbacks.onCategoryChange);
      if (callbacks.onAnimationChange) this.onAnimationChange(callbacks.onAnimationChange);
    }
    
    // Écoute les changements d'état de l'historique
    window.addEventListener('popstate', () => this.handleUrlChange());
  }

  /**
   * Parse les paramètres de l'URL
   * @returns {URLSearchParams}
   */
  getUrlParams() {
    return new URLSearchParams(window.location.search);
  }

  /**
   * Récupère l'ID de l'animation depuis l'URL
   * @returns {string|null}
   */
  getAnimationId() {
    const hash = window.location.hash;
    const match = hash.match(/^#animation\/(.+)$/);
    return match ? match[1] : null;
  }

  /**
   * Récupère la catégorie courante depuis l'URL
   * @returns {string|null}
   */
  getCurrentCategory() {
    return this.getUrlParams().get('category');
  }

  /**
   * Met à jour l'URL avec les paramètres donnés
   * @param {Object} params - Paramètres à mettre à jour
   * @private
   */
  updateUrl(params) {
    if (this.isHandlingUrlChange) return;
    this.isHandlingUrlChange = true;
    
    try {
      const currentParams = this.getUrlParams();
      
      // Met à jour ou supprime chaque paramètre
      Object.entries(params).forEach(([key, value]) => {
        if (value === null) {
          currentParams.delete(key);
        } else if (key !== 'animation') {
          currentParams.set(key, value);
        }
      });

      // Construit la nouvelle URL
      let newUrl = currentParams.toString() ? `?${currentParams.toString()}` : '';
      
      // Ajoute le hash pour l'animation si présent
      if (params.animation) {
        newUrl += `#animation/${params.animation}`;
      }
      
      // Remplace l'état actuel au lieu de créer une nouvelle entrée
      window.history.replaceState({}, '', newUrl);
      
      // Déclenche les callbacks dans le bon ordre
      const category = currentParams.get('category');
      const animationId = this.getAnimationId();
      
      // D'abord déclencher le changement de catégorie
      if (category) {
        this.categoryCallbacks.forEach(callback => callback(category));
      }
      
      // Ensuite déclencher le changement d'animation si nécessaire
      if (animationId) {
        this.animationCallbacks.forEach(callback => callback(animationId));
      }
    } finally {
      this.isHandlingUrlChange = false;
    }
  }

  /**
   * Navigue vers une animation spécifique
   * @param {string} id - ID de l'animation
   */
  navigateToAnimation(id) {
    console.log('Router navigateToAnimation - ID de l\'animation:', id);
    this.updateUrl({ animation: id });
  }

  /**
   * Supprime le paramètre d'animation de l'URL
   */
  clearAnimation() {
    console.log('Router clearAnimation - Suppression de l\'animation');
    this.updateUrl({ animation: null });
  }

  /**
   * Navigue vers une catégorie
   * @param {string} category - Nom de la catégorie
   */
  navigateToCategory(category) {
    console.log('Router navigateToCategory - Catégorie:', category);
    
    // Conserver l'URL actuelle et mettre à jour les paramètres
    const currentUrl = new URL(window.location.href);
    const params = currentUrl.searchParams;
    
    if (category) {
      params.set('category', category);
    } else {
      params.delete('category');
    }
    
    // Construire la nouvelle URL en conservant le hash
    currentUrl.search = params.toString();
    console.log('Router navigateToCategory - Nouvelle URL:', currentUrl.toString());
    
    // Mettre à jour l'URL en conservant le hash
    window.history.replaceState({}, '', currentUrl.toString());
    
    // Déclencher les callbacks de changement de catégorie
    console.log('Router navigateToCategory - Appel des callbacks');
    this.categoryCallbacks.forEach(callback => callback(category));
  }

  /**
   * Supprime le paramètre de catégorie de l'URL
   */
  clearCategory() {
    console.log('Router clearCategory - Suppression de la catégorie');
    this.updateUrl({ category: null });
  }

  /**
   * Gère les changements d'URL
   * @private
   */
  handleUrlChange() {
    if (this.isHandlingUrlChange) return;
    this.isHandlingUrlChange = true;
    
    try {
      const category = this.getCurrentCategory();
      const animationId = this.getAnimationId();
      
      console.log('Router handleUrlChange - Catégorie:', category);
      console.log('Router handleUrlChange - Animation ID:', animationId);
      
      // Déclencher les callbacks dans le bon ordre
      if (category) {
        console.log('Router handleUrlChange - Appel des callbacks de catégorie');
        this.categoryCallbacks.forEach(callback => callback(category));
      }
      
      // Ne déclencher les callbacks d'animation que si un ID est présent
      if (animationId) {
        console.log('Router handleUrlChange - Appel des callbacks d\'animation');
        this.animationCallbacks.forEach(callback => callback(animationId));
      }
    } finally {
      this.isHandlingUrlChange = false;
    }
  }

  /**
   * Ajoute un callback pour les changements d'animation
   * @param {Function} callback
   */
  onAnimationChange(callback) {
    this.animationCallbacks.add(callback);
  }

  /**
   * Ajoute un callback pour les changements de catégorie
   * @param {Function} callback
   */
  onCategoryChange(callback) {
    this.categoryCallbacks.add(callback);
  }
}
