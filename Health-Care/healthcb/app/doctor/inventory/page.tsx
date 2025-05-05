'use client';

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Search, Filter, AlertTriangle, ArrowLeft, Activity, BarChart2, ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Trash2 } from "lucide-react";
import BackgroundElements from "@/components/BackgroundElements";

// Mock data - Replace with actual API calls later
const mockInventoryData = [
  {
    id: 1,
    name: "Paracetamol",
    category: "Medicine",
    quantity: 100,
    unit: "tablets",
    expiryDate: "2024-12-31",
    minStockLevel: 20,
  },
  {
    id: 2,
    name: "Bandages",
    category: "Supplies",
    quantity: 50,
    unit: "rolls",
    expiryDate: "2024-06-30",
    minStockLevel: 10,
  },
  {
    id: 3,
    name: "Stethoscope",
    category: "Equipment",
    quantity: 5,
    unit: "pieces",
    expiryDate: null,
    minStockLevel: 2,
  },
];

const categories = ["Medicine", "Equipment", "Supplies", "Tools"];

const buttonHoverStyle = "hover:scale-105 transition-transform duration-200";
const cardStyle = "bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100";
const statCardStyle = "p-4 rounded-xl transition-all duration-300 hover:shadow-md";

export default function InventoryPage() {
  const router = useRouter();
  const [inventory, setInventory] = useState(mockInventoryData);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showLowStock, setShowLowStock] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // Filter inventory based on search, category, and low stock
  const filteredInventory = inventory.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    const matchesLowStock = !showLowStock || item.quantity <= item.minStockLevel;
    return matchesSearch && matchesCategory && matchesLowStock;
  });

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement add item functionality
    setIsAddDialogOpen(false);
  };

  const handleDelete = (itemId: string) => {
    // Add your delete logic here
    console.log("Deleting item:", itemId);
    setItemToDelete(null);
  };

  return (
    <div className="relative min-h-screen bg-[#FAFAFA]">
      <BackgroundElements />
      <div className="relative">
        <div className="flex items-center gap-2 px-6 py-8">
          <Button
            variant="ghost"
            className="gap-2 text-gray-600 hover:text-gray-900"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-5 w-5" />
            Back
          </Button>
        </div>
        <div className="container mx-auto px-6 py-8 relative z-10">
          {/* Header Section */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-12"
          >
            <div>
              <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-2">
                Inventory Management
              </h1>
              <p className="text-gray-600 text-lg">
                Track and manage medical supplies and equipment
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsAddDialogOpen(true)}
              className="flex items-center gap-3 bg-[#ABF600] text-black px-6 py-3 rounded-xl hover:bg-[#9DE100] transition-all duration-300 shadow-lg hover:shadow-xl font-medium"
            >
              <Package className="w-5 h-5" />
              <span>Add New Item</span>
            </motion.button>
          </motion.div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-xl mb-8 shadow-sm"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-12 gap-8 mb-8">
            {/* Stats Section */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="col-span-12 lg:col-span-3 space-y-6"
            >
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Inventory Overview</h2>
                <div className="space-y-4">
                  <div className={`${statCardStyle} bg-gradient-to-br from-[#ABF600]/10 to-[#ABF600]/5`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-[#ABF600]/20 rounded-lg">
                          <Package className="w-5 h-5 text-black" />
                        </div>
                        <span className="text-black font-medium">Total Items</span>
                      </div>
                      <span className="text-2xl font-bold text-black">
                        {inventory.length}
                      </span>
                    </div>
                  </div>
                  <div className={`${statCardStyle} bg-gradient-to-br from-[#FFE5E5] to-[#FFF5F5]`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                          <AlertTriangle className="w-5 h-5 text-red-500" />
                        </div>
                        <span className="text-black font-medium">Low Stock</span>
                      </div>
                      <span className="text-2xl font-bold text-black">
                        {inventory.filter(item => item.quantity <= item.minStockLevel).length}
                      </span>
                    </div>
                  </div>
                  <div className={`${statCardStyle} bg-gradient-to-br from-[#ABF600]/10 to-[#ABF600]/5`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-[#ABF600]/20 rounded-lg">
                          <ShoppingCart className="w-5 h-5 text-black" />
                        </div>
                        <span className="text-black font-medium">Categories</span>
                      </div>
                      <span className="text-2xl font-bold text-black">
                        {categories.length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Main Content */}
            <div className="col-span-12 lg:col-span-9 space-y-6">
              {/* Filters Section */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex flex-wrap gap-4"
              >
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Search inventory..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-white border-gray-200 focus:border-[#ABF600] transition-colors text-black placeholder-gray-400"
                    />
                  </div>
                </div>
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger className="w-[180px] border-gray-200 text-black">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category.toLowerCase()}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant={showLowStock ? "destructive" : "outline"}
                  onClick={() => setShowLowStock(!showLowStock)}
                  className={`flex items-center gap-2 ${buttonHoverStyle}`}
                >
                  <AlertTriangle className="w-4 h-4" />
                  {showLowStock ? "Showing Low Stock" : "Show Low Stock"}
                </Button>
              </motion.div>

              {/* Inventory Table */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
              >
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 hover:bg-gray-100">
                      <TableHead className="font-bold text-black">Name</TableHead>
                      <TableHead className="font-bold text-black">Category</TableHead>
                      <TableHead className="font-bold text-black">Quantity</TableHead>
                      <TableHead className="font-bold text-black">Unit</TableHead>
                      <TableHead className="font-bold text-black">Expiry Date</TableHead>
                      <TableHead className="font-bold text-black">Status</TableHead>
                      <TableHead className="text-right font-bold text-black">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence>
                      {filteredInventory.map((item, index) => (
                        <motion.tr
                          key={item.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.2, delay: index * 0.05 }}
                          className="hover:bg-gray-50"
                        >
                          <TableCell className="font-medium text-black">{item.name}</TableCell>
                          <TableCell className="text-black">{item.category}</TableCell>
                          <TableCell className="text-black">{item.quantity}</TableCell>
                          <TableCell className="text-black">{item.unit}</TableCell>
                          <TableCell className="text-black">{item.expiryDate || "N/A"}</TableCell>
                          <TableCell>
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-medium ${
                                item.quantity <= item.minStockLevel
                                  ? "bg-red-100 text-red-800"
                                  : "bg-[#ABF600]/20 text-green-800"
                              }`}
                            >
                              {item.quantity <= item.minStockLevel ? "Low Stock" : "In Stock"}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                className={`hover:bg-[#ABF600]/10 text-black border-gray-200 ${buttonHoverStyle}`}
                              >
                                Edit
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button 
                                    variant="destructive" 
                                    size="sm"
                                    className={`group bg-red-100 hover:bg-red-600 text-red-600 hover:text-white border border-red-200 
                                      font-medium shadow-sm hover:shadow-md transition-all duration-200 
                                      hover:scale-105 active:scale-95 ${buttonHoverStyle}`}
                                  >
                                    <Trash2 className="w-4 h-4 mr-1 group-hover:animate-bounce" />
                                    Delete
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="bg-white">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="text-red-600">Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action cannot be undone. This will permanently delete the inventory item
                                      and remove it from our servers.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel className="hover:bg-gray-100">Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      className="bg-red-600 hover:bg-red-700 text-white"
                                      onClick={() => handleDelete(item.id)}
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </motion.div>
            </div>
          </div>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-[425px] bg-white">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-black">Add New Inventory Item</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddItem} className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right text-black font-medium">Name</Label>
                <Input id="name" className="col-span-3 border-gray-200 text-black" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right text-black font-medium">Category</Label>
                <Select>
                  <SelectTrigger className="col-span-3 border-gray-200 text-black">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category.toLowerCase()}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="quantity" className="text-right text-black font-medium">Quantity</Label>
                <Input id="quantity" type="number" className="col-span-3 border-gray-200 text-black" required min="0" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="unit" className="text-right text-black font-medium">Unit</Label>
                <Input id="unit" className="col-span-3 border-gray-200 text-black" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="minStock" className="text-right text-black font-medium">Min Stock</Label>
                <Input id="minStock" type="number" className="col-span-3 border-gray-200 text-black" required min="0" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="expiry" className="text-right text-black font-medium">Expiry Date</Label>
                <Input id="expiry" type="date" className="col-span-3 border-gray-200 text-black" />
              </div>
              <div className="flex justify-end mt-4">
                <Button 
                  type="submit" 
                  className={`bg-[#ABF600] text-black hover:bg-[#9DE100] font-medium ${buttonHoverStyle}`}
                  disabled={isLoading}
                >
                  {isLoading ? "Adding..." : "Add Item"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
