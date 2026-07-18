import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '@/store/slices/uiSlice';
import { menuService } from '@/services/menu.service';
import { MenuItem } from '@/types/entities.types';
import { Search, Plus, Minus, ShoppingCart, UtensilsCrossed, Leaf, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/utils/cn';
import { Button } from '@/components/common/Button';

interface KOTItem {
  menuItem: MenuItem;
  quantity: number;
  notes?: string;
}

const KOTPage = () => {
  const dispatch = useDispatch();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [filteredMenuItems, setFilteredMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [kotItems, setKotItems] = useState<KOTItem[]>([]);
  const [tableNumber, setTableNumber] = useState('');

  useEffect(() => {
    dispatch(setPageTitle('Kitchen Orders (KOT)'));
    fetchMenuItems();
  }, [dispatch]);

  useEffect(() => {
    filterMenuItems();
  }, [searchQuery, selectedCategory, menuItems]);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const items = await menuService.getWithImages({ isAvailable: true });
      setMenuItems(items);
      setFilteredMenuItems(items);
    } catch (error) {
      toast.error('Failed to fetch menu items');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filterMenuItems = () => {
    let filtered = [...menuItems];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query) ||
          item.sku.toLowerCase().includes(query) ||
          item.category?.name.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(
        (item) =>
          item.category?.name.toLowerCase().replace(/\s+/g, '-') === selectedCategory
      );
    }

    setFilteredMenuItems(filtered);
  };

  // Get unique categories from menu items
  const categories = [
    { id: 'all', name: 'All Items' },
    ...Array.from(new Set(menuItems.map((item) => item.category?.name).filter(Boolean))).map(
      (name) => ({
        id: name?.toLowerCase().replace(/\s+/g, '-') || '',
        name: name || '',
      })
    ),
  ];

  const addToKOT = (menuItem: MenuItem) => {
    const existingItem = kotItems.find((item) => item.menuItem.id === menuItem.id);

    if (existingItem) {
      setKotItems(
        kotItems.map((item) =>
          item.menuItem.id === menuItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setKotItems([...kotItems, { menuItem, quantity: 1 }]);
    }
    toast.success(`${menuItem.name} added to KOT`);
  };

  const removeFromKOT = (menuItemId: string) => {
    const existingItem = kotItems.find((item) => item.menuItem.id === menuItemId);

    if (existingItem && existingItem.quantity > 1) {
      setKotItems(
        kotItems.map((item) =>
          item.menuItem.id === menuItemId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
      );
    } else {
      setKotItems(kotItems.filter((item) => item.menuItem.id !== menuItemId));
    }
  };

  const clearKOT = () => {
    setKotItems([]);
    setTableNumber('');
    toast.success('KOT cleared');
  };

  const submitKOT = () => {
    if (kotItems.length === 0) {
      toast.error('Please add items to KOT');
      return;
    }

    if (!tableNumber.trim()) {
      toast.error('Please enter table number');
      return;
    }

    // TODO: Implement KOT submission to backend
    toast.success(`KOT submitted for Table ${tableNumber}`);
    console.log('KOT Items:', kotItems);
    clearKOT();
  };

  const getTotalItems = () => {
    return kotItems.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getFoodTypeIcon = (foodType: string) => {
    switch (foodType) {
      case 'veg':
        return <Leaf className="w-4 h-4 text-green-600" />;
      case 'non_veg':
        return <div className="w-4 h-4 border-2 border-red-600 rounded-full" />;
      case 'egg':
        return <div className="w-4 h-4 border-2 border-yellow-600 rounded-full" />;
      case 'jain':
        return <Leaf className="w-4 h-4 text-orange-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Kitchen Orders (KOT)
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Create kitchen order tickets for tables
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Menu Items Section */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search Bar */}
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-4">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search menu items by name, category, or SKU..."
                className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-gray-100"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={cn(
                    'px-4 py-2 rounded-lg whitespace-nowrap transition-colors',
                    selectedCategory === category.id
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  )}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Menu Items Grid */}
          {loading ? (
            <div className="card p-6 text-center">
              <p className="text-gray-500 dark:text-gray-400">Loading menu items...</p>
            </div>
          ) : filteredMenuItems.length === 0 ? (
            <div className="card p-6 text-center">
              <UtensilsCrossed className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">
                {searchQuery || selectedCategory !== 'all'
                  ? 'No menu items found'
                  : 'No menu items available'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMenuItems.map((item) => (
                <div
                  key={item.id}
                  className="card overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                  onClick={() => addToKOT(item)}
                >
                  <div className="relative h-48 bg-gray-100 dark:bg-gray-700">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <UtensilsCrossed className="w-16 h-16 text-gray-400" />
                      </div>
                    )}
                    {!item.is_available && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <span className="text-white font-semibold">Not Available</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getFoodTypeIcon(item.food_type)}
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                            {item.name}
                          </h3>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {item.description || 'No description'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-lg font-bold text-primary-600">
                        ${Number(item.price).toFixed(2)}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {item.category?.name}
                      </span>
                    </div>
                    {item.preparation_time && (
                      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        Prep time: {item.preparation_time} mins
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* KOT Cart Section */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <ShoppingCart className="w-6 h-6" />
                KOT Cart
              </h2>
              {kotItems.length > 0 && (
                <span className="bg-primary-600 text-white px-3 py-1 rounded-full text-sm">
                  {getTotalItems()} items
                </span>
              )}
            </div>

            {/* Table Number Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Table Number *
              </label>
              <input
                type="text"
                placeholder="Enter table number"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
              />
            </div>

            {/* KOT Items */}
            <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
              {kotItems.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    No items added yet
                  </p>
                  <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                    Click on menu items to add
                  </p>
                </div>
              ) : (
                kotItems.map((item) => (
                  <div
                    key={item.menuItem.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    {item.menuItem.image && (
                      <img
                        src={item.menuItem.image}
                        alt={item.menuItem.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-gray-100 text-sm truncate">
                        {item.menuItem.name}
                      </p>
                      <p className="text-sm text-primary-600">
                        ${Number(item.menuItem.price).toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => removeFromKOT(item.menuItem.id)}
                        className="w-6 h-6 flex items-center justify-center rounded bg-gray-200 dark:bg-gray-600 hover:bg-red-500 hover:text-white transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-medium text-gray-900 dark:text-gray-100">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => addToKOT(item.menuItem)}
                        className="w-6 h-6 flex items-center justify-center rounded bg-gray-200 dark:bg-gray-600 hover:bg-green-500 hover:text-white transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Actions */}
            {kotItems.length > 0 && (
              <div className="space-y-3 border-t border-gray-200 dark:border-gray-600 pt-4">
                <div className="flex items-center justify-between text-lg font-bold">
                  <span className="text-gray-900 dark:text-gray-100">Total Items:</span>
                  <span className="text-primary-600">{getTotalItems()}</span>
                </div>
                <Button
                  onClick={submitKOT}
                  className="w-full"
                  variant="primary"
                  disabled={!tableNumber.trim()}
                >
                  Submit KOT
                </Button>
                <Button onClick={clearKOT} className="w-full" variant="outline">
                  Clear All
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KOTPage;
