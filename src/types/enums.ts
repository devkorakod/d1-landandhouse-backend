export const PROPERTY_TYPE = ['house', 'condo', 'land', 'townhouse', 'commercial',
  'apartment', 'villa', 'office', 'warehouse', 'hotel'] as const;
export const LISTING_TYPE = ['sale', 'rent', 'sale_rent'] as const;
export const PROPERTY_STATUS = ['draft', 'published', 'reserved', 'sold', 'rented', 'hidden'] as const;
export const OWNERSHIP = ['freehold', 'leasehold'] as const;
export const TITLE_DEED = ['chanote', 'nor_sor_3_gor', 'nor_sor_3', 'por_bor_tor_5'] as const;
export const FURNISHING = ['unfurnished', 'partial', 'fully'] as const;
export const DIRECTION = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'] as const;
export const VIEW_TYPE = ['city', 'river', 'sea', 'garden', 'pool', 'mountain', 'golf'] as const;
export const NEARBY_TYPE = ['bts', 'mrt', 'arl', 'school', 'university', 'hospital',
  'mall', 'market', 'airport', 'expressway', 'park', 'office'] as const;
export const PROJECT_TYPE = ['condo', 'housing_estate', 'townhome', 'mixed_use', 'commercial'] as const;
export const CONSTRUCTION_STATUS = ['planning', 'under_construction', 'completed', 'ready_to_move'] as const;
export const LEAD_SOURCE = ['property_form', 'general_form', 'floating_form', 'project_form',
  'article_form', 'appointment', 'phone', 'line', 'walk_in', 'facebook', 'manual'] as const;
export const LEAD_STATUS = ['new', 'contacted', 'viewing_scheduled', 'negotiating', 'won', 'lost'] as const;
export const LOST_REASON = ['budget', 'location', 'timing', 'bought_elsewhere',
  'unreachable', 'not_serious', 'other'] as const;
export const LEAD_INTENT = ['buy', 'rent', 'sell', 'invest', 'consult'] as const;
export const CONTACT_CHANNEL = ['phone', 'line', 'email', 'whatsapp', 'messenger'] as const;
export const PREFERRED_TIME = ['morning', 'afternoon', 'evening', 'anytime'] as const;
export const APPOINTMENT_STATUS = ['requested', 'confirmed', 'rescheduled', 'completed',
  'cancelled', 'no_show'] as const;
export const ARTICLE_STATUS = ['draft', 'scheduled', 'published', 'archived'] as const;
export const DISCOUNT_TYPE = ['percentage', 'fixed', 'custom'] as const;
export const PROMO_APPLIES = ['all', 'properties', 'projects', 'property_types', 'locations'] as const;
export const USER_ROLE = ['owner', 'admin'] as const;
export const SECTION_TYPE = ['hero_slider', 'search_bar', 'featured_properties',
  'featured_projects', 'property_types_grid', 'popular_locations', 'promotions_strip',
  'rich_text', 'image_text', 'stats_counter', 'testimonials', 'latest_articles',
  'video_banner', 'lead_form', 'map_section', 'logo_wall', 'faq', 'cta_banner',
  'custom_html'] as const;
export const BANNER_PLACEMENT = ['home_hero', 'listing_top', 'listing_inline',
  'detail_sidebar', 'article_inline', 'global_popup', 'mobile_sticky'] as const;

export type PropertyType = (typeof PROPERTY_TYPE)[number];
export type ListingType = (typeof LISTING_TYPE)[number];
export type PropertyStatus = (typeof PROPERTY_STATUS)[number];
export type LeadStatus = (typeof LEAD_STATUS)[number];
export type LeadSource = (typeof LEAD_SOURCE)[number];
export type UserRole = (typeof USER_ROLE)[number];
export type SectionType = (typeof SECTION_TYPE)[number];
export type AppointmentStatus = (typeof APPOINTMENT_STATUS)[number];
