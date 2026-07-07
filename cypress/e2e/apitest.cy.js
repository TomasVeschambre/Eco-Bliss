describe('Eco Bliss Bath - API test', () => {

  ///TEST API GET 
  it('GET /orders without authentication should return 401', () => {
    cy.request({
      method: 'GET',
      url: 'http://localhost:8081/orders',
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(401);
      cy.log('Accès refusé sans connexion - status 401 reçu');
    });
  });


  it('GET /products/{id} should return product details', () => {
    cy.request({
      method: 'GET',
      url: 'http://localhost:8081/products/5',
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('id').and.equal(5);
      expect(response.body).to.have.property('name').and.equal('Poussière de lune');
      expect(response.body).to.have.property('price').and.equal(9.99);
      expect(response.body).to.have.property('skin');
      expect(response.body).to.have.property('aromas');
      expect(response.body).to.have.property('ingredients');
      expect(response.body).to.have.property('description');
      expect(response.body).to.have.property('picture');
      expect(response.body).to.have.property('varieties');
      cy.log('Product details retrieved successfully');
    });
  });


  ///Test API POST

  it('Login API should return a token', () => {
    cy.request({
      method: 'POST',
      url: 'http://localhost:8081/login',
      body: {
        username: 'test2@test.fr',
        password: 'testtest',
      },
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('token');
      expect(response.body.token).to.be.a('string').and.not.be.empty;
      console.log('API token:', response.body.token);
      cy.log('Login API OK - token received');
    });
  });

  it('PUT /orders add should add product to cart', () => {
    // First, login to get a token
    cy.request({
      method: 'POST',
      url: 'http://localhost:8081/login',
      body: {
        username: 'test2@test.fr',
        password: 'testtest',
      },
    }).then((loginResponse) => {
      const token = loginResponse.body.token;
      
      // Then, add product to cart
      cy.request({
        method: 'PUT',
        url: 'http://localhost:8081/orders/add',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: {
          product: 5,
          quantity: 2,
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an('object');
        expect(Object.keys(response.body)).to.not.be.empty;
        cy.log('Product successfully added to cart');
      });
    });
  });

  it('PUT / orders add should reject out of stock product', () => {
    // First, login to get a token
    cy.request({
      method: 'POST',
      url: 'http://localhost:8081/login',
      body: {
        username: 'test2@test.fr',
        password: 'testtest',
      },
    }).then((loginResponse) => {
      const token = loginResponse.body.token;
      
      // Try to add out of stock product (product 4 has 0 stock)
      cy.request({
        method: 'PUT',
        url: 'http://localhost:8081/orders/add',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: {
          product: 4,  // "Chuchotements d'été" - 0 stock
          quantity: 1,
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body).to.have.property('error').and.include('out of stock');
        cy.log('Out of stock product correctly rejected');
      });
    });
  });

  it('POST /reviews should add a product review', () => {
    // First, login to get a token
    cy.request({
      method: 'POST',
      url: 'http://localhost:8081/login',
      body: {
        username: 'test2@test.fr',
        password: 'testtest',
      },
    }).then((loginResponse) => {
      const token = loginResponse.body.token;
      
      // Add a review
      cy.request({
        method: 'POST',
        url: 'http://localhost:8081/reviews',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: {
          title: 'Excellent savon',
          comment: 'Savon de très bonne qualité, je recommande vivement ce produit!',
          rating: 5,
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('id');
        expect(response.body).to.have.property('title').and.equal('Excellent savon');
        expect(response.body).to.have.property('rating').and.equal(5);
        cy.log('Review successfully added');
      });
    });
  });
});