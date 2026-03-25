/**
 * Upload Controller
 * HTTP request handlers for image uploads
 */

const ToolService = require('../services/tool.service');
const path = require('path');
const fs = require('fs');
const { UPLOADS_DIR } = require('../config/paths');

class UploadController {
    constructor(db) {
        this.service = new ToolService(db);
        this.uploadsDir = UPLOADS_DIR;
    }

    // POST /api/tools/:id/image - Upload image
    uploadImage = (req, res, next) => {
        try {
            const toolId = req.params.id;
            
            // Check if file was uploaded
            if (!req.file) {
                return res.status(400).json({ error: 'No se ha proporcionado ninguna imagen' });
            }

            // Build the image URL path
            const imageUrl = `/uploads/${req.file.filename}`;

            // Update the tool with the image URL
            const tool = this.service.updateImageUrl(toolId, imageUrl);
            
            if (!tool) {
                // Clean up uploaded file if tool not found
                fs.unlinkSync(req.file.path);
                return res.status(404).json({ error: 'Herramienta no encontrada' });
            }

            res.status(200).json({
                message: 'Imagen subida correctamente',
                image_url: imageUrl,
                tool
            });
        } catch (error) {
            // Clean up uploaded file on error
            if (req.file && req.file.path) {
                try {
                    fs.unlinkSync(req.file.path);
                } catch (cleanupError) {
                    console.error('Error cleaning up uploaded file:', cleanupError);
                }
            }
            next(error);
        }
    }

    // DELETE /api/tools/:id/image - Delete image
    deleteImage = (req, res, next) => {
        try {
            const toolId = req.params.id;
            
            // Get current tool to find the image path
            const tool = this.service.getById(toolId);
            
            if (!tool) {
                return res.status(404).json({ error: 'Herramienta no encontrada' });
            }

            // If tool has an image, delete the file
            if (tool.image_url) {
                const imagePath = path.join(this.uploadsDir, path.basename(tool.image_url));
                
                // Check if file exists and delete it
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }
            }

            // Update the tool to remove image_url
            const updatedTool = this.service.updateImageUrl(toolId, null);
            
            if (!updatedTool) {
                return res.status(404).json({ error: 'Herramienta no encontrada' });
            }

            res.status(200).json({
                message: 'Imagen eliminada correctamente',
                tool: updatedTool
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = UploadController;
