import React = require('react');
import ReactDOM = require('react-dom');
import { App } from './app';

window.onload = () => {
    ReactDOM.render(<App />, 
        document.getElementById('container'))
}