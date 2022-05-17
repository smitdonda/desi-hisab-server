var express = require("express");
var router = express.Router();
var { MongoClient, dbUrl } = require("../dbSchema");
var {
  hashPassword,
  hashCompare,
  createToken,
  verifyToken,
} = require("../auth");
const { ObjectId } = require("mongodb");

//login and sign up
// sign up
router.post("/signup", async (req, res) => {
  const client = await MongoClient.connect(dbUrl);
  try {
    let db = await client.db("desihisab");
    let user = await db.collection("users").find({ email: req.body.email });
    if (user.length > 0) {
      res.json({
        statusCode: 400,
        message: "User Already Exists",
      });
    } else {
      let hashedPassword = await hashPassword(
        req.body.password,
        req.body.cpassword
      );
      req.body.password = hashedPassword;
      req.body.cpassword = hashedPassword;

      let user = await db.collection("users").insertOne(req.body);
      res.json({
        statusCode: 200,
        message: "User SignUp Successfull",
      });
    }
  } catch (error) {
    res.json({
      statusCode: 500,
      message: "Internal Server Error",
    });
  } finally {
    client.close();
  }
});

// login
router.post("/login", async (req, res) => {
  const client = await MongoClient.connect(dbUrl);
  try {
    let db = await client.db("desihisab");
    let user = await db.collection("users").findOne({ email: req.body.email });
    if (user) {
      let compare = await hashCompare(req.body.password, user.password);
      if (compare) {
        let token = await createToken(user.email, user.username);
        res.json({
          statusCode: 200,
          email: user.email,
          username: user.username,
          token,
        });
      } else {
        res.json({
          statusCode: 400,
          message: "Invalid Password",
        });
      }
    } else {
      res.json({
        statusCode: 404,
        message: "User Not Found",
      });
    }
  } catch (error) {
    res.json({
      statusCode: 500,
      message: "Internal Server Error",
    });
  } finally {
    client.close();
  }
});
// varify token
router.post("/auth", verifyToken, async (req, res) => {
  res.json({
    statusCode: 200,
    message: req.body.purpose,
  });
});

// ADD salaries and transaction -------------------------------------------------------------------
// Add Salary
// Post method
router.post("/addsalaries", async (req, res) => {
  const client = await MongoClient.connect(dbUrl);
  try {
    let db = await client.db("desihisab");
    let user = await db.collection("addsalaries");
    if (user) {
      let users = await db.collection("addsalaries").insertOne(req.body);
      res.json({
        statusCode: 200,
        data: users,
        message: "Add Salaries Successfull",
      });
    }
  } catch (error) {
    res.json({
      statusCode: 500,
      message: "Internal Server Error",
    });
  }
});

// get salaries
router.get("/getsalaries", async (req, res) => {
  const client = await MongoClient.connect(dbUrl);
  try {
    let db = await client.db("desihisab");
    let user = await db.collection("addsalaries").find().toArray();
    res.json({
      statusCode: 200,
      user,
      message: "Get Salaries",
    });
  } catch (err) {
    res.json({
      statusCode: 500,
      message: "Internal Server Error",
    });
  }
});

// get sum salaries
router.get("/sumsalaries", async (req, res) => {
  const client = await MongoClient.connect(dbUrl);
  try {
    let db = await client.db("desihisab");
    let user = await db
      .collection("addsalaries")
      .aggregate([{ $group: { _id: null, totalamount: { $sum: "$amount" } } }])
      .toArray();
    res.json({
      statusCode: 200,
      user,
      message: "Sum Get Salaries",
    });
  } catch (err) {
    res.json({
      statusCode: 500,
      message: "Internal Server Error",
    });
  }
});

// put add salaries edit
router.put("/editsalaries/:id", async (req, res) => {
  const client = await MongoClient.connect(dbUrl);
  try {
    let db = await client.db("desihisab");
    let user = await db.collection("addsalaries").find().toArray();
    if (user.length > 0) {
      let users = await db
        .collection("addsalaries")
        .updateOne({ _id: ObjectId(req.params.id) }, { $set: { ...req.body } });
      res.json({
        statusCode: 200,
        users,
        message: "User Updated Successfully",
      });
    } else {
      res.json({
        statusCode: 400,
        message: "Invalid User ID",
      });
    }
  } catch {
    res.json({
      statusCode: 500,
      message: "Internal Server Error",
    });
  }
});

// add salaries delete
router.delete("/deleteaddsalaries/:id", async (req, res) => {
  const client = await MongoClient.connect(dbUrl);
  try {
    let db = await client.db("desihisab");
    let user = await db.collection("addsalaries").find().toArray();
    if (user) {
      let users = await db
        .collection("addsalaries")
        .deleteOne({ _id: ObjectId(req.params.id) });
      res.json({
        statusCode: 200,
        users,
        message: "Delete Successfully",
      });
    }
  } catch (err) {
    res.json({
      statusCode: 500,
      message: "Delete failed",
    });
  }
});

// Add Transaction --------------------------------------------------------------------------------
// post
router.post("/addtransaction", async (req, res) => {
  const client = await MongoClient.connect(dbUrl);
  try {
    let db = await client.db("desihisab");
    let user = await db.collection("addtransation");
    if (user) {
      let users = await db.collection("addtransation").insertOne(req.body);
      res.json({
        statusCode: 200,
        data: users,
        message: "Add Transaction Successfull",
      });
    }
  } catch (error) {
    res.json({
      statusCode: 500,
      message: "Internal Server Error",
    });
  }
});

// get method
// get transaction
router.get("/gettransection", async (req, res) => {
  const client = await MongoClient.connect(dbUrl);
  try {
    let db = await client.db("desihisab");
    let user = await db.collection("addtransation").find().toArray();
    res.json({
      statusCode: 200,
      user,
      message: "Get Transaction",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: "Internal Server Error",
    });
  }
});

// get sum Transaction
router.get("/sumtransaction", async (req, res) => {
  const client = await MongoClient.connect(dbUrl);
  try {
    let db = await client.db("desihisab");
    let user = await db
      .collection("addtransation")
      .aggregate([{ $group: { _id: null, totalamount: { $sum: "$amount" } } }])
      .toArray();
    res.json({
      statusCode: 200,
      user,
      message: "Sum Get Transaction",
    });
  } catch (err) {
    res.json({
      statusCode: 500,
      message: "Internal Server Error",
    });
  }
});
// Charts
// to day date format
var today =
  new Date().getFullYear() +
  "-" +
  (new Date().getMonth() + 1 < 9
    ? "0" + (new Date().getMonth() + 1)
    : new Date().getMonth() + 1) +
  "-" +
  new Date().getDate();
// all activity
router.get("/all-activity-gettransection", async (req, res) => {
  const client = await MongoClient.connect(dbUrl);
  try {
    let db = await client.db("desihisab");
    let user = await db
      .collection("addtransation")
      .aggregate([
        {
          $group: { _id: "$category", totalAmount: { $sum: "$amount" } },
        },
      ])
      .toArray();
    res.json({
      statusCode: 200,
      user,
      message: "Get Transaction",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: "Internal Server Error",
    });
  }
});

// todays graph
router.get("/todaysgraphtransaction", async (req, res) => {
  const client = await MongoClient.connect(dbUrl);
  try {
    let db = await client.db("desihisab");
    let user = await db
      .collection("addtransation")
      .aggregate([
        { $match: { date: { $eq: today } } },
        { $group: { _id: "$category", totalAmount: { $sum: "$amount" } } },
      ])
      .toArray();
    res.json({
      statusCode: 200,
      user,
      message: "Today Activity Transaction",
    });
  } catch (err) {
    console.log(err);
    res.json({
      statusCode: 500,
      message: "Internal Server Error",
    });
  }
});

// past 7 days graph
router.get("/past-savendays-transaction", async (req, res) => {
  const client = await MongoClient.connect(dbUrl);
  try {
    let db = await client.db("desihisab");
    // pastSavenDays
    var date = new Date();
    var subDate = date.setDate(date.getDate() - 7);
    var todate = new Date(subDate);
    var tomnth = todate.getMonth() + 1;
    var pastSavenDays =
      todate.getFullYear() +
      "-" +
      (tomnth < 9 ? "0" + tomnth : tomnth) +
      "-" +
      todate.getDate();
    let user = await db
      .collection("addtransation")
      .aggregate([
        { $match: { date: { $lte: today, $gte: pastSavenDays } } },
        { $group: { _id: "$category", totalAmount: { $sum: "$amount" } } },
      ])
      .toArray();
    res.json({
      statusCode: 200,
      user,
      message: "Sum Get Transaction",
    });
  } catch (err) {
    res.json({
      statusCode: 500,
      message: "Internal Server Error",
    });
  }
});

// Past Month
router.get("/past-month-transaction", async (req, res) => {
  const client = await MongoClient.connect(dbUrl);
  try {
    let db = await client.db("desihisab");
    // pastSavenDays
    var date = new Date();
    var subMonth = date.setMonth(date.getMonth() - 1);
    var todate = new Date(subMonth);
    var tomnth = todate.getMonth() + 1;
    var pastMonth =
      todate.getFullYear() +
      "-" +
      (tomnth < 9 ? "0" + tomnth : tomnth) +
      "-" +
      todate.getDate();
    let user = await db
      .collection("addtransation")
      .aggregate([
        { $match: { date: { $gte: pastMonth, $lte: today } } },
        { $group: { _id: "$category", totalAmount: { $sum: "$amount" } } },
      ])
      .toArray();
    res.json({
      statusCode: 200,
      user,
      message: "Sum Get Transaction",
    });
  } catch (err) {
    res.json({
      statusCode: 500,
      message: "Internal Server Error",
    });
  }
});

//add Transaction Edit
router.put("/edittransaction/:id", async (req, res) => {
  const client = await MongoClient.connect(dbUrl);
  try {
    let db = await client.db("desihisab");
    let user = await db.collection("addtransation").find().toArray();
    if (user.length > 0) {
      let users = await db
        .collection("addtransation")
        .updateOne({ _id: ObjectId(req.params.id) }, { $set: { ...req.body } });
      res.json({
        statusCode: 200,
        users,
        message: "User Updated Successfully",
      });
    } else {
      res.json({
        statusCode: 400,
        message: "Invalid User ID",
      });
    }
  } catch {
    res.json({
      statusCode: 500,
      message: "Internal Server Error",
    });
  }
});

// add transaction delete
router.delete("/deletetransaction/:id", async (req, res) => {
  const client = await MongoClient.connect(dbUrl);
  try {
    let db = await client.db("desihisab");
    let user = await db.collection("addtransation").find().toArray();
    if (user) {
      let users = await db
        .collection("addtransation")
        .deleteOne({ _id: ObjectId(req.params.id) });
      res.json({
        statusCode: 200,
        users,
        message: "Delete Successfully",
      });
    }
  } catch (err) {
    res.json({
      statusCode: 500,
      message: "Delete failed",
    });
  }
});

module.exports = router;
