import React, { useState } from 'react';
import { useBooks } from '../context/BooksContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Calendar, Clock, Target, TrendingUp } from 'lucide-react';
import { toast } from '../hooks/use-toast';

const ReadingPlanner = ({ bookId }) => {
  const { getBook, calculateEstimatedTime, calculateAverageWPM } = useBooks();
  const book = getBook(bookId);
  const averageWPM = calculateAverageWPM(bookId) || 200;

  const [desiredDays, setDesiredDays] = useState('');
  const [dailyMinutes, setDailyMinutes] = useState('');
  const [result, setResult] = useState(null);

  const handleCalculate = () => {
    if (!dailyMinutes) {
      toast({
        title: "Erro",
        description: "Informe o tempo diário disponível.",
        variant: "destructive",
      });
      return;
    }

    const remainingPages = book.totalPages - (book.currentPage || 0);
    const estimated = calculateEstimatedTime(
      book.totalPages,
      book.currentPage || 0,
      parseInt(dailyMinutes),
      averageWPM
    );

    setResult(estimated);

    if (desiredDays && parseInt(desiredDays) < estimated.daysNeeded) {
      toast({
        title: "Atenção!",
        description: `Você precisará de mais tempo diário para atingir sua meta de ${desiredDays} dias.`,
        variant: "destructive",
      });
    } else if (desiredDays) {
      toast({
        title: "Perfeito!",
        description: `Você conseguirá terminar em ${desiredDays} dias com o tempo informado.`,
      });
    }
  };

  const calculateRequiredDailyTime = () => {
    if (!desiredDays) return 0;
    const remainingPages = book.totalPages - (book.currentPage || 0);
    const wordsPerPage = 250;
    const totalWords = remainingPages * wordsPerPage;
    const totalMinutes = totalWords / averageWPM;
    return Math.ceil(totalMinutes / parseInt(desiredDays));
  };

  const remainingPages = book.totalPages - (book.currentPage || 0);
  const progressPercentage = ((book.currentPage || 0) / book.totalPages * 100).toFixed(1);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Planejamento Card */}
      <Card className="bg-white/80 backdrop-blur border-amber-200 shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl text-amber-900">Planejador de Leitura</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status Atual */}
          <div className="bg-gradient-to-r from-amber-100 to-orange-100 p-4 rounded-lg border border-amber-200">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-amber-700 mb-1">Páginas Restantes</p>
                <p className="text-2xl font-bold text-amber-900">{remainingPages}</p>
              </div>
              <div>
                <p className="text-sm text-amber-700 mb-1">Progresso</p>
                <p className="text-2xl font-bold text-amber-900">{progressPercentage}%</p>
              </div>
            </div>
            <div className="mt-3">
              <p className="text-sm text-amber-700 mb-1">Seu WPM Médio</p>
              <p className="text-xl font-bold text-orange-600">{averageWPM} WPM</p>
            </div>
          </div>

          {/* Inputs */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="desiredDays" className="text-amber-900">
                Em quantos dias deseja finalizar? (Opcional)
              </Label>
              <Input
                id="desiredDays"
                type="number"
                value={desiredDays}
                onChange={(e) => setDesiredDays(e.target.value)}
                placeholder="Ex: 30 dias"
                min="1"
                className="border-amber-300 focus:border-amber-500"
              />
              {desiredDays && (
                <p className="text-sm text-amber-700">
                  Tempo diário necessário: <strong>{calculateRequiredDailyTime()} minutos/dia</strong>
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dailyMinutes" className="text-amber-900">
                Tempo diário disponível para leitura *
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  id="dailyMinutes"
                  type="number"
                  value={dailyMinutes}
                  onChange={(e) => setDailyMinutes(e.target.value)}
                  placeholder="Minutos"
                  min="1"
                  className="border-amber-300 focus:border-amber-500"
                />
                <Select value={dailyMinutes} onValueChange={setDailyMinutes}>
                  <SelectTrigger className="border-amber-300">
                    <SelectValue placeholder="Presets" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 min</SelectItem>
                    <SelectItem value="30">30 min</SelectItem>
                    <SelectItem value="45">45 min</SelectItem>
                    <SelectItem value="60">1 hora</SelectItem>
                    <SelectItem value="90">1h 30min</SelectItem>
                    <SelectItem value="120">2 horas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Button
            onClick={handleCalculate}
            className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
            size="lg"
          >
            <Target className="mr-2 h-5 w-5" />
            Calcular Planejamento
          </Button>
        </CardContent>
      </Card>

      {/* Resultados */}
      <Card className="bg-white/80 backdrop-blur border-amber-200 shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl text-amber-900">Previsão de Conclusão</CardTitle>
        </CardHeader>
        <CardContent>
          {!result ? (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-amber-300 mx-auto mb-4" />
              <p className="text-amber-700">Preencha os dados e clique em calcular para ver sua previsão</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Card Principal */}
              <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-6 rounded-xl text-white shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <Calendar className="h-12 w-12" />
                  <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
                    Estimativa
                  </span>
                </div>
                <p className="text-lg mb-2">Você terminará em:</p>
                <p className="text-5xl font-bold mb-2">{result.daysNeeded}</p>
                <p className="text-xl">dias</p>
              </div>

              {/* Detalhes */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-amber-50 border-amber-200">
                  <CardContent className="p-4 text-center">
                    <Clock className="h-8 w-8 text-amber-600 mx-auto mb-2" />
                    <p className="text-sm text-amber-700 mb-1">Total de Horas</p>
                    <p className="text-2xl font-bold text-amber-900">{result.hoursNeeded}h</p>
                  </CardContent>
                </Card>

                <Card className="bg-orange-50 border-orange-200">
                  <CardContent className="p-4 text-center">
                    <TrendingUp className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                    <p className="text-sm text-orange-700 mb-1">Total de Minutos</p>
                    <p className="text-2xl font-bold text-orange-900">{result.totalMinutes}min</p>
                  </CardContent>
                </Card>
              </div>

              {/* Data Prevista */}
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                <p className="text-sm text-amber-700 mb-2">Data prevista de conclusão:</p>
                <p className="text-xl font-bold text-amber-900">
                  {new Date(Date.now() + result.daysNeeded * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>

              {/* Dicas */}
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <p className="text-sm font-semibold text-orange-900 mb-2">✨ Dicas:</p>
                <ul className="text-sm text-orange-800 space-y-1">
                  <li>• Leia todos os dias no mesmo horário para criar um hábito</li>
                  <li>• Use o cronômetro para melhorar seu WPM</li>
                  <li>• Faça anotações das partes importantes</li>
                  <li>• Mantenha seu progresso atualizado</li>
                </ul>
              </div>

              {/* Comparação com Meta */}
              {desiredDays && (
                <div className={`p-4 rounded-lg border-2 ${
                  result.daysNeeded <= parseInt(desiredDays)
                    ? 'bg-green-50 border-green-300'
                    : 'bg-red-50 border-red-300'
                }`}>
                  <p className="text-sm font-semibold mb-1 ${
                    result.daysNeeded <= parseInt(desiredDays) ? 'text-green-900' : 'text-red-900'
                  }">
                    {result.daysNeeded <= parseInt(desiredDays) 
                      ? '✅ Meta Atingível!' 
                      : '⚠️ Meta Desafiadora'}
                  </p>
                  <p className={`text-sm ${
                    result.daysNeeded <= parseInt(desiredDays) ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {result.daysNeeded <= parseInt(desiredDays)
                      ? `Você tem ${parseInt(desiredDays) - result.daysNeeded} dias de folga!`
                      : `Você precisa de ${calculateRequiredDailyTime()} minutos/dia para atingir sua meta de ${desiredDays} dias.`}
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReadingPlanner;