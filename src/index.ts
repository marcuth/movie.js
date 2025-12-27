import { AudioClip, AudioClipOptions, ImageClip, ImageClipOptions, TextClip, TextClipOptions, VideoClip, VideoClipOptions } from "./clips"
import { TemplateOptions, Template } from "./template"

export * from "./clips"
export * from "./template"
export * from "./template-result"

export const pellicula = {
    template<RenderData>(options: TemplateOptions) {
        return new Template<RenderData>(options)
    },
    text(options: TextClipOptions) {
        return new TextClip(options)
    },
    image(options: ImageClipOptions) {
        return new ImageClip(options)
    },
    video(options: VideoClipOptions) {
        return new VideoClip(options)
    },
    audio(options: AudioClipOptions) {
        return new AudioClip(options)
    }
}