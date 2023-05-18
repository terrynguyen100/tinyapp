const { assert } = require('chai');

const { emailExisted } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = emailExisted("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.strictEqual(user.id, expectedUserID);
  });
  it('should return undefined with an invalid email', function() {
    const user = emailExisted("wrong@example.com", testUsers);
    const expectedUserID = undefined;
    assert.strictEqual(user.id, expectedUserID);
  });
});