import React, { useState, useEffect } from 'react';
import { useBooks } from '../context/BooksContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { BookOpen, Plus, Clock, TrendingUp, Search, Loader2, BookMarked, Star, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { Input } from '../components/ui/input';
import { useToast } from '../hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

const GOOGLE_API_KEY = 'AIzaSyB7LLSkeaSqlVbu-Y2X6SX2QrwENY3u1YI';

const Dashboard = () => {
  const { books, addBook, updateBook } = useBooks();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [addingBook, setAddingBook] = useState(null);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showRankingModal, setShowRankingModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rankingCurrentPage, setRankingCurrentPage] = useState(1);
  const booksPerPage = 9;
  const rankingBooksPerPage = 10;
  const [filterAuthor, setFilterAuthor] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterPublisher, setFilterPublisher] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [rankingFilterAuthor, setRankingFilterAuthor] = useState('');
  const [rankingFilterStars, setRankingFilterStars] = useState(0);

  // Função para calcular estatísticas dos livros
  const calculateStats = () => {
    const total = books.length;
    const inProgress = books.filter(book => book.currentPage > 0 && book.currentPage < book.totalPages).length;
    const completed = books.filter(book => book.currentPage >= book.totalPages && book.totalPages > 0).length;
    const rated = books.filter(book => book.rating > 0).length;
    
    return { total, inProgress, completed, rated };
  };
  
  // Função para filtrar livros com base nos critérios
  const getFilteredBooks = () => {
    return books.filter(book => {
      // Filtro por status
      if (filterStatus === 'inProgress' && (book.currentPage === 0 || book.currentPage >= book.totalPages)) {
        return false;
      }
      if (filterStatus === 'completed' && (book.currentPage < book.totalPages || book.totalPages === 0)) {
        return false;
      }
      
      // Filtro por pesquisa local
      if (localSearchTerm && !book.title?.toLowerCase().includes(localSearchTerm.toLowerCase()) && 
          !book.author?.toLowerCase().includes(localSearchTerm.toLowerCase())) {
        return false;
      }
      
      // Filtro por autor
      if (filterAuthor && !book.author?.toLowerCase().includes(filterAuthor.toLowerCase())) {
        return false;
      }
      
      // Filtro por ano
      if (filterYear && (!book.publishedYear || !book.publishedYear.includes(filterYear))) {
        return false;
      }
      
      // Filtro por editora
      if (filterPublisher && (!book.publisher || !book.publisher.toLowerCase().includes(filterPublisher.toLowerCase()))) {
        return false;
      }
      
      return true;
    });
  };
  
  // Função para obter livros com classificação, ordenados por rating
  const getRankedBooks = () => {
    return books
      .filter(book => {
        // Filtro por estrelas
        if (rankingFilterStars > 0 && book.rating !== rankingFilterStars) {
          return false;
        }
        
        // Filtro por autor
        if (rankingFilterAuthor && !book.author?.toLowerCase().includes(rankingFilterAuthor.toLowerCase())) {
          return false;
        }
        
        return book.rating > 0;
      })
      .sort((a, b) => b.rating - a.rating);
  };
  
  // Função para paginar os livros
  const getPaginatedBooks = () => {
    const filteredBooks = getFilteredBooks();
    const startIndex = (currentPage - 1) * booksPerPage;
    const endIndex = startIndex + booksPerPage;
    return filteredBooks.slice(startIndex, endIndex);
  };
  
  // Função para paginar os livros no ranking
  const getPaginatedRankedBooks = () => {
    const rankedBooks = getRankedBooks();
    const startIndex = (rankingCurrentPage - 1) * rankingBooksPerPage;
    const endIndex = startIndex + rankingBooksPerPage;
    return rankedBooks.slice(startIndex, endIndex);
  };
  
  // Função para calcular o número total de páginas
  const totalPages = Math.ceil(getFilteredBooks().length / booksPerPage);
  
  // Função para calcular o número total de páginas no ranking
  const totalRankingPages = Math.ceil(getRankedBooks().length / rankingBooksPerPage);
  
  // Função para calcular o progresso de leitura
  const calculateProgress = (book) => {
    if (!book.totalPages || book.totalPages === 0) return 0;
    return Math.round((book.currentPage / book.totalPages) * 100);
  };
  
  // Função para navegar entre as páginas
  const changePage = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };
  
  // Função para navegar entre as páginas do ranking
  const changeRankingPage = (newPage) => {
    if (newPage >= 1 && newPage <= totalRankingPages) {
      setRankingCurrentPage(newPage);
    }
  };
  
  // Função para limpar todos os filtros
  const clearFilters = () => {
    setFilterAuthor('');
    setFilterYear('');
    setFilterPublisher('');
    setLocalSearchTerm('');
    setFilterStatus('all');
    setCurrentPage(1);
  };
  
  // Função para limpar filtros do ranking
  const clearRankingFilters = () => {
    setRankingFilterAuthor('');
    setRankingFilterStars(0);
    setRankingCurrentPage(1);
  };
  
  // Função para buscar livros na API do Google
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setIsLoading(true);
    setShowSearchResults(true);
    try {
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchTerm)}&key=${GOOGLE_API_KEY}`
      );
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message || 'Erro na busca de livros');
      }
      
      setSearchResults(data.items || []);
    } catch (error) {
      console.error('Erro ao buscar livros:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível buscar livros. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Função para buscar livros localmente
  const handleLocalSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleAddBook = (book) => {
    setAddingBook(book.id);
    try {
      const volumeInfo = book.volumeInfo;
      
      // Extrair ISBN se disponível
      let isbn = '';
      if (volumeInfo.industryIdentifiers) {
        const isbnObj = volumeInfo.industryIdentifiers.find(
          id => id.type === 'ISBN_13' || id.type === 'ISBN_10'
        );
        isbn = isbnObj ? isbnObj.identifier : '';
      }
      
      // Mapear dados do Google Books para o formato do nosso app
      const newBook = {
        title: volumeInfo.title,
        author: volumeInfo.authors ? volumeInfo.authors.join(', ') : 'Desconhecido',
        totalPages: volumeInfo.pageCount || 0,
        coverUrl: volumeInfo.imageLinks?.thumbnail || '',
        description: volumeInfo.description || '',
        isbn: isbn,
        publisher: volumeInfo.publisher || '',
        publishedDate: volumeInfo.publishedDate || '',
        googleBooksId: book.id,
        language: volumeInfo.language || '',
        categories: volumeInfo.categories ? volumeInfo.categories.join(', ') : '',
      };
      
      addBook(newBook);
      
      toast({
        title: 'Livro adicionado',
        description: `"${newBook.title}" foi adicionado à sua biblioteca.`,
      });
    } catch (error) {
      console.error('Erro ao adicionar livro:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar o livro. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setAddingBook(null);
    }
  };

  // Função para renderizar as estrelas
  const renderStars = (rating) => {
    return Array(5).fill(0).map((_, i) => (
      <Star 
        key={i} 
        className={`h-4 w-4 ${i < rating ? 'text-amber-500 fill-amber-500' : 'text-gray-300'}`} 
      />
    ));
  };

  // Função para definir o status do filtro ao clicar nos cards de estatísticas
  const handleStatusFilterClick = (status) => {
    setFilterStatus(status);
    setCurrentPage(1);
  };

  // Obter lista única de autores, anos e editoras para os filtros
  const getUniqueAuthors = () => {
    const authors = books.map(book => book.author).filter(Boolean);
    return [...new Set(authors)];
  };

  const getUniqueYears = () => {
    const years = books.map(book => book.publishedYear).filter(Boolean);
    return [...new Set(years)];
  };

  const getUniquePublishers = () => {
    const publishers = books.map(book => book.publisher).filter(Boolean);
    return [...new Set(publishers)];
  };

  // Obter lista única de autores para o filtro do ranking
  const getUniqueRankedAuthors = () => {
    const authors = books.filter(book => book.rating > 0).map(book => book.author).filter(Boolean);
    return [...new Set(authors)];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-amber-900 mb-2">Minha Biblioteca</h1>
              <p className="text-amber-700">Gerencie seus livros e acompanhe seu progresso de leitura</p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => navigate('/add-book')}
                className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-lg"
                size="lg"
              >
                <Plus className="mr-2 h-5 w-5" />
                Adicionar Livro
              </Button>
            </div>
          </div>
        </div>
        
        {/* Search Forms */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* Google Books Search */}
          <form onSubmit={handleSearch} className="flex flex-col gap-2">
            <label className="text-sm font-medium text-amber-700">Buscar na Google Books API</label>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Digite título, autor, ISBN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <Button 
                type="submit" 
                disabled={isLoading}
                className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Search className="h-4 w-4 mr-2" />
                )}
                Buscar
              </Button>
            </div>
          </form>

          {/* Local Library Search */}
          <form onSubmit={handleLocalSearch} className="flex flex-col gap-2">
            <label className="text-sm font-medium text-amber-700">Buscar na minha biblioteca</label>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Buscar por título ou autor..."
                value={localSearchTerm}
                onChange={(e) => {
                  setLocalSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="flex-1"
              />
              <Button 
                type="submit"
                className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
              >
                <Search className="h-4 w-4 mr-2" />
                Buscar
              </Button>
            </div>
          </form>
        </div>

        {/* Filters */}
        <div className="mb-8 p-4 bg-white/80 backdrop-blur rounded-lg shadow-sm border border-amber-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-amber-900">Filtros</h3>
            <Button 
              variant="outline" 
              size="sm"
              onClick={clearFilters}
            >
              Limpar Filtros
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Filtro por Autor */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-amber-700">Autor</label>
              <select
                value={filterAuthor}
                onChange={(e) => {
                  setFilterAuthor(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-md border border-amber-200 px-3 py-2 text-sm"
              >
                <option value="">Todos os autores</option>
                {getUniqueAuthors().map((author, index) => (
                  <option key={index} value={author}>{author}</option>
                ))}
              </select>
            </div>

            {/* Filtro por Ano */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-amber-700">Ano de Publicação</label>
              <select
                value={filterYear}
                onChange={(e) => {
                  setFilterYear(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-md border border-amber-200 px-3 py-2 text-sm"
              >
                <option value="">Todos os anos</option>
                {getUniqueYears().map((year, index) => (
                  <option key={index} value={year}>{year}</option>
                ))}
              </select>
            </div>

            {/* Filtro por Editora */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-amber-700">Editora</label>
              <select
                value={filterPublisher}
                onChange={(e) => {
                  setFilterPublisher(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-md border border-amber-200 px-3 py-2 text-sm"
              >
                <option value="">Todas as editoras</option>
                {getUniquePublishers().map((publisher, index) => (
                  <option key={index} value={publisher}>{publisher}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Search Results */}
        {showSearchResults && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-amber-900">Resultados da Busca</h2>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowSearchResults(false);
                  setSearchResults([]);
                }}
              >
                Fechar Resultados
              </Button>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResults.map((book) => (
                  <Card key={book.id} className="overflow-hidden border-amber-200 shadow-md hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        {book.volumeInfo.imageLinks?.thumbnail ? (
                          <img 
                            src={book.volumeInfo.imageLinks.thumbnail} 
                            alt={book.volumeInfo.title}
                            className="w-24 h-36 object-cover rounded-md shadow-sm"
                          />
                        ) : (
                          <div className="w-24 h-36 bg-amber-100 flex items-center justify-center rounded-md shadow-sm">
                            <BookOpen className="h-8 w-8 text-amber-400" />
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="font-semibold text-amber-900 mb-1 line-clamp-2">{book.volumeInfo.title}</h3>
                          <p className="text-sm text-amber-700 mb-1">
                            {book.volumeInfo.authors ? book.volumeInfo.authors.join(', ') : 'Autor desconhecido'}
                          </p>
                          <p className="text-xs text-amber-600">
                            {book.volumeInfo.publishedDate ? book.volumeInfo.publishedDate.substring(0, 4) : ''}
                            {book.volumeInfo.publisher && book.volumeInfo.publishedDate ? ' • ' : ''}
                            {book.volumeInfo.publisher || ''}
                          </p>
                          {book.volumeInfo.description && (
                            <p className="text-xs text-amber-700 mt-2 line-clamp-3">
                              {book.volumeInfo.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="bg-amber-50 p-4">
                      <Button 
                        onClick={() => handleAddBook(book)} 
                        disabled={addingBook === book.id}
                        className="w-full"
                        variant="outline"
                      >
                        {addingBook === book.id ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Plus className="h-4 w-4 mr-2" />
                        )}
                        Adicionar à Biblioteca
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
                {searchResults.length === 0 && !isLoading && (
                  <div className="col-span-full text-center py-8">
                    <p className="text-amber-700">Nenhum resultado encontrado. Tente outra busca.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card 
            className={`bg-white/80 backdrop-blur border-amber-200 shadow-md hover:shadow-lg transition-shadow cursor-pointer ${filterStatus === 'all' ? 'ring-2 ring-amber-500' : ''}`}
            onClick={() => handleStatusFilterClick('all')}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-700">Total de Livros</p>
                  <p className="text-3xl font-bold text-amber-900">{calculateStats().total}</p>
                </div>
                <BookOpen className="h-10 w-10 text-amber-600" />
              </div>
            </CardContent>
          </Card>

          <Card 
            className={`bg-white/80 backdrop-blur border-orange-200 shadow-md hover:shadow-lg transition-shadow cursor-pointer ${filterStatus === 'inProgress' ? 'ring-2 ring-amber-500' : ''}`}
            onClick={() => handleStatusFilterClick('inProgress')}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-700">Em Progresso</p>
                  <p className="text-3xl font-bold text-orange-900">
                    {calculateStats().inProgress}
                  </p>
                </div>
                <Clock className="h-10 w-10 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card 
            className={`bg-white/80 backdrop-blur border-amber-200 shadow-md hover:shadow-lg transition-shadow cursor-pointer ${filterStatus === 'completed' ? 'ring-2 ring-amber-500' : ''}`}
            onClick={() => handleStatusFilterClick('completed')}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-700">Concluídos</p>
                  <p className="text-3xl font-bold text-amber-900">
                    {calculateStats().completed}
                  </p>
                </div>
                <TrendingUp className="h-10 w-10 text-amber-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card 
            className="bg-white/80 backdrop-blur border-amber-200 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setShowRankingModal(true)}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-700">Ranking</p>
                  <p className="text-3xl font-bold text-amber-900">
                    {calculateStats().rated}
                  </p>
                </div>
                <Star className="h-10 w-10 text-amber-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Books Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-amber-900 mb-6">Meus Livros</h2>
          
          {books.length === 0 ? (
            <div className="text-center py-12 bg-white/80 backdrop-blur rounded-lg border border-amber-200">
              <BookMarked className="h-16 w-16 text-amber-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-amber-900 mb-2">Sua biblioteca está vazia</h3>
              <p className="text-amber-700 mb-6">Adicione livros para começar a acompanhar seu progresso de leitura.</p>
              <Button 
                onClick={() => navigate('/add-book')}
                className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Livro
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getPaginatedBooks().map((book) => (
                  <Card 
                    key={book.id} 
                    className="overflow-hidden border-amber-200 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => navigate(`/book/${book.id}`)}
                  >
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        {book.coverImage ? (
                          <img 
                            src={book.coverImage} 
                            alt={book.title}
                            className="w-24 h-36 object-cover rounded-md shadow-sm"
                          />
                        ) : (
                          <div className="w-24 h-36 bg-amber-100 flex items-center justify-center rounded-md shadow-sm">
                            <BookOpen className="h-8 w-8 text-amber-400" />
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="font-semibold text-amber-900 mb-1 line-clamp-2">{book.title}</h3>
                          <p className="text-sm text-amber-700 mb-1">{book.author}</p>
                          <p className="text-xs text-amber-600">
                            {book.publisher && book.publishedYear ? `${book.publisher}, ${book.publishedYear}` : book.publisher || book.publishedYear}
                          </p>
                          
                          {/* Rating Stars */}
                          {book.rating > 0 && (
                            <div className="flex mt-1 mb-2">
                              {renderStars(book.rating)}
                            </div>
                          )}
                          
                          <div className="mt-2">
                            <div className="flex justify-between text-xs text-amber-700 mb-1">
                              <span>Progresso</span>
                              <span>{book.currentPage}/{book.totalPages}</span>
                            </div>
                            <Progress value={calculateProgress(book)} className="h-2 bg-amber-100" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="bg-amber-50 p-4">
                      <Button 
                        onClick={(e) => {
                          e.stopPropagation(); // Evita que o clique no botão propague para o card
                          navigate(`/book/${book.id}`);
                        }} 
                        className="w-full"
                        variant="outline"
                      >
                        Ver Detalhes
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center mt-8 gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => changePage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-amber-900">
                    Página {currentPage} de {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => changePage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Ranking Modal */}
      <Dialog open={showRankingModal} onOpenChange={setShowRankingModal}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-amber-900">Ranking de Livros</DialogTitle>
            <DialogDescription className="text-amber-700">
              Livros classificados por avaliação
            </DialogDescription>
          </DialogHeader>
          
          {/* Filtros do Ranking */}
          <div className="mb-4 p-4 bg-amber-50 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-amber-900">Filtros</h3>
              <Button 
                variant="outline" 
                size="sm"
                onClick={clearRankingFilters}
              >
                Limpar Filtros
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Filtro por Autor */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-amber-700">Autor</label>
                <select
                  value={rankingFilterAuthor}
                  onChange={(e) => {
                    setRankingFilterAuthor(e.target.value);
                    setRankingCurrentPage(1);
                  }}
                  className="w-full rounded-md border border-amber-200 px-3 py-2 text-sm"
                >
                  <option value="">Todos os autores</option>
                  {getUniqueRankedAuthors().map((author, index) => (
                    <option key={index} value={author}>{author}</option>
                  ))}
                </select>
              </div>

              {/* Filtro por Estrelas */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-amber-700">Avaliação</label>
                <select
                  value={rankingFilterStars}
                  onChange={(e) => {
                    setRankingFilterStars(Number(e.target.value));
                    setRankingCurrentPage(1);
                  }}
                  className="w-full rounded-md border border-amber-200 px-3 py-2 text-sm"
                >
                  <option value="0">Todas as avaliações</option>
                  <option value="5">5 estrelas</option>
                  <option value="4">4 estrelas</option>
                  <option value="3">3 estrelas</option>
                  <option value="2">2 estrelas</option>
                  <option value="1">1 estrela</option>
                </select>
              </div>
            </div>
          </div>
          
          {getRankedBooks().length === 0 ? (
            <div className="text-center py-8">
              <Star className="h-12 w-12 text-amber-300 mx-auto mb-2" />
              <p className="text-amber-700">Nenhum livro foi avaliado ainda.</p>
            </div>
          ) : (
            <>
              <div className="overflow-y-auto max-h-96">
                <table className="w-full">
                  <thead className="bg-amber-100 sticky top-0">
                    <tr>
                      <th className="text-left p-3 text-amber-900">Posição</th>
                      <th className="text-left p-3 text-amber-900">Título</th>
                      <th className="text-left p-3 text-amber-900">Autor</th>
                      <th className="text-left p-3 text-amber-900">Avaliação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getPaginatedRankedBooks().map((book, index) => {
                      const position = (rankingCurrentPage - 1) * rankingBooksPerPage + index + 1;
                      return (
                        <tr 
                          key={book.id} 
                          className="border-b border-amber-100 hover:bg-amber-50 cursor-pointer"
                          onClick={() => {
                            setShowRankingModal(false);
                            navigate(`/book/${book.id}`);
                          }}
                        >
                          <td className="p-3 text-amber-900 font-medium">{position}</td>
                          <td className="p-3 text-amber-900">{book.title}</td>
                          <td className="p-3 text-amber-700">{book.author}</td>
                          <td className="p-3">
                            <div className="flex">
                              {renderStars(book.rating)}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              {/* Paginação do Ranking */}
              {totalRankingPages > 1 && (
                <div className="flex justify-center items-center mt-4 gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => changeRankingPage(rankingCurrentPage - 1)}
                    disabled={rankingCurrentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-amber-900">
                    Página {rankingCurrentPage} de {totalRankingPages}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => changeRankingPage(rankingCurrentPage + 1)}
                    disabled={rankingCurrentPage === totalRankingPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowRankingModal(false)}
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;