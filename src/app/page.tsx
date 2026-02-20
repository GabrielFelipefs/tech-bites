"use client";
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Image from 'next/image';
import { supabase } from './lib/supabase'; 

interface Produto {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  categoria: string;
  imagem: string;
  idCarrinho?: number; 
}

export default function Home() {
  const [produtosDoBanco, setProdutosDoBanco] = useState<Produto[]>([]);
  const [carrinho, setCarrinho] = useState<Produto[]>([]);
  const [carregado, setCarregado] = useState(false);
  const [categoriaAtiva, setCategoriaAtiva] = useState<string>("Burguers");
  const [isModalAberto, setIsModalAberto] = useState<boolean>(false);
  const [endereco, setEndereco] = useState("");
  const [animarCarrinho, setAnimarCarrinho] = useState(false);

  // BUSCA DE DADOS
  useEffect(() => {
    async function carregarProdutos() {
      try {
        const { data, error } = await supabase.from('produtos').select('*');
        if (error) return console.error("Erro Supabase:", error.message);
        if (data) setProdutosDoBanco(data);
      } catch (err) {
        console.error("Erro de conexão:", err);
      }
    }
    carregarProdutos();
  }, []);

  // CARREGAR CARRINHO SALVO
  useEffect(() => {
    const salvo = localStorage.getItem('carrinho-techbites');
    if (salvo) {
      try { setCarrinho(JSON.parse(salvo)); } catch (e) { console.error(e); }
    }
    setCarregado(true);
  }, []);

  // SALVAR CARRINHO
  useEffect(() => {
    if (carregado) {
      localStorage.setItem('carrinho-techbites', JSON.stringify(carrinho));
    }
  }, [carrinho, carregado]);

  const adicionarAoCarrinho = useCallback((produto: Produto) => {
    setCarrinho((prev) => [...prev, { ...produto, idCarrinho: Date.now() + Math.random() }]);
    
    // Efeito de animação no botão do carrinho
    setAnimarCarrinho(true);
    setTimeout(() => setAnimarCarrinho(false), 300);
  }, []);

  const removerDoCarrinho = useCallback((id: number) => {
    setCarrinho((prev) => prev.filter(item => item.idCarrinho !== id));
  }, []);

  const valorTotal = useMemo(() => carrinho.reduce((acc, i) => acc + i.preco, 0), [carrinho]);
  
  const produtosFiltrados = useMemo(() => {
    return produtosDoBanco.filter(p => p.categoria === categoriaAtiva);
  }, [categoriaAtiva, produtosDoBanco]);

  const finalizarPedido = () => {
    if (!endereco) return alert("Por favor, informe o endereço!");
    const itens = carrinho.map(i => `- ${i.nome}`).join('\n');
    const msg = encodeURIComponent(`*NOVO PEDIDO*\n\n${itens}\n\n*Total:* R$ ${valorTotal},00\n*Endereço:* ${endereco}`);
    window.open(`https://wa.me/5511999999999?text=${msg}`);
  };

  if (!carregado) return <div className="min-h-screen bg-white" />;

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-200 pb-40 font-sans">
      {/* HEADER */}
      <header className="bg-red-600 p-10 text-white text-center shadow-xl border-b-4 border-red-700">
        <h1 className="text-4xl font-black italic uppercase tracking-tighter">Tech Bites 🍔</h1>
        <p className="text-red-100 text-sm font-bold mt-2">O melhor burger da tecnologia</p>
      </header>

      {/* NAVEGAÇÃO */}
      <nav className="flex justify-center gap-3 p-4 bg-white/90 backdrop-blur-md sticky top-0 z-10 shadow-md border-b">
        {["Burguers", "Acompanhamentos", "Bebidas"].map((cat) => (
          <button 
            key={cat} 
            onClick={() => setCategoriaAtiva(cat)}
            className={`px-5 py-2.5 rounded-2xl font-black text-xs uppercase transition-all duration-300 ${
              categoriaAtiva === cat 
                ? "bg-red-600 text-white shadow-lg scale-105" 
                : "bg-gray-100 text-gray-400 hover:bg-gray-200"
            }`}
          > {cat} </button>
        ))}
      </nav>

      {/* LISTA DE PRODUTOS */}
      <div className="p-6 max-w-md mx-auto space-y-8">
        {produtosFiltrados.length === 0 && (
          <p className="text-center text-gray-400 py-10 italic">Cozinhando itens...</p>
        )}
        
        {produtosFiltrados.map((p) => (
          <div key={p.id} className="bg-white rounded-[2.5rem] shadow-xl border border-white overflow-hidden flex flex-col transition-all hover:shadow-2xl active:scale-95 group">
            <div className="relative h-64 w-full overflow-hidden">
              <Image 
                src={p.imagem} 
                alt={p.nome} 
                fill 
                unoptimized 
                className="object-cover transition-transform duration-700 group-hover:scale-110" 
              />
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-1 rounded-full shadow-md">
                <span className="text-green-600 font-black text-lg">R$ {p.preco}</span>
              </div>
            </div>
            
            <div className="p-8 flex flex-col bg-white">
              <div className="mb-4">
                <h3 className="font-black text-gray-900 text-2xl mb-1 uppercase italic tracking-tight">{p.nome}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{p.descricao}</p>
              </div>

              <button 
                onClick={() => adicionarAoCarrinho(p)} 
                className="bg-red-600 hover:bg-red-700 text-white w-full py-4 rounded-2xl font-black shadow-lg flex items-center justify-center gap-2 transition-all active:scale-90 uppercase italic tracking-widest"
              >
                <span>Adicionar</span>
                <span className="text-2xl">+</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* BOTÃO FLUTUANTE DO CARRINHO */}
      {carrinho.length > 0 && (
        <div className="fixed bottom-8 w-full flex justify-center px-6 z-20">
          <button 
            onClick={() => setIsModalAberto(true)} 
            className={`bg-orange-500 hover:bg-orange-600 text-white w-full max-w-md py-5 rounded-full font-black shadow-2xl flex justify-between px-10 items-center transition-all duration-300 ${
              animarCarrinho ? "scale-110 bg-green-500 shadow-green-200" : "scale-100"
            }`}
          >
            <span className="flex items-center gap-3 text-lg italic">
              🛒 {carrinho.length} ITENS
            </span>
            <span className="text-2xl font-black italic">R$ {valorTotal},00</span>
          </button>
        </div>
      )}

      {/* MODAL DO CARRINHO */}
      {isModalAberto && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-end justify-center p-4 backdrop-blur-sm transition-all">
          <div className="bg-white w-full max-w-md rounded-[3rem] max-h-[85vh] overflow-hidden flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="p-8 border-b flex justify-between items-center bg-gray-50">
              <h2 className="text-2xl font-black uppercase italic text-gray-800 tracking-tighter">Seu Pedido</h2>
              <button onClick={() => setIsModalAberto(false)} className="bg-gray-200 text-gray-600 w-10 h-10 rounded-full font-bold flex items-center justify-center">✕</button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              {carrinho.map((item) => (
                <div key={item.idCarrinho} className="flex justify-between items-center border-b pb-4 border-gray-100">
                  <div>
                    <p className="font-black text-gray-800 uppercase italic">{item.nome}</p>
                    <p className="text-green-600 font-black">R$ {item.preco},00</p>
                  </div>
                  <button onClick={() => item.idCarrinho && removerDoCarrinho(item.idCarrinho)} className="bg-red-50 text-red-500 px-3 py-1 rounded-lg text-xs font-black uppercase hover:bg-red-100">Remover</button>
                </div>
              ))}
              
              <div className="pt-4">
                <label className="text-xs font-black text-gray-400 uppercase ml-1">Endereço de Entrega</label>
                <input 
                  type="text" 
                  placeholder="Rua, número e bairro..." 
                  className="w-full mt-1 p-5 rounded-[1.5rem] border-2 border-gray-100 bg-gray-50 focus:border-red-500 outline-none transition-all font-medium" 
                  value={endereco} 
                  onChange={(e) => setEndereco(e.target.value)} 
                />
              </div>
            </div>

            <div className="p-8 border-t bg-white">
              <div className="flex justify-between items-center mb-6">
                <span className="font-black text-gray-400 uppercase italic">Total</span>
                <span className="text-4xl font-black text-gray-900 tracking-tighter">R$ {valorTotal},00</span>
              </div>
              <button onClick={finalizarPedido} className="bg-green-600 hover:bg-green-700 text-white w-full py-6 rounded-[2rem] font-black text-xl shadow-xl uppercase italic tracking-widest active:scale-95 transition-all">
                🚀 Enviar Pedido
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}