import path from "node:path"
import fs from "node:fs"
import movie from "../src"

type RenderData = {
    assets: {
        music: string
        intro: string
        endOfVideo: string
        dragons: string[]
        laps: string[]
    }
}

async function main() {
    const filesDir = path.join(__dirname, "..", "heroic_races_134_br")
    const dragonsDir = path.join(filesDir, "dragons")
    const lapsDir = path.join(filesDir, "laps")
    const dragonFiles = await fs.promises.readdir(dragonsDir).then(files => files.map(file => path.join(dragonsDir, file)))
    const lapFiles = await fs.promises.readdir(lapsDir).then(files => files.map(file => path.join(lapsDir, file)))

    const template = movie.template<RenderData>({
        config: {
            format: "mp4",
            fps: 30,
            outputOptions: ["-c:v libx264", "-preset ultrafast"],
        },
        debug: true,
        clips: [
            // movie.video({
            //     path: ({ data }) => data.assets.intro,
            //     fadeIn: .5,
            //     fadeOut: .5,
            // }),
            movie.composition({
                clips: [
                    movie.concatenation({
                        clips: [
                            movie.repeat({
                                each: ({ data }) => data.assets.dragons,
                                clip: (file) => movie.image({
                                    path: file,
                                    duration: 5,
                                    fadeIn: 1,
                                    fadeOut: 1,
                                })
                            }),
                            movie.repeat({
                                each: ({ data }) => data.assets.laps,
                                clip: (file) => movie.image({
                                    path: file,
                                    duration: 10,
                                    fadeIn: 1,
                                    fadeOut: 1,
                                })
                            }),
                        ]
                    }),
                    movie.audio({
                        path: ({ data }) => data.assets.music,
                        loop: true,
                        fadeIn: 1,
                        fadeOut: 1,
                    }),
                ],
            }),
            // movie.video({
            //     path: ({ data }) => data.assets.endOfVideo,
            //     fadeIn: .5,
            //     fadeOut: .5,
            // }),
        ]
    })

    const result = await template.render({
        assets: {
            music: path.join(__dirname, "better_days.mp3"),
            intro: path.join(__dirname, "..", "intro.mp4"),
            endOfVideo: path.join(__dirname, "..", "end_of_video.mp4"),
            dragons: dragonFiles,
            laps: lapFiles,
        }
    })

    await result.toFile(path.join(__dirname, "heroic-races1.mp4"))
}

main()