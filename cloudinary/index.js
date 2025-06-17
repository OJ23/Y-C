const cloudinary = require ('cloudinary').v2;
const {CloudinaryStorage} = require ('multer-storage-cloudinary');

console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('CLOUDINARY_KEY:', process.env.CLOUDINARY_KEY);
console.log('CLOUDINARY_SECRET:', process.env.CLOUDINARY_SECRET);

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_KEY,
    api_secret:process.env.CLOUDINARY_SECRET
})

const storage = new CloudinaryStorage({
    cloudinary,
    params:{
        folder:'YC',
        allowedFormats: ['jpeg','jpg','png']
}});
console.log("✅ Cloudinary storage config loaded");

module.exports = {
    cloudinary,
    storage 
};