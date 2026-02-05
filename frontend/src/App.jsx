import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Plus, Trash2, Edit2, ShoppingBag, Gift, Info } from 'lucide-react';

const API_URL = '/api';

const App = () => {
    const [recipes, setRecipes] = useState([]);
    const [onlineResults, setOnlineResults] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [currentRecipe, setCurrentRecipe] = useState({ name: '', price: '', image: '', category: '', complimentaryDrink: '' });
    const [groupSize, setGroupSize] = useState(1);
    const [activeTab, setActiveTab] = useState('menu'); // 'menu' or 'online'

    useEffect(() => {
        fetchRecipes();
    }, []);

    const fetchRecipes = async () => {
        try {
            const res = await axios.get(`${API_URL}/menu`);
            setRecipes(res.data);
        } catch (err) {
            console.error("Error fetching recipes", err);
        }
    };

    const isMonday = () => new Date().getDay() === 1;
    const isWeekend = () => [0, 6].includes(new Date().getDay());

    const calculateDiscountedPrice = (price) => {
        if (isMonday()) return Math.round(price * 0.85);
        return price;
    };

    const searchOnline = async () => {
        if (!searchQuery) return;
        try {
            const res = await axios.get(`${API_URL}/search?s=${searchQuery}`);
            setOnlineResults(res.data.meals || []);
            setActiveTab('online');
            setSearchQuery(''); // Clear search after successful result
        } catch (err) {
            console.error("Error searching online", err);
        }
    };

    const handleImport = async (meal) => {
        const newRecipe = {
            name: meal.strMeal,
            image: meal.strMealThumb,
            price: Math.floor(Math.random() * (800 - 300 + 1)) + 300, // Random premium price
            category: meal.strCategory || 'International',
            complimentaryDrink: 'Premium Soda' // Default
        };
        try {
            await axios.post(`${API_URL}/menu`, newRecipe);
            fetchRecipes();
            // Removed setActiveTab('menu') to allow multi-add
        } catch (err) {
            console.error("Error importing recipe", err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await axios.put(`${API_URL}/menu/${currentRecipe.id}`, currentRecipe);
            } else {
                await axios.post(`${API_URL}/menu`, currentRecipe);
            }
            setIsEditing(false);
            setCurrentRecipe({ name: '', price: '', image: '', category: '', complimentaryDrink: '' });
            fetchRecipes();
        } catch (err) {
            console.error("Error saving recipe", err);
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`${API_URL}/menu/${id}`);
            fetchRecipes();
        } catch (err) {
            console.error("Error deleting recipe", err);
        }
    };

    const getTotalBill = () => {
        return recipes.reduce((sum, r) => sum + calculateDiscountedPrice(r.price), 0);
    };

    return (
        <div className="min-h-screen p-4 md:p-8 font-poppins">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-center mb-12 glass p-6 rounded-3xl">
                <h1 className="text-4xl md:text-5xl font-playfair font-bold text-gold mb-4 md:mb-0">RESTRO</h1>

                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <input
                            type="text"
                            placeholder="Search dishes..."
                            className="bg-white bg-opacity-10 border border-white border-opacity-20 rounded-full px-6 py-2 focus:outline-none focus:ring-2 focus:ring-gold w-64 md:w-80"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && searchOnline()}
                        />
                        <Search className="absolute right-4 top-2.5 text-white opacity-50 cursor-pointer" onClick={searchOnline} size={18} />
                    </div>
                    <button onClick={() => { setIsEditing(false); setCurrentRecipe({ name: '', price: '', image: '', category: '', complimentaryDrink: '' }); setActiveTab('form'); }} className="btn-premium flex items-center gap-2">
                        <Plus size={18} /> Add
                    </button>
                </div>
            </header>

            {/* Offers Banner */}
            <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`glass p-4 rounded-2xl flex items-center gap-4 ${isMonday() ? 'border-gold' : ''}`}>
                    <div className="bg-gold p-3 rounded-xl text-black">
                        <ShoppingBag size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold">Monday Special</h3>
                        <p className="text-sm opacity-70">15% Off all dishes today!</p>
                    </div>
                </div>

                <div className="glass p-4 rounded-2xl flex items-center gap-4">
                    <div className="bg-wine p-3 rounded-xl">
                        <Info size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold">Group Offer</h3>
                        <p className="text-sm opacity-70 text-wine font-bold">Complimentary Drink for Groups of 4+</p>
                        <input
                            type="number"
                            min="1"
                            value={groupSize}
                            onChange={(e) => setGroupSize(parseInt(e.target.value))}
                            className="bg-black bg-opacity-20 rounded px-2 w-16 mt-1"
                        />
                    </div>
                </div>

                <div className={`glass p-4 rounded-2xl flex items-center gap-4 ${isWeekend() ? 'border-wine' : ''}`}>
                    <div className="bg-white bg-opacity-20 p-3 rounded-xl">
                        <Gift size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold">Weekend Treat</h3>
                        <p className="text-sm opacity-70">Free Sweet on bills over ₹1000!</p>
                    </div>
                </div>
            </div>

            {/* Main Content Tabs */}
            <div className="flex gap-4 mb-8">
                <button
                    onClick={() => setActiveTab('menu')}
                    className={`px-6 py-2 rounded-full transition ${activeTab === 'menu' ? 'bg-gold text-black' : 'glass'}`}
                >
                    My Menu
                </button>
                <button
                    onClick={() => setActiveTab('online')}
                    className={`px-6 py-2 rounded-full transition ${activeTab === 'online' ? 'bg-gold text-black' : 'glass'}`}
                >
                    Search Results ({onlineResults.length})
                </button>
            </div>

            {activeTab === 'menu' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {recipes.map(recipe => (
                        <div key={recipe.id} className="glass-dark rounded-3xl overflow-hidden group hover:scale-[1.02] transition duration-300">
                            <div className="relative h-48">
                                <img src={recipe.image} alt={recipe.name} className="w-full h-full object-cover" />
                                <div className="absolute top-4 right-4 flex gap-2">
                                    <button onClick={() => { setCurrentRecipe(recipe); setIsEditing(true); setActiveTab('form'); }} className="p-2 glass rounded-full hover:bg-gold hover:text-black transition">
                                        <Edit2 size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(recipe.id)} className="p-2 glass rounded-full hover:bg-red-500 transition">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                {isMonday() && (
                                    <div className="absolute top-4 left-4 bg-gold text-black px-3 py-1 rounded-full text-xs font-bold">
                                        15% OFF
                                    </div>
                                )}
                            </div>
                            <div className="p-6">
                                <span className="text-xs text-gold uppercase tracking-widest font-bold">{recipe.category}</span>
                                <h3 className="text-xl font-playfair mb-2 mt-1">{recipe.name}</h3>
                                <div className="flex justify-between items-center mt-4">
                                    <div>
                                        <span className="text-2xl font-bold">₹{calculateDiscountedPrice(recipe.price)}</span>
                                        {isMonday() && <span className="text-sm line-through opacity-50 ml-2">₹{recipe.price}</span>}
                                    </div>
                                </div>
                                {groupSize >= 4 && (
                                    <div className="mt-4 p-2 bg-white bg-opacity-5 rounded-xl flex items-center gap-2 border border-white border-opacity-10">
                                        <Gift size={14} className="text-gold" />
                                        <span className="text-xs font-medium">Free {recipe.complimentaryDrink}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {recipes.length === 0 && <p className="col-span-full text-center py-20 opacity-50">Empty Menu. Try searching online or adding a dish!</p>}
                </div>
            )}

            {activeTab === 'online' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {onlineResults.map(meal => (
                        <div key={meal.idMeal} className="glass-dark rounded-3xl overflow-hidden group">
                            <div className="relative h-48">
                                <img src={meal.strMealThumb} alt={meal.strMeal} className="w-full h-full object-cover" />
                                <button
                                    onClick={() => handleImport(meal)}
                                    className="absolute bottom-4 right-4 bg-gold text-black p-3 rounded-2xl hover:scale-110 transition shadow-xl"
                                >
                                    <Plus size={20} />
                                </button>
                            </div>
                            <div className="p-6">
                                <span className="text-xs text-gold uppercase tracking-widest font-bold">{meal.strCategory}</span>
                                <h3 className="text-xl font-playfair mb-2 mt-1 truncate">{meal.strMeal}</h3>
                                <p className="text-sm opacity-50">Estimated: ₹{Math.floor(Math.random() * 500) + 300}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'form' && (
                <div className="max-w-2xl mx-auto glass p-8 rounded-3xl mt-12">
                    <h2 className="text-3xl font-playfair mb-6">{isEditing ? 'Edit Dish' : 'Add New Dish'}</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm opacity-70 mb-1">Dish Name</label>
                            <input
                                required
                                className="w-full glass bg-white bg-opacity-5 rounded-xl px-4 py-2"
                                value={currentRecipe.name}
                                onChange={(e) => setCurrentRecipe({ ...currentRecipe, name: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm opacity-70 mb-1">Price (₹)</label>
                                <input
                                    type="number"
                                    required
                                    className="w-full glass bg-white bg-opacity-5 rounded-xl px-4 py-2"
                                    value={currentRecipe.price}
                                    onChange={(e) => setCurrentRecipe({ ...currentRecipe, price: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm opacity-70 mb-1">Category</label>
                                <input
                                    required
                                    className="w-full glass bg-white bg-opacity-5 rounded-xl px-4 py-2"
                                    value={currentRecipe.category}
                                    onChange={(e) => setCurrentRecipe({ ...currentRecipe, category: e.target.value })}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm opacity-70 mb-1">Image URL</label>
                            <input
                                required
                                className="w-full glass bg-white bg-opacity-5 rounded-xl px-4 py-2"
                                value={currentRecipe.image}
                                onChange={(e) => setCurrentRecipe({ ...currentRecipe, image: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm opacity-70 mb-1">Complimentary Drink</label>
                            <input
                                required
                                className="w-full glass bg-white bg-opacity-5 rounded-xl px-4 py-2"
                                value={currentRecipe.complimentaryDrink}
                                onChange={(e) => setCurrentRecipe({ ...currentRecipe, complimentaryDrink: e.target.value })}
                            />
                        </div>
                        <div className="flex gap-4 pt-4">
                            <button type="submit" className="btn-premium flex-1">Save Dish</button>
                            <button type="button" onClick={() => setActiveTab('menu')} className="flex-1 glass font-semibold rounded-full">Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Bill Footer */}
            {isWeekend() && getTotalBill() >= 1000 && activeTab === 'menu' && (
                <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 glass border-gold p-4 px-8 rounded-full flex items-center gap-4 animate-bounce">
                    <Gift className="text-gold" />
                    <span className="font-bold">Weekend Special: You earned a FREE SWEET! 🍰</span>
                </div>
            )}
        </div>
    );
};

export default App;
