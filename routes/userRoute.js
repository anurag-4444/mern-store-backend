import express from "express"
import { deleteUser, getAllUsers, getSingleUser, getUserDetails, loginSignup, logout, registerUser, updatUsereRole, updateAvatar, updateProfile } from "../controller/userController.js"
import { authorizeRoles, isAuthenticated } from "../middleware/auth.js"

const router = express.Router()

router.post("/register", registerUser)

router.post("/auth/google", loginSignup)

router.get("/logout", logout)

router.get("/me", isAuthenticated, getUserDetails)

router.put("/me/update", isAuthenticated, updateProfile)

router.put("/me/update/avatar", isAuthenticated, updateAvatar)

router.get("/admin/users", isAuthenticated, authorizeRoles, getAllUsers)

router.route("/admin/user/:id")
    .get(isAuthenticated, authorizeRoles, getSingleUser)
    .put(isAuthenticated, authorizeRoles, updatUsereRole)
    .delete(isAuthenticated, authorizeRoles, deleteUser)

export default router 