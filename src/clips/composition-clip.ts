import { RenderContext } from "../render-context"
import { Clip } from "./clip"

export type CompositionClipOptions<RenderData> = {
    clips: Clip<RenderData>[]
}

export class CompositionClip<RenderData> extends Clip<RenderData> {
    readonly clips: Clip<RenderData>[]

    constructor({ clips }: CompositionClipOptions<RenderData>) {
        super()

        if (clips.length === 0) {
            throw new Error("CompositionClip: at least one clip is required")
        }

        this.clips = clips
    }

    async build(data: RenderData, context: RenderContext): Promise<number> {
        const startVideoIndex = context.labels.video.length
        const startAudioIndex = context.labels.structuralAudio.length
        const startMixAudioIndex = context.labels.mixAudio.length

        let totalDuration = 0
        for (const clip of this.clips) {
            totalDuration += await clip.build(data, context)
        }

        const videoLabels = context.labels.video.slice(startVideoIndex)
        const audioLabels = context.labels.structuralAudio.slice(startAudioIndex)
        const mixAudioLabels = context.labels.mixAudio.slice(startMixAudioIndex)

        if (videoLabels.length !== audioLabels.length) {
            throw new Error(
                `CompositionClip: video/audio mismatch (${videoLabels.length} videos, ${audioLabels.length} audios)`,
            )
        }

        const outV = `[v${context.labels.video.length}]`
        const outBaseA = `[baseA${context.labels.structuralAudio.length}]`
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
                outputs: outBaseA,
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
                outputs: outV + outBaseA,
            })
        }

        if (mixAudioLabels.length > 0) {
            const mixLabel = `[mix${context.labels.structuralAudio.length}]`

            context.filters.push({
                filter: "amix",
                options: {
                    inputs: mixAudioLabels.length,
                },
                inputs: mixAudioLabels.join(""),
                outputs: mixLabel,
            })

            context.filters.push({
                filter: "amix",
                options: {
                    inputs: 2,
                    duration: "first",
                },
                inputs: `${outBaseA}${mixLabel}`,
                outputs: outA,
            })
        } else {
            context.filters.push({
                filter: "anull",
                inputs: outBaseA,
                outputs: outA,
            })
        }

        context.labels.video.splice(startVideoIndex)
        context.labels.structuralAudio.splice(startAudioIndex)
        context.labels.mixAudio.splice(startMixAudioIndex)

        context.labels.video.push(outV)
        context.labels.structuralAudio.push(outA)

        return totalDuration
    }
}
