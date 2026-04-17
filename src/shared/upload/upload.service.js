const cloudinary = require("./cloudinary");
const { Readable } = require("stream");

/**
 * Upload a file buffer to Cloudinary.
 * @param {Buffer} buffer - File buffer from multer memoryStorage
 * @param {object} options
 * @param {string} options.folder - Cloudinary folder (e.g. "students/photos")
 * @param {string} [options.publicId] - Optional stable public_id (e.g. student mongo _id)
 * @param {string} [options.resourceType] - "image" | "raw" (use "raw" for PDFs)
 * @returns {Promise<{ url: string, publicId: string }>}
 */
exports.uploadFile = ({ buffer, mimetype }, { folder, publicId, resourceType } = {}) => {
  const type = resourceType || (mimetype === "application/pdf" ? "raw" : "image");

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
        resource_type: type,
        overwrite: true,
      },
      (error, result) => {
        if (error) return reject(Object.assign(new Error(error.message), { status: 502 }));
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    Readable.from(buffer).pipe(stream);
  });
};

/**
 * Delete a file from Cloudinary by its public_id.
 * @param {string} publicId
 * @param {string} [resourceType] - "image" | "raw"
 */
exports.deleteFile = async (publicId, resourceType = "image") => {
  if (!publicId) return;
  await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
};
