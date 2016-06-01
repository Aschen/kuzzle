var
  should = require('should'),
  md5 = require('crypto-md5'),
  Methods = require.main.require('lib/api/dsl/methods');

describe('Test "terms" method', function () {
  var
    methods,
    roomIdMatch = 'roomIdMatch',
    roomIdNot = 'roomIdNotMatch',
    index = 'index',
    collection = 'collection',
    filter = {
      firstName: ['Grace', 'Jean']
    },
    termsfirstNameGraceJean = md5('termsfirstNameGrace,Jean'),
    nottermsfirstNameGraceJean = md5('nottermsfirstNameGrace,Jean');

  before(function () {
    methods = new Methods({filtersTree: {}});

    return methods.terms(roomIdMatch, index, collection, filter, false)
      .then(() => methods.terms(roomIdNot, index, collection, filter, true));
  });

  it('should construct the filterTree object for the correct attribute', function () {
    should(methods.dsl.filtersTree).not.be.empty();
    should(methods.dsl.filtersTree[index]).not.be.empty();
    should(methods.dsl.filtersTree[index][collection]).not.be.empty();
    should(methods.dsl.filtersTree[index][collection].fields).not.be.empty();
    should(methods.dsl.filtersTree[index][collection].fields.firstName).not.be.empty();
  });

  it('should construct the filterTree with correct curried function name', function () {
    should(methods.dsl.filtersTree[index][collection].fields.firstName[termsfirstNameGraceJean]).not.be.empty();
    should(methods.dsl.filtersTree[index][collection].fields.firstName[nottermsfirstNameGraceJean]).not.be.empty();
  });

  it('should construct the filterTree with correct room list', function () {
    var
      rooms = methods.dsl.filtersTree[index][collection].fields.firstName[termsfirstNameGraceJean].rooms,
      roomsNot = methods.dsl.filtersTree[index][collection].fields.firstName[nottermsfirstNameGraceJean].rooms;

    should(rooms).be.an.Array();
    should(roomsNot).be.an.Array();

    should(rooms).have.length(1);
    should(roomsNot).have.length(1);

    should(rooms[0]).be.exactly(roomIdMatch);
    should(roomsNot[0]).be.exactly(roomIdNot);
  });

  it('should construct the filterTree with correct functions terms', function () {
    should(methods.dsl.filtersTree[index][collection].fields.firstName[termsfirstNameGraceJean].args).match({
      operator: 'terms',
      not: false,
      field: 'firstName',
      value: [ 'Grace', 'Jean' ]
    });

    should(methods.dsl.filtersTree[index][collection].fields.firstName[nottermsfirstNameGraceJean].args).match({
      operator: 'terms',
      not: true,
      field: 'firstName',
      value: [ 'Grace', 'Jean' ]
    });
  });

});