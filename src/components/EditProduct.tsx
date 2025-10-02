import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface Product {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  price: number;
  reorderLevel: number;
}

interface EditProductProps {
  product: Product;
  onBack: () => void;
  onUpdateProduct: (productId: string, updates: Partial<Product>) => Promise<void>;
}

export function EditProduct({ product, onBack, onUpdateProduct }: EditProductProps) {
  const [formData, setFormData] = useState({
    name: product.name,
    sku: product.sku,
    price: product.price.toString(),
    reorderLevel: product.reorderLevel.toString(),
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }

    if (!formData.sku.trim()) {
      newErrors.sku = 'SKU is required';
    }

    const price = parseFloat(formData.price);
    if (isNaN(price) || price <= 0) {
      newErrors.price = 'Price must be a positive number';
    }

    const reorderLevel = parseInt(formData.reorderLevel);
    if (isNaN(reorderLevel) || reorderLevel < 0) {
      newErrors.reorderLevel = 'Reorder level must be a non-negative number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors below');
      return;
    }

    setLoading(true);
    try {
      const updates = {
        name: formData.name.trim(),
        sku: formData.sku.trim(),
        price: parseFloat(formData.price),
        reorderLevel: parseInt(formData.reorderLevel),
      };

      await onUpdateProduct(product.id, updates);
      toast.success('Product updated successfully!');
      onBack();
    } catch (error) {
      toast.error('Failed to update product. Please try again.');
      console.error('Error updating product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
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
            <span>Back</span>
          </Button>
          <div>
            <h1 className="text-3xl mb-1">Edit Product</h1>
            <p className="text-muted-foreground">Update product information</p>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Product Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={errors.name ? 'border-red-500' : ''}
                  placeholder="Enter product name"
                />
                {errors.name && (
                  <p className="text-sm text-red-600 mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <Label htmlFor="sku">SKU *</Label>
                <Input
                  id="sku"
                  type="text"
                  value={formData.sku}
                  onChange={(e) => handleInputChange('sku', e.target.value)}
                  className={errors.sku ? 'border-red-500' : ''}
                  placeholder="Enter SKU"
                />
                {errors.sku && (
                  <p className="text-sm text-red-600 mt-1">{errors.sku}</p>
                )}
              </div>

              <div>
                <Label htmlFor="price">Price (₦) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  className={errors.price ? 'border-red-500' : ''}
                  placeholder="Enter price"
                />
                {errors.price && (
                  <p className="text-sm text-red-600 mt-1">{errors.price}</p>
                )}
              </div>

              <div>
                <Label htmlFor="reorderLevel">Reorder Level *</Label>
                <Input
                  id="reorderLevel"
                  type="number"
                  min="0"
                  value={formData.reorderLevel}
                  onChange={(e) => handleInputChange('reorderLevel', e.target.value)}
                  className={errors.reorderLevel ? 'border-red-500' : ''}
                  placeholder="Enter reorder level"
                />
                {errors.reorderLevel && (
                  <p className="text-sm text-red-600 mt-1">{errors.reorderLevel}</p>
                )}
              </div>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-2">Current Stock Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Current Quantity:</span>
                  <span className="ml-2 font-medium">{product.quantity} units</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Stock Value:</span>
                  <span className="ml-2 font-medium">₦{(product.quantity * parseFloat(formData.price || '0')).toLocaleString()}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Note: Editing product details will not change the current stock quantity. Use the stock management features to adjust inventory levels.
              </p>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{loading ? 'Updating...' : 'Update Product'}</span>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}