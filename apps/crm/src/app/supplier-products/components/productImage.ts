export const SUPPLIER_PRODUCT_PLACEHOLDER_IMAGE = '/images/product-placeholder.png';

export const getSupplierProductImage = (image?: string | null) => {
  return image?.trim() || SUPPLIER_PRODUCT_PLACEHOLDER_IMAGE;
};
