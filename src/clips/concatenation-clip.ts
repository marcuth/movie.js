import { RenderContext } from "../render-context"
import { Clip } from "./clip"

export type ConcatenationClipOptions<RenderData> = {
    clips: Clip<RenderData>[]
}

export class ConcatenationClip<RenderData> extends Clip<RenderData> {
    readonly clips: Clip<RenderData>[]

    constructor({ clips }: ConcatenationClipOptions<RenderData>) {
        super()

        if (clips.length < 2) {
            throw new Error("ConcatenationClip: at least two clips are required")
        }

        this.clips = clips
    }

    async build(data: RenderData, context: RenderContext): Promise<void> {
        const startVideoIndex = context.labels.video.length
        const startAudioIndex = context.labels.structuralAudio.length

        for (const clip of this.clips) {
            await clip.build(data, context)
        }

        const videoLabels = context.labels.video.slice(startVideoIndex)
        const audioLabels = context.labels.structuralAudio.slice(startAudioIndex)

        if (videoLabels.length !== audioLabels.length) {
            throw new Error(
                `ConcatenationClip: video/audio mismatch (${videoLabels.length} videos, ${audioLabels.length} audios)`
            )
        }

        const outV = `[v${context.labels.video.length}]`
        const outA = `[a${context.labels.structuralAudio.length}]`

        context.filters.push({
            filter: "concat",
            options: {
                n: videoLabels.length,
                v: 1,
                a: 1
            },
            inputs: videoLabels.map((v, i) => `${v}${audioLabels[i]}`).join(""),
            outputs: outV + outA
        })

        context.labels.video.splice(startVideoIndex)
        context.labels.structuralAudio.splice(startAudioIndex)

        context.labels.video.push(outV)
        context.labels.structuralAudio.push(outA)
    }
}