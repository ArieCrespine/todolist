const express = require("express");
const bodyParser = require("body-parser");
// const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");


const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(express.static("public"));


mongoose.connect("mongodb://localhost:27017/todolistDB");

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const Welcome = new Item({
  name: "Welcome to our todo List"
});
const Instructions = new Item({
  name: "Hit the + button to add an item"
});
const Study = new Item({
  name: "study"
});

let basicItem = [Welcome, Instructions, Study];

const listShema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model('List', listShema);


app.get("/", (req, res) => {

  Item.find({}).then(items => {
    if (items.length === 0) {
      Item.insertMany(basicItem);
      return res.redirect("/");
    }

    res.render("list", {
      listTitle: "Today",
      newListItem: items
    });
  })
});

// other List

app.get("/:customListName", function (req, res) {
  const custonListName = req.params.customListName;

  List.findOne({
    name: custonListName
  }).then(function (foundList) {
    if (!foundList) {
      const list = new List({
        name: custonListName,
        items: basicItem
      })
      list.save();
      res.redirect("/" + custonListName)

    } else {
      res.render("list", {
        listTitle: foundList.name,
        newListItem: foundList.items
      })
    }
  })
})

// const list = new List({
//   name : custonListName,
//   items: basicItem
// })
// list.save();




// app.get("/work", function (req, res) {
//   res.render("list", {
//     listTitle: "Work List",
//     newListItem: workItems
//   })
// })

app.post("/", (req, res) => {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const newItem = new Item({
    name: itemName
  });

  if (listName === "Today") {
    newItem.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName}).then(foundList => {
      foundList.items.push(newItem);
      foundList.save();
      res.redirect("/" + listName);
    })
  }

});

app.post("/delete", (req, res) => {
  const checkedItem = req.body.checkbox;

  // Item.find({}).then(allItems => {
  //   console.log(allItems);
  // });

  Item.deleteOne({
    _id: checkedItem
  }).then(restItems => {
    console.log(restItems);
  })
  res.redirect('/');

})



app.get('/about', function (req, res) {
  res.render('about');
})

app.listen(3000, function () {
  console.log("listening on port 3000");
})