document.addEventListener('DOMContentLoaded', function() {
    const navItems = document.querySelectorAll('.nav-item');
    const contentDiv = document.querySelector('.content');

    let inventory = [
        { id: 1, name: 'Milk', quantity: 1, expirationDate: '2023-10-31' },
        { id: 2, name: 'Eggs', quantity: 12, expirationDate: '2023-11-05' },
        { id: 3, name: 'Cheddar Cheese', quantity: 1, expirationDate: '2023-11-01' }
    ];

    let shoppingList = JSON.parse(localStorage.getItem('shoppingList')) || [];

    let item_id = 0

    function loadPage(page) {
        let content = '';

        switch(page) {
            case 'home':
                content = `
                    <h1>Welcome to Kitchen Companion</h1>
                    <p>Your all-in-one solution for kitchen organization.</p>
                `;
                contentDiv.innerHTML = content;
                break;
            case 'inventory':
                loadInventoryPage();
                break;
            case 'recipes':
                // content = `
                //     <h1>Recipes</h1>
                //     <p>Browse recipes based on your inventory.</p>
                // `;
                // contentDiv.innerHTML = content;
                // break;
                loadRecipesPage();
                break;
            case 'shopping-list':
                // content = `
                //     <h1>Shopping List</h1>
                //     <p>Create and edit your shopping list.</p>
                // `;
                // contentDiv.innerHTML = content;
                loadShoppingListPage();
                break;
            case 'profile':
                // content = `
                //     <h1>Profile</h1>
                //     <p>Manage your preferences and settings.</p>
                // `;
                // contentDiv.innerHTML = content;
                loadProfilePage();
                break;
        }
    }

    navItems.forEach(item => {
        item.addEventListener('click', function() {
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');

            const page = this.getAttribute('data-page');
            loadPage(page);
        });
    });

    loadPage('inventory');

    function loadInventoryPage() {
        let content = `
            <h1>Inventory</h1>
            <ul class="inventory-list">
                ${inventory.map(item => `
                    <li class="inventory-item" data-id="${item.id}">
                        <div class="item-details">
                            <span class="item-name">${item.name}</span>
                            <div class="quantity-controls">
                                <button class="decrease-btn">−</button>
                                <span class="quantity-display">${item.quantity}</span>
                                <button class="increase-btn">+</button>
                            </div>
                        </div>
                        <div class="item-expiration ${isExpiringSoon(item.expirationDate) ? 'alert' : ''}">
                            Exp: ${formatDate(item.expirationDate)}
                        </div>
                        <div class="item-actions">
                            <button class="buttons2 edit-btn">Edit</button>
                            <button class="buttons2 delete-btn">Delete</button>
                            ${item.quantity < 3 ? `<button class="buttons2 add-to-shopping-list-btn">Add to Shopping List</button>` : ''}

                        </div>
                    </li>
                `).join('')}
            </ul>
            <button class="buttons" id="add-item-btn">Add New Item</button>
        `;
        contentDiv.innerHTML = content;

        document.querySelectorAll('.increase-btn').forEach(btn => {
            btn.addEventListener('click', increaseQuantity);
        });
        document.querySelectorAll('.decrease-btn').forEach(btn => {
            btn.addEventListener('click', decreaseQuantity);
        });
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', editItem);
        });
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', deleteItem);
        });
        document.getElementById('add-item-btn').addEventListener('click', showAddItemForm);

        document.querySelectorAll('.add-to-shopping-list-btn').forEach(btn => {
            btn.addEventListener('click', addItemToShoppingList);
        });
    }

    function addItemToShoppingList(event) {
        const itemId = parseInt(event.target.closest('.inventory-item').dataset.id);
        const item = inventory.find(item => item.id === itemId);

        const quantityToAdd = parseInt(prompt(`Enter quantity to add to the shopping list for ${item.name}:`, 1));

        if (isNaN(quantityToAdd) || quantityToAdd <= 0) {
            alert("Please enter a valid quantity.");
            return;
        }

        const existingShoppingItem = shoppingList.find(shoppingItem => shoppingItem.name === item.name);

        if (existingShoppingItem) {
            existingShoppingItem.quantity += quantityToAdd;
        } else {
            shoppingList.push({
                id: Date.now(),
                name: item.name,
                quantity: quantityToAdd,
                checked: false
            });
        }

        localStorage.setItem('shoppingList', JSON.stringify(shoppingList));
        alert(`${quantityToAdd} ${item.name}(s) have been added to your shopping list.`);
        loadInventoryPage();
    }

    function isExpiringSoon(expirationDate) {
        const today = new Date();
        const expDate = new Date(expirationDate);
        const timeDiff = expDate - today;
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
        return daysDiff <= 3;
    }

    function formatDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString();
    }

    function showAddItemForm() {
        contentDiv.innerHTML = `
            <h1>Add New Item</h1>
            <form id="add-item-form">
                <label for="item-name">Item Name:</label>
                <input type="text" id="item-name" name="item-name" required>

                <label for="item-quantity">Quantity (Servings):</label>
                <input type="number" id="item-quantity" name="item-quantity" min="1" required>

                <label for="item-expiration">Expiration Date:</label>
                <input type="date" id="item-expiration" name="item-expiration" required>

                <button type="submit">Add Item</button>
            </form>
        `;
        document.getElementById('add-item-form').addEventListener('submit', addItem);
    }

    function addItem(event) {
        event.preventDefault();
        const name = document.getElementById('item-name').value.trim();
        const quantity = parseInt(document.getElementById('item-quantity').value);
        const expirationDate = document.getElementById('item-expiration').value;

        if (name && quantity > 0 && expirationDate) {
            const newItem = {
                id: Date.now(),
                name,
                quantity,
                expirationDate
            };
            inventory.push(newItem);
            loadInventoryPage();
        } else {
            alert('Please fill out all fields correctly.');
        }
    }

    function deleteItem(event) {
        const itemId = parseInt(event.target.closest('.inventory-item').dataset.id);
        inventory = inventory.filter(item => item.id !== itemId);
        loadInventoryPage();
    }

    function editItem(event) {
        const itemId = parseInt(event.target.closest('.inventory-item').dataset.id);
        const item = inventory.find(item => item.id === itemId);

        contentDiv.innerHTML = `
            <h1>Edit Item</h1>
            <form id="edit-item-form">
                <label for="edit-item-name">Item Name:</label>
                <input type="text" id="edit-item-name" name="edit-item-name" value="${item.name}" required>

                <label for="edit-item-quantity">Quantity:</label>
                <input type="number" id="edit-item-quantity" name="edit-item-quantity" min="1" value="${item.quantity}" required>

                <label for="edit-item-expiration">Expiration Date:</label>
                <input type="date" id="edit-item-expiration" name="edit-item-expiration" value="${item.expirationDate}" required>

                <button type="submit">Save Changes</button>
            </form>
        `;
        document.getElementById('edit-item-form').addEventListener('submit', function(e) {
            e.preventDefault();
            updateItem(itemId);
        });
    }

    function updateItem(itemId) {
        const name = document.getElementById('edit-item-name').value.trim();
        const quantity = parseInt(document.getElementById('edit-item-quantity').value);
        const expirationDate = document.getElementById('edit-item-expiration').value;

        if (name && quantity > 0 && expirationDate) {
            inventory = inventory.map(item => {
                if (item.id === itemId) {
                    return { ...item, name, quantity, expirationDate };
                }
                return item;
            });
            loadInventoryPage();
        } else {
            alert('Please fill out all fields correctly.');
        }
    }
    
    function increaseQuantity(event) {
        const itemId = parseInt(event.target.closest('.inventory-item').dataset.id);
        inventory = inventory.map(item => {
            if (item.id === itemId) {
                return { ...item, quantity: item.quantity + 1 };
            }
            return item;
        });
        loadInventoryPage();
    }

    function decreaseQuantity(event) {
        const itemId = parseInt(event.target.closest('.inventory-item').dataset.id);
        inventory = inventory.map(item => {
            if (item.id === itemId && item.quantity > 0) {
                return { ...item, quantity: item.quantity - 1 };
            }
            return item;
        });
        loadInventoryPage();
    }

    let recipes = [
        { id: 1, name: 'Chicken Omelette', ingredients: ['Eggs', 'Cheddar Cheese', 'Milk', 'Chicken'], description: 'A classic cheesy chicken omelette.', category: 'Non-Vegetarian', directions: '1. Beat eggs. <br>2. Add cheese. 3. Cook in a pan. 4. Cook the chicken 5. Add the chicken onto the omlette' },
        { id: 2, name: 'Pancakes', ingredients: ['Milk', 'Eggs', 'Flour'], description: 'Fluffy pancakes made from scratch.', category: 'Vegetarian', directions: '1. Mix ingredients. 2. Pour batter. 3. Flip when bubbles form.' },
        { id: 3, name: 'Grilled Cheese', ingredients: ['Cheddar Cheese', 'Bread', 'Butter'], description: 'Toasty grilled cheese sandwich.', category: 'Vegetarian', directions: '1. Butter bread. 2. Add cheese. 3. Grill until golden.' },
        { id: 4, name: 'Tacos', ingredients: ['Ground Beef', 'Taco Shells', 'Lettuce'], description: 'Classic Mexican tacos.', category: 'Mexican', directions: '1. Cook ground beef. 2. Add toppings in taco shells.' }
    ];



    function loadRecipesPage() {
        let content = `
            <h1>Recipes</h1>
            <input type="text" id="recipe-search" placeholder="Search recipes..." />

            <br>
            <br>

            <!-- Vegetarian Category -->
            <div class="recipe-category">
                <button class="category-toggle" data-category="vegetarian-recipes">Vegetarian Recipes ▼</button>
                <ul class="recipe-list" id="vegetarian-recipes" style="display: none;">
                    ${recipes.filter(recipe => recipe.category === 'Vegetarian').map(recipe => `
                        <li class="recipe-item" data-id="${recipe.id}">
                            <h3>${recipe.name}</h3>
                            <p>${recipe.description}</p>
                        </li>
                    `).join('')}
                </ul>
            </div>

            <!-- Non-Vegetarian Category -->
            <div class="recipe-category">
                <button class="category-toggle" data-category="non-veg-recipes">Non-Vegetarian Recipes ▼</button>
                <ul class="recipe-list" id="non-veg-recipes" style="display: none;">
                    ${recipes.filter(recipe => recipe.category === 'Non-Vegetarian').map(recipe => `
                        <li class="recipe-item" data-id="${recipe.id}">
                            <h3>${recipe.name}</h3>
                            <p>${recipe.description}</p>
                        </li>
                    `).join('')}
                </ul>
            </div>

            <!-- Mexican Category -->
            <div class="recipe-category">
                <button class="category-toggle" data-category="mexican-recipes">Mexican Recipes ▼</button>
                <ul class="recipe-list" id="mexican-recipes" style="display: none;">
                    ${recipes.filter(recipe => recipe.category === 'Mexican').map(recipe => `
                        <li class="recipe-item" data-id="${recipe.id}">
                            <h3>${recipe.name}</h3>
                            <p>${recipe.description}</p>
                        </li>
                    `).join('')}
                </ul>
            </div>

            <!-- Recipe Modal for Popup -->
            <div id="recipe-modal" class="modal" style="display:none;">
                <div class="modal-content">
                    <span id="close-modal" class="close">&times;</span>
                    <h2 id="modal-recipe-name"></h2>
                    <p id="modal-recipe-description"></p>
                    <p><strong>Ingredients:</strong></p>
                    <ul id="modal-recipe-ingredients"></ul>
                    <p><strong>Directions:</strong></p>
                    <p id="modal-recipe-directions"></p>
                    <button class='buttons' id="add-to-shopping-list-btn">Add Ingredients to Shopping List</button>
                    
                </div>
            </div>
            <br><br><br><br><br><br><br><br><br><br><br>

            <img id="bottom-image" src="keyboard.png" style="display: none; position: fixed; bottom: 50px; left: 0; right: 0; margin: auto; width: 100%; height: 30%;" />

        `;
        contentDiv.innerHTML = content;


        const searchInput = document.getElementById('recipe-search');
        const bottomImage = document.getElementById('bottom-image');

        searchInput.addEventListener('focus', function () {
            bottomImage.style.display = 'block';
        });

        searchInput.addEventListener('blur', function () {
            bottomImage.style.display = 'none';
        });

        
        document.getElementById('recipe-search').addEventListener('input', function () {
            const query = this.value.toLowerCase();
            filterRecipes(query);
        });

        document.querySelectorAll('.recipe-item').forEach(item => {
            item.addEventListener('click', function () {
                const recipeId = parseInt(this.getAttribute('data-id'));
                openRecipeModal(recipeId);
            });
        });

        document.getElementById('close-modal').addEventListener('click', closeRecipeModal);

        document.querySelectorAll('.category-toggle').forEach(button => {
            button.addEventListener('click', function () {
                const category = this.getAttribute('data-category');
                const categoryList = document.getElementById(category);
                const isVisible = categoryList.style.display === 'block';
                categoryList.style.display = isVisible ? 'none' : 'block';
                this.textContent = this.textContent.includes('▼') ? this.textContent.replace('▼', '▲') : this.textContent.replace('▲', '▼');
            });
        });
    }

    function openRecipeModal(recipeId) {
        const recipe = recipes.find(r => r.id === recipeId);

        document.getElementById('modal-recipe-name').textContent = recipe.name;
        document.getElementById('modal-recipe-description').textContent = recipe.description;
        document.getElementById('modal-recipe-ingredients').innerHTML = recipe.ingredients.map(ingredient => `<li>${ingredient}</li>`).join('');
        document.getElementById('modal-recipe-directions').textContent = recipe.directions;

        document.getElementById('recipe-modal').style.display = 'block';

        document.getElementById('add-to-shopping-list-btn').addEventListener('click', function () {
            addRecipeIngredientsToShoppingList(recipe.ingredients);
        });
    }

    function closeRecipeModal() {
        document.getElementById('recipe-modal').style.display = 'none';
    }

    function addRecipeIngredientsToShoppingList(ingredients) {
        ingredients.forEach(ingredient => {
            const existingShoppingItem = shoppingList.find(shoppingItem => shoppingItem.name === ingredient);

            if (existingShoppingItem) {
                existingShoppingItem.quantity += 1;  
            } else {
                id_item = item_id + 1
                item_id = item_id + 1
                shoppingList.push({
                    id: item_id,
                    name: ingredient,
                    quantity: 1,  
                    checked: false
                });
            }
        });

        localStorage.setItem('shoppingList', JSON.stringify(shoppingList));
        alert('Ingredients have been added to your shopping list.');
    }

    function loadProfilePage() {
        const savedPreferences = JSON.parse(localStorage.getItem('userPreferences')) || {};

        let content = `
            <div class="profile-container">
                <div class="profile-header">
                    <h1>Profile / User Preferences</h1>
                </div>

                <form class="profile-form" id="profile-form">
                    <!-- Skill Level -->
                    <label for="skill-level">Skill Level:</label>
                    <select id="skill-level" name="skill-level">
                        <option value="beginner" ${savedPreferences.skillLevel === 'beginner' ? 'selected' : ''}>Beginner</option>
                        <option value="intermediate" ${savedPreferences.skillLevel === 'intermediate' ? 'selected' : ''}>Intermediate</option>
                        <option value="advanced" ${savedPreferences.skillLevel === 'advanced' ? 'selected' : ''}>Advanced</option>
                    </select>

                    <!-- Dietary Preferences -->
                    <label for="dietary-preferences">Dietary Preferences:</label>
                    <select id="dietary-preferences" name="dietary-preferences">
                        <option value="none" ${savedPreferences.dietaryPreferences === 'none' ? 'selected' : ''}>None</option>
                        <option value="vegan" ${savedPreferences.dietaryPreferences === 'vegan' ? 'selected' : ''}>Vegan</option>
                        <option value="vegetarian" ${savedPreferences.dietaryPreferences === 'vegetarian' ? 'selected' : ''}>Vegetarian</option>
                    </select>

                    <!-- Allergies -->
                    <label>Allergies:</label>
                    <div class="checkbox-group">
                        <label><input type="checkbox" name="allergy-eggs" ${savedPreferences.allergies?.includes('eggs') ? 'checked' : ''}> Eggs</label>
                        <label><input type="checkbox" name="allergy-nuts" ${savedPreferences.allergies?.includes('nuts') ? 'checked' : ''}> Nuts</label>
                    </div>

                    <!-- Height -->
                    <label for="height-ft">Height:</label>
                    <div class="height-inputs">
                        <input type="number" id="height-ft" name="height-ft" min="0" max="10" placeholder="ft" value="${savedPreferences.heightFt || ''}">
                        <input type="number" id="height-in" name="height-in" min="0" max="11" placeholder="in" value="${savedPreferences.heightIn || ''}">
                    </div>

                    <!-- Weight -->
                    <label for="weight">Weight:</label>
                    <input type="number" id="weight" name="weight" placeholder="lbs" value="${savedPreferences.weight || ''}">

                    <!-- Goal Weight -->
                    <label for="goal-weight">Goal Weight:</label>
                    <input type="number" id="goal-weight" name="goal-weight" placeholder="lbs" value="${savedPreferences.goalWeight || ''}">

                    <!-- Save Button -->
                    <button type="submit">Save Preferences</button>

                </form>
            </div>
        `;
        contentDiv.innerHTML = content;

        document.getElementById('profile-form').addEventListener('submit', function(event) {
            event.preventDefault();

            const skillLevel = document.getElementById('skill-level').value;
            const dietaryPreferences = document.getElementById('dietary-preferences').value;
            const allergies = Array.from(document.querySelectorAll('input[name^="allergy"]:checked')).map(checkbox => checkbox.name.replace('allergy-', ''));
            const heightFt = document.getElementById('height-ft').value;
            const heightIn = document.getElementById('height-in').value;
            const weight = document.getElementById('weight').value;
            const goalWeight = document.getElementById('goal-weight').value;

            const userPreferences = {
                skillLevel,
                dietaryPreferences,
                allergies,
                heightFt,
                heightIn,
                weight,
                goalWeight
            };

            localStorage.setItem('userPreferences', JSON.stringify(userPreferences));
            alert('Preferences saved successfully!');
        });

    }

    function loadShoppingListPage() {
        let content = `
            <h1>Shopping List</h1>
            <ul class="shopping-list">
                ${shoppingList.map(item => `
                    <li class="shopping-item" data-id="${item.id}">
                        <input type="checkbox" class="shopping-checkbox" ${item.checked ? 'checked' : ''}>
                        <span class="item-name">${item.name}</span>
                        <span class="item-quantity">(${item.quantity})</span>
                    </li>
                `).join('')}
            </ul>
            <button class="buttons" id="add-shopping-item-btn">Add Item to Shopping List</button>
            <button class="buttons" id="delete-checked-btn">Delete Checked Items</button>
            <button class="buttons" id="save-shopping-list-btn">Save Current Shopping List</button>
            <button class="buttons" id="view-saved-shopping-lists-btn">View Saved Shopping Lists</button>



        `;
        contentDiv.innerHTML = content;

        document.querySelectorAll('.shopping-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', toggleShoppingItem);
        });


        document.getElementById('view-saved-shopping-lists-btn').addEventListener('click', displaySavedShoppingLists);

        
        document.getElementById('save-shopping-list-btn').addEventListener('click', saveCurrentShoppingList);


        document.getElementById('delete-checked-btn').addEventListener('click', deleteCheckedItems);

        document.getElementById('add-shopping-item-btn').addEventListener('click', showAddShoppingItemForm);
    }

    function displaySavedShoppingLists() {
        const savedLists = JSON.parse(localStorage.getItem('savedShoppingLists')) || [];

        if (savedLists.length === 0) {
            alert('No saved shopping lists found.');
            return;
        }

        let content = '<h1>Saved Shopping Lists</h1><ul>';

        savedLists.forEach(list => {
            content += `<li>${list.name} <button class="load-list-btn buttons" data-name="${list.name}">Add to Shopping List</button></li>`;
        });

        content += '</ul>';

        contentDiv.innerHTML = content;

        document.querySelectorAll('.load-list-btn').forEach(button => {
            button.addEventListener('click', function () {
                const listName = this.getAttribute('data-name');
                loadShoppingListByName(listName);
            });
        });
    }

    function loadShoppingListByName(listName) {
        const savedLists = JSON.parse(localStorage.getItem('savedShoppingLists')) || [];
        const selectedList = savedLists.find(list => list.name === listName);

        if (selectedList) {
            selectedList.items.forEach(savedItem => {
                const existingItem = shoppingList.find(item => item.name === savedItem.name);

                if (existingItem) {
                    existingItem.quantity += savedItem.quantity;
                } else {
                    shoppingList.push(savedItem);
                }
            });

            localStorage.setItem('shoppingList', JSON.stringify(shoppingList));
            alert('Shopping list loaded and merged successfully!');
            loadShoppingListPage();
        } else {
            alert('Shopping list not found.');
        }
    }


    function loadAndMergeShoppingList() {
        const savedLists = JSON.parse(localStorage.getItem('savedShoppingLists')) || [];

        if (savedLists.length === 0) {
            alert('No saved shopping lists found.');
            return;
        }

        const listName = prompt('Enter the name of the shopping list you want to load:');
        const selectedList = savedLists.find(list => list.name === listName);

        if (selectedList) {
            selectedList.items.forEach(savedItem => {
                const existingItem = shoppingList.find(item => item.name === savedItem.name);

                if (existingItem) {
                    existingItem.quantity += savedItem.quantity; 
                } else {
                    shoppingList.push(savedItem);  
                }
            });

            localStorage.setItem('shoppingList', JSON.stringify(shoppingList));
            alert('Shopping list loaded and merged successfully!');
            loadShoppingListPage();  
        } else {
            alert('Shopping list not found.');
        }
    }


    function saveCurrentShoppingList() {
        const savedLists = JSON.parse(localStorage.getItem('savedShoppingLists')) || [];
        const listName = prompt('Enter a name for this shopping list:');

        if (listName) {
            const newList = {
                name: listName,
                items: shoppingList,
            };

            savedLists.push(newList);
            localStorage.setItem('savedShoppingLists', JSON.stringify(savedLists));
            alert('Shopping list saved successfully!');
        } else {
            alert('Please enter a valid name.');
        }
    }


    function toggleShoppingItem(event) {
        const itemId = parseInt(event.target.closest('.shopping-item').dataset.id);
        shoppingList = shoppingList.map(item => {
            if (item.id === itemId) {
                return { ...item, checked: event.target.checked };
            }
            return item;
        });
        localStorage.setItem('shoppingList', JSON.stringify(shoppingList));
    }

    function deleteCheckedItems() {
        console.log(shoppingList)
        shoppingList = shoppingList.filter(item => !item.checked);
        localStorage.setItem('shoppingList', JSON.stringify(shoppingList));
        loadShoppingListPage();  
    }


    function showAddShoppingItemForm() {
        let content = `
            <h1>Add Item to Shopping List</h1>
            <form id="add-shopping-item-form">
                <label for="shopping-item-name">Item Name:</label>
                <input type="text" id="shopping-item-name" name="shopping-item-name" required>

                <label for="shopping-item-quantity">Quantity:</label>
                <input type="number" id="shopping-item-quantity" name="shopping-item-quantity" min="1" required>

                <button type="submit">Add to Shopping List</button>
            </form>
        `;
        contentDiv.innerHTML = content;
        document.getElementById('add-shopping-item-form').addEventListener('submit', addShoppingItem);
    }

    function addShoppingItem(event) {
        event.preventDefault();
        const name = document.getElementById('shopping-item-name').value.trim();
        const quantity = parseInt(document.getElementById('shopping-item-quantity').value);

        if (name && quantity > 0) {
            const shoppingItem = {
                id: Date.now(),
                name,
                quantity,
                checked: false
            };
            shoppingList.push(shoppingItem);
            localStorage.setItem('shoppingList', JSON.stringify(shoppingList));
            loadShoppingListPage();
        } else {
            alert('Please fill out all fields correctly.');
        }
    }


});
