import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { ArrowLeft, Edit, Trash2, Package, DollarSign, AlertTriangle, Calendar, Tag, Hash } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface Product {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  price: number;
  reorderLevel: number;
  createdAt?: string;
  updatedAt?: string;
}

interface ProductDetailsProps {
  product: Product;
  onBack: () => void;
  onEdit: (productId: string) => void;
  onDelete: (productId: string) => Promise<void>;
  onUpdateStock: (productId: string, quantity: number) => Promise<void>;
  onNavigateToUpdateStock: (productId: string, action: 'restock' | 'sell') => void;
}

export function ProductDetails({ 
  product, 
  onBack, 
  onEdit, 
  onDelete, 
  onUpdateStock,
  onNavigateToUpdateStock 
}: ProductDetailsProps) {
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isLowStock = product.quantity <= product.reorderLevel;
  const totalValue = product.quantity * product.price;

  const handleQuickRestock = async () => {
    setLoading(true);
    try {
      const restockAmount = Math.max(10, product.reorderLevel * 2);
      await onUpdateStock(product.id, restockAmount);
      toast.success(`Successfully restocked ${restockAmount} units!`);
    } catch (error) {
      toast.error('Failed to restock. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSell = async () => {
    if (product.quantity === 0) {
      toast.error('Cannot sell - no stock available');
      return;
    }
    
    setLoading(true);
    try {
      await onUpdateStock(product.id, -1);
      toast.success('Successfully sold 1 unit!');
    } catch (error) {
      toast.error('Failed to sell. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(product.id);
      toast.success('Product deleted successfully');
      onBack(); // Navigate back after successful deletion
    } catch (error) {
      toast.error('Failed to delete product. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Button>
          <div>
            <h1 className="text-3xl mb-1">{product.name}</h1>
            <p className="text-muted-foreground">Product Details & Management</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => onEdit(product.id)}
            className="flex items-center space-x-2"
          >
            <Edit className="w-4 h-4" />
            <span>Edit Product</span>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center space-x-2 text-red-600 border-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Product</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{product.name}"? This action cannot be undone and will permanently remove the product from your inventory.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={deleting}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {deleting ? 'Deleting...' : 'Delete Product'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="w-5 h-5" />
                <span>Product Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Product Name</label>
                  <p className="text-lg font-semibold">{product.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">SKU</label>
                  <p className="text-lg font-mono">{product.sku}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Unit Price</label>
                  <p className="text-lg font-semibold">₦{product.price.toFixed(2)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Reorder Level</label>
                  <p className="text-lg">{product.reorderLevel} units</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stock Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5" />
                <span>Stock Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Current Stock</p>
                  <p className="text-3xl font-bold">{product.quantity}</p>
                  <p className="text-sm text-muted-foreground">units</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Stock Value</p>
                  <p className="text-3xl font-bold">₦{totalValue.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">total value</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Status</p>
                  <div className="flex justify-center mt-2">
                    {isLowStock ? (
                      <Badge variant="destructive" className="flex items-center">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Low Stock
                      </Badge>
                    ) : (
                      <Badge variant="default" className="bg-green-100 text-green-800 flex items-center">
                        <span className="mr-1">✅</span>
                        In Stock
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timestamps */}
          {(product.createdAt || product.updatedAt) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>Timeline</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {product.createdAt && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Created</label>
                      <p>{formatDate(product.createdAt)}</p>
                    </div>
                  )}
                  {product.updatedAt && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                      <p>{formatDate(product.updatedAt)}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Quick Actions Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={handleQuickRestock}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                {loading ? 'Processing...' : 'Quick Restock'}
              </Button>
              <Button
                onClick={handleQuickSell}
                disabled={loading || product.quantity === 0}
                variant="outline"
                className="w-full text-blue-600 border-blue-600 hover:bg-blue-50"
              >
                {loading ? 'Processing...' : 'Sell 1 Unit'}
              </Button>
              <Button
                onClick={() => onNavigateToUpdateStock(product.id, 'restock')}
                variant="outline"
                className="w-full"
              >
                Custom Restock
              </Button>
              <Button
                onClick={() => onNavigateToUpdateStock(product.id, 'sell')}
                variant="outline"
                className="w-full"
                disabled={product.quantity === 0}
              >
                Custom Sale
              </Button>
            </CardContent>
          </Card>

          {/* Stock Alert */}
          {isLowStock && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-800 flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5" />
                  <span>Low Stock Alert</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-red-700 text-sm mb-3">
                  This product is running low on stock. Current quantity ({product.quantity}) is at or below the reorder level ({product.reorderLevel}).
                </p>
                <Button
                  onClick={handleQuickRestock}
                  disabled={loading}
                  size="sm"
                  className="w-full bg-red-600 hover:bg-red-700 text-white"
                >
                  Restock Now
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}