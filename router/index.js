const categoryRoute = require('./categoryRoute');
const subCategoryRoute = require('./subCategoryRoute');
const brandRoute = require('./brandRoute');
const productRoute = require('./productRoute');
const reviewRoute = require('./reviewRoute');
const userRoute = require('./userRoute');
const authRoute = require('./authRoute');
const wishlistRoute = require('./wishlistRoute');
const addressRoute = require('./addressRoute');
const couponRoute = require('./couponRoute');
const cartRoute = require('./cartRoute');
const orderRoute = require('./orderRoute');


const mountRoutes = (app) => {
app.use('/api/v1/category', categoryRoute);
app.use('/api/v1/subCategory', subCategoryRoute);
app.use('/api/v1/brand', brandRoute);
app.use('/api/v1/product', productRoute);
app.use('/api/v1/review', reviewRoute);
app.use('/api/v1/user', userRoute);
app.use('/api/v1/auth', authRoute);
app.use('/api/v1/wishlist', wishlistRoute);
app.use('/api/v1/address', addressRoute);
app.use('/api/v1/coupon', couponRoute);
app.use('/api/v1/cart', cartRoute);
app.use('/api/v1/order', orderRoute);
}

module.exports = mountRoutes;