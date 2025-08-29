import NotificationTable from "../../models/NotificationsTable.js";


export const batchImportNotificationTables = async (req, res) => {
  const notifications = req.body;


  try {
    const result = await NotificationTable.insertMany(notifications);

    res.status(201).json({
      message: `${result.length} notifications imported successfully`,
      notifications: result,
    });
  } catch (error) {
    res.status(500).json({ message: "Error importing notifications", error });
  }
};
