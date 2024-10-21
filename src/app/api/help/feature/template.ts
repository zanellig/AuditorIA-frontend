interface FeatureSuggestionData {
  name: string
  email: string
  suggestion: string
  benefit: string
}

export function generateFeatureSuggestionEmailTemplate(
  data: FeatureSuggestionData
): string {
  return `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f0f0f0; padding: 20px; border-radius: 5px;">
          <h1 style="color: #2c3e50; text-align: center;">AuditorIA Feature Suggestion</h1>
        </div>
        
        <div style="margin-top: 20px;">
          <h2 style="color: #2c3e50;">Detalles de la Sugerencia</h2>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 15px;">
            <p><strong>Nombre:</strong> ${data.name}</p>
            <p><strong>Correo:</strong> ${data.email}</p>
          </div>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 15px;">
            <p><strong>Sugerencia:</strong></p>
            <p style="white-space: pre-wrap;">${data.suggestion}</p>
          </div>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 15px;">
            <p><strong>¿En qué beneficiaría a AuditorIA?:</strong></p>
            <p style="white-space: pre-wrap;">${data.benefit}</p>
          </div>
        </div>
        
        <div style="margin-top: 30px; text-align: center; font-size: 0.8em; color: #7f8c8d;">
          <p>Este es un correo automático. Por favor, no responda a este mensaje.</p>
        </div>
      </body>
    </html>
  `
}
