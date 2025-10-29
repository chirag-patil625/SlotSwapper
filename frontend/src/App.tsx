import React from 'react'
import './App.css'
import { Outlet } from 'react-router-dom';
import RouteTransition from './components/RouteTransition';

function App() {
  return (
    <>
      <RouteTransition />
      <Outlet />
    </>
  )
}

export default App
