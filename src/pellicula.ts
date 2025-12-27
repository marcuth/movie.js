import { Clip } from "./clips/clip"
import { render } from "./render"

export class Pellicula {
    constructor(public clips: Clip<Record<string, any>>[] = []) {}

    add<T extends Clip<Record<string, any>>>(clip: T) {
        this.clips.push(clip)
        return this
    }

    async render(output: string) {
        return await render(this, output)
    }
}