"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuth } from "@/contexts/AuthContext";

type Subcategory = {
  id: number;
  categoria_id: number;
  nome: string;
  cor?: string;
  icone?: string;
};

type Category = {
  id: number;
  nome: string;
  tipo: string;
  cor?: string;
  icone?: string;
  subcategorias?: Subcategory[];
};

const EXPENSE_CATEGORIES = [
  { nome: "Cartões", cor: "#8b5cf6", icone: "credit-card" },
  { nome: "Casa", cor: "#06b6d4", icone: "home" },
  { nome: "Educação", cor: "#8b5cf6", icone: "book" },
  { nome: "Eletrônicos", cor: "#f59e0b", icone: "device" },
  { nome: "Lazer", cor: "#f97316", icone: "game" },
  { nome: "Outros", cor: "#6b7280", icone: "dots" },
  { nome: "Restaurante", cor: "#dc2626", icone: "restaurant" },
  { nome: "Saúde", cor: "#10b981", icone: "health" },
  { nome: "Serviços", cor: "#059669", icone: "service" },
  { nome: "Supermercado", cor: "#ef4444", icone: "cart" },
  { nome: "Transporte", cor: "#06b6d4", icone: "car" },
  { nome: "Vestuário", cor: "#06b6d4", icone: "shirt" },
  { nome: "Viagem", cor: "#06b6d4", icone: "plane" },
];

const INCOME_CATEGORIES = [
  { nome: "Investimentos", cor: "#10b981", icone: "chart" },
  { nome: "Outros", cor: "#dc2626", icone: "dots" },
  { nome: "Presente", cor: "#8b5cf6", icone: "gift" },
  { nome: "Prêmios", cor: "#f59e0b", icone: "award" },
  { nome: "Salário", cor: "#06b6d4", icone: "money" },
];

const AVAILABLE_COLORS = [
  "#06b6d4",
  "#8b5cf6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#f97316",
  "#059669",
  "#dc2626",
  "#6b7280",
  "#3b82f6",
  "#ec4899",
  "#84cc16",
];

const AVAILABLE_ICONS = [
  // Transporte
  { id: "car", name: "Carro" },
  { id: "plane", name: "Avião" },
  { id: "bus", name: "Ônibus" },
  { id: "bicycle", name: "Bicicleta" },
  { id: "gas-pump", name: "Posto de Gasolina" },
  { id: "taxi", name: "Táxi" },
  { id: "motorcycle", name: "Motocicleta" },
  { id: "train", name: "Trem" },

  // Casa e Moradia
  { id: "home", name: "Casa" },
  { id: "building", name: "Prédio" },
  { id: "key", name: "Chave" },
  { id: "bed", name: "Cama" },
  { id: "lamp", name: "Lâmpada" },
  { id: "couch", name: "Sofá" },
  { id: "hammer", name: "Ferramenta" },
  { id: "paint-brush", name: "Pincel" },

  // Alimentação
  { id: "restaurant", name: "Restaurante" },
  { id: "coffee", name: "Café" },
  { id: "pizza", name: "Pizza" },
  { id: "burger", name: "Hambúrguer" },
  { id: "apple", name: "Maçã" },
  { id: "wine", name: "Vinho" },
  { id: "cake", name: "Bolo" },
  { id: "ice-cream", name: "Sorvete" },

  // Compras
  { id: "cart", name: "Carrinho" },
  { id: "bag", name: "Sacola" },
  { id: "shirt", name: "Camisa" },
  { id: "shoe", name: "Sapato" },
  { id: "watch", name: "Relógio" },
  { id: "diamond", name: "Diamante" },
  { id: "glasses", name: "Óculos" },
  { id: "tie", name: "Gravata" },

  // Saúde e Bem-estar
  { id: "health", name: "Saúde" },
  { id: "heart", name: "Coração" },
  { id: "pill", name: "Remédio" },
  { id: "tooth", name: "Dente" },
  { id: "eye", name: "Olho" },
  { id: "dumbbell", name: "Haltere" },
  { id: "yoga", name: "Yoga" },
  { id: "stethoscope", name: "Estetoscópio" },

  // Entretenimento
  { id: "game", name: "Jogo" },
  { id: "music", name: "Música" },
  { id: "movie", name: "Filme" },
  { id: "camera", name: "Câmera" },
  { id: "tv", name: "TV" },
  { id: "headphones", name: "Fones" },
  { id: "guitar", name: "Violão" },
  { id: "microphone", name: "Microfone" },

  // Tecnologia
  { id: "device", name: "Dispositivo" },
  { id: "laptop", name: "Laptop" },
  { id: "phone", name: "Telefone" },
  { id: "wifi", name: "WiFi" },
  { id: "battery", name: "Bateria" },
  { id: "usb", name: "USB" },
  { id: "printer", name: "Impressora" },
  { id: "monitor", name: "Monitor" },

  // Educação
  { id: "book", name: "Livro" },
  { id: "graduation-cap", name: "Formatura" },
  { id: "pencil", name: "Lápis" },
  { id: "calculator", name: "Calculadora" },
  { id: "globe", name: "Globo" },
  { id: "microscope", name: "Microscópio" },
  { id: "ruler", name: "Régua" },
  { id: "backpack", name: "Mochila" },

  // Trabalho e Negócios
  { id: "briefcase", name: "Maleta" },
  { id: "chart", name: "Gráfico" },
  { id: "presentation", name: "Apresentação" },
  { id: "calendar", name: "Calendário" },
  { id: "clock", name: "Relógio" },
  { id: "folder", name: "Pasta" },
  { id: "document", name: "Documento" },
  { id: "email", name: "Email" },

  // Finanças
  { id: "money", name: "Dinheiro" },
  { id: "credit-card", name: "Cartão" },
  { id: "bank", name: "Banco" },
  { id: "coins", name: "Moedas" },
  { id: "piggy-bank", name: "Cofrinho" },
  { id: "receipt", name: "Recibo" },
  { id: "safe", name: "Cofre" },
  { id: "investment", name: "Investimento" },

  // Lazer e Hobbies
  { id: "beach", name: "Praia" },
  { id: "mountain", name: "Montanha" },
  { id: "tent", name: "Barraca" },
  { id: "fishing", name: "Pesca" },
  { id: "ball", name: "Bola" },
  { id: "trophy", name: "Troféu" },
  { id: "puzzle", name: "Quebra-cabeça" },
  { id: "paintbrush", name: "Pintura" },

  // Animais e Pets
  { id: "dog", name: "Cachorro" },
  { id: "cat", name: "Gato" },
  { id: "bird", name: "Pássaro" },
  { id: "fish", name: "Peixe" },
  { id: "paw", name: "Pata" },
  { id: "bone", name: "Osso" },
  { id: "pet-food", name: "Ração" },
  { id: "veterinary", name: "Veterinário" },

  // Serviços
  { id: "service", name: "Serviço" },
  { id: "cleaning", name: "Limpeza" },
  { id: "laundry", name: "Lavanderia" },
  { id: "barber", name: "Barbeiro" },
  { id: "spa", name: "Spa" },
  { id: "repair", name: "Reparo" },
  { id: "delivery", name: "Entrega" },
  { id: "taxi-service", name: "Serviço de Táxi" },

  // Diversos
  { id: "gift", name: "Presente" },
  { id: "award", name: "Prêmio" },
  { id: "star", name: "Estrela" },
  { id: "fire", name: "Fogo" },
  { id: "lightning", name: "Raio" },
  { id: "cloud", name: "Nuvem" },
  { id: "sun", name: "Sol" },
  { id: "moon", name: "Lua" },
  { id: "tree", name: "Árvore" },
  { id: "flower", name: "Flor" },
  { id: "dots", name: "Outros" },
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"Despesa" | "Receita">("Despesa");
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(
    new Set()
  );

  // Subcategorias
  const [showSubcategoryForm, setShowSubcategoryForm] = useState(false);
  const [editingSubcategory, setEditingSubcategory] =
    useState<Subcategory | null>(null);
  const [selectedCategoryForSub, setSelectedCategoryForSub] = useState<
    number | null
  >(null);

  // Formulário de categoria
  const [formData, setFormData] = useState({
    nome: "",
    tipo: "Despesa",
    cor: "#06b6d4",
    icone: "dots",
  });

  // Formulário de subcategoria
  const [subFormData, setSubFormData] = useState({
    nome: "",
    cor: "#06b6d4",
    icone: "dots",
  });

  const { isDark, mounted } = useTheme();
  const { t } = useTranslation();
  const { user } = useAuth();

  // Carregar categorias
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/categories`,
          {
            credentials: "include",
          }
        );
        if (response.ok) {
          const data = await response.json();
          setCategories(Array.isArray(data) ? data : []);
        }
      } catch (err: any) {
        setError(err.message || t("common.error"));
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [t]);

  // Filtrar categorias por tipo
  const filteredCategories = categories.filter(
    (category) => category.tipo === activeTab
  );

  // Submeter formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingCategory
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/categories/${editingCategory.id}`
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/categories`;

      const method = editingCategory ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        // Recarregar categorias
        const categoriesRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/categories`,
          {
            credentials: "include",
          }
        );
        if (categoriesRes.ok) {
          const data = await categoriesRes.json();
          setCategories(Array.isArray(data) ? data : []);
        }

        // Resetar formulário
        setFormData({
          nome: "",
          tipo: "Despesa",
          cor: "#06b6d4",
          icone: "dots",
        });
        setShowForm(false);
        setEditingCategory(null);
      } else {
        throw new Error("Falha ao salvar categoria");
      }
    } catch (err: any) {
      setError(err.message || t("common.error"));
    } finally {
      setLoading(false);
    }
  };

  // Excluir categoria
  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir esta categoria?")) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/categories/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (response.ok) {
        setCategories(categories.filter((c) => c.id !== id));
      } else {
        throw new Error("Falha ao excluir categoria");
      }
    } catch (err: any) {
      setError(err.message || t("common.error"));
    }
  };

  // Editar categoria
  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      nome: category.nome,
      tipo: category.tipo,
      cor: category.cor || "#06b6d4",
      icone: category.icone || "dots",
    });
    setShowForm(true);
  };

  // Abrir formulário para nova categoria
  const openForm = (tipo: "Despesa" | "Receita") => {
    setFormData({
      nome: "",
      tipo,
      cor: "#06b6d4",
      icone: "dots",
    });
    setEditingCategory(null);
    setShowForm(true);
  };

  // Fechar formulário
  const closeForm = () => {
    setShowForm(false);
    setEditingCategory(null);
    setFormData({
      nome: "",
      tipo: "Despesa",
      cor: "#06b6d4",
      icone: "dots",
    });
  };

  // Gerenciar expansão de categorias
  const toggleCategory = (categoryId: number) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  // Abrir formulário de subcategoria
  const openSubcategoryForm = (categoryId: number) => {
    setSelectedCategoryForSub(categoryId);
    setSubFormData({
      nome: "",
      cor: "#06b6d4",
      icone: "dots",
    });
    setEditingSubcategory(null);
    setShowSubcategoryForm(true);
  };

  // Fechar formulário de subcategoria
  const closeSubcategoryForm = () => {
    setShowSubcategoryForm(false);
    setEditingSubcategory(null);
    setSelectedCategoryForSub(null);
    setSubFormData({
      nome: "",
      cor: "#06b6d4",
      icone: "dots",
    });
  };

  // Editar subcategoria
  const handleEditSubcategory = (subcategory: Subcategory) => {
    setEditingSubcategory(subcategory);
    setSelectedCategoryForSub(subcategory.categoria_id);
    setSubFormData({
      nome: subcategory.nome,
      cor: subcategory.cor || "#06b6d4",
      icone: subcategory.icone || "dots",
    });
    setShowSubcategoryForm(true);
  };

  // Submeter formulário de subcategoria
  const handleSubcategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingSubcategory
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/subcategories/${editingSubcategory.id}`
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/categories/${selectedCategoryForSub}/subcategories`;

      const method = editingSubcategory ? "PUT" : "POST";
      const body = editingSubcategory
        ? subFormData
        : { ...subFormData, categoria_id: selectedCategoryForSub };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(body),
      });

      if (response.ok) {
        // Recarregar categorias
        const categoriesRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/categories`,
          {
            credentials: "include",
          }
        );
        if (categoriesRes.ok) {
          const data = await categoriesRes.json();
          setCategories(Array.isArray(data) ? data : []);
        }

        closeSubcategoryForm();
      } else {
        throw new Error("Falha ao salvar subcategoria");
      }
    } catch (err: any) {
      setError(err.message || t("common.error"));
    } finally {
      setLoading(false);
    }
  };

  // Excluir subcategoria
  const handleDeleteSubcategory = async (subcategoryId: number) => {
    if (!confirm("Tem certeza que deseja excluir esta subcategoria?")) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/subcategories/${subcategoryId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (response.ok) {
        // Recarregar categorias
        const categoriesRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/categories`,
          {
            credentials: "include",
          }
        );
        if (categoriesRes.ok) {
          const data = await categoriesRes.json();
          setCategories(Array.isArray(data) ? data : []);
        }
      } else {
        throw new Error("Falha ao excluir subcategoria");
      }
    } catch (err: any) {
      setError(err.message || t("common.error"));
    }
  };

  // Adicionar categorias padrão
  const addDefaultCategories = async () => {
    const categoriesToAdd =
      activeTab === "Despesa" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

    try {
      for (const category of categoriesToAdd) {
        await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/categories`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            nome: category.nome,
            tipo: activeTab,
            cor: category.cor,
            icone: category.icone,
          }),
        });
      }

      // Recarregar categorias
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/categories`,
        {
          credentials: "include",
        }
      );
      if (response.ok) {
        const data = await response.json();
        setCategories(Array.isArray(data) ? data : []);
      }
    } catch (err: any) {
      setError(err.message || "Erro ao adicionar categorias padrão");
    }
  };

  // Renderizar ícone
  const renderIcon = (iconId: string, className: string = "w-6 h-6") => {
    const iconMap: { [key: string]: React.ReactElement } = {
      // Transporte
      "credit-card": (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
          />
        </svg>
      ),
      bus: (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 17a2 2 0 100 4 2 2 0 000-4zM16 17a2 2 0 100 4 2 2 0 000-4zM5 6h14l-1 8H6L5 6zM5 6L4 2H2"
          />
        </svg>
      ),
      bicycle: (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <circle cx="18" cy="18" r="3" strokeWidth={2} />
          <circle cx="6" cy="18" r="3" strokeWidth={2} />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="m8 16 2.5-3 2.5 3-2.5 3-2.5-3z"
          />
        </svg>
      ),
      "gas-pump": (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      ),
      taxi: (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 17a2 2 0 100 4 2 2 0 000-4zM16 17a2 2 0 100 4 2 2 0 000-4zM5 8h14l-2 8H7L5 8zM5 8L4 4H2"
          />
        </svg>
      ),
      motorcycle: (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <circle cx="5" cy="18" r="3" strokeWidth={2} />
          <circle cx="19" cy="18" r="3" strokeWidth={2} />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 18h8m-8-8h4l2-4h4"
          />
        </svg>
      ),
      train: (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <rect x="4" y="4" width="16" height="12" rx="2" strokeWidth={2} />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 20v2m8-2v2M4 12h16"
          />
        </svg>
      ),

      // Casa e Moradia
      building: (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
      ),
      key: (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
          />
        </svg>
      ),
      bed: (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12h18m-9 4.5V16.5m0 0V12m0 4.5h4.5m-4.5 0H8.25"
          />
        </svg>
      ),
      lamp: (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        </svg>
      ),
      couch: (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 10h18M7 15h10m-10 0a2 2 0 01-2-2V7a2 2 0 012-2h10a2 2 0 012 2v6a2 2 0 01-2 2m-10 0v4m10-4v4"
          />
        </svg>
      ),
      hammer: (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
        </svg>
      ),
      "paint-brush": (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM7 10V9a2 2 0 012-2h.5m10.5 11V9a2 2 0 00-2-2H15"
          />
        </svg>
      ),

      // Alimentação
      coffee: (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
          />
        </svg>
      ),
      pizza: (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" r="10" strokeWidth={2} />
          <circle cx="9" cy="9" r="1" fill="currentColor" />
          <circle cx="15" cy="9" r="1" fill="currentColor" />
          <circle cx="12" cy="15" r="1" fill="currentColor" />
        </svg>
      ),
      burger: (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      ),
      apple: (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      ),
      wine: (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
          />
        </svg>
      ),
      cake: (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253"
          />
        </svg>
      ),
      "ice-cream": (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 18l-7-7 7-7 7 7-7 7z"
          />
        </svg>
      ),

      // Compras
      bag: (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l-1 12H6L5 9z"
          />
        </svg>
      ),
      shoe: (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 21h18l-3-6H6l-3 6zM9 9V6a3 3 0 016 0v3"
          />
        </svg>
      ),
      watch: (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" r="7" strokeWidth={2} />
          <polyline points="12,6 12,12 16,14" strokeWidth={2} />
        </svg>
      ),
      diamond: (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <polygon points="12,2 22,8.5 12,15 2,8.5" strokeWidth={2} />
        </svg>
      ),
      glasses: (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <circle cx="6" cy="15" r="4" strokeWidth={2} />
          <circle cx="18" cy="15" r="4" strokeWidth={2} />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 11h12"
          />
        </svg>
      ),

      // Saúde
      heart: (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      ),
      pill: (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <rect x="3" y="11" width="18" height="2" rx="1" strokeWidth={2} />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 7v10"
          />
        </svg>
      ),
      tooth: (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 2C8 2 5 5 5 9v6c0 1 1 2 2 2s2-1 2-2v-2c0-1 1-2 2-2h2c1 0 2 1 2 2v2c0 1 1 2 2 2s2-1 2-2V9c0-4-3-7-7-7z"
          />
        </svg>
      ),
      dumbbell: (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 12h12M6 8v8M18 8v8M3 10v4M21 10v4"
          />
        </svg>
      ),

      // Entretenimento
      music: (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19c-4.286 1.35-4.286-2.55-6-3m12 5v-3.5c0-1-1.5-1.5-3-1l-1.5.5c-1.5.5-3 1.5-3 2.5V21"
          />
        </svg>
      ),
      movie: (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <rect x="2" y="3" width="20" height="14" rx="2" strokeWidth={2} />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="m22 6-10 6L2 6"
          />
        </svg>
      ),
      camera: (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
          />
          <circle cx="12" cy="13" r="3" strokeWidth={2} />
        </svg>
      ),
      tv: (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <rect x="2" y="7" width="20" height="15" rx="2" strokeWidth={2} />
          <polyline points="17,2 12,7 7,2" strokeWidth={2} />
        </svg>
      ),

      // Tecnologia
      laptop: (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <rect x="4" y="4" width="16" height="12" rx="1" strokeWidth={2} />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M2 18h20"
          />
        </svg>
      ),
      phone: (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <rect x="5" y="2" width="14" height="20" rx="2" strokeWidth={2} />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 18h.01"
          />
        </svg>
      ),
      wifi: (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
          />
        </svg>
      ),

      // Educação
      "graduation-cap": (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 14l9-5-9-5-9 5 9 5z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 14v7"
          />
        </svg>
      ),
      pencil: (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
          />
        </svg>
      ),
      calculator: (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <rect x="4" y="2" width="16" height="20" rx="2" strokeWidth={2} />
          <rect x="8" y="6" width="8" height="2" strokeWidth={2} />
          <rect x="8" y="10" width="2" height="2" strokeWidth={2} />
          <rect x="12" y="10" width="2" height="2" strokeWidth={2} />
        </svg>
      ),

      // Trabalho
      briefcase: (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <rect x="2" y="7" width="20" height="14" rx="2" strokeWidth={2} />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2-2v16"
          />
        </svg>
      ),
      calendar: (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" strokeWidth={2} />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 2v4M8 2v4M3 10h18"
          />
        </svg>
      ),
      clock: (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" r="10" strokeWidth={2} />
          <polyline points="12,6 12,12 16,14" strokeWidth={2} />
        </svg>
      ),

      // Finanças
      bank: (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
      ),
      coins: (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <circle cx="8" cy="8" r="6" strokeWidth={2} />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M18.09 10.37a6 6 0 110 8.26"
          />
        </svg>
      ),
      "piggy-bank": (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m0 0h10a2 2 0 002-2v-2a2 2 0 00-2-2H9.5a2 2 0 01-2-2V7"
          />
        </svg>
      ),

      // Animais
      dog: (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6V4m0 2a4 4 0 100 8m0-8a4 4 0 110 8m-6 8a2 2 0 100-4m0 4a2 2 0 100-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100-4m0 4v2m0-6V4"
          />
        </svg>
      ),
      cat: (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6V4m0 2a4 4 0 100 8m0-8a4 4 0 110 8m-6 8a2 2 0 100-4m0 4a2 2 0 100-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100-4m0 4v2m0-6V4"
          />
        </svg>
      ),

      // Serviços
      cleaning: (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      ),
      delivery: (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <rect x="1" y="3" width="15" height="13" strokeWidth={2} />
          <polygon points="16,8 20,8 23,11 23,16 16,16" strokeWidth={2} />
          <circle cx="5.5" cy="18.5" r="2.5" strokeWidth={2} />
          <circle cx="18.5" cy="18.5" r="2.5" strokeWidth={2} />
        </svg>
      ),

      // Lazer
      beach: (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ),
      star: (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <polygon
            points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
            strokeWidth={2}
          />
        </svg>
      ),
      fire: (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ),
      lightning: (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <polygon points="13,2 3,14 12,14 11,22 21,10 12,10" strokeWidth={2} />
        </svg>
      ),
      sun: (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" r="5" strokeWidth={2} />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
          />
        </svg>
      ),
      home: (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
      book: (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      ),
      device: (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      ),
      game: (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
          />
        </svg>
      ),
      dots: (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
          />
        </svg>
      ),
      restaurant: (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
          />
        </svg>
      ),
      health: (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      ),
      service: (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
      cart: (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 3h2l.4 2M7 13h10l4-8H5.4m1.6 8L6 5H3m4 8a2 2 0 104 0m6 0a2 2 0 104 0"
          />
        </svg>
      ),
      car: (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 17a2 2 0 100 4 2 2 0 000-4zM16 17a2 2 0 100 4 2 2 0 000-4zM5 6h14l-1 8H6L5 6zM5 6L4 2H2"
          />
        </svg>
      ),
      shirt: (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
      plane: (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
          />
        </svg>
      ),
      chart: (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
      gift: (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
          />
        </svg>
      ),
      award: (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
          />
        </svg>
      ),
      money: (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
          />
        </svg>
      ),

      // Ícones que estavam faltando
      eye: (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
          />
        </svg>
      ),
      yoga: (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          />
        </svg>
      ),
      stethoscope: (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      headphones: (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
          />
        </svg>
      ),
      guitar: (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19c-4.286 1.35-4.286-2.55-6-3m12 5v-3.5c0-1-1.5-1.5-3-1l-1.5.5c-1.5.5-3 1.5-3 2.5V21"
          />
        </svg>
      ),
      microphone: (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
          />
        </svg>
      ),
      battery: (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <rect x="1" y="6" width="18" height="12" rx="2" strokeWidth={2} />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M23 13v-2"
          />
        </svg>
      ),
      usb: (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
      printer: (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <polyline points="6,9 6,2 18,2 18,9" strokeWidth={2} />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"
          />
          <rect x="6" y="14" width="12" height="8" strokeWidth={2} />
        </svg>
      ),
      monitor: (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <rect x="2" y="3" width="20" height="14" rx="2" strokeWidth={2} />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 21l4-7 4 7"
          />
        </svg>
      ),
      globe: (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" r="10" strokeWidth={2} />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"
          />
        </svg>
      ),
      microscope: (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      ),
      ruler: (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
      ),
      backpack: (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l-1 12H6L5 9z"
          />
        </svg>
      ),
      presentation: (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2M7 4h10M7 4l-2 16h14l-2-16M9 9h6M9 13h6M9 17h4"
          />
        </svg>
      ),
      folder: (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
          />
        </svg>
      ),
      document: (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
      email: (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      ),
      receipt: (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
      safe: (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" strokeWidth={2} />
          <circle cx="12" cy="16" r="1" strokeWidth={2} />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 11V7a5 5 0 0110 0v4"
          />
        </svg>
      ),
      investment: (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
          />
        </svg>
      ),
      mountain: (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
          />
        </svg>
      ),
      tent: (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 21h18l-9-18-9 18z"
          />
        </svg>
      ),
      fishing: (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      ),
      ball: (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" r="10" strokeWidth={2} />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h8M12 8v8"
          />
        </svg>
      ),
      trophy: (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
          />
        </svg>
      ),
      puzzle: (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a1 1 0 01-1-1V9a1 1 0 011-1h1a2 2 0 100-4H4a1 1 0 01-1-1V5a1 1 0 011-1h3a1 1 0 001-1V4z"
          />
        </svg>
      ),
      paintbrush: (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM7 10V9a2 2 0 012-2h.5m10.5 11V9a2 2 0 00-2-2H15"
          />
        </svg>
      ),
      bird: (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
          />
        </svg>
      ),
      fish: (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      ),
      paw: (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      ),
      bone: (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      ),
      "pet-food": (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      ),
      veterinary: (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      laundry: (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      ),
      barber: (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
          />
        </svg>
      ),
      spa: (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ),
      repair: (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
        </svg>
      ),
      "taxi-service": (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 17a2 2 0 100 4 2 2 0 000-4zM16 17a2 2 0 100 4 2 2 0 000-4zM5 8h14l-2 8H7L5 8zM5 8L4 4H2"
          />
        </svg>
      ),
      cloud: (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
          />
        </svg>
      ),
      moon: (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      ),
      tree: (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ),
      flower: (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ),
      tie: (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
    };

    return iconMap[iconId] || iconMap["dots"];
  };

  if (!mounted) {
    return null;
  }

  return (
    <>
      <div className="w-full min-h-screen relative">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <div
            className={`transition-all duration-1000 w-full ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            {/* Header */}
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1
                    className={`text-2xl sm:text-3xl font-bold mb-2 transition-colors duration-300 ${
                      isDark ? "text-white" : "text-slate-900"
                    }`}
                    style={{
                      fontFamily: "var(--font-primary, Montserrat, sans-serif)",
                    }}
                  >
                    Categorias
                  </h1>
                  <p
                    className={`text-sm sm:text-base ${
                      isDark ? "text-slate-400" : "text-slate-600"
                    }`}
                    style={{
                      fontFamily:
                        "var(--font-secondary, Open Sans, sans-serif)",
                    }}
                  >
                    Gerencie suas categorias de receitas e despesas
                  </p>
                </div>
                <button
                  onClick={addDefaultCategories}
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105 ${
                    isDark
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                      : "bg-emerald-600 hover:bg-emerald-700 text-white"
                  } shadow-lg`}
                  style={{
                    fontFamily: "var(--font-secondary, Open Sans, sans-serif)",
                  }}
                >
                  Adicionar Padrões
                </button>
              </div>
            </div>

            {/* Abas */}
            <div className="mb-8">
              <div
                className={`inline-flex rounded-2xl p-1 ${
                  isDark ? "bg-slate-800" : "bg-slate-100"
                }`}
              >
                <button
                  onClick={() => setActiveTab("Despesa")}
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                    activeTab === "Despesa"
                      ? isDark
                        ? "bg-red-600 text-white shadow-lg"
                        : "bg-red-600 text-white shadow-lg"
                      : isDark
                      ? "text-slate-400 hover:text-white"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                  style={{
                    fontFamily: "var(--font-secondary, Open Sans, sans-serif)",
                  }}
                >
                  DESPESAS
                </button>
                <button
                  onClick={() => setActiveTab("Receita")}
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                    activeTab === "Receita"
                      ? isDark
                        ? "bg-emerald-600 text-white shadow-lg"
                        : "bg-emerald-600 text-white shadow-lg"
                      : isDark
                      ? "text-slate-400 hover:text-white"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                  style={{
                    fontFamily: "var(--font-secondary, Open Sans, sans-serif)",
                  }}
                >
                  RECEITAS
                </button>
              </div>
            </div>

            {/* Lista de Categorias */}
            <div
              className={`rounded-xl shadow-lg border transition-all duration-300 ${
                isDark
                  ? "bg-slate-800/90 border-slate-700/30"
                  : "bg-white border-slate-200/50"
              } p-6 mb-8`}
            >
              {loading ? (
                <div
                  className={`text-center py-8 transition-colors duration-300 ${
                    isDark ? "text-slate-400" : "text-slate-600"
                  }`}
                  style={{
                    fontFamily: "var(--font-secondary, Open Sans, sans-serif)",
                  }}
                >
                  Carregando...
                </div>
              ) : error ? (
                <div
                  className={`text-center py-8 text-red-500`}
                  style={{
                    fontFamily: "var(--font-secondary, Open Sans, sans-serif)",
                  }}
                >
                  {error}
                </div>
              ) : filteredCategories.length === 0 ? (
                <div
                  className={`text-center py-8 transition-colors duration-300 ${
                    isDark ? "text-slate-400" : "text-slate-600"
                  }`}
                  style={{
                    fontFamily: "var(--font-secondary, Open Sans, sans-serif)",
                  }}
                >
                  Nenhuma categoria encontrada
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredCategories.map((category) => (
                    <div
                      key={category.id}
                      className={`rounded-lg border transition-all duration-200 ${
                        isDark
                          ? "bg-slate-700/30 border-slate-600/30"
                          : "bg-slate-50 border-slate-200"
                      }`}
                    >
                      {/* Categoria Principal */}
                      <div className="p-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="p-2 rounded-lg"
                            style={{
                              backgroundColor: `${category.cor || "#06b6d4"}20`,
                            }}
                          >
                            <div style={{ color: category.cor || "#06b6d4" }}>
                              {renderIcon(category.icone || "dots")}
                            </div>
                          </div>

                          <div className="flex-1">
                            <h3
                              className={`font-semibold ${
                                isDark ? "text-white" : "text-slate-900"
                              }`}
                              style={{
                                fontFamily:
                                  "var(--font-primary, Montserrat, sans-serif)",
                              }}
                            >
                              {category.nome}
                            </h3>
                            {category.subcategorias &&
                              category.subcategorias.length > 0 && (
                                <p
                                  className={`text-sm ${
                                    isDark ? "text-slate-400" : "text-slate-600"
                                  }`}
                                >
                                  {category.subcategorias.length} subcategorias
                                </p>
                              )}
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openSubcategoryForm(category.id)}
                              className={`p-2 rounded-lg transition-all duration-200 hover:scale-105 ${
                                isDark
                                  ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                                  : "bg-green-50 text-green-600 hover:bg-green-100"
                              }`}
                              title="Adicionar Subcategoria"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                />
                              </svg>
                            </button>

                            <button
                              onClick={() => toggleCategory(category.id)}
                              className={`p-2 rounded-lg transition-all duration-200 hover:scale-105 ${
                                isDark
                                  ? "bg-slate-600/50 text-slate-300 hover:bg-slate-600"
                                  : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                              }`}
                              title={
                                expandedCategories.has(category.id)
                                  ? "Recolher"
                                  : "Expandir"
                              }
                            >
                              <svg
                                className={`w-4 h-4 transition-transform duration-200 ${
                                  expandedCategories.has(category.id)
                                    ? "rotate-180"
                                    : ""
                                }`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 9l-7 7-7-7"
                                />
                              </svg>
                            </button>

                            <button
                              onClick={() => handleEdit(category)}
                              className={`p-2 rounded-lg transition-all duration-200 hover:scale-105 ${
                                isDark
                                  ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                                  : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                              }`}
                              title="Editar"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                            </button>

                            <button
                              onClick={() => handleDelete(category.id)}
                              className={`p-2 rounded-lg transition-all duration-200 hover:scale-105 ${
                                isDark
                                  ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                                  : "bg-red-50 text-red-600 hover:bg-red-100"
                              }`}
                              title="Excluir"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Subcategorias */}
                      {expandedCategories.has(category.id) &&
                        category.subcategorias && (
                          <div
                            className={`border-t ${
                              isDark
                                ? "border-slate-600/30"
                                : "border-slate-200"
                            } p-4 pt-3`}
                          >
                            {category.subcategorias.length === 0 ? (
                              <p
                                className={`text-sm text-center py-4 ${
                                  isDark ? "text-slate-400" : "text-slate-600"
                                }`}
                              >
                                Nenhuma subcategoria encontrada
                              </p>
                            ) : (
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {category.subcategorias.map((subcategory) => (
                                  <div
                                    key={subcategory.id}
                                    className={`p-3 rounded-lg border transition-all duration-200 hover:shadow-md ${
                                      isDark
                                        ? "bg-slate-600/20 border-slate-500/30 hover:bg-slate-600/40"
                                        : "bg-white border-slate-200 hover:bg-slate-50"
                                    }`}
                                  >
                                    <div className="flex items-center gap-2 mb-2">
                                      <div
                                        className="p-1.5 rounded"
                                        style={{
                                          backgroundColor: `${
                                            subcategory.cor ||
                                            category.cor ||
                                            "#06b6d4"
                                          }20`,
                                        }}
                                      >
                                        <div
                                          className="w-4 h-4"
                                          style={{
                                            color:
                                              subcategory.cor ||
                                              category.cor ||
                                              "#06b6d4",
                                          }}
                                        >
                                          {renderIcon(
                                            subcategory.icone || "dots",
                                            "w-4 h-4"
                                          )}
                                        </div>
                                      </div>
                                      <h4
                                        className={`font-medium text-sm ${
                                          isDark
                                            ? "text-white"
                                            : "text-slate-900"
                                        }`}
                                      >
                                        {subcategory.nome}
                                      </h4>
                                    </div>

                                    <div className="flex items-center gap-1">
                                      <button
                                        onClick={() =>
                                          handleEditSubcategory(subcategory)
                                        }
                                        className={`flex-1 py-1.5 px-2 rounded text-xs font-medium transition-all duration-200 hover:scale-105 ${
                                          isDark
                                            ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                                            : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                                        }`}
                                      >
                                        Editar
                                      </button>

                                      <button
                                        onClick={() =>
                                          handleDeleteSubcategory(
                                            subcategory.id
                                          )
                                        }
                                        className={`p-1.5 rounded transition-all duration-200 hover:scale-105 ${
                                          isDark
                                            ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                                            : "bg-red-50 text-red-600 hover:bg-red-100"
                                        }`}
                                        title="Excluir Subcategoria"
                                      >
                                        <svg
                                          className="w-3 h-3"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                          />
                                        </svg>
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Botão Flutuante + */}
      <button
        onClick={() => openForm(activeTab)}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg transition-all duration-200 hover:scale-110 active:scale-95 z-40 ${
          activeTab === "Despesa"
            ? "bg-red-600 hover:bg-red-700 text-white"
            : "bg-emerald-600 hover:bg-emerald-700 text-white"
        }`}
        style={{
          boxShadow:
            activeTab === "Despesa"
              ? "0 4px 20px rgba(220, 38, 38, 0.4)"
              : "0 4px 20px rgba(16, 185, 129, 0.4)",
        }}
      >
        <svg
          className="w-8 h-8 mx-auto"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
      </button>

      {/* Modal de Formulário */}
      {showForm && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeForm();
            }
          }}
        >
          <div
            className={`w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl transition-all duration-300 ${
              isDark
                ? "bg-slate-800 border-slate-700"
                : "bg-white border-slate-200"
            } border p-6`}
            style={{ position: "relative", zIndex: 10000 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3
                className={`text-xl font-bold ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
                style={{
                  fontFamily: "var(--font-primary, Montserrat, sans-serif)",
                }}
              >
                {editingCategory ? "Editar Categoria" : "Criar nova categoria"}
              </h3>
              <button
                onClick={closeForm}
                className={`p-2 rounded-full transition-colors duration-200 ${
                  isDark
                    ? "hover:bg-slate-700 text-slate-400"
                    : "hover:bg-slate-100 text-slate-500"
                }`}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Descrição */}
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    isDark ? "text-slate-300" : "text-slate-700"
                  }`}
                  style={{
                    fontFamily: "var(--font-secondary, Open Sans, sans-serif)",
                  }}
                >
                  Descrição
                </label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) =>
                    setFormData({ ...formData, nome: e.target.value })
                  }
                  className={`w-full px-4 py-3 rounded-lg border transition-colors duration-200 ${
                    isDark
                      ? "bg-slate-700 border-slate-600 text-white focus:border-blue-500"
                      : "bg-white border-slate-300 text-slate-900 focus:border-blue-500"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                  placeholder="Nome da categoria"
                  required
                />
              </div>

              {/* Cor */}
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    isDark ? "text-slate-300" : "text-slate-700"
                  }`}
                  style={{
                    fontFamily: "var(--font-secondary, Open Sans, sans-serif)",
                  }}
                >
                  Cor
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {AVAILABLE_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, cor: color })}
                      className={`w-10 h-10 rounded-lg transition-all duration-200 hover:scale-110 ${
                        formData.cor === color
                          ? "ring-2 ring-offset-2 ring-blue-500"
                          : ""
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Ícone */}
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    isDark ? "text-slate-300" : "text-slate-700"
                  }`}
                  style={{
                    fontFamily: "var(--font-secondary, Open Sans, sans-serif)",
                  }}
                >
                  Ícone
                </label>
                <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 max-h-48 overflow-y-auto">
                  {AVAILABLE_ICONS.map((icon) => (
                    <button
                      key={icon.id}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, icone: icon.id })
                      }
                      className={`p-3 rounded-lg border transition-all duration-200 hover:scale-105 ${
                        formData.icone === icon.id
                          ? isDark
                            ? "border-blue-500 bg-blue-500/20"
                            : "border-blue-500 bg-blue-50"
                          : isDark
                          ? "border-slate-600 hover:border-slate-500"
                          : "border-slate-300 hover:border-slate-400"
                      }`}
                      title={icon.name}
                    >
                      <div
                        className={`${
                          formData.icone === icon.id
                            ? "text-blue-500"
                            : isDark
                            ? "text-slate-400"
                            : "text-slate-600"
                        }`}
                      >
                        {renderIcon(icon.id, "w-5 h-5")}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Botões */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={closeForm}
                  className={`flex-1 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105 ${
                    isDark
                      ? "bg-slate-600 hover:bg-slate-700 text-white"
                      : "bg-slate-200 hover:bg-slate-300 text-slate-700"
                  } shadow-lg`}
                  style={{
                    fontFamily: "var(--font-secondary, Open Sans, sans-serif)",
                  }}
                >
                  CANCELAR
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className={`flex-1 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105 ${
                    activeTab === "Despesa"
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : "bg-emerald-600 hover:bg-emerald-700 text-white"
                  } shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
                  style={{
                    fontFamily: "var(--font-secondary, Open Sans, sans-serif)",
                  }}
                >
                  {loading ? "SALVANDO..." : "CONCLUÍDO"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Subcategoria */}
      {showSubcategoryForm && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeSubcategoryForm();
            }
          }}
        >
          <div
            className={`w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl transition-all duration-300 ${
              isDark
                ? "bg-slate-800 border-slate-700"
                : "bg-white border-slate-200"
            } border p-6`}
            style={{ position: "relative", zIndex: 10000 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3
                className={`text-xl font-bold ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
                style={{
                  fontFamily: "var(--font-primary, Montserrat, sans-serif)",
                }}
              >
                {editingSubcategory
                  ? "Editar Subcategoria"
                  : "Nova Subcategoria"}
              </h3>
              <button
                onClick={closeSubcategoryForm}
                className={`p-2 rounded-full transition-colors duration-200 ${
                  isDark
                    ? "hover:bg-slate-700 text-slate-400"
                    : "hover:bg-slate-100 text-slate-500"
                }`}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubcategorySubmit} className="space-y-6">
              {/* Descrição */}
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    isDark ? "text-slate-300" : "text-slate-700"
                  }`}
                  style={{
                    fontFamily: "var(--font-secondary, Open Sans, sans-serif)",
                  }}
                >
                  Descrição
                </label>
                <input
                  type="text"
                  value={subFormData.nome}
                  onChange={(e) =>
                    setSubFormData({ ...subFormData, nome: e.target.value })
                  }
                  className={`w-full px-4 py-3 rounded-lg border transition-colors duration-200 ${
                    isDark
                      ? "bg-slate-700 border-slate-600 text-white focus:border-blue-500"
                      : "bg-white border-slate-300 text-slate-900 focus:border-blue-500"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                  placeholder="Nome da subcategoria"
                  required
                />
              </div>

              {/* Cor */}
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    isDark ? "text-slate-300" : "text-slate-700"
                  }`}
                  style={{
                    fontFamily: "var(--font-secondary, Open Sans, sans-serif)",
                  }}
                >
                  Cor
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {AVAILABLE_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() =>
                        setSubFormData({ ...subFormData, cor: color })
                      }
                      className={`w-10 h-10 rounded-lg transition-all duration-200 hover:scale-110 ${
                        subFormData.cor === color
                          ? "ring-2 ring-offset-2 ring-blue-500"
                          : ""
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Ícone */}
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    isDark ? "text-slate-300" : "text-slate-700"
                  }`}
                  style={{
                    fontFamily: "var(--font-secondary, Open Sans, sans-serif)",
                  }}
                >
                  Ícone
                </label>
                <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 max-h-48 overflow-y-auto">
                  {AVAILABLE_ICONS.map((icon) => (
                    <button
                      key={icon.id}
                      type="button"
                      onClick={() =>
                        setSubFormData({ ...subFormData, icone: icon.id })
                      }
                      className={`p-3 rounded-lg border transition-all duration-200 hover:scale-105 ${
                        subFormData.icone === icon.id
                          ? isDark
                            ? "border-blue-500 bg-blue-500/20"
                            : "border-blue-500 bg-blue-50"
                          : isDark
                          ? "border-slate-600 hover:border-slate-500"
                          : "border-slate-300 hover:border-slate-400"
                      }`}
                      title={icon.name}
                    >
                      <div
                        className={`${
                          subFormData.icone === icon.id
                            ? "text-blue-500"
                            : isDark
                            ? "text-slate-400"
                            : "text-slate-600"
                        }`}
                      >
                        {renderIcon(icon.id, "w-5 h-5")}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Botões */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={closeSubcategoryForm}
                  className={`flex-1 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105 ${
                    isDark
                      ? "bg-slate-600 hover:bg-slate-700 text-white"
                      : "bg-slate-200 hover:bg-slate-300 text-slate-700"
                  } shadow-lg`}
                  style={{
                    fontFamily: "var(--font-secondary, Open Sans, sans-serif)",
                  }}
                >
                  CANCELAR
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className={`flex-1 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105 ${
                    activeTab === "Despesa"
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : "bg-emerald-600 hover:bg-emerald-700 text-white"
                  } shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
                  style={{
                    fontFamily: "var(--font-secondary, Open Sans, sans-serif)",
                  }}
                >
                  {loading ? "SALVANDO..." : "CONCLUÍDO"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
