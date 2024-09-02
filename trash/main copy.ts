import { Web } from "@/web"
import { Audio } from "./audio2"
import { server } from "@/core/axios"

type TransmissionProps = {
    from: string
}

type ReceiverProps = {
    to: string
}

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

            this.web.transmitter("message:location", location)
        }, 5000)
    }

    private setupAudioHandlers() {
        this.audio.onAudio((chunk: any) => {
            this.web.transmitter("audio:chunk", chunk)
        })

        this.web.receiver("audio:chunk", (chunk: Buffer) => {
            this.audio.emitAudio(chunk)
        })
    }

    public sender(props: TransmissionProps) {
        this.web.transmitter("audio:start", props)
        this.audio.start()
    }

    public stop() {
        this.audio.stop()
        this.web.transmitter("audio:stop", { msg: "finish" })
    }
}

