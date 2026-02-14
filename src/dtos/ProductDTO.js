export default class ProductDTO {
  constructor(product) {
    this._id = product._id?.toString() || product._id;
    this.title = product.title;
    this.description = product.description;
    this.code = product.code;
    this.price = product.price;
    this.stock = product.stock;
    this.category = product.category;
    this.status = product.status !== undefined ? product.status : true;
    this.thumbnails = product.thumbnails || [];
    
    // Información adicional formateada
    this.available = product.stock > 0 && product.status;
    this.priceFormatted = `$${product.price?.toFixed(2)}`;
  }

  // Método para devolver solo información básica
  toBasic() {
    return {
      _id: this._id,
      title: this.title,
      price: this.price,
      category: this.category,
      available: this.available
    };
  }

  // Método para devolver información completa
  toFull() {
    return {
      _id: this._id,
      title: this.title,
      description: this.description,
      code: this.code,
      price: this.price,
      priceFormatted: this.priceFormatted,
      stock: this.stock,
      category: this.category,
      status: this.status,
      available: this.available,
      thumbnails: this.thumbnails
    };
  }
}
