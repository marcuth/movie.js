export function easingExpr(
    easing: "linear" | "easeIn" | "easeOut" | "easeInOut",
    t: string
) {
    switch (easing) {
        case "linear":
            return `(${t})`  // Adicionar parênteses para garantir que a expressão seja avaliada
        case "easeIn":
            return `pow(${t},2)`
        case "easeOut":
            return `1-pow(1-(${t}),2)`  // Adicionar parênteses extras
        case "easeInOut":
            return `if(lt(${t},0.5),2*pow(${t},2),1-2*pow(1-(${t}),2))`  // Adicionar parênteses extras
        default:
            return `(${t})`
    }
}