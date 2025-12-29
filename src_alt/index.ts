import { AudioClip, AudioClipOptions, ImageClip, ImageClipOptions, TextClip, TextClipOptions, VideoClipOptions, CompositionClip, CompositionClipOptions, GridClip, GridClipOptions, RectangleClip, RectangleClipOptions, RepeatClip, RepeatClipOptions, VideoClip, GroupClip, GroupClipOptions } from "./clips"
import { Template, TemplateOptions } from "./template"

export const movie = {
    // template
    template(options: TemplateOptions) {
        return new Template(options)
    },

    // clipes básicos
    audio(options: AudioClipOptions) {
        return new AudioClip(options)
    },
    image(options: ImageClipOptions) {
        return new ImageClip(options)
    },
    text(options: TextClipOptions) {
        return new TextClip(options)
    },
    video(options: VideoClipOptions) {
        return new VideoClip(options)
    },
    composition(options: CompositionClipOptions) {
        return new CompositionClip(options)
    },

    // clipes básicos (opcionais)
    rectangle(options: RectangleClipOptions) {
        return new RectangleClip(options)
    },
    grid(options: GridClipOptions) {
        return new GridClip(options)
    },

    // clipes "helpers" sem efeitos reais visíveis, apenas wrappers
    group(options: GroupClipOptions) {
        return new GroupClip(options)
    }, // para oganizar os cliples na declaração
    repeat<RenderData, Item>(options: RepeatClipOptions<RenderData, Item>) {
        return new RepeatClip<RenderData, Item>(options)
    }, // para lidar com loops e for each
}


movie.template({
    format: "mp4",
    clips: [
        movie.text({
            text: "Hello World",
            x: 0,
            y: 0,
            duration: 10,
            font: {
                size: 24,
                color: "#FFFFFF",
                filePath: "./font.ttf"
            } 
        }),
        
    ]
})