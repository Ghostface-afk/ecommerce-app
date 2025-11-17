const ImageKit = require("imagekit");

const imagekit = new ImageKit({
    publicKey: "YOUR_PUBLIC_API_KEY",
    privateKey: "YOUR_PRIVATE_API_KEY",
    urlEndpoint: "https://ik.imagekit.io/YOUR_IMAGEKIT_ID/"
});

module.exports = imagekit;