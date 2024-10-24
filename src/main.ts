import { Web } from "@/web"
import { Audio } from "@/core/audio"
import { server } from "@/core/axios"
import { OpusEncoder } from '@discordjs/opus'
import { createWriteStream, WriteStream, createReadStream } from "node:fs"
import config from "config"
import { getLocation } from "./utils/utils"
import { SendProps, TransmissionProps } from "./types"


type ReceiverProps = {
    to: string
}

type User = {
    cuid: string
    email: string
    name: string | null
    password: string
    avatarUrl: string
}

type Token = {
    token: string
}

export class LinkPTT {
    private audio: Audio
    private web: Web
    private opus: OpusEncoder

    constructor({ token }: { token: string }) {
        this.audio = new Audio()
        this.web = new Web(config.URL, token)
        this.opus = new OpusEncoder(48000, 1)
        this.setup()
    }

    private async locationHandlers(ms: number) {
        const point = await getLocation()
        setInterval(() => {
            const location = {
                latitude: point[0],
                longitude: point[1],
                rssi: 0.0
            }
            this.web.transmitter("msg:location", location)
        }, ms)
    }

    private setup() {
        setTimeout(() => {
            const speakerStream = this.audio.getSpeakerStream()
            this.web.receiver("audio:chunk:node", (chunk: ArrayBuffer) => {
                try {
                    console.log(chunk)
                    speakerStream.write(chunk)
                } catch (error) {
                    console.error(error)
                }
            })

            this.web.receiver('ping:node', (callback) => {
                callback()
            })

            this.locationHandlers(60000)
        }, 1000)
    }

    public send(path: string, { fromCuid, type }: SendProps) {
        // Start stream
        this.start({ fromCuid, type })

        // Send Streams
        const stream = createReadStream(path)
        stream.on("data", (chunk: Buffer) => {
            try {
                this.web.transmitter('audio:chunk:node', chunk)
            } catch (error) {
                console.error(`Error opus`, error)
            }
        })

        // Stop Stream
        stream.on("end", () => {
            this.stop({ fromCuid, type })
        })

    }

    async login({ email, password }: { email: string, password: string }): Promise<User> {
        return server.post(`/user/login`, { email, password }).then((res) => {
            const { email, token } = res.data as User & Token
            return { email, token }
        }).catch((error) => {
            return error
        })

    }


    public start(props: SendProps) {
        this.web.start(props)
    }

    public stop(props: SendProps) {
        this.web.transmitter("audio:stop", props)
    }

    public startMic({ fromCuid, type }: SendProps) {
        this.web.start({ fromCuid, type })

        this.audio.start()
        this.audio.on('mic:chunk', (chunk) => {
            this.web.transmitter('audio:chunk:node', chunk)
        })

        setTimeout(() => {
            this.audio.stop()
            this.web.transmitter("audio:stop", { fromCuid, type })
        }, 8000)
    }
}


