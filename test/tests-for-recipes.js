const chai = require('chai');
const chaiHttp = require('chai-http');

const {app, runServer, closeServer} = require('../server');

const should = chai.should();

chai.use(chaiHttp);

describe('Recipes', function() {

  before(function() {
    return runServer();
  });


  after(function() {
    return closeServer();
  });


  it('should list recipes on GET', function() {

    return chai.request(app)
      .get('/recipes')
      .then(function(res) {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('array');
        res.body.length.should.be.at.least(1);
        const expectedKeys = ['id', 'name', 'ingredients'];
        res.body.forEach(function(recipe) {
          recipe.should.be.a('object');
          recipe.should.include.keys(expectedKeys);
        });
      });
  });


  it('should add an recipe on POST', function() {
    const newRecipe = {name: 'strawberry milkshake', ingredients: ['strawberry puree', 'vanilla ice cream', 'sugar']};
    return chai.request(app)
      .post('/recipes')
      .send(newRecipe)
      .then(function(res) {
        res.should.have.status(201);
        res.should.be.json;
        res.body.should.be.a('object');
        res.body.should.include.keys('id', 'name', 'ingredients');
        res.body.id.should.not.be.null;
        res.body.should.deep.equal(Object.assign(newRecipe, {id: res.body.id}));
      });
  });

  it('should throw error on POST if field is missing', function() {
    const newRecipe = {name: 'strawberry milkshake'};
    return chai.request(app)
      .post('/recipes')
      .send(newRecipe)
      .then(function(res) {
        res.should.not.have.status(200);
      }, function(res) {
        res.should.have.status(400);
      });
  });



  it('should update recipes on PUT', function() {
    const updateData = {
      name: 'strawberry milkshake',
      ingredients: ['strawberry puree', 'milk', 'sugar']
    };

    return chai.request(app)
      .get('/recipes')
      .then(function(res) {
        updateData.id = res.body[0].id;

        return chai.request(app)
          .put(`/recipes/${updateData.id}`)
          .send(updateData);
      })

      .then(function(res) {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('object');
        res.body.should.deep.equal(updateData);
      });
  });

  it('should throw error on PUT if ids do not match', function() {
  const updateData = {
    name: 'strawberry milkshake',
    ingredients: ['strawberry puree', 'milk', 'sugar']
  };

  return chai.request(app)
    .get('/recipes')
    .then(function(res) {
      updateData.id != res.body[0].id;

      return chai.request(app)
        .put(`/recipes/${updateData.id}`)
        .send(updateData);
    })

    .then(function(res) {
      res.should.not.have.status(200);
    }, function(res) {
      res.should.have.status(400);
    });
});

  it('should throw error on PUT if field is missing', function() {
    const updateData = {
      name: 'strawberry milkshake'
    };

    return chai.request(app)
      .get('/recipes')
      .then(function(res) {
        updateData.id = res.body[0].id;

        return chai.request(app)
          .put(`/recipes/${updateData.id}`)
          .send(updateData);
      })

      .then(function(res) {
        res.should.not.have.status(200);
      }, function(res) {
        res.should.have.status(400);
      });
  });


  it('should delete recipes on DELETE', function() {
    return chai.request(app)
      .get('/recipes')
      .then(function(res) {
        return chai.request(app)
          .delete(`/recipes/${res.body[0].id}`);
      })
      .then(function(res) {
        res.should.have.status(204);
      });
  });
});
