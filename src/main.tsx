import * as React from 'react'
import * as ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from 'react-query'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.scss'
import HeaderProvider from './Header/HeaderProvider'
import ErrorPage from './Pages/404/404'
import Home from './Pages/Home/Home'
import Inventory from './Pages/Inventory/Inventory'
import Market from './Pages/Market/Market'
import pokemonTCGAPI from './util/api/pokemonTGC/pokemonTCGAPI'
import ThemeProvider from './util/ui/theme/ThemeProvider'

pokemonTCGAPI.configure({ apiKey: import.meta.env.VITE_POKEMON_TCG_API_KEY })

const router = createBrowserRouter([
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
])

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 60,
      cacheTime: 1000 * 60 * 60 * 24,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      retry: 1
    }
  }
})

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)

root.render(
  <QueryClientProvider client={queryClient}>
    <React.StrictMode>
      <ThemeProvider>
        <HeaderProvider>
          <RouterProvider router={router} />
        </HeaderProvider>
      </ThemeProvider>
    </React.StrictMode>
  </QueryClientProvider>
)
