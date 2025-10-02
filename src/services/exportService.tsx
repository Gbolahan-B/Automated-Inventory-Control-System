interface Product {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  price: number;
  reorderLevel: number;
}

interface ExportData {
  products: Product[];
  lowStockProducts: Product[];
  totalValue: number;
  generatedDate: string;
}

export class ExportService {
  // Safely format numbers
  private static safeNumber(value: any): number {
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  }

  // Safely format currency
  private static formatCurrency(value: any): string {
    const num = this.safeNumber(value);
    return `₦${num.toLocaleString()}`;
  }

  // Safely format text
  private static safeText(value: any): string {
    return value ? String(value) : '';
  }

  // Get product status
  private static getProductStatus(product: Product): string {
    const quantity = this.safeNumber(product.quantity);
    const reorderLevel = this.safeNumber(product.reorderLevel);
    
    if (quantity <= reorderLevel) return 'Low Stock';
    if (quantity <= reorderLevel * 1.5) return 'Medium';
    return 'Good';
  }

  // Export to PDF with comprehensive error handling
  static async exportToPDF(data: ExportData): Promise<void> {
    try {
      // Check if we have data to export
      if (!data.products || data.products.length === 0) {
        throw new Error('No products available to export');
      }

      // Validate data structure
      if (!Array.isArray(data.products)) {
        throw new Error('Invalid product data format');
      }

      // Ensure all products have required fields
      const invalidProducts = data.products.filter(p => 
        !p.name || typeof p.quantity !== 'number' || typeof p.price !== 'number'
      );
      
      if (invalidProducts.length > 0) {
        console.warn('Found products with missing data:', invalidProducts);
        // Continue with valid products only
        data.products = data.products.filter(p => 
          p.name && typeof p.quantity === 'number' && typeof p.price === 'number'
        );
      }

      // Dynamic imports with fallback
      let jsPDF: any;
      let autoTable: any;
      
      try {
        const jsPDFModule = await import('jspdf');
        jsPDF = jsPDFModule.default || jsPDFModule;
        
        const autoTableModule = await import('jspdf-autotable');
        autoTable = autoTableModule.default || autoTableModule;
      } catch (importError) {
        console.error('Failed to load PDF libraries:', importError);
        throw new Error('PDF export functionality is not available. Please try again or contact support.');
      }

      // Create PDF document
      const doc = new jsPDF();
      
      // Add title and header
      doc.setFontSize(20);
      doc.setTextColor(50, 50, 50);
      doc.text('Automated Inventory Control System', 20, 20);
      
      doc.setFontSize(16);
      doc.text('Inventory Report', 20, 35);
      
      // Add metadata
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated on: ${data.generatedDate}`, 20, 45);
      
      // Summary section
      doc.setFontSize(12);
      doc.setTextColor(50, 50, 50);
      doc.text('Summary:', 20, 60);
      
      doc.setFontSize(10);
      doc.text(`Total Products: ${data.products.length}`, 25, 70);
      doc.text(`Low Stock Items: ${data.lowStockProducts.length}`, 25, 78);
      doc.text(`Total Inventory Value: ₦${data.totalValue.toLocaleString()}`, 25, 86);
      
      // Products table
      const tableData = data.products.map(product => [
        this.safeText(product.name).length > 25 ? `${this.safeText(product.name).substring(0, 25)}...` : this.safeText(product.name),
        this.safeText(product.sku),
        this.safeNumber(product.quantity).toString(),
        this.safeNumber(product.reorderLevel).toString(),
        this.formatCurrency(this.safeNumber(product.quantity) * this.safeNumber(product.price)),
        this.getProductStatus(product)
      ]);
      
      autoTable(doc, {
        head: [['Product Name', 'SKU', 'Stock', 'Reorder', 'Value', 'Status']],
        body: tableData,
        startY: 95,
        styles: { 
          fontSize: 8,
          cellPadding: 2
        },
        headStyles: { 
          fillColor: [66, 66, 66],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        alternateRowStyles: { 
          fillColor: [245, 245, 245] 
        },
        columnStyles: {
          0: { cellWidth: 35 },  // Product Name - reduced from 40
          1: { cellWidth: 20 },  // SKU - reduced from 25
          2: { cellWidth: 18, halign: 'center' },  // Stock - reduced from 20
          3: { cellWidth: 18, halign: 'center' },  // Reorder - reduced from 20
          4: { cellWidth: 28, halign: 'right' },   // Value - reduced from 30
          5: { cellWidth: 22, halign: 'center' }   // Status - reduced from 25
        },
        margin: { top: 20, right: 20, bottom: 20, left: 20 },
        tableWidth: 'auto'
      });
      
      // Add low stock section if there are low stock items
      if (data.lowStockProducts.length > 0) {
        const finalY = (doc as any).lastAutoTable.finalY + 15;
        
        doc.setFontSize(12);
        doc.setTextColor(200, 50, 50);
        doc.text('⚠️ Low Stock Alert:', 20, finalY);
        
        const lowStockTableData = data.lowStockProducts.map(product => [
          this.safeText(product.name).length > 30 ? `${this.safeText(product.name).substring(0, 30)}...` : this.safeText(product.name),
          this.safeText(product.sku),
          this.safeNumber(product.quantity).toString(),
          this.safeNumber(product.reorderLevel).toString(),
          'Immediate Restock Required'
        ]);
        
        autoTable(doc, {
          head: [['Product Name', 'SKU', 'Current Stock', 'Reorder Level', 'Action Required']],
          body: lowStockTableData,
          startY: finalY + 5,
          styles: { 
            fontSize: 8,
            cellPadding: 2
          },
          headStyles: { 
            fillColor: [220, 53, 69],
            textColor: [255, 255, 255],
            fontStyle: 'bold'
          },
          bodyStyles: {
            fillColor: [254, 242, 242]
          },
          columnStyles: {
            0: { cellWidth: 35 },  // Product Name
            1: { cellWidth: 20 },  // SKU
            2: { cellWidth: 25, halign: 'center' },  // Current Stock
            3: { cellWidth: 25, halign: 'center' },  // Reorder Level
            4: { cellWidth: 36, halign: 'center' }   // Action Required
          },
          margin: { top: 20, right: 20, bottom: 20, left: 20 },
          tableWidth: 'auto'
        });
      }
      
      // Save the PDF
      const fileName = `inventory-report-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      
    } catch (error) {
      console.error('PDF Export Error:', error);
      throw new Error(`Failed to export PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Export to Excel - Simple format matching Reports table exactly
  static async exportToExcel(data: ExportData): Promise<void> {
    try {
      // Check if we have data to export
      if (!data.products || data.products.length === 0) {
        throw new Error('No products available to export');
      }

      // Dynamic import with fallback
      let XLSX: any;
      
      try {
        XLSX = await import('xlsx');
      } catch (importError) {
        console.error('Failed to load Excel library:', importError);
        throw new Error('Excel export functionality is not available. Please try again or contact support.');
      }
      
      // Create workbook
      const wb = XLSX.utils.book_new();
      
      // Create data matching Reports table format exactly
      const excelData = data.products.map(product => ({
        'Product Name': this.safeText(product.name),
        'SKU': this.safeText(product.sku),
        'Current Stock': this.safeNumber(product.quantity),
        'Reorder Level': this.safeNumber(product.reorderLevel),
        'Value': `₦${(this.safeNumber(product.quantity) * this.safeNumber(product.price)).toLocaleString()}`,
        'Status': this.getProductStatus(product)
      }));
      
      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(excelData);
      
      // Set column widths
      ws['!cols'] = [
        { wch: 30 }, // Product Name
        { wch: 15 }, // SKU
        { wch: 15 }, // Current Stock
        { wch: 15 }, // Reorder Level
        { wch: 20 }, // Value
        { wch: 12 }  // Status
      ];
      
      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Inventory Report');
      
      // Generate filename and save
      const fileName = `inventory-report-${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
      
    } catch (error) {
      console.error('Excel Export Error:', error);
      throw new Error(`Failed to export Excel: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}