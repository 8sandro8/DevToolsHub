/**
 * Validation Module
 * Reusable validation functions with Bootstrap 5 inline error display
 */

const _VALIDATION = {
    /**
     * Show inline error below an input field
     * @param {HTMLElement} input - The input element
     * @param {string} message - Error message to display
     */
    showError(input, message) {
        if (!input) return;
        
        // Add invalid class to input
        input.classList.add('is-invalid');
        input.classList.remove('is-valid');
        
        // Find or create the invalid-feedback element
        let feedbackEl = input.nextElementSibling;
        if (!feedbackEl || !feedbackEl.classList.contains('invalid-feedback')) {
            // Create the feedback element if it doesn't exist
            feedbackEl = document.createElement('div');
            feedbackEl.className = 'invalid-feedback';
            input.parentNode.insertBefore(feedbackEl, input.nextSibling);
        }
        
        // Set the error message
        feedbackEl.textContent = message;
        feedbackEl.style.display = 'block';
    },
    
    /**
     * Clear error from an input field
     * @param {HTMLElement} input - The input element
     * @param {boolean} showValid - Whether to show valid state (optional)
     */
    clearError(input, showValid = false) {
        if (!input) return;
        
        input.classList.remove('is-invalid');
        
        if (showValid) {
            input.classList.add('is-valid');
        } else {
            input.classList.remove('is-valid');
        }
        
        // Find and clear the invalid-feedback element
        const feedbackEl = input.nextElementSibling;
        if (feedbackEl && feedbackEl.classList.contains('invalid-feedback')) {
            feedbackEl.textContent = '';
            feedbackEl.style.display = 'none';
        }
    },
    
    /**
     * Clear all errors in a form
     * @param {HTMLFormElement} form - The form element
     */
    clearFormErrors(form) {
        if (!form) return;
        
        const inputs = form.querySelectorAll('.is-invalid');
        inputs.forEach(input => this.clearError(input));
    },
    
    /**
     * Validate that a field is not empty
     * @param {HTMLElement} input - The input element
     * @param {string} label - Field label for error message
     * @returns {boolean} True if valid
     */
    required(input, label) {
        const value = input.value.trim();
        if (!value) {
            this.showError(input, `${label} es obligatorio`);
            return false;
        }
        this.clearError(input, true);
        return true;
    },
    
    /**
     * Validate minimum length
     * @param {HTMLElement} input - The input element
     * @param {number} min - Minimum length
     * @param {string} label - Field label for error message
     * @returns {boolean} True if valid
     */
    minLength(input, min, label) {
        const value = input.value.trim();
        if (value && value.length < min) {
            this.showError(input, `${label} debe tener al menos ${min} caracteres`);
            return false;
        }
        this.clearError(input, true);
        return true;
    },
    
    /**
     * Validate maximum length
     * @param {HTMLElement} input - The input element
     * @param {number} max - Maximum length
     * @param {string} label - Field label for error message
     * @returns {boolean} True if valid
     */
    maxLength(input, max, label) {
        const value = input.value.trim();
        if (value && value.length > max) {
            this.showError(input, `${label} no puede superar los ${max} caracteres`);
            return false;
        }
        this.clearError(input, true);
        return true;
    },
    
    /**
     * Validate URL format (optional - can be empty but must be valid if filled)
     * @param {HTMLElement} input - The input element
     * @param {string} label - Field label for error message
     * @returns {boolean} True if valid
     */
    optionalUrl(input, label) {
        const value = input.value.trim();
        
        // Allow empty values (optional field)
        if (!value) {
            this.clearError(input, false);
            return true;
        }
        
        // Validate URL format
        try {
            // Add protocol if missing for validation
            const urlToCheck = value.match(/^https?:\/\//) ? value : 'https://' + value;
            new URL(urlToCheck);
            this.clearError(input, true);
            return true;
        } catch (e) {
            this.showError(input, `${label} debe ser una dirección válida (ej: https://ejemplo.com)`);
            return false;
        }
    },
    
    /**
     * Validate that two fields match
     * @param {HTMLElement} input - The input element
     * @param {HTMLElement} otherInput - The other input to compare
     * @param {string} label - Field label for error message
     * @returns {boolean} True if valid
     */
    matches(input, otherInput, label) {
        if (!otherInput) {
            return true;
        }
        
        const value = input.value;
        const otherValue = otherInput.value;
        
        if (value !== otherValue) {
            this.showError(input, `${label} no coinciden`);
            return false;
        }
        this.clearError(input, true);
        return true;
    },
    
    /**
     * Validate that a select has a value selected
     * @param {HTMLElement} select - The select element
     * @param {string} label - Field label for error message
     * @returns {boolean} True if valid
     */
    requiredSelect(select, label) {
        const value = select.value;
        if (!value) {
            this.showError(select, `Debes seleccionar una ${label.toLowerCase()}`);
            return false;
        }
        this.clearError(select, true);
        return true;
    },
    
    /**
     * Validate textarea/description is not empty
     * @param {HTMLElement} input - The textarea element
     * @param {string} label - Field label for error message
     * @returns {boolean} True if valid
     */
    requiredTextarea(input, label) {
        const value = input.value.trim();
        if (!value) {
            this.showError(input, `${label} es obligatoria`);
            return false;
        }
        this.clearError(input, true);
        return true;
    },
    
    /**
     * Setup auto-clear on input event to remove errors when user starts typing
     * @param {HTMLElement} input - The input element
     */
    setupAutoClear(input) {
        if (!input) return;
        
        input.addEventListener('input', () => {
            this.clearError(input);
        });
    },
    
    /**
     * Validate entire form and return result
     * @param {Array} validations - Array of validation results
     * @returns {boolean} True if all validations pass
     */
    validateAll(validations) {
        return validations.every(v => v === true);
    }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = _VALIDATION;
}
