import React from 'react';
import { useBooks } from '../context/BooksContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { BookOpen, TrendingUp, Clock, Zap } from 'lucide-react';

const ProgressChart = ({ bookId }) => {
  const { getBook, getSessionsByBook, getNotesByBook } = useBooks();
  const book = getBook(bookId);
  const sessions = getSessionsByBook(bookId);
  const notes = getNotesByBook(bookId);

  if (!book) return null;

  const progressPercentage = book.totalPages > 0 
    ? Math.round((book.currentPage / book.totalPages) * 100) 
    : 0;
  const remainingPages = book.totalPages - (book.currentPage || 0);
  const pagesRead = book.currentPage || 0;

  // Calcular total de páginas lidas nas sessões
  const totalPagesInSessions = sessions.reduce((sum, session) => {
    return sum + (session.endPage - session.startPage);
  }, 0);

  // Calcular tempo total de leitura
  const totalReadingTime = sessions.reduce((sum, session) => sum + session.duration, 0);
  const totalHours = Math.floor(totalReadingTime / 3600);
  const totalMinutes = Math.floor((totalReadingTime % 3600) / 60);

  // Calcular WPM médio
  const averageWPM = sessions.length > 0
    ? Math.round(sessions.reduce((sum, session) => sum + (session.wpm || 0), 0) / sessions.length)
    : 0;

  // Estatísticas de anotações
  const notesByType = {
    anotacao: notes.filter(n => n.type === 'anotacao').length,
    citacao: notes.filter(n => n.type === 'citacao').length,
    marcacao: notes.filter(n => n.type === 'marcacao').length,
  };

  return (
    <div className="space-y-6">
      {/* Progresso Principal */}
      <Card className="bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-xl">
        <CardContent className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold mb-2">Progresso de Leitura</h2>
              <p className="text-white/90">Acompanhe seu avanço no livro</p>
            </div>
            <BookOpen className="h-16 w-16 opacity-80" />
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between text-lg">
              <span>Páginas Lidas</span>
              <span className="font-bold">{pagesRead} / {book.totalPages}</span>
            </div>
            <Progress value={progressPercentage} className="h-4 bg-white/20" />
            <div className="flex justify-between text-2xl font-bold">
              <span>{progressPercentage}% Completo</span>
              <span>{remainingPages} pág. restantes</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total de Páginas Lidas */}
        <Card className="bg-white/80 backdrop-blur border-amber-200 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <BookOpen className="h-10 w-10 text-amber-600" />
              <span className="text-3xl font-bold text-amber-900">{pagesRead}</span>
            </div>
            <p className="text-sm text-amber-700 font-medium">Páginas Lidas</p>
            <p className="text-xs text-amber-600 mt-1">
              {book.totalPages > 0 ? `${progressPercentage}% do total` : 'N/A'}
            </p>
          </CardContent>
        </Card>

        {/* Sessões de Leitura */}
        <Card className="bg-white/80 backdrop-blur border-orange-200 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Clock className="h-10 w-10 text-orange-600" />
              <span className="text-3xl font-bold text-orange-900">{sessions.length}</span>
            </div>
            <p className="text-sm text-orange-700 font-medium">Sessões de Leitura</p>
            <p className="text-xs text-orange-600 mt-1">
              {totalHours}h {totalMinutes}min total
            </p>
          </CardContent>
        </Card>

        {/* WPM Médio */}
        <Card className="bg-white/80 backdrop-blur border-amber-200 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Zap className="h-10 w-10 text-amber-600" />
              <span className="text-3xl font-bold text-amber-900">{averageWPM}</span>
            </div>
            <p className="text-sm text-amber-700 font-medium">WPM Médio</p>
            <p className="text-xs text-amber-600 mt-1">
              {averageWPM > 0 ? 'Palavras por minuto' : 'Sem dados'}
            </p>
          </CardContent>
        </Card>

        {/* Total de Anotações */}
        <Card className="bg-white/80 backdrop-blur border-orange-200 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="h-10 w-10 text-orange-600" />
              <span className="text-3xl font-bold text-orange-900">{notes.length}</span>
            </div>
            <p className="text-sm text-orange-700 font-medium">Anotações</p>
            <p className="text-xs text-orange-600 mt-1">
              {notesByType.anotacao + notesByType.citacao + notesByType.marcacao} total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detalhes de Anotações */}
      {notes.length > 0 && (
        <Card className="bg-white/80 backdrop-blur border-amber-200 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl text-amber-900">Distribuição de Anotações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-3xl font-bold text-amber-900 mb-1">{notesByType.anotacao}</p>
                <p className="text-sm text-amber-700">Anotações</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                <p className="text-3xl font-bold text-orange-900 mb-1">{notesByType.citacao}</p>
                <p className="text-sm text-orange-700">Citações</p>
              </div>
              <div className="text-center p-4 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-3xl font-bold text-amber-900 mb-1">{notesByType.marcacao}</p>
                <p className="text-sm text-amber-700">Marcações</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sessões Recentes */}
      {sessions.length > 0 && (
        <Card className="bg-white/80 backdrop-blur border-amber-200 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl text-amber-900">Sessões Recentes de Leitura</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sessions.slice(-5).reverse().map((session, index) => (
                <div key={session.id} className="flex items-center justify-between p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold">
                      {sessions.length - index}
                    </div>
                    <div>
                      <p className="font-semibold text-amber-900">
                        Páginas {session.startPage} - {session.endPage}
                      </p>
                      <p className="text-sm text-amber-600">
                        {new Date(session.createdAt).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-orange-600">{session.wpm}</p>
                    <p className="text-xs text-amber-700">WPM</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProgressChart;