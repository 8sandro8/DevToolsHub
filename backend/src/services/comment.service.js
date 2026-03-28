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
}

module.exports = CommentService;
