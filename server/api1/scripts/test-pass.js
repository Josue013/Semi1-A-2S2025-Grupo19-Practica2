const { hashPassword } = require('../utils/hashPassword');

async function generateHashes() {
  const passwords = {
    'yamilette_gonzalez': 'demo123',
    'carlos_lieja': 'carlos456', 
    'karen_melgarejo': 'karen789',
    'bismarck_romero': 'bismarck123'
  };

  console.log('🔐 CONTRASEÑAS Y HASHES VÁLIDOS:\n');
  
  for (const [usuario, password] of Object.entries(passwords)) {
    const hash = await hashPassword(password);
    console.log(`👤 ${usuario}`);
    console.log(`🔑 Contraseña: "${password}"`);
    console.log(`🔒 Hash: ${hash}`);
    console.log(`📝 SQL: UPDATE usuarios SET password_hash = '${hash}' WHERE nombre_usuario = '${usuario}';`);
    console.log('-'.repeat(80));
  }
}

generateHashes().catch(console.error);