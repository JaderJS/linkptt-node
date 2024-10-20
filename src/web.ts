import { io, Socket } from "socket.io-client"
import { SendProps, TransmissionProps } from "./types"
import { EVENTS } from "./constants/constants"

export class Web {
    private socket: Socket
    private url: string
    public isConnected: boolean

    constructor(url: string, token: string) {
        this.isConnected = false
        this.url = url
        this.socket = io(this.url, {
            auth: { token: token },
        })
        this.setup()
    }

    private setup() {
        this.socket.on("connect", () => {
            console.log("Connected!")
            this.isConnected = true
        })
        this.socket.on("disconnect", () => {
            console.log("User is disconnected")
            this.isConnected = false
        })
        this.socket.on("connect_error", (error) => {
            console.error(error.message)
        })
    }


    public transmitter(event: string, data: any) {
        if (!this.isConnected) {
            console.log(`Disconnected the server, please verify your connection`)
            return
        }
        this.socket.emit(event, data)
    }

    public receiver(event: string, callback: (data: any) => void): void {
        this.socket.on(event, callback)
    }

    public start({ fromCuid, type }: SendProps) {
        if (!this.isConnected) {
            console.log(`Disconnected the server, please verify your connection`)
            return
        }
        const data: TransmissionProps = { fromCuid, type, sendBy: {} }

        this.socket.emit(EVENTS.START, data)
    }

}