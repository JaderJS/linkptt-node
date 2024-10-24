import config from "config"
import { LinkPTT } from "../main"
import { wait } from "@/utils/utils"

const link = new LinkPTT({ token: config.TX_TOKEN })

const main = async () => {
    await wait(100)
    // link.send(`audios/sample.mp3`, { fromCuid: "cm2b39uqk00026w5k5yaaru1s", type: "channel" })
    link.startMic({ fromCuid: "cm2b39uqk00026w5k5yaaru1s", type: "channel" })

}
main()
