import { Route, BrowserRouter, Routes } from 'react-router-dom'
import EventPage from './EventPage'
import './EventPage.css'

function Home() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        background: 'linear-gradient(160deg,#312e81,#5b21b6,#7c3aed)',
      }}
    >
      <p>Open a shared event link to view details.</p>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/:id" element={<EventPage />} />
      </Routes>
    </BrowserRouter>
  )
}
