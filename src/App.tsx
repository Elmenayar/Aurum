/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import WhatsAppButton from './components/ui/WhatsAppButton';
import Home from './pages/Home';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import BrokerRegister from './pages/BrokerRegister';
import AdminDashboard from './pages/AdminDashboard';
import BrokerDashboard from './pages/BrokerDashboard';
import Contact from './pages/Contact';
import About from './pages/About';
import Gallery from './pages/Gallery';
import Team from './pages/Team';
import PageTransition from './components/ui/PageTransition';
import useScrollToTop from './hooks/useScrollToTop';
import ScrollToTop from './components/ui/ScrollToTop';
import { AdTracking } from './components/analytics/AdTracking';
import { LanguageProvider } from './context/LanguageContext';

function ScrollToTopHandler() {
  useScrollToTop();
  return null;
}

export default function App() {
  return (
    <LanguageProvider>
      <Router>
        <AdTracking />
        <ScrollToTopHandler />
        <div className="min-h-screen flex flex-col bg-aurum-cream selection:bg-aurum-gold selection:text-aurum-navy transition-colors duration-300">
          <Navbar />
          <main className="flex-grow">
            <PageTransition>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/projects/:id" element={<ProjectDetail />} />
                <Route path="/broker-register" element={<BrokerRegister />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/broker-dashboard" element={<BrokerDashboard />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/about" element={<About />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/team" element={<Team />} />
              </Routes>
            </PageTransition>
          </main>
          <Footer />
          <WhatsAppButton />
          <ScrollToTop />
        </div>
      </Router>
    </LanguageProvider>
  );
}






