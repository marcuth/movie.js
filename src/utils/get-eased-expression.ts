export function getEasedExpression(expr: string, easing: "linear" | "easeIn" | "easeOut" | "easeInOut") {
    switch (easing) {
        case "easeIn":
            return `${expr}*${expr}`
        case "easeOut":
            return `1-(1-${expr})*(1-${expr})`
        case "easeInOut":
            return `(1-cos(PI*${expr}))/2`
        default:
            return expr
    }
}