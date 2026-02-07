import {
    AudioClip,
    AudioClipOptions,
    ImageClip,
    ImageClipOptions,
    VideoClipOptions,
    CompositionClip,
    CompositionClipOptions,
    RepeatClip,
    RepeatClipOptions,
    VideoClip,
    ConcatenationClip,
    ConcatenationClipOptions,
    TextClip,
    TextClipOptions,
    OverlayClip,
    OverlayClipOptions,
} from "./clips"
import { Template, TemplateOptions } from "./template"

export * from "./clips"
export * from "./template"

const movie = {
    template<RenderData>(options: TemplateOptions<RenderData>) {
        return new Template<RenderData>(options)
    },
    audio<RenderData>(options: AudioClipOptions<RenderData>) {
        return new AudioClip<RenderData>(options)
    },
    image<RenderData>(options: ImageClipOptions<RenderData>) {
        return new ImageClip<RenderData>(options)
    },
    video<RenderData>(options: VideoClipOptions<RenderData>) {
        return new VideoClip<RenderData>(options)
    },
    composition<RenderData>(options: CompositionClipOptions<RenderData>) {
        return new CompositionClip<RenderData>(options)
    },
    repeat<RenderData, Item>(options: RepeatClipOptions<RenderData, Item>) {
        return new RepeatClip<RenderData, Item>(options)
    },
    concatenation<RenderData>(options: ConcatenationClipOptions<RenderData>) {
        return new ConcatenationClip<RenderData>(options)
    },
    text<RenderData>(options: TextClipOptions<RenderData>) {
        return new TextClip<RenderData>(options)
    },
    overlay<RenderData>(options: OverlayClipOptions<RenderData>) {
        return new OverlayClip<RenderData>(options)
    },
}

export default movie
