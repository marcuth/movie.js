import path from "node:path"
import movie from "../src"

export type TowerIslandVideoTemplateAssets = {
    // intro: string
    guide: string
    // dragons: string[]
    // outro: string
    // music: string
}

export type TowerIslandVideoTemplateRenderData = {
    assets: TowerIslandVideoTemplateAssets
}

export const towerIslandVideoTemplate = movie.template<TowerIslandVideoTemplateRenderData>({
    config: {
        format: "mp4",
        fps: 60,
    },
    clips: [
        movie.image({
            path: ({ data }) => data.assets.guide,
            duration: 40,
            fadeIn: 1,
            fadeOut: 1,
            width: 1280,
            height: 720,
            scroll: {
                axis: "y",
                direction: "forward",
                easing: "linear"
            }
        }),
    ],
})

async function main() {
    const data: TowerIslandVideoTemplateRenderData = {
        assets: {
            guide: path.join(__dirname, "assets", "guide.png"),
        }
    }

    const video = await towerIslandVideoTemplate.render(data)

    await video.toFile(path.join(__dirname, "output.mp4"))
}

main().catch(console.error)