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

    build(data: RenderData, context: RenderContext): void {
        
    }
}
