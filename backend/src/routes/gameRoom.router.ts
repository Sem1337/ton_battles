import { Router } from 'express'
import { GameRoomController } from '../controllers/GameRoomController.js'

const router = Router()

router.post('/gamerooms', GameRoomController.createGameRoom)
router.post('/gamerooms/:roomId/join', GameRoomController.joinGameRoom)
router.get('/gamerooms', GameRoomController.getGameRooms)
router.get('/gamerooms/:roomId', GameRoomController.getGameRoom)
router.post('/gamerooms/:roomId/bets', GameRoomController.makeBet)

export default router;