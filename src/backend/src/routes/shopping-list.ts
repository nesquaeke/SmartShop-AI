import { Router, Request, Response } from 'express';

const router = Router();

// Mock shopping list data
let shoppingLists: any[] = [
  {
    id: '1',
    name: 'Zakupy Tygodniowe',
    items: [
      {
        id: '1',
        productId: '1',
        name: 'Mleko UHT 3.2% 1L',
        quantity: 2,
        selectedStore: 'LIDL',
        price: 3.49,
        totalPrice: 6.98,
        checked: false
      },
      {
        id: '2',
        productId: '2',
        name: 'Chleb Żytni 500g',
        quantity: 1,
        selectedStore: 'Biedronka',
        price: 2.89,
        totalPrice: 2.89,
        checked: false
      }
    ],
    totalAmount: 9.87,
    estimatedSavings: 1.30,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// GET /api/shopping-list - Get all shopping lists
router.get('/', async (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: shoppingLists
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching shopping lists',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/shopping-list - Create new shopping list
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, items = [] } = req.body;
    
    const newList = {
      id: Date.now().toString(),
      name: name || 'Nowa Lista',
      items,
      totalAmount: items.reduce((sum: number, item: any) => sum + (item.totalPrice || 0), 0),
      estimatedSavings: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    shoppingLists.push(newList);
    
    res.status(201).json({
      success: true,
      data: newList,
      message: 'Shopping list created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating shopping list',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// PUT /api/shopping-list/:id/items - Add item to shopping list
router.put('/:id/items', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { productId, name, quantity, selectedStore, price } = req.body;
    
    const listIndex = shoppingLists.findIndex(list => list.id === id);
    if (listIndex === -1) {
      res.status(404).json({
        success: false,
        message: 'Shopping list not found'
      });
      return;
    }
    
    const newItem = {
      id: Date.now().toString(),
      productId,
      name,
      quantity: quantity || 1,
      selectedStore,
      price,
      totalPrice: (quantity || 1) * price,
      checked: false
    };
    
    shoppingLists[listIndex].items.push(newItem);
    shoppingLists[listIndex].totalAmount = shoppingLists[listIndex].items.reduce(
      (sum: number, item: any) => sum + item.totalPrice, 0
    );
    shoppingLists[listIndex].updatedAt = new Date();
    
    res.json({
      success: true,
      data: shoppingLists[listIndex],
      message: 'Item added to shopping list'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding item to shopping list',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// DELETE /api/shopping-list/:listId/items/:itemId - Remove item from shopping list
router.delete('/:listId/items/:itemId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { listId, itemId } = req.params;
    
    const listIndex = shoppingLists.findIndex(list => list.id === listId);
    if (listIndex === -1) {
      res.status(404).json({
        success: false,
        message: 'Shopping list not found'
      });
      return;
    }
    
    const itemIndex = shoppingLists[listIndex].items.findIndex((item: any) => item.id === itemId);
    if (itemIndex === -1) {
      res.status(404).json({
        success: false,
        message: 'Item not found'
      });
      return;
    }
    
    shoppingLists[listIndex].items.splice(itemIndex, 1);
    shoppingLists[listIndex].totalAmount = shoppingLists[listIndex].items.reduce(
      (sum: number, item: any) => sum + item.totalPrice, 0
    );
    shoppingLists[listIndex].updatedAt = new Date();
    
    res.json({
      success: true,
      data: shoppingLists[listIndex],
      message: 'Item removed from shopping list'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error removing item from shopping list',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/shopping-list/:id/optimize - Optimize shopping route
router.post('/:id/optimize', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const list = shoppingLists.find(list => list.id === id);
    if (!list) {
      res.status(404).json({
        success: false,
        message: 'Shopping list not found'
      });
      return;
    }
    
    // Mock optimization result
    const optimizedRoute = {
      route: ['LIDL', 'Biedronka', 'Auchan'],
      estimatedTime: 25,
      totalDistance: 8.5,
      totalSavings: list.estimatedSavings || 2.30,
      storeDetails: [
        {
          store: 'LIDL',
          items: list.items.filter((item: any) => item.selectedStore === 'LIDL'),
          subtotal: list.items
            .filter((item: any) => item.selectedStore === 'LIDL')
            .reduce((sum: number, item: any) => sum + item.totalPrice, 0)
        },
        {
          store: 'Biedronka',
          items: list.items.filter((item: any) => item.selectedStore === 'Biedronka'),
          subtotal: list.items
            .filter((item: any) => item.selectedStore === 'Biedronka')
            .reduce((sum: number, item: any) => sum + item.totalPrice, 0)
        },
        {
          store: 'Auchan',
          items: list.items.filter((item: any) => item.selectedStore === 'Auchan'),
          subtotal: list.items
            .filter((item: any) => item.selectedStore === 'Auchan')
            .reduce((sum: number, item: any) => sum + item.totalPrice, 0)
        }
      ].filter(store => store.items.length > 0)
    };
    
    res.json({
      success: true,
      data: optimizedRoute,
      message: 'Shopping route optimized successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error optimizing shopping route',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export { router as shoppingListRouter }; 