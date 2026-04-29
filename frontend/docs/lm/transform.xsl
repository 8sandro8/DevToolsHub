<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" indent="yes" encoding="UTF-8"/>
  
  <xsl:template match="/">
    <html>
      <head>
        <meta charset="UTF-8"/>
        <title>Catálogo de Herramientas - Transformación XSLT</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
          h1 { color: #333; border-bottom: 2px solid #4CAF50; padding-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; background: white; }
          th { background: #4CAF50; color: white; padding: 12px; text-align: left; }
          td { padding: 10px; border-bottom: 1px solid #ddd; }
          tr:hover { background: #f9f9f9; }
          .categoria { color: #666; font-style: italic; }
          .tags { color: #2196F3; font-size: 0.9em; }
        </style>
      </head>
      <body>
        <h1>Catálogo de Herramientas de Desarrollo</h1>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Tags</th>
              <th>Descripción</th>
            </tr>
          </thead>
          <tbody>
            <xsl:for-each select="herramientas/herramienta">
              <tr>
                <td><xsl:value-of select="@id"/></td>
                <td><strong><xsl:value-of select="nombre"/></strong></td>
                <td class="categoria"><xsl:value-of select="categoria"/></td>
                <td class="tags"><xsl:value-of select="tags"/></td>
                <td><xsl:value-of select="descripcion"/></td>
              </tr>
            </xsl:for-each>
          </tbody>
        </table>
        <p style="margin-top: 20px; color: #888;">
          Total de herramientas: <xsl:value-of select="count(herramientas/herramienta)"/>
        </p>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>