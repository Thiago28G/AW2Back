import mongoose from 'mongoose';

const conectarDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB conectado: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error al conectar a MongoDB: ${error.message}`);
    process.exit(1);
  }
};

mongoose.connection.on('error', (error) => {
  console.error(`Error de MongoDB: ${error.message}`);
});

export default conectarDB;
