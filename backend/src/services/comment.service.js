/**
 * Comment Service
 * Business logic for comments/opinions on tools
 */

const ToolRepository = require('../repositories/tool.repository');
const CommentRepository = require('../repositories/comment.repository');

class CommentService {
    constructor(db) {
        this.toolRepository = new ToolRepository(db);
        this.commentRepository = new CommentRepository(db);
    }

    getByToolId(toolId) {
        const tool = this.toolRepository.findById(toolId);
        if (!tool) return null;

        return this.commentRepository.findByToolId(toolId);
    }

    getCommentById(toolId, commentId) {
        const tool = this.toolRepository.findById(toolId);
        if (!tool) return null;

        return this.commentRepository.findByIdAndToolId(commentId, toolId);
    }

    create(toolId, data, user) {
        const tool = this.toolRepository.findById(toolId);
        if (!tool) return null;

        const contenido = typeof data.contenido === 'string' ? data.contenido.trim() : '';
        if (!contenido) {
            const error = new Error('El comentario es obligatorio');
            error.statusCode = 400;
            throw error;
        }

        const autor = user?.username || 'Usuario';
        return this.commentRepository.create(toolId, autor, contenido);
    }

    update(toolId, commentId, data, user) {
        const tool = this.toolRepository.findById(toolId);
        if (!tool) return null;

        const comment = this.commentRepository.findByIdAndToolId(commentId, toolId);
        if (!comment) return null;

        const username = user?.username;
        if (!username || comment.autor !== username) {
            const error = new Error('No puedes editar este comentario');
            error.statusCode = 403;
            throw error;
        }

        const contenido = typeof data.contenido === 'string' ? data.contenido.trim() : '';
        if (!contenido) {
            const error = new Error('El comentario es obligatorio');
            error.statusCode = 400;
            throw error;
        }

        return this.commentRepository.updateByIdAndToolId(commentId, toolId, contenido);
    }

    delete(toolId, commentId, user) {
        const tool = this.toolRepository.findById(toolId);
        if (!tool) return null;

        const comment = this.commentRepository.findByIdAndToolId(commentId, toolId);
        if (!comment) return null;

        const username = user?.username;
        if (!username || comment.autor !== username) {
            const error = new Error('No puedes eliminar este comentario');
            error.statusCode = 403;
            throw error;
        }

        return this.commentRepository.deleteByIdAndToolId(commentId, toolId);
    }
}

module.exports = CommentService;
