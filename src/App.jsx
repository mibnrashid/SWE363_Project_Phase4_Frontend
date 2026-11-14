import { BrowserRouter } from 'react-router-dom'
import StoreProvider from './store/StoreProvider'
import AuthProvider from './context/AuthProvider'
import ToastProvider from './context/ToastProvider'
import AppRoutes from './routes/AppRoutes'

export default function App() {
  return (
    <BrowserRouter>
      <StoreProvider>
        <ToastProvider>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </ToastProvider>
      </StoreProvider>
    </BrowserRouter>
  )
}
