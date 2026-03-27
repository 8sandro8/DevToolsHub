-- DevToolsHub Seed Data
-- Initial categories and sample tools

-- ============================================
-- CATEGORÍAS INICIALES
-- ============================================
INSERT INTO category (nombre, color) VALUES
    ('API Testing', '#10b981'),
    ('Code Editors', '#3b82f6'),
    ('Version Control', '#8b5cf6'),
    ('Documentation', '#f59e0b'),
    ('Testing', '#ef4444'),
    ('Design', '#ec4899'),
    ('Database', '#06b6d4'),
    ('DevOps', '#6366f1');

-- ============================================
-- TAGS INICIALES
-- ============================================
INSERT INTO tag (nombre, color) VALUES
    ('Frontend', '#0d6efd'),
    ('Backend', '#198754'),
    ('Testing', '#6f42c1'),
    ('DevOps', '#fd7e14');

-- ============================================
-- HERRAMIENTAS DE EJEMPLO
-- ============================================
INSERT INTO tool (nombre, descripcion, url, logo_url, rating, es_favorito) VALUES
    ('Postman', 'Platform API para construir y usar APIs', 'https://www.postman.com', 'https://assets.postman.com/common/favicon.ico', 5, 1),
    ('VS Code', 'Editor de código fuente desarrollado por Microsoft', 'https://code.visualstudio.com', 'https://code.visualstudio.com/favicon.ico', 5, 1),
    ('GitHub', 'Plataforma de desarrollo colaborativo', 'https://github.com', 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png', 5, 0),
    ('Insomnia', 'Cliente REST API gráfico', 'https://insomnia.rest', 'https://insomnia.rest/images/insomnia-logo.svg', 4, 0),
    ('Docker', 'Plataforma para desarrollar, enviar y ejecutar aplicaciones', 'https://www.docker.com', 'https://www.docker.com/favicon.ico', 5, 1),
    ('Figma', 'Editor de gráficos vectorial y prototipado', 'https://www.figma.com', 'https://static.figma.com/app/icon/1/favicon.ico', 4, 0);

-- ============================================
-- RELACIONES HERRAMIENTA-CATEGORÍA
-- ============================================
-- Postman -> API Testing
INSERT INTO tool_category (tool_id, category_id) VALUES (1, 1);

-- VS Code -> Code Editors
INSERT INTO tool_category (tool_id, category_id) VALUES (2, 2);

-- GitHub -> Version Control
INSERT INTO tool_category (tool_id, category_id) VALUES (3, 3);

-- Insomnia -> API Testing
INSERT INTO tool_category (tool_id, category_id) VALUES (4, 1);

-- Docker -> DevOps
INSERT INTO tool_category (tool_id, category_id) VALUES (5, 8);

-- Figma -> Design
INSERT INTO tool_category (tool_id, category_id) VALUES (6, 6);

-- ============================================
-- RELACIONES HERRAMIENTA-TAG
-- ============================================
-- Postman -> Backend, Testing
INSERT INTO tool_tag (tool_id, tag_id) VALUES (1, 2);
INSERT INTO tool_tag (tool_id, tag_id) VALUES (1, 3);

-- VS Code -> Frontend, Backend
INSERT INTO tool_tag (tool_id, tag_id) VALUES (2, 1);
INSERT INTO tool_tag (tool_id, tag_id) VALUES (2, 2);

-- GitHub -> DevOps
INSERT INTO tool_tag (tool_id, tag_id) VALUES (3, 4);

-- Docker -> DevOps
INSERT INTO tool_tag (tool_id, tag_id) VALUES (5, 4);
