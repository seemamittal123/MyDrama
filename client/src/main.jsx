import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import store from './redux/store.js';
import { Provider } from "react-redux";
import { RouterProvider } from 'react-router-dom';
import router from './routes/index.jsx';

createRoot(document.getElementById('root')).render(
  <Provider store={store} >
    <RouterProvider router={router}/>
  </Provider>
)
