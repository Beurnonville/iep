const VALID_CATEGORIES = ['Divers', 'Transformations', 'Angles', 'Quadrilatères', 'Triangles', 'Droites'];

/**
 * Valide la structure d'une animation
 * @param {Object} animation - L'objet animation à valider
 * @throws {Error} Si l'animation n'est pas valide
 */
export function validateAnimation(animation) {
  const requiredFields = ['id', 'title', 'description', 'category', 'xml_file', 'image'];
  
  // Vérifie les champs requis
  for (const field of requiredFields) {
    if (!animation[field]) {
      throw new Error(`Missing required field: ${field}`);
    }
  }

  // Vérifie la catégorie
  if (!VALID_CATEGORIES.includes(animation.category)) {
    throw new Error(`Invalid category: ${animation.category}. Must be one of: ${VALID_CATEGORIES.join(', ')}`);
  }

  // Vérifie les chemins des fichiers
  if (!animation.xml_file.startsWith('figures/') || !animation.xml_file.endsWith('.xml')) {
    throw new Error('Invalid xml_file path. Must start with "figures/" and end with ".xml"');
  }

  if (!animation.image.startsWith('images/') || !animation.image.endsWith('.svg')) {
    throw new Error('Invalid image path. Must start with "images/" and end with ".svg"');
  }
}

/**
 * Charge les animations depuis le fichier animations.json
 * @returns {Promise<Array>} Liste des animations
 * @throws {Error} Si le chargement échoue
 */
export async function loadAnimations() {
  try {
    const response = await fetch('animations.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    
    // Valide chaque animation
    data.animations.forEach(validateAnimation);
    
    return data.animations;
  } catch (error) {
    throw new Error('Failed to load animations: ' + error.message);
  }
}

/**
 * Vérifie l'existence d'un fichier via une requête HEAD
 * @param {string} url - URL du fichier à vérifier
 * @returns {Promise<boolean>} true si le fichier existe
 */
export async function checkFileExists(url) {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    return false;
  }
}

/**
 * Vérifie l'accessibilité de tous les fichiers d'une animation
 * @param {Object} animation - L'objet animation à vérifier
 * @returns {Promise<Object>} Résultat de la vérification
 */
export async function verifyAnimationResources(animation) {
  const results = {
    xml: false,
    image: false,
    errors: []
  };

  // Vérifie le fichier XML
  results.xml = await checkFileExists(animation.xml_file);
  if (!results.xml) {
    results.errors.push(`XML file not accessible: ${animation.xml_file}`);
  }

  // Vérifie l'image SVG
  results.image = await checkFileExists(animation.image);
  if (!results.image) {
    results.errors.push(`SVG image not accessible: ${animation.image}`);
  }

  return results;
}

/**
 * Charge et vérifie toutes les ressources des animations
 * @param {Array} animations - Liste des animations à vérifier
 * @returns {Promise<Object>} Résultat des vérifications
 */
export async function verifyAllResources(animations) {
  const results = {
    valid: true,
    errors: []
  };

  for (const animation of animations) {
    const resourceCheck = await verifyAnimationResources(animation);
    if (resourceCheck.errors.length > 0) {
      results.valid = false;
      results.errors.push({
        animationId: animation.id,
        errors: resourceCheck.errors
      });
    }
  }

  return results;
}
