import * as React from 'react'
import * as ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from 'react-query'
import { createWebStoragePersistor } from 'react-query/createWebStoragePersistor-experimental'
import { persistQueryClient } from 'react-query/persistQueryClient-experimental'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.scss'
import ErrorPage from './Pages/404/404'
import Home from './Pages/Home/Home'
import Inventory from './Pages/Inventory/Inventory'
import Market from './Pages/Market/Market'
import pokemonTCGAPI from './util/api/pokemonTGC/pokemonTCGAPI'
import ThemeProvider from './util/ui/theme/ThemeProvider'

pokemonTCGAPI.configure({ apiKey: import.meta.env.VITE_POKEMON_TCG_API_KEY })

const cacheMaxAge = 1000 * 60 * 60 * 24 * 7
const persistedCardSetLimit = 8

const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <Home />,
      errorElement: <ErrorPage />,
      children: [
        {
          element: <Market />,
          index: true
        },
        {
          path: 'inventory',
          element: <Inventory />
        },
        {
          path: 'market',
          element: <Market />
        }
      ]
    }
  ],
  { basename: import.meta.env.BASE_URL }
)

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 60 * 24,
      cacheTime: cacheMaxAge,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      retry: 4,
      retryDelay: (attempt: number) => Math.min(1000 * 2 ** attempt, 8000)
    }
  }
})

const isCardSetQuery = (queryKey: unknown): boolean => Array.isArray(queryKey) && queryKey[0] == 'cards' && queryKey[1] == 'set'

persistQueryClient({
  queryClient,
  persistor: createWebStoragePersistor({
    storage: window.localStorage,
    throttleTime: 2000
  }),
  maxAge: cacheMaxAge,
  dehydrateOptions: {
    shouldDehydrateQuery: (query) => {
      if (query.state.data == undefined || query.state.status != 'success') {
        return false
      }
      if (!isCardSetQuery(query.queryKey)) {
        return true
      }
      const cardSetQueries = queryClient
        .getQueryCache()
        .getAll()
        .filter((cached) => isCardSetQuery(cached.queryKey) && cached.state.data != undefined)
        .sort((a, b) => b.state.dataUpdatedAt - a.state.dataUpdatedAt)
        .slice(0, persistedCardSetLimit)

      return cardSetQueries.some((cached) => cached.queryHash == query.queryHash)
    }
  }
})

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)

root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>
)
