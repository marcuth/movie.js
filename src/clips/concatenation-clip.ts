import { RenderContext } from "../render-context"
import { Clip } from "./clip"

export type ConcatenationClipOptions<RenderData> = {
    clips: Clip<RenderData>[]
}

export class ConcatenationClip<RenderData> extends Clip<RenderData> {
    readonly clips: Clip<RenderData>[]

    constructor({ clips }: ConcatenationClipOptions<RenderData>) {
        super()

        if (clips.length < 1) {
            throw new Error("ConcatenationClip: at least one clip is required")
        }

        this.clips = clips
    }

    async build(data: RenderData, context: RenderContext): Promise<number> {
        const startVideoIndex = context.labels.video.length
        const startAudioIndex = context.labels.structuralAudio.length

        let totalDuration = 0
        for (const clip of this.clips) {
            totalDuration += await clip.build(data, context)
        }

        const videoLabels = context.labels.video.slice(startVideoIndex)
        const audioLabels = context.labels.structuralAudio.slice(startAudioIndex)

        if (videoLabels.length !== audioLabels.length) {
            throw new Error(
                `ConcatenationClip: video/audio mismatch (${videoLabels.length} videos, ${audioLabels.length} audios)`,
            )
        }

        const outV = `[v${context.labels.video.length}]`
        const outA = `[a${context.labels.structuralAudio.length}]`

        if (videoLabels.length === 1) {
            context.filters.push({
                filter: "null",
                inputs: videoLabels[0],
                outputs: outV,
            })
            context.filters.push({
                filter: "anull",
                inputs: audioLabels[0],
                outputs: outA,
            })
        } else {
            context.filters.push({
                filter: "concat",
                options: {
                    n: videoLabels.length,
                    v: 1,
                    a: 1,
                },
                inputs: videoLabels.map((v, i) => `${v}${audioLabels[i]}`).join(""),
                outputs: outV + outA,
            })
        }

        context.labels.video.splice(startVideoIndex)
        context.labels.structuralAudio.splice(startAudioIndex)

        context.labels.video.push(outV)
        context.labels.structuralAudio.push(outA)

        return totalDuration
    }
}
