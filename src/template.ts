import cliProgress from "cli-progress"
import ffmpeg from "fluent-ffmpeg"

import { Clip } from "./clips"
import { RenderContext } from "./render-context"
import { RenderResult } from "./render-result"

export type TemplateOptions<RenderData> = {
    clips: Clip<RenderData>[]
    config: {
        format: string
        fps: number
        outputOptions?: string[]
    }
    debug?: boolean
}

export class Template<RenderData> {
    constructor(private readonly options: TemplateOptions<RenderData>) { }

    async render(data: RenderData) {
        const command = ffmpeg()

        const context: RenderContext = {
            offsetX: 0,
            offsetY: 0,
            command: command,
            fps: this.options.config.fps,
            inputIndex: 0,
            audioIndex: 0,
            filters: [],
            labels: {
                audio: [],
                video: []
            },
        }

        const estimatedTotalDuration = await this.runBuildWithProgress(data, context)

        const stringLabels = context.labels.video
            .map((videoLabel, index) => `${videoLabel}${context.labels.audio[index]}`)
            .join("")

        const concatFilter =
            `${stringLabels}concat=n=${context.labels.video.length}:v=1:a=1[outv][outa]`

        /* 
        console.dir({
            stringLabels,
            concatFilter,
            context: {
                ...context,
                command: "<command>"
            }
        }, {
            depth: null
        })
        */

        const filterComplex = [...context.filters, concatFilter]
        command.complexFilter(filterComplex)

        command.outputOptions([
            "-map [outv]",
            "-map [outa]",
            "-c:v libx264",
            "-c:a aac",
            "-pix_fmt yuv420p",
            ...(this.options.config.outputOptions ?? [])
        ])

        return new RenderResult(this.options.config.format, command)
    }

    private async runBuildWithProgress(data: RenderData, context: RenderContext): Promise<number> {
        const buildBar = new cliProgress.SingleBar({ format: "Build  |{bar}| {value}/{total} clips", hideCursor: true }, cliProgress.Presets.shades_classic)
        buildBar.start(this.options.clips.length, 0)

        for (let i = 0; i < this.options.clips.length; i++) {
            const clip = this.options.clips[i]
            await clip.build(data, context)
            buildBar.increment()
        }

        buildBar.stop()

        const estimatedTotalDuration = this.options.clips.reduce((sum, c: any) => sum + (typeof c.duration === "number" ? c.duration : 0), 0)
        return estimatedTotalDuration
    }
}
