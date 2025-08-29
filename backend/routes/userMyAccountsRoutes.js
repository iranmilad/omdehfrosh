import { Router } from "express";
import { 
  getAllUserMyAccounts,
  getUserMyAccountById,
  createUserMyAccount,
  updateUserMyAccount,
  deleteUserMyAccount,
  batchImportUserMyAccounts,
  getAllUserMessages,
  getAllUserTickets,
  getUserTicketsById,
  createNewUserTicket,
  getAllSubscriptionPlans,
  purchaseSubscriptionByModelId,
  getSubscriptionPlansByUserId,
  submitNewMessageToTicket,
  getAllUserMessageComponentByUserId,
  getUserMessagesModalDataByTableIndexAndRowId,
  getNotificationsNumber,
  setNotificationSeen
}
  from '../controllers/userMyAccountsControllers.js'

  import multer from "multer";

  const upload = multer({ storage: multer.memoryStorage() }); // just reads, doesn't store

const router = Router();

// Route to get all user accounts
// router.get("/", getAllUserMyAccounts);

// Route to get a specific user account by ID
router.get("/", getUserMyAccountById);

// Route to create a new user account
router.post("/create", createUserMyAccount);

router.get("/user-messages", getAllUserMessages); 

router.get("/user-messages/notification-component", getAllUserMessageComponentByUserId); 

router.get("/user-messages/notification-component/modal-component", getUserMessagesModalDataByTableIndexAndRowId); 


router.get("/notifications/number", getNotificationsNumber); 


router.post("/notifications/set-seen", setNotificationSeen); 



router.get("/user-tickets", getAllUserTickets)

router.post("/user-tickets/create", createNewUserTicket)

router.get("/user-tickets/:id", getUserTicketsById)

router.post(
  "/user-tickets/messages/newmessage/:ticketId",
  upload.single("file"),
  submitNewMessageToTicket
);


// Route to update an existing user account by ID
router.put("/update/:id", updateUserMyAccount);


router.get("/allsubscriptionplans", getAllSubscriptionPlans)

router.post("/subscriptions/purchase/:modelId", purchaseSubscriptionByModelId)

router.get("/subscriptions/getsubscriptionbyuserid", getSubscriptionPlansByUserId)



// Route to delete a user account by ID
router.delete("/delete/:id", deleteUserMyAccount);







// Route for batch importing user accounts
router.post("/batch-import", batchImportUserMyAccounts);


export default router;
