import { AudioClip, AudioClipOptions, ImageClip, ImageClipOptions, TextClip, TextClipOptions, VideoClipOptions, CompositionClip, CompositionClipOptions, GridClip, GridClipOptions, RectangleClip, RectangleClipOptions, RepeatClip, RepeatClipOptions, VideoClip, GroupClip, GroupClipOptions } from "./clips"
import { Template, TemplateOptions } from "./template"

export * from "./clips"
export * from "./template"

const movie = {
    // template
    template<RenderData>(options: TemplateOptions<RenderData>) {
        return new Template<RenderData>(options)
    },
    // clipes básicos
    audio<RenderData>(options: AudioClipOptions) {
        return new AudioClip<RenderData>(options)
    },
    image<RenderData>(options: ImageClipOptions<RenderData>) {
        return new ImageClip<RenderData>(options)
    },
    text<RenderData>(options: TextClipOptions<RenderData>) {
        return new TextClip<RenderData>(options)
    },
    video<RenderData>(options: VideoClipOptions<RenderData>) {
        return new VideoClip<RenderData>(options)
    },
    composition<RenderData>(options: CompositionClipOptions<RenderData>) {
        return new CompositionClip<RenderData>(options)
    },

    // clipes básicos (opcionais)
    rectangle<RenderData>(options: RectangleClipOptions<RenderData>) {
        return new RectangleClip<RenderData>(options)
    },
    grid<RenderData>(options: GridClipOptions<RenderData>) {
        return new GridClip<RenderData>(options)
    },

    // clipes "helpers" sem efeitos reais visíveis, apenas wrappers
    group<RenderData>(options: GroupClipOptions<RenderData>) {
        return new GroupClip<RenderData>(options)
    }, // para oganizar os cliples na declaração
    repeat<RenderData, Item>(options: RepeatClipOptions<RenderData, Item>) {
        return new RepeatClip<RenderData, Item>(options)
    }, // para lidar com loops e for each
}

export default movie