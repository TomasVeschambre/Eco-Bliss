describe('XSS - Espace commentaire (reviews)', () => {
  beforeEach(() => {
    // Connexion avant chaque test
    cy.visit('/#/login');
    cy.get('[type="text"]').type('test2@test.fr');
    cy.get('[type="password"]').type('testtest');
    cy.get('[data-cy="login-submit"]').click();
    cy.wait(1000);
    cy.visit('/#/reviews');
    cy.wait(1000);
  });

  it('Vérifie que la balise <script> est neutralisée dans le commentaire', () => {
    // Initialiser le flag XSS à false
    cy.window().then((win) => { win.__xss_triggered = false; });

    cy.get('[data-cy="review-input-title"]').type('Test XSS Savon');
    cy.get('[data-cy="review-input-comment"]').type('<script>window.__xss_triggered = true;</script>', { parseSpecialCharSequences: false });

    // Choisir une note (étoile 5)
    cy.get('[data-cy="review-input-rating-images"] img').last().click();
    cy.get('[data-cy="review-submit"]').click();
    cy.wait(1000);

    // Vérifier que le script n'a pas été exécuté
    cy.window().its('__xss_triggered').should('equal', false);

    // Vérifier que le DOM ne contient pas de balise <script> active
    cy.get('[data-cy="review-comment"]').last().then(($el) => {
      expect($el.find('script').length).to.equal(0);
    });
  });
});

describe('XSS - Input quantité (ajout au panier)', () => {
  beforeEach(() => {
    // Connexion
    cy.visit('/#/login');
    cy.get('[type="text"]').type('test2@test.fr');
    cy.get('[type="password"]').type('testtest');
    cy.get('[data-cy="login-submit"]').click();
    cy.wait(1000);

    // Récupérer le premier produit via l'API et naviguer vers sa page
    cy.request('GET', 'http://localhost:8081/products').then((response) => {
      const firstProduct = response.body[0];
      cy.visit(`/#/products/${firstProduct.id}`);
      cy.wait(500);
    });
  });

  it('Vérifie que la balise <script> est rejetée dans le champ quantité', () => {
    cy.window().then((win) => { win.__xss_triggered = false; });

    // Forcer une valeur XSS dans l'input (bypass du type="number")
    cy.get('[data-cy="detail-product-quantity"]')
      .invoke('attr', 'type', 'text')
      .clear()
      .type('<script>window.__xss_triggered = true;</script>', { parseSpecialCharSequences: false });

    cy.get('[data-cy="detail-product-add"]').click();
    cy.wait(500);

    // Le script ne doit pas s'être exécuté
    cy.window().its('__xss_triggered').should('equal', false);

    // On doit rester sur la page produit (formulaire invalide) ou être redirigé vers /cart, jamais XSS
    cy.url().should('not.contain', 'javascript');
  });
});
