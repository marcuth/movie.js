import { Clip } from "./clip"

export type RectangleClipOptions = {
    fill: string
    x: number
    y: number
    width: number
    height: number
}

export class RectangleClip extends Clip {
    constructor(options: RectangleClipOptions) {
        super()
    }
}
