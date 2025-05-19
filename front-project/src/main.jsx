import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import 'antd/dist/reset.css'
import { Provider } from 'react-redux'
import { store } from './redux/store.js'
import { BrowserRouter as Router } from 'react-router-dom'
import AppLoader from './AppLoader.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <Provider store={store}>
        <AppLoader />
        <App />
      </Provider>
    </Router>
  </StrictMode>,
)
