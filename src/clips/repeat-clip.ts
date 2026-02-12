import cliProgress from "cli-progress"

import { RenderContext } from "../render-context"
import { Clip } from "./clip"

export type EachOptions<Data> = {
    data: Data
    index: number
}

export type ClipFunctionOptions = {
    index: number
    length: number
}

export type ClipFunction<RenderData, Item> = (item: Item, options: ClipFunctionOptions) => Clip<RenderData>

export type RepeatClipOptions<RenderData, Item> = {
    each: EachFunction<RenderData, Item>
    clip: ClipFunction<RenderData, Item>
}

export type EachFunction<Data, Item> = (options: EachOptions<Data>) => Item[]

export class RepeatClip<RenderData, Item> extends Clip<RenderData> {
    readonly each: EachFunction<RenderData, Item>
    readonly clip: ClipFunction<RenderData, Item>

    constructor({ each, clip }: RepeatClipOptions<RenderData, Item>) {
        super()
        this.each = each
        this.clip = clip
    }

    async build(data: RenderData, context: RenderContext): Promise<number> {
        const items = this.each({ data: data, index: 0 })
        const totalDuration = await this.runBuildWithProgress(items, data, context)
        return totalDuration
    }

    private async runBuildWithProgress(items: Item[], data: RenderData, context: RenderContext): Promise<number> {
        const buildBar = new cliProgress.SingleBar(
            { format: "Repeat Clip Build  |{bar}| {value}/{total} clips", hideCursor: true },
            cliProgress.Presets.shades_classic,
        )
        buildBar.start(items.length, 0)
        const length = items.length

        const startVideoIndex = context.labels.video.length
        const startAudioIndex = context.labels.structuralAudio.length

        let totalDuration = 0
        for (let i = 0; i < length; i++) {
            const clip = this.clip(items[i], { index: i, length: length })
            totalDuration += await clip.build(data, context)
            buildBar.increment()
        }

        buildBar.stop()

        const videoLabels = context.labels.video.slice(startVideoIndex)
        const audioLabels = context.labels.structuralAudio.slice(startAudioIndex)

        if (videoLabels.length !== audioLabels.length) {
            throw new Error(
                `RepeatClip: video/audio mismatch (${videoLabels.length} videos, ${audioLabels.length} audios)`,
            )
        }

        if (videoLabels.length > 1) {
            const outV = `[repeatV${context.inputIndex}]`
            const outA = `[repeatA${context.inputIndex}]`

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

            context.labels.video.splice(startVideoIndex)
            context.labels.structuralAudio.splice(startAudioIndex)

            context.labels.video.push(outV)
            context.labels.structuralAudio.push(outA)
        }

        return totalDuration
    }
}
