import React, { useState } from 'react';
import { useBooks } from '../context/BooksContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Plus, Edit, Trash2, StickyNote, Quote, Bookmark } from 'lucide-react';
import { toast } from '../hooks/use-toast';

const NotesTimeline = ({ bookId, totalPages }) => {
  const { getNotesByBook, addNote, updateNote, deleteNote } = useBooks();
  const notes = getNotesByBook(bookId);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [formData, setFormData] = useState({
    type: 'anotacao',
    page: '',
    content: '',
  });

  const handleOpenDialog = (note = null) => {
    if (note) {
      setEditingNote(note);
      setFormData({
        type: note.type,
        page: note.page,
        content: note.content,
      });
    } else {
      setEditingNote(null);
      setFormData({ type: 'anotacao', page: '', content: '' });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.page || !formData.content) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    if (parseInt(formData.page) > totalPages || parseInt(formData.page) < 1) {
      toast({
        title: "Erro",
        description: `A página deve estar entre 1 e ${totalPages}.`,
        variant: "destructive",
      });
      return;
    }

    if (editingNote) {
      updateNote(editingNote.id, { ...formData, page: parseInt(formData.page) });
      toast({
        title: "Sucesso!",
        description: "Anotação atualizada.",
      });
    } else {
      addNote({ ...formData, bookId, page: parseInt(formData.page) });
      toast({
        title: "Sucesso!",
        description: "Anotação adicionada.",
      });
    }

    setIsDialogOpen(false);
    setFormData({ type: 'anotacao', page: '', content: '' });
  };

  const handleDelete = (noteId) => {
    deleteNote(noteId);
    toast({
      title: "Anotação removida",
      description: "A anotação foi excluída.",
    });
  };

  const getIcon = (type) => {
    switch (type) {
      case 'anotacao':
        return <StickyNote className="h-5 w-5" />;
      case 'citacao':
        return <Quote className="h-5 w-5" />;
      case 'marcacao':
        return <Bookmark className="h-5 w-5" />;
      default:
        return <StickyNote className="h-5 w-5" />;
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'anotacao':
        return 'Anotação';
      case 'citacao':
        return 'Citação';
      case 'marcacao':
        return 'Marcação';
      default:
        return 'Anotação';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'anotacao':
        return 'from-amber-500 to-orange-500';
      case 'citacao':
        return 'from-orange-500 to-red-500';
      case 'marcacao':
        return 'from-amber-600 to-amber-700';
      default:
        return 'from-amber-500 to-orange-500';
    }
  };

  return (
    <Card className="bg-white/80 backdrop-blur border-amber-200 shadow-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl text-amber-900">Timeline de Anotações</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                onClick={() => handleOpenDialog()}
                className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Nova Anotação
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white">
              <DialogHeader>
                <DialogTitle className="text-amber-900">
                  {editingNote ? 'Editar Anotação' : 'Nova Anotação'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="type" className="text-amber-900">Tipo</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger className="border-amber-300">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="anotacao">Anotação</SelectItem>
                      <SelectItem value="citacao">Citação</SelectItem>
                      <SelectItem value="marcacao">Marcação</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="page" className="text-amber-900">Página</Label>
                  <Input
                    id="page"
                    type="number"
                    value={formData.page}
                    onChange={(e) => setFormData({ ...formData, page: e.target.value })}
                    placeholder="Número da página"
                    min="1"
                    max={totalPages}
                    className="border-amber-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content" className="text-amber-900">Conteúdo</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Digite sua anotação, citação ou marcação..."
                    rows={5}
                    className="border-amber-300"
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700">
                    {editingNote ? 'Salvar' : 'Adicionar'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                    Cancelar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {notes.length === 0 ? (
          <div className="text-center py-12">
            <StickyNote className="h-16 w-16 text-amber-300 mx-auto mb-4" />
            <p className="text-amber-700 mb-4">Nenhuma anotação ainda</p>
            <Button onClick={() => handleOpenDialog()} className="bg-gradient-to-r from-amber-600 to-orange-600">
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Primeira Anotação
            </Button>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-amber-300 to-orange-300"></div>
            
            {/* Notes */}
            <div className="space-y-6">
              {notes.map((note) => (
                <div key={note.id} className="relative pl-20">
                  {/* Timeline Dot */}
                  <div className={`absolute left-5 top-3 w-6 h-6 rounded-full bg-gradient-to-br ${getTypeColor(note.type)} flex items-center justify-center text-white shadow-lg`}>
                    {getIcon(note.type)}
                  </div>
                  
                  {/* Note Card */}
                  <Card className="bg-white border-amber-200 shadow-md hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${getTypeColor(note.type)}`}>
                            {getTypeLabel(note.type)}
                          </span>
                          <span className="ml-2 text-sm text-amber-700 font-semibold">Página {note.page}</span>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleOpenDialog(note)}
                            className="h-8 w-8 p-0 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(note.id)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-amber-900 whitespace-pre-wrap">{note.content}</p>
                      <p className="text-xs text-amber-600 mt-2">
                        {new Date(note.createdAt).toLocaleDateString('pt-BR', { 
                          day: '2-digit', 
                          month: 'long', 
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NotesTimeline;