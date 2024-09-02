import { z } from "zod"

const schema = z.object({
    URL: z.string().url(),
    TX_TOKEN: z.string().min(0),
    RX_TOKEN: z.string().min(0)
})

const config = schema.parse({
    URL: process.env.URL || "http://localhost:5050",
    TX_TOKEN: process.env.TX_TOKEN,
    RX_TOKEN: process.env.RX_TOKEN
})

export { config }