import React, { createContext, useContext, useState, useEffect } from 'react';

const BooksContext = createContext();

export const useBooks = () => {
  const context = useContext(BooksContext);
  if (!context) {
    throw new Error('useBooks deve ser usado dentro de BooksProvider');
  }
  return context;
};

// Função para carregar do localStorage de forma segura
const loadFromStorage = (key, defaultValue = []) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Erro ao carregar ${key} do localStorage:`, error);
    return defaultValue;
  }
};

export const BooksProvider = ({ children }) => {
  const [books, setBooks] = useState(() => loadFromStorage('books', []));
  const [notes, setNotes] = useState(() => loadFromStorage('notes', []));
  const [readingSessions, setReadingSessions] = useState(() => loadFromStorage('readingSessions', []));

  // Salvar livros no localStorage
  useEffect(() => {
    localStorage.setItem('books', JSON.stringify(books));
  }, [books]);

  // Salvar notas no localStorage
  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(notes));
  }, [notes]);

  // Salvar sessões de leitura no localStorage
  useEffect(() => {
    localStorage.setItem('readingSessions', JSON.stringify(readingSessions));
  }, [readingSessions]);

  // Adicionar um novo livro
  const addBook = (book) => {
    const newBook = {
      ...book,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      currentPage: 0,
      rating: 0,
      coverImage: book.coverUrl || '', // Garantir que a imagem da capa seja salva
      publishedYear: book.publishedDate ? book.publishedDate.substring(0, 4) : '', // Extrair o ano de publicação
    };
    setBooks([...books, newBook]);
    return newBook.id;
  };
  
  // Função para adicionar livro da Google Books API
  const addBookFromGoogle = async (googleBookId) => {
    try {
      const response = await fetch(`https://www.googleapis.com/books/v1/volumes/${googleBookId}?key=AIzaSyB7LLSkeaSqlVbu-Y2X6SX2QrwENY3u1YI`);
      const data = await response.json();
      
      if (!data || !data.volumeInfo) {
        throw new Error('Dados do livro não encontrados');
      }
      
      const volumeInfo = data.volumeInfo;
      
      // Extrair ISBN se disponível
      let isbn = '';
      if (volumeInfo.industryIdentifiers) {
        const isbnObj = volumeInfo.industryIdentifiers.find(
          id => id.type === 'ISBN_13' || id.type === 'ISBN_10'
        );
        isbn = isbnObj ? isbnObj.identifier : '';
      }
      
      const newBook = {
        title: volumeInfo.title,
        author: volumeInfo.authors ? volumeInfo.authors.join(', ') : 'Desconhecido',
        totalPages: volumeInfo.pageCount || 0,
        coverUrl: volumeInfo.imageLinks?.thumbnail || '',
        description: volumeInfo.description || '',
        isbn: isbn,
        publisher: volumeInfo.publisher || '',
        publishedDate: volumeInfo.publishedDate || '',
        googleBooksId: data.id,
        language: volumeInfo.language || '',
        categories: volumeInfo.categories ? volumeInfo.categories.join(', ') : '',
      };
      
      return addBook(newBook);
    } catch (error) {
      console.error('Erro ao buscar detalhes do livro:', error);
      throw error;
    }
  };

  const updateBook = (id, updatedBook) => {
    setBooks(books.map(book => book.id === id ? { ...book, ...updatedBook } : book));
  };

  const deleteBook = (id) => {
    setBooks(books.filter(book => book.id !== id));
    setNotes(notes.filter(note => note.bookId !== id));
    setReadingSessions(readingSessions.filter(session => session.bookId !== id));
  };

  const getBook = (id) => {
    return books.find(book => book.id === id);
  };

  // Funções de anotações
  const addNote = (note) => {
    const newNote = {
      ...note,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setNotes([...notes, newNote]);
    return newNote;
  };

  const updateNote = (id, updatedNote) => {
    setNotes(notes.map(note => note.id === id ? { ...note, ...updatedNote } : note));
  };

  const deleteNote = (id) => {
    setNotes(notes.filter(note => note.id !== id));
  };

  const getNotesByBook = (bookId) => {
    return notes.filter(note => note.bookId === bookId).sort((a, b) => a.page - b.page);
  };

  // Funções de sessões de leitura
  const addReadingSession = (session) => {
    const newSession = {
      ...session,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setReadingSessions([...readingSessions, newSession]);
    return newSession;
  };

  const getSessionsByBook = (bookId) => {
    return readingSessions.filter(session => session.bookId === bookId);
  };

  // Calcular WPM médio
  const calculateAverageWPM = (bookId) => {
    const sessions = getSessionsByBook(bookId);
    if (sessions.length === 0) return 0;
    
    const totalWPM = sessions.reduce((sum, session) => sum + (session.wpm || 0), 0);
    return Math.round(totalWPM / sessions.length);
  };

  // Calcular tempo estimado de leitura
  const calculateEstimatedTime = (totalPages, currentPage, dailyMinutes, wpm = 200) => {
    const remainingPages = totalPages - currentPage;
    const wordsPerPage = 250;
    const totalWords = remainingPages * wordsPerPage;
    const totalMinutes = totalWords / wpm;
    const daysNeeded = Math.ceil(totalMinutes / dailyMinutes);
    
    return {
      totalMinutes: Math.round(totalMinutes),
      daysNeeded,
      hoursNeeded: Math.round(totalMinutes / 60),
    };
  };

  const value = {
    books,
    notes,
    readingSessions,
    addBook,
    addBookFromGoogle,
    updateBook,
    deleteBook,
    getBook,
    addNote,
    updateNote,
    deleteNote,
    getNotesByBook,
    addReadingSession,
    getSessionsByBook,
    calculateAverageWPM,
    calculateEstimatedTime,
  };

  return <BooksContext.Provider value={value}>{children}</BooksContext.Provider>;
};