/**
 * Tag Manager Component
 * UI component for managing tags with CRUD operations
 */

const TagManager = {
    tags: [],
    selectedTags: [],

    /**
     * Initialize the tag manager
     */
    async init() {
        await this.loadTags();
    },

    /**
     * Load all tags from the API
     */
    async loadTags() {
        try {
            this.tags = await TagsAPI.getAll();
        } catch (error) {
            console.error('Error loading tags:', error);
            this.tags = [];
        }
    },

    /**
     * Render tag pills for tool cards
     * @param {Array} tags - Array of tag objects
     * @returns {HTMLElement} Container with tag pills
     */
    renderTagPills(tags) {
        const container = _DOM.createElement('div', 'tool-tags d-flex flex-wrap gap-1');
        
        if (tags && tags.length > 0) {
            tags.forEach(tag => {
                const pill = _DOM.createElement('span', 'tag-pill', {
                    textContent: tag.nombre,
                    style: `background-color: ${tag.color || '#6c757d'}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 0.75rem;`
                });
                container.appendChild(pill);
            });
        }
        
        return container;
    },

    /**
     * Render tag selection for modal form
     * @param {Array} selectedIds - Array of selected tag IDs
     */
    renderTagSelect(selectedIds = []) {
        const container = _DOM.$('#tag-select-container');
        if (!container) return;

        _DOM.clearElement(container);

        if (this.tags.length === 0) {
            container.innerHTML = '<p class="text-muted small mb-0">No hay tags disponibles</p>';
            return;
        }

        this.tags.forEach(tag => {
            const wrapper = _DOM.createElement('div', 'form-check form-check-inline');
            
            const checkbox = _DOM.createElement('input', 'form-check-input tag-checkbox', {
                type: 'checkbox',
                id: `tag-${tag.id}`,
                value: tag.id
            });
            
            if (selectedIds.includes(tag.id)) {
                checkbox.checked = true;
            }

            const label = _DOM.createElement('label', 'form-check-label', {
                for: `tag-${tag.id}`,
                textContent: tag.nombre,
                style: `cursor: pointer; color: ${tag.color}; font-weight: 500;`
            });

            wrapper.appendChild(checkbox);
            wrapper.appendChild(label);
            container.appendChild(wrapper);
        });
    },

    /**
     * Get selected tag IDs from the form
     * @returns {Array<number>} Array of selected tag IDs
     */
    getSelectedTags() {
        const checkboxes = _DOM.$$('.tag-checkbox:checked');
        return Array.from(checkboxes).map(cb => parseInt(cb.value, 10));
    },

    /**
     * Open the tag management modal
     */
    async openTagModal() {
        await this.loadTags();
        this.renderTagList();
        
        const modalEl = _DOM.$('#tag-management-modal');
        if (modalEl && bootstrap.Modal) {
            const modal = new bootstrap.Modal(modalEl);
            modal.show();
        }
    },

    /**
     * Render the list of tags in the management modal
     */
    renderTagList() {
        const listContainer = _DOM.$('#tag-list');
        if (!listContainer) return;

        _DOM.clearElement(listContainer);

        if (this.tags.length === 0) {
            listContainer.innerHTML = '<p class="text-muted text-center py-3">No hay tags todavía</p>';
            return;
        }

        this.tags.forEach(tag => {
            const item = _DOM.createElement('div', 'tag-list-item d-flex justify-content-between align-items-center py-2 border-bottom');
            
            const info = _DOM.createElement('div', 'd-flex align-items-center gap-2');
            
            const colorDot = _DOM.createElement('span', '', {
                style: `width: 12px; height: 12px; background-color: ${tag.color}; border-radius: 50%; display: inline-block;`
            });
            
            const name = _DOM.createElement('span', '', {
                textContent: tag.nombre
            });
            
            info.appendChild(colorDot);
            info.appendChild(name);
            
            const actions = _DOM.createElement('div', '');
            
            const editBtn = _DOM.createElement('button', 'btn btn-sm btn-outline-secondary me-1', {
                textContent: 'Editar',
                onclick: () => this.openEditTagModal(tag)
            });
            
            const deleteBtn = _DOM.createElement('button', 'btn btn-sm btn-outline-danger', {
                textContent: 'Eliminar',
                onclick: () => this.confirmDeleteTag(tag)
            });
            
            actions.appendChild(editBtn);
            actions.appendChild(deleteBtn);
            
            item.appendChild(info);
            item.appendChild(actions);
            
            listContainer.appendChild(item);
        });
    },

    /**
     * Open modal to create a new tag
     */
    openCreateTagModal() {
        const nameInput = _DOM.$('#tag-name-input');
        const colorInput = _DOM.$('#tag-color-input');
        const modalTitle = _DOM.$('#tag-modal-title');
        
        if (nameInput) nameInput.value = '';
        if (colorInput) colorInput.value = '#6c757d';
        if (modalTitle) modalTitle.textContent = 'Nuevo Tag';
        
        // Store current editing tag ID
        const saveBtn = _DOM.$('#btn-save-tag');
        if (saveBtn) {
            saveBtn.dataset.mode = 'create';
        }
        
        const modalEl = _DOM.$('#tag-form-modal');
        if (modalEl && bootstrap.Modal) {
            const modal = new bootstrap.Modal(modalEl);
            modal.show();
        }
    },

    /**
     * Open modal to edit an existing tag
     * @param {Object} tag - Tag object to edit
     */
    openEditTagModal(tag) {
        const nameInput = _DOM.$('#tag-name-input');
        const colorInput = _DOM.$('#tag-color-input');
        const modalTitle = _DOM.$('#tag-modal-title');
        
        if (nameInput) nameInput.value = tag.nombre;
        if (colorInput) colorInput.value = tag.color || '#6c757d';
        if (modalTitle) modalTitle.textContent = 'Editar Tag';
        
        // Store current editing tag ID
        const saveBtn = _DOM.$('#btn-save-tag');
        if (saveBtn) {
            saveBtn.dataset.mode = 'edit';
            saveBtn.dataset.tagId = tag.id;
        }
        
        const modalEl = _DOM.$('#tag-form-modal');
        if (modalEl && bootstrap.Modal) {
            const modal = new bootstrap.Modal(modalEl);
            modal.show();
        }
    },

    /**
     * Save a tag (create or update)
     */
    async saveTag() {
        const nameInput = _DOM.$('#tag-name-input');
        const colorInput = _DOM.$('#tag-color-input');
        const saveBtn = _DOM.$('#btn-save-tag');
        
        if (!nameInput || !colorInput || !saveBtn) return;
        
        const nombre = nameInput.value.trim();
        const color = colorInput.value.trim() || '#6c757d';
        
        if (!nombre) {
            Toast.error('El nombre del tag es obligatorio');
            return;
        }
        
        const mode = saveBtn.dataset.mode;
        const tagId = saveBtn.dataset.tagId;
        
        try {
            if (mode === 'edit' && tagId) {
                await TagsAPI.update(parseInt(tagId, 10), { nombre, color });
                Toast.success('Tag actualizado correctamente');
            } else {
                await TagsAPI.create({ nombre, color });
                Toast.success('Tag creado correctamente');
            }
            
            // Close modal
            const modalEl = _DOM.$('#tag-form-modal');
            if (modalEl && bootstrap.Modal) {
                const modal = bootstrap.Modal.getInstance(modalEl);
                if (modal) modal.hide();
            }
            
            // Reload tags
            await this.loadTags();
            this.renderTagList();
            
        } catch (error) {
            Toast.error(error.message || 'Error al guardar el tag');
        }
    },

    /**
     * Confirm and delete a tag
     * @param {Object} tag - Tag object to delete
     */
    confirmDeleteTag(tag) {
        if (confirm(`¿Estás seguro de que deseas eliminar el tag "${tag.nombre}"?\n\nEsta acción también eliminará las relaciones con las herramientas.`)) {
            this.deleteTag(tag.id);
        }
    },

    /**
     * Delete a tag
     * @param {number} tagId - Tag ID to delete
     */
    async deleteTag(tagId) {
        try {
            await TagsAPI.delete(tagId);
            Toast.success('Tag eliminado correctamente');
            
            // Reload tags
            await this.loadTags();
            this.renderTagList();
            
        } catch (error) {
            Toast.error(error.message || 'Error al eliminar el tag');
        }
    },

    /**
     * Setup event listeners for tag management
     */
    setupEventListeners() {
        // Open tag management button
        const manageBtn = _DOM.$('#btn-manage-tags');
        if (manageBtn) {
            manageBtn.addEventListener('click', () => this.openTagModal());
        }

        // Create new tag button
        const createBtn = _DOM.$('#btn-create-tag');
        if (createBtn) {
            createBtn.addEventListener('click', () => this.openCreateTagModal());
        }

        // Save tag button
        const saveBtn = _DOM.$('#btn-save-tag');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveTag());
        }

        // Color picker preview
        const colorInput = _DOM.$('#tag-color-input');
        if (colorInput) {
            colorInput.addEventListener('input', (e) => {
                const preview = _DOM.$('#tag-color-preview');
                if (preview) {
                    preview.style.backgroundColor = e.target.value;
                }
            });
        }
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TagManager;
}