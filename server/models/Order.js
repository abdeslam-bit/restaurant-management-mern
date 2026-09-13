const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  menuItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem',
    required: true,
  },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  image: { type: String, default: '' },
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
    },
    customer: {
      name: { type: String, required: [true, 'Customer name is required'], trim: true },
      phone: { type: String, required: [true, 'Phone number is required'], trim: true },
      address: { type: String, trim: true, default: '' },
      tableNumber: { type: String, trim: true, default: '' },
      specialInstructions: { type: String, trim: true, default: '' },
    },
    items: [orderItemSchema],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['Received', 'Preparing', 'Ready', 'Out for Delivery', 'Completed', 'Cancelled'],
      default: 'Received',
    },
    paymentType: {
      type: String,
      enum: ['Cash on Delivery', 'Dine-in'],
      required: true,
    },
    orderType: {
      type: String,
      enum: ['Delivery', 'Dine-in'],
      required: true,
    },
  },
  { timestamps: true }
);

// Generate order number before saving (Mongoose 7+: async hooks resolve via promise, no next())
orderSchema.pre('save', async function () {
  if (!this.orderNumber) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    this.orderNumber = `ORD-${timestamp}-${random}`;
  }
});

module.exports = mongoose.model('Order', orderSchema);
