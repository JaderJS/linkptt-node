type SendProps = {
    fromCuid: string
    type: 'channel' | 'user'
}

type TransmissionProps = {
    fromCuid: string,
    type: "channel" | "user"
    sendBy: {
        user?: {
            cuid: string
            name: string
            avatarUrl: string
        },
        channel?: {
            cuid: string
            name: string
            profileUrl: string
        }
    }
}

export {
    SendProps,
    TransmissionProps
}