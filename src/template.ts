import ffmpeg from "fluent-ffmpeg"

import { AudioClip, Clip, ImageClip, TextClip, VideoClip } from "./clips"
import { TemplateResult } from "./template-result"

export type TemplateOptions<RenderData> = {
    clips: Clip<any, RenderData>[]
    format: string
}

export class Template<RenderData> {
    constructor(private readonly options: TemplateOptions<RenderData>) { }

    async render(data: RenderData) {
        const command = ffmpeg()

        const videoTimelineClips = this.options.clips.filter(
            clip => clip instanceof VideoClip || clip instanceof ImageClip
        ) as (VideoClip | ImageClip)[]

        const textClips = this.options.clips.filter(
            clip => clip instanceof TextClip
        ) as TextClip[]

        const audioClips = this.options.clips.filter(
            clip => clip instanceof AudioClip
        ) as AudioClip[]

        videoTimelineClips.forEach(clip => {
            if (clip instanceof ImageClip) {
                command.inputOptions(clip.inputOptions)
            }

            command.input(clip.options.path)

            if (clip instanceof ImageClip && clip.options.start !== undefined) {
                command.inputOptions([`-ss ${clip.options.start}`])
            }

            if (
                clip instanceof ImageClip && clip.options.duration !== undefined &&
                !clip.inputOptions
            ) {
                command.inputOptions([`-t ${clip.options.duration}`])
            }
        })

        audioClips.forEach(clip => {
            if (clip.options.loop) {
                command.inputOptions(["-stream_loop -1"])
            }

            command.input(clip.options.path)
        })

        const filters: string[] = []

        videoTimelineClips.forEach((clip, i) => {
            filters.push(
                `[${i}:v]${clip.getVideoFilters().length
                    ? clip.getVideoFilters().join(",")
                    : "null"
                }[v${i}]`
            )

            filters.push(
                `[${i}:a]${clip.getAudioFilters().length
                    ? clip.getAudioFilters().join(",")
                    : "anull"
                }[a${i}]`
            )
        })

        let concatInputs = ""

        for (let i = 0; i < videoTimelineClips.length; i++) {
            concatInputs += `[v${i}][a${i}]`
        }

        filters.push(
            `${concatInputs}concat=n=${videoTimelineClips.length}:v=1:a=1[vcat][acat]`
        )

        let currentVideo = "[vcat]"

        textClips.forEach((clip, i) => {
            const out = `vtext${i}`
            filters.push(
                `${currentVideo}${clip.getVideoFilters()[0]}[${out}]`
            )
            currentVideo = `[${out}]`
        })

        const audioLabels: string[] = ["[acat]"]

        audioClips.forEach((clip, i) => {
            const inputIndex = videoTimelineClips.length + i

            let chain = `[${inputIndex}:a]`

            if (clip.startTime > 0) {
                const delay = clip.startTime * 1000
                chain += `adelay=${delay}|${delay},`
            }

            const filtersA = clip.getAudioFilters()
            chain += filtersA.length ? filtersA.join(",") : "anull"

            const label = `amix${i}`
            chain += `[${label}]`

            filters.push(chain)
            audioLabels.push(`[${label}]`)
        })

        if (audioLabels.length > 1) {
            filters.push(
                `${audioLabels.join("")}amix=inputs=${audioLabels.length}:dropout_transition=0[aout]`
            )
        } else {
            filters.push("[acat]anull[aout]")
        }

        command
            .complexFilter(filters)
            .outputOptions([
                `-map ${currentVideo}`,
                "-map [aout]"
            ])

        return new TemplateResult(command)
    }
}