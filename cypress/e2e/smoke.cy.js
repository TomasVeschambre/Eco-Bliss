describe('Eco Bliss Bath - smoke test', () => {
  
  it('Check login link visibility', () => {
    cy.visit('/');
    cy.get('[data-cy="nav-link-login"]').should('be.visible');
  });

  it('Check add to cart button visibility', () => {
    cy.visit('/');
    //Login
    cy.get('[data-cy="nav-link-login"]').click();
    cy.get('[type="text"]').type('test2@test.fr');
    cy.get('[type="password"]').type('testtest');
    cy.get('[data-cy="login-submit"]').click();

    //Attente connexion
    cy.wait(1000);
    cy.get('[data-cy="nav-link-logout"]').should('be.visible');

    //check cart button
    cy.get('[data-cy="nav-link-products"]').first().click();
    cy.get('[data-cy="product-link"]').first().click();
    cy.get('[data-cy="detail-product-add"]').should('be.visible');
    cy.get('[data-cy="detail-product-stock"]').should('be.visible');
  });
});
