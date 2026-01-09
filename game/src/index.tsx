
import ReactDOM = require('react-dom')
import React = require('react')
import { Main } from './main'
import { Menu } from './menu/menu'
import './ui/format-text'
import '../global.scss'
import './canvas.scss'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ConnectionProvider } from './connection/connection-provider'

window.onload = () => {
    ReactDOM.render(
        <ConnectionProvider>
            <BrowserRouter>
                <Routes>
                    <Route 
                        path="*"
                        element={<Menu />}>
                    </Route>
                    <Route 
                        path="/play"
                        element={<Main />}>
                    </Route>
                </Routes>
            </BrowserRouter>
        </ConnectionProvider>,
        document.querySelector("#container"))
}