import React, { useState, useEffect } from 'react';
import { Toaster } from './components/ui/sonner';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Login } from './components/Login';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { AddProduct } from './components/AddProduct';
import { UpdateStock } from './components/UpdateStock';
import { Reports } from './components/Reports';
import { Settings } from './components/Settings';
import { ProductDetails } from './components/ProductDetails';
import { EditProduct } from './components/EditProduct';
import { apiService, Product } from './services/api';
import { ErrorBoundary } from './components/ErrorDisplay';

function AppContent() {
  const { user, loading: authLoading } = useAuth();

  // Debug logging for authentication state
  useEffect(() => {
    console.log('App: Authentication state changed:', { 
      user: user ? `${user.email} (${user.id})` : null, 
      authLoading 
    });
  }, [user, authLoading]);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [settingsSection, setSettingsSection] = useState('overview');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [preSelectedProduct, setPreSelectedProduct] = useState<{productId: string, action: 'restock' | 'sell'} | null>(null);
  const [viewingProduct, setViewingProduct] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);

  // Load products when user is authenticated and auth loading is complete
  useEffect(() => {
    if (user && !authLoading) {
      console.log('User authenticated, loading products for user:', user.id);
      // Add a small delay to ensure session is properly established
      setTimeout(() => {
        loadProducts();
      }, 100);
    } else if (!authLoading && !user) {
      console.log('No user authenticated, clearing products');
      setProducts([]);
    }
  }, [user, authLoading]);

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Loading products directly...');
      
      // Debug authentication first
      try {
        const debugInfo = await apiService.debugAuth();
        console.log('Debug auth info:', debugInfo);
      } catch (debugErr) {
        console.log('Debug auth failed:', debugErr);
      }
      
      const fetchedProducts = await apiService.getAllProducts();
      console.log('Products fetched:', fetchedProducts.length);
      
      if (fetchedProducts.length === 0) {
        console.log('No products found, initializing sample data...');
        // Initialize with sample data if no products exist
        await apiService.initSampleData();
        const updatedProducts = await apiService.getAllProducts();
        setProducts(updatedProducts);
        console.log('Sample data initialized, products loaded:', updatedProducts.length);
      } else {
        setProducts(fetchedProducts);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      
      // Provide more specific error messages
      let userError = 'Failed to load products. ';
      if (errorMessage.includes('Failed to fetch')) {
        userError += 'Cannot connect to server. Please check your internet connection and try again.';
      } else if (errorMessage.includes('Authentication required')) {
        userError += 'Please sign out and sign back in.';
      } else if (errorMessage.includes('HTTP error! status: 401')) {
        userError += 'Authentication failed. Please sign out and sign back in.';
      } else {
        userError += 'Please try again.';
      }
      
      setError(userError);
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  // Show loading spinner while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const handleAddProduct = async (newProduct: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    setLoading(true);
    setError(null);
    try {
      const addedProduct = await apiService.addProduct(newProduct);
      setProducts(prev => [...prev, addedProduct]);
    } catch (err) {
      setError('Failed to add product. Please try again.');
      console.error('Error adding product:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStock = async (productId: string, quantityChange: number) => {
    setLoading(true);
    setError(null);
    try {
      const updatedProduct = await apiService.updateStock(productId, quantityChange);
      setProducts(prev => 
        prev.map(product => 
          product.id === productId ? updatedProduct : product
        )
      );
    } catch (err) {
      setError('Failed to update stock. Please try again.');
      console.error('Error updating stock:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleNavigateToUpdateStock = (productId: string, action: 'restock' | 'sell') => {
    setPreSelectedProduct({ productId, action });
    setCurrentPage('update-stock');
  };

  const handleViewProduct = (productId: string) => {
    setViewingProduct(productId);
  };

  const handleEditProduct = (productId: string) => {
    setViewingProduct(null); // Clear viewing state when entering edit mode
    setEditingProduct(productId);
  };

  const handleBackFromEdit = () => {
    const editingProductId = editingProduct;
    setEditingProduct(null);
    // Go back to viewing the product details after editing
    if (editingProductId) {
      setViewingProduct(editingProductId);
    }
  };

  const handleUpdateProduct = async (productId: string, updates: Partial<Product>) => {
    setLoading(true);
    setError(null);
    try {
      const updatedProduct = await apiService.updateProduct(productId, updates);
      setProducts(prev => 
        prev.map(product => 
          product.id === productId ? updatedProduct : product
        )
      );
    } catch (err) {
      setError('Failed to update product. Please try again.');
      console.error('Error updating product:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    setLoading(true);
    setError(null);
    try {
      await apiService.deleteProduct(productId);
      setProducts(prev => prev.filter(product => product.id !== productId));
    } catch (err) {
      setError('Failed to delete product. Please try again.');
      console.error('Error deleting product:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const renderCurrentPage = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-foreground">Loading...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-destructive mb-4">{error}</p>
            <button
              onClick={loadProducts}
              className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    // Handle viewing specific product
    if (viewingProduct) {
      const product = products.find(p => p.id === viewingProduct);
      if (product) {
        return <ProductDetails
          product={product}
          onBack={() => setViewingProduct(null)}
          onEdit={handleEditProduct}
          onDelete={handleDeleteProduct}
          onUpdateStock={handleUpdateStock}
          onNavigateToUpdateStock={handleNavigateToUpdateStock}
        />;
      } else {
        // Product not found, go back to dashboard
        setViewingProduct(null);
      }
    }

    // Handle editing specific product
    if (editingProduct) {
      const product = products.find(p => p.id === editingProduct);
      if (product) {
        return <EditProduct
          product={product}
          onBack={handleBackFromEdit}
          onUpdateProduct={handleUpdateProduct}
        />;
      } else {
        // Product not found, go back to dashboard
        setEditingProduct(null);
      }
    }

    // Filter products based on search query
    const filteredProducts = searchQuery 
      ? products.filter(product => 
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.sku.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : products;

    switch (currentPage) {
      case 'dashboard':
        return <Dashboard 
          products={filteredProducts} 
          onUpdateStock={handleUpdateStock}
          onNavigateToUpdateStock={handleNavigateToUpdateStock}
          onEditProduct={handleEditProduct}
          onDeleteProduct={handleDeleteProduct}
          onViewProduct={handleViewProduct}
        />;
      case 'add-product':
        return <AddProduct onAddProduct={handleAddProduct} />;
      case 'update-stock':
        return <UpdateStock 
          products={filteredProducts} 
          onUpdateStock={handleUpdateStock}
          preSelectedProduct={preSelectedProduct}
          onClearPreSelection={() => setPreSelectedProduct(null)}
        />;
      case 'reports':
        return <Reports products={filteredProducts} />;
      case 'settings':
        return <Settings 
          currentSection={settingsSection} 
          onSectionChange={setSettingsSection} 
        />;
      default:
        return <Dashboard 
          products={filteredProducts} 
          onUpdateStock={handleUpdateStock}
          onNavigateToUpdateStock={handleNavigateToUpdateStock}
          onEditProduct={handleEditProduct}
          onDeleteProduct={handleDeleteProduct}
          onViewProduct={handleViewProduct}
        />;
    }
  };

  if (!user) {
    return <Login />;
  }

  return (
    <Layout 
      currentPage={currentPage} 
      onPageChange={setCurrentPage}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
    >
      {renderCurrentPage()}
    </Layout>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
          <Toaster position="top-right" richColors />
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}