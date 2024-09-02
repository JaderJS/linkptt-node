import { Web } from "@/web"
import { Audio } from "@/core/audio"
import { server } from "@/core/axios"
import { OpusEncoder } from '@discordjs/opus'
import { createWriteStream, WriteStream, createReadStream } from "node:fs"

type TransmissionProps = {
    from: string,
    type: "channel" | "user"
}

type ReceiverProps = {
    to: string
}

type Config = {
    updateLocation: number
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
    private config: Config
    private audio: Audio
    private web: Web
    private opus: OpusEncoder
    private token: string

    constructor({ token, config }: { token: string, config?: Config }) {
        this.token = token
        this.audio = new Audio()
        this.web = new Web("http://localhost:5050", token)
        this.config = {
            updateLocation: config?.updateLocation || 5000
        }
        this.setup()
        this.opus = new OpusEncoder(48000, 1)
    }

    private locationHandlers(ms: number) {
        setInterval(() => {
            const location = {
                latitude: "00.000000",
                longitude: "00.000000",
                rssi: 0.0
            }
            this.web.transmitter("msg:location", location)
        }, ms)
    }

    private setup() {
        setTimeout(() => {
            this.web.receiver("audio:chunk", (chunk: Buffer) => {
                try {
                    // const decoded = this.opus.decode(chunk)
                    this.audio.getSpeakerStream().write(chunk)
                } catch (error) {
                    console.error(error)
                }
            })

            this.locationHandlers(60000)
        }, 1000)
    }

    public sender(path: string, props: TransmissionProps) {

        this.start(props)
        const stream = createReadStream(path, { highWaterMark: 8 * 160 })
        stream.on("data", (chunk: Buffer) => {
            try {
                // this.web.transmitter('audio:chunk:wav', chunk)
                const encoded = this.opus.encode(chunk)
                this.web.transmitter('audio:chunk', encoded)
            } catch (error) {
                console.error(`Error opus`, error)
            }
        })
        stream.on("end", () => {
            this.stop(props)
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

    public start(props: TransmissionProps) {
        this.web.transmitter("audio:start", props)
    }

    public stop(props: TransmissionProps) {
        this.web.transmitter("audio:stop", props)
    }
}

