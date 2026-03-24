/**
 * GitHub Controller
 * HTTP request handlers for GitHub API integration
 */

const ToolService = require('../services/tool.service');

class GitHubController {
    constructor(db) {
        this.toolService = new ToolService(db);
        this.githubToken = process.env.GITHUB_TOKEN || null;
    }

    /**
     * Extraer owner y repo de una URL de GitHub
     * @param {string} url - URL del repositorio
     * @returns {Object|null} - { owner, repo } o null si no es URL válida
     */
    extractOwnerRepo(url) {
        try {
            // Manejar URLs de GitHub (https://github.com/owner/repo, github.com/owner/repo)
            const githubPatterns = [
                /^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)/,
                /^github\.com\/([^\/]+)\/([^\/]+)/
            ];

            for (const pattern of githubPatterns) {
                const match = url.match(pattern);
                if (match) {
                    // Limpiar el repo de .git u otros sufijos
                    const repo = match[2].replace(/\.git$/, '').replace(/\/$/, '');
                    return { owner: match[1], repo };
                }
            }
            return null;
        } catch (error) {
            return null;
        }
    }

    /**
     * Formatear número de estrellas/forks (1.2k, 10k, etc.)
     * @param {number} num - Número a formatear
     * @returns {string} - Número formateado
     */
    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
        }
        return num.toString();
    }

    /**
     * Obtener stats de GitHub para una herramienta
     */
    getGitHubStats = async (req, res, next) => {
        try {
            const { id } = req.params;

            // Obtener la herramienta de la DB
            const tool = this.toolService.getById(id);
            if (!tool) {
                return res.status(404).json({
                    error: 'Herramienta no encontrada'
                });
            }

            // Verificar que tiene URL
            if (!tool.url) {
                return res.status(404).json({
                    error: 'La herramienta no tiene URL de GitHub'
                });
            }

            // Extraer owner y repo
            const ownerRepo = this.extractOwnerRepo(tool.url);
            if (!ownerRepo) {
                return res.status(404).json({
                    error: 'La URL no es un repositorio de GitHub válido'
                });
            }

            const { owner, repo } = ownerRepo;
            const apiUrl = `https://api.github.com/repos/${owner}/${repo}`;

            // Preparar headers
            const headers = {
                'User-Agent': 'DevToolsHub',
                'Accept': 'application/vnd.github.v3+json'
            };

            // Añadir token si existe para aumentar rate limit
            if (this.githubToken) {
                headers['Authorization'] = `Bearer ${this.githubToken}`;
            }

            // Llamar a GitHub API
            const response = await fetch(apiUrl, { headers });

            if (!response.ok) {
                if (response.status === 404) {
                    return res.status(404).json({
                        error: 'Repositorio de GitHub no encontrado'
                    });
                }
                // Rate limit u otro error de GitHub
                return res.status(502).json({
                    error: 'Error al conectar con GitHub API'
                });
            }

            const data = await response.json();

            // Devolver stats formateados
            res.json({
                stars: data.stargazers_count,
                starsFormatted: this.formatNumber(data.stargazers_count),
                forks: data.forks_count,
                forksFormatted: this.formatNumber(data.forks_count),
                lastCommit: data.pushed_at,
                repoName: data.full_name,
                description: data.description,
                url: data.html_url
            });

        } catch (error) {
            console.error('[GitHub Controller Error]:', error.message);
            next(error);
        }
    }
}

module.exports = GitHubController;
