import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import Landing from './pages/Landing'
import Groups from './pages/Groups'
import GroupDetail from './pages/GroupDetail'
import GroupGoals from './pages/GroupGoals'
import GroupGoalShare from './pages/GroupGoalShare'
import AIEvaluationSetup from './pages/AIEvaluationSetup'
import AIEvaluationResults from './pages/AIEvaluationResults'
import GroupSettings from './pages/GroupSettings'
import { AuthProvider } from './auth/AuthContext'
import RequireAuth from './components/RequireAuth'
import { ToastProvider } from './components/ToastProvider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/group/:groupId/goals/:goalId/share" element={<GroupGoalShare />} />
            <Route element={<RequireAuth />}>
              <Route path="/group" element={<Groups />} />
              <Route path="/group/:groupId" element={<GroupDetail />} />
              <Route path="/group/:groupId/goals" element={<GroupGoals />} />
              <Route path="/group/:groupId/settings" element={<GroupSettings />} />
              <Route path="/group/:groupId/ai-evaluate" element={<AIEvaluationSetup />} />
              <Route path="/group/:groupId/ai-evaluated/:settingId" element={<AIEvaluationResults />} />
              <Route path="/group/:groupId/goals/ai-evaluate" element={<AIEvaluationSetup />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  </StrictMode>,
)
