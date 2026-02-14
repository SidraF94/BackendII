import ProductDTO from './ProductDTO.js';

export default class CartDTO {
  constructor(cart) {
    this._id = cart._id?.toString() || cart._id;
    this.products = cart.products?.map(item => {
      const productData = item.productId ? new ProductDTO(item.productId).toFull() : null;
      const itemTotal = productData ? productData.price * item.quantity : 0;
      
      return {
        productId: productData ? {
          ...productData,
          _id: item.productId._id?.toString() || item.productId._id
        } : null,
        quantity: item.quantity,
        itemTotal: itemTotal
      };
    }) || [];
    
    this.totalItems = this.products.reduce((sum, item) => sum + item.quantity, 0);
    this.totalPrice = this.products.reduce((sum, item) => sum + item.itemTotal, 0);
    this.totalPriceFormatted = `$${this.totalPrice.toFixed(2)}`;
  }

  toBasic() {
    return {
      _id: this._id,
      totalItems: this.totalItems,
      totalPrice: this.totalPrice,
      totalPriceFormatted: this.totalPriceFormatted
    };
  }

  toFull() {
    return {
      _id: this._id,
      products: this.products,
      totalItems: this.totalItems,
      totalPrice: this.totalPrice,
      totalPriceFormatted: this.totalPriceFormatted
    };
  }
}
