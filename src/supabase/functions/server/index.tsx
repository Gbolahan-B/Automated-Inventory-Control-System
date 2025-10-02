import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

app.use('*', logger(console.log));

// Check environment variables
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

console.log('Environment check:', {
  hasUrl: !!supabaseUrl,
  hasServiceKey: !!supabaseServiceKey,
  urlPreview: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'missing'
});

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables!');
  throw new Error('Server configuration error: Missing Supabase credentials');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Health check endpoint - no authentication required
app.get('/make-server-e78ed76b/health', (c) => {
  console.log('Health check endpoint called');
  return c.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Add a simple test endpoint to verify server is running
app.get('/make-server-e78ed76b/test', (c) => {
  console.log('Test endpoint called');
  return c.json({ message: 'Server is running!' });
});

// Debug endpoint to check authentication headers
app.get('/make-server-e78ed76b/debug-auth', async (c) => {
  const authHeader = c.req.header('Authorization');
  const allHeaders = {};
  
  // Get all headers for debugging
  c.req.raw.headers.forEach((value, key) => {
    allHeaders[key] = value;
  });
  
  console.log('Debug auth endpoint - headers received:', allHeaders);
  
  const userId = await getAuthenticatedUserId(c);
  
  return c.json({
    hasAuthHeader: !!authHeader,
    authHeaderPreview: authHeader ? `Bearer ${authHeader.split(' ')[1]?.substring(0, 20)}...` : null,
    userId: userId,
    timestamp: new Date().toISOString(),
    headers: allHeaders
  });
});

// Helper function to get authenticated user ID
async function getAuthenticatedUserId(c: any): Promise<string | null> {
  try {
    const authHeader = c.req.header('Authorization');
    console.log('Auth header received:', authHeader ? 'Bearer [token]' : 'none');
    
    if (!authHeader) {
      console.log('No authorization header provided');
      return null;
    }

    const accessToken = authHeader.split(' ')[1];
    if (!accessToken) {
      console.log('No access token found in auth header');
      return null;
    }

    console.log('Verifying access token...');
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error) {
      console.log('Token verification error:', error.message);
      return null;
    }
    
    if (!user?.id) {
      console.log('No user found for token');
      return null;
    }

    console.log('User authenticated:', user.id);
    return user.id;
  } catch (error) {
    console.log('Authentication error:', error);
    return null;
  }
}

// Get all products for the authenticated user
app.get('/make-server-e78ed76b/products', async (c) => {
  try {
    const userId = await getAuthenticatedUserId(c);
    if (!userId) {
      return c.json({ error: 'Authentication required' }, 401);
    }

    const products = await kv.getByPrefix(`user:${userId}:product:`);
    return c.json({ products: products || [] });
  } catch (error) {
    console.log('Error fetching products:', error);
    return c.json({ error: 'Failed to fetch products' }, 500);
  }
});

// Add new product for the authenticated user
app.post('/make-server-e78ed76b/products', async (c) => {
  try {
    const userId = await getAuthenticatedUserId(c);
    if (!userId) {
      return c.json({ error: 'Authentication required' }, 401);
    }

    const product = await c.req.json();
    const productId = `user:${userId}:product:${Date.now()}`;
    const productData = {
      id: productId,
      name: product.name,
      sku: product.sku,
      quantity: product.quantity,
      price: product.price,
      reorderLevel: product.reorderLevel,
      createdAt: new Date().toISOString()
    };
    
    await kv.set(productId, productData);
    return c.json({ success: true, product: productData });
  } catch (error) {
    console.log('Error adding product:', error);
    return c.json({ error: 'Failed to add product' }, 500);
  }
});

// Update product details for the authenticated user
app.put('/make-server-e78ed76b/products/:id', async (c) => {
  try {
    const userId = await getAuthenticatedUserId(c);
    if (!userId) {
      return c.json({ error: 'Authentication required' }, 401);
    }

    const productId = c.req.param('id');
    const updates = await c.req.json();
    
    // Verify the product belongs to the authenticated user
    if (!productId.startsWith(`user:${userId}:`)) {
      return c.json({ error: 'Product not found' }, 404);
    }
    
    const product = await kv.get(productId);
    if (!product) {
      return c.json({ error: 'Product not found' }, 404);
    }
    
    const updatedProduct = {
      ...product,
      ...updates,
      id: productId, // Ensure ID cannot be changed
      createdAt: product.createdAt, // Preserve creation date
      updatedAt: new Date().toISOString()
    };
    
    await kv.set(productId, updatedProduct);
    return c.json({ success: true, product: updatedProduct });
  } catch (error) {
    console.log('Error updating product:', error);
    return c.json({ error: 'Failed to update product' }, 500);
  }
});

// Update product stock for the authenticated user
app.put('/make-server-e78ed76b/products/:id/stock', async (c) => {
  try {
    const userId = await getAuthenticatedUserId(c);
    if (!userId) {
      return c.json({ error: 'Authentication required' }, 401);
    }

    const productId = c.req.param('id');
    const { quantityChange } = await c.req.json();
    
    // Verify the product belongs to the authenticated user
    if (!productId.startsWith(`user:${userId}:`)) {
      return c.json({ error: 'Product not found' }, 404);
    }
    
    const product = await kv.get(productId);
    if (!product) {
      return c.json({ error: 'Product not found' }, 404);
    }
    
    const updatedProduct = {
      ...product,
      quantity: Math.max(0, product.quantity + quantityChange),
      updatedAt: new Date().toISOString()
    };
    
    await kv.set(productId, updatedProduct);
    return c.json({ success: true, product: updatedProduct });
  } catch (error) {
    console.log('Error updating product stock:', error);
    return c.json({ error: 'Failed to update stock' }, 500);
  }
});

// Delete product for the authenticated user
app.delete('/make-server-e78ed76b/products/:id', async (c) => {
  try {
    const userId = await getAuthenticatedUserId(c);
    if (!userId) {
      return c.json({ error: 'Authentication required' }, 401);
    }

    const productId = c.req.param('id');
    
    // Verify the product belongs to the authenticated user
    if (!productId.startsWith(`user:${userId}:`)) {
      return c.json({ error: 'Product not found' }, 404);
    }
    
    await kv.del(productId);
    return c.json({ success: true });
  } catch (error) {
    console.log('Error deleting product:', error);
    return c.json({ error: 'Failed to delete product' }, 500);
  }
});

// Auth signup route
app.post('/make-server-e78ed76b/auth/signup', async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    
    if (!email || !password || !name) {
      return c.json({ error: 'Email, password, and name are required' }, 400);
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.log('Error creating user:', error);
      
      // Provide more user-friendly error messages with enhanced error handling
      let userMessage = error.message;
      let statusCode = 400;
      
      if (error.message.includes('already registered') || 
          error.message.includes('User already registered') ||
          error.message.includes('email_address_already_exists')) {
        userMessage = 'An account with this email address already exists. Please try signing in instead.';
        statusCode = 409; // Conflict status code for duplicate resource
      } else if (error.message.includes('Password should be at least') ||
                 error.message.includes('weak_password')) {
        userMessage = 'Password must be at least 6 characters long.';
      } else if (error.message.includes('invalid email') || 
                 error.message.includes('invalid_email')) {
        userMessage = 'Please enter a valid email address.';
      } else if (error.message.includes('email_rate_limit_exceeded')) {
        userMessage = 'Too many signup attempts. Please wait before trying again.';
        statusCode = 429; // Too many requests
      } else if (error.message.includes('signup_disabled')) {
        userMessage = 'Account creation is temporarily disabled. Please try again later.';
        statusCode = 503; // Service unavailable
      }
      
      return c.json({ 
        error: userMessage, 
        code: error.code || 'signup_error',
        details: error.message // Include original error for debugging
      }, statusCode);
    }

    return c.json({ success: true, user: data.user });
  } catch (error) {
    console.log('Error in signup route:', error);
    return c.json({ error: 'Failed to create user account' }, 500);
  }
});

// Get user notifications
app.get('/make-server-e78ed76b/notifications', async (c) => {
  try {
    const userId = await getAuthenticatedUserId(c);
    if (!userId) {
      return c.json({ error: 'Authentication required' }, 401);
    }

    const notifications = await kv.getByPrefix(`user:${userId}:notification:`);

    // Sort notifications by creation date (newest first)
    if (notifications) {
      notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return c.json({ notifications: notifications || [] });
  } catch (error) {
    console.log('Error fetching notifications:', error);
    return c.json({ error: 'Failed to fetch notifications' }, 500);
  }
});

// Mark notification as read
app.put('/make-server-e78ed76b/notifications/:id/read', async (c) => {
  try {
    const userId = await getAuthenticatedUserId(c);
    if (!userId) {
      return c.json({ error: 'Authentication required' }, 401);
    }

    const notificationId = c.req.param('id');
    
    // Verify the notification belongs to the authenticated user
    if (!notificationId.startsWith(`user:${userId}:`)) {
      return c.json({ error: 'Notification not found' }, 404);
    }
    
    const notification = await kv.get(notificationId);
    
    if (!notification) {
      return c.json({ error: 'Notification not found' }, 404);
    }

    const updatedNotification = {
      ...notification,
      read: true,
      readAt: new Date().toISOString()
    };

    await kv.set(notificationId, updatedNotification);
    return c.json({ success: true, notification: updatedNotification });
  } catch (error) {
    console.log('Error marking notification as read:', error);
    return c.json({ error: 'Failed to mark notification as read' }, 500);
  }
});



// Initialize with sample data for the authenticated user
app.post('/make-server-e78ed76b/init-sample-data', async (c) => {
  try {
    const userId = await getAuthenticatedUserId(c);
    if (!userId) {
      return c.json({ error: 'Authentication required' }, 401);
    }

    const existingProducts = await kv.getByPrefix(`user:${userId}:product:`);
    if (existingProducts && existingProducts.length > 0) {
      return c.json({ message: 'Sample data already exists for this user' });
    }

    const sampleProducts = [
      {
        name: 'Wireless Bluetooth Headphones',
        sku: 'WBH-001',
        quantity: 45,
        price: 89.99,
        reorderLevel: 20
      },
      {
        name: 'USB-C Charging Cable',
        sku: 'USB-002',
        quantity: 8,
        price: 19.99,
        reorderLevel: 15
      },
      {
        name: 'Portable Power Bank',
        sku: 'PPB-003',
        quantity: 32,
        price: 49.99,
        reorderLevel: 10
      },
      {
        name: 'Wireless Mouse',
        sku: 'WM-004',
        quantity: 67,
        price: 34.99,
        reorderLevel: 25
      },
      {
        name: 'Mechanical Keyboard',
        sku: 'MK-005',
        quantity: 5,
        price: 129.99,
        reorderLevel: 12
      },
      {
        name: 'Monitor Stand',
        sku: 'MS-006',
        quantity: 18,
        price: 39.99,
        reorderLevel: 8
      },
      {
        name: 'Desk Lamp LED',
        sku: 'DL-007',
        quantity: 23,
        price: 59.99,
        reorderLevel: 15
      },
      {
        name: 'Ergonomic Chair Cushion',
        sku: 'ECC-008',
        quantity: 2,
        price: 79.99,
        reorderLevel: 10
      }
    ];

    for (const product of sampleProducts) {
      const productId = `user:${userId}:product:${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const productData = {
        id: productId,
        ...product,
        createdAt: new Date().toISOString()
      };
      await kv.set(productId, productData);
    }

    // Create sample notifications for the user
    const sampleNotifications = [
      {
        id: `user:${userId}:notification:${Date.now()}_1`,
        type: 'low_stock',
        title: 'Low Stock Alert',
        message: 'USB-C Charging Cable is running low on stock (8 units remaining)',
        read: false,
        createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        productId: 'USB-002'
      },
      {
        id: `user:${userId}:notification:${Date.now()}_2`,
        type: 'out_of_stock',
        title: 'Out of Stock Alert',
        message: 'Ergonomic Chair Cushion is out of stock and needs immediate restocking',
        read: false,
        createdAt: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
        productId: 'ECC-008'
      },
      {
        id: `user:${userId}:notification:${Date.now()}_3`,
        type: 'reorder',
        title: 'Reorder Recommendation',
        message: 'Mechanical Keyboard has reached reorder level (5 units remaining)',
        read: true,
        createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        productId: 'MK-005'
      }
    ];

    for (const notification of sampleNotifications) {
      await kv.set(notification.id, notification);
    }

    return c.json({ success: true, message: 'Sample data and notifications initialized for user' });
  } catch (error) {
    console.log('Error initializing sample data:', error);
    return c.json({ error: 'Failed to initialize sample data' }, 500);
  }
});

Deno.serve(app.fetch);