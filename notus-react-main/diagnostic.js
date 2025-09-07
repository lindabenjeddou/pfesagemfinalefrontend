// Script de diagnostic pour les notifications magasinier
const API_BASE = 'http://localhost:8089/PI';

async function makeRequest(url, options = {}) {
    try {
        const response = await fetch(url, {
            headers: { 'Content-Type': 'application/json' },
            ...options
        });
        
        const text = await response.text();
        let data;
        try {
            data = JSON.parse(text);
        } catch {
            data = text;
        }
        
        return { success: response.ok, status: response.status, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function runDiagnostic() {
    console.log('🔍 === DIAGNOSTIC DES NOTIFICATIONS MAGASINIER ===');
    
    // 1. Vérifier les utilisateurs
    console.log('\n1. Vérification des utilisateurs...');
    const usersResult = await makeRequest(`${API_BASE}/user/all`);
    
    if (usersResult.success && Array.isArray(usersResult.data)) {
        const magasiniers = usersResult.data.filter(user => 
            user.role === 'MAGASINIER' || user.role === 'Magasinier'
        );
        
        console.log(`✅ Total utilisateurs: ${usersResult.data.length}`);
        console.log(`📦 Magasiniers trouvés: ${magasiniers.length}`);
        
        if (magasiniers.length > 0) {
            console.log('📋 Liste des magasiniers:');
            magasiniers.forEach(mag => {
                console.log(`  - ${mag.firstName} ${mag.lastName} (ID: ${mag.id}, Email: ${mag.email})`);
            });
        } else {
            console.log('❌ PROBLÈME: Aucun utilisateur avec le rôle MAGASINIER trouvé!');
            console.log('📋 Rôles disponibles:', [...new Set(usersResult.data.map(u => u.role))]);
        }
    } else {
        console.log('❌ Erreur lors de la récupération des utilisateurs:', usersResult);
    }
    
    // 2. Vérifier les projets
    console.log('\n2. Vérification des projets...');
    const projectsResult = await makeRequest(`${API_BASE}/projects/all`);
    console.log('🔍 URL utilisée:', `${API_BASE}/projects/all`);
    
    if (projectsResult.success && Array.isArray(projectsResult.data)) {
        console.log(`✅ Projets disponibles: ${projectsResult.data.length}`);
        if (projectsResult.data.length > 0) {
            console.log('📋 Premier projet disponible:');
            const firstProject = projectsResult.data[0];
            console.log(`  - ${firstProject.projectName} (ID: ${firstProject.id})`);
            
            // 3. Tester la création d'un sous-projet
            console.log('\n3. Test de création de sous-projet...');
            const testData = {
                sousProjetName: "Test Notification " + new Date().toLocaleTimeString(),
                description: "Sous-projet de test pour vérifier les notifications",
                totalPrice: 1000,
                components: [], // Pas de composants pour simplifier
                users: [1] // ID utilisateur de test
            };
            
            const sousProjetResult = await makeRequest(`${API_BASE}/sousprojets/create/${firstProject.id}`, {
                method: 'POST',
                body: JSON.stringify(testData)
            });
            
            if (sousProjetResult.success) {
                console.log('✅ Sous-projet créé avec succès:', sousProjetResult.data);
                
                // 4. Vérifier les notifications créées
                if (magasiniers.length > 0) {
                    console.log('\n4. Vérification des notifications...');
                    for (const magasinier of magasiniers) {
                        const notifResult = await makeRequest(`${API_BASE}/PI/PI/notifications/user/${magasinier.id}`);
                        console.log(`📬 Notifications pour ${magasinier.firstName}:`, notifResult);
                    }
                }
            } else {
                console.log('❌ Erreur lors de la création du sous-projet:', sousProjetResult);
            }
        }
    } else {
        console.log('❌ Erreur lors de la récupération des projets:', projectsResult);
    }
    
    console.log('\n🔍 === FIN DU DIAGNOSTIC ===');
}

// Exécuter le diagnostic
runDiagnostic().catch(console.error);
