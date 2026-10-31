const cloudinary = require("cloudinary").v2;
const dotenv = require("dotenv");

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadFileToCloudinary = async (files) => {
  try {
    const fileArray = Array.isArray(files) ? files : [files];

    const uploadPromises = fileArray.map((file) =>
      cloudinary.uploader.upload(file.filepath, { folder: "Paradise_Yatra" })
    );

    const uploadResults = await Promise.all(uploadPromises);

    return uploadResults.map((result) => ({
      secure_url: result.secure_url,
      public_id: result.public_id,
      asset_id: result.asset_id,
    }));
  } catch (error) {
    throw new Error(`File upload failed: ${error.message}`);
  }
};

const deleteFileFromCloudinary = async (files) => {
  const publicIds = Array.isArray(files)
    ? files.map((file) => file.public_id)
    : [files.public_id];

  try {
    const deleteResults = await Promise.all(
      publicIds.map(async (publicId) => {
        try {
          const result = await cloudinary.uploader.destroy(publicId);
          console.log(
            `File with public_id ${publicId} deleted from Cloudinary`
          );
          return { publicId, result };
        } catch (error) {
          console.error(
            `Error deleting file with public_id: ${publicId}:`,
            error
          );
          return { publicId, error: error.message || "Deletion failed" };
        }
      })
    );
    console.log("Deleted Result: ", deleteResults);
    const failedDeletes = deleteResults.filter((res) => res.error);
    if (failedDeletes.length > 0) {
      console.log("Failded deletes Response: ", failedDeletes);
      return {
        success: false,
        message: "Some files failed to delete",
        failedDeletes,
      };
    }

    return { success: true, result: deleteResults };
  } catch (error) {
    console.error("Error during Cloudinary deletion process:", error);
    return {
      success: false,
      message: "Error during Cloudinary deletion",
      error: error.message,
    };
  }
};

module.exports = { uploadFileToCloudinary, deleteFileFromCloudinary };
