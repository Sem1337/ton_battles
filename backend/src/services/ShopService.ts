import { ShopItem, ShopItemId } from '../database/model/ShopItems.js'; // Assuming you have a ShopItems model
import { updateUserGems, updateUserPoints, userLvlUpProduction, userLvlUpShield } from './balanceService.js';
import Big from 'big.js';


type CostType = 'points' | 'gems' | 'stars' | 'TON';

class ShopService {

  static async proceedPayment(userId: string, costType: CostType, cost: Big): Promise<boolean> {
    switch (costType) {
      case 'stars':
        return false;
      case 'gems':
        await updateUserGems(+userId, cost.neg());
        return true;
      case 'points':
        await updateUserPoints(+userId, cost.neg());
        return true;
      case 'TON':
        return false;
      default:
        break;
    }
    return false;
  }

  static async giveGoods(userId: string, itemId: ShopItemId) {
    switch (itemId) {
      case ShopItemId.PRODUCTION_SPEED_LVL_UP:
        await userLvlUpProduction(+userId);
        break;
      case ShopItemId.SHIELD_LVL_UP:
        await userLvlUpShield(+userId);
        break;
      case ShopItemId.GEMS_1000:
        await updateUserGems(+userId, new Big(1000));
        break;
      case ShopItemId.POINTS_100K:
        await updateUserPoints(+userId, new Big(100000));
        break;
      case ShopItemId.POINTS_500K:
        await updateUserPoints(+userId, new Big(500000));
        break;
      case ShopItemId.POINTS_1M:
        await updateUserPoints(+userId, new Big(1000000));
        break;
      case ShopItemId.POINTS_5M:
        await updateUserPoints(+userId, new Big(5000000));
        break;
      case ShopItemId.POINTS_25M:
        await updateUserPoints(+userId, new Big(25000000));
        break;
      default:
        break;
    }
  }



  static async buyItem(userId: string, itemId: ShopItemId, costType: CostType) {
    try {
      const item = await ShopItem.findByPk(itemId);
      if (!item) {
        return { success: false, message: 'User or item not found' };
      }

      // Validate costType
      const validCostTypes: CostType[] = ['points', 'gems', 'stars', 'TON'];;
      if (!validCostTypes.includes(costType) || item[costType] === null) {
        return { success: false, message: 'Invalid cost type' };
      }

      // Check if the user has enough resources
      const cost = new Big(item[costType]);
      const successPayment = await ShopService.proceedPayment(userId, costType, cost);
      if (!successPayment) {
        return { success: false, message: 'Payment failed' };
      }
      await ShopService.giveGoods(userId, itemId);

      return { success: true };
    } catch (error) {
      console.error('Error in buyItem:', error);
      return { success: false, message: 'Internal server error' };
    }
  }


  static seedShopItems = async () => {
    try {
      // Check if there are any shop items in the database
      const itemCount = await ShopItem.count();
  
      if (itemCount > 0) {
        console.log('Shop items already exist. Skipping seeding.');
        return;
      }
  
      // Add shop items
      await ShopItem.bulkCreate([
        {
          itemId: ShopItemId.PRODUCTION_SPEED_LVL_UP,
          name: 'Production Speed LVL Up',
          description: 'Increase your production speed.',
          points: 1000,
          gems: 10,
          stars: 1,
          TON: 0.01,
        },
        {
          itemId: ShopItemId.SHIELD_LVL_UP,
          name: 'Shield LVL Up',
          description: 'Increase your shield level.',
          gems: 20,
          stars: 2,
          TON: 0.02,
        },
        {
          itemId: ShopItemId.POINTS_100K,
          name: '100k Points',
          description: 'Buy 100k points',
          gems: 10,
          stars: 1,
          TON: 0.01,
        },
        {
          itemId: ShopItemId.POINTS_500K,
          name: '500k Points',
          description: 'Buy 500k points',
          gems: 50,
          stars: 1,
          TON: 0.01,
        },
        {
          itemId: ShopItemId.POINTS_1M,
          name: '1M Points',
          description: 'Buy 1M points',
          gems: 100,
          stars: 1,
          TON: 0.01,
        },
        {
          itemId: ShopItemId.POINTS_5M,
          name: '5M Points',
          description: 'Buy 5M points',
          gems: 500,
          stars: 1,
          TON: 0.01,
        },
        {
          itemId: ShopItemId.POINTS_25M,
          name: '25M Points',
          description: 'Buy 25M points',
          gems: 2500,
          stars: 1,
          TON: 0.01,
        },
        {
          itemId: ShopItemId.GEMS_1000,
          name: '1000 Gems',
          description: 'Buy 1000 gems.',
          stars: 1,
          TON: 0.01,
        },
      ]);
  
      console.log('Shop items have been added.');
    } catch (error) {
      console.error('Unable to seed shop items:', error);
    }
  };

}

export default ShopService;
