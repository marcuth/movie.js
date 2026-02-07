import { Property, resolveProperty } from "../utils/resolve-property"
import { RenderContext } from "../render-context"
import { Clip } from "./clip"

export type OverlayClipOptions<RenderData> = {
    base: Clip<RenderData>
    overlay: Clip<RenderData>
    x?: Property<RenderData, number | string>
    y?: Property<RenderData, number | string>
    start?: Property<RenderData, number>
}

export class OverlayClip<RenderData> extends Clip<RenderData> {
    readonly base: Clip<RenderData>
    readonly overlay: Clip<RenderData>
    readonly x: Property<RenderData, number | string>
    readonly y: Property<RenderData, number | string>
    readonly start: Property<RenderData, number>

    constructor(options: OverlayClipOptions<RenderData>) {
        super()
        this.base = options.base
        this.overlay = options.overlay
        this.x = options.x ?? 0
        this.y = options.y ?? 0
        this.start = options.start ?? 0
    }

    async build(data: RenderData, context: RenderContext): Promise<number> {
        const baseDuration = await this.base.build(data, context)
        const baseVideoLabel = context.labels.video.pop()!
        const baseAudioLabel = context.labels.structuralAudio.pop()!
        await this.overlay.build(data, context)
        const overlayVideoLabel = context.labels.video.pop()!
        const overlayAudioLabel = context.labels.structuralAudio.pop()!

        const x = resolveProperty({ property: this.x, data, index: context.clipIndex })
        const y = resolveProperty({ property: this.y, data, index: context.clipIndex })
        const start = resolveProperty({ property: this.start, data, index: context.clipIndex })

        const delayedOverlayAudio = `[delayedA${context.inputIndex}]`
        let currentOverlayAudio = overlayAudioLabel

        if (start > 0) {
            const delayMs = Math.round(start * 1000)
            context.filters.push({
                filter: "adelay",
                options: { delays: `${delayMs}|${delayMs}` },
                inputs: overlayAudioLabel,
                outputs: delayedOverlayAudio,
            })
            currentOverlayAudio = delayedOverlayAudio
        }

        const mixedAudio = `[mixedA${context.inputIndex}]`

        context.filters.push({
            filter: "amix",
            options: { inputs: 2, duration: "first" },
            inputs: [baseAudioLabel, currentOverlayAudio],
            outputs: mixedAudio,
        })

        const delayedOverlayVideo = `[delayedV${context.inputIndex}]`
        let currentOverlayVideo = overlayVideoLabel

        if (start > 0) {
            context.filters.push({
                filter: "setpts",
                options: { expr: `PTS+${start}/TB` },
                inputs: overlayVideoLabel,
                outputs: delayedOverlayVideo,
            })
            currentOverlayVideo = delayedOverlayVideo
        }

        const outVideo = `[outV${context.inputIndex}]`

        context.filters.push({
            filter: "overlay",
            options: { x, y, eof_action: "pass" },
            inputs: [baseVideoLabel, currentOverlayVideo],
            outputs: outVideo,
        })

        context.labels.video.push(outVideo)
        context.labels.structuralAudio.push(mixedAudio)

        context.inputIndex++

        return baseDuration
    }
}
