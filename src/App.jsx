// App.jsx
import { useState, useEffect, useRef, createContext, useContext } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { TypeAnimation } from 'react-type-animation';
import pb, { dishesAPI, reviewsAPI, featuresAPI, hoursAPI, reservationsAPI, ordersAPI } from './lib/pocketbase';
import { Notification } from './components/Notification';

// Импорт иконок из react-icons
import {
  FiMenu, FiX, FiChevronDown, FiCalendar, FiUsers, FiUser,
  FiPhone, FiMapPin, FiClock, FiStar, FiChevronLeft, FiChevronRight,
  FiCheckCircle, FiSend, FiExternalLink, FiCalendar as FiCalendarCheck,
  FiShoppingCart, FiPlus, FiMinus, FiTrash2, FiHome, FiInfo, FiMessageSquare, FiMail
} from "react-icons/fi";
import {
  FaInstagram, FaFacebook, FaYoutube, FaLeaf, FaBookOpen,
  FaHome, FaHeart, FaUtensils, FaQuoteRight
} from "react-icons/fa";
import { GiChefToque } from "react-icons/gi";

// Переименовываем для удобства
const Menu = FiMenu;
const X = FiX;
const ChevronDown = FiChevronDown;
const Calendar = FiCalendar;
const Users = FiUsers;
const User = FiUser;
const Phone = FiPhone;
const MapPin = FiMapPin;
const Clock = FiClock;
const Star = FiStar;
const ChevronLeft = FiChevronLeft;
const ChevronRight = FiChevronRight;
const CheckCircle = FiCheckCircle;
const Send = FiSend;
const ExternalLink = FiExternalLink;
const CalendarCheck = FiCalendarCheck;
const ShoppingCart = FiShoppingCart;
const Plus = FiPlus;
const Minus = FiMinus;
const Trash2 = FiTrash2;
const HomeIcon = FiHome;
const Info = FiInfo;
const MessageSquare = FiMessageSquare;
const Mail = FiMail;
const Instagram = FaInstagram;
const Facebook = FaFacebook;
const Youtube = FaYoutube;
const Leaf = FaLeaf;
const BookOpen = FaBookOpen;
const Home = FaHome;
const Heart = FaHeart;
const ChefHat = GiChefToque;
const Quote = FaQuoteRight;
const Utensils = FaUtensils;

// ============ КОНТЕКСТ КОРЗИНЫ ============
const CartContext = createContext();

function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const addToCart = (dish, quantity = 1) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === dish.id);
      if (existing) {
        return prev.map(item =>
          item.id === dish.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { ...dish, quantity }];
    });
  };

  const removeFromCart = (id) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id, quantity) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      const price = parseFloat(item.price.replace(/[^\d]/g, ''));
      return total + (price * item.quantity);
    }, 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getTotalPrice,
      getTotalItems,
      isCartOpen,
      setIsCartOpen
    }}>
      {children}
    </CartContext.Provider>
  );
}

function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

// ============ ХУК ДЛЯ ЗАГРУЗКИ ДАННЫХ ============
function useDataLoader() {
  const [dishes, setDishes] = useState([]);
  const [reviewsData, setReviewsData] = useState([]);
  const [featuresData, setFeaturesData] = useState([]);
  const [hoursData, setHoursData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      const [dishesList, reviewsList, featuresList, hoursList] = await Promise.all([
        dishesAPI.getAll(),
        reviewsAPI.getAll(),
        featuresAPI.getAll(),
        hoursAPI.getAll()
      ]);
      
      setDishes(dishesList);
      setReviewsData(reviewsList);
      setFeaturesData(featuresList);
      setHoursData(hoursList);
      setLoading(false);
    };
    
    loadAllData();
  }, []);

  return { dishes, reviewsData, featuresData, hoursData, loading };
}

// ============ ДАННЫЕ (FALLBACK НА СЛУЧАЙ ОШИБКИ) ============
const fallbackDishes = [
  {
    id: 1,
    name: "Плов по-домашнему",
    description: "Классический узбекский плов с бараниной, приготовленный по семейному рецепту",
    price: "65 сомони",
    tag: "Фирменное блюдо",
    image: "https://images.unsplash.com/photo-1646999415436-fa7fa11cb8c3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
    category: "main"
  },
  {
    id: 2,
    name: "Шашлык из баранины",
    description: "Нежная баранина на углях с маринадом из восточных специй и трав",
    price: "85 сомони",
    tag: "Хит",
    image: "https://images.unsplash.com/photo-1771285119318-b342c3ecc51c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
    category: "main"
  },
  {
    id: 3,
    name: "Свежий салат",
    description: "Сезонные овощи с фермы, заправленные оливковым маслом и лимоном",
    price: "28 сомони",
    tag: "Новинка",
    image: "https://images.unsplash.com/photo-1761315631465-d1123c77ea72?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
    category: "salad"
  },
  {
    id: 4,
    name: "Лагман",
    description: "Густой наваристый суп с тянутой лапшой, говядиной и овощами",
    price: "45 сомони",
    tag: "Традиционное",
    image: "https://images.unsplash.com/photo-1763905145526-6a5e868acc40?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
    category: "soup"
  },
  {
    id: 5,
    name: "Десерт Шахар",
    description: "Изысканный шоколадный торт с орехами и карамельным соусом",
    price: "32 сомони",
    tag: "Десерт",
    image: "https://images.unsplash.com/photo-1740594967618-23cd757b9291?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
    category: "dessert"
  },
  {
    id: 6,
    name: "Лепёшка тандыр",
    description: "Свежеиспечённая лепёшка из тандырной печи с кунжутом",
    price: "12 сомони",
    tag: "Выпечка",
    image: "https://images.unsplash.com/photo-1763141437626-57697f56e9c2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
    category: "bread"
  }
];

const fallbackReviews = [
  { id: 1, 
    name: "Зафар Исмоилов", 
    role: "Постоянный гость", 
    text: "AJR Family — это наш семейный ресторан уже 5 лет. Каждый раз плов готовится идеально — нежное мясо, рассыпчатый рис. Персонал всегда приветливый и внимательный. Рекомендую всей семьёй!", 
    rating: 5, 
    avatar: "З", 
    color: "#45C14A" },
  { id: 2, 
    name: "Нилуфар Каримова", 
    role: "Отмечала день рождения", 
    text: "Отмечали день рождения мамы — всё было просто великолепно! Красивое оформление стола, вкуснейший шашлык, и торт... отдельный восторг. Спасибо команде за незабываемый вечер!", 
    rating: 5, 
    avatar: "Н", 
    color: "#C9A86A" },
  { id: 3, 
    name: "Бехзод Рашидов", 
    role: "Пришёл с коллегами", 
    text: "Корпоратив прошёл на высшем уровне. Вместительный зал, отличное меню на любой вкус, быстрое обслуживание. Атмосфера очень тёплая — не хотелось уходить. Обязательно вернёмся!", 
    rating: 5, 
    avatar: "Б", 
    color: "#45C14A" }
];

const fallbackFeatures = [
  { icon: Leaf, title: "Свежие продукты", desc: "Только отборные местные продукты с ферм. Никакой заморозки — только свежее", color: "#45C14A" },
  { icon: BookOpen, title: "Семейные рецепты", desc: "Рецепты передаются из поколения в поколение. Вкус детства в каждом блюде", color: "#C9A86A" },
  { icon: Home, title: "Уютная атмосфера", desc: "Тёплый интерьер и гостеприимный персонал создают атмосферу домашнего уюта", color: "#45C14A" },
  { icon: Heart, title: "Дружелюбный сервис", desc: "Каждый гость — как член нашей семьи. Мы заботимся о каждой детали", color: "#C9A86A" },
  { icon: Star, title: "Традиционный вкус", desc: "Аутентичные рецепты без компромиссов. Настоящий вкус восточной кухни", color: "#45C14A" },
  { icon: ChefHat, title: "Высококлассная кухня", desc: "Опытные повара с многолетней практикой готовят каждое блюдо с мастерством", color: "#C9A86A" }
];

const fallbackHours = [
  { day: "Понедельник — Пятница", time: "09:00 — 00:00" },
  { day: "Суббота — Воскресенье", time: "09:00 — 00:00" },
  { day: "Праздничные дни", time: "09:00 — 00:00" }
];

const menuCategoriesForPage = [
  { id: "all", label: "Все блюда", icon: Utensils },
  { id: "main", label: "Основные блюда", icon: ChefHat },
  { id: "salad", label: "Салаты", icon: Leaf },
  { id: "soup", label: "Супы", icon: Heart },
  { id: "snack", label: "Закуски", icon: BookOpen },
  { id: "dessert", label: "Десерты", icon: Star },
  { id: "drink", label: "Напитки", icon: Mail },
  { id: "bread", label: "Выпечка", icon: HomeIcon }
];

const aboutStats = [
  { value: "15+", label: "Лет традиций" },
  { value: "50K+", label: "Довольных гостей" },
  { value: "120+", label: "Блюд в меню" },
  { value: "4.6★", label: "Рейтинг" },
];

const navLinks = [
  { label: "Главная", href: "/", icon: HomeIcon },
  { label: "Меню", href: "/menu", icon: Utensils },
  { label: "О нас", href: "#about", icon: Info },
  { label: "Отзывы", href: "#reviews", icon: MessageSquare },
  { label: "Контакты", href: "#contact", icon: Mail },
];

const socials = [
  { icon: Instagram, href: "#", label: "Instagram", color: "#E1306C" },
  { icon: Facebook, href: "#", label: "Facebook", color: "#1877F2" },
  { icon: Youtube, href: "#", label: "YouTube", color: "#FF0000" },
];

const HERO_IMAGE = "https://images.unsplash.com/photo-1768982463473-9d94547f8814?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920";
const INTERIOR_IMAGE = "https://images.unsplash.com/photo-1758612798971-a8adb6cba7eb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=900";

// ============ КОМПОНЕНТ КОРЗИНЫ ============
function CartDrawer() {
  const { cartItems, removeFromCart, updateQuantity, getTotalPrice, clearCart, isCartOpen, setIsCartOpen } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: 'success', title: '', message: '' });

  const getNumericPrice = (priceStr) => {
    return parseFloat(priceStr.replace(/[^\d]/g, ''));
  };

  const showNotification = (type, title, message) => {
    setNotification({ show: true, type, title, message });
    setTimeout(() => {
      setNotification({ show: false, type: 'success', title: '', message: '' });
    }, 3000);
  };

  const handleOrder = async () => {
    if (cartItems.length === 0) {
      showNotification('warning', 'Корзина пуста', 'Добавьте блюда перед оформлением заказа');
      return;
    }

    setIsProcessing(true);

    try {
      const orderData = {
        total_price: getTotalPrice(),
        items: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        }))
      };

      const result = await ordersAPI.create(orderData);
      
      if (result.success) {
        showNotification(
          'success',
          'Заказ оформлен! 🎉',
          `Сумма: ${getTotalPrice().toLocaleString()} сомони. Наши менеджеры свяжутся с вами для подтверждения.`
        );
        clearCart();
        setIsCartOpen(false);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      showNotification(
        'error',
        'Ошибка оформления',
        'Не удалось оформить заказ. Пожалуйста, попробуйте позже.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black/70 z-[1000]"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-[#0F1113] border-l border-white/10 z-[1001] shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#45C14A] to-[#1F6E33] flex items-center justify-center">
                    <ShoppingCart size={18} color="white" />
                  </div>
                  <h2 className="text-white text-xl font-['Playfair_Display'] font-bold">Корзина</h2>
                  <span className="text-white/40 text-sm">{cartItems.length} {cartItems.length === 1 ? 'блюдо' : cartItems.length < 5 ? 'блюда' : 'блюд'}</span>
                </div>
                <button onClick={() => setIsCartOpen(false)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors">
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {cartItems.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                      <ShoppingCart size={32} className="text-white/30" />
                    </div>
                    <p className="text-white/40 text-sm">Ваша корзина пуста</p>
                    <p className="text-white/25 text-xs mt-2">Добавьте блюда из меню</p>
                  </div>
                ) : (
                  cartItems.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white/5 rounded-2xl p-4 border border-white/10"
                    >
                      <div className="flex gap-4">
                        <img src={item.image} alt={item.name} className="w-20 h-20 rounded-xl object-cover" />
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-white font-semibold text-sm">{item.name}</h3>
                              <span className="text-[#C9A86A] text-xs font-medium">{item.price}</span>
                            </div>
                            <button onClick={() => removeFromCart(item.id)} className="text-white/40 hover:text-red-400 transition-colors">
                              <Trash2 size={14} />
                            </button>
                          </div>
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-2 bg-white/10 rounded-xl p-1">
                              <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-7 h-7 rounded-lg flex items-center justify-center text-white/70 hover:bg-[#45C14A]/20 transition-colors">
                                <Minus size={12} />
                              </button>
                              <span className="text-white text-sm w-6 text-center">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-7 h-7 rounded-lg flex items-center justify-center text-white/70 hover:bg-[#45C14A]/20 transition-colors">
                                <Plus size={12} />
                              </button>
                            </div>
                            <span className="text-[#45C14A] text-sm font-semibold">
                              {(getNumericPrice(item.price) * item.quantity).toLocaleString()} сомони
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {cartItems.length > 0 && (
                <div className="p-6 border-t border-white/10 bg-white/5">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-white/60 text-sm">Итого:</span>
                    <span className="text-white text-2xl font-['Playfair_Display'] font-bold">{getTotalPrice().toLocaleString()} сомони</span>
                  </div>
                  <button
                    onClick={handleOrder}
                    disabled={isProcessing}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-[#45C14A] to-[#1F6E33] text-white font-semibold shadow-lg shadow-[#45C14A]/30 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Оформление...</span>
                      </div>
                    ) : (
                      'Оформить заказ'
                    )}
                  </button>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="w-full mt-3 py-3 rounded-xl bg-white/10 text-white/70 text-sm font-medium hover:bg-white/20 transition-colors"
                  >
                    Продолжить покупки
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Notification
        isOpen={notification.show}
        onClose={() => setNotification({ show: false, type: 'success', title: '', message: '' })}
        type={notification.type}
        title={notification.title}
        message={notification.message}
      />
    </>
  );
}

// ============ СТРАНИЦА МЕНЮ ============
function MenuPage({ dishes }) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { addToCart, getTotalItems, setIsCartOpen } = useCart();
  const [addedItemId, setAddedItemId] = useState(null);

  const filteredItems = dishes.filter(item => {
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddToCart = (item) => {
    addToCart(item);
    setAddedItemId(item.id);
    setTimeout(() => setAddedItemId(null), 1000);
  };

  const totalItems = getTotalItems();

  return (
    <div className="bg-[#0F1113] min-h-screen pt-24 pb-20">
      <div className="max-w-[1280px] mx-auto px-6 md:px-[60px]">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <span className="text-[#45C14A] text-[11px] font-semibold tracking-[0.25em] uppercase block mb-4">Наше меню</span>
          <h1 className="font-['Playfair_Display'] text-white text-[clamp(36px,5vw,56px)] font-bold mb-4">
            Гастрономическое <em className="text-[#45C14A] not-italic">путешествие</em>
          </h1>
          <p className="text-white/55 text-base font-light max-w-[560px] mx-auto">
            Откройте для себя аутентичные вкусы восточной кухни, приготовленные с любовью и уважением к традициям
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <div className="relative max-w-md mx-auto mb-8">
            <input
              type="text"
              placeholder="Поиск блюд..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/15 rounded-xl py-3.5 pl-12 pr-4 text-white text-sm outline-none focus:border-[#45C14A] focus:bg-[#45C14A]/5 transition-all"
            />
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {menuCategoriesForPage.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${isActive
                    ? "bg-gradient-to-r from-[#45C14A] to-[#1F6E33] text-white shadow-lg shadow-[#45C14A]/30"
                    : "bg-white/5 text-white/60 border border-white/15 hover:bg-white/10"
                    }`}
                >
                  <Icon size={14} />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.length === 0 ? (
            <div className="col-span-full text-center py-16">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                <Utensils size={32} className="text-white/30" />
              </div>
              <p className="text-white/40 text-lg">Блюда не найдены</p>
              <p className="text-white/25 text-sm mt-2">Попробуйте изменить поиск или категорию</p>
            </div>
          ) : (
            filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group relative bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-[#45C14A]/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
              >
                <div className="relative overflow-hidden h-[200px]">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F1113]/80 via-transparent to-transparent" />
                  <span className="absolute top-3 left-3 bg-[#45C14A]/90 text-white text-[10px] font-semibold px-2.5 py-1 rounded-full">
                    {item.tag}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-['Playfair_Display'] text-white text-xl font-semibold mb-2">{item.name}</h3>
                  <p className="text-white/45 text-xs leading-relaxed mb-4 line-clamp-2">{item.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[#C9A86A] font-['Playfair_Display'] text-lg font-bold">{item.price}</span>
                    <button
                      onClick={() => handleAddToCart(item)}
                      className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-300 flex items-center gap-1.5 ${addedItemId === item.id
                        ? "bg-[#45C14A] text-white"
                        : "bg-[#45C14A]/15 text-[#45C14A] border border-[#45C14A]/30 hover:bg-[#45C14A] hover:text-white"
                        }`}
                    >
                      {addedItemId === item.id ? (
                        <CheckCircle size={12} />
                      ) : (
                        <Plus size={12} />
                      )}
                      {addedItemId === item.id ? "Добавлено" : "В корзину"}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 p-8 bg-gradient-to-r from-[#45C14A]/10 to-[#C9A86A]/10 rounded-2xl border border-white/10 text-center"
        >
          <div className="flex flex-wrap justify-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#45C14A]/20 flex items-center justify-center">
                <Clock size={18} color="#45C14A" />
              </div>
              <div className="text-left">
                <p className="text-white/60 text-xs">Время приготовления</p>
                <p className="text-white text-sm font-semibold">20-40 минут</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#45C14A]/20 flex items-center justify-center">
                <MapPin size={18} color="#45C14A" />
              </div>
              <div className="text-left">
                <p className="text-white/60 text-xs">Доставка</p>
                <p className="text-white text-sm font-semibold">Бесплатно от 150 сомони</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#45C14A]/20 flex items-center justify-center">
                <Heart size={18} color="#45C14A" />
              </div>
              <div className="text-left">
                <p className="text-white/60 text-xs">Для наших гостей</p>
                <p className="text-white text-sm font-semibold">Скидка 10% на самовывоз</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {totalItems > 0 && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-8 right-8 z-40 flex items-center gap-3 px-5 py-3 rounded-full bg-gradient-to-r from-[#45C14A] to-[#1F6E33] text-white text-sm font-semibold shadow-lg shadow-[#45C14A]/40 hover:scale-105 transition-all duration-300"
        >
          <ShoppingCart size={18} />
          <span>Корзина</span>
          <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#C9A86A] text-white text-xs flex items-center justify-center font-bold">
            {totalItems}
          </span>
        </motion.button>
      )}
    </div>
  );
}

// ============ ОСТАЛЬНЫЕ КОМПОНЕНТЫ ============

function Header({ currentPage, onNavigate }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { getTotalItems, setIsCartOpen } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (href) => {
    if (href === "/") {
      onNavigate("home");
      setMobileOpen(false);
      setTimeout(() => {
        const el = document.querySelector("#hero");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else if (href === "/menu") {
      onNavigate("menu");
      setMobileOpen(false);
    } else {
      setMobileOpen(false);
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const totalItems = getTotalItems();
  const fullNavLinks = navLinks;
  const mediumNavLinks = navLinks.filter(l => l.href === "/" || l.href === "/menu");

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "bg-[#0F1113]/90 backdrop-blur-xl border-b border-[#45C14A]/20" : "bg-transparent"
        }`}
    >
      <div className="max-w-[1280px] mx-auto px-6 md:px-[60px] h-20 flex items-center justify-between">
        <button onClick={() => scrollTo("/")} className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#45C14A] to-[#1F6E33] flex items-center justify-center overflow-hidden">
            <img
              src="/ajr-icon.ico"
              alt="AJR Family"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = '<span className="font-[\'Playfair_Display\'] text-white text-base font-bold">A</span>';
              }}
            />
          </div>
          <div className="text-left">
            <div className="font-['Playfair_Display'] text-[#45C14A] text-[15px] font-bold leading-tight">AJR Family</div>
            <div className="text-white/50 text-[8px] tracking-[0.2em] uppercase">Семейный ресторан</div>
          </div>
        </button>

        <nav className="hidden md:flex lg:hidden items-center gap-6">
          {mediumNavLinks.map((l) => (
            <button
              key={l.href}
              onClick={() => scrollTo(l.href)}
              className={`text-sm font-medium tracking-wide transition-colors flex items-center gap-1.5 ${(currentPage === "home" && l.href === "/") || (currentPage === "menu" && l.href === "/menu")
                  ? "text-[#45C14A]"
                  : "text-white/75 hover:text-[#45C14A]"
                }`}
            >
              <l.icon size={14} />
              {l.label}
            </button>
          ))}
        </nav>

        <nav className="hidden lg:flex items-center gap-8">
          {fullNavLinks.map((l) => (
            <button
              key={l.href}
              onClick={() => scrollTo(l.href)}
              className={`text-sm font-medium tracking-wide transition-colors flex items-center gap-1.5 ${(currentPage === "home" && l.href === "/") || (currentPage === "menu" && l.href === "/menu")
                  ? "text-[#45C14A]"
                  : "text-white/75 hover:text-[#45C14A]"
                }`}
            >
              <l.icon size={14} />
              {l.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2 md:gap-3">
          <button
            onClick={() => scrollTo("#reservation")}
            className="px-4 py-2 rounded-full bg-gradient-to-r from-[#45C14A] to-[#1F6E33] text-white text-xs font-semibold tracking-wide hover:scale-105 transition-all duration-300 shadow-lg shadow-[#45C14A]/30"
          >
            Забронировать
          </button>

          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <ShoppingCart size={20} className="text-white/80" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#45C14A] text-white text-[10px] flex items-center justify-center font-bold">
                {totalItems}
              </span>
            )}
          </button>

          <button className="md:hidden text-white" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden bg-[#0F1113]/95 backdrop-blur-xl border-t border-[#45C14A]/20 p-6"
          >
            {fullNavLinks.map((l) => (
              <button
                key={l.href}
                onClick={() => scrollTo(l.href)}
                className="block w-full text-left py-3 text-white/85 text-base border-b border-white/10 flex items-center gap-2"
              >
                <l.icon size={16} />
                {l.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

function Hero() {
  const parallaxRef = useRef(null);

  useEffect(() => {
    const onScroll = () => {
      if (parallaxRef.current) {
        parallaxRef.current.style.transform = `translateY(${window.scrollY * 0.4}px)`;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (href) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="hero" className="relative h-screen w-full overflow-hidden flex items-center justify-center">
      <div ref={parallaxRef} className="absolute inset-0 scale-110">
        <img src={HERO_IMAGE} alt="Кафе AJR Family Restaurant" className="w-full h-full object-cover" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-[#0F1113]/55 via-[#0F1113]/40 to-[#0F1113]/85" />
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex justify-center mb-6"
        >
          <span className="px-4 py-1.5 rounded-full border border-[#C9A86A]/50 text-[#C9A86A] text-[11px] font-medium tracking-[0.2em] uppercase bg-[#C9A86A]/10">
            Семейный ресторан · С 2023 года
          </span>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="font-['Playfair_Display'] text-white text-[clamp(32px,8vw,72px)] font-bold leading-[1.1] tracking-[-0.01em] mb-6 text-center"
        >
          <span className="block sm:inline">Место, где семья</span>
          <span className="hidden sm:inline"> </span>
          <span className="block sm:inline">встречается</span>
          <br className="hidden sm:block" />
          <span className="inline-flex items-center justify-center gap-2 flex-wrap mt-2 sm:mt-0">
            <TypeAnimation
              sequence={[
                'со вкусом',
                2000,
                'с теплом',
                2000,
                'с радостью',
                2000,
                'с традициями',
                2000,
                'с уютом',
                2000,
                'с счастьем',
                2000,
                'с любовью',
                2000
              ]}
              wrapper="span"
              speed={50}
              repeat={Infinity}
              className="text-[#45C14A] inline-block relative"
              style={{
                display: 'inline-block',
                textShadow: '0 0 30px rgba(69,193,74,0.4)',
                minWidth: 'clamp(100px, 25vw, 180px)',
                fontWeight: 'bold',
                letterSpacing: '-0.02em'
              }}
            />
          </span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.7 }}
          className="text-white/75 text-[clamp(15px,2vw,18px)] font-light max-w-[560px] mx-auto mb-10 leading-relaxed"
        >
          Аутентичная кухня, тёплая атмосфера и семейные традиции, которые объединяют поколения за одним столом
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <button
            onClick={() => scrollTo("#menu")}
            className="px-8 py-4 rounded-full bg-gradient-to-r from-[#45C14A] to-[#1F6E33] text-white text-sm font-semibold tracking-wide hover:scale-105 transition-all duration-300 shadow-lg shadow-[#45C14A]/35"
          >
            Посмотреть меню
          </button>
          <button
            onClick={() => scrollTo("#reservation")}
            className="px-8 py-4 rounded-full bg-white/10 text-white text-sm font-semibold tracking-wide border border-white/25 backdrop-blur-sm hover:scale-105 transition-all duration-300"
          >
            Забронировать стол
          </button>
        </motion.div>
      </div>
      <motion.button
        onClick={() => scrollTo("#dishes")}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-white/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 8, 0] }}
        transition={{ opacity: { delay: 1.5 }, y: { repeat: Infinity, duration: 2 } }}
      >
        <span className="text-[11px] tracking-[0.15em] uppercase">Листайте</span>
        <ChevronDown size={18} />
      </motion.button>
    </section>
  );
}

function DishCard({ dish, index }) {
  const [hovered, setHovered] = useState(false);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addToCart(dish);
    setAdded(true);
    setTimeout(() => setAdded(false), 1000);
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`bg-white/5 border border-white/10 rounded-2xl overflow-hidden cursor-pointer transition-all duration-400 ${hovered ? "shadow-2xl -translate-y-2" : "shadow-lg"
        }`}
    >
      <div className="relative overflow-hidden h-[220px]">
        <img
          src={dish.image}
          alt={dish.name}
          className={`w-full h-full object-cover transition-transform duration-500 ${hovered ? "scale-110" : "scale-100"
            }`}
        />
        <div className={`absolute inset-0 transition-all duration-400 ${hovered
          ? "bg-gradient-to-t from-[#0F1113]/70 via-transparent to-transparent"
          : "bg-gradient-to-t from-[#0F1113]/50 via-transparent to-transparent"
          }`} />
        <span className="absolute top-3.5 left-3.5 bg-[#45C14A]/85 text-white text-[10px] font-semibold tracking-wide uppercase px-2.5 py-1 rounded-full">
          {dish.tag}
        </span>
      </div>
      <div className="p-5 pb-6">
        <h3 className="font-['Playfair_Display'] text-white text-xl font-semibold mb-2">{dish.name}</h3>
        <p className="text-white/55 text-xs font-light leading-relaxed mb-4">{dish.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-[#C9A86A] font-['Playfair_Display'] text-lg font-semibold">{dish.price}</span>
          <button
            onClick={handleAdd}
            className={`px-4 py-1.5 rounded-full border text-xs font-semibold transition-all duration-300 flex items-center gap-1 ${added
              ? "bg-[#45C14A] text-white border-[#45C14A]"
              : "border-[#45C14A]/50 bg-[#45C14A]/15 text-[#45C14A] hover:bg-[#45C14A] hover:text-white"
              }`}
          >
            {added ? <CheckCircle size={10} /> : <Plus size={10} />}
            {added ? "Добавлено" : "В корзину"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function SignatureDishes({ dishes, loading }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  if (loading) {
    return (
      <section className="bg-[#0F1113] py-24">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-2 border-[#45C14A] border-t-transparent rounded-full animate-spin" />
        </div>
      </section>
    );
  }

  return (
    <section id="dishes" ref={ref} className="bg-[#0F1113] py-24">
      <div className="max-w-[1280px] mx-auto px-6 md:px-[60px]">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <span className="text-[#45C14A] text-[11px] font-semibold tracking-[0.25em] uppercase block mb-4">Наши блюда</span>
          <h2 className="font-['Playfair_Display'] text-white text-[clamp(32px,4vw,48px)] font-bold mb-4">Фирменные блюда ресторана</h2>
          <p className="text-white/55 text-base font-light max-w-[500px] mx-auto">Каждое блюдо — это история, приготовленная с любовью и уважением к традициям</p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {dishes.slice(0, 6).map((dish, i) => <DishCard key={dish.id} dish={dish} index={i} />)}
        </div>
      </div>
    </section>
  );
}

function About() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="about" ref={ref} className="bg-gradient-to-b from-[#0F1113] to-[#111614] py-24">
      <div className="max-w-[1280px] mx-auto px-6 md:px-[60px] grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="relative"
        >
          <div className="rounded-2xl overflow-hidden aspect-[4/5] relative">
            <img src={INTERIOR_IMAGE} alt="Интерьер ресторана Кафе" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0F1113]/50 via-transparent to-transparent" />
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="absolute -bottom-6 -right-6 bg-[#0F1113]/90 backdrop-blur-xl border border-[#C9A86A]/30 rounded-2xl p-6 shadow-2xl"
          >
            <div className="text-[#C9A86A] font-['Playfair_Display'] text-4xl font-bold leading-none">15+</div>
            <div className="text-white/60 text-xs mt-1">Лет вместе с вами</div>
          </motion.div>
          <div className="absolute top-10 -left-1 w-1 h-20 bg-gradient-to-b from-[#45C14A] to-transparent rounded-full" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <span className="text-[#45C14A] text-[11px] font-semibold tracking-[0.25em] uppercase block mb-4">Наша история</span>
          <h2 className="font-['Playfair_Display'] text-white text-[clamp(28px,3.5vw,44px)] font-bold leading-[1.15] mb-6">
            Семейные традиции, <em className="text-[#45C14A] not-italic">переданные через поколения</em>
          </h2>
          <p className="text-white/65 text-sm font-light leading-relaxed mb-5">
            Кафе AJR Family — это больше, чем ресторан. Это место, где каждый гость чувствует себя как дома. Мы открылись в 2010 году с простой миссией: угощать людей блюдами, приготовленными с душой и настоящей любовью.
          </p>
          <p className="text-white/65 text-sm font-light leading-relaxed mb-10">
            Наши рецепты — это живое наследие, передаваемое от бабушек и дедушек. Мы используем только свежие местные продукты и готовим каждое блюдо так, как готовили бы для собственной семьи.
          </p>
          <div className="grid grid-cols-2 gap-5 mb-10">
            {aboutStats.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-5"
              >
                <div className="font-['Playfair_Display'] text-[#C9A86A] text-3xl font-bold">{s.value}</div>
                <div className="text-white/50 text-xs mt-1">{s.label}</div>
              </motion.div>
            ))}
          </div>
          <button className="bg-gradient-to-r from-[#45C14A] to-[#1F6E33] text-white rounded-full px-8 py-3.5 text-sm font-semibold shadow-lg shadow-[#45C14A]/30 hover:scale-105 transition-all duration-300">
            Узнать больше о нас
          </button>
        </motion.div>
      </div>
    </section>
  );
}

function FeatureCard({ feature, index }) {
  const [hovered, setHovered] = useState(false);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const Icon = feature.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`p-8 rounded-2xl cursor-default transition-all duration-400 ${hovered ? "bg-white/10 shadow-2xl -translate-y-1.5" : "bg-white/5"
        }`}
      style={{ border: hovered ? `1px solid ${feature.color}40` : "1px solid rgba(255,255,255,0.07)" }}
    >
      <div
        className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all duration-400 border`}
        style={{ background: hovered ? `${feature.color}22` : "rgba(255,255,255,0.05)", borderColor: `${feature.color}30` }}
      >
        <Icon size={24} color={feature.color} />
      </div>
      <h3 className="font-['Playfair_Display'] text-white text-xl font-semibold mb-3">{feature.title}</h3>
      <p className="text-white/50 text-sm font-light leading-relaxed">{feature.desc}</p>
      <div
        className="h-0.5 rounded-full mt-6 transition-opacity duration-300"
        style={{ background: `linear-gradient(to right, ${feature.color}, transparent)`, opacity: hovered ? 1 : 0 }}
      />
    </motion.div>
  );
}

function WhyUs({ features, loading }) {
  if (loading) {
    return (
      <section className="bg-[#111614] py-24">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-2 border-[#45C14A] border-t-transparent rounded-full animate-spin" />
        </div>
      </section>
    );
  }

  const displayFeatures = features.length > 0 ? features : fallbackFeatures;

  return (
    <section className="bg-[#111614] py-24 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(69,193,74,0.04)_0%,transparent_70%)] pointer-events-none" />
      <div className="max-w-[1280px] mx-auto px-6 md:px-[60px]">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-[#45C14A] text-[11px] font-semibold tracking-[0.25em] uppercase block mb-4">Наши преимущества</span>
          <h2 className="font-['Playfair_Display'] text-white text-[clamp(28px,4vw,48px)] font-bold mb-4">Почему гости выбирают нас</h2>
          <p className="text-white/50 text-base font-light max-w-[480px] mx-auto">Каждая деталь продумана, чтобы ваш визит стал незабываемым</p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayFeatures.map((f, i) => <FeatureCard key={i} feature={f} index={i} />)}
        </div>
      </div>
    </section>
  );
}

function Testimonials({ reviews, loading }) {
  const [current, setCurrent] = useState(0);

  if (loading) {
    return (
      <section className="bg-gradient-to-b from-[#111614] to-[#0F1113] py-24">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-2 border-[#45C14A] border-t-transparent rounded-full animate-spin" />
        </div>
      </section>
    );
  }

  const displayReviews = reviews.length > 0 ? reviews : fallbackReviews;
  const visible = [
    displayReviews[current % displayReviews.length],
    displayReviews[(current + 1) % displayReviews.length],
    displayReviews[(current + 2) % displayReviews.length]
  ];
  const prev = () => setCurrent((c) => (c - 1 + displayReviews.length) % displayReviews.length);
  const next = () => setCurrent((c) => (c + 1) % displayReviews.length);
  const avgRating = (displayReviews.reduce((sum, r) => sum + r.rating, 0) / displayReviews.length).toFixed(1);

  return (
    <section id="reviews" className="bg-gradient-to-b from-[#111614] to-[#0F1113] py-24 relative overflow-hidden">
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[radial-gradient(ellipse_at_center_bottom,rgba(69,193,74,0.06)_0%,transparent_70%)] pointer-events-none" />
      <div className="max-w-[1280px] mx-auto px-6 md:px-[60px]">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-[#45C14A] text-[11px] font-semibold tracking-[0.25em] uppercase block mb-4">Отзывы</span>
          <h2 className="font-['Playfair_Display'] text-white text-[clamp(28px,4vw,48px)] font-bold mb-4">Что говорят наши гости</h2>
          <p className="text-white/50 text-base font-light">Более 5 000 счастливых отзывов</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="flex justify-center mb-12"
        >
          <div className="inline-flex items-center gap-3 bg-[#C9A86A]/10 border border-[#C9A86A]/30 rounded-full px-7 py-3">
            <div className="flex gap-0.5">{[...Array(5)].map((_, i) => (<Star key={i} size={16} fill="#C9A86A" color="#C9A86A" />))}</div>
            <span className="text-[#C9A86A] font-['Playfair_Display'] text-lg font-bold">{avgRating}</span>
            <span className="text-white/50 text-xs">средний рейтинг</span>
          </div>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <AnimatePresence mode="popLayout">
            {visible.map((review, i) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-8"
              >
                <div className="flex gap-1 mb-5">{[...Array(review.rating)].map((_, j) => (<Star key={j} size={14} fill="#C9A86A" color="#C9A86A" />))}</div>
                <div className="font-['Playfair_Display'] text-5xl leading-none mb-4 opacity-40" style={{ color: review.color }}>"</div>
                <p className="text-white/75 text-sm font-light leading-relaxed mb-6">{review.text}</p>
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-['Playfair_Display'] text-lg font-bold" style={{ background: `linear-gradient(135deg, ${review.color}, ${review.color}80)` }}>{review.avatar}</div>
                  <div><div className="text-white text-sm font-semibold">{review.name}</div><div className="text-white/40 text-xs">{review.role}</div></div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        <div className="flex justify-center gap-4">
          <button onClick={prev} className="w-12 h-12 rounded-full bg-white/10 border border-white/15 text-white hover:bg-[#45C14A] hover:border-[#45C14A] transition-all duration-300 flex items-center justify-center"><ChevronLeft size={20} /></button>
          <button onClick={next} className="w-12 h-12 rounded-full bg-[#45C14A] text-white hover:bg-[#1F6E33] transition-all duration-300 flex items-center justify-center"><ChevronRight size={20} /></button>
        </div>
      </div>
    </section>
  );
}

function Reservation() {
  const [submitted, setSubmitted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: 'success', title: '', message: '' });
  const [form, setForm] = useState({ name: "", phone: "", guests: "2", date: "", time: "" });
  
  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  
  const showNotification = (type, title, message) => {
    setNotification({ show: true, type, title, message });
    setTimeout(() => {
      setNotification({ show: false, type: 'success', title: '', message: '' });
    }, 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.name || !form.phone || !form.date || !form.time) {
      showNotification('warning', 'Не все поля заполнены', 'Пожалуйста, заполните все поля формы');
      return;
    }

    setIsProcessing(true);

    try {
      const result = await reservationsAPI.create(form);
      
      if (result.success) {
        setSubmitted(true);
        showNotification(
          'success',
          'Бронирование подтверждено! 🎉',
          `${form.name}, ждём вас ${new Date(form.date).toLocaleDateString('ru-RU')} в ${form.time}. Наши менеджеры свяжутся с вами.`
        );
        setTimeout(() => {
          setSubmitted(false);
          setForm({ name: "", phone: "", guests: "2", date: "", time: "" });
        }, 3000);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      showNotification(
        'error',
        'Ошибка бронирования',
        'Не удалось забронировать стол. Пожалуйста, попробуйте позже или позвоните нам.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <section id="reservation" className="bg-[#0F1113] py-24 relative overflow-hidden">
      {/* ... остальной код секции без изменений */}
      <div className="max-w-[800px] mx-auto px-6 md:px-[60px]">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-[#45C14A] text-[11px] font-semibold tracking-[0.25em] uppercase block mb-4">Бронирование</span>
          <h2 className="font-['Playfair_Display'] text-white text-[clamp(28px,4vw,48px)] font-bold mb-4">Забронируйте ваш стол</h2>
          <p className="text-white/50 text-base font-light">Гарантируем тёплый приём и лучший стол для вас и вашей семьи</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 backdrop-blur-sm shadow-2xl"
        >
          {submitted ? (
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
              <div className="w-20 h-20 rounded-full bg-[#45C14A]/25 border-2 border-[#45C14A] flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={36} color="#45C14A" />
              </div>
              <h3 className="font-['Playfair_Display'] text-white text-3xl font-bold mb-3">Бронирование подтверждено!</h3>
              <p className="text-white/60 text-sm leading-relaxed mb-8">
                Мы свяжемся с вами в течение 15 минут для подтверждения.<br />
                Ждём вас, {form.name}!
              </p>
              <button 
                onClick={() => {
                  setSubmitted(false);
                  setForm({ name: "", phone: "", guests: "2", date: "", time: "" });
                }} 
                className="bg-transparent text-[#45C14A] border border-[#45C14A] rounded-full px-7 py-3 text-sm font-semibold hover:bg-[#45C14A] hover:text-white transition-all duration-300"
              >
                Новое бронирование
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* ... форма без изменений */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/35" />
                  <input 
                    type="text" 
                    name="name" 
                    placeholder="Ваше имя" 
                    value={form.name} 
                    onChange={handleChange} 
                    required 
                    className="w-full bg-white/5 border border-white/15 rounded-xl py-3.5 pl-11 pr-4 text-white text-sm outline-none focus:border-[#45C14A] focus:bg-[#45C14A]/5 transition-all" 
                  />
                </div>
                <div className="relative">
                  <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/35" />
                  <input 
                    type="tel" 
                    name="phone" 
                    placeholder="Номер телефона" 
                    value={form.phone} 
                    onChange={handleChange} 
                    required 
                    className="w-full bg-white/5 border border-white/15 rounded-xl py-3.5 pl-11 pr-4 text-white text-sm outline-none focus:border-[#45C14A] focus:bg-[#45C14A]/5 transition-all" 
                  />
                </div>
                <div className="relative">
                  <Users size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/35 z-10" />
                  <select 
                    name="guests" 
                    value={form.guests} 
                    onChange={handleChange} 
                    className="w-full bg-white/5 border border-white/15 rounded-xl py-3.5 pl-11 pr-4 text-white text-sm outline-none focus:border-[#45C14A] appearance-none cursor-pointer"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 15, 20].map((n) => (
                      <option key={n} value={n} className="bg-[#1a1c1f]">{n} {n === 1 ? "гость" : n < 5 ? "гостя" : "гостей"}</option>
                    ))}
                  </select>
                </div>
                <div className="relative">
                  <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/35" />
                  <input 
                    type="date" 
                    name="date" 
                    value={form.date} 
                    onChange={handleChange} 
                    required 
                    min={new Date().toISOString().split("T")[0]} 
                    className="w-full bg-white/5 border border-white/15 rounded-xl py-3.5 pl-11 pr-4 text-white text-sm outline-none focus:border-[#45C14A] focus:bg-[#45C14A]/5 transition-all [color-scheme:dark]" 
                  />
                </div>
                <div className="relative md:col-span-2">
                  <Clock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/35" />
                  <select 
                    name="time" 
                    value={form.time} 
                    onChange={handleChange} 
                    required 
                    className="w-full bg-white/5 border border-white/15 rounded-xl py-3.5 pl-11 pr-4 text-white text-sm outline-none focus:border-[#45C14A] appearance-none cursor-pointer"
                  >
                    <option value="" className="bg-[#1a1c1f]">Выберите время</option>
                    {["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00"].map((t) => (
                      <option key={t} value={t} className="bg-[#1a1c1f]">{t}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button 
                type="submit" 
                disabled={isProcessing}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-[#45C14A] to-[#1F6E33] text-white font-semibold shadow-lg shadow-[#45C14A]/30 hover:-translate-y-0.5 hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Бронирование...</span>
                  </div>
                ) : (
                  'Забронировать стол'
                )}
              </button>
              <p className="text-white/35 text-xs text-center mt-4">Мы перезвоним в течение 15 минут для подтверждения бронирования</p>
            </form>
          )}
        </motion.div>
      </div>

      <Notification
        isOpen={notification.show}
        onClose={() => setNotification({ show: false, type: 'success', title: '', message: '' })}
        type={notification.type}
        title={notification.title}
        message={notification.message}
      />
    </section>
  );
}

function Location({ hours, loading }) {
  if (loading) {
    return (
      <section className="bg-[#111614] py-24">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-2 border-[#45C14A] border-t-transparent rounded-full animate-spin" />
        </div>
      </section>
    );
  }

  const displayHours = hours.length > 0 ? hours : fallbackHours;

  return (
    <section id="contact" className="bg-[#111614] py-24">
      <div className="max-w-[1280px] mx-auto px-6 md:px-[60px]">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-[#45C14A] text-[11px] font-semibold tracking-[0.25em] uppercase block mb-4">Как нас найти</span>
          <h2 className="font-['Playfair_Display'] text-white text-[clamp(28px,4vw,48px)] font-bold">Мы ждём вас</h2>
        </motion.div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="flex flex-col gap-6"
          >
            <div className="bg-white/5 border border-white/10 rounded-2xl p-7">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-[#45C14A]/20 border border-[#45C14A]/40 flex items-center justify-center"><MapPin size={20} color="#45C14A" /></div>
                <div><div className="text-white/50 text-[11px] font-semibold tracking-[0.15em] uppercase mb-2">Адрес</div><div className="text-white text-sm leading-relaxed">г. Ташкент, Мирзо-Улугбекский район,<br />ул. Навои, 45</div><a href="https://maps.google.com" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-[#45C14A] text-xs font-medium mt-2.5">Открыть на картах <ExternalLink size={12} /></a></div>
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-7">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-[#C9A86A]/20 border border-[#C9A86A]/40 flex items-center justify-center"><Phone size={20} color="#C9A86A" /></div>
                <div><div className="text-white/50 text-[11px] font-semibold tracking-[0.15em] uppercase mb-2">Телефон</div><a href="tel:+998901234567" className="text-white text-lg font-semibold block mb-1">+998 90 123-45-67</a><a href="tel:+998711234567" className="text-white/50 text-sm">+998 71 123-45-67</a></div>
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-7">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-[#45C14A]/20 border border-[#45C14A]/40 flex items-center justify-center"><Clock size={20} color="#45C14A" /></div>
                <div className="flex-1"><div className="text-white/50 text-[11px] font-semibold tracking-[0.15em] uppercase mb-4">Часы работы</div>{displayHours.map((h, i) => (<div key={i} className={`flex justify-between items-center ${i < displayHours.length - 1 ? "pb-3 mb-3 border-b border-white/10" : ""}`}><span className="text-white/60 text-xs">{h.day}</span><span className="text-[#45C14A] text-xs font-semibold">{h.time}</span></div>))}</div>
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            viewport={{ once: true }}
            className="rounded-2xl overflow-hidden h-[500px] border border-white/10 relative"
          >
            <iframe title="Кафе AJR Family Location" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2691.702703055712!2d69.5993785!3d40.2642436!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38b1b391e33a8569%3A0x4260a427f1d10fb0!2z0JrQsNGE0LUg0JDQp9Cg!5e1!3m2!1sru!2s!4v1774381885512!5m2!1sru!2s" width="100%" height="100%" style={{ border: 0, filter: "invert(0.9) hue-rotate(180deg) saturate(0.5)" }} allowFullScreen loading="lazy" />
            <div className="absolute bottom-6 left-6 bg-[#0F1113]/90 backdrop-blur-xl border border-[#45C14A]/30 rounded-xl px-4 py-3.5 flex items-center gap-2.5"><MapPin size={16} color="#45C14A" /><span className="text-white text-xs font-medium">Кафе AJR Family</span></div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function Footer({ onNavigate }) {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const scrollTo = (href) => {
    if (href === "/") {
      onNavigate("home");
      setTimeout(() => {
        const el = document.querySelector("#hero");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else if (href === "/menu") {
      onNavigate("menu");
    } else {
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };
  const handleSubscribe = (e) => { e.preventDefault(); if (email) setSubscribed(true); };

  return (
    <footer className="bg-[#080a0b] border-t border-white/10 pt-20">
      <div className="max-w-[1280px] mx-auto px-6 md:px-[60px]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 pb-16 border-b border-white/10">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#45C14A] to-[#1F6E33] flex items-center justify-center overflow-hidden">
                <img
                  src="/ajr-icon.ico"
                  alt="AJR Family"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = '<span className="font-[\'Playfair_Display\'] text-white text-lg font-bold">K</span>';
                  }}
                />
              </div>
              <div>
                <div className="font-['Playfair_Display'] text-[#45C14A] text-[28px] font-bold leading-tight">AJR Family</div>
                <div className="text-white/50 text-[8px] tracking-[0.2em] uppercase">Семейный ресторан</div>
              </div>
            </div>
            <p className="text-white/45 text-sm leading-relaxed mb-7 max-w-[280px]">Семейный ресторан, где каждое блюдо приготовлено с любовью и уважением к традициям. Место, где семья встречается со вкусом.</p>
            <div className="flex gap-3">{socials.map((s) => { const Icon = s.icon; return (<a key={s.label} href={s.href} className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-white/50 hover:bg-[#E1306C]/20 hover:border-[#E1306C]/50 hover:text-[#E1306C] transition-all duration-300"><Icon size={16} /></a>); })}</div>
          </div>
          <div><h4 className="text-white text-xs font-semibold tracking-[0.1em] uppercase mb-5">Навигация</h4><div className="flex flex-col gap-3">{navLinks.map((l) => (<button key={l.href} onClick={() => scrollTo(l.href)} className="text-white/45 text-sm text-left hover:text-[#45C14A] transition-colors flex items-center gap-2"><l.icon size={12} />{l.label}</button>))}</div></div>
          <div><h4 className="text-white text-xs font-semibold tracking-[0.1em] uppercase mb-5">Контакты</h4><div className="flex flex-col gap-4"><div className="flex gap-2.5"><MapPin size={15} color="#45C14A" className="shrink-0 mt-0.5" /><span className="text-white/45 text-xs leading-relaxed">г. Ташкент, ул. Навои, 45</span></div><div className="flex gap-2.5"><Phone size={15} color="#45C14A" /><a href="tel:+998901234567" className="text-white/45 text-xs">+998 90 123-45-67</a></div><div className="flex gap-2.5"><Clock size={15} color="#45C14A" /><span className="text-white/45 text-xs">Ежедневно: 08:00 — 23:00</span></div></div></div>
          <div><h4 className="text-white text-xs font-semibold tracking-[0.1em] uppercase mb-3">Подписаться на новости</h4><p className="text-white/40 text-xs leading-relaxed mb-5">Узнавайте первыми об акциях, новых блюдах и специальных вечерах</p>{subscribed ? (<div className="bg-[#45C14A]/20 border border-[#45C14A]/30 rounded-xl p-3.5 text-[#45C14A] text-xs">✓ Вы успешно подписались!</div>) : (<form onSubmit={handleSubscribe} className="flex gap-2"><input type="email" placeholder="Ваш email" value={email} onChange={(e) => setEmail(e.target.value)} required className="flex-1 bg-white/10 border border-white/15 rounded-xl px-3.5 py-3 text-white text-xs outline-none focus:border-[#45C14A]" /><button type="submit" className="bg-gradient-to-r from-[#45C14A] to-[#1F6E33] rounded-xl w-10 h-10 flex items-center justify-center text-white"><Send size={15} /></button></form>)}</div>
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-center py-6 gap-2"><span className="text-white/25 text-xs">© 2025 Кафе AJR Family. Все права защищены.</span><span className="text-white/25 text-xs">Сделано с ❤️ для семьи</span></div>
      </div>
    </footer>
  );
}

function FloatingButton() {
  const [visible, setVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll);

    return () => {
      window.removeEventListener("resize", checkMobile);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const scrollTo = () => {
    const el = document.querySelector("#reservation");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  if (isMobile) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5, x: 60 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          exit={{ opacity: 0, scale: 0.5, x: 60 }}
          transition={{ type: "spring", damping: 20 }}
          onClick={scrollTo}
          className="fixed bottom-8 right-8 z-40 flex items-center gap-3 px-5 py-3 rounded-full bg-gradient-to-r from-[#45C14A] to-[#1F6E33] text-white text-sm font-semibold shadow-lg shadow-[#45C14A]/40 hover:scale-105 transition-all duration-300"
        >
          <CalendarCheck size={18} />
          <span>Забронировать</span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}

function MenuPreview({ onNavigate, dishes, loading }) {
  const { addToCart } = useCart();
  const [addedId, setAddedId] = useState(null);

  if (loading) {
    return (
      <section className="bg-[#0F1113] py-24">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-2 border-[#45C14A] border-t-transparent rounded-full animate-spin" />
        </div>
      </section>
    );
  }

  const handleAdd = (dish) => {
    addToCart(dish);
    setAddedId(dish.id);
    setTimeout(() => setAddedId(null), 1000);
  };

  return (
    <section className="bg-[#0F1113] py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(69,193,74,0.05)_0%,transparent_50%),radial-gradient(circle_at_80%_20%,rgba(201,168,106,0.04)_0%,transparent_50%)] pointer-events-none" />
      <div className="max-w-[1280px] mx-auto px-6 md:px-[60px]">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-[#45C14A] text-[11px] font-semibold tracking-[0.25em] uppercase block mb-4">Популярные блюда</span>
          <h2 className="font-['Playfair_Display'] text-white text-[clamp(28px,4vw,48px)] font-bold mb-4">Любимые блюда наших гостей</h2>
          <p className="text-white/50 text-base font-light max-w-[480px] mx-auto">Попробуйте наши хиты, которые выбирают чаще всего</p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {dishes.slice(0, 6).map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="group relative bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-[#45C14A]/40 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="relative overflow-hidden h-[200px]">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F1113]/80 via-transparent to-transparent" />
                <span className="absolute top-3 left-3 bg-[#45C14A]/90 text-white text-[10px] font-semibold px-2.5 py-1 rounded-full">{item.tag}</span>
              </div>
              <div className="p-5">
                <h3 className="font-['Playfair_Display'] text-white text-xl font-semibold mb-2">{item.name}</h3>
                <p className="text-white/45 text-xs leading-relaxed mb-4 line-clamp-2">{item.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[#C9A86A] font-['Playfair_Display'] text-lg font-bold">{item.price}</span>
                  <button
                    onClick={() => handleAdd(item)}
                    className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-300 flex items-center gap-1 ${addedId === item.id
                      ? "bg-[#45C14A] text-white"
                      : "bg-[#45C14A]/15 text-[#45C14A] border border-[#45C14A]/30 hover:bg-[#45C14A] hover:text-white"
                      }`}
                  >
                    {addedId === item.id ? <CheckCircle size={10} /> : <Plus size={10} />}
                    {addedId === item.id ? "Добавлено" : "В корзину"}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="text-center mt-12">
          <button
            onClick={() => onNavigate("menu")}
            className="px-8 py-3.5 rounded-full bg-gradient-to-r from-[#45C14A] to-[#1F6E33] text-white text-sm font-semibold hover:scale-105 transition-all duration-300 shadow-lg shadow-[#45C14A]/30 inline-flex items-center gap-2"
          >
            Смотреть полное меню
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </section>
  );
}

function HomePage({ onNavigate, dishes, reviews, features, hours, loading }) {
  return (
    <>
      <Hero />
      <SignatureDishes dishes={dishes} loading={loading} />
      <About />
      <WhyUs features={features} loading={loading} />
      <div id="menu" className="scroll-mt-20">
        <MenuPreview onNavigate={onNavigate} dishes={dishes} loading={loading} />
      </div>
      <Testimonials reviews={reviews} loading={loading} />
      <Reservation />
      <Location hours={hours} loading={loading} />
    </>
  );
}

// ============ ГЛАВНЫЙ КОМПОНЕНТ ============
export default function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const { dishes, reviewsData, featuresData, hoursData, loading } = useDataLoader();

  const handleNavigate = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <CartProvider>
      <div className="bg-[#0F1113] font-sans">
        <Header currentPage={currentPage} onNavigate={handleNavigate} />
        {currentPage === "home" ? (
          <HomePage 
            onNavigate={handleNavigate} 
            dishes={dishes} 
            reviews={reviewsData}
            features={featuresData}
            hours={hoursData}
            loading={loading}
          />
        ) : (
          <MenuPage dishes={dishes} />
        )}
        <Footer onNavigate={handleNavigate} />
        <FloatingButton />
        <CartDrawer />
      </div>
    </CartProvider>
  );
}