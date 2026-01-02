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
            command: command,
            fps: this.options.config.fps,
            inputIndex: 0,
            clipIndex: 0,
            filters: [],
            labels: {
                structuralAudio: [],
                mixAudio: [],
                video: []
            },
        }

        // if (this.options.debug) {
        //     command
        //         .on("start", (commandLine) => {
        //             console.log("Spawned Ffmpeg with command: " + commandLine)
        //         })
        //         .on("error", (err, stdout, stderr) => {
        //             console.error("Error: " + err.message)
        //             console.error("ffmpeg stderr: " + stderr)
        //         })
        // }

        await this.runBuildWithProgress(data, context)

        const concatFilter =
            context.labels.video
                .map((v, i) => `${v}${context.labels.structuralAudio[i]}`)
                .join("") +
            `concat=n=${context.labels.video.length}:v=1:a=1[outv][basea]`

        const mixFilter =
            context.labels.mixAudio.length > 0
                ? `${context.labels.mixAudio.join("")}amix=inputs=${context.labels.mixAudio.length}[mixa]`
                : null

        const finalAudioFilter =
            mixFilter
                ? `[basea][mixa]amix=inputs=2[outa]`
                : `[basea]anull[outa]`

        const filterComplex = [
            ...context.filters,
            concatFilter,
            mixFilter,
            finalAudioFilter
        ].filter((filter) => filter !== null)

        // console.dir({
        //     concatFilter,
        //     finalAudioFilter,
        //     mixFilter,
        //     filterComplex,
        //     context: {
        //         ...context,
        //         command: "<command>"
        //     }
        // }, {
        //     depth: null
        // })

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

    private async runBuildWithProgress(data: RenderData, context: RenderContext) {
        const buildBar = new cliProgress.SingleBar({ format: "Template Build  |{bar}| {value}/{total} clips", hideCursor: true }, cliProgress.Presets.shades_classic)
        buildBar.start(this.options.clips.length, 0)

        for (let i = 0; i < this.options.clips.length; i++) {
            const clip = this.options.clips[i]
            await clip.build(data, context)
            buildBar.increment()
        }

        buildBar.stop()
    }
}
