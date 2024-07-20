import { DataTypes, Model } from 'sequelize';
import sequelize from '../db.js';

export enum ShopItemId {
  PRODUCTION_SPEED_LVL_UP = 1,
  SHIELD_LVL_UP = 2,
  POINTS_100K = 3,
  POINTS_500K = 4,
  POINTS_1M = 5,
  POINTS_5M = 6,
  POINTS_25M = 7,
  GEMS_1000 = 8,
}

class ShopItem extends Model {
  public itemId!: number;
  public name!: string;
  public type!: number;
  public description!: string;
  public points!: number | null;
  public gems!: number | null;
  public stars!: number | null;
  public TON!: number | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ShopItem.init(
  {
    itemId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    points: {
      type: DataTypes.INTEGER,
      defaultValue: null,
      allowNull: true,
    },
    gems: {
      type: DataTypes.INTEGER,
      defaultValue: null,
      allowNull: true,
    },
    stars: {
      type: DataTypes.INTEGER,
      defaultValue: null,
      allowNull: true,
    },
    TON: {
      type: DataTypes.FLOAT,
      defaultValue: null,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'shop_items',
    timestamps: true,
  }
);

export { ShopItem };
