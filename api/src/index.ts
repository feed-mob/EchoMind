import { Hono } from 'hono'

const app = new Hono()
const port = Number(Bun.env.PORT ?? 3000)

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

export default {
  port,
  fetch: app.fetch,
}
