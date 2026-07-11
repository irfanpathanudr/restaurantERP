import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { ColumnDef } from '@tanstack/react-table';
import { setPageTitle } from '@/store/slices/uiSlice';
import { DataTable } from '@/components/common/DataTable';
import { Button } from '@/components/common/Button';
import { Plus, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Recipe {
  id: number;
  name: string;
  menu_item?: { name: string };
  preparation_time: number;
  cooking_time: number;
  serving_size: number;
}

const RecipesPage = () => {
  const dispatch = useDispatch();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    dispatch(setPageTitle('Recipes'));
    // fetchRecipes();
  }, [dispatch]);

  const columns: ColumnDef<Recipe>[] = [
    {
      accessorKey: 'name',
      header: 'Recipe Name',
    },
    {
      accessorKey: 'menu_item',
      header: 'Menu Item',
      cell: ({ row }) => row.original.menu_item?.name || '-',
    },
    {
      accessorKey: 'preparation_time',
      header: 'Prep Time',
      cell: ({ row }) => `${row.original.preparation_time} min`,
    },
    {
      accessorKey: 'cooking_time',
      header: 'Cook Time',
      cell: ({ row }) => `${row.original.cooking_time} min`,
    },
    {
      accessorKey: 'serving_size',
      header: 'Serving Size',
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" leftIcon={<Edit className="h-4 w-4" />}>
            Edit
          </Button>
          <Button
            size="sm"
            variant="ghost"
            leftIcon={<Trash2 className="h-4 w-4" />}
            className="text-red-600 hover:text-red-700"
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Recipes</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage recipes and ingredients
          </p>
        </div>
        <Button leftIcon={<Plus className="h-5 w-5" />} permission="recipes:create">
          Add Recipe
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={recipes}
        loading={loading}
        searchPlaceholder="Search recipes..."
      />
    </div>
  );
};

export default RecipesPage;
