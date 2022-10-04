import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    productTitle: {
      type: String,
      required: true,
      index: { unique: true, dropDups: true },
    },
    summary: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      default: "all",
    },
    location: {
      type: String,
      default: "kigali",
    },

    description: {
      type: String,
      trim: true,
    },
    product_photos: [String],
    product_start_date: Date,
    product_end_date: Date,
    initial_bid: Number,
    product_status: {
      type: Boolean,
      default: true,
      select: false,
    },
    bidders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: { createdAt: "created_at" } }
);

const Product = mongoose.model("Product", productSchema);
Product.createIndexes();

export default Product;
