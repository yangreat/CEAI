import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Import components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Dashboard from './components/Dashboard';
import MemoryTraining from './components/training/MemoryTraining';
import WordListTraining from './components/training/WordListTraining';
import NumberMemoryTraining from './components/training/NumberMemoryTraining';
import AttentionTraining from './components/training/AttentionTraining';
import ExecutiveTraining from './components/training/ExecutiveTraining';
import LanguageTraining from './components/training/LanguageTraining';
import LogicTraining from './components/training/LogicTraining';
import EmotionTraining from './components/training/EmotionTraining';
import Progress from './components/Progress';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import NotFound from './components/NotFound';

function App() {
  return (
    <Router>
      <div className="app">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/training/memory" element={<MemoryTraining />} />
            <Route path="/training/memory/word-list" element={<WordListTraining />} />
            <Route path="/training/memory/number-memory" element={<NumberMemoryTraining />} />
            <Route path="/training/attention" element={<AttentionTraining />} />
            <Route path="/training/executive" element={<ExecutiveTraining />} />
            <Route path="/training/language" element={<LanguageTraining />} />
            <Route path="/training/logic" element={<LogicTraining />} />
            <Route path="/training/emotion" element={<EmotionTraining />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App; 