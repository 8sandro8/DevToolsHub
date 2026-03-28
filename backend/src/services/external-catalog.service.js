/**
 * External Catalog Service
 * Enriches local tools with data from an external catalog provider.
 */

const WIKIPEDIA_PAGE_ALIASES = {
    'VS Code': 'Visual Studio Code',
    Postman: 'Postman (software)',
    GitHub: 'GitHub'
};

const DEFAULT_TIMEOUT_MS = 2500;

class ExternalCatalogService {
    constructor() {
        this.cache = new Map();
    }

    resolveWikipediaTitle(toolName) {
        const normalized = String(toolName || '').trim();
        if (!normalized) return null;

        return WIKIPEDIA_PAGE_ALIASES[normalized] || normalized;
    }

    async fetchWithTimeout(url, options = {}, timeoutMs = DEFAULT_TIMEOUT_MS) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), timeoutMs);

        try {
            return await fetch(url, {
                ...options,
                signal: controller.signal
            });
        } finally {
            clearTimeout(timeout);
        }
    }

    async fetchWikipediaSummary(toolName) {
        const title = this.resolveWikipediaTitle(toolName);
        if (!title) return null;

        if (this.cache.has(title)) {
            return this.cache.get(title);
        }

        const apiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;

        try {
            const response = await this.fetchWithTimeout(apiUrl, {
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                this.cache.set(title, null);
                return null;
            }

            const data = await response.json();
            const enriched = {
                external_source: 'Wikipedia',
                external_title: data.title || title,
                external_url: data.content_urls?.desktop?.page || data.content_urls?.mobile?.page || null,
                external_summary: data.extract || null,
                external_thumbnail: data.thumbnail?.source || null
            };

            this.cache.set(title, enriched);
            return enriched;
        } catch (error) {
            this.cache.set(title, null);
            return null;
        }
    }

    async enrichTool(tool) {
        if (!tool) return null;

        const external = await this.fetchWikipediaSummary(tool.nombre);
        return external ? { ...tool, ...external } : { ...tool };
    }

    async enrichTools(tools) {
        const list = Array.isArray(tools) ? tools : [];
        return Promise.all(list.map((tool) => this.enrichTool(tool)));
    }
}

module.exports = ExternalCatalogService;
