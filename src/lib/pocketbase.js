// lib/pocketbase.js
import PocketBase from 'pocketbase';

const PB_URL = import.meta.env.VITE_PB_URL || 'http://127.0.0.1:8090';
const pb = new PocketBase(PB_URL);

export default pb;

// API для блюд
export const dishesAPI = {
  async getAll() {
    try {
      const records = await pb.collection('dishes').getFullList({
        sort: '-created',
        requestKey: null
      });
      
      return records.map(dish => ({
        id: dish.id,
        name: dish.name,
        description: dish.description,
        price: `${dish.price} сум`,
        tag: dish.tag,
        image: dish.image ? pb.files.getURL(dish, dish.image) : 'https://placehold.co/600x400/1F1F1F/6B7280?text=No+Image',
        category: dish.category
      }));
    } catch (error) {
      console.error('Error fetching dishes:', error);
      return [];
    }
  }
};

// API для отзывов
export const reviewsAPI = {
  async getAll() {
    try {
      const records = await pb.collection('reviews').getFullList({
        sort: '-created',
        requestKey: null
      });
      
      return records.map(review => ({
        id: review.id,
        name: review.name,
        role: review.role,
        text: review.text,
        rating: review.rating,
        avatar: review.avatar || review.name.charAt(0),
        color: review.color || '#45C14A'
      }));
    } catch (error) {
      console.error('Error fetching reviews:', error);
      return [];
    }
  }
};

// API для преимуществ
export const featuresAPI = {
  async getAll() {
    try {
      const records = await pb.collection('features').getFullList({
        sort: '-created',
        requestKey: null
      });
      
      const iconMap = {
        'Свежие продукты': Leaf,
        'Семейные рецепты': BookOpen,
        'Уютная атмосфера': Home,
        'Дружелюбный сервис': Heart,
        'Традиционный вкус': Star,
        'Высококлассная кухня': ChefHat
      };
      
      return records.map(feature => ({
        title: feature.title,
        desc: feature.desc,
        color: feature.color || '#45C14A',
        icon: iconMap[feature.title] || Star
      }));
    } catch (error) {
      console.error('Error fetching features:', error);
      return [];
    }
  }
};

// API для часов работы
export const hoursAPI = {
  async getAll() {
    try {
      const records = await pb.collection('hours').getFullList({
        sort: '-created',
        requestKey: null
      });
      
      return records.map(hour => ({
        day: hour.day,
        time: hour.time
      }));
    } catch (error) {
      console.error('Error fetching hours:', error);
      return [];
    }
  }
};

// API для заказов
export const ordersAPI = {
  async create(orderData) {
    try {
      const record = await pb.collection('orders').create({
        total_price: orderData.total_price,
        items: JSON.stringify(orderData.items),
      });
      return { success: true, data: record };
    } catch (error) {
      console.error('Error creating order:', error);
      return { success: false, error: error.message };
    }
  }
};

// API для бронирований
export const reservationsAPI = {
  async create(reservationData) {
    try {
      const record = await pb.collection('reservations').create({
        name: reservationData.name,
        phone: reservationData.phone,
        quests: parseInt(reservationData.guests),
        date: reservationData.date,
        time: reservationData.time
      });
      return { success: true, data: record };
    } catch (error) {
      console.error('Error creating reservation:', error);
      return { success: false, error: error.message };
    }
  }
};