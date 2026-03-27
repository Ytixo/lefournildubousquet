// ----------------------
// Initialisation des clients
// ----------------------
function getClients() {
    return JSON.parse(localStorage.getItem('clients')) || [];
}

function saveClients(clients) {
    localStorage.setItem('clients', JSON.stringify(clients));
}

// Remplir le select du formulaire de facture
function updateClientSelect() {
    const selectFacture = document.getElementById('client');
    const selectAchat = document.getElementById('client-select'); // On cible le deuxième select
    
    // On vide les deux listes
    if (selectFacture) selectFacture.innerHTML = "";
    if (selectAchat) selectAchat.innerHTML = "";

    // On parcourt les clients pour remplir les deux menus
    getClients().forEach(c => {
        // Option pour la section Facture
        if (selectFacture) {
            const option1 = document.createElement('option');
            option1.value = c.name;
            option1.textContent = c.name;
            selectFacture.appendChild(option1);
        }

        // Option pour la section Ajouter un achat
        if (selectAchat) {
            const option2 = document.createElement('option');
            option2.value = c.name;
            option2.textContent = c.name;
            selectAchat.appendChild(option2);
        }
    });
}

// Initialiser les clients existants
updateClientSelect();

// ----------------------
// Ajouter un client
// ----------------------
document.getElementById('add-client-btn')?.addEventListener('click', () => {
    const name = document.getElementById('new-client-name').value.trim();
    if(!name) return alert("Veuillez entrer un nom");

    const clients = getClients();
    if(clients.find(c => c.name === name)) return alert("Client déjà existant");

    clients.push({name, purchases: []});
    saveClients(clients);
    updateClientSelect();
    alert("Client ajouté !");
});

// ----------------------
// Ajouter produit dynamique
// ----------------------
document.getElementById('add-invoice-item')?.addEventListener('click', () => {
    const container = document.getElementById('invoice-items-container');
    const div = document.createElement('div');
    div.classList.add('item');
    div.innerHTML = `
        <input type="text" placeholder="Produit" class="product-name">
        <input type="number" placeholder="Quantité" class="product-qty" min="1" value="1">
        <input type="number" placeholder="Prix (€)" class="product-price" step="0.01" value="0">
        <button type="button" class="remove-item">Supprimer</button>
    `;
    container.appendChild(div);

    // Permettre la suppression de cette nouvelle ligne
    div.querySelector('.remove-item').addEventListener('click', () => div.remove());
});

// Listener unique
document.getElementById('add-item')?.addEventListener('click', () => addProductRow('items-container'));

// ----------------------
// 2. Générer PDF immédiat (avec fusion VISUELLE et LOCALE)
// ----------------------
document.getElementById('invoice-form')?.addEventListener('submit', (e) => {
    e.preventDefault();

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const today = new Date();
    const year = today.getFullYear();
    const mois = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
    const moisString = mois[today.getMonth()];
    const clientName = document.getElementById('client').value;
    const todayStr = today.toLocaleDateString();

    // --- ÉTAPE 1 : RÉCUPÉRER ET FUSIONNER LES LIGNES DE L'ÉCRAN ---
    const itemsElements = document.querySelectorAll('#invoice-items-container .item');
    const itemsToProcess = [];
    
    itemsElements.forEach(itemEl => {
        const name = itemEl.querySelector('.product-name').value.trim();
        const qty = Number(itemEl.querySelector('.product-qty').value) || 0;
        const price = Number(itemEl.querySelector('.product-price').value) || 0;

        if (name && qty > 0) {
            // On vérifie si l'utilisateur a tapé 2 fois le même produit à l'écran
            const existing = itemsToProcess.find(i => i.name.toLowerCase() === name.toLowerCase());
            if (existing) {
                existing.qty += qty; // On additionne les quantités pour le PDF
                existing.price = price;
            } else {
                itemsToProcess.push({ name, qty, price });
            }
        }
    });

    if (itemsToProcess.length === 0) return alert("Veuillez ajouter au moins un produit pour générer la facture.");

    // --- ÉTAPE 2 : CRÉATION DU PDF (avec les produits combinés) ---
    let y = 30;
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("Le Fournil du Bousquet", 105, y, { align: "center" });

    y += 10;
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.text(`Facture ${moisString} ${year}`, 105, y, { align: "center" });

    y += 15;
    doc.line(10, y, 200, y);
    y += 10;

    doc.setFont("helvetica", "bold");
    doc.text("Client :", 10, y);
    doc.setFont("helvetica", "normal");
    doc.text(clientName, 30, y);

    y += 10;
    doc.setFont("helvetica", "bold");
    doc.text("Produit", 10, y);
    doc.text("Quantité", 110, y);
    doc.text("Prix (€)", 150, y);
    doc.text("Total (€)", 180, y);

    y += 5;
    doc.setFont("helvetica", "normal");
    let total = 0;

    // On utilise notre liste fusionnée pour dessiner les lignes du PDF
    itemsToProcess.forEach(item => {
        const lineTotal = item.qty * item.price;
        doc.text(item.name, 10, y);
        doc.text(item.qty.toString(), 110, y);
        doc.text(item.price.toFixed(2), 150, y);
        doc.text(lineTotal.toFixed(2), 180, y);
        total += lineTotal;
        y += 10;
    });

    y += 5;
    doc.line(10, y, 200, y);

    y += 10;
    doc.setFont("helvetica", "bold");
    doc.text("Total à payer:", 150, y);
    doc.text(`${total.toFixed(2)}€`, 180, y);

    // --- ÉTAPE 3 : SAUVEGARDER DANS LE LOCALSTORAGE ---
    const clients = getClients();
    const clientObj = clients.find(c => c.name === clientName);

    if (clientObj) {
        let todayPurchase = clientObj.purchases.find(p => p.date === todayStr);

        if (!todayPurchase) {
            todayPurchase = { date: todayStr, items: [] };
            clientObj.purchases.push(todayPurchase);
        }

        // On fusionne notre liste de l'écran avec ce qui est DÉJÀ en mémoire pour aujourd'hui
        itemsToProcess.forEach(newItem => {
            const existingItem = todayPurchase.items.find(
                item => item.name.toLowerCase() === newItem.name.toLowerCase()
            );

            if (existingItem) {
                existingItem.qty += newItem.qty;
                existingItem.price = newItem.price;
            } else {
                todayPurchase.items.push({ ...newItem });
            }
        });

        saveClients(clients);
    }

    // --- ÉTAPE 4 : TÉLÉCHARGER ET ACTUALISER ---
    doc.save(`Facture_${clientName}_${today.getDate()}-${today.getMonth()+1}-${year}.pdf`);
    alert(`Facture générée et enregistrée avec succès !`);
    window.location.reload();
});

// ----------------------
// Enregistrer un achat (avec fusion des doublons et réinitialisation)
// ----------------------
document.getElementById('save-purchase')?.addEventListener('click', () => {
    const clientName = document.getElementById('client-select').value;
    if (!clientName) return alert("Veuillez sélectionner un client.");

    // On récupère toutes les lignes de la section "Ajouter un achat"
    const itemsElements = document.querySelectorAll('#invoice-items-container .item');
    const newItems = [];

    // 1. Extraire les données du formulaire
    itemsElements.forEach(itemEl => {
        const name = itemEl.querySelector('.product-name').value.trim();
        const qty = Number(itemEl.querySelector('.product-qty').value) || 0;
        const price = Number(itemEl.querySelector('.product-price').value) || 0;

        if (name && qty > 0) {
            newItems.push({ name, qty, price });
        }
    });

    if (newItems.length === 0) return alert("Veuillez ajouter au moins un produit valide.");

    const clients = getClients();
    const clientObj = clients.find(c => c.name === clientName);

    if (!clientObj) return alert("Client introuvable.");

    const todayStr = new Date().toLocaleDateString();

    // 2. Chercher s'il y a déjà un panier pour aujourd'hui
    let todayPurchase = clientObj.purchases.find(p => p.date === todayStr);

    if (!todayPurchase) {
        // S'il n'y a pas d'achat aujourd'hui, on le crée
        todayPurchase = { date: todayStr, items: [] };
        clientObj.purchases.push(todayPurchase);
    }

    // 3. Fusionner les articles (gestion des doublons très stricte)
    newItems.forEach(newItem => {
        // On compare en enlevant les espaces et en minuscules pour éviter les erreurs de frappe
        const existingItem = todayPurchase.items.find(
            item => item.name.trim().toLowerCase() === newItem.name.toLowerCase()
        );

        if (existingItem) {
            // Le produit existe déjà, on ADDITIONNE les quantités
            existingItem.qty = Number(existingItem.qty) + Number(newItem.qty);
            existingItem.price = Number(newItem.price); // On actualise le prix au cas où
        } else {
            // Le produit n'existe pas, on l'ajoute
            todayPurchase.items.push({ ...newItem });
        }
    });

    // 4. Sauvegarder dans le localStorage
    saveClients(clients);

    // 5. Afficher l'alerte
    alert(`Achat enregistré avec succès pour ${clientName} !`);

    // 6. Actualiser la page complètement
    window.location.reload();
});