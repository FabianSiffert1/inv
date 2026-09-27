import react from '@vitejs/plugin-react'
import { createReadStream, stat } from 'node:fs'
import path from 'node:path'
import { fileURLToPath, URL } from 'node:url'
import { Connect, defineConfig, Plugin } from 'vite'

const dataDirectory = fileURLToPath(new URL('./data', import.meta.url))

const serveDataDirectory: Connect.NextHandleFunction = (request, response) => {
  const requestPath = decodeURIComponent((request.url ?? '').split('?')[0])
  const filePath = path.join(dataDirectory, requestPath)

  const notFound = () => {
    response.statusCode = 404
    response.end()
  }

  if (!filePath.startsWith(dataDirectory + path.sep) || !filePath.endsWith('.json')) {
    return notFound()
  }

  stat(filePath, (error, stats) => {
    if (error || !stats.isFile()) {
      return notFound()
    }
    const etag = `"${stats.size}-${stats.mtimeMs}"`
    response.setHeader('Cache-Control', 'no-cache')
    response.setHeader('ETag', etag)
    if (request.headers['if-none-match'] == etag) {
      response.statusCode = 304
      return response.end()
    }
    response.setHeader('Content-Type', 'application/json')
    createReadStream(filePath).pipe(response)
  })
}

const dataSnapshot = (): Plugin => ({
  name: 'data-snapshot',
  configureServer: (server) => {
    server.middlewares.use('/data', serveDataDirectory)
  },
  configurePreviewServer: (server) => {
    server.middlewares.use('/data', serveDataDirectory)
  }
})

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  server: { port: 3030 },
  preview: { port: 3030 },
  plugins: [react(), dataSnapshot()],
  css: {
    preprocessorOptions: {
      scss: {
        loadPaths: [fileURLToPath(new URL('./src/util/ui', import.meta.url))]
      }
    }
  }
})
