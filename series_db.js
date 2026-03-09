// Base de datos de rangos de números de serie inhabilitados para Serie B (Bolivia)
// Datos extraídos de las tablas oficiales del Banco Central de Bolivia

const DISABLED_RANGES = {
    "10": [
        [77100001, 77550000], [78000001, 78450000], [78900001, 96350000],
        [96350001, 96800000], [96800001, 97250000], [98150001, 98600000],
        [104900001, 105350000], [105350001, 105800000], [106700001, 107150000],
        [107600001, 108050000], [108050001, 108500000], [109400001, 109850000]
    ],
    "20": [
        [87280145, 91646549], [96650001, 97100000], [99800001, 100250000],
        [100250001, 100700000], [109250001, 109700000], [110600001, 111050000],
        [111050001, 111500000], [111950001, 112400000], [112400001, 112850000],
        [112850001, 113300000], [114200001, 114650000], [114650001, 115100000],
        [115100001, 115550000], [118700001, 119150000], [119150001, 119600000],
        [120500001, 120950000]
    ],
    "50": [
        [67250001, 67700000], [69050001, 69500000], [69500001, 69950000],
        [69950001, 70400000], [70400001, 70850000], [70850001, 71300000],
        [76310012, 85139995], [86400001, 86850000], [90900001, 91350000],
        [91800001, 92250000]
    ]
};

/**
 * Valida un billete basado en serie, denominación y número.
 * @param {string} serieChar - Letra de la serie (A, B, C...)
 * @param {string} denomValue - Valor en Bs (10, 20, 50, 100, 200)
 * @param {string} serialNum - El número secuencial (solo números)
 * @returns {object} - { status: "VÁLIDO" | "INHABILITADO", reason: string, color: string }
 */
function validateBolivianBill(serieChar, denomValue, serialNum) {
    const serie = (serieChar || "").toUpperCase();
    const denom = String(denomValue);
    const num = parseInt(serialNum, 10);

    // Series A y C son siempre válidas
    if (serie === 'A' || serie === 'C') {
        return { 
            status: "VÁLIDO", 
            reason: `Serie ${serie} legítima.`, 
            color: "var(--primary)" 
        };
    }

    // Serie B tiene validación por rango en 10, 20 y 50
    if (serie === 'B') {
        if (denom === "Desconocido") {
            // Si la IA no pudo leer la denominación (por colores o calidad),
            // revisamos TODOS los rangos para mayor seguridad.
            let foundDenom = null;
            for (const d in DISABLED_RANGES) {
                const ranges = DISABLED_RANGES[d];
                const isDisabled = ranges.some(range => num >= range[0] && num <= range[1]);
                if (isDisabled) {
                    foundDenom = d;
                    break;
                }
            }
            if (foundDenom) {
                return { 
                    status: "INHABILITADO", 
                    reason: `Número ${num} inhabilitado (Robo comprobado de ${foundDenom} Bs).`, 
                    color: "var(--error)" 
                };
            }
        } else if (DISABLED_RANGES[denom]) {
            const ranges = DISABLED_RANGES[denom];
            const isDisabled = ranges.some(range => num >= range[0] && num <= range[1]);
            
            if (isDisabled) {
                return { 
                    status: "INHABILITADO", 
                    reason: `Número ${num} en rango de rechazo serie B.`, 
                    color: "var(--error)" 
                };
            }
        }
        return { 
            status: "VÁLIDO", 
            reason: `Serie ${serie} verificada.`, 
            color: "var(--primary)" 
        };
    }

    // Default para otras series o fallos
    return { 
        status: "INHABILITADO", 
        reason: "Serie o formato no reconocido.", 
        color: "var(--error)" 
    };
}
