import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Nav from './components/Nav'
import AllArticles from './pages/AllArticles'
import TopArticles from './pages/TopArticles'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Nav />
        <main className="max-w-7xl mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<AllArticles />} />
            <Route path="/top" element={<TopArticles />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
