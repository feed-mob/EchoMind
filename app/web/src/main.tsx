import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import Landing from './pages/Landing'
import Groups from './pages/Groups'
import GroupDetail from './pages/GroupDetail'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/group" element={<Groups />} />
        <Route path="/group/:groupId" element={<GroupDetail />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
