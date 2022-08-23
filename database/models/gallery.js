const { DataTypes, Model } = require("sequelize");
const db = require("../../setup/db");
const Joi = require("joi");



class Gallery extends Model {}
Gallery.init(
     {
        image: {
        type: DataTypes.TEXT,
        allowNull: false,
        },
     }
     , { sequelize: db, modelName: "Gallery", timestamps: false } );


function validateGallery(Gallery){

    const schema = Joi.object( {
        path:  Joi.string().required(),
    });

    return schema.validate(Gallery);
}

module.exports.Gallery = Gallery; 
module.exports.validateGallery = validateGallery;