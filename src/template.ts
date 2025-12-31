import cliProgress from "cli-progress"
import ffmpeg from "fluent-ffmpeg"

import { AudioClip, Clip, ImageClip, RepeatClip, VideoClip } from "./clips"
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
            filters: [],
            labels: []
        }

        const progressBar = new cliProgress.SingleBar(
            {
                format: "Rendering |{bar}| {percentage}% | {value}/{total}",
                barCompleteChar: "█",
                barIncompleteChar: "░",
                hideCursor: true,
            },
            cliProgress.Presets.shades_classic
        )

        let progressStarted = false

        for (const clip of this.options.clips) {
            clip.build(data, context)
        }

        const stringLabels = context.labels.join("")

        const concatFilter =
            `${stringLabels}concat=n=${context.labels.length}:v=1:a=0[outv]`

        const filterComplex = [...context.filters, concatFilter]
        command.complexFilter(filterComplex)

        command.outputOptions([
            "-map [outv]",
            "-c:v libx264",
            "-pix_fmt yuv420p",
            ...(this.options.config.outputOptions ?? [])
        ])

        if (this.options.debug) {
            command
                .on("start", cmd => console.log("FFmpeg:", cmd))
                .on("error", err => console.error("FFmpeg error:", err))
        }

        command
            .on("progress", progress => {
                if (progress.percent != null) {
                    if (!progressStarted) {
                        progressBar.start(100, 0)
                        progressStarted = true
                    }

                    progressBar.update(Math.min(progress.percent, 100))
                }
            })
            .on("end", () => {
                if (progressStarted) {
                    progressBar.update(100)
                    progressBar.stop()
                }
            })

        return new RenderResult(this.options.config.format, command)
    }

}
