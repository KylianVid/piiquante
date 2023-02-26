const Sauce = require('../models/Sauce');
const fs = require('fs');

exports.getAllSauce = (req, res, next) => {
    Sauce.find()
    .then((sauce) => {res.status(200).json(sauce);})
    .catch((error) => {res.status(400).json({error: error});});
}

exports.getOneSauce = (req,res, next) => {
    Sauce.findOne({_id: req.params.id})
    .then((sauce) => {res.status(200).json(sauce);})
    .catch((error) => {res.status(404).json({error: error});});
}

exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    delete sauceObject._userId;
    const sauce = new Sauce({
        ...sauceObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        usersLiked: [],
        usersDisliked: [],
        likes: 0,
        dislikes: 0
    });
  
    sauce.save()
    .then(() => { res.status(201).json({message: 'Objet enregistré !'})})
    .catch(error => { res.status(400).json( { error })})
}

exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
  
    delete sauceObject._userId;
    Sauce.findOne({_id: req.params.id})
        .then((sauce) => {
            if (sauce.userId != req.auth.userId) {
                res.status(401).json({ message : 'Not authorized'});
            } else {
                console.log("==REQ.BODY== modifySauce");
                console.log(req.body);
                Sauce.updateOne({ _id: req.params.id}, { ...sauceObject, _id: req.params.id})
                .then(() => res.status(200).json({message : 'Objet modifié!'}))
                .catch(error => res.status(401).json({ error }));
            }
        })
        .catch((error) => {res.status(400).json({ error });});
}

exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id})
        .then(sauce => {
            if (sauce.userId != req.auth.userId) {
                res.status(401).json({message: 'Not authorized'});
            } else {
                const filename = sauce.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    sauce.deleteOne({_id: req.params.id})
                        .then(() => { res.status(200).json({message: 'Objet supprimé !'})})
                        .catch(error => res.status(401).json({ error }));
                });
            }
        })
        .catch( error => {
            res.status(500).json({ error });
        });
}

// an user can't like/dislike his own sauce

exports.likeSauce = (req, res, next) => {
    const like = req.body.like;
    delete req.body.userId;

    Sauce.findOne({_id: req.params.id})
        .then((sauce) => {
            if (sauce.userId == req.auth.userId) {
                res.status(401).json({ message : 'Not authorized'});
            } else {
                if( like == 1) {
                    let subtab = sauce.usersLiked;
                    subtab.push(req.auth.userId); 
                    Sauce.updateOne({_id: req.params.id}, {likes: sauce.likes+1, usersLiked: subtab })
                        .then(() => res.status(200).json({message : 'Objet ajouté à usersLiked'}))
                        .catch(error => res.status(401).json({ error }));
                }
                else if(like == -1) {
                    let subUsersDisliked = sauce.usersDisliked;
                    subUsersDisliked.push(req.auth.userId);
                    Sauce.updateOne({_id: req.params.id}, {dislikes: sauce.dislikes + 1, usersDisliked: subUsersDisliked})
                        .then(() => res.status(200).json({message : 'Objet ajouté à usersDisliked'}))
                        .catch(error => res.status(401).json({ error }));
                }
                else if(like == 0){
                    if(sauce.usersLiked.includes(req.auth.userId)){
                        let subtab = sauce.usersLiked;
                        let index = sauce.usersLiked.findIndex((e) => e == req.auth.userId);
                        subtab.splice(index, 1);
                        Sauce.updateOne({_id: req.params.id}, {likes: sauce.likes-1, usersLiked: subtab })
                            .then(() => res.status(200).json({message : 'Objet ajouté à usersLiked'}))
                            .catch(error => res.status(401).json({ error }));
                    }
                    if(sauce.usersDisliked.includes(req.auth.userId)){
                        let subtab = sauce.usersDisliked;
                        let index = sauce.usersDisliked.findIndex((e) => e == req.auth.userId);
                        subtab.splice(index, 1);
                        Sauce.updateOne({_id: req.params.id}, {dislikes: sauce.dislikes-1, usersDisliked: subtab})
                        .then(() => res.status(200).json({message : "Objet enlever d'usersDisliked"}))
                        .catch(error => res.status(401).json({ error }));
                    }
                }
                else { res.status(400).json({message : 'error input like'}) }
            }
        })
        .catch((error) => {res.status(400).json({ error });});
}