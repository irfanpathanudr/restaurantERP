import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '@/store/slices/uiSlice';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { apiService } from '@/services/api.service';
import { Plus, Search, Minus, ShoppingCart, X, UtensilsCrossed } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/utils/cn';

interface MenuItem {
  id: string;
  name: string;
  sku: string;
  description?: string;
  price: number;
  image_url?: string;
  is_available: boolean;
  preparation_time?: number;
  is_vegetarian: boolean;
  is_vegan: boolean;
  category?: {
    id: string;
    name: string;
  };
}

interface OrderItem {
  menu_item: MenuItem;
  quantity: number;
  special_instructions?: string;
}

interface Table {
  id: string;
  table_number: string;
  floor?: string;
  table_status: string;
}

const OrdersPage: React.FC = () => {
  const dispatch = useDispatch();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [orderType, setOrderType] = useState<string>('DINE_IN');
  const [orderNotes, setOrderNotes] = useState<string>('');

  // Unique categories from menu items
  const categories = [
    { id: 'all', name: 'All Items' },
    ...Array.from(new Set(menuItems.map(item => item.category?.name).filter(Boolean)))
      .map(name => ({
        id: name?.toLowerCase().replace(/\s+/g, '-') || '',
        name: name || ''
      }))
  ];

  useEffect(() => {
    dispatch(setPageTitle('Orders'));
    fetchMenuItems();
    fetchTables();
  }, [dispatch]);

  useEffect(() => {
    filterMenuItems();
  }, [searchQuery, selectedCategory, menuItems]);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/menu-items?isAvailable=true');
      setMenuItems(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch menu items');
    } finally {
      setLoading(false);
    }
  };

  const fetchTables = async () => {
    try {
      const response = await apiService.get('/tables');
      setTables(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch tables');
    }
  };

  const filterMenuItems = () => {
    let filtered = menuItems.filter(item => item.is_available);

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.sku.toLowerCase().includes(query) ||
        item.category?.name.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item =>
        item.category?.name.toLowerCase().replace(/\s+/g, '-') === selectedCategory
      );
    }

    setFilteredItems(filtered);
  };

  const addToCart = (menuItem: MenuItem) => {
    const existingItem = cart.find(item => item.menu_item.id === menuItem.id);
    
    if (existingItem) {
      setCart(cart.map(item =>
        item.menu_item.id === menuItem.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { menu_item: menuItem, quantity: 1 }]);
    }
    toast.success(`${menuItem.name} added to cart`);
  };

  const removeFromCart = (menuItemId: string) => {
    setCart(cart.filter(item => item.menu_item.id !== menuItemId));
  };

  const updateQuantity = (menuItemId: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.menu_item.id === menuItemId) {
        const newQuantity = item.quantity + delta;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + (item.menu_item.price * item.quantity), 0);
  };

  const handleCreateOrder = async () => {
    if (cart.length === 0) {
      toast.error('Please add items to cart');
      return;
    }

    if (orderType === 'DINE_IN' && !selectedTable) {
      toast.error('Please select a table');
      return;
    }

    try {
      const orderData = {
        order_type: orderType,
        table_id: orderType === 'DINE_IN' ? selectedTable : undefined,
        notes: orderNotes || undefined,
        items: cart.map(item => ({
          menu_item_id: item.menu_item.id,
          quantity: item.quantity,
          unit_price: item.menu_item.price,
          special_instructions: item.special_instructions || undefined,
        })),
      };

      await apiService.post('/orders', orderData);
      toast.success('Order created successfully');
      
      // Reset form
      setCart([]);
      setSelectedTable('');
      setOrderNotes('');
      setShowOrderModal(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create order');
    }
  };

  const handleNewOrder = () => {
    setCart([]);
    setSelectedTable('');
    setOrderNotes('');
    setOrderType('DINE_IN');
    setSearchQuery('');
    setSelectedCategory('all');
    setShowOrderModal(true);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Order Management
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Create and manage restaurant orders
          </p>
        </div>
        <Button
          leftIcon={<Plus className="h-5 w-5" />}
          onClick={handleNewOrder}
        >
          New Order
        </Button>
      </div>

      {/* Order List/History would go here */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <p className="text-center text-gray-500 dark:text-gray-400">
          Order history and management coming soon...
        </p>
      </div>

      {/* Create Order Modal */}
      <Modal
        open={showOrderModal}
        onClose={() => setShowOrderModal(false)}
        title="Create New Order"
        size="full"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
          {/* Menu Items Section */}
          <div className="lg:col-span-2 flex flex-col space-y-4 overflow-hidden">
            {/* Search and Filters */}
            <div className="space-y-3">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search menu items by name, category, or SKU..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Category Filter */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={cn(
                      'px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors',
                      selectedCategory === category.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    )}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Menu Items Grid */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                  <UtensilsCrossed className="h-16 w-16 mb-4 opacity-50" />
                  <p>No menu items found</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => addToCart(item)}
                      className="bg-white dark:bg-gray-700 rounded-lg shadow hover:shadow-lg transition-shadow duration-200 overflow-hidden text-left group"
                    >
                      {/* Item Image */}
                      <div className="aspect-square bg-gray-200 dark:bg-gray-600 relative overflow-hidden">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <UtensilsCrossed className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                          </div>
                        )}
                        
                        {/* Badges */}
                        <div className="absolute top-2 right-2 flex flex-col gap-1">
                          {item.is_vegan && (
                            <span className="px-2 py-0.5 text-xs font-bold bg-green-500 text-white rounded-full">
                              Vegan
                            </span>
                          )}
                          {item.is_vegetarian && !item.is_vegan && (
                            <span className="px-2 py-0.5 text-xs font-bold bg-green-400 text-white rounded-full">
                              Veg
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Item Details */}
                      <div className="p-3">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-1">
                          {item.name}
                        </h3>
                        {item.category && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {item.category.name}
                          </p>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                            ${item.price.toFixed(2)}
                          </span>
                          {item.preparation_time && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {item.preparation_time} min
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Cart Section */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 flex flex-col space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-200 dark:border-gray-700">
              <ShoppingCart className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                Order Cart ({cart.length})
              </h3>
            </div>

            {/* Order Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Order Type
              </label>
              <select
                value={orderType}
                onChange={(e) => setOrderType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="DINE_IN">Dine In</option>
                <option value="TAKEAWAY">Takeaway</option>
                <option value="DELIVERY">Delivery</option>
              </select>
            </div>

            {/* Table Selection for Dine In */}
            {orderType === 'DINE_IN' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Table *
                </label>
                <select
                  value={selectedTable}
                  onChange={(e) => setSelectedTable(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <option value="">Select Table</option>
                  {tables.filter(t => t.table_status === 'AVAILABLE').map(table => (
                    <option key={table.id} value={table.id}>
                      Table {table.table_number} {table.floor && `(${table.floor})`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto space-y-2">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-gray-500 dark:text-gray-400">
                  <ShoppingCart className="h-12 w-12 mb-2 opacity-50" />
                  <p className="text-sm">Cart is empty</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.menu_item.id}
                    className="bg-white dark:bg-gray-800 rounded-lg p-3 space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                          {item.menu_item.name}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          ${item.menu_item.price.toFixed(2)} each
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.menu_item.id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.menu_item.id, -1)}
                          className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center justify-center"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center font-medium text-gray-900 dark:text-gray-100">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.menu_item.id, 1)}
                          className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center justify-center"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        ${(item.menu_item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Order Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Order Notes
              </label>
              <textarea
                rows={2}
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder="Special instructions..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
              />
            </div>

            {/* Total and Actions */}
            <div className="space-y-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Total:
                </span>
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  ${calculateTotal().toFixed(2)}
                </span>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  onClick={() => setShowOrderModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateOrder}
                  disabled={cart.length === 0}
                  className="flex-1"
                >
                  Create Order
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default OrdersPage;
