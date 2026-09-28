const priceFormatter = new Intl.NumberFormat('es-PA', {
  style: 'currency',
  currency: 'PAB',
  minimumFractionDigits: 2,
});

export const formatPrice = (price: number) => priceFormatter.format(price);
