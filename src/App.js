import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { BooksProvider } from './context/BooksContext';
import { Toaster } from './components/ui/toaster';
import Dashboard from './pages/Dashboard';
import AddEditBook from './pages/AddEditBook';
import BookDetails from './pages/BookDetails';
import './App.css';

function App() {
  return (
    <BooksProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/add-book" element={<AddEditBook />} />
          <Route path="/edit-book/:id" element={<AddEditBook />} />
          <Route path="/book/:id" element={<BookDetails />} />
        </Routes>
      </Router>
      <Toaster />
    </BooksProvider>
  );
}

export default App;