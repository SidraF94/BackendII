export default class TicketDTO {
  constructor(ticket) {
    this._id = ticket._id?.toString() || ticket._id;
    this.code = ticket.code;
    this.purchase_datetime = ticket.purchase_datetime;
    this.amount = ticket.amount;
    this.amountFormatted = `$${ticket.amount?.toFixed(2)}`;
    this.purchaser = ticket.purchaser;
    this.products = ticket.products?.map(item => ({
      product: item.product?._id || item.product,
      title: item.title,
      price: item.price,
      quantity: item.quantity,
      subtotal: item.subtotal
    })) || [];
    this.status = ticket.status;
    this.createdAt = ticket.createdAt;
    this.updatedAt = ticket.updatedAt;
  }

  toBasic() {
    return {
      _id: this._id,
      code: this.code,
      purchase_datetime: this.purchase_datetime,
      amount: this.amount,
      amountFormatted: this.amountFormatted,
      purchaser: this.purchaser,
      status: this.status
    };
  }

  toFull() {
    return {
      _id: this._id,
      code: this.code,
      purchase_datetime: this.purchase_datetime,
      amount: this.amount,
      amountFormatted: this.amountFormatted,
      purchaser: this.purchaser,
      products: this.products,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}
