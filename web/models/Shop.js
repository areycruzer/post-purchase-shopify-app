import mongoose from 'mongoose';

const shopSchema = new mongoose.Schema({
    shopDomain: {
        type: String,
        required: true,
        unique: true,
    },
    installedAt: {
        type: Date,
        default: Date.now,
    },
    postPurchaseMessage: {
        type: String,
        default: 'Thank you for your order!',
    },
});

const Shop = mongoose.model('Shop', shopSchema);

export default Shop;
