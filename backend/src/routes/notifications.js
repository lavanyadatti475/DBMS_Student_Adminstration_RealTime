const express = require("express");
const router = express.Router();

const prisma = require("../prismaClient");
const { requireAuth } = require("../middleware/auth");

/* GET ALL NOTIFICATIONS */
router.get("/", requireAuth, async (req, res, next) => {
try {
const notifications = await prisma.notification.findMany({
where: {
studentId: req.user.id
},
orderBy: {
createdAt: "desc"
}
});


res.json({
  success: true,
  notifications
});


} catch (error) {
next(error);
}
});

/* UNREAD COUNT */
router.get("/unread-count", requireAuth, async (req, res, next) => {
try {
const count = await prisma.notification.count({
where: {
studentId: req.user.id,
read: false
}
});

```
res.json({
  success: true,
  count
});
```

} catch (error) {
next(error);
}
});

/* MARK READ */
router.put("/:id/read", requireAuth, async (req, res, next) => {
try {
const notification = await prisma.notification.update({
where: {
id: Number(req.params.id)
},
data: {
read: true
}
});

```
res.json({
  success: true,
  notification
});
```

} catch (error) {
next(error);
}
});

module.exports = router;
