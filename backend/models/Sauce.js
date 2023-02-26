const mongoose = require('mongoose');

const sauceSchema = mongoose.Schema({
    userId: { type: String, required: true}, // id mongoDB de l'user qui a créé la sauce
    name: { type: String, required: true}, // nom de la sauce
    manufacturer: { type: String, required: true}, // fabricant de la sauce
    description: { type: String, required: true}, //description de la sauce
    mainPepper: { type: String, required: true}, //principale ingrédient épicé de la sauce
    imageUrl: { type: String, required: true}, // l'URL de l'image de la sauce dl par l'user
    heat: { type: Number, required: true}, // échelle de scoville (1 a 10)
    likes: { type: Number}, // nombre d'users qui aiment la sauce (default à 0)
    dislikes: { type: Number}, // nombre d'users qui n'aiment pas la sauce (default à 0)
    usersLiked: { type: Array}, // tableau d'users qui ont aimé la sauce (default à 0)
    usersDisliked: { type: Array}, // nombre d'users qui n'ont pas aimé la sauce (default à 0)
});

module.exports = mongoose.model('Sauce', sauceSchema);