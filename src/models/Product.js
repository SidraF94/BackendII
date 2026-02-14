import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: Boolean,
    default: true
  },
  thumbnails: {
    type: [
      {
        data: {
          type: String,
          required: false
        },
        contentType: {
          type: String,
          required: false
        },
        filename: {
          type: String,
          required: false
        }
      }
    ],
    default: []
  }
}, {
  timestamps: true
});

productSchema.plugin(mongoosePaginate);

const Product = mongoose.model("Product", productSchema);

export default Product;
