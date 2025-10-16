import React, { useState } from 'react';
import { useBooks } from '../context/BooksContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardFooter } from '../components/ui/card';
import { Search, Plus, Loader2 } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

const GOOGLE_API_KEY = 'AIzaSyB7LLSkeaSqlVbu-Y2X6SX2QrwENY3u1YI';

const SearchBooks = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [addingBook, setAddingBook] = useState(null);
  const { addBook } = useBooks();
  const { toast } = useToast();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setIsLoading(true);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-amber-900 mb-2">Buscar Livros</h1>
          <p className="text-amber-700">Pesquise livros no Google Books e adicione à sua biblioteca</p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-8">
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

        {/* Results */}
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
                        <BookIcon className="h-8 w-8 text-amber-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-amber-900 line-clamp-2">{book.volumeInfo.title}</h3>
                      <p className="text-amber-700 text-sm mb-2">
                        {book.volumeInfo.authors ? book.volumeInfo.authors.join(', ') : 'Autor desconhecido'}
                      </p>
                      <p className="text-amber-600 text-xs">
                        {book.volumeInfo.publishedDate && `Publicado: ${book.volumeInfo.publishedDate}`}
                        {book.volumeInfo.publisher && ` • ${book.volumeInfo.publisher}`}
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-gray-600 line-clamp-3">
                    {book.volumeInfo.description || 'Sem descrição disponível.'}
                  </p>
                </CardContent>
                <CardFooter className="bg-amber-50 px-6 py-3">
                  <Button
                    onClick={() => handleAddBook(book)}
                    disabled={addingBook === book.id}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                    variant="secondary"
                  >
                    {addingBook === book.id ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Adicionando...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar à Biblioteca
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
            {searchResults.length === 0 && !isLoading && searchTerm && (
              <div className="col-span-full text-center py-12">
                <p className="text-amber-700">Nenhum resultado encontrado. Tente outra busca.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Ícone de livro para quando não houver capa
const BookIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);

export default SearchBooks;