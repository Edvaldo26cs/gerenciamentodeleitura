import React, { useState, useEffect } from 'react';
import { useBooks } from '../context/BooksContext';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ArrowLeft, Upload, Link as LinkIcon, Save } from 'lucide-react';
import { toast } from '../hooks/use-toast';

const AddEditBook = () => {
  const { id } = useParams();
  const { addBook, updateBook, getBook } = useBooks();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    year: '',
    totalPages: '',
    edition: '',
    publisher: '',
    coverImage: '',
    currentPage: 0,
  });

  const [coverImageType, setCoverImageType] = useState('url');

  useEffect(() => {
    if (isEditMode) {
      const book = getBook(id);
      if (book) {
        setFormData(book);
      }
    }
  }, [id, isEditMode, getBook]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, coverImage: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validação
    if (!formData.title || !formData.author || !formData.year || !formData.totalPages) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    if (isEditMode) {
      updateBook(id, formData);
      toast({
        title: "Sucesso!",
        description: "Livro atualizado com sucesso.",
      });
    } else {
      addBook(formData);
      toast({
        title: "Sucesso!",
        description: "Livro adicionado à biblioteca.",
      });
    }
    
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6 text-amber-700 hover:text-amber-900 hover:bg-amber-100"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Biblioteca
        </Button>

        <Card className="bg-white/80 backdrop-blur border-amber-200 shadow-xl">
          <CardHeader>
            <CardTitle className="text-3xl text-amber-900">
              {isEditMode ? 'Editar Livro' : 'Adicionar Novo Livro'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Capa do Livro */}
              <div className="space-y-2">
                <Label className="text-amber-900">Capa do Livro (Opcional)</Label>
                <Tabs value={coverImageType} onValueChange={setCoverImageType} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="url">
                      <LinkIcon className="h-4 w-4 mr-2" />
                      URL da Imagem
                    </TabsTrigger>
                    <TabsTrigger value="upload">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="url" className="mt-4">
                    <Input
                      type="url"
                      name="coverImage"
                      value={formData.coverImage}
                      onChange={handleChange}
                      placeholder="https://exemplo.com/capa.jpg"
                      className="border-amber-300 focus:border-amber-500"
                    />
                  </TabsContent>
                  <TabsContent value="upload" className="mt-4">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="border-amber-300 focus:border-amber-500"
                    />
                  </TabsContent>
                </Tabs>
                {formData.coverImage && (
                  <div className="mt-4">
                    <img 
                      src={formData.coverImage} 
                      alt="Preview" 
                      className="h-48 w-auto object-cover rounded-lg border-2 border-amber-200 shadow-md"
                    />
                  </div>
                )}
              </div>

              {/* Campos Obrigatórios */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-amber-900">Nome do Livro *</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="border-amber-300 focus:border-amber-500"
                    placeholder="Digite o nome do livro"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="author" className="text-amber-900">Autor *</Label>
                  <Input
                    id="author"
                    name="author"
                    value={formData.author}
                    onChange={handleChange}
                    required
                    className="border-amber-300 focus:border-amber-500"
                    placeholder="Nome do autor"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="year" className="text-amber-900">Ano de Publicação *</Label>
                  <Input
                    id="year"
                    name="year"
                    type="number"
                    value={formData.year}
                    onChange={handleChange}
                    required
                    className="border-amber-300 focus:border-amber-500"
                    placeholder="2024"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="totalPages" className="text-amber-900">Quantidade de Páginas *</Label>
                  <Input
                    id="totalPages"
                    name="totalPages"
                    type="number"
                    value={formData.totalPages}
                    onChange={handleChange}
                    required
                    className="border-amber-300 focus:border-amber-500"
                    placeholder="300"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edition" className="text-amber-900">Número da Edição</Label>
                  <Input
                    id="edition"
                    name="edition"
                    value={formData.edition}
                    onChange={handleChange}
                    className="border-amber-300 focus:border-amber-500"
                    placeholder="1ª Edição"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="publisher" className="text-amber-900">Editora</Label>
                  <Input
                    id="publisher"
                    name="publisher"
                    value={formData.publisher}
                    onChange={handleChange}
                    className="border-amber-300 focus:border-amber-500"
                    placeholder="Nome da editora"
                  />
                </div>

                {isEditMode && (
                  <div className="space-y-2">
                    <Label htmlFor="currentPage" className="text-amber-900">Página Atual</Label>
                    <Input
                      id="currentPage"
                      name="currentPage"
                      type="number"
                      value={formData.currentPage}
                      onChange={handleChange}
                      className="border-amber-300 focus:border-amber-500"
                      placeholder="0"
                      min="0"
                      max={formData.totalPages}
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-lg"
                  size="lg"
                >
                  <Save className="mr-2 h-5 w-5" />
                  {isEditMode ? 'Salvar Alterações' : 'Adicionar Livro'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/')}
                  className="flex-1 border-amber-300 text-amber-700 hover:bg-amber-50"
                  size="lg"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddEditBook;