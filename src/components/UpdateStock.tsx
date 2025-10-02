import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner@2.0.3';

interface Product {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  price: number;
  reorderLevel: number;
}

interface UpdateStockProps {
  products: Product[];
  onUpdateStock: (productId: string, quantity: number) => Promise<void>;
  preSelectedProduct?: {productId: string, action: 'restock' | 'sell'} | null;
  onClearPreSelection?: () => void;
}

export function UpdateStock({ products, onUpdateStock, preSelectedProduct, onClearPreSelection }: UpdateStockProps) {
  const [selectedProductId, setSelectedProductId] = useState('');
  const [adjustmentQuantity, setAdjustmentQuantity] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionMode, setActionMode] = useState<'restock' | 'sell' | null>(null);

  // Handle pre-selected product
  useEffect(() => {
    if (preSelectedProduct) {
      setSelectedProductId(preSelectedProduct.productId);
      setActionMode(preSelectedProduct.action);
      // Clear the pre-selection after setting it
      if (onClearPreSelection) {
        onClearPreSelection();
      }
    }
  }, [preSelectedProduct, onClearPreSelection]);

  const selectedProduct = products.find(p => p.id === selectedProductId);

  const handleRestock = async () => {
    if (selectedProductId && adjustmentQuantity) {
      const quantity = parseInt(adjustmentQuantity);
      if (quantity > 0) {
        setLoading(true);
        try {
          await onUpdateStock(selectedProductId, quantity);
          setAdjustmentQuantity('');
          toast.success(`Successfully restocked ${quantity} units!`);
        } catch (error) {
          toast.error('Failed to restock. Please try again.');
        } finally {
          setLoading(false);
        }
      }
    }
  };

  const handleSell = async () => {
    if (selectedProductId && adjustmentQuantity) {
      const quantity = parseInt(adjustmentQuantity);
      const product = products.find(p => p.id === selectedProductId);
      
      if (product && quantity > 0 && quantity <= product.quantity) {
        setLoading(true);
        try {
          await onUpdateStock(selectedProductId, -quantity);
          setAdjustmentQuantity('');
          toast.success(`Successfully dispatched ${quantity} units!`);
        } catch (error) {
          toast.error('Failed to dispatch. Please try again.');
        } finally {
          setLoading(false);
        }
      } else if (product && quantity > product.quantity) {
        toast.error(`Cannot dispatch ${quantity} units. Only ${product.quantity} units available.`);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1>Update Stock</h1>
        {actionMode && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Quick {actionMode}:</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setActionMode(null);
                setSelectedProductId('');
                setAdjustmentQuantity('');
              }}
            >
              Clear
            </Button>
          </div>
        )}
      </div>
      
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Stock Adjustment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {actionMode && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Quick {actionMode === 'restock' ? 'Restocking' : 'Selling'} Mode:</strong> {' '}
                {selectedProduct ? `Selected ${selectedProduct.name} for ${actionMode}` : 'Product pre-selected from dashboard'}
              </p>
            </div>
          )}
          
          <div className="space-y-2">
            <Label>Select Product</Label>
            <Select value={selectedProductId} onValueChange={setSelectedProductId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a product" />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name} ({product.sku}) - Current: {product.quantity}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedProduct && (
            <Card className="bg-gray-50">
              <CardContent className="pt-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Product:</strong> {selectedProduct.name}
                  </div>
                  <div>
                    <strong>SKU:</strong> {selectedProduct.sku}
                  </div>
                  <div>
                    <strong>Current Stock:</strong> {selectedProduct.quantity}
                  </div>
                  <div>
                    <strong>Reorder Level:</strong> {selectedProduct.reorderLevel}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity to Adjust</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={adjustmentQuantity}
              onChange={(e) => setAdjustmentQuantity(e.target.value)}
              placeholder="Enter quantity"
            />
          </div>

          <div className="flex space-x-4">
            {(!actionMode || actionMode === 'restock') && (
              <Button
                onClick={handleRestock}
                disabled={!selectedProductId || !adjustmentQuantity || loading}
                className={`${actionMode === 'restock' ? 'flex-1' : 'flex-1'} bg-green-600 hover:bg-green-700`}
              >
                {loading ? 'Processing...' : 'Restock'}
              </Button>
            )}
            {(!actionMode || actionMode === 'sell') && (
              <Button
                onClick={handleSell}
                disabled={!selectedProductId || !adjustmentQuantity || loading}
                variant="destructive"
                className={`${actionMode === 'sell' ? 'flex-1' : 'flex-1'}`}
              >
                {loading ? 'Processing...' : 'Sell / Dispatch'}
              </Button>
            )}
          </div>

          {selectedProduct && adjustmentQuantity && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm">
                <strong>Preview:</strong> After this adjustment, stock will be{' '}
                <span className="font-semibold">
                  {selectedProduct.quantity + (parseInt(adjustmentQuantity) || 0)} units
                </span>{' '}
                (if restocking) or{' '}
                <span className="font-semibold">
                  {Math.max(0, selectedProduct.quantity - (parseInt(adjustmentQuantity) || 0))} units
                </span>{' '}
                (if dispatching)
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}