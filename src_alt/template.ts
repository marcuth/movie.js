import ffmpeg from "fluent-ffmpeg"

import { AudioClip, Clip, ImageClip, TextClip, VideoClip } from "./clips"
import { TemplateResult } from "./template-result"

export type TemplateOptions = {
    clips: Clip[]
    format: string
}

export class Template<RenderData> {
    constructor(private readonly options: TemplateOptions) {}

    async render(data: RenderData) {
        const command = ffmpeg()

        return new TemplateResult(this.options.format, command)
    }
}