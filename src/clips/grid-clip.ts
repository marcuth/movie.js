import { RenderContext } from "../render-context"
import { Clip } from "./clip"

export type GridClipOptions<RenderData> = {
    clipMatrix: Clip<RenderData>[][]
}

export class GridClip<RenderData> extends Clip<RenderData> {
    readonly clipMatrix: Clip<RenderData>[][]
    readonly rows: number
    readonly cols: number

    constructor({ clipMatrix }: GridClipOptions<RenderData>) {
        super()

        this.clipMatrix = clipMatrix

        if (clipMatrix.length === 0) {
            throw new Error("GridClip: clipMatrix must have at least one row")
        }

        const cols = clipMatrix[0].length

        if (cols === 0) {
            throw new Error("GridClip: clipMatrix rows must have at least one column")
        }

        for (let i = 1; i < clipMatrix.length; i++) {
            if (clipMatrix[i].length !== cols) {
                throw new Error(
                    `GridClip: all rows must have the same number of columns. ` +
                    `Expected ${cols}, got ${clipMatrix[i].length} at row ${i}`
                )
            }
        }

        this.rows = clipMatrix.length
        this.cols = cols
    }

    getFilters(inputIndex: number, data: RenderData, context: RenderContext): string[] {
        const filters: string[] = []

        let currentBase = `[base${inputIndex}]`
        let layerIndex = 0

        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const clip = this.clipMatrix[row][col]

                // cada clip gera seus próprios filtros
                const clipFilters = clip.getFilters(layerIndex, data, context)
                filters.push(...clipFilters)

                const clipStream = `[layer${layerIndex}]`
                const outStream = `[grid${inputIndex}_${layerIndex}]`

                const x = `(${col}*W/${this.cols})`
                const y = `(${row}*H/${this.rows})`

                filters.push(
                    `${currentBase}${clipStream}overlay=${x}:${y}${outStream}`
                )

                currentBase = outStream
                layerIndex++
            }
        }

        return filters
    }
}
