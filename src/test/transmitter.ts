import config from "config"
import { LinkPTT } from "../main"

const link = new LinkPTT({ token: config.TX_TOKEN })

const main = async () => {
    for (let i = 0; i < 2; i++) {
        console.log(i)
        const audios = [`television`, `sports`]
        const j = Math.floor(Math.random() * 2)
        link.sender(`audios/${audios[j]}.wav`, { from: "cm158i0h900019z93ea8uhm44", type: "channel" })
        await new Promise((resolve) => setTimeout(resolve, 1500))
    }
}
main()