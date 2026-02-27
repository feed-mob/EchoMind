import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()
const port = Number(Bun.env.PORT ?? 3000)

app.use(
  '/*',
  cors({
    origin: [
      'http://echo-mind.coolify-tinca.tonob.net',
      'http://localhost:5173',
      'http://127.0.0.1:5173',
    ],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  }),
)

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.get('/api/hello', (c) => {
  return c.text('Hello Hono!')
})

export default {
  port,
  fetch: app.fetch,
}
