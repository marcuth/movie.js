import { pellicula } from ".";

;(async () => {
    const tempate = pellicula.template({
        format: "mp4",
        clips: [
            pellicula.image({
                path: ""
            })
        ]
    })
})();