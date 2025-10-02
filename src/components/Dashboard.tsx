import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Package, AlertTriangle, DollarSign } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner@2.0.3';

interface Product {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  price: number;
  reorderLevel: number;
}

interface DashboardProps {
  products: Product[];
  onUpdateStock: (productId: string, quantity: number) => Promise<void>;
  onNavigateToUpdateStock: (productId: string, action: 'restock' | 'sell') => void;
  onEditProduct: (productId: string) => void;
  onDeleteProduct: (productId: string) => Promise<void>;
  onViewProduct: (productId: string) => void;
}

export function Dashboard({ products, onUpdateStock, onNavigateToUpdateStock, onEditProduct, onDeleteProduct, onViewProduct }: DashboardProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  
  const totalProducts = products.length;
  const lowStockItems = products.filter(p => p.quantity <= p.reorderLevel).length;
  const totalValue = products.reduce((sum, p) => sum + (p.quantity * p.price), 0);
  
  // Get the current time for appropriate greeting
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const handleRestock = async (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setProcessingId(productId);
      try {
        const restockAmount = Math.max(10, product.reorderLevel * 2);
        await onUpdateStock(productId, restockAmount);
        toast.success(`Successfully restocked ${restockAmount} units!`);
      } catch (error) {
        toast.error('Failed to restock. Please try again.');
      } finally {
        setProcessingId(null);
      }
    }
  };

  const handleSell = async (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product && product.quantity > 0) {
      setProcessingId(productId);
      try {
        await onUpdateStock(productId, -1);
        toast.success('Successfully sold 1 unit!');
      } catch (error) {
        toast.error('Failed to sell. Please try again.');
      } finally {
        setProcessingId(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Personalized Greeting */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2">Dashboard</h1>
          <p className="text-lg text-muted-foreground">
            {getTimeBasedGreeting()}, {user?.name || 'User'}! 👋
          </p>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{lowStockItems}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Inventory Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{totalValue.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Product Inventory</CardTitle>
          <p className="text-sm text-muted-foreground">Click on any product row to view details and manage the product</p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-muted">
                <tr className="border-b border-border">
                  <th className="text-left py-4 px-4 font-medium text-foreground min-w-[200px]">Product Name</th>
                  <th className="text-left py-4 px-4 font-medium text-foreground min-w-[120px]">SKU</th>
                  <th className="text-center py-4 px-4 font-medium text-foreground min-w-[100px]">Quantity</th>
                  <th className="text-right py-4 px-4 font-medium text-foreground min-w-[100px]">Price</th>
                  <th className="text-center py-4 px-4 font-medium text-foreground min-w-[120px]">Reorder Level</th>
                  <th className="text-center py-4 px-4 font-medium text-foreground min-w-[120px]">Status</th>
                  <th className="text-center py-4 px-4 font-medium text-foreground min-w-[180px]">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-accent transition-colors cursor-pointer" onClick={() => onViewProduct(product.id)}>
                    <td className="py-4 px-4 font-medium text-foreground">{product.name}</td>
                    <td className="py-4 px-4 text-muted-foreground font-mono text-sm">{product.sku}</td>
                    <td className="py-4 px-4 text-center font-semibold text-foreground">{product.quantity}</td>
                    <td className="py-4 px-4 text-right font-semibold text-foreground">₦{product.price.toFixed(2)}</td>
                    <td className="py-4 px-4 text-center text-muted-foreground">{product.reorderLevel}</td>
                    <td className="py-4 px-4">
                      <div className="flex justify-center">
                        {product.quantity <= product.reorderLevel ? (
                          <Badge variant="destructive" className="flex items-center w-fit">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Low Stock
                          </Badge>
                        ) : (
                          <Badge variant="default" className="flex items-center w-fit bg-green-100 text-green-800">
                            <span className="mr-1">✅</span>
                            OK
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-center space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigateToUpdateStock(product.id, 'restock');
                          }}
                          className="text-green-600 border-green-600 hover:bg-green-50"
                        >
                          Restock
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigateToUpdateStock(product.id, 'sell');
                          }}
                          disabled={product.quantity === 0}
                          className="text-red-600 border-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                          Sell
                        </Button>
                        <Button
                          size="sm"
                          variant="default"
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewProduct(product.id);
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          View
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}