import bcrypt from 'bcrypt';

const contraseñas = [
    'contraseña123',
    'contraseña456',
    'contraseña789',
    'contraseña1011',
    'contraseña1213'
];

for (const contraseña of contraseñas) {
    const hash = await bcrypt.hash(contraseña, 10);
    console.log(`${contraseña}  →  ${hash}`);
}
