describe('Eco Bliss Bath - fonctionnel test', () => {
  
  it('Check My cart button visibility', () => {
    cy.visit('/');
    //Login
    cy.get('[data-cy="nav-link-login"]').click();
    cy.get('[type="text"]').type('test2@test.fr');
    cy.get('[type="password"]').type('testtest');
    cy.get('[data-cy="login-submit"]').click();

    //Attente connexion
    cy.wait(1000);
    cy.get('[data-cy="nav-link-logout"]').should('be.visible');

    //check My cart button
    cy.get('[data-cy="nav-link-cart"]').should('be.visible');

  });


  ////////////////// TEST DE LA VERIFICATION DES PRODUITS ///////////////////////
  it('Produc data', () => {
    cy.visit('/');
    cy.wait(1000);
    
    //Check loading page 
    cy.get('nav').should('be.visible');
    
    cy.get("body > app-root > app-home > header > div.text-header > button").click();
    
    // API GET: récupérer les informations des produits
    cy.request({
      method: 'GET',
      url: 'http://localhost:8081/products',
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('array');
    
      const totalProducts = response.body.length;
      cy.log(`Nombre de produits via API: ${totalProducts}`);
      expect(totalProducts).to.be.greaterThan(0);
    
      // Vérifier que le nombre de produits affichés correspond au nombre de produits récupérés
      cy.get('[data-cy="product"]').should('have.length', totalProducts);
      cy.get('[data-cy="product-link"]').should('have.length', totalProducts);
      cy.get('[data-cy="product"]').each(($el, index) => {
        const product = response.body[index];
        cy.wrap($el).find('[data-cy="product-ingredients"]').should('contain', product.ingredients);
        cy.wrap($el).find('img').should('have.attr', 'src').and('contain', product.picture);
        cy.wrap($el).find('img').should('be.visible');
      });
    
      cy.wrap(response.body).as('products');
    });
    
    // Vérification des informations de chaque produit (image, description, prix, stock)
    cy.get('@products').each((product) => {
      cy.visit(`/#/products/${product.id}`);
      cy.wait(500);
    
      // Vérification de l'image
      cy.get('[data-cy="detail-product-img"]')
        .should('be.visible')
        .and('have.attr', 'src')
        .and('contain', product.picture);
    
      // Vérification de la description
      cy.get('[data-cy="detail-product-description"]')
        .should('be.visible')
        .and('contain', product.description);
    
      // Vérification du prix
      cy.get('[data-cy="detail-product-price"]')
        .should('be.visible');
    
      // Vérification du stock
      cy.get('[data-cy="detail-product-stock"]')
        .should('be.visible')
        .and('contain', product.availableStock);
    });
  });

  ////////////////// TEST DU PANIER ///////////////////////
  it('Add to cart functionality and check stock', () => {
    // Étape 1 : récupérer via l'API un produit avec du stock disponible
    cy.request({
      method: 'GET',
      url: 'http://localhost:8081/products',
    }).then((response) => {
      expect(response.status).to.eq(200);

      const productWithStock = response.body.find((p) => p.availableStock > 0);
      expect(productWithStock, 'Aucun produit avec stock disponible').to.exist;

      const productId = productWithStock.id;
      const stockBefore = productWithStock.availableStock;
      cy.log(`Produit sélectionné : ID=${productId}, stock avant=${stockBefore}`);

      // Étape 2 : connexion via l'UI
      cy.visit('/');
      cy.get('[data-cy="nav-link-login"]').click();
      cy.get('[type="text"]').type('test2@test.fr');
      cy.get('[type="password"]').type('testtest');
      cy.get('[data-cy="login-submit"]').click();
      cy.wait(1000);
      cy.get('[data-cy="nav-link-logout"]').should('be.visible');

      // Étape 3 : naviguer sur la page du produit et vérifier le stock affiché
      cy.visit(`/#/products/${productId}`);
      cy.wait(500);
      cy.get('[data-cy="detail-product-stock"]')
        .should('be.visible')
        .and('contain', `${stockBefore} en stock`);

      // Étape 4 : ajouter au panier et check du stock affiché pour les users
      cy.get('[data-cy="detail-product-add"]').click();
      cy.log('Produit ajouté au panier');

      cy.wait(500);
      cy.visit(`/#/products/${productId}`);
      cy.wait(500);

      cy.get('[data-cy="detail-product-stock"]')
        .should('be.visible')
        .and('contain', `${stockBefore - 1} en stock`);

      // Étape 5 : vérifier via l'API que le stock a bien diminué de 1
      cy.request({
        method: 'GET',
        url: `http://localhost:8081/products/${productId}`,
      }).then((productResponse) => {
        expect(productResponse.status).to.eq(200);
        const stockAfter = productResponse.body.availableStock;
        cy.log(`Stock après ajout au panier : ${stockAfter}`);
        expect(stockAfter).to.eq(stockBefore - 1);
        console.log(`Stock avant : ${stockBefore}, Stock après : ${stockAfter} - Stock mis à jour correctement après ajout au panier`);
      });

      // etape 6 : verifier la possibilité de passer en negatif du stock
      cy.get('[data-cy="detail-product-quantity"]').clear().type(stockBefore + 1);
      cy.get('[data-cy="detail-product-add"]').click();
      cy.wait(500);
      cy.visit(`/#/products/${productId}`);
      cy.wait(500);
      cy.get('[data-cy="detail-product-stock"]').should('be.visible');

      cy.get('[data-cy="detail-product-stock"]').then(($stock) => {
        const stockText = $stock.text();
        const stockLeft = stockText.match(/(-?\d+) en stock/);
        const stockLeftValue = stockLeft ? parseInt(stockLeft[1], 10) : null;
        cy.log('stockLEFT : ' + stockLeftValue);
        stockLeftValue >= 0
          ? cy.log(`Stock affiché : ${stockLeftValue} - L'application empêche correctement le stock négatif`)
          : cy.log(`Stock affiché : ${stockLeftValue} - ANOMALIE : le stock est passé en négatif`);
      });

      cy.request({
        method: 'GET',
        url: `http://localhost:8081/products/${productId}`,
      }).then((productResponse) => {
        expect(productResponse.status).to.eq(200);
        const stockAfterOverAdd = productResponse.body.availableStock;
        cy.log(`Stock API après tentative d'ajout en excès : ${stockAfterOverAdd}`);
        expect(stockAfterOverAdd, 'Le stock ne doit pas être négatif').to.be.gte(0);
      });
    });
  });

  it('check les produits du panier', () => {
    cy.request({
      method: 'GET',
      url: 'http://localhost:8081/products',
    }).then((response) => {
      expect(response.status).to.eq(200);

      const productWithStock = response.body.find((p) => p.availableStock > 0);
      expect(productWithStock, 'Aucun produit avec stock disponible').to.exist;

      const productId = productWithStock.id;
      const stockBefore = productWithStock.availableStock;
      cy.log(`Produit sélectionné : ID=${productId}, stock avant=${stockBefore}`);

      // Étape 2 : connexion via l'UI
      cy.visit('/');
      cy.intercept('POST', 'http://localhost:8081/login').as('loginRequest');
      cy.get('[data-cy="nav-link-login"]').click();
      cy.get('[type="text"]').type('test2@test.fr');
      cy.get('[type="password"]').type('testtest');
      cy.get('[data-cy="login-submit"]').click();
      cy.wait(1000);
      cy.get('[data-cy="nav-link-logout"]').should('be.visible');

      // Étape 3 : naviguer sur la page du produit et vérifier le stock affiché
      cy.visit(`/#/products/${productId}`);
      cy.wait(500);
      cy.get('[data-cy="detail-product-stock"]')
        .should('be.visible')
        .and('contain', `${stockBefore} en stock`);

      // Étape 4 : ajouter au panier et check du stock affiché pour les users
      cy.get('[data-cy="detail-product-add"]').click();
      cy.log('Produit ajouté au panier');

      // Étape 3 : récupérer les données du panier via l'API (GET /orders)
      cy.wait('@loginRequest').then(({ response }) => {
        const token = response?.body?.token;
        expect(token, 'Token absent dans la réponse login').to.be.a('string').and.not.be.empty;

        cy.request({
          method: 'GET',
          url: 'http://localhost:8081/orders',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          failOnStatusCode: false,
        }).then((ordersResponse) => {
          expect(ordersResponse.status).to.eq(200);
          expect(ordersResponse.body).to.exist;
          const panierJson = JSON.stringify(ordersResponse.body);
          cy.log(`Contenu panier API: ${panierJson.substring(0, 300)}${panierJson.length > 300 ? '...' : ''}`);

          if (Array.isArray(ordersResponse.body)) {
            cy.log(`Panier récupéré via API - ${ordersResponse.body.length} ligne(s)`);
          } else {
            expect(ordersResponse.body).to.be.an('object');
            cy.log('Panier récupéré via API (format objet)');
          }
        });
      });
    });
  });
});
