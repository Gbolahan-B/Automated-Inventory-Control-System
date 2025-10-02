import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertTriangle, Package, TrendingUp, FileDown, FileSpreadsheet, Loader2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { ExportService } from '../services/exportService';

interface Product {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  price: number;
  reorderLevel: number;
}

interface ReportsProps {
  products: Product[];
}

export function Reports({ products }: ReportsProps) {
  const [isExporting, setIsExporting] = useState<'pdf' | 'excel' | null>(null);
  const lowStockProducts = products.filter(p => p.quantity <= p.reorderLevel);
  
  // Prepare chart data
  const chartData = products.map(product => ({
    name: product.name.length > 15 ? `${product.name.substring(0, 15)}...` : product.name,
    stock: product.quantity,
    reorderLevel: product.reorderLevel
  }));

  // Get status for a product
  const getProductStatus = (product: Product): string => {
    if (product.quantity <= product.reorderLevel) return 'Low Stock';
    if (product.quantity <= product.reorderLevel * 1.5) return 'Medium';
    return 'Good';
  };

  // Export to PDF
  const exportToPDF = async () => {
    if (isExporting) return;
    
    setIsExporting('pdf');
    try {
      const exportData = {
        products,
        lowStockProducts,
        totalValue: products.reduce((sum, p) => sum + (p.quantity * p.price), 0),
        generatedDate: new Date().toLocaleString()
      };
      
      await ExportService.exportToPDF(exportData);
      toast.success('PDF report exported successfully!');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to export PDF. Please try again.');
    } finally {
      setIsExporting(null);
    }
  };

  // Export to Excel
  const exportToExcel = async () => {
    if (isExporting) return;
    
    setIsExporting('excel');
    try {
      const exportData = {
        products,
        lowStockProducts,
        totalValue: products.reduce((sum, p) => sum + (p.quantity * p.price), 0),
        generatedDate: new Date().toLocaleString()
      };
      
      await ExportService.exportToExcel(exportData);
      toast.success('Excel report exported successfully!');
    } catch (error) {
      console.error('Error exporting Excel:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to export Excel. Please try again.');
    } finally {
      setIsExporting(null);
    }
  };



  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1>Reports</h1>
        <div className="flex gap-2">
          <Button 
            onClick={exportToPDF}
            variant="outline"
            size="sm"
            disabled={products.length === 0 || isExporting === 'pdf'}
          >
            {isExporting === 'pdf' ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <FileDown className="w-4 h-4 mr-2" />
            )}
            {isExporting === 'pdf' ? 'Exporting...' : 'Export PDF'}
          </Button>
          <Button 
            onClick={exportToExcel}
            variant="outline"
            size="sm"
            disabled={products.length === 0 || isExporting === 'excel'}
          >
            {isExporting === 'excel' ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <FileSpreadsheet className="w-4 h-4 mr-2" />
            )}
            {isExporting === 'excel' ? 'Exporting...' : 'Export Excel'}
          </Button>
        </div>
      </div>

      {products.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Products Found</h3>
            <p className="text-muted-foreground mb-4">
              Add some products to your inventory to generate reports and enable export functionality.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Export Info */}
      {products.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <FileDown className="w-4 h-4 text-blue-600" />
                </div>
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-blue-900">Export Options Available</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Generate comprehensive reports in PDF or Excel format. PDF includes formatted tables and summaries, 
                  while Excel provides multiple worksheets with detailed analysis and filtering capabilities.
                </p>
                <div className="flex flex-wrap gap-2 mt-2 text-xs text-blue-600">
                  <span className="bg-blue-100 px-2 py-1 rounded">���� PDF: Professional formatting</span>
                  <span className="bg-blue-100 px-2 py-1 rounded">📊 Excel: Advanced analysis</span>
                  <span className="bg-blue-100 px-2 py-1 rounded">🔄 Auto-downloads when ready</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Summary Statistics */}
      {products.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Products</p>
                  <p className="text-2xl font-medium">{products.length}</p>
                </div>
                <Package className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Value</p>
                  <p className="text-2xl font-medium">₦{products.reduce((sum, p) => sum + (p.quantity * p.price), 0).toLocaleString()}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Low Stock Items</p>
                  <p className="text-2xl font-medium text-red-600">{lowStockProducts.length}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Stock Health</p>
                  <p className="text-2xl font-medium text-green-600">
                    {Math.round(((products.length - lowStockProducts.length) / products.length) * 100)}%
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-green-600 text-lg">✓</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Stock Levels Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="w-5 h-5 mr-2" />
            All Products - Stock Levels
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-muted">
                <tr className="border-b border-border">
                  <th className="text-left py-4 px-4 font-medium text-foreground min-w-[200px]">Product Name</th>
                  <th className="text-left py-4 px-4 font-medium text-foreground min-w-[120px]">SKU</th>
                  <th className="text-center py-4 px-4 font-medium text-foreground min-w-[120px]">Current Stock</th>
                  <th className="text-center py-4 px-4 font-medium text-foreground min-w-[120px]">Reorder Level</th>
                  <th className="text-right py-4 px-4 font-medium text-foreground min-w-[120px]">Value</th>
                  <th className="text-center py-4 px-4 font-medium text-foreground min-w-[120px]">Status</th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-accent transition-colors">
                    <td className="py-4 px-4 font-medium text-foreground">{product.name}</td>
                    <td className="py-4 px-4 text-muted-foreground font-mono text-sm">{product.sku}</td>
                    <td className="py-4 px-4 text-center font-semibold text-foreground">{product.quantity}</td>
                    <td className="py-4 px-4 text-center text-muted-foreground">{product.reorderLevel}</td>
                    <td className="py-4 px-4 text-right font-semibold text-foreground">₦{(product.quantity * product.price).toLocaleString()}</td>
                    <td className="py-4 px-4">
                      <div className="flex justify-center">
                        {product.quantity <= product.reorderLevel ? (
                          <Badge variant="destructive">Low Stock</Badge>
                        ) : product.quantity <= product.reorderLevel * 1.5 ? (
                          <Badge variant="secondary">Medium</Badge>
                        ) : (
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            Good
                          </Badge>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Stock Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Stock by Product
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="stock" fill="#3b82f6" name="Current Stock" />
                <Bar dataKey="reorderLevel" fill="#ef4444" name="Reorder Level" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Low Stock Alert */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-red-600">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Low Stock Alert ({lowStockProducts.length} items)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {lowStockProducts.length === 0 ? (
            <p className="text-green-600 flex items-center">
              <span className="mr-2">✅</span>
              All products are adequately stocked!
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lowStockProducts.map((product) => (
                <Card key={product.id} className="border-red-200 bg-red-50">
                  <CardContent className="pt-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold">{product.name}</h4>
                      <p className="text-sm text-gray-600">SKU: {product.sku}</p>
                      <div className="flex justify-between text-sm">
                        <span>Current: <strong>{product.quantity}</strong></span>
                        <span>Reorder at: <strong>{product.reorderLevel}</strong></span>
                      </div>
                      <Badge variant="destructive" className="w-full justify-center">
                        Immediate Restock Required
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}