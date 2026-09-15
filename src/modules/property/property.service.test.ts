import { describe, it, expect } from 'vitest';
import { buildPublicListFilter } from './property.service.js';

describe('buildPublicListFilter price range', () => {
  it('filters on price.sale when listingType is sale', () => {
    const filter = buildPublicListFilter({ listingType: 'sale', minPrice: 1_000_000, maxPrice: 5_000_000 });
    expect(filter['price.sale']).toEqual({ $gte: 1_000_000, $lte: 5_000_000 });
    expect(filter['price.rentMonthly']).toBeUndefined();
  });

  it('filters on price.rentMonthly when listingType is rent', () => {
    const filter = buildPublicListFilter({ listingType: 'rent', minPrice: 10_000, maxPrice: 50_000 });
    expect(filter['price.rentMonthly']).toEqual({ $gte: 10_000, $lte: 50_000 });
    expect(filter['price.sale']).toBeUndefined();
  });

  it('checks both price fields when listingType is not specified', () => {
    const filter = buildPublicListFilter({ minPrice: 10_000, maxPrice: 50_000 });
    expect(filter.$or).toEqual([
      { 'price.sale': { $gte: 10_000, $lte: 50_000 } },
      { 'price.rentMonthly': { $gte: 10_000, $lte: 50_000 } },
    ]);
  });

  it('omits price filter entirely when neither bound is given', () => {
    const filter = buildPublicListFilter({ propertyType: 'house' });
    expect(filter['price.sale']).toBeUndefined();
    expect(filter['price.rentMonthly']).toBeUndefined();
    expect(filter.$or).toBeUndefined();
  });

  it('applies published/not-deleted defaults plus keyword search', () => {
    const filter = buildPublicListFilter({ keyword: 'ทองหล่อ' });
    expect(filter.status).toBe('published');
    expect(filter.deletedAt).toBeNull();
    expect(filter.$text).toEqual({ $search: 'ทองหล่อ' });
  });
});
