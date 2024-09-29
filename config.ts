import { z } from "zod"

const schema = z.object({
    URL: z.string().url(),
    TX_TOKEN: z.string().min(0),
    RX_TOKEN: z.string().min(0)
})

const config = schema.parse(process.env)

export default config 