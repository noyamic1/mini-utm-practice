import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pointInPolygon } from './geo';

const square = [
  { lat: 0, lng: 0 },
  { lat: 0, lng: 10 },
  { lat: 10, lng: 10 },
  { lat: 10, lng: 0 },
];

test('point inside a square', () => {
  assert.equal(pointInPolygon({ lat: 5, lng: 5 }, square), true);
});

test('point outside a square', () => {
  assert.equal(pointInPolygon({ lat: 15, lng: 5 }, square), false);
  assert.equal(pointInPolygon({ lat: 5, lng: -1 }, square), false);
});

test('concave polygon (L shape)', () => {
  const l = [
    { lat: 0, lng: 0 }, { lat: 0, lng: 10 }, { lat: 4, lng: 10 },
    { lat: 4, lng: 4 }, { lat: 10, lng: 4 }, { lat: 10, lng: 0 },
  ];
  assert.equal(pointInPolygon({ lat: 2, lng: 8 }, l), true);
  assert.equal(pointInPolygon({ lat: 8, lng: 8 }, l), false); // the notch
});
