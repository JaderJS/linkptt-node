import { Web } from "./web"
import { Audio } from "./audio"
import { server } from "./axios"

export class LinkPTT {
    private audio: Audio
    private web: Web

    constructor({ token }: { token: string }) {
        this.audio = new Audio()
        this.web = new Web("http://localhost:5050", token)
        this.setupAudioHandlers()
    }

    private locationHandlers() {
        setInterval(() => {
            const location = {
                latitude: "xx.xxxxxx",
                longitude: "xx.xxxxxx",
                rssi: 0.0
            }

            this.web.transmission(JSON.stringify(location))
        }, 5000)
    }

    private setupAudioHandlers() {
        this.audio.onAudio((chunk: any) => {
            this.web.transmission(chunk)
        })

        this.web.receiver("message", (chunk: Buffer) => {
            this.audio.emitAudio(chunk)
        })
    }

    public start(cuid: string): void {
        this.web.transmitter(cuid, { from: cuid })
        this.audio.start()
    }
}

