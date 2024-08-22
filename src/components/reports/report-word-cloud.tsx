import React, { useState, useEffect } from "react"
import { Text } from "@visx/text"
import { scaleLog } from "@visx/scale"
import Wordcloud from "@visx/wordcloud/lib/Wordcloud"

// Simulación de las letras de la canción (puedes reemplazarlo con cualquier texto)
const totoAfricaLyrics =
  "Contact center, buenas tardes. Mi nombre es Alejo. ¿Con quién tengo el gusto? Hola, buenas tardes. Mi nombre es Carolina. Me estoy comunicando de la central de turnos de radioterapia. Un gusto, sí. ¿En qué la puedo ayudar? Sí, creo que hubo un problema cuando se renuevan las contraseñas, porque estoy usando mi contraseña de siempre para lo que es centro médico y para la computadora, y me dice que es incorrecta. ¿Cómo es? Yo la tengo anotada y es esa. Entiendo. Lo que le voy a solicitar es si me puede brindar el número de su máquina. Sí, ya te digo. Espérame. Sí. Perfecto. A ver, aguárdame. En un instante le estará arrojando un mensaje para aceptarme la conexión. No, tengo la computadora bloqueada. Entiendo, igualmente no debería ser un problema para conectar su máquina. ¿Me podría reiterar igualmente su apellido? La oigo entrecortada, disculpa. Te reitero el apellido. Sí. Es H-O-R-I-S-B-E-R-I-S. Perfecto, muchas gracias. Ahí le comento, ya ha procedido a desbloquear su usuario. Igualmente, si le arroja algún mensaje para aceptarme la conexión en la máquina... No me aparece nada, me aparece la computadora bloqueada. Entiendo. Bien, en ese caso, intente reiniciar la máquina; yo la guardo en la línea. Avíseme cuando haya logrado. Sí, estoy reiniciando todo. Perfecto, la guardo igualmente, no hay problema. A ver, ahí ya se reinició. Sigue como bloqueado. Verifique, sí, de desestimar el mensaje e ingresar su contraseña... A ver, creo que inició. Perfecto. Vamos, está iniciando. Ah, inició. Excelente. Bien, corrobore ingresar a Centro Médico. Dale. Sí, más que nada por si estoy usando la misma contraseña. Sí, lo entiendo. Yo la espero. Ahora funciona. Tenía que crear un turno y no me funcionaba para eso. Voy a ver si funciona. Corrobore, yo la guardo. Sí, ahora lo crea con la misma contraseña. Excelente. Listo, entonces ya estaría. Perfecto. ¿Hay algo más en lo que la pueda ayudar? No, ya está. Gracias. Gracias por comunicarse. Le haré una breve encuesta para evaluar mi atención. Le deseo una muy buena tarde. Vale, igualmente. Gracias."

// Interface para los datos de las palabras
export interface WordData {
  text: string
  value: number
}

// Colores para las palabras
const colors = ["#143059", "#2F6B9A", "#82a6c2"]

// Función para calcular la frecuencia de las palabras en un texto
function wordFreq(text: string): WordData[] {
  const words: string[] = text.replace(/\./g, "").split(/\s/)
  const freqMap: Record<string, number> = {}

  for (const w of words) {
    freqMap[w] = (freqMap[w] || 0) + 1
  }
  return Object.keys(freqMap).map(word => ({
    text: word,
    value: freqMap[word],
  }))
}

// Función para determinar el grado de rotación de las palabras
function getRotationDegree() {
  return Math.random() > 0.5 ? 60 : -60
}

// Datos iniciales de las palabras
const initialWords = wordFreq(totoAfricaLyrics)

// Escala logarítmica para el tamaño de la fuente
const fontScale = scaleLog({
  domain: [
    Math.min(...initialWords.map(w => w.value)),
    Math.max(...initialWords.map(w => w.value)),
  ],
  range: [10, 100],
})

// Función para determinar el tamaño de la fuente
const fontSizeSetter = (datum: WordData) => fontScale(datum.value)

// Generador fijo para la disposición de las palabras
const fixedValueGenerator = () => 0.5

type SpiralType = "archimedean" | "rectangular"

interface ExampleProps {
  width: number
  height: number
  showControls?: boolean
}

export default function Example({ width, height, showControls }: ExampleProps) {
  const [spiralType, setSpiralType] = useState<SpiralType>("archimedean")
  const [withRotation, setWithRotation] = useState(false)
  const [words, setWords] = useState<WordData[]>(initialWords)

  useEffect(() => {
    // Aquí podrías actualizar `words` si el texto cambia dinámicamente
    setWords(initialWords)
  }, [initialWords])

  return (
    <div className='wordcloud'>
      <Wordcloud
        words={words}
        width={width}
        height={height}
        fontSize={fontSizeSetter}
        font={"Impact"}
        padding={2}
        spiral={spiralType}
        rotate={withRotation ? getRotationDegree : 0}
        random={fixedValueGenerator}
      >
        {cloudWords =>
          cloudWords.map((w, i) => (
            <Text
              key={w.text}
              fill={colors[i % colors.length]}
              textAnchor={"middle"}
              transform={`translate(${w.x}, ${w.y}) rotate(${w.rotate})`}
              fontSize={w.size}
              fontFamily={w.font}
            >
              {w.text}
            </Text>
          ))
        }
      </Wordcloud>
      {showControls && (
        <div>
          <label>
            Spiral type &nbsp;
            <select
              onChange={e => setSpiralType(e.target.value as SpiralType)}
              value={spiralType}
            >
              <option value={"archimedean"}>archimedean</option>
              <option value={"rectangular"}>rectangular</option>
            </select>
          </label>
          <label>
            With rotation &nbsp;
            <input
              type='checkbox'
              checked={withRotation}
              onChange={() => setWithRotation(!withRotation)}
            />
          </label>
        </div>
      )}
      <style jsx>{`
        .wordcloud {
          display: flex;
          flex-direction: column;
          user-select: none;
        }
        .wordcloud svg {
          margin: 1rem 0;
          cursor: pointer;
        }
        .wordcloud label {
          display: inline-flex;
          align-items: center;
          font-size: 14px;
          margin-right: 8px;
        }
      `}</style>
    </div>
  )
}
