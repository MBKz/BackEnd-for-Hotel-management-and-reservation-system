const { DataTypes, Model } = require("sequelize");
const db = require("../../setup/db");



class Bank extends Model {}
Bank.init(
  {
    accountNumber:{
      type: DataTypes.INTEGER,
      allowNull:false,
      unique: true
    },
    budget: {
        type: DataTypes.DECIMAL(10,2),
        allowNull: false,
        defaultValue: 0
      },
  },
  { sequelize: db, modelName: "Bank", timestamps: false }
);

module.exports.Bank = Bank; 