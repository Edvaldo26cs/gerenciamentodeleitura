import React, { useState, useEffect } from 'react';
import { useBooks } from '../context/BooksContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Play, Pause, RotateCcw, Save } from 'lucide-react';
import { toast } from '../hooks/use-toast';

const ReadingTimer = ({ bookId, totalPages }) => {
  const { addReadingSession, getSessionsByBook, updateBook, getBook } = useBooks();
  const book = getBook(bookId);
  const sessions = getSessionsByBook(bookId);

  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [startPage, setStartPage] = useState('');
  const [endPage, setEndPage] = useState('');
  const [wpm, setWpm] = useState(null);

  useEffect(() => {
    let interval = null;
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds(prevSeconds => prevSeconds + 1);
      }, 1000);
    } else if (!isRunning && seconds !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning, seconds]);

  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    if (!startPage) {
      toast({
        title: "Erro",
        description: "Informe a página inicial.",
        variant: "destructive",
      });
      return;
    }
    if (parseInt(startPage) < 1 || parseInt(startPage) > totalPages) {
      toast({
        title: "Erro",
        description: `A página inicial deve estar entre 1 e ${totalPages}.`,
        variant: "destructive",
      });
      return;
    }
    setIsRunning(true);
    toast({
      title: "Cronômetro iniciado!",
      description: `Começando da página ${startPage}`,
    });
  };

  const handleStop = () => {
    if (!endPage) {
      toast({
        title: "Erro",
        description: "Informe a página final.",
        variant: "destructive",
      });
      return;
    }
    
    const start = parseInt(startPage);
    const end = parseInt(endPage);

    if (end < 1 || end > totalPages) {
      toast({
        title: "Erro",
        description: `A página final deve estar entre 1 e ${totalPages}.`,
        variant: "destructive",
      });
      return;
    }

    if (end <= start) {
      toast({
        title: "Erro",
        description: "A página final deve ser maior que a inicial.",
        variant: "destructive",
      });
      return;
    }

    setIsRunning(false);
    calculateWPM(start, end, seconds);
  };

  const calculateWPM = (start, end, totalSeconds) => {
    const pagesRead = end - start;
    const wordsPerPage = 250; // Padrão para literatura
    const totalWords = pagesRead * wordsPerPage;
    const minutes = totalSeconds / 60;
    const calculatedWPM = Math.round(totalWords / minutes);

    setWpm(calculatedWPM);

    // Salvar sessão
    addReadingSession({
      bookId,
      startPage: start,
      endPage: end,
      duration: totalSeconds,
      wpm: calculatedWPM,
    });

    // Atualizar página atual do livro
    updateBook(bookId, { currentPage: end });

    toast({
      title: "Sessão de leitura salva!",
      description: `Sua velocidade de leitura foi de ${calculatedWPM} WPM`,
    });
  };

  const handleReset = () => {
    setIsRunning(false);
    setSeconds(0);
    setStartPage('');
    setEndPage('');
    setWpm(null);
  };

  const calculateAverageWPM = () => {
    if (sessions.length === 0) return 0;
    const total = sessions.reduce((sum, session) => sum + (session.wpm || 0), 0);
    return Math.round(total / sessions.length);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Timer Card */}
      <Card className="bg-white/80 backdrop-blur border-amber-200 shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl text-amber-900">Cronômetro de Leitura</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Display do Timer */}
          <div className="text-center py-8">
            <div className="text-6xl font-bold text-amber-900 mb-4 font-mono">
              {formatTime(seconds)}
            </div>
            {wpm && (
              <div className="text-2xl font-semibold text-orange-600">
                {wpm} WPM
              </div>
            )}
          </div>

          {/* Inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startPage" className="text-amber-900">Página Inicial</Label>
              <Input
                id="startPage"
                type="number"
                value={startPage}
                onChange={(e) => setStartPage(e.target.value)}
                disabled={isRunning}
                min="1"
                max={totalPages}
                placeholder="Ex: 1"
                className="border-amber-300 focus:border-amber-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endPage" className="text-amber-900">Página Final</Label>
              <Input
                id="endPage"
                type="number"
                value={endPage}
                onChange={(e) => setEndPage(e.target.value)}
                disabled={!isRunning}
                min="1"
                max={totalPages}
                placeholder="Ex: 50"
                className="border-amber-300 focus:border-amber-500"
              />
            </div>
          </div>

          {/* Controles */}
          <div className="flex gap-2">
            {!isRunning ? (
              <Button
                onClick={handleStart}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                size="lg"
              >
                <Play className="mr-2 h-5 w-5" />
                Iniciar
              </Button>
            ) : (
              <Button
                onClick={handleStop}
                className="flex-1 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700"
                size="lg"
              >
                <Pause className="mr-2 h-5 w-5" />
                Parar e Calcular
              </Button>
            )}
            <Button
              onClick={handleReset}
              variant="outline"
              size="lg"
              className="border-amber-300 text-amber-700 hover:bg-amber-50"
            >
              <RotateCcw className="h-5 w-5" />
            </Button>
          </div>

          {/* Info */}
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
            <p className="text-sm text-amber-800">
              <strong>Como usar:</strong> Informe a página inicial, clique em Iniciar, leia normalmente e ao terminar informe a página final e clique em Parar. O sistema calculará sua velocidade de leitura em palavras por minuto (WPM) usando a média de 250 palavras por página.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Histórico de Sessões */}
      <Card className="bg-white/80 backdrop-blur border-amber-200 shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl text-amber-900">Histórico de Sessões</CardTitle>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <div className="text-center py-12">
              <Play className="h-16 w-16 text-amber-300 mx-auto mb-4" />
              <p className="text-amber-700">Nenhuma sessão de leitura registrada ainda</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Média WPM */}
              <div className="bg-gradient-to-r from-amber-100 to-orange-100 p-4 rounded-lg border border-amber-200">
                <p className="text-sm text-amber-700 mb-1">WPM Médio</p>
                <p className="text-3xl font-bold text-amber-900">{calculateAverageWPM()} WPM</p>
              </div>

              {/* Lista de Sessões */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {sessions.map((session, index) => (
                  <div key={session.id} className="bg-white p-4 rounded-lg border border-amber-200 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-amber-900">Sessão {sessions.length - index}</p>
                        <p className="text-sm text-amber-600">
                          {new Date(session.createdAt).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold rounded-full">
                        {session.wpm} WPM
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm text-amber-700">
                      <div>
                        <p className="text-xs text-amber-600">Páginas</p>
                        <p className="font-semibold">{session.startPage} - {session.endPage}</p>
                      </div>
                      <div>
                        <p className="text-xs text-amber-600">Lidas</p>
                        <p className="font-semibold">{session.endPage - session.startPage} pág.</p>
                      </div>
                      <div>
                        <p className="text-xs text-amber-600">Tempo</p>
                        <p className="font-semibold">{Math.round(session.duration / 60)} min</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReadingTimer;