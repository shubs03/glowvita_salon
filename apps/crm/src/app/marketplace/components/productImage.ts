export const MARKETPLACE_PRODUCT_PLACEHOLDER_IMAGE = '/images/product-placeholder.png';

export const getMarketplaceProductImage = (image?: string | null) => {
  return image?.trim() || MARKETPLACE_PRODUCT_PLACEHOLDER_IMAGE;
};
