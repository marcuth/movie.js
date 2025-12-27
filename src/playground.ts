import { ImageClip, Pellicula, TextClip, VideoClip } from "./index"
import path from "node:path"
import fs from "node:fs"

const pellicula = new Pellicula()

;(async () => {
    const assetsDir = path.join(__dirname, "..", "heroic_races_134_br")
    const dragonsDir = path.join(assetsDir, "dragons")
    const lapsDir = path.join(assetsDir, "laps")

    const dragonFileNames = await fs.promises.readdir(dragonsDir)
    const lapFileNames = await fs.promises.readdir(lapsDir)

    pellicula.add(
        new VideoClip({ path: "intro.mp4" })
    )

    for (const dragonFileName of dragonFileNames) {
        const dragonFilePath = path.join(dragonsDir, dragonFileName)
        pellicula.add(new ImageClip({ path: dragonFilePath, duration: 5 }))
    }

    for (const lapFileName of lapFileNames) {
        const lapFilePath = path.join(lapsDir, lapFileName)
        pellicula.add(new ImageClip({ path: lapFilePath, duration: 10 }))
    }

    pellicula.add(
        new VideoClip({ path: "end_of_video.mp4" })
    )

    pellicula.render("output.mp4")
})();

