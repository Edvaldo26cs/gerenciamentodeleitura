import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBooks } from '../context/BooksContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ArrowLeft, Edit, Trash2, Clock, BookOpen, StickyNote, Timer, BookMarked, Star } from 'lucide-react';
import NotesTimeline from '../components/NotesTimeline';
import ReadingTimer from '../components/ReadingTimer';
import ReadingPlanner from '../components/ReadingPlanner';
import ProgressChart from '../components/ProgressChart';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Input } from '../components/ui/input';
import { toast } from '../hooks/use-toast';

const BookDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getBook, deleteBook, getNotesByBook, calculateAverageWPM, updateBook } = useBooks();
  const book = getBook(id);
  const notes = getNotesByBook(id);
  const averageWPM = calculateAverageWPM(id);

  const [activeTab, setActiveTab] = useState('overview');
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [currentPageInput, setCurrentPageInput] = useState('');
  const [rating, setRating] = useState(0);

  if (!book) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 flex items-center justify-center">
        <Card className="bg-white/80 backdrop-blur border-amber-200 shadow-xl p-8">
          <p className="text-amber-900 text-xl">Livro não encontrado</p>
          <Button onClick={() => navigate('/')} className="mt-4">Voltar para Biblioteca</Button>
        </Card>
      </div>
    );
  }

  const calculateProgress = () => {
    if (!book.totalPages || book.totalPages === 0) return 0;
    return Math.round((book.currentPage / book.totalPages) * 100);
  };

  const handleDelete = () => {
    deleteBook(id);
    toast({
      title: "Livro removido",
      description: "O livro foi removido da sua biblioteca.",
    });
    navigate('/');
  };
  
  const handleUpdatePage = (e) => {
    e.preventDefault();
    
    if (!currentPageInput) return;
    
    const newPage = parseInt(currentPageInput);
    
    if (isNaN(newPage) || newPage < 0 || newPage > book.totalPages) {
      toast({
        title: "Página inválida",
        description: `Por favor, insira um número entre 0 e ${book.totalPages}.`,
        variant: "destructive",
      });
      return;
    }
    
    updateBook(id, { currentPage: newPage });
    
    toast({
      title: "Progresso atualizado",
      description: `Progresso de "${book.title}" atualizado para página ${newPage}.`,
    });
    
    setShowUpdateModal(false);
  };
  
  const handleRating = (newRating) => {
    updateBook(id, { rating: newRating });
    setRating(newRating);
    
    toast({
      title: "Classificação atualizada",
      description: `Você classificou "${book.title}" com ${newRating} estrelas.`,
    });
  };

  // Inicializa o rating com o valor do livro quando o componente é montado
  useEffect(() => {
    if (book && book.rating !== undefined) {
      setRating(book.rating);
    }
  }, [book]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center mb-6">
          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            className="text-amber-900"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Biblioteca
          </Button>
          <div className="flex gap-2">
            <Button
              onClick={() => {
                setShowUpdateModal(true);
                setCurrentPageInput(book.currentPage.toString());
              }}
              className="bg-amber-500 hover:bg-amber-600 text-white"
            >
              <BookMarked className="mr-2 h-4 w-4" />
              Atualizar Leitura
            </Button>
            <Button
              onClick={() => navigate(`/edit-book/${id}`)}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. O livro e todas as suas anotações serão removidos permanentemente.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Book Header */}
        <Card className="bg-white/80 backdrop-blur border-amber-200 shadow-xl mb-6">
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {book.coverImage && (
                <div className="flex justify-center">
                  <img 
                    src={book.coverImage} 
                    alt={book.title}
                    className="h-80 w-auto object-cover rounded-lg shadow-lg border-4 border-amber-200"
                  />
                </div>
              )}
              <div className={book.coverImage ? 'md:col-span-2' : 'md:col-span-3'}>
                <h1 className="text-4xl font-bold text-amber-900 mb-4">{book.title}</h1>
                <div className="space-y-2 text-amber-700 mb-6">
                  <p className="text-xl"><span className="font-semibold">Autor:</span> {book.author}</p>
                  <p><span className="font-semibold">Ano:</span> {book.year}</p>
                  <p><span className="font-semibold">Páginas:</span> {book.totalPages}</p>
                  {book.edition && <p><span className="font-semibold">Edição:</span> {book.edition}</p>}
                  {book.publisher && <p><span className="font-semibold">Editora:</span> {book.publisher}</p>}
                  {averageWPM > 0 && <p><span className="font-semibold">WPM Médio:</span> {averageWPM}</p>}
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-amber-700">
                    <span className="font-semibold">Progresso de Leitura</span>
                    <span className="font-semibold">{book.currentPage || 0} / {book.totalPages} páginas</span>
                  </div>
                  <Progress value={calculateProgress()} className="h-3" />
                  
                  {/* Sistema de classificação com estrelas */}
                  <div className="mt-4">
                    <p className="font-semibold text-amber-700 mb-1">Classificação:</p>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => handleRating(star)}
                          className="focus:outline-none mr-1"
                        >
                          <Star
                            className={`h-6 w-6 ${
                              star <= rating
                                ? "fill-amber-400 text-amber-400"
                                : "text-gray-300"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <p className="text-right text-lg font-bold text-amber-800">{calculateProgress()}% concluído</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur border-amber-200 p-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">
              <BookOpen className="mr-2 h-4 w-4" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="notes" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">
              <StickyNote className="mr-2 h-4 w-4" />
              Anotações ({notes.length})
            </TabsTrigger>
            <TabsTrigger value="timer" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">
              <Timer className="mr-2 h-4 w-4" />
              Cronômetro
            </TabsTrigger>
            <TabsTrigger value="planning" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">
              <Clock className="mr-2 h-4 w-4" />
              Planejamento
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <ProgressChart bookId={id} />
          </TabsContent>

          <TabsContent value="notes">
            <NotesTimeline bookId={id} totalPages={book.totalPages} />
          </TabsContent>

          <TabsContent value="timer">
            <ReadingTimer bookId={id} totalPages={book.totalPages} />
          </TabsContent>

          <TabsContent value="planning">
            <ReadingPlanner bookId={id} />
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Modal para atualizar página atual */}
      <Dialog open={showUpdateModal} onOpenChange={setShowUpdateModal}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Atualizar Progresso de Leitura</DialogTitle>
            <DialogDescription>
              Informe a página atual da sua leitura.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdatePage}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="currentPage" className="text-right">
                  Página atual:
                </label>
                <Input
                  id="currentPage"
                  type="number"
                  min="0"
                  max={book.totalPages}
                  value={currentPageInput}
                  onChange={(e) => setCurrentPageInput(e.target.value)}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowUpdateModal(false)}>
                Cancelar
              </Button>
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BookDetails;