/**
 * Gère la grille d'animations
 */
export class AnimationGrid {
  /**
   * @param {HTMLElement} container - Élément conteneur de la grille
   */
  constructor(container) {
    this.container = container;
    this.animations = [];
    this.callbacks = new Set();
    this.currentCategory = null;
    
    this.init();
  }

  /**
   * Initialise la grille
   * @private
   */
  init() {
    const grid = document.createElement('div');
    grid.classList.add('animation-grid');
    grid.setAttribute('role', 'grid');
    this.container.appendChild(grid);
    this.gridElement = grid;
  }

  /**
   * Définit les animations à afficher
   * @param {Array} animations - Liste des animations
   */
  setAnimations(animations) {
    this.animations = animations;
    this.render();
  }

  /**
   * Crée une carte d'animation
   * @param {Object} animation - Données de l'animation
   * @returns {HTMLElement} Élément de la carte
   * @private
   */
  createCard(animation) {
    const card = document.createElement('div');
    card.classList.add('animation-card');
    card.setAttribute('role', 'gridcell');
    card.setAttribute('tabindex', '0');
    
    // Image
    const img = document.createElement('img');
    img.src = animation.image;
    img.alt = animation.title;
    img.loading = 'lazy';
    card.appendChild(img);
    
    // Conteneur pour le contenu (titre, description et bouton)
    const content = document.createElement('div');
    content.classList.add('card-content');
    
    // Conteneur pour le titre et le bouton de copie
    const titleContainer = document.createElement('div');
    titleContainer.classList.add('title-container');
    titleContainer.style.display = 'flex';
    titleContainer.style.justifyContent = 'space-between';
    titleContainer.style.alignItems = 'center';
    
    // Titre
    const title = document.createElement('h3');
    title.textContent = animation.title;
    titleContainer.appendChild(title);
    
    // Bouton de copie
    const copyButton = document.createElement('button');
    copyButton.classList.add('copy-link-button');
    copyButton.title = 'Copier le lien direct';
    copyButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
      <path d="M326.6 185.4c59.7 59.8 58.9 155.7 .4 214.6-.1 .1-.2 .3-.4 .4l-67.2 67.2c-59.3 59.3-155.7 59.3-215 0-59.3-59.3-59.3-155.7 0-215l37.1-37.1c9.8-9.8 26.8-3.3 27.3 10.6 .6 17.7 3.8 35.5 9.7 52.7 2 5.8 .6 12.3-3.8 16.6l-13.1 13.1c-28 28-28.9 73.7-1.2 102 28 28.6 74.1 28.7 102.3 .5l67.2-67.2c28.2-28.2 28.1-73.8 0-101.8-3.7-3.7-7.4-6.6-10.3-8.6a16 16 0 0 1 -6.9-12.6c-.4-10.6 3.3-21.5 11.7-29.8l21.1-21.1c5.5-5.5 14.2-6.2 20.6-1.7a152.5 152.5 0 0 1 20.5 17.2zM467.5 44.4c-59.3-59.3-155.7-59.3-215 0l-67.2 67.2c-.1 .1-.3 .3-.4 .4-58.6 58.9-59.4 154.8 .4 214.6a152.5 152.5 0 0 0 20.5 17.2c6.4 4.5 15.1 3.8 20.6-1.7l21.1-21.1c8.4-8.4 12.1-19.2 11.7-29.8a16 16 0 0 0 -6.9-12.6c-2.9-2-6.6-4.9-10.3-8.6-28.1-28.1-28.2-73.6 0-101.8l67.2-67.2c28.2-28.2 74.3-28.1 102.3 .5 27.8 28.3 26.9 73.9-1.2 102l-13.1 13.1c-4.4 4.4-5.8 10.8-3.8 16.6 5.9 17.2 9 35 9.7 52.7 .5 13.9 17.5 20.4 27.3 10.6l37.1-37.1c59.3-59.3 59.3-155.7 0-215z"/>
    </svg>`;
    copyButton.addEventListener('click', (e) => {
      e.stopPropagation();
      const url = new URL(window.location.href);
      url.search = '';
      url.hash = '';
      url.hash = `animation/${animation.id}`;
      
      // Fonction de copie avec fallback
      const copyToClipboard = async (text) => {
        try {
          if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return true;
          } else {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
              document.execCommand('copy');
              textArea.remove();
              return true;
            } catch (error) {
              console.error('Error copying text:', error);
              textArea.remove();
              return false;
            }
          }
        } catch (error) {
          console.error('Error copying text:', error);
          return false;
        }
      };

      copyToClipboard(url.toString()).then((success) => {
        if (success) {
          const checkIcon = document.createElement('div');
          checkIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M313.4 32.9c26 5.2 42.9 30.5 37.7 56.5l-2.3 11.4c-5.3 26.7-15.1 52.1-28.8 75.2l144 0c26.5 0 48 21.5 48 48c0 18.5-10.5 34.6-25.9 42.6C497 275.4 504 288.9 504 304c0 23.4-16.8 42.9-38.9 47.1c4.4 7.3 6.9 15.8 6.9 24.9c0 21.3-13.9 39.4-33.1 45.6c.7 3.3 1.1 6.8 1.1 10.4c0 26.5-21.5 48-48 48l-97.5 0c-19 0-37.5-5.6-53.3-16.1l-38.5-25.7C176 420.4 160 390.4 160 358.3l0-38.3 0-48 0-24.9c0-29.2 13.3-56.7 36-75l7.4-5.9c26.5-21.2 44.6-51 51.2-84.2l2.3-11.4c5.2-26 30.5-42.9 56.5-37.7zM32 192l64 0c17.7 0 32 14.3 32 32l0 224c0 17.7-14.3 32-32 32l-64 0c-17.7 0-32-14.3-32-32L0 224c0-17.7 14.3-32 32-32z"/></svg>';
          checkIcon.style.color = 'rgb(var(--primary-rgb, 33, 150, 243))';
          copyButton.innerHTML = '';
          copyButton.appendChild(checkIcon);
          setTimeout(() => {
            copyButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
              <path d="M326.6 185.4c59.7 59.8 58.9 155.7 .4 214.6-.1 .1-.2 .3-.4 .4l-67.2 67.2c-59.3 59.3-155.7 59.3-215 0-59.3-59.3-59.3-155.7 0-215l37.1-37.1c9.8-9.8 26.8-3.3 27.3 10.6 .6 17.7 3.8 35.5 9.7 52.7 2 5.8 .6 12.3-3.8 16.6l-13.1 13.1c-28 28-28.9 73.7-1.2 102 28 28.6 74.1 28.7 102.3 .5l67.2-67.2c28.2-28.2 28.1-73.8 0-101.8-3.7-3.7-7.4-6.6-10.3-8.6a16 16 0 0 1 -6.9-12.6c-.4-10.6 3.3-21.5 11.7-29.8l21.1-21.1c5.5-5.5 14.2-6.2 20.6-1.7a152.5 152.5 0 0 1 20.5 17.2zM467.5 44.4c-59.3-59.3-155.7-59.3-215 0l-67.2 67.2c-.1 .1-.3 .3-.4 .4-58.6 58.9-59.4 154.8 .4 214.6a152.5 152.5 0 0 0 20.5 17.2c6.4 4.5 15.1 3.8 20.6-1.7l21.1-21.1c8.4-8.4 12.1-19.2 11.7-29.8a16 16 0 0 0 -6.9-12.6c-2.9-2-6.6-4.9-10.3-8.6-28.1-28.1-28.2-73.6 0-101.8l67.2-67.2c28.2-28.2 74.3-28.1 102.3 .5 27.8 28.3 26.9 73.9-1.2 102l-13.1 13.1c-4.4 4.4-5.8 10.8-3.8 16.6 5.9 17.2 9 35 9.7 52.7 .5 13.9 17.5 20.4 27.3 10.6l37.1-37.1c59.3-59.3 59.3-155.7 0-215z"/>
            </svg>`;
          }, 2000);
        }
      });
    });
    titleContainer.appendChild(copyButton);
    
    content.appendChild(titleContainer);
    
    // Description
    const desc = document.createElement('p');
    desc.textContent = animation.description;
    content.appendChild(desc);
    
    card.appendChild(content);
    
    // Événements
    card.addEventListener('click', () => this.handleSelect(animation));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.handleSelect(animation);
      }
    });
    
    return card;
  }

  /**
   * Gère la sélection d'une animation
   * @param {Object} animation - Animation sélectionnée
   * @private
   */
  handleSelect(animation) {
    this.callbacks.forEach(callback => callback(animation));
  }

  /**
   * Ajoute un callback pour la sélection d'animation
   * @param {Function} callback - Fonction à appeler lors de la sélection
   */
  onAnimationSelect(callback) {
    this.callbacks.add(callback);
  }

  /**
   * Affiche les animations dans la grille
   * @private
   */
  render() {
    // Vider la grille
    while (this.gridElement.firstChild) {
      this.gridElement.removeChild(this.gridElement.firstChild);
    }
    
    // Créer les cartes pour chaque animation
    this.animations.forEach(animation => {
      const card = this.createCard(animation);
      this.gridElement.appendChild(card);
    });
  }

  /**
   * Filtre les animations par catégorie
   * @param {string} category - Catégorie à afficher
   */
  filterByCategory(category) {
    this.currentCategory = category;
    const filteredAnimations = category 
      ? this.animations.filter(animation => animation.category === category)
      : this.animations;
    
    // Vider la grille
    while (this.gridElement.firstChild) {
      this.gridElement.removeChild(this.gridElement.firstChild);
    }
    
    // Créer les cartes pour chaque animation filtrée
    filteredAnimations.forEach(animation => {
      const card = this.createCard(animation);
      this.gridElement.appendChild(card);
    });
  }
}
