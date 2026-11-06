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
import Pokemon from './Pages/Pokemon/Pokemon'
import AuthProvider from './util/auth/AuthProvider'
import FavoritesProvider from './util/ui/favorites/FavoritesProvider'
import LanguageProvider from './util/ui/language/LanguageProvider'
import SearchProvider from './util/ui/search/SearchProvider'
import SortProvider from './util/ui/sort/SortProvider'
import ThemeProvider from './util/ui/theme/ThemeProvider'

const cacheMaxAge = 1000 * 60 * 60 * 24 * 7
const persistedCardListLimit = 8

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
        },
        {
          path: 'pokemon/:pokedexNumber?',
          element: <Pokemon />
        }
      ]
    }
  ],
  { basename: import.meta.env.BASE_URL }
)

const isNotFoundError = (error: unknown): boolean => (error as { response?: { status?: number } })?.response?.status == 404

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 60 * 24,
      cacheTime: cacheMaxAge,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      retry: (failureCount: number, error: unknown) => !isNotFoundError(error) && failureCount < 4,
      retryDelay: (attempt: number) => Math.min(1000 * 2 ** attempt, 8000)
    }
  }
})

const isCardListQuery = (queryKey: unknown): boolean => Array.isArray(queryKey) && queryKey[0] == 'cards'

persistQueryClient({
  queryClient,
  persistor: createWebStoragePersistor({
    storage: window.localStorage,
    throttleTime: 2000
  }),
  maxAge: cacheMaxAge,
  buster: 'server-snapshot',
  dehydrateOptions: {
    shouldDehydrateQuery: (query) => {
      if (query.state.data == undefined || query.state.status != 'success') {
        return false
      }
      if (!isCardListQuery(query.queryKey)) {
        return true
      }
      const cardListQueries = queryClient
        .getQueryCache()
        .getAll()
        .filter((cached) => isCardListQuery(cached.queryKey) && cached.state.data != undefined)
        .sort((a, b) => b.state.dataUpdatedAt - a.state.dataUpdatedAt)
        .slice(0, persistedCardListLimit)

      return cardListQueries.some((cached) => cached.queryHash == query.queryHash)
    }
  }
})

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)

root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <SortProvider>
            <SearchProvider>
              <AuthProvider>
                <FavoritesProvider>
                  <RouterProvider router={router} />
                </FavoritesProvider>
              </AuthProvider>
            </SearchProvider>
          </SortProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>
)
