import cloudinary from "../config/cloudinary.js";

// Admin panel se signed upload ke liye signature generate karta hai
// Isse video/image seedha browser se Cloudinary jaate hain, server ko bypass karke
export const getUploadSignature = (req, res) => {
  try {
    const { folder } = req.body;
    const timestamp = Math.round(Date.now() / 1000);

    const paramsToSign = {
      timestamp,
      folder: folder || "shows",
    };

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUD_SECRET_API_KEY
    );

    return res.status(200).json({
      success: true,
      signature,
      timestamp,
      cloudName: process.env.CLOUD_NAME,
      apiKey: process.env.CLOUD_API_KEY,
    });
  } catch (error) {
    return res.status(500).json({ message: `Signature error: ${error.message}` });
  }
};