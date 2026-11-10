import 'dotenv/config'
import cors from 'cors'
import express from 'express'

const app = express()
const port = Number(process.env.PORT ?? 3001)

app.use(cors())
app.use(express.json())

app.get('/api/health', (_request, response) => {
  response.json({ ok: true })
})

app.listen(port, () => {
  console.log(`Bachat Basket API listening on http://localhost:${port}`)
})
