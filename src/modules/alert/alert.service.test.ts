import { describe, it, expect } from 'vitest';
import { matches } from './alert.service.js';

const saleProperty = {
  propertyType: 'house', listingType: 'sale',
  location: { zone: 'ทองหล่อ-เอกมัย' },
  price: { sale: 5_000_000 },
};

const rentProperty = {
  propertyType: 'condo', listingType: 'rent',
  location: { zone: 'อโศก' },
  price: { rentMonthly: 25_000 },
};

describe('alert matches', () => {
  it('matches on propertyType and listingType', () => {
    expect(matches({ propertyType: 'house', listingType: 'sale' }, saleProperty)).toBe(true);
    expect(matches({ propertyType: 'condo' }, saleProperty)).toBe(false);
    expect(matches({ listingType: 'rent' }, saleProperty)).toBe(false);
  });

  it('matches zone by case-insensitive substring', () => {
    expect(matches({ zone: 'ทองหล่อ' }, saleProperty)).toBe(true);
    expect(matches({ zone: 'สุขุมวิท' }, saleProperty)).toBe(false);
  });

  it('checks price.sale for sale listings and price.rentMonthly for rent listings', () => {
    expect(matches({ minPrice: 4_000_000, maxPrice: 6_000_000 }, saleProperty)).toBe(true);
    expect(matches({ minPrice: 6_000_000 }, saleProperty)).toBe(false);
    expect(matches({ minPrice: 20_000, maxPrice: 30_000 }, rentProperty)).toBe(true);
    expect(matches({ maxPrice: 20_000 }, rentProperty)).toBe(false);
  });

  it('rejects a rent property against a sale-priced range and vice versa', () => {
    // rentProperty has no price.sale, so a sale-oriented alert with a min bound never matches it
    expect(matches({ minPrice: 1 }, { ...rentProperty, price: {} })).toBe(false);
  });

  it('matches everything when the alert has no criteria', () => {
    expect(matches({}, saleProperty)).toBe(true);
    expect(matches({}, rentProperty)).toBe(true);
  });
});
