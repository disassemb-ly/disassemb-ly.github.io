import { edges, merge, Edge, EdgeType } from '../src/merge';
import { expect } from 'chai';

describe('edges', () => {
  it('iterates edges', () => {
    expect(edges([{
      kind: 'red',
      span: [1, 1],
    }, {
      span: [2, 1],
      kind: 'blue',
    }])).to.deep.equal([{
      edge: 1,
      kind: 'red',
      type: EdgeType.Entry,
    }, {
      edge: 2,
      kind: 'red',
      type: EdgeType.Exit,
    }, {
      edge: 2,
      kind: 'blue',
      type: EdgeType.Entry,
    }, {
      edge: 3,
      kind: 'blue',
      type: EdgeType.Exit,
    }]);

    expect(edges([{
      span: [2, 4],
      kind: 'blue',
    }, {
      span: [3, 4],
      kind: 'yellow',
    }, {
      span: [4, 1],
      kind: 'blue',
    }, {
      span: [3, 4],
      kind: 'red',
    }])).to.deep.equal([{
      edge: 2,
      kind: 'blue',
      type: EdgeType.Entry,
    }, {
      edge: 3,
      kind: 'yellow',
      type: EdgeType.Entry,
    }, {
      edge: 3,
      kind: 'red',
      type: EdgeType.Entry,
    }, {
      edge: 4,
      kind: 'blue',
      type: EdgeType.Entry,
    }, {
      edge: 5,
      kind: 'blue',
      type: EdgeType.Exit,
    }, {
      edge: 6,
      kind: 'blue',
      type: EdgeType.Exit,
    }, {
      edge: 7,
      kind: 'yellow',
      type: EdgeType.Exit,
    }, {
      edge: 7,
      kind: 'red',
      type: EdgeType.Exit,
    }]);
  });
});

describe('merge', function() {
  it('it merges intervals', () => {
    expect(merge([{
      kind: 'red',
      span: [1, 1],
    }])).to.deep.equal([{
      kinds: ['red'],
      span: [1, 1],
    }]);

    expect(merge([{
      kind: 'yellow',
      span: [1, 1],
    }, {
      span: [3, 1],
      kind: 'blue',
    }])).to.deep.equal([{
      kinds: ['yellow'],
      span: [1, 1],
    }, {
      kinds: ['blue'],
      span: [3, 1],
    }]);

    expect(merge([{
      kind: 'green',
      span: [0, 3],
    }, {
      span: [4, 2],
      kind: 'blue',
    }, {
      span: [7, 2],
      kind: 'orange',
    }])).to.deep.equal([{
      kinds: ['green'],
      span: [0, 3],
    }, {
      kinds: ['blue'],
      span: [4, 2],
    }, {
      kinds: ['orange'],
      span: [7, 2],
    }]);

    expect(merge([{
      kind: 'grey',
      span: [0, 16],
    }, {
      span: [4, 4],
      kind: 'white',
    }, {
      span: [12, 4],
      kind: 'black',
    }])).to.deep.equal([{
      kinds: ['grey'],
      span: [0, 4],
    }, {
      kinds: ['grey', 'white'],
      span: [4, 4],
    }, {
      kinds: ['grey'],
      span: [8, 4],
    }, {
      kinds: ['grey', 'black'],
      span: [12, 4],
    }]);
  });
});
