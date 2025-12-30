import ffmpeg from "fluent-ffmpeg"

import {
    AudioClip,
    Clip,
    ImageClip,
    VideoClip,
} from "./clips"
import { TemplateResult } from "./template-result"
import { RenderContext } from "./render-context"

export type TemplateOptions<RenderData> = {
    clips: Clip<RenderData>[]
    format: string
}

export class Template<RenderData> {
    constructor(private readonly options: TemplateOptions<RenderData>) {}

    async render(data: RenderData) {
        const command = ffmpeg()

        let inputIndex = 0
        const filters: string[] = []

        const context: RenderContext = {
            offsetX: 0,
            offsetY: 0,
        }

        // 1️⃣ Registrar inputs (somente clips que realmente possuem mídia)
        for (const clip of this.options.clips) {
            if (
                clip instanceof ImageClip ||
                clip instanceof VideoClip ||
                clip instanceof AudioClip
            ) {
                if (!clip.shouldRender(data, 0)) continue

                const inputs = clip.getInputs(inputIndex)

                for (const input of inputs) {
                    command.input(input.path)
                }

                inputIndex += inputs.length
            }
        }

        // 2️⃣ Gerar filtros (todos os clips, inclusive estruturais)
        inputIndex = 0

        for (const clip of this.options.clips) {
            if (!clip.shouldRender(data, 0)) continue

            const clipFilters = clip.getFilters(
                inputIndex,
                data,
                context
            )

            filters.push(...clipFilters)

            if (
                clip instanceof ImageClip ||
                clip instanceof VideoClip ||
                clip instanceof AudioClip
            ) {
                const inputs = clip.getInputs(inputIndex)
                inputIndex += inputs.length
            }
        }

        if (filters.length > 0) {
            command.complexFilter(filters)
        }

        return new TemplateResult(this.options.format, command)
    }
}
