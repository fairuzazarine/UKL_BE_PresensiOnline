const express = require(`express`)
const app = express()

const router = express.Router();

const userController = require(`../controllers/user.controller`);
const { validateUser } = require(`../middlewares/user-validation`)


// router.post("/", userController.addUser);
router.use(express.json())
router.get("/", userController.getAllUser)
router.post("/find", userController.findUser)
router.post("/", userController.addUser)
// router.post("/",validateUser, userController.addUser)
router.put("/:id", userController.updateUser)
router.delete("/:id", userController.deleteUser)

module.exports = router;