import { Axis, resolveAxis } from "../utils/resolve-axis"
import { Clip } from "./clip"

export type RectangleClipOptions<RenderData> = {
    fill: string
    x: Axis<RenderData>
    y: Axis<RenderData>
    width: number
    height: number
}

export class RectangleClip<RenderData> extends Clip<RenderData> {
    readonly fill: string
    readonly x: Axis<RenderData>
    readonly y: Axis<RenderData>
    readonly width: number
    readonly height: number

    constructor({ fill, x, y, width, height }: RectangleClipOptions<RenderData>) {
        super()

        this.fill = fill
        this.x = x
        this.y = y
        this.width = width
        this.height = height
    }

    getInputs(inputIndex: number) {
        return [
            {
                type: "lavfi",
                alias: `[r${inputIndex}:v]`,
                source: `color=c=${this.fill}:s=${this.width}x${this.height}`
            }
        ]
    }

    getFilters(inputIndex: number, data: RenderData): string[] {
        const filters: string[] = []

        const rectStream = `[r${inputIndex}:v]`
        const rectOut = `[rect${inputIndex}]`
        const baseStream = `[base${inputIndex}]`
        const outStream = `[layer${inputIndex}]`

        filters.push(
            `${rectStream}null${rectOut}`
        )

        const x = resolveAxis({ axis: this.x, data, index: inputIndex })
        const y = resolveAxis({ axis: this.y, data, index: inputIndex })

        filters.push(
            `${baseStream}${rectOut}overlay=${x}:${y}${outStream}`
        )

        return filters
    }
}
