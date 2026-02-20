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

  // BUSCA DE DADOS COM TRATAMENTO DE ERRO
  useEffect(() => {
    async function carregarProdutos() {
      try {
        const { data, error } = await supabase.from('produtos').select('*');
        if (error) {
          console.error("Erro Supabase:", error.message);
          return;
        }
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
    <main className="min-h-screen bg-gray-50 pb-32">
      <header className="bg-red-600 p-8 text-white text-center shadow-lg">
        <h1 className="text-3xl font-black italic uppercase">Tech Bites 🍔</h1>
      </header>

      <nav className="flex justify-center gap-4 p-4 bg-white sticky top-0 z-10 overflow-x-auto shadow-sm">
        {["Burguers", "Acompanhamentos", "Bebidas"].map((cat) => (
          <button 
            key={cat} 
            onClick={() => setCategoriaAtiva(cat)}
            className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${
              categoriaAtiva === cat ? "bg-red-600 text-white shadow-md" : "bg-gray-100 text-gray-400"
            }`}
          > {cat} </button>
        ))}
      </nav>

      <div className="p-4 max-w-md mx-auto space-y-6">
        {produtosFiltrados.length === 0 && (
          <p className="text-center text-gray-400 py-10 italic">Nenhum item encontrado nesta categoria...</p>
        )}
        
        {produtosFiltrados.map((p) => (
          <div key={p.id} className="bg-white rounded-3xl shadow-md border overflow-hidden flex flex-col transition-all active:scale-95">
            <div className="relative h-48 w-full">
              <Image src={p.imagem} alt={p.nome} fill unoptimized className="object-cover" />
            </div>
            <div className="p-5 flex justify-between items-center">
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-xl">{p.nome}</h3>
                <p className="text-xs text-gray-400 mb-2">{p.descricao}</p>
                <span className="text-red-600 font-black text-2xl">R$ {p.preco}</span>
              </div>
              <button 
                onClick={() => adicionarAoCarrinho(p)} 
                className="bg-red-600 text-white w-14 h-14 rounded-2xl font-bold shadow-lg flex items-center justify-center text-3xl"
              >+</button>
            </div>
          </div>
        ))}
      </div>

      {carrinho.length > 0 && (
        <div className="fixed bottom-6 w-full flex justify-center px-6 z-20">
          <button onClick={() => setIsModalAberto(true)} className="bg-green-600 text-white w-full max-w-md py-5 rounded-3xl font-bold shadow-2xl flex justify-between px-8 items-center">
            <span>🛒 VER CARRINHO ({carrinho.length})</span>
            <span className="text-xl font-black">R$ {valorTotal},00</span>
          </button>
        </div>
      )}

      {isModalAberto && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end justify-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-black uppercase italic text-gray-800">Seu Pedido</h2>
              <button onClick={() => setIsModalAberto(false)} className="text-gray-400 font-bold text-xl">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {carrinho.map((item) => (
                <div key={item.idCarrinho} className="flex justify-between items-center border-b pb-3 border-gray-100">
                  <div>
                    <p className="font-bold text-gray-800">{item.nome}</p>
                    <p className="text-sm text-red-600 font-bold">R$ {item.preco},00</p>
                  </div>
                  <button onClick={() => item.idCarrinho && removerDoCarrinho(item.idCarrinho)} className="text-red-400 text-xs font-bold uppercase hover:text-red-600">Remover</button>
                </div>
              ))}
              <div className="mt-4">
                <input 
                  type="text" 
                  placeholder="Seu endereço completo..." 
                  className="w-full p-4 rounded-xl border bg-gray-50 focus:ring-2 focus:ring-red-500 outline-none" 
                  value={endereco} 
                  onChange={(e) => setEndereco(e.target.value)} 
                />
              </div>
            </div>
            <div className="p-6 border-t bg-white">
              <div className="flex justify-between items-center mb-4">
                <span className="font-bold text-gray-400 uppercase">Total:</span>
                <span className="text-3xl font-black text-green-700">R$ {valorTotal},00</span>
              </div>
              <button onClick={finalizarPedido} className="bg-green-600 text-white w-full py-5 rounded-2xl font-black text-xl shadow-lg uppercase active:bg-green-700">
                ✅ Pedir via WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}