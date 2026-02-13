import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import Landing from './pages/Landing'
import Groups from './pages/Groups'
import GroupDetail from './pages/GroupDetail'
import GroupGoals from './pages/GroupGoals'
import AIEvaluationSetup from './pages/AIEvaluationSetup'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/group" element={<Groups />} />
        <Route path="/group/:groupId" element={<GroupDetail />} />
        <Route path="/group/:groupId/goals" element={<GroupGoals />} />
        <Route path="/group/:groupId/ai-evaluate" element={<AIEvaluationSetup />} />
        <Route path="/group/:groupId/goals/ai-evaluated" element={<AIEvaluationSetup />} />
        <Route path="/group/:groupId/goals/ai-evaluate" element={<AIEvaluationSetup />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
